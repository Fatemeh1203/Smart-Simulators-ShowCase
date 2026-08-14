import type { ReactNode } from "react";

// -----------------------------------------------------------
//  Card / section wrapper
// -----------------------------------------------------------
export function Card({
  title,
  subtitle,
  badge,
  children,
  className = "",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-2xl p-4 sm:p-5 fade-up ${className}`}
    >
      {(title || badge) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-100">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

// -----------------------------------------------------------
//  Slider control
// -----------------------------------------------------------
export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = "",
  onChange,
  accent = "#22d3ee",
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="tnum text-xs font-bold text-slate-100">
          {Number.isInteger(step)
            ? value.toFixed(0)
            : value >= 100
              ? value.toFixed(1)
              : value.toFixed(2)}
          <span className="mr-1 text-slate-400">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ accentColor: accent }}
        className="w-full"
      />
    </label>
  );
}

// -----------------------------------------------------------
//  Select dropdown
// -----------------------------------------------------------
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-slate-600/60 bg-slate-900/80 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label as unknown as string}
          </option>
        ))}
      </select>
    </label>
  );
}

// -----------------------------------------------------------
//  Field on/off pill toggle
// -----------------------------------------------------------
export function FieldToggle({
  on,
  onChange,
  labelOn = "با میدان مغناطیسی",
  labelOff = "بدون میدان (I = 0)",
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
        on
          ? "border-rose-400/50 bg-rose-500/15 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.25)]"
          : "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          on ? "bg-rose-400" : "bg-cyan-400"
        }`}
      />
      {on ? labelOn : labelOff}
    </button>
  );
}

// -----------------------------------------------------------
//  Stat chip
// -----------------------------------------------------------
export function Stat({
  label,
  value,
  unit,
  tone = "cyan",
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  tone?: "cyan" | "rose" | "amber" | "emerald" | "violet" | "slate";
}) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-400/30 text-cyan-200",
    rose: "border-rose-400/30 text-rose-200",
    amber: "border-amber-400/30 text-amber-200",
    emerald: "border-emerald-400/30 text-emerald-200",
    violet: "border-violet-400/30 text-violet-200",
    slate: "border-slate-500/30 text-slate-200",
  };
  return (
    <div
      className={`rounded-xl border bg-slate-900/50 px-3 py-2 ${tones[tone]}`}
    >
      <div className="text-[10px] leading-tight text-slate-400">{label}</div>
      <div className="tnum mt-0.5 text-sm font-extrabold">
        {value}
        <span className="mr-1 text-xs font-normal opacity-80">{unit}</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
//  Analysis panel
// -----------------------------------------------------------
export function Analysis({
  children,
  tone = "slate",
  title = "تحلیل فیزیکی",
}: {
  children: ReactNode;
  tone?: "slate" | "cyan" | "rose" | "amber" | "emerald" | "violet";
  title?: ReactNode;
}) {
  const tones: Record<string, string> = {
    slate: "border-slate-600/40",
    cyan: "border-cyan-500/40",
    rose: "border-rose-500/40",
    amber: "border-amber-500/40",
    emerald: "border-emerald-500/40",
    violet: "border-violet-500/40",
  };
  return (
    <div
      className={`rounded-xl border ${tones[tone]} bg-slate-950/50 p-3.5 text-[13px] leading-7 text-slate-300`}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-200">
        <span className="text-amber-400">🔬</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// -----------------------------------------------------------
//  Controls sidebar container
// -----------------------------------------------------------
export function ControlPanel({
  children,
  title = "پارامترهای قابل تنظیم",
}: {
  children: ReactNode;
  title?: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-100">
        <span className="text-cyan-400">⚙️</span>
        {title}
      </div>
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

// -----------------------------------------------------------
//  Reference citation footer
// -----------------------------------------------------------
export function Refs({ items }: { items: ReactNode[] }) {
  return (
    <details className="group rounded-xl border border-slate-700/40 bg-slate-950/40 p-3 text-[11px] leading-6 text-slate-400">
      <summary className="cursor-pointer font-semibold text-slate-300">
        📚 منابع علمی ({items.length})
      </summary>
      <ul className="mt-2 list-disc space-y-1 pr-5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </details>
  );
}
