# Got2Get2Work

> For when you’ve got to get to work!

Got2Get2Work is an employer-sponsored workforce mobility benefit for fixed-shift employees. Employers, workforce programs, or participating worksites fund the platform and may fund approved ride credits or rescue transportation. Employees use the product at no monthly cost to coordinate private, mutually approved coworker carpools and recover when a commute plan changes.

The standard employer view is aggregate-only. Employers may see enrollment, adoption, protected-shift, recovery, and pilot-cost measures; they do not receive home locations, exact routes, personal ride messages, or individual trip histories.

Got2Get2Work coordinates potential carpools. It does not provide transportation, employ drivers, guarantee rides, or determine that a participant is safe to ride with. All identities, workplace memberships, routes, pilot metrics, economics, maps, and history in the public demo are fictional seed data.

## Canonical domains and deployment

- **Public website:** `https://got2get2work.com`
- **`www` redirect:** `https://www.got2get2work.com` → root domain
- **Authenticated pilot app:** `https://app.got2get2work.com`
- **Pilot API:** same-origin `https://app.got2get2work.com/api/*` on Google Cloud Run
- **Public fictional demo:** `https://demo.got2get2work.com`
- **Current demo compatibility URL:** `https://destr0yering.github.io/got2get2work/`
- **Source repository:** `https://github.com/Destr0yering/got2get2work`

The public marketing site is deployed independently from the application. The authenticated Expo web client and server API share the Cloud Run origin during the pilot to simplify authentication, CORS, and operational ownership. Mobile clients use the same `/api/*` service. The no-login demo remains isolated from pilot accounts and production records.

## Schedule ingestion

The first production schedule connector is worker-authorized Google Calendar access. The worker selects the calendar containing work shifts; scheduling software such as HotSchedules may publish shifts into Google Calendar upstream. Got2Get2Work reads candidate events through a read-only connection, normalizes only the fields required for commute planning, and requires worker confirmation before a shift enters matching.

Schedule sources are prioritized as follows:

1. worker-authorized Google Calendar connection;
2. direct employer scheduling-system API or feed;
3. subscribed `.ics` calendar feed;
4. uploaded `.ics` snapshot;
5. manual or natural-language entry.

Incremental calendar changes and cancellations trigger commute-plan re-evaluation. The connector does not scan every personal calendar by default, and raw descriptions, attendees, attachments, and unrelated events are outside the commute profile and AI boundary.

## Judge links

- **Live no-login demo:** https://destr0yering.github.io/got2get2work/
- **Public source repository:** https://github.com/Destr0yering/got2get2work
- **Primary Codex `/feedback` Session ID:** `019f6d4f-803b-78f2-977d-a07a1dae9a79`
- **License:** MIT

## What the demo proves

- Privacy-first onboarding with separate Terms acceptance and optional schedule/notification permissions.
- Natural-language schedule entry with a required review step.
- Ranked round-trip coworker matches backed by reason codes and deterministic seeded commute facts.
- Driver seat/detour boundaries, editable public pickup proposals, and a clear no-match recovery state.
- Actor-bound mutual acceptance before the public meeting point and vehicle details are revealed.
- Persistent local ride messages and structured day-of-ride updates.
- A small approximate approach map with mutual, foreground-only Bluetooth proximity simulation for the confirmed pickup.
- Per-person avatar, vehicle color, body style, and car nickname customization.
- Passenger and driver personas in one deterministic stage-ready demo.
- Agent-assisted recovery after a driver cancellation.
- A visible local fallback whenever the optional live GPT service is unavailable.
- An employee benefit view that remains useful after coworkers form a regular carpool.
- A privacy-safe employer dashboard with explicit fictional-data labels and transparent pilot economics.
- A dedicated Gemini site-coordinator endpoint that receives only allowlisted aggregate metrics.

The local fallback requires no backend, API key, API billing, commercial map service, device storage, Bluetooth hardware, or network connection. The XPRIZE deployment should run the dedicated Gemini coordinator on Cloud Run; the pickup map and proximity states remain labeled deterministic simulations.

