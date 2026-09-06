import { useMemo, useState } from "react";
import { Ruler, Gauge, Activity, Radar, CircleDot, Crosshair, Database, Trash2, Download, X } from "lucide-react";
import { ToolId, useStore } from "../store";
import { cn } from "../utils/cn";
import { Button, Panel } from "../components/ui";
import { ScatterPlot } from "../components/Chart";

export const toolList: { id: ToolId; label: string; Icon: typeof Ruler; desc: string }[] = [
  { id: "ruler", label: "خط‌کش", Icon: Ruler, desc: "دو سر آن را بکشید؛ فاصله بر حسب سانتی‌متر" },
  { id: "voltmeter", label: "ولت‌متر", Icon: Gauge, desc: "پتانسیل الکتریکی در نقطهٔ کاوشگر سبز" },
  { id: "forcemeter", label: "نیروسنج", Icon: Activity, desc: "نیرو بر بار آزمون در نقطهٔ حسگر" },
  { id: "fieldsensor", label: "حسگر میدان", Icon: Radar, desc: "بردار و اندازهٔ E در نقطهٔ حسگر بنفش" },
  { id: "testcharge", label: "بار آزمون", Icon: CircleDot, desc: "بار آزمون در آزمایش میدان" },
  { id: "coords", label: "نشانگر مختصات", Icon: Crosshair, desc: "مختصات نشانگر ماوس (متر)" },
  { id: "logger", label: "Data Logger", Icon: Database, desc: "دکمهٔ «ثبت داده» روی صفحهٔ آزمایش" },
];

export function ToolBar({ compact }: { compact?: boolean }) {
  const { tools, toggleTool } = useStore();
  return (
    <div className="flex flex-wrap gap-1">
      {toolList.map(t => (
        <button key={t.id} title={t.desc} onClick={() => toggleTool(t.id)} className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all", tools[t.id] ? "bg-cyan-600 text-white shadow shadow-cyan-500/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}>
          <t.Icon size={13} /> {!compact && t.label}
        </button>
      ))}
    </div>
  );
}

export function DataLogger() {
  const { log, clearLog, removeLog } = useStore();
  const [xKey, setXKey] = useState(""); const [yKey, setYKey] = useState("");
  const keys = useMemo(() => { const s = new Set<string>(); log.forEach(r => Object.keys(r.values).forEach(k => { if (typeof r.values[k] === "number") s.add(k); })); return [...s]; }, [log]);
  const allKeys = useMemo(() => { const s = new Set<string>(); log.forEach(r => Object.keys(r.values).forEach(k => s.add(k))); return [...s]; }, [log]);
  const points = useMemo(() => log.filter(r => typeof r.values[xKey] === "number" && typeof r.values[yKey] === "number").map(r => ({ x: r.values[xKey] as number, y: r.values[yKey] as number })).sort((a, b) => a.x - b.x), [log, xKey, yKey]);

  const exportCSV = () => {
    const head = ["زمان", "آزمایش", ...allKeys];
    const rows = log.map(r => [r.time, r.experiment, ...allKeys.map(k => r.values[k] ?? "")]);
    const csv = "\uFEFF" + [head, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "lab-data.csv"; a.click();
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title={`Data Logger — ${log.length} رکورد`} icon={<Database size={14} className="text-cyan-500" />}>
        <div className="mb-2 flex gap-2">
          <Button variant="ghost" onClick={exportCSV} disabled={!log.length}><Download size={12} className="inline" /> CSV</Button>
          <Button variant="danger" onClick={clearLog} disabled={!log.length}><Trash2 size={12} className="inline" /> پاک کردن</Button>
        </div>
        {log.length === 0 ? <p className="text-xs text-slate-500">هنوز داده‌ای ثبت نشده است. در هر آزمایش دکمهٔ «ثبت داده» را بزنید.</p> : (
          <div className="max-h-72 overflow-auto">
            <table className="num w-full text-[11px]">
              <thead className="sticky top-0 bg-white dark:bg-slate-900"><tr className="text-slate-500"><th className="p-1 text-right">#</th><th className="p-1 text-right">آزمایش</th>{allKeys.map(k => <th key={k} className="p-1 whitespace-nowrap">{k}</th>)}<th></th></tr></thead>
              <tbody>{log.map((r, i) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-1">{i + 1}</td><td className="p-1 whitespace-nowrap text-right">{r.experiment}</td>{allKeys.map(k => <td key={k} className="p-1 text-center">{r.values[k] ?? ""}</td>)}<td><button onClick={() => removeLog(r.id)} className="text-rose-500"><X size={12} /></button></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel title="رسم نمودار از داده‌ها">
        <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
          <label>محور x<select value={xKey} onChange={e => setXKey(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"><option value="">—</option>{keys.map(k => <option key={k}>{k}</option>)}</select></label>
          <label>محور y<select value={yKey} onChange={e => setYKey(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"><option value="">—</option>{keys.map(k => <option key={k}>{k}</option>)}</select></label>
        </div>
        {points.length >= 2 ? <ScatterPlot points={points} xLabel={xKey} yLabel={yKey} height={220} /> : <p className="text-xs text-slate-500">دو ستون عددی را انتخاب کنید (حداقل ۲ رکورد).</p>}
      </Panel>
    </div>
  );
}

export function ToolsHelp() {
  return (
    <Panel title="جعبه‌ابزار آزمایشگاهی">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {toolList.map(t => (
          <div key={t.id} className="flex items-start gap-2 rounded-xl bg-slate-100/70 p-2 text-xs dark:bg-slate-800/60">
            <t.Icon size={16} className="mt-0.5 shrink-0 text-cyan-500" />
            <div><div className="font-bold">{t.label}</div><div className="text-[11px] text-slate-500">{t.desc}</div></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
