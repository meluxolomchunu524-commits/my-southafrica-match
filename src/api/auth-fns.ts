import { createServerFn } from '@tanstack/react-start';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth-helpers';
import { attachSupabaseAuth } from '@/integrations/supabase/auth-attacher';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

// ── Sign up ───────────────────────────────────────────────────────────────────
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
         VALUES ($1, $2, true) RETURNING id, email`,
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

      await client.query('COMMIT');
      return { ok: true };
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
