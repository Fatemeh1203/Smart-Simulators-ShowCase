import { TOOL_INFO } from "../lab/objects";
import { deg, fa } from "../lab/format";
import type { LabApi } from "../lab/useLab";
import { KidButton, Panel, Toggle } from "./ui";

export default function Inspector({ lab, lockRays }: { lab: LabApi; lockRays?: boolean }) {
  const o = lab.selected;
  return (
    <Panel title="تنظیمات" emoji="🎛️">
      <div className="mb-3 flex flex-wrap gap-2">
        {!lockRays && <Toggle checked={lab.showRays} onChange={lab.setShowRays} label={lab.showRays ? "پرتوها روشن" : "پرتوها خاموش"} />}
        <button type="button" onClick={lab.reset} className="rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200">
          🔄 از اول
        </button>
      </div>
      {!o ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">👆 روی یک وسیله در میز بزن تا بتوانی آن را تنظیم کنی. دایره نارنجی ↻ را بکش تا بچرخد.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-black text-slate-700">
            <span className="text-3xl">{TOOL_INFO[o.kind].emoji}</span> {o.label ?? TOOL_INFO[o.kind].name}
          </div>
          <p className="text-xs font-bold text-slate-500">{TOOL_INFO[o.kind].hint}</p>

          {o.rotatable !== false && (
            <label className="block">
              <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                <span>🔁 زاویه</span>
                <span className="rounded-lg bg-orange-100 px-2 text-orange-700">{deg(o.angle)}</span>
              </div>
              <input type="range" min={0} max={359} value={Math.round(o.angle)} onChange={(e) => lab.update(o.id, { angle: Number(e.target.value) })} className="w-full" />
              <div className="mt-1 flex gap-1">
                {[-15, -5, 5, 15].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => lab.update(o.id, { angle: (((o.angle + d) % 360) + 360) % 360 })}
                    className="flex-1 rounded-lg bg-slate-100 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    {d > 0 ? `+${fa(d)}` : `−${fa(-d)}`}
                  </button>
                ))}
              </div>
            </label>
          )}

          {o.kind === "source" && (
            <>
              <div>
                <div className="mb-1 text-sm font-bold text-slate-600">✨ شکل پرتو</div>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      ["single", "یک پرتو"],
                      ["fan", "بادبزنی"],
                      ["parallel", "موازی"],
                    ] as const
                  ).map(([m, name]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => lab.update(o.id, { rayMode: m, rayCount: m === "single" ? 1 : Math.max(3, o.rayCount ?? 5), spread: m === "parallel" ? 16 : 30 })}
                      className={`rounded-xl py-1.5 text-xs font-bold ${(o.rayMode ?? "single") === m ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              {(o.rayMode ?? "single") !== "single" && (
                <label className="block">
                  <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                    <span>تعداد پرتو</span>
                    <span>{fa(o.rayCount ?? 3)}</span>
                  </div>
                  <input type="range" min={2} max={7} value={o.rayCount ?? 3} onChange={(e) => lab.update(o.id, { rayCount: Number(e.target.value) })} className="w-full" />
                </label>
              )}
            </>
          )}

          {(o.kind === "convex" || o.kind === "concave") && (
            <label className="block">
              <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                <span>💪 قدرت عدسی</span>
                <span>{fa(Math.round(400 - Math.abs(o.focal ?? 160)))}</span>
              </div>
              <input
                type="range"
                min={80}
                max={320}
                value={400 - Math.abs(o.focal ?? 160)}
                onChange={(e) => {
                  const f = 400 - Number(e.target.value);
                  lab.update(o.id, { focal: o.kind === "convex" ? f : -f });
                }}
                className="w-full"
              />
            </label>
          )}

          {o.kind === "water" && (
            <Toggle checked={!!o.showPencil} onChange={(v) => lab.update(o.id, { showPencil: v })} label="✏️ مداد داخل آب" />
          )}

          {o.deletable !== false && (
            <KidButton onClick={() => lab.remove(o.id)} color="bg-rose-400 text-white" className="w-full !py-2 !text-base">
              🗑️ حذف این وسیله
            </KidButton>
          )}
        </div>
      )}
    </Panel>
  );
}
