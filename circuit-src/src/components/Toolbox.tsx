import { PartKind, partsInfo } from "../data/parts";
import { PartPreview } from "./parts";

interface Props {
  onPickUp: (kind: PartKind, e: React.PointerEvent) => void;
  compact?: boolean;
}

export default function Toolbox({ onPickUp }: Props) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg border-4 border-sky-200 p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-thin h-full">
      <div className="hidden lg:flex items-center justify-center gap-2 text-sky-700 font-black text-lg pb-1 border-b-2 border-dashed border-sky-100">
        🧰 جعبه‌ابزار
      </div>
      {partsInfo.map((p) => (
        <button
          key={p.kind}
          type="button"
          onPointerDown={(e) => onPickUp(p.kind, e)}
          className={`shrink-0 select-none touch-pan-x lg:touch-none cursor-grab active:cursor-grabbing flex lg:flex-col items-center gap-1 lg:gap-0 rounded-2xl bg-gradient-to-br ${p.color} border-2 border-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all px-3 py-2 lg:py-3 min-w-[150px] lg:min-w-0`}
        >
          <PartPreview type={p.kind} size={96} />
          <div className="text-right lg:text-center">
            <div className="font-black text-slate-800 text-base leading-tight">
              {p.emoji} {p.name}
            </div>
            <div className="text-[11px] text-slate-700 leading-snug hidden lg:block mt-0.5">{p.short}</div>
          </div>
        </button>
      ))}
      <div className="hidden lg:block text-[11px] text-slate-500 text-center leading-relaxed pt-1">
        قطعه را بکش و روی میز رها کن. برای سیم‌کشی از یک پایانهٔ ⚪ به پایانهٔ دیگر بکش.
      </div>
    </div>
  );
}
