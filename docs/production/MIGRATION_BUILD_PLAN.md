# Migration and sequenced build plan

## Strategy

Use a strangler migration. Preserve the working Expo app, deterministic matcher, trip state tests, Firebase authentication, Firestore server-only access, Cloud Run packaging, and privacy-safe behaviors. Introduce typed contracts and repositories beside the existing server, prove parity through tests, then switch endpoints module by module. Do not rewrite the UI and backend simultaneously.

## Current-to-target gap summary

| Current evidence | Production gap |
|---|---|
| Expo/React Native TypeScript client | Demo-oriented state; missing production notification, photo, calendar, maps, proximity, and full trip adapters. |
| Node ESM API | Not fully typed; route/service/persistence boundaries are incomplete. |
| Firebase Auth + server-only Firestore | Membership code activates immediately; approval, code lifecycle, richer roles, and repository enforcement required. |
| Deterministic matcher | Needs real route facts, captain eligibility, transaction-safe capacity, policy versioning, and persisted match runs. |
| Trip reducer | Needs expanded request/estimate/pickup/completion/recovery states and server authority. |
| Safety/block/privacy endpoints | Need moderation cases, retention, scoped evidence access, appeals, and complete cascade/de-identification jobs. |
| Employer demo dashboard | Needs separate web console and aggregate materialization with prohibited-field tests. |
| Cloud Run Dockerfile | Needs typed build stages, separate API/worker images, non-root runtime, probes, SBOM/scan, and digest deployment. |
| Root Git repository | No commits and no remote; establish intentional source baseline before CI. |

## Build mode

Autonomous plan design, with mandatory verification gates before data migration, external OAuth enablement, production traffic, and pilot launch. Git commits should be small revert points after each completed phase. This checklist plans future implementation; it does not authorize application code in the architecture phase.

## Checklist

- [ ] **1. Establish canonical repository and baseline**
  Spec ref: `SYSTEM_ARCHITECTURE.md > Environments and delivery`
  What to build: Decide canonical repository root, exclude generated APK/build/log/secret material, capture current verification results, create protected default branch and GitHub environments.
  Acceptance: Existing behavior has a reproducible baseline; no secret or machine-local file is tracked.
  Verify: clean-clone install plus current `typecheck`, client, server, website, and export checks.

- [ ] **2. Create typed contracts and modular API shell**
  Spec ref: `SYSTEM_ARCHITECTURE.md > API modular monolith`
  What to build: Strict TypeScript workspace, Fastify composition root, runtime schemas, OpenAPI, generated client, error envelope, correlation IDs, health/readiness, and graceful shutdown.
  Acceptance: Existing health and agent endpoints have contract-parity tests; invalid external input cannot enter application services.
  Verify: lint, strict typecheck, schema tests, OpenAPI snapshot, container health test.

- [x] **3. Implement tenant, referral, approval, role, and agreement foundations**
  Spec ref: `MVP_PRD.md > Account, consent, and approved membership`
  What to build: Scoped repositories, referral-code digest/lifecycle, pending approval, administrator decisions, agreement versions, captain attestations, and audit events.
  Acceptance: A code cannot activate access without approval; cross-tenant and stale-agreement requests fail safely.
  Verify: Firebase emulator authorization matrix, referral abuse tests, transaction/idempotency tests.

- [ ] **4. Harden profiles, protected media, vehicle, and pickup-area vault**
  Spec ref: `MVP_PRD.md > Worker and captain profile`
  What to build: Profile/vehicle APIs, signed photo access, plate vault, coarse pickup tokenization, captain eligibility gate, data export/deletion hooks.
  Acceptance: specific vehicle/plate/pickup data is unavailable before confirmation and never available to employer endpoints.
  Verify: disclosure matrix contract tests, signed-URL expiry, upload validation/scanning, deletion tests.

- [ ] **5. Add manual, ICS, and Google Calendar schedule pipeline**
  Spec ref: `SYSTEM_ARCHITECTURE.md > Calendar architecture`
  What to build: candidate/confirmed shift model, safe ICS parser, Google OAuth and selected-calendar flow, incremental sync worker, disconnect/revoke, change invalidation, and review UI.
  Acceptance: no imported event affects matching before user confirmation; minimized fields only are stored.
  Verify: recurrence/DST/revocation/malicious-input fixtures and outbound-data snapshots.

- [ ] **6. Productionize route, matching, and estimate domains**
  Spec ref: `MVP_PRD.md > Deterministic matching`
  What to build: Google Maps adapter, route cache with privacy controls, policy versions, eligibility gates, persisted score components, cost formula, empty states, and grounded explanation adapter.
  Acceptance: all hard gates are deterministic; no protected/prohibited field influences scoring; estimate is bounded and reproducible.
  Verify: property tests, golden ranking fixtures, cost caps, block/suspension invalidation, AI fallback tests.

