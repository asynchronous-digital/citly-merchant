---
trigger: glob
glob: "**/*.ts,**/*.tsx"
---

# Next.js 16 Patterns

- Server Components by default.
- Add `'use client'` only when required for hooks, browser APIs, or client-only UI behavior.
- Never add `'use client'` to `page.tsx`.

## Page pattern

```tsx
import SomeView from "@/components/SomeView";
import { createApiClient } from "@/lib/api-client";

export default async function SomePage() {
  const api = createApiClient({
    baseUrl: process.env.SYNERGY_API_URL!,
  });

  const data = await api.getSomething();

  return <SomeView data={data} />;
}
```
