# EduNexus --- Product Vision, Requirements & Technical Build Plan

**Document type:** Product and engineering blueprint\
**Status:** Working plan --- decisions marked "proposed" are not final\
**Audience:** Developer, AI coding/teaching agent, future product team\
**Initial market:** Private schools in Pakistan\
**Working product name:** EduNexus

------------------------------------------------------------------------

## 1. Product vision

EduNexus is a multi-tenant SaaS school management and intelligence
platform. It will connect school administrators, principals, teachers,
students, and parents through one configurable system. It should reduce
manual school administration, make information easier to access, and
help school leaders understand what is happening through useful reports
and AI-assisted insights.

The first target market is private schools in Pakistan. The product
should be designed so it can later support other regions, currencies,
languages, academic systems, and school types without rewriting its
core.

This is intended to become a serious, potentially commercial product for
a software house --- not just a tutorial CRUD application. It should
also be a substantial portfolio and learning project that demonstrates
practical full-stack development, system design, multi-tenancy,
security, background processing, AI integration, testing, cloud
deployment, and DevOps.

## 2. Product goals

1.  Provide a complete but modular school-management platform.
2.  Support many independent schools (tenants) on one SaaS platform.
3.  Keep each school's operational data isolated.
4.  Let schools register themselves, choose a plan, pay, and receive a
    provisioned school workspace.
5.  Allow the platform Super Admin to manage tenants, plans,
    subscriptions, payments, and platform operations.
6.  Give each school role-based access to the modules included in its
    subscription.
7.  Automate reminders, renewals, scheduled work, and tenant lifecycle
    operations.
8.  Add useful AI features with human review and permission checks.
9.  Be configurable: school-specific fee structures, grading systems,
    terms, classes, settings, and workflows must not be hardcoded for
    one school.
10. Build incrementally with maintainable architecture and
    production-minded engineering.

## 3. Confirmed decisions and assumptions

### Confirmed in discussion

-   Working name: **EduNexus**.
-   Initial customer group: private schools in Pakistan.
-   The product is intended to become a commercial SaaS product.
-   It must be multi-tenant.
-   The planned isolation model is **database-per-tenant**, with a
    central platform database. The implementation details and
    operational trade-offs still need to be validated during system
    design.
-   Schools will be able to self-register through the public platform.
-   After signup, the school chooses a paid plan.
-   No free trial in the initial release. The company will demonstrate
    the product to prospective schools; a school that likes it can
    subscribe and activate its workspace. A free trial may be considered
    later.
-   Plans should have different modules and limits. The current example
    plan names are Basic, Premium, and Advanced. Exact names, prices,
    limits, and entitlements are not finalized.
-   Billing should support monthly and yearly periods.
-   Before expiry, the school should receive renewal reminders through
    email and in-product notifications.
-   If the subscription is not renewed, access should eventually be
    restricted or suspended.
-   Data must not be deleted immediately when a subscription expires.
    The discussion considered a longer retention window, with 90 days as
    a **proposed starting policy**, not a final legal or business
    decision.
-   The user wants a detailed plan in files to give to a separate AI
    agent. That agent should act as a teacher and mentor, not simply
    generate the entire application.
-   The user wants to write important business logic manually.
    Repetitive boilerplate and substantial UI/design implementation may
    be assisted or generated, provided the agent explains and reviews
    the work.
-   Explanations should use simple English, clear examples, and
    step-by-step teaching. Avoid unnecessarily complex English.

### Important items not yet finalized

Do not silently decide these. Present options and explain trade-offs
when the project reaches the relevant design stage:

-   Exact technology stack and versions.
-   Whether the operational tenant databases will be MongoDB databases
    in one cluster, separate clusters, or another arrangement.
-   Exact plan names, prices, student/staff limits, storage limits, and
    feature entitlements.
-   Payment providers available to the business in Pakistan and their
    current integration requirements.
-   Exact grace, suspension, archive, and deletion durations.
-   Whether a school can change plans immediately or at the next
    renewal.
-   Whether plan downgrades are blocked when current usage exceeds the
    new plan limit.
