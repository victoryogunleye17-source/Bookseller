"use client";

import { useEffect, useState } from "react";

function money(price, currency) {
  const symbol = currency === "NGN" ? "₦" : currency + " ";
  return `${symbol}${Number(price).toLocaleString()}`;
}

const TABS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" }
];

export default function AdminReports() {
  const [tab, setTab] = useState("open");
  const [reports, setReports] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState("");

  async function load() {
    setReports(null);
    const res = await fetch(`/api/admin/reports?status=${tab}`);
    const data = await res.json();
    setReports(data.reports || []);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function act(id, action, banReportedUser = false) {
    setBusyId(id);
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note, banReportedUser })
    });
    setNoteFor(null);
    setNote("");
    await load();
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="section-title">Reports</h1>
      <p className="section-sub">
        Reports are auto-flagged from disputed orders — the buyer or seller didn't deliver or pay.
      </p>
      <div className="tabs">
        {TABS.map((t) => (
          <span key={t.value} className={"tab" + (tab === t.value ? " active" : "")} onClick={() => setTab(t.value)}>
            {t.label}
          </span>
        ))}
      </div>

      {reports === null ? (
        <p className="hint">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here</h3>
        </div>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong>Order #{r.order_id}: {r.listing_title}</strong>
                <div className="hint">{money(r.price, r.currency)} · order status: {r.order_status}</div>
              </div>
              <span className={`pill pill-${r.reported_account_status}`}>{r.reported_account_status}</span>
            </div>
            <div style={{ marginTop: 10, fontSize: "0.92rem" }}>
              <div><strong>Reported by:</strong> {r.reporter_name} (@{r.reporter_username})</div>
              <div><strong>Reported user:</strong> {r.reported_name} (@{r.reported_username})</div>
              <div><strong>Reason:</strong> {r.reason}</div>
              {r.details && <div><strong>Details:</strong> {r.details}</div>}
            </div>

            {tab === "open" && (
              <div style={{ marginTop: 12 }}>
                <div className="field">
                  <label>Resolution note</label>
                  <textarea value={noteFor === r.id ? note : ""} onFocus={() => setNoteFor(r.id)} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm" disabled={busyId === r.id} onClick={() => act(r.id, "resolve", false)}>
                    Resolve — reinstate account
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === r.id} onClick={() => act(r.id, "resolve", true)}>
                    Resolve — ban reported user
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={busyId === r.id} onClick={() => act(r.id, "dismiss", false)}>
                    Dismiss report
                  </button>
                </div>
              </div>
            )}
            {r.resolution_note && (
              <div className="hint" style={{ marginTop: 8 }}>Note: {r.resolution_note}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
