import { ReactNode, useState } from "react";
import { cn } from "../utils/cn";

const COLOR_TEXT: Record<string, string> = {
  sky: "text-sky-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
  violet: "text-violet-300",
  cyan: "text-cyan-300",
  fuchsia: "text-fuchsia-300",
  indigo: "text-indigo-300",
};
const COLOR_BG10: Record<string, string> = {
  sky: "bg-sky-500/10",
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  rose: "bg-rose-500/10",
  violet: "bg-violet-500/10",
  cyan: "bg-cyan-500/10",
  fuchsia: "bg-fuchsia-500/10",
  indigo: "bg-indigo-500/10",
};
const COLOR_RING: Record<string, string> = {
  sky: "ring-sky-500/30",
  emerald: "ring-emerald-500/30",
  amber: "ring-amber-500/30",
  rose: "ring-rose-500/30",
  violet: "ring-violet-500/30",
  cyan: "ring-cyan-500/30",
  fuchsia: "ring-fuchsia-500/30",
  indigo: "ring-indigo-500/30",
};
const COLOR_BORDER30: Record<string, string> = {
  sky: "border-sky-500/30",
  emerald: "border-emerald-500/30",
  amber: "border-amber-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  cyan: "border-cyan-500/30",
  fuchsia: "border-fuchsia-500/30",
};
const COLOR_BG950: Record<string, string> = {
  sky: "bg-sky-950/20",
  emerald: "bg-emerald-950/20",
  amber: "bg-amber-950/20",
  rose: "bg-rose-950/20",
  violet: "bg-violet-950/20",
  cyan: "bg-cyan-950/20",
  fuchsia: "bg-fuchsia-950/20",
};

export function Card({
  children,
  className,
  title,
  icon,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 shadow-lg shadow-black/20 backdrop-blur",
        className,
      )}
    >
      {title && (
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-sky-300">
          {icon}
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  color = "sky",
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
  color?: string;
  format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        <span className={cn("tabular rounded-md px-1.5 py-0.5 font-bold", COLOR_BG10[color], COLOR_TEXT[color])}>
          {format ? format(value) : value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to left, #0ea5e9 ${pct}%, #1e293b ${pct}%)`,
        }}
      />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-sky-500" : "bg-slate-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
            checked ? "right-0.5" : "right-4",
          )}
        />
      </span>
    </button>
  );
}

export function Pill({ children, color = "sky" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        COLOR_BG10[color],
        COLOR_TEXT[color],
        COLOR_RING[color],
      )}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value, unit, color = "emerald" }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className={cn("tabular text-sm font-extrabold", COLOR_TEXT[color])}>
        {value} <span className="text-[10px] font-medium text-slate-400">{unit}</span>
      </span>
    </div>
  );
}

export function EquationBox({ children }: { children: ReactNode }) {
  return (
    <div className="tabular rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-3 text-center text-lg font-bold text-indigo-200">
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  active,
  variant = "default",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: "default" | "primary" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const base = "rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    default: active
      ? "bg-sky-500 text-white shadow shadow-sky-500/30"
      : "bg-slate-800 text-slate-200 hover:bg-slate-700",
    primary: "bg-gradient-to-l from-sky-500 to-indigo-500 text-white shadow shadow-sky-500/30 hover:brightness-110",
    danger: "bg-rose-500/90 text-white hover:bg-rose-500",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800",
  };
  return (
    <button disabled={disabled} onClick={onClick} className={cn(base, variants[variant], className)}>
      {children}
    </button>
  );
}

export function Collapse({ title, children, defaultOpen = false, color = "amber" }: { title: string; children: ReactNode; defaultOpen?: boolean; color?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-xl border", COLOR_BORDER30[color], COLOR_BG950[color])}>
      <button
        onClick={() => setOpen(!open)}
        className={cn("flex w-full items-center justify-between px-4 py-3 text-sm font-bold", COLOR_TEXT[color])}
      >
        <span>{title}</span>
        <span className={cn("transition-transform", open && "rotate-180")}>▾</span>
      </button>
      {open && <div className="space-y-2 px-4 pb-4 text-sm leading-7 text-slate-300">{children}</div>}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold text-white">{children}</h2>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
    </div>
  );
}
