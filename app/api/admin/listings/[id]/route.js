import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { notify, notifySubscribers } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const action = body.action; // 'approve' | 'reject'
  const reason = (body.reason || "").trim();

  const rows = await sql`SELECT * FROM listings WHERE id = ${params.id}`;
  const listing = rows[0];
  if (!listing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (action === "approve") {
    await sql`UPDATE listings SET status = 'approved', rejection_reason = '' WHERE id = ${params.id}`;
    await notify(listing.seller_id, "listing_approved", `"${listing.title}" is now live.`, `/listings/${listing.id}`);
    await notifySubscribers(
      listing.seller_id,
      "new_listing",
      `New from a seller you follow: "${listing.title}"`,
      `/listings/${listing.id}`
    );
  } else if (action === "reject") {
    await sql`UPDATE listings SET status = 'rejected', rejection_reason = ${reason} WHERE id = ${params.id}`;
    await notify(
      listing.seller_id,
      "listing_rejected",
      `"${listing.title}" wasn't approved.${reason ? " Reason: " + reason : ""}`,
      "/dashboard/sell"
    );
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
