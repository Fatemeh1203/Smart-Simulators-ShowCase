import { useMemo, useState } from "react";
import { LabCanvas, arrow, chargeBall, drawAxes, fieldColor, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Segmented, Slider, Term, Toggle } from "../components/ui";
import { K, fieldAt, fmt, fmtSI, potentialAt, vlen } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { LiveChart } from "../components/Chart";
import { useStore } from "../store";

const SCALE = 460;

// ================= 4. Electric field & test charge =================
function FieldLab() {
  const [Q, setQ] = useParam("Q", 4); // µC
  const [q0, setQ0] = useParam("q0", 1); // nC
  const [showGrid, setShowGrid] = useState(true);
  const [pt, setPt] = useResettable({ x: 0.22, y: 0.12 });
  const { touch, tools, toggleTool } = useStore();
  const testOn = tools.testcharge;
  const setTestOn = (v: boolean) => { if (v !== tools.testcharge) toggleTool("testcharge"); };

  const src = useMemo(() => [{ x: 0, y: 0, q: Q * 1e-6 }], [Q]);
  const r = Math.hypot(pt.x, pt.y);
  const E = fieldAt(src, pt.x, pt.y);
  const Em = vlen(E);
  const F = { x: E.x * q0 * 1e-9, y: E.y * q0 * 1e-9 };
  const Fm = vlen(F);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawAxes(ctx, w);
    const o = w.toPx(0, 0);
    if (showGrid) {
      const gap = 44; const maxE = K * Math.abs(Q) * 1e-6 / (0.06 * 0.06);
      for (let px = gap / 2; px < w.w; px += gap) for (let py = gap / 2; py < w.h; py += gap) {
        const m = w.toM(px, py); const e = fieldAt(src, m.x, m.y); const em = vlen(e); if (em === 0) continue;
        const d = Math.hypot(m.x, m.y); if (d < 0.05) continue;
        const L = 8 + 22 * Math.min(1, Math.log10(1 + em / maxE * 99) / 2);
        arrow(ctx, px - e.x / em * L / 2, py + e.y / em * L / 2, px + e.x / em * L / 2, py - e.y / em * L / 2, fieldColor(em, maxE), 1.6, 6);
      }
    }
    // distance
    const p = w.toPx(pt.x, pt.y);
    ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = w.dark ? "rgba(148,163,184,.5)" : "rgba(71,85,105,.5)"; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
    label(ctx, `r = ${(r * 100).toFixed(1)} cm`, (o.x + p.x) / 2, (o.y + p.y) / 2 + 18, w.dark ? "#e2e8f0" : "#334155", w.dark, 11);
    chargeBall(ctx, o.x, o.y, 22, Q, true, w.t);
    label(ctx, `Q = ${Q > 0 ? "+" : ""}${Q} µC (منبع)`, o.x, o.y + 40, Q > 0 ? "#f43f5e" : "#3b82f6", w.dark);
    // field vector at point (always)
    if (Em > 0) {
      const L = Math.min(150, 30 + 30 * Math.log10(1 + Em / 1e4));
      arrow(ctx, p.x, p.y, p.x + E.x / Em * L, p.y - E.y / Em * L, "#a855f7", 3, 10);
      label(ctx, `E⃗ = ${fmtSI(Em, "N/C")}`, p.x + E.x / Em * (L + 10), p.y - E.y / Em * (L + 10) - 16, "#a855f7", w.dark, 11);
    }
    if (testOn) {
      chargeBall(ctx, p.x, p.y, 10, q0, false, w.t);
      if (Fm > 0) {
        const L = Math.min(120, 24 + 30 * Math.log10(1 + Fm / 1e-5));
        arrow(ctx, p.x, p.y - 14, p.x + F.x / Fm * L, p.y - 14 - F.y / Fm * L, "#f59e0b", 3, 10);
        label(ctx, `F⃗ = q₀E⃗ = ${fmtSI(Fm, "N")}`, p.x, p.y + 28, "#f59e0b", w.dark, 11);
      }
    } else {
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = "#94a3b8"; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      label(ctx, "بدون بار آزمون: میدان همچنان وجود دارد، نیرو نه", p.x, p.y + 28, "#94a3b8", w.dark, 11);
    }
  };

  const dataE = useMemo(() => { const o = []; for (let rr = 0.05; rr <= 0.6; rr += 0.01) o.push({ r: +(rr * 100).toFixed(0), E: K * Math.abs(Q) * 1e-6 / (rr * rr), F: K * Math.abs(Q) * 1e-6 / (rr * rr) * Math.abs(q0) * 1e-9 }); return o; }, [Q, q0]);
  const dataQ0 = useMemo(() => { const o = []; for (let qq = -5; qq <= 5; qq += 0.25) o.push({ q0: qq, F: Em * Math.abs(qq) * 1e-9, E: Em }); return o; }, [Em]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="میدان الکتریکی"
        bodies={[{ id: "test", x: pt.x, y: pt.y, r: 26, onMove: (x, y) => { if (Math.hypot(x, y) > 0.04) { setPt({ x, y }); touch("pos"); } } }]}
        probe={(x, y) => ({ E: fieldAt(src, x, y), V: potentialAt(src, x, y), F: (() => { const e = fieldAt(src, x, y); return { x: e.x * q0 * 1e-9, y: e.y * q0 * 1e-9 }; })() })}
        logValues={() => ({ "Q (µC)": Q, "q0 (nC)": testOn ? q0 : 0, "r (cm)": +(r * 100).toFixed(2), "E (N/C)": +Em.toFixed(1), "F (N)": testOn ? +Fm.toExponential(3) : 0 })} />}
      controls={<>
        <Panel title="بار منبع">
          <Slider id="Q" label="Q" value={Q} min={-10} max={10} step={0.1} unit="µC" onChange={setQ} />
        </Panel>
        <Panel title="بار آزمون">
          <Toggle id="testOn" label="بار آزمون فعال" checked={testOn} onChange={setTestOn} />
          <div className="h-3" />
          <Slider id="q0" label="q₀" value={q0} min={-5} max={5} step={0.1} unit="nC" onChange={setQ0} />
          <p className="mt-2 text-[11px] text-slate-500">بار آزمون را با ماوس بکشید. با خاموش کردن آن، ببینید میدان تغییری می‌کند یا نه.</p>
        </Panel>
        <Panel title="نمایش">
          <Toggle label="نقشهٔ بردارهای میدان" checked={showGrid} onChange={setShowGrid} />
        </Panel>
      </>}
      bottom={<>
        <Panel title="خوانش‌ها در محل بار آزمون">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="فاصله r" value={(r * 100).toFixed(1)} unit="cm" />
            <Readout label="میدان E" value={fmt(Em)} unit="N/C" accent="text-purple-500" />
            <Readout label="نیرو F = q₀E" value={testOn ? fmt(Fm) : "—"} unit="N" accent="text-amber-500" />
            <Readout label="E = F/q₀" value={testOn && q0 !== 0 ? fmt(Fm / Math.abs(q0 * 1e-9)) : "—"} unit="N/C" sub="مستقل از q₀" />
          </div>
        </Panel>
        <Panel title="E و F بر حسب r">
          <LiveChart data={dataE} xKey="r" series={[{ key: "E", color: "#a855f7", name: "E (N/C)" }]} xLabel="r (cm)" yLabel="E (N/C)" marker={{ x: +(r * 100).toFixed(0), y: Em }} />
        </Panel>
        <Panel title="F بر حسب q₀ (E ثابت)">
          <LiveChart data={dataQ0} xKey="q0" series={[{ key: "F", color: "#f59e0b", name: "F (N)" }]} xLabel="q₀ (nC)" yLabel="F (N)" marker={{ x: q0, y: Fm }} />
        </Panel>
      </>}
    />
  );
}

