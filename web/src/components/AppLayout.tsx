import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

/** Signed-in navigation. The content pages below are readable either way. */
const APP_NAV = [
  { to: "/", label: "Overview", end: true },
  { to: "/tickets", label: "Tickets", end: false },
  { to: "/reports", label: "Reports", end: false },
  { to: "/team", label: "Team", end: false },
];

const CONTENT_NAV = [
  { to: "/knowledge", label: "Help", end: false },
  { to: "/pricing", label: "Pricing", end: false },
  { to: "/status", label: "Status", end: false },
  { to: "/changelog", label: "Changelog", end: false },
];

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      ["Overview", "/"],
      ["Tickets", "/tickets"],
      ["Reports", "/reports"],
      ["Pricing", "/pricing"],
    ],
  },
  {
    heading: "Resources",
    links: [
      ["Knowledge base", "/knowledge"],
      ["First week guide", "/knowledge/first-week-with-deskdesk"],
      ["Access control", "/knowledge/role-based-access-in-practice"],
      ["Changelog", "/changelog"],
    ],
  },
  {
    heading: "Workspace",
    links: [
      ["Team directory", "/team"],
      ["Settings", "/settings"],
      ["Your profile", "/profile"],
      ["System status", "/status"],
    ],
  },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<"resources" | "account" | null>(null);

  // Any navigation closes whatever was open, so a dropdown never survives a
  // route change and sits on top of the new page.
  useEffect(() => {
    setOpenPanel(null);
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const nav = user ? [...APP_NAV, ...CONTENT_NAV] : CONTENT_NAV;
  const primaryNav = user ? APP_NAV : CONTENT_NAV;
  const initials = (user?.name ?? "")
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-925/80 backdrop-blur">
        {/* One click-catcher behind both dropdowns, so clicking anywhere closes them. */}
        {openPanel && (
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-0 cursor-default"
            onClick={() => setOpenPanel(null)}
          />
        )}

        <div className="container-page flex h-16 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-7">
            <Link
              to={user ? "/" : "/welcome"}
              className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500 text-[13px] font-bold">
                D
              </span>
              DeskDesk
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap text-sm transition ${
                      isActive ? "text-white" : "text-slate-400 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* The four content pages collapse into one control rather than
                  spending four slots of header width on them. */}
              {user && (
                <div className="relative z-10">
                  <button
                    type="button"
                    onClick={() => setOpenPanel(openPanel === "resources" ? null : "resources")}
                    aria-expanded={openPanel === "resources"}
                    className="flex items-center gap-1 whitespace-nowrap text-sm text-slate-400 transition hover:text-white"
                  >
                    Resources
                    <span className="text-[10px] opacity-70">▾</span>
                  </button>
                  {openPanel === "resources" && (
                    <div className="absolute left-0 top-9 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-900 py-1 shadow-2xl">
                      {CONTENT_NAV.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm ${
                              isActive ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <div className="relative z-10 hidden md:block">
                <button
                  type="button"
                  onClick={() => setOpenPanel(openPanel === "account" ? null : "account")}
                  aria-expanded={openPanel === "account"}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 py-1.5 pl-1.5 pr-3 transition hover:border-white/25 hover:bg-white/5"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-iris-500/20 text-[11px] font-semibold text-iris-200">
                    {initials || "?"}
                  </span>
                  <span className="hidden text-left leading-tight lg:block">
                    <span className="block max-w-[10rem] truncate text-xs font-medium text-white">
                      {user.name}
                    </span>
                    <span className="block max-w-[10rem] truncate text-[11px] text-slate-500">
                      {user.workspace}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500">▾</span>
                </button>

                {openPanel === "account" && (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                    <div className="border-b border-white/5 px-4 py-3">
                      <p className="truncate text-sm font-medium text-white">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="chip">{user.plan}</span>
                        <span className="chip">{user.role}</span>
                        <span className="chip">risk {user.riskScore}</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                        Your profile
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                        Settings
                      </Link>
                      <Link to="/team" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                        Team directory
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full border-t border-white/5 px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Start free
                </Link>
              </div>
            )}

            <button
              type="button"
              className="btn-ghost md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/5 md:hidden">
            <div className="container-page grid gap-1 py-3">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm ${
                      isActive ? "bg-white/5 text-white" : "text-slate-400 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-2 border-t border-white/5 pt-2">
                {user ? (
                  <>
                    <p className="px-3 pb-2 text-xs text-slate-500">
                      {user.name} · {user.workspace}
                    </p>
                    <NavLink to="/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">
                      Profile
                    </NavLink>
                    <NavLink to="/settings" className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">
                      Settings
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:text-white"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-3 pt-1">
                    <Link to="/login" className="btn-ghost flex-1">
                      Sign in
                    </Link>
                    <Link to="/signup" className="btn-primary flex-1">
                      Start free
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="container-page flex-1 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500 text-[13px] font-bold">
                D
              </span>
              DeskDesk
            </span>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Demo SPA on :4003 talking to its own Express API on :5003. Every page here is static
              React except the queue, which is real.
            </p>
            <Link to="/welcome" className="mt-4 inline-block text-xs text-iris-300 hover:text-iris-200">
              See the marketing page →
            </Link>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-xs uppercase tracking-wider text-slate-500">{column.heading}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-slate-400 hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="container-page mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500">
          <span>© 2026 DeskDesk — a demo, not a product.</span>
          <span className="flex gap-4">
            <Link to="/status" className="hover:text-slate-300">
              Status
            </Link>
            <Link to="/changelog" className="hover:text-slate-300">
              Changelog
            </Link>
            <Link to="/knowledge" className="hover:text-slate-300">
              Help
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
