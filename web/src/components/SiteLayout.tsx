import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The PUBLIC shell — the marketing site, not the app.
 *
 * Renders the same pages whether or not anyone is signed in. That is the point of the demo: Preta
 * targets on visitor attributes (plan, role, risk) that only exist once the context cookie is
 * present, so the comparison worth making is the SAME page seen signed-out and then signed-in. A
 * layout that redirected, or swapped in something different for a logged-in visitor, would make
 * that comparison impossible.
 *
 * NavLink, not <a href>. An anchor reloads the document and the loader starts from scratch; a
 * NavLink is a client-side route change, which is what the loader's SPA handling exists to react
 * to and the only way this site exercises it.
 *
 * Only the account corner changes with auth state, and it keeps the same shape either way — two
 * controls — so nothing anchored near it moves when someone signs in.
 */
const NAV = [
    { to: "/features", label: "Features" },
    { to: "/compare", label: "Compare" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/pricing", label: "Pricing" },
    { to: "/faq", label: "FAQ" },
];

export function SiteLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/", { replace: true });
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-white/5 dark:bg-slate-925/80">
                <div className="container-page flex h-16 items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
                    >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500 text-[13px] font-bold text-white">
                            D
                        </span>
                        DeskDesk
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        {NAV.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `text-sm transition ${isActive
                                        ? "text-slate-900 dark:text-white"
                                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline">
                                    {user.name} · <span className="uppercase">{user.plan}</span>
                                </span>
                                <NavLink to="/tickets" className="btn-ghost">
                                    Open app
                                </NavLink>
                                <button type="button" onClick={handleLogout} className="btn-primary">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">
                                    Log in
                                </Link>
                                <Link to="/signup" className="btn-primary">
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 py-8 dark:border-white/5">
                <div className="container-page flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>DeskDesk demo — static SPA on :4003, its own Express API on :5003.</span>
                    <span>Signed in or not, these are the same pages.</span>
                </div>
            </footer>
        </div>
    );
}