-   Whether custom domains are included in a plan or sold as an add-on.
-   Exact role and permission matrix.
-   Which modules belong in the first MVP versus later releases.
-   Legal, privacy, child-data, accounting, and data-retention
    requirements. These require proper research and review before
    commercial launch.

## 4. Users and roles

### Platform-level roles

-   **Super Admin:** Manages the SaaS platform, tenants, plans,
    subscriptions, platform-wide settings, and operational status.
-   **Platform Support/Admin (optional):** Limited support access with
    audited actions. Must not automatically have unrestricted access to
    school records.

### School-level roles

Initial role candidates:

-   School Owner
-   Principal
-   School Administrator
-   Accountant
-   HR/Admin staff
-   Teacher
-   Parent/Guardian
-   Student
-   Librarian
-   Transport Manager
-   Receptionist
-   Other configurable staff roles

Use role-based access control (RBAC), with permissions that can be
assigned by role and, where appropriate, customized by a school. Do not
rely on frontend hiding alone; enforce authorization on the backend.

## 5. SaaS onboarding and tenant provisioning

### Proposed customer journey

1.  A school visits the public EduNexus website.
2.  The school submits registration details.
3.  The platform verifies the email address and/or phone number.
4.  The school creates its basic organization profile.
5.  The school chooses a plan and billing cycle (monthly or yearly).
6.  The backend creates an invoice or payment session.
7.  The school completes payment using an available payment provider.
8.  The backend verifies the payment using a trusted server-side
    provider response/webhook.
9.  The platform starts tenant provisioning.
10. A tenant database is created or assigned.
11. Database migrations, indexes, default settings, and initial roles
    are applied.
12. A school subdomain is assigned, for example
    `abc-school.edunexus.example` (placeholder domain).
13. The school admin account and initial workspace are activated.
14. The school receives a welcome message and can sign in.

### Provisioning must be reliable

Provisioning is a multi-step background workflow. It must not assume
every step always succeeds.

Design for: - Idempotent operations: retrying a provisioning step must
not create duplicate tenants or duplicate setup data. - Retry policy
with backoff for temporary failures. - A visible provisioning state and
useful error record. - Safe recovery when payment succeeds but database
creation fails. - No second charge merely because provisioning must be
retried. - A controlled rollback or compensation plan for partially
completed provisioning. - Audit records for important actions.

Possible tenant provisioning states:

`pending_payment`, `payment_verified`, `provisioning`, `active`,
`provisioning_failed`, `suspended`, `archived`, `deletion_pending`,
`deleted`.

These are initial design candidates. Refine them during system design.

## 6. Multi-tenant architecture

### Proposed high-level model

Use a central **Control Plane** and tenant-specific **Data Plane**.

**Central platform database (Control Plane):** - Tenant registry and
tenant metadata - School profile and contact details - Plan catalogue
and feature entitlements - Subscription records and billing periods -
Invoices and payment transaction references - Domain/subdomain
mappings - Tenant database identifiers and secure secret references -
Provisioning status and job references - Platform-level audit events -
Tenant lifecycle and deletion schedule

**Each school's operational database (Data Plane):** - Students and
guardians - Teachers and staff - Classes, sections, subjects, and
academic years - Attendance - Homework and assignments - Exams, marks,
and results - Fees and school-level finance records - HR and payroll
records - Library, transport, inventory, and other enabled modules -
School-specific settings and audit records

### Tenant resolution

The server must resolve the tenant from a trusted source such as a
validated hostname/domain mapping or authenticated tenant context. Never
trust a tenant ID supplied freely in a request body or query string.

Every request must have a validated tenant context before tenant data is
accessed. Every database operation must use the correct tenant database.
Add automated tests that attempt cross-tenant access and prove that one
school cannot read or modify another school's data.

### Database connection management

Database-per-tenant creates operational concerns: - Too many open
database connections - Connection lifecycle and pooling - Tenant
database lookup and caching - Migrations across many tenant databases -
Backups and restore operations per tenant - Monitoring tenant database
health - Cost as tenant count grows

Design a bounded connection cache/pool and measure it. Do not create a
new permanent connection for every request. Keep credentials in a secure
secret store or encrypted configuration, not as plain text in the
central database.

### Architecture decision record

