import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Transactional email, through either:
 * - SMTP (e.g. a Gmail account): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   (for Gmail, an App Password) and MAIL_FROM; or
 * - Resend's HTTP API: set RESEND_API_KEY and MAIL_FROM on a verified domain.
 *
 * Without either, sends are skipped and reported as such — notifications
 * still reach the dashboard inbox — and in development the message is printed
 * to the server log so flows like password reset can be tested.
 */

export type MailResult = "SENT" | "FAILED" | "SKIPPED";

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function emailConfigured() {
  return smtpConfigured() || !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

let transport: Transporter | null = null;
function smtp() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** The branded shell every Aven email is sent in. */
export function emailHtml({
  title,
  body,
  cta,
  footer = "You receive this because you hold shares in Aven Eco Luxury Resort & Wellness.",
}: {
  title: string;
  body: string;
  cta?: { label: string; href: string };
  /** Why the reader got this email. */
  footer?: string;
}) {
  const paragraphs = body
    .split(/\n+/)
    .map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3d4a44">${escapeHtml(p)}</p>`)
    .join("");
  const button = cta
    ? `<p style="margin:24px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#0e4d38;color:#faf8f2;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3efe4;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#faf8f2;border-radius:20px;overflow:hidden">
<tr><td style="background:#0b2a20;padding:22px 28px"><img src="${siteUrl()}/brand/aven-logo-white.png" alt="AVEN Eco Luxury Resort and Wellness" height="40" style="height:40px"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:#0b2a20">${escapeHtml(title)}</h1>
${paragraphs}${button}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e6e2d6;font-size:12px;color:#8a948e">Aven Limited · Radhanagar, Sreemangal · ${escapeHtml(footer)}</td></tr>
</table></body></html>`;
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }): Promise<MailResult> {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") console.log(`
[aven] Email not configured — would send to ${to}: ${subject}
${text}
`);
    return "SKIPPED";
  }
  const from = process.env.MAIL_FROM || `Aven Eco Luxury Resort <${process.env.SMTP_USER}>`;
  if (smtpConfigured()) {
    try {
      await smtp().sendMail({ from, to, subject, html, text });
      return "SENT";
    } catch (err) {
      console.error("Email send failed (SMTP)", err);
      return "FAILED";
    }
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, html, text }),
    });
    if (!res.ok) console.error("Email send failed", res.status, await res.text().catch(() => ""));
    return res.ok ? "SENT" : "FAILED";
  } catch (err) {
    console.error("Email send failed", err);
    return "FAILED";
  }
}
