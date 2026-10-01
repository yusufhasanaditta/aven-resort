import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { emailHtml, sendEmail, siteUrl } from "@/lib/mailer";
import { logActivity } from "@/lib/admin";

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 3;

function hashCode(email: string, code: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "aven").update(`${email}:${code}`).digest("hex");
}

/**
 * Emails a 6-digit code for resetting the password. Says nothing about
 * whether the email has an account (the caller always answers the same), and
 * sends at most three codes per 15 minutes to one address.
 */
export async function requestPasswordReset(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const since = new Date(Date.now() - CODE_TTL_MINUTES * 60_000);
  const recent = await prisma.passwordReset.count({ where: { email, createdAt: { gte: since } } });
  if (recent >= MAX_CODES_PER_WINDOW) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$transaction([
    prisma.passwordReset.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.passwordReset.create({
      data: { email, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000) },
    }),
  ]);

  const text = `Hi ${user.name.split(" ")[0]},\n\nYour Aven password reset code is: ${code}\n\nIt expires in ${CODE_TTL_MINUTES} minutes. If you didn't ask to reset your password, you can ignore this email — your password stays the same.`;
  await sendEmail({
    to: email,
    subject: `${code} is your Aven password reset code`,
    text,
    html: emailHtml({
      title: "Reset your password",
      body: `Hi ${user.name.split(" ")[0]},\nUse this code to reset your Aven password:\n${code.split("").join(" ")}\nIt expires in ${CODE_TTL_MINUTES} minutes. If you didn't ask for this, ignore this email — your password stays the same.`,
      cta: { label: "Enter the code", href: `${siteUrl()}/forgot-password?email=${encodeURIComponent(email)}` },
    }),
  });
}

export type ResetResult = { ok: true; user: { id: string; name: string; email: string; role: "ADMIN" | "SHAREHOLDER" } } | { ok: false; error: string };

/** Checks the code and, if it matches, sets the new password. */
export async function resetPassword(rawEmail: string, code: string, newPassword: string): Promise<ResetResult> {
  const email = rawEmail.trim().toLowerCase();
  const row = await prisma.passwordReset.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false, error: "This code has expired. Request a new one." };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Too many wrong tries. Request a new code." };

  const given = Buffer.from(hashCode(email, code.trim()));
  const stored = Buffer.from(row.codeHash);
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) {
    await prisma.passwordReset.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return { ok: false, error: left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Request a new code." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Account not found." };
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false } }),
    prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  await logActivity(user.name, "Reset password with email code", user.name);
  return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
