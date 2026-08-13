# Data, retention, API, and event contracts

## Core entities and relationships

| Entity | Key relationships and purpose |
|---|---|
| Tenant | Employer sponsor; owns worksites, policies, administrators, and aggregate reporting. |
| Worksite | Belongs to tenant; destination, time zone, matching policy, pilot cohort. |
| User | Authentication subject and platform status; PII separated from commute data. |
| Membership | User + tenant + worksite + role + approval state. One user may later hold multiple memberships. |
| ReferralCode | Tenant/worksite invitation policy; stores digest, limits, expiry, revocation. |
| ApprovalDecision | Membership decision, administrator, reason, timestamp. |
| AgreementVersion | Immutable Terms/Privacy/Captain text metadata and effective dates. |
| ConsentRecord | Append-only user decision for a specific purpose and version. |
| CaptainAttestation | License/registration/insurance/vehicle/conduct assertions and expiry. |
| CommuteProfile | Role by leg, detour, seats, accessibility, coarse pickup-area token. |
| Vehicle | Captain-owned make/model/color/plate vault reference and seat capacity. |
| CalendarConnection | Provider account, encrypted credential reference, selected calendar, sync state. |
| ShiftCandidate | Normalized imported/manual proposal awaiting user confirmation. |
| Shift | Confirmed recurring or dated work commitment linked to worksite. |
| MatchRun | Immutable policy/input-version metadata for reproducibility. |
| MatchCandidate | Eligible captain/crew pair, score components, route and schedule facts. |
| ExpenseEstimate | Formula version, bounded inputs, amount, currency, expiry. |
| ExpenseAgreement | Crew acceptance and captain visibility/acceptance record; never payment status. |
| RideRequest | Crew/captain proposal and pending state. |
| Trip | Confirmed commute leg with state, participants, pickup window, estimate, and policy versions. |
| TripParticipant | Role, acceptance, completion response, disclosure state. |
| Thread / Message | Confirmed-trip communication; server-mediated access. |
| ProximitySession | Short-lived rotating token and coarse states only. |
| Cancellation | Actor, reason code, time, notice outcome. |
| RecoveryCase | Cancelled trip, candidate attempts, selected replacement, outcome. |
| Rating | Private structured feedback and restricted note. |
| Block | Directional user restriction; matching considers either direction. |
| SafetyReport / ModerationCase | Restricted report, evidence references, actions, appeals. |
| IncentivePolicy / IncentiveLedger | Employer-funded eligibility and recorded awards; no payout processing. |
| DeviceRegistration | FCM token, platform, app version, last-used time. |
| AuditEvent | Append-only actor/action/resource/reason/correlation metadata. |
| AnalyticsEvent | Allowlisted product measurement without sensitive content. |

## Required state machines

Membership: `pending_approval -> active | rejected`; `active -> suspended | expired | withdrawn`; only authorized review can restore eligibility.

Ride request: `draft -> awaiting_crew_estimate_agreement -> pending_captain -> accepted | declined | expired | cancelled`.

Trip: `confirmed -> pickup_open -> picked_up -> completion_pending -> completed`; cancellation may enter `cancelled -> recovery_open -> recovered | recovery_declined | recovery_expired`.

Moderation: `open -> triaged -> investigating -> actioned | no_action -> appealed -> upheld | modified | reversed -> closed`.

## Retention baseline

Final periods require Florida counsel and pilot contracts. These are implementation defaults, not legal conclusions.

| Data | Default | Notes |
|---|---:|---|
| Raw OAuth authorization code | not retained | Exchange once; never log. |
| Calendar candidate fields | 30 days after rejection/expiry | Confirmed shifts follow shift retention. |
| Calendar sync metadata | connection lifetime + 30 days | Credential reference deleted on disconnect. |
| Precise/coarse pickup updates | expire by 24 hours; target minutes | Operational access ends at pickup/cancel/timeout. |
| BLE rotating token | pickup window + 15 minutes | No stable hardware ID or raw RSSI server storage. |
| Messages | 90 days after trip | Safety/legal hold may preserve a restricted copy. |
| Trip operational record | 24 months | Minimize pickup details after 30 days. |
| Private ratings | 24 months | Employer receives aggregates, not rows. |
| Safety/moderation records | 7 years or counsel-approved period | Strict access and legal-hold process. |
| Consent/agreement evidence | agreement life + 7 years | Append-only evidence. |
| Audit events | 7 years | No sensitive payload bodies. |
| Device tokens | delete after 90 days inactive or sign-out | Immediate deletion on invalid-token response. |
| Product analytics | 13 months | Pseudonymous, no sensitive properties. |
| Account PII after deletion | delete within 30 days | Exceptions: de-identified aggregates and lawful holds. |

## API conventions

- Prefix `/v1`; JSON UTF-8; ISO 8601 timestamps with explicit time zones; USD values are integer cents.
- Bearer Firebase ID token; server-side membership/role authorization.
- Pagination uses opaque cursors. Mutations use idempotency keys and return resource version.
- Error shape: `{ error: { code, message, correlationId, retryable, fields? } }`.
- OpenAPI is authoritative; generated clients are checked for drift in CI.

