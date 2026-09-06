import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- formatting ---------- */
export const fmt = (n: number, d = 2) => {
  if (!isFinite(n)) return "∞";
  const a = Math.abs(n);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) return n.toExponential(2);
  return n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 });
};
export const fmtPa = (p: number) => {
  const a = Math.abs(p);
  if (a >= 1e6) return `${fmt(p / 1e6, 3)} MPa`;
  if (a >= 1e3) return `${fmt(p / 1e3, 2)} kPa`;
  return `${fmt(p, 1)} Pa`;
};

/* ---------- Slider ---------- */
export function Slider({
  label, value, min, max, step = 1, onChange, unit = "", color = "#22d3ee", hint, symbol,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void; color?: string; hint?: string; symbol?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-sm text-slate-200">
          {label} {symbol && <span className="text-xs text-slate-400 ltr num">({symbol})</span>}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-20 bg-slate-900/70 border border-slate-700 rounded-md px-1.5 py-0.5 text-xs text-cyan-200 ltr num focus:outline-none focus:border-cyan-400"
            value={Number(value.toFixed(4))}
            min={min} max={max} step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
          />
          <span className="text-xs text-slate-400 w-10 ltr">{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ background: `linear-gradient(90deg, ${color} ${pct}%, #1e2a4a ${pct}%)` }}
      />
      {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}

/* ---------- Buttons / Toggles ---------- */
export function Btn({ children, onClick, active, tone = "cyan", className = "", small }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; tone?: "cyan" | "amber" | "rose" | "emerald" | "slate" | "violet"; className?: string; small?: boolean;
}) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10",
    amber: "border-amber-400/40 text-amber-200 hover:bg-amber-400/10",
    rose: "border-rose-400/40 text-rose-200 hover:bg-rose-400/10",
    emerald: "border-emerald-400/40 text-emerald-200 hover:bg-emerald-400/10",
    violet: "border-violet-400/40 text-violet-200 hover:bg-violet-400/10",
    slate: "border-slate-500/40 text-slate-200 hover:bg-slate-400/10",
  };
  const act: Record<string, string> = {
    cyan: "bg-cyan-400/20 border-cyan-300", amber: "bg-amber-400/20 border-amber-300", rose: "bg-rose-400/20 border-rose-300",
    emerald: "bg-emerald-400/20 border-emerald-300", violet: "bg-violet-400/20 border-violet-300", slate: "bg-slate-400/20 border-slate-300",
  };
  return (
    <button onClick={onClick}
      className={`rounded-lg border transition-all ${small ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${tones[tone]} ${active ? act[tone] : ""} ${className}`}>
      {children}
    </button>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center gap-2 text-xs text-slate-300">
      <span className={`w-9 h-5 rounded-full relative transition-colors ${on ? "bg-cyan-500" : "bg-slate-700"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "right-4"}`} />
      </span>
      {label}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-700/60">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 rounded-md text-xs transition-all ${value === o.v ? "bg-cyan-500/30 text-cyan-100 shadow" : "text-slate-400 hover:text-slate-200"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* ---------- Value chip ---------- */
export function Chip({ label, value, unit, color = "text-cyan-300", flash }: { label: string; value: string | number; unit?: string; color?: string; flash?: boolean }) {
  return (
    <div className={`glass px-3 py-1.5 min-w-[92px] transition-all ${flash ? "ring-1 ring-amber-300/70" : ""}`}>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className={`text-sm font-semibold num ${color}`}>{typeof value === "number" ? fmt(value) : value} <span className="text-[10px] text-slate-400">{unit}</span></div>
    </div>
  );
}

/* ---------- Analog gauge ---------- */
export function Gauge({ value, max, label, unit = "Pa", size = 120, color = "#22d3ee" }: { value: number; max: number; label?: string; unit?: string; size?: number; color?: string }) {
  const frac = Math.max(0, Math.min(1, value / max));
  const ang = -120 + frac * 240;
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + r * Math.cos(((a - 90) * Math.PI) / 180), cy + r * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <circle cx={cx} cy={cy} r={r + 6} fill="#0b1224" stroke="#2a3a66" strokeWidth={2} />
        <path d={arc(-120, 120)} fill="none" stroke="#1e2a4a" strokeWidth={7} strokeLinecap="round" />
        <path d={arc(-120, ang)} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" style={{ transition: "all .25s" }} />
        {Array.from({ length: 13 }).map((_, i) => {
          const a = ((-120 + i * 20 - 90) * Math.PI) / 180;
          return <line key={i} x1={cx + (r - 10) * Math.cos(a)} y1={cy + (r - 10) * Math.sin(a)} x2={cx + (r - 5) * Math.cos(a)} y2={cy + (r - 5) * Math.sin(a)} stroke="#64748b" strokeWidth={1.5} />;
        })}
        <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform .25s" }}>
          <polygon points={`${cx - 3},${cy} ${cx + 3},${cy} ${cx},${cy - r + 12}`} fill="#f87171" />
        </g>
        <circle cx={cx} cy={cy} r={5} fill="#f87171" stroke="#0b1224" strokeWidth={2} />
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize={11} fill="#e2e8f0" className="num">{unit === "Pa" ? fmtPa(value) : `${fmt(value)} ${unit}`}</text>
      </svg>
      {label && <div className="text-[11px] text-slate-400 -mt-1">{label}</div>}
    </div>
  );
}

