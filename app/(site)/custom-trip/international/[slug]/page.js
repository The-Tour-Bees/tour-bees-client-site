import TripDetail, { tripMetadata } from "../../../../../components/TripDetail";

export const generateMetadata = ({ params }) => tripMetadata("international", params);

export default function Page({ params }) {
  return <TripDetail scope="international" params={params} />;
}
