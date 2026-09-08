/**
 * The one long page that does not require a session.
 *
 * It carries its own header and footer rather than reusing AppLayout, because
 * AppLayout sits behind ProtectedRoute and assumes a signed-in user.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Accordion, Badge } from "@/components/ui";
import { PLANS, TESTIMONIALS } from "@/lib/content";

const FEATURES = [
  {
    title: "One queue, three statuses",
    body: "Open, pending, resolved. Teams ask for a fourth roughly once a quarter and discover it was a workflow problem wearing a status costume.",
  },
  {
    title: "Priority rules that hold",
    body: "Four levels, one sentence each, tested in five seconds without asking anyone. Every scale drifts upward unless each level costs something.",
  },
  {
    title: "Business-hours SLA clocks",
    body: "A four-hour target on Friday evening means Monday morning. Pending pauses the response clock and starts the resolution clock.",
  },
  {
    title: "Roles gate verbs, not rows",
    body: "Everyone in a workspace sees the same queue; only security and compliance may delete from it. Splitting visibility by role produces a team that cannot answer its own tickets.",
  },
  {
    title: "Tenancy from the token",
    body: "The workspace comes from your access token and cannot be widened by the client. There is no cross-tenant view, because that is a cross-tenant leak waiting for its first bug.",
  },
  {
    title: "Rotating refresh tokens",
    body: "Fifteen-minute access tokens, refresh tokens that rotate on every use, and reuse detection that kills the whole family. Noisy on purpose.",
  },
];

const STEPS = [
  { n: "01", title: "Import ninety days", body: "Not the archive. Ninety days covers almost every ticket a customer will follow up on and keeps the first import small enough to check by eye." },
  { n: "02", title: "Define your statuses", body: "Write the sentence that distinguishes each one. If it needs the word 'sometimes', use a priority or a tag instead." },
  { n: "03", title: "Wire the channels", body: "Verify every forwarding address with a real message from outside your domain, not with the test button." },
  { n: "04", title: "Double-run for two days", body: "Log every case where an agent had to switch back. That list is your real gap analysis, and it is usually short." },
];

const LOGOS = ["Lumen Freight", "Kettle & Co", "Ridgeline Health", "Northwind", "Auburn Labs", "Pier 9"];

export function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
      setShowSticky(window.scrollY > 700);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-40 border-b transition ${
          scrolled ? "border-white/5 bg-slate-925/85 backdrop-blur" : "border-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-iris-500 text-[13px] font-bold">
              D
            </span>
            DeskDesk
          </span>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/" className="btn-primary">
                Open the app
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section data-preta-slot="hero" className="container-page py-20 text-center sm:py-28">
          <Badge tone="brand">Now with saved views · 3.9.0</Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            A support desk that stays honest about its own queue
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Three statuses, four priorities with a rule each, and SLA clocks that follow your
            calendar instead of the wall clock. No fourth status, no per-ticket pricing, and no
            cross-tenant view.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-primary">
              Create a workspace
            </Link>
            <Link to="/knowledge/first-week-with-deskdesk" className="btn-ghost">
              Read the migration guide
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Free for three seats. No card, no sales call, no trial countdown.
          </p>
        </section>

        {/* Logo wall */}
        <section className="border-y border-white/5 py-8">
          <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {LOGOS.map((logo) => (
              <span key={logo} className="text-sm font-medium tracking-wide text-slate-600">
                {logo}
              </span>
            ))}
          </div>
        </section>

        {/* Numbers */}
        <section className="container-page py-16">
          <dl className="grid gap-6 sm:grid-cols-4">
            {[
              ["2.1M", "tickets answered last quarter"],
              ["31m", "median first response"],
              ["94.2%", "SLA attainment across all workspaces"],
              ["99.94%", "uptime over 90 days"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <dt className="text-3xl font-semibold text-white">{value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section id="features" className="container-page scroll-mt-20 py-16">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Opinions, held on purpose
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400">
            Every one of these is a decision we get asked to reverse. Here is why we do not.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card" data-preta-slot="feature-card">
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-white/5 bg-white/[0.02] py-16">
          <div className="container-page scroll-mt-20">
            <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
              Four days from import to cutover
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.n}>
                  <span className="font-mono text-sm text-iris-400">{step.n}</span>
                  <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container-page py-16">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            From teams that moved
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure key={item.name} className="card flex h-full flex-col justify-between">
                <blockquote className="text-sm leading-relaxed text-slate-300">“{item.quote}”</blockquote>
                <figcaption className="mt-5 text-xs text-slate-500">
                  <span className="block text-sm text-white">{item.name}</span>
                  {item.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="container-page scroll-mt-20 py-16">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Three plans, priced per replying seat
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            Read-only accounts are free and always will be — charging for observers is how you end up
            with shared logins.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`card ${plan.featured ? "border-iris-500/50 bg-iris-500/[0.07]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                  {plan.featured && <Badge tone="brand">Popular</Badge>}
                </div>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {plan.monthly === 0 ? "Free" : `£${plan.annual}`}
                  {plan.monthly > 0 && (
                    <span className="ml-1 text-xs font-normal text-slate-500">/seat/mo</span>
                  )}
                </p>
                <ul className="mt-5 space-y-2">
                  {plan.highlights.slice(0, 4).map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-iris-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-6 w-full ${plan.featured ? "btn-primary" : "btn-ghost"}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container-page scroll-mt-20 pb-20">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Before you sign up
          </h2>
          <div className="mx-auto mt-10 max-w-3xl">
            <Accordion
              items={[
                { q: "Is there a trial?", a: "There is no trial, because there is a free plan. Three seats, one inbound address, thirty days of history — for as long as you want it." },
                { q: "Can I import from my current help desk?", a: "Yes, by CSV or the migration API. Do ninety days into a staging workspace first; that run is where you find the custom fields that moved wrong." },
                { q: "Do you charge per ticket?", a: "No. You pay for accounts that replied to at least one ticket in the billing period." },
                { q: "Where is my data stored?", a: "EU by default. Pro can choose EU or US; Enterprise picks from six regions and can set a residency requirement per workspace." },
                { q: "What happens if I stop paying?", a: "The workspace drops to the free plan and stays readable. We do not delete tickets for non-payment — exporting your own data is never held hostage." },
              ]}
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="container-page pb-24">
          <div
            data-preta-slot="cta"
            className="rounded-3xl border border-iris-500/30 bg-gradient-to-br from-iris-500/20 to-transparent px-8 py-14 text-center"
          >
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Put ninety days in and see how it feels
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">
              A staging workspace costs nothing and answers more than a sales call will.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary">
                Create a workspace
              </Link>
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {showSticky && (
        <div
          data-preta-slot="sticky-bar"
          className="sticky bottom-0 z-30 border-t border-white/10 bg-slate-925/90 backdrop-blur"
        >
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
            <p className="text-sm text-slate-300">
              Free for three seats — no card, no trial countdown.
            </p>
            <Link to="/signup" className="btn-primary">
              Start free
            </Link>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 py-10">
        <div className="container-page grid gap-8 text-sm sm:grid-cols-4">
          <div>
            <p className="font-semibold text-white">DeskDesk</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              A demo SPA on :4003 talking to its own Express API on :5003.
            </p>
          </div>
          {[
            { heading: "Product", links: [["Pricing", "/pricing"], ["Changelog", "/changelog"], ["Status", "/status"]] },
            { heading: "Resources", links: [["Knowledge base", "/knowledge"], ["Reports", "/reports"], ["Team", "/team"]] },
            { heading: "Account", links: [["Sign in", "/login"], ["Create workspace", "/signup"], ["Profile", "/profile"]] },
          ].map((column) => (
            <div key={column.heading}>
              <p className="text-xs uppercase tracking-wider text-slate-500">{column.heading}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-slate-400 hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
