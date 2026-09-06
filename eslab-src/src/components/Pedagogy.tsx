import { useState } from "react";
import { BookOpen, CheckCircle2, FlaskConical, Lightbulb, Target, XCircle, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { ExperimentMeta } from "../experiments/types";
import { useStore } from "../store";
import { cn } from "../utils/cn";
import { Button } from "./ui";

const stages = [
  { label: "پیش‌بینی", icon: Target },
  { label: "آزمایش", icon: FlaskConical },
  { label: "مشاهده و تحلیل", icon: BookOpen },
  { label: "نتیجه‌گیری", icon: Lightbulb },
];

export function Pedagogy({ meta }: { meta: ExperimentMeta }) {
  const { stage, setStage, predictions, setPrediction, question, submitAnswer, results } = useStore();
  const pred = predictions[meta.id];
  const [answer, setAnswer] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const predIdx = pred !== undefined ? +pred : -1;
  const myResults = results.filter(r => r.experiment === meta.title);

  return (
    <div className="glass rounded-2xl p-4">
      {/* stepper */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => setStage(i)} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all", stage === i ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30" : i < stage ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
              <Icon size={14} /> {i + 1}. {s.label}
            </button>
          );
        })}
      </div>

      {stage === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">{meta.prediction.question}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {meta.prediction.options.map((o, i) => (
              <button key={i} onClick={() => setPrediction(meta.id, String(i))} className={cn("rounded-xl border px-3 py-2 text-right text-xs transition-all", predIdx === i ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200" : "border-slate-200 hover:border-cyan-400 dark:border-slate-700")}>
                {o}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">پاسخ شما ثبت می‌شود و در مرحلهٔ نتیجه‌گیری با نتیجهٔ آزمایش مقایسه خواهد شد. هنوز فرمولی نشان داده نمی‌شود؛ خودتان کشف کنید!</p>
        </div>
      )}

      {stage === 1 && (
        <div className="space-y-2 text-sm">
          <p className="font-semibold">حالا آزمایش کنید:</p>
          <ul className="list-disc space-y-1 pr-5 text-xs text-slate-600 dark:text-slate-300">
            <li>پارامترها را از پنل سمت راست تغییر دهید یا اجسام را با ماوس/لمس جابه‌جا کنید.</li>
            <li>با دکمهٔ «ثبت داده» روی صفحهٔ آزمایش، مقادیر لحظه‌ای را در Data Logger ذخیره کنید.</li>
            <li>حداقل ۴ حالت مختلف را ثبت کنید تا در مرحلهٔ بعد نمودار معنی‌داری داشته باشید.</li>
          </ul>
          <div className="rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-800/60">{meta.definition}</div>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-2 text-sm">
          <p className="font-semibold">به نمودارها و داده‌های پایین صفحه نگاه کنید و به این پرسش‌ها پاسخ دهید:</p>
          <ul className="space-y-1.5 pr-1 text-xs text-slate-600 dark:text-slate-300">
            {meta.analysis.map((a, i) => <li key={i} className="flex gap-2"><span className="text-cyan-500">◆</span>{a}</li>)}
          </ul>
        </div>
      )}

      {stage === 3 && (
        <div className="space-y-3 text-sm">
          {predIdx >= 0 && (
            <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold", predIdx === meta.prediction.correct ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300")}>
              {predIdx === meta.prediction.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              پیش‌بینی شما: «{meta.prediction.options[predIdx]}» — {predIdx === meta.prediction.correct ? "درست بود! آفرین." : `درست نبود. پاسخ صحیح: «${meta.prediction.options[meta.prediction.correct]}»`}
            </div>
          )}
          {predIdx < 0 && <p className="text-xs text-amber-600">شما پیش‌بینی ثبت نکرده‌اید. به مرحلهٔ ۱ برگردید.</p>}
          <div className="space-y-2">{meta.conclusion}</div>
        </div>
      )}

      {/* teacher question */}
      {question.text && (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-50/60 p-3 dark:bg-amber-950/20">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300"><GraduationCap size={14} /> سؤال معلم</div>
          <p className="mb-2 text-sm">{question.text}</p>
          <div className="flex gap-2">
            <input dir="ltr" value={answer} onChange={e => setAnswer(e.target.value)} placeholder={`پاسخ عددی ${question.unit ? `(${question.unit})` : ""}`} className="num w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
            <Button onClick={() => { const v = parseFloat(answer); if (!isNaN(v)) { const r = submitAnswer(meta.title, v); setLast(r.correct === null ? "ثبت شد." : r.correct ? `درست! خطا ${r.errorPct!.toFixed(1)}٪` : `نادرست. خطا ${r.errorPct!.toFixed(1)}٪ (مجاز: ${question.tolerance}٪)`); } }}>ارسال</Button>
          </div>
          {last && <p className="mt-1 text-xs font-semibold">{last}</p>}
          {myResults.length > 0 && <p className="mt-1 text-[11px] text-slate-500">تعداد تلاش‌ها: {myResults.length}</p>}
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0}><ChevronRight size={14} className="inline" /> قبلی</Button>
        <Button onClick={() => setStage(Math.min(3, stage + 1))} disabled={stage === 3}>بعدی <ChevronLeft size={14} className="inline" /></Button>
      </div>
    </div>
  );
}
