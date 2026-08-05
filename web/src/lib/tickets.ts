import { api, type ApiResult } from "@/lib/apiClient";

export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type Ticket = {
  id: string;
  reference: string;
  subject: string;
  body: string;
  requesterEmail: string;
  status: TicketStatus;
  priority: TicketPriority;
  comments: Array<{ authorName: string; body: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type TicketList = { tickets: Ticket[]; counts: Partial<Record<TicketStatus, number>> };

export function listTickets(params: { status?: string; q?: string } = {}): Promise<
  ApiResult<TicketList>
> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  const suffix = query.toString() ? `?${query}` : "";
  return api<TicketList>(`/tickets${suffix}`);
}

export function createTicket(input: {
  subject: string;
  body: string;
  requesterEmail: string;
  priority: TicketPriority;
}): Promise<ApiResult<{ ticket: Ticket }>> {
  return api<{ ticket: Ticket }>("/tickets", { method: "POST", body: JSON.stringify(input) });
}

export function updateTicket(
  id: string,
  patch: { status?: TicketStatus; priority?: TicketPriority },
): Promise<ApiResult<{ ticket: Ticket }>> {
  return api<{ ticket: Ticket }>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function addComment(id: string, body: string): Promise<ApiResult<{ ticket: Ticket }>> {
  return api<{ ticket: Ticket }>(`/tickets/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
