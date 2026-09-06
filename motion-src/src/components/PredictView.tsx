import { useState } from "react";
import { Params, computeForces, fmt } from "../physics";
import CompareView from "./CompareView";

type Option = "more" | "less" | "same";
const OPTIONS: { key: Option; label: string; icon: string }[] = [
  { key: "more", label: "بیشتر می‌شود", icon: "📈" },
  { key: "less", label: "کمتر می‌شود", icon: "📉" },
  { key: "same", label: "تغییری نمی‌کند", icon: "➖" },
];

interface Q {
  question: string;
  base: Params;
  mod: Params;
  baseLabel: string;
  modLabel: string;
  why: string;
}

const QUESTIONS: Q[] = [
  {
    question: "به نظرت اگر جرم جسم را دو برابر کنیم (با نیروی ثابت)، شتاب چه تغییری می‌کند؟",
    base: { mass: 10, force: 100, mu: 0.2, v0: 0 },
    mod: { mass: 20, force: 100, mu: 0.2, v0: 0 },
    baseLabel: "جرم 10 kg",
    modLabel: "جرم 20 kg",
    why: "جرم در مخرج رابطه‌ی a = Fnet / m است؛ جرم بیشتر یعنی «اینرسی» بیشتر و شتاب کمتر. علاوه بر آن، جرم بیشتر اصطکاک را هم زیاد می‌کند.",
  },
  {
    question: "اگر نیروی واردشده را دو برابر کنیم (با جرم و سطح ثابت)، شتاب چه تغییری می‌کند؟",
    base: { mass: 10, force: 60, mu: 0.2, v0: 0 },
    mod: { mass: 10, force: 120, mu: 0.2, v0: 0 },
    baseLabel: "نیروی 60 N",
    modLabel: "نیروی 120 N",
    why: "شتاب با نیروی خالص نسبت مستقیم دارد. با نیروی بیشتر، نیروی خالص (F − f) بزرگ‌تر می‌شود و شتاب بالا می‌رود.",
  },
  {
    question: "اگر سطح را از «چوب» به «یخ» تغییر دهیم (با همان جرم و نیرو)، شتاب چه تغییری می‌کند؟",
    base: { mass: 10, force: 80, mu: 0.3, v0: 0 },
    mod: { mass: 10, force: 80, mu: 0.05, v0: 0 },
    baseLabel: "روی چوب (μ = 0.3)",
    modLabel: "روی یخ (μ = 0.05)",
    why: "اصطکاک کمتر یعنی نیروی مخالف کوچک‌تر، پس نیروی خالص بزرگ‌تر و شتاب بیشتر می‌شود.",
  },
  {
    question: "اگر هم جرم و هم نیرو را دو برابر کنیم (روی سطح بدون اصطکاک)، شتاب چه تغییری می‌کند؟",
    base: { mass: 10, force: 100, mu: 0, v0: 0 },
    mod: { mass: 20, force: 200, mu: 0, v0: 0 },
    baseLabel: "10 kg و 100 N",
    modLabel: "20 kg و 200 N",
    why: "a = F / m؛ وقتی صورت و مخرج هر دو دو برابر شوند، نسبت تغییر نمی‌کند. شتاب فقط به «نسبت» نیروی خالص به جرم بستگی دارد.",
  },
  {
    question: "جسمی 10 کیلوگرمی روی بتن با نیروی 50 N ساکن است. اگر نیرو را به 100 N برسانیم، شتاب چه تغییری می‌کند؟",
    base: { mass: 10, force: 50, mu: 0.6, v0: 0 },
    mod: { mass: 10, force: 100, mu: 0.6, v0: 0 },
    baseLabel: "نیروی 50 N",
    modLabel: "نیروی 100 N",
    why: "بیشینه‌ی اصطکاک ایستایی روی بتن ۵۸٫۹ N است؛ با 50 N جسم راه نمی‌افتد و شتابش صفر است. با 100 N نیرو از اصطکاک بیشتر می‌شود و جسم شتاب می‌گیرد.",
  },
];

