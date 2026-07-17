# Got2Get2Work

**Tagline:** For when you’ve got to get to work!

**Category:** Apps for Your Life

## Inspiration

While driving on ride-hail platforms, I kept meeting people who were paying for individual rides simply to get to and from work. Many were traveling to the same workplaces and the same shift windows. It raised a simple question: what if the affordable ride they needed was already passing nearby, driven by a coworker they had not met yet?

## What it does

Got2Get2Work recommends coworkers from the same workplace group whose commute windows and routes fit in both directions. The MVP simulates work-email affiliation with fictional seed data; it does not perform a real employer or driver verification. A user can need a ride, offer one, or decide per shift. They can add a schedule manually or enter natural language such as “Mon-Thu, 7 to 3:30”; the no-billing demo structures it locally into editable shifts. A deferred server adapter can later ask GPT-5.6 to normalize only the typed weekday/time projection.

The pair-MVP matching core checks hard constraints in deterministic code: worksite, both commute windows, role, seats, detour, accessibility, active consent, and blocks. Eligible seeded candidates are ranked with a documented 25/25/30/10/10 arrival/departure/detour/recurrence/fairness score and receive a capped incremental/shared-cost estimate. The local demo explains supplied facts without billing; a deferred GPT-5.6 adapter can explain the same allowlisted projection when separately configured.

Privacy is progressive. Got2Get2Work never requires a home address. Before mutual approval, coworkers see a coarsened pickup-area label and compatibility facts. After both agree, the app reveals an agreed public meeting point, vehicle description, and ride thread. If a driver cancels, the agent can surface a compatible coworker’s standing backup offer and fallback transportation—but the user must accept that offer before confirmation.

For the last few minutes of pickup, the confirmed-ride demo adds a small approximate approach map and separate Bluetooth-proximity choices for each coworker. Maya can indicate that she is standing at the public pickup; Jordan can advance the vehicle from en route to nearby and arrived. The hackathon path simulates these states without accessing a Bluetooth radio and clearly labels them. Users can also customize an avatar, vehicle color, body style, and car nickname to make the correct person and car easier to recognize.

## How we built it

- Expo 54, React Native, and TypeScript with a static web export and Android-targeted Expo/Hermes bundle.
- A typed reducer/state machine for request, confirmation, cancellation, and recovery.
- A privacy-scoped pickup state machine for mutual proximity consent, passenger presence, and coarse vehicle approach.
- A deterministic match and expense layer with seeded judge-ready data.
- A deferred Node API boundary for the OpenAI Responses API using `gpt-5.6-terra`, `store: false`, and strict JSON Schema output; it is not required or enabled for the judged no-billing flow.
- A structural optional-AI boundary that constructs schedule requests only from allowlisted weekdays/times plus an opaque workplace reference, and match requests only from allowlisted reason codes and numeric/boolean facts.
- Unit tests for state transitions, matching, privacy filtering, fallback parsing, and grounded explanations.

The client contains no OpenAI key. Raw schedule prose stays on the Got2Get2Work server; OpenAI receives a newly constructed weekday/time projection and opaque workplace reference, never passthrough text or unknown fields. Match explanations structurally send only allowlisted numeric/boolean facts and reason codes. Common address, cross-street, coordinate, ZIP, email, and phone patterns are also rejected early for clearer user feedback.

## How we used Codex

Codex helped us audit the official rules, research existing commute products, distinguish new work from the earlier WWT concept, design the product and threat model, create the cross-platform Expo implementation, write the deterministic match and privacy boundaries, add tests, and verify the complete demo flow.

The major product decision we kept human-owned was the boundary between AI and deterministic code: GPT-5.6 in Codex helped design and test the system; runtime code determines feasibility and expense facts; users approve every consequential action. The optional model adapter can later normalize and explain only minimized facts.

## Challenges

- Protecting a worker's routine and location while still producing useful route-overlap recommendations.
- Avoiding false confidence from a “verified coworker” badge. This MVP’s work-email affiliation is fictional seed data; a future real affiliation check still would not prove driving safety.
- Making an AI-forward demo reliable even when a network or API account is unavailable.
- Differentiating from existing carpool marketplaces with a specific shift-worker and recovery workflow.

## Accomplishments

- A coherent, runnable path from schedule input to explainable match, mutual acceptance, cancellation, and recovery.
- A customizable pickup identity plus an accessible approximate approach map for both passenger and driver views.
- A privacy boundary that keeps precise location out of the model.
- Strict structured output plus deterministic, visibly labeled fallbacks.
- Verified static web export and Android-targeted Expo/Hermes bundle from the same accessible interface.
- A fresh, isolated codebase and dated Build Week log.

## What we learned

AI is most useful here as a coordinator, not an authority. This build used Codex with GPT-5.6 to implement and audit deterministic constraints, progressive disclosure, and explicit consent. A future enabled adapter can normalize a privacy-safe schedule projection and explain allowlisted match facts without owning decisions.

## What's next

- Read-only integrations for employer schedule systems.
- Server-side route matrices backed by encrypted location tokens.
- Production driver-license/insurance verification through a qualified provider.
- A native BLE adapter using encrypted rotating ride tokens, coarse RSSI states, explicit OS permission, and automatic expiry.
- Time-limited trip sharing, masked communication, and human incident review.
- Guaranteed-ride-home partnerships and jurisdiction-specific expense-sharing review.
- Fairness monitoring for night shifts, low-density areas, and new users.

## Built with

Codex with GPT-5.6, deferred OpenAI Responses API adapter, Structured Outputs, Expo, React Native, TypeScript, Node.js

## Submission placeholders

- **Repository:** https://github.com/Destr0yering/commutekind
- **Live demo:** https://destr0yering.github.io/commutekind/
- **Video:** TODO
- **Codex `/feedback` Session ID:** `019f6d4f-803b-78f2-977d-a07a1dae9a79`