Before implementation, the AI mentor must teach and compare: 1. Shared
database/shared schema with `tenantId`. 2. Database-per-tenant. 3.
Hybrid or pooled isolation models.

Explain isolation, cost, operations, migrations, scaling, backups, and
connection management. Database-per-tenant is the current product
direction, but the learner should understand the trade-offs and document
why it is selected.

### Start with a modular monolith

Do not begin with microservices just to make the architecture look
advanced. Start with clear modules and boundaries in a modular monolith,
plus background workers where useful. Extract services only when real
scaling, team, or operational needs justify it.

## 7. Subscription, plans, billing, and payment

### Plan catalogue

Initial plan labels discussed: - Basic - Premium - Advanced

Plans should be data-driven, not hardcoded in frontend conditionals.
Each plan should define: - Price and currency - Monthly and yearly
price/period - Included modules/features - Usage limits (for example
students, staff, storage, or campuses) - Support level, if applicable -
Optional add-ons - Whether custom domains or API access are included

The exact features and limits must be agreed before implementation.
Example limits in early discussion were illustrative only and must not
be treated as final pricing.

### Feature entitlements

Use a central entitlement model to decide what a tenant can use. For
example:

``` json
{
  "planCode": "premium",
  "features": {
    "studentManagement": true,
    "transportManagement": true,
    "aiAnalytics": true,
    "workflowAutomation": false
  },
  "limits": {
    "students": 1000,
    "staff": 100
  }
}
```

This is an illustrative shape, not a finalized schema.

Enforce entitlements in the backend as well as the UI. A user must not
gain access to a paid feature by calling its API directly. Check usage
limits on create/update operations and explain what happens when a
tenant reaches a limit.

### Billing records

Keep separate concepts for: - Plan - Subscription - Billing period -
Invoice - Payment attempt/transaction - Refund or dispute, if
supported - Entitlements - Renewal and cancellation history

Do not treat a successful payment as proof that all tenant provisioning
steps have succeeded.

### Payment-provider abstraction

Build a provider interface so payment integration is not deeply coupled
to one gateway. Research current availability, merchant eligibility,
fees, webhook support, recurring-payment support, and settlement
requirements for providers relevant to Pakistan before selecting one.
JazzCash, Easypaisa, bank transfer, and other providers are candidates
to investigate, not confirmed integrations.

### Payment security and reliability

-   Verify payment status server-to-server.
-   Verify webhook signatures or the provider's equivalent
    authentication mechanism.
-   Never trust a success redirect in the browser as final payment
    proof.
-   Store provider transaction IDs and event IDs.
-   Make webhook handling idempotent.
-   Handle pending, successful, failed, refunded, and disputed
    transactions where supported.
-   Keep an audit trail.
-   Do not store raw card details.
-   Protect billing endpoints with authorization and rate limits.

**Idempotency example:** If the same successful payment webhook arrives
three times, the system must record/process the payment once and must
not extend the subscription three times.

## 8. Subscription lifecycle and non-payment policy

### Proposed lifecycle

Possible subscription states:

-   `pending`
-   `active`
-   `past_due`
-   `expired`
-   `suspended`
-   `cancelled`
-   `archived`

Possible tenant access states should be modelled separately, because
billing status and access status are not the same thing.

Example: a subscription may be `past_due` while the tenant remains
accessible during a grace period.

### Proposed reminders

Send reminders before the end of the paid period, for example: - 7 days
before expiry - 3 days before expiry - 1 day before expiry - On the
expiry date

Channels: - Email - In-product notification - Optional future channels
such as WhatsApp/SMS, subject to cost and consent

Avoid duplicate reminders. Track delivery attempts and notification
outcomes.

### Proposed post-expiry sequence

A starting proposal for discussion (not a final business/legal policy):

  ------------------------------------------------------------------------
  Stage                               Example timing Possible behaviour
  --------------------- ---------------------------- ---------------------
  Active                                 Paid period Normal access

  Past due / grace                         Days 0--3 Warnings and payment
                                                     retry

  Limited access                          Days 4--10 Restrict selected
                                                     operations; allow
                                                     billing and essential
                                                     export

  Suspended                              After grace Block normal school
                                                     operations;
                                                     owner/admin can
                                                     access billing and
                                                     export

  Retention/archive             Following suspension Preserve data safely;
                                                     provide
                                                     recovery/export path

  Final warning                      Before deletion Send clear final
                                                     notice and deadline

  Deletion                  After approved retention Execute documented
                                              period permanent deletion
                                                     process
  ------------------------------------------------------------------------

