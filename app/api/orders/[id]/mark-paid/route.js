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
  if (order.buyer_id !== user.id) {
    return NextResponse.json({ error: "Only the buyer can mark this as paid." }, { status: 403 });
  }
  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ error: "This order has already moved past that step." }, { status: 400 });
  }

  const updated = await sql`
    UPDATE orders SET status = 'payment_claimed', buyer_marked_paid_at = now()
    WHERE id = ${params.id} RETURNING *
  `;
  const listing = await sql`SELECT title FROM listings WHERE id = ${order.listing_id}`;
  await notify(
    order.seller_id,
    "payment_claimed",
    `A buyer says they've paid for "${listing[0]?.title}". Confirm once you've received it.`,
    "/dashboard/orders"
  );
  return NextResponse.json({ order: updated[0] });
}
