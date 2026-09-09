import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

// Authenticated: start a purchase against a listing.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json();
  const listingId = body.listingId;
  const listings = await sql`SELECT * FROM listings WHERE id = ${listingId} AND status = 'approved'`;
  const listing = listings[0];
  if (!listing) return NextResponse.json({ error: "This listing isn't available." }, { status: 404 });
  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO orders (listing_id, buyer_id, seller_id, price, currency)
    VALUES (${listing.id}, ${user.id}, ${listing.seller_id}, ${listing.price}, ${listing.currency})
    RETURNING *
  `;
  await notify(
    listing.seller_id,
    "order_created",
    `${user.display_name} wants to buy "${listing.title}".`,
    "/dashboard/orders"
  );
  return NextResponse.json({ order: rows[0] });
}

// Authenticated: list orders where I'm the buyer or seller.
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const as = searchParams.get("as") === "seller" ? "seller" : "buyer";

  let rows;
  if (as === "seller") {
    rows = await sql`
      SELECT o.*, l.title, l.cover_url, b.display_name AS buyer_name, b.username AS buyer_username
      FROM orders o
      JOIN listings l ON l.id = o.listing_id
      JOIN users b ON b.id = o.buyer_id
      WHERE o.seller_id = ${user.id}
      ORDER BY o.created_at DESC
    `;
  } else {
    rows = await sql`
      SELECT o.*, l.title, l.cover_url, s.display_name AS seller_name, s.username AS seller_username,
             s.bank_name, s.account_number, s.account_name
      FROM orders o
      JOIN listings l ON l.id = o.listing_id
      JOIN users s ON s.id = o.seller_id
      WHERE o.buyer_id = ${user.id}
      ORDER BY o.created_at DESC
    `;
  }
  return NextResponse.json({ orders: rows });
}
