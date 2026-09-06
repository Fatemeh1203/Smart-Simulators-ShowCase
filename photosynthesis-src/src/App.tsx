import { useCallback, useRef, useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import PlantScene from './components/PlantScene';
import ControlPanel from './components/ControlPanel';
import RateCard from './components/RateCard';
import LiveChart from './components/LiveChart';
import Equation from './components/Equation';
import Experiments, { EXPERIMENTS } from './components/Experiments';
import ChallengeMode, { type Mission } from './components/ChallengeMode';
import TeacherMode from './components/TeacherMode';
import CompareMode from './components/CompareMode';
import ChloroplastModal from './components/ChloroplastModal';
import type { Params } from './lib/model';

export default function App() {
  const sim = useSimulation();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showTeacher, setShowTeacher] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<number | null>(null);

  const expRef = useRef<HTMLDivElement | null>(null);
  const chRef = useRef<HTMLDivElement | null>(null);
  const teacherRef = useRef<HTMLDivElement | null>(null);
  const compareRef = useRef<HTMLDivElement | null>(null);
  const scrollTo = (r: React.RefObject<HTMLDivElement | null>) => setTimeout(() => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

  const locked = mission?.locked ?? [];
  const handleChange = useCallback(
    (patch: Partial<Params>) => {
      const filtered: Partial<Params> = {};
      (Object.keys(patch) as (keyof Params)[]).forEach((k) => {
        if (!locked.includes(k)) filtered[k] = patch[k];
      });
      sim.setParams(filtered);
    },
    [locked, sim],
  );

  const applyExperiment = (preset: Partial<Params>) => {
    setMission(null);
    sim.animateTo(preset, 900);
    if (!sim.running) sim.setRunning(true);
  };

  const nextExperiment = () => {
    const idx = activeExperiment ? EXPERIMENTS.findIndex((e) => e.id === activeExperiment) : -1;
    const next = EXPERIMENTS[(idx + 1) % EXPERIMENTS.length];
    applyExperiment(next.preset);
    setActiveExperiment(next.id);
    scrollTo(expRef);
  };

  const startMission = (m: Mission) => {
    setMission(m);
    setActiveExperiment(null);
    sim.animateTo(m.start, 700);
    sim.setRunning(true);
    setShowChallenge(true);
    scrollTo(chRef);
  };

  const toggleChallenge = () => {
    const v = !showChallenge;
    setShowChallenge(v);
    if (!v) setMission(null);
    else scrollTo(chRef);
  };
  const toggleTeacher = () => {
    const v = !showTeacher;
    setShowTeacher(v);
    if (v) scrollTo(teacherRef);
  };
  const toggleCompare = () => {
    const v = !showCompare;
    setShowCompare(v);
    if (v) scrollTo(compareRef);
  };

  const resetAll = () => {
    sim.reset();
    setMission(null);
    setActiveExperiment(null);
  };

  return (
    <div className="min-h-screen pb-10">
      {/* هدر */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-2xl shadow-lg shadow-emerald-200">🌱</div>
            <div>
              <h1 className="text-xl font-black leading-tight text-slate-900 md:text-2xl">شبیه‌ساز آموزشی فتوسنتز (Photosynthesis)</h1>
              <p className="text-xs text-slate-500">نور + آب + دی‌اکسید کربن ← گلوکز + اکسیژن — رابطه‌ی علت و معلولی عوامل محیطی با شدت فتوسنتز</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Btn tone="green" active={sim.running} onClick={() => sim.setRunning(!sim.running)}>
              {sim.running ? '⏸ توقف' : '▶ شروع'}
            </Btn>
            <Btn onClick={resetAll}>🔄 بازنشانی</Btn>
            <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              {([1, 2, 5] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => sim.setSpeed(s)}
                  className={`px-3 py-2 text-sm font-bold transition-colors ${sim.speed === s ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 hover:bg-amber-50'}`}
                >
                  {s === 1 ? '▶ ×1' : `⏩ ×${s}`}
                </button>
              ))}
            </div>
            <Btn tone="amber" onClick={nextExperiment}>
              🔬 آزمایش جدید
            </Btn>
            <Btn tone="pink" active={showChallenge} onClick={toggleChallenge}>
              🎯 Challenge
            </Btn>
            <Btn tone="blue" active={showTeacher} onClick={toggleTeacher}>
              👨‍🏫 حالت معلم
            </Btn>
            <Btn tone="teal" active={showCompare} onClick={toggleCompare}>
              🌿🌿 مقایسه دو گیاه
            </Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-5 px-4 pt-5">
        {/* کارت نرخ */}
        <RateCard model={sim.model} params={sim.params} oxygen={sim.oxygen} glucose={sim.glucose} time={sim.time} />

        {/* صحنه + کنترل */}
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black text-slate-800">🎛️ پنل کنترل شرایط محیطی</h2>
              {mission && <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-bold text-fuchsia-800">🎯 مأموریت فعال</span>}
            </div>
            <ControlPanel params={sim.params} onChange={handleChange} factors={sim.model.factors} limiting={sim.model.limiting} locked={locked} />
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900">
              <b>💡 قانون عامل محدودکننده:</b> سرعت فتوسنتز را عاملی تعیین می‌کند که از همه <b>کمتر</b> است؛ نه مجموع همه عوامل. کم‌ترین عامل با رنگ قرمز مشخص می‌شود.
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <PlantScene params={sim.params} rate={sim.model.rate} running={sim.running} speed={sim.speed} onLeafClick={() => setZoomOpen(true)} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <LegendChip color="#475569" text="CO₂ — دی‌اکسید کربن (ورودی از هوا)" />
                <LegendChip color="#0ea5e9" text="H₂O — آب (خاک ← ریشه ← ساقه ← برگ)" />
                <LegendChip color="#fde047" text="نور خورشید" />
                <LegendChip color="#22d3ee" text="O₂ — اکسیژن (خروجی)" />
                <LegendChip color="#f97316" text="گلوکز C₆H₁₂O₆ (محصول)" />
              </div>
              <button onClick={() => setZoomOpen(true)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700">
                🔍 نمای سلول و کلروپلاست
              </button>
            </div>
          </section>
        </div>

        {/* نمودار */}
        <LiveChart history={sim.history} />

        {/* حالت معلم */}
        {showTeacher && (
          <div ref={teacherRef} className="fade-up scroll-mt-24">
            <TeacherMode params={sim.params} model={sim.model} onAnimateTo={(t) => sim.animateTo(t, 1500)} onExit={() => setShowTeacher(false)} />
          </div>
        )}

        {/* Challenge */}
        {showChallenge && (
          <div ref={chRef} className="fade-up scroll-mt-24">
            <ChallengeMode
              model={sim.model}
              params={sim.params}
              mission={mission}
              onStart={startMission}
              onExit={() => {
                setMission(null);
                setShowChallenge(false);
              }}
            />
          </div>
        )}

        {/* مقایسه */}
        {showCompare && (
          <div ref={compareRef} className="fade-up scroll-mt-24">
            <CompareMode running={sim.running} speed={sim.speed} onExit={() => setShowCompare(false)} />
          </div>
        )}

        {/* آزمایش‌ها */}
        <div ref={expRef} className="scroll-mt-24">
          <Experiments onApply={applyExperiment} activeId={activeExperiment} setActiveId={setActiveExperiment} />
        </div>

        {/* معادله */}
        <Equation />

        <footer className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-500">
          <b className="text-slate-700">توجه آموزشی:</b> این شبیه‌ساز یک مدل ساده‌شده برای آموزش مفاهیم فتوسنتز (Photosynthesis)، عامل محدودکننده (Limiting Factor) و اثر دما بر آنزیم‌هاست و ادعای شبیه‌سازی دقیق یک گیاه واقعی را ندارد. واژه‌نامه: کلروپلاست (Chloroplast)، روزنه (Stoma)، تعرق (Transpiration)، رگبرگ (Vein)، گلوکز (Glucose).
        </footer>
      </main>

      <ChloroplastModal open={zoomOpen} onClose={() => setZoomOpen(false)} params={sim.params} model={sim.model} running={sim.running} speed={sim.speed} />
    </div>
  );
}

function Btn({ onClick, active, children, tone = 'slate' }: { onClick: () => void; active?: boolean; children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: active ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100',
    green: active ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 hover:bg-emerald-50',
    amber: active ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 hover:bg-amber-50',
    pink: active ? 'bg-fuchsia-600 text-white' : 'bg-white text-fuchsia-700 hover:bg-fuchsia-50',
    blue: active ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-50',
    teal: active ? 'bg-teal-600 text-white' : 'bg-white text-teal-700 hover:bg-teal-50',
  };
  return (
    <button onClick={onClick} className={`rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold shadow-sm transition-all active:scale-95 ${tones[tone]}`}>
      {children}
    </button>
  );
}

function LegendChip({ color, text }: { color: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
      <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
      {text}
    </span>
  );
}
