# Got2Get2Work build log

Got2Get2Work began as a standalone hackathon application. Existing We Work Together and WorkRoute code was reviewed only for broad product lessons and visual preferences. Later entries record the XPRIZE product, production, and customer-development work separately from the earlier prototype phase.

## August 10, 2026 — Customer #1 launch package

- Added a fixed-scope `/assessment` website route for a $199 early-adopter Shift Commute Resilience Assessment.
- Kept the offer honest about the current product boundary: aggregate analysis and human-reviewed recommendations, not live transportation operation or driver certification.
- Added the Customer #1 sprint, prospect tracker, evidence checklist, and separate Google AI Studio/OpenRouter red-team prompts.
- Added the assessment route to desktop, mobile, and footer navigation.
- Extended production website tests to cover the offer, transportation disclaimer, and navigation.
- Re-ran TypeScript validation, 34 client/domain/state tests, 23 server/privacy/auth/rate-limit tests, 2 website rendering tests, the website production build, and website lint; all passed.
- GitHub pre-commit review found no open pull requests. No commit, push, PR, payment setup, outreach, or customer claim was made.

## July 17, 2026 — Brand refinement

- Changed the public product name from the working name CommuteKind to **Got2Get2Work**.
- Changed the public tagline to **For when you’ve got to get to work!**
- Renamed the public repository and migrated the Pages path, Expo slug, URL scheme, service/schema identifiers, and native package identifiers to `got2get2work` before submission links were finalized.
- Re-ran typecheck, all 43 automated tests, and both production exports after the rebrand; every gate passed.

## July 17, 2026 — Pickup recognition extension

- Added per-person avatar, vehicle color, body style, and car nickname customization.
- Added a compact accessible pickup map with role-aware passenger and driver views.
- Added confirmed-ride-only, separate proximity consent for both coworkers.
- Added role-bound passenger-presence and vehicle-approach states, including reset on opt-out or cancellation.
- Kept the judged build offline and labeled the Bluetooth flow as simulated; documented the encrypted rotating-token boundary for a future native adapter.

## New-work boundary

- New isolated project: `hackathon/cowork-carpool`.
- New Got2Get2Work product framing, information architecture, source code, tests, API contract, state machine, and documentation; CommuteKind was used only as the initial working name during this same Build Week project.
- New OpenAI Responses API integration using GPT-5.6 and strict structured output.
- New demo data and flows focused on schedule parsing, mutual approval, privacy, and ride recovery.

## Key decisions made with Codex

1. Selected **Apps for Your Life** after reading the official rules and submission fields.
2. Kept eligibility, route, schedule, consent, accessibility, block, and expense decisions deterministic.
3. Used `gpt-5.6-sol` in the primary Codex build task to design and audit the build; kept the judged runtime local/no-billing and limited the deferred adapter to minimized schedule normalization and fact-grounded explanations. The selected model is recorded in the task's local session metadata.
4. Prevented exact address/cross-street/coordinate data from crossing the AI boundary.
5. Designed a deterministic, clearly labeled demo fallback so judges can always run the complete project.
6. Chose a separate repository-ready folder and build log because prior WWT concepts overlap the problem space.

## Required final evidence

- Public repository: https://github.com/Destr0yering/got2get2work
- Deployed no-login demo: https://destr0yering.github.io/got2get2work/
- Add the final Android artifact path if produced.
- Codex `/feedback` Session ID: `019f6d4f-803b-78f2-977d-a07a1dae9a79`
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


## July 24, 2026 — Final B2B2C positioning and deployment declaration

- Declared Got2Get2Work an employer-sponsored workforce mobility benefit for fixed-shift employees.
- Defined the buyer as an employer, workforce program, or participating worksite; employees remain the voluntary users and pay no monthly platform fee.
- Defined the product outcome as commute reliability and protected shifts, with aggregate-only employer reporting and no standard access to home locations, exact routes, messages, or individual trip histories.
- Preserved the coordination-service boundary: Got2Get2Work does not provide transportation, employ drivers, guarantee rides, or determine driver safety.
- Declared `got2get2work.com` as the public website, `app.got2get2work.com` as the authenticated Cloud Run pilot and same-origin API, and `demo.got2get2work.com` as the isolated fictional demonstration.
- Selected worker-authorized Google Calendar access as the first production schedule connector, allowing systems such as HotSchedules to remain upstream.
- Added direct employer schedule integrations as the enterprise path, with subscribed `.ics`, uploaded `.ics`, and manual entry as fallbacks.
- Required worker review before calendar events become matchable shifts and required re-evaluation when a confirmed shift materially changes or is cancelled.
