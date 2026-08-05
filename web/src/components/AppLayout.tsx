import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

const NAV = [
  { to: "/", label: "Overview", end: true },
  { to: "/tickets", label: "Tickets", end: false },
  { to: "/profile", label: "Profile", end: false },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/5 bg-slate-925/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500 text-[13px] font-bold">
                D
              </span>
              DeskDesk
            </span>
            <nav className="flex items-center gap-5">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `text-sm transition ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:inline">
              {user?.workspace} · <span className="uppercase">{user?.plan}</span> · {user?.role} ·
              risk {user?.riskScore}
            </span>
            <button type="button" onClick={handleLogout} className="btn-ghost">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page flex-1 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-6">
        <div className="container-page text-xs text-slate-500">
          DeskDesk demo — static SPA on :4003, its own Express API on :5003.
        </div>
      </footer>
    </div>
  );
}
