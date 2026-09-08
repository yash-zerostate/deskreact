import type { ReactNode } from "react";

/**
 * Copy and shared page furniture for the marketing site.
 *
 * The site is split into real routes rather than one scrolling page, so Preta elements can be
 * scoped to a pathname the way they are on a real customer site — and so a route change is
 * exercised at all, which an anchor link never does.
 *
 * Anchor text is unique across the WHOLE site, not just per page. Preta's arbitration and its
 * injectors both fall back to anchor text when a positional selector breaks, so two buttons
 * reading the same words anywhere would be treated as one slot and one of them suppressed.
 */

export function PageHeader({
    eyebrow,
    title,
    lede,
}: {
    eyebrow: string;
    title: string;
    lede: string;
}) {
    return (
        <div className="border-b border-slate-200 dark:border-white/5">
            <div className="container-page py-14">
                <span className="chip">{eyebrow}</span>
                <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
                    {title}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400">{lede}</p>
            </div>
        </div>
    );
}

export function Section({ children }: { children: ReactNode }) {
    return <div className="container-page py-16">{children}</div>;
}

export const FEATURES = [
    {
        title: "Shared inbox",
        body: "Every conversation in one queue, with assignment and status the whole team can see.",
        img: "https://picsum.photos/seed/deskdesk-inbox/640/360",
        alt: "Shared inbox screenshot",
        cta: "Tour the inbox",
    },
    {
        title: "Saved replies",
        body: "Answer the same question once. Reuse it with a keystroke and keep the wording consistent.",
        img: "https://picsum.photos/seed/deskdesk-replies/640/360",
        alt: "Saved replies screenshot",
        cta: "See saved replies",
    },
    {
        title: "Escalation rules",
        body: "Route by plan, risk score or keyword, so the tickets that matter reach a human faster.",
        img: "https://picsum.photos/seed/deskdesk-rules/640/360",
        alt: "Escalation rules screenshot",
        cta: "Read about routing",
    },
];

export const TIERS = [
    {
        name: "Starter",
        price: "$0",
        note: "for one inbox",
        cta: "Start on Starter",
        points: ["1 shared inbox", "3 teammates", "Community support"],
        featured: false,
    },
    {
        name: "Team",
        price: "$29",
        note: "per seat / month",
        cta: "Choose Team plan",
        points: ["Unlimited inboxes", "Saved replies", "Escalation rules", "Priority support"],
        featured: true,
    },
    {
        name: "Business",
        price: "$79",
        note: "per seat / month",
        cta: "Talk to sales",
        points: ["Everything in Team", "Audit log", "SSO / SAML", "Dedicated manager"],
        featured: false,
    },
];

export const FAQS = [
    {
        q: "Do I need an account to look around?",
        a: "No. Every page here renders the same signed in or not — signing in only changes who Preta thinks you are.",
    },
    {
        q: "How long does setup take?",
        a: "Point a mailbox at DeskDesk and invite your team. Most workspaces are answering from the shared inbox the same afternoon.",
    },
    {
        q: "Can I move my old tickets across?",
        a: "Yes. Import from CSV or from the API, and the original timestamps and authors come with them.",
    },
    {
        q: "What happens when the trial ends?",
        a: "The workspace drops to Starter. Nothing is deleted, and the inbox keeps working for one mailbox.",
    },
];
