import { useState } from "react";

import { useAuth } from "@/auth/AuthContext";

const TIMEZONES = ["Asia/Kolkata", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [timezone, setTimezone] = useState(user?.timezone ?? "Asia/Kolkata");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setFields({});
    setBusy(true);

    const result = await updateProfile({ name, timezone });
    setBusy(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setStatus({ kind: "error", text: result.message });
      return;
    }
    setStatus({ kind: "ok", text: "Profile updated." });
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-white">Your profile</h1>
      <p className="mt-1 text-sm text-slate-400">
        Signed in as {user?.email} · role <span className="uppercase">{user?.role}</span>
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
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

        <div>
          <label className="label" htmlFor="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            className="input"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          >
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          {fields.timezone && <p className="field-error">{fields.timezone}</p>}
        </div>

        <div>
          <span className="label">Workspace</span>
          <p className="text-sm text-slate-300">{user?.workspace}</p>
          <p className="mt-1 text-xs text-slate-500">
            Workspace and role are set by an admin — they are not editable here, and the API would
            ignore them if you sent them anyway.
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
