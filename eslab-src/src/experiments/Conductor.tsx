import { useEffect, useMemo, useRef, useState } from "react";
import { LabCanvas, arrow, chargeBall, fieldColor, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Segmented, Slider, Term, Toggle } from "../components/ui";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam } from "../hooks";
import { useStore } from "../store";
import { LiveChart } from "../components/Chart";

const SCALE = 460;
type Shape = "sphere" | "plate" | "irregular";
const N_FIX = 40;

// boundary parametrisation s ∈ [0,1)
function boundary(shape: Shape, s: number): { x: number; y: number } {
  const th = s * Math.PI * 2;
  if (shape === "sphere") return { x: 0.2 * Math.cos(th), y: 0.2 * Math.sin(th) };
  if (shape === "irregular") { const r = 0.16 * (1 + 0.5 * Math.cos(th)) + 0.04; return { x: r * Math.cos(th) - 0.04, y: r * Math.sin(th) * 0.95 }; }
  // plate: rounded rectangle 0.56 x 0.08 via superellipse
  const a = 0.28, b = 0.045, n = 6;
  const c = Math.cos(th), sn = Math.sin(th);
  return { x: a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), y: b * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / n) };
}
function tangent(shape: Shape, s: number) {
  const h = 1e-4; const p1 = boundary(shape, s - h), p2 = boundary(shape, s + h);
  const dx = p2.x - p1.x, dy = p2.y - p1.y; const L = Math.hypot(dx, dy);
  return { x: dx / L, y: dy / L, speed: L / (2 * h) };
}
function inside(shape: Shape, x: number, y: number) {
  if (shape === "sphere") return Math.hypot(x, y) < 0.2;
  if (shape === "plate") return Math.abs(x) < 0.28 && Math.abs(y) < 0.045;
  const th = Math.atan2(y / 0.95, x + 0.04); const r = 0.16 * (1 + 0.5 * Math.cos(th)) + 0.04;
  return Math.hypot(x + 0.04, y / 0.95) < r;
}

interface Src { x: number; y: number; q: number }
function field2D(srcs: Src[], x: number, y: number) { // 2D (line-charge) law: E ∝ q/r
  let ex = 0, ey = 0;
  for (const s of srcs) { const dx = x - s.x, dy = y - s.y; const r2 = dx * dx + dy * dy + 1e-5; ex += s.q * dx / r2; ey += s.q * dy / r2; }
  return { x: ex, y: ey };
}

