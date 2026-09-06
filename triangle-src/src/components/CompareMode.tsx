import { useMemo, useState } from "react";
import TriangleCanvas from "./TriangleCanvas";
import { TypeCard } from "./StatsPanel";
import AnimatedNumber from "./AnimatedNumber";
import Confetti from "./Confetti";
import {
  DEFAULT_TRIANGLE,
  SECOND_TRIANGLE,
  computeStats,
  fmt,
  type Triangle,
  type TriangleStats,
} from "../lib/geometry";

type Answer = 1 | 2 | 0; // 0 = برابرند

interface Q {
  id: string;
  text: string;
  answer: (a: TriangleStats, b: TriangleStats) => Answer;
  explain: (a: TriangleStats, b: TriangleStats) => string;
}

const QUESTIONS: Q[] = [
  {
    id: "perimeter",
    text: "کدام مثلث محیط بیشتری دارد؟",
    answer: (a, b) => (Math.abs(a.perimeter - b.perimeter) < 0.3 ? 0 : a.perimeter > b.perimeter ? 1 : 2),
    explain: (a, b) =>
      `محیط مثلث ۱ = ${fmt(a.perimeter)} و محیط مثلث ۲ = ${fmt(b.perimeter)} سانتی‌متر. محیط یعنی دورِ شکل.`,
  },
  {
    id: "area",
    text: "کدام مثلث مساحت بیشتری دارد؟",
    answer: (a, b) => (Math.abs(a.area - b.area) < 0.5 ? 0 : a.area > b.area ? 1 : 2),
    explain: (a, b) =>
      `مساحت مثلث ۱ = ${fmt(a.area)} و مساحت مثلث ۲ = ${fmt(b.area)} سانتی‌متر مربع. مساحت یعنی فضای داخل شکل.`,
  },
  {
    id: "bigAngle",
    text: "بزرگ‌ترین زاویه در کدام مثلث است؟",
    answer: (a, b) => {
      const ma = Math.max(a.angA, a.angB, a.angC);
      const mb = Math.max(b.angA, b.angB, b.angC);
      return Math.abs(ma - mb) < 1 ? 0 : ma > mb ? 1 : 2;
    },
    explain: (a, b) =>
      `بزرگ‌ترین زاویه مثلث ۱ = ${fmt(Math.max(a.angA, a.angB, a.angC), 0)}° و مثلث ۲ = ${fmt(Math.max(b.angA, b.angB, b.angC), 0)}°.`,
  },
  {
    id: "longSide",
    text: "بلندترین ضلع در کدام مثلث است؟",
    answer: (a, b) => {
      const ma = Math.max(a.AB, a.BC, a.AC);
      const mb = Math.max(b.AB, b.BC, b.AC);
      return Math.abs(ma - mb) < 0.3 ? 0 : ma > mb ? 1 : 2;
    },
    explain: (a, b) =>
      `بلندترین ضلع مثلث ۱ = ${fmt(Math.max(a.AB, a.BC, a.AC))} و مثلث ۲ = ${fmt(Math.max(b.AB, b.BC, b.AC))} سانتی‌متر.`,
  },
  {
    id: "sum",
    text: "مجموع زاویه‌های کدام مثلث بیشتر است؟",
    answer: () => 0,
    explain: () => "هر دو ۱۸۰ درجه‌اند! مجموع زاویه‌های هر مثلثی همیشه ۱۸۰ است، هر شکلی که باشد.",
  },
];

