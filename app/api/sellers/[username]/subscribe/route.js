import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const sellers = await sql`SELECT id FROM users WHERE username = ${params.username}`;
  const seller = sellers[0];
  if (!seller) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (seller.id === user.id) {
    return NextResponse.json({ error: "You can't subscribe to yourself." }, { status: 400 });
  }

  await sql`
    INSERT INTO subscriptions (subscriber_id, seller_id) VALUES (${user.id}, ${seller.id})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true, subscribed: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const sellers = await sql`SELECT id FROM users WHERE username = ${params.username}`;
  const seller = sellers[0];
  if (!seller) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await sql`
    DELETE FROM subscriptions WHERE subscriber_id = ${user.id} AND seller_id = ${seller.id}
  `;
  return NextResponse.json({ ok: true, subscribed: false });
}