/* ---------- Digital readout ---------- */
export function Digital({ label, value, unit, color = "#67e8f9" }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 inline-flex flex-col items-center min-w-[100px]">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="font-mono text-base tracking-wider num" style={{ color, textShadow: `0 0 8px ${color}` }}>{value} {unit && <span className="text-xs">{unit}</span>}</span>
    </div>
  );
}

/* ---------- Live chart ---------- */
export type ChartPoint = { x: number; y: number };
export function LiveChart({
  fn, xMin, xMax, xLabel, yLabel, current, collected = [], color = "#22d3ee", height = 190, yFmt = (v: number) => fmt(v), xFmt = (v: number) => fmt(v), extraLines = [], title,
}: {
  fn?: (x: number) => number; xMin: number; xMax: number; xLabel: string; yLabel: string; current?: ChartPoint; collected?: ChartPoint[];
  color?: string; height?: number; yFmt?: (v: number) => string; xFmt?: (v: number) => string; extraLines?: { fn: (x: number) => number; color: string; label: string }[]; title?: string;
}) {
  const W = 420, H = height, ml = 58, mr = 14, mt = 14, mb = 34;
  const pts = useMemo(() => {
    const out: ChartPoint[] = [];
    if (!fn) return out;
    const n = 60;
    for (let i = 0; i <= n; i++) { const x = xMin + ((xMax - xMin) * i) / n; out.push({ x, y: fn(x) }); }
    return out;
  }, [fn, xMin, xMax]);
  const allY = [...pts.map((p) => p.y), ...collected.map((p) => p.y), ...(current ? [current.y] : []), ...extraLines.flatMap((l) => [l.fn(xMin), l.fn(xMax)])].filter(isFinite);
  let yMin = Math.min(0, ...allY), yMax = Math.max(...allY, 1e-9);
  if (yMax === yMin) yMax = yMin + 1;
  const pad = (yMax - yMin) * 0.08; yMax += pad; if (yMin < 0) yMin -= pad;
  const sx = (x: number) => ml + ((x - xMin) / (xMax - xMin)) * (W - ml - mr);
  const sy = (y: number) => mt + (1 - (y - yMin) / (yMax - yMin)) * (H - mt - mb);
  const path = (ps: ChartPoint[]) => ps.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const ticksX = 5, ticksY = 4;
  return (
    <div className="ltr">
      {title && <div className="text-xs text-slate-300 mb-1 text-right" dir="rtl">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 20 }}>
        <rect x={ml} y={mt} width={W - ml - mr} height={H - mt - mb} fill="#0a1020" rx={6} />
        {Array.from({ length: ticksY + 1 }).map((_, i) => {
          const y = yMin + ((yMax - yMin) * i) / ticksY;
          return <g key={i}><line x1={ml} x2={W - mr} y1={sy(y)} y2={sy(y)} stroke="#1e2a4a" strokeDasharray="3 3" /><text x={ml - 6} y={sy(y) + 3} fontSize={9} fill="#94a3b8" textAnchor="end">{yFmt(y)}</text></g>;
        })}
        {Array.from({ length: ticksX + 1 }).map((_, i) => {
          const x = xMin + ((xMax - xMin) * i) / ticksX;
          return <g key={i}><line y1={mt} y2={H - mb} x1={sx(x)} x2={sx(x)} stroke="#1e2a4a" strokeDasharray="3 3" /><text x={sx(x)} y={H - mb + 12} fontSize={9} fill="#94a3b8" textAnchor="middle">{xFmt(x)}</text></g>;
        })}
        {extraLines.map((l, i) => {
          const ps: ChartPoint[] = []; for (let k = 0; k <= 40; k++) { const x = xMin + ((xMax - xMin) * k) / 40; ps.push({ x, y: l.fn(x) }); }
          return <path key={i} d={path(ps)} fill="none" stroke={l.color} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.8} />;
        })}
        {pts.length > 0 && <path d={path(pts)} fill="none" stroke={color} strokeWidth={2.5} />}
        {collected.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill="#fbbf24" stroke="#0a1020" strokeWidth={1} />)}
        {current && isFinite(current.y) && (
          <g>
            <line x1={sx(current.x)} x2={sx(current.x)} y1={sy(current.y)} y2={H - mb} stroke={color} strokeDasharray="2 3" opacity={0.7} />
            <line x1={ml} x2={sx(current.x)} y1={sy(current.y)} y2={sy(current.y)} stroke={color} strokeDasharray="2 3" opacity={0.7} />
            <circle cx={sx(current.x)} cy={sy(current.y)} r={9} fill={color} opacity={0.25} className="pulse-glow" />
            <circle cx={sx(current.x)} cy={sy(current.y)} r={5} fill="#fff" stroke={color} strokeWidth={2.5} />
          </g>
        )}
        <text x={(ml + W - mr) / 2} y={H - 4} fontSize={10} fill="#cbd5e1" textAnchor="middle">{xLabel}</text>
        <text x={12} y={(mt + H - mb) / 2} fontSize={10} fill="#cbd5e1" textAnchor="middle" transform={`rotate(-90 12 ${(mt + H - mb) / 2})`}>{yLabel}</text>
        {extraLines.length > 0 && (
          <g>{extraLines.map((l, i) => <g key={i}><line x1={ml + 8} x2={ml + 26} y1={mt + 10 + i * 12} y2={mt + 10 + i * 12} stroke={l.color} strokeDasharray="5 4" strokeWidth={1.5} /><text x={ml + 30} y={mt + 13 + i * 12} fontSize={9} fill={l.color}>{l.label}</text></g>)}</g>
        )}
      </svg>
    </div>
  );
}

