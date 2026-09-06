import { TOOL_INFO } from "../lab/objects";
import type { ObjKind } from "../lab/types";
import { CANVAS_H, CANVAS_W } from "../lab/types";
import type { LabApi } from "../lab/useLab";
import { playChime } from "../lab/store";

const ALL_TOOLS: ObjKind[] = ["source", "mirror", "convex", "concave", "glass", "water", "protractor", "target"];

export default function Toolbar({ lab, tools = ALL_TOOLS, compact }: { lab: LabApi; tools?: ObjKind[]; compact?: boolean }) {
  return (
    <div className="rounded-3xl border-4 border-white bg-gradient-to-b from-sky-100 to-indigo-100 p-3 shadow-[0_6px_0_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-center gap-2 text-base font-black text-indigo-800">
        🧰 جعبه ابزار
        <span className="mr-auto text-xs font-bold text-indigo-500">بکش روی میز یا لمس کن</span>
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-4 lg:grid-cols-8" : "grid-cols-4 lg:grid-cols-2"}`}>
        {tools.map((k) => {
          const t = TOOL_INFO[k];
          return (
            <button
              type="button"
              key={k}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("tool", k);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => {
                playChime("click");
                lab.add(k, CANVAS_W / 2 + (Math.random() * 120 - 60), CANVAS_H / 2 + (Math.random() * 80 - 40));
              }}
              title={t.hint}
              className="group flex cursor-grab flex-col items-center gap-1 rounded-2xl border-2 border-white bg-white/80 px-2 py-2 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md active:cursor-grabbing active:scale-95"
            >
              <span className="text-3xl transition group-hover:scale-110">{t.emoji}</span>
              <span className="text-xs font-bold text-slate-700">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
