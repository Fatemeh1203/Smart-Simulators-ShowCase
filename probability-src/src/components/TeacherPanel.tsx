import { useState } from "react";
import { fmtInt, fmtPct, toFa, type ExperimentType } from "../lib/probability";
import type { SimStatus } from "../hooks/useSimulation";

interface Props {
  type: ExperimentType;
  focusLabel: string;
  theoretical: number;
  fraction: string | null;
  total: number;
  focusExp: number;
  status: SimStatus;
  onRunTo: (n: number) => void;
  onReset: () => void;
}

const STAGES = [10, 100, 1000, 10000];

export default function TeacherPanel({ type, focusLabel, theoretical, fraction, total, focusExp, status, onRunTo, onReset }: Props) {
  const [step, setStep] = useState(0);
  const word = type === "coin" ? "سکه را بیندازیم" : type === "dice" ? "تاس را بیندازیم" : "از کیسه توپ برداریم";
  const exp10 = 10 * theoretical;

  const steps = [
    {
      title: "۱. احتمال نظری را نشان دهید",
      body: (
        <>
          احتمال نظری «{focusLabel}» از ساختار آزمایش به‌دست می‌آید:{" "}
          <b className="num text-indigo-700">
            {fraction ? `${fraction} = ` : ""}
            {fmtPct(theoretical)}
          </b>
          . این عدد پیش از هر آزمایشی قابل محاسبه است.
        </>
      ),
    },
    {
      title: "۲. از دانش‌آموزان بپرسید",
      body: (
        <>
          «بچه‌ها، اگر ۱۰ بار {word}، آیا حتماً دقیقاً <b className="num">{toFa(Number(exp10.toFixed(1)))}</b> بار «{focusLabel}» می‌آید؟» — بگذارید حدس بزنند و دلیل بیاورند.
        </>
      ),
    },
    {
      title: "۳. فقط ۱۰ آزمایش",
      body: <>آزمایش را تا ۱۰ بار اجرا کنید. معمولاً نتیجه با مقدار نظری فاصله دارد؛ این نوسان تصادفی طبیعی است.</>,
      run: 10,
    },
    {
      title: "۴. تا ۱۰۰ آزمایش",
      body: <>حالا تعداد را به ۱۰۰ برسانید. به نمودار همگرایی نگاه کنید؛ خط آبی به خط قرمزِ نظری نزدیک‌تر می‌شود.</>,
      run: 100,
    },
    {
      title: "۵. تا ۱٬۰۰۰ آزمایش",
      body: <>با ۱٬۰۰۰ آزمایش، نوسان‌ها کوچک‌تر می‌شوند. از دانش‌آموزان بپرسید چه الگویی می‌بینند.</>,
      run: 1000,
    },
    {
      title: "۶. تا ۱۰٬۰۰۰ آزمایش",
      body: <>در ۱۰٬۰۰۰ آزمایش، احتمال تجربی معمولاً بسیار نزدیک به مقدار نظری است.</>,
      run: 10000,
    },
    {
      title: "۷. نتیجه‌گیری: قانون اعداد بزرگ",
      body: (
        <>
          احتمال نظری از ساختار آزمایش می‌آید؛ احتمال تجربی از نتایج واقعی. هرچه آزمایش‌های مستقل بیشتر شوند، احتمال تجربی <b>معمولاً</b> به احتمال نظری نزدیک‌تر می‌شود — اما هیچ‌گاه تضمینی برای نتیجه‌ی
          یک آزمایش منفرد وجود ندارد.
        </>
      ),
    },
  ];

  const s = steps[step];

  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-black text-emerald-800">👨‍🏫 راهنمای معلم (سناریوی کلاس)</h3>
        <span className="num text-sm font-bold text-emerald-700">
          گام {toFa(step + 1)} از {toFa(steps.length)}
        </span>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
        <div className="text-lg font-black text-slate-800">{s.title}</div>
        <p className="mt-2 text-base leading-8 text-slate-700">{s.body}</p>
        {s.run && (
          <button
            onClick={() => onRunTo(s.run!)}
            disabled={status === "running" || total >= s.run}
            className="mt-3 rounded-xl bg-emerald-600 px-5 py-2.5 text-base font-black text-white shadow hover:bg-emerald-700 disabled:opacity-40"
          >
            {total >= s.run ? `✓ به ${fmtInt(s.run)} آزمایش رسیدیم` : `▶ اجرا تا ${fmtInt(s.run)} آزمایش`}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 disabled:opacity-30">
          → گام قبل
        </button>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-emerald-600" : "bg-slate-300"}`} aria-label={`گام ${i + 1}`} />
          ))}
        </div>
        <button
          onClick={() => setStep((v) => Math.min(steps.length - 1, v + 1))}
          disabled={step === steps.length - 1}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-30"
        >
          گام بعد ←
        </button>
      </div>

      {/* Quick ladder */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-500">نردبان همگرایی (کل آزمایش‌ها تا این تعداد اجرا می‌شود):</div>
        <div className="flex flex-wrap items-center gap-2">
          {STAGES.map((n, i) => (
            <div key={n} className="flex items-center gap-2">
              <button
                onClick={() => onRunTo(n)}
                disabled={status === "running" || total >= n}
                className={`num rounded-xl px-4 py-2 text-base font-black shadow-sm transition ${total >= n ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50"} disabled:cursor-default`}
              >
                {total >= n ? "✓ " : ""}
                {fmtInt(n)}
              </button>
              {i < STAGES.length - 1 && <span className="text-slate-400">←</span>}
            </div>
          ))}
          <button onClick={onReset} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100">
            🔄 از نو
          </button>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          اکنون: <b className="num">{fmtInt(total)}</b> آزمایش — احتمال تجربی «{focusLabel}»: <b className="num text-indigo-700">{total ? fmtPct(focusExp) : "—"}</b> — نظری:{" "}
          <b className="num text-rose-600">{fmtPct(theoretical)}</b>
        </div>
      </div>
    </div>
  );
}
