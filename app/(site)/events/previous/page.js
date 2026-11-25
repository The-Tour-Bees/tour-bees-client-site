import EventsListing from "../../../../components/EventsListing";

const TITLES = { upcoming: "Upcoming Events", ongoing: "Ongoing Events", previous: "Previous Events" };

export const metadata = { title: TITLES.previous, description: "Look back at past Tour Bees events, with photos and recaps." };

export default async function Page({ searchParams }) {
  return <EventsListing status="previous" searchParams={await searchParams} />;
}
