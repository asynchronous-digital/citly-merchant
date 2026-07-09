# Citly — Restaurant Management Platform: Project Requirements

> **Version**: 1.0 | **Last Updated**: 2026-07-09  
> **Backend**: ERPNext 16 (`http://104.248.237.122/`)  
> **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4  
> **Scope**: Owner/manager dashboard only (no customer-facing portal in this phase)

---

## 1. Platform Overview

Citly is a SaaS web application for restaurant owners and managers. It provides a clean, modern dashboard interface on top of ERPNext 16, letting operators manage every aspect of their restaurant without needing to know ERPNext.

### Goals
- Abstract ERPNext complexity behind a restaurant-specific UI
- Provide real-time visibility into orders, revenue, stock, and staff
- Enable multi-branch management (architecture-ready, single branch active in v1)
- Mobile-responsive for on-floor manager use

### User Types

| Role | Access Level |
|---|---|
| **Restaurant Owner** | Full access to all modules, settings, financials |
| **Manager** | Orders, menu, staff, inventory — no financial settings |
| **Cashier** | Orders, customers, daily closing only |
| **Kitchen Staff** | KOT (kitchen order tickets) view only |

---

## 2. Authentication & Onboarding

### 2.1 Registration

**Route**: `/register`

**Form Fields**:
- Full name
- Email address
- Phone number (with country code)
- Restaurant name
- Password + confirm password
- Agreement to terms checkbox

**Flow**:
1. Create `User` in ERPNext (`POST /api/resource/User`)
2. Create `Company` (restaurant) linked to the user
3. Auto-login via token auth
4. Redirect to `/onboarding` for restaurant profile setup

**ERPNext API**:
```
POST /api/resource/User
POST /api/resource/Company
POST /api/method/login
GET  /api/method/frappe.client.get_api_key
```

---

### 2.2 Login

**Route**: `/login`

**Form Fields**: Email, Password, "Remember me"

**Flow**:
1. `POST /api/method/login` with credentials
2. Fetch API key/secret for token auth
3. Store as httpOnly cookies: `citly_api_key`, `citly_api_secret`, `citly_user`
4. Redirect to `/dashboard`

---

### 2.3 Forgot Password

**Route**: `/forgot-password`

- Email input → `POST /api/method/frappe.core.doctype.user.user.reset_password`
- Show success message; user receives ERPNext reset email

---

### 2.4 Onboarding Wizard

**Route**: `/onboarding` (shown only on first login)

**Steps**:
1. **Restaurant Profile** — name, logo, address, phone, cuisine type, timezone
2. **Operating Hours** — open/close time per day, weekly schedule
3. **Table Setup** — number of tables, sections (indoor/outdoor/bar)
4. **Menu Categories** — add initial item groups (appetizers, mains, desserts, drinks)
5. **First Menu Item** — optional quick-add
6. **Done** — redirect to `/dashboard`

---

## 3. Dashboard

**Route**: `/dashboard`

### 3.1 KPI Cards (Top Row)

| Card | Metric | ERPNext Source |
|---|---|---|
| Today's Revenue | Sum of today's Sales Invoices | `Sales Invoice` |
| Open Orders | Count of Sales Orders with status "Open" | `Sales Order` |
| Tables Occupied | Occupied table count | Custom table tracking |
| Low Stock Alerts | Items below re-order level | `Bin` (stock ledger) |

### 3.2 Revenue Chart

- Line/area chart: last 7 days or 30 days revenue
- Breakdown: Dine-in vs Takeaway vs Delivery
- Data from: `Sales Invoice` filtered by date range and order type
- Library: Recharts

### 3.3 Recent Orders Panel

- Last 10 orders (all types)
- Columns: Order #, Table/Type, Items (count), Amount, Status, Time
- Click → navigate to `/orders/[id]`

### 3.4 Live Alerts

- New orders (polling or SSE)
- Low stock items
- Pending reservations

### 3.5 Quick Actions

- + New Order
- + New Reservation
- View Open KOTs
- Daily Closing

---

## 4. Menu Management

**Route**: `/menu`

### 4.1 Item Groups (Categories)

ERPNext DocType: `Item Group`

**List view**: Grid or list of categories with item count badges  
**Actions**: Create, rename, reorder, deactivate

**Fields**:
- Group name (e.g., "Starters", "Main Course", "Beverages")
- Parent group (for sub-categories)
- Display order
- Active/inactive

**ERPNext API**:
```
GET  /api/resource/Item Group
POST /api/resource/Item Group
PUT  /api/resource/Item Group/{name}
```

---

### 4.2 Menu Items

ERPNext DocType: `Item`

**List view**: Filterable by category, with search  
**Columns**: Image, Name, Category, Price, Availability toggle, Status

