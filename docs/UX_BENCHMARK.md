# CommuteKind UX benchmark

Reviewed July 2026 for the **Apps for Your Life** hackathon category. Product behavior is drawn from official help/listing material; reported friction is treated as directional user evidence, not a universal claim about every trip.

## Four relevant products

| Product | UX strengths worth carrying forward | Friction CommuteKind should avoid |
|---|---|---|
| [Scoop Commute scheduling](https://support.scoopcommute.com/hc/en-us/articles/207092107-How-do-I-schedule-a-carpool) | Commute-first scheduling, separate inbound/outbound trips, ride/drive/either choice, matching deadlines, and explicit cancellation/feedback paths. | Supply can remain uncertain; user reviews report late matches, cancellation stress, and excessive driver detours. CommuteKind must show an honest no-match state, next check time, and driver boundaries. |
| [BlaBlaCar Daily](https://play.google.com/store/apps/details?id=com.blablalines) | Short-notice requests, inspectable profiles, and editable proposed meeting/drop-off points. | Pickup accuracy, messaging clarity, and unpredictable itinerary details are recurring risks. Both coworkers should see the same selected public pickup, times, and detour before acceptance. |
| [Quick Ride help](https://quickride.in/help.php) | Route-fit information, recurring rides, workplace communities, chat, confirmation, and cashless settlement patterns. | Reviews report uneditable/poor pickup selection and price-distance disagreement. CommuteKind therefore makes pickup proposals editable and keeps passenger contribution equal to displayed driver reimbursement. |
| [Pave Commute feature changelog](https://pave-commute-changelog-en.noticeable.news/labels/new-features) | Recurring coworker groups, join-or-drive decisions by day, chat/invites, and visible impact. | Employer/reward dependence can create dead ends, and permission language can overstate what is connected. CommuteKind labels fictional membership, simulated preferences, and seeded impact explicitly. |

## Resulting product requirements

1. **One next-commute task:** Today must show the next shift, confirmation status, and exactly one primary next action.
2. **Two-direction matching:** arrival and departure windows are separately gated and explained.
3. **Driver control:** drivers choose seat count and maximum added detour; the product never silently hardcodes the values it promises are editable.
4. **Pickup agreement:** passengers can propose a different public pickup; both personas see the same recalculated time, detour, and cost.
5. **Explain matches and non-matches:** ranked options show validated facts; the zero-result state names failed boundaries and offers direct recovery actions.
6. **Transparent cost:** show per-leg and round-trip values, the calculation basis, equal passenger/driver amounts, and the fact that no payment is processed.
7. **Reliable coordination:** messages survive navigation and structured “running late” or return-pickup updates are available without exposing phone numbers.
8. **Specific trust evidence:** every badge identifies fictional/seeded workplace evidence and never implies license, insurance, background, or safety verification.
9. **Honest integration state:** local, simulated, and live states are distinct; optional permissions remain off and separate from legal acceptance.
10. **Controlled recovery:** cancellation can reveal only an already opted-in standing offer; no backup is auto-confirmed.
11. **Mobile accessibility:** essential text is at least 10–11 px, route meaning has a text alternative, cards wrap on narrow screens, and modal controls remain scrollable at large text sizes.

## CommuteKind implementation mapping

- `src/domain/matcher.ts`: hard gates and balanced two-leg ranking.
- `src/domain/schedule.ts`: deterministic local schedule parser that rejects ambiguous prose.
- `src/state/reducer.ts`: actor-bound consent, persistent messages, explicit no-match and pickup-proposal states.
- `src/screens/matches`: round-trip facts, public pickup choice, transparent cost, and scarce-supply recovery.
- `src/screens/today`: one primary task, driver review, confirmation, cancellation, and standing-offer recovery.
- `src/screens/profile`: fictional trust provenance and simulated-integration labels.

## Scope note

The prototype demonstrates product behavior with fictional seed data. It does not provide production mapping, employer verification, background/license/insurance checks, payment, guaranteed transportation, emergency response, or real scheduling-system sync.
