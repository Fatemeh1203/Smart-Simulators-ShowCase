import { useMemo, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { EquationBox, Pill, Slider, Stat } from "../components/ui";
import { PolarGraph, LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { PredictQuestion } from "../components/Predict";
import { C_LIGHT, fmt } from "../data/constants";

function dipolePatternRaw(thetaRad: number, k: number, L: number) {
  const s = Math.sin(thetaRad);
  if (Math.abs(s) < 1e-4) return 0;
  const val = (Math.cos((k * L * Math.cos(thetaRad)) / 2) - Math.cos((k * L) / 2)) / s;
  return val;
}

export default function AntennaLab() {
  const [logF, setLogF] = useState(8.3); // Hz, ~ 200 MHz default
  const [length, setLength] = useState(0.75); // m
  const [power, setPower] = useState(10); // W
  const [distance, setDistance] = useState(50); // m
  const [angle, setAngle] = useState(90); // deg from antenna axis
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeLen, setProbeLen] = useState(0.75);

  const f = Math.pow(10, logF);
  const lambda = C_LIGHT / f;
  const k = (2 * Math.PI) / lambda;
  const idealHalfWave = lambda / 2;

  const patternData = useMemo(() => {
    const raw: { angle: number; r: number }[] = [];
    let max = 1e-9;
    for (let i = 0; i <= 72; i++) {
      const th = (i / 72) * Math.PI;
      const v = Math.abs(dipolePatternRaw(th, k, length));
      max = Math.max(max, v);
      raw.push({ angle: th, r: v });
    }
    const norm = raw.map((p) => ({ angle: p.angle, r: p.r / max }));
    // mirror to full circle (dipole pattern symmetric about axis, revolve around azimuth handled conceptually)
    const full = [...norm, ...norm.slice(1, -1).map((p) => ({ angle: 2 * Math.PI - p.angle, r: p.r }))];
    return { full, max };
  }, [k, length]);

  const angleRad = (angle * Math.PI) / 180;
  const gainAtAngle = Math.abs(dipolePatternRaw(angleRad, k, length)) / patternData.max;
  const receivedIntensity = (power * gainAtAngle * gainAtAngle) / (4 * Math.PI * distance * distance); // W/m^2 (simplified)

  const nearFieldBoundary = Math.max(lambda, (2 * length * length) / lambda);
  const inFarField = distance > nearFieldBoundary;
  const resonanceRatio = length / idealHalfWave;

  return (
    <LabLayout
      title="📶 آزمایشگاه آنتن و انتشار موج"
      levelTag="سطح ۸ — Waves → Antennas → Radiation"
      subtitle="فرکانس، طول آنتن، توان و فاصلهٔ گیرنده را تغییر بده و ببین چگونه جریان متناوب در آنتن، موج الکترومغناطیسی تولید و منتشر می‌کند."
      simulation={
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-center text-[11px] text-slate-500">الگوی تشعشع (Radiation Pattern) — نمای مفهومی از قدرت نسبی در هر جهت</p>
            <PolarGraph data={patternData.full} pointerAngle={angleRad} />
          </div>
          <svg viewBox="0 0 300 300" className="w-full rounded-xl bg-slate-950">
            <line x1={150} y1={40} x2={150} y2={260} stroke="#f59e0b" strokeWidth={5} />
            <text x={150} y={30} textAnchor="middle" fontSize={10} fill="#f59e0b">آنتن دوقطبی (L={fmt(length, 3)}m)</text>
            {[1, 2, 3].map((n) => (
              <circle key={n} cx={150} cy={150} r={n * 35} fill="none" stroke="#38bdf8" strokeWidth={1} opacity={0.25 + n * 0.05} strokeDasharray="3 3" />
            ))}
            <g transform={`rotate(${angle - 90} 150 150)`}>
              <circle cx={150 + 120} cy={150} r={7} fill="#22d3ee" />
            </g>
            <text x={150} y={280} textAnchor="middle" fontSize={9} fill="#94a3b8">
              گیرنده در زاویهٔ {angle}° نسبت به محور آنتن — فاصلهٔ واقعی: {fmt(distance, 3)}m
            </text>
          </svg>
        </div>
      }
      parameters={
        <>
          <Slider label="فرکانس فرستنده f (لگاریتمی)" value={logF} min={6} max={10} step={0.02} onChange={setLogF} format={(v) => Math.pow(10, v).toExponential(2)} unit="Hz" color="sky" />
          <Slider label="طول آنتن L" value={length} min={0.05} max={3} step={0.01} unit="m" onChange={setLength} color="amber" />
          <Slider label="توان ورودی P" value={power} min={0.5} max={100} step={0.5} unit="W" onChange={setPower} color="rose" />
          <Slider label="فاصلهٔ گیرنده تا آنتن r" value={distance} min={1} max={1000} step={1} unit="m" onChange={setDistance} color="cyan" />
          <Slider label="زاویهٔ گیرنده نسبت به محور آنتن θ (چرخش آنتن)" value={angle} min={1} max={179} step={1} unit="°" onChange={setAngle} color="violet" />
        </>
      }
      measurements={
        <>
          <Stat label="طول موج λ=c/f" value={fmt(lambda, 3)} unit="m" color="rose" />
          <Stat label="طول ایدئال نیم‌موج λ/2" value={fmt(idealHalfWave, 3)} unit="m" color="amber" />
          <Stat label="نسبت L به طول تشدید (L/(λ/2))" value={fmt(resonanceRatio, 3)} color="sky" />
          <Stat label="بهرهٔ نسبی در این جهت" value={fmt(gainAtAngle, 3)} color="emerald" />
          <Stat label="شدت سیگنال دریافتی (مدل ساده)" value={fmt(receivedIntensity * 1e6, 3)} unit="µW/m²" color="cyan" />
          <Pill color={inFarField ? "emerald" : "amber"}>
            {inFarField ? "گیرنده در میدان دور (Far-field) — فرمول‌های تابشی معتبرند" : "گیرنده در میدان نزدیک (Near-field) — تابش هنوز شکل نگرفته، فرمول‌های بالا تقریبی نیستند"}
          </Pill>
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>λ = c / f</EquationBox>
          <EquationBox>L ≈ λ/2  (آنتن دوقطبی نیم‌موج تشدیدی)</EquationBox>
          <p className="text-center text-xs text-slate-400">
            وقتی طول آنتن با نصف طول موج هم‌خوان باشد (L≈λ/2)، آنتن در تشدید کار می‌کند و بیشترین بازده تشعشع/دریافت را دارد.
          </p>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: distance, y: receivedIntensity * 1e6 }]}
          curve={Array.from({ length: 25 }, (_, i) => {
            const r = 2 + (i / 24) * 998;
            return { x: r, y: ((power * gainAtAngle * gainAtAngle) / (4 * Math.PI * r * r)) * 1e6 };
          })}
          xLabel="فاصله r (m)"
          yLabel="شدت سیگنال (µW/m²)"
        />
      }
      extra={
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PredictQuestion
              question="اگر آنتن را طوری بچرخانیم که گیرنده دقیقاً روی امتداد محور آنتن (θ=0) بیفتد، سیگنال دریافتی چه می‌شود؟"
              options={["حداکثر می‌شود", "تقریباً صفر می‌شود", "بدون تغییر می‌ماند", "دو برابر می‌شود"]}
              correctIndex={1}
              explanation="آنتن دوقطبی در امتداد محور خودش عملاً تشعشعی ندارد (الگوی تشعشع در θ=0 و θ=180 به صفر می‌رسد)؛ بیشترین تشعشع در θ=90° (عمود بر آنتن) است."
            />
            <PredictQuestion
              question="اگر طول آنتن دقیقاً نصف طول موج فرستنده نباشد (مثلاً خیلی کوتاه‌تر)، بازده تشعشع چه می‌شود؟"
              options={["بهتر می‌شود", "کاهش می‌یابد و آنتن ناکارآمد می‌شود", "بدون تغییر", "همیشه صفر می‌شود"]}
              correctIndex={1}
              explanation="آنتن‌ها در طول‌های نزدیک به مضرب نیم‌طول‌موج به تشدید می‌رسند و بهترین تطبیق امپدانس و بیشترین بازده تشعشع را دارند؛ دور شدن از این طول باعث افت بازده می‌شود."
            />
          </div>
          <DiscoveryPanel
            title="کشف رابطهٔ طول تشدید آنتن با طول موج"
            question="طول آنتن فرضی را تغییر بده و ثبت کن؛ سعی کن بفهمی چه طولی باعث بیشینه‌شدن دامنهٔ الگوی تشعشع (تشدید) می‌شود."
            xLabel="طول آنتن L (m)"
            yLabel="نسبت L به λ/2"
            trials={trials}
            onRecord={() => setTrials((t) => [...t, { x: probeLen, y: probeLen / idealHalfWave, label: `L=${probeLen.toFixed(2)}m` }])}
            onClear={() => setTrials([])}
            formula="بهترین تشدید وقتی رخ می‌دهد که L ≈ λ/2  (یعنی نسبت L/(λ/2) ≈ 1)"
            hint="دنبال طولی بگرد که این نسبت را نزدیک به عدد ۱ می‌کند."
          >
            <Slider label="طول آنتن فرضی" value={probeLen} min={0.05} max={3} step={0.01} unit="m" onChange={setProbeLen} color="violet" />
          </DiscoveryPanel>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>جریان متناوب در آنتن باعث ایجاد بارها و میدان‌های متغیر زمانی می‌شود که به‌صورت موج الکترومغناطیسی از آنتن منتشر می‌شوند.</li>
          <li>آنتن در همهٔ جهت‌ها به یک اندازه تشعشع نمی‌کند؛ الگوی تشعشع دوقطبی نیم‌موج شبیه یک «دونات» است با حداکثر عمود بر آنتن و حداقل (صفر) در امتداد آن.</li>
          <li>طول آنتن باید متناسب با طول موج سیگنال باشد (تقریباً نصف طول موج) تا آنتن در تشدید کار کند و بیشترین بازدهی را داشته باشد.</li>
          <li>در فاصلهٔ نزدیک به آنتن (میدان نزدیک)، رفتار میدان پیچیده و «واکنشی» است؛ فقط در میدان دور موج به شکل تابشی معمول با افت ۱/r² در شدت درمی‌آید.</li>
        </ul>
      }
      misconceptions={[
        "آنتن یک فرستندهٔ همه‌جهته با شدت یکسان نیست؛ شکل و جهت‌گیری آنتن الگوی تشعشع را به‌شدت تغییر می‌دهد.",
        "طول آنتن یک انتخاب دلخواه نیست: آنتنی با طول نامتناسب با طول موج بازده بسیار پایینی خواهد داشت.",
        "میدان نزدیک آنتن (Near-field) با میدان دور (Far-field) رفتار یکسانی ندارد؛ فرمول‌های سادهٔ تابشی فقط در میدان دور معتبرند.",
        "افزایش توان فرستنده، الگوی تشعشع (شکل جهت‌گیری) را تغییر نمی‌دهد؛ فقط شدت کلی سیگنال را در همهٔ جهات به یک نسبت افزایش می‌دهد.",
      ]}
    />
  );
}
