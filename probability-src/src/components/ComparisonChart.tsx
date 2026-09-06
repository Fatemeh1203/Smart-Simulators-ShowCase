import { fmtInt, fmtPct, type OutcomeDef } from "../lib/probability";

interface Row {
  def: OutcomeDef;
  theo: number;
  count: number;
  exp: number;
  focus?: boolean;
}

interface Props {
  rows: Row[];
  total: number;
  eventRow?: Row | null;
}

export default function ComparisonChart({ rows, total, eventRow }: Props) {
  const all = eventRow ? [...rows, eventRow] : rows;
  const maxVal = Math.max(0.1, ...all.map((r) => Math.max(r.theo, r.exp)));
  const scale = (v: number) => `${(v / maxVal) * 85}%`;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded-sm bg-slate-300" /> احتمال نظری (Theoretical)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded-sm bg-indigo-500" /> احتمال تجربی (Experimental)
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-around gap-2 rounded-2xl bg-slate-50 px-2 pt-6 pb-2" style={{ height: 240 }}>
        {all.map((r) => (
          <div key={r.def.id + r.def.label} className={`flex h-full flex-1 flex-col items-center justify-end ${r === eventRow ? "border-r border-dashed border-slate-300 pr-2" : ""}`}>
            <div className="flex h-full w-full max-w-[90px] items-end justify-center gap-1">
              <div className="flex h-full w-1/2 flex-col items-center justify-end">
                <span className="num mb-1 text-[11px] font-bold text-slate-500">{fmtPct(r.theo, 1)}</span>
                <div className="w-full rounded-t-md bg-slate-300 transition-all duration-300" style={{ height: scale(r.theo) }} />
              </div>
              <div className="flex h-full w-1/2 flex-col items-center justify-end">
                <span className="num mb-1 text-[11px] font-bold text-indigo-600">{total ? fmtPct(r.exp, 1) : "—"}</span>
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{ height: total ? scale(r.exp) : "0%", background: r.def.color }}
                />
              </div>
            </div>
            <div className={`mt-2 flex items-center gap-1 text-sm font-bold ${r.focus ? "text-indigo-700" : "text-slate-700"}`}>
              <span>{r.def.emoji}</span>
              <span>{r.def.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2 text-right font-semibold">نتیجه (Event)</th>
              <th className="py-2 text-center font-semibold">تعداد</th>
              <th className="py-2 text-center font-semibold">نظری</th>
              <th className="py-2 text-center font-semibold">تجربی</th>
              <th className="py-2 text-center font-semibold">اختلاف</th>
            </tr>
          </thead>
          <tbody>
            {all.map((r) => (
              <tr key={"t" + r.def.id + r.def.label} className={`border-t border-slate-100 ${r.focus ? "bg-indigo-50/60" : ""}`}>
                <td className="py-2 font-bold text-slate-800">
                  <span className="ml-1">{r.def.emoji}</span>
                  {r.def.label}
                  {r === eventRow && <span className="mr-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">رویداد</span>}
                </td>
                <td className="num py-2 text-center">{fmtInt(r.count)}</td>
                <td className="num py-2 text-center text-slate-600">{fmtPct(r.theo)}</td>
                <td className="num py-2 text-center font-bold text-indigo-700">{total ? fmtPct(r.exp) : "—"}</td>
                <td className="num py-2 text-center">
                  {total ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${Math.abs(r.exp - r.theo) < 0.02 ? "bg-emerald-100 text-emerald-700" : Math.abs(r.exp - r.theo) < 0.05 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                      {fmtPct(Math.abs(r.exp - r.theo))}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
