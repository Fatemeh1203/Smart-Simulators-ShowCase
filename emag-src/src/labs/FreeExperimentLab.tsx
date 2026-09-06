import { useEffect, useRef, useState } from "react";
import { Card, Button, Toggle, Pill } from "../components/ui";
import { K_COULOMB } from "../data/constants";

type Tool = "posCharge" | "negCharge" | "wireOut" | "wireIn" | "testParticle";

interface Obj {
  id: number;
  type: "charge" | "wire";
  x: number;
  y: number;
  q?: number; // nC for charge
  I?: number; // A for wire, sign gives direction
}

const W = 760;
const H = 440;
const PX_PER_M = 60;

function getSvgPoint(svg: SVGSVGElement, evt: React.PointerEvent | React.MouseEvent) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const loc = pt.matrixTransform(ctm.inverse());
  return { x: loc.x, y: loc.y };
}

export default function FreeExperimentLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tool, setTool] = useState<Tool>("posCharge");
  const [objects, setObjects] = useState<Obj[]>([]);
  const [nextId, setNextId] = useState(1);
  const [dragId, setDragId] = useState<number | null>(null);
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);

  const [particle, setParticle] = useState<{ x: number; y: number; vx: number; vy: number; q: number } | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [launching, setLaunching] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  function eFieldAt(x: number, y: number) {
    let ex = 0;
    let ey = 0;
    for (const o of objects) {
      if (o.type !== "charge") continue;
      const dx = x - o.x;
      const dy = y - o.y;
      const rPx = Math.max(Math.hypot(dx, dy), 8);
      const r = rPx / PX_PER_M;
      const mag = (K_COULOMB * (o.q! * 1e-9)) / (r * r);
      ex += mag * (dx / rPx);
      ey += mag * (dy / rPx);
    }
    return { ex, ey };
  }

  function bScalarAt(x: number, y: number) {
    // فقط برای نمایش مفهومی: مجموع میدان اسکالر (خارج/داخل صفحه) با علامت
    let b = 0;
    for (const o of objects) {
      if (o.type !== "wire") continue;
      const r = Math.max(Math.hypot(x - o.x, y - o.y), 10);
      b += (o.I! * 40) / r;
    }
    return b;
  }

  function addObjectAt(x: number, y: number) {
    if (tool === "posCharge") setObjects((os) => [...os, { id: nextId, type: "charge", x, y, q: 5 }]);
    else if (tool === "negCharge") setObjects((os) => [...os, { id: nextId, type: "charge", x, y, q: -5 }]);
    else if (tool === "wireOut") setObjects((os) => [...os, { id: nextId, type: "wire", x, y, I: 5 }]);
    else if (tool === "wireIn") setObjects((os) => [...os, { id: nextId, type: "wire", x, y, I: -5 }]);
    else if (tool === "testParticle") {
      setParticle({ x, y, vx: 40, vy: 0, q: 1 });
      setTrail([]);
      return;
    }
    setNextId((n) => n + 1);
  }

  function onCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
    if (dragId !== null) return;
    if (!svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    addObjectAt(p.x, p.y);
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (dragId === null || !svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    setObjects((os) => os.map((o) => (o.id === dragId ? { ...o, x: p.x, y: p.y } : o)));
  }

  useEffect(() => {
    if (!launching || !particle) return;
    let last = performance.now();
    function tick(t: number) {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      setParticle((p) => {
        if (!p) return p;
        const { ex, ey } = eFieldAt(p.x, p.y);
        const bScalar = bScalarAt(p.x, p.y);
        // نیروی الکتریکی + نیروی لورنتس مفهومی (F = qE + qv×B با B عمود بر صفحه)
        const ax = p.q * ex * 1e-8 + p.q * p.vy * bScalar * 0.002;
        const ay = p.q * ey * 1e-8 - p.q * p.vx * bScalar * 0.002;
        const nvx = p.vx + ax * dt;
        const nvy = p.vy + ay * dt;
        const nx = p.x + nvx * dt;
        const ny = p.y + nvy * dt;
        setTrail((tr) => [...tr.slice(-300), { x: nx, y: ny }]);
        if (nx < 0 || nx > W || ny < 0 || ny > H) setLaunching(false);
        return { x: nx, y: ny, vx: nvx, vy: nvy, q: p.q };
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launching]);

  const gridPts: { x: number; y: number }[] = [];
  for (let x = 30; x < W; x += 46) for (let y = 30; y < H; y += 46) gridPts.push({ x, y });

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white">🧪 آزمایش آزاد (Sandbox)</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          هر عنصری که می‌خواهی را انتخاب کن، سپس روی صفحه کلیک کن تا قرار بگیرد. اشیا را با ماوس جابه‌جا کن، میدان‌های ترکیبی حاصل از آن‌ها را ببین و یک ذرهٔ آزمایشی رها کن تا مسیر واقعی آن را تحت میدان‌های ترکیبی مشاهده کنی. این محیط یک شبیه‌سازی «مفهومی» و اکتشافی است، نه محاسبهٔ دقیق آزمایشگاهی.
        </p>
      </div>

      <Card className="!p-2 sm:!p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button active={tool === "posCharge"} onClick={() => setTool("posCharge")}>＋ بار مثبت</Button>
          <Button active={tool === "negCharge"} onClick={() => setTool("negCharge")}>− بار منفی</Button>
          <Button active={tool === "wireOut"} onClick={() => setTool("wireOut")}>⊙ سیم (خارج صفحه)</Button>
          <Button active={tool === "wireIn"} onClick={() => setTool("wireIn")}>⊗ سیم (داخل صفحه)</Button>
          <Button active={tool === "testParticle"} onClick={() => setTool("testParticle")}>🔵 ذرهٔ آزمایشی</Button>
          <Button variant="ghost" onClick={() => setObjects([])}>پاک‌کردن همه</Button>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none rounded-xl bg-slate-950"
          onClick={onCanvasClick}
          onPointerMove={onMove}
          onPointerUp={() => setDragId(null)}
          onPointerLeave={() => setDragId(null)}
        >
          <defs>
            <marker id="fx-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
          </defs>
          {showE &&
            gridPts.map((p, i) => {
              const { ex, ey } = eFieldAt(p.x, p.y);
              const mag = Math.hypot(ex, ey);
              if (mag < 1e-2) return null;
              const len = Math.min(18, 5 + 4 * Math.log10(1 + mag / 5));
              return (
                <line key={"e" + i} x1={p.x} y1={p.y} x2={p.x + (ex / mag) * len} y2={p.y + (ey / mag) * len} stroke="#38bdf8" strokeWidth={1.3} markerEnd="url(#fx-arrow)" opacity={0.65} />
              );
            })}
          {showB &&
            objects
              .filter((o) => o.type === "wire")
              .map((o) => (
                <g key={"bf" + o.id}>
                  {[30, 60, 90].map((r) => (
                    <circle key={r} cx={o.x} cy={o.y} r={r} fill="none" stroke="#f59e0b" strokeDasharray="4 4" opacity={0.4} />
                  ))}
                </g>
              ))}
          {objects.map((o) => (
            <g key={o.id} onPointerDown={(e) => { e.stopPropagation(); setDragId(o.id); }} className="cursor-grab">
              {o.type === "charge" ? (
                <>
                  <circle cx={o.x} cy={o.y} r={11} fill={o.q! > 0 ? "#f43f5e" : "#3b82f6"} stroke="#fff" strokeWidth={1.5} />
                  <text x={o.x} y={o.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{o.q! > 0 ? "+" : "−"}</text>
                </>
              ) : (
                <>
                  <circle cx={o.x} cy={o.y} r={11} fill="#1e293b" stroke="#facc15" strokeWidth={2} />
                  <text x={o.x} y={o.y + 4} textAnchor="middle" fontSize={12} fill="#facc15">{o.I! > 0 ? "⊙" : "⊗"}</text>
                </>
              )}
              <text x={o.x + 14} y={o.y + 20} fontSize={9} fill="#f87171" onPointerDown={(e) => { e.stopPropagation(); setObjects((os) => os.filter((x) => x.id !== o.id)); }}>✕</text>
            </g>
          ))}
          {trail.length > 1 && <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#facc15" strokeWidth={2} opacity={0.8} />}
          {particle && <circle cx={particle.x} cy={particle.y} r={7} fill="#22d3ee" stroke="#0f172a" strokeWidth={1.5} />}
        </svg>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Toggle label="نمایش میدان الکتریکی (آبی)" checked={showE} onChange={setShowE} />
          <Toggle label="نمایش حلقه‌های میدان مغناطیسی (نارنجی)" checked={showB} onChange={setShowB} />
          {particle && (
            <Button variant="primary" onClick={() => setLaunching((l) => !l)}>
              {launching ? "⏸ توقف ذره" : "▶ رهاکردن ذره در میدان"}
            </Button>
          )}
          {particle && (
            <Button variant="ghost" onClick={() => { setParticle(null); setTrail([]); setLaunching(false); }}>
              حذف ذره
            </Button>
          )}
          <Pill color="violet">تعداد اشیا: {objects.length}</Pill>
        </div>
      </Card>

      <Card title="💡 پیشنهاد آزمایش‌های آزاد" icon="🧠">
        <ul className="list-inside list-disc space-y-1.5 text-sm leading-7 text-slate-300">
          <li>یک بار مثبت و یک بار منفی نزدیک هم بگذار، سپس ذره را در نزدیکی رها کن — مسیرش را با خط میدان مقایسه کن.</li>
          <li>دو سیم با جریان هم‌جهت و مخالف‌جهت بگذار و ببین حلقه‌های میدان چطور با هم برهم‌کنش دارند.</li>
          <li>یک بار و یک سیم را کنار هم بگذار و ذره را رها کن تا مسیر ترکیبی الکتریکی+مغناطیسی را ببینی (مارپیچ‌های نامنظم!).</li>
          <li>این محیط برای «کاوش آزاد» طراحی شده؛ اگر به دقت عددی نیاز داری، از آزمایشگاه‌های تخصصی (میدان الکتریکی، میدان مغناطیسی و ...) استفاده کن.</li>
        </ul>
      </Card>
    </div>
  );
}
