import { useMemo, useState } from "react";
import TriangleCanvas from "./TriangleCanvas";
import StatsPanel from "./StatsPanel";
import Confetti from "./Confetti";
import AnimatedNumber from "./AnimatedNumber";
import {
  DEFAULT_TRIANGLE,
  computeStats,
  dist,
  type Triangle,
  type TriangleStats,
} from "../lib/geometry";

interface Experiment {
  id: string;
  question: string;
  options: { emoji: string; text: string }[];
  correct: number;
  task: string;
  lockAY?: boolean;
  lockBC?: boolean;
  detect: (start: TriangleStats, now: TriangleStats, t0: Triangle, t1: Triangle) => boolean;
  watch: { label: string; key: keyof TriangleStats; suffix: string; digits?: number }[];
  discovery: string;
  hintWrong: string;
}

const EXPERIMENTS: Experiment[] = [
  {
    id: "perimeter",
    question: "اگر یکی از ضلع‌های مثلث را بزرگ‌تر کنیم، چه اتفاقی برای محیط می‌افتد؟",
    options: [
      { emoji: "🟢", text: "بیشتر می‌شود" },
      { emoji: "🔵", text: "کمتر می‌شود" },
      { emoji: "🟡", text: "تغییری نمی‌کند" },
    ],
    correct: 0,
    task: "یکی از نقطه‌ها را طوری بکش که مثلث بزرگ‌تر شود.",
    detect: (s, n) => n.perimeter - s.perimeter >= 1.5,
    watch: [{ label: "محیط", key: "perimeter", suffix: "cm" }],
    discovery: "محیط جمعِ سه ضلع است. وقتی یک ضلع بزرگ‌تر شود، محیط هم بیشتر می‌شود!",
    hintWrong: "به عدد محیط نگاه کن؛ وقتی ضلع بلندتر شد، محیط هم بالا رفت. چون محیط = جمع ضلع‌ها.",
  },
  {
    id: "height",
    question: "اگر قاعده ثابت بماند و نقطه‌ی A را بالاتر ببریم (ارتفاع بیشتر شود)، مساحت چه می‌شود؟",
    options: [
      { emoji: "🟢", text: "بیشتر می‌شود" },
      { emoji: "🔵", text: "کمتر می‌شود" },
      { emoji: "🟡", text: "تغییری نمی‌کند" },
    ],
    correct: 0,
    task: "نقطه‌ی قرمز A را به سمت بالا بکش. (B و C قفل هستند)",
    lockBC: true,
    detect: (s, n) => n.height - s.height >= 1,
    watch: [
      { label: "ارتفاع", key: "height", suffix: "cm" },
      { label: "مساحت", key: "area", suffix: "cm²" },
    ],
    discovery: "وقتی ارتفاع بیشتر شود، فضای داخل مثلث هم بیشتر می‌شود. پس مساحت بالا می‌رود!",
    hintWrong: "به دو عدد «ارتفاع» و «مساحت» نگاه کن؛ هر دو با هم بالا رفتند. مثلث بلندتر = فضای بیشتر.",
  },
  {
    id: "sum",
    question: "اگر شکل مثلث را کاملاً عوض کنیم، مجموع سه زاویه چه می‌شود؟",
    options: [
      { emoji: "🟢", text: "بیشتر می‌شود" },
      { emoji: "🔵", text: "کمتر می‌شود" },
      { emoji: "🟡", text: "تغییری نمی‌کند" },
    ],
    correct: 2,
    task: "هر نقطه‌ای را که دوست داری، حسابی جابه‌جا کن!",
    detect: (_s, n, t0, t1) =>
      n.type !== "degenerate" &&
      Math.max(dist(t0.A, t1.A), dist(t0.B, t1.B), dist(t0.C, t1.C)) >= 2,
    watch: [
      { label: "زاویه A", key: "angA", suffix: "°", digits: 0 },
      { label: "زاویه B", key: "angB", suffix: "°", digits: 0 },
      { label: "زاویه C", key: "angC", suffix: "°", digits: 0 },
    ],
    discovery: "هر شکلی که مثلث داشته باشد، جمع سه زاویه‌اش همیشه ۱۸۰ درجه است. این یک راز بزرگ هندسه است!",
    hintWrong: "زاویه‌ها تک‌تک عوض شدند، ولی جمعشان همیشه ۱۸۰ ماند. یکی بزرگ می‌شود، بقیه کوچک!",
  },
  {
    id: "slide",
    question: "اگر نقطه‌ی A را فقط به چپ و راست بلغزانیم (بدون بالا و پایین رفتن)، مساحت چه می‌شود؟",
    options: [
      { emoji: "🟢", text: "بیشتر می‌شود" },
      { emoji: "🔵", text: "کمتر می‌شود" },
      { emoji: "🟡", text: "تغییری نمی‌کند" },
    ],
    correct: 2,
    task: "نقطه‌ی A را به چپ یا راست بکش. (ارتفاع قفل شده تا فقط بلغزد)",
    lockAY: true,
    lockBC: true,
    detect: (_s, _n, t0, t1) => Math.abs(t1.A.x - t0.A.x) >= 2.5,
    watch: [
      { label: "ارتفاع", key: "height", suffix: "cm" },
      { label: "مساحت", key: "area", suffix: "cm²" },
      { label: "محیط", key: "perimeter", suffix: "cm" },
    ],
    discovery: "قاعده و ارتفاع عوض نشدند، پس مساحت هم ثابت ماند! اما محیط عوض شد. مساحت و محیط دو چیز متفاوت‌اند.",
    hintWrong: "شکل کج شد، ولی قاعده و ارتفاع همان ماندند. مساحت فقط به این دو بستگی دارد؛ به محیط نگاه کن که عوض شد!",
  },
  {
    id: "angle",
    question: "اگر زاویه‌ی A را خیلی بزرگ‌تر کنیم، دو زاویه‌ی دیگر (B و C) چه می‌شوند؟",
    options: [
      { emoji: "🟢", text: "بیشتر می‌شوند" },
      { emoji: "🔵", text: "کمتر می‌شوند" },
      { emoji: "🟡", text: "تغییری نمی‌کنند" },
    ],
    correct: 1,
    task: "نقطه‌ی A را به سمت پایین (نزدیک قاعده) بکش تا زاویه‌اش باز شود.",
    lockBC: true,
    detect: (s, n) => n.angA - s.angA >= 20,
    watch: [
      { label: "زاویه A", key: "angA", suffix: "°", digits: 0 },
      { label: "زاویه B", key: "angB", suffix: "°", digits: 0 },
      { label: "زاویه C", key: "angC", suffix: "°", digits: 0 },
    ],
    discovery: "چون جمع زاویه‌ها همیشه ۱۸۰ است، وقتی یکی بزرگ شود، بقیه باید کوچک شوند تا جمع ثابت بماند.",
    hintWrong: "زاویه A بالا رفت اما B و C پایین آمدند. چون ۱۸۰ درجه باید بین سه زاویه تقسیم شود!",
  },
];

