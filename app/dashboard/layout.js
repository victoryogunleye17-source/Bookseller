import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashSideNav from "./DashSideNav";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="wrap dash-layout">
      <aside className="dash-side">
        <DashSideNav />
      </aside>
      <main>{children}</main>
    </div>
  );
}
