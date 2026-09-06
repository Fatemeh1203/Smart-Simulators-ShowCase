import { useEffect, useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Digital, fmt, fmtPa, Btn, ChartPoint, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";
import { LIQUIDS } from "../utils/svg";

const init = { Pgas: 111000, Patm: 101325, liquid: "water", rho: 1000, g: 9.8 };

export default function Manometer() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const up = (k: keyof typeof init, v: number | string) => setSt((o) => ({ ...o, [k]: v }));

  const dP = st.Pgas - st.Patm;
  const dh = dP / (st.rho * st.g); // m, positive → open arm higher
  const { active, dir } = useChanged({ Pgas: st.Pgas, Patm: st.Patm, rho: st.rho, dh });
  const liq = LIQUIDS[st.liquid];
  const dhMax = 1.2; // visual clamp meters
  const dhC = Math.max(-dhMax, Math.min(dhMax, dh));

  // animated level
  const [anim, setAnim] = useState(dhC);
  const lastT = useRef(t);
  useEffect(() => { const dt = t - lastT.current; lastT.current = t; setAnim((a) => a + (dhC - a) * Math.min(1, dt * 4)); }, [t, dhC]);

  // geometry
  const midY = 200, armL = 200, armR = 400, armW = 34, top = 60, bottom = 300, pxPerM = 100;
  const yL = midY + (anim / 2) * pxPerM, yR = midY - (anim / 2) * pxPerM;
  const mode = dP > 50 ? "more" : dP < -50 ? "less" : "equal";

  const note = useMemo(() => {
    if (active.includes("Pgas")) return dir.Pgas === "up" ? "فشار گاز زیاد شد → مایع را در شاخه‌ی متصل به گاز پایین راند → اختلاف ارتفاع Δh بزرگ‌تر شد." : "فشار گاز کم شد → هوا مایع را به سمت گاز هل داد → Δh تغییر کرد.";
    if (active.includes("rho")) return dir.rho === "up" ? "مایع چگال‌تر شد → برای جبران همان اختلاف فشار، ستون کوتاه‌تری کافی است → Δh کوچک‌تر شد." : "مایع سبک‌تر شد → Δh برای همان اختلاف فشار بزرگ‌تر شد (مانومتر حساس‌تر).";
    if (active.includes("Patm")) return "فشار جو تغییر کرد → اختلاف P_gas − P_atm تغییر کرد → Δh جابه‌جا شد.";
    return undefined;
  }, [active, dir]);

  const scene = (
    <svg viewBox="0 0 640 340" className="w-full h-auto select-none">
      <defs><clipPath id="uclip"><path d={`M${armL - armW / 2},${top} h${armW} V${bottom - armW} H${armR - armW / 2} V${top} h${armW} V${bottom} H${armL - armW / 2} Z`} /></clipPath></defs>
      {/* gas tank */}
      <rect x={30} y={70} width={130} height={110} rx={10} fill={mode === "more" ? "rgba(248,113,113,.15)" : mode === "less" ? "rgba(96,165,250,.15)" : "rgba(148,163,184,.15)"} stroke="#5b6fa3" strokeWidth={3} />
      {Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={40 + ((i * 37 + t * (20 + Math.max(0, dP) / 400)) % 110)} cy={80 + ((i * 53 + t * 15) % 90)} r={2} fill={mode === "more" ? "#fca5a5" : "#93c5fd"} opacity={0.7} />)}
      <text x={95} y={62} fontSize={11} fill="#e2e8f0" textAnchor="middle">مخزن گاز</text>
      <text x={95} y={200} fontSize={11} fill="#fbbf24" textAnchor="middle" className="num">P_gas = {fmtPa(st.Pgas)}</text>
      {/* tube from tank to left arm */}
      <path d={`M160,${top + 10} H${armL - armW / 2}`} stroke="#5b6fa3" strokeWidth={10} fill="none" />
      <path d={`M160,${top + 10} H${armL - armW / 2}`} stroke={mode === "more" ? "rgba(248,113,113,.3)" : "rgba(96,165,250,.3)"} strokeWidth={6} fill="none" />
      {/* U tube glass */}
      <path d={`M${armL - armW / 2},${top} V${bottom} H${armR + armW / 2} V${top}`} fill="none" stroke="#7c8fc4" strokeWidth={3} />
      <path d={`M${armL + armW / 2},${top} V${bottom - armW} H${armR - armW / 2} V${top}`} fill="none" stroke="#7c8fc4" strokeWidth={3} />
      {/* liquid */}
      <g clipPath="url(#uclip)">
        <rect x={armL - armW / 2} y={yL} width={armW} height={bottom - yL} fill={liq.color.replace(/[\d.]+\)$/, "0.9)")} />
        <rect x={armR - armW / 2} y={yR} width={armW} height={bottom - yR} fill={liq.color.replace(/[\d.]+\)$/, "0.9)")} />
        <rect x={armL} y={bottom - armW} width={armR - armL} height={armW} fill={liq.color.replace(/[\d.]+\)$/, "0.9)")} />
        <rect x={armL - armW / 2} y={yL - 2} width={armW} height={4} fill={liq.top} />
        <rect x={armR - armW / 2} y={yR - 2} width={armW} height={4} fill={liq.top} />
      </g>
      {/* open arm label */}
      <text x={armR} y={top - 8} fontSize={11} fill="#93c5fd" textAnchor="middle" className="num">باز به هوا — P_atm = {fmtPa(st.Patm)}</text>
      {s.showVectors && <>
        <Arrow x1={armL} y1={yL - 40 - Math.min(40, Math.abs(dP) / 800)} x2={armL} y2={yL - 6} color="#fbbf24" width={3} label="P_gas" labelPos="start" />
        <Arrow x1={armR} y1={yR - 40 - Math.min(40, st.Patm / 4000)} x2={armR} y2={yR - 6} color="#93c5fd" width={3} label="P_atm" labelPos="start" />
      </>}
      {/* Δh dimension */}
      <line x1={armL - armW / 2 - 10} x2={armR + armW / 2 + 10} y1={yL} y2={yL} stroke="#f472b6" strokeDasharray="4 3" />
      <line x1={armL - armW / 2 - 10} x2={armR + armW / 2 + 10} y1={yR} y2={yR} stroke="#f472b6" strokeDasharray="4 3" />
      <line x1={armR + armW / 2 + 40} x2={armR + armW / 2 + 40} y1={Math.min(yL, yR)} y2={Math.max(yL, yR)} stroke="#f472b6" strokeWidth={2} />
      <text x={armR + armW / 2 + 48} y={(yL + yR) / 2 + 4} fontSize={12} fill="#f472b6" fontWeight={700} className="num">Δh = {fmt(dh * 100, 1)} cm</text>
      {/* reference at equal level */}
      <line x1={armL - armW / 2} x2={armR + armW / 2} y1={midY} y2={midY} stroke="#475569" strokeDasharray="2 4" />
      {/* equal-pressure level A-B */}
      <circle cx={armL} cy={Math.max(yL, yR)} r={4} fill="#22d3ee" /><circle cx={armR} cy={Math.max(yL, yR)} r={4} fill="#22d3ee" />
      <text x={(armL + armR) / 2} y={Math.max(yL, yR) + 14} fontSize={9} fill="#67e8f9" textAnchor="middle">A و B هم‌تراز → P_A = P_B</text>
      {/* state banner */}
      <foreignObject x={470} y={40} width={165} height={300}>
        <div className="flex flex-col gap-2 items-center" dir="rtl">
          <div className={`text-xs px-2 py-1 rounded-lg border text-center leading-5 ${mode === "more" ? "border-rose-400/50 bg-rose-500/10 text-rose-200" : mode === "less" ? "border-sky-400/50 bg-sky-500/10 text-sky-200" : "border-slate-400/50 text-slate-200"}`}>
            {mode === "more" ? "حالت ۱: P_gas > P_atm ⇒ ستون سمت هوا بالاتر" : mode === "less" ? "حالت ۲: P_gas < P_atm ⇒ ستون سمت گاز بالاتر" : "P_gas ≈ P_atm ⇒ دو ستون هم‌تراز"}
          </div>
          <Digital label="فشار پیمانه‌ای ρgΔh" value={fmtPa(dP)} color={dP >= 0 ? "#fde68a" : "#93c5fd"} />
          <Digital label="فشار مطلق گاز" value={fmtPa(st.Pgas)} color="#a5b4fc" />
        </div>
      </foreignObject>
      {Math.abs(dh) > dhMax && <text x={320} y={325} fontSize={10} fill="#fca5a5" textAnchor="middle">Δh واقعی از لوله بیرون می‌زند — مایع چگال‌تری (جیوه) انتخاب کن</text>}
    </svg>
  );

  const controls = (
    <>
      <Slider label="فشار گاز (مطلق)" symbol="P_gas" value={st.Pgas} min={60000} max={160000} step={100} unit="Pa" onChange={(v) => up("Pgas", v)} color="#fbbf24" />
      <Slider label="فشار جو" symbol="P_atm" value={st.Patm} min={80000} max={110000} step={100} unit="Pa" onChange={(v) => up("Patm", v)} color="#93c5fd" />
      <div className="text-xs text-slate-400 mb-1">مایع مانومتر</div>
      <Segmented value={st.liquid} onChange={(k) => setSt((o) => ({ ...o, liquid: k, rho: k === "custom" ? o.rho : LIQUIDS[k].rho }))} options={Object.entries(LIQUIDS).map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="چگالی مایع" symbol="ρ" value={st.rho} min={500} max={14000} step={10} unit="kg/m³" onChange={(v) => setSt((o) => ({ ...o, rho: v, liquid: "custom" }))} color="#f472b6" />
      <Slider label="اختلاف ارتفاع (تنظیم مستقیم)" symbol="Δh" value={Math.round(dh * 1000) / 10} min={-100} max={100} step={0.5} unit="cm" onChange={(v) => up("Pgas", st.Patm + st.rho * st.g * (v / 100))} color="#f472b6" hint="با تغییر Δh، فشار گاز محاسبه می‌شود" />
      <div className="flex gap-1.5 flex-wrap">
        <Btn small tone="rose" onClick={() => up("Pgas", st.Patm + 12000)}>حالت P_gas &gt; P_atm</Btn>
        <Btn small tone="cyan" onClick={() => up("Pgas", st.Patm - 12000)}>حالت P_gas &lt; P_atm</Btn>
        <Btn small tone="slate" onClick={() => up("Pgas", st.Patm)}>هم‌تراز</Btn>
      </div>
    </>
  );

  const chart = (
    <>
      <LiveChart fn={(x) => (x - st.Patm) / (st.rho * st.g) * 100} xMin={60000} xMax={160000} xLabel="P_gas (Pa)" yLabel="Δh (cm)" current={{ x: st.Pgas, y: dh * 100 }} collected={collected} xFmt={(v) => fmt(v / 1000, 0) + "k"} title={`Δh با (P_gas − P_atm) خطی است؛ در P_gas = P_atm صفر می‌شود. شیب = 1/(ρg)`} />
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, { x: st.Pgas, y: dh * 100 }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "اگر ستون مایع در شاخه‌ی متصل به گاز پایین‌تر از شاخه‌ی باز باشد، فشار گاز نسبت به جو چگونه است؟", options: ["بیشتر", "کمتر", "برابر"], answer: "بیشتر", explain: "گاز مایع را پایین رانده، پس P_gas = P_atm + ρgΔh > P_atm." },
    { kind: "پیش‌بینی", q: "اگر آب مانومتر را با جیوه عوض کنیم (فشارها ثابت)، Δh چه می‌شود؟", options: ["حدود ۱۳.۶ برابر کوچک‌تر", "حدود ۱۳.۶ برابر بزرگ‌تر", "بدون تغییر"], answer: "حدود ۱۳.۶ برابر کوچک‌تر", explain: "Δh = ΔP/(ρg) و چگالی جیوه ۱۳.۶ برابر آب است." },
    { kind: "محاسباتی", q: `با Δh = ${fmt(dh * 100, 1)} cm از ${liq.name} (ρ=${fmt(st.rho)}) و P_atm = ${fmt(st.Patm)} Pa فشار مطلق گاز چند پاسکال است؟`, answer: fmt(st.Pgas, 0), numeric: { value: st.Pgas, tol: 400, unit: "Pa" }, explain: `P_gas = P_atm + ρgΔh = ${fmt(st.Patm)} + ${fmt(dP, 0)} = ${fmt(st.Pgas, 0)} Pa` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۵ — مانومتر U شکل" icon="🧪" unit="Pa"
      concept="یک لوله‌ی U شکل با مایع رنگی: یک شاخه به مخزن گاز و شاخه‌ی دیگر به هوای آزاد متصل است. اختلاف ارتفاع دو ستون، اختلاف فشار گاز و جو را «می‌سنجد»."
      formula={<>P_gas − P_atm = ρgΔh</>} formulaSub={<>فشار پیمانه‌ای = ρgΔh ، فشار مطلق = P_atm + ρgΔh</>}
      values={[
        { label: "P_gas (مطلق)", value: fmtPa(st.Pgas), color: "text-amber-300", flash: active.includes("Pgas") },
        { label: "P_atm", value: fmtPa(st.Patm), color: "text-sky-300", flash: active.includes("Patm") },
        { label: "ρ مایع", value: st.rho, unit: "kg/m³", color: "text-pink-300", flash: active.includes("rho") },
        { label: "Δh", value: fmt(dh * 100, 1), unit: "cm", color: "text-pink-300", flash: active.includes("dh") },
        { label: "P پیمانه‌ای", value: fmtPa(dP), color: dP >= 0 ? "text-rose-300" : "text-sky-300" },
      ]}
      result={<>{mode === "more" ? <>ستون سمت هوا <b className="num">{fmt(Math.abs(dh) * 100, 1)} cm</b> بالاتر است ⇒ فشار گاز <b className="num">{fmtPa(Math.abs(dP))}</b> <b>بیشتر</b> از جو است.</> : mode === "less" ? <>ستون سمت گاز <b className="num">{fmt(Math.abs(dh) * 100, 1)} cm</b> بالاتر است ⇒ فشار گاز <b className="num">{fmtPa(Math.abs(dP))}</b> <b>کمتر</b> از جو است (فشار پیمانه‌ای منفی).</> : <>دو ستون هم‌ترازند ⇒ فشار گاز برابر فشار جو است.</>} فشار مطلق گاز = <b className="num">{fmtPa(st.Pgas)}</b>.</>}
      definition={{ parts: [{ t: "فشار پیمانه‌ای", k: "dh" }, { t: " اختلاف فشار گاز با " }, { t: "فشار جو", k: "Patm" }, { t: " است و از روی " }, { t: "اختلاف ارتفاع", k: "dh" }, { t: " و " }, { t: "چگالی مایع", k: "rho" }, { t: " به‌دست می‌آید؛ " }, { t: "فشار مطلق", k: "Pgas" }, { t: " = فشار جو + فشار پیمانه‌ای." }], active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: mode === "more" ? `با افزایش فشار گاز، مایع در شاخه‌ی گاز پایین رفت و در شاخه‌ی باز بالا آمد تا اختلاف ${fmt(dh * 100, 1)} cm ایجاد شد.` : mode === "less" ? `فشار گاز کمتر از جو شد؛ هوا مایع را به سمت گاز راند و ستون سمت گاز ${fmt(-dh * 100, 1)} cm بالاتر ایستاد.` : "فشار گاز و جو برابر شدند و دو ستون هم‌تراز ماندند.",
        concept: "در دو نقطه‌ی هم‌تراز از یک مایع پیوسته (A و B) فشار برابر است. در یک طرف، گاز فشار وارد می‌کند و در طرف دیگر، هوا به‌علاوه‌ی وزن ستون اضافی مایع. پس اختلاف فشار گاز و جو دقیقاً برابر با فشار ستون اضافی، یعنی ρgΔh است.",
        math: <div className="ltr num">P_A = P_B ⇒ P_gas = P_atm + ρgΔh<br />ρgΔh = {fmt(st.rho)} × {fmt(st.g)} × {fmt(dh, 3)} = {fmtPa(dP)}<br />P_gas = {fmtPa(st.Patm)} + ({fmtPa(dP)}) = {fmtPa(st.Pgas)}</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 0) up("Pgas", st.Patm + 15000); if (i === 1) setSt((o) => ({ ...o, liquid: "mercury", rho: 13600 })); }}
      onReset={() => { setSt(init); setCollected([]); }}
    />
  );
}
