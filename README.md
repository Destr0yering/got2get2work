# CommuteKind

> Your shift has a way there.

CommuteKind is a standalone Expo / React Native hackathon prototype for schedule-aware coworker carpools. It helps employees in the same workplace group find compatible trips to work and home while using approximate pickup areas instead of home addresses. All identities, workplace membership, routes, and history in the demo are fictional seed data.

## Judge links

- **Live no-login demo:** https://destr0yering.github.io/commutekind/
- **Public source repository:** https://github.com/Destr0yering/commutekind
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

The local demo is the default and requires no backend, API key, API billing, commercial map service, device storage, Bluetooth hardware, or network connection. This is the intended hackathon review path. The pickup map and proximity states are deterministic simulations and are labeled that way in the interface.

## How Codex and GPT-5.6 accelerated the build

CommuteKind was designed, implemented, reviewed, and tested in the primary Codex build task with `gpt-5.6-sol`, as recorded in that task's local session metadata. The work was substantive across the project rather than a decorative runtime call:

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

## Deferred optional live adapter

The hackathon demo does not use or require paid API access. Codex with GPT-5.6 was used to design, implement, review, and test the project. A server-side Responses API adapter is included for a future phase, but it stays off unless a developer deliberately configures both an endpoint and `EXPO_PUBLIC_DEMO_MODE=false`.

Copy `.env.example` to `.env.local`, add a server-side OpenAI API key, and explicitly disable forced demo mode:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:4100
EXPO_PUBLIC_DEMO_MODE=false
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=gpt-5.6-terra
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

Only a response whose `source` is `openai` is labeled **Live GPT**. Local or deterministic output is labeled **Offline Demo**, with a visible fallback explanation when a live request was attempted.

Never place an OpenAI key in an `EXPO_PUBLIC_*` variable. The API key belongs only in the server environment. Exact addresses and coordinates must not be sent to either agent endpoint.

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
9. Simulate a driver cancellation from the confirmed ride or Demo Controls.
10. Review and accept Avery’s standing backup offer.
11. Use Profile → Demo Controls → Reset to restore the pristine state.

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

The release gate was also repeated from a clean local clone with `npm ci`. Typecheck, 33 client/domain/state tests, 10 server/privacy tests, and both production exports passed.

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

## Third-party software

CommuteKind is distributed under the [MIT License](LICENSE). Its main open-source dependencies are Expo (MIT), React (MIT), React Native (MIT), React Native Web (MIT), and TypeScript (Apache-2.0). Their versions are pinned in `package-lock.json`; each package retains its own copyright and license terms.
