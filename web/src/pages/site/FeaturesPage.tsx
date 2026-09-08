import { Link } from "react-router-dom";

import { FEATURES, PageHeader, Section } from "@/pages/site/content";

export function FeaturesPage() {
    return (
        <>
            <PageHeader
                eyebrow="Features"
                title="Everything the queue needs, and little else"
                lede="Each feature gets its own row here, with an image and its own button — so an element can anchor to one without the others moving underneath it."
            />

            <Section>
                <div className="space-y-12">
                    {FEATURES.map((f, i) => (
                        <article
                            key={f.title}
                            className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>figure]:order-2" : ""}`}
                        >
                            <figure className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                                <img src={f.img} alt={f.alt} className="block w-full" width={640} height={360} />
                            </figure>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{f.title}</h2>
                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
                                <button type="button" className="btn-ghost mt-5">
                                    {f.cta}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Want to see it against your own backlog?
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                        Import a CSV of last month's tickets and DeskDesk will show you what the queue would
                        have looked like.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link to="/signup" className="btn-primary px-5">
                            Import a backlog
                        </Link>
                        <Link to="/compare" className="btn-ghost px-5">
                            Compare with today
                        </Link>
                    </div>
                </div>
            </Section>
        </>
    );
}
