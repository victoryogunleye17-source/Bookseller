import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";

export default async function DashboardOverview() {
  const user = await getCurrentUser();
  const [listingCounts] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
    FROM listings WHERE seller_id = ${user.id}
  `;
  const [orderCounts] = await sql`
    SELECT COUNT(*) FILTER (WHERE status IN ('awaiting_payment','payment_claimed'))::int AS pending
    FROM orders WHERE seller_id = ${user.id}
  `;

  return (
    <div>
      <h1 className="section-title">Welcome back, {user.display_name.split(" ")[0]}</h1>
      <p className="section-sub">Here's where things stand.</p>

      {(!user.bank_name || !user.account_number) && (
        <div className="error-box">
          Add your payout bank details in <Link href="/dashboard/profile">your profile</Link> before you can
          publish a listing for sale.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <div className="card">
          <div className="hint">Listings awaiting review</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>{listingCounts.pending}</div>
        </div>
        <div className="card">
          <div className="hint">Live listings</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>{listingCounts.approved}</div>
        </div>
        <div className="card">
          <div className="hint">Orders needing your action</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>{orderCounts.pending}</div>
        </div>
      </div>
    </div>
  );
}
