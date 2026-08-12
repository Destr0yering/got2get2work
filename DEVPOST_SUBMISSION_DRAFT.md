# Got2Get2Work — Build with Gemini XPRIZE Draft

**Tagline:** AI-coordinated, employer-sponsored commute resilience for shift workers.

**Recommended category:** Entrepreneurship & Job Creation

**Repository:** https://github.com/Destr0yering/got2get2work

**Judge demo:** https://destr0yering.github.io/got2get2work/

**Built with:** Gemini API, Google Cloud Run, Firebase Authentication, Firestore, Expo, React Native, TypeScript, Node.js

> Evidence rule: replace every bracketed item with verified facts. Never submit brackets, estimates presented as results, fictional demo metrics, or unsupported production claims.

## 500–1000 word narrative draft

Got2Get2Work addresses a practical barrier to economic participation: a worker can be ready and willing to work but still lose a shift when transportation fails. While driving on ride-hail platforms, I repeatedly met people paying for individual rides to the same workplaces and shift windows. Got2Get2Work turns that observation into an employer-sponsored mobility benefit that helps opted-in coworkers coordinate compatible commutes and recover when a plan changes.

The product combines a worker-controlled coordination flow with an AI-assisted operating layer. Workers enter or approve their shift windows, commute role, accessibility constraints, seat availability, and a coarse pickup area. Deterministic policy code checks hard constraints such as workplace membership, arrival and departure windows, active consent, blocks, seats, and detour limits. It ranks only eligible candidates and explains the facts behind each suggestion. Both coworkers must approve before the product reveals a public meeting point and vehicle details. AI cannot declare a driver safe, override a block, approve a match, spend funds, or guarantee transportation.

Gemini operates as a privacy-limited site coordinator for the employer-sponsored program. The production service sends only allowlisted aggregate metrics such as enrolled employees, active carpools, protected shifts, recovery attempts, successful recoveries, and pilot budget assumptions. Gemini selects from a small set of server-owned operational recommendations and cites the exact metric identifiers supporting its result. The server rejects identity-like fields, small cohorts, precise locations, ride messages, and individual attendance records. A deterministic fallback keeps the service usable when Gemini is unavailable, while the interface labels whether the displayed result came from live Gemini or the fallback.

The production AI workflow is: collect consented operational events; aggregate them above the privacy threshold; validate the projection on the server; request a structured Gemini recommendation; validate the returned action code and supporting fact identifiers; present the recommendation to an authorized employer operator; and leave expansion, eligibility, budget, and worker-contact decisions to a human. This creates a useful operating loop without turning AI into an unreviewable authority.

The service uses Google Cloud Run for the application and server API, Secret Manager for the Gemini credential, Firebase Authentication for identity, and Firestore for authenticated account and consent records. The public judge demonstration remains isolated from production records and uses fictional identities so judges can explore the workflow without receiving personal data. Production evidence for the submission will include Cloud Run service status, a redacted Gemini request/response trace, API usage evidence, and screenshots showing the live Gemini badge and cited aggregate facts.

The business model is employer-sponsored. Employers, workforce programs, or participating worksites pay a platform fee and may fund approved ride or recovery credits; employees pay no monthly subscription. The initial customer is a worksite where fixed-shift attendance is operationally important and transportation disruption is measurable. The product's value can be assessed through enrollment, active commute plans, protected shifts, successful recoveries, worker-reported savings, and employer retention. Submitted results must use the verified pilot figures: [CUSTOMERS], [USERS], [PAYING USERS], [REVENUE], [EXPENSES], and [MEASURED OUTCOMES].

Humans remain responsible for the work that requires authority, consent, or judgment. Workers decide whether to participate, what schedule and pickup information to share, whom to request, and whether to accept a recovery option. Employer operators decide pilot scope and budget. The founder handles customer discovery, privacy review, incident escalation, financial reconciliation, and product decisions. Gemini assists with aggregate operational prioritization; deterministic services enforce policy and state transitions.

The business can create and protect economic opportunity beyond the founding team in two ways. First, more reliable commutes can help workers preserve scheduled income and help employers fill shifts without treating transportation as an individual failure. Second, a scaled mobility-benefit program can create implementation, customer-success, trust-and-safety, and local transportation-partnership work. For this submission, those potential effects will be separated from the actual measured evidence gathered during the hackathon.

Building the company this way made AI governance part of the product rather than a disclaimer. The central lesson is that an AI-native business does not need to automate every consequential choice. It needs a continuous, auditable operating role for AI, clear data boundaries, validated outputs, reliable fallbacks, and humans who remain accountable for decisions affecting people.

## Evidence-backed short answers

### How does AI impact the chosen category?

Gemini turns privacy-safe aggregate commute activity into grounded operational recommendations that help a small employer program identify recovery coverage gaps and focus limited resources. The intended impact is better access to dependable work, measured through verified enrollment, protected shifts, successful recoveries, and worker savings.

### How is impact measured?

Report only verified values for enrolled workers, active commute plans, protected shifts, recovery attempts, successful recoveries, paying customers, monthly revenue, worker-reported savings, and employer renewal or expansion. Keep forecasts explicitly labeled as forecasts.

### Business model

Employer-sponsored B2B2C service: a worksite or workforce program pays a recurring platform fee and may maintain a separate recovery-credit budget. Workers do not pay a monthly subscription.

### How the business operates with AI

The server aggregates consented operational events, validates a privacy-minimized projection, asks Gemini for a structured recommendation from an allowlist, verifies the cited fact identifiers, and presents the result to a human operator. Gemini cannot contact workers, alter eligibility, authorize spending, or promise transportation.

### Google Cloud and Gemini use

The implementation targets Google Cloud Run, Secret Manager, Firebase Authentication, and Firestore. The server-side Gemini API call creates an aggregate site-coordinator recommendation using structured JSON output and a bounded timeout. Final submission evidence must prove the deployed services and live call.

## Required factual inserts

- Project start date: `[MM-DD-YY]`
- Submitter type: `[Individual / Team / Organization]`
- Country/countries: `[VERIFIED]`
- Pre-existing resources: `[VERIFIED DISCLOSURE]`
- Total revenue: `[$ VERIFIED]`
- Monthly revenue: `[May / June / July / August]`
- Related-party revenue: `[$ VERIFIED]`
- Total expenses: `[$ VERIFIED]`
- COGS: `[$ VERIFIED]`
- Marketing/customer acquisition: `[$ VERIFIED]`
- Users acquired: `[VERIFIED]`
- Paying users: `[VERIFIED]`
- Public testimonial: `[URL OR OMIT]`
- Video: `[PUBLIC URL]`
