import { useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Pill, Slider, Stat, Toggle } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { PredictQuestion } from "../components/Predict";
import { K_COULOMB, fmt } from "../data/constants";

const PX_PER_M = 60;
const W = 640;
const H = 380;

interface Charge {
  id: number;
  x: number;
  y: number;
  q: number; // nC
}

function toMeters(px: number) {
  return px / PX_PER_M;
}

function fieldAt(charges: Charge[], x: number, y: number) {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const rPx = Math.max(Math.hypot(dx, dy), 8);
    const r = toMeters(rPx);
    const qC = c.q * 1e-9;
    const mag = (K_COULOMB * qC) / (r * r);
    ex += mag * (dx / rPx);
    ey += mag * (dy / rPx);
  }
  return { ex, ey, mag: Math.hypot(ex, ey) };
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

export default function ElectricFieldLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [charges, setCharges] = useState<Charge[]>([{ id: 1, x: 320, y: 190, q: 5 }]);
  const [nextId, setNextId] = useState(2);
  const [test, setTest] = useState({ x: 470, y: 190 });
  const [dragging, setDragging] = useState<{ type: "charge" | "test"; id?: number } | null>(null);
  const [showField, setShowField] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [followMode, setFollowMode] = useState(false);

  const [rTrials, setRTrials] = useState<Trial[]>([]);
  const [qTrials, setQTrials] = useState<Trial[]>([]);
  const [probeR, setProbeR] = useState(2.5);
  const [probeQ, setProbeQ] = useState(5);

  const primary = charges[0];

  function updatePrimaryQ(q: number) {
    setCharges((cs) => cs.map((c, i) => (i === 0 ? { ...c, q } : c)));
  }

  const field = fieldAt(charges, test.x, test.y);
  const dxT = test.x - (primary?.x ?? 0);
  const dyT = test.y - (primary?.y ?? 0);
  const rTest = toMeters(Math.hypot(dxT, dyT));
  const testChargeC = 1e-9; // 1 nC test charge
  const forceMag = field.mag * testChargeC;

  function addCharge(sign: 1 | -1) {
    setCharges((cs) => [
      ...cs,
      { id: nextId, x: 150 + Math.random() * 100, y: 100 + Math.random() * 180, q: sign * 5 },
    ]);
    setNextId((n) => n + 1);
  }

  function onPointerDown(type: "charge" | "test", id?: number) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      setDragging({ type, id });
    };
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || !svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    p.x = Math.min(Math.max(p.x, 10), W - 10);
    p.y = Math.min(Math.max(p.y, 10), H - 10);
    if (dragging.type === "test") {
      setTest(p);
      if (followMode) setTrail((t) => [...t.slice(-60), p]);
    } else {
      setCharges((cs) => cs.map((c) => (c.id === dragging.id ? { ...c, x: p.x, y: p.y } : c)));
    }
  }

  // vector field grid
  const gridPoints: { x: number; y: number }[] = [];
  for (let x = 40; x < W; x += 55) {
    for (let y = 30; y < H; y += 55) {
      gridPoints.push({ x, y });
    }
  }

  function fieldLinesFor(c: Charge, count: number) {
    const lines: { x: number; y: number }[][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      let x = c.x + Math.cos(angle) * 14;
      let y = c.y + Math.sin(angle) * 14;
      const pts: { x: number; y: number }[] = [{ x, y }];
      const dirSign = c.q > 0 ? 1 : -1;
      for (let step = 0; step < 260; step++) {
        const f = fieldAt(charges, x, y);
        if (f.mag < 1e-6) break;
        const ux = (f.ex / f.mag) * dirSign;
        const uy = (f.ey / f.mag) * dirSign;
        x += ux * 4;
        y += uy * 4;
        pts.push({ x, y });
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;
        // stop if very close to an opposite charge
        const near = charges.find((o) => o.id !== c.id && Math.hypot(o.x - x, o.y - y) < 14 && o.q * c.q < 0);
        if (near) break;
      }
      lines.push(pts);
    }
    return lines;
  }

  const maxAbsQ = Math.max(1, ...charges.map((c) => Math.abs(c.q)));

  return (
    <LabLayout
      title="⚡ آزمایشگاه میدان الکتریکی"
      levelTag="سطح ۱ — Charge → Electric Field → Force"
      subtitle="بارهای نقطه‌ای را جابه‌جا کن، یک بار آزمایشی بگذار و ببین میدان و نیرو چطور تغییر می‌کنند. اول پدیده را ببین، بعد رابطه را کشف کن."
      headerExtra={
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => addCharge(1)}>
            ＋ بار مثبت
          </Button>
          <Button variant="danger" onClick={() => addCharge(-1)}>
            − بار منفی
          </Button>
        </div>
      }
      simulation={
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none rounded-xl bg-slate-950"
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
        >
          <defs>
            <marker id="arrow-e" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-line" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
            </marker>
          </defs>
          {/* field lines */}
          {showLines &&
            charges.map((c) =>
              fieldLinesFor(c, 10).map((pts, i) => (
                <polyline
                  key={c.id + "-" + i}
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#475569"
                  strokeWidth={1}
                  opacity={0.55}
                  markerMid="url(#arrow-line)"
                />
              )),
            )}
          {/* vector field grid */}
          {showField &&
            gridPoints.map((p, i) => {
              const f = fieldAt(charges, p.x, p.y);
              if (f.mag < 1e-3) return null;
              const len = Math.min(22, 6 + 5 * Math.log10(1 + f.mag / 5));
              const ux = f.ex / f.mag;
              const uy = f.ey / f.mag;
              const hue = Math.min(220, 40 + f.mag * 0.6);
              return (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={p.x + ux * len}
                  y2={p.y + uy * len}
                  stroke={`hsl(${200 - hue / 4},90%,60%)`}
                  strokeWidth={1.6}
                  markerEnd="url(#arrow-e)"
                  opacity={0.8}
                />
              );
            })}
          {/* trail of test charge (real path) */}
          {trail.length > 1 && (
            <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#facc15" strokeWidth={2} opacity={0.7} />
          )}
          {/* charges */}
          {charges.map((c) => (
            <g key={c.id} onPointerDown={onPointerDown("charge", c.id)} className="cursor-grab">
              <circle cx={c.x} cy={c.y} r={10 + 3 * (Math.abs(c.q) / maxAbsQ)} fill={c.q > 0 ? "#f43f5e" : "#3b82f6"} stroke="#fff" strokeWidth={1.5} />
              <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">
                {c.q > 0 ? "+" : "−"}
              </text>
              <text x={c.x} y={c.y - 18} textAnchor="middle" fontSize={10} fill="#cbd5e1" className="tabular">
                {fmt(c.q, 2)} nC
              </text>
              {charges.length > 1 && (
                <text
                  x={c.x + 16}
                  y={c.y + 20}
                  fontSize={10}
                  fill="#f87171"
                  className="cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setCharges((cs) => cs.filter((x) => x.id !== c.id));
                  }}
                >
                  ✕ حذف
                </text>
              )}
            </g>
          ))}
          {/* test charge */}
          <g onPointerDown={onPointerDown("test")} className="cursor-grab">
            <line x1={test.x} y1={test.y} x2={test.x + (field.ex / (field.mag || 1)) * 40} y2={test.y + (field.ey / (field.mag || 1)) * 40} stroke="#22d3ee" strokeWidth={2.5} markerEnd="url(#arrow-e)" />
            <circle cx={test.x} cy={test.y} r={7} fill="#facc15" stroke="#0f172a" strokeWidth={1.5} />
            <text x={test.x} y={test.y - 12} textAnchor="middle" fontSize={9} fill="#facc15" fontWeight={700}>
              بار آزمایشی
            </text>
          </g>
        </svg>
      }
      parameters={
        <>
          {primary && (
            <Slider
              label={`مقدار بار اول q۱ (بار قرمز/آبی اصلی)`}
              value={primary.q}
              min={-10}
              max={10}
              step={0.5}
              unit="nC"
              onChange={updatePrimaryQ}
              color="rose"
            />
          )}
          <p className="text-[11px] text-slate-500">
            بارهای دیگر و بار آزمایشی را مستقیماً با ماوس روی صفحه جابه‌جا کن. برای حذف یک بار روی «✕ حذف» بزن.
          </p>
          <Toggle label="نمایش میدان برداری (Vector Field)" checked={showField} onChange={setShowField} />
          <Toggle label="نمایش خطوط میدان (Field Lines)" checked={showLines} onChange={setShowLines} />
          <Toggle label="ثبت مسیر واقعی حرکت بار آزمایشی (رها کردن آن در میدان)" checked={followMode} onChange={setFollowMode} />
          {followMode && (
            <Button variant="ghost" onClick={() => setTrail([])}>
              پاک‌کردن مسیر ثبت‌شده
            </Button>
          )}
        </>
      }
      measurements={
        <>
          <Stat label="فاصلهٔ بار آزمایشی تا q۱ (r)" value={fmt(rTest, 3)} unit="m" color="cyan" />
          <Stat label="اندازهٔ میدان الکتریکی |E|" value={fmt(field.mag, 3)} unit="N/C" color="sky" />
          <Stat label="نیروی وارد بر بار آزمایشی |F| (q=1nC)" value={fmt(forceMag, 3)} unit="N" color="emerald" />
          <Stat label="تعداد بارها" value={String(charges.length)} />
          <Pill color={field.mag > 0 ? "sky" : "amber"}>جهت میدان به سمت بار منفی و دور از بار مثبت است</Pill>
        </>
      }
      equation={
        <div className="space-y-3">
          <EquationBox>E = k·q / r²</EquationBox>
          <EquationBox>F = q·E</EquationBox>
          <p className="text-center text-xs text-slate-400">
            برای چند بار: E<sub>کل</sub> = Σ E<sub>i</sub> (جمع برداری) — k ≈ 8.99×10⁹ N·m²/C²
          </p>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: rTest, y: field.mag }]}
          curve={Array.from({ length: 40 }, (_, i) => {
            const r = 0.3 + (i / 39) * 5;
            const qC = (primary?.q ?? 0) * 1e-9;
            return { x: r, y: Math.abs((K_COULOMB * qC) / (r * r)) };
          })}
          xLabel="فاصله r (m)"
          yLabel="E (N/C)"
        />
      }
      extra={
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PredictQuestion
              question="اگر فاصلهٔ بار آزمایشی از q۱ دو برابر شود، شدت میدان E چه تغییری می‌کند؟"
              options={["نصف می‌شود", "یک‌چهارم می‌شود", "ثابت می‌ماند", "دو برابر می‌شود"]}
              correctIndex={1}
              explanation="چون E با ۱/r² نسبت دارد، دوبرابر شدن r باعث می‌شود E به یک‌چهارم مقدار قبلی برسد. حالا بار آزمایشی را با ماوس دورتر کن و ببین!"
            />
            <PredictQuestion
              question="اگر مقدار بار q۱ دو برابر شود (فاصله ثابت)، شدت میدان چه تغییری می‌کند؟"
              options={["ثابت می‌ماند", "دو برابر می‌شود", "چهار برابر می‌شود", "نصف می‌شود"]}
              correctIndex={1}
              explanation="E با q رابطهٔ خطی دارد، پس دوبرابر شدن q دقیقاً E را دوبرابر می‌کند. با اسلایدر q۱ را دو برابر کن و مقدار E را بررسی کن."
            />
            <PredictQuestion
              question="اگر فاصله را نصف کنیم، میدان چند برابر می‌شود؟"
              options={["۲ برابر", "۴ برابر", "۸ برابر", "بدون تغییر"]}
              correctIndex={1}
              explanation="نصف شدن r یعنی ۱/r² چهار برابر می‌شود، پس E چهار برابر می‌شود — رابطهٔ عکس با مربع فاصله."
            />
            <PredictQuestion
              question="اگر علامت بار q۱ از مثبت به منفی تغییر کند، اندازهٔ میدان E در همان نقطه چه می‌شود؟ جهت آن چطور؟"
              options={["اندازه ثابت، جهت معکوس می‌شود", "اندازه و جهت هر دو ثابت می‌مانند", "اندازه صفر می‌شود", "اندازه دو برابر می‌شود"]}
              correctIndex={0}
              explanation="اندازهٔ میدان فقط به |q| بستگی دارد، اما جهت میدان کاملاً معکوس می‌شود چون میدان به‌جای دور شدن از بار، به‌سمت آن می‌رود."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DiscoveryPanel
              title="کشف رابطهٔ E و r"
              question="q۱ را ثابت نگه دار و با اسلایدر زیر فاصلهٔ فرضی r را تغییر بده، سپس هر بار «ثبت آزمایش» را بزن. آیا E با ۱/r² متناسب است؟"
              xLabel="r (m)"
              yLabel="E (N/C)"
              trials={rTrials}
              onRecord={() => {
                const qC = (primary?.q ?? 5) * 1e-9;
                const E = Math.abs((K_COULOMB * qC) / (probeR * probeR));
                setRTrials((t) => [...t, { x: probeR, y: E, label: `r=${probeR.toFixed(2)}m` }]);
              }}
              onClear={() => setRTrials([])}
              formula="E ∝ 1/r²  ⇒  E = k·q/r²"
              hint="وقتی r را دو برابر کردی، E چند برابر شد؟ نسبت را با نقطهٔ قبلی مقایسه کن."
            />
            <div className="space-y-2">
              <Slider label="فاصلهٔ فرضی برای ثبت (r)" value={probeR} min={0.3} max={6} step={0.1} unit="m" onChange={setProbeR} color="violet" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DiscoveryPanel
              title="کشف رابطهٔ E و q"
              question="فاصله را ثابت نگه دار (۲ متر) و مقدار بار فرضی را تغییر بده، سپس ثبت کن. آیا E با q متناسب است؟"
              xLabel="q (nC)"
              yLabel="E (N/C)"
              trials={qTrials}
              onRecord={() => {
                const qC = probeQ * 1e-9;
                const r = 2;
                const E = Math.abs((K_COULOMB * qC) / (r * r));
                setQTrials((t) => [...t, { x: probeQ, y: E, label: `q=${probeQ.toFixed(1)}nC` }]);
              }}
              onClear={() => setQTrials([])}
              formula="E ∝ q  ⇒  E = k·q/r²"
              hint="اگر q را دو برابر کنی، مقدار E دقیقاً چند برابر می‌شود؟"
            />
            <div className="space-y-2">
              <Slider label="بار فرضی برای ثبت (q)" value={probeQ} min={-10} max={10} step={0.5} unit="nC" onChange={setProbeQ} color="violet" />
            </div>
          </div>
        </>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>میدان الکتریکی یک کمیت برداری است که در هر نقطه از فضا تعریف می‌شود، حتی اگر باری در آن نقطه نباشد.</li>
          <li>شدت میدان با مجذور فاصله نسبت عکس دارد (E ∝ 1/r²) و با مقدار بار نسبت مستقیم دارد (E ∝ q).</li>
          <li>نیروی وارد بر یک بار آزمایشی از رابطهٔ F = qE به‌دست می‌آید و جهت آن به علامت بار آزمایشی بستگی دارد.</li>
          <li>«خط میدان» مسیر لحظه‌ای نیرو را نشان می‌دهد، اما لزوماً مسیر واقعی حرکت یک ذرهٔ رها شده در میدان نیست (به‌خاطر سرعت اولیه و اینرسی).</li>
        </ul>
      }
      misconceptions={[
        "میدان الکتریکی (E) با نیرو (F) یکی نیست: نیرو به بار آزمایشی هم بستگی دارد (F=qE) اما میدان مستقل از بار آزمایشی است.",
        "خطوط میدان مسیر واقعی حرکت ذره نیستند؛ فقط جهت لحظه‌ایِ نیرو را نشان می‌دهند. ذرهٔ متحرک به‌خاطر اینرسی مسیر متفاوتی می‌رود.",
        "میدان الکتریکی در نقطه‌ای که هیچ باری وجود ندارد صفر نیست؛ میدان حاصل از بارهای اطراف است.",
        "افزایش تعداد بارها لزوماً میدان را زیاد نمی‌کند — اگر علامت بارها مخالف باشد ممکن است میدان‌ها یکدیگر را خنثی کنند.",
      ]}
    />
  );
}
