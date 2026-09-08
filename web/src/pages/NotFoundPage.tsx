import { Link, useLocation } from "react-router-dom";

import { Section } from "@/components/ui";
import { ARTICLES } from "@/lib/content";

const DESTINATIONS = [
  { to: "/", label: "Overview", body: "Status counts and the five tickets that need answering first." },
  { to: "/tickets", label: "Tickets", body: "The queue, with server-side filtering and search." },
  { to: "/reports", label: "Reports", body: "Volume, response times, channel mix, per-agent attainment." },
  { to: "/knowledge", label: "Knowledge base", body: "Six guides covering setup, workflow and access control." },
  { to: "/status", label: "System status", body: "Sixty days of component health and every incident this year." },
  { to: "/pricing", label: "Pricing", body: "Three plans and a sixteen-row comparison table." },
];

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-14 text-center">
        <p className="font-mono text-sm text-iris-400">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Nothing lives at that address
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          <span className="font-mono text-slate-300">{location.pathname}</span> did not match any
          route. It may have been renamed, or the link that brought you here is older than the page.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Back to the overview
          </Link>
          <Link to="/knowledge" className="btn-ghost">
            Search the knowledge base
          </Link>
        </div>
      </div>

      <Section title="Try one of these" description="Every page this app knows about.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((item) => (
            <Link key={item.to} to={item.to} className="card transition hover:border-white/25">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Recently updated guides" description="In case you were looking for one of these.">
        <ul className="space-y-3">
          {ARTICLES.slice(0, 3).map((article) => (
            <li key={article.slug} className="card">
              <Link to={`/knowledge/${article.slug}`} className="text-sm font-semibold text-white hover:text-iris-300">
                {article.title}
              </Link>
              <p className="mt-1 text-xs text-slate-500">
                {article.category} · updated {article.updated}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
