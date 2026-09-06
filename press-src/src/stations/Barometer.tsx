import { useEffect, useMemo, useRef, useState } from "react";
import StationLayout, { useSettings } from "../components/StationLayout";
import { Slider, Segmented, LiveChart, DataBar, Arrow, Digital, fmt, fmtPa, Btn, ChartPoint, QuizQ, useClock } from "../components/ui";
import { useChanged } from "../hooks/useChanged";
import { LIQUIDS } from "../utils/svg";

const init = { Patm: 101325, liquid: "mercury", rho: 13600, g: 9.8, Pg: 200000 };

export default function Barometer() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [st, setSt] = useState(init);
  const [cmp, setCmp] = useState(false);
  const [collected, setCollected] = useState<ChartPoint[]>([]);
  const up = (k: keyof typeof init, v: number | string) => setSt((o) => ({ ...o, [k]: v }));

  const h = st.Patm / (st.rho * st.g); // m
  const { active, dir } = useChanged({ Patm: st.Patm, rho: st.rho, g: st.g });
  const liq = LIQUIDS[st.liquid];
  const hmm = h * 1000;

  const [anim, setAnim] = useState(h);
  const lastT = useRef(t);
  useEffect(() => { const dt = t - lastT.current; lastT.current = t; setAnim((a) => a + (h - a) * Math.min(1, dt * 4)); }, [t, h]);

  // geometry: tube 1 m tall drawn as 240px; for water (10m) we scale
  const scaleM = st.rho > 5000 ? 1.0 : 12; // meters shown on ruler
  const tubeTop = 40, dishY = 290, tubeH = dishY - tubeTop - 10, pxPerM = tubeH / scaleM;
  const tx = 200, tw = 26;
  const colTop = dishY - 10 - Math.min(tubeH, anim * pxPerM);
  const overflow = h > scaleM;

  const note = useMemo(() => {
    if (active.includes("Patm")) return dir.Patm === "up" ? "فشار جو زیاد شد → هوا سطح مایع در ظرف را محکم‌تر فشار داد → مایع بیشتری به داخل لوله رانده شد → ستون بلندتر شد." : "فشار جو کم شد → ستون مایع پایین‌تر آمد (مثل بالا رفتن از کوه).";
    if (active.includes("rho")) return dir.rho === "up" ? "مایع چگال‌تر شد → ستون کوتاه‌تری همان فشار را متعادل می‌کند." : "مایع سبک‌تر شد → ستون بسیار بلندتری لازم است (با آب حدود ۱۰ متر!).";
    if (active.includes("g")) return "g تغییر کرد → وزن ستون تغییر کرد → ارتفاع تعادل ستون تغییر کرد.";
    return undefined;
  }, [active, dir]);

  const scene = (
    <svg viewBox="0 0 640 340" className="w-full h-auto select-none">
      {/* atmosphere particles */}
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={((i * 97 + t * 12) % 620) + 10} cy={((i * 61 + t * 8) % 250) + 20} r={1.5} fill="#93c5fd" opacity={0.25 + (st.Patm / 120000) * 0.4} />)}
      <text x={90} y={30} fontSize={11} fill="#93c5fd">هوا (جو) — P_atm = {fmtPa(st.Patm)}</text>
      {/* dish */}
      <path d={`M120,${dishY - 20} V${dishY + 20} H280 V${dishY - 20}`} fill="none" stroke="#7c8fc4" strokeWidth={3} />
      <rect x={121} y={dishY - 6} width={158} height={26} fill={liq.color.replace(/[\d.]+\)$/, "0.9)")} />
      {/* tube */}
      <rect x={tx - tw / 2} y={tubeTop} width={tw} height={dishY + 6 - tubeTop} fill="#0d1428" stroke="#7c8fc4" strokeWidth={3} rx={4} />
      <rect x={tx - tw / 2 + 2} y={colTop} width={tw - 4} height={dishY + 6 - colTop} fill={liq.color.replace(/[\d.]+\)$/, "0.95)")} />
      <text x={tx} y={tubeTop + 16} fontSize={9} fill="#94a3b8" textAnchor="middle">خلأ</text>
      <text x={tx} y={tubeTop + 27} fontSize={8} fill="#64748b" textAnchor="middle">P ≈ 0</text>
      {/* ruler */}
      {Array.from({ length: 11 }).map((_, i) => { const m = (scaleM * i) / 10; const y = dishY - 10 - m * pxPerM; return <g key={i}><line x1={tx + tw / 2 + 6} x2={tx + tw / 2 + 14} y1={y} y2={y} stroke="#94a3b8" /><text x={tx + tw / 2 + 18} y={y + 3} fontSize={8} fill="#94a3b8" className="num">{scaleM === 1 ? `${fmt(m * 1000, 0)} mm` : `${fmt(m, 1)} m`}</text></g>; })}
      {/* h dimension */}
      <line x1={tx - tw / 2 - 20} x2={tx - tw / 2 - 20} y1={colTop} y2={dishY - 6} stroke="#f472b6" strokeWidth={2} />
      <text x={tx - tw / 2 - 26} y={(colTop + dishY) / 2} fontSize={12} fill="#f472b6" fontWeight={700} textAnchor="end" className="num">h = {st.rho > 5000 ? `${fmt(hmm, 0)} mm` : `${fmt(h, 2)} m`}</text>
      {s.showVectors && <>
        <Arrow x1={150} y1={dishY - 60} x2={150} y2={dishY - 12} color="#93c5fd" width={3} label="P_atm" labelPos="start" />
        <Arrow x1={250} y1={dishY - 60} x2={250} y2={dishY - 12} color="#93c5fd" width={3} />
        <Arrow x1={tx} y1={colTop + 10} x2={tx} y2={Math.min(dishY - 20, colTop + 50)} color="#f472b6" width={3} label="ρgh" />
      </>}
      {overflow && <text x={tx} y={dishY + 40} fontSize={10} fill="#fca5a5" textAnchor="middle">ستون از لوله بلندتر است ({fmt(h, 1)} m) — مایع چگال‌تر انتخاب کن</text>}
      {/* comparison panel */}
      {cmp ? (
        <g>
          <text x={470} y={50} fontSize={12} fill="#fde68a" textAnchor="middle">مقایسه‌ی فشار مطلق و پیمانه‌ای</text>
          {(() => {
            const maxP = st.Patm + st.Pg; const H = 200, base = 280, bw = 50;
            const hAtm = (st.Patm / maxP) * H, hG = (st.Pg / maxP) * H;
            return <>
              {/* absolute bar */}
              <rect x={400} y={base - hAtm} width={bw} height={hAtm} fill="#60a5fa" opacity={0.8} />
              <rect x={400} y={base - hAtm - hG} width={bw} height={hG} fill="#fbbf24" opacity={0.9} />
              <text x={425} y={base + 14} fontSize={9} fill="#cbd5e1" textAnchor="middle">مطلق</text>
              <text x={425} y={base - hAtm - hG - 6} fontSize={9} fill="#fff" textAnchor="middle" className="num">{fmtPa(st.Patm + st.Pg)}</text>
              {/* gauge bar */}
              <rect x={500} y={base - hG} width={bw} height={hG} fill="#fbbf24" opacity={0.9} />
              <text x={525} y={base + 14} fontSize={9} fill="#cbd5e1" textAnchor="middle">پیمانه‌ای</text>
              <text x={525} y={base - hG - 6} fontSize={9} fill="#fff" textAnchor="middle" className="num">{fmtPa(st.Pg)}</text>
              {/* legends */}
              <rect x={400} y={base + 24} width={10} height={10} fill="#60a5fa" /><text x={414} y={base + 33} fontSize={9} fill="#cbd5e1">P_atm (فشارسنج آن را «صفر» می‌گیرد)</text>
              <rect x={400} y={base + 38} width={10} height={10} fill="#fbbf24" /><text x={414} y={base + 47} fontSize={9} fill="#cbd5e1">P_gauge (آنچه فشارسنج لاستیک نشان می‌دهد)</text>
              <line x1={395} x2={560} y1={base - hAtm} y2={base - hAtm} stroke="#60a5fa" strokeDasharray="3 3" />
              <text x={560} y={base - hAtm + 3} fontSize={8} fill="#93c5fd">سطح صفرِ پیمانه‌ای</text>
            </>;
          })()}
        </g>
      ) : (
        <foreignObject x={380} y={60} width={240} height={230}>
          <div className="flex flex-col items-center gap-2" dir="rtl">
            <Digital label="ارتفاع ستون" value={st.rho > 5000 ? `${fmt(hmm, 0)} mm` : `${fmt(h, 2)} m`} color="#f9a8d4" />
            <Digital label="ρgh (= P_atm)" value={fmtPa(st.rho * st.g * h)} />
            <div className="text-[11px] text-slate-300 text-center leading-5 glass p-2">فشار جو، ستون {liq.name} را نگه می‌دارد: وزن ستون ÷ سطح = P_atm. بالای ستون خلأ است (P≈0)، پس این فشارسنج «مطلق» می‌سنجد.</div>
          </div>
        </foreignObject>
      )}
    </svg>
  );

  const controls = (
    <>
      <Slider label="فشار جو" symbol="P_atm" value={st.Patm} min={30000} max={120000} step={100} unit="Pa" onChange={(v) => up("Patm", v)} color="#93c5fd" hint="سطح دریا 101325 ، قله اورست ≈ 33700" />
      <div className="text-xs text-slate-400 mb-1">مایع فشارسنج</div>
      <Segmented value={st.liquid} onChange={(k) => setSt((o) => ({ ...o, liquid: k, rho: k === "custom" ? o.rho : LIQUIDS[k].rho }))} options={Object.entries(LIQUIDS).map(([k, v]) => ({ v: k, l: v.name }))} />
      <div className="h-2" />
      <Slider label="چگالی" symbol="ρ" value={st.rho} min={500} max={14000} step={10} unit="kg/m³" onChange={(v) => setSt((o) => ({ ...o, rho: v, liquid: "custom" }))} color="#f472b6" />
      <Slider label="شتاب گرانش" symbol="g" value={st.g} min={1} max={25} step={0.1} unit="m/s²" onChange={(v) => up("g", v)} color="#a78bfa" />
      <Slider label="ارتفاع ستون (تنظیم مستقیم)" symbol="h" value={Math.round(h * 1000) / 1000} min={0.1} max={st.rho > 5000 ? 1 : 12} step={0.001} unit="m" onChange={(v) => up("Patm", v * st.rho * st.g)} color="#f472b6" hint="با تغییر h، فشار جو متناظر محاسبه می‌شود" />
      <Btn tone="amber" active={cmp} onClick={() => setCmp(!cmp)} className="w-full">⚖️ مقایسه‌ی فشار مطلق و فشار پیمانه‌ای</Btn>
      {cmp && <div className="mt-2"><Slider label="فشار پیمانه‌ای نمونه (مثلاً لاستیک)" symbol="P_gauge" value={st.Pg} min={0} max={400000} step={1000} unit="Pa" onChange={(v) => up("Pg", v)} color="#fbbf24" />
        <div className="glass p-2 text-xs leading-6 num">P_abs = P_atm + P_gauge = {fmtPa(st.Patm)} + {fmtPa(st.Pg)} = <b>{fmtPa(st.Patm + st.Pg)}</b></div></div>}
    </>
  );

  const chart = (
    <>
      <LiveChart fn={(x) => x / (st.rho * st.g) * (st.rho > 5000 ? 1000 : 1)} xMin={30000} xMax={120000} xLabel="P_atm (Pa)" yLabel={st.rho > 5000 ? "h (mm)" : "h (m)"} current={{ x: st.Patm, y: h * (st.rho > 5000 ? 1000 : 1) }} collected={collected} xFmt={(v) => fmt(v / 1000, 0) + "k"} title={`h = P_atm/(ρg) — خط راست از مبدأ؛ شیب = 1/(ρg)`} />
      <DataBar count={collected.length} onAdd={() => setCollected([...collected, { x: st.Patm, y: h * (st.rho > 5000 ? 1000 : 1) }])} onClear={() => setCollected([])} />
    </>
  );

  const quiz: QuizQ[] = [
    { kind: "مفهومی", q: "چرا در فشارسنج جیوه‌ای بالای ستون خلأ است و این چه اهمیتی دارد؟", options: ["تا فشار مطلق سنجیده شود", "برای زیبایی", "تا جیوه تبخیر نشود"], answer: "تا فشار مطلق سنجیده شود", explain: "چون بالای ستون P≈0 است، ρgh مستقیماً برابر فشار مطلق جو می‌شود." },
    { kind: "پیش‌بینی", q: "اگر همین آزمایش را با آب انجام دهیم، ستون چند برابر بلندتر می‌شود؟", options: ["≈ ۱۳.۶ برابر", "≈ ۲ برابر", "کوتاه‌تر می‌شود"], answer: "≈ ۱۳.۶ برابر", explain: "h = P/(ρg) ؛ چگالی آب ۱۳.۶ برابر کمتر از جیوه است → حدود ۱۰.۳ متر." },
    { kind: "محاسباتی", q: `ستون ${liq.name} با ارتفاع ${st.rho > 5000 ? fmt(hmm, 0) + " mm" : fmt(h, 2) + " m"} (ρ=${fmt(st.rho)} ، g=${fmt(st.g)}) چه فشاری را نشان می‌دهد؟`, answer: fmt(st.Patm, 0), numeric: { value: st.Patm, tol: st.Patm * 0.03, unit: "Pa" }, explain: `P = ρgh = ${fmt(st.rho)}×${fmt(st.g)}×${fmt(h, 3)} = ${fmt(st.Patm, 0)} Pa` },
  ];

  return (
    <StationLayout
      title="ایستگاه ۶ — فشارسنج (بارومتر) و فشار مطلق" icon="🌡️" unit="Pa ، mmHg"
      concept="لوله‌ای پر از جیوه را وارونه در ظرفی از جیوه قرار داده‌ایم. فشار جو روی سطح ظرف، ستونی از جیوه را در لوله نگه می‌دارد؛ ارتفاع این ستون معیار فشار جو است."
      formula={<>P_atm = ρgh</>} formulaSub={<>P_abs = P_atm + P_gauge ؛ 760 mmHg ≈ 101325 Pa</>}
      values={[
        { label: "P_atm", value: fmtPa(st.Patm), color: "text-sky-300", flash: active.includes("Patm") },
        { label: "ρ", value: st.rho, unit: "kg/m³", color: "text-pink-300", flash: active.includes("rho") },
        { label: "g", value: st.g, unit: "m/s²", color: "text-violet-300", flash: active.includes("g") },
        { label: "ارتفاع ستون h", value: st.rho > 5000 ? fmt(hmm, 0) : fmt(h, 3), unit: st.rho > 5000 ? "mm" : "m", color: "text-pink-300" },
        { label: "معادل", value: `${fmt(st.Patm / 133.322, 0)} mmHg = ${fmt(st.Patm / 101325, 3)} atm`, color: "text-slate-200" },
      ]}
      result={<>فشار جو <b className="num">{fmtPa(st.Patm)}</b> ستونی از {liq.name} به ارتفاع <b className="num">{st.rho > 5000 ? `${fmt(hmm, 0)} mm` : `${fmt(h, 2)} m`}</b> را نگه می‌دارد. {cmp && <>فشارسنج پیمانه‌ای <b className="num">{fmtPa(st.Pg)}</b> نشان می‌دهد ولی فشار واقعی (مطلق) <b className="num">{fmtPa(st.Patm + st.Pg)}</b> است.</>}</>}
      definition={{ parts: [{ t: "فشار مطلق", k: "abs" }, { t: " فشار واقعی نسبت به خلأ است؛ فشارسنج جیوه‌ای آن را با " }, { t: "ارتفاع ستون", k: "Patm" }, { t: "، " }, { t: "چگالی", k: "rho" }, { t: " و " }, { t: "g", k: "g" }, { t: " می‌سنجد. " }, { t: "فشار پیمانه‌ای", k: "gauge" }, { t: " اختلاف فشار با جو است." }], active: cmp ? [...active, "abs", "gauge"] : active, note }}
      scene={scene} controls={controls} chart={chart}
      levels={{
        observe: `با تغییر فشار جو به ${fmtPa(st.Patm)}، ستون ${liq.name} تا ${st.rho > 5000 ? fmt(hmm, 0) + " میلی‌متر" : fmt(h, 2) + " متر"} ${active.includes("Patm") && dir.Patm === "down" ? "پایین آمد" : "رسید"}.`,
        concept: "بالای ستون خلأ است و فشاری وارد نمی‌کند. در سطح مایع ظرف، فشار جو با فشار ناشی از وزن ستون مایع در تعادل است. هرچه هوا سنگین‌تر فشار دهد، ستون بلندتری را بالا نگه می‌دارد.",
        math: <div className="ltr num">P_atm = ρgh ⇒ h = P_atm/(ρg) = {fmt(st.Patm)}/({fmt(st.rho)}×{fmt(st.g)}) = {fmt(h, 3)} m<br />{cmp && <>P_abs = P_atm + P_gauge = {fmtPa(st.Patm + st.Pg)}</>}</div>,
      }}
      quiz={quiz}
      onQuizRun={(i) => { if (i === 1) setSt((o) => ({ ...o, liquid: "water", rho: 1000 })); }}
      onReset={() => { setSt(init); setCollected([]); setCmp(false); }}
    />
  );
}
