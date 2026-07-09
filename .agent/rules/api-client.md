---
trigger: glob
glob: "**/*.ts,**/*.tsx,lib/erpnext/**"
---

# ERPNext API Client Rules

All backend access **must** go through `lib/erpnext/client.ts`. Never call `fetch()` or `axios` directly in components or pages.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ERPNEXT_URL` | ERPNext base URL (e.g. `http://104.248.237.122`) |
| `ERPNEXT_API_KEY` | ERPNext API key (server-side only) |
| `ERPNEXT_API_SECRET` | ERPNext API secret (server-side only) |

> **Note**: `NEXT_PUBLIC_ERPNEXT_URL` is safe for the browser. API key/secret are **server-side only** — never expose them to the client.

## Auth Header Pattern

All API requests must include:
```
Authorization: token {api_key}:{api_secret}
Content-Type: application/json
```

Token is stored in an httpOnly cookie after login. The client reads it server-side and forwards it.

## ERPNext API Conventions

### Resource CRUD (standard DocTypes)
```
GET    /api/resource/{DocType}           # list
GET    /api/resource/{DocType}/{name}    # single record
POST   /api/resource/{DocType}           # create
PUT    /api/resource/{DocType}/{name}    # update
DELETE /api/resource/{DocType}/{name}    # delete
```

### Method calls (custom logic)
```
POST /api/method/{dotted.python.path}
GET  /api/method/{dotted.python.path}   # for read-only methods
```

### Common ERPNext query params
```
?fields=["name","field1","field2"]      # field projection
?filters=[["doctype","field","=","val"]] # filter
?limit=20&limit_start=0                  # pagination
?order_by=creation+desc                  # ordering
```

## Client Usage Pattern

```ts
// Server Component (page.tsx)
import { createErpNextClient } from "@/lib/erpnext/client";

const client = createErpNextClient();
const items = await client.getList("Item", {
  fields: ["name", "item_name", "item_group", "standard_rate"],
  filters: [["Item", "disabled", "=", 0]],
  limit: 50,
});
```

```ts
// Client Component (via TanStack Query hook)
import { useMenuItems } from "@/lib/hooks/useMenu";

const { data, isLoading } = useMenuItems();
```

## Response Types

All client methods return **typed** data or throw a typed `ErpNextApiError`:

```ts
export class ErpNextApiError extends Error {
  constructor(
    public status: number,
    public exc_type: string,
    message: string
  ) { super(message); }
}
```

## Boundaries

- **Page (Server Component)** → calls `createErpNextClient()` directly
- **Client Component** → uses a `useX()` TanStack Query hook from `lib/hooks/`
- **Hooks** → call API functions from `lib/erpnext/*.ts` via `fetch` on the Next.js API route or server action
- **Never** call ERPNext directly from browser — always proxy through Next.js server
