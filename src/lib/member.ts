import "server-only";
import { randomInt } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

type Tx = Prisma.TransactionClient;

/**
 * The next membership number: the joining year followed by a running number
 * that starts at 2001 each year — 20262001, 20262002, … The counter row is
 * incremented atomically, so two accounts opened at the same moment can
 * never get the same number.
 */
export async function nextMemberNo(tx: Tx = prisma, when = new Date()): Promise<string> {
  const year = when.getFullYear();
  const row = await tx.memberCounter.upsert({
    where: { year },
    create: { year, last: 2001 },
    update: { last: { increment: 1 } },
  });
  return `${year}${row.last}`;
}

/** A readable one-time password: 10 characters with letters and digits, no look-alikes (0/O, 1/l/I). */
export function oneTimePassword() {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (set: string) => set[randomInt(set.length)];
  const chars = [pick(letters), pick(digits), ...Array.from({ length: 8 }, () => pick(letters + digits))];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Row 0 of the member counter holds the highest share number issued so far. */
const SHARE_COUNTER = 0;

/**
 * The next run of share numbers for a holding: 5 shares after #11 get 12–16.
 * Like membership numbers, the counter moves atomically.
 */
export async function nextShareNumbers(tx: Tx, units: number): Promise<{ shareFrom: number; shareTo: number }> {
  const row = await tx.memberCounter.upsert({
    where: { year: SHARE_COUNTER },
    create: { year: SHARE_COUNTER, last: units },
    update: { last: { increment: units } },
  });
  return { shareFrom: row.last - units + 1, shareTo: row.last };
}

export type AccountDetails = {
  name: string;
  email: string;
  phone: string;
  location: string;
  nid?: string | null;
  nomineeName?: string | null;
  nomineeRelation?: string | null;
  referredBy?: string | null;
};

/**
 * Opens a shareholder account with the next membership number. The password
 * is one the admin typed, or the hash of the one the applicant chose on their
 * application. With neither, a one-time password is generated: the admin
 * passes it on and the shareholder chooses their own at first sign-in.
 */
export async function openAccount(
  details: AccountDetails,
  password?: string | { hash: string },
): Promise<{ id: string; memberNo: string; oneTimePassword: string | null }> {
  const temp = password ? null : oneTimePassword();
  const passwordHash = typeof password === "object" ? password.hash : await hashPassword(password || temp!);
  return prisma.$transaction(async (tx) => {
    const memberNo = await nextMemberNo(tx);
    const user = await tx.user.create({
      data: { ...details, email: details.email.toLowerCase(), memberNo, passwordHash, mustChangePassword: !!temp },
    });
    return { id: user.id, memberNo, oneTimePassword: temp };
  });
}

/** Welcome email with the membership number and, if one was issued, the one-time password. */
export async function sendWelcome(user: { name: string; email: string; memberNo: string }, oneTime: string | null) {
  const { emailHtml, sendEmail, siteUrl } = await import("@/lib/mailer");
  const first = user.name.split(" ")[0];
  const lines = [
    `Welcome to Aven Eco Luxury Resort & Wellness, ${first}.`,
    `Your shareholder account is open. Membership number: ${user.memberNo}.`,
    oneTime
      ? `Sign in with your email (${user.email}) or membership number and this one-time password: ${oneTime}\nYou'll be asked to choose your own password straight away.`
      : "Sign in with your email or membership number and your password. You can change it any time from your account.",
  ];
  await sendEmail({
    to: user.email,
    subject: `Your Aven shareholder account — ${user.memberNo}`,
    text: `${lines.join("\n\n")}\n\n${siteUrl()}/login`,
    html: emailHtml({ title: "Your shareholder account is ready", body: lines.join("\n"), cta: { label: "Sign in", href: `${siteUrl()}/login` } }),
  }).catch(() => null);
}
