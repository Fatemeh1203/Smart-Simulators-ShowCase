import { useEffect, useMemo, useState } from "react";
import TriangleCanvas from "./TriangleCanvas";
import StatsPanel from "./StatsPanel";
import Confetti from "./Confetti";
import AnimatedNumber from "./AnimatedNumber";
import {
  DEFAULT_TRIANGLE,
  computeStats,
  fa,
  fmt,
  type Triangle,
  type TriangleStats,
} from "../lib/geometry";

interface Challenge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  points: number;
  check: (s: TriangleStats) => boolean;
  hint: (s: TriangleStats) => string;
  /** بین ۰ تا ۱: چقدر به هدف نزدیکی */
  progress: (s: TriangleStats) => number;
  goalLabel: (s: TriangleStats) => { label: string; value: number; target: string; suffix: string; digits?: number };
}

const CHALLENGES: Challenge[] = [
  {
    id: "perimeter18",
    emoji: "🧵",
    title: "چالش ۱",
    desc: "مثلثی بساز که محیط آن دقیقاً ۱۸ سانتی‌متر باشد.",
    points: 10,
    check: (s) => Math.abs(s.perimeter - 18) <= 0.25 && s.type !== "degenerate",
    hint: (s) =>
      s.perimeter > 18
        ? `محیط الان ${fmt(s.perimeter)} است؛ یعنی ${fmt(s.perimeter - 18)} سانتی‌متر زیاد است. نقطه‌ها را کمی به هم نزدیک کن.`
        : `محیط الان ${fmt(s.perimeter)} است؛ یعنی ${fmt(18 - s.perimeter)} سانتی‌متر کم است. نقطه‌ها را کمی از هم دور کن.`,
    progress: (s) => Math.max(0, 1 - Math.abs(s.perimeter - 18) / 10),
    goalLabel: (s) => ({ label: "محیط", value: s.perimeter, target: "۱۸", suffix: "cm" }),
  },
  {
    id: "equilateral",
    emoji: "🟢",
    title: "چالش ۲",
    desc: "مثلثی بساز که سه ضلع برابر داشته باشد.",
    points: 15,
    check: (s) => s.type === "equilateral",
    hint: (s) => {
      const sides = [
        ["AB", s.AB],
        ["BC", s.BC],
        ["AC", s.AC],
      ] as const;
      const sorted = [...sides].sort((a, b) => a[1] - b[1]);
      return `ضلع ${sorted[2][0]} (${fmt(sorted[2][1])}) از همه بلندتر و ${sorted[0][0]} (${fmt(sorted[0][1])}) از همه کوتاه‌تر است. سعی کن هر سه زاویه ۶۰ درجه شوند!`;
    },
    progress: (s) => {
      const m = Math.max(s.AB, s.BC, s.AC);
      const n = Math.min(s.AB, s.BC, s.AC);
      return Math.max(0, 1 - (m - n) / 5);
    },
    goalLabel: (s) => ({
      label: "اختلاف بلندترین و کوتاه‌ترین ضلع",
      value: Math.max(s.AB, s.BC, s.AC) - Math.min(s.AB, s.BC, s.AC),
      target: "۰",
      suffix: "cm",
    }),
  },
  {
    id: "right",
    emoji: "📐",
    title: "چالش ۳",
    desc: "مثلثی بساز که یک زاویه‌ی ۹۰ درجه داشته باشد.",
    points: 15,
    check: (s) => s.isRight,
    hint: (s) => {
      const angs = [
        ["A", s.angA],
        ["B", s.angB],
        ["C", s.angC],
      ] as const;
      const closest = [...angs].sort((a, b) => Math.abs(a[1] - 90) - Math.abs(b[1] - 90))[0];
      return `زاویه‌ی ${closest[0]} الان ${fmt(closest[1], 0)} درجه است و به ۹۰ نزدیک‌تر است. ${
        closest[1] < 90 ? "آن را کمی بازتر کن." : "آن را کمی بسته‌تر کن."
      } راهنمایی: مثل گوشه‌ی یک کتاب!`;
    },
    progress: (s) => {
      const d = Math.min(Math.abs(s.angA - 90), Math.abs(s.angB - 90), Math.abs(s.angC - 90));
      return Math.max(0, 1 - d / 60);
    },
    goalLabel: (s) => {
      const angs = [s.angA, s.angB, s.angC];
      const closest = angs.sort((a, b) => Math.abs(a - 90) - Math.abs(b - 90))[0];
      return { label: "نزدیک‌ترین زاویه به ۹۰", value: closest, target: "۹۰", suffix: "°", digits: 0 };
    },
  },
  {
    id: "area20",
    emoji: "🎨",
    title: "چالش ۴",
    desc: "مساحت مثلث را به ۲۰ سانتی‌متر مربع برسان.",
    points: 15,
    check: (s) => Math.abs(s.area - 20) <= 0.5,
    hint: (s) =>
      s.area > 20
        ? `مساحت الان ${fmt(s.area)} است؛ زیاد است. ارتفاع را کمتر کن (A را به قاعده نزدیک کن) یا قاعده را کوتاه‌تر کن.`
        : `مساحت الان ${fmt(s.area)} است؛ کم است. ارتفاع را بیشتر کن (A را از قاعده دور کن) یا قاعده را بلندتر کن.`,
    progress: (s) => Math.max(0, 1 - Math.abs(s.area - 20) / 20),
    goalLabel: (s) => ({ label: "مساحت", value: s.area, target: "۲۰", suffix: "cm²" }),
  },
  {
    id: "isosceles",
    emoji: "🔵",
    title: "چالش ۵",
    desc: "مثلثی بساز که دو ضلع برابر داشته باشد (اما نه هر سه!).",
    points: 10,
    check: (s) => s.type === "isosceles" || s.type === "right-isosceles",
    hint: (s) => {
      if (s.type === "equilateral")
        return "الان هر سه ضلع برابرند! یکی از نقطه‌ها را کمی جابه‌جا کن تا فقط دو ضلع برابر بمانند.";
      const pairs = [
        ["AB و BC", Math.abs(s.AB - s.BC)],
        ["BC و AC", Math.abs(s.BC - s.AC)],
        ["AB و AC", Math.abs(s.AB - s.AC)],
      ] as const;
      const best = [...pairs].sort((a, b) => a[1] - b[1])[0];
      return `ضلع‌های ${best[0]} فقط ${fmt(best[1])} سانتی‌متر با هم فرق دارند. کمی دقیق‌تر کن تا برابر شوند!`;
    },
    progress: (s) => {
      const d = Math.min(Math.abs(s.AB - s.BC), Math.abs(s.BC - s.AC), Math.abs(s.AB - s.AC));
      return Math.max(0, 1 - d / 4);
    },
    goalLabel: (s) => ({
      label: "کمترین اختلاف دو ضلع",
      value: Math.min(Math.abs(s.AB - s.BC), Math.abs(s.BC - s.AC), Math.abs(s.AB - s.AC)),
      target: "۰",
      suffix: "cm",
    }),
  },
];

