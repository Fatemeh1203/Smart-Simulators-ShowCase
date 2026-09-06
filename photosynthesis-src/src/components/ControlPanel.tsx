import { FACTOR_META, type FactorKey, type Params } from '../lib/model';

interface Props {
  params: Params;
  onChange: (patch: Partial<Params>) => void;
  factors: Record<FactorKey, number>;
  limiting: FactorKey | null;
  locked?: FactorKey[];
  compact?: boolean;
}

const GRADIENTS: Record<FactorKey, string> = {
  light: 'linear-gradient(90deg,#1e293b,#fbbf24,#fde047)',
  co2: 'linear-gradient(90deg,#e2e8f0,#64748b,#334155)',
  water: 'linear-gradient(90deg,#fde68a,#7dd3fc,#0284c7)',
  temp: 'linear-gradient(90deg,#60a5fa,#22c55e 45%,#f59e0b 70%,#ef4444)',
};

const HINTS: Record<FactorKey, (v: number) => string> = {
  light: (v) => (v < 25 ? 'نور کم — انرژی ناکافی' : v < 60 ? 'نور متوسط' : 'نور کافی'),
  co2: (v) => (v < 25 ? 'CO₂ کم — ماده اولیه ناکافی' : v < 60 ? 'CO₂ متوسط' : 'CO₂ کافی'),
  water: (v) => (v < 25 ? 'کم‌آبی — روزنه‌ها بسته می‌شوند' : v < 60 ? 'آب متوسط' : 'آب کافی'),
  temp: (v) => (v < 15 ? 'خیلی سرد — آنزیم‌ها کند' : v <= 33 ? 'دمای مناسب' : v < 40 ? 'گرم — کاهش فعالیت' : 'خیلی داغ — آسیب آنزیمی'),
};

export default function ControlPanel({ params, onChange, factors, limiting, locked = [], compact }: Props) {
  const keys: FactorKey[] = ['light', 'co2', 'water', 'temp'];
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {keys.map((k) => {
        const meta = FACTOR_META[k];
        const v = params[k];
        const isLim = limiting === k;
        const isLocked = locked.includes(k);
        const eff = Math.round(factors[k] * 100);
        return (
          <div
            key={k}
            className={`rounded-2xl border p-3 transition-all ${isLim ? 'border-rose-300 bg-rose-50/70 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]' : 'border-slate-200 bg-white'} ${isLocked ? 'opacity-60' : ''}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.icon}</span>
                <div>
                  <div className={`font-bold ${compact ? 'text-sm' : 'text-base'}`}>
                    {meta.label} <span className="text-xs font-normal text-slate-400">({meta.en})</span>
                  </div>
                  {!compact && <div className="text-[11px] text-slate-500">{HINTS[k](v)}</div>}
                </div>
              </div>
              <div className="text-left">
                <div className={`font-black tabular-nums ${compact ? 'text-lg' : 'text-2xl'}`} style={{ color: meta.color }}>
                  {v}
                  <span className="text-sm font-semibold">{meta.unit}</span>
                </div>
                {isLim && <div className="text-[10px] font-bold text-rose-600">⚠ محدودکننده</div>}
                {isLocked && <div className="text-[10px] font-bold text-slate-500">🔒 قفل</div>}
              </div>
            </div>
            <input
              type="range"
              className="sim-range"
              min={meta.min}
              max={meta.max}
              step={1}
              value={v}
              disabled={isLocked}
              onChange={(e) => onChange({ [k]: Number(e.target.value) } as Partial<Params>)}
              style={{ background: GRADIENTS[k], ['--thumb' as string]: meta.color }}
              aria-label={meta.label}
            />
            {!compact && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span>کارایی این عامل:</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${eff}%`, background: meta.color }} />
                </div>
                <span className="tabular-nums font-semibold">{eff}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
