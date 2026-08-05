import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

const PLAN_OPTIONS = ["free", "pro", "enterprise"] as const;
const ROLE_OPTIONS = ["developer", "security", "marketing", "compliance"] as const;
const RISK_SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const EMPTY = {
  email: "",
  password: "",
  name: "",
  workspace: "",
  plan: "free",
  role: "developer",
  riskScore: "1",
  active: "yes",
};

export function SignupPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">Loading…</div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  function update(key: string) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
        <h1 className="text-center text-lg font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Only email and password are required.
        </p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4" noValidate>
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

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
            {fields.password && <p className="field-error">{fields.password}</p>}
          </div>

          <div>
            <label className="label" htmlFor="name">
              Your name <span className="normal-case text-slate-600">(optional)</span>
            </label>
            <input id="name" className="input" value={form.name} onChange={update("name")} />
            {fields.name && <p className="field-error">{fields.name}</p>}
          </div>

          <div>
            <label className="label" htmlFor="workspace">
              Workspace <span className="normal-case text-slate-600">(optional)</span>
            </label>
            <input
              id="workspace"
              className="input"
              placeholder="Acme Support"
              value={form.workspace}
              onChange={update("workspace")}
            />
            <p className="mt-1 text-xs text-slate-500">
              Tickets are scoped to this. Use <span className="text-slate-300">Acme Support</span> to
              land in the seeded queue.
            </p>
            {fields.workspace && <p className="field-error">{fields.workspace}</p>}
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-925/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Profile attributes
            </p>
            <p className="mt-1 text-xs text-slate-500">
              All optional — pick any combination to create a test account with those attributes.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="plan">
                  Plan
                </label>
                <select id="plan" className="input" value={form.plan} onChange={update("plan")}>
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="role">
                  Role
                </label>
                <select id="role" className="input" value={form.role} onChange={update("role")}>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="riskScore">
                  Risk score
                </label>
                <select
                  id="riskScore"
                  className="input"
                  value={form.riskScore}
                  onChange={update("riskScore")}
                >
                  {RISK_SCORE_OPTIONS.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="active">
                  Active
                </label>
                <select
                  id="active"
                  className="input"
                  value={form.active}
                  onChange={update("active")}
                >
                  <option value="yes">yes</option>
                  <option value="no">no</option>
                </select>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Role decides who may delete tickets — only{" "}
              <span className="text-slate-300">security</span> and{" "}
              <span className="text-slate-300">compliance</span> can.
            </p>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
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
