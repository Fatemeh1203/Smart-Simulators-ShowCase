import { Params, SURFACES, SurfaceKey, surfaceForMu } from "../physics";
import { SimStatus } from "../useSimulation";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
          <input
            type="number"
            className="num w-16 bg-transparent text-left text-sm font-bold text-slate-900 outline-none"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
          />
          <span className="text-xs font-semibold text-slate-500 num">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="slider"
        style={{ ["--pct" as string]: `${pct}%`, ["--slider-color" as string]: color }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[11px] text-slate-400 num">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {hint && <p className="text-xs text-slate-500 leading-5">{hint}</p>}
    </div>
  );
}

export function SurfacePicker({ mu, onPick }: { mu: number; onPick: (k: SurfaceKey, mu: number) => void }) {
  const active = surfaceForMu(mu);
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">نوع سطح</label>
      <div className="grid grid-cols-4 gap-2">
        {SURFACES.map((s) => (
          <button
            key={s.key}
            onClick={() => onPick(s.key, s.mu)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 text-xs font-semibold transition ${
              active === s.key
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="text-xl leading-none">{s.emoji}</span>
            <span>{s.label}</span>
            <span className="num text-[10px] text-slate-400">μ={s.mu}</span>
          </button>
        ))}
      </div>
      {active === "custom" && <p className="text-xs text-slate-500">سطح سفارشی (ضریب اصطکاک دستی)</p>}
    </div>
  );
}

export function ParamControls({
  params,
  onChange,
  compact,
  accent = "#4f46e5",
}: {
  params: Params;
  onChange: (p: Params) => void;
  compact?: boolean;
  accent?: string;
}) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <Slider
        label="جرم جسم (m)"
        value={params.mass}
        min={1}
        max={100}
        step={1}
        unit="kg"
        color={accent}
        onChange={(v) => onChange({ ...params, mass: v })}
      />
      <Slider
        label="نیروی واردشده (F)"
        value={params.force}
        min={0}
        max={500}
        step={5}
        unit="N"
        color="#16a34a"
        onChange={(v) => onChange({ ...params, force: v })}
      />
      <Slider
        label="ضریب اصطکاک (μ)"
        value={params.mu}
        min={0}
        max={1}
        step={0.01}
        unit=""
        color="#dc2626"
        onChange={(v) => onChange({ ...params, mu: Math.round(v * 100) / 100 })}
      />
      <Slider
        label="سرعت اولیه (v₀)"
        value={params.v0}
        min={0}
        max={20}
        step={0.5}
        unit="m/s"
        color="#0891b2"
        onChange={(v) => onChange({ ...params, v0: v })}
      />
    </div>
  );
}

export function SimButtons({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  size = "md",
}: {
  status: SimStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  size?: "md" | "sm";
}) {
  const base =
    size === "sm"
      ? "rounded-lg px-3 py-1.5 text-xs font-bold"
      : "rounded-xl px-4 py-2.5 text-sm font-bold";
  const dis = "disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onStart}
        className={`${base} ${dis} bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-1.5`}
      >
        <span>▶</span> {status === "idle" ? "شروع آزمایش" : "اجرای دوباره"}
      </button>
      <button
        onClick={onPause}
        disabled={status !== "running"}
        className={`${base} ${dis} bg-amber-500 text-white shadow-md shadow-amber-200 hover:bg-amber-600 transition flex items-center gap-1.5`}
      >
        <span>⏸</span> توقف
      </button>
      <button
        onClick={onResume}
        disabled={status !== "paused"}
        className={`${base} ${dis} bg-sky-600 text-white shadow-md shadow-sky-200 hover:bg-sky-700 transition flex items-center gap-1.5`}
      >
        <span>⏵</span> ادامه
      </button>
      <button
        onClick={onReset}
        className={`${base} ${dis} bg-slate-200 text-slate-800 hover:bg-slate-300 transition flex items-center gap-1.5`}
      >
        <span>↺</span> بازنشانی
      </button>
    </div>
  );
}

export function TimeScale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      <span className="px-2 text-xs font-semibold text-slate-500">سرعت پخش</span>
      {[0.25, 0.5, 1, 2].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`num rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            value === v ? "bg-white text-indigo-700 shadow" : "text-slate-600 hover:bg-white/60"
          }`}
        >
          {v}×
        </button>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: SimStatus }) {
  const map: Record<SimStatus, { t: string; c: string }> = {
    idle: { t: "آماده", c: "bg-slate-100 text-slate-600" },
    running: { t: "در حال اجرا", c: "bg-emerald-100 text-emerald-700" },
    paused: { t: "متوقف شده", c: "bg-amber-100 text-amber-700" },
    finished: { t: "پایان یافت", c: "bg-indigo-100 text-indigo-700" },
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status].c}`}>{map[status].t}</span>;
}
