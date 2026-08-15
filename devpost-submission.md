# Title

Got2Get2Work

## One-line Summary

AI-coordinated, employer-sponsored commute resilience for shift workers.

## Problem

A reliable worker can still lose income when transportation fails. Shift-based employers absorb the resulting absence, overtime, and staffing disruption, yet conventional ride-hail treats each commute as an isolated transaction. Coworkers may already travel toward the same worksite at compatible times, but they lack a trusted, privacy-conscious way to coordinate recurring carpools and recover from cancellations.

## Solution

Got2Get2Work is an Android-first carpool coordination marketplace that can operate as an employer-sponsored workforce benefit. Workers create verified accounts, join a worksite through controlled referral enrollment, confirm recurring schedules, choose Driver, Passenger, or Either independently for each commute direction, and review explainable coworker options. Both people must agree before vehicle and pickup details are revealed. Cancellation recovery can offer a standing backup, but the platform never represents a ride as guaranteed.

The employer console provides privacy-safe aggregate program administration: referral controls, membership approval, pilot outcomes, and bounded operational recommendations. It excludes home addresses, precise location trails, private messages, plates, individual schedules, safety narratives, ratings, and attendance records.

## Why This Matters

Transportation instability can prevent willing people from reaching scheduled work. Got2Get2Work's theory of change is that verified worksite cohorts, recurring schedule compatibility, mutual consent, and explicit recovery flows can make existing commuter capacity easier to coordinate. The intended outcomes are fewer commute-related disruptions, more protected shifts, lower worker transportation burden, and a measurable workforce benefit for employers. These outcomes remain hypotheses until supported by real pilot evidence.

## 500–1000 Word Narrative

Got2Get2Work addresses a practical barrier to economic participation: a worker can be ready and willing to work but still lose a shift when transportation fails. The product turns overlapping coworker commutes into an employer-supported coordination benefit while preserving worker choice and limiting employer access to aggregate program information.

Workers create an account, verify their email and employer/worksite membership, define recurring schedules, and choose whether they can drive, ride, or do either for each commute direction. Deterministic policy code checks hard constraints including worksite membership, schedule windows, consent, blocks, available seats, and detour limits. It ranks only eligible candidates and produces fact-limited explanations. Both coworkers must approve before pickup and vehicle details are revealed. Cancellation and backup flows remain explicit; Got2Get2Work does not guarantee transportation, employment attendance, reimbursement, or ride completion.

Gemini operates as a privacy-limited site coordinator for the employer-sponsored program. The service supplies only allowlisted aggregate metrics, such as enrollment, confirmed rides, cancellation activity, recovery activity, and self-reported protected shifts. Gemini must return a structured recommendation using server-owned action codes and cite the aggregate fact identifiers that support it. The server validates the response before presenting it to a human administrator. Gemini cannot approve a worker, override a safety restriction, expose an address, contact employees, authorize spending, or promise a ride. Deterministic matching and authorization remain authoritative.

This division of responsibility is intentional. Workers decide whether to participate, what schedule information to confirm, whether to request or accept a commute, and whether to share proximity. Employer administrators verify roster membership and manage the pilot. The founder remains responsible for customer discovery, privacy review, incident escalation, financial reporting, and product decisions. Gemini assists with operational prioritization inside a narrow, auditable boundary.

The production architecture is API-first and modular. The typed Expo/React Native client is separated from a typed Fastify API. Google Cloud Run hosts containerized services; Firebase Authentication provides identity; Firestore stores tenant-scoped operational records; Secret Manager protects server credentials; and Gemini provides the aggregate coordinator. Repository, service, and transaction boundaries allow storage or interface components to evolve independently. The system uses structured errors, logging, strict CORS, dedicated runtime identities, least-privilege access, revocation-aware token checks, and transactional safety restrictions.

