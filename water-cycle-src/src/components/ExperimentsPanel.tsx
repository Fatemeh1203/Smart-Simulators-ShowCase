import { useState } from "react";
import { EXPERIMENTS, type Experiment, type MetricKey } from "../data/content";
import { computeRates, DEFAULT_PARAMS, type Params, type Rates } from "../model/waterCycle";
import { cn } from "../utils/cn";

const REF_STATE = { vapor: 50, cloud: 70, surfaceWater: 60, groundwater: 40, raining: true, time: 0 };

function metricValue(r: Rates, key: MetricKey): { text: string; num: number } {
  if (key === "precipType")
    return { text: r.precipType === "snow" ? "❄️ برف" : r.precipType === "rain" ? "🌧️ باران" : "—", num: 0 };
  const v = r[key];
  return { text: Math.round(v).toString(), num: v };
}

interface Props {
  params: Params;
  applyParams: (p: Partial<Params>, start?: boolean) => void;
}

export default function ExperimentsPanel({ params, applyParams }: Props) {
  const [expId, setExpId] = useState<string | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  const exp: Experiment | undefined = EXPERIMENTS.find((e) => e.id === expId);

  const reset = () => {
    setExpId(null);
    setPrepared(false);
    setChoice(null);
    setShown(false);
  };

  if (!exp) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
          <div className="font-extrabold text-slate-800">🧪 آزمایش کن!</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            یک سناریو انتخاب کنید، پیش‌بینی کنید و سپس نتیجه را در شبیه‌ساز ببینید.
          </div>
        </div>
        {EXPERIMENTS.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setExpId(e.id);
              setPrepared(false);
              setChoice(null);
              setShown(false);
            }}
            className="w-full text-right rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow p-3 transition"
          >
            <div className="font-extrabold text-slate-800 text-sm">
              {e.icon} {e.title}
            </div>
            <div className="text-xs text-slate-500 mt-1">{e.description}</div>
          </button>
        ))}
      </div>
    );
  }

  const beforeP: Params = { ...DEFAULT_PARAMS, ...exp.before };
  const afterP: Params = { ...DEFAULT_PARAMS, ...exp.after };
  const rb = computeRates(beforeP, REF_STATE);
  const ra = computeRates(afterP, REF_STATE);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div className="font-extrabold text-slate-800 text-sm">
            {exp.icon} {exp.title}
          </div>
          <button onClick={reset} className="text-xs font-bold text-blue-700 hover:underline">
            ← همه‌ی آزمایش‌ها
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
      </div>

      {/* مرحله ۱: آماده‌سازی */}
      <div className={cn("rounded-xl border p-3", prepared ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200")}>
        <div className="text-xs font-extrabold text-slate-700 mb-2">مرحله ۱ — شرایط اولیه</div>
        <div className="flex flex-wrap gap-1.5 text-[11px] mb-2">
          {Object.entries(exp.before).map(([k, v]) => (
            <span key={k} className="rounded-md bg-slate-100 px-2 py-0.5 font-bold" dir="ltr">
              {paramLabel(k)}: {v}
            </span>
          ))}
        </div>
        <button
          onClick={() => {
            applyParams(exp.before, true);
            setPrepared(true);
          }}
          className={cn(
            "w-full rounded-lg py-2 text-sm font-bold transition",
            prepared ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {prepared ? "✓ شرایط اولیه اعمال شد (دوباره اعمال کن)" : "اعمال شرایط اولیه در شبیه‌ساز"}
        </button>
      </div>

      {/* مرحله ۲: پیش‌بینی */}
      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="text-xs font-extrabold text-slate-700 mb-1">مرحله ۲ — پیش‌بینی</div>
        <div className="text-sm font-bold text-slate-800 mb-2">{exp.question}</div>
        <div className="space-y-1.5">
          {exp.options.map((o, i) => {
            const isC = i === exp.correct;
            const picked = choice === i;
            return (
              <button
                key={i}
                disabled={shown}
                onClick={() => setChoice(i)}
                className={cn(
                  "w-full text-right rounded-lg border px-3 py-2 text-sm font-semibold transition",
                  !shown && picked && "border-blue-500 bg-blue-50 ring-2 ring-blue-300",
                  !shown && !picked && "border-slate-200 hover:border-blue-300",
                  shown && isC && "border-emerald-500 bg-emerald-50",
                  shown && picked && !isC && "border-red-400 bg-red-50",
                  shown && !picked && !isC && "border-slate-200 opacity-60"
                )}
              >
                <span className="inline-block w-5 font-extrabold text-slate-500">{["A", "B", "C"][i]}</span>
                {o}
                {shown && isC && " ✅"}
                {shown && picked && !isC && " ❌"}
              </button>
            );
          })}
        </div>
      </div>

      {/* مرحله ۳: مشاهده نتیجه */}
      <button
        disabled={choice === null}
        onClick={() => {
          applyParams(exp.after, true);
          setShown(true);
        }}
        className="w-full rounded-xl py-2.5 text-sm font-extrabold bg-gradient-to-l from-violet-600 to-blue-600 text-white shadow disabled:opacity-40 hover:opacity-95 transition"
      >
        👁️ مشاهده نتیجه
      </button>

      {shown && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
          <div
            className={cn(
              "rounded-lg p-2 text-sm font-extrabold",
              choice === exp.correct ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            )}
          >
            {choice === exp.correct ? "🎉 آفرین! پیش‌بینی شما درست بود." : "🤔 پیش‌بینی شما درست نبود؛ به نتیجه دقت کن."}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{exp.explanation}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-right py-1">شاخص</th>
                <th className="py-1">قبل</th>
                <th className="py-1">بعد</th>
                <th className="py-1">تغییر</th>
              </tr>
            </thead>
            <tbody>
              {exp.metrics.map((m) => {
                const b = metricValue(rb, m.key);
                const a = metricValue(ra, m.key);
                const diff = a.num - b.num;
                const isType = m.key === "precipType";
                return (
                  <tr key={m.key} className="border-t border-slate-100">
                    <td className="py-1.5 font-bold text-slate-700">{m.label}</td>
                    <td className="text-center tabular-nums">{b.text}</td>
                    <td className="text-center tabular-nums font-extrabold">{a.text}</td>
                    <td className="text-center">
                      {isType ? (
                        <span className="text-slate-600">{a.text !== b.text ? "تغییر کرد" : "—"}</span>
                      ) : (
                        <span
                          className={cn(
                            "font-extrabold",
                            diff > 1 ? "text-emerald-600" : diff < -1 ? "text-red-600" : "text-slate-500"
                          )}
                        >
                          {diff > 1 ? "▲ افزایش" : diff < -1 ? "▼ کاهش" : "بدون تغییر"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-[11px] text-slate-500">
            شرایط جدید در شبیه‌ساز اعمال شد؛ به صحنه نگاه کنید 👀 — مقدار فعلی: خورشید {params.sun}٪، دما {params.temp}°C،
            رطوبت {params.humidity}٪، پوشش گیاهی {params.vegetation}٪.
          </div>
          <button onClick={reset} className="w-full rounded-lg py-2 text-sm font-bold bg-slate-100 hover:bg-slate-200">
            آزمایش دیگری انتخاب کن
          </button>
        </div>
      )}
    </div>
  );
}

function paramLabel(k: string) {
  return (
    {
      sun: "خورشید",
      temp: "دما",
      humidity: "رطوبت",
      rain: "بارش",
      wind: "باد",
      vegetation: "گیاه",
    } as Record<string, string>
  )[k] ?? k;
}
