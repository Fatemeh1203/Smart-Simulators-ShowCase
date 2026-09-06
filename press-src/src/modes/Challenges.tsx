import React, { useEffect, useMemo, useState } from "react";
import { Btn, Slider, fmt, fmtPa, Digital, Arrow } from "../components/ui";

const g = 9.8;
function useDone(onDone: (b: boolean) => void, ok: boolean) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onDone(ok); }, [ok]);
}

function Card({ n, title, done, children, hint }: { n: number; title: string; done: boolean; children: React.ReactNode; hint: string }) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`panel p-4 ${done ? "ring-1 ring-emerald-400/60" : ""}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${done ? "bg-emerald-500 text-black" : "bg-slate-700"}`}>{done ? "✓" : n}</span>
        <h3 className="font-bold text-base">{title}</h3>
        <Btn small tone="slate" onClick={() => setShowHint(!showHint)} className="mr-auto">💡 راهنمایی</Btn>
      </div>
      {showHint && <p className="text-xs text-amber-200 mt-2 leading-6 glass p-2">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

const Status = ({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) => (
  <div className={`mt-2 text-sm px-3 py-2 rounded-lg border leading-6 ${ok ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200" : "border-slate-600 bg-slate-800/40 text-slate-300"}`}>{ok ? "🏆 " + okText : badText}</div>
);

/* ---- C1 ---- */
function C1({ onDone }: { onDone: (b: boolean) => void }) {
  const m = 10, A0 = 0.04; const [A, setA] = useState(A0);
  const P0 = m * g / A0, P = m * g / A, r = P / P0; const ok = Math.abs(r - 4) < 0.06;
  useDone(onDone, ok);
  const w = Math.sqrt(A) * 300;
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <svg viewBox="0 0 300 160" className="w-full">
        <rect x={0} y={120} width={300} height={40} fill="#1b2540" />
        <ellipse cx={150} cy={122} rx={w / 2 + 20 * Math.min(1, r / 4)} ry={10} fill={`rgba(250,${Math.round(200 - 40 * r)},60,${0.3 + 0.15 * r})`} />
        <rect x={150 - w / 2} y={120 - 1600 / w} width={w} height={1600 / w} fill="#6579a8" stroke="#2b365a" />
        <Arrow x1={150} y1={10} x2={150} y2={120 - 1600 / w - 4} color="#f87171" label="mg = 98 N" labelPos="start" />
        <text x={150} y={145} fontSize={11} fill="#cbd5e1" textAnchor="middle" className="num">A = {fmt(A * 1e4, 0)} cm² → P = {fmtPa(P)}</text>
      </svg>
      <div>
        <p className="text-sm leading-6">جرم ثابت = 10 kg ، سطح اولیه = 400 cm² ، فشار اولیه = {fmtPa(P0)}. فقط با تغییر سطح تماس، فشار را دقیقاً ۴ برابر کن.</p>
        <Slider label="سطح تماس" symbol="A" value={A * 1e4} min={20} max={800} step={5} unit="cm²" onChange={(v) => setA(v / 1e4)} />
        <div className="num text-sm">P/P₀ = <b className={ok ? "text-emerald-300" : "text-amber-300"}>{fmt(r, 2)}</b></div>
        <Status ok={ok} okText={`درست! سطح را به یک‌چهارم (${fmt(A * 1e4, 0)} cm²) رساندی؛ چون P ∝ 1/A، فشار ۴ برابر شد.`} badText="سطح را طوری تنظیم کن که P/P₀ = 4 شود. (به رابطه‌ی وارون فکر کن)" />
      </div>
    </div>
  );
}

/* ---- C2 ---- */
function C2({ onDone }: { onDone: (b: boolean) => void }) {
  const [F1, setF1] = useState(200); const [A1, setA1] = useState(10); const [A2, setA2] = useState(200); const [M, setM] = useState(500);
  const F2 = F1 * A2 / A1, W = M * g, lifts = F2 >= W; const score = lifts ? W / F1 : 0;
  const ok = lifts && F1 <= 20 && M >= 2000;
  useDone(onDone, ok);
  return (
    <div>
      <p className="text-sm leading-6">هدف: باری با جرم دست‌کم <b>2000 kg</b> را با نیروی حداکثر <b>20 N</b> بلند کن. نسبت W/F₁ امتیاز توست.</p>
      <div className="grid md:grid-cols-2 gap-x-4">
        <Slider label="نیروی ورودی" symbol="F₁" value={F1} min={1} max={500} step={1} unit="N" onChange={setF1} color="#f87171" />
        <Slider label="جرم بار" symbol="M" value={M} min={100} max={5000} step={50} unit="kg" onChange={setM} color="#fbbf24" />
        <Slider label="سطح پیستون کوچک" symbol="A₁" value={A1} min={1} max={100} step={1} unit="cm²" onChange={setA1} />
        <Slider label="سطح پیستون بزرگ" symbol="A₂" value={A2} min={10} max={2000} step={10} unit="cm²" onChange={setA2} color="#34d399" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Digital label="F₂ خروجی" value={`${fmt(F2, 0)} N`} color={lifts ? "#86efac" : "#fca5a5"} />
        <Digital label="وزن بار" value={`${fmt(W, 0)} N`} color="#fde68a" />
        <Digital label="مزیت مکانیکی A₂/A₁" value={`${fmt(A2 / A1, 1)}×`} />
        <Digital label="امتیاز W/F₁" value={fmt(score, 0)} color="#c4b5fd" />
      </div>
      <Status ok={ok} okText={`عالی! با ${F1} N بار ${M} kg را بلند کردی. راز کار: نسبت سطح بزرگ A₂/A₁ = ${fmt(A2 / A1, 0)}. (البته پیستون بزرگ خیلی کم جابه‌جا می‌شود!)`} badText={!lifts ? "هنوز F₂ < W است. A₂ را زیاد یا A₁ را کم کن." : F1 > 20 ? "بار بلند شد، ولی نیرو بیش از 20 N است. نسبت سطح‌ها را بزرگ‌تر کن و نیرو را کم کن." : "نیرو خوب است؛ حالا جرم بار را به 2000 kg برسان."} />
    </div>
  );
}

/* ---- C3 ---- */
function C3({ onDone }: { onDone: (b: boolean) => void }) {
  const base = { h: 1, rho: 1000, g: 9.8 }; const [s, setS] = useState(base);
  const P0 = base.rho * base.g * base.h, P = s.rho * s.g * s.h, r = P / P0; const ok = Math.abs(r - 2) < 0.04;
  useDone(onDone, ok);
  const changed = (["h", "rho", "g"] as const).filter((k) => Math.abs(s[k] - base[k]) > 1e-9);
  return (
    <div>
      <p className="text-sm leading-6">فشار پیمانه‌ای در عمق 1 m آب برابر {fmtPa(P0)} است. آن را دقیقاً ۲ برابر کن. کدام پارامتر(ها) را تغییر می‌دهی؟ چند راه وجود دارد!</p>
      <div className="grid md:grid-cols-3 gap-x-4">
        <Slider label="عمق" symbol="h" value={s.h} min={0.1} max={4} step={0.05} unit="m" onChange={(v) => setS({ ...s, h: v })} />
        <Slider label="چگالی" symbol="ρ" value={s.rho} min={500} max={4000} step={50} unit="kg/m³" onChange={(v) => setS({ ...s, rho: v })} color="#fbbf24" />
        <Slider label="گرانش" symbol="g" value={s.g} min={2} max={25} step={0.1} unit="m/s²" onChange={(v) => setS({ ...s, g: v })} color="#a78bfa" />
      </div>
      <div className="num text-sm">P = {fmtPa(P)} ؛ P/P₀ = <b className={ok ? "text-emerald-300" : "text-amber-300"}>{fmt(r, 2)}</b> {changed.length > 0 && <span className="text-xs text-slate-400">— تغییر داده‌ای: {changed.map((k) => ({ h: "عمق", rho: "چگالی", g: "گرانش" })[k]).join("، ")}</span>}</div>
      <Status ok={ok} okText={`درست! با تغییر ${changed.map((k) => ({ h: "عمق", rho: "چگالی", g: "گرانش" })[k]).join(" و ")} فشار ۲ برابر شد. چون P = ρgh، هر یک از سه عامل (یا ترکیبی از آن‌ها) می‌تواند فشار را دو برابر کند.`} badText="هر سه پارامتر در ρgh ضرب می‌شوند؛ کافی است حاصل‌ضربشان ۲ برابر شود." />
    </div>
  );
}

/* ---- C4 ---- */
function C4({ onDone }: { onDone: (b: boolean) => void }) {
  const A = { name: "روغن (مخزن بسته)", rho: 800, P0: 105000, color: "rgba(251,191,36,.45)" }, B = { name: "آب (مخزن باز)", rho: 1000, P0: 101325, color: "rgba(56,189,248,.45)" };
  const [h, setH] = useState(0.5);
  const PA = A.P0 + A.rho * g * h, PB = B.P0 + B.rho * g * h; const hEq = (A.P0 - B.P0) / ((B.rho - A.rho) * g);
  const ok = Math.abs(PA - PB) / PA < 0.002; useDone(onDone, ok);
  const y = 20 + (h / 4) * 130;
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <svg viewBox="0 0 320 180" className="w-full">
        {[A, B].map((L, i) => <g key={i}>
          <rect x={20 + i * 160} y={20} width={120} height={130} fill={L.color} stroke="#5b6fa3" strokeWidth={2} />
          <rect x={70 + i * 160} y={y - 6} width={20} height={12} rx={3} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.5} />
          <text x={80 + i * 160} y={165} fontSize={9} fill="#cbd5e1" textAnchor="middle">{L.name} ρ={L.rho}</text>
          <text x={80 + i * 160} y={12} fontSize={8} fill="#94a3b8" textAnchor="middle" className="num">P₀ = {fmtPa(L.P0)}</text>
        </g>)}
        <line x1={20} x2={300} y1={y} y2={y} stroke="#fbbf24" strokeDasharray="3 3" />
      </svg>
      <div>
        <p className="text-sm leading-6">مخزن روغن در بسته دارد و فشار سطحش بیشتر است؛ مخزن آب باز است. در چه عمقی فشار مطلق در دو مایع برابر می‌شود؟</p>
        <Slider label="عمق حسگرها" symbol="h" value={h} min={0} max={4} step={0.005} unit="m" onChange={setH} />
        <div className="flex gap-2"><Digital label="P روغن" value={fmtPa(PA)} color="#fde68a" /><Digital label="P آب" value={fmtPa(PB)} color="#7dd3fc" /><Digital label="اختلاف" value={fmtPa(PA - PB)} color={ok ? "#86efac" : "#fca5a5"} /></div>
        <Status ok={ok} okText={`پیدا کردی! در h ≈ ${fmt(hEq, 3)} m فشارها برابرند. آب چگال‌تر است و با شیب تندتری (ρg بیشتر) فشارش زیاد می‌شود؛ پس عقب‌ماندگی اولیه‌اش را جبران می‌کند: P₀ₐ + ρₐgh = P₀ᵦ + ρᵦgh`} badText={PA > PB ? "فشار روغن هنوز بیشتر است؛ عمیق‌تر برو (آب سریع‌تر زیاد می‌شود)." : "از نقطه‌ی تعادل رد شدی؛ کمی بالاتر بیا."} />
      </div>
    </div>
  );
}

