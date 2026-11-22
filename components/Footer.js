import Link from "next/link";
import { FOOTER_LINKS } from "../lib/nav";
import { SITE } from "../lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" />
            <span>{SITE.name}</span>
          </Link>
          <p>{SITE.tagline}</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        {SITE.developer && <span>Developed By {SITE.developer}</span>}
      </div>
    </footer>
  );
}
