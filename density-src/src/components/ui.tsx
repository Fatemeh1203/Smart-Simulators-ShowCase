import React from "react";
import { useLab } from "../store";
import { fmt } from "../data";

export function Card({ title, emoji, children, className = "", action }: { title?: string; emoji?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`bg-white/90 backdrop-blur rounded-3xl shadow-md border border-sky-100 p-4 ${className}`}>
      {title && (
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-sky-900 flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Btn({ children, onClick, color = "sky", className = "", disabled, size = "md", type = "button" }: {
  children: React.ReactNode; onClick?: () => void; color?: "sky" | "green" | "amber" | "rose" | "slate" | "violet"; className?: string; disabled?: boolean; size?: "sm" | "md" | "lg"; type?: "button" | "submit";
}) {
  const colors: Record<string, string> = {
    sky: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200",
    green: "bg-green-500 hover:bg-green-600 text-white shadow-green-200",
    amber: "bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-amber-200",
    rose: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200",
    slate: "bg-slate-200 hover:bg-slate-300 text-slate-800 shadow-slate-100",
    violet: "bg-violet-500 hover:bg-violet-600 text-white shadow-violet-200",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-base", lg: "px-6 py-3.5 text-lg" };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl font-bold shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({ open, children, onClose }: { open: boolean; children: React.ReactNode; onClose?: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full pop-in" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return <span className="text-amber-500">{"⭐".repeat(Math.max(0, Math.min(n, 5)))}</span>;
}

export function ToastLayer() {
  const { toasts } = useLab();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none w-[95vw] max-w-lg">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pop-in px-5 py-3 rounded-2xl shadow-xl font-bold text-base border-2 flex items-center gap-2 ${
            t.kind === "bad" ? "bg-rose-50 border-rose-300 text-rose-800" : t.kind === "info" ? "bg-sky-50 border-sky-300 text-sky-900" : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          {t.stars ? <span className="text-xl">{"⭐".repeat(t.stars)}</span> : null}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value, unit, emoji }: { label: string; value: number | string; unit?: string; emoji?: string }) {
  return (
    <div className="bg-sky-50 rounded-xl px-2 py-1.5 text-center">
      <div className="text-[11px] text-sky-700">{emoji} {label}</div>
      <div className="font-black text-sky-900 text-sm">
        {typeof value === "number" ? fmt(value, 2) : value} <span className="text-[10px] font-normal">{unit}</span>
      </div>
    </div>
  );
}

export function Progress({ value, max, color = "bg-sky-500" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}
