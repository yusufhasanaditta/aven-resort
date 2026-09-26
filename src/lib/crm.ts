import "server-only";
import { prisma } from "@/lib/db";

/**
 * When someone becomes a shareholder, any open lead with their email moves to
 * CONVERTED automatically — with a timeline entry saying why — so the CRM
 * pipeline never needs a manual tidy-up after a sale.
 */
export async function convertLeadsFor(email: string, reason: string) {
  try {
    const open = await prisma.lead.findMany({
      where: { email: email.toLowerCase(), status: { notIn: ["CONVERTED", "CLOSED"] } },
      select: { id: true },
    });
    for (const lead of open) {
      await prisma.$transaction([
        prisma.lead.update({ where: { id: lead.id }, data: { status: "CONVERTED" } }),
        prisma.leadNote.create({
          data: { leadId: lead.id, kind: "STATUS", body: `Converted automatically — ${reason}`, authorName: "System" },
        }),
      ]);
    }
  } catch {
    /* CRM bookkeeping must never block a purchase */
  }
}
