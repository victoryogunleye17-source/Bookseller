"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

export default function SellerStorefront({ username }) {
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/sellers/${username}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [username]);

  async function toggleSubscribe() {
    setBusy(true);
    const method = data.isSubscribed ? "DELETE" : "POST";
    const res = await fetch(`/api/sellers/${username}/subscribe`, { method });
    setBusy(false);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      const body = await res.json();
      setData((d) => ({
        ...d,
        isSubscribed: body.subscribed,
        subscriberCount: d.subscriberCount + (body.subscribed ? 1 : -1)
      }));
    }
  }

  if (notFound) return <div className="wrap" style={{ padding: 40 }}>This page isn't available.</div>;
  if (!data) return <div className="wrap" style={{ padding: 40 }}>Loading…</div>;

  const { seller, listings, subscriberCount, isSubscribed, isSelf } = data;

  return (
    <div className="wrap" style={{ padding: "40px 20px" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 30, flexWrap: "wrap" }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--ink-soft)",
            flexShrink: 0
          }}
        >
          {seller.avatarUrl && <img src={seller.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.8rem" }}>{seller.displayName}</h1>
          <p className="hint">@{seller.username} · {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}</p>
          {seller.bio && <p style={{ marginTop: 8, maxWidth: "60ch" }}>{seller.bio}</p>}
        </div>
        {!isSelf && (
          <button className={"btn " + (isSubscribed ? "btn-outline" : "btn-primary")} disabled={busy} onClick={toggleSubscribe}>
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <h3>No listings yet</h3>
          <p>Check back once {seller.displayName} publishes something.</p>
        </div>
      ) : (
        <div className="grid-books">
          {listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="book-card">
              <div className="book-cover">
                {l.cover_url ? <img src={l.cover_url} alt="" /> : <div className="no-cover">{l.title}</div>}
              </div>
              <div className="book-title">{l.title}</div>
              <div className="book-price">{money(l.price, l.currency)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