function MiniStats({ s, n, color }: { s: TriangleStats; n: number; color: string }) {
  return (
    <div className={`rounded-3xl ${color} p-3 shadow-md flex flex-col gap-2`}>
      <div className="text-center font-black text-gray-700">مثلث {n === 1 ? "۱" : "۲"}</div>
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        {(
          [
            ["AB", s.AB],
            ["BC", s.BC],
            ["AC", s.AC],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/80 py-1">
            <div className="font-bold text-purple-500">{k}</div>
            <div className="font-black text-purple-800">
              <AnimatedNumber value={v} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        {(
          [
            ["A", s.angA, "text-red-700"],
            ["B", s.angB, "text-blue-700"],
            ["C", s.angC, "text-green-700"],
          ] as const
        ).map(([k, v, c]) => (
          <div key={k} className={`rounded-xl bg-white/80 py-1 ${c}`}>
            <div className="font-bold opacity-70">زاویه {k}</div>
            <div className="font-black">
              <AnimatedNumber value={v} digits={0} suffix="°" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between rounded-xl bg-emerald-100 px-3 py-1.5 text-sm font-black text-emerald-800">
        <span>🧵 محیط</span>
        <span>
          <AnimatedNumber value={s.perimeter} /> cm
        </span>
      </div>
      <div className="flex justify-between rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800">
        <span>🎨 مساحت</span>
        <span>
          <AnimatedNumber value={s.area} /> cm²
        </span>
      </div>
      <TypeCard stats={s} small />
    </div>
  );
}

export default function CompareMode() {
  const [t1, setT1] = useState<Triangle>(DEFAULT_TRIANGLE);
  const [t2, setT2] = useState<Triangle>(SECOND_TRIANGLE);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const s1 = useMemo(() => computeStats(t1), [t1]);
  const s2 = useMemo(() => computeStats(t2), [t2]);
  const q = QUESTIONS[qIdx];
  const correct = q.answer(s1, s2);

  const pick = (a: Answer) => {
    setPicked(a);
    if (a === correct) {
      setScore((s) => s + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1800);
    }
  };

  const next = () => {
    setQIdx((i) => (i + 1) % QUESTIONS.length);
    setPicked(null);
  };

  const btn = (a: Answer, label: string, color: string) => {
    const isPicked = picked === a;
    const reveal = picked !== null;
    return (
      <button
        key={a}
        disabled={reveal}
        onClick={() => pick(a)}
        className={`rounded-2xl border-4 px-3 py-3 font-black transition-all active:scale-95 ${
          reveal && a === correct
            ? "border-emerald-500 bg-emerald-100 text-emerald-800 scale-105"
            : reveal && isPicked
              ? "border-rose-400 bg-rose-50 text-rose-700"
              : `${color} hover:scale-105`
        } disabled:cursor-default`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Confetti active={confetti} />
      <div className="rounded-3xl bg-white/90 p-3 shadow-lg border-4 border-teal-200">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black text-teal-700">
          <span className="text-2xl">⚖️</span> مقایسه‌ی دو مثلث
        </h2>
        <p className="mt-1 text-sm font-bold text-gray-600">
          هر دو مثلث را هر طور می‌خواهی تغییر بده، بعد به سؤال‌ها جواب بده!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <TriangleCanvas triangle={t1} onChange={setT1} fillColor="#fbbf24" label="مثلث ۱" compact />
          <MiniStats s={s1} n={1} color="bg-yellow-50" />
        </div>
        <div className="flex flex-col gap-3">
          <TriangleCanvas triangle={t2} onChange={setT2} fillColor="#f472b6" label="مثلث ۲" compact />
          <MiniStats s={s2} n={2} color="bg-pink-50" />
        </div>
      </div>

      {/* سؤال مقایسه */}
      <div className="rounded-3xl bg-white/90 p-4 shadow-lg border-4 border-teal-200">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-teal-700">❓ سؤال {["۱", "۲", "۳", "۴", "۵"][qIdx]} از ۵</h3>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-black text-teal-700">
            ✅ درست‌ها: <AnimatedNumber value={score} digits={0} />
          </span>
        </div>
        <p className="mt-2 text-lg sm:text-xl font-black text-gray-800">{q.text}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {btn(1, "🟡 مثلث ۱", "border-yellow-300 bg-yellow-50 text-yellow-800")}
          {btn(2, "🩷 مثلث ۲", "border-pink-300 bg-pink-50 text-pink-800")}
          {btn(0, "🤝 برابرند", "border-gray-300 bg-gray-50 text-gray-700")}
        </div>

        {picked !== null && (
          <div
            className={`mt-3 animate-pop rounded-2xl border-4 p-3 ${
              picked === correct ? "border-emerald-300 bg-emerald-50" : "border-sky-300 bg-sky-50"
            }`}
          >
            <p className={`font-black ${picked === correct ? "text-emerald-700" : "text-sky-700"}`}>
              {picked === correct ? "🎉 آفرین! درست گفتی!" : "🔍 دوباره به عددها نگاه کن:"}
            </p>
            <p className="mt-1 text-sm sm:text-base font-bold text-gray-700">{q.explain(s1, s2)}</p>
            <button
              onClick={next}
              className="mt-3 rounded-2xl bg-gradient-to-l from-teal-500 to-cyan-500 px-5 py-2.5 font-black text-white shadow transition hover:brightness-110 active:scale-95"
            >
              ➡️ سؤال بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
