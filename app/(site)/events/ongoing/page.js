import EventsListing from "../../../../components/EventsListing";

const TITLES = { upcoming: "Upcoming Events", ongoing: "Ongoing Events", previous: "Previous Events" };

export const metadata = { title: TITLES.ongoing, description: "Events happening right now with The Tour Bees." };

export default async function Page({ searchParams }) {
  return <EventsListing status="ongoing" searchParams={await searchParams} />;
}