type Phase = "guess" | "experiment" | "result";

export default function ExploreMode() {
  const [tri, setTri] = useState<Triangle>(DEFAULT_TRIANGLE);
  const [expIdx, setExpIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("guess");
  const [guess, setGuess] = useState<number | null>(null);
  const [startTri, setStartTri] = useState<Triangle>(DEFAULT_TRIANGLE);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [confetti, setConfetti] = useState(false);

  const exp = EXPERIMENTS[expIdx];
  const stats = useMemo(() => computeStats(tri), [tri]);
  const startStats = useMemo(() => computeStats(startTri), [startTri]);

  const handleChange = (t: Triangle) => {
    let next = t;
    if (phase === "experiment") {
      if (exp.lockBC) next = { ...next, B: tri.B, C: tri.C };
      if (exp.lockAY) next = { ...next, A: { x: next.A.x, y: tri.A.y } };
    }
    setTri(next);
    if (phase === "experiment" && exp.detect(startStats, computeStats(next), startTri, next)) {
      setPhase("result");
      if (guess === exp.correct) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
      setDone((d) => new Set(d).add(exp.id));
    }
  };

  const startExperiment = () => {
    setTri(DEFAULT_TRIANGLE);
    setStartTri(DEFAULT_TRIANGLE);
    setPhase("experiment");
  };

  const nextExperiment = () => {
    setExpIdx((i) => (i + 1) % EXPERIMENTS.length);
    setPhase("guess");
    setGuess(null);
    setTri(DEFAULT_TRIANGLE);
  };

  const isCorrect = guess === exp.correct;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Confetti active={confetti} />
      <div className="flex flex-col gap-3">
        <TriangleCanvas
          triangle={tri}
          onChange={handleChange}
          locked={phase === "experiment" && exp.lockBC ? ["B", "C"] : []}
        />

        {/* کارت حدس بزن */}
        <div className="rounded-3xl bg-white/90 p-4 shadow-lg border-4 border-fuchsia-200">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black text-fuchsia-700">
              <span className="text-2xl">🤔</span> حدس بزن!
            </h2>
            <div className="flex gap-1">
              {EXPERIMENTS.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setExpIdx(i);
                    setPhase("guess");
                    setGuess(null);
                    setTri(DEFAULT_TRIANGLE);
                  }}
                  className={`h-8 w-8 rounded-full text-sm font-black transition ${
                    i === expIdx
                      ? "bg-fuchsia-500 text-white scale-110"
                      : done.has(e.id)
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {done.has(e.id) && i !== expIdx ? "✓" : ["۱", "۲", "۳", "۴", "۵"][i]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed">{exp.question}</p>

          {phase === "guess" && (
            <div className="mt-3 animate-fade-up">
              <div className="grid gap-2 sm:grid-cols-3">
                {exp.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => setGuess(i)}
                    className={`rounded-2xl border-4 px-3 py-3 text-base font-black transition-all active:scale-95 ${
                      guess === i
                        ? "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-800 scale-105 shadow-lg"
                        : "border-gray-200 bg-white text-gray-700 hover:border-fuchsia-300"
                    }`}
                  >
                    <span className="text-xl ml-1">{o.emoji}</span> {o.text}
                  </button>
                ))}
              </div>
              <button
                disabled={guess === null}
                onClick={startExperiment}
                className="mt-3 w-full rounded-2xl bg-gradient-to-l from-fuchsia-500 to-purple-500 px-4 py-3 text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🧪 حالا آزمایش کن!
              </button>
            </div>
          )}

          {phase === "experiment" && (
            <div className="mt-3 animate-fade-up">
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-3">
                <p className="font-black text-amber-800">
                  🎯 مأموریت: <span className="font-bold">{exp.task}</span>
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  حدس تو: <b>{exp.options[guess ?? 0].text}</b> — حالا ببین درست بود؟
                </p>
              </div>
              <WatchTable exp={exp} start={startStats} now={stats} />
            </div>
          )}

          {phase === "result" && (
            <div className="mt-3 animate-pop">
              <div
                className={`rounded-2xl border-4 p-4 ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-sky-300 bg-sky-50"
                }`}
              >
                <p className={`text-lg font-black ${isCorrect ? "text-emerald-700" : "text-sky-700"}`}>
                  {isCorrect ? "🎉 آفرین! حدست درست بود!" : "🔍 حدست فرق داشت، ولی حالا کشفش کردی!"}
                </p>
                <p className="mt-2 text-sm sm:text-base font-bold text-gray-700 leading-relaxed">
                  {isCorrect ? exp.discovery : exp.hintWrong}
                </p>
                {!isCorrect && (
                  <p className="mt-1 text-sm text-gray-600">
                    ✅ پاسخ درست: <b>{exp.options[exp.correct].text}</b>
                  </p>
                )}
              </div>
              <WatchTable exp={exp} start={startStats} now={stats} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={nextExperiment}
                  className="flex-1 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-4 py-3 text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  ➡️ آزمایش بعدی
                </button>
                <button
                  onClick={() => {
                    setPhase("guess");
                    setGuess(null);
                    setTri(DEFAULT_TRIANGLE);
                  }}
                  className="rounded-2xl bg-gray-200 px-4 py-3 font-black text-gray-700 transition hover:bg-gray-300 active:scale-95"
                >
                  🔁 دوباره
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StatsPanel stats={stats} />
    </div>
  );
}

function WatchTable({
  exp,
  start,
  now,
}: {
  exp: Experiment;
  start: TriangleStats;
  now: TriangleStats;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border-2 border-gray-200">
      <div className="grid grid-cols-3 bg-gray-100 text-center text-xs font-black text-gray-600">
        <div className="py-1">چه چیزی؟</div>
        <div className="py-1">اول</div>
        <div className="py-1">الان</div>
      </div>
      {exp.watch.map((w) => {
        const a = start[w.key] as number;
        const b = now[w.key] as number;
        const diff = b - a;
        const arrow =
          Math.abs(diff) < (w.digits === 0 ? 0.6 : 0.06) ? "➖" : diff > 0 ? "⬆️" : "⬇️";
        return (
          <div key={w.key} className="grid grid-cols-3 border-t border-gray-100 text-center text-sm font-bold">
            <div className="py-2 text-gray-700">{w.label}</div>
            <div className="py-2 text-gray-500 tabular-nums">
              <AnimatedNumber value={a} digits={w.digits ?? 1} /> {w.suffix}
            </div>
            <div className="py-2 text-indigo-700 tabular-nums">
              <AnimatedNumber value={b} digits={w.digits ?? 1} /> {w.suffix} {arrow}
            </div>
          </div>
        );
      })}
    </div>
  );
}