const STORAGE_KEY = "triangle-lab-progress";

export default function ChallengeMode() {
  const [tri, setTri] = useState<Triangle>(DEFAULT_TRIANGLE);
  const [idx, setIdx] = useState(0);
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [justWon, setJustWon] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dragCount, setDragCount] = useState(0);

  const ch = CHALLENGES[idx];
  const stats = useMemo(() => computeStats(tri), [tri]);
  const ok = ch.check(stats);
  const isDone = completed.includes(ch.id);
  const score = completed.reduce(
    (sum, id) => sum + (CHALLENGES.find((c) => c.id === id)?.points ?? 0),
    0,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  // موفقیت وقتی شرط برقرار شود و کاربر انگشتش را بردارد
  const handleDragEnd = () => {
    setDragCount((c) => c + 1);
    if (ok && !justWon) {
      setJustWon(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
      if (!isDone) setCompleted((c) => [...c, ch.id]);
    } else if (!ok) {
      setShowHint(true);
    }
  };

  const goTo = (i: number) => {
    setIdx(i);
    setTri(DEFAULT_TRIANGLE);
    setJustWon(false);
    setShowHint(false);
    setDragCount(0);
  };

  const progress = ch.progress(stats);
  const goal = ch.goalLabel(stats);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Confetti active={confetti} />
      <div className="flex flex-col gap-3">
        {/* نوار امتیاز */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl bg-gradient-to-l from-amber-400 to-orange-400 p-3 shadow-lg text-white">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black">
            <span className="text-2xl">🏆</span> چالش هندسه
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 text-xl">
              {CHALLENGES.map((c) => (
                <span
                  key={c.id}
                  className={completed.includes(c.id) ? "animate-float" : "opacity-30 grayscale"}
                >
                  ⭐
                </span>
              ))}
            </div>
            <div className="rounded-full bg-white/90 px-3 py-1 font-black text-orange-600">
              امتیاز: {fa(score)}
            </div>
          </div>
        </div>

        {/* انتخاب چالش */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className={`flex shrink-0 items-center gap-1 rounded-2xl border-4 px-3 py-2 text-sm font-black transition active:scale-95 ${
                i === idx
                  ? "border-orange-500 bg-orange-100 text-orange-800"
                  : completed.includes(c.id)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-white bg-white/80 text-gray-600"
              }`}
            >
              <span>{completed.includes(c.id) ? "✅" : c.emoji}</span>
              {c.title}
            </button>
          ))}
        </div>

        {/* کارت مأموریت */}
        <div className="rounded-3xl bg-white/90 p-4 shadow-lg border-4 border-orange-200">
          <div className="flex items-start gap-3">
            <span className="text-4xl animate-float">{ch.emoji}</span>
            <div className="flex-1">
              <div className="text-xs font-black text-orange-500">
                {ch.title} • {fa(ch.points)} امتیاز
              </div>
              <p className="text-lg sm:text-xl font-black text-gray-800">{ch.desc}</p>
            </div>
          </div>

          {/* نوار نزدیکی به هدف */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm font-bold text-gray-600">
              <span>{goal.label}:</span>
              <span className="text-indigo-700 font-black">
                <AnimatedNumber value={goal.value} digits={goal.digits ?? 1} /> {goal.suffix}
                <span className="text-gray-400 font-bold"> ← هدف: {goal.target}</span>
              </span>
            </div>
            <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  ok ? "bg-emerald-500" : progress > 0.7 ? "bg-amber-400" : "bg-rose-400"
                }`}
                style={{ width: `${Math.round((ok ? 1 : progress) * 100)}%` }}
              />
            </div>
            <div className="mt-1 text-center text-xs font-bold text-gray-500">
              {ok ? "🎯 رسیدی! انگشتت را بردار." : progress > 0.85 ? "🔥 خیلی نزدیکی!" : progress > 0.6 ? "👍 داری نزدیک می‌شوی" : "🚀 ادامه بده"}
            </div>
          </div>

          {justWon && (
            <div className="mt-3 animate-pop rounded-2xl border-4 border-emerald-300 bg-emerald-50 p-4 text-center">
              <div className="text-4xl">🎉⭐🎉</div>
              <p className="mt-1 text-lg font-black text-emerald-700">
                آفرین! خودت یک مثلث با این ویژگی ساختی!
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {isDone && completed[completed.length - 1] !== ch.id
                  ? "این چالش را قبلاً هم برده بودی. عالی!"
                  : `+${fa(ch.points)} امتیاز و یک ستاره گرفتی!`}
              </p>
              {idx < CHALLENGES.length - 1 && (
                <button
                  onClick={() => goTo(idx + 1)}
                  className="mt-3 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-6 py-3 text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  ➡️ چالش بعدی
                </button>
              )}
              {idx === CHALLENGES.length - 1 && completed.length === CHALLENGES.length && (
                <p className="mt-2 font-black text-amber-600">🏅 همه‌ی چالش‌ها را تمام کردی! تو قهرمان مثلث‌ها هستی!</p>
              )}
            </div>
          )}

          {!justWon && showHint && dragCount > 0 && (
            <div className="mt-3 animate-fade-up rounded-2xl border-2 border-sky-200 bg-sky-50 p-3">
              <p className="text-sm sm:text-base font-bold text-sky-800">
                💡 راهنما: {ch.hint(stats)}
              </p>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowHint(true)}
              className="rounded-2xl bg-sky-100 px-4 py-2 font-black text-sky-700 transition hover:bg-sky-200 active:scale-95"
            >
              💡 کمک می‌خوام
            </button>
            <button
              onClick={() => {
                setTri(DEFAULT_TRIANGLE);
                setJustWon(false);
              }}
              className="rounded-2xl bg-gray-100 px-4 py-2 font-black text-gray-600 transition hover:bg-gray-200 active:scale-95"
            >
              🔁 از اول
            </button>
            {completed.length > 0 && (
              <button
                onClick={() => {
                  setCompleted([]);
                  setJustWon(false);
                }}
                className="mr-auto rounded-2xl px-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                پاک کردن امتیازها
              </button>
            )}
          </div>
        </div>

        <TriangleCanvas triangle={tri} onChange={setTri} onDragEnd={handleDragEnd} fillColor={ok ? "#34d399" : "#fbbf24"} />
      </div>

      <StatsPanel stats={stats} showExplain={false} />
    </div>
  );
}
