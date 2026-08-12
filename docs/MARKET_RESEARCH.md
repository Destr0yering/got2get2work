# Got2Get2Work market positioning

## Final category

Got2Get2Work is an **employer-sponsored workforce mobility benefit**. It is sold B2B to employers, workforce programs, and participating worksites, while the employee-facing experience remains voluntary, worker-controlled, and free of a monthly platform fee.

The primary outcome for workers is commute reliability and lower transportation pressure. The primary outcome for employers is shift protection and a more resilient staffing operation. Employer sponsorship does not convert the product into employee surveillance: standard employer reporting is aggregate-only.

## Buyer, user, and beneficiary

- **Buyer/sponsor:** employer, worksite, workforce-development program, or benefit administrator.
- **Primary user:** fixed-shift employee who needs or can offer a recurring commute.
- **Economic beneficiary:** both the employee and sponsor, subject to pilot evidence.
- **Trust boundary:** verified workplace participation, explicit worker consent, and minimized data sharing.

## Comparable patterns

| Product pattern | Lesson for Got2Get2Work |
| --- | --- |
| Employer-supported commuter networks | Workplace density and sponsor funding can solve the cold-start problem. |
| Corporate-email or worksite verification | State exactly what is verified; never imply a background, license, insurance, or safety check. |
| Daily carpool and meeting-point coordination | Optimize recurring shifts and public pickup points rather than becoming a general trip marketplace. |
| Predictive commute recommendations | Explain each recommendation with deterministic facts instead of an opaque AI score. |
| Calendar and workforce-management integrations | Use worker-authorized Google Calendar as the first broad connector, then add direct employer scheduling integrations for authoritative pilots. |

## Defensible wedge

Got2Get2Work is not another public carpool board. Its wedge is:

1. Fixed-shift schedule ingestion, including worker-authorized calendar sync.
2. Separate arrival and departure matching.
3. Deterministic worksite, seat, schedule, detour, accessibility, consent, and block gates.
4. Approximate pickup areas and progressive detail reveal.
5. Transparent expense-share estimates rather than bidding or fares.
6. Agent-assisted cancellation and schedule-change recovery.
7. Employer funding with worker control and aggregate-only reporting.

## Schedule integration strategy

The first production connector is Google Calendar because many employment scheduling systems can already publish shifts into it. This avoids a separate integration for every scheduling vendor during the first pilot.

The product should support:

- a worker-selected, read-only schedule calendar;
- bounded initial and incremental synchronization;
- worker confirmation before an event becomes a matchable shift;
- change and cancellation detection;
- `.ics` subscription and file-import fallbacks;
- manual entry when no connector is available.

Direct employer scheduling-system integrations are strategically superior for larger deployments because they can provide authoritative worksite, eligibility, and shift identifiers. They should follow a successful design-partner pilot rather than delay the first production test.

## Market claim boundary

The demo and pre-pilot materials may claim that the product demonstrates schedule-aware matching, consent, privacy controls, and recovery workflows. They must not claim live routing, driver screening, guaranteed transportation, completed customer pilots, measured absenteeism reduction, payment compliance, or production incident response until those capabilities and evidence exist.
