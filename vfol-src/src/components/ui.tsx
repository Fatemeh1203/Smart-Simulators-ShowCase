import React from "react";
import { cn } from "../utils/cn";

export function Panel({ title, icon, children, className, right }: { title?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode; className?: string; right?: React.ReactNode }) {
  return (
    <section className={cn("panel p-4 fade-up", className)}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm tracking-tight">{icon && <span className="text-brand-500">{icon}</span>}{title}</h3>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Slider({ label, value, min, max, step = 1, unit, onChange, fmt, hint }: { label: React.ReactNode; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; fmt?: (v: number) => string; hint?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block group">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="num text-brand-600 dark:text-brand-300 font-semibold">{fmt ? fmt(value) : value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} style={{ ["--pct" as string]: `${pct}%` }} onChange={(e) => onChange(parseFloat(e.target.value))} />
      {hint && <div className="text-[10px] muted mt-1">{hint}</div>}
    </label>
  );
}

export function Stat({ label, value, unit, tone = "default", sub }: { label: React.ReactNode; value: React.ReactNode; unit?: string; tone?: "default" | "good" | "warn" | "bad" | "brand"; sub?: React.ReactNode }) {
  const tones = { default: "", good: "text-emerald-500", warn: "text-amber-500", bad: "text-rose-500", brand: "text-brand-500" };
  return (
    <div className="panel-2 p-3">
      <div className="text-[11px] muted mb-1">{label}</div>
      <div className={cn("num text-lg font-bold leading-tight", tones[tone])}>{value}<span className="text-xs font-normal muted ms-1">{unit}</span></div>
      {sub && <div className="text-[10px] muted mt-1">{sub}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-xs w-full text-start py-1">
      <span className={cn("w-9 h-5 rounded-full relative transition-colors shrink-0", checked ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700")}>
        <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", checked ? "start-[18px]" : "start-0.5")} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label?: React.ReactNode; value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <label className="block text-xs">
      {label && <div className="font-medium mb-1.5">{label}</div>}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full panel-2 px-2.5 py-2 text-xs outline-none focus:ring-2 ring-brand-400">
        {options.map((o) => <option key={o.value} value={o.value}>{typeof o.label === "string" ? o.label : String(o.value)}</option>)}
      </select>
    </label>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, size = "sm" }: { value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; size?: "sm" | "xs" }) {
  return (
    <div className="inline-flex panel-2 p-0.5 gap-0.5 flex-wrap">
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)} className={cn("rounded-lg transition-all whitespace-nowrap", size === "sm" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[11px]", value === o.value ? "bg-brand-500 text-white shadow" : "hover:bg-black/5 dark:hover:bg-white/5")}>{o.label}</button>
      ))}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", className, disabled, size = "md" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "outline"; className?: string; disabled?: boolean; size?: "sm" | "md" }) {
  const v = {
    primary: "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow hover:brightness-110",
    ghost: "hover:bg-black/5 dark:hover:bg-white/10",
    danger: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
    outline: "border border-line hover:bg-black/5 dark:hover:bg-white/5",
  }[variant];
  return <button disabled={disabled} onClick={onClick} className={cn("rounded-xl font-medium transition-all inline-flex items-center gap-1.5 disabled:opacity-50", size === "md" ? "px-3.5 py-2 text-xs" : "px-2.5 py-1.5 text-[11px]", v, className)}>{children}</button>;
}

export function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "good" | "warn" | "bad" | "muted" | "violet" }) {
  const t = { brand: "bg-brand-500/10 text-brand-600 dark:text-brand-300", good: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", warn: "bg-amber-500/10 text-amber-600 dark:text-amber-300", bad: "bg-rose-500/10 text-rose-600 dark:text-rose-300", muted: "bg-slate-500/10 muted", violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300" }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold", t)}>{children}</span>;
}

export function Eq({ children, label }: { children: React.ReactNode; label?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="eq">{children}</div>
      {label && <div className="text-[11px] muted mt-1">{label}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: React.ReactNode; icon?: React.ReactNode }[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-thin border-b border-line pb-px">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cn("px-3 py-2 text-xs whitespace-nowrap rounded-t-lg border-b-2 transition-colors flex items-center gap-1.5", value === t.id ? "border-brand-500 text-brand-600 dark:text-brand-300 font-semibold" : "border-transparent muted hover:text-current")}>{t.icon}{t.label}</button>
      ))}
    </div>
  );
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn" | "bad" | "good"; title?: React.ReactNode; children: React.ReactNode }) {
  const t = { info: "border-brand-400/40 bg-brand-500/5", warn: "border-amber-400/40 bg-amber-500/5", bad: "border-rose-400/40 bg-rose-500/5", good: "border-emerald-400/40 bg-emerald-500/5" }[tone];
  return (
    <div className={cn("rounded-xl border p-3 text-xs leading-relaxed", t)}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      {children}
    </div>
  );
}

export const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : "—");
export const sci = (v: number) => (Number.isFinite(v) ? (v === 0 ? "0" : v.toExponential(2)) : "—");
