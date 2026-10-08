import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";
import { holdingInclude, toAdminCustomer, toAdminHolding, toAdminPayments } from "@/lib/admin-serialize";

type Cell = string | number | null | undefined;

function csv(rows: Cell[][]) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = c === null || c === undefined ? "" : String(c);
          // Neutralise spreadsheet formula injection before quoting — except
          // plain phone numbers like "+880 1711-223344", which can't execute.
          const phoneLike = /^\+?[\d\s()-]+$/.test(s);
          const safe = !phoneLike && /^[=+\-@]/.test(s) ? "'" + s : s;
          return '"' + safe.replace(/"/g, '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}

/** CSV downloads for leads, shareholders, payments and dues — UTF-8 with BOM so Excel keeps Bengali intact. */
export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { kind } = await params;
  let rows: Cell[][];

  if (kind === "leads") {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    rows = [
      ["Created", "Name", "Email", "Phone", "Location", "Package", "Shares", "Budget (BDT)", "Payment", "Status", "Next follow-up", "Owner", "Source", "Message"],
      ...leads.map((l) => [
        l.createdAt.toISOString(), l.name, l.email, l.phone, l.location, l.packageSlug, l.units, l.investmentBDT,
        l.paymentPref, l.status, l.nextFollowUpAt?.toISOString(), l.assignedTo, l.source, l.message,
      ]),
    ];
  } else if (kind === "payments" || kind === "customers" || kind === "dues") {
    const holdings = await prisma.shareHolding.findMany({ include: holdingInclude });
    if (kind === "payments") {
      const payments = holdings.flatMap(toAdminPayments).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      rows = [
        ["Receipt", "Created", "Paid", "Customer", "Phone", "Plan", "Shares", "Installment", "Amount (BDT)", "Method", "Transaction", "Reference", "Status", "Recorded by"],
        ...payments.map((p) => [
          p.receiptNo, p.createdAt, p.paidAt, p.customer.name, p.customer.phone, p.planName, p.units, p.installmentLabel,
          p.amountBDT, p.method, p.tranId, p.reference, p.status, p.recordedBy,
        ]),
      ];
    } else if (kind === "dues") {
      const ledgers = holdings.filter((h) => h.status !== "CANCELLED").map(toAdminHolding);
      rows = [
        ["Customer", "Phone", "Plan", "Installment", "Due date", "Scheduled (BDT)", "Paid (BDT)", "Still due (BDT)", "Status"],
        ...ledgers.flatMap((h) =>
          h.steps
            .filter((s) => s.status !== "SUCCESS")
            .map((s) => [h.customer.name, h.customer.phone, h.plan.name, `${s.part} (${s.n} of ${h.steps.length})`, s.dueDate.slice(0, 10), s.amountBDT, s.paidBDT, s.dueBDT, s.status]),
        ),
      ];
    } else {
      const users = await prisma.user.findMany({ where: { role: "SHAREHOLDER" }, orderBy: { createdAt: "desc" } });
      const customers = users.map((u) =>
        toAdminCustomer(u, holdings.filter((h) => h.userId === u.id).map(toAdminHolding)),
      );
      rows = [
        ["Member ID", "Name", "Email", "Phone", "Location", "Joined", "Active shares", "Committed (BDT)", "Paid (BDT)", "Remaining (BDT)", "Overdue installments"],
        ...customers.map((c) => [c.memberId, c.name, c.email, c.phone, c.location, c.createdAt, c.units, c.committedBDT, c.paidBDT, c.remainingBDT, c.overdueCount]),
      ];
    }
  } else {
    return NextResponse.json({ error: "Unknown export." }, { status: 404 });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aven-${kind}-${date}.csv"`,
    },
  });
}
