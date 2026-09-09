import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [] });

  const rows = await sql`
    SELECT * FROM notifications WHERE user_id = ${user.id}
    ORDER BY created_at DESC LIMIT 30
  `;
  return NextResponse.json({ notifications: rows });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  await sql`UPDATE notifications SET read = TRUE WHERE user_id = ${user.id} AND read = FALSE`;
  return NextResponse.json({ ok: true });
}
