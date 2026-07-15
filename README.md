# GuardOps

Enterprise multi-tenant security workforce management platform (TrackTik-class). Phase 1: Live Dashboard + Operations Reports.

## Stack

| Layer | Choice |
| --- | --- |
| Web | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Mobile | Expo (React Native) + expo-router |
| Backend | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) |
| Monorepo | Turborepo + pnpm workspaces |

## Structure

```
apps/web          Next.js admin portal
apps/mobile       Expo guard app (scaffold)
packages/shared   Shared types, zod schemas, constants
supabase/         Migrations + seed (Prompt 3+)
```

## Prerequisites

- Node.js 20+
- pnpm 9 (`npm install -g pnpm@9`)
- Supabase CLI (for Prompt 3+)
- Mapbox token (for maps / Prompt 5+)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example apps/web/.env.local
# Fill in NEXT_PUBLIC_SUPABASE_* and NEXT_PUBLIC_MAPBOX_TOKEN when ready

# 3. Run the web app
pnpm dev
# → http://localhost:3000

# Other scripts
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter @guardops/mobile start
```

## Build prompts

Run the playbook prompts in order (0 → 9), committing after each milestone. Supabase project + GitHub remote are expected before Prompt 2.

## License

Private — all rights reserved.
