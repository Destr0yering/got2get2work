# Privacy, trust, safety, and threat model

## Security objectives

1. A user cannot discover or contact another worker without active approval at the same tenant/worksite and current matching eligibility.
2. Employer administrators cannot access private worker commute details.
3. Precise pickup, vehicle plate, messages, and photos are disclosed only to authorized confirmed participants for a bounded purpose.
4. A compromised client cannot change authoritative role, membership, match, estimate, capacity, trip, rating, or moderation state.
5. Calendar access and AI processing cannot become broad personal-data collection channels.
6. Blocks and safety restrictions take effect immediately in discovery and contact paths.

## Trust zones

- Untrusted: mobile/web clients, referral-code input, calendar/ICS content, photos, messages, coordinates, BLE observations, push tokens, AI output.
- Authenticated but least-trusted: workers, captains, employer administrators.
- Privileged: moderators/operators with narrow scopes and step-up authentication.
- Service: Cloud Run identities, task publishers/consumers, Firebase Admin, provider credentials.
- Restricted vaults: identity/contact, calendar credentials, plate/vehicle, pickup location, safety evidence.

## Primary threats and controls

| Threat | Required controls |
|---|---|
| Referral code sharing/brute force | High-entropy codes, digest at rest, expiry/use limits, per-IP/device/account throttles, administrator approval, anomaly alerts. |
| Cross-tenant IDOR | Server-derived tenant context, scoped repositories, deny-by-default authorization tests, random opaque IDs, no client tenant override. |
| Fake or stale captain eligibility | Versioned attestations, expiry reminders, captain-mode gate, admin/moderator review, no “verified safe” language. |
| Stalking through matches/location | Approximate areas, progressive disclosure, confirmed-trip authorization, short TTL, rate limits, blocks, no location history/employer access. |
| Plate/photo harvesting | Signed short-lived media URLs, post-confirmation access checks, cache restrictions, abuse monitoring, removal after purpose window. |
| Calendar overcollection | Least-privilege OAuth, selected calendar, bounded sync, allowlisted projection, encrypted token reference, disconnect/delete, no raw text to AI. |
| Message harassment | Confirmed-thread membership, blocks, rate/size limits, report workflow, restricted moderator access, retention policy. |
| Double booking/seat race | Transactional acceptance, state/version preconditions, unique active-trip constraints, idempotency. |
| Forged estimate agreement | Server-calculated immutable estimate, explicit crew acceptance, captain acceptance, actor/time/version audit, no client amount authority. |
| Employer surveillance | Separate permission namespace, aggregate endpoints only, minimum-cohort suppression, prohibited-field tests and export review. |
| Moderator abuse | Least privilege, step-up auth, reason-required actions, append-only audit, periodic access review, dual control for sensitive export/permanent ban. |
| Push-data leakage | Generic notification copy, no sensitive payload, fetch details after authentication, token rotation and invalidation. |
| AI prompt injection/data leak | Constructed allowlist payloads, strict schema, no tool authority, output validation, no raw calendars/messages/safety/locations, deterministic fallback. |
| Analytics/error-monitoring PII leak | Central redaction, event allowlist, payload tests, Sentry before-send filtering, PostHog forbidden-property tests, no authenticated replay by default. |
| Supply-chain/CI compromise | Lockfiles, dependency review, secret scanning, CodeQL/SAST, signed immutable images, least-privilege GitHub OIDC, protected production environment. |

## Privacy and disclosure matrix

| Data | Coworker before match | Confirmed participant | Employer admin | Moderator |
|---|---|---|---|---|
| First name/last initial, photo | match-safe view | yes | membership administration only | case need |
| Approximate pickup area | coarse label | agreed pickup | no | case need |
| Precise pickup/proximity | no | trip-scoped | never | exceptional case access |
| Vehicle color/make/model/plate | category only | captain details | never | case need |
| Schedule | compatibility facts | agreed trip time | aggregate only | case need |
| Messages | no | thread participants | never | report/case access only |
| Private ratings | never | own submission only | aggregate only | case/reliability review |
| Safety report | never | reporter sees status | no routine access | assigned case access |

## Safety operating model

- The app provides coordination, reporting, blocking, and emergency guidance; it is not an emergency monitoring service.
- “Call 911” is explicit for immediate danger; the platform report is separate.
- Restrictions may be contact-scoped, captain-disabled, tenant-scoped, temporary suspension, or platform suspension.
- Automated signals only prioritize a human queue. A human records evidence basis, proportional action, expiry, notice, and appeal path.
- Blocks are private and bidirectionally exclude matches/contact without telling the blocked user who initiated them.
- Employers are informed only under a documented lawful/policy basis; routine reports and ratings are not shared individually.

## Legal-document requirements

