import { Link } from "react-router-dom";

import { PageHeader, Section, TIERS } from "@/pages/site/content";

export function PricingPage() {
    return (
        <>
            <PageHeader
                eyebrow="Pricing"
                title="Pricing that fits the team size"
                lede="Three tiers of the same shape — the hardest thing to target by position, and the easiest by the words on the button."
            />

            <Section>
                <div className="grid gap-6 md:grid-cols-3">
                    {TIERS.map((t) => (
                        <article
                            key={t.name}
                            className={`card flex flex-col ${t.featured ? "border-iris-500/60" : ""}`}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t.name}</h2>
                                {t.featured && <span className="chip">Most picked</span>}
                            </div>
                            <p className="mt-4">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{t.price}</span>{" "}
                                <span className="text-xs text-slate-500 dark:text-slate-400">{t.note}</span>
                            </p>
                            <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                {t.points.map((p) => (
                                    <li key={p}>{p}</li>
                                ))}
                            </ul>
                            <Link
                                to="/signup"
                                className={`${t.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full`}
                            >
                                {t.cta}
                            </Link>
                        </article>
                    ))}
                </div>

                <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Every plan includes
                    </h2>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-3">
                        <span>Unlimited conversations</span>
                        <span>Email and web widget</span>
                        <span>Data export at any time</span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/faq" className="btn-ghost">
                            Check the billing FAQ
                        </Link>
                        <Link to="/compare" className="btn-ghost">
                            Compare the workflow
                        </Link>
                    </div>
                </div>
            </Section>
        </>
    );
}
