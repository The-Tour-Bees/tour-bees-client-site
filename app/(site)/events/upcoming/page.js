import EventsListing from "../../../../components/EventsListing";

const TITLES = { upcoming: "Upcoming Events", ongoing: "Ongoing Events", previous: "Previous Events" };

export const metadata = { title: TITLES.upcoming };

export default async function Page({ searchParams }) {
  return <EventsListing status="upcoming" searchParams={await searchParams} />;
}
