import StaysListing from "../../../components/StaysListing";
import { KINDS } from "../../../lib/stays";

export const metadata = {
  title: KINDS.hotels.title,
  description: KINDS.hotels.description,
};

export default async function Page({ searchParams }) {
  return <StaysListing kind="hotels" searchParams={await searchParams} />;
}
