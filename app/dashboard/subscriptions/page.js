import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  const sellers = await sql`
    SELECT u.username, u.display_name, u.avatar_url
    FROM subscriptions s JOIN users u ON u.id = s.seller_id
    WHERE s.subscriber_id = ${user.id}
    ORDER BY s.created_at DESC
  `;

  return (
    <div>
      <h1 className="section-title">Following</h1>
      <p className="section-sub">Sellers you'll get notified about when they post something new.</p>
      {sellers.length === 0 ? (
        <div className="empty-state">
          <h3>Not following anyone yet</h3>
          <p>Visit a seller's page and subscribe to hear when they publish.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sellers.map((s) => (
            <Link key={s.username} href={`/sellers/${s.username}`} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "var(--ink-soft)" }}>
                {s.avatar_url && <img src={s.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{s.display_name}</div>
                <div className="hint">@{s.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
