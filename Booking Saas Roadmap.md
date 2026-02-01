# Booking & Scheduling SaaS — Full Roadmap

> Goal: Build a sellable, production-ready booking and scheduling SaaS for local businesses (barbers, salons, tutors, clinics, etc.). This roadmap covers Phase 1 (MVP) through Phase 4 (scale), technical decisions, deployment, monetization, and launch steps — now including full route structure and finalized schema.

---

## ✅ Core Decisions You Already Made

- **Auth:** Stack Auth (managed / open-source).
- **Database:** PostgreSQL.
- **Storage:** (to be added) Supabase Storage for business images and uploads.
- **Stack:** Next.js (App Router), Prisma ORM, Tailwind CSS, Node.

> ⚙️ Keep Stack Auth as the single source of truth for identity and roles. Supabase will be added later for storage and optional Postgres hosting.

---

## Phase 0 — Preparation (1–3 days)

1. **Project scaffold**

    ```bash
    npx create-next-app@latest --typescript --app
    npm install prisma @prisma/client tailwindcss stack-auth dotenv zod
    ```

    > Supabase setup (to be added later):

    ```bash
    npm install @supabase/supabase-js
    ```

2. **Environment Variables** Create `.env.local` with at minimum:

    ```bash
    DATABASE_URL=
    STACK_AUTH_API_KEY=
    ```

3. **Git Setup**
    - Initialize Git and create `main` and `dev` branches.

---

## Phase 1 — MVP (2–3 weeks)

### 🎯 Core Features

- Business onboarding (sign-up, choose role)
- Service CRUD (name, duration, price)
- Business hours & availability
- Public booking page per business
- Booking CRUD + statuses (PENDING → CONFIRMED → COMPLETED / CANCELLED)
- Email confirmations (Resend / Nodemailer)
- Basic admin dashboard for management

---

### 🗂️ Full Route Structure (App Router)

> Each role has its own layout and protected routes. Keep middleware to gate role-access.

#### 🌍 Public Routes

- `/` — Landing page with marketing content and CTAs (`app/page.tsx`)
- `/onboard` — Shown after signup; user selects role (Customer or Business) (`app/onboard/page.tsx`)
- `/sign-in` — Stack Auth sign-in page (`app/(auth)/sign-in/page.tsx`)
- `/sign-up` — Stack Auth sign-up page (`app/(auth)/sign-up/page.tsx`)
- `/about` — Info about the platform (`app/(public)/about/page.tsx`)
- `/support` — Contact/help center (`app/(public)/support/page.tsx`)

---

#### 👤 Customer Routes

- `/customer` — Customer home dashboard (greeting, next booking, quick links). (`app/customer/page.tsx`)
- `/customer/bookings` — All bookings by the user. (`app/customer/bookings/page.tsx`)
- `/customer/bookings/[id]` — Booking details (status, service info, cancel/reschedule). (`app/customer/bookings/[id]/page.tsx`)
- `/customer/businesses` — Browse businesses. (`app/customer/businesses/page.tsx`)
- `/customer/businesses/[id]` — Business detail + services offered. (`app/customer/businesses/[id]/page.tsx`)
- `/customer/services` — List of services across businesses. (`app/customer/services/page.tsx`)
- `/customer/services/[id]` — Service detail. (`app/customer/services/[id]/page.tsx`)
- `/customer/services/[id]/book` — Booking form for a specific service. (`app/customer/services/[id]/book/page.tsx`)

> Customer flow: Sign up → choose role → browse → book → manage bookings.

---

#### 🏢 Business Routes

- `/business` — Business home (overview + quick stats). (`app/business/page.tsx`)
- `/business/dashboard` — Analytics: bookings, revenue, top services, trends. (`app/business/dashboard/page.tsx`)
- `/business/bookings` — List of incoming bookings. (`app/business/bookings/page.tsx`)
- `/business/bookings/[id]` — Booking detail and actions (accept/reject/manage). (`app/business/bookings/[id]/page.tsx`)
- `/business/services` — Manage all services. (`app/business/services/page.tsx`)
- `/business/services/new` — Add a new service. (`app/business/services/new/page.tsx`)
- `/business/services/[id]` — View one service. (`app/business/services/[id]/page.tsx`)
- `/business/services/[id]/edit` — Edit a service. (`app/business/services/[id]/edit/page.tsx`)
- `/business/settings` — Business hours, contact info, profile. (`app/business/settings/page.tsx`)

**Dashboard metrics (MVP to polish):**

- Total bookings (period)
- Confirmed vs pending
- Revenue (period)
- Top services
- Upcoming bookings

---

#### 🛠️ Admin Routes

