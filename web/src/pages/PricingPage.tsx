import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Accordion, Badge, Banner, Modal, PageHeader, Section } from "@/components/ui";
import { FEATURE_MATRIX, PLANS, PRICING_FAQ, TESTIMONIALS } from "@/lib/content";

export function PricingPage() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Plans"
        title="Pricing that follows seats, not tickets"
        description="You pay for people who reply. Read-only accounts are free and always will be — charging for observers is how you end up with shared logins."
        actions={
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition ${!annual ? "bg-iris-500 text-white" : "text-slate-400"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition ${annual ? "bg-iris-500 text-white" : "text-slate-400"}`}
            >
              Annual <span className="opacity-70">−17%</span>
            </button>
          </div>
        }
      />

      {user && (
        <div className="mt-6">
          <Banner
            tone="success"
            title={`You are on the ${user.plan} plan`}
            action={
              <Link to="/profile" className="btn-ghost">
                Change plan
              </Link>
            }
          >
            Plan lives on your profile in this demo, so you can flip it and watch the page respond.
          </Banner>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          const current = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              data-preta-slot="plan-card"
              data-preta-plan={plan.id}
              className={`card flex flex-col ${
                plan.featured ? "border-iris-500/50 bg-iris-500/[0.07]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                {plan.featured && <Badge tone="brand">Most popular</Badge>}
                {current && <Badge tone="success">Current</Badge>}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{plan.blurb}</p>

              <p className="mt-6">
                <span className="text-3xl font-semibold text-white">
                  {price === 0 ? "Free" : `£${price}`}
                </span>
                {price > 0 && (
                  <span className="ml-1 text-sm text-slate-500">
                    per seat / month{annual ? ", billed yearly" : ""}
                  </span>
                )}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="text-iris-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-6 w-full ${plan.featured ? "btn-primary" : "btn-ghost"}`}
                onClick={() => (plan.id === "enterprise" ? setContactOpen(true) : undefined)}
              >
                {current ? "Your current plan" : plan.id === "enterprise" ? "Talk to sales" : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <Section
        title="Compare every feature"
        description="Three groups, sixteen rows, no asterisks."
      >
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 font-medium">Starter</th>
                <th className="px-5 py-3 font-medium">Pro</th>
                <th className="px-5 py-3 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {FEATURE_MATRIX.map((group) => (
                <Fragment key={group.group}>
                  <tr className="bg-white/[0.02]">
                    <td
                      colSpan={4}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-slate-300">{row.feature}</td>
                      <td className="px-5 py-3 text-slate-400">{row.free}</td>
                      <td className="px-5 py-3 text-slate-100">{row.pro}</td>
                      <td className="px-5 py-3 text-slate-100">{row.enterprise}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="What teams say" description="Three workspaces that moved in the last year.">
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="card flex h-full flex-col justify-between">
              <blockquote className="text-sm leading-relaxed text-slate-300">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-iris-500/20 text-sm font-semibold text-iris-200">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm text-white">{item.name}</span>
                  <span className="block text-xs text-slate-500">{item.title}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Billing questions" description="The five that arrive most often.">
        <Accordion items={PRICING_FAQ.map((item) => ({ q: item.q, a: item.a }))} />
      </Section>

      <div
        data-preta-slot="cta"
        className="mt-12 rounded-2xl border border-iris-500/30 bg-gradient-to-br from-iris-500/15 to-transparent p-8 text-center"
      >
        <h2 className="text-xl font-semibold text-white">Still deciding?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
          Run a staging workspace with ninety days of imported tickets. It costs nothing and answers
          more than a sales call will.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/knowledge/first-week-with-deskdesk" className="btn-primary">
            Read the migration guide
          </Link>
          <button type="button" className="btn-ghost" onClick={() => setContactOpen(true)}>
            Talk to sales
          </button>
        </div>
      </div>

      <Modal
        open={contactOpen}
        title="Talk to sales"
        onClose={() => {
          setContactOpen(false);
          setSent(false);
        }}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setContactOpen(false)}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={() => setSent(true)}>
              Send request
            </button>
          </>
        }
      >
        {sent ? (
          <p className="text-sm text-emerald-200">
            Request noted. In this demo nothing is sent anywhere — no network call leaves the page.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="sales-email">
                Work email
              </label>
              <input id="sales-email" className="input" defaultValue={user?.email ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="sales-seats">
                Seats needed
              </label>
              <select id="sales-seats" className="input" defaultValue="25–100">
                <option>Under 25</option>
                <option>25–100</option>
                <option>100–500</option>
                <option>500+</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sales-note">
                Anything we should know
              </label>
              <textarea id="sales-note" className="input h-24 resize-none" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
