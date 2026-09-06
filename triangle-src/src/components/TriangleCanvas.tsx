import { useCallback, useMemo, useRef, useState } from "react";
import {
  CANVAS_H_CM,
  CANVAS_W_CM,
  SCALE,
  clampPoint,
  computeStats,
  fmt,
  type Point,
  type Triangle,
} from "../lib/geometry";

type VertexKey = "A" | "B" | "C";

interface Props {
  triangle: Triangle;
  onChange: (t: Triangle) => void;
  showHeight?: boolean;
  showAngles?: boolean;
  showSides?: boolean;
  fillColor?: string;
  label?: string;
  compact?: boolean;
  onDragEnd?: () => void;
  /** رأس‌هایی که فعلاً قفل هستند و جابه‌جا نمی‌شوند */
  locked?: VertexKey[];
}

const VERTEX_STYLE: Record<VertexKey, { color: string; glow: string }> = {
  A: { color: "#ef4444", glow: "#fca5a5" },
  B: { color: "#3b82f6", glow: "#93c5fd" },
  C: { color: "#22c55e", glow: "#86efac" },
};

const W = CANVAS_W_CM * SCALE;
const H = CANVAS_H_CM * SCALE;

const px = (p: Point) => ({ x: p.x * SCALE, y: p.y * SCALE });

function unit(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
}

/** مسیر کمان زاویه در رأس v بین ضلع‌های v→p و v→q */
function anglePath(v: Point, p: Point, q: Point, r: number): string {
  const u1 = unit(v, p);
  const u2 = unit(v, q);
  const s = { x: v.x + u1.x * r, y: v.y + u1.y * r };
  const e = { x: v.x + u2.x * r, y: v.y + u2.y * r };
  const cross = u1.x * u2.y - u1.y * u2.x;
  const sweep = cross > 0 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 ${sweep} ${e.x} ${e.y}`;
}

/** مربع کوچک برای نشان دادن زاویه ۹۰ درجه */
function rightAnglePath(v: Point, p: Point, q: Point, r: number): string {
  const u1 = unit(v, p);
  const u2 = unit(v, q);
  const a = { x: v.x + u1.x * r, y: v.y + u1.y * r };
  const b = { x: v.x + (u1.x + u2.x) * r, y: v.y + (u1.y + u2.y) * r };
  const c = { x: v.x + u2.x * r, y: v.y + u2.y * r };
  return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`;
}

