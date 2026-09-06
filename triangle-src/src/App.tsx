import { useState } from "react";
import ExploreMode from "./components/ExploreMode";
import BuildMode from "./components/BuildMode";
import ChallengeMode from "./components/ChallengeMode";
import CompareMode from "./components/CompareMode";

type Tab = "explore" | "build" | "challenge" | "compare";

const TABS: { id: Tab; emoji: string; label: string; color: string; active: string }[] = [
  {
    id: "explore",
    emoji: "🔬",
    label: "آزمایشگاه",
    color: "bg-white/80 text-fuchsia-700 border-fuchsia-200",
    active: "bg-gradient-to-l from-fuchsia-500 to-purple-500 text-white border-fuchsia-500 shadow-lg",
  },
  {
    id: "build",
    emoji: "🎨",
    label: "خودت مثلث بساز!",
    color: "bg-white/80 text-pink-700 border-pink-200",
    active: "bg-gradient-to-l from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg",
  },
  {
    id: "challenge",
    emoji: "🏆",
    label: "چالش هندسه",
    color: "bg-white/80 text-orange-700 border-orange-200",
    active: "bg-gradient-to-l from-amber-500 to-orange-500 text-white border-orange-500 shadow-lg",
  },
  {
    id: "compare",
    emoji: "⚖️",
    label: "مقایسه دو مثلث",
    color: "bg-white/80 text-teal-700 border-teal-200",
    active: "bg-gradient-to-l from-teal-500 to-cyan-500 text-white border-teal-500 shadow-lg",
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("explore");

  return (
    <div dir="rtl" className="min-h-screen px-3 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* سربرگ */}
        <header className="mb-4 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-right">
          <div className="flex items-center gap-3">
            <div className="animate-float text-5xl">🔺</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-l from-indigo-600 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
                آزمایشگاه مثلث‌ها
              </h1>
              <p className="text-sm font-bold text-indigo-500">
                حدس بزن ← شکل را عوض کن ← ببین ← کشف کن!
              </p>
            </div>
          </div>
          <div className="hidden sm:flex gap-2 text-xs font-bold text-gray-500">
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">🔴 A</span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">🔵 B</span>
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">🟢 C</span>
          </div>
        </header>

        {/* نوار حالت‌ها */}
        <nav className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 rounded-2xl border-4 px-3 py-3 text-sm sm:text-base font-black transition-all active:scale-95 ${
                tab === t.id ? `${t.active} scale-[1.03]` : `${t.color} hover:scale-[1.02]`
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <main key={tab} className="animate-fade-up">
          {tab === "explore" && <ExploreMode />}
          {tab === "build" && <BuildMode />}
          {tab === "challenge" && <ChallengeMode />}
          {tab === "compare" && <CompareMode />}
        </main>

        <footer className="mt-6 text-center text-xs font-bold text-indigo-400">
          هر خانه‌ی شبکه = ۱ سانتی‌متر • با جابه‌جا کردن نقطه‌ها همه‌چیز زنده عوض می‌شود ✨
        </footer>
      </div>
    </div>
  );
}