/* ---- C5 ---- */
function C5({ onDone }: { onDone: (b: boolean) => void }) {
  const [seed, setSeed] = useState(0);
  const dh = useMemo(() => Math.round((Math.random() * 60 - 30 + (seed % 2 ? 1 : -1) * 5) * 10) / 10, [seed]); // cm, ±
  const Patm = 101325, rho = 13600; const Pgas = Patm + rho * g * (dh / 100);
  const [ans, setAns] = useState(""); const [chk, setChk] = useState(false);
  const ok = chk && Math.abs(parseFloat(ans) - Pgas) < Pgas * 0.005; useDone(onDone, ok);
  const yL = 90 + dh * 1.2, yR = 90 - dh * 1.2;
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <svg viewBox="0 0 300 180" className="w-full">
        <rect x={10} y={30} width={60} height={50} rx={6} fill="rgba(148,163,184,.15)" stroke="#5b6fa3" strokeWidth={2} /><text x={40} y={60} fontSize={9} fill="#e2e8f0" textAnchor="middle">گاز</text>
        <path d={`M70,40 H100`} stroke="#5b6fa3" strokeWidth={6} />
        <path d="M100,40 V160 H200 V20" fill="none" stroke="#7c8fc4" strokeWidth={3} />
        <path d="M120,40 V140 H180 V20" fill="none" stroke="#7c8fc4" strokeWidth={3} />
        <rect x={101} y={yL} width={19} height={160 - yL} fill="rgba(226,232,240,.85)" /><rect x={181} y={yR} width={19} height={160 - yR} fill="rgba(226,232,240,.85)" /><rect x={101} y={140} width={98} height={20} fill="rgba(226,232,240,.85)" />
        <line x1={95} x2={240} y1={yL} y2={yL} stroke="#f472b6" strokeDasharray="3 3" /><line x1={95} x2={240} y1={yR} y2={yR} stroke="#f472b6" strokeDasharray="3 3" />
        <text x={245} y={(yL + yR) / 2 + 4} fontSize={11} fill="#f472b6" className="num">Δh = {fmt(Math.abs(dh), 1)} cm</text>
        <text x={190} y={12} fontSize={8} fill="#93c5fd" textAnchor="middle">باز به هوا</text>
        <text x={150} y={175} fontSize={9} fill="#cbd5e1" textAnchor="middle">مایع: جیوه ρ = 13600 kg/m³ ، P_atm = 101325 Pa</text>
      </svg>
      <div>
        <p className="text-sm leading-6">ستون سمت {dh > 0 ? "هوا" : "گاز"} بالاتر است. فشار مطلق گاز را حساب کن (g = 9.8).</p>
        <div className="flex items-center gap-2 mt-2"><input className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm ltr num w-36" placeholder="P_gas (Pa)" value={ans} onChange={(e) => { setAns(e.target.value); setChk(false); }} /><Btn small tone="cyan" onClick={() => setChk(true)}>بررسی</Btn><Btn small tone="slate" onClick={() => { setSeed(seed + 1); setAns(""); setChk(false); }}>🎲 مانومتر جدید</Btn></div>
        {chk && <Status ok={ok} okText={`درست! P_gas = P_atm ${dh >= 0 ? "+" : "−"} ρgΔh = ${fmt(Pgas, 0)} Pa`} badText={`هنوز نه. راهنما: ستون سمت ${dh > 0 ? "هوا بالاتر است → فشار گاز بیشتر از جو" : "گاز بالاتر است → فشار گاز کمتر از جو"} است؛ ρgΔh = ${fmt(rho * g * Math.abs(dh) / 100, 0)} Pa`} />}
      </div>
    </div>
  );
}

