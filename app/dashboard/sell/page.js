import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import DeleteListingButton from "./DeleteListingButton";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  const listings = await sql`
    SELECT * FROM listings WHERE seller_id = ${user.id} ORDER BY created_at DESC
  `;

  return (
    <div>
      <h1 className="section-title">My listings</h1>
      <p className="section-sub">
        <Link href="/dashboard/sell/new">Upload a new one</Link>
      </p>
      {listings.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing listed yet</h3>
          <p>Upload your first book or product to get started.</p>
        </div>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link href={`/listings/${l.id}`}>{l.title}</Link>
                  {l.status === "rejected" && l.rejection_reason && (
                    <div className="hint">Reason: {l.rejection_reason}</div>
                  )}
                </td>
                <td>{money(l.price, l.currency)}</td>
                <td>
                  <span className={`pill pill-${l.status}`}>{l.status}</span>
                </td>
                <td>
                  <DeleteListingButton id={l.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
