"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "book", label: "Book" },
  { value: "audiobook", label: "Audiobook" },
  { value: "manuscript", label: "Manuscript" },
  { value: "merch", label: "Merch" },
  { value: "other", label: "Other" }
];

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "book", price: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let coverUrl = "";
      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Cover upload failed.");
        coverUrl = upData.url;
      }

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coverUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push("/dashboard/sell");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 className="section-title">Upload a listing</h1>
      <p className="section-sub">
        Submitted listings go to the admin team for a quick review before they appear on the marketplace.
      </p>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Front cover</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="book-cover" style={{ width: 110, height: 160, flexShrink: 0 }}>
              {coverPreview ? <img src={coverPreview} alt="" /> : <div className="no-cover">No cover yet</div>}
            </div>
            <input type="file" accept="image/*" onChange={onCoverChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" required value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What is it, who is it for, what makes it worth buying?"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="price">Price (₦)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            required
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