A 90-day retention window was discussed as an initial proposal, inspired
by the general practice of major SaaS providers not deleting data
immediately. It is not a verified universal standard and must be checked
against legal, contractual, security, and business requirements before
launch.

### Data deletion safeguards

School records can be important and may include information about
children. Do not permanently delete data after only 15 days by default.

Before deletion: - Notify the authorized school contact clearly. -
Provide a practical data-export method and deadline. - Confirm tenant
ownership and deletion authorization. - Check legal/contractual
retention obligations. - Delete or anonymize data in the tenant database
and related object storage/search indexes as applicable. - Record a
deletion audit event without retaining unnecessary personal data. -
Apply a documented expiry schedule to backups; do not claim backups are
instantly purged if they are not. - Ensure deletion jobs are retryable
and verifiable.

Support a cancellation/export request separately from automatic expiry.
The school should understand what happens to its data before it
subscribes.

## 9. Product modules

The product should be modular. Build the core foundation first, then
deliver modules in releases. A module being listed here does not mean it
must all be implemented in the first MVP.

### 9.1 Student Information System (SIS)

-   Student admission and registration
-   Student profile and unique admission/registration number
-   Guardian/parent relationships
-   Class, section, and academic-year assignment
-   Student documents
-   Student status and lifecycle
-   Class promotion and transfer
-   Emergency contact information
-   Discipline/behaviour notes with restricted access
-   Configurable school-specific fields where justified

### 9.2 Parent/Guardian Portal

-   View linked children
-   Attendance summary
-   Homework and assignments
-   Exam timetable and results
-   Teacher remarks and approved notices
-   Fee invoices, payments, and receipts
-   Leave requests
-   Parent-teacher meeting requests
-   School announcements and notifications
-   A progress timeline

Parents must only see children linked to their verified account.

### 9.3 Teacher Portal

-   Assigned classes and subjects
-   Class attendance
-   Homework and assignments
-   Marks and results entry
-   Lesson plans
-   Teacher notices and parent communication
-   Leave requests
-   Substitute-teacher information where supported

### 9.4 Attendance

-   Daily attendance by class/section
-   Present, absent, late, and leave states (configurable)
-   Attendance correction with audit trail
-   Monthly and term reports
-   Parent notifications according to school policy
-   Optional future biometric/device integrations

### 9.5 Examinations and Assessment

-   Exam types and schedules
-   Subject-wise assessment
-   Marks entry and moderation
-   Grading scales and pass rules configurable by school
-   Report cards
-   Question bank
-   Printable papers
-   MCQ auto-marking
-   AI-assisted question generation from approved syllabus/material
-   Teacher review and approval before publishing AI-generated content

### 9.6 Fees and Finance

-   Fee categories and structures
-   Class/student-specific fee rules
-   Discounts, scholarships, fines, and late fees
-   Monthly or custom billing schedules
-   Partial payments
-   Receipts and outstanding balances
-   Fee collection reports
-   Expense records
-   Staff salary/payroll integration where appropriate
-   Accounting design should be reviewed carefully before claiming full
    accounting compliance
-   Local payment integration after provider research

### 9.7 HR and Staff

-   Staff profiles and employment details
-   Roles and departments
-   Staff attendance
-   Leave requests and approvals
-   Payroll preparation
-   Salary components and deductions
-   Performance records, if required

### 9.8 Timetable and Scheduling

-   Classes, subjects, teachers, rooms, and availability
-   Conflict detection
-   Teacher workload limits
-   Manual timetable editing
-   Future smart timetable generation using scheduling constraints

### 9.9 Library

-   Book catalogue
-   Copies and availability
-   Issue/return
-   Due dates and fines
-   Student/staff borrowing history

### 9.10 Transport

-   Vehicles and drivers
-   Routes and stops
-   Student route allocation
-   Transport fees
-   Vehicle maintenance
-   Future live GPS tracking, if commercially justified

