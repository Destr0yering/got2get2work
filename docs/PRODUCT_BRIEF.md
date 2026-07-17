# Got2Get2Work product brief

## Positioning

**Track:** Apps for Your Life

**Promise:** For when you’ve got to get to work!

Got2Get2Work is an AI commute coordinator for coworkers in the same workplace group. It turns shift schedules into private, explainable carpool options, lets both people approve the arrangement, and proposes a backup when plans change. Production would verify workplace membership; the MVP uses fictional seeded work-email affiliation.

The product is a consumer transportation and personal-finance safety net. Workplace verification is the trust boundary, not an employer surveillance feature.

## Problem

Many employees pay for individual ride-hail trips to and from the same workplace at the same time. A compatible ride may already pass nearby, but coworkers do not know who shares their schedule or route, and they should not have to publish a home address to find out.

## MVP audience

- Adults working scheduled shifts at the same verified worksite.
- Passengers who need a reliable, less expensive commute.
- Coworkers willing to drive with a small, transparent expense share.
- Users with variable arrival and departure windows, not only 9-to-5 commuters.

## Core journey

1. Confirm workplace membership (simulated with fictional seed data in the MVP).
2. Accept Terms and Privacy separately from optional schedule/location permissions.
3. Enter cross streets or a general pickup area; never require a home address.
4. Add shifts manually or enter natural-language schedule text; the no-billing demo parses it locally. A deferred adapter can normalize only a privacy-safe weekday/time projection after API access is added.
5. Review ranked coworkers with deterministic route, time, detour, and expense facts.
6. Ask for a local fact-backed explanation. A future GPT-5.6 explanation is limited to validated reason codes.
7. Request or offer a ride. Both coworkers approve before public pickup and vehicle details appear.
8. After confirmation, optionally use a small approach map and mutual foreground proximity to recognize the arriving car or waiting passenger.
9. Customize an avatar and vehicle identity without presenting either as formal verification.
10. If a trip is cancelled, approve an AI-proposed backup or another transportation fallback.

## What is novel

Existing commuter products already automate basic matching. Got2Get2Work differentiates through:

- Shift ingestion and separate arrival/departure matching.
- Cross-street and public-meeting-point privacy.
- Deterministic eligibility and expense rules with AI explanations grounded in fact IDs.
- Progressive disclosure after mutual acceptance.
- Privacy-scoped last-few-minutes pickup coordination without public stranger discovery.
- Agentic recovery that proposes, but never commits, the next safe option.

## Product principles

- **The agent suggests; people decide.** No acceptance, cancellation, payment, or personal-data sharing without explicit approval.
- **Verification is specific.** “Work email verified” never becomes “safe driver” or “background checked.”
- **Feasibility is code, not prose.** Route, schedule, cost, accessibility, block, and consent rules are deterministic.
- **Location is minimized.** Saved profile areas never enter agent requests; schedule text is checked for common address, cross-street, coordinate, ZIP, phone, and email patterns.
- **A working demo beats a fragile dependency.** Live GPT responses enhance the experience; a clearly labeled deterministic fallback keeps every judged flow runnable.

## Success measures

- Valid options that satisfy 100% of hard schedule, worksite, seat, block, and detour constraints.
- Zero saved profile-location data in AI prompts and match-explanation facts.
- No write action without explicit confirmation.
- Match acceptance, completed recurring commutes, rider coverage, median detour, cancellations, and safety-report rate.

## Competitive references

- [Scoop Commute](https://www.scoopcommute.com/solutions/for-employers): coworker networks, shift scheduling, routing, and backup commute patterns.
- [Quick Ride](https://quickride.in/help.php): corporate-email verification, in-app privacy, and ratings.
- [BlaBlaCar Daily](https://www.blablacardaily.com/): recurring daily carpooling and meeting-point patterns.
- [Commute with Enterprise](https://www.commutewithenterprise.com/): managed commute groups and schedule coordination.

These references inform the problem space; Got2Get2Work's source, flows, identity, and implementation are newly created for OpenAI Build Week.
