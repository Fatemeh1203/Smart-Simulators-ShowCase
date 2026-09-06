import { Experiment, experiments } from "../data/experiments";

interface Props {
  completed: Set<string>;
  activeId: string | null;
  phase: "guess" | "building" | "done";
  guessIndex: number | null;
  onStart: (e: Experiment) => void;
}

export default function ExperimentPanel({ completed, activeId, phase, guessIndex, onStart }: Props) {
  const active = experiments.find((e) => e.id === activeId) ?? null;
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-gradient-to-l from-fuchsia-300 to-pink-200 border-2 border-fuchsia-400 p-3 shadow">
        <div className="font-black text-fuchsia-900 text-lg">🔬 حدس بزن و آزمایش کن</div>
        <div className="text-xs text-fuchsia-800 mt-1">حدس بزن → آزمایش کن → نتیجه را ببین</div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {experiments.map((e) => {
          const done = completed.has(e.id);
          const isActive = e.id === activeId;
          return (
            <button
              key={e.id}
              onClick={() => onStart(e)}
              className={`rounded-xl border-2 py-2 px-1 transition-all ${
                isActive ? "bg-fuchsia-500 border-fuchsia-700 text-white scale-105 shadow-lg" : done ? "bg-green-100 border-green-400" : "bg-white border-slate-300 hover:border-fuchsia-400"
              }`}
            >
              <div className="text-2xl leading-none">{done ? "✅" : e.emoji}</div>
              <div className="text-[11px] font-black mt-1">{e.title.replace("آزمایش ", "")}</div>
            </button>
          );
        })}
      </div>

      {active ? (
        <div key={active.id} className="rounded-2xl bg-white border-2 border-fuchsia-300 p-3 shadow pop-in space-y-2">
          <div className="font-black text-slate-800 text-base">
            {active.emoji} {active.title}
          </div>
          <p className="text-sm text-slate-700">{active.intro}</p>
          {guessIndex !== null && (
            <div className="text-xs bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-2">
              <span className="font-black text-fuchsia-800">حدس تو: </span>
              {active.guess.options[guessIndex].emoji} {active.guess.options[guessIndex].text}
            </div>
          )}
          {phase === "building" && (
            <div className="text-sm font-black text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-xl p-2 leading-relaxed">👉 {active.task}</div>
          )}
          {phase === "done" && <div className="text-sm font-black text-green-800 bg-green-50 border-2 border-green-300 rounded-xl p-2">✅ {active.result}</div>}
          <button onClick={() => onStart(active)} className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 font-black py-1.5 text-xs">
            🔁 دوباره
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 border-2 border-dashed border-slate-300 p-4 text-center">
          <div className="text-4xl mb-1 float-y">🧪</div>
          <div className="font-black text-slate-700">یک آزمایش انتخاب کن!</div>
        </div>
      )}
    </div>
  );
}
