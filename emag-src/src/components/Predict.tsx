import { useState } from "react";
import { cn } from "../utils/cn";
import { Card } from "./ui";

export function PredictQuestion({
  question,
  options,
  correctIndex,
  explanation,
  onAnswered,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswered?: (correct: boolean) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);

  return (
    <Card title="🔮 پیش‌بینی کن قبل از دیدن نتیجه" className="border-fuchsia-500/30 bg-fuchsia-950/10">
      <p className="mb-3 text-sm font-semibold text-slate-200">{question}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isChosen = choice === i;
          const isCorrect = i === correctIndex;
          return (
            <button
              key={i}
              onClick={() => {
                setChoice(i);
                onAnswered?.(i === correctIndex);
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-right text-xs font-semibold transition",
                choice === null && "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-fuchsia-500/50",
                choice !== null && isCorrect && "border-emerald-500 bg-emerald-500/15 text-emerald-300",
                choice !== null && isChosen && !isCorrect && "border-rose-500 bg-rose-500/15 text-rose-300",
                choice !== null && !isChosen && !isCorrect && "border-slate-800 bg-slate-800/30 text-slate-500",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {choice !== null && (
        <div className="mt-3 rounded-lg bg-slate-800/60 px-3 py-2 text-xs leading-6 text-slate-300">
          {choice === correctIndex ? "✅ درست بود! " : "❌ دقیقاً درست نبود. "}
          {explanation}
        </div>
      )}
    </Card>
  );
}
