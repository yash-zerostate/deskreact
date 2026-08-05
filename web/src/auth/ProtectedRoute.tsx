import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

/**
 * Route-level gate. This is UX only — every protected byte still comes from the
 * API, which checks the Bearer token on its own. A user who edits localStorage
 * to fake a session sees an empty shell and 401s.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}
