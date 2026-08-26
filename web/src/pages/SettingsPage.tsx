import { useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import { Badge, Banner, Modal, PageHeader, Section, Tabs, Toggle } from "@/components/ui";

const TABS = [
  { id: "workspace", label: "Workspace" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "sessions", label: "Sessions" },
  { id: "danger", label: "Danger zone" },
];

const INTEGRATIONS = [
  { name: "Slack", blurb: "Post urgent tickets and SLA breaches to a channel.", connected: true },
  { name: "GitHub", blurb: "Link tickets to issues without mirroring them.", connected: true },
  { name: "PagerDuty", blurb: "Page the on-call rota when an urgent ticket ages past 15 minutes.", connected: false },
  { name: "Jira", blurb: "Two-way link between a ticket and a Jira issue.", connected: false },
  { name: "Zapier", blurb: "Fan tickets out to anything else you run.", connected: false },
  { name: "Webhooks", blurb: "Signed POST on every ticket event, retried for 24 hours.", connected: true },
];

const SESSIONS = [
  { device: "MacBook Pro · Chrome 141", where: "London, GB · 81.2.x.x", last: "Active now", current: true },
  { device: "iPhone 17 · Safari", where: "London, GB · 81.2.x.x", last: "2 hours ago", current: false },
  { device: "ThinkPad · Firefox 143", where: "Manchester, GB · 92.40.x.x", last: "Yesterday, 18:04", current: false },
  { device: "Unknown · curl/8.7", where: "Frankfurt, DE · 3.121.x.x", last: "4 days ago", current: false },
];

export function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("workspace");
  const [saved, setSaved] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [prefs, setPrefs] = useState({
    emailOnAssign: true,
    emailOnReply: true,
    emailDigest: false,
    slaBreach: true,
    weeklyReport: true,
    productNews: false,
    mentionsOnly: false,
  });

  const [hours, setHours] = useState({ start: "09:00", end: "17:30", timezone: "Europe/London" });
  const [firstResponse, setFirstResponse] = useState(60);

  function set<K extends keyof typeof prefs>(key: K, value: boolean) {
    setPrefs((current) => ({ ...current, [key]: value }));
    setSaved(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Workspace calendar, notification routing, integrations, active sessions, and the two operations you cannot undo."
        actions={
          <button type="button" className="btn-primary" onClick={() => setSaved(true)}>
            Save changes
          </button>
        }
      />

      {saved && (
        <div className="mt-6">
          <Banner
            tone="success"
            title="Preferences kept for this session"
            onDismiss={() => setSaved(false)}
          >
            Settings on this page are demo state — nothing is written to the API.
          </Banner>
        </div>
      )}

      <div className="mt-8">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === "workspace" && (
        <>
          <Section title="Business hours" description="The SLA clock follows this calendar, not the wall clock.">
            <div className="card grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="hours-start">
                  Day starts
                </label>
                <input
                  id="hours-start"
                  type="time"
                  className="input"
                  value={hours.start}
                  onChange={(event) => setHours({ ...hours, start: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="hours-end">
                  Day ends
                </label>
                <input
                  id="hours-end"
                  type="time"
                  className="input"
                  value={hours.end}
                  onChange={(event) => setHours({ ...hours, end: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="hours-tz">
                  Timezone
                </label>
                <select
                  id="hours-tz"
                  className="input"
                  value={hours.timezone}
                  onChange={(event) => setHours({ ...hours, timezone: event.target.value })}
                >
                  {["Europe/London", "Europe/Berlin", "America/New_York", "Asia/Kolkata", "Asia/Tokyo"].map(
                    (zone) => (
                      <option key={zone}>{zone}</option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </Section>

          <Section title="First response target" description="Applies to every view without its own target.">
            <div className="card">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-300">Respond within</span>
                <span className="text-sm font-semibold text-white">{firstResponse} minutes</span>
              </div>
              <input
                type="range"
                min={15}
                max={480}
                step={15}
                value={firstResponse}
                onChange={(event) => setFirstResponse(Number(event.target.value))}
                className="mt-4 w-full accent-iris-500"
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>15m</span>
                <span>2h</span>
                <span>4h</span>
                <span>8h</span>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Auto-acknowledgements do not stop this clock. A first response is a human one.
              </p>
            </div>
          </Section>

          <Section title="Working days" description="Weekends pause the response clock entirely.">
            <div className="card flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <label
                  key={day}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/25"
                >
                  <input type="checkbox" defaultChecked={index < 5} className="accent-iris-500" />
                  {day}
                </label>
              ))}
            </div>
          </Section>
        </>
      )}

      {tab === "notifications" && (
        <Section title="Email routing" description="Turn everything off, then add back what you would wake someone for.">
          <div className="card divide-y divide-white/5">
            <Toggle
              label="A ticket is assigned to me"
              description="Immediate, one email per ticket."
              checked={prefs.emailOnAssign}
              onChange={(value) => set("emailOnAssign", value)}
            />
            <Toggle
              label="Someone replies on my ticket"
              description="Batched to at most one email every five minutes."
              checked={prefs.emailOnReply}
              onChange={(value) => set("emailOnReply", value)}
            />
            <Toggle
              label="Daily digest"
              description="One summary at 08:00 in your local timezone."
              checked={prefs.emailDigest}
              onChange={(value) => set("emailDigest", value)}
            />
            <Toggle
              label="SLA breach warnings"
              description="Ten minutes before a target is missed, not after."
              checked={prefs.slaBreach}
              onChange={(value) => set("slaBreach", value)}
            />
            <Toggle
              label="Weekly report"
              description="Monday 08:00, to the workspace owner."
              checked={prefs.weeklyReport}
              onChange={(value) => set("weeklyReport", value)}
            />
            <Toggle
              label="Product news"
              description="Release notes and the occasional survey."
              checked={prefs.productNews}
              onChange={(value) => set("productNews", value)}
            />
            <Toggle
              label="Mentions only"
              description="Overrides everything above except SLA breaches."
              checked={prefs.mentionsOnly}
              onChange={(value) => set("mentionsOnly", value)}
            />
          </div>
        </Section>
      )}

      {tab === "integrations" && (
        <Section title="Connected services" description="Three connected, three available.">
          <div className="grid gap-4 md:grid-cols-2">
            {INTEGRATIONS.map((integration) => (
              <div key={integration.name} className="card flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{integration.name}</p>
                    {integration.connected && <Badge tone="success">Connected</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-400">{integration.blurb}</p>
                </div>
                <button type="button" className={integration.connected ? "btn-ghost" : "btn-primary"}>
                  {integration.connected ? "Configure" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === "sessions" && (
        <Section
          title="Active sessions"
          description="Refresh tokens rotate on every use; a replayed token kills the whole family."
        >
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-5 py-3 font-medium">Where</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SESSIONS.map((session) => (
                  <tr key={session.device}>
                    <td className="px-5 py-3 text-slate-100">
                      {session.device} {session.current && <Badge tone="brand">This device</Badge>}
                    </td>
                    <td className="px-5 py-3 text-slate-400">{session.where}</td>
                    <td className="px-5 py-3 text-slate-400">{session.last}</td>
                    <td className="px-5 py-3 text-right">
                      {!session.current && (
                        <button type="button" className="text-xs text-rose-300 hover:text-rose-200">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            That last row is a scripted client from a datacentre IP. On a real workspace, revoke it and
            rotate the API token it used.
          </p>
        </Section>
      )}

      {tab === "danger" && (
        <Section title="Irreversible operations" description="Both require the compliance role in production.">
          <div className="space-y-4">
            <div className="card border-rose-500/30">
              <p className="text-sm font-semibold text-rose-200">Purge resolved tickets older than 2 years</p>
              <p className="mt-1.5 text-sm text-slate-400">
                Deletes the ticket, its replies and its attachments. Audit entries survive; ticket bodies
                do not.
              </p>
              <button type="button" className="btn-ghost mt-4 border-rose-500/40 text-rose-200">
                Purge 4,182 tickets
              </button>
            </div>

            <div className="card border-rose-500/30">
              <p className="text-sm font-semibold text-rose-200">Delete workspace</p>
              <p className="mt-1.5 text-sm text-slate-400">
                Removes {user?.workspace ?? "this workspace"}, every ticket in it, and every account
                that only belonged to it. There is no restore.
              </p>
              <button
                type="button"
                className="btn-ghost mt-4 border-rose-500/40 text-rose-200"
                onClick={() => setDangerOpen(true)}
              >
                Delete workspace
              </button>
            </div>
          </div>
        </Section>
      )}

      <Modal
        open={dangerOpen}
        title="Delete this workspace?"
        onClose={() => {
          setDangerOpen(false);
          setConfirmText("");
        }}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setDangerOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary bg-rose-600 hover:bg-rose-500"
              disabled={confirmText !== (user?.workspace ?? "")}
              onClick={() => {
                setDangerOpen(false);
                setConfirmText("");
              }}
            >
              Delete permanently
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Type <span className="font-mono text-white">{user?.workspace}</span> to confirm. This demo
          does nothing either way — the button is here so the confirmation flow is testable.
        </p>
        <input
          className="input mt-4"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={user?.workspace ?? "workspace"}
        />
      </Modal>
    </div>
  );
}
