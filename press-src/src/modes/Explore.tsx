import { useEffect, useMemo, useRef, useState } from "react";
import { Btn, LiveChart, Section, fmt, fmtPa, useClock, Arrow } from "../components/ui";
import { useSettings } from "../components/StationLayout";

type Scenario = {
  id: string; title: string; icon: string; question: string; options: string[]; correct: string;
  xName: string; xSym: string; xUnit: string; x0: number; yName: string; ySym: string; yFmt: (y: number) => string;
  params: { name: string; sym: string; value: number; unit: string }[];
  f: (x: number) => number; law: string; lawExplain: string; formula: string; formulaSteps: string[];
  inverse?: boolean;
};

const SCEN: Scenario[] = [
  {
    id: "depth", title: "عمق و فشار مایع", icon: "🌊", question: "اگر عمق حسگر را دو برابر کنیم، فشار (پیمانه‌ای) چه تغییری می‌کند؟",
    options: ["نصف می‌شود", "تغییر نمی‌کند", "دو برابر می‌شود", "چهار برابر می‌شود"], correct: "دو برابر می‌شود",
    xName: "عمق", xSym: "h", xUnit: "m", x0: 0.5, yName: "فشار", ySym: "P", yFmt: fmtPa,
    params: [{ name: "چگالی آب", sym: "ρ", value: 1000, unit: "kg/m³" }, { name: "گرانش", sym: "g", value: 9.8, unit: "m/s²" }],
    f: (h) => 1000 * 9.8 * h, law: "P ∝ h", lawExplain: "نسبت P/h در همه‌ی آزمایش‌ها ثابت ماند (≈ 9800 Pa/m). این عدد ثابت همان ρ×g است.",
    formula: "P = ρgh", formulaSteps: ["P/h = ثابت = 9800 Pa/m", "9800 = 1000 × 9.8 = ρ × g", "پس P = (ρg) × h = ρgh"],
  },
  {
    id: "area", title: "سطح تماس و فشار جامد", icon: "🧱", question: "اگر سطح تماس جسم را نصف کنیم (با همان وزن)، فشار چه تغییری می‌کند؟",
    options: ["نصف می‌شود", "تغییر نمی‌کند", "دو برابر می‌شود", "چهار برابر می‌شود"], correct: "دو برابر می‌شود",
    xName: "سطح تماس", xSym: "A", xUnit: "m²", x0: 0.04, yName: "فشار", ySym: "P", yFmt: fmtPa, inverse: true,
    params: [{ name: "نیروی وزن", sym: "F", value: 98, unit: "N" }],
    f: (A) => 98 / A, law: "P ∝ 1/A", lawExplain: "حاصل‌ضرب P×A در همه‌ی آزمایش‌ها ثابت ماند (= 98 N). این عدد همان نیروی وارد بر سطح است.",
    formula: "P = F/A", formulaSteps: ["P × A = ثابت = 98 N", "98 N = F (نیروی وزن)", "پس P = F / A"],
  },
  {
    id: "cont", title: "سطح مقطع و سرعت سیال", icon: "💨", question: "اگر سطح مقطع لوله نصف شود، سرعت سیال چه تغییری می‌کند؟",
    options: ["نصف می‌شود", "تغییر نمی‌کند", "دو برابر می‌شود", "چهار برابر می‌شود"], correct: "دو برابر می‌شود",
    xName: "سطح مقطع", xSym: "A", xUnit: "cm²", x0: 20, yName: "سرعت", ySym: "v", yFmt: (v) => `${fmt(v, 2)} m/s`, inverse: true,
    params: [{ name: "دبی جریان", sym: "Q", value: 4, unit: "L/s" }],
    f: (A) => 0.004 / (A / 1e4), law: "v ∝ 1/A", lawExplain: "حاصل‌ضرب A×v در همه‌ی آزمایش‌ها ثابت ماند (= 0.004 m³/s). این همان حجم عبوری در ثانیه (دبی) است.",
    formula: "A₁v₁ = A₂v₂", formulaSteps: ["A × v = ثابت = Q", "حجم عبوری در ثانیه در طول لوله تغییر نمی‌کند", "پس A₁v₁ = A₂v₂"],
  },
  {
    id: "buoy", title: "حجم جابه‌جاشده و نیروی شناوری", icon: "🚢", question: "اگر حجم فرورفته‌ی جسم در آب دو برابر شود، نیروی شناوری چه می‌شود؟",
    options: ["نصف می‌شود", "تغییر نمی‌کند", "دو برابر می‌شود", "چهار برابر می‌شود"], correct: "دو برابر می‌شود",
    xName: "حجم جابه‌جاشده", xSym: "V", xUnit: "L", x0: 1, yName: "نیروی شناوری", ySym: "Fb", yFmt: (v) => `${fmt(v, 2)} N`,
    params: [{ name: "چگالی آب", sym: "ρ", value: 1000, unit: "kg/m³" }, { name: "گرانش", sym: "g", value: 9.8, unit: "m/s²" }],
    f: (V) => 1000 * 9.8 * (V / 1000), law: "Fb ∝ V", lawExplain: "نسبت Fb/V ثابت ماند (= 9.8 N/L = 9800 N/m³) که همان ρ×g آب است؛ یعنی Fb برابر وزن آب جابه‌جاشده است.",
    formula: "Fb = ρ g V", formulaSteps: ["Fb / V = ثابت = 9800 N/m³", "9800 = 1000 × 9.8 = ρ_water × g", "پس Fb = ρ g V_displaced (وزن مایع جابه‌جاشده)"],
  },
];

