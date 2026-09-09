import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { notify } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const action = body.action; // 'resolve' | 'dismiss'
  const note = (body.note || "").trim();
  const banReportedUser = !!body.banReportedUser;

  const rows = await sql`SELECT * FROM reports WHERE id = ${params.id}`;
  const report = rows[0];
  if (!report) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (action === "resolve") {
    await sql`
      UPDATE reports SET status = 'resolved', resolution_note = ${note}, resolved_at = now()
      WHERE id = ${params.id}
    `;
    if (banReportedUser) {
      await sql`UPDATE users SET status = 'banned' WHERE id = ${report.reported_user_id}`;
      await notify(report.reported_user_id, "account_flagged", "Your account has been suspended following a report.", "");
    } else {
      await sql`UPDATE users SET status = 'active' WHERE id = ${report.reported_user_id} AND status = 'flagged'`;
    }
    await notify(report.reporter_id, "reported", `Your report on order #${report.order_id} was reviewed and resolved.`, "");
  } else if (action === "dismiss") {
    await sql`
      UPDATE reports SET status = 'dismissed', resolution_note = ${note}, resolved_at = now()
      WHERE id = ${params.id}
    `;
    await sql`UPDATE users SET status = 'active' WHERE id = ${report.reported_user_id} AND status = 'flagged'`;
    await notify(report.reporter_id, "reported", `Your report on order #${report.order_id} was reviewed and dismissed.`, "");
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
