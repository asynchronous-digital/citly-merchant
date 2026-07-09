---
trigger: glob
---

# Auth Rules

- Do not add NextAuth/Auth.js or Authentik-specific setup by default.
- Follow the backend auth/session contract.
- Do not copy the monorepo `session.companyAccess` pattern.
- Do not assume `/sign-in` or `/unauthorized` routes unless the backend flow requires them.