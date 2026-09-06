import { useMemo, useRef, useState } from "react";
import { LabCanvas, arrow, chargeBall, drawAxes, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Segmented, Slider, Term, Toggle } from "../components/ui";
import { K, PointCharge, fieldAt, fmt, fmtSI, potentialAt, vlen } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { LiveChart } from "../components/Chart";
import { useStore } from "../store";

const SCALE = 460;

// ================= 7. Electric potential energy =================
function PotentialEnergy() {
  const [Q, setQ] = useParam("Q", 3); // µC
  const [q, setQm] = useParam("q", 2); // nC (moving)
  const [pos, setPos] = useResettable({ x: 0.3, y: 0 });
  const [ref, setRef] = useResettable<{ x: number; y: number } | null>(null);
  const [path, setPath] = useResettable<{ i: number; r: number; U: number; x: number; y: number }[]>([]);
  const lastPush = useRef(0);
  const { touch } = useStore();

  const src = useMemo(() => [{ x: 0, y: 0, q: Q * 1e-6 }], [Q]);
  const r = Math.hypot(pos.x, pos.y);
  const U = K * Q * 1e-6 * q * 1e-9 / r; // J
  const Uref = ref ? K * Q * 1e-6 * q * 1e-9 / Math.hypot(ref.x, ref.y) : null;
  const dU = Uref !== null ? U - Uref : null;
  const W = dU !== null ? -dU : null; // work by electric force from ref to current
  const E = fieldAt(src, pos.x, pos.y);
  const F = { x: E.x * q * 1e-9, y: E.y * q * 1e-9 }; const Fm = vlen(F);

  const move = (x: number, y: number) => {
    if (Math.hypot(x, y) < 0.05) return;
    setPos({ x, y }); touch("pos");
    const now = performance.now();
    if (now - lastPush.current > 60) {
      lastPush.current = now;
      const rr = Math.hypot(x, y);
      setPath(p => [...p.slice(-150), { i: p.length ? p[p.length - 1].i + 1 : 0, r: +(rr * 100).toFixed(1), U: K * Q * 1e-6 * q * 1e-9 / rr * 1e6, x, y }]);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawAxes(ctx, w);
    const o = w.toPx(0, 0);
    // potential energy "landscape" rings
    for (let rr = 0.06; rr < 0.7; rr += 0.04) {
      const u = Math.abs(K * Q * 1e-6 * q * 1e-9 / rr);
      const a = Math.min(0.5, u / 1e-3);
      ctx.strokeStyle = Q * q > 0 ? `rgba(244,63,94,${a})` : `rgba(59,130,246,${a})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(o.x, o.y, rr * w.scale, 0, Math.PI * 2); ctx.stroke();
    }
    // path
    if (path.length > 1) {
      ctx.strokeStyle = "rgba(245,158,11,.7)"; ctx.lineWidth = 2; ctx.beginPath();
      path.forEach((p, i) => { const pp = w.toPx(p.x, p.y); if (i === 0) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y); }); ctx.stroke();
    }
    if (ref) { const rp = w.toPx(ref.x, ref.y); ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(rp.x, rp.y, 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); label(ctx, "A (مرجع)", rp.x, rp.y - 22, "#10b981", w.dark, 11); }
    chargeBall(ctx, o.x, o.y, 20, Q, true, w.t);
    label(ctx, `Q = ${Q > 0 ? "+" : ""}${Q} µC`, o.x, o.y + 36, Q > 0 ? "#f43f5e" : "#3b82f6", w.dark, 11);
    const p = w.toPx(pos.x, pos.y);
    ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = w.dark ? "rgba(148,163,184,.5)" : "rgba(71,85,105,.5)"; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
    if (Fm > 0) { const L = Math.min(110, 20 + 30 * Math.log10(1 + Fm / 1e-5)); arrow(ctx, p.x, p.y, p.x + F.x / Fm * L, p.y - F.y / Fm * L, "#f59e0b", 3, 10); }
    chargeBall(ctx, p.x, p.y, 11, q, false, w.t);
    label(ctx, `q = ${q > 0 ? "+" : ""}${q} nC   r = ${(r * 100).toFixed(1)} cm`, p.x, p.y + 26, w.dark ? "#e2e8f0" : "#334155", w.dark, 11);
    label(ctx, `U = ${fmtSI(U, "J")}`, p.x, p.y - 26, Q * q > 0 ? "#f43f5e" : "#3b82f6", w.dark, 12);
  };

  const curve = useMemo(() => { const o = []; for (let rr = 0.05; rr <= 0.7; rr += 0.01) o.push({ r: +(rr * 100).toFixed(0), U: K * Q * 1e-6 * q * 1e-9 / rr * 1e6 }); return o; }, [Q, q]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="انرژی پتانسیل"
        bodies={[{ id: "q", x: pos.x, y: pos.y, r: 26, onMove: move }]}
        probe={(x, y) => ({ E: fieldAt(src, x, y), V: potentialAt(src, x, y), F: (() => { const e = fieldAt(src, x, y); return { x: e.x * q * 1e-9, y: e.y * q * 1e-9 }; })(), extra: { "U در حسگر": fmtSI(potentialAt(src, x, y) * q * 1e-9, "J") } })}
        logValues={() => ({ "Q (µC)": Q, "q (nC)": q, "r (cm)": +(r * 100).toFixed(2), "U (µJ)": +(U * 1e6).toFixed(4), "ΔU (µJ)": dU !== null ? +(dU * 1e6).toFixed(4) : "—", "W (µJ)": W !== null ? +(W * 1e6).toFixed(4) : "—" })} />}
      controls={<>
        <Panel title="بارها">
          <Slider id="Q" label="Q (ثابت)" value={Q} min={-10} max={10} step={0.5} unit="µC" onChange={setQ} />
          <div className="h-3" />
          <Slider id="q" label="q (متحرک)" value={q} min={-5} max={5} step={0.5} unit="nC" onChange={setQm} />
        </Panel>
        <Panel title="موقعیت بار متحرک">
          <Slider id="pos" label="فاصله r" value={+r.toFixed(3)} min={0.05} max={0.7} step={0.005} unit="m" onChange={rr => move(rr * (r > 0 ? pos.x / r : 1), rr * (r > 0 ? pos.y / r : 0))} format={v => `${(v * 100).toFixed(1)} cm`} />
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" variant="success" onClick={() => setRef({ ...pos })}>ثبت نقطهٔ A (مرجع)</Button>
            <Button variant="ghost" onClick={() => { setRef(null); setPath([]); }}>پاک‌کردن</Button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">ابتدا نقطهٔ A را ثبت کنید، سپس بار را بکشید تا ΔU و کار نیروی الکتریکی محاسبه شود.</p>
        </Panel>
      </>}
      bottom={<>
        <Panel title="خوانش‌های لحظه‌ای">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="U = kQq/r" value={fmt(U * 1e6)} unit="µJ" accent={U > 0 ? "text-rose-500" : "text-blue-500"} />
            <Readout label="ΔU = U_B − U_A" value={dU !== null ? fmt(dU * 1e6) : "—"} unit="µJ" />
            <Readout label="کار نیروی الکتریکی W = −ΔU" value={W !== null ? fmt(W * 1e6) : "—"} unit="µJ" accent="text-amber-500" />
            <Readout label="نیرو F" value={fmt(Fm * 1e6)} unit="µN" />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{W !== null && (W > 0 ? "W > 0: نیروی الکتریکی کار مثبت انجام داد؛ انرژی پتانسیل کاهش یافت." : W < 0 ? "W < 0: بار برخلاف نیرو حرکت کرده؛ انرژی پتانسیل افزایش یافت." : "")}</p>
        </Panel>
        <Panel title="U بر حسب r">
          <LiveChart data={curve} xKey="r" series={[{ key: "U", color: Q * q > 0 ? "#f43f5e" : "#3b82f6", name: "U (µJ)" }]} xLabel="r (cm)" yLabel="U (µJ)" marker={{ x: +(r * 100).toFixed(0), y: U * 1e6 }} />
        </Panel>
        <Panel title="مسیر حرکت: U در طول مسیر">
          {path.length > 1 ? <LiveChart data={path} xKey="i" series={[{ key: "U", color: "#f59e0b", name: "U (µJ)" }]} xLabel="گام" yLabel="U (µJ)" /> : <p className="text-xs text-slate-500">بار را روی صفحه بکشید تا نمودار مسیر ساخته شود.</p>}
        </Panel>
      </>}
    />
  );
}

export const potentialEnergyMeta: ExperimentMeta = {
  id: "penergy", title: "انرژی پتانسیل الکتریکی", subtitle: "کار نیروی الکتریکی و تغییر انرژی", icon: "🔋",
  params: [{ id: "Q", label: "Q", min: -10, max: 10, def: 3, unit: "µC" }, { id: "q", label: "q", min: -5, max: 5, def: 2, unit: "nC" }],
  prediction: { question: "بار مثبت q را از بار مثبت Q دور می‌کنیم. انرژی پتانسیل سیستم چه می‌شود؟", options: ["افزایش می‌یابد", "کاهش می‌یابد", "ثابت می‌ماند", "ابتدا زیاد سپس کم می‌شود"], correct: 1 },
  analysis: ["نقطهٔ A را در r=10cm ثبت کنید و بار را به r=20cm ببرید: علامت W چیست؟", "همین کار را با q منفی تکرار کنید؛ چه تفاوتی می‌بینید؟", "بار را روی یک دایره به دور Q بچرخانید: ΔU چقدر است؟ چرا؟", "نمودار U بر حسب r چه شکلی است؟ با نمودار F مقایسه کنید."],
  conclusion: <>
    <p className="text-xs leading-6">انرژی پتانسیل الکتریکی به «سیستم» دو بار تعلق دارد. وقتی نیروی الکتریکی کار مثبت انجام می‌دهد (مثلاً دو بار هم‌نام از هم دور می‌شوند)، انرژی پتانسیل کاهش می‌یابد. کار نیروی الکتریکی به مسیر بستگی ندارد (نیروی پایستار).</p>
    <Formula label="انرژی پتانسیل دو بار نقطه‌ای">U = k q Q / r</Formula>
    <Formula label="رابطهٔ کار و انرژی پتانسیل">W(A→B) = −ΔU = U_A − U_B</Formula>
  </>,
  definition: <p className="leading-6"><Term k="pos">با تغییر فاصله، انرژی پتانسیل تغییر می‌کند و نیروی الکتریکی کار انجام می‌دهد.</Term> <Term k={["Q", "q"]}>علامت U به علامت حاصل‌ضرب دو بار بستگی دارد: هم‌نام مثبت، ناهم‌نام منفی.</Term></p>,
  Component: PotentialEnergy,
};

// ================= 8. Electric potential map =================
type Config = "single" | "dipole" | "twoPos";

function marchingSquares(grid: number[][], nx: number, ny: number, level: number): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];
  const lerp = (a: number, b: number) => (level - a) / (b - a);
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const v0 = grid[j][i], v1 = grid[j][i + 1], v2 = grid[j + 1][i + 1], v3 = grid[j + 1][i];
    if (![v0, v1, v2, v3].every(isFinite)) continue;
    const idx = (v0 > level ? 1 : 0) | (v1 > level ? 2 : 0) | (v2 > level ? 4 : 0) | (v3 > level ? 8 : 0);
    if (idx === 0 || idx === 15) continue;
    const pts: [number, number][] = [];
    if ((idx & 1) !== ((idx >> 1) & 1)) pts.push([i + lerp(v0, v1), j]);
    if (((idx >> 1) & 1) !== ((idx >> 2) & 1)) pts.push([i + 1, j + lerp(v1, v2)]);
    if (((idx >> 2) & 1) !== ((idx >> 3) & 1)) pts.push([i + lerp(v3, v2), j + 1]);
    if (((idx >> 3) & 1) !== (idx & 1)) pts.push([i, j + lerp(v0, v3)]);
    if (pts.length >= 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
    if (pts.length === 4) segs.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]]);
  }
  return segs;
}

function PotentialMap() {
  const [Q, setQ] = useParam("Q", 3);
  const [sep, setSep] = useParam("sep", 0.3);
  const [config, setConfig] = useState<Config>("single");
  const [showHeat, setShowHeat] = useState(true);
  const [showE, setShowE] = useState(true);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [probe, setProbe] = useResettable({ x: 0.2, y: 0.15 });
  const { touch } = useStore();
  const charges = useMemo<PointCharge[]>(() => config === "single" ? [{ x: 0, y: 0, q: Q * 1e-6 }] : [{ x: -sep / 2, y: 0, q: Q * 1e-6 }, { x: sep / 2, y: 0, q: (config === "dipole" ? -1 : 1) * Q * 1e-6 }], [Q, sep, config]);
  const cacheRef = useRef<{ key: string; w: number; h: number; img: ImageData | null; segs: Map<number, [number, number, number, number][]>; cell: number; off?: HTMLCanvasElement; offKey?: string }>({ key: "", w: 0, h: 0, img: null, segs: new Map(), cell: 6 });

  const levels = useMemo(() => { const base = K * Math.abs(Q) * 1e-6; const fr = [0.0625, 0.125, 0.25, 0.375, 0.5, 0.75, 1, 1.5, 2]; return [...fr.map(f => -f), ...fr].map(f => f * base / 0.1); }, [Q]);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    const key = JSON.stringify([charges, w.w, w.h, w.dark]);
    const c = cacheRef.current;
    const cell = 6;
    if (c.key !== key) {
      const nx = Math.ceil(w.w / cell) + 1, ny = Math.ceil(w.h / cell) + 1;
      const grid: number[][] = [];
      const off = document.createElement("canvas"); off.width = nx; off.height = ny; const octx = off.getContext("2d")!;
      const img = octx.createImageData(nx, ny);
      const vmax = K * Math.abs(Q) * 1e-6 / 0.08;
      for (let j = 0; j < ny; j++) { grid[j] = []; for (let i = 0; i < nx; i++) {
        const m = w.toM(i * cell, j * cell); const v = potentialAt(charges, m.x, m.y); grid[j][i] = v;
        const t = Math.max(-1, Math.min(1, Math.sign(v) * Math.log10(1 + Math.abs(v) / vmax * 9)));
        const k = (j * nx + i) * 4;
        if (t > 0) { img.data[k] = 244; img.data[k + 1] = 63 + (1 - t) * 120; img.data[k + 2] = 94 + (1 - t) * 100; }
        else { img.data[k] = 59 + (1 + t) * 120; img.data[k + 1] = 130 + (1 + t) * 60; img.data[k + 2] = 246; }
        img.data[k + 3] = Math.round(Math.abs(t) * 170);
      } }
      c.key = key; c.img = img; c.w = nx; c.h = ny; c.cell = cell; c.segs = new Map();
      for (const L of levels) c.segs.set(L, marchingSquares(grid, nx, ny, L));
    }
    if (showHeat && c.img) {
      if (!c.off || c.off.width !== c.w || c.off.height !== c.h || c.offKey !== key) {
        c.off = document.createElement("canvas"); c.off.width = c.w; c.off.height = c.h; c.off.getContext("2d")!.putImageData(c.img, 0, 0); c.offKey = key;
      }
      ctx.imageSmoothingEnabled = true; ctx.drawImage(c.off, 0, 0, c.w * c.cell, c.h * c.cell);
    }
    drawAxes(ctx, w);
    // contours
    ctx.lineWidth = 1.4;
    for (const [L, segs] of c.segs) {
      ctx.strokeStyle = L > 0 ? (w.dark ? "rgba(254,205,211,.8)" : "rgba(159,18,57,.7)") : (w.dark ? "rgba(191,219,254,.8)" : "rgba(30,58,138,.7)");
      ctx.beginPath(); for (const s of segs) { ctx.moveTo(s[0] * c.cell, s[1] * c.cell); ctx.lineTo(s[2] * c.cell, s[3] * c.cell); } ctx.stroke();
      // label at one seg
      if (segs.length > 10) { const s = segs[Math.floor(segs.length / 3)]; label(ctx, fmtSI(L, "V"), s[0] * c.cell, s[1] * c.cell, L > 0 ? "#fb7185" : "#60a5fa", w.dark, 10); }
    }
    charges.forEach(ch => { const p = w.toPx(ch.x, ch.y); chargeBall(ctx, p.x, p.y, 16, ch.q, true, w.t); });
    // probe
    const pp = w.toPx(probe.x, probe.y);
    const Vp = potentialAt(charges, probe.x, probe.y); const Ep = fieldAt(charges, probe.x, probe.y); const Epm = vlen(Ep);
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pp.x, pp.y, 9, 0, Math.PI * 2); ctx.stroke();
    if (showE && Epm > 0) { arrow(ctx, pp.x, pp.y, pp.x + Ep.x / Epm * 50, pp.y - Ep.y / Epm * 50, "#a855f7", 2.5, 9); label(ctx, "E⃗ به سمت کاهش V", pp.x + Ep.x / Epm * 60, pp.y - Ep.y / Epm * 60 - 14, "#a855f7", w.dark, 10); }
    label(ctx, `V = ${fmtSI(Vp, "V")}`, pp.x, pp.y - 22, "#10b981", w.dark, 12);
    if (hover) { const p = w.toPx(hover.x, hover.y); const v = potentialAt(charges, hover.x, hover.y); label(ctx, `V = ${fmtSI(v, "V")}`, p.x + 60, p.y - 14, w.dark ? "#e2e8f0" : "#334155", w.dark, 11); }
  };

  const Vp = potentialAt(charges, probe.x, probe.y);
  const rp = Math.hypot(probe.x - charges[0].x, probe.y - charges[0].y);
  const curve = useMemo(() => { const o = []; for (let rr = 0.04; rr <= 0.6; rr += 0.01) o.push({ r: +(rr * 100).toFixed(0), V: K * Q * 1e-6 / rr, E: K * Math.abs(Q) * 1e-6 / (rr * rr) / 1000 }); return o; }, [Q]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="پتانسیل الکتریکی" onHover={setHover}
        bodies={[{ id: "probe", x: probe.x, y: probe.y, r: 22, onMove: (x, y) => { setProbe({ x, y }); touch("probe"); } }]}
        probe={(x, y) => ({ E: fieldAt(charges, x, y), V: potentialAt(charges, x, y) })}
        logValues={() => ({ "Q (µC)": Q, پیکربندی: config, "x (cm)": +(probe.x * 100).toFixed(1), "y (cm)": +(probe.y * 100).toFixed(1), "r (cm)": +(rp * 100).toFixed(1), "V (V)": +Vp.toFixed(0), "E (N/C)": +vlen(fieldAt(charges, probe.x, probe.y)).toFixed(0) })} />}
      controls={<>
        <Panel title="پیکربندی">
          <Segmented id="config" options={[{ value: "single", label: "تک‌بار" }, { value: "dipole", label: "دوقطبی (+ −)" }, { value: "twoPos", label: "دو بار (+ +)" }]} value={config} onChange={setConfig} />
          <div className="h-3" />
          <Slider id="Q" label="Q" value={Q} min={-8} max={8} step={0.5} unit="µC" onChange={setQ} />
          {config !== "single" && <div className="mt-3"><Slider id="sep" label="فاصلهٔ دو بار" value={sep} min={0.1} max={0.6} step={0.01} unit="m" onChange={setSep} format={v => `${(v * 100).toFixed(0)} cm`} /></div>}
        </Panel>
        <Panel title="نمایش">
          <Toggle label="نقشهٔ رنگی پتانسیل" checked={showHeat} onChange={setShowHeat} />
          <div className="h-2" />
          <Toggle label="بردار E در نقطهٔ کاوشگر" checked={showE} onChange={setShowE} />
          <p className="mt-2 text-[11px] text-slate-500">خطوط نازک: سطوح هم‌پتانسیل. کاوشگر سبز را بکشید یا نشانگر را روی نقشه حرکت دهید.</p>
        </Panel>
      </>}
      bottom={<>
        <Panel title="خوانش کاوشگر">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="پتانسیل V" value={fmt(Vp)} unit="V" accent="text-emerald-500" />
            <Readout label="فاصله از بار اول" value={(rp * 100).toFixed(1)} unit="cm" />
            <Readout label="E" value={fmt(vlen(fieldAt(charges, probe.x, probe.y)))} unit="N/C" accent="text-purple-500" />
            <Readout label="V زیر نشانگر" value={hover ? fmt(potentialAt(charges, hover.x, hover.y)) : "—"} unit="V" />
          </div>
        </Panel>
        <Panel title="V و E بر حسب r (تک‌بار)" className="xl:col-span-2">
          <LiveChart data={curve} xKey="r" series={[{ key: "V", color: "#10b981", name: "V (V)" }, { key: "E", color: "#a855f7", name: "E (kN/C)", dashed: true }]} xLabel="r (cm)" yLabel="" marker={config === "single" ? { x: +(rp * 100).toFixed(0), y: Vp } : null} />
          <p className="mt-1 text-[11px] text-slate-500">V با 1/r و E با 1/r² کاهش می‌یابد؛ شیب نمودار V (یعنی تغییر V با فاصله) همان اندازهٔ E است: E = −ΔV/Δr.</p>
        </Panel>
      </>}
    />
  );
}

export const potentialMeta: ExperimentMeta = {
  id: "potential", title: "پتانسیل الکتریکی", subtitle: "نقشهٔ پتانسیل و سطوح هم‌پتانسیل", icon: "🗺️",
  params: [{ id: "Q", label: "Q", min: -8, max: 8, def: 3, unit: "µC" }, { id: "sep", label: "فاصلهٔ دو بار", min: 0.1, max: 0.6, def: 0.3, unit: "m" }],
  prediction: { question: "اگر فاصله از یک بار نقطه‌ای دو برابر شود، پتانسیل الکتریکی چه می‌شود؟", options: ["نصف", "یک‌چهارم", "دو برابر", "بدون تغییر"], correct: 0 },
  analysis: ["کاوشگر را روی یک خط هم‌پتانسیل حرکت دهید: V تغییر می‌کند؟ E چطور؟", "جهت بردار E نسبت به خطوط هم‌پتانسیل چگونه است؟ به سمت V بیشتر یا کمتر؟", "در پیکربندی دوقطبی، پتانسیل روی خط وسط چقدر است؟ آیا E آنجا صفر است؟", "فاصلهٔ خطوط هم‌پتانسیل کجا کمتر است؟ آنجا E بزرگ‌تر است یا کوچک‌تر؟"],
  conclusion: <>
    <p className="text-xs leading-6">پتانسیل الکتریکی، انرژی پتانسیل به ازای واحد بار است و یک کمیت نرده‌ای است. سطوح هم‌پتانسیل بر خطوط میدان عمودند و میدان الکتریکی همیشه به سمت کاهش پتانسیل است. هرچه خطوط هم‌پتانسیل فشرده‌تر باشند، میدان قوی‌تر است.</p>
    <Formula label="پتانسیل بار نقطه‌ای">V = k Q / r   (ولت)</Formula>
    <Formula label="رابطهٔ پتانسیل و انرژی پتانسیل">U = q V ,  ΔV = ΔU / q</Formula>
    <Formula label="رابطهٔ میدان و پتانسیل (میدان یکنواخت)">E = |ΔV| / d</Formula>
  </>,
  definition: <p className="leading-6"><Term k="Q">پتانسیل با بار منبع نسبت مستقیم دارد و علامت آن با علامت Q یکی است.</Term> <Term k="probe">پتانسیل با 1/r کاهش می‌یابد؛ خطوط هم‌پتانسیلِ تک‌بار دایره‌های هم‌مرکزند.</Term> <Term k="config">در برهم‌نهی، پتانسیل‌ها به‌صورت جبری جمع می‌شوند.</Term></p>,
  Component: PotentialMap,
};
