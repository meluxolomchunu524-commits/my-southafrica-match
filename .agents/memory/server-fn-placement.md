---
name: Server function file placement
description: Where to put createServerFn files so client components can import them without import-protection errors.
---

TanStack Start's `import-protection` Vite plugin denies any import of `**/server/**` in the client environment — even `createServerFn` files, which are valid RPC bridges.

**Rule:** Place all `createServerFn` / `createServerOnlyFn` files under `src/api/` (or any non-blocked directory), NOT under `src/server/`.

**Why:** The Lovable/TanStack config registers `src/server/` as a server-only directory. Importing from it in client components (contexts, route components) causes a build-time error even though `createServerFn` itself is designed to be importable on both sides.

**How to apply:** Any new server function files go in `src/api/`. The `src/lib/` directory (db.ts, auth-helpers.ts) is also fine since those are only imported by the api files (server-side), not by client components directly.
