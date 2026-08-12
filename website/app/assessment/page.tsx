import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "../site-chrome";

export const metadata: Metadata = {
  title: "Shift Commute Resilience Assessment",
  description:
    "A fixed-price, AI-assisted assessment for employers evaluating transportation risks around one difficult shift cohort.",
};

const deliverables = [
  "A 30-minute discovery call focused on one worksite and one shift cohort",
  "A data-minimized review of agreed aggregate commute and recovery constraints",
  "A written resilience assessment with prioritized operational recommendations",
  "A 30-minute findings call and a scoped pilot-readiness decision",
];

export default function AssessmentPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="subhero shell">
          <div>
            <div className="status-pill">
              <span className="status-dot" />
              EARLY-ADOPTER SERVICE
            </div>
            <p className="eyebrow">One worksite · one shift cohort · 48-hour delivery target after inputs</p>
            <h1>
              Find the commute gaps putting a difficult shift <span>at risk.</span>
            </h1>
            <p className="lede">
              The Shift Commute Resilience Assessment is a fixed-scope employer service. We use
              agreed aggregate operational facts and a data-minimized Gemini workflow to identify
              coverage gaps and recommend a practical, human-reviewed pilot plan.
            </p>
            <div className="button-row">
              <a
                className="button button-primary"
                href="mailto:hello@got2get2work.com?subject=Reserve%20a%20%24199%20commute%20resilience%20assessment&body=Organization%3A%0AWorksite%3A%0AShift%20cohort%3A%0ABest%20time%20to%20talk%3A"
              >
                Reserve the $199 assessment
              </a>
              <Link className="button button-secondary" href="/privacy">
                Review the privacy boundary
              </Link>
            </div>
            <p className="microcopy">No transportation guarantee · no employee-level surveillance · human-reviewed recommendations</p>
          </div>
          <div className="metrics-console" aria-label="Assessment scope">
            <div className="command-top">
              <span>ASSESSMENT // FIXED SCOPE</span>
              <span className="live-tag">$199 EARLY ADOPTER</span>
            </div>
            <div className="metrics-grid target-metrics">
              <div><strong>1</strong><span>worksite</span></div>
              <div><strong>1</strong><span>shift cohort</span></div>
              <div><strong>48 hr</strong><span>target after discovery and agreed inputs</span></div>
              <div><strong>2 calls</strong><span>discovery and findings</span></div>
            </div>
            <p>We confirm fit, scope, timing, payment, and cancellation terms in writing before invoicing.</p>
          </div>
        </section>

        <section className="proof-band">
          <div className="shell employer-value">
            <p>Designed for fixed-shift environments:</p>
            <span>Warehousing</span><span>Manufacturing</span><span>Healthcare</span><span>Hospitality</span>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading narrow">
            <p className="eyebrow">What the customer receives</p>
            <h2>A completed decision product—not a promise of a future app.</h2>
          </div>
          <div className="feature-grid employer-features">
            {deliverables.map((deliverable, index) => (
              <article key={deliverable}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{deliverable}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell split-section">
          <div className="panel panel-employer">
            <p className="eyebrow">Useful inputs</p>
            <h2>Aggregate operational facts.</h2>
            <ul className="signal-list">
              <li>Approximate cohort size and shift window</li>
              <li>Current transportation-support options</li>
              <li>Aggregate attendance disruption patterns</li>
              <li>Employer-defined pilot constraints and budget</li>
            </ul>
          </div>
          <div className="panel privacy-panel">
            <p className="eyebrow">Not requested</p>
            <h2>Personal commute surveillance.</h2>
            <ul className="signal-list stop-list">
              <li>Employee home addresses or precise routes</li>
              <li>Personal ride messages</li>
              <li>Protected-trait or disciplinary information</li>
              <li>Unrelated calendar content</li>
            </ul>
          </div>
        </section>

        <section className="section shell legal-callout">
          <span className="delivery-label delivery-label-3">Scope boundary</span>
          <h2>The assessment does not operate transportation or certify drivers.</h2>
          <p>
            It produces an operational recommendation for employer review. Any live ride pilot
            requires separate legal, insurance, safety, accessibility, privacy, and incident-response review.
          </p>
        </section>

        <section className="cta shell">
          <div>
            <p className="eyebrow">Early-adopter availability</p>
            <h2>Turn one difficult shift into a decision-ready pilot plan.</h2>
          </div>
          <a
            className="button button-primary"
            href="mailto:hello@got2get2work.com?subject=Reserve%20a%20%24199%20commute%20resilience%20assessment"
          >
            Request the assessment
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
