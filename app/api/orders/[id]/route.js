import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const rows = await sql`
    SELECT o.*, l.title, l.cover_url,
           b.display_name AS buyer_name, b.username AS buyer_username,
           s.display_name AS seller_name, s.username AS seller_username,
           s.bank_name, s.account_number, s.account_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN users b ON b.id = o.buyer_id
    JOIN users s ON s.id = o.seller_id
    WHERE o.id = ${params.id}
  `;
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.buyer_id !== user.id && order.seller_id !== user.id && !user.is_admin) {
    return NextResponse.json({ error: "Not your order." }, { status: 403 });
  }
  return NextResponse.json({ order });
}