function Conductor() {
  const [shape, setShape] = useState<Shape>("sphere");
  const [net, setNet] = useParam("net", -8); // net charge units (negative = excess electrons)
  const [extOn, setExtOn] = useState(false);
  const [extQ, setExtQ] = useParam("extQ", 15);
  const [extPos, setExtPos] = useState({ x: 0.45, y: 0.05 });
  const [showField, setShowField] = useState(true);
  const [showDensity, setShowDensity] = useState(true);
  const electrons = useRef<number[]>([]); // s positions
  const [, tick] = useState(0);
  const { touch } = useStore();
  const [stats, setStats] = useState({ inside: 0, outside: 1, hist: [] as { s: number; sigma: number }[] });
  const statTimer = useRef(0);

  const nE = N_FIX - net;
  // (re)initialise electrons when count/shape changes: new ones start at s=0 (a point), others keep positions
  useEffect(() => {
    const cur = electrons.current;
    if (cur.length > nE) electrons.current = cur.slice(0, nE);
    else while (electrons.current.length < nE) electrons.current.push(0.02 * (Math.random() - 0.5));
    // eslint-disable-next-line
  }, [nE]);
  useEffect(() => { electrons.current = Array.from({ length: nE }, (_, i) => i / nE + 0.003 * Math.random()); tick(t => t + 1); /* eslint-disable-next-line */ }, [shape]);

  const fixed = useMemo<Src[]>(() => Array.from({ length: N_FIX }, (_, i) => ({ ...boundary(shape, i / N_FIX), q: 1 })), [shape]);

  const allSources = (): Src[] => {
    const mob = electrons.current.map(s => ({ ...boundary(shape, s), q: -1 }));
    const arr = [...fixed, ...mob];
    if (extOn) arr.push({ x: extPos.x, y: extPos.y, q: extQ });
    return arr;
  };

  const relax = (iters: number) => {
    const el = electrons.current;
    for (let it = 0; it < iters; it++) {
      const pts = el.map(s => boundary(shape, s));
      const ds = new Array(el.length).fill(0);
      for (let i = 0; i < el.length; i++) {
        let fx = 0, fy = 0;
        const p = pts[i];
        for (let j = 0; j < el.length; j++) { if (i === j) continue; const dx = p.x - pts[j].x, dy = p.y - pts[j].y; const r2 = dx * dx + dy * dy + 2e-5; fx += dx / r2; fy += dy / r2; } // e-e repulsion
        for (const f of fixed) { const dx = p.x - f.x, dy = p.y - f.y; const r2 = dx * dx + dy * dy + 2e-5; fx -= dx / r2; fy -= dy / r2; } // attraction to ions
        if (extOn) { const dx = p.x - extPos.x, dy = p.y - extPos.y; const r2 = dx * dx + dy * dy + 1e-4; fx -= extQ * dx / r2; fy -= extQ * dy / r2; }
        const t = tangent(shape, el[i]);
        const ft = fx * t.x + fy * t.y;
        ds[i] = Math.max(-0.003, Math.min(0.003, 4e-6 * ft / t.speed));
      }
      for (let i = 0; i < el.length; i++) { el[i] = ((el[i] + ds[i]) % 1 + 1) % 1; }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    relax(6);
    const srcs = allSources();
    // conductor body
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const p = boundary(shape, i / 120); const q = w.toPx(p.x, p.y); if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
    ctx.closePath();
    ctx.fillStyle = w.dark ? "rgba(148,163,184,.18)" : "rgba(100,116,139,.18)"; ctx.fill();
    ctx.strokeStyle = w.dark ? "#94a3b8" : "#475569"; ctx.lineWidth = 2; ctx.stroke();
    // field grid
    let maxE = 0; const samples: { px: number; py: number; e: { x: number; y: number }; m: number; inside: boolean }[] = [];
    const gap = 30;
    for (let px = gap / 2; px < w.w; px += gap) for (let py = gap / 2; py < w.h; py += gap) {
      const m = w.toM(px, py); const ins = inside(shape, m.x, m.y);
      const e = field2D(srcs, m.x, m.y); const mag = Math.hypot(e.x, e.y);
      if (!ins) maxE = Math.max(maxE, mag);
      samples.push({ px, py, e, m: mag, inside: ins });
    }
    let insSum = 0, insN = 0, outSum = 0, outN = 0;
    for (const s of samples) {
      const m = w.toM(s.px, s.py); const d = Math.hypot(m.x, m.y);
      if (s.inside) { insSum += s.m; insN++; } else if (d < 0.36 && d > 0.2) { outSum += s.m; outN++; }
      if (!showField) continue;
      if (s.m === 0) continue;
      const L = 6 + 18 * Math.min(1, s.m / (maxE * 0.5));
      if (s.inside) { ctx.fillStyle = "rgba(16,185,129,.6)"; ctx.beginPath(); ctx.arc(s.px, s.py, 1.5 + 6 * Math.min(1, s.m / (maxE * 0.5)), 0, Math.PI * 2); ctx.fill(); }
      else arrow(ctx, s.px - s.e.x / s.m * L / 2, s.py + s.e.y / s.m * L / 2, s.px + s.e.x / s.m * L / 2, s.py - s.e.y / s.m * L / 2, fieldColor(s.m, maxE * 0.6), 1.5, 5);
    }
    // surface charge density bars
    const bins = 36; const hist = new Array(bins).fill(0);
    for (const s of electrons.current) hist[Math.floor(((s % 1) + 1) % 1 * bins) % bins] -= 1;
    for (let i = 0; i < N_FIX; i++) hist[Math.floor(i / N_FIX * bins) % bins] += 1;
    if (showDensity) {
      for (let i = 0; i < bins; i++) {
        const s = (i + 0.5) / bins; const p = boundary(shape, s); const t = tangent(shape, s);
        const nx = t.y, ny = -t.x; // outward normal (for CCW param)
        const q = w.toPx(p.x, p.y); const h = hist[i] * 9;
        ctx.strokeStyle = hist[i] < 0 ? "rgba(59,130,246,.85)" : hist[i] > 0 ? "rgba(244,63,94,.85)" : "transparent"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + nx * Math.abs(h), q.y - ny * Math.abs(h)); ctx.stroke();
      }
    }
    // draw charges
    for (const f of fixed) { const q = w.toPx(f.x, f.y); ctx.strokeStyle = "rgba(244,63,94,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q.x - 3, q.y); ctx.lineTo(q.x + 3, q.y); ctx.moveTo(q.x, q.y - 3); ctx.lineTo(q.x, q.y + 3); ctx.stroke(); }
    for (const s of electrons.current) { const p = boundary(shape, s); const q = w.toPx(p.x, p.y); ctx.fillStyle = "#60a5fa"; ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(q.x, q.y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    if (extOn) { const q = w.toPx(extPos.x, extPos.y); chargeBall(ctx, q.x, q.y, 14, extQ, true, w.t); label(ctx, "بار خارجی (بکشید)", q.x, q.y - 26, extQ > 0 ? "#f43f5e" : "#3b82f6", w.dark, 10); }
    const o = w.toPx(0, 0);
    label(ctx, "درون رسانا: E ≈ 0", o.x, o.y, "#10b981", w.dark, 12);
    label(ctx, `بار خالص رسانا: ${net > 0 ? "+" : ""}${net} واحد`, w.w / 2, 22, w.dark ? "#e2e8f0" : "#334155", w.dark, 12);
    // stats throttle
    if (performance.now() - statTimer.current > 250) {
      statTimer.current = performance.now();
      setStats({ inside: insN ? insSum / insN : 0, outside: outN ? outSum / outN : 1, hist: hist.map((v, i) => ({ s: +((i + 0.5) / bins * 360).toFixed(0), sigma: v })) });
    }
  };

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="میدان درون رسانا"
        bodies={extOn ? [{ id: "ext", x: extPos.x, y: extPos.y, r: 24, onMove: (x, y) => { if (!inside(shape, x, y)) { setExtPos({ x, y }); touch("ext"); } } }] : []}
        probe={(x, y) => { const e = field2D(allSources(), x, y); const m = Math.hypot(e.x, e.y); return { E: e, extra: { "E نسبی": (m / Math.max(1e-9, stats.outside)).toFixed(3) + " × E_سطح" } }; }}
        logValues={() => ({ شکل: shape, "بار خالص": net, "E درون/E سطح": +(stats.inside / Math.max(1e-9, stats.outside)).toFixed(4), "بار خارجی": extOn ? extQ : 0 })} />}
      controls={<>
        <Panel title="شکل رسانا">
          <Segmented id="shape" options={[{ value: "sphere", label: "کره" }, { value: "plate", label: "صفحه" }, { value: "irregular", label: "نامنظم" }]} value={shape} onChange={setShape} />
        </Panel>
        <Panel title="بار روی رسانا">
          <Slider id="net" label="بار خالص (واحد e)" value={net} min={-12} max={12} step={1} unit="" onChange={setNet} format={v => `${v > 0 ? "+" : ""}${v}`} />
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setNet(Math.max(-12, net - 4)); touch("net"); }}>قرار دادن ۴ الکترون در یک نقطه</Button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">الکترون‌های تازه در یک نقطه قرار می‌گیرند و به‌سرعت روی سطح پخش می‌شوند (تعادل الکترواستاتیکی).</p>
        </Panel>
        <Panel title="بار خارجی (القا)">
          <Toggle id="ext" label="بار خارجی نزدیک رسانا" checked={extOn} onChange={setExtOn} />
          {extOn && <div className="mt-3"><Slider id="extQ" label="بار خارجی" value={extQ} min={-30} max={30} step={1} unit="واحد" onChange={setExtQ} /></div>}
        </Panel>
        <Panel title="نمایش">
          <Toggle label="بردارهای میدان" checked={showField} onChange={setShowField} />
          <div className="h-2" />
          <Toggle label="نمودار چگالی سطحی بار" checked={showDensity} onChange={setShowDensity} />
        </Panel>
      </>}
      bottom={<>
        <Panel title="اندازه‌گیری">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="میانگین |E| درون" value={(stats.inside / Math.max(1e-9, stats.outside)).toFixed(3)} unit="× E بیرون" accent="text-emerald-500" />
            <Readout label="تعداد الکترون‌های آزاد" value={nE} />
            <Readout label="یون‌های مثبت ثابت" value={N_FIX} />
            <Readout label="بار خالص" value={`${net > 0 ? "+" : ""}${net}`} unit="واحد" />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">نقاط سبز درون رسانا اندازهٔ میدان محلی را نشان می‌دهند؛ در تعادل تقریباً ناپدید می‌شوند.</p>
        </Panel>
        <Panel title="چگالی بار سطحی در طول محیط رسانا" className="xl:col-span-2">
          <LiveChart data={stats.hist} xKey="s" series={[{ key: "sigma", color: "#3b82f6", name: "بار خالص در هر قطعه" }]} xLabel="زاویهٔ پارامتری (°)" yLabel="σ (نسبی)" xDomain={[0, 360]} />
          <p className="mt-1 text-[11px] text-slate-500">در رسانای نامنظم، بار در نوک تیز (زاویهٔ ۰°/۳۶۰°) متراکم‌تر است. با بار خارجی، بارهای ناهم‌نام به سمت آن جمع می‌شوند (القا).</p>
        </Panel>
      </>}
    />
  );
}

