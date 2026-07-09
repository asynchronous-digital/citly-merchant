---
trigger: glob
glob: "**/*.tsx,**/*.css,design-system/**"
---

# Design System Rules — Citly

## Source of Truth

The visual design is defined in `local-files/citlyworld_v10-3.html`. Read it before working on any UI.

- If a page doc exists in `design-system/pages/`, it overrides the master
- Update design-system docs when UI behavior or presentation changes

## Color Tokens (CSS Variables)

All colors **must** use CSS variables. Never hardcode hex values in components.

```css
:root {
  /* Core palette */
  --color-accent: #e84c1e;           /* Primary action, CTAs, highlights */
  --color-accent-hover: #ff7849;     /* Lighter accent for hover states */
  --color-accent-dark: #c0392b;      /* Darker accent for pressed states */

  /* Backgrounds */
  --color-bg: #0a0f1e;              /* App background (deep navy) */
  --color-surface: #0d1225;         /* Card / panel surface */
  --color-surface-elevated: #111827; /* Elevated modals, drawers */
  --color-border: rgba(255,255,255,0.07); /* Subtle borders */

  /* Text */
  --color-text-primary: #f0ece2;    /* Primary body text */
  --color-text-secondary: #94a3b8;  /* Secondary / muted text */
  --color-text-muted: #475569;      /* Placeholder / disabled text */
  --color-text-faint: #334155;      /* Very faint labels */

  /* Status colors */
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #fbbf24;
  --color-info: #60a5fa;

  /* Status pill backgrounds */
  --color-success-bg: rgba(34,197,94,0.1);
  --color-error-bg: rgba(239,68,68,0.1);
  --color-warning-bg: rgba(251,191,36,0.1);
  --color-info-bg: rgba(96,165,250,0.1);
}
```

## Typography

| Role | Font | Usage |
|---|---|---|
| Display / headings | `Bebas Neue` | Page titles, KPI numbers, logo |
| Body / UI | `DM Sans` | All body text, labels, buttons |
| Monospace / data | `DM Mono` | Prices, IDs, timestamps, codes |

Google Fonts import (already in layout):
```
Bebas Neue + DM Sans (opsz 9..40, wght 400;500;600;700) + DM Mono (wght 400;500)
```

## Layout Structure

```
┌─────────────────────────────────────┐
│  Fixed Topbar (height: 56px)        │
├──────────┬──────────────────────────┤
│  Fixed   │  Scrollable Content      │
│  Sidebar │  Area (flex: 1)          │
│ (240px)  │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

- **Sidebar**: fixed, 240px wide, dark `var(--color-surface)` background
- **Topbar**: fixed, full-width, `var(--color-bg)` with bottom border
- **Content**: `padding: 20px`, scrollable, `padding-bottom: 80px` (mobile nav clearance)
- **Cards**: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 12px`

## Component Patterns

### KPI Card
- Dark glass card with accent number in `Bebas Neue`
- Subtle gradient or border-left accent for visual hierarchy

### Data Table
- `background: var(--color-surface)`, rows with `rgba(255,255,255,0.03)` hover
- Status badges: pill-shaped, color-coded via CSS var

### Buttons
- Primary: `background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))`
- Secondary: `background: rgba(255,255,255,0.06)`, `border: 1px solid var(--color-border)`
- Danger: `background: rgba(239,68,68,0.15)`, `color: var(--color-error)`

### Form Inputs
- `background: rgba(255,255,255,0.06)`, `border: 1px solid var(--color-border)`, `border-radius: 9px`
- Focus: `border-color: rgba(232,76,30,0.5)`

## Animation Guidelines

- Hover transitions: `transition: all 0.15s ease`
- Page transitions: fade + slight translateY (0 → 10px, opacity 0 → 1)
- Loading states: skeleton shimmer using `var(--color-surface-elevated)`
- Micro-animations: scale(0.96) on button press
