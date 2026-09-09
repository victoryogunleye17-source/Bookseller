import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Public: browse approved listings, optional search + category filter.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();

  let rows;
  if (q && category) {
    rows = await sql`
      SELECT l.*, u.username, u.display_name FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'approved' AND u.status != 'banned'
        AND l.category = ${category}
        AND (l.title ILIKE ${"%" + q + "%"} OR l.description ILIKE ${"%" + q + "%"})
      ORDER BY l.created_at DESC LIMIT 60
    `;
  } else if (q) {
    rows = await sql`
      SELECT l.*, u.username, u.display_name FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'approved' AND u.status != 'banned'
        AND (l.title ILIKE ${"%" + q + "%"} OR l.description ILIKE ${"%" + q + "%"})
      ORDER BY l.created_at DESC LIMIT 60
    `;
  } else if (category) {
    rows = await sql`
      SELECT l.*, u.username, u.display_name FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'approved' AND u.status != 'banned' AND l.category = ${category}
      ORDER BY l.created_at DESC LIMIT 60
    `;
  } else {
    rows = await sql`
      SELECT l.*, u.username, u.display_name FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'approved' AND u.status != 'banned'
      ORDER BY l.created_at DESC LIMIT 60
    `;
  }
  return NextResponse.json({ listings: rows });
}

// Authenticated: submit a new listing for admin review.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (user.status === "flagged") {
    return NextResponse.json(
      { error: "Your account is under review, so new listings are paused for now." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const category = body.category || "book";
  const coverUrl = body.coverUrl || "";
  const price = Number(body.price);

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }
  if (!user.bank_name || !user.account_number) {
    return NextResponse.json(
      { error: "Add your payout bank details in your profile before listing something for sale." },
      { status: 400 }
    );
  }

  const rows = await sql`
    INSERT INTO listings (seller_id, title, description, category, cover_url, price)
    VALUES (${user.id}, ${title}, ${description}, ${category}, ${coverUrl}, ${price})
    RETURNING *
  `;

  return NextResponse.json({ listing: rows[0] });
}
