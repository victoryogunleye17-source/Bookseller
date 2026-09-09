import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.is_admin) redirect("/dashboard");

  return (
    <div className="wrap dash-layout">
      <aside className="dash-side">
        <nav>
          <Link href="/admin/listings">Listings queue</Link>
          <Link href="/admin/reports">Reports</Link>
          <Link href="/admin/users">Users</Link>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
