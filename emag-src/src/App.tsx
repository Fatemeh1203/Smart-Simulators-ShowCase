import { useMemo, useState } from "react";
import { Home } from "./components/Home";
import { LEVELS } from "./data/constants";
import { LABS, getLab } from "./data/labsMeta";
import ChallengesLab from "./labs/ChallengesLab";

type View = "home" | "challenges" | string;

export default function App() {
  const [view, setView] = useState<View>("home");
  const [navOpen, setNavOpen] = useState(false);

  const activeLab = useMemo(() => (view !== "home" && view !== "challenges" ? getLab(view) : undefined), [view]);

  function navigate(id: string) {
    setView(id);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-30 w-72 transform overflow-y-auto border-l border-slate-800 bg-slate-950/95 p-4 transition-transform lg:static lg:translate-x-0 ${
            navOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <button onClick={() => navigate("home")} className="mb-4 flex w-full items-center gap-2 rounded-xl bg-gradient-to-l from-sky-600 to-indigo-600 px-3 py-3 text-right shadow">
            <span className="text-xl">⚡</span>
            <span className="text-sm font-extrabold text-white">آزمایشگاه الکترومغناطیس</span>
          </button>

          <nav className="space-y-4 text-sm">
            <div>
              <button
                onClick={() => navigate("challenges")}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-right text-xs font-bold ${
                  view === "challenges" ? "bg-indigo-500 text-white" : "bg-slate-800/70 text-slate-200 hover:bg-slate-800"
                }`}
              >
                🏆 حالت چالش
              </button>
              <button
                onClick={() => navigate("free")}
                className={`w-full rounded-lg px-3 py-2 text-right text-xs font-bold ${
                  view === "free" ? "bg-indigo-500 text-white" : "bg-slate-800/70 text-slate-200 hover:bg-slate-800"
                }`}
              >
                🧪 آزمایش آزاد
              </button>
            </div>

            {LEVELS.map((lvl) => (
              <div key={lvl.id}>
                <p className="mb-1 px-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{lvl.title}</p>
                <div className="space-y-1">
                  {lvl.labs.map((id) => {
                    const lab = getLab(id);
                    if (!lab) return null;
                    const active = view === id;
                    return (
                      <button
                        key={id}
                        onClick={() => navigate(id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-xs font-semibold transition ${
                          active ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span>{lab.icon}</span>
                        <span>{lab.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {navOpen && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} />}

        {/* Main */}
        <div className="min-h-screen flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0b1020]/90 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => navigate("home")} className="text-sm font-extrabold text-white">
              ⚡ آزمایشگاه الکترومغناطیس
            </button>
            <button onClick={() => setNavOpen(true)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200">
              ☰ فهرست آزمایشگاه‌ها
            </button>
          </header>

          <main className="p-4 sm:p-6">
            {view === "home" && <Home onNavigate={navigate} />}
            {view === "challenges" && <ChallengesLab />}
            {activeLab && (
              <div>
                <button onClick={() => navigate("home")} className="mb-4 inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                  ← بازگشت به خانه
                </button>
                <activeLab.component />
              </div>
            )}
            {!activeLab && view !== "home" && view !== "challenges" && LABS.length > 0 && (
              <p className="text-slate-400">آزمایشگاه پیدا نشد.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
