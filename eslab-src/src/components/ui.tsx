import React from "react";
import { Lock } from "lucide-react";
import { useStore } from "../store";
import { cn } from "../utils/cn";

// ---------- Slider ----------
interface SliderProps {
  id: string; // unique param id used for teacher locks & highlight
  label: string;
  value: number;
  min: number; max: number; step?: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  color?: string;
}
export function Slider({ id, label, value, min, max, step = 0.01, unit = "", onChange, format }: SliderProps) {
  const { isLocked, touch, expId } = useStore();
  const key = `${expId}.${id}`;
  const locked = isLocked(key);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
          {locked && <Lock size={12} className="text-amber-500" />}
          {label}
        </span>
        <span className="num rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-slate-800 dark:text-cyan-300">
          {format ? format(value) : `${+value.toFixed(4)} ${unit}`}
        </span>
      </div>
      <input
        type="range" dir="ltr"
        min={min} max={max} step={step} value={value}
        disabled={locked}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={e => { onChange(parseFloat(e.target.value)); touch(id); }}
      />
    </div>
  );
}

// ---------- Toggle ----------
export function Toggle({ label, checked, onChange, id }: { label: string; checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  const { touch } = useStore();
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <button
        type="button" role="switch" aria-checked={checked}
        onClick={() => { onChange(!checked); if (id) touch(id); }}
        className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[calc(100%-1.375rem)]" : "left-0.5")} />
      </button>
    </label>
  );
}

// ---------- Segmented ----------
export function Segmented<T extends string>({ options, value, onChange, id }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; id?: string }) {
  const { touch } = useStore();
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => { onChange(o.value); if (id) touch(id); }}
          className={cn(
            "flex-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all",
            value === o.value ? "bg-white text-cyan-700 shadow dark:bg-slate-700 dark:text-cyan-300" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
          )}
        >{o.label}</button>
      ))}
    </div>
  );
}

// ---------- Readout ----------
export function Readout({ label, value, unit, accent, sub }: { label: string; value: string | number; unit?: string; accent?: string; sub?: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cn("num text-base font-bold", accent ?? "text-slate-800 dark:text-white")}>
        {value} <span className="text-xs font-normal text-slate-500">{unit}</span>
      </div>
      {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

// ---------- Panel ----------
export function Panel({ title, children, className, icon }: { title?: string; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn("glass rounded-2xl p-4", className)}>
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          {icon}{title}
        </h3>
      )}
      {children}
    </div>
  );
}

// ---------- Highlightable term ----------
export function Term({ k, children }: { k: string | string[]; children: React.ReactNode }) {
  const { lastChanged } = useStore();
  const keys = Array.isArray(k) ? k : [k];
  const on = keys.includes(lastChanged);
  return <span className={cn("highlight-term", on && "on")}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", className, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "success"; className?: string; disabled?: boolean }) {
  const v = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/30 shadow-lg",
    ghost: "bg-slate-200/70 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-500",
  }[variant];
  return (
    <button disabled={disabled} onClick={onClick} className={cn("rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-40", v, className)}>
      {children}
    </button>
  );
}

// ---------- Formula box ----------
export function Formula({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-50/60 px-3 py-2 dark:bg-cyan-950/30">
      {label && <div className="mb-1 text-[11px] text-cyan-700 dark:text-cyan-300">{label}</div>}
      <div className="num text-center text-base font-bold text-slate-800 dark:text-cyan-100" dir="ltr">{children}</div>
    </div>
  );
}
