import Link from "next/link";
import NotifBell from "./NotifBell";

export default function TopBar({ user }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          Book<span>seller</span>
        </Link>
        <nav className="nav-links">
          <Link href="/">Browse</Link>
          {user ? (
            <>
              <Link href="/dashboard/sell/new">Sell</Link>
              <NotifBell />
              <Link href="/dashboard">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  user.display_name
                )}
              </Link>
              {user.is_admin && <Link href="/admin">Admin</Link>}
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
