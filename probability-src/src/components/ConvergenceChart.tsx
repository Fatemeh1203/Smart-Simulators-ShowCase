import { useMemo, useState } from "react";
import { fmtInt, fmtPct, toFa } from "../lib/probability";

interface Props {
  series: { n: number; p: number }[];
  theoretical: number;
  label: string;
  color?: string;
}

const W = 720;
const H = 300;
const PAD = { top: 20, right: 20, bottom: 40, left: 56 };

export default function ConvergenceChart({ series, theoretical, label, color = "#4f46e5" }: Props) {
  const [logX, setLogX] = useState(true);
  const [zoom, setZoom] = useState(false);

  const N = series.length ? series[series.length - 1].n : 0;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // y range
  const [yMin, yMax] = useMemo(() => {
    if (!zoom) return [0, 1];
    const r = 0.2;
    return [Math.max(0, theoretical - r), Math.min(1, theoretical + r)];
  }, [zoom, theoretical]);

  const xMax = Math.max(10, N);
  const xOf = (n: number) => {
    if (logX) {
      const lx = Math.log10(Math.max(1, n));
      const lmax = Math.log10(xMax);
      return PAD.left + (lmax > 0 ? (lx / lmax) * innerW : 0);
    }
    return PAD.left + (n / xMax) * innerW;
  };
  const yOf = (p: number) => PAD.top + innerH - ((Math.min(yMax, Math.max(yMin, p)) - yMin) / (yMax - yMin)) * innerH;

  const path = useMemo(() => {
    if (!series.length) return "";
    return series.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.n).toFixed(1)},${yOf(pt.p).toFixed(1)}`).join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, logX, zoom, yMin, yMax, xMax]);

  // x ticks
  const xTicks = useMemo(() => {
    if (logX) {
      const t: number[] = [];
      for (let e = 0; Math.pow(10, e) <= xMax; e++) t.push(Math.pow(10, e));
      if (t[t.length - 1] !== xMax && xMax > 10) t.push(xMax);
      return t;
    }
    const step = xMax <= 10 ? 1 : xMax <= 100 ? 20 : xMax <= 1000 ? 200 : 2000;
    const t: number[] = [];
    for (let v = 0; v <= xMax; v += step) t.push(v);
    return t;
  }, [logX, xMax]);

  const yTicks = useMemo(() => {
    const t: number[] = [];
    const step = zoom ? 0.05 : 0.25;
    for (let v = yMin; v <= yMax + 1e-9; v += step) t.push(Number(v.toFixed(3)));
    return t;
  }, [yMin, yMax, zoom]);

  const last = series.length ? series[series.length - 1] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1 w-6 rounded" style={{ background: color }} /> احتمال تجربی «{label}»
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-0 w-6 border-t-2 border-dashed border-rose-500" /> احتمال نظری {fmtPct(theoretical)}
          </span>
        </div>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setLogX((v) => !v)} className={`rounded-lg px-2.5 py-1 font-semibold ${logX ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            محور لگاریتمی
          </button>
          <button onClick={() => setZoom((v) => !v)} className={`rounded-lg px-2.5 py-1 font-semibold ${zoom ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            بزرگ‌نمایی ±۲۰٪
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-slate-50" style={{ direction: "ltr" }}>
        {/* grid + y ticks */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(v)} y2={yOf(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.left - 8} y={yOf(v) + 4} textAnchor="end" fontSize={12} fill="#64748b">
              {fmtPct(v, 0)}
            </text>
          </g>
        ))}
        {/* x ticks */}
        {xTicks.map((v) => (
          <g key={v}>
            <line x1={xOf(v)} x2={xOf(v)} y1={PAD.top} y2={H - PAD.bottom} stroke="#eef2f7" strokeWidth={1} />
            <text x={xOf(v)} y={H - PAD.bottom + 18} textAnchor="middle" fontSize={12} fill="#64748b">
              {fmtInt(v)}
            </text>
          </g>
        ))}
        {/* axes labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={12} fill="#475569" fontWeight={700}>
          تعداد آزمایش‌ها (n)
        </text>
        <text x={14} y={H / 2} textAnchor="middle" fontSize={12} fill="#475569" fontWeight={700} transform={`rotate(-90 14 ${H / 2})`}>
          احتمال تجربی
        </text>
        {/* theoretical line */}
        <line x1={PAD.left} x2={W - PAD.right} y1={yOf(theoretical)} y2={yOf(theoretical)} stroke="#f43f5e" strokeWidth={2} strokeDasharray="7 5" />
        {/* series */}
        {path && <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {last && (
          <g>
            <circle cx={xOf(last.n)} cy={yOf(last.p)} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            <text x={Math.min(xOf(last.n), W - PAD.right - 50)} y={yOf(last.p) - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={color}>
              {fmtPct(last.p, 1)}
            </text>
          </g>
        )}
        {!series.length && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={15} fill="#94a3b8">
            هنوز آزمایشی انجام نشده است — دکمه‌ی «شروع آزمایش» را بزنید
          </text>
        )}
      </svg>
      {last && (
        <div className="text-xs text-slate-500">
          پس از <b className="num">{fmtInt(last.n)}</b> آزمایش، احتمال تجربی «{label}» برابر <b className="num text-indigo-700">{fmtPct(last.p)}</b> و اختلاف با مقدار نظری{" "}
          <b className="num text-rose-600">{fmtPct(Math.abs(last.p - theoretical))}</b> است. (نقطه‌های اولیه: {toFa(series.length)} نمونه رسم شده)
        </div>
      )}
    </div>
  );
}
