import { listEvents, listPlaces } from "../lib/events";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";
import EventTabs from "./EventTabs";
import PageHero from "./PageHero";

const COPY = {
  upcoming: { title: "Upcoming Events", description: "Events you can join soon.", empty: "No upcoming events right now. Check back soon." },
  ongoing: { title: "Ongoing Events", description: "Events happening right now.", empty: "No events are running right now." },
  previous: { title: "Previous Events", description: "A look back at events we have run.", empty: "No previous events to show yet." },
};

const one = (v) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function EventsListing({ status, searchParams }) {
  const copy = COPY[status];
  const values = { q: one(searchParams.q)?.trim(), place: one(searchParams.place), sort: one(searchParams.sort) };
  const [events, places] = await Promise.all([listEvents({ status, ...values }), listPlaces(status)]);
  const filtered = Boolean(values.q || values.place);

  return (
    <>
      <PageHero title={copy.title} description={copy.description} />
      <section className="section">
        <div className="container">
          <EventTabs active={status} />
          <EventFilters action={`/events/${status}`} places={places} values={values} />

          {events.length === 0 ? (
            <p className="empty">{filtered ? "No events match your filters." : copy.empty}</p>
          ) : (
            <div className="grid grid--3">
              {events.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
