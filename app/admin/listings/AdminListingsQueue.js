"use client";

import { useEffect, useState } from "react";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

export default function AdminListingsQueue() {
  const [tab, setTab] = useState("pending");
  const [listings, setListings] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");

  async function load() {
    setListings(null);
    const res = await fetch(`/api/admin/listings?status=${tab}`);
    const data = await res.json();
    setListings(data.listings || []);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function act(id, action, extra = {}) {
    setBusyId(id);
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra })
    });
    setRejectingId(null);
    setReason("");
    await load();
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="section-title">Listings queue</h1>
      <p className="section-sub">Approve or reject what people want to sell on the marketplace.</p>
      <div className="tabs">
        {TABS.map((t) => (
          <span key={t.value} className={"tab" + (tab === t.value ? " active" : "")} onClick={() => setTab(t.value)}>
            {t.label}
          </span>
        ))}
      </div>

      {listings === null ? (
        <p className="hint">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here</h3>
        </div>
      ) : (
        listings.map((l) => (
          <div key={l.id} className="card" style={{ marginBottom: 14, display: "flex", gap: 16 }}>
            <div className="book-cover" style={{ width: 80, height: 110, flexShrink: 0 }}>
              {l.cover_url ? <img src={l.cover_url} alt="" /> : <div className="no-cover" style={{ fontSize: "0.6rem" }}>{l.title}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <strong>{l.title}</strong>
              <div className="hint">by {l.display_name} (@{l.username}) · {l.category} · {money(l.price, l.currency)}</div>
              <p style={{ fontSize: "0.9rem", marginTop: 6, maxWidth: "60ch" }}>{l.description}</p>

              {tab === "pending" && (
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button className="btn btn-primary btn-sm" disabled={busyId === l.id} onClick={() => act(l.id, "approve")}>
                    Approve
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setRejectingId(rejectingId === l.id ? null : l.id)}>
                    Reject
                  </button>
                </div>
              )}

              {rejectingId === l.id && (
                <div style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>Reason (shown to the seller)</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                  </div>
                  <button className="btn btn-danger btn-sm" disabled={busyId === l.id} onClick={() => act(l.id, "reject", { reason })}>
                    Confirm reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
