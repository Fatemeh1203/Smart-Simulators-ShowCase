import { useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Slider, Stat, Toggle } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { DiscoveryPanel, Trial } from "../components/Discovery";
import { MU0, fmt } from "../data/constants";

const CX = 320;
const CY = 190;
const PX_PER_M = 400; // 1 m = 400 px (small scale, near wire)

function getSvgPoint(svg: SVGSVGElement, evt: React.PointerEvent) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const loc = pt.matrixTransform(ctm.inverse());
  return { x: loc.x, y: loc.y };
}

export default function MagneticFieldLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mode, setMode] = useState<"wire" | "magnet">("wire");
  const [current, setCurrent] = useState(5);
  const [outOfPage, setOutOfPage] = useState(true);
  const [compass, setCompass] = useState({ x: 440, y: 190 });
  const [dragging, setDragging] = useState(false);
  const [moment, setMoment] = useState(6);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [probeR, setProbeR] = useState(0.3);
  const [probeI, setProbeI] = useState(5);

  const dx = compass.x - CX;
  const dy = compass.y - CY;
  const rPx = Math.max(Math.hypot(dx, dy), 10);
  const rM = rPx / PX_PER_M;

  // Straight wire: B tangential, magnitude mu0*I/(2 pi r)
  const Bwire = (MU0 * current) / (2 * Math.PI * rM);
  const sense = outOfPage ? 1 : -1;
  const wireAngle = Math.atan2(dy, dx) + sense * (Math.PI / 2);

  // Magnet: pole model (N at left +, S at right -) analogous to electric dipole for visualization
  const poleSep = 70;
  const north = { x: CX - poleSep, y: CY };
  const south = { x: CX + poleSep, y: CY };
  function poleField(px: number, py: number) {
    let bx = 0;
    let by = 0;
    for (const [p, sign] of [[north, 1] as const, [south, -1] as const]) {
      const ddx = px - p.x;
      const ddy = py - p.y;
      const r = Math.max(Math.hypot(ddx, ddy), 8);
      const mag = (moment * 4000 * sign) / (r * r);
      bx += mag * (ddx / r);
      by += mag * (ddy / r);
    }
    return { bx, by, mag: Math.hypot(bx, by) };
  }
  const magField = poleField(compass.x, compass.y);
  const magnetAngle = Math.atan2(magField.by, magField.bx);

  const needleAngle = mode === "wire" ? wireAngle : magnetAngle;
  const Bshown = mode === "wire" ? Bwire : magField.mag * 1e-6;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || !svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    setCompass(p);
  }

  function fieldLinesForPole(sign: 1 | -1, count: number) {
    const lines: { x: number; y: number }[][] = [];
    const start = sign > 0 ? north : south;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      let x = start.x + Math.cos(angle) * 12;
      let y = start.y + Math.sin(angle) * 12;
      const pts = [{ x, y }];
      for (let step = 0; step < 200; step++) {
        const f = poleField(x, y);
        if (f.mag < 1e-3) break;
        x += (f.bx / f.mag) * sign * 4;
        y += (f.by / f.mag) * sign * 4;
        pts.push({ x, y });
        if (x < 0 || x > 640 || y < 0 || y > 380) break;
        if (Math.hypot(x - south.x, y - south.y) < 14 && sign > 0) break;
        if (Math.hypot(x - north.x, y - north.y) < 14 && sign < 0) break;
      }
      lines.push(pts);
    }
    return lines;
  }

  return (
    <LabLayout
      title="🧲 آزمایشگاه میدان مغناطیسی"
      levelTag="سطح ۴ — Current → Magnetic Field"
      subtitle="سیم حامل جریان یا آهنربای میله‌ای را بررسی کن. قطب‌نما را جابه‌جا کن تا جهت میدان B را در هر نقطه ببینی."
      headerExtra={
        <div className="flex gap-2">
          <Button active={mode === "wire"} onClick={() => setMode("wire")}>سیم مستقیم</Button>
          <Button active={mode === "magnet"} onClick={() => setMode("magnet")}>آهنربای میله‌ای</Button>
        </div>
      }
      simulation={
        <svg
          ref={svgRef}
          viewBox="0 0 640 380"
          className="w-full touch-none rounded-xl bg-slate-950"
          onPointerMove={onMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {mode === "wire" ? (
            <>
              {[40, 80, 120, 160].map((r) => (
                <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#475569" strokeWidth={1} strokeDasharray="4 4" />
              ))}
              <circle cx={CX} cy={CY} r={14} fill="#1e293b" stroke="#facc15" strokeWidth={2} />
              <text x={CX} y={CY + 5} textAnchor="middle" fontSize={16} fill="#facc15">
                {outOfPage ? "⊙" : "⊗"}
              </text>
              <text x={CX} y={CY - 24} textAnchor="middle" fontSize={10} fill="#94a3b8">
                جریان I = {fmt(current, 2)} A ({outOfPage ? "خارج از صفحه" : "داخل صفحه"})
              </text>
              {/* sample tangential vectors */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const r = 100;
                const a = (deg * Math.PI) / 180;
                const px = CX + Math.cos(a) * r;
                const py = CY + Math.sin(a) * r;
                const tAngle = a + sense * (Math.PI / 2);
                return (
                  <line
                    key={deg}
                    x1={px}
                    y1={py}
                    x2={px + Math.cos(tAngle) * 16}
                    y2={py + Math.sin(tAngle) * 16}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    markerEnd="url(#mfl-arrow)"
                  />
                );
              })}
            </>
          ) : (
            <>
              {fieldLinesForPole(1, 10).map((pts, i) => (
                <polyline key={"n" + i} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth={1.2} opacity={0.6} />
              ))}
              <rect x={CX - poleSep - 22} y={CY - 20} width={44} height={40} fill="#ef4444" rx={4} />
              <text x={CX - poleSep} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">N</text>
              <rect x={CX + poleSep - 22} y={CY - 20} width={44} height={40} fill="#3b82f6" rx={4} />
              <text x={CX + poleSep} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">S</text>
            </>
          )}
          <defs>
            <marker id="mfl-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
          </defs>
          {/* compass */}
          <g onPointerDown={(e) => { e.stopPropagation(); setDragging(true); }} className="cursor-grab">
            <circle cx={compass.x} cy={compass.y} r={20} fill="#0f172a" stroke="#64748b" strokeWidth={1.5} />
            <line
              x1={compass.x - Math.cos(needleAngle) * 16}
              y1={compass.y - Math.sin(needleAngle) * 16}
              x2={compass.x + Math.cos(needleAngle) * 16}
              y2={compass.y + Math.sin(needleAngle) * 16}
              stroke="#f43f5e"
              strokeWidth={3}
            />
            <circle cx={compass.x + Math.cos(needleAngle) * 16} cy={compass.y + Math.sin(needleAngle) * 16} r={2.6} fill="#f43f5e" />
            <text x={compass.x} y={compass.y - 26} textAnchor="middle" fontSize={9} fill="#94a3b8">قطب‌نما</text>
          </g>
        </svg>
      }
      parameters={
        <>
          {mode === "wire" ? (
            <>
              <Slider label="جریان سیم I" value={current} min={-15} max={15} step={0.5} unit="A" onChange={setCurrent} color="rose" />
              <Toggle label="جریان به‌سمت خارج صفحه (⊙)" checked={outOfPage} onChange={setOutOfPage} />
            </>
          ) : (
            <Slider label="قدرت آهنربا (گشتاور مغناطیسی نسبی)" value={moment} min={1} max={15} step={0.5} onChange={setMoment} color="rose" />
          )}
          <p className="text-[11px] text-slate-500">قطب‌نمای زرد رنگ را با ماوس در هر نقطه از صفحه جابه‌جا کن.</p>
        </>
      }
      measurements={
        <>
          {mode === "wire" && <Stat label="فاصله از سیم r" value={fmt(rM, 3)} unit="m" color="cyan" />}
          <Stat label="اندازهٔ میدان مغناطیسی |B|" value={fmt(Bshown * 1e3, 3)} unit="mT" color="sky" />
          <Stat label="جهت میدان (نسبت به محور x)" value={fmt((needleAngle * 180) / Math.PI, 3)} unit="deg" color="amber" />
        </>
      }
      equation={
        <div className="space-y-2">
          {mode === "wire" ? (
            <EquationBox>B = μ₀·I / (2π·r)</EquationBox>
          ) : (
            <EquationBox>B<sub>آهنربا</sub> ∝ m / r³ (مدل قطب معادل)</EquationBox>
          )}
          <p className="text-center text-xs text-slate-400">
            μ₀ = 4π×10⁻⁷ T·m/A. جهت B توسط «قاعدهٔ دست راست» تعیین می‌شود: انگشت شست در جهت جریان، خمیدگی انگشتان جهت B را نشان می‌دهد.
          </p>
        </div>
      }
      graph={
        mode === "wire" ? (
          <LineGraph
            points={[{ x: rM, y: Bwire * 1e3 }]}
            curve={Array.from({ length: 30 }, (_, i) => {
              const r = 0.05 + (i / 29) * 0.5;
              return { x: r, y: ((MU0 * current) / (2 * Math.PI * r)) * 1e3 };
            })}
            xLabel="فاصله r (m)"
            yLabel="B (mT)"
          />
        ) : (
          <LineGraph
            points={[{ x: rPx, y: magField.mag * 1e-6 * 1e3 }]}
            xLabel="فاصله (px)"
            yLabel="B (mT) - مدل کیفی"
          />
        )
      }
      extra={
        mode === "wire" && (
          <DiscoveryPanel
            title="کشف رابطهٔ B و I و r"
            question="فاصله را ثابت نگه‌دار و جریان را تغییر بده و ثبت کن، سپس برعکس."
            xLabel="I (A) یا r (m)"
            yLabel="B (mT)"
            trials={trials}
            onRecord={() => setTrials((t) => [...t, { x: probeI, y: ((MU0 * probeI) / (2 * Math.PI * probeR)) * 1e3, label: `I=${probeI}A, r=${probeR}m` }])}
            onClear={() => setTrials([])}
            formula="B ∝ I  و  B ∝ 1/r  ⇒  B = μ₀I/(2πr)"
            hint="بر خلاف میدان الکتریکی که با ۱/r² کم می‌شود، میدان اطراف سیم مستقیم فقط با ۱/r کاهش می‌یابد."
          >
            <div className="grid grid-cols-2 gap-2">
              <Slider label="جریان فرضی I" value={probeI} min={0.5} max={15} step={0.5} unit="A" onChange={setProbeI} color="violet" />
              <Slider label="فاصلهٔ فرضی r" value={probeR} min={0.05} max={0.5} step={0.01} unit="m" onChange={setProbeR} color="violet" />
            </div>
          </DiscoveryPanel>
        )
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>میدان مغناطیسی اطراف یک سیم مستقیم به‌صورت خطوط دایره‌ای حول سیم است، نه شعاعی مثل میدان الکتریکی.</li>
          <li>اندازهٔ میدان با فاصله از سیم به‌صورت ۱/r کاهش می‌یابد (نه ۱/r²).</li>
          <li>جهت میدان با قاعدهٔ دست راست تعیین می‌شود و با تغییر جهت جریان معکوس می‌شود.</li>
          <li>مدل «قطب معادل» برای آهنربای میله‌ای فقط یک ابزار بصری است — در واقعیت قطب مغناطیسی منفرد (تک‌قطبی) وجود ندارد.</li>
        </ul>
      }
      misconceptions={[
        "میدان مغناطیسی حول سیم مستقیم به شکل شعاعی نیست، بلکه حلقوی (دایره‌ای) حول سیم است.",
        "قطب N و S مدل بصری این آزمایشگاه یک تقریب آموزشی است؛ در فیزیک واقعی «بار مغناطیسی» منفرد وجود ندارد و میدان مغناطیسی از حرکت بار (جریان) یا اسپین ذرات ناشی می‌شود.",
        "میدان مغناطیسی ساکن روی بار ساکن هیچ نیرویی وارد نمی‌کند؛ نیروی مغناطیسی فقط روی بارهای متحرک اثر دارد.",
        "دو برابر کردن فاصله از سیم، میدان را به یک‌چهارم نمی‌رساند (برخلاف میدان الکتریکی) بلکه فقط نصف می‌کند، چون رابطه با ۱/r است نه ۱/r².",
      ]}
    />
  );
}
