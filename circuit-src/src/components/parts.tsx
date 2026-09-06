import { CircuitComponent, Level } from "../circuit/types";

/** Flow animation for a path (dots moving along it) */
export function FlowDots({ d, current, color = "#fff59d", width = 6 }: { d: string; current: number; color?: string; width?: number }) {
  const mag = Math.abs(current);
  if (mag < 0.02) return null;
  const duration = Math.max(0.15, Math.min(2.5, 0.25 / mag));
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width + 4}
        opacity={0.35}
        className={`flow-dots ${current > 0 ? "forward" : "backward"}`}
        style={{ animationDuration: `${duration}s`, filter: "blur(2px)" }}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        className={`flow-dots ${current > 0 ? "forward" : "backward"}`}
        style={{ animationDuration: `${duration}s` }}
      />
    </>
  );
}

export const LEVEL_LABEL_BATTERY: Record<Level, string> = { low: "ضعیف", medium: "معمولی", high: "قوی" };
export const LEVEL_LABEL_RESISTOR: Record<Level, string> = { low: "کم", medium: "متوسط", high: "زیاد" };

const BATTERY_COLORS: Record<Level, { body: string; dark: string }> = {
  low: { body: "#86efac", dark: "#16a34a" },
  medium: { body: "#fdba74", dark: "#ea580c" },
  high: { body: "#fca5a5", dark: "#dc2626" },
};

export function BatteryGlyph({ c, current }: { c: CircuitComponent; current: number }) {
  const col = BATTERY_COLORS[c.level];
  const bolts = c.level === "low" ? 1 : c.level === "medium" ? 2 : 3;
  return (
    <g>
      {/* leads */}
      <line x1={-52} y1={0} x2={-36} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      <line x1={36} y1={0} x2={52} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      {/* body */}
      <rect x={-34} y={-17} width={68} height={34} rx={7} fill={col.body} stroke={col.dark} strokeWidth={3} />
      <rect x={-34} y={-17} width={16} height={34} rx={7} fill={col.dark} />
      <rect x={-26} y={-17} width={8} height={34} fill={col.dark} />
      <text x={-26} y={5} textAnchor="middle" fontSize={16} fontWeight={900} fill="#fff">
        +
      </text>
      <text x={26} y={5} textAnchor="middle" fontSize={18} fontWeight={900} fill={col.dark}>
        −
      </text>
      {Array.from({ length: bolts }).map((_, i) => (
        <text key={i} x={-4 + (i - (bolts - 1) / 2) * 12} y={5} textAnchor="middle" fontSize={13}>
          ⚡
        </text>
      ))}
      <FlowDots d="M-52 0 L52 0" current={current} color="#fff" width={4} />
    </g>
  );
}

export function BulbGlyph({ c, brightness, current }: { c: CircuitComponent; brightness: number; current: number }) {
  const lit = brightness > 0.04;
  const b = Math.min(1.3, brightness);
  const glowR = 34 + 34 * b;
  const gid = `glow-${c.id}`;
  return (
    <g>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor="#fde047" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#fde047" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#fde047" stopOpacity={0} />
        </radialGradient>
      </defs>
      {lit && (
        <circle
          cx={0}
          cy={-8}
          r={glowR}
          fill={`url(#${gid})`}
          opacity={Math.min(1, 0.35 + b * 0.6)}
          className="glow-breathe"
          style={{ pointerEvents: "none" }}
        />
      )}
      {/* leads */}
      <polyline points="-52,0 -30,0 -14,14" fill="none" stroke="#475569" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="52,0 30,0 14,14" fill="none" stroke="#475569" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {/* base */}
      <rect x={-14} y={10} width={28} height={16} rx={4} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
      <line x1={-12} y1={15} x2={12} y2={15} stroke="#64748b" strokeWidth={2} />
      <line x1={-12} y1={21} x2={12} y2={21} stroke="#64748b" strokeWidth={2} />
      {/* glass */}
      <circle
        cx={0}
        cy={-8}
        r={22}
        fill={lit ? "#fef08a" : "#f1f5f9"}
        fillOpacity={lit ? Math.min(1, 0.55 + b * 0.45) : 0.9}
        stroke={lit ? "#eab308" : "#94a3b8"}
        strokeWidth={3}
      />
      {/* filament */}
      <polyline
        points="-8,6 -8,-6 -4,-12 0,-4 4,-12 8,-6 8,6"
        fill="none"
        stroke={lit ? "#f97316" : "#64748b"}
        strokeWidth={lit ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: lit ? "drop-shadow(0 0 4px #fb923c)" : undefined }}
      />
      {lit && b > 0.9 && (
        <g stroke="#facc15" strokeWidth={3} strokeLinecap="round" opacity={0.9}>
          <line x1={-32} y1={-30} x2={-38} y2={-36} />
          <line x1={32} y1={-30} x2={38} y2={-36} />
          <line x1={0} y1={-36} x2={0} y2={-44} />
        </g>
      )}
      <FlowDots d="M-52 0 L-30 0 L-14 14 L14 14 L30 0 L52 0" current={current} color="#fff" width={4} />
    </g>
  );
}

