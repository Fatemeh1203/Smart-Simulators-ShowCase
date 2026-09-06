import type { Params } from "../model/waterCycle";
import { cn } from "../utils/cn";

interface SliderProps {
  icon: string;
  label: string;
  en: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  hint: string;
  onChange: (v: number) => void;
}

export function Slider({ icon, label, en, value, min, max, unit, color, hint, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{icon}</span>
          <div>
            <div className="text-sm font-bold text-slate-800">{label}</div>
            <div className="text-[10px] text-slate-400 font-medium" dir="ltr">
              {en}
            </div>
          </div>
        </div>
        <div
          className="text-sm font-extrabold tabular-nums px-2 py-0.5 rounded-lg text-white min-w-[58px] text-center"
          style={{ background: color }}
          dir="ltr"
        >
          {value}
          {unit}
        </div>
      </div>
      <input
        type="range"
        className="wc-range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--pct" as string]: `${pct}%`, ["--fill" as string]: color }}
        aria-label={label}
      />
      <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{hint}</div>
    </div>
  );
}

export const SPEEDS = [0.5, 1, 2, 5];

interface Props {
  params: Params;
  onChange: (p: Partial<Params>) => void;
  running: boolean;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeed: (s: number) => void;
}

export default function ControlPanel({
  params,
  onChange,
  running,
  speed,
  onStart,
  onPause,
  onReset,
  onSpeed,
}: Props) {
  const idx = SPEEDS.indexOf(speed);
  const faster = () => onSpeed(SPEEDS[Math.min(SPEEDS.length - 1, idx + 1)]);
  const slower = () => onSpeed(SPEEDS[Math.max(0, idx - 1)]);

  return (
    <div className="space-y-3">
      {/* کنترل‌های اصلی */}
      <div className="rounded-xl bg-white/80 border border-slate-200 p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={running ? onPause : onStart}
            className={cn(
              "col-span-1 rounded-lg py-2 text-sm font-bold text-white shadow transition active:scale-95",
              running ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700 wc-pulse"
            )}
          >
            {running ? "⏸ توقف" : "▶ شروع"}
          </button>
          <button
            onClick={onReset}
            className="rounded-lg py-2 text-sm font-bold bg-slate-700 hover:bg-slate-800 text-white shadow transition active:scale-95"
          >
            🔄 بازنشانی
          </button>
          <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
            <button
              onClick={slower}
              disabled={idx === 0}
              title="کاهش سرعت"
              className="flex-1 py-2 text-base hover:bg-slate-200 disabled:opacity-30"
            >
              🐢
            </button>
            <span className="text-xs font-extrabold text-slate-700 px-1 tabular-nums" dir="ltr">
              {speed}x
            </span>
            <button
              onClick={faster}
              disabled={idx === SPEEDS.length - 1}
              title="افزایش سرعت"
              className="flex-1 py-2 text-base hover:bg-slate-200 disabled:opacity-30"
            >
              ⏩
            </button>
          </div>
        </div>
        <div className="flex gap-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeed(s)}
              className={cn(
                "flex-1 rounded-md py-1 text-xs font-bold border transition",
                s === speed
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
              )}
              dir="ltr"
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <Slider
        icon="☀️"
        label="شدت تابش خورشید"
        en="Solar radiation"
        value={params.sun}
        min={0}
        max={100}
        unit="%"
        color="#f59e0b"
        hint="خورشید موتور چرخه آب است: تابش بیشتر → تبخیر و تعرق بیشتر → چرخه سریع‌تر."
        onChange={(v) => onChange({ sun: v })}
      />
      <Slider
        icon="🌡️"
        label="دما"
        en="Temperature"
        value={params.temp}
        min={-10}
        max={50}
        unit="°C"
        color="#ef4444"
        hint="دمای بالا → تبخیر بیشتر و ظرفیت بیشتر هوا برای بخار؛ زیر صفر → برف و یخ‌زدگی دریاچه."
        onChange={(v) => onChange({ temp: v })}
      />
      <Slider
        icon="💧"
        label="رطوبت هوا"
        en="Humidity"
        value={params.humidity}
        min={0}
        max={100}
        unit="%"
        color="#0ea5e9"
        hint="رطوبت بالا → هوا نزدیک اشباع → تراکم و تشکیل ابر سریع‌تر، اما تبخیر کندتر."
        onChange={(v) => onChange({ humidity: v })}
      />
      <Slider
        icon="🌧️"
        label="احتمال / شدت بارش"
        en="Precipitation"
        value={params.rain}
        min={0}
        max={100}
        unit="%"
        color="#2563eb"
        hint="وقتی ابر به آستانه‌ی بارش رسید، این مقدار شدت ریزش باران یا برف را تعیین می‌کند."
        onChange={(v) => onChange({ rain: v })}
      />
      <Slider
        icon="🌬️"
        label="سرعت باد"
        en="Wind speed"
        value={params.wind}
        min={0}
        max={100}
        unit="%"
        color="#64748b"
        hint="باد ابرها را جابه‌جا می‌کند، جهت حرکت بخار را تغییر می‌دهد و رطوبت را پراکنده می‌کند."
        onChange={(v) => onChange({ wind: v })}
      />
      <Slider
        icon="🌱"
        label="پوشش گیاهی"
        en="Vegetation"
        value={params.vegetation}
        min={0}
        max={100}
        unit="%"
        color="#16a34a"
        hint="گیاه بیشتر → تعرق و نفوذ بیشتر، روان‌آب کمتر. جنگل‌زدایی → سیل و فرسایش."
        onChange={(v) => onChange({ vegetation: v })}
      />
    </div>
  );
}
