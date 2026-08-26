import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge, Banner, EmptyState, PageHeader, Section, Tabs } from "@/components/ui";
import { CHANGELOG, type Release } from "@/lib/content";

const TAG_TONE: Record<Release["tag"], "brand" | "success" | "danger" | "warning"> = {
  feature: "brand",
  fix: "success",
  security: "danger",
  performance: "warning",
};

export function ChangelogPage() {
  const [tag, setTag] = useState("all");
  const [query, setQuery] = useState("");

  const releases = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CHANGELOG.filter((release) => {
      const matchesTag = tag === "all" || release.tag === tag;
      const matchesQuery =
        !needle ||
        release.title.toLowerCase().includes(needle) ||
        release.version.includes(needle) ||
        release.notes.some((note) => note.toLowerCase().includes(needle));
      return matchesTag && matchesQuery;
    });
  }, [tag, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const release of CHANGELOG) map.set(release.tag, (map.get(release.tag) ?? 0) + 1);
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Product"
        title="Changelog"
        description="Every release since June, newest first. Security releases are always written up in full, even when nothing was exploited."
        actions={
          <>
            <Link to="/status" className="btn-ghost">
              System status
            </Link>
            <button type="button" className="btn-primary">
              Subscribe by email
            </button>
          </>
        }
      />

      <div className="mt-6">
        <Banner
          tone="info"
          title="Latest: 3.9.0 — saved views and per-view SLA targets"
          action={
            <a href="#v390" className="btn-ghost">
              Jump to it
            </a>
          }
        >
          Released 21 August 2026. Any filter combination can be saved and shared with the workspace.
        </Banner>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Tabs
          active={tag}
          onChange={setTag}
          tabs={[
            { id: "all", label: "All", count: CHANGELOG.length },
            { id: "feature", label: "Features", count: counts.get("feature") ?? 0 },
            { id: "fix", label: "Fixes", count: counts.get("fix") ?? 0 },
            { id: "security", label: "Security", count: counts.get("security") ?? 0 },
            { id: "performance", label: "Performance", count: counts.get("performance") ?? 0 },
          ]}
        />
        <input
          className="input max-w-xs"
          placeholder="Search releases…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {releases.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No releases match"
            description="Try a different tag, or clear the search box."
            action={
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setTag("all");
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <ol className="mt-8 max-w-4xl space-y-6 border-l border-white/10 pl-6">
          {releases.map((release) => (
            <li
              key={release.version}
              id={`v${release.version.replace(/\./g, "")}`}
              className="relative scroll-mt-24"
              data-preta-slot="release"
            >
              <span className="absolute -left-[31px] top-6 h-2.5 w-2.5 rounded-full bg-iris-400 ring-4 ring-slate-925" />
              <div className="card">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-white">{release.version}</span>
                  <Badge tone={TAG_TONE[release.tag]}>{release.tag}</Badge>
                  <span className="text-xs text-slate-500">{release.date}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">{release.title}</h2>
                <ul className="mt-3 space-y-2">
                  {release.notes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Section title="How we version" description="Semantic versioning, with one house rule.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Major", body: "Reserved for a change that breaks an API contract. We have not shipped one since 3.0 and do not intend to this year." },
            { label: "Minor", body: "New capability, backwards compatible. Anything that adds a field, an endpoint or a screen." },
            { label: "Patch", body: "Fixes and performance. The house rule: a security fix ships as a minor even when it is small, so it is never buried in a patch note." },
          ].map((item) => (
            <div key={item.label} className="card">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
