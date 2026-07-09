---
trigger: glob
glob: "**/*.ts,**/*.tsx"
---

# Next.js 16 Patterns — Citly

## Core Rules

- **Server Components by default** — add `'use client'` only when required (hooks, browser APIs, interactive state)
- **Never** add `'use client'` to `page.tsx`
- **Never** add `'use client'` to `layout.tsx`
- All data fetching in pages happens server-side via `createErpNextClient()`

## Route Group Structure

```
app/
  (auth)/
    login/
      page.tsx          # /login
    register/
      page.tsx          # /register
    forgot-password/
      page.tsx          # /forgot-password
    layout.tsx          # minimal auth layout (no sidebar)
  (dashboard)/
    layout.tsx          # sidebar + topbar layout
    dashboard/
      page.tsx          # /dashboard
    menu/
      page.tsx          # /menu — item group & item list
      [id]/
        page.tsx        # /menu/[id] — item detail
    orders/
      page.tsx          # /orders
      [id]/
        page.tsx        # /orders/[id] — order detail
    tables/
      page.tsx          # /tables — floor plan & reservations
    inventory/
      page.tsx          # /inventory — stock overview
      purchase-orders/
        page.tsx        # /inventory/purchase-orders
    staff/
      page.tsx          # /staff — employee list
    customers/
      page.tsx          # /customers
    reports/
      page.tsx          # /reports — summary landing
      sales/
        page.tsx
      profit-loss/
        page.tsx
    settings/
      page.tsx          # /settings
  api/
    me/
      route.ts          # GET /api/me — safe user info for client
    erpnext/
      [...path]/
        route.ts        # proxy route if needed
```

## Page Pattern (Server Component)

```tsx
// app/(dashboard)/menu/page.tsx
import MenuView from "@/components/menu/MenuView";
import { createErpNextClient } from "@/lib/erpnext/client";

export const metadata = {
  title: "Menu Management — Citly",
  description: "Manage your restaurant menu items, categories, and pricing.",
};

export default async function MenuPage() {
  const client = createErpNextClient();
  const [itemGroups, items] = await Promise.all([
    client.getList("Item Group", { fields: ["name", "parent_item_group"] }),
    client.getList("Item", {
      fields: ["name", "item_name", "item_group", "standard_rate", "disabled"],
      filters: [["Item", "is_sales_item", "=", 1]],
      limit: 100,
    }),
  ]);

  return <MenuView itemGroups={itemGroups} items={items} />;
}
```

## Client Component Pattern

```tsx
// components/orders/OrderList.tsx
"use client";

import { useOrders } from "@/lib/hooks/useOrders";

export function OrderList() {
  const { data, isLoading } = useOrders({ status: "Open" });
  // ...
}
```

## Server Action Pattern

```ts
// app/(dashboard)/orders/actions.ts
"use server";
import { createErpNextClient } from "@/lib/erpnext/client";

export async function submitOrder(orderId: string) {
  const client = createErpNextClient();
  await client.call("frappe.client.submit", { doctype: "Sales Order", name: orderId });
}
```

## Environment Variables

```ts
// Always use in server code only (no NEXT_PUBLIC_ prefix for secrets)
process.env.ERPNEXT_API_KEY
process.env.ERPNEXT_API_SECRET

// Safe for both server and client
process.env.NEXT_PUBLIC_ERPNEXT_URL  // e.g. http://104.248.237.122
```

## Error Handling

```tsx
// Always wrap async pages in try/catch, return error UI
export default async function SomePage() {
  try {
    const data = await client.getList(...);
    return <SomeView data={data} />;
  } catch (error) {
    return <ErrorState message="Failed to load data" />;
  }
}
```
