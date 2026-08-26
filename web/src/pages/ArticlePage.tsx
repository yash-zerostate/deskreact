import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge, Banner, EmptyState, Section } from "@/components/ui";
import { ARTICLES } from "@/lib/content";

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = ARTICLES.find((candidate) => candidate.slug === slug);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  if (!article) {
    return (
      <EmptyState
        title="That article has moved"
        description="It may have been renamed or folded into another guide. The index has everything."
        action={
          <Link to="/knowledge" className="btn-primary">
            Back to the knowledge base
          </Link>
        }
      />
    );
  }

  const related = ARTICLES.filter(
    (candidate) => candidate.slug !== article.slug && candidate.category === article.category,
  ).concat(ARTICLES.filter((candidate) => candidate.category !== article.category)).slice(0, 3);

  return (
    <article data-preta-slot="article" className="mx-auto max-w-5xl">
      <nav className="text-xs text-slate-500">
        <Link to="/knowledge" className="hover:text-slate-300">
          Knowledge base
        </Link>{" "}
        / <span className="text-slate-400">{article.category}</span>
      </nav>

      <header className="mt-3 border-b border-white/5 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{article.category}</Badge>
          <span className="text-xs text-slate-500">
            {article.readingMinutes} min read · updated {article.updated}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">{article.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">{article.summary}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          {article.sections.map((section) => (
            <section key={section.heading} id={slugify(section.heading)} className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 text-[15px] leading-7 text-slate-300">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-7 text-slate-300">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iris-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.code && (
                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}

          <Banner
            tone="warning"
            title="This guide assumes the default workspace calendar"
            action={
              <Link to="/settings" className="btn-ghost">
                Check settings
              </Link>
            }
          >
            If your workspace runs custom business hours, the timings above shift with the calendar.
          </Banner>

          <div className="card mt-8" data-preta-slot="article-feedback">
            <p className="text-sm font-semibold text-white">Was this helpful?</p>
            {vote ? (
              <p className="mt-2 text-sm text-slate-400">
                {vote === "up"
                  ? "Noted — thanks. This article stays where it is."
                  : "Noted. Tell us what was missing by opening a ticket and we will rewrite it."}
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost" onClick={() => setVote("up")}>
                  👍 Yes
                </button>
                <button type="button" className="btn-ghost" onClick={() => setVote("down")}>
                  👎 Not really
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-slate-500">On this page</p>
            <ul className="mt-3 space-y-2">
              {article.sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="block text-sm leading-snug text-slate-400 hover:text-white"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Section title="Related reading" description="Three more guides people open after this one.">
        <div className="grid gap-4 sm:grid-cols-3">
          {related.map((candidate) => (
            <Link
              key={candidate.slug}
              to={`/knowledge/${candidate.slug}`}
              className="card transition hover:border-white/25"
            >
              <Badge>{candidate.category}</Badge>
              <p className="mt-3 text-sm font-semibold text-white">{candidate.title}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{candidate.summary}</p>
            </Link>
          ))}
        </div>
      </Section>
    </article>
  );
}