## How Codex and GPT-5.6 accelerated the build

Got2Get2Work was designed, implemented, reviewed, and tested in the primary Codex build task with `gpt-5.6-sol`, as recorded in that task's local session metadata. The work was substantive across the project rather than a decorative runtime call:

- **Research and product framing:** Codex reviewed the Build Week rules, benchmarked four commute and ride-coordination products, and translated the findings into explicit UX requirements.
- **Architecture and privacy:** GPT-5.6 helped define the deterministic matching boundary, progressive location disclosure, mutual-consent state machine, cancellation recovery, and the minimized future Responses API contract.
- **Implementation:** Codex created the standalone Expo/React Native application, typed domain modules, reducer-driven state, simulated proximity tracker, customization controls, and server-side adapter boundary.
- **Self-correction and QA:** Codex wrote and ran client, domain, state, server, privacy, export, and browser-flow checks; findings were fixed and retested. Examples include preserving active rides during schedule edits, restricting driver-only transitions, resetting proximity signals after opt-out, and adding direct driver access to the pickup tracker.
- **Submission evidence:** Codex maintained the new-work log, architecture notes, benchmark, test record, Devpost draft, checklist, and demo script alongside the source.

The important decisions remained human-owned: the app category and purpose, the no-billing judged path, privacy posture, product tradeoffs, and every consequential ride choice. Runtime matching, expense facts, consent, blocks, accessibility, and state transitions stay deterministic. The optional GPT adapter can normalize a minimized schedule projection or explain allowlisted facts, but it cannot approve a match, calculate a route, determine safety, or make a payment.

The primary build task was shared through Codex `/feedback`; its Session ID is `019f6d4f-803b-78f2-977d-a07a1dae9a79`.

## Run

Prerequisites: Node.js 20+ and npm.

```powershell
npm install
npm run start
```

For web:

```powershell
npm run web
```

The project is intentionally standalone. Run commands from this directory rather than the repository root.

## Live agent configuration

The app retains deterministic fallbacks, but the XPRIZE entry uses a server-side Gemini site coordinator and Cloud Run. The existing preferred-model adapter can normalize schedules and explain deterministic match facts when explicitly enabled.

