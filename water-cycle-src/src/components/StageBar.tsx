import { STAGES, STAGE_MAP } from "../data/content";
import type { StageId } from "../model/waterCycle";
import { cn } from "../utils/cn";

interface Props {
  activity: Record<StageId, number>;
  dominant: StageId;
  selected: StageId | null;
  onSelect: (id: StageId | null) => void;
}

// ترتیب نمایش در نوار چرخه
const ORDER: StageId[] = [
  "evaporation",
  "transpiration",
  "condensation",
  "cloud",
  "precipitation",
  "runoff",
  "infiltration",
  "collection",
];

export default function StageBar({ activity, dominant, selected, onSelect }: Props) {
  const sel = selected ? STAGE_MAP[selected] : null;
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">🔁 ارتباط مراحل چرخه آب</h3>
        <span className="text-[11px] text-slate-500">
          مرحله‌ی غالب اکنون: <b className="text-blue-700">{STAGE_MAP[dominant].fa}</b> — روی هر مرحله کلیک کنید
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {ORDER.map((id, i) => {
          const st = STAGES.find((s) => s.id === id)!;
          const act = activity[id];
          const isDom = id === dominant;
          const isSel = id === selected;
          return (
            <div key={id} className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onSelect(isSel ? null : id)}
                className={cn(
                  "relative rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-all",
                  st.color,
                  isSel && `ring-4 ${st.ring} scale-105 shadow-lg`,
                  isDom && !isSel && "ring-2 ring-yellow-400 shadow-md"
                )}
                style={{ opacity: 0.45 + 0.55 * act }}
                title={st.short}
              >
                <span className="ml-1">{st.icon}</span>
                {st.fa}
                {isDom && (
                  <span className="absolute -top-2 -left-2 text-[9px] bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 font-extrabold shadow">
                    اکنون
                  </span>
                )}
                <span
                  className="absolute bottom-0 right-2 left-2 h-0.5 rounded-full bg-current opacity-60"
                  style={{ transform: `scaleX(${act})`, transformOrigin: "right" }}
                />
              </button>
              <span className="text-slate-400 font-black text-base">{i < ORDER.length - 1 ? "←" : "↩"}</span>
            </div>
          );
        })}
        <span className="text-xs text-slate-500 font-semibold">تبخیر مجدد…</span>
      </div>

      {sel && (
        <div className={cn("mt-3 rounded-xl border p-3 sm:p-4", sel.color)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-extrabold text-base">
                {sel.icon} {sel.fa} <span className="text-xs font-semibold opacity-70" dir="ltr">({sel.en})</span>
              </div>
              <p className="text-sm mt-1 leading-relaxed">{sel.short}</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                <div className="rounded-lg bg-white/70 p-2">
                  <b>🔍 علت:</b> {sel.cause}
                </div>
                <div className="rounded-lg bg-white/70 p-2">
                  <b>➡️ نتیجه:</b> {sel.effect}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="shrink-0 text-xs font-bold bg-white/70 hover:bg-white rounded-lg px-2 py-1"
            >
              ✕ بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
