import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Trait } from "../genetics/data";
import { phenotypeShortLabel, type CrossAnalysis } from "../genetics/engine";

export interface HistoryPoint {
  n: number;
  geno: Record<string, number>;
  pheno: Record<string, number>;
}

interface Props {
  analysis: CrossAnalysis;
  history: HistoryPoint[];
  traits: Trait[];
  hideTheory?: boolean;
}

export default function Convergence({ analysis, history, traits, hideTheory }: Props) {
  const options = useMemo(() => {
    const p = analysis.phenotypeOrder.map((k) => ({ id: "p:" + k, label: "فنوتیپ " + phenotypeShortLabel(k, traits), prob: analysis.phenotypeProb[k] }));
    const g = analysis.genotypeOrder.map((k) => ({ id: "g:" + k, label: "ژنوتیپ " + k, prob: analysis.genotypeProb[k] }));
    return [...p, ...g];
  }, [analysis, traits]);

  const [sel, setSel] = useState<string>(options[0]?.id ?? "");
  const current = options.find((o) => o.id === sel) ?? options[0];
  const [logScale, setLogScale] = useState(true);

  const data = useMemo(() => {
    if (!current) return [];
    const [type, key] = current.id.split(":");
    return history.map((h) => {
      const c = type === "p" ? h.pheno[key] || 0 : h.geno[key] || 0;
      return { n: h.n, تجربی: +((c / h.n) * 100).toFixed(2) };
    });
  }, [history, current]);

  const last = data[data.length - 1];
  const theory = current ? current.prob * 100 : 0;

  return (
    <div className="card p-4 fade-up">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="text-2xl">📈</span> همگرایی نتایج ژنتیکی
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" value={current?.id} onChange={(e) => setSel(e.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button className={`btn text-xs py-1 ${logScale ? "btn-primary" : "btn-secondary"}`} onClick={() => setLogScale(!logScale)}>
            محور لگاریتمی
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-2">
        با افزایش تعداد فرزندان، درصد مشاهده‌شده (خط سبز) به احتمال نظری (خط چین بنفش) نزدیک می‌شود — این همان «قانون اعداد بزرگ» است.
      </p>
      <div className="flex gap-2 mb-2 flex-wrap">
        <span className="chip bg-indigo-50 text-indigo-700 border border-indigo-200">
          نظری: <span className="num font-black">{hideTheory ? "؟" : theory.toFixed(1) + "٪"}</span>
        </span>
        <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200">
          تجربی (n=<span className="num">{last?.n ?? 0}</span>): <span className="num font-black">{last ? last.تجربی.toFixed(1) + "٪" : "—"}</span>
        </span>
        {last && !hideTheory && (
          <span className="chip bg-slate-100 text-slate-700">
            اختلاف: <span className="num font-black">{Math.abs(last.تجربی - theory).toFixed(2)}</span> واحد درصد
          </span>
        )}
      </div>
      <div className="h-64 ltr">
        {data.length < 2 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl" dir="rtl">
            برای دیدن نمودار همگرایی حداقل چند فرزند تولید کن.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="n" type="number" scale={logScale ? "log" : "linear"} domain={logScale ? [1, "dataMax"] : [0, "dataMax"]} tick={{ fontSize: 11 }} allowDataOverflow label={{ value: "تعداد فرزندان", position: "insideBottomRight", offset: -2, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" label={{ value: "درصد مشاهده‌شده", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `n = ${l}`} />
              {!hideTheory && <ReferenceLine y={theory} stroke="#6366f1" strokeDasharray="6 4" strokeWidth={2} label={{ value: `نظری ${theory.toFixed(1)}%`, fill: "#4f46e5", fontSize: 11, position: "right" }} />}
              <Line type="monotone" dataKey="تجربی" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
