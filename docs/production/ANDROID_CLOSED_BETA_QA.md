# Android closed-beta QA checklist

Use a release APK on at least one current Samsung device and one older supported Android device. Record build ID, device/OS, tester account role, timestamp, screenshots, and relevant correlation IDs. Never capture passwords, precise home addresses, full license plates, private messages, or safety narratives in shared evidence.

Dependency labels: **API** deployed Fastify API and Firestore; **AUTH** Firebase Authentication/email templates; **ADMIN** bootstrapped employer admin plus referral code; **PUSH** Android push credentials and physical device; **DEVICE** location/Bluetooth/notification permissions.

## P0 identity and enrollment

- [ ] **ADMIN/AUTH/API** Create an expiring, usage-limited employer referral. Expected: plaintext appears once and the code does not activate membership automatically.
- [ ] **AUTH/ADMIN/API** Create a worker account with the beta code. Expected: verification email is sent and membership remains pending until admin approval.
- [ ] **AUTH** Verify email, sign out, and sign back in. Expected: verified state persists and unverified accounts cannot bypass required gates.
- [ ] **AUTH** Use Forgot password from sign-in. Expected: generic confirmation prevents account enumeration; reset link permits a new password and invalid/expired links fail safely.
- [ ] **ADMIN/API** Approve one membership and reject another with audit reasons. Expected: only the approved, verified worker can enter the pilot; cross-worksite access is denied.

## P0 commute and ride flow

- [ ] **API** Save commute profile, worksite, driver/passenger/either role, and recurring schedule. Expected: values persist after restart and invalid times/routes are rejected.
- [ ] **API** Discover a same-worksite, time-compatible match. Expected: no cross-employer match and blocked/restricted users never appear.
- [ ] **API** Passenger requests a ride and accepts the displayed reimbursement estimate. Expected: consent is required before captain acceptance and the UI states that Got2Get2Work does not process payment.
- [ ] **API** Captain accepts. Expected: ride confirms once, contact details are disclosed only after confirmation, and stale/restricted matches fail closed.
- [ ] **API** Exchange ride messages. Expected: only confirmed participants can read/write the thread; content persists without appearing in employer analytics.
- [ ] **DEVICE/API** Exercise low-data pickup status/proximity. Expected: permission denial is recoverable, no continuous location trail is exposed, and the feature degrades safely when Bluetooth/location is unavailable.
- [ ] **API/PUSH** Cancel captain and passenger rides. Expected: both parties are notified, state transitions remain consistent, and backup matching begins only when eligible.

## P0 trust, safety, and privacy

- [ ] **API** Block another user, then repeat discovery and a cached-match request. Expected: the pair cannot match or create/accept a ride.
- [ ] **API** Submit a safety report. Expected: confirmation contains no sensitive echo; employer console cannot read reporter identity, narrative, messages, plate, or location.
- [ ] **ADMIN/AUTH** Attempt moderation mutations without MFA and after a 15-minute-old sign-in. Expected: both fail; recent MFA succeeds and creates an audit record.
- [ ] **API** Verify vehicle photo/description and partial plate display. Expected: sensitive vehicle data is access-controlled and never appears in aggregate employer reporting.

## P1 notifications, history, and resilience

- [ ] **PUSH/DEVICE** Test foreground, background, killed-app, and permission-denied notifications. Expected: request, acceptance, cancellation, and backup events deep-link to the correct non-sensitive screen without duplicating actions.
- [ ] **API** Complete a ride, then submit participant feedback/rating and view history. Expected: only confirmed participants can respond; coworker-level ratings are not exposed to employers.
- [ ] Disable network during each critical mutation and retry. Expected: clear recoverable error, no duplicate request/acceptance/report/referral, and consistent state after reconnect.
- [ ] Force-stop and restart during onboarding and an active ride. Expected: authentication and server state restore without leaking another user's cached data.
- [ ] Check accessibility, large text, screen reader labels, dark/light appearance, back navigation, and Android permission rationale.

## Employer-console smoke test

- [ ] **ADMIN/API/AUTH** Sign in as employer admin with recent MFA. Expected: aggregate dashboard, pending approvals, and referrals load; ordinary workers receive 403.
- [ ] Verify minimum-cohort suppression. Expected: small groups show suppression, never individual attendance, schedules, routes, messages, ratings, vehicles, or safety evidence.
- [ ] Sign out and use browser back/refresh. Expected: protected data is no longer accessible.

## Release decision

**Go** only when every P0 passes on the signed release artifact, automated checks pass, health/readiness probes are green, Firestore emulator/staging concurrency tests pass, the moderation migration dry-run and controlled apply are recorded, privacy evidence is reviewed, and rollback is rehearsed. Any authentication bypass, cross-tenant disclosure, unsafe cached match, duplicate critical mutation, crash in a core flow, or missing safety control is an automatic **No-Go**.
