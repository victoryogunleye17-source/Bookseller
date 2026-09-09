import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const users = await sql`
    SELECT id, username, display_name, bio, avatar_url, status
    FROM users WHERE username = ${params.username}
  `;
  const seller = users[0];
  if (!seller || seller.status === "banned") {
    return NextResponse.json({ error: "This page isn't available." }, { status: 404 });
  }

  const listings = await sql`
    SELECT * FROM listings WHERE seller_id = ${seller.id} AND status = 'approved'
    ORDER BY created_at DESC
  `;
  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM subscriptions WHERE seller_id = ${seller.id}
  `;

  const viewer = await getCurrentUser();
  let isSubscribed = false;
  if (viewer) {
    const sub = await sql`
      SELECT 1 FROM subscriptions WHERE subscriber_id = ${viewer.id} AND seller_id = ${seller.id}
    `;
    isSubscribed = sub.length > 0;
  }

  return NextResponse.json({
    seller: { id: seller.id, username: seller.username, displayName: seller.display_name, bio: seller.bio, avatarUrl: seller.avatar_url },
    listings,
    subscriberCount: count,
    isSubscribed,
    isSelf: viewer?.id === seller.id
  });
}
