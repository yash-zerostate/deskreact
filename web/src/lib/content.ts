/**
 * Static marketing / documentation content for the pages that do not talk to
 * the API. Keeping it here rather than inline keeps the page components about
 * layout, and makes the pages long enough to be worth scrolling — which is the
 * point: long pages exercise scroll-triggered and viewport-triggered elements.
 */

export type Article = {
  slug: string;
  title: string;
  category: "Getting started" | "Workflows" | "Security" | "Integrations" | "Billing";
  readingMinutes: number;
  updated: string;
  summary: string;
  sections: Array<{ heading: string; paragraphs: string[]; list?: string[]; code?: string }>;
};

export const ARTICLES: Article[] = [
  {
    slug: "first-week-with-deskdesk",
    title: "Your first week with DeskDesk",
    category: "Getting started",
    readingMinutes: 7,
    updated: "2026-08-04",
    summary:
      "A day-by-day plan for moving a support queue onto DeskDesk without freezing your existing workflow.",
    sections: [
      {
        heading: "Day one — import, do not migrate",
        paragraphs: [
          "The instinct on day one is to move everything. Resist it. Import the last ninety days of tickets and leave the archive where it is. Ninety days covers almost every ticket a customer will follow up on, and it keeps the first import small enough that you can eyeball the result.",
          "Run the importer against a staging workspace first. It is free, it is disposable, and it will surface the two or three fields your old tool called something else. Every migration has them.",
        ],
        list: [
          "Create a staging workspace and invite only yourself.",
          "Import ninety days of tickets from CSV or the migration API.",
          "Spot-check twenty tickets across the priority range.",
          "Note any custom fields that landed in the wrong column.",
        ],
      },
      {
        heading: "Day two — decide what a status means",
        paragraphs: [
          "DeskDesk ships with three statuses: open, pending, and resolved. Teams routinely want a fourth, and almost as routinely discover the fourth was a workflow problem wearing a status costume.",
          "Before adding one, write the sentence that distinguishes it. If the sentence needs the word 'sometimes', the status is not pulling its weight and a priority or a tag will serve you better.",
        ],
      },
      {
        heading: "Day three — wire the inbound channels",
        paragraphs: [
          "Forwarding rules are the least glamorous part of the setup and the one most likely to lose you a ticket. Verify each address by sending a real message from outside your domain, not by using the test button.",
        ],
        code: "curl -X POST https://api.deskdesk.example/tickets \\\n  -H 'Authorization: Bearer $DESKDESK_TOKEN' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"subject\":\"Smoke test\",\"body\":\"Ignore me\",\"priority\":\"low\"}'",
      },
      {
        heading: "Day four and five — run both systems",
        paragraphs: [
          "Two days of double-running feels wasteful and saves you a bad week. Answer from DeskDesk, keep the old tool open, and log every case where an agent had to switch back. That list is your real gap analysis.",
          "By Friday the list is usually short enough to fix in an afternoon. If it is not, delay the cutover by a week. Nothing about a support migration improves under a deadline.",
        ],
      },
    ],
  },
  {
    slug: "priority-that-actually-works",
    title: "Designing a priority scale that survives a bad Monday",
    category: "Workflows",
    readingMinutes: 9,
    updated: "2026-07-29",
    summary:
      "Four levels, one rule each, and a weekly audit. Why most priority schemes collapse under load and how to build one that does not.",
    sections: [
      {
        heading: "Every scale drifts upward",
        paragraphs: [
          "Given a scale from low to urgent and no enforcement, a support queue converges on 'high' within about six weeks. Nobody decides this. It emerges: marking something high is free, marking it low invites a follow-up asking why it was marked low.",
          "The fix is not discipline. The fix is making each level cost something and mean something.",
        ],
      },
      {
        heading: "One rule per level",
        paragraphs: [
          "Write the rule as a test an agent can run in five seconds without asking anyone. If the rule needs judgement, it needs an example instead.",
        ],
        list: [
          "Urgent — a paying customer cannot use the product at all, right now.",
          "High — a paying customer has a workaround but it is painful.",
          "Normal — everything that has a next step and no deadline.",
          "Low — informational, or waiting on something outside our control.",
        ],
      },
      {
        heading: "Audit ten tickets a week",
        paragraphs: [
          "Pick ten resolved tickets at random on Friday and re-grade them cold. You are not looking for mistakes; you are looking for the level that your team has quietly redefined. It is usually high.",
          "When you find the drift, change the rule to match reality or change the practice to match the rule. Leaving the two out of sync is how a scale dies.",
        ],
      },
    ],
  },
  {
    slug: "role-based-access-in-practice",
    title: "Role-based access in practice",
    category: "Security",
    readingMinutes: 11,
    updated: "2026-08-12",
    summary:
      "Who can delete a ticket, who can read another workspace, and why the answer must come from the token rather than the query string.",
    sections: [
      {
        heading: "The tenancy boundary is the workspace",
        paragraphs: [
          "Every ticket query in DeskDesk is scoped by the workspace baked into the caller's access token. The client cannot pass a workspace, cannot override it, and cannot widen it. This is deliberately boring: the one thing you never want to be clever about is the boundary between customers.",
          "A consequence worth stating plainly — an admin who wants to see another workspace signs in to that workspace. There is no cross-tenant view, because a cross-tenant view is a cross-tenant leak waiting for its first bug.",
        ],
      },
      {
        heading: "Roles gate verbs, not rows",
        paragraphs: [
          "Roles in DeskDesk decide what you may do, never what you may see. Everyone in a workspace sees the same queue; only the security and compliance roles may delete from it. Splitting visibility by role sounds tidy and produces a support team that cannot answer its own tickets.",
        ],
        list: [
          "developer — read, create, reply, change status and priority.",
          "marketing — the same, minus bulk operations.",
          "security — everything above, plus delete and audit export.",
          "compliance — everything security can do, plus retention overrides.",
        ],
      },
      {
        heading: "Tokens are short, refresh is rotated",
        paragraphs: [
          "The access token lives fifteen minutes. The refresh token lives in an httpOnly cookie, rotates on every use, and a reused token invalidates the whole family. If an attacker replays an old refresh token, the legitimate session dies too — noisy on purpose, because a silent takeover is worse than an unexpected logout.",
        ],
        code: "POST /auth/refresh\nCookie: dd_refresh=<opaque>\n\n200 OK\n{ \"accessToken\": \"<jwt>\", \"expiresIn\": 900 }",
      },
      {
        heading: "What the context cookie is not",
        paragraphs: [
          "There is a second, readable cookie carrying signed targeting attributes for the personalisation layer. It authenticates nothing. Editing it breaks its signature; presenting it to the API achieves exactly nothing. It exists because the code that reads it runs in the browser and therefore cannot be given anything secret.",
        ],
      },
    ],
  },
  {
    slug: "connecting-slack-and-github",
    title: "Connecting Slack and GitHub without the noise",
    category: "Integrations",
    readingMinutes: 6,
    updated: "2026-06-18",
    summary:
      "Route only what a human must act on. A channel that pings on every event is a channel nobody reads by week three.",
    sections: [
      {
        heading: "Start with nothing enabled",
        paragraphs: [
          "The default integration configuration forwards every event, which is the right default for a demo and the wrong one for a team. Turn everything off and add back the two events you would wake someone up for.",
        ],
        list: [
          "New urgent ticket in a paid workspace.",
          "A ticket breaching its first-response target.",
        ],
      },
      {
        heading: "Link issues, do not mirror them",
        paragraphs: [
          "Mirroring a ticket into a GitHub issue creates two sources of truth and a synchronisation bug. Link them instead: the ticket keeps the customer conversation, the issue keeps the engineering one, and a status change on either side posts a single comment on the other.",
        ],
      },
    ],
  },
  {
    slug: "understanding-your-invoice",
    title: "Understanding your invoice",
    category: "Billing",
    readingMinutes: 5,
    updated: "2026-08-20",
    summary: "Seats, overage, and the proration maths that surprises people in month two.",
    sections: [
      {
        heading: "You pay for seats, not tickets",
        paragraphs: [
          "A seat is an account that replied to at least one ticket during the billing period. Accounts that only read are free and always will be — charging for observers is how you end up with shared logins.",
        ],
      },
      {
        heading: "Proration is daily, not monthly",
        paragraphs: [
          "Add a seat on the twentieth and you are billed for eleven days, not a month. Remove one and the credit appears on the next invoice rather than as a refund. Month two therefore rarely matches month one, which is the single most common billing question we get.",
        ],
      },
    ],
  },
  {
    slug: "sla-targets-and-business-hours",
    title: "SLA targets and business hours",
    category: "Workflows",
    readingMinutes: 8,
    updated: "2026-07-02",
    summary:
      "How the clock pauses, what counts as a first response, and why an SLA measured in calendar hours punishes the wrong people.",
    sections: [
      {
        heading: "The clock follows the workspace calendar",
        paragraphs: [
          "A four-hour target on a Friday evening means the first business hour on Monday, not four in the morning on Saturday. Configure the calendar before you configure the targets or every number you look at in the first month will be wrong.",
        ],
      },
      {
        heading: "A first response is a human one",
        paragraphs: [
          "Auto-acknowledgements do not stop the clock. This is occasionally unpopular and always correct: the customer did not get an answer, they got a receipt.",
        ],
      },
      {
        heading: "Pausing is a status, not a button",
        paragraphs: [
          "Moving a ticket to pending pauses the response clock and starts the resolution clock. There is no separate pause control, because a pause control is an SLA-shaped lie the moment somebody discovers it.",
        ],
      },
    ],
  },
];

