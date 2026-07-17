# LoveConnect SA — AI Takeover Document

> **Purpose:** This document exists to give any AI agent (or developer) a complete picture of the project before touching a single line of code. Read this first. It will save you from the same dead-ends already hit during development.

---

## 1. What This Project Is

A South African dating web app — **LoveConnect SA**. Users sign up, upload photos, browse other singles, like/pass profiles, get matched when both users like each other, and chat with their matches.

**GitHub repo:** `https://github.com/meluxolomchunu524-commits/my-southafrica-match`  
**Branch:** `main`  
**Live preview port:** `5000`

---

## 2. How to Run It

```bash
npm install
npm run dev          # serves on http://localhost:5000
```

The Replit workflow `Start application` runs `npm run dev` automatically. Do not change the port — it is hardcoded to `5000` and `strictPort: true` in `vite.config.ts`.

---

## 3. Tech Stack (exact versions matter)

| Layer | Tool | Version |
|---|---|---|
| Framework | TanStack Start (SSR) | `@tanstack/react-start@1.168.26` |
| Router | TanStack Router (file-based) | `@tanstack/react-router@1.170.16` |
| UI | React 19 | `react@19.2.0` |
| Styling | Tailwind CSS v4 | `tailwindcss@4.2.1` |
| Build | Vite | `vite@8.0.16` |
| Database | Replit built-in PostgreSQL via `pg` Pool | `pg@8.22.0` |
| Auth | JWT (custom, NOT Supabase auth) | `jsonwebtoken@9.0.3` + `bcryptjs@3.0.3` |
| Component kit | Radix UI + shadcn/ui | various |

---

## 4. Environment Variables

Only **two** variables are actually required for the app to function:

| Variable | Where set | Purpose |
|---|---|---|
| `DATABASE_URL` | Replit Secrets | PostgreSQL connection string (Replit managed) |
| `SESSION_SECRET` | Replit Secrets | JWT signing secret (30-day tokens) |

### Variables that look required but are NOT

The codebase still contains `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` references in `src/integrations/supabase/`. **These are not used.** The Supabase client (`src/integrations/supabase/client.ts`) is a no-op mock. Do not waste time setting these up.

---

## 5. Architecture — The Decisions That Matter

### 5a. Auth — JWT only, no Supabase auth

Supabase was the original auth provider. It was replaced with a custom JWT flow because the project runs on Replit with a built-in PostgreSQL database (not Supabase hosted).

**How it works:**
1. Sign-up / sign-in hit `signUpFn` / `signInFn` in `src/api/auth-fns.ts`
2. Password is hashed with bcrypt and stored in the `users` table
3. On success, a 30-day JWT is issued via `signToken()` in `src/lib/auth-helpers.ts`
4. The token is stored client-side in `localStorage` as `lc_token`
5. The user object (id, email, full_name, username, avatar_url) is cached in `localStorage` as `lc_user` to avoid a network round-trip on every page load

**Auth middleware pattern (critical):**

Every protected server function uses the `attachSupabaseAuth` middleware from `src/integrations/supabase/auth-attacher.ts`. This middleware has:
- `.client()` — reads `lc_token` from localStorage, adds `Authorization: Bearer <token>` header
- `.server()` — reads the `Authorization` header, verifies the JWT, injects `userId` and `userEmail` into the handler's `context`

**Handlers then do:**
```ts
.handler(async ({ context }) => {
  const userId = requireUserId(context); // throws if not authed
  // ... query DB using userId
})
```

⚠️ **Do NOT use `getWebRequest()` from `@tanstack/react-start/server`.** It does not exist in this version and throws `(0, getWebRequest) is not a function` at runtime. The context pattern above is the correct replacement.

### 5b. Server functions must live in `src/api/`, NOT `src/server/`

TanStack Start's import-protection plugin blocks any file matching `**/server/**` from being imported in client code. This breaks the middleware chain. All server functions are in `src/api/`.

### 5c. Photos are stored as base64 in PostgreSQL

Photos are uploaded via `FileReader.readAsDataURL()`, converted to base64 data URLs, and stored directly in `profiles.photos text[]`. There is no file storage service (no S3, no Supabase Storage bucket — those SQL policies in the migrations are legacy and unused).

**Performance implication:** `SELECT *` on `profiles` can return megabytes of base64. The profile page loads in two parallel requests:
- `getProfileFn` — all columns except `photos` (fast)
- `getPhotosFn` — only the `photos` array (potentially slow)

Do not merge these back into one query.