## API groups

| Group | Representative endpoints |
|---|---|
| Bootstrap | `GET /v1/config`, `GET /v1/me`, `GET /health/live`, `GET /health/ready` |
| Enrollment | `POST /v1/memberships/referrals:redeem`, `GET /v1/memberships/current` |
| Employer approvals | `GET /v1/admin/memberships`, `POST /v1/admin/memberships/{id}/approve`, `/reject` |
| Referral codes | `POST /v1/admin/referral-codes`, `GET`, `POST /{id}/revoke` |
| Agreements | `GET /v1/agreements/required`, `POST /v1/agreements/{id}/accept`, `PUT /v1/captain/attestation`, `GET /v1/captain/eligibility` |
| Profiles/vehicles | `GET/PUT /v1/profile`, `GET/PUT /v1/vehicle`; plate values are owner-only through these endpoints and AES-256-GCM encrypted in the server-side vault. Signed photo handling remains deferred. |
| Calendar | Google OAuth is deferred for the pilot launch; manual and ICS schedules remain supported. |
| Schedules | `POST /v1/schedule/ics`, `GET/POST /v1/shifts`, `POST /v1/shifts/{id}/confirm`; ICS creates minimized candidates and never persists event titles/descriptions. |
| Matching | `POST /v1/matches/search`; persists policy-versioned runs, returns opaque candidate IDs and allowlisted schedule facts, and uses conservative same-area routing until a map adapter is enabled. |
| Ride flow | `POST /v1/ride-requests`, `GET /v1/ride-requests/{id}`, `POST /{id}/expense-agreement`, `POST /{id}/captain-decision`; crew agreement is mandatory before captain action. The launch estimate is a $3 same-coarse-zone pilot contribution (`pilot-coarse-zone-v1`), voluntary and settled outside the platform; no payment status is recorded. |
| Trips | `GET /v1/trips`, `GET /{id}`, `POST /{id}/status`, `:cancel`, `:complete` |
| Messaging | `GET /v1/trips/{id}/messages`, `POST /messages` |
| Proximity | `POST /v1/trips/{id}/proximity-session`, `PUT /proximity`, `DELETE /proximity-session` |
| Recovery | `GET /v1/recoveries/{id}/options`, `POST /options/{id}:request` |
| Trust | `POST /v1/blocks`, `DELETE /blocks/{id}`, `POST /v1/safety-reports`, `POST /v1/ratings` |
| Employer reporting | `GET /v1/admin/dashboard`, `GET /v1/admin/incentives`, `POST /incentive-policies` |
| Moderation | `GET /v1/ops/cases`, `POST /{id}:assign`, `:restrict`, `:resolve`, `:appeal-decision` |
| Privacy | `POST /v1/account/export`, `DELETE /v1/account`, `DELETE /v1/integrations/{id}` |

## Domain event catalog

Every event carries `eventId`, `occurredAt`, `aggregateType`, `aggregateId`, `aggregateVersion`, `tenantId` where applicable, `correlationId`, `causationId`, and schema version.

- `membership.referral_submitted`, `membership.approved`, `membership.rejected`, `membership.suspended`
- `agreement.accepted`, `captain.attestation_updated`
- `calendar.connected`, `calendar.sync_completed`, `calendar.disconnected`
- `shift.candidate_created`, `shift.confirmed`, `shift.materially_changed`, `shift.cancelled`
- `match.run_completed`, `match.option_viewed`
- `expense.estimate_created`, `expense.estimate_agreed`
- `ride_request.created`, `ride_request.accepted`, `ride_request.declined`, `ride_request.expired`
- `trip.confirmed`, `trip.pickup_status_changed`, `trip.cancelled`, `trip.completed`
- `recovery.opened`, `recovery.option_requested`, `recovery.succeeded`, `recovery.closed`
- `message.created`, `notification.enqueued`, `notification.delivery_failed`
- `block.created`, `safety_report.created`, `moderation.restriction_applied`, `appeal.decided`
- `rating.submitted`, `incentive.earned`, `privacy.export_ready`, `account.deletion_requested`

## PostHog analytics allowlist

PostHog events intentionally differ from domain/audit events. They contain pseudonymous actor ID, app version, platform, environment, funnel step, and coarse tenant/worksite cohort only when approved.

Allowed examples: `onboarding_started`, `referral_submitted`, `membership_state_viewed`, `profile_completed`, `schedule_source_selected`, `shift_confirmed`, `match_search_completed` with count bucket, `ride_request_created`, `expense_estimate_agreed`, `trip_confirmed`, `pickup_status_used`, `recovery_started`, `recovery_succeeded`, `completion_response_submitted`, `rating_submitted`, and `safety_entry_opened`.

Forbidden properties: email, name, address, coordinates/geohash, calendar/event IDs or text, employer employee ID, plate, vehicle identifier, message content, safety narrative/category tied to a person, rating values tied to another user, referral code, OAuth data, or route geometry.
