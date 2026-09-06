import { useState } from "react";
import { Lock, Unlock, RotateCcw, GraduationCap, ClipboardList, Users } from "lucide-react";
import { useStore } from "../store";
import { experiments } from "../experiments";
import { Button, Panel } from "../components/ui";
import { cn } from "../utils/cn";

export function Teacher() {
  const { expId, setExpId, locks, toggleLock, initial, setInitial, question, setQuestion, results, clearResults, reset, setMode } = useStore();
  const meta = experiments.find(e => e.id === expId) ?? experiments[0];
  const [q, setQ] = useState(question);

  return (
    <div className="space-y-3">
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <GraduationCap size={18} className="text-amber-500" />
        <span className="text-sm font-bold">حالت معلم</span>
        <select value={expId} onChange={e => setExpId(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900">
          {experiments.map(e => <option key={e.id} value={e.id}>{e.icon} {e.title}</option>)}
        </select>
        <Button variant="ghost" onClick={reset}><RotateCcw size={12} className="inline" /> Reset آزمایش</Button>
        <Button onClick={() => setMode("lab")}>مشاهدهٔ آزمایش به‌عنوان دانش‌آموز</Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title={`پارامترهای اولیه و قفل — ${meta.title}`} icon={<Lock size={14} className="text-amber-500" />}>
          {meta.params.length === 0 && <p className="text-xs text-slate-500">این آزمایش پارامتر عددی قابل قفل ندارد.</p>}
          <div className="space-y-2">
            {meta.params.map(p => {
              const key = `${expId}.${p.id}`; const locked = !!locks[key];
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/70 p-2 text-xs dark:bg-slate-800/60">
                  <span className="w-28 font-semibold">{p.label} <span className="text-slate-400">({p.unit})</span></span>
                  <input dir="ltr" type="number" step="any" placeholder={`پیش‌فرض ${p.def}`} value={initial[key] ?? ""} onChange={e => setInitial(key, e.target.value === "" ? undefined : parseFloat(e.target.value))} className="num w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" />
                  <span className="text-[10px] text-slate-400">[{p.min} تا {p.max}]</span>
                  <button onClick={() => toggleLock(key)} className={cn("mr-auto flex items-center gap-1 rounded-lg px-2 py-1 font-bold", locked ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300")}>
                    {locked ? <Lock size={12} /> : <Unlock size={12} />} {locked ? "قفل" : "آزاد"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">مقدار اولیه با Reset اعمال می‌شود. پارامتر قفل‌شده برای دانش‌آموز غیرفعال است.</p>
        </Panel>

        <Panel title="سؤال آزمایش" icon={<ClipboardList size={14} className="text-cyan-500" />}>
          <div className="space-y-2 text-xs">
            <textarea value={q.text} onChange={e => setQ({ ...q, text: e.target.value })} rows={3} placeholder="مثلاً: نیروی بین دو بار ۲ و ۳ میکروکولن در فاصلهٔ ۲۰ سانتی‌متر چند نیوتون است؟" className="w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900" />
            <div className="grid grid-cols-3 gap-2">
              <label>پاسخ صحیح<input dir="ltr" type="number" step="any" value={q.expected ?? ""} onChange={e => setQ({ ...q, expected: e.target.value === "" ? null : parseFloat(e.target.value) })} className="num mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></label>
              <label>یکا<input value={q.unit} onChange={e => setQ({ ...q, unit: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></label>
              <label>خطای مجاز (٪)<input dir="ltr" type="number" value={q.tolerance} onChange={e => setQ({ ...q, tolerance: parseFloat(e.target.value) || 0 })} className="num mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" /></label>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setQuestion(q)}>ذخیرهٔ سؤال</Button>
              <Button variant="ghost" onClick={() => { const e = { text: "", expected: null, tolerance: 5, unit: "" }; setQ(e); setQuestion(e); }}>حذف سؤال</Button>
            </div>
            {question.text && <p className="text-emerald-600 dark:text-emerald-400">✓ سؤال فعال است و در پنل آموزشی دانش‌آموز نمایش داده می‌شود.</p>}
          </div>
        </Panel>
      </div>

      <Panel title="نتایج عملکرد دانش‌آموز" icon={<Users size={14} className="text-emerald-500" />}>
        <div className="mb-2 flex items-center gap-3 text-xs">
          <span>تعداد پاسخ‌ها: <b className="num">{results.length}</b></span>
          <span>درست: <b className="num text-emerald-500">{results.filter(r => r.correct).length}</b></span>
          <span>نادرست: <b className="num text-rose-500">{results.filter(r => r.correct === false).length}</b></span>
          <Button variant="ghost" className="mr-auto" onClick={clearResults} disabled={!results.length}>پاک کردن</Button>
        </div>
        {results.length === 0 ? <p className="text-xs text-slate-500">هنوز پاسخی ثبت نشده است.</p> : (
          <table className="num w-full text-xs">
            <thead><tr className="text-slate-500"><th className="p-1 text-right">زمان</th><th className="p-1 text-right">آزمایش</th><th className="p-1">پاسخ</th><th className="p-1">صحیح</th><th className="p-1">خطا</th><th className="p-1">نتیجه</th></tr></thead>
            <tbody>{results.map(r => (
              <tr key={r.id} className="border-t border-slate-100 text-center dark:border-slate-800"><td className="p-1 text-right">{r.time}</td><td className="p-1 text-right">{r.experiment}</td><td className="p-1">{r.answer}</td><td className="p-1">{r.expected ?? "—"}</td><td className="p-1">{r.errorPct !== null ? r.errorPct.toFixed(1) + "٪" : "—"}</td><td className={cn("p-1 font-bold", r.correct ? "text-emerald-500" : r.correct === false ? "text-rose-500" : "")}>{r.correct === null ? "بدون معیار" : r.correct ? "قبول" : "رد"}</td></tr>
            ))}</tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
