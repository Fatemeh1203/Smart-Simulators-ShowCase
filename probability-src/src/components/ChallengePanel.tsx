import { useEffect, useMemo, useState } from "react";
import { DICE_EVENTS, fmtInt, fmtPct, toFa, type ExperimentConfig, type ExperimentType } from "../lib/probability";

export interface ChallengeState {
  cfg: ExperimentConfig;
  total: number;
  focusDiceEvent: string;
  headsExp: number; // experimental P(heads) (coin)
  focusExp: number;
  focusTheo: number;
}

interface Challenge {
  id: string;
  icon: string;
  type: ExperimentType;
  title: string;
  desc: string;
  check: (s: ChallengeState) => { done: boolean; hint: string };
}

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    icon: "🪙",
    type: "coin",
    title: "چالش ۱ — سکه‌ی نزدیک به نظری",
    desc: "با حداقل ۱۰۰ آزمایش، احتمال تجربی شیر را به کمتر از ۲٪ اختلاف از احتمال نظری برسان.",
    check: (s) => {
      if (s.cfg.type !== "coin") return { done: false, hint: "به آزمایش سکه بروید." };
      const diff = Math.abs(s.headsExp - s.cfg.pHeads);
      if (s.total < 100) return { done: false, hint: `تعداد آزمایش: ${fmtInt(s.total)} / ۱۰۰` };
      return { done: diff < 0.02, hint: `اختلاف فعلی: ${fmtPct(diff)} (هدف: کمتر از ۲٪)` };
    },
  },
  {
    id: "c2",
    icon: "🎒",
    type: "bag",
    title: "چالش ۲ — کیسه‌ی ۶۰ درصدی",
    desc: "کیسه‌ای بساز که احتمال انتخاب توپ قرمز دقیقاً ۶۰٪ باشد.",
    check: (s) => {
      if (s.cfg.type !== "bag") return { done: false, hint: "به آزمایش کیسه بروید." };
      const total = s.cfg.bag.reduce((a, b) => a + b, 0);
      const red = s.cfg.bag[0];
      const ok = total > 0 && red * 5 === total * 3;
      return { done: ok, hint: `اکنون: قرمز ${toFa(red)} از ${toFa(total)} = ${total ? fmtPct(red / total, 1) : "—"}` };
    },
  },
  {
    id: "c3",
    icon: "🎲",
    type: "dice",
    title: "چالش ۳ — رویداد یک‌سومی",
    desc: "در تاس، رویدادی انتخاب کن که احتمال نظری آن حدود ۳۳٪ باشد و حداقل ۵۰ بار آزمایش کن.",
    check: (s) => {
      if (s.cfg.type !== "dice") return { done: false, hint: "به آزمایش تاس بروید." };
      const ev = DICE_EVENTS.find((e) => e.id === s.focusDiceEvent);
      const okEvent = ev?.set.length === 2;
      if (!okEvent) return { done: false, hint: `رویداد فعلی «${ev?.label}» با احتمال ${fmtPct((ev?.set.length ?? 0) / 6)} — رویدادی با ۲ نتیجه‌ی مطلوب انتخاب کن` };
      if (s.total < 50) return { done: false, hint: `رویداد درست است ✓ — تعداد آزمایش: ${fmtInt(s.total)} / ۵۰` };
      return { done: true, hint: "" };
    },
  },
  {
    id: "c4",
    icon: "⚙️",
    type: "coin",
    title: "چالش ۴ — سکه‌ی ناعادلانه",
    desc: "احتمال شیر را روی ۷۰٪ تنظیم کن، حداقل ۱۰۰۰ بار پرتاب کن و اختلاف تجربی را زیر ۲٪ نگه دار.",
    check: (s) => {
      if (s.cfg.type !== "coin") return { done: false, hint: "به آزمایش سکه بروید." };
      if (Math.abs(s.cfg.pHeads - 0.7) > 1e-6) return { done: false, hint: `احتمال شیر فعلی: ${fmtPct(s.cfg.pHeads, 0)} — باید ۷۰٪ باشد` };
      if (s.total < 1000) return { done: false, hint: `تنظیم درست ✓ — تعداد آزمایش: ${fmtInt(s.total)} / ۱٬۰۰۰` };
      const diff = Math.abs(s.headsExp - 0.7);
      return { done: diff < 0.02, hint: `اختلاف فعلی: ${fmtPct(diff)}` };
    },
  },
  {
    id: "c5",
    icon: "📈",
    type: "dice",
    title: "چالش ۵ — قانون اعداد بزرگ",
    desc: "در هر آزمایشی، با ۱۰٬۰۰۰ آزمایش اختلاف رویداد انتخاب‌شده را به کمتر از ۱٪ برسان.",
    check: (s) => {
      if (s.total < 10000) return { done: false, hint: `تعداد آزمایش: ${fmtInt(s.total)} / ۱۰٬۰۰۰` };
      const diff = Math.abs(s.focusExp - s.focusTheo);
      return { done: diff < 0.01, hint: `اختلاف فعلی: ${fmtPct(diff)}` };
    },
  },
];

interface Props {
  state: ChallengeState;
  onGoTo: (t: ExperimentType) => void;
}

export default function ChallengePanel({ state, onGoTo }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState<string | null>(null);

  const results = useMemo(() => CHALLENGES.map((c) => ({ c, r: c.check(state) })), [state]);

  useEffect(() => {
    const newly = results.find(({ c, r }) => r.done && !completed.has(c.id));
    if (newly) {
      setCompleted((prev) => new Set(prev).add(newly.c.id));
      setCelebrate(newly.c.id);
      const t = window.setTimeout(() => setCelebrate(null), 2500);
      return () => window.clearTimeout(t);
    }
  }, [results, completed]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
      {celebrate && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="confetti text-xl" style={{ animationDelay: `${(i % 6) * 0.1}s` }}>
              {["🎉", "⭐", "🏆", "✨"][i % 4]}
            </span>
          ))}
        </div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-amber-800">🎯 حالت چالش (Challenge Mode)</h3>
        <span className="num rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
          {toFa(completed.size)} / {toFa(CHALLENGES.length)} 🏆
        </span>
      </div>
      <div className="space-y-2">
        {results.map(({ c, r }) => {
          const done = completed.has(c.id);
          return (
            <div key={c.id} className={`rounded-2xl p-3 ring-1 transition ${done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-200"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800">
                    <span className="ml-1">{c.icon}</span>
                    {c.title}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{c.desc}</div>
                  {!done && r.hint && <div className="mt-1 text-xs font-semibold text-amber-700">{r.hint}</div>}
                  {done && <div className="mt-1 text-sm font-black text-emerald-700">🏆 چالش با موفقیت انجام شد!</div>}
                </div>
                {!done && state.cfg.type !== c.type && (
                  <button onClick={() => onGoTo(c.type)} className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
                    برو به آزمایش
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
