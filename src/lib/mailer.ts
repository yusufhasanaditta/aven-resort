import "server-only";

/**
 * Transactional email through Resend's HTTP API — no SDK, just `fetch`.
 *
 * Set `RESEND_API_KEY` and `MAIL_FROM` (e.g. `Aven <noreply@avenlimited.com>`,
 * on a domain verified in Resend) to switch email on. Without them every
 * send is skipped and reported as such, and notifications still reach the
 * shareholder's dashboard inbox.
 */

export type MailResult = "SENT" | "FAILED" | "SKIPPED";

export function emailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** The branded shell every Aven email is sent in. */
export function emailHtml({ title, body, cta }: { title: string; body: string; cta?: { label: string; href: string } }) {
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
<tr><td style="padding:18px 28px;border-top:1px solid #e6e2d6;font-size:12px;color:#8a948e">Aven Limited · Radhanagar, Sreemangal · You receive this because you hold shares in Aven Eco Luxury Resort &amp; Wellness.</td></tr>
</table></body></html>`;
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }): Promise<MailResult> {
  if (!emailConfigured()) return "SKIPPED";
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
