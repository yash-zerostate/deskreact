/**
 * Small presentational primitives shared by the content-heavy pages.
 *
 * These exist so the extra pages stay readable *and* so a personalisation
 * loader has plenty of stable, differently-shaped hooks to target: section
 * headers, stat tiles, banners, accordions, tables, modals and sticky bars all
 * render distinct class names and `data-preta-*` attributes.
 */
import { useEffect, useId, useState, type ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      data-preta-slot="page-header"
      className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-6"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-iris-400">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  id,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} data-preta-slot="section" className="mt-12 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
}) {
  const positive = delta?.startsWith("+");
  return (
    <div data-preta-slot="stat-tile" className="card">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={`text-xs font-medium ${positive ? "text-emerald-300" : "text-rose-300"}`}>
            {delta}
          </span>
        )}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}) {
  const tones = {
    info: "border-iris-500/30 bg-iris-500/10 text-iris-100",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  } as const;

  return (
    <div
      data-preta-slot="banner"
      data-preta-tone={tone}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${tones[tone]}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm opacity-90">{children}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/5 text-slate-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    brand: "border-iris-500/40 bg-iris-500/15 text-iris-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Accordion({ items }: { items: Array<{ q: string; a: ReactNode }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div data-preta-slot="accordion" className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
      {items.map((item, index) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === index ? null : index)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-100 hover:bg-white/5"
            aria-expanded={open === index}
          >
            {item.q}
            <span className="text-slate-500">{open === index ? "−" : "+"}</span>
          </button>
          {open === index && (
            <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div data-preta-slot="tabs" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3.5 py-1.5 text-sm transition ${
            active === tab.id ? "bg-iris-500 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-slate-100">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-iris-500" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "warning" | "danger" }) {
  const tones = { brand: "bg-iris-500", warning: "bg-amber-400", danger: "bg-rose-500" } as const;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${tones[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-preta-slot="modal"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="card grid place-items-center py-14 text-center">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** A pure-CSS column chart — no chart library, so the bundle stays tiny. */
export function BarChart({
  series,
  max,
  unit = "",
}: {
  series: Array<{ label: string; value: number }>;
  max?: number;
  unit?: string;
}) {
  const ceiling = max ?? Math.max(...series.map((point) => point.value), 1);
  return (
    <div data-preta-slot="bar-chart" className="card">
      <div className="flex h-48 items-end gap-2">
        {series.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {point.value}
              {unit}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-iris-600 to-iris-400"
              style={{ height: `${(point.value / ceiling) * 100}%`, minHeight: 4 }}
              title={`${point.label}: ${point.value}${unit}`}
            />
            <span className="text-[11px] text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
