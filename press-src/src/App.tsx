import { useState } from "react";
import { SettingsCtx, Settings } from "./components/StationLayout";
import { Btn, Toggle } from "./components/ui";
import Solids from "./stations/Solids";
import Liquids from "./stations/Liquids";
import AllDirections from "./stations/AllDirections";
import Pascal from "./stations/Pascal";
import Manometer from "./stations/Manometer";
import Barometer from "./stations/Barometer";
import Archimedes from "./stations/Archimedes";
import Bernoulli from "./stations/Bernoulli";
import Explore from "./modes/Explore";
import Challenges from "./modes/Challenges";

const NAV = [
  { id: "s1", icon: "🧱", t: "فشار در جامدات", C: Solids },
  { id: "s2", icon: "🌊", t: "فشار در مایعات", C: Liquids },
  { id: "s3", icon: "🔮", t: "فشار در همه جهت‌ها", C: AllDirections },
  { id: "s4", icon: "🏗️", t: "اصل پاسکال و جک", C: Pascal },
  { id: "s5", icon: "🧪", t: "مانومتر U شکل", C: Manometer },
  { id: "s6", icon: "🌡️", t: "بارومتر و فشار مطلق", C: Barometer },
  { id: "s7", icon: "🚢", t: "ارشمیدس و شناوری", C: Archimedes },
  { id: "s8", icon: "💨", t: "اصل برنولی", C: Bernoulli },
];
const MODES = [
  { id: "explore", icon: "🔍", t: "حالت کشف کن", C: Explore },
  { id: "challenge", icon: "🏁", t: "چالش آزمایشگاه", C: Challenges },
];

export default function App() {
  const [active, setActive] = useState("s1");
  const [settings, setSettings] = useState<Settings>({ paused: false, slow: false, showVectors: true, showData: true, showFormula: true, explore: false });
  const set = (k: keyof Settings, v: boolean) => setSettings((s) => ({ ...s, [k]: v }));
  const all = [...NAV, ...MODES];
  const cur = all.find((n) => n.id === active)!;
  const Comp = cur.C;
  const idx = NAV.findIndex((n) => n.id === active);

  return (
    <SettingsCtx.Provider value={settings}>
      <div className="min-h-screen text-slate-100" style={{ background: "radial-gradient(1200px 600px at 80% -10%, rgba(99,102,241,.18), transparent), radial-gradient(900px 500px at -10% 30%, rgba(34,211,238,.12), transparent), #070b16" }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[#070b16]/80 border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-3 py-2 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">⚗️</div>
              <div>
                <div className="font-extrabold text-base leading-5">آزمایشگاه مجازی فشار</div>
                <div className="text-[11px] text-slate-400">فیزیک دهم — فشار و ویژگی‌های فیزیکی مواد</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mr-auto">
              <Btn small tone={settings.paused ? "emerald" : "amber"} onClick={() => set("paused", !settings.paused)}>{settings.paused ? "▶ شروع" : "⏸ توقف"}</Btn>
              <Btn small tone="violet" active={settings.slow} onClick={() => set("slow", !settings.slow)}>🐢 آهسته</Btn>
              <div className="hidden sm:flex items-center gap-3 glass px-2 py-1">
                <Toggle label="فرمول" on={settings.showFormula} onChange={(v) => set("showFormula", v)} />
                <Toggle label="بردارها" on={settings.showVectors} onChange={(v) => set("showVectors", v)} />
                <Toggle label="داده‌ها" on={settings.showData} onChange={(v) => set("showData", v)} />
              </div>
              <Btn small tone="rose" active={settings.explore} onClick={() => set("explore", !settings.explore)}>🔒 فرمول مخفی (کشف)</Btn>
            </div>
          </div>
          <div className="sm:hidden px-3 pb-2 flex items-center gap-3">
            <Toggle label="فرمول" on={settings.showFormula} onChange={(v) => set("showFormula", v)} />
            <Toggle label="بردارها" on={settings.showVectors} onChange={(v) => set("showVectors", v)} />
            <Toggle label="داده‌ها" on={settings.showData} onChange={(v) => set("showData", v)} />
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-3 py-3 grid grid-cols-1 xl:grid-cols-[230px_1fr] gap-3">
          {/* Sidebar nav */}
          <aside className="xl:sticky xl:top-[64px] xl:self-start">
            <div className="panel p-2 flex xl:flex-col gap-1 overflow-x-auto scrollbar-thin">
              <div className="hidden xl:block text-[11px] text-slate-400 px-2 pt-1 pb-1">ایستگاه‌های آزمایش</div>
              {NAV.map((n, i) => (
                <button key={n.id} onClick={() => setActive(n.id)} className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-right transition-all ${active === n.id ? "bg-gradient-to-l from-cyan-500/25 to-violet-500/20 text-white border border-cyan-400/40" : "text-slate-300 hover:bg-white/5 border border-transparent"}`}>
                  <span className="text-lg">{n.icon}</span><span className="whitespace-nowrap"><span className="text-[10px] text-slate-400 ml-1">{i + 1}</span>{n.t}</span>
                </button>
              ))}
              <div className="hidden xl:block text-[11px] text-slate-400 px-2 pt-3 pb-1">حالت‌های ویژه</div>
              {MODES.map((n) => (
                <button key={n.id} onClick={() => setActive(n.id)} className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-right transition-all ${active === n.id ? "bg-gradient-to-l from-amber-500/25 to-rose-500/20 text-white border border-amber-400/40" : "text-slate-300 hover:bg-white/5 border border-transparent"}`}>
                  <span className="text-lg">{n.icon}</span><span className="whitespace-nowrap">{n.t}</span>
                </button>
              ))}
            </div>
            <div className="hidden xl:block panel p-3 mt-3 text-[11px] text-slate-400 leading-6">
              <div className="text-slate-300 font-semibold mb-1">چرخه‌ی یادگیری</div>
              پارامتر را تغییر بده → پدیده را ببین → داده جمع کن → نمودار را بخوان → الگو را کشف کن → تعریف را بفهم → فرمول را استخراج کن.
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            <Comp key={active} />
            {idx >= 0 && (
              <div className="flex justify-between mt-3">
                <Btn tone="slate" onClick={() => idx > 0 && setActive(NAV[idx - 1].id)} className={idx === 0 ? "opacity-30" : ""}>→ ایستگاه قبلی</Btn>
                {idx < NAV.length - 1 ? <Btn tone="cyan" onClick={() => setActive(NAV[idx + 1].id)}>ایستگاه بعدی ←</Btn> : <Btn tone="amber" onClick={() => setActive("explore")}>🔍 برو به حالت کشف کن</Btn>}
              </div>
            )}
            <footer className="text-center text-[11px] text-slate-500 py-6">همه‌ی کمیت‌ها در یکاهای SI — Pa = N/m² ، ۱ atm = 101325 Pa = 760 mmHg</footer>
          </main>
        </div>
      </div>
    </SettingsCtx.Provider>
  );
}
