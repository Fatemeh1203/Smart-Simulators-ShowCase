import { useMemo, useState } from "react";
import { LabCanvas, arrow, chargeBall, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Slider } from "../components/ui";
import { ScatterPlot } from "../components/Chart";
import { EPS0, K, fmt } from "../physics/core";
import { cn } from "../utils/cn";
import { Lightbulb, FlaskConical, Table2, Sparkles } from "lucide-react";

interface Problem {
  id: string; title: string; question: string;
  options: string[]; correct: number;
  xLabel: string; xUnit: string; xMin: number; xMax: number; xStep: number; xDef: number;
  yLabel: string; yUnit: string;
  compute: (x: number) => number;
  exponent: number; // expected power law exponent
  formula: string; law: string; explain: string;
  draw: (ctx: CanvasRenderingContext2D, w: World, x: number, y: number) => void;
}

const problems: Problem[] = [
  {
    id: "coulomb-r", title: "نیروی کولن و فاصله",
    question: "چه اتفاقی برای نیروی کولنی می‌افتد اگر فاصلهٔ دو بار را دو برابر کنیم؟",
    options: ["نصف می‌شود", "یک‌چهارم می‌شود", "دو برابر می‌شود", "تغییری نمی‌کند"], correct: 1,
    xLabel: "فاصله r", xUnit: "cm", xMin: 5, xMax: 60, xStep: 1, xDef: 10,
    yLabel: "نیرو F", yUnit: "mN",
    compute: r => K * 2e-6 * 2e-6 / ((r / 100) ** 2) * 1e3,
    exponent: -2, formula: "F ∝ 1/r²", law: "F = k q₁q₂ / r²",
    explain: "داده‌های شما نشان می‌دهند وقتی r دو برابر می‌شود، F به یک‌چهارم می‌رسد. شیب نمودار log-log تقریباً −۲ است؛ یعنی نیرو با مجذور فاصله نسبت وارون دارد.",
    draw: (ctx, w, r, F) => {
      const a = w.toPx(-r / 200, 0), b = w.toPx(r / 200, 0);
      chargeBall(ctx, a.x, a.y, 18, 1, true, w.t); chargeBall(ctx, b.x, b.y, 18, 1, true, w.t);
      const L = Math.min(150, 15 + 25 * Math.log10(1 + F));
      arrow(ctx, a.x - 20, a.y, a.x - 20 - L, a.y, "#f59e0b", 3); arrow(ctx, b.x + 20, b.y, b.x + 20 + L, b.y, "#f59e0b", 3);
      label(ctx, `r = ${r} cm`, w.w / 2, a.y + 40, w.dark ? "#e2e8f0" : "#334155", w.dark);
      label(ctx, `F = ${fmt(F)} mN`, w.w / 2, a.y - 50, "#f59e0b", w.dark);
    },
  },
  {
    id: "coulomb-q", title: "نیروی کولن و مقدار بار",
    question: "اگر مقدار یکی از بارها را سه برابر کنیم، نیروی بین آن‌ها چه می‌شود؟",
    options: ["سه برابر", "نه برابر", "یک‌سوم", "بدون تغییر"], correct: 0,
    xLabel: "بار q₁", xUnit: "µC", xMin: 0.5, xMax: 10, xStep: 0.5, xDef: 2,
    yLabel: "نیرو F", yUnit: "N",
    compute: q => K * q * 1e-6 * 2e-6 / (0.2 ** 2),
    exponent: 1, formula: "F ∝ q₁", law: "F = k q₁q₂ / r²",
    explain: "نمودار F بر حسب q₁ یک خط راست گذرنده از مبدأ است؛ توان برازش‌شده ≈ ۱. پس نیرو با مقدار بار نسبت مستقیم دارد.",
    draw: (ctx, w, q, F) => {
      const a = w.toPx(-0.15, 0), b = w.toPx(0.15, 0);
      chargeBall(ctx, a.x, a.y, 12 + q * 2, 1, true, w.t); chargeBall(ctx, b.x, b.y, 16, 1, true, w.t);
      const L = Math.min(150, 15 + 30 * Math.log10(1 + F * 5));
      arrow(ctx, a.x - 30, a.y, a.x - 30 - L, a.y, "#f59e0b", 3); arrow(ctx, b.x + 20, b.y, b.x + 20 + L, b.y, "#f59e0b", 3);
      label(ctx, `q₁ = ${q} µC , q₂ = 2 µC , r = 20 cm`, w.w / 2, a.y + 50, w.dark ? "#e2e8f0" : "#334155", w.dark);
      label(ctx, `F = ${fmt(F)} N`, w.w / 2, a.y - 50, "#f59e0b", w.dark);
    },
  },
  {
    id: "field-r", title: "میدان یک بار نقطه‌ای و فاصله",
    question: "اگر فاصله از یک بار نقطه‌ای سه برابر شود، اندازهٔ میدان الکتریکی چه می‌شود؟",
    options: ["یک‌سوم", "یک‌نهم", "سه برابر", "نه برابر"], correct: 1,
    xLabel: "فاصله r", xUnit: "cm", xMin: 5, xMax: 60, xStep: 1, xDef: 10,
    yLabel: "میدان E", yUnit: "kN/C",
    compute: r => K * 3e-6 / ((r / 100) ** 2) / 1e3,
    exponent: -2, formula: "E ∝ 1/r²", law: "E = k |q| / r²",
    explain: "با سه برابر شدن فاصله، میدان به یک‌نهم کاهش یافت. توان برازش ≈ −۲: میدان بار نقطه‌ای با مجذور فاصله نسبت وارون دارد.",
    draw: (ctx, w, r, E) => {
      const o = w.toPx(0, 0); const p = w.toPx(r / 100 * 0.9, 0);
      for (let rr = 0.05; rr < 0.6; rr += 0.1) { ctx.strokeStyle = "rgba(168,85,247,.25)"; ctx.beginPath(); ctx.arc(o.x, o.y, rr * w.scale * 0.9, 0, Math.PI * 2); ctx.stroke(); }
      chargeBall(ctx, o.x, o.y, 18, 1, true, w.t);
      const L = Math.min(150, 15 + 25 * Math.log10(1 + E / 10));
      arrow(ctx, p.x, p.y, p.x + L, p.y, "#a855f7", 3);
      ctx.strokeStyle = "#a855f7"; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.stroke();
      label(ctx, `r = ${r} cm`, (o.x + p.x) / 2, o.y + 30, w.dark ? "#e2e8f0" : "#334155", w.dark);
      label(ctx, `E = ${fmt(E)} kN/C`, p.x, p.y - 30, "#a855f7", w.dark);
    },
  },
  {
    id: "cap-d", title: "ظرفیت خازن و فاصلهٔ صفحات",
    question: "اگر فاصلهٔ صفحات خازن تخت را دو برابر کنیم، ظرفیت آن چه می‌شود؟",
    options: ["دو برابر", "نصف", "یک‌چهارم", "بدون تغییر"], correct: 1,
    xLabel: "فاصله d", xUnit: "mm", xMin: 0.5, xMax: 10, xStep: 0.5, xDef: 2,
    yLabel: "ظرفیت C", yUnit: "pF",
    compute: d => EPS0 * 0.02 / (d * 1e-3) * 1e12,
    exponent: -1, formula: "C ∝ 1/d", law: "C = ε₀ A / d",
    explain: "با دو برابر شدن d، ظرفیت نصف شد و توان برازش ≈ −۱ است: ظرفیت خازن تخت با فاصلهٔ صفحات نسبت وارون دارد.",
    draw: (ctx, w, d, C) => {
      const cx = w.w / 2, cy = w.h / 2; const gap = 20 + d * 18; const ph = 160;
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx - gap / 2 - 8, cy - ph / 2, 8, ph); ctx.fillRect(cx + gap / 2, cy - ph / 2, 8, ph);
      const n = Math.min(14, Math.round(C / 8));
      for (let i = 0; i < n; i++) { const y = cy - ph / 2 + (i + 0.5) / n * ph; arrow(ctx, cx - gap / 2 + 4, y, cx + gap / 2 - 4, y, "rgba(168,85,247,.7)", 1.5, 6); }
      label(ctx, `d = ${d} mm`, cx, cy + ph / 2 + 18, w.dark ? "#e2e8f0" : "#334155", w.dark);
      label(ctx, `C = ${fmt(C)} pF  (A = 200 cm²)`, cx, cy - ph / 2 - 20, "#22d3ee", w.dark);
    },
  },
];

