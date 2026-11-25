import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <div className="site-bg" aria-hidden="true" />
      <SiteHeader />
      <main id="main" className="main">
        <section className="page-hero">
          <div className="container">
            <h1>Page not found</h1>
            <p className="page-hero__lede">We could not find that page. It may have moved or no longer exists.</p>
            <div className="page-hero__actions">
              <Link href="/" className="btn btn--primary">Back to home</Link>
              <Link href="/events/upcoming" className="btn btn--ghost">See upcoming events</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
