import { Link } from "react-router-dom";

import { FAQS, PageHeader, Section } from "@/pages/site/content";

export function FaqPage() {
    return (
        <>
            <PageHeader
                eyebrow="FAQ"
                title="Questions we get asked"
                lede="Collapsible rows, so an element anchored inside one has to survive the row opening and closing."
            />

            <Section>
                <div className="space-y-4">
                    {FAQS.map((f) => (
                        <details key={f.q} className="card">
                            <summary className="cursor-pointer text-sm font-medium text-slate-900 dark:text-white">
                                {f.q}
                            </summary>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Still unsure about something?</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Link to="/signup" className="btn-primary px-5">
                            Ask us in the app
                        </Link>
                        <Link to="/" className="btn-ghost px-5">
                            Back to the overview
                        </Link>
                    </div>
                </div>
            </Section>
        </>
    );
}
