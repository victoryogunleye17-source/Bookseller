import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json();
  const identifier = (body.identifier || "").trim().toLowerCase();
  const password = body.password || "";

  const rows = await sql`
    SELECT id, password_hash, status FROM users
    WHERE lower(email) = ${identifier} OR lower(username) = ${identifier}
  `;
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "No account matches that email or username." }, { status: 401 });
  }
  if (user.status === "banned") {
    return NextResponse.json(
      { error: "This account has been suspended. Contact support if you believe this is a mistake." },
      { status: 403 }
    );
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const token = signToken(user.id);
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
