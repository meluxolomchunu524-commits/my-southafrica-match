import { createServerFn } from '@tanstack/react-start';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth-helpers';
import { sendMail, verificationEmailHtml } from '@/lib/mailer';

function siteOrigin(): string {
  // In production use the public domain; in dev use the Replit dev domain.
  return (
    process.env.SITE_URL ??
    (process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000')
  );
}

/** Called server-side after account creation to dispatch the verification email. */
export const sendVerificationEmailFn = createServerFn({ method: 'POST' })
  .validator((d: { userId: string; email: string; firstName: string }) => d)
  .handler(async ({ data }) => {
    // Invalidate any previous unused tokens for this user
    await pool.query(
      `UPDATE email_verifications SET used = true
       WHERE user_id = $1 AND used = false`,
      [data.userId],
    );

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [data.userId, token, expiresAt],
    );

    const verifyUrl = `${siteOrigin()}/verify-email?token=${token}`;

    await sendMail({
      to: data.email,
      subject: 'Verify your LoveConnect SA email',
      html: verificationEmailHtml(verifyUrl, data.firstName),
    });

    return { ok: true };
  });

/** Called by the /verify-email page when the user lands from the link in their inbox. */
export const verifyEmailTokenFn = createServerFn({ method: 'POST' })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const res = await pool.query(
      `SELECT ev.id, ev.user_id, ev.expires_at, ev.used,
              u.email, p.full_name, p.username, p.avatar_url
       FROM email_verifications ev
       JOIN users u ON u.id = ev.user_id
       LEFT JOIN profiles p ON p.id = ev.user_id
       WHERE ev.token = $1`,
      [data.token],
    );

    if (res.rows.length === 0) throw new Error('This verification link is invalid.');
    const row = res.rows[0];
    if (row.used) throw new Error('This link has already been used. Please log in.');
    if (new Date(row.expires_at) < new Date())
      throw new Error('This verification link has expired. Please sign up again or request a new link.');

    // Mark token used and verify the account in one go
    await pool.query(
      `UPDATE email_verifications SET used = true WHERE id = $1`,
      [row.id],
    );
    await pool.query(
      `UPDATE users SET verified = true WHERE id = $1`,
      [row.user_id],
    );

    const token = signToken({ sub: row.user_id, email: row.email });
    return {
      token,
      user: {
        id: row.user_id,
        email: row.email,
        full_name: row.full_name ?? null,
        username: row.username ?? null,
        avatar_url: row.avatar_url ?? null,
      },
    };
  });
