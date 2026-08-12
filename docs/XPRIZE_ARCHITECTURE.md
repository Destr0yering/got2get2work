# Got2Get2Work deployment and agent architecture

## Canonical product surfaces

- `got2get2work.com`: public marketing and pilot information.
- `www.got2get2work.com`: redirect to the root domain.
- `app.got2get2work.com`: authenticated pilot application and same-origin `/api/*` service on Google Cloud Run.
- `demo.got2get2work.com`: isolated fictional no-login demonstration.

The existing GitHub Pages demo may remain as the static origin or a compatibility URL, but public materials should use the canonical demo subdomain after DNS is configured.

## Deployed pilot product

One Cloud Run service hosts the exported Expo web app and server API for the pilot:

- employee experience: schedule connection, confirmed shifts, coworker options, recurring coordination, cancellation and schedule-change recovery, safety and privacy controls, and sponsored benefits;
- employer experience: aggregate adoption, protected-shift activity, recovery rates, costs, and explicitly estimated economics;
- core commute agents: privacy-minimized schedule normalization and explanations of deterministic match facts;
- site-coordinator agent: an operational brief generated only from allowlisted aggregate metrics.

## Schedule integration boundary

The first production connector is a worker-authorized Google Calendar connection. Scheduling systems such as HotSchedules may publish shifts upstream into the worker-selected calendar.

The server:

1. requests read-only access;
2. lists calendars and stores only the worker-selected schedule calendar;
3. performs a bounded initial synchronization;
4. converts candidate events into a normalized shift projection;
5. requires worker confirmation before matching;
6. uses incremental synchronization and periodic reconciliation;
7. treats webhooks as change notifications rather than the changed record itself;
8. detects cancellations and material time changes;
9. re-evaluates affected matches without automatically committing a new ride.

The calendar-to-shift projection excludes unrelated events, descriptions, attendees, attachments, meeting links, and raw location text. Raw calendar content is outside the AI boundary.

Direct employer scheduling-system integrations are the preferred enterprise path after the first design-partner pilot. Subscribed `.ics` feeds, uploaded `.ics` snapshots, and manual entry remain supported fallbacks.

## Aggregate agent boundary

The site-coordinator agent may receive only:

- eligible and enrolled employee counts;
- active carpool count;
- protected-shift total;
- aggregate recovery attempts and successes;
- estimated avoided absences and the employer's value assumption;
- aggregate platform and subsidy costs.

The server rejects extra fields, inconsistent totals, and cohorts below the configured privacy threshold. The agent never receives employee names, work emails, exact locations, home addresses, routes, messages, unrelated calendar events, or individual attendance. It cannot contact workers, change eligibility, spend funds, or promise transportation.

## Cloud Run posture

The multi-stage `Dockerfile` builds the Expo web bundle and serves it with the API on `0.0.0.0:$PORT`. The deployment uses public HTTPS ingress, bounded concurrency, rate limits, provider timeouts, Secret Manager, and same-origin browser access.

Required secrets and credentials remain server-side:

- calendar OAuth client secret and token-encryption material;
- `GEMINI_API_KEY` when the aggregate coordinator is enabled;
- `OPENAI_API_KEY` when the core explanation adapter is enabled;
- Firebase administrative credentials through the supported Google runtime identity.

Never place provider keys, calendar secrets, administrative credentials, or recovery codes in `EXPO_PUBLIC_*` variables, public website builds, Drive plaintext files, or the repository.

## Historical XPRIZE deployment

The July 2026 XPRIZE build used the Google Cloud projects and scripts documented in `deploy/cloud-run.ps1` and `deploy/verify-live.ps1`. Those identifiers are historical implementation details, not the canonical public product topology.
