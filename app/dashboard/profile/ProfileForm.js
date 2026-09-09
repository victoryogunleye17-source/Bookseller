"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: user.display_name || "",
    bio: user.bio || "",
    bankName: user.bank_name || "",
    accountNumber: user.account_number || "",
    accountName: user.account_name || ""
  });
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      let finalAvatar = avatarUrl;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Photo upload failed.");
        finalAvatar = upData.url;
      }
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatarUrl: finalAvatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 className="section-title">Profile & payout</h1>
      <p className="section-sub">Your public page lives at /sellers/{user.username}</p>
      {error && <div className="error-box">{error}</div>}
      {saved && <div className="success-box">Saved.</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Photo</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "var(--ink-soft)" }}>
              {avatarPreview && <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <input type="file" accept="image/*" onChange={onAvatarChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="displayName">Display name</label>
          <input id="displayName" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell readers about you" />
        </div>

        <h3 style={{ marginTop: 28, marginBottom: 6 }}>Payout details</h3>
        <p className="hint" style={{ marginBottom: 14 }}>
          Shown to buyers so they can pay you by bank transfer. Required before you can publish a listing.
        </p>
        <div className="field">
          <label htmlFor="bankName">Bank name</label>
          <input id="bankName" value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="accountNumber">Account number</label>
          <input id="accountNumber" value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="accountName">Account name</label>
          <input id="accountName" value={form.accountName} onChange={(e) => update("accountName", e.target.value)} />
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
