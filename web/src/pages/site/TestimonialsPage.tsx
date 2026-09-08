import { Link } from "react-router-dom";

import { PageHeader, Section } from "@/pages/site/content";

const QUOTES = [
    {
        quote:
            "We moved off a ticketing suite nobody enjoyed opening. Our first-reply time halved in a fortnight, and I stopped chasing people for status.",
        name: "Priya Raman",
        role: "Head of Support, Northwind",
        img: "https://picsum.photos/seed/deskdesk-avatar-1/80/80",
    },
    {
        quote:
            "The escalation rules are the whole product for us. Enterprise accounts reach a senior agent without anyone remembering to look.",
        name: "Tom Alvarez",
        role: "Ops Lead, Bright Harbour",
        img: "https://picsum.photos/seed/deskdesk-avatar-2/80/80",
    },
    {
        quote:
            "Three of us cover the inbox across two timezones. The handover used to be a spreadsheet; now it is just the queue.",
        name: "Mei Sato",
        role: "Customer Lead, Fernhill",
        img: "https://picsum.photos/seed/deskdesk-avatar-3/80/80",
    },
    {
        quote:
            "Saved replies sound like a small thing until you count how many times a week you answer the same billing question.",
        name: "Daniel Okoro",
        role: "Support Engineer, Castlepoint",
        img: "https://picsum.photos/seed/deskdesk-avatar-4/80/80",
    },
];

export function TestimonialsPage() {
    return (
        <>
            <PageHeader
                eyebrow="Testimonials"
                title="Teams who stopped losing tickets"
                lede="Four cards of the same shape with different names — a badge or a clone anchored to one of them must not drift to another."
            />

            <Section>
                <div className="grid gap-6 md:grid-cols-2">
                    {QUOTES.map((q) => (
                        <figure key={q.name} className="card">
                            <blockquote className="text-sm text-slate-700 dark:text-slate-300">
                                “{q.quote}”
                            </blockquote>
                            <figcaption className="mt-4 flex items-center gap-3">
                                <img
                                    src={q.img}
                                    alt={q.name}
                                    className="h-10 w-10 rounded-full"
                                    width={80}
                                    height={80}
                                />
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {q.name} · {q.role}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link to="/signup" className="btn-primary px-5">
                        Join these teams
                    </Link>
                </div>
            </Section>
        </>
    );
}
