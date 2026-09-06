import { useCallback, useEffect, useRef, useState } from "react";
import SolarCanvas from "./components/SolarCanvas";
import TimeControls from "./components/TimeControls";
import PlanetCard from "./components/PlanetCard";
import DayNightView from "./components/DayNightView";
import SeasonsView from "./components/SeasonsView";
import { BuildPanel, DistanceLabPanel, FreePanel, SpeedLabPanel } from "./components/panels";
import { FindGamePanel, MissionsPanel, MISSIONS, RacePanel } from "./components/games";
import { Simulation } from "./sim/Simulation";
import { fa } from "./data/planets";
import { cn } from "./utils/cn";

type Mode = "free" | "speed" | "distance" | "build" | "find" | "race" | "daynight" | "seasons" | "missions";

const TABS: { id: Mode; label: string; emoji: string; color: string }[] = [
  { id: "free", label: "آزمایش آزاد", emoji: "🔬", color: "from-sky-500 to-blue-600" },
  { id: "speed", label: "آزمایش سرعت", emoji: "🧪", color: "from-emerald-500 to-teal-600" },
  { id: "distance", label: "آزمایش فاصله", emoji: "📏", color: "from-indigo-500 to-violet-600" },
  { id: "build", label: "سیاره بساز", emoji: "🪐", color: "from-pink-500 to-rose-600" },
  { id: "find", label: "سیاره را پیدا کن", emoji: "🔍", color: "from-violet-500 to-purple-600" },
  { id: "race", label: "مسابقه", emoji: "🏁", color: "from-green-500 to-lime-600" },
  { id: "daynight", label: "شب و روز", emoji: "🌗", color: "from-slate-500 to-indigo-700" },
  { id: "seasons", label: "فصل‌ها", emoji: "🍂", color: "from-orange-500 to-amber-600" },
  { id: "missions", label: "مأموریت‌ها", emoji: "🏆", color: "from-yellow-400 to-orange-500" },
];

const LS_KEY = "solar-lab-progress-v1";

function loadProgress(): { missions: Record<string, boolean>; score: number } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { missions: {}, score: 0 };
}

