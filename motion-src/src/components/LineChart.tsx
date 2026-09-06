import { fmt } from "../physics";

export interface Series {
  name: string;
  color: string;
  points: { x: number; y: number }[];
}

interface Props {
  title: string;
  series: Series[];
  yUnit: string;
  xUnit?: string;
  height?: number;
  minSpanX?: number;
}

function niceStep(range: number, target = 5) {
  const raw = range / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / pow;
  const s = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return s * pow;
}

export default function LineChart({ title, series, yUnit, xUnit = "s", height = 200, minSpanX = 5 }: Props) {
  const W = 520;
  const H = height;
  const padL = 46;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const iw = W - padL - padR;
  const ih = H - padT - padB;

  let maxX = minSpanX;
  let minY = 0;
  let maxY = 1;
  series.forEach((s) =>
    s.points.forEach((p) => {
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
      if (p.y < minY) minY = p.y;
    })
  );
  // pad y
  const ySpan = maxY - minY || 1;
  maxY += ySpan * 0.1;
  if (minY < 0) minY -= ySpan * 0.1;

  const sx = (x: number) => padL + (x / maxX) * iw;
  const sy = (y: number) => padT + ih - ((y - minY) / (maxY - minY)) * ih;

  const xStep = niceStep(maxX, 6);
  const yStep = niceStep(maxY - minY, 4);
  const xTicks: number[] = [];
  for (let x = 0; x <= maxX + 1e-9; x += xStep) xTicks.push(x);
  const yTicks: number[] = [];
  for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY + 1e-9; y += yStep) yTicks.push(y);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <div className="flex items-center gap-3">
          {series.map((s) => {
            const last = s.points[s.points.length - 1];
            return (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-5 rounded" style={{ background: s.color }} />
                <span className="text-slate-600">{s.name}</span>
                {last && (
                  <span className="num font-bold text-slate-900">
                    {fmt(last.y)} {yUnit}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ direction: "ltr" }}>
        {/* grid */}
        {yTicks.map((y) => (
          <g key={`y${y}`}>
            <line x1={padL} x2={W - padR} y1={sy(y)} y2={sy(y)} stroke={Math.abs(y) < 1e-9 ? "#94a3b8" : "#f1f5f9"} strokeWidth={Math.abs(y) < 1e-9 ? 1.5 : 1} />
            <text x={padL - 6} y={sy(y) + 4} fontSize={10} textAnchor="end" fill="#64748b">
              {Number(y.toFixed(3))}
            </text>
          </g>
        ))}
        {xTicks.map((x) => (
          <g key={`x${x}`}>
            <line x1={sx(x)} x2={sx(x)} y1={padT} y2={padT + ih} stroke="#f1f5f9" />
            <text x={sx(x)} y={H - padB + 14} fontSize={10} textAnchor="middle" fill="#64748b">
              {Number(x.toFixed(2))}
            </text>
          </g>
        ))}
        <text x={W - padR} y={H - 4} fontSize={10} textAnchor="end" fill="#94a3b8">
          t ({xUnit})
        </text>
        <text x={padL - 6} y={10} fontSize={10} textAnchor="end" fill="#94a3b8">
          {yUnit}
        </text>
        <line x1={padL} x2={padL} y1={padT} y2={padT + ih} stroke="#94a3b8" />
        {/* series */}
        {series.map((s) => {
          if (s.points.length === 0) return null;
          const d = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={sx(last.x)} cy={sy(last.y)} r={4} fill="white" stroke={s.color} strokeWidth={2.5} />
            </g>
          );
        })}
        {series.every((s) => s.points.length === 0) && (
          <text x={padL + iw / 2} y={padT + ih / 2} fontSize={12} textAnchor="middle" fill="#94a3b8">
            برای رسم نمودار، آزمایش را شروع کنید
          </text>
        )}
      </svg>
    </div>
  );
}
