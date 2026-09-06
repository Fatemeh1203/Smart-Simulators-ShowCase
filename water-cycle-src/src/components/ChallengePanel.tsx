import { useState } from "react";
import { CHALLENGES } from "../data/content";
import type { Params } from "../model/waterCycle";
import { cn } from "../utils/cn";

interface Props {
  applyParams: (p: Partial<Params>, start?: boolean) => void;
}

export default function ChallengePanel({ applyParams }: Props) {
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const ch = CHALLENGES[idx];
  const answered = choice !== null;

  const answer = (i: number) => {
    if (answered) return;
    setChoice(i);
    setScore((s) => ({ correct: s.correct + (i === ch.correct ? 1 : 0), total: s.total + 1 }));
    applyParams(ch.params, true); // شبیه‌ساز نتیجه واقعی را اجرا می‌کند
  };

  const next = () => {
    setIdx((idx + 1) % CHALLENGES.length);
    setChoice(null);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/80 border border-slate-200 p-3 flex items-center justify-between">
        <div>
          <div className="font-extrabold text-slate-800">🎯 چالش پیش‌بینی</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Interactive Challenge — ابتدا حدس بزن، بعد ببین!</div>
        </div>
        <div className="text-xs font-extrabold bg-violet-100 text-violet-800 rounded-lg px-2 py-1">
          امتیاز: {score.correct}/{score.total}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500">
            سؤال {idx + 1} از {CHALLENGES.length}
          </span>
          <div className="flex gap-1">
            {CHALLENGES.map((_, i) => (
              <span key={i} className={cn("w-2 h-2 rounded-full", i === idx ? "bg-violet-600" : "bg-slate-200")} />
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-violet-50 border border-violet-100 p-2.5 text-sm text-violet-900 leading-relaxed">
          📋 {ch.scenario}
        </div>
        <div className="font-extrabold text-slate-800 mt-2 text-sm">❓ {ch.question}</div>
        <div className="space-y-1.5 mt-2">
          {ch.options.map((o, i) => {
            const isC = i === ch.correct;
            const picked = choice === i;
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={answered}
                className={cn(
                  "w-full text-right rounded-lg border px-3 py-2 text-sm font-semibold transition",
                  !answered && "border-slate-200 hover:border-violet-400 hover:bg-violet-50",
                  answered && isC && "border-emerald-500 bg-emerald-50",
                  answered && picked && !isC && "border-red-400 bg-red-50",
                  answered && !picked && !isC && "border-slate-200 opacity-60"
                )}
              >
                <span className="inline-block w-5 font-extrabold text-slate-500">{["A", "B", "C"][i]}</span>
                {o}
                {answered && isC && " ✅"}
                {answered && picked && !isC && " ❌"}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
          <div
            className={cn(
              "rounded-lg p-2 text-sm font-extrabold",
              choice === ch.correct ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            )}
          >
            {choice === ch.correct ? "✅ پاسخ درست!" : "❌ پاسخ نادرست"}
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <b>🔬 دلیل علمی:</b> {ch.reason}
          </div>
          <div className="text-[11px] text-blue-700 bg-blue-50 rounded-lg p-2">
            ▶ شبیه‌ساز هم‌اکنون همین شرایط را اجرا می‌کند؛ نتیجه‌ی واقعی را در صحنه ببینید.
          </div>
          <button
            onClick={next}
            className="w-full rounded-lg py-2 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition"
          >
            سؤال بعدی ←
          </button>
        </div>
      )}
    </div>
  );
}
