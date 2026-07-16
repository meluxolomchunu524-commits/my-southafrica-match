# LoveConnect SA

South Africa's dating platform — built with TanStack Start (React SSR), Tailwind CSS v4, and Supabase.

## Stack

- **Framework:** TanStack Start (React 19, SSR via Nitro)
- **Router:** TanStack Router (file-based, `src/routes/`)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`
- **Database & Auth:** Supabase (`@supabase/supabase-js`)
- **Build tool:** Vite 8
- **Package manager:** npm

## Running the app

```
npm run dev
```

Served on port **5000** (`0.0.0.0`). The workflow `Start application` handles this automatically.

## Required environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/publishable key |

Without these, the app will start but all Supabase calls (auth, data) will fail.

## Project structure

```
src/
  routes/          # File-based pages (__root.tsx, index.tsx, signup.tsx, login.tsx, …)
  components/      # Shared UI (SiteNav, SiteFooter)
  hooks/           # use-auth, etc.
  integrations/
    supabase/      # Client, types (auto-generated), auth attacher
    lovable/       # OAuth helper
  lib/             # Utilities
supabase/
  migrations/      # SQL migrations
```

## Key features already implemented

- Registration with required 3–6 photos, format/size validation, deduplication
- Registration success screen (replaces form after submit)
- Email verification → redirects to login with "Email verified" notice
- Auth-aware navigation (Join Free / Sign Up hidden when logged in, Profile + Sign out shown)

## User preferences

- Work in logical phases; explain what changed and ask for approval before the next phase.
- Maintain existing design language and UI consistency.
- Write clean, modular, production-ready code.
- Create DB migrations for any schema changes.
- Ensure all features work on desktop and mobile.
