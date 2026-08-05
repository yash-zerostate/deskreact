import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">Loading…</div>
    );
  }
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFields({});
    setBusy(true);

    const result = await login(email, password);
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      setFields(result.fields ?? {});
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-lg font-semibold text-white">Sign in to DeskDesk</h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Try <code className="text-slate-300">pro@example.com</code> /{" "}
          <code className="text-slate-300">Password123!</code>
        </p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4" noValidate>
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            {fields.email && <p className="field-error">{fields.email}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {fields.password && <p className="field-error">{fields.password}</p>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need a workspace?{" "}
          <Link to="/signup" className="text-iris-400 hover:text-iris-500">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