export default function App() {
  const simRef = useRef<Simulation | null>(null);
  if (!simRef.current) simRef.current = new Simulation();
  const sim = simRef.current;

  const [mode, setMode] = useState<Mode>("free");
  const [playing, setPlaying] = useState(true);
  const [multiplier, setMultiplier] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clickNonce, setClickNonce] = useState(0);
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(loadProgress);
  const [raceIds, setRaceIds] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const lastTickRef = useRef(0);
  const earthTravelRef = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  }, [progress]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const completeMission = useCallback(
    (id: string) => {
      setProgress((p) => {
        if (p.missions[id]) return p;
        const m = MISSIONS.find((x) => x.id === id);
        showToast(`⭐ مأموریت انجام شد: ${m?.title ?? ""} (+۲۰ امتیاز)`);
        const missions = { ...p.missions, [id]: true };
        const allDone = MISSIONS.every((x) => missions[x.id]);
        if (allDone) window.setTimeout(() => showToast("🏅 همه‌ی مأموریت‌ها کامل شد! نشان «فضانورد کوچک» گرفتی!"), 3400);
        return { missions, score: p.score + 20 };
      });
    },
    [showToast]
  );

  const addScore = useCallback((d: number) => setProgress((p) => ({ ...p, score: p.score + d })), []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setClickNonce((n) => n + 1);
  }, []);

  // مأموریت ۳: مشاهده‌ی یک سال زمین
  useEffect(() => {
    if (selectedId === "earth") {
      earthTravelRef.current = sim.get("earth")?.travelled ?? 0;
    } else {
      earthTravelRef.current = null;
    }
  }, [selectedId, sim]);

  const onFrame = useCallback(
    (s: Simulation) => {
      const now = performance.now();
      if (now - lastTickRef.current > 125) {
        lastTickRef.current = now;
        setTick((t) => t + 1);
      }
      if (earthTravelRef.current !== null) {
        const e = s.get("earth");
        if (e) {
          if (e.travelled < earthTravelRef.current) earthTravelRef.current = e.travelled;
          if (e.travelled - earthTravelRef.current >= Math.PI * 2) {
            earthTravelRef.current = null;
            completeMission("m3");
          }
        }
      }
    },
    [completeMission]
  );

  const ensurePlaying = useCallback(() => setPlaying(true), []);

  const handleReset = () => {
    sim.reset();
    setSelectedId(null);
    setMultiplier(1);
    setPlaying(true);
    setRaceIds(null);
  };

  const goMode = (m: Mode) => {
    if (m !== "race") setRaceIds(null);
    setMode(m);
    if (m === "free" && !progress.missions.m3) setSelectedId("earth");
  };

  const onLaunched = useCallback(
    (id: string) => {
      setSelectedId(id);
      completeMission("m4");
    },
    [completeMission]
  );

  const onDayNightDone = useCallback(() => completeMission("m5"), [completeMission]);
  const onSeasonsDone = useCallback(() => completeMission("m6"), [completeMission]);
  const onRaceIds = useCallback((ids: string[] | null) => setRaceIds(ids), []);

  const selectedBody = selectedId ? sim.get(selectedId) : undefined;
  const isSimMode = mode !== "daynight" && mode !== "seasons";
  const doneCount = MISSIONS.filter((m) => progress.missions[m.id]).length;

  return (
    <div className="h-full flex flex-col space-bg text-white" dir="rtl">
      {/* هدر */}
      <header className="shrink-0 px-3 pt-2 pb-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <span className="text-3xl animate-float inline-block">🚀</span>
            آزمایشگاه مجازی منظومه شمسی
          </h1>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-yellow-950 rounded-2xl px-3 py-1 font-black">⭐ {fa(progress.score)}</div>
            <button onClick={() => goMode("missions")} className="bg-white/10 hover:bg-white/20 rounded-2xl px-3 py-1 font-bold">
              🏆 {fa(doneCount)}/{fa(MISSIONS.length)}
            </button>
            <button onClick={() => setShowIntro(true)} className="bg-white/10 hover:bg-white/20 rounded-2xl px-3 py-1 font-bold">
              ❓ راهنما
            </button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto scrollbar-thin py-2 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => goMode(t.id)}
              className={cn(
                "shrink-0 rounded-2xl px-3 py-2 font-bold text-sm sm:text-base border transition-all flex items-center gap-1.5",
                mode === t.id ? `bg-gradient-to-l ${t.color} border-white/60 shadow-lg scale-105` : "bg-white/8 border-white/10 hover:bg-white/15"
              )}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* بدنه */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 px-2 pb-2">
        <aside className="glass rounded-3xl md:w-[360px] lg:w-[380px] shrink-0 overflow-y-auto scrollbar-thin p-4 order-2 md:order-1 max-h-[45vh] md:max-h-none">
          {mode === "free" && <FreePanel sim={sim} selectedId={selectedId} onSelect={handleSelect} tick={tick} />}
          {mode === "speed" && <SpeedLabPanel sim={sim} selectedId={selectedId} onSelect={handleSelect} tick={tick} onEnsurePlaying={ensurePlaying} />}
          {mode === "distance" && <DistanceLabPanel sim={sim} selectedId={selectedId} onSelect={handleSelect} tick={tick} onEnsurePlaying={ensurePlaying} />}
          {mode === "build" && <BuildPanel sim={sim} onLaunched={onLaunched} tick={tick} onEnsurePlaying={ensurePlaying} />}
          {mode === "find" && <FindGamePanel clickedId={selectedId} clickNonce={clickNonce} score={progress.score} onScore={addScore} onMission={completeMission} />}
          {mode === "race" && <RacePanel sim={sim} tick={tick} onRaceIds={onRaceIds} onSetMultiplier={setMultiplier} onEnsurePlaying={ensurePlaying} />}
          {mode === "missions" && (
            <MissionsPanel
              done={progress.missions}
              score={progress.score}
              onGo={(m) => goMode(m as Mode)}
              onResetAll={() => setProgress({ missions: {}, score: 0 })}
            />
          )}
          {mode === "daynight" && (
            <div>
              <h2 className="text-xl font-black mb-2">🌍 شب و روز</h2>
              <p className="text-sm leading-7 bg-white/10 rounded-2xl p-3">
                زمین مثل یک فرفره به دور خودش می‌چرخد. نیمه‌ای که رو به خورشید است <b className="text-yellow-200">روز</b> و نیمه‌ی پشت به خورشید{" "}
                <b className="text-indigo-200">شب</b> است.
                <br />
                📍 به نشانگر «ما» نگاه کن: وقتی به سمت خورشید می‌رسد روز و وقتی به سایه می‌رود شب می‌شود!
              </p>
              <ul className="text-sm mt-3 space-y-2">
                <li className="bg-white/10 rounded-xl p-2">🔄 یک دور کامل چرخش = یک شبانه‌روز = ۲۴ ساعت</li>
                <li className="bg-white/10 rounded-xl p-2">☀️ ظهر: وقتی ما دقیقاً رو به خورشید هستیم</li>
                <li className="bg-white/10 rounded-xl p-2">🌙 نیمه‌شب: وقتی ما دقیقاً پشت به خورشید هستیم</li>
                <li className="bg-white/10 rounded-xl p-2">🌍 زمین هم‌زمان به دور خودش و به دور خورشید حرکت می‌کند!</li>
              </ul>
              <button onClick={() => goMode("seasons")} className="big-btn w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-white">
                🍂 برو به فصل‌ها
              </button>
              <button onClick={() => goMode("free")} className="big-btn w-full mt-2 bg-white/10 hover:bg-white/20">
                🔭 بازگشت به منظومه
              </button>
            </div>
          )}
          {mode === "seasons" && (
            <div>
              <h2 className="text-xl font-black mb-2">🌱☀️🍂❄️ فصل‌ها</h2>
              <p className="text-sm leading-7 bg-white/10 rounded-2xl p-3">
                محور زمین (خط قرمز) کمی کج است و همیشه به یک سمت اشاره می‌کند. وقتی زمین به دور خورشید می‌گردد، گاهی نیمکره‌ی شمالی به سمت خورشید خم است (
                <b className="text-yellow-200">تابستان</b>) و گاهی دور از آن (<b className="text-sky-200">زمستان</b>).
              </p>
              <ul className="text-sm mt-3 space-y-2">
                <li className="bg-white/10 rounded-xl p-2">☀️ تابستان: نور مستقیم‌تر، روزهای بلندتر، هوای گرم‌تر</li>
                <li className="bg-white/10 rounded-xl p-2">❄️ زمستان: نور مایل‌تر، روزهای کوتاه‌تر، هوای سردتر</li>
                <li className="bg-white/10 rounded-xl p-2">🌱🍂 بهار و پاییز: نور تقریباً برابر به دو نیمکره</li>
                <li className="bg-white/10 rounded-xl p-2">🔁 یک دور کامل به دور خورشید = یک سال = چهار فصل</li>
                <li className="bg-white/10 rounded-xl p-2">💡 وقتی در ایران تابستان است، در استرالیا زمستان است!</li>
              </ul>
              <button onClick={() => goMode("daynight")} className="big-btn w-full mt-3 bg-indigo-500 hover:bg-indigo-400 text-white">
                🌗 برو به شب و روز
              </button>
              <button onClick={() => goMode("free")} className="big-btn w-full mt-2 bg-white/10 hover:bg-white/20">
                🔭 بازگشت به منظومه
              </button>
            </div>
          )}
        </aside>

        <section className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-[#04061a] min-h-[45vh] order-1 md:order-2">
          {isSimMode ? (
            <>
              <SolarCanvas
                sim={sim}
                playing={playing}
                daysPerSecond={30 * multiplier}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFrame={onFrame}
                highlightIds={raceIds ?? undefined}
                showStartLine={!!raceIds}
                focusId={mode === "speed" || mode === "distance" ? (selectedBody && !selectedBody.isCustom ? selectedBody.id : "earth") : null}
              />
              {selectedId && (
                <div className="absolute top-3 left-3 z-10">
                  <PlanetCard
                    id={selectedId}
                    body={selectedBody}
                    onClose={() => setSelectedId(null)}
                    onDayNight={() => goMode("daynight")}
                    onSeasons={() => goMode("seasons")}
                    onRemoveCustom={(id) => {
                      sim.removeCustom(id);
                      setSelectedId(null);
                    }}
                  />
                </div>
              )}
              <div className="absolute top-3 right-3 z-10 text-[11px] text-sky-200/80 bg-black/40 rounded-xl px-2 py-1 max-w-[220px] leading-5 hidden sm:block">
                📐 اندازه‌ها و فاصله‌ها نمایشی هستند تا همه‌ی سیارات را یک‌جا ببینیم.
              </div>
              {!selectedId && mode === "free" && (
                <div className="absolute top-3 left-3 z-10 text-sm bg-black/40 rounded-xl px-3 py-2 animate-pop">👆 روی یک سیاره کلیک کن!</div>
              )}
              <div className="absolute bottom-3 inset-x-3 z-10 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <TimeControls
                    playing={playing}
                    multiplier={multiplier}
                    days={sim.time}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onMultiplier={setMultiplier}
                    onReset={handleReset}
                  />
                </div>
              </div>
            </>
          ) : mode === "daynight" ? (
            <DayNightView onComplete={onDayNightDone} />
          ) : (
            <SeasonsView onComplete={onSeasonsDone} />
          )}
        </section>
      </main>

      {/* اعلان */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-l from-yellow-400 to-orange-400 text-yellow-950 font-black rounded-2xl px-5 py-3 shadow-2xl animate-pop text-center max-w-[90vw]">
          {toast}
        </div>
      )}

      {/* خوش‌آمدگویی */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowIntro(false)}>
          <div className="glass rounded-3xl p-6 max-w-lg w-full animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl text-center animate-float">🌞🪐🌍</div>
            <h2 className="text-2xl font-black text-center mt-2">به آزمایشگاه منظومه شمسی خوش آمدی!</h2>
            <p className="text-center text-white/80 mt-1">اینجا می‌توانی سیاره‌ها را ببینی، آزمایش کنی و بازی کنی.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="bg-white/10 rounded-xl p-2">👆 روی هر سیاره کلیک کن تا اطلاعاتش را ببینی.</li>
              <li className="bg-white/10 rounded-xl p-2">🤔 اول حدس بزن ← 🎛 چیزی را تغییر بده ← 👀 نتیجه را ببین ← ⚖️ با قبل مقایسه کن!</li>
              <li className="bg-white/10 rounded-xl p-2">🏆 مأموریت‌ها را انجام بده و ستاره جمع کن.</li>
              <li className="bg-white/10 rounded-xl p-2 text-xs text-sky-200">📐 در این مدل، اندازه و فاصله سیارات برای اینکه بتوانیم همه‌ی آن‌ها را روی صفحه ببینیم، به‌صورت نمایشی کوچک شده‌اند.</li>
            </ul>
            <button onClick={() => setShowIntro(false)} className="big-btn w-full mt-4 text-xl bg-gradient-to-l from-green-500 to-emerald-600 text-white">
              🚀 شروع کنیم!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
