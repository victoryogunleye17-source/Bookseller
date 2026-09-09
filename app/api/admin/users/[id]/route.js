import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { notify } from "@/lib/notify";

const VALID = ["active", "flagged", "banned"];

export async function PATCH(req, { params }) {
  const { error, user: admin } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const status = body.status;
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (Number(params.id) === admin.id) {
    return NextResponse.json({ error: "You can't change your own status." }, { status: 400 });
  }

  await sql`UPDATE users SET status = ${status} WHERE id = ${params.id}`;

  if (status === "banned") {
    await notify(params.id, "account_flagged", "Your account has been suspended for a policy violation.", "");
  } else if (status === "active") {
    await notify(params.id, "account_flagged", "Your account is back in good standing.", "");
  }

  return NextResponse.json({ ok: true });
}