function fitPower(pts: { x: number; y: number }[]) {
  const v = pts.filter(p => p.x > 0 && p.y > 0);
  if (v.length < 2) return null;
  const lx = v.map(p => Math.log(p.x)), ly = v.map(p => Math.log(p.y));
  const mx = lx.reduce((a, b) => a + b) / v.length, my = ly.reduce((a, b) => a + b) / v.length;
  let num = 0, den = 0; for (let i = 0; i < v.length; i++) { num += (lx[i] - mx) * (ly[i] - my); den += (lx[i] - mx) ** 2; }
  if (den === 0) return null;
  const n = num / den; const a = Math.exp(my - n * mx);
  return { n, a };
}

export function Discovery() {
  const [pi, setPi] = useState(0);
  const p = problems[pi];
  const [step, setStep] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [x, setX] = useState(p.xDef);
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const y = p.compute(x);
  const fit = useMemo(() => fitPower(data), [data]);
  const fitLine = useMemo(() => { if (!fit) return undefined; const o = []; for (let i = 0; i <= 40; i++) { const xx = p.xMin + (p.xMax - p.xMin) * i / 40; o.push({ x: xx, y: fit.a * Math.pow(xx, fit.n) }); } return o; }, [fit, p]);

  const choose = (i: number) => { setPi(i); setStep(0); setGuess(null); setX(problems[i].xDef); setData([]); };
  const draw = (ctx: CanvasRenderingContext2D, w: World) => p.draw(ctx, w, x, y);

  const doubled = useMemo(() => {
    // find pairs with ratio 2 in data to show the "doubling" evidence
    const out: { x1: number; x2: number; ratio: number }[] = [];
    for (const a of data) for (const b of data) if (Math.abs(b.x / a.x - 2) < 0.02) out.push({ x1: a.x, x2: b.x, ratio: b.y / a.y });
    return out.slice(0, 3);
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <Sparkles size={18} className="text-amber-500" />
        <span className="text-sm font-bold">خودت کشف کن —</span>
        {problems.map((pr, i) => (
          <button key={pr.id} onClick={() => choose(i)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all", i === pi ? "bg-amber-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")}>{pr.title}</button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-h-[360px]"><LabCanvas scale={420} draw={draw} expName={`کشف: ${p.title}`} minHeight={360} logValues={() => ({ [`${p.xLabel} (${p.xUnit})`]: x, [`${p.yLabel} (${p.yUnit})`]: +y.toFixed(4) })} /></div>
        <div className="glass space-y-4 rounded-2xl p-4">
          {/* steps */}
          <div className="flex gap-1">
            {["مسئله", "آزمایش", "داده‌ها", "کشف"].map((s, i) => <button key={i} onClick={() => setStep(i)} className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-bold", step === i ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>{i + 1}. {s}</button>)}
          </div>
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold leading-6">{p.question}</p>
              <p className="text-[11px] text-slate-500">ابتدا حدس خود را انتخاب کنید (هیچ فرمولی داده نمی‌شود!).</p>
              <div className="grid gap-2">
                {p.options.map((o, i) => <button key={i} onClick={() => setGuess(i)} className={cn("rounded-xl border px-3 py-2 text-right text-xs", guess === i ? "border-amber-500 bg-amber-500/10" : "border-slate-200 dark:border-slate-700")}>{o}</button>)}
              </div>
              <Button className="w-full" disabled={guess === null} onClick={() => setStep(1)}>شروع آزمایش <FlaskConical size={14} className="inline" /></Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <Slider id={`disc-${p.id}`} label={p.xLabel} value={x} min={p.xMin} max={p.xMax} step={p.xStep} unit={p.xUnit} onChange={setX} />
              <Readout label={p.yLabel} value={fmt(y)} unit={p.yUnit} accent="text-amber-500" />
              <Button className="w-full" variant="success" onClick={() => setData(d => [...d.filter(q => q.x !== x), { x, y }].sort((a, b) => a.x - b.x))}>ثبت این نقطه ({data.length} نقطه ثبت شده)</Button>
              <p className="text-[11px] text-slate-500">پیشنهاد: مقادیر {p.xDef}، {p.xDef * 2}، {p.xDef * 3} و {p.xDef * 4} {p.xUnit} را ثبت کنید تا نسبت‌ها آشکار شوند.</p>
              <Button className="w-full" variant="ghost" disabled={data.length < 3} onClick={() => setStep(2)}>مشاهدهٔ داده‌ها <Table2 size={14} className="inline" /></Button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <table className="num w-full text-xs">
                <thead><tr className="text-slate-500"><th>{p.xLabel} ({p.xUnit})</th><th>{p.yLabel} ({p.yUnit})</th><th>نسبت به اولی</th></tr></thead>
                <tbody className="text-center">{data.map((d, i) => <tr key={i}><td>{d.x}</td><td>{fmt(d.y)}</td><td>{(d.y / data[0].y).toFixed(3)}</td></tr>)}</tbody>
              </table>
              {doubled.length > 0 && <div className="rounded-lg bg-amber-500/10 p-2 text-xs">{doubled.map((d, i) => <div key={i}>از {d.x1} به {d.x2} {p.xUnit} (۲ برابر) ⇒ {p.yLabel} شد <b className="num">{d.ratio.toFixed(3)}×</b></div>)}</div>}
              <Button className="w-full" onClick={() => setStep(3)} disabled={data.length < 3}>کشف رابطه <Lightbulb size={14} className="inline" /></Button>
            </div>
          )}
          {step === 3 && fit && (
            <div className="space-y-3">
              <div className={cn("rounded-xl px-3 py-2 text-xs font-bold", guess === p.correct ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/15 text-rose-600 dark:text-rose-300")}>
                حدس شما: «{guess !== null ? p.options[guess] : "—"}» — {guess === p.correct ? "درست بود!" : `پاسخ درست: «${p.options[p.correct]}»`}
              </div>
              <Readout label="توان برازش‌شده از داده‌های شما (y ∝ xⁿ)" value={fit.n.toFixed(2)} accent="text-amber-500" sub={`مقدار نظری: ${p.exponent}`} />
              <Formula label="رابطهٔ کشف‌شده">{p.formula}</Formula>
              <Formula label="قانون فیزیکی">{p.law}</Formula>
              <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">{p.explain}</p>
              <Button variant="ghost" className="w-full" onClick={() => choose((pi + 1) % problems.length)}>مسئلهٔ بعدی</Button>
            </div>
          )}
          {step === 3 && !fit && <p className="text-xs text-rose-500">داده کافی نیست؛ حداقل ۳ نقطه ثبت کنید.</p>}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title={`نمودار ${p.yLabel} بر حسب ${p.xLabel}`}>
          <ScatterPlot points={data} xLabel={`${p.xLabel} (${p.xUnit})`} yLabel={`${p.yLabel} (${p.yUnit})`} fit={step >= 3 ? fitLine : undefined} />
        </Panel>
        <Panel title="نمودار log–log (شیب = توان رابطه)">
          <ScatterPlot points={data.filter(d => d.x > 0 && d.y > 0).map(d => ({ x: +Math.log10(d.x).toFixed(3), y: +Math.log10(d.y).toFixed(3) }))} xLabel={`log(${p.xLabel})`} yLabel={`log(${p.yLabel})`} />
          {fit && step >= 2 && <p className="num mt-1 text-center text-xs text-slate-500">شیب ≈ {fit.n.toFixed(2)}</p>}
        </Panel>
      </div>
    </div>
  );
}
