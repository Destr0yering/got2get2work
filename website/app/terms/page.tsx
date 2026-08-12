import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "../site-chrome";

export const metadata: Metadata = {
  title: "Prototype terms",
  description:
    "Prototype and pilot terms for Got2Get2Work coworker commute coordination, including user control, driver responsibilities, and service limitations.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="legal-shell shell">
        <header className="legal-hero">
          <p className="eyebrow">MVP prototype terms</p>
          <h1>Terms for evaluating the Got2Get2Work demonstration.</h1>
          <p className="legal-updated">Last updated: July 23, 2026</p>
          <p className="legal-intro">
            These terms describe a prototype and pilot design. They are not a substitute for
            jurisdiction-specific legal review.
          </p>
        </header>

        <section className="legal-section">
          <h2>Coordination service</h2>
          <p>
            Got2Get2Work helps coworkers discover and coordinate potential carpools. It does not
            provide transportation, employ drivers, act as a transportation carrier, guarantee a
            ride, or verify that a person is safe to ride with.
          </p>
        </section>

        <section className="legal-section">
          <h2>Eligibility</h2>
          <p>
            The MVP is intended for adults who belong to a participating workplace group. A work-email
            badge indicates workplace affiliation only. It is not a background, identity, license,
            insurance, driving-record, or vehicle-safety check.
          </p>
        </section>

        <section className="legal-section legal-grid">
          <div>
            <h2>Driver responsibilities</h2>
            <p>
              A driver is responsible for maintaining every license, registration, insurance,
              vehicle condition, and legal requirement applicable in their jurisdiction. Riders and
              drivers decide independently whether to participate.
            </p>
          </div>
          <div>
            <h2>Expense sharing</h2>
            <p>
              Any amount shown is a suggested expense share, not a fare, wage, or reimbursement
              guarantee. The MVP does not process payments. Users remain responsible for applicable
              carpool, insurance, tax, employment, and transportation rules.
            </p>
          </div>
        </section>

        <section className="legal-section">
          <h2>User control</h2>
          <p>
            An AI agent may structure schedules, explain computed options, and propose backups. It
            cannot accept or cancel a ride, contact another person, commit payment, or reveal personal
            information without explicit user approval.
          </p>
        </section>

        <section className="legal-section">
          <h2>Schedule sources</h2>
          <p>
            Users may enter shifts manually, import an <code>.ics</code> file, subscribe to an
            available feed, or connect a supported calendar account with read-only permission.
            Upstream schedule information may be delayed, incomplete, duplicated, changed, or
            cancelled. Users must review displayed shifts and confirm their actual schedule and
            commute plan independently.
          </p>
        </section>

        <section className="legal-section">
          <h2>Optional permissions</h2>
          <p>
            Acceptance of these terms should remain separate from schedule-connection and commute-
            notification choices. Those choices should be optional, begin disabled, and remain
            changeable. In the current demonstration, no external scheduling account is connected and
            no operating-system push notification is sent.
          </p>
        </section>

        <section className="legal-section">
          <h2>Safety and account controls</h2>
          <p>
            Users must follow traffic laws, use seat belts, meet only at agreed locations, and avoid
            harassment and discrimination. A real pilot requires server-enforced reporting and
            blocking, documented incident handling, and clear emergency guidance. In an emergency,
            contact local emergency services; do not rely on Got2Get2Work as an emergency-response
            service.
          </p>
        </section>

        <section className="legal-section warning-section">
          <h2>No warranty</h2>
          <p>
            The prototype and fictional demo data are provided “as is.” Estimates, match options,
            schedules, detours, savings, arrival times, and availability may be wrong or change.
          </p>
        </section>

        <section className="legal-section">
          <h2>Final review required before a real pilot</h2>
          <p>
            Counsel-reviewed terms must address privacy, workplace participation, driver screening,
            insurance, incident handling, accessibility, payments, taxes, local transportation rules,
            and dispute resolution before real workforce enrollment.
          </p>
        </section>

        <section className="legal-contact">
          <h2>Questions</h2>
          <p>
            Email <a href="mailto:support@got2get2work.com">support@got2get2work.com</a>. This inbox is
            not an emergency service.
          </p>
          <Link className="text-link" href="/privacy">
            Read the privacy notice <span>→</span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
