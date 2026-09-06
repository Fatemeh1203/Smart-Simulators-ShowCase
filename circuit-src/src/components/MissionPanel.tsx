import { Mission, missions } from "../data/missions";

interface Props {
  completed: Set<string>;
  activeId: string | null;
  phase: "guess" | "building" | "done";
  onStart: (m: Mission) => void;
}

export default function MissionPanel({ completed, activeId, phase, onStart }: Props) {
  const active = missions.find((m) => m.id === activeId) ?? null;
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-200 border-2 border-amber-400 p-3 shadow">
        <div className="flex items-center justify-between">
          <div className="font-black text-amber-900 text-lg">🏆 ماموریت مدار</div>
          <div className="text-xs font-black text-amber-800 bg-white/70 rounded-full px-2 py-0.5">
            {completed.size} از {missions.length}
          </div>
        </div>
        <div className="mt-2 h-3 rounded-full bg-white/70 overflow-hidden">
          <div className="h-full bg-gradient-to-l from-green-400 to-emerald-500 transition-all duration-700" style={{ width: `${(completed.size / missions.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {missions.map((m) => {
          const done = completed.has(m.id);
          const isActive = m.id === activeId;
          return (
            <button
              key={m.id}
              onClick={() => onStart(m)}
              title={m.title}
              className={`relative rounded-xl border-2 py-2 text-xl transition-all ${
                isActive ? "bg-sky-500 border-sky-700 text-white scale-105 shadow-lg" : done ? "bg-green-100 border-green-400" : "bg-white border-slate-300 hover:border-sky-400"
              }`}
            >
              <div className="text-[10px] font-black opacity-70">{m.order}</div>
              <div className="leading-none">{done ? "✅" : m.emoji.slice(0, 2)}</div>
            </button>
          );
        })}
      </div>

      {active ? (
        <div key={active.id} className="rounded-2xl bg-white border-2 border-sky-300 p-3 shadow pop-in space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{active.emoji}</span>
            <div>
              <div className="text-[11px] font-black text-sky-600">مأموریت {active.order}</div>
              <div className="font-black text-slate-800 leading-tight">{active.title}</div>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-sky-50 rounded-xl p-2 border border-sky-100">{active.goal}</p>
          <ol className="text-xs text-slate-600 space-y-1 pr-1">
            {active.steps.map((s, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="shrink-0 w-4 h-4 rounded-full bg-sky-200 text-sky-900 font-black text-[10px] flex items-center justify-center">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-1">
            {active.points.map((p) => (
              <span key={p.label} className="text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 rounded-full px-2 py-0.5">
                {p.emoji} {p.label}: {p.value}
              </span>
            ))}
          </div>
          <div
            className={`text-center text-sm font-black rounded-xl py-1.5 ${
              phase === "done" ? "bg-green-100 text-green-800" : phase === "building" ? "bg-yellow-50 text-yellow-800" : "bg-fuchsia-50 text-fuchsia-800"
            }`}
          >
            {phase === "done" ? "✅ انجام شد!" : phase === "building" ? "🔧 در حال ساخت... مدار را کامل کن" : "🤔 اول حدس بزن"}
          </div>
          <button onClick={() => onStart(active)} className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 font-black py-1.5 text-xs">
            🔁 شروع دوبارهٔ این مأموریت
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 border-2 border-dashed border-slate-300 p-4 text-center">
          <div className="text-4xl mb-1 float-y">🚀</div>
          <div className="font-black text-slate-700">یک مأموریت انتخاب کن!</div>
          <div className="text-xs text-slate-500 mt-1">روی یکی از شماره‌های بالا بزن.</div>
        </div>
      )}
    </div>
  );
}
