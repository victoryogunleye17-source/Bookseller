import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = (searchParams.get("q") || "").trim();

  let rows;
  if (status && q) {
    rows = await sql`
      SELECT id, username, email, display_name, status, is_admin, created_at FROM users
      WHERE status = ${status} AND (username ILIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"})
      ORDER BY created_at DESC
    `;
  } else if (status) {
    rows = await sql`
      SELECT id, username, email, display_name, status, is_admin, created_at FROM users
      WHERE status = ${status} ORDER BY created_at DESC
    `;
  } else if (q) {
    rows = await sql`
      SELECT id, username, email, display_name, status, is_admin, created_at FROM users
      WHERE username ILIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"}
      ORDER BY created_at DESC
    `;
  } else {
    rows = await sql`
      SELECT id, username, email, display_name, status, is_admin, created_at FROM users
      ORDER BY created_at DESC LIMIT 100
    `;
  }
  return NextResponse.json({ users: rows });
}
