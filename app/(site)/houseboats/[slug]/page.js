import StayDetail, { stayMetadata } from "../../../../components/StayDetail";

export const generateMetadata = ({ params }) => stayMetadata("houseboats", params);

export default function Page({ params, searchParams }) {
  return <StayDetail kind="houseboats" params={params} searchParams={searchParams} />;
}