/* ---- C6 ---- */
function C6({ onDone }: { onDone: (b: boolean) => void }) {
  const liqs = [{ n: "روغن", rho: 800, c: "rgba(251,191,36,.45)" }, { n: "آب", rho: 1000, c: "rgba(56,189,248,.45)" }, { n: "جیوه", rho: 13600, c: "rgba(203,213,225,.75)" }];
  const [rhoObj, setRho] = useState(900);
  const [pred, setPred] = useState<Record<number, string>>({}); const [run, setRun] = useState(false);
  const truth = (rho: number) => (rhoObj > rho * 1.01 ? "غرق" : rhoObj < rho * 0.99 ? "شناور" : "معلق");
  const allOk = run && liqs.every((l, i) => pred[i] === truth(l.rho)); useDone(onDone, allOk);
  return (
    <div>
      <p className="text-sm leading-6">جسمی با چگالی زیر داریم. پیش‌بینی کن در هر مایع چه می‌شود، سپس آزمایش را اجرا کن.</p>
      <Slider label="چگالی جسم" symbol="ρ_obj" value={rhoObj} min={300} max={15000} step={50} unit="kg/m³" onChange={(v) => { setRho(v); setRun(false); }} color="#f472b6" />
      <div className="grid grid-cols-3 gap-2">
        {liqs.map((l, i) => { const tr = truth(l.rho); const sub = tr === "شناور" ? rhoObj / l.rho : 1; return (
          <div key={i} className="glass p-2 text-center">
            <svg viewBox="0 0 100 110" className="w-full">
              <rect x={10} y={10} width={80} height={90} fill="#0d1428" stroke="#5b6fa3" strokeWidth={2} /><rect x={10} y={30} width={80} height={70} fill={l.c} />
              <rect x={35} y={run ? (tr === "غرق" ? 68 : tr === "معلق" ? 45 : 30 - 30 * (1 - sub)) : 0} width={30} height={30} rx={3} fill="#f472b6" stroke="#0b1224" style={{ transition: "y 1.2s ease" }} />
            </svg>
            <div className="text-xs">{l.n} (ρ={l.rho})</div>
            <div className="flex gap-1 justify-center mt-1 flex-wrap">{["غرق", "معلق", "شناور"].map((o) => <Btn key={o} small tone={run ? (o === tr ? "emerald" : pred[i] === o ? "rose" : "slate") : "slate"} active={pred[i] === o} onClick={() => { setPred({ ...pred, [i]: o }); setRun(false); }}>{o}</Btn>)}</div>
            {run && <div className="text-[10px] mt-1 text-slate-300">{tr === "شناور" ? `${fmt(sub * 100, 0)}% زیر سطح` : tr}</div>}
          </div>); })}
      </div>
      <div className="mt-2"><Btn tone="emerald" onClick={() => setRun(true)} className={Object.keys(pred).length < 3 ? "opacity-40" : ""}>▶ اجرای آزمایش</Btn></div>
      {run && <Status ok={allOk} okText="هر سه پیش‌بینی درست بود! قاعده: اگر ρ_obj < ρ_fluid شناور، اگر برابر معلق و اگر بیشتر غرق می‌شود." badText="بعضی پیش‌بینی‌ها نادرست بود. چگالی جسم را با چگالی هر مایع مقایسه کن — نه با «سنگینی» جسم." />}
    </div>
  );
}

