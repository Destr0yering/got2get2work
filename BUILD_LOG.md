# CommuteKind Build Week log

CommuteKind is a completely new application created for OpenAI Build Week. Existing We Work Together and WorkRoute code was reviewed only for broad product lessons and visual preferences. No existing application was renamed or submitted as this project.

## July 17, 2026 — Pickup recognition extension

- Added per-person avatar, vehicle color, body style, and car nickname customization.
- Added a compact accessible pickup map with role-aware passenger and driver views.
- Added confirmed-ride-only, separate proximity consent for both coworkers.
- Added role-bound passenger-presence and vehicle-approach states, including reset on opt-out or cancellation.
- Kept the judged build offline and labeled the Bluetooth flow as simulated; documented the encrypted rotating-token boundary for a future native adapter.

## New-work boundary

- New isolated project: `hackathon/cowork-carpool`.
- New CommuteKind name, product framing, information architecture, source code, tests, API contract, state machine, and documentation.
- New OpenAI Responses API integration using GPT-5.6 and strict structured output.
- New demo data and flows focused on schedule parsing, mutual approval, privacy, and ride recovery.

## Key decisions made with Codex

1. Selected **Apps for Your Life** after reading the official rules and submission fields.
2. Kept eligibility, route, schedule, consent, accessibility, block, and expense decisions deterministic.
3. Used GPT-5.6 through Codex to design and audit the build; kept the judged runtime local/no-billing and limited the deferred adapter to minimized schedule normalization and fact-grounded explanations.
4. Prevented exact address/cross-street/coordinate data from crossing the AI boundary.
5. Designed a deterministic, clearly labeled demo fallback so judges can always run the complete project.
6. Chose a separate repository-ready folder and build log because prior WWT concepts overlap the problem space.

## Required final evidence

- Public repository: https://github.com/Destr0yering/commutekind
- Deployed no-login demo: https://destr0yering.github.io/commutekind/
- Add the final Android artifact path if produced.
- Add the `/feedback` session ID.
- Link the public under-three-minute YouTube demo.

## Local verification — July 17, 2026

- TypeScript typecheck passed.
- Client/domain/state tests passed: 33/33.
- Server/privacy tests passed: 10/10.
- Production web export completed in `dist-web`.
- Production Android export completed in `dist-android`.
- A clean clone installed with `npm ci`, passed typecheck and all 43 tests, and produced both web and Android exports. Windows required permission to execute the local Hermes compiler for the Android export.
- The public GitHub Pages build loaded the seeded demo successfully with zero app console warnings or errors in the in-app browser.
- A 390 × 844 browser walkthrough completed the seeded passenger request, driver acceptance, mutual detail reveal, driver cancellation, backup review, and explicit backup approval flows.
- `npm audit` reported 11 moderate issues and no high or critical issues. The remaining findings are Expo toolchain transitive dependencies; the automatic remediation requires a breaking Expo 57 upgrade, so the hackathon build remains on Expo 54.

## Current integration status

- The server-side OpenAI integration and strict response schemas are complete.
- The hackathon review path is intentionally no-billing: it requires no API key, stays offline by default, and labels deterministic results as local demo output.
- A future server-side adapter remains isolated from the Expo bundle and must be explicitly configured; it was not needed for the verified demo path.

## Independent review corrections

- Added a runnable deterministic eligibility, weighted-ranking, block/accessibility gate, and capped expense-share module; route facts remain honestly labeled as seeded.
- Preserved active ride state when a worker edits a schedule, with a regression test.
- Made cancellation recovery resumable after navigating back.
- Modeled Avery’s prior standing backup offer so the rider’s acceptance completes mutual consent.
- Replaced hard-coded shift counts with the parsed result count.
- Added readable in-app Terms and Privacy screens before consent.
- Labeled safety/report/block controls as nonfunctional previews and made their feedback visible.
- Softened location-filter claims to reflect pattern validation rather than an absolute guarantee.
