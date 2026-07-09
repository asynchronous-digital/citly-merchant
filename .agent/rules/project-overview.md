---
trigger: always_on
---

# Synergy POS Dashboard — Project Overview

This repo is a **standalone** Next.js 16 dashboard app. It follows BWG dashboard patterns, but it is **not** part of the `bwg-dashboards` monorepo.

## Stack

- TypeScript strict mode
- Next.js 16 App Router
- pnpm
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Recharts
- Laravel-managed authentication

## Repo rules

- Local API client: `@/lib/api-client`
- Local UI primitives: `@/components/ui`
- Visual source of truth: `design-system/MASTER.md` and `design-system/pages/*.md`

## Standalone differences

- No `@bwg/ui`
- No `@bwg/api-client`
- No frontend-owned NextAuth/Auth.js auth stack
- No pnpm workspace filters
