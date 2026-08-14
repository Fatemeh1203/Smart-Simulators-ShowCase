import Plot, { type PlotlyData, type PlotlyLayout } from "./Plot";

// 2D intensity heatmap of a transverse mode field
export function Heatmap2D({
  x,
  y,
  z,
  title,
  tone = "no",
}: {
  x: number[];
  y: number[];
  z: number[][];
  title: string;
  tone?: "no" | "field";
}) {
  const data: PlotlyData[] = [
    {
      type: "heatmap",
      x,
      y,
      z,
      colorscale: "Jet",
      zmin: 0,
      zmax: 1,
      colorbar: { title: { text: "|E|²", size: 11 }, thickness: 12, len: 0.85 },
      hovertemplate: "x=%{x:.1f}µm  y=%{y:.1f}µm<br>I=%{z:.2f}<extra></extra>",
    },
  ];
  const layout: PlotlyLayout = {
    title: {
      text: title,
      font: { size: 13, color: tone === "field" ? "#fda4af" : "#7dd3fc" },
    },
    xaxis: { title: { text: "x (µm)" }, gridcolor: "#1e293b" },
    yaxis: {
      title: { text: "y (µm)" },
      gridcolor: "#1e293b",
      scaleanchor: "x",
      scaleratio: 1,
    },
    margin: { l: 56, r: 12, t: 42, b: 44 },
  };
  return <Plot data={data} layout={layout} style={{ minHeight: 320 }} />;
}

// 3D surface of a transverse mode field
export function Surface3D({
  x,
  y,
  z,
  title,
}: {
  x: number[];
  y: number[];
  z: number[][];
  title: string;
}) {
  const data: PlotlyData[] = [
    {
      type: "surface",
      x,
      y,
      z,
      colorscale: "Jet",
      cmin: 0,
      cmax: 1,
      colorbar: { title: { text: "|E|²", size: 11 }, thickness: 12 },
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#fff",
          project: { z: true },
        },
      },
    },
  ];
  const layout: PlotlyLayout = {
    title: { text: title, font: { size: 13, color: "#f1f5f9" } },
    scene: {
      xaxis: { title: { text: "x µm" }, backgroundcolor: "#0b1120", gridcolor: "#1e293b" },
      yaxis: { title: { text: "y µm" }, backgroundcolor: "#0b1120", gridcolor: "#1e293b" },
      zaxis: { title: { text: "|E|²" }, backgroundcolor: "#0b1120", gridcolor: "#1e293b" },
      camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
    },
    margin: { l: 0, r: 0, t: 40, b: 0 },
  };
  return <Plot data={data} layout={layout} style={{ minHeight: 340 }} />;
}

// Side-by-side comparison: no-field vs field heatmaps (same color scale)
export function FieldCompare({
  grids,
}: {
  grids: { x: number[]; y: number[]; zNo: number[][]; zField: number[][]; tag: string };
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Heatmap2D x={grids.x} y={grids.y} z={grids.zNo} title={`بدون میدان — ${grids.tag}`} tone="no" />
      <Heatmap2D
        x={grids.x}
        y={grids.y}
        z={grids.zField}
        title={`با میدان — ${grids.tag}`}
        tone="field"
      />
    </div>
  );
}
