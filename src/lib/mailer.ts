import nodemailer from 'nodemailer';

/**
 * Sends an email. Falls back to logging the message to the console when
 * SMTP_HOST is not configured — handy for local dev.
 *
 * Required env vars for real email delivery:
 *   SMTP_HOST   e.g. smtp.gmail.com
 *   SMTP_PORT   e.g. 587  (defaults to 587)
 *   SMTP_USER   your SMTP username / email address
 *   SMTP_PASS   your SMTP password / app password
 *   SMTP_FROM   e.g. "LoveConnect SA <noreply@loveconnect.co.za>"
 */
export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST;

  if (!host) {
    // Dev fallback — print to server console so you can click the link
    console.log('\n──── DEV EMAIL (no SMTP configured) ────');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    // Strip tags for a readable console output
    console.log('Body:   ', html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('────────────────────────────────────────\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `LoveConnect SA <noreply@${host}>`,
    to,
    subject,
    html,
  });
}

export function verificationEmailHtml(verifyUrl: string, firstName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5ff;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ff;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,.10)">
        <tr><td style="background:linear-gradient(135deg,#e91e8c,#7c3aed);padding:36px 40px;text-align:center">
          <span style="font-size:32px">💜</span>
          <h1 style="margin:12px 0 0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-.5px">LoveConnect SA</h1>
        </td></tr>
        <tr><td style="padding:40px 40px 32px">
          <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a">Hi ${firstName},</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">
            You're almost there! Click the button below to verify your email address and start browsing singles across South Africa.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#e91e8c,#7c3aed);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:100px;box-shadow:0 4px 16px rgba(233,30,140,.35)">
            Verify my email
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6">
            This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="margin:28px 0;border:none;border-top:1px solid #f1f5f9">
          <p style="margin:0;font-size:12px;color:#94a3b8">
            Can't click the button? Copy this link:<br>
            <a href="${verifyUrl}" style="color:#7c3aed;word-break:break-all">${verifyUrl}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} LoveConnect SA · South Africa's dating platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
