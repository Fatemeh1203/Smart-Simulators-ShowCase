import { useEffect, useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Digital, fmt, fmtPa, ChartPoint, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";

const init = { F1: 100, A1: 0.002, A2: 0.05, M: 200, d1: 0.2, g: 9.8 };

export default function Pascal() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [chartX, setChartX] = useState<"F1" | "A2">("F1");
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const up = (k: keyof typeof init, v: number) => setSt((o) => ({ ...o, [k]: v }));

  const P = st.F1 / st.A1;
  const F2 = P * st.A2;
  const W = st.M * st.g;
  const MA = F2 / st.F1;
  const lifts = F2 >= W;
  const d2 = st.d1 * (st.A1 / st.A2);
  const { active, dir } = useChanged({ F1: st.F1, A1: st.A1, A2: st.A2, M: st.M });

  // smooth animation of lift progress
  const [prog, setProg] = useState(0);
  const lastT = useRef(t);
  useEffect(() => {
    const dt = t - lastT.current; lastT.current = t;
    setProg((p) => { const target = lifts ? 1 : 0; const k = Math.min(1, dt * 1.5); return p + (target - p) * k; });
  }, [t, lifts]);

  // geometry
  const r1 = 10 + Math.sqrt(st.A1) * 260, r2 = 10 + Math.sqrt(st.A2) * 260;
  const baseY = 250, x1 = 150, x2 = 440, cylH = 120;
  const pxPerM = 200;
  const dd1 = Math.min(70, st.d1 * pxPerM) * prog, dd2 = Math.min(70, d2 * pxPerM) * prog;
  const fluidTop1 = baseY - cylH + 40 + dd1, fluidTop2 = baseY - cylH + 40 - dd2;
  const note = useMemo(() => {
    if (active.includes("F1")) return dir.F1 === "up" ? "نیروی ورودی زیاد شد → فشار شاره زیاد شد → این فشار بدون کاهش به پیستون بزرگ رسید → نیروی خروجی به همان نسبت زیاد شد." : "نیروی ورودی کم شد → فشار و در نتیجه نیروی خروجی کم شد.";
    if (active.includes("A2")) return dir.A2 === "up" ? "سطح پیستون بزرگ زیاد شد → همان فشار روی سطح بیشتری اثر کرد → نیروی خروجی بیشتر ولی جابه‌جایی کمتر شد." : "سطح پیستون بزرگ کم شد → نیروی خروجی کمتر ولی جابه‌جایی بیشتر شد.";
    if (active.includes("A1")) return dir.A1 === "down" ? "سطح پیستون کوچک کم شد → با همان نیرو، فشار بیشتری ایجاد شد → نیروی خروجی زیاد شد." : "سطح پیستون کوچک زیاد شد → فشار کمتر → نیروی خروجی کمتر.";
    if (active.includes("M")) return lifts ? "بار تغییر کرد؛ نیروی خروجی هنوز از وزن بار بیشتر است → بار بالا می‌رود." : "بار سنگین‌تر از نیروی خروجی است → جک نمی‌تواند آن را بلند کند؛ F₁ را زیاد یا A₁ را کم کن.";
    return undefined;
  }, [active, dir, lifts]);

  const Cyl = ({ x, r, top, label }: { x: number; r: number; top: number; label: string }) => (
    <g>
      <rect x={x - r - 4} y={baseY - cylH} width={2 * r + 8} height={cylH} fill="#0d1428" stroke="#5b6fa3" strokeWidth={3} rx={3} />
      <rect x={x - r} y={top} width={2 * r} height={baseY - top} fill="rgba(56,189,248,.5)" />
      <rect x={x - r} y={top - 14} width={2 * r} height={14} fill="#94a3b8" stroke="#334155" rx={2} />
      <text x={x} y={baseY + 18} fontSize={11} fill="#cbd5e1" textAnchor="middle" className="num">{label}</text>
    </g>
  );

  const scene = (
    <svg viewBox="0 0 640 340" className="w-full h-auto select-none">
      {/* connecting pipe */}
      <rect x={x1} y={baseY - 24} width={x2 - x1} height={24} fill="rgba(56,189,248,.5)" stroke="#5b6fa3" strokeWidth={3} />
      {/* fluid particles in pipe (show pressure transmission) */}
      {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={x1 + ((i * 25 + (t * 40 * prog)) % (x2 - x1))} cy={baseY - 12 + Math.sin(t * 3 + i) * 4} r={2} fill="#fff" opacity={0.5} />)}
      <Cyl x={x1} r={r1} top={fluidTop1} label={`A₁ = ${fmt(st.A1 * 1e4, 1)} cm²`} />
      <Cyl x={x2} r={r2} top={fluidTop2} label={`A₂ = ${fmt(st.A2 * 1e4, 1)} cm²`} />
      {/* load */}
      <g>
        <rect x={x2 - Math.min(r2, 40)} y={fluidTop2 - 14 - 40} width={Math.min(r2, 40) * 2} height={40} fill={lifts ? "#f59e0b" : "#7f1d1d"} stroke="#0b1224" rx={4} />
        <text x={x2} y={fluidTop2 - 14 - 16} fontSize={11} fill="#fff" textAnchor="middle" className="num">{fmt(st.M)} kg</text>
        {!lifts && <text x={x2} y={fluidTop2 - 70} fontSize={11} fill="#fca5a5" textAnchor="middle">⚠ نیروی خروجی کافی نیست</text>}
      </g>
      {/* input handle */}
      <rect x={x1 - 3} y={fluidTop1 - 60} width={6} height={46} fill="#64748b" />
      {s.showVectors && <>
        <Arrow x1={x1} y1={fluidTop1 - 60 - Math.min(90, st.F1 / 10) - 10} x2={x1} y2={fluidTop1 - 62} color="#f87171" width={3} label={`F₁ = ${fmt(st.F1)} N`} labelPos="start" />
        <Arrow x1={x2 + Math.min(r2, 40) + 30} y1={fluidTop2 - 14} x2={x2 + Math.min(r2, 40) + 30} y2={fluidTop2 - 14 - Math.min(90, F2 / 40) - 10} color="#34d399" width={3} label={`F₂ = ${fmt(F2, 0)} N`} labelPos="end" />
        <Arrow x1={x2 - Math.min(r2, 40) - 30} y1={fluidTop2 - 14 - 40} x2={x2 - Math.min(r2, 40) - 30} y2={fluidTop2 - 14 - 40 + Math.min(90, W / 40) + 10} color="#fbbf24" width={3} label={`W = ${fmt(W, 0)} N`} labelPos="end" />
        {/* pressure arrows inside fluid */}
        {[x1 - r1 / 2, x1 + r1 / 2].map((ax, i) => <Arrow key={i} x1={ax} y1={fluidTop1 + 4} x2={ax} y2={fluidTop1 + 4 + 14 + Math.min(30, P / 3000)} color="#22d3ee" width={2} />)}
        {[-0.6, -0.2, 0.2, 0.6].map((f, i) => <Arrow key={i} x1={x2 + f * r2} y1={fluidTop2 + 4 + 14 + Math.min(30, P / 3000)} x2={x2 + f * r2} y2={fluidTop2 + 4} color="#22d3ee" width={2} />)}
      </>}
      {/* displacement labels */}
      <text x={x1 + r1 + 14} y={fluidTop1 - 30} fontSize={10} fill="#f87171" className="num">d₁ = {fmt(st.d1 * 100, 1)} cm ↓</text>
      <text x={x2 - r2 - 14} y={fluidTop2 - 40} fontSize={10} fill="#34d399" textAnchor="end" className="num">d₂ = {fmt(d2 * 100, 2)} cm ↑</text>
      {/* readouts */}
      <foreignObject x={200} y={20} width={230} height={120}>
        <div className="flex flex-col items-center gap-1" dir="rtl">
          <Digital label="فشار شاره (یکسان در همه جا)" value={fmtPa(P)} />
          <Digital label="مزیت مکانیکی F₂/F₁" value={`${fmt(MA, 2)} ×`} color={lifts ? "#86efac" : "#fca5a5"} />
        </div>
      </foreignObject>
      <text x={320} y={300} fontSize={11} fill="#94a3b8" textAnchor="middle" className="num">P₁ = F₁/A₁ = {fmtPa(P)} = P₂ = F₂/A₂ → F₂ = P₂·A₂ = {fmt(F2, 0)} N</text>
      <text x={320} y={320} fontSize={11} fill="#fbbf24" textAnchor="middle" className="num">کار ورودی F₁·d₁ = {fmt(st.F1 * st.d1, 1)} J = کار خروجی F₂·d₂ = {fmt(F2 * d2, 1)} J</text>
    </svg>
  );

  const controls = (
    <>
      <Slider label="نیروی ورودی" symbol="F₁" value={st.F1} min={5} max={1000} step={5} unit="N" onChange={(v) => up("F1", v)} color="#f87171" />
      <Slider label="سطح پیستون کوچک" symbol="A₁" value={st.A1 * 1e4} min={1} max={100} step={1} unit="cm²" onChange={(v) => up("A1", v / 1e4)} color="#22d3ee" />
      <Slider label="سطح پیستون بزرگ" symbol="A₂" value={st.A2 * 1e4} min={1} max={1000} step={5} unit="cm²" onChange={(v) => up("A2", v / 1e4)} color="#34d399" />
      <Slider label="جرم بار" symbol="M" value={st.M} min={1} max={5000} step={1} unit="kg" onChange={(v) => up("M", v)} color="#fbbf24" />
      <Slider label="جابه‌جایی پیستون کوچک" symbol="d₁" value={st.d1} min={0.01} max={0.5} step={0.01} unit="m" onChange={(v) => up("d1", v)} color="#a78bfa" hint="d₂ = d₁ × A₁/A₂ — حجم شاره پایسته است" />
      <div className="glass p-2 text-xs leading-6">
        نسبت سطح‌ها A₂/A₁ = <b className="num">{fmt(st.A2 / st.A1, 1)}</b><br />
        حداقل F₁ برای بلند کردن این بار = <b className="num">{fmt(W * st.A1 / st.A2, 1)} N</b>
      </div>
    </>
  );

  const chart = (
    <>
      <Segmented value={chartX} onChange={(v) => { setChartX(v); setCollected([]); }} options={[{ v: "F1", l: "F₂ برحسب F₁" }, { v: "A2", l: "F₂ برحسب A₂" }]} />
      <div className="h-1" />
      {chartX === "F1"
        ? <LiveChart fn={(x) => (x / st.A1) * st.A2} xMin={0} xMax={1000} xLabel="F₁ (N)" yLabel="F₂ (N)" current={{ x: st.F1, y: F2 }} collected={collected} extraLines={[{ fn: () => W, color: "#fbbf24", label: "W بار" }]} title={`شیب خط = A₂/A₁ = ${fmt(st.A2 / st.A1, 1)} (مزیت مکانیکی)`} />
        : <LiveChart fn={(x) => P * x / 1e4} xMin={0} xMax={1000} xLabel="A₂ (cm²)" yLabel="F₂ (N)" current={{ x: st.A2 * 1e4, y: F2 }} collected={collected} extraLines={[{ fn: () => W, color: "#fbbf24", label: "W بار" }]} title={`با فشار ثابت ${fmtPa(P)}، نیروی خروجی با سطح خطی است`} />}
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, chartX === "F1" ? { x: st.F1, y: F2 } : { x: st.A2 * 1e4, y: F2 }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "اگر سطح پیستون بزرگ را ۲ برابر کنیم (F₁ و A₁ ثابت)، نیروی خروجی و جابه‌جایی پیستون بزرگ چه می‌شوند؟", options: ["نیرو ۲ برابر، جابه‌جایی نصف", "هر دو ۲ برابر", "نیرو نصف، جابه‌جایی ۲ برابر"], answer: "نیرو ۲ برابر، جابه‌جایی نصف", explain: "فشار ثابت است: F₂ = P·A₂ ؛ حجم پایسته است: d₂ = d₁A₁/A₂." },
    { kind: "پیش‌بینی", q: "آیا جک هیدرولیکی انرژی «تولید» می‌کند؟", options: ["بله، نیرو زیاد می‌شود", "خیر، کار ورودی = کار خروجی"], answer: "خیر، کار ورودی = کار خروجی", explain: "نیرو زیاد می‌شود اما جابه‌جایی به همان نسبت کم می‌شود: F₁d₁ = F₂d₂." },
    { kind: "محاسباتی", q: `با F₁ = ${fmt(st.F1)} N ، A₁ = ${fmt(st.A1 * 1e4)} cm² و A₂ = ${fmt(st.A2 * 1e4)} cm² نیروی خروجی چند نیوتون است؟`, answer: fmt(F2, 0), numeric: { value: F2, tol: F2 * 0.03 + 0.5, unit: "N" }, explain: `F₂ = F₁ × A₂/A₁ = ${fmt(st.F1)} × ${fmt(st.A2 / st.A1, 1)} = ${fmt(F2, 0)} N` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۴ — اصل پاسکال و جک هیدرولیکی" icon="🏗️" unit="Pa ، N"
      concept="نیروی کوچکی به پیستون کوچک وارد کن. فشار ایجادشده در شاره‌ی محبوس، به پیستون بزرگ می‌رسد و بار سنگین را بلند می‌کند."
      formula={<>P₁ = P₂ ⟹ F₁/A₁ = F₂/A₂</>} formulaSub={<>مزیت مکانیکی = F₂/F₁ = A₂/A₁</>}
      values={[
        { label: "F₁", value: st.F1, unit: "N", color: "text-rose-300", flash: active.includes("F1") },
        { label: "A₁", value: fmt(st.A1 * 1e4), unit: "cm²", flash: active.includes("A1") },
        { label: "A₂", value: fmt(st.A2 * 1e4), unit: "cm²", color: "text-emerald-300", flash: active.includes("A2") },
        { label: "فشار شاره", value: fmtPa(P), color: "text-cyan-300" },
        { label: "F₂ خروجی", value: fmt(F2, 0), unit: "N", color: "text-emerald-300" },
        { label: "وزن بار", value: fmt(W, 0), unit: "N", color: "text-amber-300", flash: active.includes("M") },
        { label: "مزیت مکانیکی", value: `${fmt(MA, 2)}×`, color: lifts ? "text-emerald-300" : "text-rose-300" },
      ]}
      result={lifts ? <>نیروی <b className="num">{fmt(st.F1)} N</b> به نیروی <b className="num">{fmt(F2, 0)} N</b> تبدیل شد ({fmt(MA, 1)} برابر) و بار <b className="num">{fmt(st.M)} kg</b> با جابه‌جایی <b className="num">{fmt(d2 * 100, 2)} cm</b> بالا رفت.</> : <>نیروی خروجی <b className="num">{fmt(F2, 0)} N</b> از وزن بار <b className="num">{fmt(W, 0)} N</b> کمتر است؛ بار بلند نمی‌شود. F₁ را دست‌کم به <b className="num">{fmt(W * st.A1 / st.A2, 1)} N</b> برسان یا A₂/A₁ را بزرگ‌تر کن.</>}
      definition={{ parts: [{ t: "فشار واردشده به شاره‌ی محبوس، " }, { t: "بدون کاهش", k: "P" }, { t: " به همه‌ی نقاط شاره و دیواره‌ها منتقل می‌شود؛ پس " }, { t: "نیروی خروجی", k: "A2" }, { t: " با " }, { t: "نسبت سطح‌ها", k: "A1" }, { t: " به " }, { t: "نیروی ورودی", k: "F1" }, { t: " بستگی دارد." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: lifts ? `با اعمال ${fmt(st.F1)} N به پیستون کوچک، پیستون بزرگ بالا رفت و بار ${fmt(st.M)} کیلوگرمی بلند شد؛ اما پیستون بزرگ فقط ${fmt(d2 * 100, 2)} cm جابه‌جا شد در حالی که پیستون کوچک ${fmt(st.d1 * 100, 1)} cm پایین رفت.` : `نیروی ${fmt(st.F1)} N کافی نبود و بار پایین ماند. نیروی خروجی ${fmt(F2, 0)} N است.`,
        concept: "شاره تراکم‌ناپذیر است و فشار در آن به همه‌ی نقاط یکسان منتقل می‌شود. چون سطح پیستون بزرگ بیشتر است، همان فشار روی سطح بزرگ‌تر، نیروی بزرگ‌تری می‌سازد. در عوض حجم جابه‌جاشده یکسان است، پس پیستون بزرگ کمتر حرکت می‌کند و انرژی پایسته می‌ماند.",
        math: <div className="ltr num">P = F₁/A₁ = {fmt(st.F1)}/{fmt(st.A1, 4)} = {fmtPa(P)}<br />F₂ = P·A₂ = {fmtPa(P)} × {fmt(st.A2, 4)} = {fmt(F2, 0)} N<br />d₂ = d₁·A₁/A₂ = {fmt(d2 * 100, 2)} cm ; F₁d₁ = F₂d₂ = {fmt(st.F1 * st.d1, 1)} J</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 0) up("A2", Math.min(0.1, st.A2 * 2)); }}
      onReset={() => { setSt(init); setCollected([]); }}
    />
  );
}
