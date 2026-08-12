# MVP product requirements

## Objective

Validate that a verified group of coworkers at one South Florida worksite can form dependable recurring carpools, coordinate pickups, recover from cancellations, and give an employer privacy-safe evidence of participation and shifts protected.

## Personas

- **Crew member:** needs a recurring ride aligned with a confirmed work schedule.
- **Captain:** can offer seats and accepts responsibility for their driving, vehicle, required attestations, and conduct.
- **Flexible member:** may be captain or crew for different commute legs or days.
- **Employer administrator:** issues referral codes, approves memberships, configures the worksite and incentive policy, and reviews aggregate program outcomes.
- **Got2Get2Work moderator:** reviews safety reports, restrictions, referral abuse, appeals, and audit history.
- **Program operator:** configures tenants, policies, agreement versions, retention, and service health.

## Release scope

- Android employee app distributed through a compliant closed-testing path.
- Responsive employer console and separate moderator/operator console.
- One employer, one worksite, adults 18+, and one South Florida pilot cohort.
- English only. Manual moderation and self-attested captain qualifications.

## Core journeys and acceptance criteria

### 1. Account, consent, and approved membership

As a worker, I can create an account, verify my email, prove I am at least 18, accept versioned Terms and Privacy notices separately, submit an employer referral code, and wait for administrator approval.

Acceptance:

- A valid code creates a `pending_approval` membership; it never activates the member automatically.
- Codes are tenant/worksite-scoped, hashed at rest, expirable, revocable, usage-limited, and audit logged.
- Pending and rejected members cannot discover people, create requests, view trip details, or access messages.
- The app clearly explains pending, rejected, suspended, and expired states.
- Administrators can approve or reject; every decision records actor, reason, and time.

### 2. Worker and captain profile

As a member, I can provide a display name, approved profile photo, approximate pickup area, accessibility needs, commute role for each leg, maximum detour, and notification preferences.

As a captain, I must provide vehicle make/model/color, plate, seats, and attest to a valid license, registration, insurance, vehicle condition, sobriety/conduct rules, and the current captain agreement.

Acceptance:

- Captain mode remains disabled until every required attestation and agreement is current.
- The product labels these as self-attestations; it does not imply independent verification.
- Plate and specific vehicle details are hidden until mutual confirmation.
- A material agreement update pauses captain eligibility until re-acceptance.

### 3. Schedule ingestion and confirmation

As a worker, I can enter recurring shifts manually, upload an ICS snapshot, or optionally connect one selected Google Calendar read-only.

Acceptance:

- Calendar access is optional and least-privilege; the user selects the calendar and bounded sync window.
- Raw descriptions, attendees, attachments, meeting links, and unrelated events are not stored.
- Imported events become candidate shifts and do not enter matching until the worker confirms them.
- Material time, worksite, or cancellation changes mark affected plans stale and notify the worker.
- Disconnecting a calendar revokes provider access and offers deletion of connector metadata and unconfirmed candidates.

### 4. Deterministic matching

As an approved worker with confirmed shifts, I can view ranked coworkers who are eligible for the same worksite and commute leg.

Acceptance:

- Hard gates include active membership, same tenant/worksite, age/consent, confirmed schedule overlap, opposite compatible roles, capacity, detour policy, accessibility, active captain eligibility, blocks, and safety restrictions.
- Protected traits, compensation, department rank, inferred demographics, popularity, and employer performance data are never matching inputs.
- Every option explains schedule, route, detour, recurring-day, and cost facts without exposing precise pickup data.
- When no candidate passes all gates, the product presents an honest empty state; no gate is silently relaxed.

### 5. Expense estimate and mutual acceptance

As crew, I can review a bounded expense-share estimate and explicitly agree before a captain accepts. As captain, I can see the accepted estimate before confirming.

Acceptance:

- The estimate is labeled voluntary, not a fare, invoice, debt, or proof of payment.
- Formula version and inputs are recorded; settlement occurs outside the platform.
- Crew agreement precedes captain acceptance.
- Mutual acceptance is atomic and prevents double-booking or capacity over-allocation.
- After confirmation, both parties receive the agreed public pickup, profile photos, vehicle details, plate, schedule, estimate, and cancellation terms.

### 6. Messaging, notifications, and pickup