- [ ] **7. Implement request, mutual agreement, trip, messaging, and push**
  Spec ref: `MVP_PRD.md > Expense estimate and mutual acceptance`
  What to build: authoritative state machines, atomic seat allocation, expense agreement, disclosure transition, thread ACLs, FCM device registry, generic push payloads.
  Acceptance: crew agreement precedes captain acceptance; double booking/capacity races fail; only participants can message.
  Verify: concurrent acceptance tests, idempotency tests, ACL matrix, push-payload privacy snapshots.

- [ ] **8. Implement low-data pickup, cancellation, and recovery**
  Spec ref: `MVP_PRD.md > Cancellation and recovery`
  What to build: explicit pickup status, optional rate-limited coarse updates, rotating BLE-token adapter, automatic expiry, cancellation consequences, backup reranking and re-acceptance.
  Acceptance: location stops automatically; BLE is never proof; recovery never auto-confirms.
  Verify: fake-clock TTL tests, permission-revocation tests, cancellation race tests, location-log redaction tests.

- [ ] **9. Implement completion, private ratings, safety, moderation, and privacy jobs**
  Spec ref: `TRUST_SAFETY_SECURITY.md > Safety operating model`
  What to build: completion responses, private structured ratings, report/case/appeal workflow, restrictions, emergency UX, exports, deletion/de-identification, retention/legal hold.
  Acceptance: coworkers cannot see ratings; employers see no report content; blocks immediately prevent discovery/contact; high-impact actions are audited.
  Verify: role/access tests, cascade tests, retention jobs with dry-run, moderation audit review.

- [ ] **10. Build employer and operations web consoles**
  Spec ref: `SYSTEM_ARCHITECTURE.md > Employer console`
  What to build: separate route bundles and authorization contexts, membership/referral workflows, aggregate dashboard, incentive ledger, moderation queues, step-up actions.
  Acceptance: employer console exposes only approved aggregate fields with small-cohort suppression; operations access is independently scoped.
  Verify: end-to-end role personas, prohibited-field schema tests, accessibility checks, export review.

- [ ] **11. Add production observability, analytics, and cloud delivery**
  Spec ref: `SYSTEM_ARCHITECTURE.md > Error, logging, and observability contract`
  What to build: structured logs/traces/metrics, Sentry redaction and releases, PostHog allowlist and dashboards, Cloudflare DNS/WAF/rate policy, Cloud Run API/worker images, GitHub OIDC CI/CD, rollback/runbooks.
  Acceptance: no sensitive test canary reaches logs, Sentry, PostHog, or push; staging deploy and rollback are repeatable.
  Verify: telemetry canary tests, image/SBOM/secret scans, staging smoke/load/failure tests, rollback exercise.

- [ ] **12. Pilot readiness and evidence gate**
  Spec ref: `MVP_PRD.md > Success metrics and pilot targets`
  What to build: closed-test release, seeded staging rehearsal, support/moderation playbooks, legal document versions, employer onboarding, metric definitions, incident and recovery drills.
  Acceptance: counsel-approved documents are live; critical security/privacy tests pass; dashboards distinguish activity from causal claims; launch owner signs the go/no-go record.
  Verify: full captain/crew/admin/moderator end-to-end rehearsal, security scan, backup/restore drill, Google Play closed-test checklist, signed release provenance.

## GitHub delivery policy

- Establish the repository only after reviewing the untracked workspace boundary; do not accidentally include `shiftsecure`, archives, generated Android output, crash logs, or local SDK/signing files.
- Use short-lived `codex/` or feature branches, required CI, CODEOWNERS for contracts/security/infra, and protected production environments.
- Commit generated OpenAPI clients only if deterministic generation is enforced; otherwise publish them as CI artifacts/packages.
- Never store service-account keys. Use GitHub OIDC/workload identity federation for Google Cloud deployments.

## Cloudflare boundary

- Keep authoritative compute and state in Google Cloud.
- Use Cloudflare for DNS, canonical redirects, existing email routing, WAF/rate policy, and optional Turnstile on public/referral-abuse surfaces.
- Document or manage changes as infrastructure as code only after importing/confirming existing zone state. Never create parallel DNS or email-routing ownership.

## Stop/go gates

Do not advance to production traffic when any of these is unresolved: legal review of transportation/cost-sharing/captain terms; cross-tenant authorization failure; telemetry PII leakage; missing account deletion/export; unbounded pickup data; referral code auto-activation; untested concurrent acceptance; employer access to individual commute data; or critical/high validated security findings.