### 5d. SSR hydration — localStorage reads must be in `useEffect`

The auth context (`src/contexts/auth-context.tsx`) starts with `user: null, loading: true` on both server and client. It reads from `localStorage` only inside `useEffect` (client-only), which fires after hydration. This prevents the React SSR hydration mismatch that occurs when `localStorage.getItem()` is called as a `useState` lazy initializer (returns a value on the client, `null` on the server → mismatch).

**Do not move localStorage reads back into `useState()` initializers.**

---

## 6. Database Schema

The database is Replit's built-in PostgreSQL. Schema was applied manually — there is no migration runner. The SQL files in `supabase/migrations/` are historical records only; running them again would fail (tables already exist).

### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  province TEXT,
  city TEXT,
  relationship_preference TEXT,
  interests TEXT[] DEFAULT '{}',
  bio TEXT,
  occupation TEXT,
  education TEXT,
  avatar_url TEXT,         -- first photo, denormalised for quick reads
  cover_url TEXT,
  photos TEXT[] DEFAULT '{}',  -- base64 data URLs, up to 6
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `profile_likes`
```sql
CREATE TABLE profile_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  liked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (liker_id, liked_id)
);
```

### `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)   -- always store smaller UUID first
);
```

### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX messages_match_idx ON messages(match_id, created_at);
```

### Seed data

20 dummy South African profiles exist in the database (emails end in `@loveconnect-dummy.sa`, password `Dummy1234!`). They are used for the browse/swipe feature. To re-seed from scratch:

```bash
node scripts/seed-profiles.mjs
```

---

## 7. File Map

```
src/
├── api/
│   ├── auth-fns.ts         # signUpFn, signInFn, getMeFn
│   └── db-fns.ts           # getProfileFn, getPhotosFn, updateProfileFn,
│                           # getBrowsableProfilesFn, recordLikeFn,
│                           # getMatchThreadsFn, getChatFn, sendMessageFn
├── contexts/
│   └── auth-context.tsx    # AuthProvider, useAuth, cacheUser()
├── hooks/
│   └── use-auth.tsx        # re-exports useAuth from auth-context
├── integrations/
│   └── supabase/
│       ├── auth-attacher.ts    # THE middleware — .client() adds header, .server() decodes JWT
│       ├── client.ts           # no-op mock — safe to ignore
│       ├── auth-middleware.ts  # legacy, not used
│       └── client.server.ts    # legacy, not used
├── lib/
│   ├── db.ts               # pg.Pool singleton (DATABASE_URL)
│   ├── auth-helpers.ts     # signToken(), verifyToken(), tokenFromRequest()
│   └── error-page.ts       # 500 error HTML renderer
├── components/
│   ├── SiteNav.tsx         # top nav — auth-aware (shows Profile/Sign out or Login/Sign Up)
│   ├── SiteFooter.tsx
│   └── ui/                 # shadcn/ui component library (do not hand-edit)
├── routes/
│   ├── __root.tsx          # root layout — wraps everything in <AuthProvider>
│   ├── index.tsx           # landing page
│   ├── about.tsx           # About + PageHero component (imported by other routes)
│   ├── login.tsx           # login form → signInFn → stores lc_token + lc_user
│   ├── signup.tsx          # multi-step registration → signUpFn
│   ├── profile.tsx         # edit profile + photo management
│   ├── matches.tsx         # browse/swipe UI (infinite cycling, 20+ dummy profiles)
│   ├── messages.index.tsx  # match thread list
│   ├── messages.$matchId.tsx  # individual chat (5-second polling)
│   ├── membership.tsx      # pricing/membership page (static)
│   ├── contact.tsx         # contact page (static)
│   └── admin.tsx           # admin page (stub)
├── start.ts                # TanStack Start instance — registers middleware
└── styles.css              # Tailwind v4 global styles + design tokens
scripts/
└── seed-profiles.mjs       # seeds 20 dummy SA profiles (node scripts/seed-profiles.mjs)
supabase/
└── migrations/             # historical SQL only — DO NOT re-run
vite.config.ts              # port 5000, host 0.0.0.0, uses @lovable.dev/vite-tanstack-config
```

---

## 8. Routes Quick Reference

| URL | Auth required | What it does |
|---|---|---|
| `/` | No | Landing page |
| `/about` | No | About page |
| `/signup` | No (redirects if logged in) | Registration (photos required) |
| `/login` | No (redirects if logged in) | Sign in |
| `/profile` | Yes | Edit profile + manage photos |
| `/matches` | Yes | Swipe/browse profiles (infinite cycle) |
| `/messages` | Yes | List of match conversations |
| `/messages/$matchId` | Yes | Chat thread (5-sec polling) |
| `/membership` | No | Pricing page (static) |
| `/contact` | No | Contact page (static) |

