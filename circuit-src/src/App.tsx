import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { analyze } from "./circuit/analyze";
import { circuitReducer, clampPos, emptyState, makeComponent, nearestTerminal, uid } from "./circuit/model";
import { Selection, WireEnd, WORKSPACE_H, WORKSPACE_W } from "./circuit/types";
import ExperimentPanel from "./components/ExperimentPanel";
import MissionPanel from "./components/MissionPanel";
import { Confetti, GuessModal, Modal } from "./components/Modal";
import PartsGuide from "./components/PartsGuide";
import PropertyPanel from "./components/PropertyPanel";
import StatusBar from "./components/StatusBar";
import Toolbox from "./components/Toolbox";
import Workspace from "./components/Workspace";
import { PartPreview } from "./components/parts";
import { Experiment, experiments } from "./data/experiments";
import { Mission, missions, totalMissionPoints } from "./data/missions";
import { PartKind } from "./data/parts";
import { presetSwitchLoop } from "./data/presets";
import { clientToSvg, isInside } from "./utils/svg";

type Mode = "lab" | "experiments" | "missions" | "guide";
type Phase = "guess" | "building" | "done";

interface Progress {
  score: number;
  missions: string[];
  experiments: string[];
}

interface ResultInfo {
  kind: "mission" | "experiment";
  title: string;
  emoji: string;
  guessIndex: number | null;
  guessOptions: { emoji: string; text: string }[];
  correct: number;
  explanation: string;
  successText: string;
  points: { label: string; emoji: string; value: number }[];
  earned: number;
}

const STORAGE_KEY = "circuit-lab-progress-v1";

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { score: 0, missions: [], experiments: [] };
}

const modes: { id: Mode; label: string; emoji: string; color: string }[] = [
  { id: "lab", label: "آزمایشگاه آزاد", emoji: "🧪", color: "from-sky-400 to-blue-500" },
  { id: "experiments", label: "حدس بزن", emoji: "🔬", color: "from-fuchsia-400 to-pink-500" },
  { id: "missions", label: "ماموریت مدار", emoji: "🏆", color: "from-amber-400 to-orange-500" },
  { id: "guide", label: "قطعات را بشناس", emoji: "📚", color: "from-emerald-400 to-green-500" },
];

