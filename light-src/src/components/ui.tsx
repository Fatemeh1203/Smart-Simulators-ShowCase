import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fa } from "../lab/format";

export function Bubble({ emoji = "🧑‍🔬", children, color = "bg-white" }: { emoji?: string; children: ReactNode; color?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="float-y text-4xl">{emoji}</div>
      <div className={`${color} relative flex-1 rounded-2xl border-2 border-amber-200 p-3 text-base font-bold leading-7 text-slate-700 shadow-sm`}>
        <span className="absolute -right-2 top-4 h-4 w-4 rotate-45 border-l-2 border-b-2 border-amber-200 bg-inherit" />
        {children}
      </div>
    </div>
  );
}

export function Panel({ title, emoji, children, className = "" }: { title?: string; emoji?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border-4 border-white bg-white/80 p-4 shadow-[0_6px_0_rgba(0,0,0,0.08)] backdrop-blur ${className}`}>
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-700">
          <span className="text-2xl">{emoji}</span> {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function KidButton({
  children, onClick, color = "bg-orange-400 text-white", className = "", disabled,
}: { children: ReactNode; onClick?: () => void; color?: string; className?: string; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`btn-kid ${color} ${disabled ? "opacity-50" : "hover:brightness-105"} ${className}`}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${checked ? "border-green-400 bg-green-100 text-green-800" : "border-slate-300 bg-slate-100 text-slate-500"}`}
    >
      <span className={`inline-block h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-green-500" : "bg-slate-300"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-0" : "translate-x-4"}`} />
      </span>
      {label}
    </button>
  );
}

export function Stars({ n, max = 3, size = "text-2xl" }: { n: number; max?: number; size?: string }) {
  return (
    <span className={`${size} inline-flex gap-0.5`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < n ? "star-pop" : "opacity-30 grayscale"} style={{ animationDelay: `${i * 0.15}s` }}>
          ⭐
        </span>
      ))}
    </span>
  );
}

export function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: ["#f97316", "#facc15", "#22c55e", "#3b82f6", "#ec4899", "#a855f7"][i % 6],
        rot: Math.random() * 360,
      })),
    [],
  );
  if (!show) return null;
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </>
  );
}

export function SuccessBanner({ text, sub, onNext, nextLabel, stars }: { text: string; sub?: string; onNext?: () => void; nextLabel?: string; stars?: number }) {
  return (
    <div className="bounce-in rounded-3xl border-4 border-yellow-300 bg-gradient-to-l from-yellow-100 to-orange-100 p-5 text-center shadow-lg">
      <div className="text-5xl">🎉</div>
      <div className="mt-2 text-2xl font-black text-orange-700">{text}</div>
      {sub && <div className="mt-1 text-base font-bold text-slate-600">{sub}</div>}
      {stars !== undefined && <div className="mt-2"><Stars n={stars} /></div>}
      {onNext && (
        <KidButton onClick={onNext} color="bg-green-500 text-white" className="mt-3">
          {nextLabel ?? "مرحله بعد ⬅"}
        </KidButton>
      )}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-yellow-300 px-3 py-1 text-sm font-black text-yellow-900 shadow">
      🏅 {fa(score)} امتیاز
    </div>
  );
}

export function useDebouncedFlag(value: boolean, ms: number) {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!value) {
      setFlag(false);
      return;
    }
    const t = setTimeout(() => setFlag(true), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return value && flag;
}
