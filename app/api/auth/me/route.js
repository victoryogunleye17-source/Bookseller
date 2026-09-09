import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json();
  const displayName = (body.displayName ?? user.display_name).trim();
  const bio = (body.bio ?? user.bio) || "";
  const avatarUrl = body.avatarUrl ?? user.avatar_url;
  const bankName = (body.bankName ?? user.bank_name) || "";
  const accountNumber = (body.accountNumber ?? user.account_number) || "";
  const accountName = (body.accountName ?? user.account_name) || "";

  if (!displayName) {
    return NextResponse.json({ error: "Display name can't be empty." }, { status: 400 });
  }

  const rows = await sql`
    UPDATE users SET
      display_name = ${displayName}, bio = ${bio}, avatar_url = ${avatarUrl},
      bank_name = ${bankName}, account_number = ${accountNumber}, account_name = ${accountName}
    WHERE id = ${user.id}
    RETURNING id, username, email, display_name, bio, avatar_url, bank_name, account_number, account_name, is_admin, status
  `;
  return NextResponse.json({ user: rows[0] });
}
