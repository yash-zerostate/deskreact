import { useState } from "react";

import { useAuth, type User } from "@/auth/AuthContext";

const PLAN_OPTIONS = ["free", "pro", "enterprise"] as const;
const ROLE_OPTIONS = ["developer", "security", "marketing", "compliance"] as const;
const RISK_SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [plan, setPlan] = useState<User["plan"]>(user?.plan ?? "free");
  const [role, setRole] = useState<User["role"]>(user?.role ?? "developer");
  const [riskScore, setRiskScore] = useState(String(user?.riskScore ?? 1));
  const [active, setActive] = useState<"yes" | "no">(user?.active === false ? "no" : "yes");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setFields({});
    setBusy(true);

    const result = await updateProfile({ name, plan, role, active, riskScore: Number(riskScore) });
    setBusy(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setStatus({ kind: "error", text: result.message });
      return;
    }
    setStatus({ kind: "ok", text: "Profile updated." });
  }

  const attributes: Array<[string, string]> = [
    ["Name", user?.name ?? ""],
    ["Email", user?.email ?? ""],
    ["Active", user?.active ? "yes" : "no"],
    ["Plan", user?.plan ?? ""],
    ["Role", user?.role ?? ""],
    ["Risk score", String(user?.riskScore ?? "")],
    ["Workspace", user?.workspace ?? ""],
  ];

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-[300px_1fr]">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold text-white">Your profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          These attributes ride in the Bearer token this SPA sends on every request.
        </p>
      </div>

      <section className="card h-fit">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Current values
        </h2>
        <dl className="mt-4 space-y-3">
          {attributes.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
              <dd className="truncate text-sm text-slate-100">{value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
            <dt className="text-xs uppercase tracking-wider text-slate-500">User id</dt>
            <dd className="truncate font-mono text-xs text-slate-400">{user?.id}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={handleSubmit} className="card h-fit space-y-4">
        {status && (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              status.kind === "ok"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {status.text}
          </p>
        )}

        <div>
          <label className="label" htmlFor="name">
            Display name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          {fields.name && <p className="field-error">{fields.name}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="plan">
              Plan
            </label>
            <select
              id="plan"
              className="input"
              value={plan}
              onChange={(event) => setPlan(event.target.value as User["plan"])}
            >
              {PLAN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="input"
              value={role}
              onChange={(event) => setRole(event.target.value as User["role"])}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              value={riskScore}
              onChange={(event) => setRiskScore(event.target.value)}
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
              value={active}
              onChange={(event) => setActive(event.target.value as "yes" | "no")}
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Changing your own plan and risk score is a demo affordance — a real product would take
          these from billing and a scoring service. Here it lets you flip an account&rsquo;s
          attributes without re-registering. Changing <span className="text-slate-300">role</span> to
          security or compliance is what unlocks deleting tickets.
        </p>

        <p className="text-xs text-slate-500">
          Workspace is the tenancy boundary and is not editable here — every ticket query is scoped
          by it.
        </p>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