Copy `.env.example` to `.env.local`, add a server-side OpenAI API key, and explicitly disable forced demo mode:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:4100
EXPO_PUBLIC_DEMO_MODE=false
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=gpt-5.6-terra
GEMINI_API_KEY=your-server-side-key
GEMINI_MODEL=gemini-flash-lite-latest
PORT=4100
```

Start the agent service in one terminal and Expo in another:

```powershell
npm run agent
npm run web
```

The client supports:

- `POST /api/agent/parse-schedule` with `{ "text": "..." }`
- `POST /api/agent/explain-match` with `{ "reasonCodes": [...], "facts": [...] }`
- `POST /api/agent/site-coordinator` with an allowlisted aggregate `metrics` object

Public agent routes are limited per client and return `429 RATE_LIMITED` with
`Retry-After` when the short demo quota is exceeded. Provider calls have bounded
timeouts and fall back to deterministic results with a visible `fallbackReason`.

## Reproducible Cloud Run deployment

The production posture is captured in `deploy/cloud-run.ps1`: public HTTPS
ingress, zero minimum instances, one maximum demo instance, bounded concurrency,
the Secret Manager binding, same-origin CORS, provider timeouts, and the agent
rate limit. It contains secret names only, never secret values.

After deployment, run `deploy/verify-live.ps1` to verify the homepage, health
endpoint, and a privacy-safe live Gemini coordinator response.

Only a response whose `source` is `openai` is labeled **Live GPT**. Local or deterministic output is labeled **Offline Demo**, with a visible fallback explanation when a live request was attempted.

Never place an OpenAI or Gemini key in an `EXPO_PUBLIC_*` variable. Provider keys belong only in the server environment. Exact addresses and coordinates must not be sent to any agent endpoint.

## Demo path

The repository includes fictional, deterministic sample data for Maya, Jordan, Avery, and their workplace group. No test account, personal address, employer connection, or network access is required.

1. Start private setup, read the in-app Terms and Privacy Policy, then accept them.
2. Confirm an approximate cross-street area and passenger role.
3. Submit `Warehouse A, Mon–Thu, 7–3:30` and approve four structured shifts.
4. Open **Matches**, review both commute legs, choose a public pickup, and explicitly request the local explanation.
5. Send the round-trip request and switch the demo to Jordan.
6. Accept as Jordan, then switch back to Maya.
7. From the confirmed ride, open **Pickup map & proximity**. Let Jordan and Maya opt in separately, have Maya share that she is standing at pickup, and advance Jordan’s approach.
8. In Profile, open **Customize avatar and vehicle** to review the pickup-identity controls.
9. Open **Benefit** to show the employee's recurring shift-protection value.
10. Simulate a driver cancellation from the confirmed ride or Demo Controls.
11. Review and accept Avery’s standing backup offer.
12. From Profile, open the fictional employer dashboard and refresh the aggregate Gemini brief.
13. Use Profile → Demo Controls → Reset to restore the pristine state.

From Demo Controls, **Simulate no compatible matches** demonstrates the scarce-supply explanation and recovery actions without changing production data.

The **Open seeded demo** button skips directly to step 4.

## Verification

```powershell
npm run typecheck
npm test
npm run server:test
npm run export:web
npm run export:android
```

Or run the complete verification sequence:

```powershell
npm run verify
```

The current B2B2C release gate passes typecheck, 34 client/domain/state tests, 23 server/privacy/auth/rate-limit tests, 2 website rendering tests, website lint, and both production exports.

Recommended visual checks:

- Web at 390×844 and 1440×900.
- Keyboard-only tab and button navigation.
- Text scaling without clipped actions or cards.
- Complete request → accept → cancel → recover flow with network disabled.

## Architecture

- `src/domain`: deterministic eligibility/ranking/cost logic, privacy-safe models, and guarded trip state transitions.
- `src/state`: typed reducer and app actions.
- `src/services`: deterministic and HTTP commute gateways.
- `src/screens`: onboarding, Today, Matches, Schedule, Profile, ride, and recovery flows.
- `src/components`: reusable accessible React Native UI.

### Bluetooth production boundary

The runnable demo does not claim to operate a real Bluetooth radio. A production native adapter should advertise and scan only an encrypted rotating token scoped to one mutually accepted ride, reduce signal strength to coarse states such as **nearby**, expire the token after pickup, and avoid retaining raw device identifiers or movement history. OS permission, foreground/background behavior, and accessibility must be validated on supported iOS and Android devices before a pilot.

The client never asks GPT to calculate routes, determine safety, approve a match, or make a payment. The agent explains supplied deterministic facts; the user makes every consequential decision.

## Project evidence

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Architecture and AI boundary](docs/ARCHITECTURE.md)
- [Market research and positioning](docs/MARKET_RESEARCH.md)
- [Four-product UX benchmark and requirements](docs/UX_BENCHMARK.md)
- [Final QA gate and release evidence](docs/FINAL_QA.md)
- [Devpost checklist](docs/DEVPOST_CHECKLIST.md)
- [Under-three-minute demo script](docs/DEMO_SCRIPT.md)
- [Build Week new-work log](BUILD_LOG.md)
- [B2B2C pilot and pricing hypotheses](docs/B2B2C_PILOT.md)
- [XPRIZE Cloud Run and Gemini architecture](docs/XPRIZE_ARCHITECTURE.md)
- [XPRIZE demo script](docs/XPRIZE_DEMO_SCRIPT.md)

## Third-party software

Got2Get2Work is distributed under the [MIT License](LICENSE). Its main open-source dependencies are Expo (MIT), React (MIT), React Native (MIT), React Native Web (MIT), and TypeScript (Apache-2.0). Their versions are pinned in `package-lock.json`; each package retains its own copyright and license terms.