export const conductorMeta: ExperimentMeta = {
  id: "conductor", title: "میدان الکتریکی درون رسانا", subtitle: "توزیع بار و تعادل الکترواستاتیکی", icon: "🛡️",
  params: [{ id: "net", label: "بار خالص", min: -12, max: 12, def: -8, unit: "واحد" }, { id: "extQ", label: "بار خارجی", min: -30, max: 30, def: 15, unit: "واحد" }],
  prediction: { question: "به یک کرهٔ رسانا بار اضافی می‌دهیم. در تعادل، بار اضافی کجا قرار می‌گیرد و میدان درون کره چقدر است؟", options: ["به‌طور یکنواخت در حجم؛ میدان ناصفر", "روی سطح؛ میدان درون صفر", "در مرکز؛ میدان بیشینه در مرکز", "روی سطح؛ میدان درون بیشینه"], correct: 1 },
  analysis: ["دکمهٔ «قرار دادن ۴ الکترون در یک نقطه» را بزنید و پخش‌شدن آن‌ها را ببینید. چرا پخش می‌شوند؟", "شکل نامنظم را انتخاب کنید: چگالی بار در نوک تیز بیشتر است یا کمتر؟", "بار خارجی را روشن کنید و آن را نزدیک رسانای خنثی (بار خالص ۰) ببرید: چه اتفاقی برای الکترون‌ها می‌افتد؟", "نسبت E درون به E بیرون را در حالت‌های مختلف بخوانید."],
  conclusion: <>
    <p className="text-xs leading-6">در تعادل الکترواستاتیکی، بار اضافی یک رسانا فقط روی <b>سطح</b> آن قرار می‌گیرد و میدان الکتریکی در <b>درون</b> رسانا صفر است (وگرنه بارهای آزاد حرکت می‌کردند). میدان نزدیک سطح بر آن عمود است و در نقاط تیز و پرانحنا، چگالی بار و میدان بزرگ‌ترند. یک بار خارجی با القا، بارهای ناهم‌نام را به سمت خود می‌کشد اما باز هم درون رسانا میدان صفر می‌ماند (حفاظ الکترواستاتیکی).</p>
    <Formula label="درون رسانا در تعادل">E_داخل = 0 ,  V = ثابت</Formula>
  </>,
  definition: <p className="leading-6"><Term k="net">بار اضافی روی سطح رسانا توزیع می‌شود.</Term> <Term k="shape">شکل رسانا توزیع بار را تعیین می‌کند: نقاط تیز چگالی بار بیشتری دارند.</Term> <Term k={["ext", "extQ"]}>بار خارجی باعث القای بار می‌شود اما میدان درون همچنان صفر است.</Term></p>,
  Component: Conductor,
};
