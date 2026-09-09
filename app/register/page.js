"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      <h1 className="section-title">Join Bookseller</h1>
      <p className="section-sub">
        Create an account to browse, buy, follow your favourite storytellers — or start selling your own work.
      </p>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="displayName">Your name</label>
          <input
            id="displayName"
            required
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            placeholder="e.g. Ayo Victory"
          />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            required
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="letters, numbers, underscores"
          />
          <small>This becomes your public page: bookseller.app/sellers/{form.username || "yourname"}</small>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <small>At least 8 characters.</small>
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="hint" style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