export function SwitchGlyph({ c, current }: { c: CircuitComponent; current: number }) {
  return (
    <g>
      <line x1={-52} y1={0} x2={-30} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      <line x1={30} y1={0} x2={52} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      <rect x={-38} y={-8} width={76} height={26} rx={8} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <circle cx={-28} cy={0} r={5} fill="#475569" />
      <circle cx={28} cy={0} r={5} fill="#475569" />
      {/* lever */}
      <g style={{ transform: `rotate(${c.closed ? 0 : -38}deg)`, transformOrigin: "-28px 0px", transition: "transform 0.25s ease" }}>
        <line x1={-28} y1={0} x2={30} y2={0} stroke={c.closed ? "#16a34a" : "#dc2626"} strokeWidth={6} strokeLinecap="round" />
        <circle cx={30} cy={0} r={6} fill={c.closed ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth={2} />
      </g>
      {/* indicator */}
      <circle cx={0} cy={12} r={4} fill={c.closed ? "#22c55e" : "#ef4444"} />
      {c.closed && <FlowDots d="M-52 0 L52 0" current={current} color="#fff" width={4} />}
    </g>
  );
}

const RES_BANDS: Record<Level, string[]> = {
  low: ["#22c55e"],
  medium: ["#f59e0b", "#f59e0b"],
  high: ["#ef4444", "#ef4444", "#ef4444"],
};

export function ResistorGlyph({ c, current }: { c: CircuitComponent; current: number }) {
  const bands = RES_BANDS[c.level];
  return (
    <g>
      <line x1={-52} y1={0} x2={-32} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      <line x1={32} y1={0} x2={52} y2={0} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
      <rect x={-32} y={-13} width={64} height={26} rx={10} fill="#fde68a" stroke="#b45309" strokeWidth={3} />
      {bands.map((col, i) => (
        <rect key={i} x={-6 + (i - (bands.length - 1) / 2) * 16} y={-13} width={12} height={26} fill={col} />
      ))}
      <FlowDots d="M-52 0 L52 0" current={current} color="#fff" width={4} />
    </g>
  );
}

/** Small static preview used inside toolbox & guide (no interactivity). */
export function PartPreview({ type, size = 110 }: { type: CircuitComponent["type"] | "wire"; size?: number }) {
  const fake: CircuitComponent = { id: "preview", type: type === "wire" ? "bulb" : type, x: 0, y: 0, rotation: 0, level: "medium", closed: true };
  return (
    <svg viewBox="-60 -40 120 80" width={size} height={(size * 80) / 120}>
      {type === "wire" ? (
        <g>
          <path d="M-50 10 C -20 -30, 20 40, 50 -10" stroke="#f97316" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={-50} cy={10} r={7} fill="#fff" stroke="#475569" strokeWidth={3} />
          <circle cx={50} cy={-10} r={7} fill="#fff" stroke="#475569" strokeWidth={3} />
        </g>
      ) : type === "battery" ? (
        <BatteryGlyph c={fake} current={0} />
      ) : type === "bulb" ? (
        <BulbGlyph c={fake} brightness={0} current={0} />
      ) : type === "switch" ? (
        <SwitchGlyph c={fake} current={0} />
      ) : (
        <ResistorGlyph c={{ ...fake, level: "low" }} current={0} />
      )}
    </svg>
  );
}
