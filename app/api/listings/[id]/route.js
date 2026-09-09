import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req, { params }) {
  const rows = await sql`
    SELECT l.*, u.username, u.display_name, u.avatar_url, u.bio
    FROM listings l JOIN users u ON u.id = l.seller_id
    WHERE l.id = ${params.id}
  `;
  const listing = rows[0];
  if (!listing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const rows = await sql`SELECT * FROM listings WHERE id = ${params.id}`;
  const listing = rows[0];
  if (!listing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: "You can only edit your own listings." }, { status: 403 });
  }

  const body = await req.json();
  const title = (body.title ?? listing.title).trim();
  const description = (body.description ?? listing.description).trim();
  const price = body.price !== undefined ? Number(body.price) : Number(listing.price);
  const coverUrl = body.coverUrl ?? listing.cover_url;
  const category = body.category ?? listing.category;

  // Editing sends it back to pending review, so nothing changes without a check.
  const updated = await sql`
    UPDATE listings
    SET title = ${title}, description = ${description}, price = ${price},
        cover_url = ${coverUrl}, category = ${category}, status = 'pending', rejection_reason = ''
    WHERE id = ${params.id}
    RETURNING *
  `;
  return NextResponse.json({ listing: updated[0] });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const rows = await sql`SELECT seller_id FROM listings WHERE id = ${params.id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (rows[0].seller_id !== user.id && !user.is_admin) {
    return NextResponse.json({ error: "You can only remove your own listings." }, { status: 403 });
  }
  await sql`DELETE FROM listings WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
