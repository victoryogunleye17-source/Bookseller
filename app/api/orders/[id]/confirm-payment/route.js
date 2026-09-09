import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const rows = await sql`SELECT * FROM orders WHERE id = ${params.id}`;
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.seller_id !== user.id) {
    return NextResponse.json({ error: "Only the seller can confirm payment." }, { status: 403 });
  }
  if (!["payment_claimed", "awaiting_payment"].includes(order.status)) {
    return NextResponse.json({ error: "This order has already moved past that step." }, { status: 400 });
  }

  const updated = await sql`
    UPDATE orders SET status = 'completed', seller_confirmed_at = now()
    WHERE id = ${params.id} RETURNING *
  `;
  const listing = await sql`SELECT title FROM listings WHERE id = ${order.listing_id}`;
  await notify(
    order.buyer_id,
    "payment_confirmed",
    `Payment confirmed for "${listing[0]?.title}". The seller will deliver it to you now.`,
    "/dashboard/purchases"
  );
  return NextResponse.json({ order: updated[0] });
}
