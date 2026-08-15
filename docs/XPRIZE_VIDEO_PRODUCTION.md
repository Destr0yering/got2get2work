# Got2Get2Work XPRIZE Video Production

Target runtime: **2:45–2:55**. Hard maximum: **3:00**.

## Recording setup

- Record landscape at 1080p.
- Use the isolated fictional demo for worker flows.
- Use only sanitized production evidence; hide email addresses, tokens, project secrets, billing identifiers, and customer information.
- Close unrelated tabs and disable desktop notifications.
- Use no copyrighted music. Clear narration is sufficient.
- Keep the mouse still unless it is actively demonstrating something.
- Display a small `Fictional demonstration data` label whenever demo identities or metrics are visible.

## Timed script and screen direction

### 0:00–0:15 — The problem

**Screen:** Got2Get2Work title, one-sentence problem, and worker Today screen.

**Narration:**

> A reliable worker can still lose income when transportation fails. Got2Get2Work turns compatible coworker commutes into an employer-sponsored shift-protection benefit—without giving employers access to home addresses, private messages, or individual location trails.

### 0:15–0:42 — Worker-controlled setup

**Screen:** Recurring schedule, Driver/Passenger/Either choices, then eligible match card.

**Narration:**

> Workers verify their account and worksite, confirm recurring shifts, and choose whether they can drive, ride, or do either for each direction. Deterministic policy code—not an AI guess—enforces worksite membership, time compatibility, consent, blocks, seats, and detour limits. The app explains why an eligible coworker fits.

### 0:42–1:12 — Mutual coordination and privacy

**Screen:** Send request, switch fictional persona, accept, then show confirmed pickup and vehicle reveal.

**Narration:**

> A passenger requests the commute. The requested driver independently accepts. Pickup and vehicle details remain hidden until both people agree. Got2Get2Work coordinates the connection, but does not guarantee transportation, employment attendance, reimbursement, or ride completion.

### 1:12–1:35 — Cancellation recovery

**Screen:** Cancel the confirmed fictional ride; return to the passenger and accept the standing backup.

**Narration:**

> When a plan changes, cancellation is explicit. The system can surface a compatible standing backup, but never books another person automatically. That recovery loop is designed to protect shifts while keeping every commitment voluntary.

### 1:35–2:05 — Employer buyer and privacy boundary

**Screen:** Employer dashboard. Show aggregate metrics, cohort suppression, referral and approval areas. Keep the fictional-data label visible.

**Narration:**

> Employers administer the benefit through a separate console. They can manage worksite enrollment and see privacy-safe aggregate outcomes such as approved members, confirmed rides, cancellations, completion responses, and self-reported protected shifts. Small cohorts are suppressed. The console excludes addresses, routes, messages, plates, individual schedules, safety narratives, ratings, and attendance records.

### 2:05–2:32 — Live Gemini operation

**Screen:** Trigger the site-coordinator brief. Show the `Live Gemini` badge, structured recommendation, and cited aggregate facts. Then briefly show a sanitized Gemini/Cloud Run observability screenshot.

**Narration:**

> Gemini operates as a privacy-limited site coordinator. It receives only allowlisted aggregate facts and returns a structured recommendation using server-owned action codes with cited fact identifiers. The server validates that output before display. Gemini cannot approve workers, override safety controls, contact employees, authorize spending, or promise a ride.

### 2:32–2:50 — Architecture and evidence

**Screen:** Simple architecture slide: Expo/React Native → typed Fastify APIs → Firebase Authentication and Firestore → Gemini on Cloud Run. Add verified test counts only after the final validation run.

**Narration:**

> The Android-first client and typed Fastify services run in containers on Google Cloud, using Firebase Authentication, Firestore, Secret Manager, and Gemini. Automated tests cover matching, consent, recovery, authorization, and transactional safety controls.

### 2:50–2:58 — Close

**Screen:** Logo, URL, and closing line.

**Narration:**

> Got2Get2Work makes commute coordination measurable, privacy-conscious, and resilient—so transportation failure is less likely to become lost work.

## Required capture assets

1. Worker Today screen
2. Recurring schedule and directional role choices
3. Explainable eligible match
4. Mutual request and acceptance
5. Confirmed pickup/vehicle reveal
6. Cancellation and backup recovery
7. Employer aggregate dashboard
8. Live Gemini brief with cited facts
9. Sanitized Cloud Run and Gemini observability evidence
10. Architecture/closing slide

## Truth and safety checks

- Never call fictional accounts real users.
- Never call demo metrics measured outcomes.
- State verified revenue and user totals only if evidence is available before recording.
- If revenue remains zero, do not conceal it or imply otherwise; the video can focus on the product and deployed operating loop.
- Do not display the beta code, Firebase action links, passwords, tokens, secrets, private email, customer contact details, or precise addresses.
- Do not say AI matches or approves riders; deterministic policy code controls eligibility and matching.
- Do not claim Google Calendar, push notifications, Bluetooth proximity, or moderation workflows are production-proven unless the final device evidence supports the claim.

## One-pass recording workflow

1. Capture each screen segment silently as separate clips.
2. Record the narration separately in a quiet room.
3. Assemble clips to narration; use simple cuts and short labels rather than decorative transitions.
4. Add captions and the fictional-data disclosure.
5. Export at 1080p H.264.
6. Confirm runtime is below 3:00 and all text is readable at normal playback speed.
7. Upload publicly to YouTube or Vimeo and test the link in a signed-out browser.

## Fallback if live Gemini fails during capture

Do not pretend the fallback is live. Use a previously captured, sanitized production execution with its timestamp and observability evidence, then clearly label the on-screen product result as a deterministic fallback. The narration should say that the production trace demonstrates the live Gemini call and the fallback preserves availability.
