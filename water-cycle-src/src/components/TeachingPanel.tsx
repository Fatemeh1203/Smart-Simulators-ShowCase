import { STAGE_MAP } from "../data/content";
import type { StageId } from "../model/waterCycle";
import { cn } from "../utils/cn";

const TEACH_ORDER: StageId[] = [
  "evaporation",
  "transpiration",
  "condensation",
  "cloud",
  "precipitation",
  "runoff",
  "infiltration",
];

interface Props {
  enabled: boolean;
  focus: StageId | null;
  onToggle: (on: boolean) => void;
  onFocus: (id: StageId | null) => void;
}

export default function TeachingPanel({ enabled, focus, onToggle, onFocus }: Props) {
  const st = focus ? STAGE_MAP[focus] : null;
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-extrabold text-slate-800">👩‍🏫 حالت آموزشی (Teaching Mode)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              هر مرحله را جداگانه اجرا کنید؛ سایر فرآیندها کم‌رنگ می‌شوند.
            </div>
          </div>
          <button
            onClick={() => {
              onToggle(!enabled);
              if (enabled) onFocus(null);
              else if (!focus) onFocus("evaporation");
            }}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors shrink-0",
              enabled ? "bg-emerald-500" : "bg-slate-300"
            )}
            aria-label="فعال‌سازی حالت آموزشی"
          >
            <span
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all",
                enabled ? "left-1" : "left-7"
              )}
            />
          </button>
        </div>
      </div>

      <div className={cn("grid grid-cols-2 gap-2 transition-opacity", !enabled && "opacity-50 pointer-events-none")}>
        {TEACH_ORDER.map((id, i) => {
          const s = STAGE_MAP[id];
          const active = focus === id;
          return (
            <button
              key={id}
              onClick={() => onFocus(active ? null : id)}
              className={cn(
                "rounded-xl border p-2.5 text-right transition-all",
                s.color,
                active ? `ring-4 ${s.ring} shadow-lg scale-[1.02]` : "hover:shadow"
              )}
            >
              <div className="text-xs opacity-70 font-bold">مرحله {i + 1}</div>
              <div className="font-extrabold text-sm">
                {s.icon} {s.fa}
              </div>
              <div className="text-[10px] opacity-70" dir="ltr">
                {s.en}
              </div>
            </button>
          );
        })}
      </div>

      {enabled && st && (
        <div className={cn("rounded-xl border p-3", st.color)}>
          <div className="font-extrabold">
            {st.icon} {st.fa} <span className="text-xs opacity-70" dir="ltr">({st.en})</span>
          </div>
          <p className="text-sm mt-1 leading-relaxed">{st.short}</p>
          <div className="mt-2 text-xs space-y-1.5">
            <div className="rounded-lg bg-white/70 p-2">
              <b>🔍 علت:</b> {st.cause}
            </div>
            <div className="rounded-lg bg-white/70 p-2">
              <b>➡️ نتیجه:</b> {st.effect}
            </div>
          </div>
          <div className="mt-2 text-[11px] opacity-80">
            💡 در صحنه، فقط این فرآیند با وضوح کامل اجرا می‌شود؛ برای دیدن مرحله‌ی بعد دکمه‌ی آن را بزنید.
          </div>
        </div>
      )}
      {enabled && !st && (
        <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 text-center">
          یک مرحله را انتخاب کنید تا به‌تنهایی اجرا شود.
        </div>
      )}
    </div>
  );
}