Terms, Privacy, Captain Agreement, location/calendar consents, community rules, and employer pilot agreement must be independently versioned and reviewed by Florida counsel before production. Captain acceptance should cover self-attestations, lawful cost sharing, non-commercial relationship, insurance/registration/license responsibility, conduct, impairment, vehicle condition, location permission, incident duties, and appropriately drafted allocation/indemnity/hold-harmless language. Product copy must not suggest that checkbox acceptance guarantees enforceability or transfers duties that law does not allow.

## Security verification gates

- Unit/property tests for every authorization predicate and state transition.
- Firestore emulator integration tests for cross-tenant, role, block, stale-version, and concurrent-acceptance cases.
- Contract tests that employer endpoints cannot serialize prohibited fields.
- Mobile permission tests for denial, revocation, background termination, and expired trip windows.
- Calendar fixtures for recurrence, DST, deletion, revoked OAuth, malicious ICS, and prompt injection.
- Static analysis, dependency audit, secret scan, container scan, and signed build provenance in CI.
- Pre-pilot Codex Security threat-model review followed by a standard repository scan; validate findings before fixes.
- External legal/privacy review and a focused penetration test before expanding beyond the controlled pilot.

## Moderation operations

- Every safety report creates a restricted moderation case in the same tenant. Queue responses omit the reporter identity and narrative; those details remain in the restricted source record.
- Only `moderator` and `operator` roles may list, assign, or decide cases. Employer administrators cannot use moderation endpoints.
- Moderation endpoints additionally require authentication within the last 15 minutes and a verified MFA/second-factor token claim. Moderators must self-assign and cannot take over another moderator's case; operators have an explicit audited reassignment/decision override.
- Case state, optimistic version, assignee, audit evidence, and any temporary matching restriction are validated and written in one Firestore transaction. Terminal cases cannot be reopened. Safety-report narratives and reporter identities remain only in restricted `safetyReports`; queue records contain routing metadata only.
- Privacy export/deletion requests use a deterministic tenant/user/type queued-request key, making simultaneous retries idempotent.
- Firestore ride creation and captain acceptance read pair and per-user restriction documents inside the same transaction as the ride write, so a restriction committed concurrently forces the ride transaction to retry and fail closed.

Production verification completed 2026-08-13: the Firestore emulator suite verified concurrent moderation conflict handling, atomic audit/restriction writes, simultaneous privacy-request idempotency, composite-index query shapes, and deny-all client rules against the isolated `demo-got2get2work` project. Run `npm run api:test:firestore` to repeat this gate.

Security-scan remediation completed 2026-08-13: employer membership decisions, referral creation, and incentive mutations require MFA plus authentication within 15 minutes; destructive legacy account deletion requires authentication within 15 minutes; legacy enrollment requires Firebase's verified-email claim; legacy user blocks use a tenant-scoped symmetric pair restriction that is transactionally rechecked during request creation and acceptance; authenticated AI quotas are keyed by server-verified tenant/user identity and unauthenticated development traffic ignores forwarding headers. The emulator suite includes bidirectional discovery, request-creation, and acceptance regression tests.

Deployment migration: before enabling moderator access, delete the legacy `narrative` and `reporterUid` fields from existing `moderationCases` documents after confirming the authoritative `safetyReports` copies exist. Backfill missing case `version` values to `0`; the reader temporarily treats an absent version as `0` so this cleanup can be performed without downtime.

Migration verification completed 2026-08-13 and was repeated 2026-08-14: `npm run migration:moderation:dry-run` scanned the configured `got2get2work-xprize-cloud` project and found zero existing moderation-case documents. No production writes were required. The guarded migration utility remains available for future environments and refuses sensitive-field cleanup when authoritative safety evidence is missing.

Dependency-audit note (2026-08-13): non-breaking lockfile remediation was applied. `npm audit --omit=dev` still reports 22 transitive findings in the Expo/Metro image-processing and Firebase Admin/Google Cloud dependency trees. npm's proposed automatic remediations are breaking framework or SDK downgrades, so `npm audit fix --force` is prohibited for this release. Resolve these through compatible upstream package upgrades and a focused reachability review before production launch.

The focused reachability disposition is recorded in `DEPENDENCY_SECURITY_REVIEW.md`; neither remaining vulnerable API is reachable from an untrusted production request boundary in the current source.
- Assignment and decision transitions append immutable audit evidence with actor, reason, action, and timestamp.
- A temporary safety restriction must have a future expiry and a case subject. It immediately excludes that user from matching until expiry.

## Privacy requests and retention

- Signed-in participants may queue account export or deletion requests and inspect only their own requests.
- Repeating an already queued request is idempotent.
- Deletion is asynchronous. Safety, audit, and legally required records may remain under policy or legal hold; the API states this explicitly and does not imply immediate erasure.
