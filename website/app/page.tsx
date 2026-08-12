import Link from "next/link";
import { Footer, Header } from "./site-chrome";

const protections = [
  {
    code: "01",
    title: "Protect the paycheck",
    copy: "The current demonstration shows how expense sharing with a verified coworker could keep transportation from consuming too much of a shift’s earnings.",
  },
  {
    code: "02",
    title: "Protect the shift",
    copy: "The demonstration can explain backup options when a ride changes. People—not an automated agent—approve every next step.",
  },
  {
    code: "03",
    title: "Protect personal details",
    copy: "Matching begins with schedule windows and a general pickup area rather than publishing a home address.",
  },
];

const deliveryStages = [
  {
    label: "Current demo",
    title: "Shift-aware coordination",
    copy: "Explore fictional matches, mutual approval, schedule reasoning, and privacy-first information sequencing.",
  },
  {
    label: "Pilot plan",
    title: "Authenticated workplace program",
    copy: "Add real workplace membership, employer administration, account controls, and approved support options.",
  },
  {
    label: "Roadmap",
    title: "Broader mobility integrations",
    copy: "Evaluate calendar synchronization, transit signals, and employer-funded fallback transportation under reviewed policies.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="hero shell">
          <div className="hero-copy">
            <div className="status-pill">
              <span className="status-dot" />
              CURRENT PRODUCT DEMONSTRATION
            </div>
            <p className="eyebrow">For when you’ve got to get to work</p>
            <h1>
              Your shift has a destination. <span>Your crew can help you reach it.</span>
            </h1>
            <p className="lede">
              Got2Get2Work demonstrates how coworkers with compatible shifts and routes could
              coordinate practical rides—helping workers protect their income and helping
              employers explore more resilient commute support.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/workers">
                Explore the worker demo
              </Link>
              <Link className="button button-secondary" href="/employers">
                Explore an employer pilot
              </Link>
            </div>
            <p className="microcopy">
              Fictional demo data · mutual approval · no guaranteed transportation
            </p>
          </div>

          <div className="command-card" aria-label="Conceptual commute match demonstration">
            <div className="command-top">
              <span>G2W // ROUTE COMMAND</span>
              <span className="live-tag">CONCEPTUAL DEMO</span>
            </div>
            <div className="shift-label">TUESDAY · 07:00 SHIFT</div>
            <h2>Crew connection suggested</h2>
            <div className="crew-row">
              <div className="crew-avatar captain">C</div>
              <div>
                <span className="role-label">CAPTAIN</span>
                <strong>Jordan · fictional driver</strong>
              </div>
              <span className="match-score">94%</span>
            </div>
            <div className="route-line">
              <span className="route-stop">Captain</span>
              <i />
              <span className="route-stop accent">Public pickup</span>
              <i />
              <span className="route-stop green">Work</span>
            </div>
            <div className="crew-row">
              <div className="crew-avatar mate">M</div>
              <div>
                <span className="role-label">MATE</span>
                <strong>Riley · fictional rider</strong>
              </div>
              <span className="time-window">06:34</span>
            </div>
            <div className="command-footer">
              <span>Example detour</span>
              <span>Suggested expense share</span>
              <span>Both approve</span>
            </div>
          </div>
        </section>

        <section className="proof-band" aria-label="Design principles">
          <div className="shell proof-grid">
            <div>
              <strong>Workplace context</strong>
              <span>Designed for a trusted coworker network</span>
            </div>
            <div>
              <strong>Mutual approval</strong>
              <span>No surprise ride pairings</span>
            </div>
            <div>
              <strong>General area first</strong>
              <span>Exact home addresses are not required</span>
            </div>
            <div>
              <strong>Human control</strong>
              <span>The agent suggests; people decide</span>
            </div>
          </div>
        </section>

        <section className="section shell" id="delivery-status">
          <div className="section-heading">
            <p className="eyebrow">Product delivery status</p>
            <h2>Clear boundaries between what works now, what belongs in a pilot, and what remains on the roadmap.</h2>
          </div>
          <div className="delivery-grid">
            {deliveryStages.map((stage, index) => (
              <article key={stage.label}>
                <span className={`delivery-label delivery-label-${index + 1}`}>{stage.label}</span>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">Shift protection protocol</p>
            <h2>More than a ride concept: a buffer between a commute problem and a lost day’s income.</h2>
          </div>
          <div className="protection-grid">
            {protections.map((item) => (
              <article className="protection-card" key={item.code}>
                <span className="card-code">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell split-section">
          <div className="panel panel-mate">
            <p className="eyebrow">For workers</p>
            <h2>Keep more of what your shift earns.</h2>
            <p>
              Review fictional coworker matches, understand why a route may fit, and see how
              public meeting points and mutual approval can limit unnecessary exposure.
            </p>
            <ul className="signal-list">
              <li>Match around actual shift windows</li>
              <li>Begin with a general pickup area</li>
              <li>See the reason behind every suggested match</li>
            </ul>
            <Link className="text-link" href="/workers">
              See the worker experience <span>→</span>
            </Link>
          </div>
          <div className="panel panel-employer">
            <p className="eyebrow">For employers</p>
            <h2>Explore commute support without workplace surveillance.</h2>
            <p>
              Review how a pilot could support opted-in shift teams while limiting employer
              reporting to program-appropriate aggregate measures.
            </p>
            <ul className="signal-list">
              <li>Focus on transportation-related attendance disruption</li>
              <li>Define approved support and recovery paths</li>
              <li>Keep names, exact locations, and ride messages private</li>
            </ul>
            <Link className="text-link" href="/employers">
              See the employer pilot model <span>→</span>
            </Link>
          </div>
        </section>

        <section className="section shell">
          <div className="how-header">
            <div>
              <p className="eyebrow">How the crew forms</p>
              <h2>Simple enough for a morning shift. Careful enough for real life.</h2>
            </div>
            <div className="system-badge">
              THE AGENT SUGGESTS
              <br />
              <strong>PEOPLE DECIDE</strong>
            </div>
          </div>
          <ol className="steps">
            <li>
              <span>01</span>
              <div>
                <h3>Confirm the workplace context</h3>
                <p>The current demo illustrates coworker-only matching around a shared job site.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Add the shift</h3>
                <p>Schedule windows and a general pickup area identify practical overlaps.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Review and approve</h3>
                <p>Captain and Mate each evaluate timing, route facts, and the suggested expense share.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Consider a backup</h3>
                <p>The demonstration can explain another fictional match or an alternative commute option.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="cta shell">
          <div>
            <p className="eyebrow">Pilot conversation</p>
            <h2>Build a better route to reliable work.</h2>
          </div>
          <div className="button-row">
            <a
              className="button button-primary"
              href="mailto:hello@got2get2work.com?subject=Got2Get2Work%20pilot%20conversation"
            >
              Start a conversation
            </a>
            <Link className="button button-secondary" href="/privacy">
              Review privacy boundaries
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
