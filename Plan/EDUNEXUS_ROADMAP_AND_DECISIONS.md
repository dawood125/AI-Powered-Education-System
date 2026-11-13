# EduNexus — Shared Roadmap, Decision Log & Backlog

**Working document for Dawood (learner) + AI mentor.** Updated as we go.
Source plans: `uploads/EDUNEXUS_PRODUCT_AND_TECHNICAL_PLAN.md`, `uploads/EDUNEXUS_AI_MENTOR_INSTRUCTIONS.md`

---

## 1. Locked decisions (confirmed with Dawood on 2026-11-02)

| # | Decision | Status |
|---|----------|--------|
| D1 | Product: **EduNexus** — multi-tenant SaaS school management platform, first market = private schools in Pakistan | Confirmed |
| D2 | Architecture: **modular monolith + background workers** (no microservices at start) | Confirmed |
| D3 | Tenancy: **central Control Plane DB + database-per-tenant Data Plane**; tenant resolved from validated hostname/session, never from request input | Confirmed direction; trade-offs to be taught via ADR-002 |
| D4 | Stack: **Next.js (App Router) frontend + Node.js/Express backend + MongoDB**. Tenant DB = one Mongo database per school on a single cluster | **Chosen by Dawood** |
| D5 | Onboarding: self-registration → email verification → choose paid plan → pay → server-side payment verification → async provisioning → subdomain → active workspace | Confirmed |
| D6 | **No free trial at launch**; plans Basic/Premium/Advanced (names illustrative); monthly + yearly billing; data-driven entitlements enforced on backend | Confirmed |
| D7 | Non-payment: reminders (7/3/1 days + expiry day) → grace → limited access → suspension → retention → deletion. 90-day retention is a **proposal only** | Confirmed as direction |
| D8 | Payments: **Stripe in test/sandbox mode with test API keys for development now**; provider abstraction so a real provider can be swapped in later | Chosen by Dawood — see caveat below |
| D9 | Time budget: **15+ hrs/week, no hard deadline** → deep-learning pace, small tasks per session | Confirmed |
| D10 | Learning mode: Dawood handwrites business/auth/tenant/billing logic; mentor may generate repetitive UI + boilerplate, always with explanation + review | Confirmed |

### ⚠ Verified fact about Stripe (researched 2026-11-02)
- **Pakistan is NOT on Stripe's supported merchant-countries list as of Oct 2026** (checked against multiple current sources; Stripe supports ~46 countries, Pakistan is neither supported nor preview).
- A Pakistan-registered business **cannot open a live Stripe merchant account** or receive PKR settlements directly. Workarounds (foreign LLC via Stripe Atlas, etc.) are legal/tax decisions for the business later — **not** something to decide now.
- **Stripe test mode / sandbox with test API keys is fine for development and learning now.** Cards like `4242 4242 4242 4242` work in test mode.
- Implication: we build a **PaymentProvider interface** (initiate payment, verify webhook, handle events idempotently). `StripeAdapter` (sandbox) is our dev adapter. Before real commercial launch, a local provider (PayFast, Safepay, JazzCash, Easypaisa, bank gateway, Raast) gets added as another adapter — that research happens in Phase 3, from official docs.
- Local alternatives for later launch (verified 2026): PayFast, Safepay, XPay, JazzCash merchant, Easypaisa merchant, bank gateways (HBL/Alfalah), Raast.

---

## 2. Recommended MVP boundary (mentor recommendation — Dawood delegated: "whatever is best for learning")

> **MVP = one vertical slice that proves the hardest parts end-to-end:**
> A school can self-register on the public site → verify email → pick a plan → pay with a Stripe **test** card → payment verified by webhook (idempotent) → its own Mongo database is provisioned automatically → subdomain mapped → school admin logs in on its subdomain → creates academic year, classes, and students → sees a basic dashboard.
>
> Everything else (attendance, exams, fees module, HR, timetable, library, transport, inventory, parent/teacher portals, AI, workflows) is **post-MVP**.

Why this boundary: it covers the highest-risk, most instructive parts (multi-tenancy, tenant resolution, payments, provisioning jobs, RBAC, isolation tests) while staying demo-able.

---

## 3. Phase roadmap & backlog (epics → tasks)

Progress checklist: `[ ]` = not started, `[~]` = in progress, `[x]` = done + tested

### Phase 0 — Discovery & system design (docs only, no app code yet)
- [ ] P0.1 MVP boundary written down as use cases + acceptance criteria
- [ ] P0.2 Domain model sketch (Control Plane entities vs Data Plane entities)
- [ ] P0.3 ADR-001: modular monolith vs microservices
- [ ] P0.4 ADR-002: tenancy models compared (shared schema / DB-per-tenant / hybrid) → DB-per-tenant chosen with reasons
- [ ] P0.5 ADR-003: stack choice (Next.js + Express + MongoDB) and why
- [ ] P0.6 Threat/risk list: tenant isolation, payments, child data, secrets

### Phase 1 — Platform foundation
- [x] P1.1 Repo + folder structure (modular monolith: `modules/` per bounded context), `.env.example`, README, Git branching rules
- [x] P1.2 Central platform DB connection (Mongoose), config validation, structured logging + correlation IDs, global error handler
- [x] P1.3 `/health` + readiness endpoint; basic CI (lint + tests) on GitHub Actions
- [x] P1.4 Tenant registry model (central DB): tenant id, name, subdomain, db name, status, plan, secrets refs

