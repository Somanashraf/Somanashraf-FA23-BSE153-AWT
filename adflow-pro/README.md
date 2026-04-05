# AdFlow Pro

A production-style **sponsored listing marketplace** built as an advanced full-stack mid-term project.

Clients submit paid listings, moderators review content, administrators verify payments, and only approved ads go live for a package-based duration — with automated expiry, ranking, and analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & API | Next.js 15 (App Router) |
| Database | Supabase Postgres |
| Authentication | JWT (HTTP-only cookies) |
| Validation | Zod |
| Styling | Tailwind CSS |
| Deployment | Vercel + Supabase |

---

## Features

- **Multi-role RBAC** — Client, Moderator, Admin, Super Admin
- **Full ad lifecycle** — Draft → Review → Payment → Publish → Expire (11 states)
- **Package engine** — Basic / Standard / Premium with weight-based ranking
- **External media normalization** — YouTube thumbnails, GitHub raw, CDN URLs
- **Payment proof workflow** — Transaction ref, screenshot URL, duplicate detection
- **Ranking algorithm** — Featured boost + package weight + freshness + admin boost
- **6 cron jobs** — Publish scheduled, expire ads, expiry notifications, DB heartbeat, analytics snapshots, premium rank refresh
- **Analytics dashboard** — Revenue, moderation rates, taxonomy charts (Recharts)
- **Audit trail** — Every state change logged to `audit_logs` and `ad_status_history`
- **In-app notifications** — Workflow events trigger real-time alerts per user

---

## Local Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`, then `supabase/seed.sql`

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-long-random-secret
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install and seed

```bash
npm install
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

Password for all accounts: **`Password123!`**

| Email | Role |
|---|---|
| client@demo.local | Client |
| client2@demo.local | Client |
| mod@demo.local | Moderator |
| admin@demo.local | Admin |
| super@demo.local | Super Admin |

---

## Ad Workflow

```
Draft → Submitted → Under Review → Payment Pending → Payment Submitted
     → Payment Verified → Scheduled → Published → Expired → Archived
```

Each transition is enforced server-side via a role-based transition matrix. All changes are written to `audit_logs` and `ad_status_history`.

---

## API Documentation

Import `docs/AdFlow-Pro.postman_collection.json` into Postman.

All authenticated routes use the cookie set by `POST /api/auth/login`. Enable cookie jar in Postman for authenticated requests.

---

## Cron Jobs

| Endpoint | Schedule | Purpose |
|---|---|---|
| `/api/cron/publish-scheduled` | Every hour | Publish ads whose scheduled time has arrived |
| `/api/cron/expire-ads` | Daily | Expire ads past their end date |
| `/api/cron/expiring-notify` | Daily | Notify users 48h before expiry |
| `/api/cron/health-db` | Every 5 min | DB heartbeat log |
| `/api/cron/analytics-snapshot` | Daily | Snapshot listing metrics |
| `/api/cron/refresh-premium-rank` | Every 3 days | Refresh premium ad rank scores |

Cron routes accept `Authorization: Bearer <CRON_SECRET>` for manual/local triggers.

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages: home, explore, ad detail, auth
│   ├── dashboard/         # Role dashboards: client, moderator, admin, super, analytics, health
│   └── api/               # REST API routes
├── components/            # Shared UI components
├── lib/                   # Auth, ranking, media normalization, validators, workflow
├── server/                # Server-only: audit logging, notifications, home queries
└── types/                 # Shared TypeScript types
supabase/                  # Schema SQL + static seed data
scripts/                   # Demo data seed script
docs/                      # Postman collection
```

---

## Database Tables

`users` · `seller_profiles` · `packages` · `categories` · `cities` · `ads` · `ad_media` · `payments` · `notifications` · `audit_logs` · `ad_status_history` · `learning_questions` · `system_health_logs` · `analytics_snapshots`

---

## Security Notes

- Service role key is used **server-side only** inside Route Handlers and Server Components
- JWT stored in HTTP-only cookies — not accessible from JavaScript
- All protected routes validated via middleware + `requireRoles()` on every handler
- Duplicate transaction references blocked at DB constraint level
