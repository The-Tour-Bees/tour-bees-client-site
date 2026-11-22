"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "../lib/nav";
import { SITE } from "../lib/site";
import CurrencySwitcher from "./CurrencySwitcher";

const isActive = (pathname, item) => {
  const hrefs = [item.href, ...(item.children ?? []).map((c) => c.href)].filter(Boolean);
  return hrefs.some((h) => (h === "/" ? pathname === "/" : pathname === h || pathname.startsWith(`${h}/`)));
};

// overlay: transparent, sits on top of the home hero. Default: solid bar for inner pages.
export default function SiteHeader({ overlay = false }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={overlay ? "site-header site-header--overlay" : "site-header site-header--solid"}>
      <div className="site-header__inner">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" />
          <span>{SITE.name}</span>
        </Link>

        <button
          type="button"
          className={menuOpen ? "burger burger--open" : "burger"}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="site-menu" className={menuOpen ? "menu menu--open" : "menu"}>
          <nav className="nav" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(pathname, item);
              const cls = active ? "nav__link nav__active" : "nav__link";

              if (!item.children) {
                return (
                  <div key={item.label} className="nav__item">
                    <Link href={item.href} className={cls} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={item.label} className="nav__item nav__item--has-sub">
                  {item.href ? (
                    <Link href={item.href} className={cls}>
                      {item.label}
                      <Chevron />
                    </Link>
                  ) : (
                    <button type="button" className={cls}>
                      {item.label}
                      <Chevron />
                    </button>
                  )}
                  <div className="nav__sub">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={pathname === child.href ? "nav__sublink nav__active" : "nav__sublink"}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="header-actions">
            <CurrencySwitcher />
            <Link href="/login" className="signin">Sign in</Link>
            <Link href="/investor" className="btn-nav">Become an expert</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Chevron() {
  return (
    <svg className="nav__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