### 9.11 Inventory and Procurement

-   School assets and consumables
-   Stock movements
-   Suppliers
-   Purchase requests
-   Approval workflow
-   Purchase orders
-   Low-stock alerts

### 9.12 Communication and Notifications

-   School-wide and targeted announcements
-   Email and in-app notifications
-   Parent/teacher communication with safeguards
-   Scheduled reminders
-   Notification preferences
-   Delivery tracking and retry handling
-   Future WhatsApp/SMS integrations after provider and consent review

### 9.13 Principal and School Admin Dashboard

-   Student counts and enrolment changes
-   Attendance trends
-   Academic performance
-   Fee collection and outstanding amounts
-   Staff summaries
-   Operational indicators
-   Charts with date filters and drill-down
-   Permission-aware data visibility

### 9.14 Super Admin Platform Console

-   Tenant directory and tenant status
-   Plan and entitlement management
-   Subscription and invoice overview
-   Payment transaction references
-   Provisioning health
-   Domain mappings
-   Platform usage and operational metrics
-   Support actions with strict audit logging
-   Tenant suspension/restoration and deletion workflow

## 10. AI and intelligent features

AI should support users, not make high-impact school decisions without
human review.

### AI school assistant

A permission-aware assistant for authorized school leaders. Example
questions: - "How many students were absent this week?" - "Which classes
have the lowest attendance?" - "Show fee collection compared with last
month." - "Which subjects have a drop in average marks?"

The assistant must: - Respect the signed-in user's permissions. - Use
only the tenant's data. - Avoid exposing data from other schools. -
Explain where an answer came from. - State uncertainty or missing
data. - Avoid inventing figures. - Log appropriate access to sensitive
reports.

### Early-warning insights

Potentially identify patterns such as declining attendance and falling
marks. Present these as signals for staff review, not automatic labels
or punitive decisions about a child.

### AI question generation

Generate draft questions from teacher-approved syllabus or uploaded
learning material. A teacher must review and approve questions and
papers before students see them.

### AI workflow assistance

Future examples: - Student absent → evaluate school notification rule →
notify guardian. - Fee due → send a reminder. - New admission → create
an onboarding checklist. - Low inventory → create a purchase request
draft.

Do not allow an AI agent to execute sensitive actions without permission
checks, policy rules, and human approval where required.

## 11. Visual workflow automation

A future differentiating feature is a visual workflow builder.

Possible building blocks: - Trigger - Condition - Action -
Delay/schedule - Approval - Notification - Execution log

Example workflow:

`Attendance marked absent → Check notification settings → Find verified guardian → Send notification → Record delivery result`

The workflow engine must validate permissions, prevent infinite loops,
handle retries, and log every execution. Begin with a few fixed
workflows before building a general-purpose visual editor.

## 12. Cross-cutting engineering requirements

### Authentication and security

-   Secure registration and login
-   Password hashing with a modern password-hashing algorithm
-   Short-lived access tokens and carefully managed refresh-token
    rotation/revocation, or another well-justified session approach
-   Email verification and password reset
-   MFA for sensitive roles as a later milestone
-   RBAC and backend authorization
-   Tenant isolation on every request
-   Rate limiting and abuse protection
-   Input validation and safe error handling
-   Secure file upload and access
-   Secrets management
-   Audit logs for sensitive actions
-   Encryption in transit and appropriate encryption at rest

### Background jobs and events

Use a job queue for tasks that should not block web requests: - Tenant
provisioning - Email/notification delivery - Subscription expiry
checks - Payment webhook follow-up - Report generation - File
processing - Scheduled workflows - Backup/deletion operations

Use durable job handling, retries, idempotency, dead-letter/error
visibility, and monitoring.

### Caching and real-time features

-   Add Redis only where a measured need exists.
-   Possible use cases: cache, rate limits, job queues, temporary
    tokens, and real-time coordination.
-   Use Socket.IO or another real-time method where live updates
    materially improve the experience.
-   Never use a cache as the source of truth for billing or
    authorization.

### Files and documents

-   Secure document upload and download
-   File type and size validation
-   Malware scanning strategy before commercial use
-   Object storage such as S3-compatible storage
-   Tenant-aware file paths and access rules
-   Background processing for large files

