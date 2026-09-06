import { useMemo, useState } from 'react';
import { clampParams, computeModel, FACTOR_META, type FactorKey, type ModelResult, type Params } from '../lib/model';

interface Props {
  params: Params;
  model: ModelResult;
  onAnimateTo: (target: Partial<Params>) => void;
  onExit: () => void;
}

type Op = 'double' | 'half' | 'max' | 'min' | 'up10' | 'down10';

const OPS: { id: Op; label: string; question: (f: string) => string; forTemp?: boolean; notTemp?: boolean }[] = [
  { id: 'double', label: '× ۲ (دو برابر)', question: (f) => `اگر ${f} را دو برابر کنیم چه اتفاقی می‌افتد؟`, notTemp: true },
  { id: 'half', label: '÷ ۲ (نصف)', question: (f) => `اگر ${f} را نصف کنیم چه اتفاقی می‌افتد؟`, notTemp: true },
  { id: 'max', label: 'حداکثر', question: (f) => `اگر ${f} را به حداکثر برسانیم چه اتفاقی می‌افتد؟` },
  { id: 'min', label: 'حداقل', question: (f) => `اگر ${f} را به حداقل برسانیم چه اتفاقی می‌افتد؟` },
  { id: 'up10', label: '+۱۰ درجه', question: (f) => `اگر ${f} را ۱۰ درجه بالا ببریم چه اتفاقی می‌افتد؟`, forTemp: true },
  { id: 'down10', label: '−۱۰ درجه', question: (f) => `اگر ${f} را ۱۰ درجه پایین بیاوریم چه اتفاقی می‌افتد؟`, forTemp: true },
];

function applyOp(p: Params, key: FactorKey, op: Op): Params {
  const meta = FACTOR_META[key];
  const v = p[key];
  let nv = v;
  switch (op) {
    case 'double':
      nv = v === 0 ? 20 : v * 2;
      break;
    case 'half':
      nv = v / 2;
      break;
    case 'max':
      nv = meta.max;
      break;
    case 'min':
      nv = meta.min;
      break;
    case 'up10':
      nv = v + 10;
      break;
    case 'down10':
      nv = v - 10;
      break;
  }
  return clampParams({ ...p, [key]: nv });
}

