# System architecture specification

## Context and topology

```text
Android app                 Employer console          Moderator console
     \                             |                         /
      \---- Firebase Auth --------+------------------------/
                         |
                api.got2get2work.com
             Cloudflare DNS/WAF/rate controls
                         |
               Google Cloud HTTPS endpoint
                         |
                  Cloud Run API (Fastify)
        +----------------+----------------+----------------+
        |                |                |                |
   Firestore       Cloud Storage     Cloud Tasks       Pub/Sub
        |                                                 |
        +---- typed repositories ----- Cloud Run worker --+
                         |
       FCM / Google Calendar / Google Maps / Gemini or OpenAI

Telemetry: Cloud Logging/Monitoring + Sentry + PostHog
Secrets: Google Secret Manager
CI/CD: GitHub Actions -> Artifact Registry -> Cloud Run
```

Cloudflare owns public DNS, TLS edge policy, WAF/rate controls, redirects, and existing email routing. Google Cloud remains the authoritative application runtime and data plane. No user data is duplicated into Cloudflare storage for the pilot.

## Deployable units

### Mobile application

Expo/React Native with strict TypeScript. It contains presentation, local session state, permission orchestration, FCM registration, and adapters for camera/photo selection, calendar OAuth handoff, coarse location, and optional BLE. It never talks directly to Firestore in production.

### API modular monolith

A stateless Fastify service with runtime-validated OpenAPI contracts. Modules:

- identity and sessions;
- tenants, worksites, memberships, referrals, and roles;
- agreements, attestations, and consents;
- profiles, vehicles, photos, and pickup areas;
- calendar connectors, ICS, schedules, and shifts;
- routes, eligibility, matching, and expense estimates;
- ride requests, trips, capacity, cancellation, and recovery;
- threads, messages, notification preferences, and device tokens;
- trip proximity;
- ratings, blocks, reports, and moderation;
- employer incentives, reimbursements, and aggregate reporting;
- privacy export/deletion and immutable audit;
- AI parsing/explanation adapter.

Each module follows `route -> application service -> domain -> repository/port -> adapter`. Routes cannot import Firestore collections or third-party SDKs directly. Domain packages cannot import Fastify, Firebase, Google, Sentry, or PostHog.

### Worker

A separate Cloud Run worker image consumes Cloud Tasks/Pub/Sub for calendar synchronization, match invalidation, push delivery, aggregate rollups, retention deletion, photo scanning, and dead-letter recovery. Handlers are idempotent and keyed by event ID.

### Employer console

A responsive TypeScript web application using the same API. It provides memberships, referral codes, incentive policy, aggregate dashboards, and exports. It has no moderation routes or worker-detail backdoors.

### Moderator console

A separately routed web application for Got2Get2Work personnel. It uses step-up authentication for high-impact actions and never shares an authorization bundle with employer pages.

## Source layout target

```text
apps/
  mobile/                 Android-first Expo client
  employer-console/       employer web surface
  operations-console/     moderation/operator web surface
  api/                    Fastify composition root and HTTP routes
  worker/                 asynchronous handlers
packages/
  contracts/              schemas, OpenAPI, error envelope, generated clients
  domain/                 entities, value objects, policies, state machines
  application/            use cases and ports
  matching/               deterministic gates, score, expense formula
  persistence-firestore/  repositories, transactions, converters, indexes
  auth-firebase/           token verification and claims adapter
  calendar-google/        OAuth, incremental sync, webhook validation
  maps-google/            geocoding, route matrix, coarse-area adapter
  notifications-fcm/      token registry and payload policy
  observability/          logs, tracing, Sentry redaction, metrics
  analytics/              allowlisted PostHog events and consent policy
  testkit/                fixtures, fake clocks, fake repositories
infra/
  cloudrun/               service definitions and deployment scripts
  cloudflare/              DNS/WAF/rate-policy documentation or IaC
  firebase/               rules, indexes, emulator configuration
docs/production/           authoritative product and architecture package
```

The migration may create this structure incrementally. Existing mobile files remain operational until moved behind the new package boundaries.

## Authentication and authorization

- Firebase ID tokens authenticate every API call; revoked tokens are rejected.
- Authoritative role and membership status live server-side. Claims are cache hints, never sole authorization.
- Roles: `worker`, `employer_admin`, `moderator`, `operator`, `support_readonly`.
- Resources carry `tenantId`; repositories require an authorization context and cannot issue unscoped collection queries.
- Employer permissions and Got2Get2Work operations permissions are separate.
- High-impact operations require recent authentication and record actor, reason, correlation ID, before/after policy state, and time.
- Public endpoints are limited to health, configuration metadata, authentication bootstrap, and referral submission.

## Consistency and concurrency

- Membership approval, trip acceptance, seat allocation, cancellation, and recovery use Firestore transactions.
- Mutating commands accept an `Idempotency-Key`; duplicate requests return the original result.
- Entities use `version` fields and preconditions for optimistic concurrency.
- Trip and membership state transitions are centralized domain state machines.
- Outbox records are written in the same transaction as domain changes; workers publish/consume with at-least-once semantics.

## Calendar architecture

Google Calendar OAuth uses offline access only when required for ongoing sync, encrypted refresh tokens, a single user-selected calendar, bounded windows, incremental sync tokens, webhook change signals, and scheduled reconciliation. Candidate shifts are normalized locally and require confirmation. Revocation, expired tokens, deleted events, time-zone changes, daylight-saving transitions, and recurring-event exceptions have explicit states.

## Pickup architecture

The authoritative flow is explicit status, not location. Optional coarse updates are accepted only for a confirmed participant within the pickup window, quantized server-side, rate-limited, held in a short-lived trip-proximity record, and excluded from analytics and employer reporting. BLE uses a rotating trip token generated after confirmation and compares broad proximity on-device; raw identifiers and RSSI are not uploaded.

## AI boundary

The provider interface supports Gemini first and an optional OpenAI adapter. The outbound request is reconstructed from allowlisted schedule/time or match-fact fields. Raw calendars, addresses, plates, messages, safety reports, ratings, and identity data are prohibited. Responses use strict schemas, timeouts, circuit breakers, and deterministic fallback. AI output is advisory and records provider/model/prompt-policy version without storing prohibited input.

## Error, logging, and observability contract

- Stable error envelope: code, safe message, correlation ID, optional field errors, retryability.
- Structured JSON logs; never log tokens, calendar content, messages, precise coordinates, plates, photos, or report narratives.
- Sentry environments: `development`, `staging`, `production`; separate mobile, API, worker, employer-console, and operations-console projects or project tags.
- Sentry `beforeSend` redacts headers, query strings, bodies, user email, IP, coordinates, calendar IDs, plates, and message text. Session replay is disabled for authenticated/pickup/moderation surfaces unless separately approved.
- PostHog receives only the allowlisted events in the event catalog, pseudonymous IDs, tenant cohort keys where approved, and no sensitive properties. No location, calendar, message, plate, report, or private rating content is sent.
- SLOs for pilot: API availability 99.5% monthly; p95 non-map API latency under 750 ms; push enqueue success 99%; zero cross-tenant access; proximity expiry within five minutes of policy deadline.

## Environments and delivery

`development`, `staging`, and `production` use distinct Google Cloud projects, Firebase projects, secrets, OAuth clients, storage buckets, analytics projects, and data. CI runs lint, strict typecheck, unit, contract, integration/emulator, security, image, and migration tests. Production deploys an immutable Artifact Registry digest with approval, health verification, gradual traffic, and rollback to the prior digest.
