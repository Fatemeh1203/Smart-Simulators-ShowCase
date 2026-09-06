import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Point } from "../types";
import { equationFromMB, formatNum, intercept, round, slope, slopeKind, snap } from "../math";

export type PlaneLine = {
  id: string;
  a: string;
  b?: string;
  m?: number;
  intercept?: number;
  color: string;
  dashed?: boolean;
};

type Props = {
  points: Point[];
  onPointsChange?: (pts: Point[]) => void;
  lines?: PlaneLine[];
  showGrid?: boolean;
  showTriangle?: boolean;
  triangleFrom?: [string, string];
  readOnly?: boolean;
  snapTo?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  highlightIds?: string[];
  showCoords?: boolean;
  className?: string;
  onViewChange?: (v: { xMin: number; xMax: number; yMin: number; yMax: number }) => void;
};

export function CoordinatePlane({
  points,
  onPointsChange,
  lines = [],
  showGrid = true,
  showTriangle = false,
  triangleFrom,
  readOnly = false,
  snapTo = 0.5,
  xMin = -8,
  xMax = 8,
  yMin = -6,
  yMax = 6,
  highlightIds = [],
  showCoords = true,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 640, h: 420 });
  const [dragId, setDragId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const pad = 36;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(280, r.width), h: Math.max(260, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  const toScreen = useCallback(
    (x: number, y: number) => {
      const sx = pad + ((x - xMin) / (xMax - xMin)) * (w - 2 * pad);
      const sy = h - pad - ((y - yMin) / (yMax - yMin)) * (h - 2 * pad);
      return { sx, sy };
    },
    [w, h, xMin, xMax, yMin, yMax]
  );

  const toWorld = useCallback(
    (sx: number, sy: number) => {
      const x = xMin + ((sx - pad) / (w - 2 * pad)) * (xMax - xMin);
      const y = yMin + ((h - pad - sy) / (h - 2 * pad)) * (yMax - yMin);
      return { x, y };
    },
    [w, h, xMin, xMax, yMin, yMax]
  );

  const movePoint = (id: string, sx: number, sy: number) => {
    if (!onPointsChange) return;
    let { x, y } = toWorld(sx, sy);
    x = Math.min(xMax - 0.2, Math.max(xMin + 0.2, snap(x, snapTo)));
    y = Math.min(yMax - 0.2, Math.max(yMin + 0.2, snap(y, snapTo)));
    onPointsChange(points.map((p) => (p.id === id ? { ...p, x: round(x, 2), y: round(y, 2) } : p)));
  };

  useEffect(() => {
    if (!dragId) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      const { sx, sy } = (() => {
        const svg = svgRef.current;
        if (!svg) return { sx: 0, sy: 0 };
        const r = svg.getBoundingClientRect();
        return { sx: ((e.clientX - r.left) / r.width) * w, sy: ((e.clientY - r.top) / r.height) * h };
      })();
      movePoint(dragId, sx, sy);
    };
    const up = () => setDragId(null);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragId, w, h, points, onPointsChange]);

  const ticksX = useMemo(() => {
    const arr: number[] = [];
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) arr.push(x);
    return arr;
  }, [xMin, xMax]);
  const ticksY = useMemo(() => {
    const arr: number[] = [];
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) arr.push(y);
    return arr;
  }, [yMin, yMax]);

  const origin = toScreen(0, 0);

  const lineSeg = (ln: PlaneLine) => {
    const pa = points.find((p) => p.id === ln.a);
    const pb = ln.b ? points.find((p) => p.id === ln.b) : undefined;
    let m = ln.m;
    let b = ln.intercept;
    if (pa && pb) {
      m = slope(pa.x, pa.y, pb.x, pb.y) ?? undefined;
      b = intercept(m ?? null, pa.x, pa.y) ?? undefined;
    }
    if (pa && !pb && m === undefined) {
      return null;
    }
    if (m === undefined && pa && !pb) return null;
    if (m === undefined && b === undefined && pa && pb) {
      const p1 = toScreen(pa.x, pa.y);
      const p2 = toScreen(pb.x, pb.y);
      const dx = p2.sx - p1.sx;
      const dy = p2.sy - p1.sy;
      const k = 40;
      return {
        x1: p1.sx - dx * k,
        y1: p1.sy - dy * k,
        x2: p2.sx + dx * k,
        y2: p2.sy + dy * k,
        color: ln.color,
        dashed: ln.dashed,
        vertical: Math.abs(pb.x - pa.x) < 1e-9,
      };
    }
    if (m === undefined || (m === null as unknown as number)) {
      const x = pa ? pa.x : 0;
      const p1 = toScreen(x, yMin);
      const p2 = toScreen(x, yMax);
      return { x1: p1.sx, y1: p1.sy, x2: p2.sx, y2: p2.sy, color: ln.color, dashed: ln.dashed, vertical: true };
    }
    const mm = m as number;
    const bb = b ?? 0;
    const p1 = toScreen(xMin, mm * xMin + bb);
    const p2 = toScreen(xMax, mm * xMax + bb);
    return { x1: p1.sx, y1: p1.sy, x2: p2.sx, y2: p2.sy, color: ln.color, dashed: ln.dashed, vertical: false };
  };

  const tri = (() => {
    if (!showTriangle) return null;
    const ids = triangleFrom ?? (points.length >= 2 ? [points[0].id, points[1].id] : null);
    if (!ids) return null;
    const a = points.find((p) => p.id === ids[0]);
    const b = points.find((p) => p.id === ids[1]);
    if (!a || !b) return null;
    const left = a.x <= b.x ? a : b;
    const right = a.x <= b.x ? b : a;
    const c = { x: right.x, y: left.y };
    return { a: left, b: right, c, dx: right.x - left.x, dy: right.y - left.y };
  })();

  const kind = (() => {
    if (points.length < 2) return null;
    const m = slope(points[0].x, points[0].y, points[1].x, points[1].y);
    return slopeKind(m);
  })();

  return (
    <div ref={wrapRef} className={`relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label="صفحه مختصات تعاملی"
        onPointerDown={(e) => {
          if (readOnly || !onPointsChange) return;
          if ((e.target as Element).closest("[data-point]")) return;
        }}
      >
        <defs>
          <linearGradient id="axisGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </linearGradient>
          <filter id="ptglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={w} height={h} fill="var(--graph-bg)" />

        {showGrid &&
          ticksX.map((x) => {
            const p = toScreen(x, 0);
            return (
              <line
                key={`gx${x}`}
                x1={p.sx}
                x2={p.sx}
                y1={pad}
                y2={h - pad}
                stroke="var(--grid)"
                strokeWidth={x === 0 ? 0 : 1}
              />
            );
          })}
        {showGrid &&
          ticksY.map((y) => {
            const p = toScreen(0, y);
            return (
              <line
                key={`gy${y}`}
                y1={p.sy}
                y2={p.sy}
                x1={pad}
                x2={w - pad}
                stroke="var(--grid)"
                strokeWidth={y === 0 ? 0 : 1}
              />
            );
          })}

        <line x1={pad} x2={w - pad} y1={origin.sy} y2={origin.sy} stroke="var(--axis)" strokeWidth={1.8} />
        <line x1={origin.sx} x2={origin.sx} y1={pad} y2={h - pad} stroke="var(--axis)" strokeWidth={1.8} />
        <polygon
          points={`${w - pad},${origin.sy} ${w - pad - 10},${origin.sy - 5} ${w - pad - 10},${origin.sy + 5}`}
          fill="var(--axis)"
        />
        <polygon
          points={`${origin.sx},${pad} ${origin.sx - 5},${pad + 10} ${origin.sx + 5},${pad + 10}`}
          fill="var(--axis)"
        />
        <text x={w - pad - 14} y={origin.sy - 10} fill="var(--text-mute)" fontSize="12" fontFamily="Vazirmatn">
          x
        </text>
        <text x={origin.sx + 10} y={pad + 14} fill="var(--text-mute)" fontSize="12" fontFamily="Vazirmatn">
          y
        </text>
        <text x={origin.sx + 6} y={origin.sy + 16} fill="var(--text-mute)" fontSize="11" fontFamily="Vazirmatn">
          O
        </text>

        {ticksX
          .filter((x) => x !== 0)
          .map((x) => {
            const p = toScreen(x, 0);
            return (
              <g key={`tx${x}`}>
                <line x1={p.sx} x2={p.sx} y1={origin.sy - 4} y2={origin.sy + 4} stroke="var(--axis)" />
                <text
                  x={p.sx}
                  y={origin.sy + 16}
                  textAnchor="middle"
                  fill="var(--text-mute)"
                  fontSize="10"
                  fontFamily="Vazirmatn"
                >
                  {x}
                </text>
              </g>
            );
          })}
        {ticksY
          .filter((y) => y !== 0)
          .map((y) => {
            const p = toScreen(0, y);
            return (
              <g key={`ty${y}`}>
                <line x1={origin.sx - 4} x2={origin.sx + 4} y1={p.sy} y2={p.sy} stroke="var(--axis)" />
                <text
                  x={origin.sx - 8}
                  y={p.sy + 3}
                  textAnchor="end"
                  fill="var(--text-mute)"
                  fontSize="10"
                  fontFamily="Vazirmatn"
                >
                  {y}
                </text>
              </g>
            );
          })}

        {lines.map((ln) => {
          const s = lineSeg(ln);
          if (!s) return null;
          return (
            <line
              key={ln.id}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={ln.color}
              strokeWidth={2.6}
              strokeDasharray={ln.dashed ? "8 6" : undefined}
              strokeLinecap="round"
              opacity={0.92}
              style={{ transition: "all 80ms linear" }}
            />
          );
        })}

        {tri && (
          <g>
            <path
              d={`M ${toScreen(tri.a.x, tri.a.y).sx} ${toScreen(tri.a.x, tri.a.y).sy}
                  L ${toScreen(tri.c.x, tri.c.y).sx} ${toScreen(tri.c.x, tri.c.y).sy}
                  L ${toScreen(tri.b.x, tri.b.y).sx} ${toScreen(tri.b.x, tri.b.y).sy} Z`}
              fill="rgba(34, 211, 238, 0.16)"
              stroke="rgba(34, 211, 238, 0.7)"
              strokeWidth={1.5}
            />
            <text
              x={(toScreen(tri.a.x, tri.a.y).sx + toScreen(tri.c.x, tri.c.y).sx) / 2}
              y={toScreen(tri.a.x, tri.a.y).sy + (tri.dy >= 0 ? 16 : -8)}
              textAnchor="middle"
              fill="var(--accent-2)"
              fontSize="11"
              fontFamily="Vazirmatn"
            >
              Δx = {formatNum(tri.dx)}
            </text>
            <text
              x={toScreen(tri.c.x, tri.c.y).sx + 8}
              y={(toScreen(tri.c.x, tri.c.y).sy + toScreen(tri.b.x, tri.b.y).sy) / 2}
              fill="#a78bfa"
              fontSize="11"
              fontFamily="Vazirmatn"
            >
              Δy = {formatNum(tri.dy)}
            </text>
          </g>
        )}

        {points.map((p) => {
          const s = toScreen(p.x, p.y);
          const active = hover === p.id || dragId === p.id || highlightIds.includes(p.id);
          return (
            <g
              key={p.id}
              data-point={p.id}
              onPointerDown={(e) => {
                if (readOnly) return;
                e.stopPropagation();
                (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId);
                setDragId(p.id);
              }}
              onPointerEnter={() => setHover(p.id)}
              onPointerLeave={() => setHover(null)}
              style={{ cursor: readOnly ? "default" : "grab" }}
              filter="url(#ptglow)"
            >
              {active && <circle cx={s.sx} cy={s.sy} r={16} fill={p.color} opacity={0.2} />}
              <circle cx={s.sx} cy={s.sy} r={active ? 8 : 7} fill={p.color} stroke="white" strokeWidth={2} />
              <text
                x={s.sx + 12}
                y={s.sy - 10}
                fill="var(--text)"
                fontSize="12"
                fontFamily="Vazirmatn"
                fontWeight={600}
              >
                {p.label}
                {showCoords ? `(${formatNum(p.x)}, ${formatNum(p.y)})` : ""}
              </text>
            </g>
          );
        })}
      </svg>
      {kind && points.length >= 2 && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur dark:bg-white/10">
          {kind === "pos" && "صعودی · شیب مثبت"}
          {kind === "neg" && "نزولی · شیب منفی"}
          {kind === "zero" && "افقی · شیب صفر"}
          {kind === "undef" && "عمودی · شیب تعریف‌نشده"}
        </div>
      )}
    </div>
  );
}

export function MiniGraph({ m, b, color = "#6366f1" }: { m: number; b: number; color?: string }) {
  const w = 160;
  const h = 110;
  const xMin = -4,
    xMax = 4,
    yMin = -3,
    yMax = 3;
  const map = (x: number, y: number) => {
    const sx = ((x - xMin) / (xMax - xMin)) * w;
    const sy = h - ((y - yMin) / (yMax - yMin)) * h;
    return `${sx},${sy}`;
  };
  const p1 = map(xMin, m * xMin + b);
  const p2 = map(xMax, m * xMax + b);
  const o = map(0, 0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full rounded-xl" aria-hidden>
      <rect width={w} height={h} fill="var(--graph-bg)" />
      <line x1={0} x2={w} y1={Number(o.split(",")[1])} y2={Number(o.split(",")[1])} stroke="var(--grid)" />
      <line x1={Number(o.split(",")[0])} x2={Number(o.split(",")[0])} y1={0} y2={h} stroke="var(--grid)" />
      <line
        x1={Number(p1.split(",")[0])}
        y1={Number(p1.split(",")[1])}
        x2={Number(p2.split(",")[0])}
        y2={Number(p2.split(",")[1])}
        stroke={color}
        strokeWidth={2.4}
      />
    </svg>
  );
}

export function eqOfPoints(a: Point, b: Point) {
  const m = slope(a.x, a.y, b.x, b.y);
  const bb = intercept(m, a.x, a.y);
  return equationFromMB(m, bb, a.x);
}
