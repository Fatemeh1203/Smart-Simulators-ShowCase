import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis, Scatter, ScatterChart, Legend } from "recharts";
import { useStore } from "../store";
import { fmt } from "../physics/core";

interface Series { key: string; color: string; name?: string; dashed?: boolean }

interface Props {
  data: Record<string, number>[];
  xKey: string;
  series: Series[];
  xLabel?: string; yLabel?: string;
  marker?: { x: number; y: number } | null;
  height?: number;
  yLog?: boolean;
  scatterData?: { x: number; y: number }[];
  xDomain?: [number | "auto", number | "auto"];
}

export function LiveChart({ data, xKey, series, xLabel, yLabel, marker, height = 200, scatterData, xDomain }: Props) {
  const { theme } = useStore();
  const dark = theme === "dark";
  const grid = dark ? "rgba(148,163,184,.15)" : "rgba(71,85,105,.15)";
  const tick = { fill: dark ? "#94a3b8" : "#475569", fontSize: 10 };
  return (
    <div style={{ height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 18, left: 8 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey={xKey} type="number" domain={xDomain ?? ["dataMin", "dataMax"]} tick={tick} tickFormatter={v => fmt(v, 2)} label={{ value: xLabel, position: "insideBottom", offset: -10, fill: tick.fill, fontSize: 11 }} />
          <YAxis tick={tick} tickFormatter={v => fmt(v, 2)} width={62} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: tick.fill, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: dark ? "#0f172a" : "#fff", border: "1px solid rgba(148,163,184,.3)", borderRadius: 10, fontSize: 11 }} formatter={(v) => fmt(Number(v), 3)} labelFormatter={v => `${xLabel ?? xKey}: ${fmt(Number(v), 3)}`} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map(s => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} strokeWidth={2.2} dot={false} isAnimationActive={false} strokeDasharray={s.dashed ? "6 4" : undefined} />
          ))}
          {scatterData && scatterData.map((p, i) => (
            <ReferenceDot key={i} x={p.x} y={p.y} r={4} fill="#f59e0b" stroke="#fff" />
          ))}
          {marker && isFinite(marker.y) && <ReferenceDot x={marker.x} y={marker.y} r={6} fill="#22d3ee" stroke="#fff" strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterPlot({ points, xLabel, yLabel, height = 220, fit }: { points: { x: number; y: number }[]; xLabel: string; yLabel: string; height?: number; fit?: { x: number; y: number }[] }) {
  const { theme } = useStore();
  const dark = theme === "dark";
  const grid = dark ? "rgba(148,163,184,.15)" : "rgba(71,85,105,.15)";
  const tick = { fill: dark ? "#94a3b8" : "#475569", fontSize: 10 };
  return (
    <div style={{ height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, bottom: 18, left: 8 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" tick={tick} tickFormatter={v => fmt(v, 2)} label={{ value: xLabel, position: "insideBottom", offset: -10, fill: tick.fill, fontSize: 11 }} />
          <YAxis dataKey="y" type="number" tick={tick} tickFormatter={v => fmt(v, 2)} width={62} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: tick.fill, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: dark ? "#0f172a" : "#fff", border: "1px solid rgba(148,163,184,.3)", borderRadius: 10, fontSize: 11 }} formatter={(v) => fmt(Number(v), 3)} />
          {fit && <Scatter data={fit} line={{ stroke: "#22d3ee", strokeWidth: 2 }} shape={() => <g />} isAnimationActive={false} />}
          <Scatter data={points} fill="#f59e0b" isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
