# Carpool market research and positioning

## Submission category

**Apps for Your Life** is the strongest and only category to select. Got2Get2Work’s direct user outcome is personal commute reliability and reduced out-of-pocket transportation cost. Workplace verification and future schedule connectors are enabling infrastructure, not an employer-product dashboard.

## Comparable products

| Product | Existing pattern | Got2Get2Work decision |
| --- | --- | --- |
| [Scoop](https://www.scoopcommute.com/solutions/for-employers) | Automated worksite networks, coworker matching, recurring commute coordination, and employer programs. | Recommendations must be automatic and workplace-scoped; “AI matching” alone is not novel. |
| [Scoop Shortlist](https://support.scoopcommute.com/hc/en-us/articles/115014119728-Carpooling-with-the-shortlist) | A shortlist lets commuters focus on people they already prefer to ride with. | Recovery uses an opted-in backup pool and preserves explicit consent. |
| [Quick Ride](https://quickride.in/help.php) | Work-email verification, hidden contact details, in-app coordination, and ratings. | State exactly what is verified; do not imply a background, license, or insurance check. |
| [BlaBlaCar Daily](https://www.blablacardaily.com/) | Repeated home-to-work carpooling and meeting-point coordination. | Optimize the recurring shift journey, not a general trip marketplace. |
| [Commute with Enterprise](https://www.commutewithenterprise.com/) | Employer-supported commute groups and shared transportation economics. | Keep employer enablement out of the primary consumer journey while leaving room for workplace partnerships. |
| [Karos](https://www.karos-mobility.com/) | Predictive daily-carpool recommendations using commute behavior. | Explain every recommendation with deterministic facts rather than presenting an opaque AI score. |

## Defensible wedge

Got2Get2Work is not “another carpool board.” Its focused wedge is:

1. Natural-language shift ingestion with human review.
2. Both arrival and departure windows for hourly and shift workers.
3. Deterministic worksite, seat, schedule, detour, accessibility, consent, and block gates.
4. A coarsened cross-street area and progressive detail reveal.
5. Transparent expense-share estimates rather than bidding or fares.
6. Agentic cancellation recovery that surfaces an already-active backup offer but never accepts for the user.

## Product boundary for the hackathon

The demo uses fictional worker, route, verification, and commute facts. It implements and tests eligibility, ranking, expense calculation, mutual-consent state transitions, privacy filtering, schedule structuring, and grounded explanations. It does not claim live routing, driver screening, guaranteed transportation, payments, production incident handling, or schedule-provider sync.

## Existing WWT design review

The prior WWT/WorkRoute work has strong worker-first visual DNA: navy and cobalt foundations, green confirmation states, warm warnings, large rounded cards, and reassuring shift-focused language. Got2Get2Work carries forward those broad preferences while simplifying the experience to four tabs—Today, Matches, Schedule, and Profile—and ranking recommendations instead of presenting a crowded ride board. The source code, identity, state machine, agent boundary, tests, demo data, and documentation in this folder were created fresh for Build Week; no prior application was renamed for submission.
