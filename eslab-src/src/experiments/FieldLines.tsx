import { useMemo, useState } from "react";
import { LabCanvas, arrow, chargeBall, fieldColor, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Segmented, Slider, Term, Toggle } from "../components/ui";
import { PointCharge, fieldAt, generateFieldLines, potentialAt, vlen } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useResettable } from "../hooks";
import { useStore } from "../store";

const SCALE = 440;
type Preset = "pos" | "neg" | "pp" | "nn" | "pn" | "multi";
const presets: Record<Preset, PointCharge[]> = {
  pos: [{ x: 0, y: 0, q: 3e-6 }],
  neg: [{ x: 0, y: 0, q: -3e-6 }],
  pp: [{ x: -0.2, y: 0, q: 3e-6 }, { x: 0.2, y: 0, q: 3e-6 }],
  nn: [{ x: -0.2, y: 0, q: -3e-6 }, { x: 0.2, y: 0, q: -3e-6 }],
  pn: [{ x: -0.2, y: 0, q: 3e-6 }, { x: 0.2, y: 0, q: -3e-6 }],
  multi: [{ x: -0.25, y: 0.12, q: 3e-6 }, { x: 0.25, y: 0.12, q: -3e-6 }, { x: 0, y: -0.18, q: 2e-6 }, { x: 0, y: 0.25, q: -1e-6 }],
};

