"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/sell/new", label: "Upload a listing" },
  { href: "/dashboard/sell", label: "My listings" },
  { href: "/dashboard/orders", label: "Orders (as seller)" },
  { href: "/dashboard/purchases", label: "Purchases" },
  { href: "/dashboard/subscriptions", label: "Following" },
  { href: "/dashboard/profile", label: "Profile & payout" }
];

export default function DashSideNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <a onClick={logout} style={{ cursor: "pointer", display: "block", padding: "9px 12px", color: "var(--plum)" }}>
          Log out
        </a>
      </div>
    </nav>
  );
}
