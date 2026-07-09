---
trigger: glob
glob: "app/(auth)/**,lib/erpnext/auth.ts,middleware.ts"
---

# Auth Rules — ERPNext Token-Based Auth

## Method: Token Auth (API Key + Secret)

Citly uses ERPNext's **token-based authentication** — not NextAuth, not Auth.js, not Authentik, not Laravel sessions.

After login, the ERPNext API key and secret for the authenticated user are stored in **httpOnly cookies** and forwarded as the `Authorization` header on every server-side API call.

## Login Flow

1. User submits email + password on `/login`
2. Next.js server action calls `POST /api/method/login` with credentials
3. On success, ERPNext returns a session cookie **and** the user's `api_key` + `api_secret`
4. Server sets httpOnly cookies: `citly_api_key`, `citly_api_secret`, `citly_user`
5. Redirect to `/dashboard`

## Registration Flow

1. User fills restaurant registration form on `/register`
2. Server action calls `POST /api/resource/User` (or a custom ERPNext method)
3. On success, auto-login using the token flow above
4. Redirect to `/onboarding` for restaurant profile setup

## Session Check (Middleware)

`middleware.ts` reads `citly_api_key` cookie:
- If missing → redirect to `/login` for all `(dashboard)` routes
- If present → allow through

## ERPNext Login Endpoint

```
POST /api/method/login
Body: { usr: string, pwd: string }

Success response:
{
  message: "Logged In",
  home_page: "/",
  full_name: "Owner Name"
}
```

After login, fetch user API token:
```
GET /api/method/frappe.client.get_api_key
→ returns api_key and api_secret for the current user
```

## Route Groups

| Route group | Auth required | Layout |
|---|---|---|
| `(auth)` — `/login`, `/register`, `/forgot-password` | No | Minimal, no sidebar |
| `(dashboard)` — all other pages | Yes | Sidebar + Topbar |

## Rules

- Do **not** add NextAuth / Auth.js or Authentik setup
- Do **not** copy monorepo `session.companyAccess` patterns
- Do **not** assume `/sign-in` or `/unauthorized` routes — use `/login`
- Session token is **never** exposed to client-side JavaScript
- All auth state for the client UI comes from a `/api/me` Next.js route (returns safe user data)
- On logout: clear cookies + call `POST /api/method/logout` on ERPNext