import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "../site-chrome";

export const metadata: Metadata = {
  title: "For workers",
  description:
    "Explore the Got2Get2Work worker demonstration: shift-aware coworker matching, mutual approval, and privacy-first commute coordination.",
};

export default function WorkersPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="subhero shell">
          <div>
            <div className="status-pill">
              <span className="status-dot" />
              WORKER DEMONSTRATION
            </div>
            <p className="eyebrow">Captain or Mate—same crew</p>
            <h1>
              Spend less getting there. <span>Keep more of your shift.</span>
            </h1>
            <p className="lede">
              Got2Get2Work demonstrates how coworkers could coordinate practical, mutually
              approved rides around shifts they already share. All names and ride scenarios on
              this site are fictional.
            </p>
            <div className="button-row">
              <a
                className="button button-primary"
                href="mailto:hello@got2get2work.com?subject=Worker%20interest"
              >
                Share worker feedback
              </a>
              <Link className="button button-secondary" href="/">
                Back to mission control
              </Link>
            </div>
          </div>
          <div className="role-stack" aria-label="Conceptual worker roles">
            <article>
              <span className="role-orb captain">C</span>
              <div>
                <small>FICTIONAL DRIVER ROLE</small>
                <h2>Captain</h2>
                <p>Already driving? Review whether offering an approved seat could share trip expenses.</p>
              </div>
            </article>
            <article>
              <span className="role-orb mate">M</span>
              <div>
                <small>FICTIONAL RIDER ROLE</small>
                <h2>Mate</h2>
                <p>Need a lift? Review a coworker route that overlaps with the same shift.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading narrow">
            <p className="eyebrow">Current demonstration</p>
            <h2>Designed around the part that matters: arriving without losing the value of the workday.</h2>
          </div>
          <div className="feature-grid">
            <article>
              <span>⌁</span>
              <h3>Shift-aware examples</h3>
              <p>Arrival and departure windows help explain why a fictional match may fit changing schedules.</p>
            </article>
            <article>
              <span>◎</span>
              <h3>General areas first</h3>
              <p>The prototype accepts a cross-street or general-area label rather than requiring an exact home address.</p>
            </article>
            <article>
              <span>↻</span>
              <h3>Backup explanations</h3>
              <p>When a fictional trip changes, the agent can explain another coworker option or commute alternative.</p>
            </article>
            <article>
              <span>◇</span>
              <h3>Explainable choices</h3>
              <p>See relevant timing, route overlap, detour, accessibility, and expense-sharing facts.</p>
            </article>
          </div>
        </section>

        <section className="section shell safety-grid">
          <div>
            <p className="eyebrow">Privacy by sequence</p>
            <h2>Only reveal what the trip stage needs.</h2>
            <p className="body-copy">
              Got2Get2Work is not designed as public stranger discovery. The demonstration begins
              inside a fictional workplace group and progressively reveals seeded information only
              after mutual acceptance.
            </p>
          </div>
          <div className="privacy-console">
            <div>
              <span>01</span>
              <p>
                <strong>Before matching</strong>Workplace, shift windows, and a general pickup-area label
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>While reviewing</strong>Compatibility facts and public meeting-point options
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>After both accept</strong>Seeded details needed to demonstrate the ride flow
              </p>
            </div>
          </div>
        </section>

        <section className="section shell delivery-strip">
          <div>
            <span className="delivery-label delivery-label-2">Pilot plan</span>
            <h2>Authenticated accounts and real workplace membership require a controlled pilot.</h2>
          </div>
          <p>
            Before real participants use the service, workplace verification, safety procedures,
            support operations, accessibility, insurance implications, and local transportation rules
            require formal review.
          </p>
        </section>

        <section className="cta shell">
          <div>
            <p className="eyebrow">Worker feedback</p>
            <h2>Tell us where your commute becomes unreliable.</h2>
          </div>
          <a
            className="button button-primary"
            href="mailto:hello@got2get2work.com?subject=Worker%20commute%20feedback"
          >
            Share your experience
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