---

## 9. Key Gotchas & Traps

1. **`getWebRequest()` does not exist** in `@tanstack/react-start@1.168.26`. Do not import or call it. Use the middleware context pattern (see §5a).

2. **Supabase is mocked out.** `src/integrations/supabase/client.ts` returns a no-op object. Any code that calls Supabase JS methods will silently do nothing or throw. The real data layer is the `pg.Pool` in `src/lib/db.ts`.

3. **`src/server/` is a forbidden path.** TanStack Start blocks imports from any path matching `**/server/**` in client code. Keep server functions in `src/api/`.

4. **`matches` table enforces `user_a < user_b`.** When inserting a match, always sort the two UUIDs: `const a = uid1 < uid2 ? uid1 : uid2`. The `recordLikeFn` already handles this.

5. **Photos can be very large.** Each base64 photo is ~1.3× the original file size. Six 3 MB photos = ~24 MB in a single column. Always fetch photos separately from profile metadata.

6. **Auth loading state on first render is always `true`.** The SSR-rendered HTML always shows the loading state. The client resolves it in the first `useEffect` tick — either instantly from the `lc_user` cache (if the user was previously logged in) or after one `getMeFn` network call (new device/browser). Do not try to pre-populate auth state from cookies or SSR context.

7. **`PageHero` is exported from `src/routes/about.tsx`**, not its own component file. Other routes import it from there.

8. **The `matches` browse query deliberately has no row limit and no "already liked" filter.** The user wanted infinite cycling — when the last profile is shown, the index wraps back to 0. Do not add a `LIMIT` or exclusion filter until explicitly asked.

---

## 10. What Is Working

- [x] Sign up with email/password + 3–6 photo upload (base64)
- [x] Sign in / sign out
- [x] Persistent auth via JWT + localStorage cache (instant nav, no spinner on return visits)
- [x] Edit profile (all fields + photo management)
- [x] Browse/swipe profiles (infinite cycle through 20 dummy SA profiles)
- [x] Like a profile → mutual like detection → match creation
- [x] "It's a match!" toast with link to chat
- [x] Match thread list (`/messages`)
- [x] Individual chat with 5-second polling (`/messages/$matchId`)
- [x] Auth-aware navigation (SiteNav)

## 11. What Is Not Done Yet

- [ ] Real-time messaging (currently polling every 5 s — could be upgraded to WebSocket/SSE)
- [ ] Push notifications
- [ ] Profile verification / badge system
- [ ] Admin dashboard (route exists but is a stub)
- [ ] Membership / payment integration
- [ ] Search / filter by province, age, gender on the browse page
- [ ] Profile photo order drag-and-drop
- [ ] Block / report user
- [ ] Email notifications on match

---

## 12. Design System

Tailwind v4 with custom tokens defined in `src/styles.css`:

| Token | Value |
|---|---|
| `--pink` | `#E91E8C` |
| `--purple` | `#7C3AED` |
| `--ink` | `#0F172A` |
| `bg-gradient-brand` | pink → purple diagonal |
| `shadow-glow` | pink glow shadow |
| `shadow-soft` | subtle card shadow |

Font stacks: `font-display` (headings, set in root CSS), system sans for body.

UI components live in `src/components/ui/` — these are shadcn/ui primitives. Do not hand-edit them; regenerate via shadcn CLI if needed.

---

## 13. How to Add a New Feature (pattern to follow)

**New server function:**
```ts
// src/api/db-fns.ts
export const myNewFn = createServerFn({ method: 'POST' })
  .middleware([attachSupabaseAuth])          // required for auth
  .validator((d: { someField: string }) => d)
  .handler(async ({ data, context }) => {
    const userId = requireUserId(context);   // throws 401 if unauthenticated
    const res = await pool.query('SELECT ...', [userId, data.someField]);
    return res.rows;
  });
```

**Calling it from a route:**
```ts
const result = await myNewFn({ data: { someField: 'value' } });
```

**New DB table — apply the SQL directly:**
```bash
# Connect to the Replit DB console or run a one-off script:
node -e "
import('./src/lib/db.ts').then(async ({ default: pool }) => {
  await pool.query('CREATE TABLE ...');
  await pool.end();
})
"
```

The migration files in `supabase/migrations/` are for historical reference only — they are not auto-applied.
