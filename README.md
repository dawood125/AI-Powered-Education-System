# AI-Powered Education System (EduNexus)

A multi-tenant SaaS school management and AI-assisted education platform designed for schools.

## Architecture & Foundation
- **Architecture**: Modular Monolith + Worker pattern
- **Tenancy Model**: Control Plane (platform DB) + Isolated Data Plane (DB-per-tenant)
- **Backend Stack**: Node.js, Express, TypeScript, MongoDB (Mongoose)

## Modules
- **Foundation & Identity**: Health checks, tenant resolution, RBAC, short-lived JWTs with rotating refresh tokens
- **Onboarding & Billing**: Plan catalogue, Stripe checkout/webhook integration with idempotent processing
- **School Operations**: Academic calendars, classes, sections, students, teachers, and role-based portals
