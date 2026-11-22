import TripsListing from "../../../../components/TripsListing";
import { SCOPES } from "../../../../lib/trips";

export const metadata = {
  title: SCOPES.domestic.title,
  description: SCOPES.domestic.description,
};

export default async function Page({ searchParams }) {
  return <TripsListing scope="domestic" searchParams={await searchParams} />;
}