function FieldLines() {
  const [preset, setPreset] = useState<Preset>("pn");
  const [charges, setCharges] = useResettable<PointCharge[]>(presets.pn);
  const [density, setDensity] = useState(8);
  const [showVectors, setShowVectors] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const { touch } = useStore();

  const applyPreset = (p: Preset) => { setPreset(p); setCharges(presets[p].map(c => ({ ...c }))); touch("preset"); };
  const bounds = { minX: -1.2, maxX: 1.2, minY: -0.8, maxY: 0.8 };
  const lines = useMemo(() => generateFieldLines(charges, bounds, density, 1e-6, 0.006), [charges, density]);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    // equipotential faint contours (sampled)
    if (showEq) {
      const levels = [-3e5, -1.5e5, -8e4, -4e4, -2e4, -1e4, 1e4, 2e4, 4e4, 8e4, 1.5e5, 3e5];
      const step = 6;
      ctx.fillStyle = w.dark ? "rgba(16,185,129,.35)" : "rgba(5,150,105,.35)";
      for (let px = 0; px < w.w; px += step) for (let py = 0; py < w.h; py += step) {
        const m = w.toM(px, py); const v = potentialAt(charges, m.x, m.y);
        const mx = w.toM(px + step, py), my = w.toM(px, py + step);
        const vx = potentialAt(charges, mx.x, mx.y), vy = potentialAt(charges, my.x, my.y);
        for (const L of levels) if ((v - L) * (vx - L) < 0 || (v - L) * (vy - L) < 0) { ctx.fillRect(px, py, 2, 2); break; }
      }
    }
    // field lines
    ctx.lineWidth = 1.6;
    for (const ln of lines) {
      if (ln.pts.length < 2) continue;
      ctx.strokeStyle = w.dark ? "rgba(125,211,252,.85)" : "rgba(3,105,161,.8)";
      ctx.beginPath();
      const p0 = w.toPx(ln.pts[0].x, ln.pts[0].y); ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < ln.pts.length; i++) { const p = w.toPx(ln.pts[i].x, ln.pts[i].y); ctx.lineTo(p.x, p.y); }
      ctx.stroke();
      // arrow heads along the line at a few positions
      for (const frac of [0.25, 0.6]) {
        const i = Math.floor(ln.pts.length * frac); if (i < 1 || i >= ln.pts.length) continue;
        const a = w.toPx(ln.pts[i - 1].x, ln.pts[i - 1].y), b = w.toPx(ln.pts[i].x, ln.pts[i].y);
        const s = ln.positive ? 1 : -1;
        const dx = (b.x - a.x) * s, dy = (b.y - a.y) * s; const L = Math.hypot(dx, dy); if (L < 0.1) continue;
        arrow(ctx, b.x - dx / L * 6, b.y - dy / L * 6, b.x + dx / L * 6, b.y + dy / L * 6, w.dark ? "#7dd3fc" : "#0369a1", 1.6, 8);
      }
    }
    if (showVectors) {
      const gap = 40; const maxE = 3e6;
      for (let px = gap / 2; px < w.w; px += gap) for (let py = gap / 2; py < w.h; py += gap) {
        const m = w.toM(px, py); const e = fieldAt(charges, m.x, m.y); const em = vlen(e); if (em === 0) continue;
        const L = 6 + 16 * Math.min(1, Math.log10(1 + em / maxE * 99) / 2);
        arrow(ctx, px - e.x / em * L / 2, py + e.y / em * L / 2, px + e.x / em * L / 2, py - e.y / em * L / 2, fieldColor(em, maxE), 1.4, 5);
      }
    }
    charges.forEach((c, i) => {
      const p = w.toPx(c.x, c.y);
      chargeBall(ctx, p.x, p.y, 13 + Math.min(10, Math.abs(c.q) * 1e6 * 1.5), c.q, true, w.t);
      label(ctx, `q${i + 1} = ${c.q > 0 ? "+" : ""}${(c.q * 1e6).toFixed(1)} µC`, p.x, p.y - 32, c.q > 0 ? "#f43f5e" : "#3b82f6", w.dark, 11);
    });
    if (hover) {
      const e = fieldAt(charges, hover.x, hover.y); const em = vlen(e);
      if (em > 0) { const p = w.toPx(hover.x, hover.y); const L = 40; arrow(ctx, p.x, p.y, p.x + e.x / em * L, p.y - e.y / em * L, "#f59e0b", 2.5, 9); label(ctx, `E = ${(em / 1e3).toFixed(1)} kN/C`, p.x, p.y - 22, "#f59e0b", w.dark, 11); }
    }
  };

  const total = charges.reduce((s, c) => s + c.q, 0);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="خطوط میدان" onHover={setHover}
        bodies={charges.map((c, i) => ({ id: `c${i}`, x: c.x, y: c.y, r: 26, onMove: (x, y) => { setCharges(cs => cs.map((cc, j) => j === i ? { ...cc, x, y } : cc)); touch("pos"); } }))}
        probe={(x, y) => ({ E: fieldAt(charges, x, y), V: potentialAt(charges, x, y) })}
        logValues={() => Object.fromEntries(charges.map((c, i) => [`q${i + 1} (µC)@(${c.x.toFixed(2)},${c.y.toFixed(2)})`, +(c.q * 1e6).toFixed(2)]))} />}
      controls={<>
        <Panel title="پیکربندی بارها">
          <Segmented id="preset" value={preset} onChange={applyPreset} options={[
            { value: "pos", label: "یک + " }, { value: "neg", label: "یک −" }, { value: "pp", label: "+ +" }, { value: "nn", label: "− −" }, { value: "pn", label: "+ −" }, { value: "multi", label: "چند بار" }]} />
        </Panel>
        <Panel title="مقدار بارها (µC)">
          {charges.map((c, i) => (
            <div key={i} className="mb-3">
              <Slider id={`q${i + 1}`} label={`q${i + 1}`} value={+(c.q * 1e6).toFixed(1)} min={-6} max={6} step={0.5} unit="µC" onChange={v => setCharges(cs => cs.map((cc, j) => j === i ? { ...cc, q: v * 1e-6 } : cc))} />
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" disabled={charges.length >= 6} onClick={() => setCharges(cs => [...cs, { x: 0.1 * cs.length - 0.2, y: -0.3, q: 2e-6 }])}>+ افزودن بار</Button>
            <Button variant="ghost" className="flex-1" disabled={charges.length <= 1} onClick={() => setCharges(cs => cs.slice(0, -1))}>− حذف آخرین</Button>
          </div>
        </Panel>
        <Panel title="نمایش">
          <Slider id="density" label="چگالی خطوط (خط بر µC)" value={density} min={4} max={16} step={1} unit="" onChange={setDensity} />
          <div className="mt-3 space-y-2">
            <Toggle label="بردارهای میدان" checked={showVectors} onChange={setShowVectors} />
            <Toggle label="سطوح هم‌پتانسیل (سبز)" checked={showEq} onChange={setShowEq} />
          </div>
        </Panel>
      </>}
      bottom={<>
        <Panel title="آمار">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="تعداد خطوط رسم‌شده" value={lines.length} />
            <Readout label="بار کل" value={(total * 1e6).toFixed(1)} unit="µC" />
            <Readout label="تعداد بارها" value={charges.length} />
            <Readout label="E زیر نشانگر" value={hover ? (vlen(fieldAt(charges, hover.x, hover.y)) / 1e3).toFixed(1) : "—"} unit="kN/C" accent="text-amber-500" />
          </div>
        </Panel>
        <Panel title="قواعد خطوط میدان" className="xl:col-span-2">
          <ul className="grid gap-1.5 text-xs text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <li>◆ خطوط از بار مثبت خارج و به بار منفی وارد می‌شوند.</li>
            <li>◆ تعداد خطوط با اندازهٔ بار متناسب است (بار بزرگ‌تر ← خطوط بیشتر).</li>
            <li>◆ تراکم خطوط بیشتر = میدان قوی‌تر (نشانگر را روی صفحه حرکت دهید).</li>
            <li>◆ خطوط میدان هرگز یکدیگر را قطع نمی‌کنند.</li>
            <li>◆ مماس بر خط میدان در هر نقطه، جهت E⃗ را نشان می‌دهد.</li>
            <li>◆ خطوط میدان بر سطوح هم‌پتانسیل عمودند.</li>
          </ul>
        </Panel>
      </>}
    />
  );
}

export const fieldLinesMeta: ExperimentMeta = {
  id: "fieldlines", title: "خطوط میدان الکتریکی", subtitle: "رسم خطوط میدان با محاسبهٔ واقعی", icon: "🕸️",
  params: [],
  prediction: { question: "خطوط میدان بین دو بار مثبت هم‌اندازه در نقطهٔ وسط آن‌ها چگونه است؟", options: ["بسیار متراکم (میدان قوی)", "هیچ خطی از آنجا نمی‌گذرد (میدان صفر)", "خطوط یکدیگر را قطع می‌کنند", "خطوط دایره‌ای می‌شوند"], correct: 1 },
  analysis: ["حالت «+ −» را انتخاب کنید و نشانگر را بین دو بار ببرید: E چقدر است؟ حالا در حالت «+ +» همین کار را بکنید.", "q₁ را دو برابر کنید؛ تعداد خطوط خارج‌شده از آن چه تغییری می‌کند؟", "بارها را جابه‌جا کنید؛ آیا خطوط بلافاصله بازسازی می‌شوند؟", "آیا جایی پیدا می‌کنید که دو خط همدیگر را قطع کنند؟ چرا ممکن نیست؟"],
  conclusion: <>
    <p className="text-xs leading-6">خطوط میدان ابزار تجسم میدان‌اند: جهت آن‌ها جهت E⃗ و تراکم آن‌ها اندازهٔ E را نشان می‌دهد. از بار مثبت خارج و به بار منفی وارد می‌شوند و هرگز یکدیگر را قطع نمی‌کنند، چون در هر نقطه میدان فقط یک جهت دارد.</p>
    <Formula label="اصل برهم‌نهی">E⃗ = E⃗₁ + E⃗₂ + …</Formula>
  </>,
  definition: <p className="leading-6"><Term k="preset">هر آرایش بارها الگوی متفاوتی از خطوط ایجاد می‌کند.</Term> <Term k={["q1", "q2", "q3", "q4"]}>تعداد خطوط با اندازهٔ بار متناسب است.</Term> <Term k="pos">با جابه‌جایی بار، میدان در تمام نقاط تغییر می‌کند و خطوط بازسازی می‌شوند.</Term></p>,
  Component: FieldLines,
};