### Phase 2 — Identity & access
- [ ] P2.1 School admin registration + email verification (token flow, expiry)
- [ ] P2.2 Login/logout: short-lived JWT access + rotating refresh tokens (hashed at rest, revocation list)
- [ ] P2.3 Password hashing (argon2/bcrypt), password reset flow
- [ ] P2.4 RBAC: roles + permissions matrix, permission checks as backend middleware
- [x] P2.5 **Tenant resolution middleware**: resolve tenant from validated subdomain → attach tenant context to every request; reject unmapped hosts
- [ ] P2.6 Tenant-scoped DB access layer: get connection for current tenant from a bounded connection cache
- [ ] P2.7 Isolation tests: prove Tenant A cannot read/write Tenant B (cross-tenant access attempts must fail)

### Phase 3 — Billing, onboarding & provisioning (Stripe sandbox)
- [ ] P3.1 Plan catalogue (data-driven): plan code, prices monthly/yearly (test amounts), feature entitlements, limits
- [ ] P3.2 PaymentProvider interface + StripeAdapter (sandbox): create checkout session, construct webhook event from signature
- [ ] P3.3 Invoice + payment-attempt models (central DB); store provider event IDs
- [ ] P3.4 Webhook endpoint: signature verification + **idempotency** (same event processed once) + audit trail
- [ ] P3.5 Subscription state machine: pending → active → past_due → expired → suspended → cancelled (+ tenant access state separate from billing state)
- [ ] P3.6 Provisioning job (durable, retry w/ backoff, idempotent, DLQ): create tenant DB → run migrations → seed defaults/roles → map subdomain → set active; compensation/rollback on failure
- [ ] P3.7 Renewal reminder jobs (7/3/1/0 days), dedup + delivery tracking; post-expiry sequence jobs (grace → limited → suspended → retention)
- [ ] P3.8 Super Admin console (API + minimal UI): tenant directory, plans, subscriptions, provisioning health

### Phase 4 — School core (first data-plane modules)
- [ ] P4.1 School settings (timezone, grading config seeds)
- [ ] P4.2 Academic years, terms, classes, sections, subjects (tenant DB)
- [ ] P4.3 Students + guardians CRUD with validation + admission numbers + documents (metadata only at first)
- [ ] P4.4 Basic school admin dashboard (counts, charts) — permission-aware

### Phase 5+ — Post-MVP (later releases)
- [ ] Attendance, teacher/parent portals, homework, exams & report cards
- [ ] Fees & finance (school-level), HR/payroll, timetable, library, transport, inventory
- [ ] Communication/notifications, analytics, AI assistant + question drafts + early warnings, workflow engine + visual builder
- [ ] Phase 8: security review, load tests, backup/restore drills, monitoring, production deploy, pilot schools

---

## 4. Architecture Decision Records (to write during Phase 0)

- **ADR-001** Modular monolith vs microservices → monolith + workers
- **ADR-002** Tenancy model comparison → database-per-tenant (current direction)
- **ADR-003** Stack: Next.js + Express + MongoDB vs Laravel + MySQL
- **ADR-004** Payment provider abstraction; Stripe sandbox for dev; local gateway research before launch
- **ADR-005** Job queue: durable in-DB job queue for MVP (simple, no extra infra) vs Redis/BullMQ later — revisit when scale demands
- **ADR-006** Auth: JWT access + rotating refresh tokens vs session cookies — decide in Phase 2 with trade-offs
- **ADR-007** File storage: S3-compatible object storage with tenant-aware keys (later phase)

---

## 5. Open questions / assumptions (do NOT silently decide)

- Exact plan prices, currency (PKR vs USD for Stripe sandbox), limits, entitlement matrix
- Whether tenant DBs = separate Mongo databases in one Atlas cluster (current assumption) vs separate clusters
- Plan upgrade/downgrade rules; custom domains as add-on?
- Exact grace/suspension/deletion durations (90-day retention = proposal only)
- Legal/privacy/child-data/PEC (Pakistan) requirements before commercial launch — research before launch, not now
- Real payment provider for launch in Pakistan (research official docs in Phase 3)
- Redis: only when a measured need exists (rate limits, real BullMQ queue, realtime)

---

## 6. Session log

### 2026-11-02 — Check-question review (before Task 1)
- Q1 (why resolve tenant from hostname, not request tenantId): Dawood answered "tenant id can be compromised, hostname cannot easily."
  - Verdict: right instinct, needs one correction. A hostname is NOT automatically safe — a raw HTTP request can set any `Host` header. What makes hostname resolution trustworthy is: (a) HTTPS, (b) the hostname is validated against the central tenant registry and only **mapped** subdomains are accepted, (c) unknown hosts are rejected. A `tenantId` in a body/query is arbitrary user input and is never trusted (IDOR risk).
- Q2 (central DB vs tenant DB): Dawood answered central = tenant registration + super admin; tenant DB = school's own business data.
  - Verdict: correct. Control Plane = tenant registry, plans, subscriptions, invoices, payment refs, domain mappings, provisioning status, platform audit, super admin. Data Plane (per tenant DB) = students, guardians, staff, classes, attendance, exams, fees, settings, school-level audit.
- MVP boundary confirmed by delegation ("whatever is best for learning"): register → verify → plan → Stripe test payment → idempotent webhook → auto-provision tenant DB → subdomain → login → classes/students → basic dashboard.

## 7. Working rules (from mentor instructions)

1. Teach → check understanding → small task → learner codes → progressive hints → review → close with recap + next task.
2. Dawood handwrites: auth, tenant resolution/isolation, subscription state machine, webhook idempotency, validation, provisioning logic, permission checks. Mentor may generate: UI markup, styling, boilerplate config, scaffolding, fixtures — always explained and reviewed.
3. Nothing is "done" until acceptance criteria pass and tests run.
4. Small Git commits; `.env.example` never contains real secrets; README stays current.
5. Simple English; one concept at a time; Urdu/Roman Urdu explanations allowed on request (code terms stay English).
