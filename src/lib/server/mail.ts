import "server-only";
import nodemailer from "nodemailer";

/**
 * Outgoing mail over SMTP (e.g. a Gmail account with an App Password).
 * Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM and NEXT_PUBLIC_SITE_URL.
 * When SMTP is not configured, sending is skipped and callers report it.
 */
export function mailConfigured(): boolean {
  return !!process.env.SMTP_HOST;
}

let transport: nodemailer.Transporter | null = null;
function mailer() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      pool: true,
      maxConnections: 2,
    });
  }
  return transport;
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const TYPE_LABEL: Record<string, string> = {
  participation: "Certificate of Participation",
  winner: "Certificate of Merit (Winner)",
  runner_up: "Certificate of Merit (Runner-up)",
  merit: "Certificate of Merit",
};

export async function sendCertificateEmail(to: string, name: string, certificateId: string, type: string) {
  const site = siteUrl();
  const label = TYPE_LABEL[type] ?? "Certificate";
  const view = `${site}/dashboard/certificate`;
  const verify = `${site}/verify/${encodeURIComponent(certificateId)}`;
  await mailer().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "Prompt to Production <no-reply@localhost>",
    to,
    subject: `Your ${label} · Prompt to Production`,
    text:
      `Hi ${name},\n\nYour ${label} for Prompt to Production (Paytm AI Workshop, NBKRIST) has been issued.\n\n` +
      `View and download: ${view}\nCertificate ID: ${certificateId}\nVerify: ${verify}\n\n` +
      `Department of IT & AI&DS, NBKRIST · with ISTE`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;color:#111113;line-height:1.5">
      <p style="font-size:18px;font-weight:700;margin:0 0 12px">Prompt to Production</p>
      <p>Hi ${esc(name)},</p>
      <p>Your <b>${esc(label)}</b> for Prompt to Production (Paytm AI Workshop, NBKRIST) has been issued.</p>
      <p><a href="${view}" style="display:inline-block;background:#111113;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">View &amp; download certificate</a></p>
      <p style="font-size:13px;color:#5e6168">Certificate ID: <b>${esc(certificateId)}</b><br>Anyone can verify it at <a href="${verify}">${verify}</a></p>
      <p style="font-size:12px;color:#8a8b92">Department of IT &amp; AI&amp;DS, NBKRIST · in association with ISTE</p></div>`,
  });
}
