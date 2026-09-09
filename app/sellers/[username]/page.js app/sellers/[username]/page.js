import SellerStorefront from "./SellerStorefront";

export default function SellerPage({ params }) {
  return <SellerStorefront username={params.username} />;
}
