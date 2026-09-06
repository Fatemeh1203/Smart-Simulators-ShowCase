interface Point {
  x: number;
  y: number;
}

export function LineGraph({
  points,
  curve,
  width = 460,
  height = 240,
  xLabel,
  yLabel,
  color = "#38bdf8",
  curveColor = "#f472b6",
  xDomain,
  yDomain,
}: {
  points: Point[];
  curve?: Point[];
  width?: number;
  height?: number;
  xLabel: string;
  yLabel: string;
  color?: string;
  curveColor?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
}) {
  const pad = { l: 46, r: 14, t: 14, b: 34 };
  const allX = [...points.map((p) => p.x), ...(curve?.map((p) => p.x) ?? [])];
  const allY = [...points.map((p) => p.y), ...(curve?.map((p) => p.y) ?? [])];
  const xMin = xDomain ? xDomain[0] : Math.min(0, ...allX);
  const xMax = xDomain ? xDomain[1] : Math.max(1, ...allX);
  const yMin = yDomain ? yDomain[0] : Math.min(0, ...allY);
  const yMax = yDomain ? yDomain[1] : Math.max(1, ...allY);

  const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin || 1)) * (width - pad.l - pad.r);
  const sy = (y: number) => height - pad.b - ((y - yMin) / (yMax - yMin || 1)) * (height - pad.t - pad.b);

  const curvePath = curve
    ?.slice()
    .sort((a, b) => a.x - b.x)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`)
    .join(" ");

  const gridLines = 4;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <rect x={0} y={0} width={width} height={height} fill="transparent" />
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const gy = pad.t + (i * (height - pad.t - pad.b)) / gridLines;
        const val = yMax - (i * (yMax - yMin)) / gridLines;
        return (
          <g key={i}>
            <line x1={pad.l} x2={width - pad.r} y1={gy} y2={gy} stroke="#1e293b" strokeWidth={1} />
            <text x={pad.l - 6} y={gy + 3} fontSize={9} fill="#64748b" textAnchor="end" className="tabular">
              {Math.abs(val) >= 1000 || (Math.abs(val) < 0.01 && val !== 0) ? val.toExponential(1) : val.toFixed(2)}
            </text>
          </g>
        );
      })}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const gx = pad.l + (i * (width - pad.l - pad.r)) / gridLines;
        const val = xMin + (i * (xMax - xMin)) / gridLines;
        return (
          <text key={i} x={gx} y={height - pad.b + 14} fontSize={9} fill="#64748b" textAnchor="middle" className="tabular">
            {Math.abs(val) >= 1000 || (Math.abs(val) < 0.01 && val !== 0) ? val.toExponential(1) : val.toFixed(2)}
          </text>
        );
      })}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke="#475569" strokeWidth={1.5} />
      <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#475569" strokeWidth={1.5} />
      <text x={width / 2} y={height - 2} fontSize={10} fill="#94a3b8" textAnchor="middle" fontWeight={700}>
        {xLabel}
      </text>
      <text x={12} y={12} fontSize={10} fill="#94a3b8" textAnchor="start" fontWeight={700}>
        {yLabel}
      </text>
      {curvePath && <path d={curvePath} fill="none" stroke={curveColor} strokeWidth={2} strokeDasharray="4 3" />}
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={color} stroke="#0f172a" strokeWidth={1} />
      ))}
    </svg>
  );
}

export function PolarGraph({
  data,
  width = 300,
  height = 300,
  color = "#f472b6",
  pointerAngle,
}: {
  data: { angle: number; r: number }[];
  width?: number;
  height?: number;
  color?: string;
  pointerAngle?: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) / 2 - 20;
  const maxR = Math.max(1, ...data.map((d) => d.r));

  const toXY = (angle: number, r: number) => {
    const rr = (r / maxR) * R;
    return [cx + rr * Math.sin(angle), cy - rr * Math.cos(angle)];
  };

  const path = data
    .map((d, i) => {
      const [x, y] = toXY(d.angle, d.r);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ") + " Z";

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle key={f} cx={cx} cy={cy} r={R * f} fill="none" stroke="#1e293b" strokeWidth={1} />
      ))}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#1e293b" strokeWidth={1} />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="#1e293b" strokeWidth={1} />
      <path d={path} fill={color + "33"} stroke={color} strokeWidth={2} />
      {pointerAngle !== undefined && (
        <line
          x1={cx}
          y1={cy}
          x2={cx + R * Math.sin(pointerAngle)}
          y2={cy - R * Math.cos(pointerAngle)}
          stroke="#facc15"
          strokeWidth={2}
        />
      )}
      <circle cx={cx} cy={cy} r={3} fill="#94a3b8" />
    </svg>
  );
}
