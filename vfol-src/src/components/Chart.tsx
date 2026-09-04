import React, { useMemo, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine, Legend, Area, AreaChart, ScatterChart, Scatter } from "recharts";
import { useStore } from "../lib/store";

export type Series = { key: string; name: string; color?: string; dash?: boolean; area?: boolean };
const palette = ["#337bff", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export function XYChart({ data, series, xKey = "x", xLabel, yLabel, height = 260, yDomain, xDomain, refX, refY, logY, brush = true, legend, scale }: {
  data: Record<string, number | undefined>[]; series: Series[]; xKey?: string; xLabel?: string; yLabel?: string; height?: number; yDomain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"]; xDomain?: [number | "auto", number | "auto"]; refX?: { x: number; label?: string; color?: string }[]; refY?: { y: number; label?: string; color?: string }[]; logY?: boolean; brush?: boolean; legend?: boolean; scale?: "linear" | "log";
}) {
  const { t } = useStore();
  const tickFmt = (v: number) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(1) : +v.toFixed(3) + "");
  return (
    <div className="ltr">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} type="number" domain={xDomain ?? ["dataMin", "dataMax"]} tickFormatter={tickFmt} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -2, fontSize: 11 } : undefined} scale={scale ?? "linear"} allowDataOverflow />
          <YAxis domain={yDomain ?? ["auto", "auto"]} tickFormatter={tickFmt} scale={logY ? "log" : "linear"} width={58} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} allowDataOverflow />
          <Tooltip formatter={(v: unknown) => (typeof v === "number" ? tickFmt(v) : String(v ?? ""))} labelFormatter={(l) => `${xLabel ?? xKey}: ${tickFmt(Number(l))}`} isAnimationActive={false} />
          {legend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {refX?.map((r, i) => <ReferenceLine key={"rx" + i} x={r.x} stroke={r.color ?? "#f59e0b"} strokeDasharray="4 3" label={{ value: r.label, fontSize: 10, fill: r.color ?? "#f59e0b", position: "top" }} />)}
          {refY?.map((r, i) => <ReferenceLine key={"ry" + i} y={r.y} stroke={r.color ?? "#f43f5e"} strokeDasharray="4 3" label={{ value: r.label, fontSize: 10, fill: r.color ?? "#f43f5e", position: "right" }} />)}
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? palette[i % palette.length]} strokeWidth={2} dot={false} strokeDasharray={s.dash ? "6 4" : undefined} isAnimationActive={false} connectNulls />
          ))}
          {brush && data.length > 20 && <Brush dataKey={xKey} height={18} stroke="#337bff" travellerWidth={8} fill="transparent" tickFormatter={tickFmt} />}
        </LineChart>
      </ResponsiveContainer>
      {brush && <div className="text-[10px] muted mt-1 text-center" dir="auto">{t("zoomHint")}</div>}
    </div>
  );
}

