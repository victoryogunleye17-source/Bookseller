import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";

  const rows = await sql`
    SELECT r.*, o.status AS order_status, o.price, o.currency, l.title AS listing_title,
           reporter.username AS reporter_username, reporter.display_name AS reporter_name,
           reported.username AS reported_username, reported.display_name AS reported_name,
           reported.status AS reported_account_status
    FROM reports r
    JOIN orders o ON o.id = r.order_id
    JOIN listings l ON l.id = o.listing_id
    JOIN users reporter ON reporter.id = r.reporter_id
    JOIN users reported ON reported.id = r.reported_user_id
    WHERE r.status = ${status}
    ORDER BY r.created_at ASC
  `;
  return NextResponse.json({ reports: rows });
}