export const fieldMeta: ExperimentMeta = {
  id: "field", title: "میدان الکتریکی", subtitle: "بار منبع، بار آزمون، تفاوت میدان و نیرو", icon: "🌐",
  params: [{ id: "Q", label: "Q منبع", min: -10, max: 10, def: 4, unit: "µC" }, { id: "q0", label: "q₀ آزمون", min: -5, max: 5, def: 1, unit: "nC" }],
  prediction: { question: "اگر بار آزمون q₀ را دو برابر کنیم (Q و r ثابت)، میدان E در آن نقطه چه می‌شود؟", options: ["دو برابر", "نصف", "بدون تغییر", "چهار برابر"], correct: 2 },
  analysis: ["بار آزمون را خاموش کنید: آیا بردار میدان E حذف شد؟ نیرو چطور؟", "q₀ را تغییر دهید: کدام کمیت تغییر می‌کند، E یا F؟", "نسبت F/q₀ را در چند حالت حساب کنید؛ چه نتیجه‌ای می‌گیرید؟", "علامت q₀ را منفی کنید: جهت F نسبت به E چگونه است؟"],
  conclusion: <>
    <p className="text-xs leading-6">میدان الکتریکی ویژگی <b>فضا</b>ی اطراف بار منبع است و با حضور یا عدم حضور بار آزمون تغییر نمی‌کند. نیرو بر بار آزمون برابر q₀E است؛ برای بار مثبت هم‌جهت با E و برای بار منفی خلاف جهت E.</p>
    <Formula label="تعریف میدان الکتریکی">E⃗ = F⃗ / q₀   (N/C)</Formula>
    <Formula label="نیرو بر بار در میدان">F⃗ = q₀ E⃗</Formula>
  </>,
  definition: <p className="leading-6"><Term k="Q">میدان الکتریکی توسط بار منبع ایجاد می‌شود.</Term> <Term k="pos">اندازهٔ میدان به فاصله از منبع بستگی دارد.</Term> <Term k={["q0", "testOn"]}>بار آزمون فقط میدان را «آشکار» می‌کند؛ نیرو = q₀E، اما E مستقل از q₀ است.</Term></p>,
  Component: FieldLab,
};