function MiniScene({ sc, x, t }: { sc: Scenario; x: number; t: number }) {
  const y = sc.f(x);
  if (sc.id === "depth") {
    const h = x; const sy = 30 + (h / 2) * 200;
    return (
      <svg viewBox="0 0 300 260" className="w-full h-auto">
        <rect x={40} y={30} width={160} height={200} fill="rgba(56,189,248,.45)" stroke="#5b6fa3" strokeWidth={3} />
        <rect x={100} y={30} width={40} height={sy - 30} fill="#fff" opacity={0.15} />
        <rect x={100} y={sy - 10} width={40} height={20} rx={5} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
        <Arrow x1={60} y1={sy} x2={96} y2={sy} color="#fbbf24" width={2 + h * 2} /><Arrow x1={180} y1={sy} x2={144} y2={sy} color="#fbbf24" width={2 + h * 2} />
        <text x={120} y={sy + 40} fontSize={11} fill="#fff" textAnchor="middle" className="num">h = {fmt(h, 2)} m</text>
        <text x={250} y={sy + 4} fontSize={12} fill="#fbbf24" textAnchor="middle" className="num">{fmtPa(y)}</text>
      </svg>
    );
  }
  if (sc.id === "area") {
    const w = Math.sqrt(x) * 400; const glow = Math.min(1, 98 / x / 10000);
    return (
      <svg viewBox="0 0 300 260" className="w-full h-auto">
        <rect x={0} y={180} width={300} height={80} fill="#1b2540" />
        <ellipse cx={150} cy={182} rx={w / 2 + 30 * glow + 4} ry={12 + 8 * glow} fill={`rgb(${Math.round(40 + 215 * glow)},${Math.round(200 - 170 * glow)},${Math.round(255 - 235 * glow)})`} opacity={0.5} />
        <rect x={150 - w / 2} y={180 - (98 * 4) / w} width={w} height={(98 * 4) / w} fill="#6579a8" stroke="#2b365a" />
        <Arrow x1={150} y1={40} x2={150} y2={180 - (98 * 4) / w - 4} color="#f87171" label="F = 98 N" labelPos="start" />
        <text x={150} y={215} fontSize={11} fill="#cbd5e1" textAnchor="middle" className="num">A = {fmt(x, 3)} m²</text>
        <text x={150} y={240} fontSize={12} fill="#fbbf24" textAnchor="middle" className="num">P = {fmtPa(y)}</text>
      </svg>
    );
  }
  if (sc.id === "cont") {
    const r1 = 40, r2 = 8 + Math.sqrt(x) * 7;
    return (
      <svg viewBox="0 0 300 260" className="w-full h-auto">
        <path d={`M0,${130 - r1} H100 C140,${130 - r1} 140,${130 - r2} 180,${130 - r2} H300 V${130 + r2} H180 C140,${130 + r2} 140,${130 + r1} 100,${130 + r1} H0 Z`} fill="rgba(56,189,248,.35)" stroke="#7c8fc4" strokeWidth={3} />
        {Array.from({ length: 24 }).map((_, i) => { const f = ((i / 24 + t * 0.12) % 1); const px = f * 300; const rr = px < 100 ? r1 : px > 180 ? r2 : r1 + (r2 - r1) * ((px - 100) / 80); return <circle key={i} cx={px} cy={130 + Math.sin(i * 7) * (rr - 4)} r={2.5} fill="#fff" opacity={0.8} />; })}
        <Arrow x1={30} y1={130} x2={30 + 2 * 12} y2={130} color="#fde047" width={3} label="v₁ = 2 m/s" />
        <Arrow x1={220} y1={130} x2={220 + Math.min(70, y * 12)} y2={130} color="#fde047" width={3} />
        <text x={240} y={200} fontSize={11} fill="#cbd5e1" textAnchor="middle" className="num">A = {fmt(x, 1)} cm²</text>
        <text x={240} y={225} fontSize={12} fill="#fbbf24" textAnchor="middle" className="num">v = {fmt(y, 2)} m/s</text>
      </svg>
    );
  }
  // buoy
  const side = 30 + Math.cbrt(x) * 25; const sub = Math.min(1, x / 4);
  return (
    <svg viewBox="0 0 300 260" className="w-full h-auto">
      <rect x={40} y={40} width={220} height={200} fill="#0d1428" stroke="#5b6fa3" strokeWidth={3} />
      <rect x={40} y={80} width={220} height={160} fill="rgba(56,189,248,.45)" />
      <rect x={150 - side / 2} y={80 - side * (1 - sub)} width={side} height={side} rx={4} fill="#b45309" stroke="#0b1224" strokeWidth={2} />
      <Arrow x1={200} y1={80 + side / 2} x2={200} y2={80 + side / 2 - Math.min(90, y * 3)} color="#34d399" width={3} label={`Fb`} />
      <text x={150} y={225} fontSize={11} fill="#cbd5e1" textAnchor="middle" className="num">V_d = {fmt(x, 2)} L</text>
      <text x={150} y={252} fontSize={12} fill="#34d399" textAnchor="middle" className="num">Fb = {fmt(y, 2)} N</text>
    </svg>
  );
}

