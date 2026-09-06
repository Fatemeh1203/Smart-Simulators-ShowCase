import { useEffect, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Pill, Slider, Stat, Toggle } from "../components/ui";
import { PredictQuestion } from "../components/Predict";
import { K_COULOMB, fmt } from "../data/constants";

const W = 640;
const H = 380;
const PX_PER_M = 60;

interface Charge {
  id: number;
  x: number;
  y: number;
  q: number;
}

function getSvgPoint(svg: SVGSVGElement, evt: React.PointerEvent) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const loc = pt.matrixTransform(ctm.inverse());
  return { x: loc.x, y: loc.y };
}

function fieldAt(charges: Charge[], x: number, y: number) {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const rPx = Math.max(Math.hypot(dx, dy), 8);
    const r = rPx / PX_PER_M;
    const mag = (K_COULOMB * (c.q * 1e-9)) / (r * r);
    ex += mag * (dx / rPx);
    ey += mag * (dy / rPx);
  }
  return { ex, ey, mag: Math.hypot(ex, ey) };
}

export default function ForceLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [charges, setCharges] = useState<Charge[]>([{ id: 1, x: 320, y: 190, q: 6 }]);
  const [dragChargeId, setDragChargeId] = useState<number | null>(null);
  const [start, setStart] = useState({ x: 480, y: 120 });
  const [draggingStart, setDraggingStart] = useState(false);
  const [speed, setSpeed] = useState(120); // px/s
  const [angle, setAngle] = useState(160); // deg
  const [mass, setMass] = useState(4); // relative mass units
  const [qTest, setQTest] = useState(1); // nC
  const [running, setRunning] = useState(false);
  const [particle, setParticle] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [showFieldLine, setShowFieldLine] = useState(true);
  const rafRef = useRef<number | undefined>(undefined);

  const F = fieldAt(charges, start.x, start.y);
  const Fmag = F.mag * (qTest * 1e-9);

  function launch() {
    const a = (angle * Math.PI) / 180;
    setParticle({ x: start.x, y: start.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed });
    setTrail([{ x: start.x, y: start.y }]);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    function tick(t: number) {
      const dt = Math.min((t - last) / 1000, 0.03);
      last = t;
      setParticle((p) => {
        if (!p) return p;
        const f = fieldAt(charges, p.x, p.y);
        // مقیاس شتاب برای نمایش زیبا (نه لزوماً واحد SI دقیق، اما متناسب با F=qE/m)
        const accScale = (qTest * 1e-9 * 3e4) / mass;
        const ax = f.ex * accScale;
        const ay = f.ey * accScale;
        const nvx = p.vx + ax * dt;
        const nvy = p.vy + ay * dt;
        const nx = p.x + nvx * dt;
        const ny = p.y + nvy * dt;
        setTrail((tr) => [...tr, { x: nx, y: ny }].slice(-500));
        if (nx < 0 || nx > W || ny < 0 || ny > H || Math.hypot(nx - charges[0]?.x, ny - charges[0]?.y) < 12) {
          setRunning(false);
        }
        return { x: nx, y: ny, vx: nvx, vy: nvy };
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // خط میدان از نقطهٔ شروع (بدون سرعت اولیه) فقط برای مقایسه
  const fieldLinePts: { x: number; y: number }[] = [];
  {
    let x = start.x;
    let y = start.y;
    const sign = qTest > 0 ? 1 : -1;
    for (let i = 0; i < 200; i++) {
      const f = fieldAt(charges, x, y);
      if (f.mag < 1e-6) break;
      x += (f.ex / f.mag) * sign * 3;
      y += (f.ey / f.mag) * sign * 3;
      fieldLinePts.push({ x, y });
      if (x < 0 || x > W || y < 0 || y > H) break;
    }
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    if (dragChargeId !== null) setCharges((cs) => cs.map((c) => (c.id === dragChargeId ? { ...c, x: p.x, y: p.y } : c)));
    else if (draggingStart) setStart(p);
  }

  return (
    <LabLayout
      title="➡️ آزمایشگاه نیرو و حرکت بار"
      levelTag="سطح ۱ — Charge → Electric Field → Force"
      subtitle="یک ذرهٔ باردار را با سرعت اولیهٔ دلخواه در میدان رها کن و مسیر واقعی حرکتش را با «خط میدان» مقایسه کن — این دو یکی نیستند!"
      simulation={
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none rounded-xl bg-slate-950"
          onPointerMove={onMove}
          onPointerUp={() => { setDragChargeId(null); setDraggingStart(false); }}
          onPointerLeave={() => { setDragChargeId(null); setDraggingStart(false); }}
        >
          {showFieldLine && (
            <polyline points={fieldLinePts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="5 4" />
          )}
          {trail.length > 1 && <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#facc15" strokeWidth={2.5} />}
          {charges.map((c) => (
            <g key={c.id} onPointerDown={(e) => { e.stopPropagation(); setDragChargeId(c.id); }} className="cursor-grab">
              <circle cx={c.x} cy={c.y} r={13} fill={c.q > 0 ? "#f43f5e" : "#3b82f6"} stroke="#fff" strokeWidth={1.5} />
              <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">{c.q > 0 ? "+" : "−"}</text>
            </g>
          ))}
          <g onPointerDown={(e) => { e.stopPropagation(); setDraggingStart(true); }} className="cursor-grab">
            <circle cx={start.x} cy={start.y} r={7} fill="#22d3ee" stroke="#0f172a" strokeWidth={1.5} />
            <line x1={start.x} y1={start.y} x2={start.x + Math.cos((angle * Math.PI) / 180) * 34} y2={start.y + Math.sin((angle * Math.PI) / 180) * 34} stroke="#22d3ee" strokeWidth={2} markerEnd="url(#force-arrow)" />
          </g>
          {particle && <circle cx={particle.x} cy={particle.y} r={7} fill="#facc15" stroke="#0f172a" strokeWidth={1.5} />}
          <defs>
            <marker id="force-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
            </marker>
          </defs>
        </svg>
      }
      parameters={
        <>
          <Slider label="بار q۱ (چشمهٔ میدان)" value={charges[0].q} min={-10} max={10} step={0.5} unit="nC" onChange={(v) => setCharges((cs) => cs.map((c, i) => (i === 0 ? { ...c, q: v } : c)))} color="rose" />
          <Slider label="بار ذرهٔ آزمایشی q" value={qTest} min={-5} max={5} step={0.5} unit="nC" onChange={setQTest} color="cyan" />
          <Slider label="جرم نسبی ذره m" value={mass} min={1} max={20} step={1} onChange={setMass} color="amber" />
          <Slider label="سرعت اولیه" value={speed} min={0} max={300} step={10} unit="px/s" onChange={setSpeed} color="sky" />
          <Slider label="زاویهٔ سرعت اولیه" value={angle} min={0} max={360} step={5} unit="°" onChange={setAngle} color="violet" />
          <Toggle label="نمایش خط میدان از نقطهٔ رهاسازی (خط‌چین خاکستری)" checked={showFieldLine} onChange={setShowFieldLine} />
          <div className="flex gap-2">
            <Button variant="primary" onClick={launch}>🚀 رها کردن ذره</Button>
            <Button variant="ghost" onClick={() => { setRunning(false); setParticle(null); setTrail([]); }}>بازنشانی</Button>
          </div>
        </>
      }
      measurements={
        <>
          <Stat label="میدان در نقطهٔ رهاسازی |E|" value={fmt(F.mag, 3)} unit="N/C" color="sky" />
          <Stat label="نیروی اولیهٔ وارد بر ذره |F|" value={fmt(Math.abs(Fmag), 3)} unit="N" color="emerald" />
          <Pill color="amber">مسیر زرد رنگ = مسیر واقعی ذره (با اینرسی) — خط‌چین خاکستری = خط میدان (بدون اینرسی)</Pill>
        </>
      }
      equation={<EquationBox>F = q·E  ⟹  a = F/m</EquationBox>}
      graph={
        <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">
          در این آزمایشگاه به‌جای نمودار عددی، مقایسهٔ «مسیر واقعی» با «خط میدان» روی صفحهٔ شبیه‌سازی مهم‌ترین یافته است.
        </div>
      }
      extra={
        <PredictQuestion
          question="اگر ذره را با سرعت اولیهٔ غیرصفر و در زاویه‌ای غیر از جهت خط میدان رها کنیم، مسیر واقعی آن دقیقاً روی خط میدان می‌افتد؟"
          options={["بله، همیشه دقیقاً روی خط میدان حرکت می‌کند", "نه، به‌خاطر اینرسی مسیرش از خط میدان منحرف می‌شود", "فقط اگر بار مثبت باشد بله", "فقط اگر جرم بی‌نهایت کوچک باشد بله"]}
          correctIndex={1}
          explanation="خط میدان جهت لحظه‌ای نیرو را نشان می‌دهد، اما مسیر واقعی ذره حاصل انتگرال‌گیری از نیرو با در نظر گرفتن سرعت اولیه و اینرسی جرم است؛ بنابراین معمولاً این دو مسیر یکی نیستند مگر در حالت خاص (سرعت اولیه صفر و حرکت شعاعی مستقیم)."
        />
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>خط میدان صرفاً جهت لحظه‌ای نیرو در هر نقطه را نشان می‌دهد، نه مسیر واقعی هیچ ذره‌ای.</li>
          <li>مسیر واقعی حرکت یک ذرهٔ باردار به سرعت اولیه و جرم آن نیز بستگی دارد، نه فقط به میدان.</li>
          <li>هرچه جرم ذره بیشتر باشد، اینرسی بیشتری دارد و مسیرش کندتر به‌سمت خط میدان منحرف می‌شود.</li>
        </ul>
      }
      misconceptions={[
        "خط میدان مسیر حرکت ذره نیست؛ فقط در حالت خاصی (سرعت اولیهٔ صفر، تقارن شعاعی) این دو منطبق می‌شوند.",
        "بزرگ‌تر بودن نیرو به معنی مسیر مستقیم‌تر نیست؛ نسبت نیرو به جرم (شتاب) و سرعت اولیه تعیین‌کنندهٔ شکل مسیرند.",
        "نیروی الکتریکی هموراه در جهت میدان نیست؛ برای بار منفی، نیرو در خلاف جهت میدان است.",
    ]}
    />
  );
}
