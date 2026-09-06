import { useCallback, useRef, type PointerEvent as RPointerEvent, type DragEvent } from "react";
import type { LabApi } from "../lab/useLab";
import { CANVAS_H, CANVAS_W, type HitEvent, type LabObject, type ObjKind, type Vec } from "../lab/types";
import { angleOf, dirFromAngle, dist, plateEnds, rectOf } from "../lab/physics";
import { deg } from "../lab/format";

interface Props {
  lab: LabApi;
  showAngles?: boolean;
  showFocus?: boolean;
  autoProtractor?: boolean;
  allowDrop?: boolean;
  className?: string;
}

const RAY_COLORS = ["#ffe14d", "#ffb347", "#ff8fa3", "#b6ff6b", "#7de0ff", "#e0aaff", "#ffd166"];

const HANDLE: Record<ObjKind, { off: number; r: (o: LabObject) => number } | null> = {
  source: { off: -90, r: () => 46 },
  mirror: { off: 0, r: (o) => (o.length ?? 120) / 2 + 24 },
  convex: { off: 0, r: (o) => (o.length ?? 120) / 2 + 24 },
  concave: { off: 0, r: (o) => (o.length ?? 120) / 2 + 24 },
  glass: null,
  water: null,
  target: null,
  protractor: null,
};

function arcPath(c: Vec, r: number, fromDeg: number, toDeg: number) {
  let delta = ((toDeg - fromDeg + 540) % 360) - 180;
  const a1 = (fromDeg * Math.PI) / 180;
  const a2 = ((fromDeg + delta) * Math.PI) / 180;
  const p1 = { x: c.x + r * Math.cos(a1), y: c.y + r * Math.sin(a1) };
  const p2 = { x: c.x + r * Math.cos(a2), y: c.y + r * Math.sin(a2) };
  const sweep = delta > 0 ? 1 : 0;
  return { d: `M${p1.x},${p1.y} A${r},${r} 0 0 ${sweep} ${p2.x},${p2.y}`, mid: fromDeg + delta / 2 };
}

