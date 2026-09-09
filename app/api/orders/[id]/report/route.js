import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const rows = await sql`SELECT * FROM orders WHERE id = ${params.id}`;
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.buyer_id !== user.id && order.seller_id !== user.id) {
    return NextResponse.json({ error: "Not your order." }, { status: 403 });
  }

  const body = await req.json();
  const reason = (body.reason || "").trim();
  const details = (body.details || "").trim();
  if (!reason) return NextResponse.json({ error: "Choose a reason for the report." }, { status: 400 });

  const reportedUserId = order.buyer_id === user.id ? order.seller_id : order.buyer_id;

  await sql`
    INSERT INTO reports (order_id, reporter_id, reported_user_id, reason, details)
    VALUES (${order.id}, ${user.id}, ${reportedUserId}, ${reason}, ${details})
  `;
  // Auto-flag the order and the reported account so admins see it immediately.
  await sql`UPDATE orders SET status = 'disputed' WHERE id = ${order.id}`;
  await sql`UPDATE users SET status = 'flagged' WHERE id = ${reportedUserId} AND status = 'active'`;

  const admins = await sql`SELECT id FROM users WHERE is_admin = TRUE`;
  for (const a of admins) {
    await notify(a.id, "reported", `New report on order #${order.id}: ${reason}`, "/admin/reports");
  }

  return NextResponse.json({ ok: true });
}
