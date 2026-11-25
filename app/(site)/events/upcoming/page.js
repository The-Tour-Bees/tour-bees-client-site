import EventsListing from "../../../../components/EventsListing";

const TITLES = { upcoming: "Upcoming Events", ongoing: "Ongoing Events", previous: "Previous Events" };

export const metadata = { title: TITLES.upcoming, description: "Upcoming Tour Bees events you can join. See dates, prices and seats left." };

export default async function Page({ searchParams }) {
  return <EventsListing status="upcoming" searchParams={await searchParams} />;
}
