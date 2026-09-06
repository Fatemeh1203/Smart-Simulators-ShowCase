import { useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Gauge, Digital, fmt, fmtPa, Toggle, ChartPoint, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";
import { svgPoint, LIQUIDS } from "../utils/svg";

const init = { h: 1.0, liquid: "water", rho: 1000, g: 9.8, P0: 101325 };
const HMAX = 3; // meters of tank depth

export default function Liquids() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [gauge, setGauge] = useState(true); // show gauge (excluding P0) or absolute
  const [compare, setCompare] = useState(false);
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const [chartX, setChartX] = useState<"h" | "rho">("h");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const up = (k: keyof typeof init, v: number | string) => setSt((o) => ({ ...o, [k]: v }));
  const setLiquid = (k: string) => setSt((o) => ({ ...o, liquid: k, rho: k === "custom" ? o.rho : LIQUIDS[k].rho }));

  const Pg = st.rho * st.g * st.h;
  const Pabs = st.P0 + Pg;
  const { active, dir } = useChanged({ h: st.h, rho: st.rho, g: st.g, P0: st.P0 });
  const liq = LIQUIDS[st.liquid];

  // tank geometry
  const TX = 60, TY = 40, TW = 300, TH = 260;
  const yOf = (h: number) => TY + (h / HMAX) * TH;
  const sensorY = yOf(st.h);

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const p = svgPoint(e, svgRef.current);
    const h = Math.max(0, Math.min(HMAX, ((p.y - TY) / TH) * HMAX));
    up("h", Math.round(h * 100) / 100);
  };

  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random(), ph: Math.random() * 6.28 })), []);
  const arrowLen = 10 + 70 * Math.min(1, Pg / (st.rho * st.g * HMAX || 1));

  const note = useMemo(() => {
    if (active.includes("h")) return dir.h === "up" ? "عمق زیاد شد → ستون مایع بالای حسگر بلندتر شد → وزن مایع روی واحد سطح بیشتر شد → فشار زیاد شد." : "عمق کم شد → ستون مایع بالای حسگر کوتاه‌تر شد → فشار کم شد.";
    if (active.includes("rho")) return dir.rho === "up" ? "چگالی زیاد شد → همان ستون مایع سنگین‌تر شد → فشار در همان عمق زیاد شد (شیب نمودار تندتر شد)." : "چگالی کم شد → ستون مایع سبک‌تر شد → فشار کم شد (شیب نمودار کمتر شد).";
    if (active.includes("g")) return "گرانش تغییر کرد → وزن ستون مایع تغییر کرد → فشار پیمانه‌ای تغییر کرد.";
    if (active.includes("P0")) return "فشار سطح (P₀) تغییر کرد → فقط فشار مطلق جابه‌جا شد؛ فشار پیمانه‌ای ρgh ثابت ماند.";
    return undefined;
  }, [active, dir]);

  const cmpLiquids = ["oil", "water", "mercury"];

  const scene = (
    <svg ref={svgRef} viewBox="0 0 640 340" className="w-full h-auto select-none touch-none" onPointerMove={onMove} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
      <defs>
        <clipPath id="tankClip"><rect x={TX} y={TY} width={TW} height={TH} /></clipPath>
        <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={liq.color} /><stop offset="1" stopColor={liq.color.replace(/[\d.]+\)$/, "0.85)")} /></linearGradient>
      </defs>
      {!compare ? (
        <>
          {/* tank */}
          <rect x={TX} y={TY} width={TW} height={TH} fill="#0d1428" stroke="#5b6fa3" strokeWidth={3} rx={4} />
          <rect x={TX} y={TY} width={TW} height={TH} fill="url(#liqGrad)" clipPath="url(#tankClip)" />
          <path d={`M${TX},${TY + 3} ${Array.from({ length: 16 }).map((_, i) => `L${TX + (i * TW) / 15},${TY + 3 + Math.sin(t * 2 + i) * 2}`).join(" ")}`} stroke={liq.top} strokeWidth={2} fill="none" />
          {/* particles */}
          <g clipPath="url(#tankClip)">
            {particles.map((p, i) => <circle key={i} cx={TX + p.x * TW + Math.sin(t * p.s + p.ph) * 6} cy={TY + p.y * TH + Math.cos(t * p.s * 0.7 + p.ph) * 4} r={1.6} fill="#fff" opacity={0.35} />)}
          </g>
          {/* depth scale */}
          {Array.from({ length: HMAX * 2 + 1 }).map((_, i) => {
            const h = i / 2; return <g key={i}><line x1={TX - 8} x2={TX} y1={yOf(h)} y2={yOf(h)} stroke="#94a3b8" /><text x={TX - 12} y={yOf(h) + 3} fontSize={9} fill="#94a3b8" textAnchor="end" className="num">{h} m</text></g>;
          })}
          {/* column above sensor */}
          <rect x={TX + TW / 2 - 22} y={TY} width={44} height={sensorY - TY} fill="#fff" opacity={0.12} />
          <text x={TX + TW / 2} y={Math.max(TY + 14, sensorY - 6)} fontSize={10} fill="#fff" textAnchor="middle" className="num">h = {fmt(st.h)} m</text>
          {/* pressure arrows */}
          {s.showVectors && (
            <g>
              <Arrow x1={TX + TW / 2 - 22 - arrowLen} y1={sensorY} x2={TX + TW / 2 - 24} y2={sensorY} color="#fbbf24" />
              <Arrow x1={TX + TW / 2 + 22 + arrowLen} y1={sensorY} x2={TX + TW / 2 + 24} y2={sensorY} color="#fbbf24" />
              <Arrow x1={TX + TW / 2} y1={sensorY - 14 - arrowLen} x2={TX + TW / 2} y2={sensorY - 14} color="#fbbf24" />
              <Arrow x1={TX + TW / 2} y1={Math.min(TY + TH - 2, sensorY + 14 + arrowLen)} x2={TX + TW / 2} y2={sensorY + 14} color="#fbbf24" />
            </g>
          )}
          {/* sensor */}
          <g style={{ cursor: "grab" }} onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }}>
            <rect x={TX + TW / 2 - 20} y={sensorY - 12} width={40} height={24} rx={6} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
            <circle cx={TX + TW / 2} cy={sensorY} r={5} fill="#22d3ee" className="pulse-glow" />
            <text x={TX + TW / 2} y={sensorY + 26} fontSize={9} fill="#67e8f9" textAnchor="middle">بکش ↕</text>
          </g>
          {/* wire to display */}
          <path d={`M${TX + TW / 2 + 20},${sensorY} C ${TX + TW + 30},${sensorY} ${TX + TW + 20},120 ${TX + TW + 60},120`} stroke="#22d3ee" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
          <foreignObject x={TX + TW + 40} y={30} width={220} height={300}>
            <div className="flex flex-col items-center gap-2" dir="rtl">
              <Gauge value={gauge ? Pg : Pabs} max={gauge ? st.rho * st.g * HMAX : st.P0 + st.rho * st.g * HMAX} label={gauge ? "فشار پیمانه‌ای ρgh" : "فشار مطلق P₀+ρgh"} size={150} />
              <Digital label="P پیمانه‌ای" value={fmtPa(Pg)} />
              <Digital label="P مطلق" value={fmtPa(Pabs)} color="#a5b4fc" />
            </div>
          </foreignObject>
          <text x={TX + TW / 2} y={TY + TH + 22} fontSize={11} fill="#cbd5e1" textAnchor="middle">{liq.name} — ρ = {fmt(st.rho)} kg/m³</text>
        </>
      ) : (
        <>
          <text x={320} y={22} fontSize={13} fill="#fbbf24" textAnchor="middle">در عمق یکسان h = {fmt(st.h)} m، کدام مایع فشار بیشتری ایجاد می‌کند؟</text>
          {cmpLiquids.map((k, i) => {
            const L = LIQUIDS[k]; const x = 40 + i * 205, w = 160, y = 40, hh = 230;
            const sy = y + (st.h / HMAX) * hh; const p = L.rho * st.g * st.h;
            const al = 8 + 60 * (p / (13600 * st.g * st.h || 1));
            return (
              <g key={k}>
                <rect x={x} y={y} width={w} height={hh} fill="#0d1428" stroke="#5b6fa3" strokeWidth={2} rx={4} />
                <rect x={x} y={y} width={w} height={hh} fill={L.color} />
                <rect x={x + w / 2 - 16} y={y} width={32} height={sy - y} fill="#fff" opacity={0.12} />
                <rect x={x + w / 2 - 14} y={sy - 8} width={28} height={16} rx={4} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
                {s.showVectors && <><Arrow x1={x + w / 2 - 16 - al} y1={sy} x2={x + w / 2 - 18} y2={sy} color="#fbbf24" /><Arrow x1={x + w / 2 + 16 + al} y1={sy} x2={x + w / 2 + 18} y2={sy} color="#fbbf24" /></>}
                <text x={x + w / 2} y={y + hh + 18} fontSize={12} fill="#e2e8f0" textAnchor="middle">{L.name} (ρ={L.rho})</text>
                <text x={x + w / 2} y={y + hh + 36} fontSize={13} fill="#fbbf24" fontWeight={700} textAnchor="middle" className="num">{fmtPa(L.rho * st.g * st.h)}</text>
                {/* bar */}
                <rect x={x} y={y + hh + 44} width={w * (p / (13600 * st.g * st.h || 1))} height={6} fill="#fbbf24" rx={3} />
              </g>
            );
          })}
          <text x={320} y={330} fontSize={11} fill="#94a3b8" textAnchor="middle">نتیجه: در عمق برابر، مایع چگال‌تر (جیوه) فشار بیشتری دارد → P ∝ ρ</text>
        </>
      )}
    </svg>
  );

  const controls = (
    <>
      <div className="text-xs text-slate-400 mb-1">نوع مایع</div>
      <Segmented value={st.liquid} onChange={setLiquid} options={Object.entries(LIQUIDS).map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="عمق حسگر" symbol="h" value={st.h} min={0} max={HMAX} step={0.01} unit="m" onChange={(v) => up("h", v)} color="#22d3ee" hint="یا حسگر را در مخزن بکش" />
      <Slider label="چگالی مایع" symbol="ρ" value={st.rho} min={500} max={14000} step={10} unit="kg/m³" onChange={(v) => setSt((o) => ({ ...o, rho: v, liquid: "custom" }))} color="#fbbf24" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" />
      <Slider label="فشار سطح مایع" symbol="P₀" value={st.P0} min={0} max={200000} step={500} unit="Pa" onChange={(v) => up("P0", v)} color="#34d399" hint="101325 Pa = 1 atm" />
      <div className="flex flex-col gap-2 mt-2">
        <Toggle label="فشارسنج: پیمانه‌ای (ρgh) / مطلق" on={gauge} onChange={setGauge} />
        <Toggle label="آزمایش مقایسه‌ای سه مایع" on={compare} onChange={setCompare} />
      </div>
    </>
  );

  const chart = (
    <>
      <Segmented value={chartX} onChange={(v) => { setChartX(v); setCollected([]); }} options={[{ v: "h", l: "P برحسب h" }, { v: "rho", l: "P برحسب ρ" }]} />
      <div className="h-1" />
      {chartX === "h" ? (
        <LiveChart fn={(x) => st.rho * st.g * x} xMin={0} xMax={HMAX} xLabel="h (m)" yLabel="P_gauge (Pa)" current={{ x: st.h, y: Pg }} collected={collected} yFmt={fmtPa}
          extraLines={compare ? cmpLiquids.filter((k) => LIQUIDS[k].rho !== st.rho).map((k) => ({ fn: (x: number) => LIQUIDS[k].rho * st.g * x, color: k === "mercury" ? "#e2e8f0" : k === "oil" ? "#fbbf24" : "#38bdf8", label: LIQUIDS[k].name })) : []}
          title={`خط راست از مبدأ → P ∝ h ؛ شیب = ρg = ${fmt(st.rho * st.g, 0)} Pa/m`} />
      ) : (
        <LiveChart fn={(x) => x * st.g * st.h} xMin={0} xMax={14000} xLabel="ρ (kg/m³)" yLabel="P_gauge (Pa)" current={{ x: st.rho, y: Pg }} collected={collected} yFmt={fmtPa} title={`در عمق ثابت h = ${fmt(st.h)} m ، فشار با چگالی خطی است`} />
      )}
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, chartX === "h" ? { x: st.h, y: Pg } : { x: st.rho, y: Pg }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "در عمق یکسان، فشار پیمانه‌ای در جیوه نسبت به آب چگونه است؟", options: ["بیشتر", "کمتر", "برابر"], answer: "بیشتر", explain: "چگالی جیوه ۱۳.۶ برابر آب است، پس ρgh بزرگ‌تر است." },
    { kind: "پیش‌بینی", q: "اگر چگالی مایع دو برابر شود و عمق ثابت بماند، فشار پیمانه‌ای چه تغییری می‌کند؟", options: ["دو برابر", "نصف", "بدون تغییر", "چهار برابر"], answer: "دو برابر", explain: "P_gauge = ρgh با ρ نسبت مستقیم دارد." },
    { kind: "محاسباتی", q: `فشار پیمانه‌ای در عمق ${fmt(st.h)} m از ${liq.name} (ρ=${fmt(st.rho)} ، g=${fmt(st.g)}) چند پاسکال است؟`, answer: fmt(Pg, 0), numeric: { value: Pg, tol: Pg * 0.03 + 1, unit: "Pa" }, explain: `ρgh = ${fmt(st.rho)}×${fmt(st.g)}×${fmt(st.h)} = ${fmt(Pg, 0)} Pa` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۲ — فشار در مایعات" icon="🌊" unit="Pa"
      concept="حسگر فشار را در مخزن جابه‌جا کن. ستون مایعی که بالای حسگر قرار می‌گیرد، با وزن خود بر حسگر فشار وارد می‌کند."
      formula={<>P = P₀ + ρgh</>} formulaSub={<>P<sub>gauge</sub> = ρgh</>}
      values={[
        { label: "عمق h", value: st.h, unit: "m", flash: active.includes("h") },
        { label: "چگالی ρ", value: st.rho, unit: "kg/m³", color: "text-amber-300", flash: active.includes("rho") },
        { label: "g", value: st.g, unit: "m/s²", color: "text-violet-300", flash: active.includes("g") },
        { label: "P₀", value: fmtPa(st.P0), color: "text-emerald-300", flash: active.includes("P0") },
        { label: "P پیمانه‌ای", value: fmtPa(Pg), color: "text-amber-300" },
        { label: "P مطلق", value: fmtPa(Pabs), color: "text-indigo-300" },
      ]}
      result={<>در عمق <b className="num">{fmt(st.h)} m</b> از {liq.name}، فشار ناشی از مایع <b className="num">{fmtPa(Pg)}</b> و فشار کل <b className="num">{fmtPa(Pabs)}</b> است. {st.h > 0 && <>هر <b>۱ متر</b> پایین‌تر رفتن، <b className="num">{fmtPa(st.rho * st.g)}</b> به فشار می‌افزاید.</>}</>}
      definition={{ parts: [{ t: "فشار مایع در یک نقطه به " }, { t: "چگالی مایع", k: "rho" }, { t: "، " }, { t: "شتاب گرانش", k: "g" }, { t: " و " }, { t: "عمق", k: "h" }, { t: " آن نقطه وابسته است و به " }, { t: "فشار سطح", k: "P0" }, { t: " اضافه می‌شود." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `با پایین رفتن حسگر تا عمق ${fmt(st.h)} m، عقربه‌ی فشارسنج بالاتر رفت، پیکان‌های فشار بلندتر شدند و نقطه روی نمودار روی یک خط راست از مبدأ جلو رفت.`,
        concept: "ستون مایع بالای حسگر بلندتر شد؛ وزن این ستون بر واحد سطح حسگر همان فشار است. مایع چگال‌تر ستون سنگین‌تری می‌سازد، پس شیب نمودار (ρg) تندتر می‌شود.",
        math: <div className="ltr num">P_gauge = ρgh = {fmt(st.rho)} × {fmt(st.g)} × {fmt(st.h)} = {fmtPa(Pg)}<br />P_abs = P₀ + ρgh = {fmtPa(st.P0)} + {fmtPa(Pg)} = {fmtPa(Pabs)}</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 0) { setCompare(true); } if (i === 1) setSt((o) => ({ ...o, rho: Math.min(14000, o.rho * 2), liquid: "custom" })); }}
      onReset={() => { setSt(init); setCollected([]); setCompare(false); }}
    />
  );
}
