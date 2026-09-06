import { useEffect, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { EquationBox, Pill, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { PredictQuestion } from "../components/Predict";
import { C_LIGHT, fmt } from "../data/constants";

function bandName(lambda: number) {
  if (lambda > 1) return "امواج رادیویی";
  if (lambda > 1e-3) return "مایکروویو";
  if (lambda > 7e-7) return "فروسرخ (Infrared)";
  if (lambda > 4e-7) return "نور مرئی";
  if (lambda > 1e-8) return "فرابنفش (UV)";
  if (lambda > 1e-11) return "پرتو X";
  return "پرتو گاما";
}

export default function WaveLab() {
  const [logF, setLogF] = useState(14.3); // log10(f)
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(true);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeLogF, setProbeLogF] = useState(14);
  const rafRef = useRef<number | undefined>(undefined);

  const f = Math.pow(10, logF);
  const lambda = C_LIGHT / f;
  const T = 1 / f;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    function tick(t: number) {
      const dt = (t - last) / 1000;
      last = t;
      setPhase((p) => p + dt * 2.4);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [running]);

  const W = 640;
  const H = 300;
  const cx = 40;
  const cyMid = 150;
  const nWaves = 3;

  const ePts: string[] = [];
  const bPts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = cx + (i / 200) * (W - 80);
    const k = (2 * Math.PI * nWaves) / (W - 80);
    const val = Math.sin(k * (x - cx) - phase);
    const ey = cyMid - val * 60;
    ePts.push(`${x},${ey}`);
    // B field drawn with pseudo-3D isometric skew to represent perpendicular plane
    const bz = val * 60;
    const bx = x + bz * 0.35;
    const by = cyMid + bz * 0.5;
    bPts.push(`${bx},${by}`);
  }

  return (
    <LabLayout
      title="📡 آزمایشگاه امواج الکترومغناطیسی"
      levelTag="سطح ۷ — Maxwell → Electromagnetic Waves"
      subtitle="فرکانس را تغییر بده و ببین طول موج چطور تغییر می‌کند. میدان E (آبی) و میدان B (قرمز) همیشه بر هم و بر جهت انتشار موج عمودند."
      simulation={
        <div className="space-y-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-950">
            <text x={W / 2} y={18} textAnchor="middle" fontSize={9} fill="#64748b">
              نمایش مفهومی (سرعت نوسان نمایش‌داده‌شده به مقیاس واقعی نیست) — جهت انتشار: محور افقی
            </text>
            <line x1={cx} y1={cyMid} x2={W - 30} y2={cyMid} stroke="#334155" strokeWidth={1.5} markerEnd="url(#wave-arrow)" />
            <text x={W - 26} y={cyMid + 14} fontSize={10} fill="#94a3b8">انتشار</text>
            <defs>
              <marker id="wave-arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
              </marker>
            </defs>
            <polyline points={ePts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth={2.5} />
            <polyline points={bPts.join(" ")} fill="none" stroke="#f43f5e" strokeWidth={2.5} opacity={0.85} />
            <text x={cx} y={cyMid - 74} fontSize={11} fill="#38bdf8" fontWeight={700}>E (میدان الکتریکی)</text>
            <text x={cx} y={cyMid + 96} fontSize={11} fill="#f43f5e" fontWeight={700}>B (میدان مغناطیسی)</text>
          </svg>
          <div className="flex justify-center gap-2 text-xs">
            <button onClick={() => setRunning((r) => !r)} className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-slate-200">
              {running ? "⏸ توقف نوسان" : "▶ ادامه نوسان"}
            </button>
          </div>
        </div>
      }
      parameters={
        <>
          <Slider
            label="فرکانس f (لگاریتمی)"
            value={logF}
            min={5}
            max={20}
            step={0.05}
            onChange={setLogF}
            color="sky"
            format={(v) => (Math.pow(10, v)).toExponential(2)}
            unit="Hz"
          />
          <p className="text-[11px] text-slate-500">این اسلایدر کل طیف الکترومغناطیسی از امواج رادیویی تا پرتو گاما را پوشش می‌دهد.</p>
        </>
      }
      measurements={
        <>
          <Stat label="فرکانس f" value={fmt(f)} unit="Hz" color="sky" />
          <Stat label="طول موج λ = c/f" value={fmt(lambda)} unit="m" color="rose" />
          <Stat label="تناوب T = 1/f" value={fmt(T)} unit="s" color="amber" />
          <Pill color="emerald">باند طیفی: {bandName(lambda)}</Pill>
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>c = f·λ</EquationBox>
          <EquationBox>c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s</EquationBox>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: f, y: lambda }]}
          curve={Array.from({ length: 30 }, (_, i) => {
            const ff = f * (0.3 + (i / 29) * 3);
            return { x: ff, y: C_LIGHT / ff };
          })}
          xLabel="فرکانس f (Hz)"
          yLabel="طول موج λ (m)"
        />
      }
      extra={
        <>
          <PredictQuestion
            question="اگر فرکانس موج را ۱۰ برابر کنیم، طول موج آن چه تغییری می‌کند؟"
            options={["۱۰ برابر می‌شود", "به یک‌دهم کاهش می‌یابد", "ثابت می‌ماند", "به یک‌صدم کاهش می‌یابد"]}
            correctIndex={1}
            explanation="چون c=fλ ثابت است، افزایش f باعث کاهش متناسب λ می‌شود — دقیقاً به همان نسبت."
          />
          <DiscoveryPanel
            title="کشف رابطهٔ f و λ"
            question="فرکانس فرضی را تغییر بده و ثبت کن. آیا حاصل‌ضرب f×λ همیشه یک عدد ثابت است؟"
            xLabel="f (Hz)"
            yLabel="λ (m)"
            trials={trials}
            onRecord={() => setTrials((t) => [...t, { x: Math.pow(10, probeLogF), y: C_LIGHT / Math.pow(10, probeLogF), label: `f=${Math.pow(10, probeLogF).toExponential(1)}Hz` }])}
            onClear={() => setTrials([])}
            formula="f·λ = c  (ثابت) ⇒ λ ∝ 1/f"
            hint="مقدار f×λ را برای چند نقطهٔ ثبت‌شده حساب کن؛ باید همیشه تقریباً برابر با سرعت نور باشد."
          >
            <Slider label="فرکانس فرضی (لگاریتمی)" value={probeLogF} min={5} max={20} step={0.1} onChange={setProbeLogF} color="violet" format={(v) => Math.pow(10, v).toExponential(1)} unit="Hz" />
          </DiscoveryPanel>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>امواج الکترومغناطیسی از نوسان همزمان و به‌هم‌پیوستهٔ میدان الکتریکی و مغناطیسی به‌وجود می‌آیند (طبق معادلات ماکسول).</li>
          <li>E و B و جهت انتشار موج، سه‌به‌سه بر هم عمودند.</li>
          <li>در خلأ، همهٔ امواج الکترومغناطیسی (از رادیو تا گاما) با یک سرعت ثابت c منتشر می‌شوند؛ فقط f و λ متفاوت‌اند.</li>
          <li>نور مرئی فقط بخش بسیار کوچکی از طیف کامل الکترومغناطیسی است.</li>
        </ul>
      }
      misconceptions={[
        "سرعت انتشار موج الکترومغناطیسی در خلأ به فرکانس بستگی ندارد؛ همهٔ فرکانس‌ها با سرعت نور c منتشر می‌شوند.",
        "فرکانس بالا به‌معنی «موج قوی‌تر» نیست؛ فرکانس فقط رنگ/نوع تابش را تعیین می‌کند، شدت (دامنه) کمیت جداگانه‌ای است.",
        "میدان مغناطیسی موج، مستقل از میدان الکتریکی آن نیست؛ این دو در معادلات ماکسول به هم مرتبطند و هرگز جدا از هم وجود ندارند.",
        "امواج رادیویی و نور مرئی و پرتو ایکس ماهیت متفاوتی ندارند؛ همه از یک خانواده‌اند و فقط طول موج و فرکانس متفاوت دارند.",
      ]}
    />
  );
}
