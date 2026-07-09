---
trigger: always_on
---

# Citly — Restaurant Management Platform

**Citly** is a Next.js 16 web application for **restaurant owners and managers**. It provides a complete management dashboard that sits on top of an **ERPNext 16** backend, consumed entirely via ERPNext's REST API. Restaurant owners register, log in, and manage every aspect of their restaurant without ever touching the ERPNext UI directly.

## Product Scope (Current Phase)

- Owner/staff **dashboard only** — no customer-facing portal (separate app planned)
- **Order management** (dine-in, takeaway, delivery) — no POS terminal in this phase
- **Single active restaurant** per session, architecture prepared for **multi-branch** later
- **Billing/subscription** is out of scope for now

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict mode) |
| Package manager | pnpm |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Data fetching | TanStack Query v5 |
| Charts | Recharts |
| Backend | ERPNext 16 REST API |
| Auth | ERPNext token-based auth (API key + secret) |

## ERPNext Backend

- **Base URL**: stored in `NEXT_PUBLIC_ERPNEXT_URL` env var
- **Staging URL**: `http://104.248.237.122/`
- **Auth method**: Token-based — `Authorization: token {api_key}:{api_secret}` header
- **Resource API pattern**: `GET/POST /api/resource/{DocType}`
- **Method API pattern**: `POST /api/method/{frappe.method}`
- All API calls go through `@/lib/erpnext/client.ts`

## Folder Conventions

```
app/
  (auth)/          # login, register, forgot-password — no sidebar/topbar
  (dashboard)/     # all authenticated pages — with sidebar + topbar
    dashboard/
    menu/
    orders/
    inventory/
    staff/
    customers/
    reports/
    settings/
components/
  ui/              # shadcn/ui primitives
  layout/          # Sidebar, Topbar, PageHeader
  [module]/        # feature-scoped components
lib/
  erpnext/
    client.ts      # base API client
    auth.ts        # login/logout/session helpers
    menu.ts        # menu-related API functions
    orders.ts      # order-related API functions
    inventory.ts
    staff.ts
    customers.ts
    reports.ts
  hooks/           # TanStack Query hooks per module
  utils.ts
  constants.ts
```

## Key Modules

1. **Auth** — Register, Login, Forgot Password (ERPNext token flow)
2. **Dashboard** — KPI cards, revenue chart, recent orders, live alerts
3. **Menu Management** — Item groups, items, variants, pricing, availability
4. **Order Management** — Sales Orders (dine-in / takeaway / delivery), KOT
5. **Table Management** — Floor plan, table status, reservations
6. **Inventory** — Stock levels, purchase orders, suppliers, waste tracking
7. **Staff Management** — Employees, shifts, attendance, roles
8. **Customer Management** — Customer list, order history, loyalty
9. **Financial Reports** — Sales summary, P&L, daily closing, tax report
10. **Settings** — Restaurant profile, payment methods, printer config

## Design Language

- Source of truth: `local-files/citlyworld_v10-3.html`
- Dark theme: deep navy `#0a0f1e` background
- Accent: burnt orange/red `#e84c1e`
- Fonts: `Bebas Neue` (headings/labels), `DM Sans` (body), `DM Mono` (data/mono)
- All colors must be CSS variables — never hardcoded hex in components
- Visual direction: glass chrome cards, dense operational layout, fixed sidebar + topbar

## Standalone Rules

- No `@bwg/ui`, no `@bwg/api-client`, no monorepo workspace filters
- No NextAuth/Auth.js — use ERPNext token auth with httpOnly cookies
- No Laravel auth patterns