// ================= 5. Field of a point charge =================
interface Snap { label: string; Q: number; color: string }
const snapColors = ["#f59e0b", "#22d3ee", "#a855f7"];

function PointField() {
  const [Q, setQ] = useParam("Q", 3);
  const [sign, setSign] = useState<"+" | "-">("+");
  const [rProbe, setRProbe] = useParam("rp", 0.2);
  const [snaps, setSnaps] = useResettable<Snap[]>([]);
  const [view, setView] = useState<"vectors" | "rings">("vectors");
  const { touch } = useStore();
  const Qs = (sign === "+" ? 1 : -1) * Math.abs(Q);
  const src = useMemo(() => [{ x: 0, y: 0, q: Qs * 1e-6 }], [Qs]);
  const Eprobe = K * Math.abs(Qs) * 1e-6 / (rProbe * rProbe);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawAxes(ctx, w);
    const o = w.toPx(0, 0);
    const maxE = K * Math.abs(Qs) * 1e-6 / (0.06 * 0.06);
    if (view === "vectors") {
      const gap = 38;
      for (let px = gap / 2; px < w.w; px += gap) for (let py = gap / 2; py < w.h; py += gap) {
        const m = w.toM(px, py); const e = fieldAt(src, m.x, m.y); const em = vlen(e); if (em === 0 || Math.hypot(m.x, m.y) < 0.05) continue;
        const L = 8 + 20 * Math.min(1, Math.log10(1 + em / maxE * 99) / 2);
        arrow(ctx, px - e.x / em * L / 2, py + e.y / em * L / 2, px + e.x / em * L / 2, py - e.y / em * L / 2, fieldColor(em, maxE), 1.7, 6);
      }
    } else {
      // radial rings with arrows around
      for (let rr = 0.08; rr < 0.6; rr += 0.08) {
        const e = K * Math.abs(Qs) * 1e-6 / (rr * rr);
        ctx.strokeStyle = fieldColor(e, maxE); ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(o.x, o.y, rr * w.scale, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        const n = 12; const L = 8 + 24 * Math.min(1, Math.log10(1 + e / maxE * 99) / 2);
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2; const px = o.x + Math.cos(a) * rr * w.scale, py = o.y + Math.sin(a) * rr * w.scale;
          const s = Qs > 0 ? 1 : -1;
          arrow(ctx, px, py, px + s * Math.cos(a) * L, py + s * Math.sin(a) * L, fieldColor(e, maxE), 1.8, 6);
        }
        label(ctx, `${fmtSI(e, "N/C")}`, o.x + rr * w.scale * 0.72, o.y - rr * w.scale * 0.72, fieldColor(e, maxE), w.dark, 10);
      }
    }
    // probe ring
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, o.y, rProbe * w.scale, 0, Math.PI * 2); ctx.stroke();
    const pp = w.toPx(rProbe, 0);
    ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(pp.x, pp.y, 7, 0, Math.PI * 2); ctx.fill();
    label(ctx, `r = ${(rProbe * 100).toFixed(0)} cm → E = ${fmtSI(Eprobe, "N/C")}`, pp.x, pp.y - 20, "#f59e0b", w.dark, 11);
    chargeBall(ctx, o.x, o.y, 18 + Math.min(10, Math.abs(Qs)), Qs, true, w.t);
  };

  const data = useMemo(() => {
    const o: Record<string, number>[] = [];
    for (let rr = 0.05; rr <= 0.6; rr += 0.01) {
      const row: Record<string, number> = { r: +(rr * 100).toFixed(0), E: K * Math.abs(Qs) * 1e-6 / (rr * rr) };
      snaps.forEach((s, i) => { row[`s${i}`] = K * Math.abs(s.Q) * 1e-6 / (rr * rr); });
      o.push(row);
    }
    return o;
  }, [Qs, snaps]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="میدان ذره باردار"
        bodies={[{ id: "probe", x: rProbe, y: 0, r: 20, onMove: (x, y) => { setRProbe(Math.max(0.05, Math.min(0.6, Math.hypot(x, y)))); touch("rp"); } }]}
        probe={(x, y) => ({ E: fieldAt(src, x, y), V: potentialAt(src, x, y) })}
        logValues={() => ({ "Q (µC)": Qs, "r (cm)": +(rProbe * 100).toFixed(1), "E (N/C)": +Eprobe.toFixed(1) })} />}
      controls={<>
        <Panel title="بار ذره">
          <Segmented id="sign" options={[{ value: "+", label: "مثبت (+)" }, { value: "-", label: "منفی (−)" }]} value={sign} onChange={setSign} />
          <div className="h-3" />
          <Slider id="Q" label="|Q|" value={Q} min={0.5} max={10} step={0.1} unit="µC" onChange={setQ} />
        </Panel>
        <Panel title="نقطهٔ اندازه‌گیری">
          <Slider id="rp" label="فاصله r" value={rProbe} min={0.05} max={0.6} step={0.005} unit="m" onChange={setRProbe} format={v => `${(v * 100).toFixed(1)} cm`} />
        </Panel>
        <Panel title="نمایش و مقایسه">
          <Segmented options={[{ value: "vectors", label: "شبکهٔ بردار" }, { value: "rings", label: "حلقه‌های شعاعی" }]} value={view} onChange={setView} />
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" disabled={snaps.length >= 3} onClick={() => setSnaps(s => [...s, { label: `Q=${Qs}µC`, Q: Qs, color: snapColors[s.length] }])}>ذخیرهٔ حالت برای مقایسه</Button>
            <Button variant="ghost" onClick={() => setSnaps([])}>پاک</Button>
          </div>
          {snaps.map((s, i) => <div key={i} className="mt-1 text-[11px]" style={{ color: s.color }}>● حالت {i + 1}: {s.label}</div>)}
        </Panel>
      </>}
      bottom={<>
        <Panel title="خوانش">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="E در فاصله r" value={fmt(Eprobe)} unit="N/C" accent="text-purple-500" />
            <Readout label="E در 2r" value={fmt(Eprobe / 4)} unit="N/C" sub="یک‌چهارم" />
            <Readout label="E در r/2" value={fmt(Eprobe * 4)} unit="N/C" sub="چهار برابر" />
            <Readout label="جهت" value={Qs > 0 ? "به بیرون" : "به درون"} />
          </div>
        </Panel>
        <Panel title="E بر حسب r (با حالت‌های ذخیره‌شده)" className="md:col-span-1 xl:col-span-2">
          <LiveChart data={data} xKey="r" series={[{ key: "E", color: "#a855f7", name: "فعلی" }, ...snaps.map((s, i) => ({ key: `s${i}`, color: s.color, name: s.label, dashed: true }))]} xLabel="r (cm)" yLabel="E (N/C)" marker={{ x: +(rProbe * 100).toFixed(0), y: Eprobe }} />
        </Panel>
      </>}
    />
  );
}

