import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { BarChart, Banner, ProgressBar, Section, StatTile } from "@/components/ui";
import { ARTICLES, CHANGELOG, RESPONSE_BY_DAY, TEAM } from "@/lib/content";
import { listTickets, type Ticket, type TicketStatus } from "@/lib/tickets";

const QUICK_LINKS = [
  { to: "/tickets", label: "Open the queue", body: "Filter, search, reply and change status." },
  { to: "/reports", label: "Reports", body: "Volume, response time, channel mix, agents." },
  { to: "/team", label: "Team directory", body: "Eight accounts, six timezones, role notes." },
  { to: "/settings", label: "Settings", body: "Business hours, notifications, integrations." },
  { to: "/knowledge", label: "Knowledge base", body: "Six guides, about 45 minutes of reading." },
  { to: "/status", label: "System status", body: "Sixty days of component health." },
];

const ACTIVITY = [
  { who: "Dev Raghavan", what: "resolved", target: "DSK-2291 — Webhook retries stop after 3 attempts", when: "12 minutes ago" },
  { who: "Ada Okonjo", what: "escalated", target: "DSK-2288 — SSO metadata rejected on upload", when: "40 minutes ago" },
  { who: "Bruno Sato", what: "replied on", target: "DSK-2284 — CSV export truncates at 10k rows", when: "1 hour ago" },
  { who: "Clara Mendes", what: "set retention hold on", target: "DSK-2277 — Subject access request", when: "3 hours ago" },
  { who: "Hana Kovač", what: "created", target: "DSK-2296 — Widget renders behind our nav bar", when: "4 hours ago" },
  { who: "Farid Nasser", what: "reopened", target: "DSK-2261 — Attachment over 25MB silently dropped", when: "yesterday" },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 } as const;

export function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState<Partial<Record<TicketStatus, number>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await listTickets();
      if (cancelled) return;
      if (result.ok) {
        setTickets(result.data.tickets);
        setCounts(result.data.counts);
      } else {
        setError(result.message);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const needsAttention = [...tickets]
    .filter((ticket) => ticket.status !== "resolved")
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Good to see you, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {user?.workspace} · {user?.plan} plan · {user?.role} · risk {user?.riskScore} ·{" "}
            {user?.active ? "active" : "inactive"}
          </p>
        </div>
        <Link to="/tickets" className="btn-primary">
          Open the queue
        </Link>
      </div>

      {error && (
        <p className="card mt-8 border-rose-500/30 bg-rose-500/10 text-sm text-rose-200">{error}</p>
      )}

      <div className="mt-8">
        <Banner
          tone="info"
          title={`${CHANGELOG[0].version} is live — ${CHANGELOG[0].title}`}
          action={
            <Link to="/changelog" className="btn-ghost">
              Release notes
            </Link>
          }
        >
          Released {CHANGELOG[0].date}. {CHANGELOG[0].notes[0]}
        </Banner>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["open", "pending", "resolved"] as const).map((status) => (
          <div key={status} className="card">
            <dt className="text-xs uppercase tracking-wider text-slate-500">{status}</dt>
            <dd className="mt-2 text-2xl font-semibold text-white">
              {loading ? "—" : (counts[status] ?? 0)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Median first response" value="31m" delta="-6m" hint="target 60m" />
        <StatTile label="SLA attainment" value="94.2%" delta="+1.1%" hint="last 30 days" />
        <StatTile label="Reopened rate" value="4.8%" delta="+0.6%" hint="watch this one" />
        <StatTile
          label="Agents online"
          value={String(TEAM.filter((member) => member.status === "active").length)}
          hint="6 timezones"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Needs attention first
        </h2>

        {loading ? (
          <p className="card mt-4 text-sm text-slate-400">Loading tickets…</p>
        ) : needsAttention.length === 0 ? (
          <p className="card mt-4 text-sm text-slate-400">
            Nothing open. Either the team is fast or the seed script has not run.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {needsAttention.map((ticket) => (
              <li key={ticket.id} className="card flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.reference} · {ticket.requesterEmail}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <span className="chip">{ticket.priority}</span>
                  <span className="chip">{ticket.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Section
          title="Recent activity"
          description="The last six things anyone in this workspace did."
          actions={
            <Link to="/tickets" className="text-xs text-iris-300 hover:text-iris-200">
              View the queue →
            </Link>
          }
        >
          <ol className="space-y-4 border-l border-white/10 pl-5">
            {ACTIVITY.map((event) => (
              <li key={event.target} className="relative">
                <span className="absolute -left-[23px] top-2 h-2 w-2 rounded-full bg-iris-400" />
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">{event.who}</span> {event.what}{" "}
                  <span className="text-slate-400">{event.target}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{event.when}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Response time by weekday" description="Minutes, business hours only.">
          <BarChart series={RESPONSE_BY_DAY} unit="m" />
          <div className="card mt-4">
            <p className="text-sm font-medium text-slate-200">Friday is the outlier</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              68% above the Thursday median. The ticket mix is unchanged, so this is staffing rather
              than difficulty.
            </p>
            <div className="mt-3">
              <ProgressBar value={68} tone="warning" />
            </div>
          </div>
        </Section>
      </div>

      <Section title="Jump to" description="Everything this workspace can do.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="card transition hover:border-white/25">
              <p className="text-sm font-semibold text-white">{link.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{link.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Worth reading" description="Three guides that answer most first-week questions.">
        <div className="grid gap-4 sm:grid-cols-3">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              to={`/knowledge/${article.slug}`}
              className="card transition hover:border-white/25"
            >
              <span className="chip">{article.category}</span>
              <p className="mt-3 text-sm font-semibold text-white">{article.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {article.readingMinutes} min · updated {article.updated}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