function correctAnswer(q: Q): Option {
  const a1 = computeForces(q.base, q.base.v0).a;
  const a2 = computeForces(q.mod, q.mod.v0).a;
  if (Math.abs(a1 - a2) < 1e-6) return "same";
  return a2 > a1 ? "more" : "less";
}

export default function PredictView() {
  const [qi, setQi] = useState(0);
  const [choice, setChoice] = useState<Option | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const q = QUESTIONS[qi];
  const correct = correctAnswer(q);
  const a1 = computeForces(q.base, q.base.v0).a;
  const a2 = computeForces(q.mod, q.mod.v0).a;

  const choose = (o: Option) => {
    if (choice) return;
    setChoice(o);
    setScore((s) => ({ right: s.right + (o === correct ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setQi((i) => (i + 1) % QUESTIONS.length);
    setChoice(null);
    setFinished(false);
  };

  const questionCard = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
          سؤال {qi + 1} از {QUESTIONS.length}
        </span>
        <span className="num text-xs font-bold text-slate-500">
          امتیاز: {score.right} / {score.total}
        </span>
      </div>
      <h2 className="text-lg font-extrabold leading-8 text-slate-900">🤔 {q.question}</h2>
      <div className="grid gap-2 sm:grid-cols-2 text-sm">
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3">
          <p className="font-bold text-indigo-700">جسم A — {q.baseLabel}</p>
          <p className="num text-xs text-slate-600 mt-1" dir="ltr">
            m = {q.base.mass} kg · F = {q.base.force} N · μ = {q.base.mu}
          </p>
        </div>
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
          <p className="font-bold text-orange-700">جسم B — {q.modLabel}</p>
          <p className="num text-xs text-slate-600 mt-1" dir="ltr">
            m = {q.mod.mass} kg · F = {q.mod.force} N · μ = {q.mod.mu}
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const picked = choice === o.key;
          const isCorrect = o.key === correct;
          let cls = "border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50";
          if (choice) {
            if (isCorrect && finished) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (picked && !finished) cls = "border-pink-400 bg-pink-50 text-pink-800";
            else if (picked && finished && !isCorrect) cls = "border-red-400 bg-red-50 text-red-800";
            else cls = "border-slate-200 bg-slate-50 text-slate-400";
          }
          return (
            <button
              key={o.key}
              onClick={() => choose(o.key)}
              disabled={!!choice}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition disabled:cursor-default ${cls}`}
            >
              <span className="ml-1">{o.icon}</span> {o.label}
              {picked && <span className="block text-[11px] font-medium mt-1">پیش‌بینی تو</span>}
            </button>
          );
        })}
      </div>
      {!choice && <p className="text-xs text-slate-500">اول پیش‌بینی کن؛ بعد آزمایش خودکار اجرا می‌شود.</p>}
      {choice && !finished && (
        <p className="text-sm font-semibold text-slate-600 pulse-soft">⏳ آزمایش در حال اجراست... حرکت دو جسم را با هم مقایسه کن.</p>
      )}
      {finished && (
        <div className={`rounded-xl border p-4 text-sm leading-7 fade-up ${choice === correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900"}`}>
          <p className="font-extrabold text-base">{choice === correct ? "🎉 آفرین! پیش‌بینی‌ات درست بود." : "❌ پیش‌بینی‌ات درست نبود؛ اشکالی ندارد، ببین چرا:"}</p>
          <p>
            نتیجه‌ی واقعی: شتاب جسم A برابر <b className="num">{fmt(a1)} m/s²</b> و شتاب جسم B برابر <b className="num">{fmt(a2)} m/s²</b> شد؛ یعنی شتاب{" "}
            <b>{OPTIONS.find((o) => o.key === correct)!.label}</b>.
          </p>
          <p>{q.why}</p>
          <button onClick={next} className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 transition">
            سؤال بعدی ←
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {choice ? (
        <CompareView
          key={qi}
          initialA={q.base}
          initialB={q.mod}
          lockControls
          autoStart
          maxTime={4}
          header={questionCard}
          onFinished={() => setFinished(true)}
        />
      ) : (
        questionCard
      )}
    </div>
  );
}