**Item Form Fields**:
- Item name & description
- Category (Item Group)
- Item code (auto-generated or manual)
- Price (standard rate — `Item Price` DocType)
- Currency
- Unit of measure (Nos, Plate, Glass, etc.)
- Preparation time (minutes) — custom field
- Item image
- Availability: Always / Time-based (with from/to time) / Disabled
- Tags (spicy, vegan, gluten-free, chef's special, etc.)
- Is sales item: Yes/No

**ERPNext API**:
```
GET    /api/resource/Item
POST   /api/resource/Item
PUT    /api/resource/Item/{name}
GET    /api/resource/Item Price
POST   /api/resource/Item Price
```

---

### 4.3 Item Variants

ERPNext uses `Item Variant` for variations (size, spice level, etc.)

**Examples**: Small / Medium / Large, Mild / Medium / Spicy  
**Each variant** has its own price via `Item Price`

---

### 4.4 Modifiers / Add-ons

Custom approach using `Item Bundle` or a custom DocType: `Menu Modifier`

**Examples**: Extra cheese (+$1.50), Extra sauce (+$0.50), No onions (free)

**Fields**:
- Modifier name
- Price adjustment (+/-)
- Is required (must pick one) / optional (can add multiple)
- Modifier group name (e.g., "Choose your sauce")

---

### 4.5 Pricing

- Base price via `Item Price` (price list: "Standard Selling")
- Happy hour pricing: time-based price rules via `Pricing Rule`
- Special/promotional pricing via `Promotional Scheme`

---

## 5. Order Management

**Route**: `/orders`

### 5.1 Order Types

| Type | ERPNext Field | Description |
|---|---|---|
| Dine-In | custom `order_type` = "Dine In" | Customer seated at table |
| Takeaway | custom `order_type` = "Takeaway" | Pick up at counter |
| Delivery | custom `order_type` = "Delivery" | Home delivery |

ERPNext DocType: `Sales Order`

---

### 5.2 Order List View

**Filters**: Status (Draft / Open / To Invoice / Completed / Cancelled), Type, Date range, Table  
**Columns**: Order #, Type, Table, Customer, Items, Total, Status, Time, Actions  
**Actions per row**: View, Print KOT, Invoice, Cancel

---

### 5.3 New Order Flow

1. Select order type (Dine-In / Takeaway / Delivery)
2. If Dine-In → select table (from floor plan)
3. Add customer (optional — walk-in allowed)
4. Add items from menu (with modifiers)
5. Apply discount (if authorized)
6. Add notes per item or for the whole order
7. Submit → creates `Sales Order` in ERPNext
8. Print KOT (Kitchen Order Ticket) automatically

**ERPNext API**:
```
POST /api/resource/Sales Order
POST /api/method/frappe.client.submit
GET  /api/resource/Sales Order/{name}
```

---

### 5.4 Order Detail View

**Route**: `/orders/[id]`

- Full order summary with line items
- Status history / timeline
- Add item (if order still open)
- Remove item (manager auth required)
- Apply discount
- Print KOT
- Generate invoice → redirects to invoice creation flow

---

### 5.5 KOT (Kitchen Order Ticket)

- Printable view of the order for the kitchen
- Shows: table, order type, items with special instructions, time
- Print via browser `window.print()` with a print-specific CSS
- Or send to configured printer via ERPNext Print Server (future)

---

### 5.6 Order Status Flow

```
Draft → Submitted (Open) → To Invoice → Invoiced (Completed)
                         → Cancelled
```

---

## 6. Table Management

**Route**: `/tables`

### 6.1 Floor Plan

- Visual grid of all tables
- Color-coded status:
  - 🟢 Available (green)
  - 🔴 Occupied (red/accent)
  - 🟡 Reserved (yellow)
  - ⚪ Inactive (grey)
- Click table → view active order or create new order

### 6.2 Table Configuration

**Custom DocType**: `Restaurant Table`

**Fields**:
- Table number / name
- Section (Indoor, Outdoor, Bar, Private)
- Capacity (number of seats)
- Is active
- Current status (Available / Occupied / Reserved / Cleaning)

---

### 6.3 Reservations

**Custom DocType**: `Table Reservation`

**Fields**:
- Customer name & phone
- Date & time
- Number of guests
- Table assignment
- Special requests (notes)
- Status: Pending / Confirmed / Seated / Completed / No-Show / Cancelled

**List view**: Calendar view + list view, filterable by date  
**Actions**: Confirm, seat (converts to dine-in order), cancel, no-show

---

## 7. Inventory Management

**Route**: `/inventory`

### 7.1 Stock Overview

ERPNext DocType: `Bin` (stock levels), `Item`

**View**: List of all stock items with current quantity, reorder level, unit  
**Alerts**: Items below minimum stock level highlighted in red

**ERPNext API**:
```
GET /api/resource/Bin
GET /api/method/frappe.client.get_list (Bin with item_code, warehouse filters)
```

---

### 7.2 Stock Movements

ERPNext DocType: `Stock Entry`

**Types used**:
- `Material Receipt` — stock received from supplier
- `Material Issue` — stock consumed / wasted
- `Stock Reconciliation` — manual count correction

**List view**: Date, type, items, quantity change, reference  
**New entry form**: Type selection, item list with quantities, notes

---

### 7.3 Purchase Orders

**Route**: `/inventory/purchase-orders`

ERPNext DocType: `Purchase Order`

**Flow**:
1. Select supplier
2. Add items with quantities and rates
3. Submit → creates Purchase Order in ERPNext
4. On delivery → create `Purchase Receipt` (marks items as received into stock)

**Statuses**: Draft / Submitted / To Receive / Completed / Cancelled

---

### 7.4 Suppliers

ERPNext DocType: `Supplier`

**Fields**: Supplier name, contact, phone, email, payment terms, default currency  
**List view**: Name, type, outstanding amount, last order date

---

### 7.5 Waste Tracking

Custom flow using `Stock Entry` (type: Material Issue, reason: Waste)

**Quick waste log**: Item, quantity, reason (spoiled / dropped / expired), notes  
**Report**: Waste by item, by date, by category

---

## 8. Staff Management

**Route**: `/staff`

### 8.1 Employee List

ERPNext DocType: `Employee`

**Fields**:
- Full name, photo
- Role / designation (Owner, Manager, Cashier, Waiter, Cook, etc.)
- Department
- Date of joining
- Phone, email
- Employment status (Active / Left / On Leave)

---

### 8.2 Shifts

ERPNext DocType: `Shift Type`

**Fields**: Shift name (Morning / Evening / Night), start time, end time, max late entry (minutes)

### 8.3 Attendance

ERPNext DocType: `Attendance`

**Daily attendance view**: Mark Present / Absent / Half Day / Leave per employee  
**Monthly summary**: Attendance calendar per employee

---

### 8.4 Leave Management

ERPNext DocType: `Leave Application`

- Employee submits leave request (manager approves)
- Leave types: Annual, Sick, Unpaid
- Calendar view of approved leaves

---

### 8.5 Payroll (View Only — Phase 1)

- View payslips generated in ERPNext (`Salary Slip`)
- No payroll processing in Citly v1 — done directly in ERPNext

---

## 9. Customer Management

**Route**: `/customers`

### 9.1 Customer List

ERPNext DocType: `Customer`

**Columns**: Name, phone, email, total orders, last visit, loyalty points  
**Search**: By name, phone, email

---

### 9.2 Customer Profile

- Basic info: name, phone, email, address
- Order history (linked Sales Orders/Invoices)
- Total spend
- Visit frequency
- Notes / preferences

---

### 9.3 Loyalty (Phase 2)

- Points earned per order (configurable rate)
- Points redemption at checkout
- Tier levels: Regular / Silver / Gold / Platinum

---

## 10. Financial Reports

**Route**: `/reports`

### 10.1 Sales Summary

- Daily / weekly / monthly view
- Total revenue, average order value, order count
- Breakdown by order type (dine-in, takeaway, delivery)
- ERPNext: `Sales Invoice` aggregated

---

### 10.2 Item-wise Sales Report

- Which items sold the most (by quantity and by revenue)
- Useful for menu engineering
- ERPNext: `Sales Invoice Item` grouped by item

---

### 10.3 Daily Closing Report

- End-of-day reconciliation
- Cash / card / UPI / other payment breakdown
- Total sales, refunds, net revenue
- Compare actual vs expected
- ERPNext: `Payment Entry` + `Sales Invoice` filtered by date

---

### 10.4 Tax Report (GST / VAT)

- Tax collected per rate slab
- ERPNext: `Sales Taxes and Charges` from invoices

---

### 10.5 Profit & Loss (View)

- Simple P&L summary (revenue vs. COGS vs. expenses)
- ERPNext: `Profit and Loss Statement` report API
- View-only in Citly — no editing

---

### 10.6 Expense Tracker

ERPNext DocType: `Expense Claim` or `Journal Entry`

- Log daily expenses (electricity, gas, cleaning supplies, etc.)
- Expense category, amount, date, notes, receipt image

---

## 11. Invoice & Payments

### 11.1 Invoice Generation

ERPNext DocType: `Sales Invoice`

**Flow**:
1. From completed order → "Generate Invoice" button
2. Select payment method(s): Cash / Card / UPI / Multiple
3. Apply discount or coupon code (if any)
4. Submit invoice → updates stock if applicable
5. Print receipt

---

### 11.2 Payment Methods

- Cash
- Credit / Debit Card
- UPI / QR Code
- Online (delivery platform payouts)
- Split payments (multiple methods in one invoice)

ERPNext: `Mode of Payment`

---

### 11.3 Refunds

- Full or partial refund via `Sales Invoice` → Create Return
- Refund reason required
- Manager authorization required

---

## 12. Settings

**Route**: `/settings`

### 12.1 Restaurant Profile

- Name, logo, tagline
- Address, city, country
- Phone, email, website
- Cuisine type(s)
- Business registration number
- Tax ID / GST number

ERPNext: `Company` DocType

---

### 12.2 Operating Hours

- Open/close times per day of week
- Holiday schedule
- Auto-close orders after hours (configurable)

---

### 12.3 Payment Configuration

- Default currency
- Accepted payment modes
- Tax configuration (GST/VAT rate, inclusive/exclusive)
- Tip settings (optional, configurable percentage options)

---

### 12.4 Printer Configuration

- Receipt printer (thermal) — IP or USB
- KOT printer (kitchen) — IP or USB
- Paper size (80mm / 57mm)
- Auto-print on order submit (yes/no)

---

### 12.5 User & Role Management

- Invite team members by email
- Assign roles (Manager, Cashier, Kitchen)
- Deactivate users
- Linked to ERPNext `User` and `Role`

---

### 12.6 Notification Settings

- Low stock threshold alerts (email / in-app)
- New reservation notifications
- Daily summary email time

---

## 13. ERPNext API Mapping Summary

| Citly Feature | ERPNext DocType / Method |
|---|---|
| Restaurant profile | `Company` |
| Menu categories | `Item Group` |
| Menu items | `Item` |
| Item pricing | `Item Price` |
| Pricing rules | `Pricing Rule` |
| Sales orders | `Sales Order` |
| Sales invoices | `Sales Invoice` |
| Payments | `Payment Entry`, `Mode of Payment` |
| Customers | `Customer` |
| Employees | `Employee` |
| Attendance | `Attendance` |
| Shifts | `Shift Type` |
| Salary slips | `Salary Slip` |
| Stock levels | `Bin` |
| Stock movements | `Stock Entry` |
| Purchase orders | `Purchase Order` |
| Suppliers | `Supplier` |
| Expense logs | `Expense Claim` |
| Tables | Custom: `Restaurant Table` |
| Reservations | Custom: `Table Reservation` |
| Login | `/api/method/login` |
| Token auth | `/api/method/frappe.client.get_api_key` |

---

## 14. Environment Variables

```env
# ERPNext Backend
NEXT_PUBLIC_ERPNEXT_URL=http://104.248.237.122

# Server-side only — never expose to browser
ERPNEXT_API_KEY=your_api_key
ERPNEXT_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_NAME=Citly
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cookie security
COOKIE_SECRET=random_32_char_secret_here
```

---

## 15. Folder Structure

```
citly-nextjs/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── menu/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tables/page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   └── purchase-orders/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   └── profit-loss/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       └── me/route.ts
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   ├── dashboard/
│   ├── menu/
│   ├── orders/
│   ├── tables/
│   ├── inventory/
│   ├── staff/
│   ├── customers/
│   └── reports/
├── lib/
│   ├── erpnext/
│   │   ├── client.ts          # base API client
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   ├── staff.ts
│   │   ├── customers.ts
│   │   └── reports.ts
│   ├── hooks/
│   │   ├── useOrders.ts
│   │   ├── useMenu.ts
│   │   └── ...
│   ├── utils.ts
│   └── constants.ts
├── local-files/
│   ├── citlyworld_v10-3.html  # design reference
│   └── project-requirements.md
├── .agent/
│   └── rules/
│       ├── project-overview.md
│       ├── api-client.md
│       ├── auth.md
│       ├── design-system.md
│       ├── nextjs.md
│       └── commits.md
└── middleware.ts
```

---

## 16. Multi-Branch Architecture (Future)

> Currently: single restaurant per account. Architecture must be branch-ready.

- ERPNext `Company` = Restaurant brand
- Each branch = ERPNext `Warehouse` / custom `Branch` DocType
- User's active branch stored in session; branch switcher in topbar
- All API queries filtered by `branch` / `warehouse` field
- Reports can aggregate across branches or filter to one

---

## 17. Phase Roadmap

| Phase | Features |
|---|---|
| **Phase 1 (Current)** | Auth, Dashboard, Menu, Orders, Tables, Inventory basics, Settings |
| **Phase 2** | Staff management, Attendance, Payroll view, Customer loyalty |
| **Phase 3** | Advanced reports, Expense tracker, Supplier portal |
| **Phase 4** | Multi-branch support, Branch switcher |
| **Phase 5** | SaaS billing (Stripe), subscription plans |
| **Future** | POS terminal, customer-facing ordering app |
