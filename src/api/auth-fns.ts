import { createServerFn } from '@tanstack/react-start';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth-helpers';
import { sendMail, verificationEmailHtml } from '@/lib/mailer';
import { attachSupabaseAuth } from '@/integrations/supabase/auth-attacher';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

function siteOrigin(): string {
  return (
    process.env.SITE_URL ??
    (process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000')
  );
}

// ── Sign up ───────────────────────────────────────────────────────────────────
// Creates the account, sends a verification email, returns NO token.
// The user must click the link before they can log in.
export const signUpFn = createServerFn({ method: 'POST' })
  .validator((d: {
    email: string; password: string; full_name: string; username: string;
    phone: string; gender: string; date_of_birth: string; province: string;
    city: string; relationship_preference: string; bio: string;
    photos: string[]; interests: string[];
  }) => d)
  .handler(async ({ data }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email.toLowerCase()],
      );
      if (existing.rows.length > 0)
        throw new Error('An account with this email already exists.');

      if (data.username) {
        const uEx = await client.query(
          'SELECT id FROM profiles WHERE username = $1',
          [data.username],
        );
        if (uEx.rows.length > 0) throw new Error('This username is already taken.');
      }

      const hash = await bcrypt.hash(data.password, 12);
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, verified)
         VALUES ($1, $2, false) RETURNING id, email`,
        [data.email.toLowerCase(), hash],
      );
      const user = userRes.rows[0];

      await client.query(
        `INSERT INTO profiles
           (id, email, full_name, username, phone, gender, date_of_birth,
            province, city, relationship_preference, bio, photos, avatar_url, interests)
         VALUES ($1,$2,$3,$4,$5,$6,$7::date,$8,$9,$10,$11,$12,$13,$14)`,
        [
          user.id, data.email.toLowerCase(),
          data.full_name || null, data.username || null, data.phone || null,
          data.gender || null, data.date_of_birth || null,
          data.province || null, data.city || null,
          data.relationship_preference || null, data.bio || null,
          data.photos, data.photos[0] ?? null, data.interests,
        ],
      );

      // Generate a 24-hour verification token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO email_verifications (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt],
      );

      await client.query('COMMIT');

      // Send the email (falls back to console.log if SMTP not configured)
      const verifyUrl = `${siteOrigin()}/verify-email?token=${token}`;
      const firstName = (data.full_name || data.email).split(' ')[0];
      await sendMail({
        to: data.email,
        subject: 'Verify your LoveConnect SA email',
        html: verificationEmailHtml(verifyUrl, firstName),
      });

      return { email: data.email };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  });

// ── Sign in ───────────────────────────────────────────────────────────────────
export const signInFn = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const res = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.verified,
              p.full_name, p.username, p.avatar_url
       FROM users u LEFT JOIN profiles p ON p.id = u.id
       WHERE u.email = $1`,
      [data.email.toLowerCase()],
    );
    if (res.rows.length === 0) throw new Error('Invalid email or password.');
    const row = res.rows[0];

    const ok = await bcrypt.compare(data.password, row.password_hash);
    if (!ok) throw new Error('Invalid email or password.');

    if (!row.verified) {
      throw new Error(
        'Please verify your email before logging in. Check your inbox for the confirmation link.',
      );
    }

    const token = signToken({ sub: row.id, email: row.email });
    return {
      token,
      user: {
        id: row.id, email: row.email,
        full_name: row.full_name, username: row.username, avatar_url: row.avatar_url,
      } as AuthUser,
    };
  });

// ── Get current user ──────────────────────────────────────────────────────────
export const getMeFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((_d: Record<string, never>) => _d)
  .handler(async ({ context }) => {
    const userId = (context as any).userId as string | null;
    if (!userId) return null;
    const res = await pool.query(
      `SELECT u.id, u.email, p.full_name, p.username, p.avatar_url
       FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1`,
      [userId],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id, email: row.email,
      full_name: row.full_name, username: row.username, avatar_url: row.avatar_url,
    } as AuthUser;
  });
