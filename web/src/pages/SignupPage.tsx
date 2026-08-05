import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export function SignupPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", workspace: "" });
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">Loading…</div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  function update(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFields({});
    setBusy(true);

    const result = await register(form);
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      setFields(result.fields ?? {});
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-lg font-semibold text-white">Create your workspace</h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          You become its admin. Invite the rest of the team afterwards.
        </p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4" noValidate>
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div>
            <label className="label" htmlFor="name">
              Your name
            </label>
            <input id="name" className="input" value={form.name} onChange={update("name")} required />
            {fields.name && <p className="field-error">{fields.name}</p>}
          </div>

          <div>
            <label className="label" htmlFor="workspace">
              Workspace name
            </label>
            <input
              id="workspace"
              className="input"
              placeholder="Acme Support"
              value={form.workspace}
              onChange={update("workspace")}
              required
            />
            {fields.workspace && <p className="field-error">{fields.workspace}</p>}
          </div>

          <div>
            <label className="label" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={update("email")}
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
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              required
            />
            {fields.password ? (
              <p className="field-error">{fields.password}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                At least 10 characters, with an uppercase letter and a number.
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-iris-400 hover:text-iris-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
