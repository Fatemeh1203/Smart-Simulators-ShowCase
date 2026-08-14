import { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

// Lightweight types (plotly.js-dist-min ships no .d.ts)
export type PlotlyData = Record<string, unknown>;
export interface PlotlyLayout extends Record<string, unknown> {
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  font?: Record<string, unknown>;
  margin?: Record<string, number>;
}
export interface PlotProps {
  data: PlotlyData[];
  layout?: PlotlyLayout;
  config?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

const BASE_LAYOUT: PlotlyLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    family:
      "Vazirmatn, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    size: 13,
    color: "#cbd5e1",
  },
  margin: { l: 62, r: 24, t: 48, b: 52 },
  legend: {
    orientation: "h",
    y: -0.28,
    font: { size: 12 },
    bgcolor: "rgba(15,23,42,0.6)",
  },
  title: { font: { size: 15, color: "#f1f5f9" } },
};

const BASE_CONFIG: Record<string, unknown> = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["lasso2d", "select2d"],
};

export default function Plot({
  data,
  layout,
  config,
  className,
  style,
}: PlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mergedLayout = { ...BASE_LAYOUT, ...layout };
    const mergedConfig = { ...BASE_CONFIG, ...config };
    Plotly.react(el, data, mergedLayout, mergedConfig);
  }, [data, layout, config]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      Plotly.Plots.resize(el);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      Plotly.purge(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 360, ...style }}
    />
  );
}