export default function Explore() {
  const s = useSettings();
  const t = useClock(s.paused, s.slow);
  const [scId, setScId] = useState("depth");
  const sc = SCEN.find((x) => x.id === scId)!;
  const [step, setStep] = useState(0);
  const [pred, setPred] = useState<string | null>(null);
  const [mult, setMult] = useState(1);
  const [collected, setCollected] = useState<{ k: number; x: number; y: number }[]>([]);
  const targetMult = useRef(1);
  const lastT = useRef(t);

  const reset = () => { setStep(0); setPred(null); setMult(1); setCollected([]); targetMult.current = 1; };
  useEffect(() => { reset(); }, [scId]);

  useEffect(() => {
    const dt = t - lastT.current; lastT.current = t;
    setMult((m) => Math.abs(m - targetMult.current) < 0.005 ? targetMult.current : m + (targetMult.current - m) * Math.min(1, dt * 2));
  }, [t]);

  const xOf = (k: number) => (sc.inverse ? sc.x0 / k : sc.x0 * k);
  const x = xOf(mult), y = sc.f(x);
  const y0 = sc.f(sc.x0);
  const ratio = y / y0;
  const running = Math.abs(mult - targetMult.current) > 0.005;
  const observed = ratio > 1.9 && ratio < 2.1 ? "دو برابر می‌شود" : ratio > 3.9 ? "چهار برابر می‌شود" : ratio < 0.6 ? "نصف می‌شود" : "تغییر نمی‌کند";
  const table = useMemo(() => [1, 2, 3].map((k) => ({ k, x: xOf(k), y: sc.f(xOf(k)) })), [sc]);

  const run = (k: number) => { targetMult.current = k; setCollected((c) => (c.some((p) => p.k === k) ? c : [...c, { k, x: xOf(k), y: sc.f(xOf(k)) }])); };

  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl">🔍</span>
          <h2 className="text-lg md:text-xl font-bold">حالت «کشف کن» — فرمول مخفی است؛ خودت آن را از داده‌ها بیرون بکش</h2>
        </div>
        <p className="text-sm text-slate-300 mt-1 leading-6">۱) پیش‌بینی کن ۲) آزمایش را اجرا کن ۳) نتیجه را با پیش‌بینی مقایسه کن ۴) داده جمع کن ۵) الگو را کشف کن ۶) رابطه را استخراج کن.</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {SCEN.map((x) => <Btn key={x.id} small tone="violet" active={scId === x.id} onClick={() => setScId(x.id)}>{x.icon} {x.title}</Btn>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 panel p-3 grid-bg">
          <MiniScene sc={sc} x={x} t={t} />
          <div className="flex justify-between text-xs mt-1 px-2">
            <span className="num">{sc.xSym} = {fmt(x, 3)} {sc.xUnit} (×{fmt(sc.inverse ? 1 / mult : mult, 2)})</span>
            <span className="num text-amber-300">{sc.ySym} = {sc.yFmt(y)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 px-2">ثابت‌ها: {sc.params.map((p) => `${p.name} ${p.sym} = ${p.value} ${p.unit}`).join(" ، ")}</div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {/* Stepper */}
          <div className="flex gap-1 text-[11px]">
            {["پیش‌بینی", "اجرا", "مقایسه", "داده", "الگو", "فرمول"].map((l, i) => <div key={i} className={`flex-1 text-center py-1 rounded ${step === i ? "bg-violet-500/30 text-violet-100" : step > i ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-800 text-slate-500"}`}>{i + 1}. {l}</div>)}
          </div>

          {step === 0 && (
            <Section title="سؤال" icon="❓">
              <p className="text-base leading-8">{sc.question}</p>
              <div className="flex flex-wrap gap-2 mt-2">{sc.options.map((o) => <Btn key={o} tone="violet" active={pred === o} onClick={() => setPred(o)}>{o}</Btn>)}</div>
              <div className="mt-3"><Btn tone="emerald" onClick={() => { if (pred) { setStep(1); run(1); } }} className={!pred ? "opacity-40" : ""}>ثبت پیش‌بینی و رفتن به آزمایش ▶</Btn></div>
            </Section>
          )}

          {step === 1 && (
            <Section title="اجرای آزمایش" icon="🧪">
              <p className="text-sm leading-7">پیش‌بینی تو: <b className="text-violet-200">{pred}</b>. حالا {sc.xName} را {sc.inverse ? "نصف" : "دو برابر"} کن و ببین {sc.yName} چه می‌شود.</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Btn tone="cyan" active={targetMult.current === 1} onClick={() => run(1)}>{sc.xSym} × 1</Btn>
                <Btn tone="amber" active={targetMult.current === 2} onClick={() => run(2)}>{sc.xSym} {sc.inverse ? "÷" : "×"} 2</Btn>
              </div>
              <div className="mt-3 glass p-2 text-sm num">قبل: {sc.ySym} = {sc.yFmt(y0)} &nbsp; → &nbsp; اکنون: {sc.ySym} = {sc.yFmt(y)} &nbsp; ( نسبت = {fmt(ratio, 2)} )</div>
              {targetMult.current === 2 && !running && <div className="mt-3"><Btn tone="emerald" onClick={() => setStep(2)}>مقایسه با پیش‌بینی ▶</Btn></div>}
            </Section>
          )}

          {step === 2 && (
            <Section title="مقایسه‌ی نتیجه با پیش‌بینی" icon="⚖️">
              <div className={`p-3 rounded-lg border ${pred === observed ? "border-emerald-400/50 bg-emerald-500/10" : "border-rose-400/50 bg-rose-500/10"}`}>
                <p className="text-sm leading-7">پیش‌بینی تو: <b>{pred}</b> — نتیجه‌ی آزمایش: <b>{observed}</b> (نسبت {fmt(ratio, 2)})</p>
                <p className="text-sm">{pred === observed ? "✅ آفرین! پیش‌بینی‌ات درست بود." : "❌ پیش‌بینی با مشاهده فرق داشت. اشکالی ندارد — همین تفاوت، شروع یادگیری است. حالا ببینیم چرا."}</p>
              </div>
              <div className="mt-3"><Btn tone="emerald" onClick={() => { setStep(3); run(3); }}>جمع‌آوری داده‌ی بیشتر ▶</Btn></div>
            </Section>
          )}

          {step >= 3 && (
            <Section title="جدول داده‌های آزمایش" icon="📋">
              <div className="flex gap-2 mb-2 flex-wrap">{[1, 2, 3].map((k) => <Btn key={k} small tone="amber" active={targetMult.current === k} onClick={() => run(k)}>{sc.xSym} {sc.inverse ? "÷" : "×"} {k}</Btn>)}</div>
              <table className="w-full text-sm text-center num">
                <thead><tr className="text-slate-400 text-xs"><th>آزمایش</th><th>{sc.xSym} ({sc.xUnit})</th><th>{sc.ySym}</th><th>{sc.ySym}/{sc.ySym}₀</th><th>{sc.inverse ? `${sc.ySym}×${sc.xSym}` : `${sc.ySym}/${sc.xSym}`}</th></tr></thead>
                <tbody>{table.map((r) => { const seen = collected.some((c) => c.k === r.k); return (
                  <tr key={r.k} className={`border-t border-slate-700/60 ${seen ? "" : "opacity-30"}`}><td>{sc.xSym} {sc.inverse ? "÷" : "×"} {r.k}</td><td>{fmt(r.x, 3)}</td><td>{seen ? sc.yFmt(r.y) : "؟"}</td><td>{seen ? `× ${fmt(r.y / y0, 2)}` : "؟"}</td><td className="text-amber-300">{seen ? fmt(sc.inverse ? r.y * r.x : r.y / r.x, 1) : "؟"}</td></tr>); })}</tbody>
              </table>
              {step === 3 && collected.length >= 3 && <div className="mt-3"><Btn tone="emerald" onClick={() => setStep(4)}>الگو را کشف کن ▶</Btn></div>}
            </Section>
          )}

          {step >= 4 && (
            <Section title="الگو" icon="🧩">
              <div className="text-sm leading-8 num">
                {table.map((r) => <div key={r.k}>{sc.xSym} {sc.inverse ? "÷" : "×"} {r.k} &nbsp;→&nbsp; {sc.ySym} × {fmt(r.y / y0, 1)}</div>)}
              </div>
              <div className="mt-2 text-xl font-bold text-violet-200 ltr text-center">{sc.law}</div>
              <p className="text-sm text-slate-300 leading-7 mt-1">{sc.lawExplain}</p>
              {step === 4 && <div className="mt-3"><Btn tone="emerald" onClick={() => setStep(5)}>استخراج رابطه‌ی ریاضی ▶</Btn></div>}
            </Section>
          )}

          {step === 5 && (
            <Section title="استخراج فرمول از داده‌ها" icon="🎯">
              <ol className="text-sm leading-8 list-decimal pr-5">{sc.formulaSteps.map((x, i) => <li key={i} className="num">{x}</li>)}</ol>
              <div className="mt-2 text-2xl font-bold text-center ltr bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-xl py-3 border border-violet-400/40">{sc.formula}</div>
              <p className="text-xs text-slate-300 mt-2 leading-6">این فرمول را حفظ نکردی؛ آن را از آزمایش خودت به‌دست آوردی. حالا می‌توانی توضیح دهی «چرا» {sc.yName} تغییر می‌کند.</p>
              <div className="mt-3 flex gap-2"><Btn tone="slate" onClick={reset}>↺ از نو</Btn></div>
            </Section>
          )}
        </div>
      </div>

      {step >= 3 && (
        <Section title="نمودار داده‌های جمع‌آوری‌شده" icon="📈">
          <LiveChart fn={step >= 4 ? sc.f : undefined} xMin={0} xMax={sc.inverse ? sc.x0 * 1.1 : sc.x0 * 3.3} xLabel={`${sc.xSym} (${sc.xUnit})`} yLabel={sc.ySym} current={{ x, y }} collected={collected.map((c) => ({ x: c.x, y: c.y }))} yFmt={(v) => sc.yFmt(v)} title={step >= 4 ? "نقاط داده روی منحنی قانون کشف‌شده قرار می‌گیرند" : "نقاط ثبت‌شده — آیا الگویی می‌بینی؟"} />
        </Section>
      )}
    </div>
  );
}
