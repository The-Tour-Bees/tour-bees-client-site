import StaysListing from "../../../components/StaysListing";
import { KINDS } from "../../../lib/stays";

export const metadata = {
  title: KINDS.houseboats.title,
  description: KINDS.houseboats.description,
};

export default async function Page({ searchParams }) {
  return <StaysListing kind="houseboats" searchParams={await searchParams} />;
}
