import { useStore } from "../lib/store";

// Pseudo-3D isometric fiber: coating → cladding → core, with propagating light and optional bend
export function Fiber3D({ coreUm = 9, cladUm = 125, coatUm = 250, bend = 0, t = 0, showField = true, height = 220 }: { coreUm?: number; cladUm?: number; coatUm?: number; bend?: number; t?: number; showField?: boolean; height?: number }) {
  const { t: tr } = useStore();
  const W = 560, Hh = height;
  const scale = 80 / coatUm; // px per µm for radii (visual, core magnified)
  const rCoat = 42, rClad = Math.max(24, 42 * (cladUm / coatUm)), rCore = Math.max(6, Math.min(20, 42 * (coreUm / coatUm) * 3));
  void scale;
  const len = 380;
  const x0 = 90, y0 = Hh / 2;
  // bend curvature: path control
  const sag = bend * 40;
  const path = (r: number, dy: number) => `M ${x0} ${y0 + dy - r} Q ${x0 + len / 2} ${y0 + dy - r - sag} ${x0 + len} ${y0 + dy - r} L ${x0 + len} ${y0 + dy + r} Q ${x0 + len / 2} ${y0 + dy + r - sag} ${x0} ${y0 + dy + r} Z`;
  const phase = (t % 40) / 40;
  return (
    <div className="ltr">
      <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="coatG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity=".55" /><stop offset="50%" stopColor="#fbbf24" stopOpacity=".85" /><stop offset="100%" stopColor="#b45309" stopOpacity=".6" /></linearGradient>
          <linearGradient id="cladG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8" stopOpacity=".5" /><stop offset="50%" stopColor="#e2e8f0" stopOpacity=".8" /><stop offset="100%" stopColor="#475569" stopOpacity=".55" /></linearGradient>
          <linearGradient id="coreG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#bfdbfe" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
          <radialGradient id="fieldG"><stop offset="0%" stopColor="#ef4444" stopOpacity=".9" /><stop offset="60%" stopColor="#f97316" stopOpacity=".4" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* body layers */}
        <path d={path(rCoat, 0)} fill="url(#coatG)" />
        <path d={path(rClad, 0)} fill="url(#cladG)" />
        <path d={path(rCore, 0)} fill="url(#coreG)" opacity=".95" />
        {/* light pulses inside core */}
        {showField && [0, 0.33, 0.66].map((o, i) => { const p = (phase + o) % 1; const x = x0 + p * len; const dy = -sag * 4 * p * (1 - p) * 0.5; return <ellipse key={i} cx={x} cy={y0 + dy} rx={14} ry={rCore * 1.4} fill="url(#fieldG)" filter="url(#glow)" />; })}
        {/* bend leak */}
        {bend > 0.3 && [0.35, 0.5, 0.65].map((p, i) => { const x = x0 + p * len; const dy = -sag * 4 * p * (1 - p) * 0.5; return <line key={i} x1={x} y1={y0 + dy - rCore} x2={x + 20} y2={y0 + dy - rCoat - 30 * bend} stroke="#f97316" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.8} />; })}
        {/* end-face cut (ellipses) */}
        <g transform={`translate(${x0 + len} ${y0})`}>
          <ellipse cx={0} cy={0} rx={rCoat * 0.38} ry={rCoat} fill="#fbbf24" stroke="#b45309" strokeWidth=".8" />
          <ellipse cx={0} cy={0} rx={rClad * 0.38} ry={rClad} fill="#e2e8f0" stroke="#64748b" strokeWidth=".8" />
          <ellipse cx={0} cy={0} rx={rCore * 0.38} ry={rCore} fill="#3b82f6" stroke="#1d4ed8" strokeWidth=".8" />
        </g>
        <g transform={`translate(${x0} ${y0})`}>
          <ellipse cx={0} cy={0} rx={rCoat * 0.38} ry={rCoat} fill="#d97706" opacity=".8" />
        </g>
        {/* labels */}
        <g fontSize="10" fill="currentColor" opacity=".8">
          <line x1={x0 + len + 30} y1={y0 - rCore} x2={x0 + len + 60} y2={y0 - 40} stroke="currentColor" strokeWidth=".6" /><text x={x0 + len + 62} y={y0 - 42}>{tr("core")} {coreUm} µm</text>
          <line x1={x0 + len + 30} y1={y0 - rClad + 4} x2={x0 + len + 60} y2={y0} stroke="currentColor" strokeWidth=".6" /><text x={x0 + len + 62} y={y0 + 3}>{tr("cladding")} {cladUm} µm</text>
          <line x1={x0 + len + 30} y1={y0 - rCoat + 4} x2={x0 + len + 60} y2={y0 + 40} stroke="currentColor" strokeWidth=".6" /><text x={x0 + len + 62} y={y0 + 43}>{tr("coating")} {coatUm} µm</text>
        </g>
      </svg>
    </div>
  );
}

// Refractive index profile + LP01 mode field (2D intensity heat circle)
export function ModeField({ V, aUm, profile, w }: { V: number; aUm: number; profile: "step" | "graded"; w: number }) {
  const n = 60;
  const cells: { x: number; y: number; v: number }[] = [];
  const R = aUm * 2.2;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (-R + (2 * R * i) / (n - 1)), y = (-R + (2 * R * j) / (n - 1));
    const r = Math.hypot(x, y);
    const I = Math.exp(-2 * (r * r) / (w * w)) * (V < 1 ? 0.6 : 1);
    cells.push({ x: i, y: j, v: I });
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="w-full rounded-lg" style={{ aspectRatio: "1/1", maxWidth: 220 }}>
      {cells.map((c, k) => <rect key={k} x={c.x} y={c.y} width={1.05} height={1.05} fill={`rgba(${Math.round(255 * Math.min(1, c.v * 1.3))},${Math.round(80 + 120 * c.v)},${Math.round(255 * (1 - c.v))},${0.15 + 0.85 * c.v})`} />)}
      <circle cx={n / 2} cy={n / 2} r={(aUm / R) * (n / 2)} fill="none" stroke="white" strokeDasharray="2 1" strokeWidth=".4" />
      <text x={2} y={5} fontSize="3.5" fill="white">{profile === "step" ? "step" : "graded"} · LP01</text>
    </svg>
  );
}
