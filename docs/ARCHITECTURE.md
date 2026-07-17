# Got2Get2Work architecture

## Trust boundary

The mobile client uses fictional, display-safe seeded facts. If the deferred live adapter is deliberately enabled, the API key and GPT calls remain server-side. Saved profile location and raw schedule prose are outside the AI boundary. The server locally converts schedule prose into an allowlisted weekday/time projection with an opaque workplace reference; common location/contact checks provide early rejection feedback but are not the outbound privacy guarantee.

```text
Expo client
  -> sanitized schedule text / reason codes
API boundary
  -> validation + PII/location rejection
Deterministic matching core
  -> eligible options, route facts, cost facts, fact IDs
GPT-5.6 Responses API
  -> structured schedule or grounded explanation
API boundary
  -> schema validation + safe response
Expo client
```

## Deterministic matching

Hard gates run before ranking:

- Same workplace group (fictional seeded membership in the prototype).
- Compatible arrival and departure windows for the round trip.
- Driver/passenger role and seat availability.
- Maximum detour.
- Accessibility requirements.
- Active consent and no user/route blocks.

The pair-MVP score is:

```text
25% arrival fit
25% departure fit
30% detour fit
10% recurring-day fit
10% fairness / rotation
```

Safety and accessibility are gates, never preference weights. Protected traits, job level, compensation, department, inferred demographics, and popularity are not used.

The runnable demo applies these gates and ranking weights to fictional Jordan and Avery candidate facts in `src/domain/matcher.ts`. Route overlap and arrival facts remain seeded because the MVP has no production map provider. The suggested share is computed from incremental cost plus half of shared-segment operating cost, then capped at trip and comparable solo cost.

## GPT-5.6 responsibilities

The deferred server adapter uses the Responses API with `store: false` and strict JSON Schema output. It is off for the no-billing hackathon demo; the local deterministic gateway is the default.

- Normalize a structurally minimized weekday/time projection into strict editable shifts and a review summary.
- Explain an existing match using supplied reason codes and fact IDs.

GPT does not calculate routes, scores, eligibility, expense shares, or safety status. It cannot access another employee's schedule or location.

## Privacy model

- Before matching: approximate area and compatibility only.
- After a request: first name, workplace badge, commute history, and detour estimate.
- After mutual acceptance: agreed public meeting point, vehicle details, and in-app thread.
- During pickup: optional, mutual, foreground proximity using a ride-scoped rotating token and coarse signal states. The hackathon UI simulates this boundary without accessing Bluetooth hardware.
- During the trip: optional, time-limited trip sharing.
- After the trip: live-sharing access expires.

Production persistence should separate identity, schedule, and location vaults. A `LocationToken` is an opaque reference to encrypted coordinates; coarse geography is used only for candidate lookup. Location tokens are never sent to GPT.

### Pickup proximity adapter

`PickupApproachMap` consumes only coarse reducer state: `waiting`, `en_route`, `nearby`, or `arrived`, plus whether the passenger voluntarily marked themselves at the public pickup. A future native BLE gateway should exchange an encrypted, rotating token scoped to the confirmed trip; it must not use discoverable names, stable hardware identifiers, or stranger scanning. Raw RSSI should be reduced on-device to a broad nearby/not-nearby state, and the token should expire after pickup or when either coworker opts out.

## Expense sharing

The MVP displays a “suggested expense share,” not a fare, and processes no payment.

```text
rider share = rider-caused incremental cost
             + 50% of shared-segment operating cost
```

The result is capped at estimated trip cost and below the rider's comparable solo-trip cost. Production use requires jurisdiction-specific insurance, tax, labor, reimbursement, and carpool-law review.

## State machine

```text
needs_plan
  -> options_ready
  -> request_pending
  -> confirmed
  -> cancelled
  -> recovery_ready
  -> recovered
  -> completed
```

Mutual acceptance cannot be skipped: the trip records requester and requested driver, and only that driver can accept. The reducer rejects invalid transitions and passenger self-acceptance.

## API surface

### `POST /api/agent/parse-schedule`

Client input: schedule text. OpenAI input: a newly constructed object containing only allowlisted weekdays, 24-hour start/end times, and an opaque workplace reference; raw prose and unknown fields are excluded.

Output: strict structured shifts, summary, `source`, and `model`.

### `POST /api/agent/explain-match`

Input: deterministic reason codes, fact IDs, and non-identifying numeric/display-safe facts.

Output: headline, summary, bullets, caveat, `source`, and `model`.

### `GET /api/health`

Reports service readiness and whether live GPT is configured. It never returns credential material.

## Failure behavior

- Missing or unavailable GPT: return a visibly labeled deterministic fallback.
- Common PII/location-like input: reject early; regardless of pattern coverage, send only the structural weekday/time projection to OpenAI.
- Invalid model output: discard it and use deterministic fallback.
- Route or schedule conflict: return no option rather than relaxing a hard constraint.
- Cancellation: surface only a coworker’s already-active standing backup offer; require the affected rider to accept before confirmation or detail reveal.

## Evaluation gates

- All current structured-output fixtures pass schema validation; broader live-model evaluation remains future work.
- Current explanation tests require at least one supplied fact ID and reject contradictory encoded reason/fact pairs; broader semantic evaluation remains future work.
- Invitations/writes without confirmation: zero.
- Saved profile location in prompts and explanation facts: zero.
- Current automated cases cover schedule parsing, cancellation, actor-bound consent, active-schedule edits, message persistence, common sensitive-input patterns, eligibility gates, block enforcement, cost caps, sanitized outbound bodies, and grounded explanations. Prompt-injection red teaming remains pre-pilot work.

## OpenAI references

- [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [Data controls](https://developers.openai.com/api/docs/guides/your-data)
