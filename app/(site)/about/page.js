import Link from "next/link";
import PageHero from "../../../components/PageHero";
import { SITE } from "../../../lib/site";

export const metadata = {
  title: "About Us",
  description: `About ${SITE.name}: events, customized trips and stays. ${SITE.tagline}.`,
};

// TODO: replace this starter copy with the team's own story, team and milestones.
const OFFERINGS = [
  { title: "Events", text: "Join trips and gatherings led by our hosts.", href: "/events" },
  { title: "Customized trips", text: "Domestic and international trips planned around you.", href: "/custom-trip" },
  { title: "Hotels and resorts", text: "Send an enquiry and we find the right stay.", href: "/hotels" },
  { title: "Houseboats", text: "Relaxed stays on the water, arranged for your group.", href: "/houseboats" },
  { title: "VIP membership", text: "Member prices and offers for people who travel with us often.", href: "/vip" },
];

const VALUES = [
  { title: "Hand-picked experiences", text: "We choose destinations, stays and hosts ourselves, so you do not have to sift through endless options." },
  { title: "People you can trust", text: "Every host and agent works with us under their own account and is approved before they start." },
  { title: "Prices in your currency", text: "See prices in BDT, USD, EUR or INR, whichever suits you." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About The Tour Bees"
        description="Tour For Life. We bring travellers together through events, customized trips and carefully chosen stays."
      />

      <section className="section">
        <div className="container prose">
          <h2>Who we are</h2>
          <p>
            {SITE.name} is a travel community. We organise events, plan customized trips within
            Bangladesh and abroad, and help guests find hotels, resorts and houseboats.
          </p>
          <p>
            Our hosts run the trips, our agents help you book, and our members enjoy offers made
            for people who travel with us again and again.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2>What we do</h2>
            <p>Everything you need for your next journey, in one place.</p>
          </div>
          <div className="grid grid--3">
            {OFFERINGS.map((o) => (
              <Link key={o.href} href={o.href} className="card card--link">
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>What we care about</h2>
          </div>
          <div className="grid grid--3">
            {VALUES.map((v, i) => (
              <div key={v.title} className="card">
                <div className="card__num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container cta-band">
          <h2>Ready to plan your trip?</h2>
          <p>Tell us where you want to go and we will take it from there.</p>
          <div className="cta-band__actions">
            <Link href="/custom-trip" className="btn btn--primary">Plan a trip</Link>
            <Link href="/contact" className="btn btn--ghost">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
