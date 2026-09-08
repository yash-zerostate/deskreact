import { Link } from "react-router-dom";

import { FEATURES, Section } from "@/pages/site/content";

export function HomePage() {
    return (
        <>
            {/* HERO — buttons deliberately sit in a row: an inserted clone renumbers its siblings,
          which is the case that has broken positional selectors before. */}
            <section className="border-b border-slate-200 dark:border-white/5">
                <div className="container-page py-20 text-center">
                    <div className="mb-6 flex items-center justify-center gap-2">
                        <span className="chip">Now in beta</span>
                    </div>

                    <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                        The shared inbox your support team will actually keep open
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-400">
                        DeskDesk keeps every customer conversation in one queue — assigned, answered and
                        closed — without the dashboards nobody asked for.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link to="/signup" className="btn-primary px-5">
                            Start free trial
                        </Link>
                        <Link to="/features" className="btn-ghost px-5">
                            Book a walkthrough
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>No credit card</span>
                        <span>14-day trial</span>
                        <span>Cancel anytime</span>
                    </div>

                    <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                        <img
                            src="https://picsum.photos/seed/deskdesk-hero/1200/560"
                            alt="DeskDesk shared inbox"
                            className="block w-full"
                            width={1200}
                            height={560}
                        />
                    </div>
                </div>
            </section>

            {/* A teaser only — the full list lives on /features, so the two pages are not duplicates
          of each other and an element scoped to one does not silently match the other. */}
            <Section>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Built for the queue, not the report
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                    Three things a support team does all day, and nothing that gets in the way of them.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {FEATURES.map((f) => (
                        <article key={f.title} className="card">
                            <img
                                src={f.img}
                                alt={f.alt}
                                className="mb-4 block w-full rounded-xl"
                                width={640}
                                height={360}
                            />
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {f.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link to="/features" className="btn-ghost px-5">
                        Explore every feature
                    </Link>
                </div>
            </Section>

            <section className="border-t border-slate-200 dark:border-white/5">
                <div className="container-page py-20 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Try it on your own mailbox
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                        Sign in to see these pages as an identified visitor, or keep browsing anonymously —
                        both routes end up here.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <Link to="/signup" className="btn-primary px-5">
                            Create a workspace
                        </Link>
                        <Link to="/login" className="btn-ghost px-5">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
