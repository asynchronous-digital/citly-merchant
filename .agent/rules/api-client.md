---
trigger: glob
---

# API Client Rules

- All backend access goes through `lib/api-client.ts`
- Base URL env var: `BASE_API_URL`
- Return typed data or throw typed `ApiError`

## Boundaries