export function AreaSpectrum({ data, xLabel, yLabel, height = 240, color = "#337bff", yDomain, xKey = "x", yKey = "y", extra }: { data: Record<string, number>[]; xLabel?: string; yLabel?: string; height?: number; color?: string; yDomain?: [number, number]; xKey?: string; yKey?: string; extra?: Series[] }) {
  const tickFmt = (v: number) => +v.toFixed(3) + "";
  return (
    <div className="ltr">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={"g" + color.replace("#", "")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} type="number" domain={["dataMin", "dataMax"]} tickFormatter={tickFmt} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -2, fontSize: 11 } : undefined} />
          <YAxis domain={yDomain ?? ["auto", "auto"]} width={52} tickFormatter={tickFmt} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
          <Tooltip isAnimationActive={false} formatter={(v: unknown) => (typeof v === "number" ? tickFmt(v) : String(v ?? ""))} labelFormatter={(l) => `${xLabel ?? "x"}: ${tickFmt(Number(l))}`} />
          <Area type="monotone" dataKey={yKey} stroke={color} fill={`url(#g${color.replace("#", "")})`} strokeWidth={1.8} dot={false} isAnimationActive={false} />
          {extra?.map((s, i) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? palette[(i + 1) % palette.length]} fill="transparent" strokeDasharray={s.dash ? "5 4" : undefined} dot={false} isAnimationActive={false} />)}
          <Brush dataKey={xKey} height={16} stroke={color} travellerWidth={8} fill="transparent" tickFormatter={tickFmt} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterFit({ points, fit, xLabel, yLabel, height = 260, fitLabel }: { points: { x: number; y: number }[]; fit?: (x: number) => number; xLabel?: string; yLabel?: string; height?: number; fitLabel?: string }) {
  const fitData = useMemo(() => {
    if (!fit || !points.length) return [];
    const xs = points.map((p) => p.x); const a = Math.min(...xs), b = Math.max(...xs);
    return Array.from({ length: 80 }, (_, i) => { const x = a + ((b - a) * i) / 79; return { x, y: fit(x) }; });
  }, [points, fit]);
  return (
    <div className="ltr">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" name={xLabel} domain={["auto", "auto"]} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -2, fontSize: 11 } : undefined} />
          <YAxis dataKey="y" type="number" name={yLabel} domain={["auto", "auto"]} width={56} label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} isAnimationActive={false} />
          <Scatter data={points} fill="#337bff" name="data" isAnimationActive={false} />
          {fitData.length > 0 && <Scatter data={fitData} fill="#f43f5e" line={{ stroke: "#f43f5e", strokeWidth: 2 }} shape={() => <g />} name={fitLabel ?? "fit"} isAnimationActive={false} />}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Heatmap on canvas (e.g. pulse evolution, mode fields)
export function Heatmap({ data, width = 520, height = 220, xLabel, yLabel, cmap = "viridis" }: { data: number[][]; width?: number; height?: number; xLabel?: string; yLabel?: string; cmap?: "viridis" | "hot" | "blue" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const rows = data.length, cols = data[0]?.length ?? 0;
    if (!rows || !cols) return;
    let max = 0; for (const r of data) for (const v of r) if (v > max) max = v;
    const img = ctx.createImageData(cols, rows);
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const v = Math.pow(data[i][j] / (max || 1), 0.6);
      const [r, g, b] = colormap(v, cmap);
      const idx = ((rows - 1 - i) * cols + j) * 4;
      img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
    }
    const off = document.createElement("canvas"); off.width = cols; off.height = rows;
    off.getContext("2d")!.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, width, height);
  }, [data, width, height, cmap]);
  return (
    <div className="ltr">
      <canvas ref={ref} width={width} height={height} className="w-full rounded-lg border border-line" style={{ aspectRatio: `${width}/${height}` }} />
      <div className="flex justify-between text-[10px] muted mt-1"><span>{xLabel}</span><span>{yLabel}</span></div>
    </div>
  );
}
export function colormap(v: number, cmap: "viridis" | "hot" | "blue"): [number, number, number] {
  v = Math.max(0, Math.min(1, v));
  if (cmap === "hot") return [Math.min(255, 255 * v * 3), Math.min(255, Math.max(0, 255 * (v * 3 - 1))), Math.min(255, Math.max(0, 255 * (v * 3 - 2)))];
  if (cmap === "blue") return [20 + 40 * v, 40 + 120 * v, 90 + 165 * v];
  // viridis approx
  const stops: [number, number, number][] = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
  const p = v * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(p)), f = p - i;
  return [0, 1, 2].map((k) => Math.round(stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f)) as [number, number, number];
}

export const useTick = (running: boolean, speed: number, cb: () => void) => {
  const cbRef = useRef(cb); cbRef.current = cb;
  useEffect(() => { if (!running) return; const id = setInterval(() => cbRef.current(), Math.max(16, 200 / speed)); return () => clearInterval(id); }, [running, speed]);
};
export const Palette = palette;
export const memoChart = <P extends object>(C: React.FC<P>) => React.memo(C);
