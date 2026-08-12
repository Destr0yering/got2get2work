import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "../site-chrome";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "Privacy boundaries, data categories, AI safeguards, location handling, controls, and retention for the Got2Get2Work MVP and demonstration.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="legal-shell shell">
        <header className="legal-hero">
          <p className="eyebrow">MVP privacy notice</p>
          <h1>Privacy boundaries for the Got2Get2Work demonstration and pilot design.</h1>
          <p className="legal-updated">Last updated: August 10, 2026</p>
          <p className="legal-intro">
            This notice describes the current fictional demonstration and the intended authenticated
            pilot architecture. It is not legal advice. Jurisdiction-specific review is required
            before enrolling a real workforce.
          </p>
        </header>

        <section className="legal-section">
          <h2>Data the prototype may use</h2>
          <ul>
            <li>Firebase account identity, work email, employer-benefit membership, and server-assigned role for authenticated pilot accounts.</li>
            <li>Commute role, schedule, time flexibility, and ride preferences.</li>
            <li>A cross-street or general pickup-area label supplied by the user. This remains location information even though it is not an exact home address.</li>
            <li>Ride-request, acceptance, cancellation, recovery, and feedback state.</li>
            <li>Non-identifying reason codes and numeric commute facts for narrowly scoped AI explanations.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Assessment inquiry and delivery data</h2>
          <p>
            For a Shift Commute Resilience Assessment, we may process business contact details,
            discovery-call notes, the agreed scope, invoice status, and aggregate worksite and shift
            facts supplied by the buyer. We ask buyers not to provide employee names, home addresses,
            precise routes, protected-trait information, disciplinary records, or individual attendance histories.
          </p>
          <p>
            Only the minimum agreed aggregate facts should be submitted to Gemini. A human reviews
            model-assisted output before delivery. We will identify material service providers and
            agree retention and deletion expectations in the written scope before accepting payment.
          </p>
        </section>

        <section className="legal-section">
          <h2>Work-calendar and schedule data</h2>
          <p>
            A future pilot may let a user connect a Google Calendar account and choose the specific
            calendar containing work shifts. The service should request read-only access and should
            not scan every personal calendar by default.
          </p>
          <p>
            Synchronization may process a selected calendar identifier, external event identifier,
            start and end time, time zone, event status, last-modified marker, and the minimum cursor
            required to retrieve changes. Candidate events should be reviewed and confirmed by the
            worker before being used for matching.
          </p>
          <p>
            Unrelated personal events, raw descriptions, attendee lists, attachments, meeting links,
            and other unnecessary calendar content should not be retained in the commute profile or
            sent to an AI model.
          </p>
        </section>

        <section className="legal-section legal-grid">
          <div>
            <h2>Data not required by the prototype</h2>
            <ul>
              <li>Exact home address</li>
              <li>Continuous background location</li>
              <li>Payment-card or bank information</li>
              <li>Government ID, driving record, or insurance record</li>
              <li>Employer payroll or individual attendance history</li>
            </ul>
          </div>
          <div>
            <h2>Employer reporting boundary</h2>
            <p>
              Workplace administrators should receive aggregate adoption and reliability measures
              only—not home locations, personal messages, exact individual trip histories, unrelated
              calendar events, or raw schedule-calendar content.
            </p>
          </div>
        </section>

        <section className="legal-section">
          <h2>AI data boundary</h2>
          <p>
            Saved profile-area values, credentials, and raw schedule prose should not be included in
            AI requests. The server should construct a new allowlisted object containing only the
            minimum structured schedule and match facts required for the requested explanation.
            Responses requests should use storage-disabled settings where supported.
          </p>
        </section>

        <section className="legal-section">
          <h2>Location handling in the current demonstration</h2>
          <p>
            The cross-street or general-area label entered during setup remains in local demonstration
            state and appears in Profile. The prototype does not geocode that entry or derive a real
            route from it. Recommended-match cards use broader fictional area labels. After both
            fictional coworkers accept, the demonstration reveals a seeded public meeting point and
            vehicle description.
          </p>
          <p>
            Avoiding an exact home address does not make a cross-street or general-area label anonymous
            or eliminate location privacy risk.
          </p>
        </section>

        <section className="legal-section">
          <h2>Controls and retention</h2>
          <p>
            Authenticated pilot users are intended to have separate consent choices, account export,
            safety reporting, blocking, and permanent account deletion controls. The fictional demo
            stores its state locally. Authenticated pilot records may use Firestore in the service’s
            configured Google Cloud region.
          </p>
          <p>
            Account deletion should remove profile, membership, consent, and block-list records before
            deleting the Firebase identity. Safety reports may require limited retention for incident
            handling, with the reporter identifier removed when the account is deleted where feasible.
          </p>
        </section>

        <section className="legal-contact">
          <h2>Privacy questions</h2>
          <p>
            Email <a href="mailto:support@got2get2work.com">support@got2get2work.com</a>. This inbox is
            not an emergency service.
          </p>
          <Link className="text-link" href="/terms">
            Read the prototype terms <span>→</span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
