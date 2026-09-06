import { ReactNode, useEffect, useState } from "react";
import { GuessQuestion } from "../data/missions";

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`pop-in bg-white rounded-3xl shadow-2xl border-4 border-sky-200 w-full ${wide ? "max-w-2xl" : "max-w-md"} p-5 md:p-6 max-h-[92vh] overflow-y-auto scrollbar-thin`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function GuessModal({ guess, title, intro, onAnswer }: { guess: GuessQuestion; title: string; intro?: string; onAnswer: (i: number) => void }) {
  return (
    <Modal>
      <div className="text-center">
        <div className="text-5xl mb-2 float-y">🤔</div>
        <div className="text-xs font-black text-fuchsia-600 tracking-wide mb-1">حدس بزن!</div>
        <h3 className="text-lg font-black text-slate-800 mb-1">{title}</h3>
        {intro && <p className="text-sm text-slate-600 mb-2">{intro}</p>}
        <p className="text-base md:text-lg font-black text-slate-900 bg-fuchsia-50 border-2 border-fuchsia-200 rounded-2xl p-3 mb-4">{guess.question}</p>
        <div className="grid gap-2">
          {guess.options.map((o, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-400 hover:scale-[1.02] transition-all p-3 text-right font-black text-slate-800 shadow-sm"
            >
              <span className="text-3xl">{o.emoji}</span>
              <span className="text-base">{o.text}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">بعد از انتخاب، خودت آزمایش می‌کنی و نتیجه را می‌بینی.</p>
      </div>
    </Modal>
  );
}

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      color: ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#facc15"][i % 6],
      rotate: Math.random() * 360,
    }))
  );
  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, transform: `rotate(${p.rotate}deg)` }}
        />
      ))}
    </>
  );
}

export function useTimedFlag(ms: number) {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!flag) return;
    const t = setTimeout(() => setFlag(false), ms);
    return () => clearTimeout(t);
  }, [flag, ms]);
  return [flag, () => setFlag(true)] as const;
}