The business model is B2B2C. Employers, workforce programs, or worksites would pay a platform or pilot fee to provide the benefit; workers would not pay a monthly subscription. Got2Get2Work does not process informal driver reimbursement. The product may show a coarse commute-cost estimate and record mutual acknowledgment while leaving any exchange outside the platform. The initial market is South Florida shift-based organizations where attendance reliability matters, including healthcare, hospitality, logistics, senior care, education, and municipal workforces.

Impact will be measured through verified accounts, approved members, match discovery, match acceptance, confirmed carpools, cancellations, successful backup matches, participant completion responses, and self-reported protected shifts. Employer reporting uses minimum-cohort suppression and aggregate definitions. No fictional demo values are presented as customer results. Revenue, users, expenses, and testimonials will be reported exactly as evidenced in the final form, including zero values and related-party revenue where applicable.

AI helped build and operate the business, but AI governance became a product requirement rather than a disclaimer. Codex supported architecture, implementation, debugging, testing, security review, deployment, and submission preparation. Gemini's production role is deliberately narrower: transform privacy-safe aggregate facts into validated operational recommendations. This creates an AI-native operating loop without delegating consequential employment, safety, or access decisions to a model.

At scale, the product could protect economic opportunity for workers and reduce avoidable staffing disruption for employers. It could also create implementation, customer-success, trust-and-safety, and local mobility-partnership work beyond the founding team. Those are potential outcomes, not current claims. The immediate objective is a controlled South Florida pilot that establishes whether recurring coworker coordination can protect real shifts safely and measurably.

## How We Used AI

- Gemini produces structured, aggregate site-coordinator recommendations from allowlisted facts.
- The server validates action codes and cited fact identifiers before display.
- Gemini receives no names, home addresses, messages, precise routes, plates, or individual attendance records.
- Deterministic policy code controls eligibility, matching, safety restrictions, consent, and state transitions.
- A deterministic fallback preserves availability and is visibly distinguished from a live Gemini result.

## How We Used Codex

Codex served as an architecture and implementation collaborator: reviewing the existing code, designing typed module boundaries, implementing and testing authentication and membership flows, hardening Firestore transactions, reviewing trust-and-safety controls, validating container builds, deploying to Google Cloud, diagnosing production authentication failures, and preparing evidence-backed submission materials. Human approval remained required for cloud IAM changes, administrator bootstrap, legal positioning, factual claims, and final submission.

## Key Features

- Firebase account creation, email verification, password reset, and session revocation checks
- Employer/worksite referral enrollment and administrator approval
- Recurring commute schedules and independent direction roles
- Deterministic matching with explicit hard gates and explanations
- Mutual ride request and acceptance
- In-app messaging with personal-contact filtering
- Cancellation and standing-backup recovery
- Basic privacy-preserving pickup proximity
- Safety reporting, blocking, ratings, and ride history foundations
- Employer dashboard with cohort-suppressed aggregate metrics
- Audited referral and membership operations
- Containerized Android/web client and typed Fastify API on Google Cloud

## Architecture

Expo / React Native / TypeScript client → typed HTTPS APIs → Fastify services and repositories → Firebase Authentication and Firestore. Cloud Run provides container hosting; Secret Manager stores server secrets; Gemini is invoked only from the server-side aggregate coordinator. Safety restrictions, moderation decisions, audit events, and ride confirmation checks use transactional or fail-closed controls.

## Testing Instructions

1. Open the public demonstration URL below in a current desktop browser.
2. Use the fictional demo path; do not enter real personal information.
3. Accept the required policies while leaving optional permissions independently controlled.
4. Configure a recurring schedule and Driver/Passenger/Either roles.
5. Review the fact-limited match explanation, send a request, switch personas, and accept it.
6. Simulate a cancellation and accept the standing backup offer.
7. Open the employer dashboard and review its fictional-data notice and aggregate privacy boundary.
8. Trigger the site-coordinator brief and confirm the UI identifies whether the result is live Gemini or deterministic fallback.