/* ---------- Data collection bar for charts ---------- */
export function DataBar({ onAdd, onClear, count }: { onAdd: () => void; onClear: () => void; count: number }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <Btn small tone="amber" onClick={onAdd}>📌 ثبت نقطه داده</Btn>
      <Btn small tone="slate" onClick={onClear}>🧹 پاک کردن</Btn>
      <span className="text-[11px] text-slate-400">{count} نقطه ثبت شده</span>
    </div>
  );
}

/* ---------- Dynamic definition ---------- */
export type DefPart = { t: string; k?: string };
export function DynDef({ parts, active, note }: { parts: DefPart[]; active: string[]; note?: string }) {
  return (
    <div>
      <p className="text-sm leading-7 text-slate-100">
        {parts.map((p, i) => p.k ? <span key={i} className={`hl ${active.includes(p.k) ? "hl-on" : "text-cyan-200"}`}>{p.t}</span> : <span key={i}>{p.t}</span>)}
      </p>
      {note && <p className="text-xs text-amber-200/90 mt-1 leading-6">💡 {note}</p>}
    </div>
  );
}

/* ---------- Three-level concept ---------- */
export function Levels({ observe, concept, math, showMath = true }: { observe: string; concept: string; math: React.ReactNode; showMath?: boolean }) {
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const items = [
    { t: "۱. مشاهده", q: "چه اتفاقی افتاد؟", c: <p className="text-sm leading-7">{observe}</p>, tone: "text-emerald-300" },
    { t: "۲. مفهوم", q: "چرا این اتفاق افتاد؟", c: <p className="text-sm leading-7">{concept}</p>, tone: "text-amber-300" },
    { t: "۳. ریاضی", q: "کدام رابطه آن را توصیف می‌کند؟", c: showMath ? <div className="text-sm leading-7">{math}</div> : <p className="text-sm text-slate-400">🔒 در حالت کشف، فرمول تا پایان آزمایش مخفی است.</p>, tone: "text-violet-300" },
  ];
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {items.map((it, i) => (
          <button key={i} onClick={() => setTab(i as 0 | 1 | 2)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs border transition-all ${tab === i ? "bg-white/10 border-white/20 " + it.tone : "border-transparent text-slate-400 hover:text-slate-200"}`}>{it.t}</button>
        ))}
      </div>
      <div className="glass p-3 min-h-[80px]">
        <div className="text-[11px] text-slate-400 mb-1">{items[tab].q}</div>
        {items[tab].c}
      </div>
    </div>
  );
}

/* ---------- Formula box ---------- */
export function Formula({ children, hidden, sub }: { children: React.ReactNode; hidden?: boolean; sub?: React.ReactNode }) {
  return (
    <div className="ltr bg-gradient-to-br from-violet-500/15 to-cyan-500/10 border border-violet-400/30 rounded-xl px-3 py-2 text-center">
      {hidden ? <div className="text-slate-400 text-sm">🔒 فرمول مخفی — ابتدا الگو را کشف کن</div> : (
        <>
          <div className="text-lg font-semibold text-violet-100 tracking-wide">{children}</div>
          {sub && <div className="text-[11px] text-violet-200/80 mt-0.5">{sub}</div>}
        </>
      )}
    </div>
  );
}

/* ---------- Quiz ---------- */
export type QuizQ = { kind: "مفهومی" | "پیش‌بینی" | "محاسباتی"; q: string; options?: string[]; answer: string; explain: string; numeric?: { value: number; tol: number; unit: string } };
export function Quiz({ questions, onRun }: { questions: QuizQ[]; onRun?: (i: number) => void }) {
  const [ans, setAns] = useState<Record<number, string>>({});
  // stores the question text at the moment of checking, so feedback stays tied to that exact question
  const [checkedQ, setCheckedQ] = useState<Record<number, string>>({});
  const checked: Record<number, boolean> = {};
  questions.forEach((qq, i) => { checked[i] = checkedQ[i] === qq.q; });
  const setChecked = (v: Record<number, boolean>) => { const n: Record<number, string> = { ...checkedQ }; Object.entries(v).forEach(([k, b]) => { if (b) n[+k] = questions[+k].q; }); setCheckedQ(n); };
  return (
    <div className="space-y-3">
      {questions.map((qq, i) => {
        const a = ans[i] ?? "";
        let ok = false;
        if (qq.numeric) { const v = parseFloat(a); ok = !isNaN(v) && Math.abs(v - qq.numeric.value) <= qq.numeric.tol; } else ok = a === qq.answer;
        return (
          <div key={i} className="glass p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${qq.kind === "مفهومی" ? "bg-emerald-500/20 text-emerald-200" : qq.kind === "پیش‌بینی" ? "bg-amber-500/20 text-amber-200" : "bg-violet-500/20 text-violet-200"}`}>سؤال {qq.kind}</span>
            </div>
            <p className="text-sm leading-7 mb-2">{qq.q}</p>
            {qq.options ? (
              <div className="flex flex-wrap gap-1.5">
                {qq.options.map((o) => <Btn key={o} small tone={checked[i] ? (o === qq.answer ? "emerald" : a === o ? "rose" : "slate") : "slate"} active={a === o} onClick={() => !checked[i] && setAns({ ...ans, [i]: o })}>{o}</Btn>)}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm ltr num w-32" placeholder="پاسخ عددی" value={a} onChange={(e) => setAns({ ...ans, [i]: e.target.value })} disabled={checked[i]} />
                <span className="text-xs text-slate-400 ltr">{qq.numeric?.unit}</span>
              </div>
            )}
            <div className="flex gap-2 mt-2 items-center">
              {!checked[i] && <Btn small tone="cyan" onClick={() => { setChecked({ ...checked, [i]: true }); onRun?.(i); }}>بررسی و اجرای آزمایش ▶</Btn>}
              {checked[i] && <span className={`text-xs ${ok ? "text-emerald-300" : "text-rose-300"}`}>{ok ? "✅ درست! " : `❌ نادرست — پاسخ: ${qq.answer}. `}{qq.explain}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- animation hook ---------- */
export function useClock(paused: boolean, slow: boolean) {
  const [t, setT] = useState(0);
  const ref = useRef({ paused, slow });
  ref.current = { paused, slow };
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!ref.current.paused) setT((v) => v + dt * (ref.current.slow ? 0.25 : 1));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

/* ---------- section wrapper ---------- */
export function Section({ title, children, icon, className = "" }: { title: string; children: React.ReactNode; icon?: string; className?: string }) {
  return (
    <div className={`panel p-3 ${className}`}>
      <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">{icon && <span>{icon}</span>}{title}</div>
      {children}
    </div>
  );
}

/* ---------- Arrow (SVG) ---------- */
export function Arrow({ x1, y1, x2, y2, color = "#f87171", width = 3, label, labelPos }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; label?: string; labelPos?: "start" | "end" }) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  if (L < 1) return null;
  const ux = dx / L, uy = dy / L, hs = Math.min(10, L * 0.5);
  const bx = x2 - ux * hs, by = y2 - uy * hs;
  const px = -uy, py = ux;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px * hs * 0.55},${by + py * hs * 0.55} ${bx - px * hs * 0.55},${by - py * hs * 0.55}`} fill={color} />
      {label && <text x={(labelPos === "start" ? x1 : x2) + px * 12} y={(labelPos === "start" ? y1 : y2) + py * 12 + 4} fontSize={11} fill={color} fontWeight={600} textAnchor="middle">{label}</text>}
    </g>
  );
}