export default function App() {
  const [mode, setMode] = useState<Mode>("lab");
  const [state, dispatch] = useReducer(circuitReducer, undefined, emptyState);
  const [selection, setSelection] = useState<Selection>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const analysis = useMemo(() => analyze(state), [state]);

  const [progress, setProgress] = useState<Progress>(loadProgress);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // ---- missions / experiments ----
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [missionPhase, setMissionPhase] = useState<Phase>("guess");
  const [missionGuess, setMissionGuess] = useState<number | null>(null);

  const [activeExp, setActiveExp] = useState<string | null>(null);
  const [expPhase, setExpPhase] = useState<Phase>("guess");
  const [expGuess, setExpGuess] = useState<number | null>(null);

  const [result, setResult] = useState<ResultInfo | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [finalShown, setFinalShown] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem("circuit-lab-help-seen"));
  const closeHelp = () => {
    localStorage.setItem("circuit-lab-help-seen", "1");
    setShowHelp(false);
  };

  const completedMissions = useMemo(() => new Set(progress.missions), [progress.missions]);
  const completedExps = useMemo(() => new Set(progress.experiments), [progress.experiments]);

  const startMission = (m: Mission) => {
    dispatch({ type: "reset", state: m.preset() });
    setSelection(null);
    setActiveMission(m.id);
    setMissionGuess(null);
    setMissionPhase("guess");
  };

  const startExperiment = (e: Experiment) => {
    dispatch({ type: "reset", state: e.preset() });
    setSelection(null);
    setActiveExp(e.id);
    setExpGuess(null);
    setExpPhase("guess");
  };

  // mission success detection
  useEffect(() => {
    if (mode !== "missions" || !activeMission || missionPhase !== "building") return;
    const m = missions.find((x) => x.id === activeMission);
    if (!m || !m.check(analysis, state)) return;
    const already = completedMissions.has(m.id);
    const earned = already ? 0 : m.points.reduce((s, p) => s + p.value, 0);
    setMissionPhase("done");
    setProgress((p) => ({ ...p, score: p.score + earned, missions: already ? p.missions : [...p.missions, m.id] }));
    setResult({
      kind: "mission",
      title: m.title,
      emoji: m.emoji,
      guessIndex: missionGuess,
      guessOptions: m.guess.options,
      correct: m.guess.correct,
      explanation: m.guess.explanation,
      successText: m.successText,
      points: m.points,
      earned,
    });
    setConfetti((c) => c + 1);
  }, [analysis, state, mode, activeMission, missionPhase, missionGuess, completedMissions]);

  // experiment success detection
  useEffect(() => {
    if (mode !== "experiments" || !activeExp || expPhase !== "building") return;
    const e = experiments.find((x) => x.id === activeExp);
    if (!e || !e.done(analysis, state)) return;
    const already = completedExps.has(e.id);
    const earned = already ? 0 : 10;
    setExpPhase("done");
    setProgress((p) => ({ ...p, score: p.score + earned, experiments: already ? p.experiments : [...p.experiments, e.id] }));
    setResult({
      kind: "experiment",
      title: e.title,
      emoji: e.emoji,
      guessIndex: expGuess,
      guessOptions: e.guess.options,
      correct: e.guess.correct,
      explanation: e.guess.explanation,
      successText: `${e.result} ${e.lesson}`,
      points: [{ label: "انجام آزمایش", emoji: "🔬", value: 10 }],
      earned,
    });
    setConfetti((c) => c + 1);
  }, [analysis, state, mode, activeExp, expPhase, expGuess, completedExps]);

  const closeResult = () => {
    setResult(null);
    if (!finalShown && completedMissions.size >= missions.length) {
      setFinalShown(true);
      setShowFinal(true);
      setConfetti((c) => c + 1);
    }
  };

  // ---- toolbox drag & drop ----
  const [ghost, setGhost] = useState<{ kind: PartKind; x: number; y: number } | null>(null);
  const ghostRef = useRef<{ kind: PartKind; startX: number; startY: number; moved: boolean } | null>(null);

  const addPart = useCallback(
    (kind: PartKind, x: number, y: number) => {
      const p = clampPos(x, y);
      if (kind === "wire") {
        const endFor = (x: number, y: number, exclude?: { compId: string; index: 0 | 1 }): WireEnd => {
          const t = nearestTerminal(stateRef.current, x, y, 40, exclude);
          return t ? { kind: "terminal", compId: t.compId, index: t.index } : { kind: "free", x, y };
        };
        const a = endFor(p.x - 60, p.y);
        const b = endFor(p.x + 60, p.y, a.kind === "terminal" ? { compId: a.compId, index: a.index } : undefined);
        const id = uid("w");
        dispatch({ type: "addWire", wire: { id, a, b } });
        setSelection({ kind: "wire", id });
      } else {
        const c = makeComponent(kind, p.x, p.y);
        dispatch({ type: "addComponent", component: c });
        setSelection({ kind: "component", id: c.id });
      }
    },
    [dispatch]
  );

  const onPickUp = (kind: PartKind, e: React.PointerEvent) => {
    e.preventDefault();
    ghostRef.current = { kind, startX: e.clientX, startY: e.clientY, moved: false };
    setGhost({ kind, x: e.clientX, y: e.clientY });

    const move = (ev: PointerEvent) => {
      const g = ghostRef.current;
      if (!g) return;
      if (!g.moved && Math.hypot(ev.clientX - g.startX, ev.clientY - g.startY) > 6) g.moved = true;
      setGhost({ kind: g.kind, x: ev.clientX, y: ev.clientY });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const g = ghostRef.current;
      ghostRef.current = null;
      setGhost(null);
      if (!g) return;
      const svg = svgRef.current;
      if (svg && isInside(svg, ev.clientX, ev.clientY) && g.moved) {
        const p = clientToSvg(svg, ev.clientX, ev.clientY);
        addPart(g.kind, p.x, p.y);
      } else if (!g.moved) {
        // simple tap: put it on the table
        addPart(g.kind, WORKSPACE_W / 2 + (Math.random() - 0.5) * 200, WORKSPACE_H / 2 + (Math.random() - 0.5) * 160);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const clearTable = () => {
    dispatch({ type: "reset" });
    setSelection(null);
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setSelection(null);
  };

  const activeMissionObj = missions.find((m) => m.id === activeMission) ?? null;
  const activeExpObj = experiments.find((e) => e.id === activeExp) ?? null;

  return (
    <div className="h-full flex flex-col bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_50%),radial-gradient(circle_at_bottom_left,#fce7f3,transparent_50%)]">
      {/* ---------- header ---------- */}
      <header className="shrink-0 px-3 pt-2 pb-1 md:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 order-1">
            <span className="text-3xl md:text-4xl wiggle inline-block">⚡</span>
            <div>
              <h1 className="text-lg md:text-2xl font-black text-sky-900 leading-tight">آزمایشگاه مدار الکتریکی کوچولوها</h1>
              <p className="text-[11px] md:text-xs text-slate-600 hidden sm:block">حدس بزن → قطعات را بچین → سیم‌کشی کن → آزمایش کن → نتیجه را ببین</p>
            </div>
          </div>
          <nav className="flex gap-1.5 flex-wrap order-3 lg:order-2 w-full lg:w-auto justify-center">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => changeMode(m.id)}
                className={`rounded-2xl px-3 md:px-4 py-2 font-black text-sm md:text-base border-4 transition-all ${
                  mode === m.id ? `bg-gradient-to-br ${m.color} text-white border-white shadow-lg scale-105` : "bg-white/80 text-slate-700 border-transparent hover:border-sky-200"
                }`}
              >
                <span className="ml-1">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 order-2 lg:order-3">
            <button onClick={() => setShowHelp(true)} className="rounded-full w-10 h-10 bg-white border-2 border-sky-300 font-black text-sky-700 text-lg shadow hover:bg-sky-50">
              ؟
            </button>
            <div className="rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-400 border-4 border-white shadow px-3 py-1.5 text-center min-w-[90px]">
              <div className="text-[10px] font-black text-amber-900">امتیاز</div>
              <div className="text-xl font-black text-amber-950 leading-none">⭐ {progress.score}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- main ---------- */}
      <main className="flex-1 min-h-0 p-2 md:p-3">
        {mode === "guide" ? (
          <PartsGuide />
        ) : (
          <div className="h-full flex flex-col lg:flex-row gap-2 md:gap-3">
            {/* right panel (first in RTL) */}
            <aside className="order-3 lg:order-1 lg:w-[300px] xl:w-[320px] shrink-0 overflow-y-auto scrollbar-thin space-y-2 max-h-[38vh] lg:max-h-none">
              {mode === "lab" && (
                <div className="space-y-2">
                  <div className="rounded-2xl bg-gradient-to-l from-sky-300 to-blue-200 border-2 border-sky-400 p-3 shadow">
                    <div className="font-black text-sky-900 text-lg">🧪 آزمایشگاه آزاد</div>
                    <div className="text-xs text-sky-800 mt-1">هر مداری که دوست داری بساز و ببین چه می‌شود!</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => { dispatch({ type: "reset", state: presetSwitchLoop() }); setSelection(null); }} className="rounded-xl bg-white border-2 border-sky-300 hover:bg-sky-50 font-black text-sky-800 py-2 text-sm">
                      📦 نمونه مدار
                    </button>
                    <button onClick={clearTable} className="rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-50 font-black text-slate-700 py-2 text-sm">
                      🧹 پاک کردن میز
                    </button>
                  </div>
                  <div className="rounded-2xl bg-white/80 border-2 border-yellow-300 p-3 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="font-black text-yellow-800">💡 چیزهایی که می‌توانی امتحان کنی:</div>
                    <div>• کلید را باز و بسته کن و به نقطه‌های نورانی نگاه کن.</div>
                    <div>• باتری ضعیف و قوی را مقایسه کن.</div>
                    <div>• مقاومت کم و زیاد را امتحان کن.</div>
                    <div>• دو لامپ را پشت‌سرهم یا کنار هم وصل کن.</div>
                  </div>
                </div>
              )}
              {mode === "missions" && <MissionPanel completed={completedMissions} activeId={activeMission} phase={missionPhase} onStart={startMission} />}
              {mode === "experiments" && <ExperimentPanel completed={completedExps} activeId={activeExp} phase={expPhase} guessIndex={expGuess} onStart={startExperiment} />}
              <PropertyPanel state={state} selection={selection} dispatch={dispatch} setSelection={setSelection} />
            </aside>

            {/* workspace */}
            <section className="order-2 flex-1 min-h-[280px] min-w-0 flex flex-col gap-2">
              <div className="flex-1 min-h-0 rounded-3xl border-4 border-sky-300 bg-white/60 shadow-inner overflow-hidden relative">
                <Workspace state={state} analysis={analysis} dispatch={dispatch} selection={selection} setSelection={setSelection} svgRef={svgRef} />
                {Object.keys(state.components).length > 0 && (
                  <button onClick={clearTable} className="absolute bottom-2 left-2 rounded-full bg-white/90 border-2 border-slate-300 px-3 py-1 text-xs font-black text-slate-600 hover:bg-red-50 hover:border-red-300 shadow">
                    🧹 پاک کردن
                  </button>
                )}
              </div>
              <StatusBar analysis={analysis} />
            </section>

            {/* toolbox (left) */}
            <aside className="order-1 lg:order-3 lg:w-[170px] xl:w-[190px] shrink-0 h-[132px] lg:h-auto">
              <Toolbox onPickUp={onPickUp} />
            </aside>
          </div>
        )}
      </main>

      {/* ---------- drag ghost ---------- */}
      {ghost && (
        <div className="fixed z-[70] pointer-events-none -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl scale-110" style={{ left: ghost.x, top: ghost.y }}>
          <PartPreview type={ghost.kind} size={120} />
        </div>
      )}

      {/* ---------- guess modals ---------- */}
      {mode === "missions" && activeMissionObj && missionPhase === "guess" && (
        <GuessModal
          guess={activeMissionObj.guess}
          title={`${activeMissionObj.emoji} ${activeMissionObj.title}`}
          intro={activeMissionObj.goal}
          onAnswer={(i) => {
            setMissionGuess(i);
            setMissionPhase("building");
          }}
        />
      )}
      {mode === "experiments" && activeExpObj && expPhase === "guess" && (
        <GuessModal
          guess={activeExpObj.guess}
          title={`${activeExpObj.emoji} ${activeExpObj.title}`}
          intro={activeExpObj.intro}
          onAnswer={(i) => {
            setExpGuess(i);
            setExpPhase("building");
          }}
        />
      )}

      {/* ---------- result modal ---------- */}
      {result && (
        <Modal onClose={closeResult}>
          <div className="text-center">
            <div className="text-6xl mb-1">{result.kind === "mission" ? "🎉" : "🔬"}</div>
            <h3 className="text-xl font-black text-slate-800">
              {result.kind === "mission" ? "مأموریت انجام شد!" : "آزمایش تمام شد!"}
            </h3>
            <div className="text-sm font-black text-sky-700 mt-0.5">{result.emoji} {result.title}</div>

            <p className="mt-3 text-base font-black text-green-900 bg-green-50 border-2 border-green-300 rounded-2xl p-3 leading-relaxed">{result.successText}</p>

            {result.guessIndex !== null && (
              <div className={`mt-3 rounded-2xl border-2 p-3 text-right ${result.guessIndex === result.correct ? "bg-emerald-50 border-emerald-300" : "bg-orange-50 border-orange-300"}`}>
                <div className="font-black text-sm">
                  {result.guessIndex === result.correct ? "✅ حدس تو درست بود!" : "🤗 حدس تو کمی فرق داشت، اشکالی ندارد!"}
                </div>
                <div className="text-xs mt-1 text-slate-700">
                  حدس تو: {result.guessOptions[result.guessIndex].emoji} {result.guessOptions[result.guessIndex].text}
                </div>
                <div className="text-xs mt-0.5 text-slate-700">
                  جواب درست: {result.guessOptions[result.correct].emoji} {result.guessOptions[result.correct].text}
                </div>
                <div className="text-sm mt-2 text-slate-800 leading-relaxed">{result.explanation}</div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {result.points.map((p) => (
                <span key={p.label} className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 rounded-full px-2 py-1">
                  {p.emoji} {p.label}: +{p.value}
                </span>
              ))}
            </div>
            <div className="mt-2 text-lg font-black text-amber-700">
              {result.earned > 0 ? `⭐ ${result.earned} امتیاز گرفتی!` : "این را قبلاً انجام داده بودی ⭐"}
            </div>

            <button onClick={closeResult} className="mt-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black px-8 py-3 text-lg shadow">
              ادامه 🚀
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- final celebration ---------- */}
      {showFinal && (
        <Modal onClose={() => setShowFinal(false)}>
          <div className="text-center">
            <div className="text-7xl mb-2 wiggle inline-block">⚡</div>
            <h3 className="text-2xl md:text-3xl font-black text-amber-700">تبریک! تو یک مهندس برق کوچولو شدی! ⚡</h3>
            <p className="mt-3 text-slate-700 leading-relaxed">همهٔ مأموریت‌ها را انجام دادی. حالا می‌دانی که:</p>
            <p className="mt-2 text-lg font-black text-slate-900 bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-3">
              «برای روشن شدن لامپ باید یک مسیرِ کامل برای عبور جریان داشته باشیم.»
            </p>
            <div className="mt-3 text-2xl font-black text-amber-700">⭐ امتیاز کل: {progress.score}</div>
            <div className="text-xs text-slate-500">از {totalMissionPoints + experiments.length * 10} امتیاز ممکن</div>
            <button onClick={() => setShowFinal(false)} className="mt-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black px-8 py-3 text-lg shadow">
              آفرین به من! 🏆
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- help ---------- */}
      {showHelp && (
        <Modal onClose={closeHelp} wide>
          <h3 className="text-xl font-black text-sky-800 text-center mb-3">راهنمای آزمایشگاه 🧭</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700">
            {[
              ["🧰", "قطعه را از جعبه‌ابزار بکش و روی میز رها کن (یا فقط روی آن بزن)."],
              ["⚪", "برای سیم‌کشی، از دایرهٔ پایانهٔ یک قطعه به دایرهٔ قطعهٔ دیگر بکش."],
              ["👆", "روی قطعه بزن تا انتخاب شود؛ بعد می‌توانی حذف یا بچرخانی‌اش."],
              ["🔘", "روی کلید بزن تا باز 🔴 یا بسته 🟢 شود."],
              ["🔋", "روی باتری یا مقاومت بزن و قدرتش را از پنل کنار عوض کن."],
              ["〰️", "روی سیم بزن؛ سرِ آبی سیم را بکش تا جای دیگری وصل شود، یا ✕ را بزن تا حذف شود."],
              ["🔴", "اگر لامپ روشن نشد، به علامت‌های قرمز نگاه کن؛ آن‌جا مدار قطع است."],
              ["✨", "نقطه‌های نورانی روی سیم یعنی جریان در حال حرکت است!"],
            ].map(([e, t], i) => (
              <div key={i} className="flex gap-2 items-start rounded-xl bg-sky-50 border border-sky-200 p-2">
                <span className="text-2xl">{e}</span>
                <span className="leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
          <button onClick={closeHelp} className="mt-4 w-full rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black py-3">
            بزن بریم! 🚀
          </button>
        </Modal>
      )}

      {confetti > 0 && <Confetti key={confetti} />}
    </div>
  );
}
