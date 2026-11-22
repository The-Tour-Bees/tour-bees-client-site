import Link from "next/link";
import BuildTripForm from "../../../components/BuildTripForm";
import PageHero from "../../../components/PageHero";
import TripCard from "../../../components/TripCard";
import TripTabs from "../../../components/TripTabs";
import { listTrips, SCOPES } from "../../../lib/trips";

export const metadata = {
  title: "Customized Trip",
  description: "Domestic and international trips planned around you. Pick a ready-made package or build your own.",
};

const STEPS = [
  { title: "Tell us your plan", text: "Where, when, how many people and your budget." },
  { title: "We plan it", text: "Our team puts together an itinerary and a price for you." },
  { title: "You travel", text: "Confirm the plan and enjoy the trip. We stay in touch along the way." },
];

export default async function CustomTripPage() {
  const featured = await listTrips({ limit: 6 });

  return (
    <>
      <PageHero title="Customized Trip" description="Trips planned around you, at home or abroad.">
        <a href="#build" className="btn btn--primary">Build my trip</a>
      </PageHero>

      <section className="section">
        <div className="container">
          <TripTabs active="all" />
          <div className="grid grid--2">
            {Object.entries(SCOPES).map(([key, s]) => (
              <Link key={key} href={`/custom-trip/${key}`} className="card card--link path-card">
                <h2>{s.label}</h2>
                <p>{s.description}</p>
                <span className="path-card__go">Browse {s.label.toLowerCase()} trips →</span>
              </Link>
            ))}
          </div>

          {featured.length > 0 && (
            <div className="event-group">
              <div className="event-group__head">
                <h2>Featured packages</h2>
              </div>
              <div className="grid grid--3">
                {featured.map((t) => (
                  <TripCard key={t.slug} trip={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2>How it works</h2>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title} className="card">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="build">
        <div className="container form-wrap">
          <div className="section__head">
            <h2>Build my trip</h2>
            <p>Share your plan and we will come back with an itinerary and a price.</p>
          </div>
          <div className="panel">
            <BuildTripForm />
          </div>
        </div>
      </section>
    </>
  );
}