export const pointFieldMeta: ExperimentMeta = {
  id: "pointfield", title: "میدان یک ذره باردار", subtitle: "وابستگی میدان به بار و فاصله", icon: "✴️",
  params: [{ id: "Q", label: "|Q|", min: 0.5, max: 10, def: 3, unit: "µC" }, { id: "rp", label: "فاصله r", min: 0.05, max: 0.6, def: 0.2, unit: "m" }],
  prediction: { question: "در فاصلهٔ r از یک بار نقطه‌ای، میدان E است. در فاصلهٔ 3r میدان چقدر است؟", options: ["E/3", "E/9", "3E", "E"], correct: 1 },
  analysis: ["حلقهٔ نارنجی را از ۱۰ به ۲۰ و سپس ۳۰ سانتی‌متر ببرید و E را یادداشت کنید.", "دو حالت با Q و 2Q را ذخیره و روی نمودار مقایسه کنید.", "علامت Q را عوض کنید: چه چیزی تغییر می‌کند و چه چیزی نه؟", "رنگ و طول بردارها با فاصله چگونه تغییر می‌کند؟"],
  conclusion: <>
    <p className="text-xs leading-6">میدان یک ذرهٔ باردار شعاعی است: برای بار مثبت به سمت بیرون و برای بار منفی به سمت درون. اندازهٔ آن با |Q| نسبت مستقیم و با مجذور فاصله نسبت وارون دارد.</p>
    <Formula label="میدان بار نقطه‌ای">E = k |Q| / r²</Formula>
  </>,
  definition: <p className="leading-6"><Term k="Q">اندازهٔ میدان با اندازهٔ بار منبع نسبت مستقیم دارد.</Term> <Term k="rp">با دور شدن از بار، میدان با مجذور فاصله کاهش می‌یابد.</Term> <Term k="sign">علامت بار فقط جهت میدان را تعیین می‌کند.</Term></p>,
  Component: PointField,
};
