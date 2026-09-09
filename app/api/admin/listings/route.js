import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const rows = await sql`
    SELECT l.*, u.username, u.display_name FROM listings l
    JOIN users u ON u.id = l.seller_id
    WHERE l.status = ${status}
    ORDER BY l.created_at ASC
  `;
  return NextResponse.json({ listings: rows });
}
