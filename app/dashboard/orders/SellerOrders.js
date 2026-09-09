"use client";

import { useEffect, useState } from "react";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

const STATUS_LABEL = {
  awaiting_payment: "Waiting for buyer to pay",
  payment_claimed: "Buyer says they've paid",
  completed: "Completed",
  disputed: "Disputed — under review",
  cancelled: "Cancelled"
};

export default function SellerOrders() {
  const [orders, setOrders] = useState(null);
  const [reportingId, setReportingId] = useState(null);
  const [reportReason, setReportReason] = useState("buyer_not_paying");
  const [reportDetails, setReportDetails] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const res = await fetch("/api/orders?as=seller");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmPayment(id) {
    setBusyId(id);
    await fetch(`/api/orders/${id}/confirm-payment`, { method: "POST" });
    await load();
    setBusyId(null);
  }

  async function submitReport(id) {
    setBusyId(id);
    await fetch(`/api/orders/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason, details: reportDetails })
    });
    setReportingId(null);
    setReportDetails("");
    await load();
    setBusyId(null);
  }

  if (!orders) return <p className="hint">Loading orders…</p>;

  return (
    <div>
      <h1 className="section-title">Orders</h1>
      <p className="section-sub">People buying your listings, and what they owe you.</p>
      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Once someone buys a listing, it will show up here.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>{o.title}</strong>
                <div className="hint">Buyer: {o.buyer_name} (@{o.buyer_username})</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="book-price">{money(o.price, o.currency)}</div>
                <span className={"pill " + (o.status === "disputed" ? "pill-flagged" : "")}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(o.status === "payment_claimed" || o.status === "awaiting_payment") && (
                <button className="btn btn-primary btn-sm" disabled={busyId === o.id} onClick={() => confirmPayment(o.id)}>
                  Confirm payment received
                </button>
              )}
              {o.status !== "completed" && o.status !== "disputed" && (
                <button className="btn btn-ghost btn-sm" onClick={() => setReportingId(reportingId === o.id ? null : o.id)}>
                  Report this buyer
                </button>
              )}
            </div>

            {reportingId === o.id && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div className="field">
                  <label>Reason</label>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="buyer_not_paying">Buyer isn't paying after claiming to</option>
                    <option value="impersonation">Suspected impersonation / fraud</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Details</label>
                  <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} />
                </div>
                <button className="btn btn-danger btn-sm" disabled={busyId === o.id} onClick={() => submitReport(o.id)}>
                  Submit report
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