/* ---- C7 ---- */
function C7({ onDone }: { onDone: (b: boolean) => void }) {
  const A1 = 20, v1 = 3; const [A2, setA2] = useState(20); const [pred, setPred] = useState<string | null>(null);
  const v2 = A1 * v1 / A2; const ok = pred === "دو برابر می‌شود" && Math.abs(A2 - 10) < 0.3; useDone(onDone, ok);
  return (
    <div>
      <p className="text-sm leading-6">در لوله‌ای، A₁ = 20 cm² و v₁ = 3 m/s است. اگر سطح مقطع نصف شود، سرعت چه تغییری می‌کند؟ اول پیش‌بینی کن، بعد A₂ را نصف کن و ببین.</p>
      <div className="flex gap-2 flex-wrap mb-2">{["نصف می‌شود", "تغییر نمی‌کند", "دو برابر می‌شود", "چهار برابر می‌شود"].map((o) => <Btn key={o} small tone="violet" active={pred === o} onClick={() => setPred(o)}>{o}</Btn>)}</div>
      <Slider label="سطح مقطع دوم" symbol="A₂" value={A2} min={2} max={40} step={0.5} unit="cm²" onChange={setA2} color="#f472b6" />
      <svg viewBox="0 0 300 70" className="w-full">
        <path d={`M0,${35 - 25} H120 C150,${35 - 25} 150,${35 - Math.sqrt(A2) * 5.5} 180,${35 - Math.sqrt(A2) * 5.5} H300 V${35 + Math.sqrt(A2) * 5.5} H180 C150,${35 + Math.sqrt(A2) * 5.5} 150,${35 + 25} 120,${35 + 25} H0 Z`} fill="rgba(56,189,248,.35)" stroke="#7c8fc4" strokeWidth={2} />
        <Arrow x1={30} y1={35} x2={30 + v1 * 8} y2={35} color="#fde047" width={3} label={`${v1} m/s`} />
        <Arrow x1={210} y1={35} x2={210 + Math.min(80, v2 * 8)} y2={35} color="#fde047" width={3} label={`${fmt(v2, 2)} m/s`} />
      </svg>
      <div className="num text-sm">A₁v₁ = {A1 * v1} = A₂v₂ → v₂ = {fmt(v2, 2)} m/s ({fmt(v2 / v1, 2)} برابر)</div>
      <Status ok={ok} okText="درست! نصف شدن سطح مقطع، سرعت را دو برابر کرد: چون حجم عبوری در ثانیه (A·v) ثابت است." badText={!pred ? "اول پیش‌بینی‌ات را انتخاب کن." : Math.abs(A2 - 10) >= 0.3 ? "حالا A₂ را روی 10 cm² (نصف A₁) بگذار." : "نتیجه را ببین: v₂ = 6 m/s. پیش‌بینی‌ات را اصلاح کن."} />
    </div>
  );
}

