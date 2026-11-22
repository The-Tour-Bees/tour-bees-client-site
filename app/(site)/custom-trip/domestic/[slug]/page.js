import TripDetail, { tripMetadata } from "../../../../../components/TripDetail";

export const generateMetadata = ({ params }) => tripMetadata("domestic", params);

export default function Page({ params }) {
  return <TripDetail scope="domestic" params={params} />;
}