export const ARTICLE_CATEGORIES = [
  "All",
  "Getting started",
  "Workflows",
  "Security",
  "Integrations",
  "Billing",
] as const;

export type Plan = {
  id: "free" | "pro" | "enterprise";
  name: string;
  monthly: number;
  annual: number;
  blurb: string;
  highlights: string[];
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    monthly: 0,
    annual: 0,
    blurb: "For a team of two proving that a shared inbox has stopped scaling.",
    highlights: [
      "Up to 3 seats",
      "1 inbound email address",
      "30-day ticket history",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 29,
    annual: 24,
    blurb: "For a support team that answers on a schedule and reports on it.",
    highlights: [
      "Unlimited seats",
      "10 inbound addresses",
      "Unlimited history and export",
      "SLA targets and business hours",
      "Slack and GitHub integrations",
      "Email support, next business day",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 79,
    annual: 65,
    blurb: "For workspaces where access control is a compliance requirement.",
    highlights: [
      "Everything in Pro",
      "SAML SSO and SCIM provisioning",
      "Role-based delete and audit export",
      "Retention overrides and legal hold",
      "Data residency choice",
      "Named contact, 4-hour response",
    ],
  },
];

export const FEATURE_MATRIX: Array<{
  group: string;
  rows: Array<{ feature: string; free: string; pro: string; enterprise: string }>;
}> = [
  {
    group: "Queue",
    rows: [
      { feature: "Seats", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Inbound addresses", free: "1", pro: "10", enterprise: "Unlimited" },
      { feature: "Ticket history", free: "30 days", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Saved views", free: "—", pro: "20", enterprise: "Unlimited" },
      { feature: "Bulk actions", free: "—", pro: "✓", enterprise: "✓" },
    ],
  },
  {
    group: "Reporting",
    rows: [
      { feature: "Volume and status counts", free: "✓", pro: "✓", enterprise: "✓" },
      { feature: "SLA attainment", free: "—", pro: "✓", enterprise: "✓" },
      { feature: "Scheduled exports", free: "—", pro: "Weekly", enterprise: "Hourly" },
      { feature: "Raw event stream", free: "—", pro: "—", enterprise: "✓" },
    ],
  },
  {
    group: "Security and access",
    rows: [
      { feature: "Role-based permissions", free: "—", pro: "✓", enterprise: "✓" },
      { feature: "SAML SSO", free: "—", pro: "—", enterprise: "✓" },
      { feature: "SCIM provisioning", free: "—", pro: "—", enterprise: "✓" },
      { feature: "Audit log export", free: "—", pro: "90 days", enterprise: "7 years" },
      { feature: "Data residency", free: "EU", pro: "EU or US", enterprise: "Choice of 6" },
    ],
  },
];

export const PRICING_FAQ = [
  {
    q: "What counts as a seat?",
    a: "An account that replied to at least one ticket during the billing period. Read-only accounts are always free.",
  },
  {
    q: "Can I change plan mid-month?",
    a: "Yes. Upgrades take effect immediately and are prorated daily; downgrades take effect at the end of the current period so you keep what you paid for.",
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Annual billing is roughly two months cheaper per seat and is shown above when you switch the toggle.",
  },
  {
    q: "What happens if I exceed my inbound addresses?",
    a: "Nothing breaks. Mail keeps arriving, and the next invoice includes the extra addresses at the standard per-address rate.",
  },
  {
    q: "Do you offer a non-profit or education rate?",
    a: "Yes, 50% off Pro and Enterprise. Write to billing from a domain you control and we will apply it to the workspace.",
  },
];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "developer" | "security" | "marketing" | "compliance";
  status: "active" | "invited" | "suspended";
  tickets: number;
  responseMinutes: number;
  timezone: string;
};

export const TEAM: TeamMember[] = [
  { id: "u_01", name: "Ada Okonjo", email: "ada@northwind.example", role: "security", status: "active", tickets: 148, responseMinutes: 21, timezone: "Europe/London" },
  { id: "u_02", name: "Bruno Sato", email: "bruno@northwind.example", role: "developer", status: "active", tickets: 203, responseMinutes: 34, timezone: "Asia/Tokyo" },
  { id: "u_03", name: "Clara Mendes", email: "clara@northwind.example", role: "compliance", status: "active", tickets: 62, responseMinutes: 48, timezone: "America/Sao_Paulo" },
  { id: "u_04", name: "Dev Raghavan", email: "dev@northwind.example", role: "developer", status: "active", tickets: 311, responseMinutes: 18, timezone: "Asia/Kolkata" },
  { id: "u_05", name: "Elin Haugen", email: "elin@northwind.example", role: "marketing", status: "invited", tickets: 0, responseMinutes: 0, timezone: "Europe/Oslo" },
  { id: "u_06", name: "Farid Nasser", email: "farid@northwind.example", role: "developer", status: "active", tickets: 97, responseMinutes: 41, timezone: "Asia/Dubai" },
  { id: "u_07", name: "Grace Whitlock", email: "grace@northwind.example", role: "security", status: "suspended", tickets: 55, responseMinutes: 63, timezone: "America/New_York" },
  { id: "u_08", name: "Hana Kovač", email: "hana@northwind.example", role: "marketing", status: "active", tickets: 74, responseMinutes: 39, timezone: "Europe/Ljubljana" },
];

export type Incident = {
  id: string;
  title: string;
  severity: "minor" | "major" | "critical";
  started: string;
  resolvedAfter: string;
  components: string[];
  updates: Array<{ at: string; body: string }>;
};

export const INCIDENTS: Incident[] = [
  {
    id: "INC-2026-0814",
    title: "Elevated latency on ticket search",
    severity: "minor",
    started: "2026-08-14 09:12 UTC",
    resolvedAfter: "48 minutes",
    components: ["Search", "API"],
    updates: [
      { at: "09:12", body: "Investigating reports of slow search results in EU workspaces." },
      { at: "09:31", body: "Identified: a stale index shard was serving a fraction of queries." },
      { at: "09:47", body: "Shard rebuilt, latency returning to baseline. Monitoring." },
      { at: "10:00", body: "Resolved. No tickets were lost and no writes were affected." },
    ],
  },
  {
    id: "INC-2026-0722",
    title: "Inbound email delayed for one provider",
    severity: "major",
    started: "2026-07-22 14:03 UTC",
    resolvedAfter: "3 hours 20 minutes",
    components: ["Email ingest"],
    updates: [
      { at: "14:03", body: "Mail from one upstream provider is queueing rather than delivering." },
      { at: "14:40", body: "Upstream confirmed a reputation block applied to our inbound range." },
      { at: "16:55", body: "Block lifted; the queue is draining oldest-first." },
      { at: "17:23", body: "Queue empty. Every delayed message was delivered — none were dropped." },
    ],
  },
  {
    id: "INC-2026-0603",
    title: "Refresh tokens rejected after a deploy",
    severity: "critical",
    started: "2026-06-03 21:47 UTC",
    resolvedAfter: "26 minutes",
    components: ["Auth", "API"],
    updates: [
      { at: "21:47", body: "A deploy rotated a signing key without a grace window; active sessions were logged out." },
      { at: "21:52", body: "Rolled back. Sign-in works; existing sessions still require a fresh login." },
      { at: "22:13", body: "Resolved. Key rotation now runs with a 24-hour dual-verify window." },
    ],
  },
];

export const UPTIME_DAYS = Array.from({ length: 60 }, (_, index) => {
  // Deterministic pseudo-history: three bad days, one partial, the rest green.
  if (index === 14) return "critical" as const;
  if (index === 33 || index === 34) return "major" as const;
  if (index === 51) return "minor" as const;
  return "ok" as const;
});

export type Release = {
  version: string;
  date: string;
  tag: "feature" | "fix" | "security" | "performance";
  title: string;
  notes: string[];
};

export const CHANGELOG: Release[] = [
  {
    version: "3.9.0",
    date: "2026-08-21",
    tag: "feature",
    title: "Saved views and per-view SLA targets",
    notes: [
      "Any filter combination can be saved as a view and shared with the workspace.",
      "Views may carry their own first-response target, so a VIP filter can be stricter than the default.",
      "The queue remembers the last view per person rather than per browser.",
    ],
  },
  {
    version: "3.8.2",
    date: "2026-08-09",
    tag: "fix",
    title: "Comment ordering under clock skew",
    notes: [
      "Replies written within the same second no longer occasionally render out of order.",
      "Ticket timestamps are now rendered in the viewer's timezone with the UTC value in the tooltip.",
    ],
  },
  {
    version: "3.8.0",
    date: "2026-07-28",
    tag: "security",
    title: "Refresh token reuse detection",
    notes: [
      "Refresh tokens rotate on every use and a replayed token invalidates the whole family.",
      "Key rotation now runs with a 24-hour dual-verify window (see INC-2026-0603).",
      "Session list in Settings shows the device, IP prefix and last-seen time for each active session.",
    ],
  },
  {
    version: "3.7.4",
    date: "2026-07-11",
    tag: "performance",
    title: "Queue rendering on large workspaces",
    notes: [
      "The ticket list virtualises past 200 rows; scrolling a 20,000-ticket queue no longer stutters.",
      "Status counts are computed server-side, cutting a second off first paint for big workspaces.",
    ],
  },
  {
    version: "3.7.0",
    date: "2026-06-24",
    tag: "feature",
    title: "Business hours calendars",
    notes: [
      "SLA clocks follow a per-workspace calendar including holidays.",
      "Pending pauses the response clock and starts the resolution clock.",
    ],
  },
  {
    version: "3.6.1",
    date: "2026-06-05",
    tag: "fix",
    title: "Email ingest hardening",
    notes: [
      "Messages with malformed MIME boundaries are parsed rather than bounced.",
      "Attachments over the size limit now create the ticket and attach a notice, instead of failing the whole message.",
    ],
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "We moved 14,000 open tickets in a weekend and the only thing that broke was a custom field nobody had used since 2023.",
    name: "Priya Raman",
    title: "Head of Support, Lumen Freight",
  },
  {
    quote:
      "The priority rules are the first ones our team has not quietly abandoned. Four levels, one sentence each — it turns out that was the whole trick.",
    name: "Tomas Berg",
    title: "Support Lead, Kettle & Co",
  },
  {
    quote:
      "Audit export took an afternoon to satisfy a requirement we had budgeted a quarter for.",
    name: "Amara Diallo",
    title: "Compliance Manager, Ridgeline Health",
  },
];

export const RESPONSE_BY_DAY = [
  { label: "Mon", value: 34 },
  { label: "Tue", value: 28 },
  { label: "Wed", value: 41 },
  { label: "Thu", value: 26 },
  { label: "Fri", value: 47 },
  { label: "Sat", value: 12 },
  { label: "Sun", value: 9 },
];

export const VOLUME_BY_WEEK = [
  { label: "W27", value: 210 },
  { label: "W28", value: 248 },
  { label: "W29", value: 193 },
  { label: "W30", value: 267 },
  { label: "W31", value: 301 },
  { label: "W32", value: 288 },
  { label: "W33", value: 254 },
  { label: "W34", value: 316 },
];

export const CHANNEL_MIX = [
  { channel: "Email", share: 58, tickets: 1841, trend: "+4%" },
  { channel: "In-app widget", share: 24, tickets: 762, trend: "+11%" },
  { channel: "API", share: 11, tickets: 349, trend: "-2%" },
  { channel: "Phone callback", share: 7, tickets: 222, trend: "+1%" },
];

export const AGENT_LEADERBOARD = [
  { name: "Dev Raghavan", resolved: 311, firstResponse: "18m", satisfaction: 96 },
  { name: "Bruno Sato", resolved: 203, firstResponse: "34m", satisfaction: 92 },
  { name: "Ada Okonjo", resolved: 148, firstResponse: "21m", satisfaction: 94 },
  { name: "Farid Nasser", resolved: 97, firstResponse: "41m", satisfaction: 89 },
  { name: "Hana Kovač", resolved: 74, firstResponse: "39m", satisfaction: 91 },
  { name: "Clara Mendes", resolved: 62, firstResponse: "48m", satisfaction: 88 },
];