Production administrator access is not included in public judge credentials because it contains real operational records. The isolated fictional demonstration is the unrestricted judging surface.

## Public Demo Link

https://destr0yering.github.io/got2get2work/

Production marketing site: https://got2get2work.com/

## Public Repository Link

https://github.com/Destr0yering/got2get2work

TODO: confirm the repository contains commit `473f158948dc2125c43a1d227c00926794162988` or later and is shared with `testing@devpost.com` and `judging@hacker.fund` before checking the form confirmation.

## Demo Video

TODO: add a public YouTube or Vimeo URL. Keep the video under three minutes.

Outline:

1. Problem and worker-controlled benefit — 20 seconds
2. Schedule, role, and explainable match — 35 seconds
3. Mutual acceptance and privacy reveal — 30 seconds
4. Cancellation and backup recovery — 25 seconds
5. Employer aggregate dashboard — 25 seconds
6. Live Gemini structured recommendation and boundaries — 30 seconds
7. Google Cloud architecture, verified evidence, and honest business results — 15 seconds

## Screenshot Shot List

1. Worker Today screen with next shift and sponsored-benefit framing
2. Explainable eligible match before personal details are revealed
3. Confirmed commute plus cancellation/backup recovery
4. Employer aggregate dashboard with privacy notice
5. Live Gemini recommendation with cited aggregate facts and source badge
6. Cloud Run healthy services and Gemini/API observability dashboard, with secrets and personal information redacted

## Submission Readiness Notes

- Live Devpost project ID: `1351859`; current state observed August 15: `submission_pre_draft`, title `Untitled`, no tagline, description, or video.
- Registered for Build with Gemini XPRIZE.
- Category recommendation: Entrepreneurship & Job Creation.
- Submitter recommendation: Individual, unless a qualifying legal organization is intentionally entering.
- Country recommendation: United States, subject to participant confirmation.
- Learning level recommendation: Significant.
- Current local validation record includes passing typed builds and automated suites; final evidence should use the latest retained test output.
- Never describe fictional demo identities or metrics as users, customers, revenue, or measured impact.

## Known Limitations

- Closed South Florida pilot; not a transportation guarantee or dispatch service
- Android-first; iOS is outside the first production release
- Google Calendar and low-data proximity require further device and production validation
- Privileged administrator mutations require MFA; integrated enrollment/recovery remains launch work
- Public demonstration uses fictional records and deterministic scenarios
- Customer, revenue, user, and outcome evidence must be supplied separately and truthfully

## TODO Official Form Fields

- Start date (MM-DD-YY): **participant confirmation required; must be on or after 05-19-26**
- Submitter type: **participant confirmation required**
- Organization name/EIN: **only if Organization**
- Country: **participant confirmation required**
- Category: `Entrepreneurship & Job Creation`
- Pre-existing business resources: **write exact disclosure**
- Total revenue and May/June/July/August breakdown: **verified values required, even if $0**
- Related-party revenue: **verified value required, even if $0**
- Total expenses and category percentages: **verified values required**
- COGS and explanation: **verified values required**
- Marketing/customer-acquisition expense: **verified value required**
- Users acquired and paying users: **verified counts required**
- Public testimonial: **URL or omit**
- Project-running evidence upload: **required PDF/PNG/JPG/JPEG**
- Supporting production evidence pack prepared locally: `output/pdf/got2get2work-xprize-production-evidence.pdf`; manually attach it together with the required Cloud invoices and Gemini observability evidence.
- P&L upload: **required PDF/PNG/JPG/JPEG**
- Shared-repository confirmation: **do not check until access is verified**
- Demo video URL: **required**
- Thumbnail: **required through Devpost project UI/upload**
- Codex session ID: **not requested by the current live XPRIZE form**
- Agentic Economy Prize fields: **leave blank unless a qualifying Circle integration actually exists**
