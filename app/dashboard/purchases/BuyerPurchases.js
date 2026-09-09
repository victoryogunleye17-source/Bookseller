"use client";

import { useEffect, useState } from "react";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

const STATUS_LABEL = {
  awaiting_payment: "Awaiting your payment",
  payment_claimed: "Waiting for seller to confirm",
  completed: "Completed",
  disputed: "Disputed — under review",
  cancelled: "Cancelled"
};

export default function BuyerPurchases() {
  const [orders, setOrders] = useState(null);
  const [reportingId, setReportingId] = useState(null);
  const [reportReason, setReportReason] = useState("not_delivered");
  const [reportDetails, setReportDetails] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const res = await fetch("/api/orders?as=buyer");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function markPaid(id) {
    setBusyId(id);
    await fetch(`/api/orders/${id}/mark-paid`, { method: "POST" });
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

  if (!orders) return <p className="hint">Loading purchases…</p>;

  return (
    <div>
      <h1 className="section-title">Purchases</h1>
      <p className="section-sub">Things you've bought, and the seller's bank transfer details.</p>
      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No purchases yet</h3>
          <p>When you buy something, it will show up here with payment instructions.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>{o.title}</strong>
                <div className="hint">Seller: {o.seller_name} (@{o.seller_username})</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="book-price">{money(o.price, o.currency)}</div>
                <span className={"pill " + (o.status === "disputed" ? "pill-flagged" : "")}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
            </div>

            {o.status === "awaiting_payment" && (
              <div style={{ marginTop: 12, background: "var(--paper)", padding: 12, borderRadius: "var(--radius)" }}>
                <div className="hint" style={{ marginBottom: 6 }}>Pay by bank transfer to:</div>
                <div><strong>{o.bank_name || "Not set"}</strong></div>
                <div>{o.account_number}</div>
                <div>{o.account_name}</div>
              </div>
            )}

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {o.status === "awaiting_payment" && (
                <button className="btn btn-primary btn-sm" disabled={busyId === o.id} onClick={() => markPaid(o.id)}>
                  I've sent the payment
                </button>
              )}
              {o.status !== "completed" && o.status !== "disputed" && (
                <button className="btn btn-ghost btn-sm" onClick={() => setReportingId(reportingId === o.id ? null : o.id)}>
                  Report this seller
                </button>
              )}
            </div>

            {reportingId === o.id && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div className="field">
                  <label>Reason</label>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="not_delivered">Paid but never received the product</option>
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
