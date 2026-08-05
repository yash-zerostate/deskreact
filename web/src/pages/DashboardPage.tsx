import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { listTickets, type Ticket, type TicketStatus } from "@/lib/tickets";

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
    </div>
  );
}
