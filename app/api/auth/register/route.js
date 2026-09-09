import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;

export async function POST(req) {
  const body = await req.json();
  const username = (body.username || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const displayName = (body.displayName || "").trim() || username;

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 characters: letters, numbers, underscores only." },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await sql`
    SELECT id FROM users WHERE username = ${username} OR email = ${email}
  `;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "That username or email is already registered." },
      { status: 409 }
    );
  }

  const hash = await hashPassword(password);
  const rows = await sql`
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES (${username}, ${email}, ${hash}, ${displayName})
    RETURNING id
  `;
  const token = signToken(rows[0].id);
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
