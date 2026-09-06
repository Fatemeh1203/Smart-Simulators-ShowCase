import { useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, Arrow, Digital, fmt, fmtPa, Toggle, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";
import { svgPoint, LIQUIDS } from "../utils/svg";

const R = 130, CX = 200, CY = 170; // sphere
const D = 2 * R; const HMAX = 2.0; // meters mapped to sphere diameter
const init = { h: 1.0, theta: 0, liquid: "water", rho: 1000, g: 9.8 };

export default function AllDirections() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [showRing, setShowRing] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const up = (k: keyof typeof init, v: number | string) => setSt((o) => ({ ...o, [k]: v }));
  const P = (h: number) => st.rho * st.g * h;
  const Pc = P(st.h);
  const { active, dir } = useChanged({ h: st.h, theta: st.theta, rho: st.rho });
  const liq = LIQUIDS[st.liquid];

  const yOf = (h: number) => CY - R + (h / HMAX) * D;
  const py = yOf(st.h);
  const halfW = Math.sqrt(Math.max(0, R * R - (py - CY) * (py - CY)));
  const px = CX;

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = svgPoint(e, svgRef.current);
    up("h", Math.round(Math.max(0.05, Math.min(HMAX - 0.05, ((p.y - (CY - R)) / D) * HMAX)) * 100) / 100);
  };

  // sensors around the point (same depth) — different orientations
  const dirs = [{ a: 0, l: "→" }, { a: 90, l: "↓" }, { a: 180, l: "←" }, { a: 270, l: "↑" }, { a: 45, l: "↘" }, { a: 225, l: "↖" }];
  const arrowL = 12 + 40 * (st.h / HMAX);
  const particles = useMemo(() => Array.from({ length: 70 }).map(() => { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * (R - 6); return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.4 + Math.random() * 1.2, ph: Math.random() * 6.28, va: Math.random() * 6.28 }; }), []);

  const rad = (st.theta * Math.PI) / 180;
  const note = useMemo(() => {
    if (active.includes("theta")) return "جهت حسگر تغییر کرد ولی عدد فشار تغییری نکرد → فشار در یک نقطه از مایع ساکن به جهت سطح بستگی ندارد.";
    if (active.includes("h")) return dir.h === "up" ? "عمق نقطه زیاد شد → فشار همه‌ی حسگرهای هم‌عمق با هم و به یک اندازه زیاد شد." : "عمق کم شد → فشار همه‌ی حسگرهای هم‌عمق با هم کم شد.";
    return undefined;
  }, [active, dir]);

  const scene = (
    <svg ref={svgRef} viewBox="0 0 640 340" className="w-full h-auto select-none touch-none" onPointerMove={onMove} onPointerUp={() => (drag.current = false)}>
      <defs>
        <radialGradient id="sph" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="rgba(255,255,255,.25)" /><stop offset="0.6" stopColor={liq.color} /><stop offset="1" stopColor="rgba(0,0,0,.35)" /></radialGradient>
        <clipPath id="sphClip"><circle cx={CX} cy={CY} r={R - 2} /></clipPath>
      </defs>
      <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="#5b6fa3" strokeWidth={4} />
      <circle cx={CX} cy={CY} r={R} fill="url(#sph)" />
      {/* particles */}
      <g clipPath="url(#sphClip)">
        {particles.map((p, i) => <circle key={i} cx={CX + p.x + Math.cos(t * p.s + p.ph) * 8} cy={CY + p.y + Math.sin(t * p.s * 0.8 + p.va) * 8} r={1.7} fill="#fff" opacity={0.4} />)}
        {/* isobar line */}
        {showRing && <line x1={CX - halfW} x2={CX + halfW} y1={py} y2={py} stroke="#fbbf24" strokeDasharray="6 4" strokeWidth={1.5} />}
        {/* column above point */}
        <rect x={px - 6} y={CY - R} width={12} height={py - (CY - R)} fill="#fff" opacity={0.12} />
      </g>
      {/* depth ruler */}
      {[0, 0.5, 1, 1.5, 2].map((h) => <g key={h}><line x1={CX + R + 12} x2={CX + R + 20} y1={yOf(h)} y2={yOf(h)} stroke="#94a3b8" /><text x={CX + R + 24} y={yOf(h) + 3} fontSize={9} fill="#94a3b8" className="num">{h} m</text></g>)}
      {/* sensors ring at same depth */}
      {showRing && [-0.75, -0.4, 0.4, 0.75].map((f, i) => {
        const sx = CX + f * halfW; const p = P(st.h);
        return <g key={i}><rect x={sx - 12} y={py - 7} width={24} height={14} rx={3} fill="#0f172a" stroke="#fbbf24" /><text x={sx} y={py + 3} fontSize={7} fill="#fde68a" textAnchor="middle" className="num">{fmt(p / 1000, 1)}k</text></g>;
      })}
      {/* pressure arrows around the point */}
      {s.showVectors && dirs.map((d, i) => {
        const a = (d.a * Math.PI) / 180;
        return <Arrow key={i} x1={px + Math.cos(a) * (arrowL + 16)} y1={py + Math.sin(a) * (arrowL + 16)} x2={px + Math.cos(a) * 16} y2={py + Math.sin(a) * 16} color="#fbbf24" width={2.5} />;
      })}
      {/* rotating sensor */}
      <g style={{ cursor: "grab" }} onPointerDown={(e) => { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }}>
        <g transform={`rotate(${st.theta} ${px} ${py})`}>
          <rect x={px - 14} y={py - 5} width={28} height={10} rx={2} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
          <line x1={px - 14} x2={px + 14} y1={py - 5} y2={py - 5} stroke="#22d3ee" strokeWidth={3} />
        </g>
        <circle cx={px} cy={py} r={3} fill="#22d3ee" />
      </g>
      <text x={px} y={py + 34} fontSize={9} fill="#67e8f9" textAnchor="middle">حسگر چرخان (بکش ↕)</text>
      {/* comparison sensors at other depths */}
      {[0.3, 1.7].map((h, i) => <g key={i}><rect x={CX - 60 + i * 100} y={yOf(h) - 7} width={40} height={14} rx={3} fill="#0f172a" stroke="#94a3b8" /><text x={CX - 40 + i * 100} y={yOf(h) + 3} fontSize={7} fill="#cbd5e1" textAnchor="middle" className="num">{fmtPa(P(h))}</text></g>)}
      {/* readouts */}
      <foreignObject x={400} y={20} width={230} height={310}>
        <div className="flex flex-col gap-2 items-center" dir="rtl">
          <Digital label={`حسگر چرخان (θ=${st.theta}°)`} value={fmtPa(Pc)} />
          <div className="grid grid-cols-2 gap-1 w-full">
            {dirs.slice(0, 4).map((d) => <Digital key={d.a} label={`جهت ${d.l}`} value={fmtPa(Pc)} color="#fde68a" />)}
          </div>
          <div className="text-[11px] text-slate-300 text-center leading-5 glass p-2">همه‌ی حسگرهای هم‌عمق (روی خط زرد) عدد یکسانی نشان می‌دهند — مستقل از جهت.</div>
        </div>
      </foreignObject>
    </svg>
  );

  const controls = (
    <>
      <Slider label="عمق نقطه" symbol="h" value={st.h} min={0.05} max={HMAX - 0.05} step={0.01} unit="m" onChange={(v) => up("h", v)} color="#22d3ee" />
      <Slider label="زاویه‌ی سطح حسگر" symbol="θ" value={st.theta} min={0} max={360} step={5} unit="°" onChange={(v) => up("theta", v)} color="#fbbf24" hint="حسگر را بچرخان — فشار تغییر نمی‌کند" />
      <div className="text-xs text-slate-400 mb-1">مایع</div>
      <Segmented value={st.liquid} onChange={(k) => setSt((o) => ({ ...o, liquid: k, rho: k === "custom" ? o.rho : LIQUIDS[k].rho }))} options={Object.entries(LIQUIDS).filter(([k]) => k !== "custom").map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" />
      <Toggle label="نمایش خط هم‌فشار و حسگرهای هم‌عمق" on={showRing} onChange={setShowRing} />
    </>
  );

  const chart = (
    <LiveChart fn={() => Pc} xMin={0} xMax={360} xLabel="θ (درجه) — جهت حسگر" yLabel="P (Pa)" current={{ x: st.theta, y: Pc }} yFmt={fmtPa} title={`نمودار P برحسب زاویه در عمق ${fmt(st.h)} m یک خط افقی است → فشار به جهت وابسته نیست`} />
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "حسگری را در عمق ثابت ۹۰ درجه می‌چرخانیم. فشار خوانده‌شده چه می‌شود؟", options: ["تغییر نمی‌کند", "نصف می‌شود", "صفر می‌شود"], answer: "تغییر نمی‌کند", explain: "فشار در مایع ساکن کمیتی نرده‌ای است و از همه جهت‌ها یکسان وارد می‌شود." },
    { kind: "پیش‌بینی", q: "دو حسگر در دو نقطه‌ی مختلف ولی هم‌عمق در دو طرف کره قرار دارند. کدام فشار بیشتری نشان می‌دهد؟", options: ["سمت چپ", "سمت راست", "برابرند"], answer: "برابرند", explain: "فشار فقط به عمق وابسته است، نه به مکان افقی." },
    { kind: "محاسباتی", q: `اگر حسگر رو به بالا در عمق ${fmt(st.h)} m از ${liq.name} باشد، فشار پیمانه‌ای چقدر است؟`, answer: fmt(Pc, 0), numeric: { value: Pc, tol: Pc * 0.03 + 1, unit: "Pa" }, explain: `جهت اهمیتی ندارد: ρgh = ${fmt(Pc, 0)} Pa` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۳ — فشار در همه‌ی جهت‌ها" icon="🔮" unit="Pa"
      concept="در یک محفظه‌ی کروی پر از مایع، چند حسگر در یک عمق و با جهت‌های مختلف قرار دارند. آیا جهت سطح حسگر روی عدد فشار اثر دارد؟"
      formula={<>P(h, θ) = ρgh</>} formulaSub="مستقل از θ — فقط تابع عمق"
      values={[
        { label: "عمق h", value: st.h, unit: "m", flash: active.includes("h") },
        { label: "زاویه θ", value: st.theta, unit: "°", color: "text-amber-300", flash: active.includes("theta") },
        { label: "ρ", value: st.rho, unit: "kg/m³" },
        { label: "P همه‌ی حسگرها", value: fmtPa(Pc), color: "text-amber-300" },
        { label: "مؤلفه‌ی افقی/عمودی", value: `${fmtPa(Pc * Math.abs(Math.cos(rad)))} / ${fmtPa(Pc * Math.abs(Math.sin(rad)))}`, color: "text-slate-300" },
      ]}
      result={<>در عمق <b className="num">{fmt(st.h)} m</b> هر شش حسگر (بالا، پایین، چپ، راست، مورب) عدد یکسان <b className="num">{fmtPa(Pc)}</b> را نشان می‌دهند. چرخاندن حسگر تا <b className="num">{st.theta}°</b> عدد را تغییر نداد.</>}
      definition={{ parts: [{ t: "در مایع ساکن، فشار در یک " }, { t: "عمق", k: "h" }, { t: " معین از " }, { t: "همه‌ی جهت‌ها", k: "theta" }, { t: " به یک اندازه وارد می‌شود و فقط به " }, { t: "چگالی", k: "rho" }, { t: " و عمق بستگی دارد." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `با چرخاندن حسگر (θ = ${st.theta}°) عدد فشار ثابت ماند (${fmtPa(Pc)}). وقتی عمق را تغییر دادیم، همه‌ی حسگرهای هم‌عمق با هم تغییر کردند.`,
        concept: "ذرات مایع در همه جهت‌ها آزادانه حرکت می‌کنند و با هر سطحی که به آن‌ها برخورد کند، به‌طور عمود برهم‌کنش می‌کنند. اگر فشار در یک جهت بیشتر بود، مایع در آن جهت جریان می‌یافت و ساکن نمی‌ماند.",
        math: <div className="ltr num">P = ρgh = {fmt(st.rho)} × {fmt(st.g)} × {fmt(st.h)} = {fmtPa(Pc)} &nbsp; (برای هر θ)</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 0) up("theta", (st.theta + 90) % 360); }}
      onReset={() => setSt(init)}
    />
  );
}
