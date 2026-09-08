import { Link } from "react-router-dom";

import { PageHeader, Section } from "@/pages/site/content";

/**
 * The swap page. Two panels of identical shape and different content, side by side — which is what
 * a swap needs: something to exchange positions with, where moving only the text would be visibly
 * wrong. The third row is a second pair, so a swap on one cannot be confused with the other.
 */
export function ComparePage() {
    return (
        <>
            <PageHeader
                eyebrow="Compare"
                title="What changes when the mailbox has an owner"
                lede="Two panels of the same shape, side by side. Swapping them should move the whole card, not just the words inside it."
            />

            <Section>
                <div className="grid gap-6 md:grid-cols-2">
                    <article id="panel-before" className="card">
                        <span className="chip">Shared mailbox</span>
                        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Everyone replies at once
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Two people answer the same customer, a third assumes it is handled, and the oldest
                            ticket quietly ages out of view.
                        </p>
                        <button type="button" className="btn-ghost mt-5">
                            Read the before story
                        </button>
                    </article>

                    <article id="panel-after" className="card">
                        <span className="chip">DeskDesk</span>
                        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            One owner, visible to all
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Every conversation has an assignee and a status, so nobody doubles up and nothing
                            sits unanswered because it was somebody else's.
                        </p>
                        <button type="button" className="btn-primary mt-5">
                            Read the after story
                        </button>
                    </article>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <article id="panel-manual" className="card">
                        <span className="chip">Manual triage</span>
                        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Someone reads everything first
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            One person spends the morning sorting the queue before anyone can start answering
                            it, and the sorting is never quite the same twice.
                        </p>
                        <button type="button" className="btn-ghost mt-5">
                            See manual triage
                        </button>
                    </article>

                    <article id="panel-rules" className="card">
                        <span className="chip">Rules</span>
                        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            The queue sorts itself
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Plan, risk score and keyword decide where a ticket lands, and the first agent in
                            sees a queue that is already in the right order.
                        </p>
                        <button type="button" className="btn-primary mt-5">
                            See rule-based triage
                        </button>
                    </article>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/pricing" className="btn-primary px-5">
                        Price it for my team
                    </Link>
                </div>
            </Section>
        </>
    );
}