export default function TeacherMode({ params, model, onAnimateTo, onExit }: Props) {
  const [factor, setFactor] = useState<FactorKey>('light');
  const [op, setOp] = useState<Op>('double');
  const [prediction, setPrediction] = useState<'up' | 'down' | 'same' | null>(null);
  const [revealed, setRevealed] = useState<{ before: ModelResult; after: ModelResult; beforeP: Params; afterP: Params } | null>(null);

  const availableOps = OPS.filter((o) => (factor === 'temp' ? !o.notTemp : !o.forTemp));
  const currentOp = availableOps.find((o) => o.id === op) ?? availableOps[0];
  const question = currentOp.question(FACTOR_META[factor].label);

  const target = useMemo(() => applyOp(params, factor, currentOp.id), [params, factor, currentOp.id]);

  const reveal = () => {
    const after = computeModel(target);
    setRevealed({ before: model, after, beforeP: params, afterP: target });
    onAnimateTo({ [factor]: target[factor] });
  };

  const newQuestion = () => {
    setRevealed(null);
    setPrediction(null);
  };

  const actual = revealed ? (revealed.after.rate > revealed.before.rate + 2 ? 'up' : revealed.after.rate < revealed.before.rate - 2 ? 'down' : 'same') : null;

  const explanation = () => {
    if (!revealed) return '';
    const { before, after } = revealed;
    const f = FACTOR_META[factor].label;
    if (actual === 'same') {
      return before.limiting && before.limiting !== factor
        ? `تغییر ${f} تقریباً اثری نداشت، چون عامل محدودکننده «${FACTOR_META[before.limiting].label}» است. تا وقتی آن عامل بهبود نیابد، افزایش ${f} فایده‌ای ندارد.`
        : `تغییر ${f} اثر کمی داشت، چون این عامل از قبل در محدوده‌ی اشباع بود.`;
    }
    if (actual === 'up') {
      return `نرخ فتوسنتز از ${before.rate}٪ به ${after.rate}٪ افزایش یافت، چون ${f} عامل محدودکننده بود و بهبود آن گلوگاه را باز کرد.${after.limiting ? ` اکنون عامل محدودکننده‌ی جدید «${FACTOR_META[after.limiting].label}» است.` : ' اکنون هیچ عامل محدودکننده‌ای وجود ندارد.'}`;
    }
    return `نرخ فتوسنتز از ${before.rate}٪ به ${after.rate}٪ کاهش یافت. با این تغییر، «${FACTOR_META[after.limiting ?? factor].label}» عامل محدودکننده شد و کل فرآیند را کند کرد.`;
  };

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800">👨‍🏫 حالت معلم (Teacher Mode)</h3>
        <button onClick={onExit} className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300">
          خروج
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-500">یک عامل و نوع تغییر را انتخاب کنید، سؤال را از دانش‌آموزان بپرسید، پیش‌بینی‌شان را ثبت کنید و سپس «نمایش پاسخ» را بزنید.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold text-slate-600">۱) کدام عامل؟</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FACTOR_META) as FactorKey[]).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setFactor(k);
                  setOp(k === 'temp' ? 'up10' : 'double');
                  newQuestion();
                }}
                className={`rounded-xl border px-3 py-1.5 text-sm font-bold transition-all ${factor === k ? 'border-blue-500 bg-blue-500 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}
              >
                {FACTOR_META[k].icon} {FACTOR_META[k].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold text-slate-600">۲) چه تغییری؟</div>
          <div className="flex flex-wrap gap-2">
            {availableOps.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setOp(o.id);
                  newQuestion();
                }}
                className={`rounded-xl border px-3 py-1.5 text-sm font-bold transition-all ${currentOp.id === o.id ? 'border-indigo-500 bg-indigo-500 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4">
        <div className="text-xs font-bold text-blue-600">سؤال کلاس:</div>
        <div className="mt-1 text-xl font-black text-slate-800">«{question}»</div>
        <div className="mt-1 text-xs text-slate-500">
          مقدار فعلی: {params[factor]}
          {FACTOR_META[factor].unit} ← بعد از تغییر: {target[factor]}
          {FACTOR_META[factor].unit} — نرخ فعلی فتوسنتز: {model.rate}%
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600">۳) پیش‌بینی دانش‌آموزان:</span>
          {(
            [
              ['up', '📈 افزایش می‌یابد'],
              ['down', '📉 کاهش می‌یابد'],
              ['same', '➖ تغییری نمی‌کند'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPrediction(id)}
              disabled={!!revealed}
              className={`rounded-xl border px-3 py-1.5 text-sm font-bold transition-all ${prediction === id ? 'border-amber-500 bg-amber-100 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'} ${revealed ? 'opacity-70' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!revealed ? (
            <button onClick={reveal} className="pulse-glow rounded-xl bg-emerald-600 px-6 py-2.5 text-base font-black text-white shadow-lg hover:bg-emerald-700">
              ▶ نمایش پاسخ (اجرای تغییر در شبیه‌ساز)
            </button>
          ) : (
            <button onClick={newQuestion} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-blue-700">
              ❓ سؤال جدید
            </button>
          )}
        </div>

        {revealed && (
          <div className="fade-up mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <div className="text-[11px] text-slate-500">قبل</div>
                <div className="text-3xl font-black text-slate-700">{revealed.before.rate}%</div>
              </div>
              <div className="text-3xl text-emerald-600">←</div>
              <div className="text-center">
                <div className="text-[11px] text-slate-500">بعد</div>
                <div className={`text-3xl font-black ${actual === 'up' ? 'text-emerald-600' : actual === 'down' ? 'text-rose-600' : 'text-amber-600'}`}>{revealed.after.rate}%</div>
              </div>
              <div className="flex-1 text-sm font-bold text-slate-800">
                پاسخ: {actual === 'up' ? '📈 افزایش می‌یابد' : actual === 'down' ? '📉 کاهش می‌یابد' : '➖ تقریباً تغییری نمی‌کند'}
                {prediction && (
                  <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${prediction === actual ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {prediction === actual ? '✅ پیش‌بینی درست بود' : '❌ پیش‌بینی نادرست بود'}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700">{explanation()}</p>
            <p className="mt-1 text-xs text-slate-500">👀 به انیمیشن گیاه، شمارنده اکسیژن و نمودار زنده نگاه کنید تا تغییر را ببینید.</p>
          </div>
        )}
      </div>
    </div>
  );
}
