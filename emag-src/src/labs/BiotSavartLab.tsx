import { useMemo, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Slider, Stat, Pill } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { MU0, fmt } from "../data/constants";

type Shape = "straight" | "loop" | "coil" | "solenoid";

// میدان محوری یک حلقهٔ دایره‌ای در فاصلهٔ z از مرکز آن (فرمول دقیق - قابل استخراج از انتگرال بیو-ساوار)
function loopAxialB(I: number, R: number, z: number) {
  return (MU0 * I * R * R) / (2 * Math.pow(R * R + z * z, 1.5));
}

export default function BiotSavartLab() {
  const [shape, setShape] = useState<Shape>("solenoid");
  const [current, setCurrent] = useState(3);
  const [radius, setRadius] = useState(0.04);
  const [turns, setTurns] = useState(300);
  const [length, setLength] = useState(0.2);
  const [probeR, setProbeR] = useState(0.08);
  const [probeZ, setProbeZ] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeI, setProbeI] = useState(3);

  const n = turns / length; // turns per meter

  // شبیه‌سازی عددی: جمع میدان تمام حلقه‌های سیم‌پیچ در نقطهٔ پروب (برهم‌نهی بیو-ساوار)
  const numericSolenoidB = useMemo(() => {
    if (shape !== "solenoid") return 0;
    const nTurnsSample = Math.min(turns, 200); // برای کارایی، حداکثر ۲۰۰ حلقه نمونه‌برداری می‌شود
    const step = length / nTurnsSample;
    let sum = 0;
    for (let i = 0; i < nTurnsSample; i++) {
      const zTurn = -length / 2 + step * (i + 0.5);
      sum += loopAxialB(current, radius, probeZ - zTurn);
    }
    // مقیاس برای جبران نمونه‌برداری کمتر از تعداد واقعی دور
    return sum * (turns / nTurnsSample);
  }, [shape, turns, length, current, radius, probeZ]);

  const idealSolenoidB = MU0 * n * current;

  const straightB = (MU0 * current) / (2 * Math.PI * probeR);
  const loopB = loopAxialB(current, radius, probeZ);
  const coilB = turns * loopAxialB(current, radius, probeZ);

  const mainB = shape === "straight" ? straightB : shape === "loop" ? loopB : shape === "coil" ? coilB : numericSolenoidB;

  const profileData = useMemo(() => {
    if (shape !== "solenoid") return [];
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const z = -length * 0.9 + (i / 24) * length * 1.8;
      const nTurnsSample = Math.min(turns, 120);
      const step = length / nTurnsSample;
      let sum = 0;
      for (let k = 0; k < nTurnsSample; k++) {
        const zTurn = -length / 2 + step * (k + 0.5);
        sum += loopAxialB(current, radius, z - zTurn);
      }
      sum *= turns / nTurnsSample;
      pts.push({ x: z, y: sum * 1e3 });
    }
    return pts;
  }, [shape, length, turns, current, radius]);

  const errorPct = idealSolenoidB > 0 ? (Math.abs(numericSolenoidB - idealSolenoidB) / idealSolenoidB) * 100 : 0;

  return (
    <LabLayout
      title="🌀 قانون بیو-ساوار و آمپر"
      levelTag="سطح ۴ — Current → Magnetic Field"
      subtitle="با تغییر شکل سیم (مستقیم، حلقه، چند حلقه، سولنوئید)، میدان مغناطیسی حاصل از برهم‌نهی جریان‌های عنصری را بررسی کن."
      headerExtra={
        <div className="flex flex-wrap gap-2">
          <Button active={shape === "straight"} onClick={() => setShape("straight")}>سیم مستقیم</Button>
          <Button active={shape === "loop"} onClick={() => setShape("loop")}>یک حلقه</Button>
          <Button active={shape === "coil"} onClick={() => setShape("coil")}>چند حلقه</Button>
          <Button active={shape === "solenoid"} onClick={() => setShape("solenoid")}>سولنوئید</Button>
        </div>
      }
      simulation={
        <svg viewBox="0 0 640 320" className="w-full rounded-xl bg-slate-950">
          {shape === "straight" && (
            <>
              <circle cx={320} cy={160} r={10} fill="#1e293b" stroke="#facc15" strokeWidth={2} />
              <text x={320} y={165} textAnchor="middle" fontSize={13} fill="#facc15">⊙</text>
              {[40, 80, 120].map((r) => <circle key={r} cx={320} cy={160} r={r} fill="none" stroke="#475569" strokeDasharray="4 4" />)}
              <circle cx={320 + probeR * 800} cy={160} r={5} fill="#38bdf8" />
              <text x={320 + probeR * 800} y={145} fontSize={9} fill="#38bdf8" textAnchor="middle">پروب</text>
            </>
          )}
          {(shape === "loop" || shape === "coil") && (
            <>
              <ellipse cx={320} cy={160} rx={radius * 900} ry={radius * 350} fill="none" stroke="#f59e0b" strokeWidth={shape === "coil" ? 5 : 2.5} />
              <line x1={320} y1={30} x2={320} y2={290} stroke="#475569" strokeDasharray="4 4" />
              <circle cx={320} cy={160 - probeZ * 800} r={5} fill="#38bdf8" />
              <text x={340} y={160 - probeZ * 800} fontSize={9} fill="#38bdf8">پروب (z)</text>
              {shape === "coil" && <text x={320} y={160 + radius * 350 + 24} textAnchor="middle" fontSize={10} fill="#94a3b8">{turns} دور هم‌مرکز</text>}
            </>
          )}
          {shape === "solenoid" && (
            <>
              {Array.from({ length: 26 }).map((_, i) => {
                const x = 140 + (i / 25) * 360;
                return <line key={i} x1={x} y1={160 - radius * 500} x2={x} y2={160 + radius * 500} stroke="#f59e0b" strokeWidth={2} />;
              })}
              <line x1={130} y1={160} x2={510} y2={160} stroke="#475569" strokeDasharray="4 4" />
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1={160 + i * 60} y1={160 - radius * 500 - 14} x2={160 + i * 60} y2={160 + radius * 500 + 14} stroke="#38bdf8" strokeWidth={1.4} opacity={0.6} markerEnd="url(#bs-arrow)" />
              ))}
              <defs>
                <marker id="bs-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
                </marker>
              </defs>
              <circle cx={320 + (probeZ / length) * 360} cy={160} r={5} fill="#22d3ee" />
              <text x={320 + (probeZ / length) * 360} y={140} fontSize={9} fill="#22d3ee" textAnchor="middle">پروب</text>
              <text x={320} y={295} textAnchor="middle" fontSize={10} fill="#94a3b8">n = N/L = {fmt(n, 3)} دور بر متر</text>
            </>
          )}
        </svg>
      }
      parameters={
        <>
          <Slider label="جریان I" value={current} min={0.2} max={10} step={0.2} unit="A" onChange={setCurrent} color="rose" />
          {shape !== "straight" && <Slider label="شعاع حلقه/سولنوئید R" value={radius} min={0.01} max={0.15} step={0.005} unit="m" onChange={setRadius} color="sky" />}
          {(shape === "coil" || shape === "solenoid") && (
            <Slider label="تعداد دورها N" value={turns} min={5} max={800} step={5} onChange={setTurns} color="amber" />
          )}
          {shape === "solenoid" && <Slider label="طول سولنوئید L" value={length} min={0.05} max={0.6} step={0.01} unit="m" onChange={setLength} color="emerald" />}
          {shape === "straight" && <Slider label="فاصلهٔ پروب از سیم r" value={probeR} min={0.02} max={0.15} step={0.005} unit="m" onChange={setProbeR} color="cyan" />}
          {(shape === "loop" || shape === "coil") && <Slider label="موقعیت پروب روی محور z" value={probeZ} min={-0.15} max={0.15} step={0.005} unit="m" onChange={setProbeZ} color="cyan" />}
          {shape === "solenoid" && <Slider label="موقعیت پروب روی محور (نسبت به مرکز)" value={probeZ} min={-length / 2} max={length / 2} step={0.002} unit="m" onChange={setProbeZ} color="cyan" />}
        </>
      }
      measurements={
        <>
          <Stat label="میدان محاسبه‌شده (شبیه‌سازی/دقیق) B" value={fmt(mainB * 1e3, 3)} unit="mT" color="sky" />
          {shape === "solenoid" && (
            <>
              <Stat label="تقریب سولنوئید ایده‌آل B=μ₀nI" value={fmt(idealSolenoidB * 1e3, 3)} unit="mT" color="amber" />
              <Pill color={errorPct < 5 ? "emerald" : "rose"}>
                اختلاف تقریب با شبیه‌سازی: {fmt(errorPct, 2)}٪ {errorPct < 5 ? "(تقریب خوب - نزدیک مرکز)" : "(تقریب ضعیف - نزدیک انتها)"}
              </Pill>
            </>
          )}
        </>
      }
      equation={
        <div className="space-y-2">
          {shape === "straight" && <EquationBox>B = μ₀I / (2πr)</EquationBox>}
          {shape === "loop" && <EquationBox>B(z) = μ₀IR² / (2(R²+z²)^(3/2))</EquationBox>}
          {shape === "coil" && <EquationBox>B(z) = N·μ₀IR² / (2(R²+z²)^(3/2))</EquationBox>}
          {shape === "solenoid" && <EquationBox>B ≈ μ₀·n·I  (n = N/L)</EquationBox>}
          {shape === "solenoid" && (
            <p className="text-center text-xs text-slate-400">
              این تقریب فقط برای سولنوئید «بلند» (L ≫ R) و در نقاطی نزدیک مرکز معتبر است؛ نزدیک دو سرِ سولنوئید مقدار واقعی میدان تقریباً نصف مقدار مرکز است.
            </p>
          )}
        </div>
      }
      graph={
        shape === "solenoid" ? (
          <LineGraph
            points={profileData}
            curve={[{ x: -length, y: idealSolenoidB * 1e3 }, { x: length, y: idealSolenoidB * 1e3 }]}
            xLabel="موقعیت روی محور z (m)"
            yLabel="B (mT)"
          />
        ) : (
          <LineGraph
            points={[{ x: current, y: mainB * 1e3 }]}
            curve={Array.from({ length: 20 }, (_, i) => {
              const Iv = 0.2 + (i / 19) * 10;
              const b = shape === "straight" ? (MU0 * Iv) / (2 * Math.PI * probeR) : shape === "loop" ? loopAxialB(Iv, radius, probeZ) : turns * loopAxialB(Iv, radius, probeZ);
              return { x: Iv, y: b * 1e3 };
            })}
            xLabel="جریان I (A)"
            yLabel="B (mT)"
          />
        )
      }
      extra={
        <DiscoveryPanel
          title="کشف رابطهٔ خطی B و I"
          question="برای شکل انتخابی، جریان فرضی را تغییر بده و ثبت کن تا رابطهٔ B و I را کشف کنی."
          xLabel="I (A)"
          yLabel="B (mT)"
          trials={trials}
          onRecord={() => {
            const b = shape === "straight" ? (MU0 * probeI) / (2 * Math.PI * probeR) : shape === "loop" ? loopAxialB(probeI, radius, probeZ) : shape === "coil" ? turns * loopAxialB(probeI, radius, probeZ) : MU0 * n * probeI;
            setTrials((t) => [...t, { x: probeI, y: b * 1e3, label: `I=${probeI}A` }]);
          }}
          onClear={() => setTrials([])}
          formula="B ∝ I  (در تمام آرایش‌ها)"
          hint="در هر چهار پیکربندی، دوبرابر کردن جریان دقیقاً میدان را دوبرابر می‌کند — این خطی بودن نتیجهٔ مستقیم قانون بیو-ساوار است."
        >
          <Slider label="جریان فرضی برای ثبت" value={probeI} min={0.2} max={10} step={0.2} unit="A" onChange={setProbeI} color="violet" />
        </DiscoveryPanel>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>میدان مغناطیسی هر پیکربندی جریان، برهم‌نهی (مجموع برداری) میدان تمام عناصر جریان است — این ماهیت قانون بیو-ساوار است.</li>
          <li>افزودن حلقه‌های بیشتر (هم‌مرکز) میدان مرکز را به‌همان نسبت افزایش می‌دهد: B ∝ N.</li>
          <li>فرمول ساده B=μ₀nI برای سولنوئید فقط یک «تقریب» برای سولنوئید بلند و نزدیک مرکز آن است، نه یک قانون دقیق برای همه‌جا.</li>
          <li>نزدیک انتهای سولنوئید، میدان واقعی (به‌دست‌آمده از برهم‌نهی عددی حلقه‌ها) تقریباً نصف مقدار مرکز است.</li>
        </ul>
      }
      misconceptions={[
        "فرمول B=μ₀nI فقط برای سولنوئید ایده‌آلِ بلند معتبر است؛ در انتهای یک سولنوئید واقعی این تقریب دقیق نیست.",
        "افزایش تعداد دورها بدون تغییر طول، هم N و هم n را افزایش می‌دهد و میدان بیشتر می‌شود، اما افزایش طول بدون افزایش دور، n و در نتیجه میدان را کاهش می‌دهد.",
        "میدان بیرون یک سولنوئید ایده‌آل تقریباً صفر است، در حالی‌که میدان داخل آن تقریباً یکنواخت است — این دو را نباید یکسان فرض کرد.",
        "قانون آمپر و بیو-ساوار دو بیان متفاوت اما هم‌ارز از رابطهٔ جریان و میدان مغناطیسی‌اند؛ آمپر برای هندسه‌های متقارن محاسبه را ساده‌تر می‌کند.",
      ]}
    />
  );
}
