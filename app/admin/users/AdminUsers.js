"use client";

import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, statusFilter]);

  async function setStatus(id, status) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="section-title">Users</h1>
      <p className="section-sub">Flag or remove suspected fraudsters and impersonators.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="Search username or email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: "1 1 220px", padding: 10, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--paper-high)" }} />
        <div className="tabs" style={{ border: "none", marginBottom: 0 }}>
          {["", "active", "flagged", "banned"].map((s) => (
            <span key={s} className={"tab" + (statusFilter === s ? " active" : "")} onClick={() => setStatusFilter(s)}>
              {s || "All"}
            </span>
          ))}
        </div>
      </div>

      {users === null ? (
        <p className="hint">Loading…</p>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div>{u.display_name} {u.is_admin && <span className="pill">admin</span>}</div>
                  <div className="hint">@{u.username} · {u.email}</div>
                </td>
                <td>
                  <span className={`pill pill-${u.status}`}>{u.status}</span>
                </td>
                <td className="hint">{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {u.status !== "flagged" && !u.is_admin && (
                      <button className="btn btn-ghost btn-sm" disabled={busyId === u.id} onClick={() => setStatus(u.id, "flagged")}>
                        Flag
                      </button>
                    )}
                    {u.status !== "banned" && !u.is_admin && (
                      <button className="btn btn-danger btn-sm" disabled={busyId === u.id} onClick={() => setStatus(u.id, "banned")}>
                        Ban
                      </button>
                    )}
                    {u.status !== "active" && (
                      <button className="btn btn-outline btn-sm" disabled={busyId === u.id} onClick={() => setStatus(u.id, "active")}>
                        Reinstate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