export default function Challenges() {
  const [done, setDone] = useState<boolean[]>(Array(7).fill(false));
  const mark = (i: number) => (b: boolean) => setDone((d) => (d[i] === b ? d : d.map((x, j) => (j === i ? b : x))));
  const count = done.filter(Boolean).length;
  const items = [
    { t: "بدون تغییر جرم جسم، فشار را ۴ برابر کن", h: "P = F/A ؛ نیرو ثابت است. برای ۴ برابر شدن P، سطح باید یک‌چهارم شود.", C: C1 },
    { t: "با کمترین نیروی ممکن، بیشترین بار را با جک هیدرولیکی بلند کن", h: "F₂ = F₁ × (A₂/A₁). نسبت سطح‌ها را تا جای ممکن بزرگ کن: A₁ کوچک، A₂ بزرگ.", C: C2 },
    { t: "فشار یک نقطه در آب را دو برابر کن. کدام پارامتر را باید تغییر دهی؟", h: "P = ρgh ؛ دو برابر کردن هر یک از h ، ρ یا g کافی است. یا مثلاً h را ۴/۳ و ρ را ۱.۵ برابر کن!", C: C3 },
    { t: "دو مایع با چگالی متفاوت داریم. در چه عمقی فشار آن‌ها برابر می‌شود؟", h: "P₀ₐ + ρₐgh = P₀ᵦ + ρᵦgh را برای h حل کن. اگر فشار سطح‌ها برابر بود، فقط در h = 0 برابر می‌شدند.", C: C4 },
    { t: "فشار گاز مخزن را از روی مانومتر پیدا کن", h: "P_gas = P_atm ± ρgΔh ؛ اگر ستون سمت هوا بالاتر باشد علامت + است.", C: C5 },
    { t: "جسمی با چگالی مشخص را در سه مایع قرار بده و حالت شناوری‌اش را پیش‌بینی کن", h: "فقط چگالی جسم را با چگالی مایع مقایسه کن. کسر فرورفته‌ی جسم شناور = ρ_obj/ρ_fluid.", C: C6 },
    { t: "در یک لوله سطح مقطع نصف شده است. سرعت سیال چه تغییری می‌کند؟", h: "معادله‌ی پیوستگی: A₁v₁ = A₂v₂.", C: C7 },
  ];
  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl">🏁</span>
          <h2 className="text-lg md:text-xl font-bold">چالش آزمایشگاه</h2>
          <div className="mr-auto flex items-center gap-2 text-sm">
            <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all" style={{ width: `${(count / 7) * 100}%` }} /></div>
            <span className="num">{count}/7</span>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-1 leading-6">هر چالش یک مسئله‌ی واقعی است؛ راه‌حل را با دستکاری پارامترها پیدا کن، نه با حفظ فرمول. {count === 7 && "🎉 همه‌ی چالش‌ها را کامل کردی — تو حالا فشار را «می‌فهمی»!"}</p>
      </div>
      {items.map((it, i) => <Card key={i} n={i + 1} title={it.t} done={done[i]} hint={it.h}><it.C onDone={mark(i)} /></Card>)}
    </div>
  );
}
