# Got2Get2Work product brief

## Final B2B2C positioning

**Product category:** Employer-sponsored workforce mobility benefit

**Public promise:** For when you’ve got to get to work!

**Buyer and sponsor:** Employers, workforce programs, and participating worksites

**Primary users:** Adults working fixed, recurring, early, late, or variable shifts
**Core outcome:** More reliable commutes and more protected shifts

Got2Get2Work is an employer-sponsored commute benefit that helps fixed-shift employees coordinate recurring coworker carpools and recover when a ride falls through. Employees use the product at no monthly cost. The employer or workforce sponsor funds the platform and may separately fund ride credits or approved rescue transportation.

The employee experience is worker-controlled. Got2Get2Work converts confirmed schedules, workplace membership, commute preferences, and approximate pickup areas into private, explainable options. Both coworkers approve before a ride is confirmed or more specific trip details are revealed.

The employer experience is aggregate-only. Employers may receive enrollment, adoption, protected-shift, recovery, cost, and pilot-performance measures. They do not receive home locations, personal messages, exact routes, or individual trip histories through the standard product.

Got2Get2Work coordinates potential carpools. It does not provide transportation, employ drivers, guarantee a ride, determine that a driver is safe, or make employment decisions.

## Problem

Many fixed-shift employees pay for individual ride-hail trips or miss work when transportation fails, even though a compatible coworker may already travel toward the same worksite during the same arrival and departure windows. Coworkers lack a private, structured way to discover those overlaps, and employers lack a worker-respecting mechanism for supporting commute reliability.

## Initial customer profile

The first design partners should be single worksites where a missed commute can become an uncovered shift:

- warehouses and distribution centers;
- manufacturing facilities;
- hospitals and healthcare campuses;
- hospitality and food-service operations;
- security, facilities, and other round-the-clock operations.

The initial pilot should focus on one site, one difficult shift cohort, and an opted-in employee population.

## Schedule ingestion strategy

Schedule accuracy is foundational to carpool matching. Got2Get2Work will support the following hierarchy:

1. **Worker-authorized Google Calendar connection — first production connector.** A worker selects the calendar that contains work shifts. Scheduling systems such as HotSchedules can remain upstream and publish the schedule into Google Calendar.
2. **Direct employer scheduling-system integration — preferred enterprise path.** Authorized APIs, webhooks, or workforce-management feeds can provide authoritative worksite and schedule records when a design partner supports them.
3. **Subscribed `.ics` feed.** A worker or employer-provided calendar subscription can supply recurring updates, subject to the upstream provider’s refresh behavior.
4. **Uploaded `.ics` file.** A one-time import is supported as a snapshot and is not represented as continuous synchronization.
5. **Manual and natural-language entry.** These remain available as universal fallbacks.

Calendar-derived events are candidate shifts, not automatically authoritative. The worker must review and confirm detected shifts before they are used for matching. Material changes to start time, end time, worksite, or cancellation status trigger re-evaluation and a worker-visible confirmation or warning.

The calendar connector uses read-only access, reads only the worker-selected schedule calendar, limits the synchronization window, and stores a normalized shift projection rather than copying unrelated calendar content. Raw event descriptions, attendees, attachments, personal calendar events, and exact location text are excluded unless a later feature has a separate, explicit purpose and consent flow.

## Core worker journey

1. Join through a participating workplace group.
2. Accept Terms and Privacy separately from optional calendar, schedule, location, and notification permissions.
3. Connect a selected work calendar, import an `.ics` schedule, or enter shifts manually.
4. Review and confirm normalized shifts before matching begins.
5. Provide a cross-street or general pickup area rather than a required home address.
6. Review ranked coworkers using deterministic schedule, worksite, seat, detour, accessibility, block, and consent rules.
7. Request or offer a ride; both coworkers approve before the public meeting point and vehicle details are revealed.
8. Coordinate the confirmed pickup with structured messages and optional, trip-scoped proximity tools.
9. If a ride is cancelled or a schedule changes, review a standing backup, transit option, or employer-approved rescue path.
10. Mark completion, ride-again preference, block, or safety feedback.

## Differentiation

Existing commuter products already automate basic matching. Got2Get2Work’s focused wedge is:

- schedule ingestion designed for fixed and variable shifts;
- separate arrival and departure compatibility;
- worker-authorized calendar synchronization with a confirmation boundary;
- deterministic eligibility and expense logic with grounded explanations;
- cross-street and public-meeting-point privacy;
- progressive disclosure after mutual acceptance;
- recurring shift protection rather than one-time introductions;
- agent-assisted recovery that proposes but never commits the next option;
- employer sponsorship with aggregate-only program reporting.

## Product principles

- **Employers sponsor; workers control.** Sponsorship does not create access to personal trip details.
- **The agent suggests; people decide.** No acceptance, cancellation, payment, or personal-data disclosure occurs without an authorized human action.
- **Verification is specific.** Workplace membership does not imply identity, background, license, insurance, vehicle, or safety verification.
- **Feasibility is code, not prose.** Schedule, worksite, seat, detour, accessibility, block, cost, and consent rules remain deterministic.
- **Calendar access is minimized.** The worker selects the source calendar; unrelated events are not imported into the commute profile.
- **Location is progressively disclosed.** Approximate areas precede mutually accepted public meeting details.
- **The demo is honest.** Fictional identities, routes, metrics, economics, maps, and proximity states remain explicitly labeled.

## Success measures

### Worker outcomes

- confirmed and completed recurring commutes;
- rider coverage and recovery success;
- median driver detour and worker-reported savings;
- repeat coordination and ride-again preference;
- cancellation, block, and safety-report rates.

### Employer-pilot outcomes

- eligible, invited, enrolled, and weekly active employees;
- active carpools and protected shifts;
- recovery attempts and successful recoveries;
- subsidy usage and employer-defined uncovered-shift value;
- retention in the program after the first confirmed ride.

These measures must be presented as pilot activity, not causal absenteeism reduction, until a valid baseline and evaluation method exist.
