"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

export default function ListingDetail({ id }) {
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [me, setMe] = useState(undefined);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderedId, setOrderedId] = useState(null);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((data) => setListing(data.listing || null));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMe(data.user || null));
  }, [id]);

  async function buy() {
    setError("");
    setOrdering(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id })
    });
    const data = await res.json();
    setOrdering(false);
    if (!res.ok) {
      setError(data.error || "Couldn't start this order.");
      return;
    }
    setOrderedId(data.order.id);
  }

  if (listing === null) return <div className="wrap" style={{ padding: 40 }}>Loading…</div>;
  if (!listing.title) return <div className="wrap" style={{ padding: 40 }}>Not found.</div>;

  const isOwner = me && me.id === listing.seller_id;

  return (
    <div className="wrap" style={{ padding: "40px 20px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 40 }}>
      <div className="book-cover" style={{ maxWidth: 280 }}>
        {listing.cover_url ? <img src={listing.cover_url} alt="" /> : <div className="no-cover">{listing.title}</div>}
      </div>
      <div>
        <span className="pill">{listing.category}</span>
        <h1 style={{ marginTop: 10, fontSize: "2rem" }}>{listing.title}</h1>
        <p className="book-seller" style={{ marginBottom: 14 }}>
          by{" "}
          <Link href={`/sellers/${listing.username}`} style={{ color: "var(--moss-deep)", fontWeight: 600 }}>
            {listing.display_name}
          </Link>
        </p>
        <p style={{ whiteSpace: "pre-wrap" }}>{listing.description}</p>
        <div className="book-price" style={{ fontSize: "1.4rem", margin: "18px 0" }}>
          {money(listing.price, listing.currency)}
        </div>

        {error && <div className="error-box">{error}</div>}

        {orderedId ? (
          <div className="success-box">
            Order started. <Link href="/dashboard/purchases">Go to your purchases</Link> to see the seller's
            bank details and mark it as paid once you've sent the money.
          </div>
        ) : isOwner ? (
          <p className="hint">This is your own listing.</p>
        ) : me === null ? (
          <button className="btn btn-primary" onClick={() => router.push("/login")}>
            Log in to buy
          </button>
        ) : (
          <button className="btn btn-primary" disabled={ordering} onClick={buy}>
            {ordering ? "Starting order…" : "Buy this"}
          </button>
        )}
      </div>
    </div>
  );
}
