import TripsListing from "../../../../components/TripsListing";
import { SCOPES } from "../../../../lib/trips";

export const metadata = {
  title: SCOPES.international.title,
  description: SCOPES.international.description,
};

export default async function Page({ searchParams }) {
  return <TripsListing scope="international" searchParams={await searchParams} />;
}
