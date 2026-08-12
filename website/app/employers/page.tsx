import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "../site-chrome";

export const metadata: Metadata = {
  title: "For employers",
  description:
    "Explore a privacy-conscious Got2Get2Work pilot model for employer-sponsored commute coordination and aggregate program evaluation.",
};

export default function EmployersPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="subhero employer-hero shell">
          <div>
            <div className="status-pill">
              <span className="status-dot" />
              EMPLOYER PILOT CONCEPT
            </div>
            <p className="eyebrow">Commute support for fixed-shift teams</p>
            <h1>
              Explore attendance support without <span>turning commuting into surveillance.</span>
            </h1>
            <p className="lede">
              A controlled pilot could help opted-in workers coordinate recurring carpools and
              evaluate approved recovery options—while employer reporting remains limited to
              program-appropriate aggregate information.
            </p>
            <div className="button-row">
              <a
                className="button button-primary"
                href="mailto:hello@got2get2work.com?subject=Worksite%20pilot"
              >
                Discuss a pilot
              </a>
              <Link className="button button-secondary" href="/workers">
                See the worker demonstration
              </Link>
            </div>
          </div>
          <div className="metrics-console" aria-label="Conceptual employer dashboard">
            <div className="command-top">
              <span>PILOT // AGGREGATE VIEW</span>
              <span className="live-tag">CONCEPTUAL DASHBOARD</span>
            </div>
            <div className="metrics-grid target-metrics">
              <div>
                <strong>Target</strong>
                <span>opted-in enrollment</span>
              </div>
              <div>
                <strong>Target</strong>
                <span>active commute plans</span>
              </div>
              <div>
                <strong>Target</strong>
                <span>recovery attempts</span>
              </div>
              <div>
                <strong>Target</strong>
                <span>aggregate pilot cost</span>
              </div>
            </div>
            <p>No measured customer outcomes are presented. The dashboard is a design demonstration.</p>
          </div>
        </section>

        <section className="proof-band employer-proof">
          <div className="shell employer-value">
            <p>Potential pilot environments where transportation gaps can disrupt fixed shifts:</p>
            <span>Warehousing</span>
            <span>Manufacturing</span>
            <span>Healthcare</span>
            <span>Hospitality</span>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading narrow">
            <p className="eyebrow">Planned pilot value</p>
            <h2>A workforce benefit with a specific staffing job to evaluate.</h2>
          </div>
          <div className="feature-grid employer-features">
            <article>
              <span>01</span>
              <h3>Support recurring shifts</h3>
              <p>Evaluate coordination around early, late, overnight, and variable schedule windows.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Define recovery paths</h3>
              <p>Establish which backup options the employer may approve when a primary plan changes.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Test targeted support</h3>
              <p>Measure employer-defined credits or rescue budgets against documented pilot activity.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Minimize employer visibility</h3>
              <p>Design reports around aggregate adoption and program operation, not personal trip surveillance.</p>
            </article>
          </div>
        </section>

        <section className="section shell split-section">
          <div className="panel">
            <p className="eyebrow">Proposed aggregate view</p>
            <h2>Signals for evaluating the benefit.</h2>
            <ul className="signal-list good-list">
              <li>Eligible and opted-in participant counts</li>
              <li>Aggregate commute-plan activity</li>
              <li>Aggregate recovery attempts and outcomes</li>
              <li>Employer-defined program costs and assumptions</li>
            </ul>
          </div>
          <div className="panel privacy-panel">
            <p className="eyebrow">Keep outside the employer view</p>
            <h2>Personal commute details.</h2>
            <ul className="signal-list stop-list">
              <li>Home addresses or exact saved locations</li>
              <li>Personal ride messages</li>
              <li>Unrelated calendar events or raw schedule content</li>
              <li>Automated discipline or employment decisions</li>
            </ul>
          </div>
        </section>

        <section className="section shell pilot-strip">
          <div>
            <p className="eyebrow">Pilot hypothesis</p>
            <h2>Start with one site and one difficult shift window.</h2>
          </div>
          <div className="pilot-steps">
            <span>01 Define eligibility and safeguards</span>
            <span>02 Invite an opted-in group</span>
            <span>03 Measure program operation</span>
            <span>04 Review with workers and counsel</span>
          </div>
        </section>

        <section className="section shell legal-callout">
          <span className="delivery-label delivery-label-3">Required before launch</span>
          <h2>A real pilot needs legal, insurance, safety, accessibility, and incident-response review.</h2>
          <p>
            The website describes a product direction—not a transportation guarantee or a substitute
            for employer, insurance, regulatory, or legal analysis.
          </p>
          <Link className="text-link" href="/terms">
            Review the prototype terms <span>→</span>
          </Link>
        </section>

        <section className="cta shell">
          <div>
            <p className="eyebrow">Open a channel</p>
            <h2>Design a commute pilot around your staffing reality.</h2>
          </div>
          <a
            className="button button-primary"
            href="mailto:hello@got2get2work.com?subject=Employer%20pilot%20conversation"
          >
            Talk with the team
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
