import { useEffect, useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import {
  BarChart,
  Badge,
  Banner,
  PageHeader,
  ProgressBar,
  Section,
  StatTile,
  Tabs,
} from "@/components/ui";
import {
  AGENT_LEADERBOARD,
  CHANNEL_MIX,
  RESPONSE_BY_DAY,
  VOLUME_BY_WEEK,
} from "@/lib/content";
import { listTickets, type Ticket } from "@/lib/tickets";

const RANGES = ["7 days", "30 days", "90 days", "12 months"] as const;

export function ReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("volume");
  const [range, setRange] = useState<(typeof RANGES)[number]>("30 days");
  const [live, setLive] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // The charts below are static sample data; this one number is real, so the
  // page shows both a designed report and the actual queue behind it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listTickets();
      if (cancelled) return;
      if (result.ok) setLive(result.data.tickets);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const urgent = live.filter((ticket) => ticket.priority === "urgent").length;
  const proOrBetter = user?.plan !== "free";

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Volume, response times, channel mix and per-agent attainment. Sample figures except where marked live."
        actions={
          <>
            <select
              className="input w-auto"
              value={range}
              onChange={(event) => setRange(event.target.value as (typeof RANGES)[number])}
            >
              {RANGES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <button type="button" className="btn-ghost">
              Export CSV
            </button>
          </>
        }
      />

      {!proOrBetter && (
        <div className="mt-6">
          <Banner
            tone="warning"
            title="SLA attainment and scheduled exports need Pro"
            action={
              <a href="/pricing" className="btn-ghost">
                See plans
              </a>
            }
          >
            You are on the free plan, so the numbers below are visible but not exportable.
          </Banner>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Tickets received" value="2,174" delta="+8.4%" hint={`vs previous ${range}`} />
        <StatTile label="Median first response" value="31m" delta="-6m" hint="target 60m" />
        <StatTile label="SLA attainment" value="94.2%" delta="+1.1%" hint="business hours" />
        <StatTile
          label="Urgent open now"
          value={loading ? "—" : String(urgent)}
          hint="live from your queue"
        />
      </div>

      <div className="mt-8">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "volume", label: "Volume" },
            { id: "response", label: "Response time" },
            { id: "channels", label: "Channels", count: CHANNEL_MIX.length },
            { id: "agents", label: "Agents", count: AGENT_LEADERBOARD.length },
          ]}
        />
      </div>

      {tab === "volume" && (
        <Section title="Tickets per week" description="Eight weeks, all channels, all priorities.">
          <BarChart series={VOLUME_BY_WEEK} />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatTile label="Busiest week" value="W34" hint="316 tickets" />
            <StatTile label="Quietest week" value="W29" hint="193 tickets" />
            <StatTile label="Weekly average" value="260" delta="+3.2%" />
          </div>
        </Section>
      )}

      {tab === "response" && (
        <Section
          title="Median first response by weekday"
          description="Minutes, business hours only. Friday is where queues go to die."
        >
          <BarChart series={RESPONSE_BY_DAY} unit="m" />
          <p className="mt-4 text-sm text-slate-400">
            Friday sits 68% above the Thursday median. That is almost always staffing rather than
            ticket difficulty — the Friday mix looks like every other weekday.
          </p>
        </Section>
      )}

      {tab === "channels" && (
        <Section title="Channel mix" description="Where tickets came from over the selected range.">
          <div className="space-y-4">
            {CHANNEL_MIX.map((row) => (
              <div key={row.channel} className="card">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-100">{row.channel}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{row.tickets.toLocaleString()} tickets</span>
                    <Badge tone={row.trend.startsWith("+") ? "success" : "neutral"}>{row.trend}</Badge>
                    <span className="w-10 text-right text-slate-300">{row.share}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={row.share * 1.7} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === "agents" && (
        <Section title="Per-agent attainment" description="Resolved count, first response, satisfaction.">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Resolved</th>
                  <th className="px-5 py-3 font-medium">First response</th>
                  <th className="px-5 py-3 font-medium">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {AGENT_LEADERBOARD.map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-slate-100">{row.name}</td>
                    <td className="px-5 py-3 text-slate-300">{row.resolved}</td>
                    <td className="px-5 py-3 text-slate-300">{row.firstResponse}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 text-slate-300">{row.satisfaction}%</span>
                        <div className="w-28">
                          <ProgressBar
                            value={row.satisfaction}
                            tone={row.satisfaction >= 92 ? "brand" : "warning"}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section
        title="Scheduled reports"
        description="Sent to the workspace owner. Pro sends weekly, Enterprise hourly."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Weekly queue summary", when: "Mondays 08:00", to: "owners" },
            { name: "SLA breach digest", when: "Daily 18:00", to: "security role" },
            { name: "Channel mix", when: "First of the month", to: "owners" },
          ].map((report) => (
            <div key={report.name} className="card">
              <p className="text-sm font-semibold text-white">{report.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {report.when} · to {report.to}
              </p>
              <button type="button" className="btn-ghost mt-4 w-full">
                Edit schedule
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