- `/admin/dashboard` — Platform overview (users, businesses, bookings). (`app/admin/dashboard/page.tsx`)
- `/admin/users` — List and manage users. (`app/admin/users/page.tsx`)
- `/admin/users/[id]` — User detail. (`app/admin/users/[id]/page.tsx`)
- `/admin/businesses` — List businesses. (`app/admin/businesses/page.tsx`)
- `/admin/businesses/[id]` — Business detail. (`app/admin/businesses/[id]/page.tsx`)

---

#### ⚙️ Utility Routes

- `/handler/[...stack]` — Stack Auth handler for callbacks/webhooks. (`app/handler/[...stack]/page.tsx`)
- `/api/*` — API endpoints (business CRUD, service CRUD, booking actions, webhooks).

---

### 🧱 Updated Prisma Schema

```prisma
model User {
    id         String     @id @default(uuid())
    name       String?
    email      String     @unique
    role       Role       @default(CUSTOMER)
    bookings   Booking[]
    businesses Business[] @relation("UserBusinesses")
}

model Business {
    id       String   @id @default(uuid())
    name     String
    hours    Json
    ownerId  String
    owner    User     @relation("UserBusinesses", fields: [ownerId], references: [id])
    services Service[]
}

model Service {
    id         String   @id @default(uuid())
    name       String
    duration   Int
    price      Float
    businessId String
    business   Business @relation(fields: [businessId], references: [id])
    bookings   Booking[]
}

model Booking {
    id        String        @id @default(uuid())
    date      DateTime
    status    BookingStatus @default(PENDING)
    createdAt DateTime      @default(now())
    userId    String?
    user      User?         @relation(fields: [userId], references: [id])
    serviceId String
    service   Service       @relation(fields: [serviceId], references: [id])
}

enum Role {
    CUSTOMER
    BUSINESS
    ADMIN
}

enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
}
```

---

### 🧠 Booking Logic

- **Availability Check:** Verify business hours and existing bookings to prevent overlaps.
- **Atomic Transactions:** Use Prisma transactions when creating bookings.
- **Timezone Handling:** Store UTC in DB; convert on frontend.
- **Status Flow:** PENDING → CONFIRMED → COMPLETED / CANCELLED.

---

### ✉️ Notifications

- Email confirmation on booking creation/update/cancel (Resend or Nodemailer).
- Future upgrade: SMS reminders (Twilio / Africa’s Talking) and cron-based reminder worker.

---

## Phase 2 — Polish & Reliability (4–6 weeks)

- Calendar UI for businesses.
- Rescheduling & booking history for customers.
- Staff accounts & assignment.
- Server-side validation (`zod`).
- Unit tests for core booking logic (availability, race conditions).
- Stripe integration for paid bookings & subscriptions.
- Scheduled reminders (worker or cron).

---

## Phase 3 — Growth (2–3 months)

- Multi-tenant separation/improvements.
- Analytics: revenue, bookings/day, customer retention.
- Coupons & promotions.
- Staff shift scheduling features.
- Integrations: Google Calendar, Zoom, payment gateways.

---

## Phase 4 — Scale & Operations

- Background workers (BullMQ/Redis or managed functions).
- Observability (Sentry, Prometheus, centralized logs).
- DB autoscaling, read replicas, backups.
- Data export & deletion workflows for compliance.

---

## Deployment & Hosting

- **Frontend + API:** Vercel (preview branches for staging).
- **Database:** Neon / Railway (Supabase later if you want integrated storage).
- **Storage:** Supabase Storage (future setup).
- **Workers:** Vercel background functions or Railway cron/worker.

---

## Auth Integration — Stack Auth + Future Supabase

- Stack Auth manages identity and roles.
- Supabase will be used later for storage (and optionally Postgres hosting).
- Do NOT mix auth providers.
- Use Stack Auth callbacks/middleware to redirect users to `/onboard` after first login.

---

## Testing & QA

- Unit tests for booking overlap logic and availability.
- E2E tests with Playwright or Cypress for booking flows.
- Test timezone conversions, race conditions, and edge cases.

---

## Pricing & Go-To-Market

| Tier    | Features                             | Price       |
| ------- | ------------------------------------ | ----------- |
| Free    | 1 location, limited bookings         | $0          |
| Pro     | Unlimited bookings + basic analytics | $10 / month |
| Premium | Team accounts + advanced analytics   | $25 / month |

**Marketing plan:**

- Manual outreach to local businesses (WhatsApp, email, in-person demos).
- Free trials and onboarding help.
- Collect early feedback, iterate quickly, aim for 10 paying customers first.

---

## Next Immediate Steps (what I'll help you build first)

1. Scaffold route folders + layouts for `customer`, `business`, and `admin`.
2. Create Prisma schema + initial migration.
3. Integrate Stack Auth and server session flow.
4. Build Business CRUD, Service CRUD, Booking creation endpoint with availability checks.
5. Create public booking page and initial dashboards.

---

## Launch Checklist

- ***

    _End of roadmap — focus on the MVP: scaffold routes, seed test data, harden availability logic, then ship a simple, reliable product._
