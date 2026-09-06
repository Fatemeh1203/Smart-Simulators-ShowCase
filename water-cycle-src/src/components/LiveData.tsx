import type { Params, Rates } from "../model/waterCycle";

interface Props {
  params: Params;
  rates: Rates;
}

function Metric({
  icon,
  label,
  value,
  unit,
  color,
  bar,
}: {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  color: string;
  bar?: number;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-sm min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold truncate">
        <span>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1" dir="ltr">
        <span className="text-lg font-extrabold tabular-nums" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-bold">{unit}</span>}
      </div>
      {bar !== undefined && (
        <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, bar))}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}

export default function LiveData({ params, rates }: Props) {
  const f = (n: number) => Math.round(n).toString();
  const precipLabel =
    rates.precipType === "snow" ? "❄️ برف" : rates.precipType === "rain" ? "🌧️ باران" : "—";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
      <Metric icon="🌡️" label="دما" value={String(params.temp)} unit="°C" color="#ef4444" bar={((params.temp + 10) / 60) * 100} />
      <Metric icon="💧" label="رطوبت" value={String(params.humidity)} unit="%" color="#0ea5e9" bar={params.humidity} />
      <Metric icon="☀️" label="شدت تبخیر" value={f(rates.evaporation)} color="#f59e0b" bar={rates.evaporation} />
      <Metric icon="☁️" label="تراکم ابر" value={f(rates.cloudDensity)} unit="%" color="#64748b" bar={rates.cloudDensity} />
      <Metric icon="🌧️" label={`شدت بارش (${precipLabel})`} value={f(rates.precipitation)} color="#2563eb" bar={rates.precipitation} />
      <Metric icon="🏞️" label="میزان روان‌آب" value={f(rates.runoff)} color="#0891b2" bar={rates.runoff} />
      <Metric icon="⬇️" label="میزان نفوذ" value={f(rates.infiltration)} color="#ea580c" bar={rates.infiltration} />
      <Metric icon="🌊" label="آب سطحی" value={f(rates.surfaceWater)} unit="%" color="#4338ca" bar={rates.surfaceWater} />
    </div>
  );
}
