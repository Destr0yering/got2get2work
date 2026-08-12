# Got2Get2Work MVP privacy notice

Last updated: July 23, 2026

This notice describes the Got2Get2Work pilot and its optional fictional hackathon demo. It is not legal advice; jurisdiction-specific review is required before enrolling a real workforce.

## Data the prototype uses

- Firebase account identity, work email, employer-benefit membership, and server-assigned role.
- Commute role, schedule, time flexibility, and ride preferences.
- A cross-street or general pickup-area label supplied by the user. This remains location information even though it is not an exact home address.
- Ride-request, acceptance, cancellation, recovery, and feedback state.
- Optional match facts sent to GPT-5.6: non-identifying reason codes and numeric commute facts.

## Work-calendar and schedule data

A pilot user may optionally connect a Google Calendar account and select the specific calendar that contains work shifts. Got2Get2Work should request read-only access and should not scan every personal calendar by default.

For synchronization, the service may process the selected calendar identifier, external event identifier, start and end time, time zone, event status, last-modified marker, and the minimum cursor or token needed to retrieve changes. Candidate events must be reviewed and confirmed by the worker before they are used for carpool matching.

The commute profile should not retain unrelated personal events, raw event descriptions, attendee lists, attachments, meeting links, or other calendar content that is not required to represent a confirmed work shift. Raw calendar content is not sent to an AI model. A one-time `.ics` upload is treated as a snapshot; a subscribed feed may update according to the source provider’s refresh behavior.

Users can disconnect a calendar source. Disconnecting stops future synchronization; retained normalized shifts follow the account controls and retention rules below unless the user deletes or replaces them sooner.

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

Workplace administrators should receive aggregate adoption and reliability measures only—not home locations, personal messages, exact individual trip history, unrelated calendar events, or raw schedule-calendar content.

## Controls

Authenticated pilot users can change optional consent choices, download an account export, submit a safety report, create a server-enforced block when a real coworker account is selected, and permanently delete their account. Consent changes are recorded with policy version and time. Schedule and notification choices remain separate from policy acceptance and start off. No external scheduling account is currently connected and no operating-system push notification is sent. Trusted-contact sharing remains a preview. Live trip sharing, if implemented later, must be optional, trip-limited, and automatically expire.

## Retention

The fictional demo stores its state locally. Authenticated pilot account state, consent records, blocks, and reports use Firestore in the same Google Cloud region as the service. Account deletion removes the profile, employer membership, consent records, and block list, then deletes the Firebase identity. A submitted safety report may be retained for incident handling, but the reporter account identifier is removed when the account is deleted. Database deletion protection is enabled; paid point-in-time recovery is not enabled.

## Contact

For support, privacy questions, or requests concerning personal information, email support@got2get2work.com. This inbox is not an emergency service.
