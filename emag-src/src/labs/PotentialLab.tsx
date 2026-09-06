import { useMemo, useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Slider, Stat, Toggle } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { marchingSquares } from "../utils/marchingSquares";
import { K_COULOMB, fmt } from "../data/constants";

const PX_PER_M = 60;
const W = 640;
const H = 380;
const GRID_STEP = 12;

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

function potentialAt(charges: Charge[], x: number, y: number) {
  let v = 0;
  for (const c of charges) {
    const rPx = Math.max(Math.hypot(x - c.x, y - c.y), 6);
    const r = rPx / PX_PER_M;
    v += (K_COULOMB * (c.q * 1e-9)) / r;
  }
  return v;
}

function fieldAt(charges: Charge[], x: number, y: number) {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const rPx = Math.max(Math.hypot(dx, dy), 6);
    const r = rPx / PX_PER_M;
    const mag = (K_COULOMB * (c.q * 1e-9)) / (r * r);
    ex += mag * (dx / rPx);
    ey += mag * (dy / rPx);
  }
  return { ex, ey, mag: Math.hypot(ex, ey) };
}

export default function PotentialLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, x: 240, y: 190, q: 6 },
    { id: 2, x: 400, y: 190, q: -6 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [probe, setProbe] = useState({ x: 320, y: 120 });
  const [dragging, setDragging] = useState<{ type: "charge" | "probe"; id?: number } | null>(null);
  const [showEquip, setShowEquip] = useState(true);
  const [showField, setShowField] = useState(true);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeR, setProbeR] = useState(2);

  const grid = useMemo(() => {
    const nx = Math.floor(W / GRID_STEP) + 1;
    const ny = Math.floor(H / GRID_STEP) + 1;
    const values: number[][] = [];
    for (let j = 0; j < ny; j++) {
      const row: number[] = [];
      for (let i = 0; i < nx; i++) {
        row.push(potentialAt(charges, i * GRID_STEP, j * GRID_STEP));
      }
      values.push(row);
    }
    return { values, nx, ny };
  }, [charges]);

  const maxAbsV = Math.max(1, ...grid.values.flat().map((v) => Math.abs(v)));
  const levels = [0.06, 0.13, 0.24, 0.4, 0.62].flatMap((f) => [f * maxAbsV, -f * maxAbsV]);

  const contours = useMemo(() => {
    return levels.map((lvl) => ({
      lvl,
      segs: marchingSquares(grid.values, grid.nx, grid.ny, lvl).map(
        ([x1, y1, x2, y2]) => [x1 * GRID_STEP, y1 * GRID_STEP, x2 * GRID_STEP, y2 * GRID_STEP] as [number, number, number, number],
      ),
    }));
  }, [grid]);

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || !svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    p.x = Math.min(Math.max(p.x, 6), W - 6);
    p.y = Math.min(Math.max(p.y, 6), H - 6);
    if (dragging.type === "probe") setProbe(p);
    else setCharges((cs) => cs.map((c) => (c.id === dragging.id ? { ...c, x: p.x, y: p.y } : c)));
  }

  const Vp = potentialAt(charges, probe.x, probe.y);
  const Ep = fieldAt(charges, probe.x, probe.y);
  const primary = charges[0];
  const rPrimary = Math.hypot(probe.x - primary.x, probe.y - primary.y) / PX_PER_M;

  function addCharge(sign: 1 | -1) {
    setCharges((cs) => [...cs, { id: nextId, x: 200 + Math.random() * 200, y: 100 + Math.random() * 180, q: sign * 6 }]);
    setNextId((n) => n + 1);
  }

  return (
    <LabLayout
      title="🧭 آزمایشگاه پتانسیل و میدان الکتریکی"
      levelTag="سطح ۲ — Potential → Voltage → Energy"
      subtitle="روی صفحه حرکت کن و ببین V و E چطور در فضا تغییر می‌کنند. خطوط هم‌پتانسیل (نارنجی) همیشه بر خطوط میدان (آبی) عمودند."
      headerExtra={
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => addCharge(1)}>＋ بار مثبت</Button>
          <Button variant="danger" onClick={() => addCharge(-1)}>− بار منفی</Button>
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
            <marker id="arrow-e2" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
          </defs>
          {showEquip &&
            contours.map((c, ci) => (
              <g key={ci}>
                {c.segs.map((s, i) => (
                  <line
                    key={i}
                    x1={s[0]}
                    y1={s[1]}
                    x2={s[2]}
                    y2={s[3]}
                    stroke={c.lvl >= 0 ? "#fb923c" : "#a78bfa"}
                    strokeWidth={1.4}
                    opacity={0.75}
                  />
                ))}
              </g>
            ))}
          {showField &&
            Array.from({ length: 12 * 7 }).map((_, idx) => {
              const cols = 12;
              const gx = 30 + (idx % cols) * (W - 60) / (cols - 1);
              const gy = 30 + Math.floor(idx / cols) * (H - 60) / 6;
              const f = fieldAt(charges, gx, gy);
              if (f.mag < 1e-2) return null;
              const len = Math.min(18, 5 + 4 * Math.log10(1 + f.mag / 5));
              return (
                <line
                  key={idx}
                  x1={gx}
                  y1={gy}
                  x2={gx + (f.ex / f.mag) * len}
                  y2={gy + (f.ey / f.mag) * len}
                  stroke="#38bdf8"
                  strokeWidth={1.3}
                  markerEnd="url(#arrow-e2)"
                  opacity={0.7}
                />
              );
            })}
          {charges.map((c) => (
            <g key={c.id} onPointerDown={(e) => { e.stopPropagation(); setDragging({ type: "charge", id: c.id }); }} className="cursor-grab">
              <circle cx={c.x} cy={c.y} r={11} fill={c.q > 0 ? "#f43f5e" : "#3b82f6"} stroke="#fff" strokeWidth={1.5} />
              <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{c.q > 0 ? "+" : "−"}</text>
            </g>
          ))}
          <g onPointerDown={(e) => { e.stopPropagation(); setDragging({ type: "probe" }); }} className="cursor-grab">
            <circle cx={probe.x} cy={probe.y} r={7} fill="#facc15" stroke="#0f172a" strokeWidth={1.5} />
            <text x={probe.x} y={probe.y - 12} textAnchor="middle" fontSize={9} fill="#facc15" fontWeight={700}>پروب اندازه‌گیری</text>
          </g>
        </svg>
      }
      parameters={
        <>
          <Toggle label="نمایش خطوط هم‌پتانسیل (Equipotential)" checked={showEquip} onChange={setShowEquip} />
          <Toggle label="نمایش بردارهای میدان E" checked={showField} onChange={setShowField} />
          <p className="text-[11px] text-slate-500">بارها و پروب زرد را با ماوس جابه‌جا کن. سعی کن پروب را دقیقاً روی یک خط نارنجی حرکت بدهی و ببین V تغییر نمی‌کند!</p>
        </>
      }
      measurements={
        <>
          <Stat label="پتانسیل در محل پروب V" value={fmt(Vp, 3)} unit="V" color="amber" />
          <Stat label="اندازهٔ میدان در محل پروب |E|" value={fmt(Ep.mag, 3)} unit="N/C" color="sky" />
          <Stat label="فاصله از بار اول r" value={fmt(rPrimary, 3)} unit="m" color="cyan" />
        </>
      }
      equation={
        <div className="space-y-3">
          <EquationBox>V = k·q / r</EquationBox>
          <EquationBox>E = −∇V</EquationBox>
          <p className="text-center text-xs leading-6 text-slate-400">
            به زبان ساده: میدان الکتریکی در جهتی است که پتانسیل «سریع‌ترین کاهش» را دارد، و اندازهٔ آن برابر «شیب» تغییرات V نسبت به مکان است. به همین دلیل جایی که خطوط هم‌پتانسیل بسیار به‌هم نزدیک‌اند (V به‌سرعت تغییر می‌کند)، میدان قوی‌تر است.
          </p>
        </div>
      }
      graph={
        <LineGraph
          points={[{ x: rPrimary, y: Vp }]}
          curve={Array.from({ length: 40 }, (_, i) => {
            const r = 0.3 + (i / 39) * 5;
            return { x: r, y: (K_COULOMB * (primary.q * 1e-9)) / r };
          })}
          xLabel="فاصله از بار اول r (m)"
          yLabel="V (Volt)"
        />
      }
      extra={
        <DiscoveryPanel
          title="کشف رابطهٔ V و r"
          question="با اسلایدر فاصلهٔ فرضی را تغییر بده و ثبت کن. آیا V هم مثل E با ۱/r² کم می‌شود یا فرق دارد؟"
          xLabel="r (m)"
          yLabel="V (Volt)"
          trials={trials}
          onRecord={() => {
            const v = (K_COULOMB * (primary.q * 1e-9)) / probeR;
            setTrials((t) => [...t, { x: probeR, y: v, label: `r=${probeR.toFixed(2)}m` }]);
          }}
          onClear={() => setTrials([])}
          formula="V ∝ 1/r   (نه ۱/r²) ⇒ V = k·q/r"
          hint="نتایج را با نمودار E vs r در آزمایشگاه میدان مقایسه کن؛ V کندتر از E کاهش می‌یابد چون یک درجه با r متفاوت است."
        >
          <Slider label="فاصلهٔ فرضی" value={probeR} min={0.3} max={6} step={0.1} unit="m" onChange={setProbeR} color="violet" />
        </DiscoveryPanel>
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>پتانسیل الکتریکی V یک کمیت نرده‌ای (اسکالر) است، اما میدان E یک کمیت برداری است.</li>
          <li>V با ۱/r کاهش می‌یابد در حالی‌که E با ۱/r² کاهش می‌یابد — به همین دلیل V با فاصله «کندتر» از بین می‌رود.</li>
          <li>خطوط هم‌پتانسیل همیشه عمود بر خطوط میدان‌اند؛ حرکت روی یک خط هم‌پتانسیل هیچ کاری روی بار انجام نمی‌دهد.</li>
          <li>بین دو بار مساوی و مخالف، میدان می‌تواند صفر شود در حالی‌که پتانسیل صفر نیست (یا برعکس) — E و V مستقل از هم تفسیر می‌شوند.</li>
        </ul>
      }
      misconceptions={[
        "میدان الکتریکی (E) و پتانسیل الکتریکی (V) یک چیز نیستند: V اسکالر و E بردار است؛ E مشتق مکانی V است.",
        "V=0 به معنی E=0 نیست و برعکس؛ مثلاً وسط دو بار هم‌نام مخالف، V می‌تواند صفر باشد ولی E صفر نیست (یا در حالت دیگر برعکس).",
        "حرکت در جهت میدان لزوماً به معنی افزایش پتانسیل نیست — در واقع حرکت در جهت E باعث کاهش V می‌شود.",
        "ولتاژ یک کمیت مطلق در یک نقطه نیست، بلکه همیشه نسبت به یک نقطهٔ مرجع (معمولاً بی‌نهایت یا زمین) تعریف می‌شود.",
      ]}
    />
  );
}
