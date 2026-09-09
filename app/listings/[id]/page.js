import ListingDetail from "./ListingDetail";

export default function ListingPage({ params }) {
  return <ListingDetail id={params.id} />;
}
