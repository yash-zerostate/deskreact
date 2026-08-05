import { useCallback, useEffect, useState } from "react";

import {
  addComment,
  createTicket,
  listTickets,
  updateTicket,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

const STATUS_FILTERS = ["all", "open", "pending", "resolved"] as const;
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

const EMPTY_FORM = {
  subject: "",
  body: "",
  requesterEmail: "",
  priority: "normal" as TicketPriority,
};

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const result = await listTickets({ status, q: search });
    if (result.ok) {
      setTickets(result.data.tickets);
      setMessage(null);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  }, [status, search]);

  // Re-query the API whenever the filter changes; the list is never filtered
  // client-side, so what you see is what the server authorised.
  useEffect(() => {
    void load();
  }, [load]);

  async function submitNew(event: React.FormEvent) {
    event.preventDefault();
    setFields({});
    setMessage(null);

    const result = await createTicket(form);
    if (!result.ok) {
      setFields(result.fields ?? {});
      setMessage(result.message);
      return;
    }

    setForm(EMPTY_FORM);
    await load();
  }

  async function changeStatus(ticket: Ticket, next: TicketStatus) {
    const result = await updateTicket(ticket.id, { status: next });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setTickets((current) =>
      current.map((row) => (row.id === ticket.id ? result.data.ticket : row)),
    );
    if (selected?.id === ticket.id) setSelected(result.data.ticket);
  }

  async function submitReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;

    const result = await addComment(selected.id, reply.trim());
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setReply("");
    setSelected(result.data.ticket);
    setTickets((current) =>
      current.map((row) => (row.id === selected.id ? result.data.ticket : row)),
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Ticket queue</h1>
      <p className="mt-1 text-sm text-slate-400">
        Filtering and search run on the API, scoped to your workspace by the token.
      </p>

      {message && (
        <p className="card mt-6 border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-xl border border-white/10 p-1">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                    status === option ? "bg-iris-500 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              className="input max-w-xs"
              placeholder="Search subject, reference, email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <p className="card mt-4 text-sm text-slate-400">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="card mt-4 text-sm text-slate-400">No tickets match that filter.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setSelected(ticket)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-white">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.reference} · {ticket.requesterEmail} · {ticket.comments.length}{" "}
                        {ticket.comments.length === 1 ? "reply" : "replies"}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="chip">{ticket.priority}</span>
                      <select
                        className="input w-32 py-1.5 text-xs"
                        value={ticket.status}
                        onChange={(event) =>
                          changeStatus(ticket, event.target.value as TicketStatus)
                        }
                      >
                        <option value="open">open</option>
                        <option value="pending">pending</option>
                        <option value="resolved">resolved</option>
                      </select>
                    </div>
                  </div>

                  {selected?.id === ticket.id && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm text-slate-300">{ticket.body}</p>

                      {ticket.comments.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {ticket.comments.map((comment, index) => (
                            <li key={index} className="rounded-xl bg-white/5 px-3 py-2">
                              <p className="text-xs font-semibold text-slate-300">
                                {comment.authorName}
                              </p>
                              <p className="mt-1 text-sm text-slate-400">{comment.body}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      <form onSubmit={submitReply} className="mt-4 flex gap-2">
                        <input
                          className="input"
                          placeholder="Write a reply…"
                          value={reply}
                          onChange={(event) => setReply(event.target.value)}
                        />
                        <button type="submit" className="btn-primary shrink-0">
                          Reply
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="card h-fit">
          <h2 className="text-sm font-semibold text-white">New ticket</h2>

          <form onSubmit={submitNew} className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                className="input"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                required
              />
              {fields.subject && <p className="field-error">{fields.subject}</p>}
            </div>

            <div>
              <label className="label" htmlFor="requesterEmail">
                Requester email
              </label>
              <input
                id="requesterEmail"
                type="email"
                className="input"
                value={form.requesterEmail}
                onChange={(event) => setForm({ ...form, requesterEmail: event.target.value })}
                required
              />
              {fields.requesterEmail && <p className="field-error">{fields.requesterEmail}</p>}
            </div>

            <div>
              <label className="label" htmlFor="body">
                Details
              </label>
              <textarea
                id="body"
                rows={4}
                className="input resize-none"
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                required
              />
              {fields.body && <p className="field-error">{fields.body}</p>}
            </div>

            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                className="input"
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value as TicketPriority })
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full">
              Create ticket
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
