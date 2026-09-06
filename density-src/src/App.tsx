import { useEffect, useState } from "react";
import { LabProvider, useLab } from "./store";
import { ToastLayer, Modal, Btn } from "./components/ui";
import { Lab } from "./components/Lab";
import { Pressure } from "./components/Pressure";
import { Boat } from "./components/Boat";
import { Missions } from "./components/Missions";
import { Notebook } from "./components/Notebook";
import { MISSIONS, DISCOVERIES } from "./missions";
import { fmt } from "./data";

const TABS = [
  { id: "lab", label: "آزمایشگاه آزاد", emoji: "🧪" },
  { id: "pressure", label: "فشار آب", emoji: "💦" },
  { id: "boat", label: "قایق بساز", emoji: "⛵" },
  { id: "missions", label: "مأموریت‌ها", emoji: "🎯" },
  { id: "notebook", label: "دفترچه کشف", emoji: "📒" },
];

function Shell() {
  const { state, dispatch, award } = useLab();
  const [tab, setTab] = useState("lab");
  const [intro, setIntro] = useState(() => !localStorage.getItem("density-lab-intro"));

  // پاداش خودکار مأموریت‌ها و کشف‌ها
  useEffect(() => {
    for (const m of MISSIONS) {
      if (!state.claimedMissions.includes(m.id) && m.check(state).done) {
        dispatch({ type: "claimMission", id: m.id });
        award(m.stars, `مأموریت انجام شد! نشان «${m.badge}» 🏅`);
        return;
      }
    }
    for (const d of DISCOVERIES) {
      if (!state.claimedDiscoveries.includes(d.id) && d.check(state)) {
        dispatch({ type: "claimDiscovery", id: d.id });
        award(2, `یک رابطه علمی کشف کردی! ${d.emoji} به دفترچه نگاه کن.`);
        return;
      }
    }
  }, [state, dispatch, award]);

  const missionsDone = MISSIONS.filter((m) => m.check(state).done).length;

  return (
    <div className="min-h-screen pb-24" style={{ background: "radial-gradient(1200px 600px at 80% -10%, #dbeafe 0%, transparent 60%), radial-gradient(800px 500px at 0% 100%, #fef3c7 0%, transparent 55%), #eaf6ff" }}>
      {/* هدر */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-3">
          <div className="text-3xl">🧑‍🔬</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-black text-sky-900 truncate">آزمایشگاه فشار، چگالی و شناوری</h1>
            <div className="text-[11px] text-slate-500 hidden sm:block">حدس بزن ← آزمایش کن ← مشاهده کن ← مقایسه کن ← تغییر بده ← دوباره آزمایش کن ← کشف کن</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 border border-amber-300 rounded-2xl px-3 py-1 font-black text-amber-900 flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span>{fmt(state.stars, 0)}</span>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-2xl px-3 py-1 font-black text-green-900 hidden sm:flex items-center gap-1">
              <span>🏅</span>
              <span>{fmt(missionsDone, 0)}/{fmt(MISSIONS.length, 0)}</span>
            </div>
            <button onClick={() => setIntro(true)} className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-black hover:bg-sky-200" title="راهنما">؟</button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-3 pb-2 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-1 transition ${tab === t.id ? "bg-sky-500 text-white shadow-md" : "bg-sky-50 text-sky-800 hover:bg-sky-100"}`}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4">
        <div className={tab === "lab" ? "" : "hidden"}>
          <Lab />
        </div>
        {tab === "pressure" && <Pressure />}
        {tab === "boat" && <Boat />}
        {tab === "missions" && <Missions goTo={setTab} />}
        {tab === "notebook" && <Notebook />}
      </main>

      <ToastLayer />

      <Modal open={intro} onClose={() => { setIntro(false); localStorage.setItem("density-lab-intro", "1"); }}>
        <div className="text-center">
          <div className="text-5xl mb-2">🧑‍🔬💧</div>
          <h2 className="text-xl font-black text-sky-900 mb-2">سلام دانشمند کوچولو!</h2>
          <p className="text-sm text-slate-600 leading-7">
            اینجا آزمایشگاه توست. اجسام را بگیر و در آب بینداز، حدس بزن چه می‌شود، و خودت کشف کن که چرا بعضی چیزها شناور می‌مانند و بعضی فرو می‌روند.
          </p>
          <div className="grid grid-cols-3 gap-2 my-3 text-xs font-bold">
            <div className="bg-green-50 rounded-2xl p-2">🤔<br />اول حدس بزن</div>
            <div className="bg-sky-50 rounded-2xl p-2">💧<br />بعد آزمایش کن</div>
            <div className="bg-amber-50 rounded-2xl p-2">💡<br />و کشف کن!</div>
          </div>
          <div className="text-xs text-slate-500 mb-3">با هر حدس درست، آزمایش و مأموریت ⭐ می‌گیری.</div>
          <Btn size="lg" onClick={() => { setIntro(false); localStorage.setItem("density-lab-intro", "1"); }}>شروع کنیم! 🚀</Btn>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <LabProvider>
      <Shell />
    </LabProvider>
  );
}
