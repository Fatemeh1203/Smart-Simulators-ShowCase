import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const I = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  path: "M4 19h16M6 16l3-8 4 5 3-4 4 7",
  plane: "M3 21 21 3M7 21h14M3 7V3h4",
  slope: "M4 18 20 6M7 18h6M14 12v6",
  chart: "M4 19h16M7 16v-5M12 16V8M17 16v-8",
  flask: "M9 3h6M10 3v6L5 20h14L14 9V3",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z",
  quiz: "M8 7h8M8 12h5M6 4h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z",
  trophy: "M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0zM6 6H4a2 2 0 0 0 2 4M18 6h2a2 2 0 0 1-2 4",
  progress: "M12 20a8 8 0 1 1 8-8M12 12l4-2",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  users: "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4h16v16H6.5A2.5 2.5 0 0 0 4 19.5z",
  live: "M15 10l4.55-2.27A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.89L15 14M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  sun: "M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5 19.1 19.1M4 12H2M22 12h-2M4.9 19.1 3.5 20.5M20.5 3.5 19.1 4.9M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  moon: "M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z",
  spark: "M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z",
  check: "M5 12l5 5L20 7",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  reset: "M3 12a9 9 0 1 0 3-6.7M3 4v6h6",
  zoomIn: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3M11 8v6M8 11h6",
  zoomOut: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3M8 11h6",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  bot: "M12 8V4M8 8h8v10H8zM9 18v2M15 18v2M2 12h4M18 12h4",
  menu: "M4 6h16M4 12h16M4 18h16",
  chevron: "M15 18l-6-6 6-6",
  target: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM12 12h.01",
  clock: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2",
  star: "M12 3l2.6 5.5L21 9.2l-4.5 4.2L17.6 21 12 17.8 6.4 21l1.1-7.6L3 9.2l6.4-.7z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  play: "M8 5v14l11-7z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "soft" | "danger" | "ok";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const map = {
    primary:
      "bg-gradient-to-l from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110",
    ghost: "bg-transparent text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--line)]",
    soft: "bg-[var(--bg-soft)] text-[var(--text)] border border-[var(--line)] hover:border-indigo-400/40",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
    ok: "bg-emerald-500 text-white hover:bg-emerald-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        map[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("glass card-3d rounded-3xl p-4 md:p-5", onClick && "cursor-pointer", className)}>
      {children}
    </div>
  );
}

export function Tag({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "ok" | "warn" | "mute" | "danger" }) {
  const t = {
    accent: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    mute: "bg-slate-500/10 text-[var(--text-mute)]",
    danger: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  }[tone];
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", t)}>{children}</span>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-cyan-400 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 120, label }: { value: number; size?: number; label?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, value) / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-black/10 dark:text-white/10" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#rg)"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="rg" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-extrabold">{Math.round(value)}٪</div>
        {label && <div className="text-[10px] text-[var(--text-mute)]">{label}</div>}
      </div>
    </div>
  );
}

export function Formula({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("formula rounded-xl bg-indigo-500/10 px-2 py-0.5 text-[15px] text-indigo-600 dark:text-indigo-300", className)}>
      {children}
    </span>
  );
}

export function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className="frac mx-1 text-[15px]">
      <span>{n}</span>
      <span>{d}</span>
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--text-mute)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2.5 outline-none"
      />
    </label>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="min-w-0">
      <div className="text-xs text-[var(--text-mute)]">{label}</div>
      <div className="mt-1 truncate text-xl font-extrabold">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-[var(--text-mute)]">{hint}</div>}
    </Card>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="glass max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl p-5 anim-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button className="focus-ring rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/5" onClick={onClose} aria-label="بستن">
            <Icon d={I.close} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Insight({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm leading-7">
      <span className="ml-2 font-bold text-cyan-600 dark:text-cyan-300">نکته کشف</span>
      {text}
    </div>
  );
}
