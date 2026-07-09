---
trigger: always_on
---

# Commit Message Conventions

Format: `<type>[optional scope]: <description>`

## Types

`feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

## Scopes

### Auth & Core
`auth` · `middleware` · `api-client` · `settings`

### Feature Modules
`dashboard` · `menu` · `orders` · `tables` · `inventory` · `staff` · `customers` · `reports`

### Sub-features
`purchase-orders` · `stock` · `attendance` · `reservations` · `kot`

### Infrastructure
`design-system` · `layout` · `navigation` · `env` · `deps`

## Examples

```
feat(menu): add item variant management with pricing tiers
fix(orders): correct KOT status sync with ERPNext Sales Order
feat(auth): implement ERPNext token login with httpOnly cookie
refactor(api-client): extract ERPNext error parsing to shared util
feat(inventory): add low-stock alert threshold configuration
fix(dashboard): resolve revenue chart date range filter not applying
chore(deps): upgrade TanStack Query to v5.x
docs(auth): document ERPNext token refresh strategy
```