# Got2Get2Work production architecture package

Status: approved discovery baseline, 2026-08-12. This package defines the Android-first, single-worksite South Florida pilot. It contains requirements and implementation contracts only; it does not authorize claims that legal review, insurance verification, background checks, or transportation guarantees exist.

## Documents

- [MVP product requirements](./MVP_PRD.md)
- [System architecture](./SYSTEM_ARCHITECTURE.md)
- [Data, API, and event contracts](./DATA_API_EVENTS.md)
- [Privacy, safety, and threat model](./TRUST_SAFETY_SECURITY.md)
- [Migration and build plan](./MIGRATION_BUILD_PLAN.md)

## Approved product boundary

Got2Get2Work is an employer-sponsored coworker carpool coordination platform. Adults may create an account, but only administrator-approved members of the same employer and worksite can match. Captains and crew make their own transportation and expense-sharing decisions. Got2Get2Work does not provide transportation, guarantee arrival or completion, employ captains, determine that a person is safe, or process commute payments.

The pilot comprises an Android employee app and separate web consoles for employer administrators and Got2Get2Work moderators. The initial deployment uses Google Cloud, Firebase Authentication, Firestore, Cloud Storage, Cloud Run, Cloud Tasks/Pub/Sub, Firebase Cloud Messaging, Google Maps Platform, Secret Manager, Cloud Logging, Sentry, and PostHog. Cloudflare remains the DNS, domain, email-routing, and optional edge-security layer; it is not a second application database or runtime.

## Architecture guardrails

1. API-first: clients depend on versioned OpenAPI contracts, never database structure.
2. Modular monolith first: domain modules have ports and adapters; independently deploy only when scale or ownership requires it.
3. Fully typed production code: TypeScript strict mode and runtime validation at every external boundary.
4. Deterministic authority: eligibility, matching, cost estimates, consent, safety restrictions, and authorization are code—not AI decisions.
5. Privacy by design: progressive disclosure, tenant isolation, short-lived proximity, minimized calendar ingestion, aggregate employer reporting.
6. Container-ready: reproducible Docker images, stateless APIs, managed state, health/readiness probes, graceful shutdown.
7. Observable by design: structured logs, traces, metrics, error monitoring, privacy-safe product analytics, immutable audit events.
8. Human control: AI may parse, summarize, explain, or recommend; it cannot accept, cancel, disclose, suspend, reimburse, or dispatch.

## Decision log

| Decision | Selection | Reason |
|---|---|---|
| Worker client | Expo/React Native, Android first | Preserve the current app and meet test-release scope. |
| Admin surfaces | Responsive web console | Keeps employer and moderation functions out of the worker app. |
| API | TypeScript + Fastify + OpenAPI | Small, fast, typed replacement for the current Node ESM API. |
| Persistence | Firestore behind repositories | Lowest-risk hardening path for the existing Google Cloud stack. |
| Identity | Firebase Authentication | Already integrated; supports token revocation and custom claims. |
| Verification | Referral code plus administrator approval | Appropriate for one controlled worksite; extensible to HRIS/SSO. |
| Calendar | Optional Google Calendar read-only connector, plus ICS/manual | High schedule value without making calendar access mandatory. |
| Pickup | Explicit statuses, low-frequency coarse location, optional BLE hint | Low-data and privacy-preserving; BLE is not proof of pickup. |
| Cost sharing | Estimate and bilateral agreement only | No payments, fares, balances, collections, or settlement. |
| AI | Minimized schedule parsing and grounded explanations | AI does not control eligibility or trip state. |
| GitHub | Canonical source/CI/release history | The current workspace repository has no commits or remote yet. |
