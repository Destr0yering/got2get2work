# Got2Get2Work MVP privacy notice

Last updated: July 17, 2026

This hackathon notice describes the Got2Get2Work MVP. It is a product prototype, not a final production privacy policy or legal opinion.

## Data the prototype uses

- A demo work-email verification state and workplace group.
- Commute role, schedule, time flexibility, and ride preferences.
- A cross-street or general pickup-area label supplied by the user. This remains location information even though it is not an exact home address.
- Ride-request, acceptance, cancellation, recovery, and feedback state.
- Optional match facts sent to GPT-5.6: non-identifying reason codes and numeric commute facts.

## Data the prototype does not require

- Exact home address.
- Continuous background location.
- Payment-card or bank information.
- Government ID, driver's-license record, insurance record, or background check.
- Employer payroll or attendance history.

## AI data boundary

Saved profile-area values, credentials, and raw schedule prose are not included in AI requests. The server parses schedule prose locally, then constructs a new outbound object containing only allowlisted weekdays, 24-hour start/end times, and the opaque reference `verified_workplace`; unknown fields and original text cannot pass through that projection. Match explanations are independently reduced to allowlisted reason codes and numeric/boolean facts. Pattern checks still reject common street-address, cross-street, coordinate, ZIP, phone, and email input as an early warning, but the structural projection—not pattern matching—is the outbound privacy boundary. Responses requests use `store: false`.

## Location handling in this prototype

The cross-street or general-area label entered during setup remains in local in-memory demo state and appears in Profile. The prototype does not geocode that entry or derive a real route from it. Recommended-match cards use broader, fictional area labels from the seeded demo. After both demo coworkers accept, the prototype reveals the seeded public meeting point and vehicle description.

This prototype is designed not to request an exact home address. That design choice does not make a cross-street or general-area label anonymous or eliminate all location privacy risk.

## Sharing

Before mutual acceptance, the demo presents a broader seeded area, compatibility facts, and limited profile/trust evidence. After both people agree, the prototype reveals the seeded public meeting point, vehicle description, and ride thread. Demo data is fictional.

Workplace administrators should receive aggregate adoption and reliability measures only—not home locations, personal messages, or exact individual trip history.

## Controls

The prototype lets users change demo preference flags and reset local state. Schedule and notification switches are separate from policy acceptance and start off. No external scheduling account is connected and no operating-system push notification is sent. Block, report, trusted-contact sharing, durable deletion, and integration disconnect controls are clearly labeled previews until production enforcement exists. Live trip sharing, if implemented later, must be optional, trip-limited, and automatically expire.

## Retention

The MVP stores demo state in memory. A production version should keep precise route data only as long as needed for an active trip, then delete or coarsen it under a documented retention schedule.

## Contact

For this hackathon prototype, contact the project submitter through the Devpost submission profile. A monitored privacy contact is required before any real pilot.
