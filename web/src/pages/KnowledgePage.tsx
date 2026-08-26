import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Accordion, Badge, Banner, EmptyState, PageHeader, Section } from "@/components/ui";
import { ARTICLE_CATEGORIES, ARTICLES } from "@/lib/content";

export function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof ARTICLE_CATEGORIES)[number]>("All");
  const [showBanner, setShowBanner] = useState(true);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = category === "All" || article.category === category;
      const matchesQuery =
        !needle ||
        article.title.toLowerCase().includes(needle) ||
        article.summary.toLowerCase().includes(needle) ||
        article.sections.some((section) => section.heading.toLowerCase().includes(needle));
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const article of ARTICLES) map.set(article.category, (map.get(article.category) ?? 0) + 1);
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Help centre"
        title="Knowledge base"
        description="Everything the team wrote down so it would not have to be explained twice. Six guides, roughly forty-five minutes of reading, and none of it assumes you have used DeskDesk before."
        actions={
          <>
            <Link to="/tickets" className="btn-ghost">
              Ask support instead
            </Link>
            <a className="btn-primary" href="#faq">
              Jump to FAQ
            </a>
          </>
        }
      />

      {showBanner && (
        <div className="mt-6">
          <Banner
            tone="info"
            title="New: saved views and per-view SLA targets"
            action={
              <Link to="/changelog" className="btn-ghost">
                Read the release notes
              </Link>
            }
            onDismiss={() => setShowBanner(false)}
          >
            Shipped in 3.9.0. Any filter combination can now be saved and shared with your workspace.
          </Banner>
        </div>
      )}

      <div className="mt-8 grid max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-slate-500">Browse</p>
            <ul className="mt-3 space-y-1">
              {ARTICLE_CATEGORIES.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => setCategory(option)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      category === option
                        ? "bg-iris-500/15 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {option}
                    <span className="text-xs text-slate-500">
                      {option === "All" ? ARTICLES.length : (byCategory.get(option) ?? 0)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card mt-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Still stuck?</p>
            <p className="mt-2 text-sm text-slate-400">
              Open a ticket and an agent picks it up within one business hour on Pro.
            </p>
            <Link to="/tickets" className="btn-primary mt-3 w-full">
              Open a ticket
            </Link>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="input max-w-sm"
              placeholder="Search the knowledge base…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="text-xs text-slate-500">
              {results.length} of {ARTICLES.length} articles
            </span>
          </div>

          {results.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nothing matched that search"
                description="Try a broader term, or clear the category filter on the left."
                action={
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {results.map((article) => (
                <li key={article.slug} className="card transition hover:border-white/25">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{article.category}</Badge>
                    <span className="text-xs text-slate-500">
                      {article.readingMinutes} min read · updated {article.updated}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    <Link to={`/knowledge/${article.slug}`} className="hover:text-iris-300">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{article.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.sections.slice(0, 3).map((section) => (
                      <span key={section.heading} className="chip">
                        {section.heading}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Section
            id="faq"
            title="Frequently asked"
            description="The five questions that arrive most often, answered without a support ticket."
          >
            <Accordion
              items={[
                {
                  q: "Can I import from my current help desk?",
                  a: "Yes — CSV or the migration API. Import ninety days first into a staging workspace and check the custom fields before doing the real run.",
                },
                {
                  q: "Does DeskDesk have a fourth ticket status?",
                  a: "No, and that is deliberate. Write the sentence that distinguishes your fourth status; if it needs the word 'sometimes', a priority or tag will serve you better.",
                },
                {
                  q: "Who can delete a ticket?",
                  a: "Only the security and compliance roles. Roles gate verbs, never rows — everyone in a workspace sees the same queue.",
                },
                {
                  q: "Can an admin read another workspace?",
                  a: "No. The workspace comes from the access token and cannot be widened by the client. To see another workspace, sign in to it.",
                },
                {
                  q: "Do auto-replies stop the SLA clock?",
                  a: "No. A first response is a human one — the customer did not get an answer, they got a receipt.",
                },
              ]}
            />
          </Section>

          <Section title="Popular right now" description="What other workspaces opened this week.">
            <div className="grid gap-4 sm:grid-cols-2">
              {ARTICLES.slice(0, 4).map((article, index) => (
                <Link
                  key={article.slug}
                  to={`/knowledge/${article.slug}`}
                  className="card flex items-start gap-4 transition hover:border-white/25"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-sm font-semibold text-slate-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {article.category} · {article.readingMinutes} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
