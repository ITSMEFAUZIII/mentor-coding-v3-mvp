# Mentor Coding v3 – MVP (72h Scope)

**Stack:** React + Vite, Supabase (Auth, Postgres, Realtime-ready), React Query, Zustand.

## Quickstart
1) Create a new Supabase project, get `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`.
2) In Supabase SQL Editor, run [`/supabase/schema.sql`](./supabase/schema.sql).
3) Copy `.env.example` to `.env` and fill keys.
4) `npm i` then `npm run dev`.

## MVP Features
- Email/password auth
- Profile (display name) with upsert
- XP system (server-validated via RPC)
- Global leaderboard (top 10)
- Chat (public room, realtime-ready)

## Env
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Next
- Realtime enable: Database → Replication → Add table `messages`, `progress` to WAL → Realtime.
- Add course/modules/lessons tables, adaptive quests, badges.
