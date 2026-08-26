import { useMemo, useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import { Badge, Banner, Modal, PageHeader, Section, StatTile, Tabs } from "@/components/ui";
import { TEAM, type TeamMember } from "@/lib/content";

const ROLE_NOTES: Record<TeamMember["role"], string> = {
  developer: "Read, create, reply, change status and priority.",
  marketing: "The same as developer, minus bulk operations.",
  security: "Everything above, plus delete and audit export.",
  compliance: "Everything security can do, plus retention overrides.",
};

export function TeamPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const members = useMemo(
    () => (filter === "all" ? TEAM : TEAM.filter((member) => member.status === filter)),
    [filter],
  );

  const canManage = user?.role === "security" || user?.role === "compliance";

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Team directory"
        description="Eight accounts across six timezones. Roles gate verbs, never rows — everyone here sees the same queue."
        actions={
          <>
            <button type="button" className="btn-ghost">
              Export directory
            </button>
            <button type="button" className="btn-primary" onClick={() => setInviteOpen(true)}>
              Invite teammate
            </button>
          </>
        }
      />

      {!canManage && (
        <div className="mt-6">
          <Banner tone="info" title="You can view this directory but not change it">
            Suspending an account or changing a role needs the security or compliance role. Yours is{" "}
            <span className="font-medium">{user?.role}</span> — switch it on your profile to try the
            management controls.
          </Banner>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Members" value={String(TEAM.length)} hint="incl. 1 pending invite" />
        <StatTile label="Active" value={String(TEAM.filter((m) => m.status === "active").length)} />
        <StatTile label="Median response" value="37m" delta="-4m" hint="last 30 days" />
        <StatTile label="Timezones covered" value="6" hint="18h of the day" />
      </div>

      <div className="mt-8">
        <Tabs
          active={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: TEAM.length },
            { id: "active", label: "Active", count: TEAM.filter((m) => m.status === "active").length },
            { id: "invited", label: "Invited", count: TEAM.filter((m) => m.status === "invited").length },
            {
              id: "suspended",
              label: "Suspended",
              count: TEAM.filter((m) => m.status === "suspended").length,
            },
          ]}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Tickets</th>
              <th className="px-5 py-3 font-medium">Median response</th>
              <th className="px-5 py-3 font-medium">Timezone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => setSelected(member)}
                className="cursor-pointer hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-iris-500/20 text-xs font-semibold text-iris-200">
                      {member.name
                        .split(" ")
                        .map((part) => part.charAt(0))
                        .join("")}
                    </span>
                    <span>
                      <span className="block text-slate-100">{member.name}</span>
                      <span className="block text-xs text-slate-500">{member.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-300">{member.role}</td>
                <td className="px-5 py-3">
                  <Badge
                    tone={
                      member.status === "active"
                        ? "success"
                        : member.status === "invited"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {member.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-slate-300">{member.tickets || "—"}</td>
                <td className="px-5 py-3 text-slate-300">
                  {member.responseMinutes ? `${member.responseMinutes}m` : "—"}
                </td>
                <td className="px-5 py-3 text-slate-400">{member.timezone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invited.length > 0 && (
        <div className="mt-6">
          <Banner tone="success" title={`${invited.length} invitation(s) queued in this session`}>
            {invited.join(", ")} — nothing was sent; this demo keeps invites in component state.
          </Banner>
        </div>
      )}

      <Section title="What each role can do" description="Four roles, one sentence each.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(ROLE_NOTES) as Array<TeamMember["role"]>).map((role) => (
            <div key={role} className="card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold capitalize text-white">{role}</p>
                <span className="text-xs text-slate-500">
                  {TEAM.filter((member) => member.role === role).length} member(s)
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{ROLE_NOTES[role]}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Coverage by hour" description="How many people are inside business hours, UTC.">
        <div className="card">
          <div className="flex h-32 items-end gap-1">
            {Array.from({ length: 24 }, (_, hour) => {
              const covered = TEAM.filter((member) => {
                const offsets: Record<string, number> = {
                  "Europe/London": 1,
                  "Asia/Tokyo": 9,
                  "America/Sao_Paulo": -3,
                  "Asia/Kolkata": 5,
                  "Europe/Oslo": 2,
                  "Asia/Dubai": 4,
                  "America/New_York": -4,
                  "Europe/Ljubljana": 2,
                };
                const local = (hour + (offsets[member.timezone] ?? 0) + 24) % 24;
                return member.status === "active" && local >= 9 && local < 17;
              }).length;
              return (
                <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-iris-500/70"
                    style={{ height: `${(covered / 5) * 100}%`, minHeight: 2 }}
                    title={`${hour}:00 UTC — ${covered} online`}
                  />
                  {hour % 4 === 0 && <span className="text-[10px] text-slate-500">{hour}</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            The gap between 22:00 and 02:00 UTC is the one to staff before adding another European
            hire.
          </p>
        </div>
      </Section>

      <Modal
        open={inviteOpen}
        title="Invite a teammate"
        onClose={() => setInviteOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const input = document.getElementById("invite-email") as HTMLInputElement | null;
                if (input?.value) setInvited((current) => [...current, input.value]);
                setInviteOpen(false);
              }}
            >
              Send invite
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="invite-email">
              Email address
            </label>
            <input id="invite-email" className="input" placeholder="name@company.example" />
          </div>
          <div>
            <label className="label" htmlFor="invite-role">
              Role
            </label>
            <select id="invite-role" className="input" defaultValue="developer">
              {Object.keys(ROLE_NOTES).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Invites expire after seven days. A seat is only billed once the account replies to its
            first ticket.
          </p>
        </div>
      </Modal>

      <Modal open={selected !== null} title={selected?.name ?? ""} onClose={() => setSelected(null)}>
        {selected && (
          <dl className="space-y-3 text-sm">
            {[
              ["Email", selected.email],
              ["Role", selected.role],
              ["Status", selected.status],
              ["Tickets handled", String(selected.tickets)],
              ["Median first response", selected.responseMinutes ? `${selected.responseMinutes}m` : "—"],
              ["Timezone", selected.timezone],
              ["Member id", selected.id],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
