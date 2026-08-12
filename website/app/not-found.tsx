import Link from "next/link";
import { Footer, Header } from "./site-chrome";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="empty-state shell">
        <p className="eyebrow">Route not found</p>
        <h1>This page missed the connection.</h1>
        <p>Return to mission control and choose another route.</p>
        <Link className="button button-primary" href="/">
          Go to the homepage
        </Link>
      </main>
      <Footer />
    </>
  );
}
