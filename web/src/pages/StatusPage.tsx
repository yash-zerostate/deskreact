import { useState } from "react";

import { Badge, Banner, PageHeader, Section, StatTile } from "@/components/ui";
import { INCIDENTS, UPTIME_DAYS } from "@/lib/content";

const COMPONENTS = [
  { name: "API", state: "ok", uptime: "99.98%" },
  { name: "Web app", state: "ok", uptime: "99.99%" },
  { name: "Email ingest", state: "degraded", uptime: "99.71%" },
  { name: "Search", state: "ok", uptime: "99.94%" },
  { name: "Webhooks", state: "ok", uptime: "99.96%" },
  { name: "Auth", state: "ok", uptime: "99.99%" },
] as const;

const BAR_TONES = {
  ok: "bg-emerald-500/70",
  minor: "bg-amber-400/80",
  major: "bg-orange-500/80",
  critical: "bg-rose-500/80",
} as const;

export function StatusPage() {
  const [subscribed, setSubscribed] = useState(false);
  const degraded = COMPONENTS.filter((component) => component.state !== "ok");

  return (
    <div>
      <PageHeader
        eyebrow="Reliability"
        title="System status"
        description="Sixty days of history across six components, plus every incident we have written up this year."
        actions={
          <button
            type="button"
            className={subscribed ? "btn-ghost" : "btn-primary"}
            onClick={() => setSubscribed(!subscribed)}
          >
            {subscribed ? "Subscribed to updates" : "Subscribe to updates"}
          </button>
        }
      />

      <div className="mt-6">
        {degraded.length === 0 ? (
          <Banner tone="success" title="All systems operational">
            No open incidents. The last one closed on 14 August after 48 minutes.
          </Banner>
        ) : (
          <Banner tone="warning" title={`${degraded.length} component degraded`}>
            {degraded.map((component) => component.name).join(", ")} — inbound mail from one upstream
            provider is queueing. Nothing is being dropped.
          </Banner>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Uptime, 90 days" value="99.94%" hint="target 99.9%" />
        <StatTile label="Incidents this year" value={String(INCIDENTS.length)} delta="-2" hint="vs last year" />
        <StatTile label="Median time to resolve" value="48m" delta="-19m" />
        <StatTile label="Open incidents" value="0" hint="1 component degraded" />
      </div>

      <Section title="Component health" description="Last sixty days, one bar per day.">
        <div className="space-y-4">
          {COMPONENTS.map((component) => (
            <div key={component.name} className="card" data-preta-slot="status-row">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      component.state === "ok" ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <p className="text-sm font-medium text-slate-100">{component.name}</p>
                  {component.state !== "ok" && <Badge tone="warning">Degraded</Badge>}
                </div>
                <span className="text-xs text-slate-500">{component.uptime} uptime</span>
              </div>

              <div className="mt-3 flex gap-[2px]">
                {UPTIME_DAYS.map((day, index) => (
                  <span
                    key={index}
                    title={`Day ${60 - index}: ${day}`}
                    className={`h-7 flex-1 rounded-sm ${BAR_TONES[day]}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>60 days ago</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Incident history" description="Written up within 48 hours, every time.">
        <div className="space-y-5">
          {INCIDENTS.map((incident) => (
            <article key={incident.id} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    incident.severity === "critical"
                      ? "danger"
                      : incident.severity === "major"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {incident.severity}
                </Badge>
                <span className="font-mono text-xs text-slate-500">{incident.id}</span>
                <span className="text-xs text-slate-500">
                  {incident.started} · resolved after {incident.resolvedAfter}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold text-white">{incident.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {incident.components.map((component) => (
                  <span key={component} className="chip">
                    {component}
                  </span>
                ))}
              </div>

              <ol className="mt-4 space-y-3 border-l border-white/10 pl-5">
                {incident.updates.map((update) => (
                  <li key={update.at} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-iris-400" />
                    <p className="text-xs font-mono text-slate-500">{update.at}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-300">{update.body}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </Section>

      <Section title="How we grade severity" description="Three levels, no room for negotiation during the incident.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { level: "Minor", tone: "neutral" as const, rule: "Something is slower or noisier than usual. No data is at risk and every request still completes." },
            { level: "Major", tone: "warning" as const, rule: "A feature is unavailable or badly delayed for some customers, with no data loss." },
            { level: "Critical", tone: "danger" as const, rule: "Customers cannot sign in, cannot reach the queue, or data integrity is in question." },
          ].map((item) => (
            <div key={item.level} className="card">
              <Badge tone={item.tone}>{item.level}</Badge>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.rule}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