export default function LabCanvas({ lab, showAngles, showFocus, autoProtractor, allowDrop = true, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; mode: "move" | "rotate"; dx: number; dy: number; off: number } | null>(null);
  const { objects, trace, selectedId, setSelectedId, update, showRays } = lab;

  const toSvg = useCallback((clientX: number, clientY: number): Vec => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }, []);

  const startMove = (e: RPointerEvent, o: LabObject) => {
    e.stopPropagation();
    setSelectedId(o.id);
    if (o.movable === false) return;
    const p = toSvg(e.clientX, e.clientY);
    drag.current = { id: o.id, mode: "move", dx: o.x - p.x, dy: o.y - p.y, off: 0 };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const startRotate = (e: RPointerEvent, o: LabObject, off: number) => {
    e.stopPropagation();
    setSelectedId(o.id);
    drag.current = { id: o.id, mode: "rotate", dx: 0, dy: 0, off };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toSvg(e.clientX, e.clientY);
    const o = objects.find((x) => x.id === d.id);
    if (!o) return;
    if (d.mode === "move") {
      const x = Math.min(CANVAS_W - 10, Math.max(10, p.x + d.dx));
      const y = Math.min(CANVAS_H - 10, Math.max(10, p.y + d.dy));
      update(o.id, { x, y });
    } else {
      const a = angleOf({ x: p.x - o.x, y: p.y - o.y }) - d.off;
      const snapped = e.shiftKey ? Math.round(a / 5) * 5 : Math.round(a);
      update(o.id, { angle: ((snapped % 360) + 360) % 360 });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("tool") as ObjKind;
    if (!kind || !allowDrop) return;
    const p = toSvg(e.clientX, e.clientY);
    lab.add(kind, Math.min(CANVAS_W - 40, Math.max(40, p.x)), Math.min(CANVAS_H - 40, Math.max(40, p.y)));
  };

  // protractor placement
  const reflectEvents = trace.events.filter((e) => e.type === "reflect");
  const protractors: { c: Vec; normal: Vec; ev: HitEvent | null; id: string | null }[] = [];
  const firstHit = trace.firstMirrorHit;
  if (autoProtractor && firstHit) protractors.push({ c: firstHit.point, normal: firstHit.normal, ev: firstHit, id: null });
  for (const o of objects.filter((x) => x.kind === "protractor")) {
    let near: HitEvent | null = null;
    let best = 80;
    for (const ev of reflectEvents) {
      const d = dist(ev.point, o);
      if (d < best) {
        best = d;
        near = ev;
      }
    }
    if (near) protractors.push({ c: near.point, normal: near.normal, ev: near, id: o.id });
    else protractors.push({ c: { x: o.x, y: o.y }, normal: { x: 0, y: -1 }, ev: null, id: o.id });
  }

  return (
    <div
      className={`relative rounded-[28px] bg-gradient-to-b from-[#b5722e] via-[#a5631f] to-[#7c4a15] p-3 shadow-[0_12px_0_#5c3610,0_20px_30px_rgba(0,0,0,0.25)] ${className ?? ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="lab-svg block h-auto w-full rounded-[18px]"
        style={{ direction: "ltr" }}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerDown={() => setSelectedId(null)}
      >
        <defs>
          <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1437" />
            <stop offset="1" stopColor="#1a1f5c" />
          </linearGradient>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="#ffffff" strokeOpacity="0.07" />
          </pattern>
          <linearGradient id="mirrorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="0.5" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0284c7" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a5f3fc" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="focusGlow">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.4" stopColor="#ffe14d" />
            <stop offset="1" stopColor="#ffe14d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff7ae" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff7ae" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#bench)" />
        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

        {/* media blocks */}
        {objects
          .filter((o) => o.kind === "water" || o.kind === "glass")
          .map((o) => {
            const r = rectOf(o);
            const w = r.x1 - r.x0;
            const h = r.y1 - r.y0;
            const sel = o.id === selectedId;
            return (
              <g key={o.id} onPointerDown={(e) => startMove(e, o)} className="cursor-grab active:cursor-grabbing">
                {o.kind === "water" ? (
                  <>
                    <rect x={r.x0 - 4} y={r.y0 - 22} width={w + 8} height={h + 26} rx="6" fill="#ffffff" fillOpacity="0.08" stroke="#cbd5e1" strokeWidth="3" />
                    <rect x={r.x0} y={r.y0} width={w} height={h} fill="url(#waterGrad)" />
                    <path d={`M${r.x0},${r.y0} q${w / 8},-6 ${w / 4},0 t${w / 4},0 t${w / 4},0 t${w / 4},0`} fill="none" stroke="#bae6fd" strokeWidth="2.5" />
                    {o.showPencil && (
                      <g>
                        {/* pencil above water */}
                        <line x1={r.x0 + 40} y1={r.y0 - 70} x2={r.x0 + 64} y2={r.y0} stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />
                        <line x1={r.x0 + 40} y1={r.y0 - 70} x2={r.x0 + 46} y2={r.y0 - 52} stroke="#f472b6" strokeWidth="10" strokeLinecap="round" />
                        {/* pencil under water (appears shifted / broken) */}
                        <line x1={r.x0 + 78} y1={r.y0 + 2} x2={r.x0 + 98} y2={r.y0 + h - 14} stroke="#fcd34d" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
                        <path d={`M${r.x0 + 98},${r.y0 + h - 14} l6,14 l-14,-6z`} fill="#1f2937" />
                        <text x={r.x0 + w / 2 + 20} y={r.y0 + h / 2 + 4} fontSize="13" fill="#e0f2fe" textAnchor="middle" fontFamily="Vazirmatn">
                          مداد شکسته دیده می‌شود!
                        </text>
                      </g>
                    )}
                    <text x={r.x0 + 6} y={r.y1 - 8} fontSize="22">💧</text>
                  </>
                ) : (
                  <>
                    <rect x={r.x0} y={r.y0} width={w} height={h} rx="4" fill="url(#glassGrad)" stroke="#e0f2fe" strokeWidth="3" />
                    <line x1={r.x0 + 10} y1={r.y0 + 20} x2={r.x0 + 30} y2={r.y0 + 8} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                    <text x={r.x0 + 6} y={r.y1 - 8} fontSize="22">🧊</text>
                  </>
                )}
                {sel && <rect x={r.x0 - 8} y={r.y0 - 28} width={w + 16} height={h + 36} rx="10" fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />}
              </g>
            );
          })}

        {/* rays */}
        {showRays &&
          trace.segments.map((s, i) => {
            const color = RAY_COLORS[s.rayIndex % RAY_COLORS.length];
            const inMedium = s.medium !== "air";
            return (
              <g key={i}>
                <line x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={inMedium ? "#7dd3fc" : color} strokeWidth="12" strokeOpacity="0.22" strokeLinecap="round" />
                <line x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={color} strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
                <line x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" className="ray-flow" />
              </g>
            );
          })}

        {/* mirrors */}
        {objects
          .filter((o) => o.kind === "mirror")
          .map((o) => {
            const [a, b] = plateEnds(o);
            const sel = o.id === selectedId;
            return (
              <g key={o.id} onPointerDown={(e) => startMove(e, o)} className={o.movable === false ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#mirrorGrad)" strokeWidth="10" strokeLinecap="round" />
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" strokeDasharray="10 14" />
                <text x={o.x} y={o.y - 20} textAnchor="middle" fontSize="18">🪞</text>
                {sel && (
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fb923c" strokeWidth="24" strokeOpacity="0.35" strokeLinecap="round" />
                )}
              </g>
            );
          })}

        {/* lenses */}
        {objects
          .filter((o) => o.kind === "convex" || o.kind === "concave")
          .map((o) => {
            const L = o.length ?? 120;
            const h = L / 2;
            const sel = o.id === selectedId;
            const path =
              o.kind === "convex"
                ? `M0,${-h} Q26,0 0,${h} Q-26,0 0,${-h}`
                : `M-12,${-h} L12,${-h} Q2,0 12,${h} L-12,${h} Q-2,0 -12,${-h}`;
            return (
              <g
                key={o.id}
                transform={`translate(${o.x},${o.y}) rotate(${o.angle - 90})`}
                onPointerDown={(e) => startMove(e, o)}
                className="cursor-grab active:cursor-grabbing"
              >
                <path d={path} fill="#7dd3fc" fillOpacity="0.45" stroke="#e0f2fe" strokeWidth="3" />
                <path d={o.kind === "convex" ? `M-4,${-h + 20} Q-16,0 -4,${h - 20}` : `M-8,${-h + 16} L-8,${h - 16}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
                <text x="0" y={-h - 10} textAnchor="middle" fontSize="18">{o.kind === "convex" ? "🔍" : "🔎"}</text>
                {sel && <ellipse cx="0" cy="0" rx="34" ry={h + 10} fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />}
              </g>
            );
          })}

        {/* targets */}
        {objects
          .filter((o) => o.kind === "target")
          .map((o) => {
            const hit = trace.targetsHit.has(o.id);
            const r = o.r ?? 26;
            const sel = o.id === selectedId;
            return (
              <g key={o.id} onPointerDown={(e) => startMove(e, o)} className={o.movable === false ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}>
                {hit && <circle cx={o.x} cy={o.y} r={r + 22} fill="url(#focusGlow)" className="pulse-glow" />}
                <circle cx={o.x} cy={o.y} r={r} fill={hit ? "#fde047" : "#ef4444"} stroke="#fff" strokeWidth="4" />
                <circle cx={o.x} cy={o.y} r={r * 0.6} fill={hit ? "#facc15" : "#fff"} />
                <circle cx={o.x} cy={o.y} r={r * 0.25} fill={hit ? "#f59e0b" : "#ef4444"} />
                <text x={o.x} y={o.y - r - 8} textAnchor="middle" fontSize="22">{hit ? "🌟" : "⭐"}</text>
                {sel && <circle cx={o.x} cy={o.y} r={r + 10} fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />}
              </g>
            );
          })}

        {/* angle overlays */}
        {showAngles &&
          reflectEvents.slice(0, 3).map((ev, i) => {
            const nAng = angleOf(ev.normal);
            const inAng = angleOf({ x: -ev.inDir.x, y: -ev.inDir.y });
            const outAng = angleOf(ev.outDir);
            const a1 = arcPath(ev.point, 40, nAng, inAng);
            const a2 = arcPath(ev.point, 50, nAng, outAng);
            const l1 = dirFromAngle(a1.mid);
            const l2 = dirFromAngle(a2.mid);
            const nEnd = { x: ev.point.x + ev.normal.x * 90, y: ev.point.y + ev.normal.y * 90 };
            const nEnd2 = { x: ev.point.x - ev.normal.x * 40, y: ev.point.y - ev.normal.y * 40 };
            return (
              <g key={i} pointerEvents="none">
                <line x1={nEnd2.x} y1={nEnd2.y} x2={nEnd.x} y2={nEnd.y} stroke="#fff" strokeWidth="2" strokeDasharray="6 6" opacity="0.9" />
                <text x={nEnd.x + ev.normal.x * 10} y={nEnd.y + ev.normal.y * 10 + 5} fontSize="13" fill="#fff" textAnchor="middle" fontFamily="Vazirmatn">
                  خط عمود
                </text>
                <path d={a1.d} fill="none" stroke="#4ade80" strokeWidth="4" />
                <path d={a2.d} fill="none" stroke="#60a5fa" strokeWidth="4" />
                <g transform={`translate(${ev.point.x + l1.x * 66},${ev.point.y + l1.y * 66})`}>
                  <rect x="-24" y="-13" width="48" height="26" rx="8" fill="#16a34a" />
                  <text y="5" fontSize="15" fill="#fff" textAnchor="middle" fontWeight="bold" fontFamily="Vazirmatn">{deg(ev.incidence)}</text>
                </g>
                <g transform={`translate(${ev.point.x + l2.x * 78},${ev.point.y + l2.y * 78})`}>
                  <rect x="-24" y="-13" width="48" height="26" rx="8" fill="#2563eb" />
                  <text y="5" fontSize="15" fill="#fff" textAnchor="middle" fontWeight="bold" fontFamily="Vazirmatn">{deg(ev.outAngle)}</text>
                </g>
              </g>
            );
          })}

        {/* refraction markers */}
        {showAngles &&
          trace.events
            .filter((e) => e.type === "refract" || e.type === "tir")
            .slice(0, 4)
            .map((ev, i) => {
              const nEnd = { x: ev.point.x + ev.normal.x * 50, y: ev.point.y + ev.normal.y * 50 };
              const nEnd2 = { x: ev.point.x - ev.normal.x * 50, y: ev.point.y - ev.normal.y * 50 };
              return (
                <g key={`r${i}`} pointerEvents="none">
                  <line x1={nEnd2.x} y1={nEnd2.y} x2={nEnd.x} y2={nEnd.y} stroke="#fff" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7" />
                  <circle cx={ev.point.x} cy={ev.point.y} r="6" fill="#fff" stroke="#38bdf8" strokeWidth="3" />
                  <text x={ev.point.x + 12} y={ev.point.y - 10} fontSize="13" fill="#bae6fd" fontFamily="Vazirmatn">
                    {ev.type === "tir" ? "بازتاب کامل!" : "اینجا نور شکست"}
                  </text>
                </g>
              );
            })}

        {/* protractors */}
        {protractors.map((pr, i) => {
          const rot = angleOf(pr.normal) + 90;
          const R = 78;
          const ticks = [];
          for (let a = -90; a <= 90; a += 10) {
            const ar = (a * Math.PI) / 180;
            const big = a % 30 === 0;
            const r1 = big ? R - 16 : R - 9;
            ticks.push(
              <g key={a}>
                <line x1={r1 * Math.sin(ar)} y1={-r1 * Math.cos(ar)} x2={R * Math.sin(ar)} y2={-R * Math.cos(ar)} stroke="#1e3a8a" strokeWidth={big ? 2 : 1} />
                {big && (
                  <text x={(R - 26) * Math.sin(ar)} y={-(R - 26) * Math.cos(ar) + 4} fontSize="10" textAnchor="middle" fill="#1e3a8a" fontWeight="bold">
                    {deg(Math.abs(a))}
                  </text>
                )}
              </g>,
            );
          }
          const obj = pr.id ? objects.find((o) => o.id === pr.id) : null;
          return (
            <g
              key={`p${i}`}
              transform={`translate(${pr.c.x},${pr.c.y}) rotate(${rot})`}
              onPointerDown={obj ? (e) => startMove(e, obj) : undefined}
              className={obj ? "cursor-grab active:cursor-grabbing" : ""}
              opacity={0.92}
            >
              <path d={`M${-R},0 A${R},${R} 0 0 1 ${R},0 Z`} fill="#fef3c7" fillOpacity="0.85" stroke="#d97706" strokeWidth="2.5" />
              <line x1="0" y1="0" x2="0" y2={-R + 4} stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="4" fill="#d97706" />
              {ticks}
              <text x="0" y="-R - 8" fontSize="14" textAnchor="middle">📐</text>
              {pr.id === selectedId && <path d={`M${-R - 6},6 A${R + 6},${R + 6} 0 0 1 ${R + 6},6 Z`} fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />}
            </g>
          );
        })}

        {/* sources */}
        {objects
          .filter((o) => o.kind === "source")
          .map((o) => {
            const sel = o.id === selectedId;
            return (
              <g key={o.id} transform={`translate(${o.x},${o.y}) rotate(${o.angle})`} onPointerDown={(e) => startMove(e, o)} className={o.movable === false ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}>
                {showRays && <path d="M0,-18 L70,-46 L70,46 L0,18Z" fill="url(#cone)" />}
                <rect x="-84" y="-13" width="66" height="26" rx="8" fill="#f97316" stroke="#9a3412" strokeWidth="2.5" />
                <rect x="-70" y="-6" width="22" height="12" rx="4" fill="#fdba74" />
                <path d="M-20,-15 L0,-22 L0,22 L-20,15 Z" fill="#facc15" stroke="#9a3412" strokeWidth="2.5" />
                <rect x="-3" y="-20" width="5" height="40" rx="2" fill="#fffbeb" />
                <text x="-52" y="-20" fontSize="18" textAnchor="middle" transform={`rotate(${-o.angle} -52 -26)`}>🔦</text>
                {sel && <rect x="-92" y="-30" width="100" height="60" rx="14" fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />}
              </g>
            );
          })}

        {/* focus point */}
        {showFocus && trace.focusPoint && (
          <g pointerEvents="none">
            <circle cx={trace.focusPoint.x} cy={trace.focusPoint.y} r="34" fill="url(#focusGlow)" className="pulse-glow" />
            <circle cx={trace.focusPoint.x} cy={trace.focusPoint.y} r="6" fill="#fff" />
            <g transform={`translate(${trace.focusPoint.x},${trace.focusPoint.y + 52})`}>
              <rect x="-62" y="-14" width="124" height="28" rx="10" fill="#7c3aed" />
              <text y="6" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold" fontFamily="Vazirmatn">✨ نقطه تمرکز نور</text>
            </g>
          </g>
        )}

        {/* rotation handle for selected */}
        {objects
          .filter((o) => o.id === selectedId && o.rotatable !== false && HANDLE[o.kind])
          .map((o) => {
            const h = HANDLE[o.kind]!;
            const d = dirFromAngle(o.angle + h.off);
            const R = h.r(o);
            const hx = o.x + d.x * R;
            const hy = o.y + d.y * R;
            return (
              <g key={`h${o.id}`} onPointerDown={(e) => startRotate(e, o, h.off)} className="cursor-alias">
                <line x1={o.x} y1={o.y} x2={hx} y2={hy} stroke="#fb923c" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx={hx} cy={hy} r="15" fill="#fb923c" stroke="#fff" strokeWidth="3" />
                <text x={hx} y={hy + 6} fontSize="17" textAnchor="middle" fill="#fff" fontWeight="bold">↻</text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
