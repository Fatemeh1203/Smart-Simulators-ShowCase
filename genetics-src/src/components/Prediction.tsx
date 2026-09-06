import { useCallback, useEffect, useState } from "react";
import type { Trait } from "../genetics/data";
import { phenotypeShortLabel, type CrossAnalysis } from "../genetics/engine";

interface Props {
  analysis: CrossAnalysis;
  traits: Trait[];
  crossLabel: string;
  crossKey: string;
  onReveal: () => void;
  onRun: (n: number) => void;
  onClose: () => void;
}

interface Question {
  text: string;
  correct: number; // percent
  options: number[];
}

const POOL = [0, 6.25, 12.5, 25, 37.5, 50, 75, 100];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(analysis: CrossAnalysis, traits: Trait[]): Question {
  const askGeno = Math.random() < 0.5;
  let text: string;
  let correct: number;
  if (askGeno) {
    const keys = analysis.genotypeOrder;
    const k = keys[Math.floor(Math.random() * keys.length)];
    text = `احتمال تولد فرزند با ژنوتیپ ${k} چقدر است؟`;
    correct = analysis.genotypeProb[k] * 100;
  } else {
    const keys = analysis.phenotypeOrder;
    const k = keys[Math.floor(Math.random() * keys.length)];
    text = `احتمال تولد فرزند با فنوتیپ «${phenotypeShortLabel(k, traits)}» چقدر است؟`;
    correct = analysis.phenotypeProb[k] * 100;
  }
  correct = +correct.toFixed(2);
  const distractors = shuffle(POOL.filter((p) => Math.abs(p - correct) > 0.01)).slice(0, 3);
  return { text, correct, options: shuffle([correct, ...distractors]) };
}

export default function Prediction({ analysis, traits, crossLabel, crossKey, onReveal, onRun, onClose }: Props) {
  const [q, setQ] = useState<Question>(() => makeQuestion(analysis, traits));
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newQ = useCallback(() => {
    setQ(makeQuestion(analysis, traits));
    setAnswer(null);
  }, [analysis, traits]);

  useEffect(() => {
    newQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossKey]);

  const choose = (v: number) => {
    if (answer !== null) return;
    setAnswer(v);
    setScore((s) => ({ correct: s.correct + (v === q.correct ? 1 : 0), total: s.total + 1 }));
    onReveal();
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="card p-4 border-amber-200 bg-gradient-to-br from-amber-50/70 to-white fade-up">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">🤔</span> اول پیش‌بینی کن
        </h3>
        <div className="flex items-center gap-2">
          <span className="chip bg-white border border-amber-200 text-amber-800">
            امتیاز: <span className="num font-black">{score.correct}/{score.total}</span>
          </span>
          <button className="text-slate-400 hover:text-slate-700 text-xl leading-none" onClick={onClose} title="بستن">
            ×
          </button>
        </div>
      </div>
      <div className="text-sm text-slate-600 mb-1">
        والدین: <span className="num font-black text-indigo-700 text-base">{crossLabel}</span>
      </div>
      <div className="font-bold text-base mb-3">{q.text}</div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o, i) => {
          const isCorrect = o === q.correct;
          const chosen = answer === o;
          let cls = "border-slate-200 bg-white hover:border-amber-400";
          if (answer !== null) {
            if (isCorrect) cls = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
            else if (chosen) cls = "border-rose-500 bg-rose-50";
            else cls = "border-slate-200 bg-white opacity-60";
          }
          return (
            <button key={i} onClick={() => choose(o)} className={`rounded-xl border-2 px-3 py-2.5 text-right transition-all ${cls}`}>
              <span className="num font-black text-slate-400 ml-2">{letters[i]})</span>
              <span className="num font-black text-lg">{o}٪</span>
              {answer !== null && isCorrect && <span className="mr-2">✅</span>}
              {answer !== null && chosen && !isCorrect && <span className="mr-2">❌</span>}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <div className="mt-3 pop-in">
          <div className={`rounded-xl p-3 text-sm ${answer === q.correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
            {answer === q.correct ? "🎉 آفرین! پیش‌بینی‌ات درست بود." : `پاسخ درست ${q.correct}٪ است.`} جدول پانت را ببین و سپس آزمایش را اجرا کن تا ببینی نتیجه‌ی واقعی چقدر به این عدد نزدیک می‌شود.
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button className="btn btn-emerald text-sm" onClick={() => onRun(10)}>
              ⚡ اجرای آزمایش با ۱۰ فرزند
            </button>
            <button className="btn btn-emerald text-sm" onClick={() => onRun(100)}>
              ⚡ ۱۰۰ فرزند
            </button>
            <button className="btn btn-emerald text-sm" onClick={() => onRun(1000)}>
              ⚡ ۱۰۰۰ فرزند
            </button>
            <button className="btn btn-secondary text-sm" onClick={newQ}>
              🔁 سؤال جدید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
