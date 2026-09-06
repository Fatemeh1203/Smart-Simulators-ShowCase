import { BodyState, Params, SurfaceKey, SURFACES, fmt } from "../physics";

export interface Lane {
  state: BodyState;
  params: Params;
  label?: string;
  color: string; // block color
  trail: number[]; // x positions (m) sampled over time
  surface?: SurfaceKey;
}

interface Props {
  lanes: Lane[];
  surface: SurfaceKey;
  showForces?: boolean;
  showNet?: boolean;
  showTrail?: boolean;
}

const W = 960;
const LANE_H = 320;
const PPM = 40; // pixels per metre
const START_PX = 140;

function Arrow({
  x,
  y,
  dx,
  dy,
  color,
  label,
  labelSide = "end",
  dashed,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  label: string;
  labelSide?: "end" | "start";
  dashed?: boolean;
}) {
  const len = Math.hypot(dx, dy);
  if (len < 2) return null;
  const ux = dx / len;
  const uy = dy / len;
  const head = Math.min(14, len * 0.5);
  const ex = x + dx;
  const ey = y + dy;
  const bx = ex - ux * head;
  const by = ey - uy * head;
  const px = -uy;
  const py = ux;
  const hw = head * 0.55;
  const lx = labelSide === "end" ? ex + ux * 10 : x - ux * 10;
  const ly = labelSide === "end" ? ey + uy * 10 : y - uy * 10;
  const horiz = Math.abs(ux) > Math.abs(uy);
  let anchor: "start" | "middle" | "end" = "middle";
  if (horiz) anchor = (labelSide === "end" ? ux : -ux) > 0 ? "start" : "end";
  const dyText = horiz ? 4 : (labelSide === "end" ? uy : -uy) > 0 ? 14 : -6;

  return (
    <g style={{ transition: "all 80ms linear" }}>
      <line
        x1={x}
        y1={y}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={dashed ? "6 5" : undefined}
      />
      <polygon
        points={`${ex},${ey} ${bx + px * hw},${by + py * hw} ${bx - px * hw},${by - py * hw}`}
        fill={color}
      />
      <text
        x={lx}
        y={ly + dyText}
        fill={color}
        fontSize={13}
        fontWeight={700}
        textAnchor={anchor}
        style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 4, strokeLinejoin: "round" }}
      >
        {label}
      </text>
    </g>
  );
}

