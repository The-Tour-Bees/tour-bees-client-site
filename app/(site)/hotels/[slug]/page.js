import StayDetail, { stayMetadata } from "../../../../components/StayDetail";

export const generateMetadata = ({ params }) => stayMetadata("hotels", params);

export default function Page({ params, searchParams }) {
  return <StayDetail kind="hotels" params={params} searchParams={searchParams} />;
}
