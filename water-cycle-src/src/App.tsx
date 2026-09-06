import { useCallback, useState } from "react";
import Scene from "./components/Scene";
import ControlPanel from "./components/ControlPanel";
import LiveData from "./components/LiveData";
import StageBar from "./components/StageBar";
import TeachingPanel from "./components/TeachingPanel";
import ExperimentsPanel from "./components/ExperimentsPanel";
import ChallengePanel from "./components/ChallengePanel";
import {
  computeRates,
  DEFAULT_PARAMS,
  INITIAL_STATE,
  dominantStage,
  stageActivity,
  type Params,
  type Rates,
  type SimState,
  type StageId,
} from "./model/waterCycle";
import { cn } from "./utils/cn";

type Tab = "control" | "teach" | "experiment" | "challenge";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "control", label: "کنترل", icon: "🎛️" },
  { id: "teach", label: "حالت آموزشی", icon: "👩‍🏫" },
  { id: "experiment", label: "آزمایش کن!", icon: "🧪" },
  { id: "challenge", label: "چالش", icon: "🎯" },
];

export default function App() {
  const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS });
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [highlight, setHighlight] = useState<StageId | null>(null);
  const [teaching, setTeaching] = useState(false);
  const [tab, setTab] = useState<Tab>("control");
  const [resetToken, setResetToken] = useState(0);
  const [rates, setRates] = useState<Rates>(() => computeRates(DEFAULT_PARAMS, INITIAL_STATE));
  const [simTime, setSimTime] = useState(0);

  const onStats = useCallback((r: Rates, s: SimState) => {
    setRates(r);
    setSimTime(s.time);
  }, []);

  const updateParams = useCallback((p: Partial<Params>) => {
    setParams((prev) => ({ ...prev, ...p }));
  }, []);

  const applyParams = useCallback((p: Partial<Params>, start?: boolean) => {
    setParams((prev) => ({ ...prev, ...p }));
    if (start) setRunning(true);
  }, []);

  const reset = () => {
    setParams({ ...DEFAULT_PARAMS });
    setSpeed(1);
    setRunning(true);
    setHighlight(null);
    setTeaching(false);
    setResetToken((t) => t + 1);
  };

  const activity = stageActivity(rates);
  const dominant = dominantStage(rates);

  const setFocus = (id: StageId | null) => setHighlight(id);
  const toggleTeaching = (on: boolean) => {
    setTeaching(on);
    if (!on) setHighlight(null);
  };

  const mm = Math.floor(simTime / 60);
  const ss = Math.floor(simTime % 60);

  return (
    <div className="min-h-full bg-gradient-to-b from-sky-100 via-[#eef4fb] to-[#e6eef7]">
      {/* هدر */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white grid place-items-center text-2xl shadow">
              💧
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-tight">
                شبیه‌ساز تعاملی چرخه آب
                <span className="text-xs sm:text-sm font-semibold text-slate-400 mr-2" dir="ltr">
                  Water Cycle Simulator
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                متغیرها را تغییر بده و رابطه‌ی علت و معلولی چرخه آب را کشف کن
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold",
                running ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", running ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
              {running ? `در حال اجرا (${speed}x)` : "متوقف"}
            </span>
            <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-bold tabular-nums" dir="ltr">
              ⏱ {mm}:{ss.toString().padStart(2, "0")}
            </span>
            {teaching && (
              <span className="rounded-full bg-violet-100 text-violet-800 px-3 py-1 font-bold">حالت آموزشی</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* داده‌های زنده */}
        <LiveData params={params} rates={rates} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
          {/* صحنه + نوار مراحل */}
          <div className="space-y-4 min-w-0">
            <div className="relative">
              <Scene
                params={params}
                running={running}
                speed={speed}
                highlight={highlight}
                teaching={teaching}
                resetToken={resetToken}
                onStats={onStats}
              />
              {!running && (
                <button
                  onClick={() => setRunning(true)}
                  className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 text-white px-4 py-1.5 font-extrabold text-sm backdrop-blur-sm hover:bg-black/65 shadow"
                >
                  ⏸ متوقف شده — ▶ ادامه
                </button>
              )}
              {/* راهنمای رنگ */}
              <div className="absolute bottom-2 left-2 hidden md:flex gap-2 text-[10px] font-bold bg-white/80 backdrop-blur rounded-lg px-2 py-1 shadow">
                <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block" /> بخار</span>
                <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-sky-300 inline-block" /> قطره/تراکم</span>
                <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> باران/روان‌آب</span>
                <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-blue-600/60 inline-block" /> آب زیرزمینی</span>
              </div>
            </div>

            <StageBar activity={activity} dominant={dominant} selected={highlight} onSelect={setFocus} />

            {/* روابط علمی */}
            <details className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4 text-sm">
              <summary className="font-extrabold text-slate-800 cursor-pointer">📐 قوانین علمی مدل شبیه‌ساز</summary>
              <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700 list-disc pr-5 leading-relaxed">
                <li>افزایش انرژی خورشیدی ← افزایش تبخیر و تعرق</li>
                <li>افزایش دما ← افزایش ظرفیت هوا برای نگهداری بخار آب (تراکم دیرتر)</li>
                <li>افزایش رطوبت ← نزدیک‌تر شدن هوا به اشباع ← تراکم و تشکیل ابر سریع‌تر</li>
                <li>تراکم ابر بیش از آستانه‌ی شروع (۳۶ تا ۶۴٪؛ با رطوبت و احتمال بارش پایین‌تر می‌آید) ← آغاز بارش تا رقیق شدن ابر</li>
                <li>دمای ≤ ۱°C ← بارش به شکل برف؛ دمای ≤ ۰ ← یخ‌زدگی دریاچه و توقف تبخیر</li>
                <li>ارتفاع کوه ← دمای قله ≈ ۹ درجه سردتر ← برف در ارتفاعات</li>
                <li>پوشش گیاهی بیشتر ← نفوذ بیشتر و روان‌آب کمتر؛ خاک اشباع ← نفوذ کمتر</li>
                <li>باد ← جابه‌جایی ابرها و پراکندگی بخار و رطوبت</li>
              </ul>
            </details>
          </div>

          {/* پنل کناری */}
          <aside className="lg:sticky lg:top-[68px] rounded-2xl bg-slate-50 border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-4 border-b border-slate-200 bg-white">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "py-2.5 text-[11px] sm:text-xs font-extrabold flex flex-col items-center gap-0.5 transition border-b-2",
                    tab === t.id
                      ? "border-blue-600 text-blue-700 bg-blue-50"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-3 wc-scroll overflow-y-auto lg:max-h-[calc(100vh-130px)]">
              {tab === "control" && (
                <ControlPanel
                  params={params}
                  onChange={updateParams}
                  running={running}
                  speed={speed}
                  onStart={() => setRunning(true)}
                  onPause={() => setRunning(false)}
                  onReset={reset}
                  onSpeed={setSpeed}
                />
              )}
              {tab === "teach" && (
                <TeachingPanel enabled={teaching} focus={highlight} onToggle={toggleTeaching} onFocus={setFocus} />
              )}
              {tab === "experiment" && <ExperimentsPanel params={params} applyParams={applyParams} />}
              {tab === "challenge" && <ChallengePanel applyParams={applyParams} />}
            </div>
          </aside>
        </div>
      </main>

      <footer className="text-center text-[11px] text-slate-400 py-4">
        شبیه‌ساز آموزشی چرخه آب — مناسب تدریس در کلاس و یادگیری مستقل دانش‌آموزان
      </footer>
    </div>
  );
}
