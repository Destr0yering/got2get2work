"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { href: "/workers", label: "For workers" },
  { href: "/employers", label: "For employers" },
  { href: "/assessment", label: "Paid assessment" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="shell nav-wrap">
          <Link className="brand" href="/" aria-label="Got2Get2Work home">
            <Image
              src="/got2get2work-logo.png"
              width={180}
              height={76}
              alt="Got2Get2Work"
              priority
            />
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <a className="nav-cta" href="mailto:hello@got2get2work.com?subject=Got2Get2Work%20inquiry">
            Contact
          </a>

          <button
            ref={menuButtonRef}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>

        {open ? (
          <nav id="mobile-navigation" className="mobile-nav shell" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a
              className="mobile-contact"
              href="mailto:hello@got2get2work.com?subject=Got2Get2Work%20inquiry"
              onClick={() => setOpen(false)}
            >
              Contact the team
            </a>
          </nav>
        ) : null}
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <Image src="/got2get2work-logo.png" width={170} height={72} alt="Got2Get2Work" />
          <p>A privacy-minded commute coordination demonstration for shift teams.</p>
        </div>
        <div className="footer-links" aria-label="Footer navigation">
          <Link href="/workers">Workers</Link>
          <Link href="/employers">Employers</Link>
          <Link href="/assessment">Paid assessment</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@got2get2work.com">Support</a>
        </div>
        <p className="footer-note">
          The current product is a demonstration. A ride, match, arrival, savings estimate,
          workplace verification, and transportation availability are not guaranteed.
        </p>
      </div>
      <div className="shell copyright-row">
        <span>© 2026 Got2Get2Work.</span>
        <span>Human approval remains required for every proposed ride action.</span>
      </div>
    </footer>
  );
}
