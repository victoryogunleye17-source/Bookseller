"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { value: "", label: "Everything" },
  { value: "book", label: "Books" },
  { value: "audiobook", label: "Audiobooks" },
  { value: "manuscript", label: "Manuscripts" },
  { value: "merch", label: "Merch" },
  { value: "other", label: "Other" }
];

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    fetch("/api/listings?" + params.toString(), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setListings(data.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [q, category]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search titles or descriptions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--paper-high)"
          }}
        />
        <div className="tabs" style={{ border: "none", marginBottom: 0 }}>
          {CATEGORIES.map((c) => (
            <span
              key={c.value}
              className={"tab" + (category === c.value ? " active" : "")}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="hint">Loading the shelf…</p>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here yet</h3>
          <p>Be the first to list something in this category.</p>
        </div>
      ) : (
        <div className="grid-books">
          {listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="book-card">
              <div className="book-cover">
                {l.cover_url ? (
                  <img src={l.cover_url} alt="" />
                ) : (
                  <div className="no-cover">{l.title}</div>
                )}
              </div>
              <div className="book-title">{l.title}</div>
              <div className="book-seller">by {l.display_name}</div>
              <div className="book-price">{money(l.price, l.currency)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
