import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

// Returns { user } if the caller is an admin, or { error: NextResponse } to return immediately.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Log in first." }, { status: 401 }) };
  if (!user.is_admin) return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  return { user };
}
