import { listDestinations, listTrips, SCOPES } from "../lib/trips";
import BuildTripForm from "./BuildTripForm";
import PageHero from "./PageHero";
import TripCard from "./TripCard";
import TripFilters from "./TripFilters";
import TripTabs from "./TripTabs";

const one = (v) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function TripsListing({ scope, searchParams }) {
  const copy = SCOPES[scope];
  const values = {
    q: one(searchParams.q)?.trim(),
    destination: one(searchParams.destination),
    duration: one(searchParams.duration),
    sort: one(searchParams.sort),
  };
  const [trips, destinations] = await Promise.all([listTrips({ scope, ...values }), listDestinations(scope)]);
  const filtered = Boolean(values.q || values.destination || values.duration);

  return (
    <>
      <PageHero title={copy.title} description={copy.description}>
        <a href="#build" className="btn btn--primary">Build my trip</a>
      </PageHero>

      <section className="section">
        <div className="container">
          <TripTabs active={scope} />
          <TripFilters action={`/custom-trip/${scope}`} destinations={destinations} values={values} />

          {trips.length === 0 ? (
            <p className="empty">
              {filtered ? "No trips match your filters." : "Ready-made packages are coming soon. You can still tell us your plan below."}
            </p>
          ) : (
            <div className="grid grid--3">
              {trips.map((t) => (
                <TripCard key={t.slug} trip={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt" id="build">
        <div className="container form-wrap">
          <div className="section__head">
            <h2>Build my {copy.label.toLowerCase()} trip</h2>
            <p>Tell us what you have in mind. We will plan it around you and send a price.</p>
          </div>
          <div className="panel">
            <BuildTripForm scope={scope} />
          </div>
        </div>
      </section>
    </>
  );
}
