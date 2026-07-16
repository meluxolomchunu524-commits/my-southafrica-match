import { createServerFn } from '@tanstack/react-start';
import pool from '@/lib/db';
import { attachSupabaseAuth } from '@/integrations/supabase/auth-attacher';

function requireUserId(context: unknown): string {
  const userId = (context as any)?.userId as string | null | undefined;
  if (!userId) throw new Error('Not authenticated. Please log in and try again.');
  return userId;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export const getProfileFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((_d: Record<string, never>) => _d)
  .handler(async ({ context }) => {
    const userId = requireUserId(context);
    const res = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
    return res.rows[0] ?? null;
  });

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((d: {
    full_name?: string | null; username?: string | null; date_of_birth?: string | null;
    gender?: string | null; province?: string | null; city?: string | null;
    bio?: string | null; occupation?: string | null; education?: string | null;
    relationship_preference?: string | null; interests?: string[];
    photos?: string[]; avatar_url?: string | null; cover_url?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    const userId = requireUserId(context);
    const photos = data.photos ?? [];
    const avatarUrl = data.avatar_url ?? (photos[0] ?? null);
    const res = await pool.query(
      `UPDATE profiles SET
         full_name=$1, username=$2, date_of_birth=$3::date, gender=$4,
         province=$5, city=$6, bio=$7, occupation=$8, education=$9,
         relationship_preference=$10, interests=$11, photos=$12,
         avatar_url=$13, cover_url=$14
       WHERE id=$15 RETURNING *`,
      [
        data.full_name ?? null, data.username ?? null, data.date_of_birth || null,
        data.gender ?? null, data.province ?? null, data.city ?? null,
        data.bio ?? null, data.occupation ?? null, data.education ?? null,
        data.relationship_preference ?? null, data.interests ?? [],
        photos, avatarUrl, data.cover_url ?? null, userId,
      ],
    );
    return res.rows[0] ?? null;
  });

// ── Matching ──────────────────────────────────────────────────────────────────

export const getBrowsableProfilesFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((_d: Record<string, never>) => _d)
  .handler(async ({ context }) => {
    const userId = requireUserId(context);
    // Return every profile except the current user — no like filter, no row cap.
    // The client cycles through indefinitely.
    const res = await pool.query(
      `SELECT id, full_name, username, gender, date_of_birth, city, province, bio, avatar_url, cover_url
       FROM profiles WHERE id != $1
       ORDER BY full_name ASC`,
      [userId],
    );
    return res.rows;
  });

export const recordLikeFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((d: { likedId: string; action: 'like' | 'pass' }) => d)
  .handler(async ({ data, context }) => {
    const userId = requireUserId(context);
    await pool.query(
      'INSERT INTO profile_likes (liker_id, liked_id, action) VALUES ($1,$2,$3) ON CONFLICT (liker_id, liked_id) DO NOTHING',
      [userId, data.likedId, data.action],
    );
    if (data.action === 'like') {
      const mutual = await pool.query(
        'SELECT id FROM profile_likes WHERE liker_id=$1 AND liked_id=$2 AND action=$3',
        [data.likedId, userId, 'like'],
      );
      if (mutual.rows.length > 0) {
        const a = userId < data.likedId ? userId : data.likedId;
        const b = userId < data.likedId ? data.likedId : userId;
        const ins = await pool.query(
          'INSERT INTO matches (user_a, user_b) VALUES ($1,$2) ON CONFLICT (user_a, user_b) DO NOTHING RETURNING id',
          [a, b],
        );
        const matchId =
          ins.rows[0]?.id ??
          (await pool.query('SELECT id FROM matches WHERE user_a=$1 AND user_b=$2', [a, b])).rows[0]?.id;
        return { matched: true, matchId: matchId ?? null };
      }
    }
    return { matched: false, matchId: null };
  });

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMatchThreadsFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((_d: Record<string, never>) => _d)
  .handler(async ({ context }) => {
    const userId = requireUserId(context);
    const res = await pool.query(
      `SELECT
         m.id AS match_id, m.created_at,
         p.id AS other_id, p.full_name, p.username, p.avatar_url, p.city,
         (SELECT content    FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_message,
         (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_at
       FROM matches m
       JOIN profiles p ON p.id = CASE WHEN m.user_a = $1 THEN m.user_b ELSE m.user_a END
       WHERE m.user_a = $1 OR m.user_b = $1
       ORDER BY COALESCE(
         (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1),
         m.created_at
       ) DESC`,
      [userId],
    );
    return res.rows;
  });

export const getChatFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((d: { matchId: string }) => d)
  .handler(async ({ data, context }) => {
    const userId = requireUserId(context);
    const matchRes = await pool.query(
      'SELECT id, user_a, user_b FROM matches WHERE id=$1 AND (user_a=$2 OR user_b=$2)',
      [data.matchId, userId],
    );
    if (matchRes.rows.length === 0) throw new Error('Match not found.');
    const match = matchRes.rows[0];
    const otherId = match.user_a === userId ? match.user_b : match.user_a;
    const [profileRes, msgsRes] = await Promise.all([
      pool.query(
        'SELECT id, full_name, username, avatar_url, city, province, bio FROM profiles WHERE id=$1',
        [otherId],
      ),
      pool.query(
        'SELECT id, sender_id, receiver_id, content, created_at FROM messages WHERE match_id=$1 ORDER BY created_at ASC',
        [data.matchId],
      ),
    ]);
    return { other: profileRes.rows[0] ?? null, messages: msgsRes.rows };
  });

export const sendMessageFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])
  .validator((d: { matchId: string; receiverId: string; content: string }) => d)
  .handler(async ({ data, context }) => {
    const userId = requireUserId(context);
    const matchRes = await pool.query(
      'SELECT id FROM matches WHERE id=$1 AND (user_a=$2 OR user_b=$2)',
      [data.matchId, userId],
    );
    if (matchRes.rows.length === 0) throw new Error('Not authorized.');
    const res = await pool.query(
      `INSERT INTO messages (match_id, sender_id, receiver_id, content)
       VALUES ($1,$2,$3,$4)
       RETURNING id, sender_id, receiver_id, content, created_at`,
      [data.matchId, userId, data.receiverId, data.content.trim()],
    );
    return res.rows[0];
  });