### Search and reporting

-   Index the data that needs fast search.
-   Add pagination, filtering, and sorting.
-   Avoid loading entire school datasets into memory.
-   Build reports with correct date boundaries and school timezone
    settings.
-   Make dashboards permission-aware.

### Testing

-   Unit tests for business rules
-   Integration tests for APIs and database operations
-   Tenant-isolation tests
-   Payment/webhook idempotency tests
-   Subscription lifecycle tests
-   End-to-end tests for important user journeys
-   Load/performance tests for critical endpoints
-   Backup and restore tests
-   Security tests for authorization boundaries

### Observability

-   Structured logs with correlation/request IDs
-   Error tracking
-   Health checks
-   Metrics for API latency, job failures, queue depth, database
    connections, and tenant provisioning
-   Alerts for failed billing, provisioning, backup, and deletion jobs
-   Avoid logging passwords, tokens, payment secrets, or unnecessary
    student data

### Deployment and DevOps

-   Separate development, test/staging, and production environments
-   Environment-based configuration and secrets
-   Docker where useful
-   CI checks for linting, tests, and build
-   Automated deployment pipeline
-   Database migration strategy
-   Backups and tested restoration
-   Rollback plan
-   Infrastructure and hosting cost monitoring

## 13. Suggested delivery phases

The AI mentor and learner should refine scope before implementation. Do
not try to build every module at once.

### Phase 0 --- Discovery and system design

-   Confirm product scope and users
-   Define MVP
-   Write use cases and acceptance criteria
-   Compare tenancy models
-   Draw architecture and data-flow diagrams
-   Define domain model and tenant lifecycle
-   Identify security and privacy risks
-   Document key architecture decisions

### Phase 1 --- Platform foundation

-   Repository and project structure
-   Environment configuration
-   Code quality and testing setup
-   Central platform database
-   Tenant registry
-   Tenant resolution middleware/service
-   Logging and error handling
-   Initial CI pipeline

### Phase 2 --- Identity and access

-   School admin registration
-   Email verification
-   Login/logout
-   Password reset
-   Session/token strategy
-   Roles and permissions
-   Tenant-aware authorization
-   Security and isolation tests

### Phase 3 --- SaaS billing and onboarding

-   Plan catalogue
-   Feature entitlements and usage limits
-   Invoice model
-   Payment provider research and adapter design
-   Payment initiation and verification
-   Webhook verification and idempotency
-   Subscription lifecycle
-   Paid activation
-   Tenant provisioning workflow
-   Subdomain mapping
-   Renewal reminders
-   Grace/suspension/export/retention workflows

### Phase 4 --- School core

-   School settings
-   Academic years, terms, classes, sections, and subjects
-   Student and guardian records
-   Staff and teacher records
-   Basic dashboards

### Phase 5 --- Teaching and learning

-   Attendance
-   Teacher portal
-   Parent portal
-   Homework and assignments
-   Exams, marks, and results
-   Report cards

### Phase 6 --- Operations and finance

-   Fee management
-   Receipts and collection reports
-   Staff attendance and leave
-   HR/payroll foundations
-   Timetable
-   Library
-   Transport
-   Inventory

### Phase 7 --- Intelligence and automation

-   Analytics dashboards
-   AI assistant with tenant and permission controls
-   AI question drafts and teacher approval
-   Early-warning insights
-   Notification automation
-   Workflow engine and visual builder

### Phase 8 --- Production hardening

-   Security review
-   Tenant-isolation review
-   Load testing
-   Backup/restore drills
-   Monitoring and alerts
-   Data export/deletion verification
-   Documentation
-   Production deployment
-   Pilot with a small number of schools
-   Feedback and iteration

## 14. Working method

-   Work in small, reviewable tasks.
-   Complete and test one meaningful task before starting the next.
-   Keep architecture notes and decisions updated.
-   Use Git branches and meaningful commits.
-   Never mark a task complete only because code was generated; run it,
    test it, and explain it.
-   Keep an explicit list of assumptions, open questions, risks, and
    deferred features.
-   The learner should understand the purpose and trade-offs of each
    major component.
-   Prefer simple, maintainable solutions over unnecessary complexity.
