import Link from "next/link";
import EventCard from "../../../components/EventCard";
import EventTabs from "../../../components/EventTabs";
import PageHero from "../../../components/PageHero";
import { listEvents } from "../../../lib/events";

export const metadata = {
  title: "Events",
  description: "Previous, ongoing and upcoming events from The Tour Bees.",
};

const GROUPS = [
  { status: "ongoing", title: "Happening now", limit: 3 },
  { status: "upcoming", title: "Coming up", limit: 6 },
  { status: "previous", title: "Recently completed", limit: 3 },
];

export default async function EventsPage() {
  const groups = await Promise.all(
    GROUPS.map(async (g) => ({ ...g, events: await listEvents({ status: g.status, limit: g.limit }) })),
  );
  const none = groups.every((g) => g.events.length === 0);

  return (
    <>
      <PageHero title="Our Events" description="Join a trip, see what is on right now, or look back at what we have done." />
      <section className="section">
        <div className="container">
          <EventTabs active="all" />

          {none && <p className="empty">No events yet. Check back soon.</p>}

          {groups
            .filter((g) => g.events.length > 0)
            .map((g) => (
              <div key={g.status} className="event-group">
                <div className="event-group__head">
                  <h2>{g.title}</h2>
                  <Link href={`/events/${g.status}`}>View all →</Link>
                </div>
                <div className="grid grid--3">
                  {g.events.map((e) => (
                    <EventCard key={e.slug} event={e} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
