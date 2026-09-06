import { useEffect, useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Digital, fmt, fmtPa, ChartPoint, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";

const init = { A1: 20, A2: 8, v1: 2, rho: 1000, P1: 120000, dh: 0, g: 9.8 };
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
// bump: 0 at ends, 1 in the middle
const bump = (f: number) => (f < 0.3 ? 0 : f < 0.45 ? smooth((f - 0.3) / 0.15) : f < 0.6 ? 1 : f < 0.75 ? 1 - smooth((f - 0.6) / 0.15) : 0);

export default function Bernoulli() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const [chartX, setChartX] = useState<"x" | "A" | "v">("x");
  const up = (k: keyof typeof init, v: number) => setSt((o) => ({ ...o, [k]: v }));

  const A = (f: number) => (st.A1 + (st.A2 - st.A1) * bump(f)) / 1e4; // m²
  const H = (f: number) => st.dh * bump(f); // m
  const Q = (st.A1 / 1e4) * st.v1; // m³/s
  const v = (f: number) => Q / A(f);
  const E = st.P1 + 0.5 * st.rho * st.v1 * st.v1; // total head at inlet (h1 = 0)
  const P = (f: number) => E - 0.5 * st.rho * v(f) ** 2 - st.rho * st.g * H(f);
  const v2 = v(0.5), P2 = P(0.5);
  const { active, dir } = useChanged({ A2: st.A2, A1: st.A1, v1: st.v1, rho: st.rho, dh: st.dh });

  // particles
  const parts = useRef(Array.from({ length: 90 }).map(() => ({ f: Math.random(), yo: Math.random() * 2 - 1 })));
  const lastT = useRef(t);
  useEffect(() => {
    const dt = t - lastT.current; lastT.current = t;
    const L = 6; // virtual tube length in meters
    for (const p of parts.current) { p.f += (v(p.f) / L) * dt * 0.5; if (p.f > 1) { p.f -= 1; p.yo = Math.random() * 2 - 1; } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // geometry
  const X0 = 40, X1 = 600, baseY = 230, pxPerM = 60;
  const rOf = (f: number) => 8 + Math.sqrt(A(f) * 1e4) * 7;
  const cy = (f: number) => baseY - H(f) * pxPerM;
  const xs = Array.from({ length: 61 }).map((_, i) => i / 60);
  const topPath = xs.map((f, i) => `${i ? "L" : "M"}${X0 + f * (X1 - X0)},${cy(f) - rOf(f)}`).join(" ");
  const botPath = xs.slice().reverse().map((f) => `L${X0 + f * (X1 - X0)},${cy(f) + rOf(f)}`).join(" ");
  const Pmax = Math.max(P(0), P(0.5), 1), Pmin = Math.min(P(0), P(0.5));
  const piezo = (f: number) => Math.max(0, P(f)) / Math.max(1, E) * 120; // px height ∝ P

  const note = useMemo(() => {
    if (active.includes("A2")) return dir.A2 === "down" ? "سطح مقطع باریک‌تر شد → برای عبور همان مقدار سیال در ثانیه، سرعت بیشتر شد → طبق برنولی، فشار کمتر شد." : "سطح مقطع بازتر شد → سرعت کمتر و فشار بیشتر شد.";
    if (active.includes("v1")) return "سرعت ورودی تغییر کرد → آهنگ جریان تغییر کرد → اختلاف فشار بین قسمت پهن و باریک با مجذور سرعت تغییر کرد.";
    if (active.includes("rho")) return "چگالی تغییر کرد → جمله‌ی ½ρv² تغییر کرد → افت فشار در گلوگاه تغییر کرد.";
    if (active.includes("dh")) return "ارتفاع گلوگاه تغییر کرد → جمله‌ی ρgh وارد شد → فشار در گلوگاه علاوه بر سرعت، به ارتفاع هم وابسته شد.";
    return undefined;
  }, [active, dir]);

  const scene = (
    <svg viewBox="0 0 640 340" className="w-full h-auto select-none">
      <defs>
        <clipPath id="tubeClip"><path d={`${topPath} ${botPath} Z`} /></clipPath>
        <linearGradient id="pGrad" x1="0" x2="1"><stop offset="0" stopColor="#ef4444" /><stop offset="0.5" stopColor="#3b82f6" /><stop offset="1" stopColor="#ef4444" /></linearGradient>
      </defs>
      {/* pressure-colored fill */}
      <g clipPath="url(#tubeClip)">
        {xs.slice(0, -1).map((f, i) => { const tt = (P(f) - Pmin) / Math.max(1, Pmax - Pmin); return <rect key={i} x={X0 + f * (X1 - X0) - 1} y={0} width={(X1 - X0) / 60 + 2} height={340} fill={`rgb(${Math.round(60 + 180 * tt)},${Math.round(120 - 40 * tt)},${Math.round(255 - 180 * tt)})`} opacity={0.35} />; })}
        {parts.current.map((p, i) => { const x = X0 + p.f * (X1 - X0); const r = rOf(p.f); return <circle key={i} cx={x} cy={cy(p.f) + p.yo * (r - 4)} r={2.2} fill="#fff" opacity={0.75} />; })}
      </g>
      <path d={`${topPath} ${botPath} Z`} fill="none" stroke="#7c8fc4" strokeWidth={3} />
      {/* velocity vectors */}
      {s.showVectors && [0.12, 0.5, 0.88].map((f, i) => { const x = X0 + f * (X1 - X0); const len = 10 + v(f) * 6; return <Arrow key={i} x1={x - len / 2} y1={cy(f)} x2={x + len / 2} y2={cy(f)} color="#fde047" width={3} label={`v=${fmt(v(f), 2)} m/s`} />; })}
      {/* piezometer tubes */}
      {[0.12, 0.5, 0.88].map((f, i) => { const x = X0 + f * (X1 - X0); const top = cy(f) - rOf(f); const hpx = piezo(f); return (
        <g key={i}>
          <rect x={x - 7} y={top - 135} width={14} height={135} fill="#0d1428" stroke="#7c8fc4" strokeWidth={2} rx={3} />
          <rect x={x - 5} y={top - hpx} width={10} height={hpx} fill="rgba(56,189,248,.8)" />
          <text x={x} y={top - 140} fontSize={10} fill={i === 1 ? "#93c5fd" : "#fca5a5"} textAnchor="middle" className="num">{fmtPa(P(f))}</text>
        </g>); })}
      <text x={320} y={20} fontSize={11} fill="#94a3b8" textAnchor="middle">ارتفاع مایع در لوله‌های عمودی (پیزومتر) ∝ فشار — در گلوگاه پایین‌تر است</text>
      {/* labels */}
      <text x={X0 + 0.12 * (X1 - X0)} y={baseY + rOf(0.12) + 16} fontSize={10} fill="#cbd5e1" textAnchor="middle" className="num">A₁ = {fmt(st.A1)} cm²</text>
      <text x={320} y={cy(0.5) + rOf(0.5) + 16} fontSize={10} fill="#cbd5e1" textAnchor="middle" className="num">A₂ = {fmt(st.A2)} cm² {st.dh !== 0 && `، h = ${fmt(st.dh)} m`}</text>
      <foreignObject x={10} y={270} width={620} height={70}>
        <div className="flex gap-2 justify-center flex-wrap" dir="rtl">
          <Digital label="دبی A·v (ثابت)" value={`${fmt(Q * 1000, 1)} L/s`} color="#fde047" />
          <Digital label="v₂ در گلوگاه" value={`${fmt(v2, 2)} m/s`} color="#fde047" />
          <Digital label="P₂ در گلوگاه" value={fmtPa(P2)} color="#93c5fd" />
          <Digital label="ΔP = P₁ − P₂" value={fmtPa(st.P1 - P2)} color="#fca5a5" />
          {P2 < 0 && <div className="text-[10px] text-rose-300 self-center">⚠ فشار منفی: کاویتاسیون — سرعت ورودی را کم کن</div>}
        </div>
      </foreignObject>
    </svg>
  );

  const controls = (
    <>
      <Slider label="سطح مقطع پهن" symbol="A₁" value={st.A1} min={5} max={40} step={1} unit="cm²" onChange={(v) => up("A1", v)} color="#22d3ee" />
      <Slider label="سطح مقطع گلوگاه" symbol="A₂" value={st.A2} min={1} max={40} step={0.5} unit="cm²" onChange={(v) => up("A2", v)} color="#f472b6" hint={`نسبت A₁/A₂ = ${fmt(st.A1 / st.A2, 2)} → v₂ = ${fmt(st.A1 / st.A2, 2)} × v₁`} />
      <Slider label="سرعت ورودی" symbol="v₁" value={st.v1} min={0.2} max={8} step={0.1} unit="m/s" onChange={(v) => up("v1", v)} color="#fde047" />
      <Slider label="چگالی سیال" symbol="ρ" value={st.rho} min={1} max={2000} step={1} unit="kg/m³" onChange={(v) => up("rho", v)} color="#fbbf24" hint="هوا ≈ 1.2 ، آب = 1000" />
      <Slider label="فشار ورودی" symbol="P₁" value={st.P1} min={50000} max={300000} step={1000} unit="Pa" onChange={(v) => up("P1", v)} color="#93c5fd" />
      <Slider label="ارتفاع گلوگاه نسبت به ورودی" symbol="h₂−h₁" value={st.dh} min={-1.5} max={1.5} step={0.1} unit="m" onChange={(v) => up("dh", v)} color="#a78bfa" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" />
    </>
  );

  const chart = (
    <>
      <Segmented value={chartX} onChange={(v) => { setChartX(v); setCollected([]); }} options={[{ v: "x", l: "P در طول لوله" }, { v: "A", l: "v برحسب A" }, { v: "v", l: "P برحسب v" }]} />
      <div className="h-1" />
      {chartX === "x" && <LiveChart fn={(x) => P(x)} xMin={0} xMax={1} xLabel="موقعیت در طول لوله (کسر طول)" yLabel="P (Pa)" current={{ x: 0.5, y: P2 }} collected={collected} yFmt={fmtPa} extraLines={[{ fn: (x) => v(x) * 10000, color: "#fde047", label: "v ×10⁴ (m/s)" }]} title="جایی که سرعت بالا می‌رود، فشار پایین می‌آید" />}
      {chartX === "A" && <LiveChart fn={(x) => Q / (x / 1e4)} xMin={1} xMax={40} xLabel="A (cm²)" yLabel="v (m/s)" current={{ x: st.A2, y: v2 }} collected={collected} title={`v = Q/A — رابطه‌ی وارون؛ Q = A₁v₁ = ${fmt(Q * 1000, 1)} L/s ثابت`} />}
      {chartX === "v" && <LiveChart fn={(x) => E - 0.5 * st.rho * x * x - st.rho * st.g * st.dh} xMin={0} xMax={Math.max(10, v2 * 1.3)} xLabel="v (m/s)" yLabel="P (Pa)" current={{ x: v2, y: P2 }} collected={collected} yFmt={fmtPa} title="P با مجذور سرعت کم می‌شود (سهمی رو به پایین)" />}
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, chartX === "x" ? { x: 0.5, y: P2 } : chartX === "A" ? { x: st.A2, y: v2 } : { x: v2, y: P2 }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "چرا وقتی سر شلنگ آب را با انگشت می‌بندیم، آب با سرعت بیشتری خارج می‌شود؟", options: ["چون دبی (A·v) ثابت است و A کم شده", "چون فشار آب زیاد شده", "چون آب سبک‌تر می‌شود"], answer: "چون دبی (A·v) ثابت است و A کم شده", explain: "طبق معادله‌ی پیوستگی A₁v₁ = A₂v₂ ؛ کاهش سطح، سرعت را زیاد می‌کند." },
    { kind: "پیش‌بینی", q: "اگر سطح مقطع گلوگاه نصف شود، سرعت در گلوگاه چه می‌شود و فشار چه تغییری می‌کند؟", options: ["سرعت ۲ برابر، فشار کمتر", "سرعت نصف، فشار بیشتر", "سرعت ۲ برابر، فشار بیشتر"], answer: "سرعت ۲ برابر، فشار کمتر", explain: "پیوستگی: v ∝ 1/A ؛ برنولی: با افزایش v، جمله‌ی ½ρv² زیاد و P کم می‌شود." },
    { kind: "محاسباتی", q: `با A₁ = ${fmt(st.A1)} cm² ، v₁ = ${fmt(st.v1)} m/s و A₂ = ${fmt(st.A2)} cm² سرعت در گلوگاه چند m/s است؟`, answer: fmt(v2, 2), numeric: { value: v2, tol: v2 * 0.03 + 0.01, unit: "m/s" }, explain: `v₂ = A₁v₁/A₂ = ${fmt(st.A1)}×${fmt(st.v1)}/${fmt(st.A2)} = ${fmt(v2, 2)} m/s` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۸ — اصل برنولی و پیوستگی" icon="💨" unit="Pa ، m/s"
      concept="سیال در لوله‌ای با سطح مقطع متغیر جریان دارد. در قسمت باریک، ذرات تندتر حرکت می‌کنند. با نگاه به لوله‌های عمودی ببین فشار در آنجا چه می‌شود."
      formula={<>P + ½ρv² + ρgh = ثابت</>} formulaSub={<>پیوستگی: A₁v₁ = A₂v₂</>}
      values={[
        { label: "A₁", value: st.A1, unit: "cm²", flash: active.includes("A1") },
        { label: "A₂", value: st.A2, unit: "cm²", color: "text-pink-300", flash: active.includes("A2") },
        { label: "v₁", value: st.v1, unit: "m/s", color: "text-yellow-300", flash: active.includes("v1") },
        { label: "v₂", value: fmt(v2, 2), unit: "m/s", color: "text-yellow-300" },
        { label: "P₁", value: fmtPa(st.P1), color: "text-sky-300" },
        { label: "P₂", value: fmtPa(P2), color: "text-sky-300" },
        { label: "ρ", value: st.rho, unit: "kg/m³", flash: active.includes("rho") },
        { label: "h₂−h₁", value: st.dh, unit: "m", flash: active.includes("dh") },
      ]}
      result={<>سطح مقطع از <b className="num">{fmt(st.A1)}</b> به <b className="num">{fmt(st.A2)} cm²</b> رسید ⇒ سرعت <b className="num">{fmt(st.A1 / st.A2, 2)}</b> برابر شد (<b className="num">{fmt(v2, 2)} m/s</b>) و فشار <b className="num">{fmtPa(st.P1 - P2)}</b> {st.P1 - P2 >= 0 ? "کاهش" : "افزایش"} یافت. {st.dh !== 0 && <>سهم ارتفاع: <b className="num">{fmtPa(st.rho * st.g * st.dh)}</b>.</>}</>}
      definition={{ parts: [{ t: "در جریان پایای شاره، هر جا " }, { t: "سطح مقطع", k: "A2" }, { t: " کم شود، " }, { t: "سرعت", k: "v1" }, { t: " زیاد می‌شود و در نتیجه " }, { t: "فشار", k: "P" }, { t: " کم می‌شود؛ مجموع فشار، انرژی جنبشی واحد حجم (وابسته به " }, { t: "چگالی", k: "rho" }, { t: ") و انرژی پتانسیل واحد حجم (وابسته به " }, { t: "ارتفاع", k: "dh" }, { t: ") ثابت می‌ماند." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `ذرات در گلوگاه با سرعت ${fmt(v2, 2)} m/s (به‌جای ${fmt(st.v1)} m/s) حرکت کردند و ارتفاع مایع در پیزومترِ گلوگاه پایین‌تر آمد: فشار از ${fmtPa(st.P1)} به ${fmtPa(P2)} رسید.`,
        concept: "چون سیال تراکم‌ناپذیر است، حجمی که در هر ثانیه از قسمت پهن می‌گذرد باید از قسمت باریک هم بگذرد؛ پس باید تندتر برود. برای شتاب گرفتن ذرات به سمت گلوگاه، فشار پشت آن‌ها باید از فشار جلویشان بیشتر باشد؛ یعنی فشار در گلوگاه کمتر است. (پایستگی انرژی بر واحد حجم)",
        math: <div className="ltr num">A₁v₁ = A₂v₂ ⇒ v₂ = {fmt(st.A1)}×{fmt(st.v1)}/{fmt(st.A2)} = {fmt(v2, 2)} m/s<br />P₂ = P₁ + ½ρ(v₁² − v₂²) − ρg(h₂−h₁)<br />= {fmtPa(st.P1)} + ½×{fmt(st.rho)}×({fmt(st.v1 ** 2, 2)} − {fmt(v2 ** 2, 2)}) − {fmtPa(st.rho * st.g * st.dh)} = {fmtPa(P2)}</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 1) up("A2", Math.max(1, st.A2 / 2)); if (i === 0) up("A2", 2); }}
      onReset={() => { setSt(init); setCollected([]); }}
    />
  );
}
