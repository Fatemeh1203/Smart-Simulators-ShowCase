import { useEffect, useState } from "react";
import { DiscoveryToast } from "./components/Notebook";
import Notebook from "./components/Notebook";
import { ScoreBadge } from "./components/ui";
import { DISCOVERIES, StoreProvider, useStore } from "./lab/store";
import CompareLab from "./pages/CompareLab";
import FreeLab from "./pages/FreeLab";
import Home from "./pages/Home";
import LensLab from "./pages/LensLab";
import MirrorLab from "./pages/MirrorLab";
import Missions from "./pages/Missions";
import TargetGame from "./pages/TargetGame";
import WaterLab from "./pages/WaterLab";
import { fa } from "./lab/format";

export type Page = "home" | "free" | "mirror" | "lens" | "water" | "compare" | "game" | "missions" | "notebook";

const NAV: { page: Page; emoji: string; label: string }[] = [
  { page: "home", emoji: "🏠", label: "خانه" },
  { page: "free", emoji: "🔬", label: "آزمایش آزاد" },
  { page: "mirror", emoji: "🪞", label: "آینه" },
  { page: "lens", emoji: "🔍", label: "عدسی" },
  { page: "water", emoji: "💧", label: "آب" },
  { page: "compare", emoji: "⚖️", label: "مقایسه" },
  { page: "game", emoji: "🎯", label: "بازی" },
  { page: "missions", emoji: "🏆", label: "ماموریت" },
  { page: "notebook", emoji: "📖", label: "دفترچه" },
];

function NotebookPage() {
  const { discoveries, resetAll } = useStore();
  const total = Object.keys(DISCOVERIES).length;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-4xl">📖</span>
        <div>
          <h1 className="text-3xl font-black text-slate-800">دفترچه کشف‌های علمی من</h1>
          <p className="text-sm font-bold text-slate-500">
            {discoveries.length === total ? "همه چیز را کشف کردی! تو یک دانشمند واقعی هستی! 🧑‍🔬" : `${fa(total - discoveries.length)} کشف دیگر مانده. برو آزمایش کن!`}
          </p>
        </div>
      </div>
      <Notebook />
      <div className="mt-6 rounded-3xl border-4 border-white bg-white/70 p-4">
        <h3 className="mb-2 text-lg font-black text-slate-700">🗣️ حالا خودت با زبان ساده بگو:</h3>
        <ul className="space-y-1 text-base font-bold text-slate-600">
          <li>✅ «نور می‌تواند بازتاب شود.»</li>
          <li>✅ «آینه مسیر نور را تغییر می‌دهد.»</li>
          <li>✅ «زاویه برخورد نور روی مسیر بازتاب آن اثر دارد.»</li>
          <li>✅ «نور هنگام عبور از بعضی مواد می‌تواند مسیرش را تغییر دهد.»</li>
        </ul>
      </div>
      <button type="button" onClick={() => { if (confirm("همه پیشرفت‌ها پاک شود؟")) resetAll(); }} className="mt-6 text-xs font-bold text-slate-400 underline">
        پاک کردن همه پیشرفت‌ها
      </button>
    </div>
  );
}

function Shell() {
  const [page, setPage] = useState<Page>("home");
  const { score } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_20%_10%,#fde68a_0,transparent_35%),radial-gradient(circle_at_80%_90%,#bae6fd_0,transparent_35%),#fef6e4]">
      <header className="sticky top-0 z-40 border-b-4 border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-3 py-2">
          <button type="button" onClick={() => setPage("home")} className="flex items-center gap-2 text-xl font-black text-indigo-700">
            <span className="wiggle inline-block text-2xl">🔦</span> آزمایشگاه نور
          </button>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto pb-1 md:order-2 md:mr-4 md:w-auto md:flex-1">
            {NAV.map((n) => (
              <button
                key={n.page}
                type="button"
                onClick={() => setPage(n.page)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-black transition ${page === n.page ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-indigo-100"}`}
              >
                <span>{n.emoji}</span>
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="order-2 mr-auto md:order-3">
            <ScoreBadge score={score} />
          </div>
        </div>
      </header>

      <main className="pt-4">
        {page === "home" && <Home go={setPage} />}
        {page === "free" && <FreeLab />}
        {page === "mirror" && <MirrorLab />}
        {page === "lens" && <LensLab />}
        {page === "water" && <WaterLab />}
        {page === "compare" && <CompareLab />}
        {page === "game" && <TargetGame />}
        {page === "missions" && <Missions />}
        {page === "notebook" && <NotebookPage />}
      </main>
      <DiscoveryToast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