export default function LabCanvas({ lanes, surface, showForces = true, showNet = true, showTrail = true }: Props) {
  const H = LANE_H * lanes.length;

  // Shared camera: follow the leading body
  const maxX = Math.max(...lanes.map((l) => l.state.x));
  const camX = Math.max(0, maxX - (W * 0.55 - START_PX) / PPM);
  const toPx = (xm: number) => START_PX + (xm - camX) * PPM;

  // ruler ticks
  const firstTick = Math.floor(camX);
  const lastTick = Math.ceil(camX + W / PPM) + 1;
  const ticks: number[] = [];
  for (let m = firstTick; m <= lastTick; m++) ticks.push(m);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-slate-200 shadow-inner select-none"
      direction="ltr"
      style={{ direction: "ltr" }}
    >
      <defs>
        <pattern id="rough" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.3" fill="rgba(0,0,0,0.25)" />
          <circle cx="8" cy="7" r="1" fill="rgba(0,0,0,0.2)" />
        </pattern>
        <pattern id="wood" width="60" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q 15 2 30 6 T 60 6" stroke="rgba(120,60,10,0.25)" fill="none" strokeWidth="1.5" />
        </pattern>
        <pattern id="concrete" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="none" stroke="rgba(0,0,0,0.12)" />
        </pattern>
        <linearGradient id="ice" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      {lanes.map((lane, li) => {
        const { state: s, params: p } = lane;
        const laneSurface = lane.surface ?? surface;
        const surfColor = SURFACES.find((q) => q.key === laneSurface)?.color ?? "#cbd5e1";
        const top = li * LANE_H;
        const groundY = top + LANE_H - 96;
        const size = 46 + Math.sqrt(p.mass) * 3.6; // 1kg≈50px, 100kg≈82px
        const bx = toPx(s.x); // block centre x
        const cx = bx;
        const cy = groundY - size / 2;
        const left = cx - size / 2;
        const topY = groundY - size;

        // arrow scale
        const refForce = Math.max(s.weight, Math.abs(p.force), 60);
        const pxPerN = 70 / refForce;
        const L = (f: number) => f * pxPerN;

        return (
          <g key={li}>
            {/* lane separator */}
            {li > 0 && <line x1={0} y1={top} x2={W} y2={top} stroke="#e2e8f0" strokeDasharray="8 6" />}

            {/* surface */}
            <rect x={0} y={groundY} width={W} height={top + LANE_H - groundY} fill={laneSurface === "ice" ? "url(#ice)" : surfColor} />
            {laneSurface === "rough" && <rect x={0} y={groundY} width={W} height={top + LANE_H - groundY} fill="url(#rough)" />}
            {laneSurface === "wood" && <rect x={0} y={groundY} width={W} height={top + LANE_H - groundY} fill="url(#wood)" />}
            {laneSurface === "concrete" && <rect x={0} y={groundY} width={W} height={top + LANE_H - groundY} fill="url(#concrete)" />}
            <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#334155" strokeWidth={2} />

            {/* ruler */}
            {ticks.map((m) => {
              const x = toPx(m);
              if (x < -20 || x > W + 20) return null;
              const major = m % 5 === 0;
              return (
                <g key={m}>
                  <line x1={x} y1={groundY} x2={x} y2={groundY + (major ? 14 : 8)} stroke="#1e293b" strokeWidth={major ? 2 : 1} />
                  {major && (
                    <text x={x} y={groundY + 30} fontSize={12} textAnchor="middle" fill="#1e293b" fontWeight={600}>
                      {m} m
                    </text>
                  )}
                </g>
              );
            })}

            {/* start marker */}
            {toPx(0) > -30 && (
              <g>
                <line x1={toPx(0)} y1={groundY - 4} x2={toPx(0)} y2={groundY - 70 - size} stroke="#94a3b8" strokeDasharray="4 4" />
                <text x={toPx(0)} y={groundY - 76 - size} fontSize={11} textAnchor="middle" fill="#64748b">
                  شروع
                </text>
              </g>
            )}

            {/* trail */}
            {showTrail && s.x > 0.01 && (
              <g>
                <line x1={toPx(0)} y1={groundY + 70} x2={bx} y2={groundY + 70} stroke={lane.color} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
                {lane.trail.map((xm, i) =>
                  i % 10 === 0 ? <circle key={i} cx={toPx(xm)} cy={groundY + 70} r={3.5} fill={lane.color} opacity={0.9} /> : null
                )}
                <circle cx={bx} cy={groundY + 70} r={5} fill="white" stroke={lane.color} strokeWidth={2.5} />
                <text x={(toPx(0) + bx) / 2} y={groundY + 88} fontSize={11.5} textAnchor="middle" fill="#334155" fontWeight={600}>
                  Δx = {fmt(s.x)} m
                </text>
              </g>
            )}

            {/* motion lines */}
            {s.v > 0.3 &&
              [0.3, 0.5, 0.7].map((k, i) => (
                <line
                  key={i}
                  x1={left - 10 - Math.min(s.v, 20) * 1.2}
                  y1={topY + size * k}
                  x2={left - 6}
                  y2={topY + size * k}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              ))}

            {/* block */}
            <g filter="url(#shadow)">
              <rect x={left} y={topY} width={size} height={size} rx={8} fill={lane.color} stroke="#0f172a" strokeWidth={1.5} />
              <rect x={left + 4} y={topY + 4} width={size - 8} height={size * 0.3} rx={5} fill="white" opacity={0.18} />
            </g>
            <text x={cx} y={cy + 5} fontSize={14} fontWeight={800} textAnchor="middle" fill="white" style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.35)", strokeWidth: 3 }}>
              {p.mass} kg
            </text>
            {lane.label && (
              <text x={cx} y={topY - 8} fontSize={14} fontWeight={800} textAnchor="middle" fill={lane.color}>
                {lane.label}
              </text>
            )}

            {/* status badge */}
            <g transform={`translate(${W - 150}, ${top + 14})`}>
              <rect width={136} height={30} rx={15} fill={s.moving ? "#dcfce7" : "#f1f5f9"} stroke={s.moving ? "#22c55e" : "#94a3b8"} />
              <circle cx={20} cy={15} r={6} fill={s.moving ? "#22c55e" : "#94a3b8"} className={s.moving ? "pulse-soft" : ""} />
              <text x={82} y={20} fontSize={13} fontWeight={700} textAnchor="middle" fill={s.moving ? "#166534" : "#475569"}>
                {s.moving ? "در حال حرکت" : "ساکن"}
              </text>
            </g>

            {/* velocity readout */}
            <g transform={`translate(14, ${top + 14})`}>
              <rect width={170} height={48} rx={10} fill="white" stroke="#e2e8f0" />
              <text x={10} y={19} fontSize={12} fill="#64748b">
                v = <tspan fontWeight={800} fill="#0f172a" fontSize={13}>{fmt(s.v)}</tspan> m/s
              </text>
              <text x={10} y={39} fontSize={12} fill="#64748b">
                a = <tspan fontWeight={800} fill="#0f172a" fontSize={13}>{fmt(s.a)}</tspan> m/s²
              </text>
            </g>

            {/* forces */}
            {showForces && (
              <g>
                {/* weight (down) from centre */}
                <Arrow x={cx + 9} y={cy} dx={0} dy={L(s.weight)} color="#2563eb" label={`W = ${fmt(s.weight, 1)} N`} />
                {/* normal (up) from bottom centre */}
                <Arrow x={cx - 9} y={groundY} dx={0} dy={-L(s.normal)} color="#0ea5e9" label={`N = ${fmt(s.normal, 1)} N`} />
                {/* applied (right) from centre */}
                {p.force > 0 && (
                  <Arrow x={cx} y={cy - 10} dx={L(p.force)} dy={0} color="#16a34a" label={`F = ${fmt(p.force, 0)} N`} />
                )}
                {/* friction (opposite) near bottom */}
                {Math.abs(s.friction) > 0.01 && (
                  <Arrow
                    x={cx}
                    y={groundY - 8}
                    dx={L(s.friction)}
                    dy={0}
                    color="#dc2626"
                    label={`f = ${fmt(Math.abs(s.friction), 1)} N`}
                  />
                )}
              </g>
            )}
            {showNet && (
              <g>
                {Math.abs(s.net) > 0.01 ? (
                  <Arrow x={cx} y={topY - 40} dx={L(s.net)} dy={0} color="#eab308" label={`Fnet = ${fmt(s.net, 1)} N`} />
                ) : (
                  <text x={cx} y={topY - 36} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="#a16207" style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 4 }}>
                    Fnet = 0 N
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
