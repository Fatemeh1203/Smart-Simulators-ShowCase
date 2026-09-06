import { useEffect, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Pill, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { PredictQuestion } from "../components/Predict";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { ELECTRON_CHARGE, ELECTRON_MASS, PROTON_MASS, fmt } from "../data/constants";

const PRESETS = [
  { name: "الکترون", q: -ELECTRON_CHARGE, m: ELECTRON_MASS },
  { name: "پروتون", q: ELECTRON_CHARGE, m: PROTON_MASS },
  { name: "یون سفارشی (+2e، سنگین)", q: 2 * ELECTRON_CHARGE, m: 20 * PROTON_MASS },
];

export default function MagneticForceLab() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [B, setB] = useState(0.5);
  const [v, setV] = useState(2); // x 1e6 m/s
  const [theta, setTheta] = useState(90); // degrees between v and B
  const [running, setRunning] = useState(true);
  const [phase, setPhase] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeB, setProbeB] = useState(0.5);
  const rafRef = useRef<number | undefined>(undefined);

  const preset = PRESETS[presetIdx];
  const vSI = v * 1e6;
  const thetaRad = (theta * Math.PI) / 180;
  const vPerp = vSI * Math.sin(thetaRad);
  const vPar = vSI * Math.cos(thetaRad);
  const absQ = Math.abs(preset.q);
  const r = vPerp > 0 ? (preset.m * vPerp) / (absQ * B) : 0;
  const omega = (absQ * B) / preset.m;
  const T = vPerp > 0 ? (2 * Math.PI) / omega : Infinity;
  const Fmax = absQ * vSI * B;
  const pitch = vPar * T;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    function tick(t: number) {
      const dt = (t - last) / 1000;
      last = t;
      setPhase((p) => p + dt * 2.2 * (preset.q < 0 ? -1 : 1));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [running, preset.q]);

  // نمایش مفهومی (نه لزوماً به مقیاس واقعی): دامنهٔ عمودی ثابت متناسب با sin(theta)، پیشروی افقی متناسب با cos(theta)
  const ampPx = 90 * Math.sin(thetaRad);
  const driftPerTurnPx = 140 * Math.cos(thetaRad);
  const W = 640;
  const H = 300;
  const cx0 = 90;
  const cy = 150;
  const pathPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 300; i++) {
    const ph = phase - 3 + (i / 300) * 6;
    const x = cx0 + (ph / (2 * Math.PI)) * driftPerTurnPx;
    const y = cy + ampPx * Math.sin(ph);
    if (x >= 0 && x <= W) pathPts.push({ x, y });
  }
  const curX = cx0;
  const curY = cy + ampPx * Math.sin(phase);
  const tangentDx = 1;
  const tangentDy = ampPx * Math.cos(phase) * (2 * Math.PI) / (driftPerTurnPx || 1e-6);
  const tLen = Math.hypot(tangentDx, tangentDy) || 1;

  return (
    <LabLayout
      title="🌀 نیروی مغناطیسی و حرکت ذرهٔ باردار"
      levelTag="سطح ۵ — Magnetic Force → Particle Motion"
      subtitle="زاویهٔ بین سرعت و میدان مغناطیسی را تغییر بده و ببین چرا ذره گاهی مستقیم، گاهی دایره‌ای و گاهی مارپیچی حرکت می‌کند."
      simulation={
        <div className="space-y-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-950">
            <text x={W / 2} y={20} textAnchor="middle" fontSize={10} fill="#64748b">
              نمای مفهومی (نه به مقیاس واقعی) — محور افقی = جهت B، محور عمودی = صفحهٔ عمود بر B
            </text>
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1={i * 48} y1={30} x2={i * 48} y2={H - 20} stroke="#1e293b" strokeWidth={1} />
            ))}
            <line x1={0} y1={cy} x2={W} y2={cy} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
            {Array.from({ length: 10 }).map((_, i) => (
              <text key={i} x={30 + i * 65} y={cy - 100} fontSize={12} fill="#facc15" textAnchor="middle">→</text>
            ))}
            <text x={30} y={cy - 115} fontSize={10} fill="#facc15">جهت میدان B</text>
            <polyline points={pathPts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#38bdf8" strokeWidth={2} opacity={0.85} />
            <circle cx={curX} cy={curY} r={7} fill={preset.q < 0 ? "#3b82f6" : "#f43f5e"} stroke="#fff" strokeWidth={1.5} />
            <text x={curX} y={curY - 14} fontSize={10} fill="#e2e8f0" textAnchor="middle" fontWeight={700}>
              {preset.q < 0 ? "−" : "+"}
            </text>
            <line x1={curX} y1={curY} x2={curX + (tangentDx / tLen) * 30} y2={curY + (tangentDy / tLen) * 30} stroke="#22d3ee" strokeWidth={2} markerEnd="url(#mf-arrow)" />
            <defs>
              <marker id="mf-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
              </marker>
            </defs>
          </svg>
          <div className="flex justify-center gap-2">
            <Button variant={running ? "danger" : "primary"} onClick={() => setRunning((r2) => !r2)}>
              {running ? "⏸ توقف" : "▶ ادامهٔ حرکت"}
            </Button>
            <Button variant="ghost" onClick={() => setPhase(0)}>بازنشانی</Button>
          </div>
        </div>
      }
      parameters={
        <>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <Button key={p.name} active={presetIdx === i} onClick={() => setPresetIdx(i)}>{p.name}</Button>
            ))}
          </div>
          <Slider label="میدان مغناطیسی B" value={B} min={0.05} max={2} step={0.05} unit="T" onChange={setB} color="sky" />
          <Slider label="سرعت ذره v" value={v} min={0.2} max={5} step={0.1} unit="×10⁶ m/s" onChange={setV} color="rose" />
          <Slider label="زاویهٔ بین v و B (θ)" value={theta} min={0} max={180} step={5} unit="°" onChange={setTheta} color="amber" />
        </>
      }
      measurements={
        <>
          <Stat label="شعاع حرکت دایره‌ای r" value={fmt(r * 1e3, 3)} unit="mm" color="cyan" />
          <Stat label="نیروی حداکثر مغناطیسی F=qvB" value={fmt(Fmax * 1e15, 3)} unit="fN" color="emerald" />
          <Stat label="تناوب چرخش T" value={isFinite(T) ? fmt(T * 1e9, 3) : "∞"} unit="ns" color="sky" />
          <Stat label="گام حرکت مارپیچی (pitch)" value={fmt(pitch * 1e3, 3)} unit="mm" color="amber" />
          <Pill color={theta === 0 || theta === 180 ? "amber" : theta === 90 ? "emerald" : "sky"}>
            {theta === 0 || theta === 180 ? "v موازی B ⇒ نیرو صفر، حرکت مستقیم" : theta === 90 ? "v عمود بر B ⇒ حرکت دایره‌ای خالص" : "حرکت مارپیچی (ترکیب دایره + مستقیم)"}
          </Pill>
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>F = q·v×B  (اندازه: F=qvB·sinθ)</EquationBox>
          <EquationBox>r = m·v⊥ / (|q|·B)</EquationBox>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: B, y: r * 1e3 }]}
          curve={Array.from({ length: 25 }, (_, i) => {
            const Bv = 0.05 + (i / 24) * 2;
            return { x: Bv, y: ((preset.m * vPerp) / (absQ * Bv)) * 1e3 };
          })}
          xLabel="میدان B (T)"
          yLabel="شعاع r (mm)"
        />
      }
      extra={
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PredictQuestion
              question="اگر میدان B را دو برابر کنیم (v ثابت و عمود بر B)، شعاع مسیر دایره‌ای چه تغییری می‌کند؟"
              options={["دو برابر می‌شود", "نصف می‌شود", "ثابت می‌ماند", "چهار برابر می‌شود"]}
              correctIndex={1}
              explanation="چون r=mv/(qB) با ۱/B رابطه دارد، دوبرابر شدن B شعاع را نصف می‌کند."
            />
            <PredictQuestion
              question="اگر θ (زاویهٔ بین v و B) صفر باشد، نیروی مغناطیسی چقدر است؟"
              options={["حداکثر مقدار", "صفر", "نصف حداکثر", "به B بستگی ندارد ولی صفر نیست"]}
              correctIndex={1}
              explanation="F=qvBsinθ، وقتی θ=0 باشد sinθ=0 است، پس نیرو صفر می‌شود و ذره در خط مستقیم موازی با B حرکت می‌کند."
            />
          </div>
          <DiscoveryPanel
            title="کشف رابطهٔ r و B"
            question="با ثابت نگه‌داشتن v و θ=90°، مقدار B فرضی را تغییر بده و ثبت کن."
            xLabel="B (T)"
            yLabel="r (mm)"
            trials={trials}
            onRecord={() => setTrials((t) => [...t, { x: probeB, y: ((preset.m * vSI) / (absQ * probeB)) * 1e3, label: `B=${probeB}T` }])}
            onClear={() => setTrials([])}
            formula="r ∝ 1/B  ⇒  r = mv/(|q|B)"
            hint="اگر B را دو برابر کنی، r باید دقیقاً نصف شود."
          >
            <Slider label="میدان فرضی B" value={probeB} min={0.05} max={2} step={0.05} unit="T" onChange={setProbeB} color="violet" />
          </DiscoveryPanel>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>نیروی مغناطیسی همیشه عمود بر سرعت ذره است، پس هرگز روی ذره «کار» انجام نمی‌دهد و فقط جهت حرکت را تغییر می‌دهد نه سرعتش را.</li>
          <li>وقتی v⊥B باشد، این نیروی عمودی ثابت باعث حرکت دایره‌ای می‌شود (شبیه نیروی گرانش برای مدار دایره‌ای).</li>
          <li>وقتی v موازی B باشد، حاصل‌ضرب برداری صفر است و نیرویی وجود ندارد — ذره مستقیم حرکت می‌کند.</li>
          <li>در حالت کلی، سرعت به دو مؤلفهٔ موازی و عمود بر B تجزیه می‌شود: مؤلفهٔ عمود دایره می‌سازد و مؤلفهٔ موازی باعث پیشروی می‌شود؛ ترکیب این دو مسیر مارپیچی (Helix) ایجاد می‌کند.</li>
        </ul>
      }
      misconceptions={[
        "میدان مغناطیسی ساکن، روی بار ساکن هیچ نیرویی وارد نمی‌کند؛ نیروی مغناطیسی فقط به بار در حال حرکت وارد می‌شود.",
        "نیروی مغناطیسی هرگز اندازهٔ سرعت را تغییر نمی‌دهد (کار انجام نمی‌دهد)؛ فقط جهت آن را تغییر می‌دهد.",
        "مسیر دایره‌ای فقط زمانی رخ می‌دهد که سرعت کاملاً عمود بر میدان باشد؛ در غیر این صورت مسیر مارپیچی یا مستقیم است.",
        "بزرگ‌تر بودن جرم ذره، شعاع حرکت را بزرگ‌تر می‌کند نه کوچک‌تر — چون ذرهٔ سنگین‌تر اینرسی بیشتری دارد و سخت‌تر منحرف می‌شود.",
      ]}
    />
  );
}
