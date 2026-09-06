import { FACTOR_META, limitingExplanation, statusLabel, type ModelResult, type Params } from '../lib/model';

interface Props {
  model: ModelResult;
  params: Params;
  oxygen: number;
  glucose: number;
  time: number;
}

export default function RateCard({ model, params, oxygen, glucose, time }: Props) {
  const st = statusLabel(model.status);
  const ringColor = model.status === 'high' ? '#10b981' : model.status === 'medium' ? '#f59e0b' : '#f43f5e';
  const circumference = 2 * Math.PI * 44;
  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
      {/* نرخ فتوسنتز */}
      <div className={`flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm ${st.bg}`}>
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - model.rate / 100)}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums leading-none" style={{ color: ringColor }}>
              {model.rate}%
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-500">نرخ فتوسنتز (Photosynthesis Rate)</div>
          <div className={`mt-1 text-2xl font-black ${st.color}`}>
            {st.emoji} {st.text}
          </div>
          <div className="mt-2 text-xs text-slate-500">⏱ زمان شبیه‌سازی: {time.toFixed(0)} ثانیه</div>
        </div>
      </div>

      {/* عامل محدودکننده */}
      <div className={`rounded-2xl border-2 p-4 shadow-sm ${model.limiting ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <div className="text-sm font-semibold text-slate-500">عامل محدودکننده (Limiting Factor)</div>
        <div key={model.limiting ?? 'none'} className="animate-pop mt-1 text-2xl font-black text-slate-800">
          {model.limiting ? (
            <>
              {FACTOR_META[model.limiting].icon} {FACTOR_META[model.limiting].label}
            </>
          ) : (
            <>✅ هیچ‌کدام</>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">{limitingExplanation(model.limiting, params)}</p>
      </div>

      {/* محصولات */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">اکسیژن تولیدشده (O₂)</div>
          <div className="text-3xl font-black tabular-nums text-cyan-700">{Math.floor(oxygen)}</div>
          <div className="text-[11px] text-slate-500">مولکول</div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">گلوکز تولیدشده (C₆H₁₂O₆)</div>
          <div className="text-3xl font-black tabular-nums text-orange-700">{Math.floor(glucose)}</div>
          <div className="text-[11px] text-slate-500">مولکول</div>
        </div>
      </div>
    </div>
  );
}
