"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteListingButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Remove this listing? This can't be undone.")) return;
    setBusy(true);
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={onDelete}>
      Remove
    </button>
  );
}
