import { useRef, useState } from "react";
import { LabLayout } from "../components/LabLayout";
import { Button, EquationBox, Pill, Slider, Stat } from "../components/ui";
import { LineGraph } from "../components/Graph";
import { PredictQuestion } from "../components/Predict";
import { EPS0, fmt } from "../data/constants";

const CX = 320;
const CY = 190;

type Shape = "sphere" | "cube" | "cylinder";

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

export default function GaussLab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [shape, setShape] = useState<Shape>("sphere");
  const [radius, setRadius] = useState(90);
  const [halfSide, setHalfSide] = useState(80);
  const [cylR, setCylR] = useState(70);
  const [cylL, setCylL] = useState(120);
  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, x: CX - 20, y: CY, q: 6 },
    { id: 2, x: CX + 160, y: CY + 90, q: -4 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [dragId, setDragId] = useState<number | null>(null);

  function isEnclosed(c: Charge) {
    const dx = c.x - CX;
    const dy = c.y - CY;
    if (shape === "sphere") return Math.hypot(dx, dy) <= radius;
    if (shape === "cube") return Math.abs(dx) <= halfSide && Math.abs(dy) <= halfSide;
    return Math.abs(dx) <= cylL && Math.abs(dy) <= cylR;
  }

  const enclosedCharges = charges.filter(isEnclosed);
  const Qenc = enclosedCharges.reduce((s, c) => s + c.q, 0) * 1e-9;
  const flux = Qenc / EPS0;

  function addCharge(sign: 1 | -1) {
    setCharges((cs) => [...cs, { id: nextId, x: CX + (Math.random() - 0.5) * 300, y: CY + (Math.random() - 0.5) * 200, q: sign * 5 }]);
    setNextId((n) => n + 1);
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (dragId === null || !svgRef.current) return;
    const p = getSvgPoint(svgRef.current, e);
    setCharges((cs) => cs.map((c) => (c.id === dragId ? { ...c, x: p.x, y: p.y } : c)));
  }

  const graphPoints = Array.from({ length: 12 }, (_, i) => {
    const r = 20 + i * 15;
    const encQ = charges
      .filter((c) => {
        if (shape === "sphere") return Math.hypot(c.x - CX, c.y - CY) <= r;
        if (shape === "cube") return Math.abs(c.x - CX) <= r && Math.abs(c.y - CY) <= r;
        return Math.abs(c.x - CX) <= r * 1.3 && Math.abs(c.y - CY) <= r * 0.8;
      })
      .reduce((s, c) => s + c.q, 0) * 1e-9;
    return { x: r, y: encQ / EPS0 };
  });

  return (
    <LabLayout
      title="🌐 آزمایشگاه قانون گاوس"
      levelTag="سطح ۳ — Flux → Gauss's Law"
      subtitle="سطح گاوسی را بزرگ و کوچک کن، جابه‌جا نکن؛ ببین تا وقتی بار محصور تغییر نکند، شار کل هم تغییر نمی‌کند — حتی اگر شکل سطح عوض شود."
      headerExtra={
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => addCharge(1)}>＋ بار مثبت</Button>
          <Button variant="danger" onClick={() => addCharge(-1)}>− بار منفی</Button>
        </div>
      }
      simulation={
        <svg
          ref={svgRef}
          viewBox="0 0 640 380"
          className="w-full touch-none rounded-xl bg-slate-950"
          onPointerMove={onMove}
          onPointerUp={() => setDragId(null)}
          onPointerLeave={() => setDragId(null)}
        >
          {shape === "sphere" && <circle cx={CX} cy={CY} r={radius} fill="#38bdf8" fillOpacity={0.08} stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 4" />}
          {shape === "cube" && (
            <rect x={CX - halfSide} y={CY - halfSide} width={halfSide * 2} height={halfSide * 2} fill="#38bdf8" fillOpacity={0.08} stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 4" />
          )}
          {shape === "cylinder" && (
            <rect x={CX - cylL} y={CY - cylR} width={cylL * 2} height={cylR * 2} rx={cylR} fill="#38bdf8" fillOpacity={0.08} stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 4" />
          )}
          {charges.map((c) => {
            const enc = isEnclosed(c);
            return (
              <g key={c.id} onPointerDown={(e) => { e.stopPropagation(); setDragId(c.id); }} className="cursor-grab">
                <circle cx={c.x} cy={c.y} r={11} fill={c.q > 0 ? "#f43f5e" : "#3b82f6"} stroke={enc ? "#facc15" : "#fff"} strokeWidth={enc ? 3 : 1.5} />
                <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{c.q > 0 ? "+" : "−"}</text>
                <text
                  x={c.x + 16}
                  y={c.y + 20}
                  fontSize={9}
                  fill="#f87171"
                  onPointerDown={(e) => { e.stopPropagation(); setCharges((cs) => cs.filter((x) => x.id !== c.id)); }}
                >✕</text>
              </g>
            );
          })}
          <text x={CX} y={20} textAnchor="middle" fontSize={11} fill="#94a3b8">
            {shape === "sphere" ? "سطح گاوسی کروی" : shape === "cube" ? "سطح گاوسی مکعبی" : "سطح گاوسی استوانه‌ای"} — بارهای هاله‌دار زرد داخل سطح‌اند
          </text>
        </svg>
      }
      parameters={
        <>
          <div className="flex gap-1.5">
            {(["sphere", "cube", "cylinder"] as Shape[]).map((s) => (
              <Button key={s} active={shape === s} onClick={() => setShape(s)}>
                {s === "sphere" ? "کره" : s === "cube" ? "مکعب" : "استوانه"}
              </Button>
            ))}
          </div>
          {shape === "sphere" && <Slider label="شعاع سطح گاوسی" value={radius} min={20} max={190} step={5} unit="px" onChange={setRadius} color="sky" />}
          {shape === "cube" && <Slider label="نصف ضلع مکعب" value={halfSide} min={20} max={190} step={5} unit="px" onChange={setHalfSide} color="sky" />}
          {shape === "cylinder" && (
            <>
              <Slider label="شعاع استوانه" value={cylR} min={20} max={150} step={5} unit="px" onChange={setCylR} color="sky" />
              <Slider label="نصف طول استوانه" value={cylL} min={20} max={280} step={5} unit="px" onChange={setCylL} color="sky" />
            </>
          )}
          <p className="text-[11px] text-slate-500">بارها را با ماوس جابه‌جا کن؛ اندازهٔ سطح را تغییر بده بدون این‌که بارِ داخل تغییر کند و شار را ببین.</p>
        </>
      }
      measurements={
        <>
          <Stat label="تعداد بارهای محصور" value={String(enclosedCharges.length)} color="amber" />
          <Stat label="بار خالص محصور Q_enc" value={fmt(Qenc * 1e9, 3)} unit="nC" color="rose" />
          <Stat label="شار الکتریکی کل Φ_E" value={fmt(flux, 3)} unit="N·m²/C" color="sky" />
          <Pill color={flux === 0 ? "amber" : "emerald"}>{flux === 0 ? "شار خالص صفر — بار خالص محصور صفر است" : "شار غیرصفر متناسب با بار محصور"}</Pill>
        </>
      }
      equation={
        <div className="space-y-2">
          <EquationBox>Φ_E = ∮ E·dA</EquationBox>
          <EquationBox>Φ_E = Q_enc / ε₀</EquationBox>
          <p className="text-center text-xs text-slate-400">فقط بار محصور در شار نقش دارد؛ شکل و اندازهٔ سطح تأثیری در مقدار شار ندارد (تا زمانی‌که بار محصور تغییر نکند).</p>
        </div>
      }
      graph={
        <LineGraph
          points={graphPoints}
          xLabel="اندازهٔ سطح (px)"
          yLabel="Φ_E (N·m²/C)"
        />
      }
      extra={
        <PredictQuestion
          question="اگر شعاع کرهٔ گاوسی را دو برابر کنیم اما بار محصور همچنان همان یک بار باشد، شار کل Φ_E چه می‌شود؟"
          options={["دو برابر می‌شود", "چهار برابر می‌شود", "بدون تغییر می‌ماند", "نصف می‌شود"]}
          correctIndex={2}
          explanation="طبق قانون گاوس، Φ_E فقط به بار محصور بستگی دارد نه به اندازه یا شکل سطح؛ با اسلایدر شعاع را عوض کن و ببین Φ_E ثابت می‌ماند."
        />
      }
      learned={
        <ul className="list-inside list-disc space-y-1">
          <li>شار الکتریکی کل از یک سطح بسته فقط به بار خالص محصور در آن سطح بستگی دارد، نه به شکل یا اندازهٔ سطح.</li>
          <li>بارهای بیرون سطح در شار خالص هیچ سهمی ندارند (اگرچه ممکن است در نقاط مختلف سطح میدان ایجاد کنند، اثر آن‌ها روی کل سطح خنثی می‌شود).</li>
          <li>قانون گاوس یک قانون کلی است و مستقل از تقارن برقرار است، اما فقط در حالت‌های متقارن (کروی، استوانه‌ای، صفحه‌ای) به‌راحتی برای محاسبهٔ E به‌کار می‌رود.</li>
        </ul>
      }
      misconceptions={[
        "شار الکتریکی با میدان الکتریکی یکی نیست: شار مجموع اثر میدان روی کل سطح است، نه مقدار میدان در یک نقطه.",
        "افزایش اندازهٔ سطح گاوسی به‌تنهایی شار را تغییر نمی‌دهد؛ فقط تغییر بار محصور شار را تغییر می‌دهد.",
        "قانون گاوس همیشه درست است، اما فقط در آرایش‌های متقارن می‌توان از آن برای محاسبهٔ مستقیم E استفاده کرد.",
        "بارهای خارج از سطح گاوسی حتی اگر میدان قوی در نزدیکی سطح ایجاد کنند، سهم خالص صفر در شار کل دارند.",
      ]}
    />
  );
}