export default function TriangleCanvas({
  triangle,
  onChange,
  showHeight = true,
  showAngles = true,
  showSides = true,
  fillColor = "#fbbf24",
  label,
  compact = false,
  onDragEnd,
  locked = [],
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<VertexKey | null>(null);
  const stats = useMemo(() => computeStats(triangle), [triangle]);

  const toCm = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return clampPoint({ x: loc.x / SCALE, y: loc.y / SCALE });
  }, []);

  const handleDown = (key: VertexKey) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (locked.includes(key)) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(key);
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const p = toCm(e.clientX, e.clientY);
    onChange({ ...triangle, [dragging]: p });
  };
  const handleUp = () => {
    if (dragging) {
      setDragging(null);
      onDragEnd?.();
    }
  };

  const A = px(triangle.A);
  const B = px(triangle.B);
  const C = px(triangle.C);
  const centroid = {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3,
  };
  const foot = px(stats.foot);
  // آیا پای ارتفاع بیرون از پاره‌خط BC است؟
  const bcLen2 = (C.x - B.x) ** 2 + (C.y - B.y) ** 2 || 1;
  const tFoot =
    ((foot.x - B.x) * (C.x - B.x) + (foot.y - B.y) * (C.y - B.y)) / bcLen2;
  const footOutside = tFoot < 0 || tFoot > 1;
  const nearestBase = tFoot < 0 ? B : C;

  // برچسب ضلع: وسط ضلع، کمی به سمت بیرون
  const sideLabel = (p: Point, q: Point, text: string, color: string) => {
    const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    const out = unit(centroid, mid);
    const pos = { x: mid.x + out.x * 22, y: mid.y + out.y * 22 };
    return (
      <g key={text}>
        <rect
          x={pos.x - 40}
          y={pos.y - 13}
          width={80}
          height={26}
          rx={13}
          fill="white"
          stroke={color}
          strokeWidth={2}
          opacity={0.95}
        />
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={color}
        >
          {text}
        </text>
      </g>
    );
  };

  const angleLabel = (v: Point, deg: number, color: string) => {
    const inward = unit(v, centroid);
    const pos = { x: v.x + inward.x * 46, y: v.y + inward.y * 46 };
    return (
      <text
        x={pos.x}
        y={pos.y + 5}
        textAnchor="middle"
        fontSize={15}
        fontWeight={800}
        fill={color}
        stroke="white"
        strokeWidth={3}
        paintOrder="stroke"
      >
        {fmt(deg, 0)}°
      </text>
    );
  };

  const vertex = (key: VertexKey, p: Point) => {
    const st = VERTEX_STYLE[key];
    const out = unit(centroid, p);
    const namePos = { x: p.x + out.x * 28, y: p.y + out.y * 28 };
    const isDrag = dragging === key;
    const isLocked = locked.includes(key);
    return (
      <g key={key}>
        {isDrag && (
          <circle cx={p.x} cy={p.y} r={26} fill={st.glow} opacity={0.5} />
        )}
        <circle
          cx={p.x}
          cy={p.y}
          r={isDrag ? 17 : 14}
          fill={st.color}
          stroke="white"
          strokeWidth={4}
          style={{
            cursor: "grab",
            transition: "r 0.15s",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
          onPointerDown={handleDown(key)}
          className="touch-none"
        />
        {/* ناحیه لمس بزرگ‌تر برای تبلت */}
        <circle
          cx={p.x}
          cy={p.y}
          r={30}
          fill="transparent"
          style={{ cursor: "grab" }}
          onPointerDown={handleDown(key)}
          className="touch-none"
        />
        <text
          x={namePos.x}
          y={namePos.y + 7}
          textAnchor="middle"
          fontSize={20}
          fontWeight={900}
          fill={st.color}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
          style={{ pointerEvents: "none" }}
        >
          {key}
        </text>
        {isLocked && (
          <text
            x={p.x}
            y={p.y + 5}
            textAnchor="middle"
            fontSize={14}
            style={{ pointerEvents: "none" }}
          >
            🔒
          </text>
        )}
      </g>
    );
  };

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= CANVAS_W_CM; i++) {
      lines.push(
        <line
          key={`v${i}`}
          x1={i * SCALE}
          y1={0}
          x2={i * SCALE}
          y2={H}
          stroke="#c7d2fe"
          strokeWidth={i % 5 === 0 ? 1.2 : 0.6}
        />,
      );
    }
    for (let j = 0; j <= CANVAS_H_CM; j++) {
      lines.push(
        <line
          key={`h${j}`}
          x1={0}
          y1={j * SCALE}
          x2={W}
          y2={j * SCALE}
          stroke="#c7d2fe"
          strokeWidth={j % 5 === 0 ? 1.2 : 0.6}
        />,
      );
    }
    return lines;
  }, []);

  const arcR = compact ? 22 : 28;
  const isRightAt = (deg: number) => Math.abs(deg - 90) < 2;

  return (
    <div className="relative w-full select-none">
      {label && (
        <div className="absolute top-2 right-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-indigo-700 shadow">
          {label}
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-3xl bg-gradient-to-br from-indigo-50 to-sky-50 shadow-inner border-4 border-white touch-none"
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        <defs>
          <linearGradient id={`fill-${fillColor.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.85} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <g opacity={0.6}>{gridLines}</g>

        {/* بدنه مثلث */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill={`url(#fill-${fillColor.replace("#", "")})`}
          stroke="#4f46e5"
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* قاعده با رنگ متفاوت */}
        {showHeight && (
          <>
            <line
              x1={B.x}
              y1={B.y}
              x2={C.x}
              y2={C.y}
              stroke="#f97316"
              strokeWidth={6}
              strokeLinecap="round"
            />
            {/* امتداد قاعده اگر پای ارتفاع بیرون بیفتد */}
            {footOutside && (
              <line
                x1={nearestBase.x}
                y1={nearestBase.y}
                x2={foot.x}
                y2={foot.y}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="4 4"
                opacity={0.7}
              />
            )}
            {/* خط ارتفاع */}
            <line
              x1={A.x}
              y1={A.y}
              x2={foot.x}
              y2={foot.y}
              stroke="#0ea5e9"
              strokeWidth={4}
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
            <path
              d={rightAnglePath(foot, A, B, 12)}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth={2}
            />
            <circle cx={foot.x} cy={foot.y} r={5} fill="#0ea5e9" />
          </>
        )}

        {/* کمان زاویه‌ها */}
        {showAngles &&
          stats.type !== "degenerate" &&
          (
            [
              ["A", A, B, C, stats.angA],
              ["B", B, A, C, stats.angB],
              ["C", C, A, B, stats.angC],
            ] as const
          ).map(([k, v, p, q, deg]) => (
            <path
              key={k}
              d={
                isRightAt(deg)
                  ? rightAnglePath(v, p, q, arcR * 0.7)
                  : anglePath(v, p, q, arcR)
              }
              fill={isRightAt(deg) ? "rgba(249,115,22,0.25)" : "none"}
              stroke={VERTEX_STYLE[k].color}
              strokeWidth={3}
            />
          ))}

        {/* برچسب ضلع‌ها */}
        {showSides && (
          <>
            {sideLabel(A, B, `AB = ${fmt(stats.AB)}`, "#7c3aed")}
            {sideLabel(B, C, `BC = ${fmt(stats.BC)}`, showHeight ? "#ea580c" : "#7c3aed")}
            {sideLabel(A, C, `AC = ${fmt(stats.AC)}`, "#7c3aed")}
          </>
        )}

        {/* برچسب زاویه‌ها */}
        {showAngles && stats.type !== "degenerate" && (
          <>
            {angleLabel(A, stats.angA, VERTEX_STYLE.A.color)}
            {angleLabel(B, stats.angB, VERTEX_STYLE.B.color)}
            {angleLabel(C, stats.angC, VERTEX_STYLE.C.color)}
          </>
        )}

        {/* برچسب ارتفاع */}
        {showHeight && stats.height > 0.3 && (
          <text
            x={(A.x + foot.x) / 2 + 14}
            y={(A.y + foot.y) / 2}
            fontSize={13}
            fontWeight={800}
            fill="#0284c7"
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            textAnchor="start"
          >
            ارتفاع {fmt(stats.height)}
          </text>
        )}

        {vertex("A", A)}
        {vertex("B", B)}
        {vertex("C", C)}
      </svg>
      <p className="mt-2 text-center text-xs sm:text-sm text-indigo-500 font-bold">
        ✋ نقطه‌های رنگی را بگیر و بکش! (هر خانه = ۱ سانتی‌متر)
      </p>
    </div>
  );
}
