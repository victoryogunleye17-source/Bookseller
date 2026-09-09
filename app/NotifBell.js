"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function NotifBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications || []);
    } catch {
      // silent - notifications are non-critical
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }} ref={boxRef}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unread > 0) markAllRead();
        }}
        aria-label="Notifications"
      >
        Notifications
        {unread > 0 && <span className="notif-dot" />}
      </button>
      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 320,
            maxHeight: 380,
            overflowY: "auto",
            zIndex: 30
          }}
        >
          {items.length === 0 ? (
            <p className="hint">Nothing yet. When a seller you follow posts, or your order status changes, it shows up here.</p>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/dashboard"}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "8px 0", borderBottom: "1px solid var(--border)" }}
              >
                <div style={{ fontSize: "0.88rem", color: "var(--text)" }}>{n.message}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