As confirmed participants, I can exchange in-app messages, receive push notifications, and use a low-data pickup flow.

Acceptance:

- Only confirmed participants and authorized moderators can access a trip thread.
- Structured statuses include `leaving`, `en_route`, `nearby`, `arrived`, `passenger_ready`, and `picked_up`.
- Coarse location is opt-in, trip-scoped, rate-limited, and automatically stops after pickup, cancellation, expiry, or completion.
- Optional BLE uses rotating trip tokens and reduces raw signal locally to `nearby/not_nearby`; it never serves as identity, pickup, or completion proof.
- Push payloads contain no precise location, plate number, message body, or sensitive safety detail.

### 7. Cancellation and recovery

As a participant, I can cancel with a reason, notify the other participant, and receive eligible backup options.

Acceptance:

- Cancellation is idempotent, records actor/reason/time, closes active proximity, and releases capacity.
- Recovery reruns current hard gates and never confirms a replacement automatically.
- A replacement requires a new estimate agreement and mutual acceptance.
- Users can always decline recovery without penalty.

### 8. Completion, private ratings, and history

As a participant, I can confirm completion and submit private structured feedback.

Acceptance:

- Completion is a coordination record, not proof that transportation was provided or guaranteed.
- Rating categories are punctuality, communication, safety comfort, and respect, with an optional private moderation note.
- Coworkers never see ratings or written feedback about one another.
- Moderators can review individual feedback; employers see aggregates only unless a documented, policy-authorized safety escalation applies.
- Ratings flag patterns for human review and never automatically suspend a user.

### 9. Safety and account controls

As a worker, I can block a user, report a concern, access emergency guidance, export my account, disconnect integrations, and request deletion.

Acceptance:

- Blocks immediately remove both users from future candidate sets and prevent new contact.
- The emergency action clearly directs the user to 911 and separately opens a platform report; it never implies platform dispatch.
- Safety reports are access-restricted and auditable.
- Deletion removes or de-identifies data according to the retention/legal-hold policy and explains exceptions.

### 10. Employer web console

As an employer administrator, I can manage referral codes and approvals, configure incentives, and view privacy-safe program performance.

Acceptance:

- Employer views never expose precise location, pickup point, plate, messages, private ratings, blocks, raw calendar data, or individual trip history.
- Metrics include eligible/invited/pending/approved members, activation, matches, accepted rides, participant-confirmed completions, cancellations, recovery attempts, successful recoveries, incentives, and self-reported shifts protected.
- Every metric includes definition, time range, denominator, and suppression where a cohort is too small.
- Employers cannot use the console to make automated employment decisions.

### 11. Moderator/operator web console

As an authorized moderator, I can triage reports, apply time-bounded restrictions, document decisions, and process appeals.

Acceptance:

- Employer and moderator permissions are separate and deny-by-default.
- High-impact actions require a reason and are audit logged; permanent bans and sensitive exports require step-up authentication.
- The console supports queues, assignment, evidence references, status, outcome, and appeal history.

## Success metrics and pilot targets

Definitions must distinguish observed platform activity from causal workforce outcomes.

| Metric | Pilot target |
|---|---:|
| Approved employees | 50 |
| Completed commute profiles | 20 |
| Viable recurring match pairs | 15 |
| Completed carpools per week by pilot end | 10 |
| Match-request acceptance | at least 40% |
| Participant-confirmed completion | at least 80% |
| Arrival within agreed window | at least 90% of confirmed responses |
| Self-reported shifts protected | at least 5 |
| Successful recovery after captain cancellation | at least 50% |
| Late cancellation rate | below 10% |
| Average private ride rating | at least 4.0/5 |
| Unresolved critical safety incidents | 0 |

## Non-goals for this release

- Public cross-employer matching or unverified workplace matching.
- iOS, consumer web ride coordination, or multiple worksites.
- Rider-to-driver payments, stored balances, payout accounts, collections, or payment status.
- Automated background, license, registration, or insurance verification.
- Employer access to individual commute behavior or live location.
- Automatic safety decisions, employment decisions, ride acceptance, cancellation, reimbursement, or emergency dispatch.
- Continuous GPS, route recording, or BLE-based proof of pickup.
- White labeling, HRIS/SSO, direct workforce-management APIs, or public partner APIs.
