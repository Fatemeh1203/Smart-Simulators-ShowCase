import { useMemo } from "react";
import { LabCanvas, arrow, chargeBall, drawAxes, label, World } from "../components/LabCanvas";
import { Formula, Panel, Readout, Segmented, Slider, Term } from "../components/ui";
import { K, coulombForce, fmt, fmtSI } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { LiveChart } from "../components/Chart";
import { useStore } from "../store";

const SCALE = 480;
const media = [{ value: "1", label: "خلأ/هوا (1)" }, { value: "2.1", label: "پارافین (2.1)" }, { value: "5", label: "شیشه (5)" }, { value: "80", label: "آب (80)" }];

function Coulomb() {
  const [q1, setQ1] = useParam("q1", 2); // µC
  const [q2, setQ2] = useParam("q2", -3);
  const [er, setEr] = useParam("er", 1);
  const [p1, setP1] = useResettable({ x: -0.2, y: 0 });
  const [p2, setP2] = useResettable({ x: 0.2, y: 0 });
  const { touch } = useStore();

  const r = Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const F = coulombForce(q1 * 1e-6, q2 * 1e-6, r, er);
  const attract = q1 * q2 < 0;

  const setR = (rr: number) => {
    const cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2;
    const ux = r > 1e-6 ? (p2.x - p1.x) / r : 1, uy = r > 1e-6 ? (p2.y - p1.y) / r : 0;
    setP1({ x: cx - ux * rr / 2, y: cy - uy * rr / 2 }); setP2({ x: cx + ux * rr / 2, y: cy + uy * rr / 2 });
  };

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawAxes(ctx, w);
    // medium tint
    if (er > 1) { ctx.fillStyle = `rgba(56,189,248,${Math.min(0.25, 0.04 * Math.log2(er + 1))})`; ctx.fillRect(0, 0, w.w, w.h); label(ctx, `محیط: εr = ${er}`, 70, w.h - 20, "#38bdf8", w.dark, 11); }
    const a = w.toPx(p1.x, p1.y), b = w.toPx(p2.x, p2.y);
    ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = w.dark ? "rgba(148,163,184,.5)" : "rgba(71,85,105,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    label(ctx, `r = ${(r * 100).toFixed(1)} cm`, (a.x + b.x) / 2, (a.y + b.y) / 2 + 26, w.dark ? "#e2e8f0" : "#334155", w.dark);
    const R1 = 14 + Math.min(14, Math.abs(q1) * 2), R2 = 14 + Math.min(14, Math.abs(q2) * 2);
    chargeBall(ctx, a.x, a.y, R1, q1, true, w.t); chargeBall(ctx, b.x, b.y, R2, q2, true, w.t);
    label(ctx, `q₁ = ${q1 > 0 ? "+" : ""}${q1} µC`, a.x, a.y - R1 - 16, q1 > 0 ? "#f43f5e" : "#3b82f6", w.dark);
    label(ctx, `q₂ = ${q2 > 0 ? "+" : ""}${q2} µC`, b.x, b.y - R2 - 16, q2 > 0 ? "#f43f5e" : "#3b82f6", w.dark);
    if (F > 0 && r > 0.01) {
      const L = Math.min(170, 18 + 32 * Math.log10(1 + F * 10));
      const ux = (b.x - a.x) / Math.hypot(b.x - a.x, b.y - a.y), uy = (b.y - a.y) / Math.hypot(b.x - a.x, b.y - a.y);
      const s = attract ? 1 : -1;
      arrow(ctx, a.x, a.y, a.x + s * ux * L, a.y + s * uy * L, "#f59e0b", 3.5, 11);
      arrow(ctx, b.x, b.y, b.x - s * ux * L, b.y - s * uy * L, "#f59e0b", 3.5, 11);
      label(ctx, `F₁₂ = F₂₁ = ${fmtSI(F, "N")}  (${attract ? "جاذبه" : "دافعه"})`, w.w / 2, 24, "#f59e0b", w.dark, 13);
      label(ctx, "F⃗₂₁", a.x + s * ux * (L + 18), a.y + s * uy * (L + 18) - 12, "#f59e0b", w.dark, 11);
      label(ctx, "F⃗₁₂", b.x - s * ux * (L + 18), b.y - s * uy * (L + 18) - 12, "#f59e0b", w.dark, 11);
    }
  };

  const dataR = useMemo(() => { const o = []; for (let rr = 0.04; rr <= 0.7; rr += 0.01) o.push({ r: +(rr * 100).toFixed(0), F: coulombForce(q1 * 1e-6, q2 * 1e-6, rr, er) }); return o; }, [q1, q2, er]);
  const dataQ = useMemo(() => { const o = []; for (let qq = -10; qq <= 10; qq += 0.5) o.push({ q1: qq, F: coulombForce(qq * 1e-6, q2 * 1e-6, r, er) }); return o; }, [q2, r, er]);
  const dataInv = useMemo(() => dataR.map(d => ({ inv: +(1 / Math.pow(d.r / 100, 2)).toFixed(1), F: d.F })), [dataR]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="قانون کولن"
        bodies={[{ id: "q1", x: p1.x, y: p1.y, r: 30, onMove: (x, y) => { setP1({ x, y }); touch("r"); } }, { id: "q2", x: p2.x, y: p2.y, r: 30, onMove: (x, y) => { setP2({ x, y }); touch("r"); } }]}
        probe={(x, y) => { const E = { x: 0, y: 0 }; let V = 0; for (const [p, q] of [[p1, q1], [p2, q2]] as const) { const dx = x - p.x, dy = y - p.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2); if (d > 1e-3) { const e = K * q * 1e-6 / (er * d2); E.x += e * dx / d; E.y += e * dy / d; V += K * q * 1e-6 / (er * d); } } return { E, V }; }}
        logValues={() => ({ "q1 (µC)": q1, "q2 (µC)": q2, "r (cm)": +(r * 100).toFixed(2), εr: er, "F (N)": +F.toFixed(5) })} />}
      controls={<>
        <Panel title="بارها">
          <Slider id="q1" label="q₁" value={q1} min={-10} max={10} step={0.1} unit="µC" onChange={setQ1} />
          <div className="h-3" />
          <Slider id="q2" label="q₂" value={q2} min={-10} max={10} step={0.1} unit="µC" onChange={setQ2} />
        </Panel>
        <Panel title="فاصله">
          <Slider id="r" label="فاصله r" value={+r.toFixed(3)} min={0.04} max={0.8} step={0.005} unit="m" onChange={setR} format={v => `${(v * 100).toFixed(1)} cm`} />
          <p className="mt-1 text-[11px] text-slate-500">یا بارها را مستقیماً روی صفحه بکشید.</p>
        </Panel>
        <Panel title="محیط (ثابت دی‌الکتریک)">
          <Segmented id="er" options={media} value={String(er)} onChange={v => setEr(parseFloat(v))} />
          <div className="mt-2"><Slider id="er" label="εr" value={er} min={1} max={100} step={0.1} unit="" onChange={setEr} /></div>
        </Panel>
      </>}
      bottom={<>
        <Panel title="F بر حسب r">
          <LiveChart data={dataR} xKey="r" series={[{ key: "F", color: "#f59e0b", name: "F (N)" }]} xLabel="r (cm)" yLabel="F (N)" marker={{ x: +(r * 100).toFixed(0), y: F }} />
        </Panel>
        <Panel title="F بر حسب 1/r² (خط راست ⇒ وارون مجذوری)">
          <LiveChart data={dataInv} xKey="inv" series={[{ key: "F", color: "#22d3ee", name: "F (N)" }]} xLabel="1/r² (1/m²)" yLabel="F (N)" marker={{ x: +(1 / (r * r)).toFixed(1), y: F }} />
        </Panel>
        <Panel title="F بر حسب q₁ (با q₂ و r فعلی)">
          <LiveChart data={dataQ} xKey="q1" series={[{ key: "F", color: "#a855f7", name: "F (N)" }]} xLabel="q₁ (µC)" yLabel="F (N)" marker={{ x: q1, y: F }} />
        </Panel>
        <Panel title="خوانش‌ها" className="md:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <Readout label="نیرو" value={fmt(F)} unit="N" accent="text-amber-500" />
            <Readout label="r" value={(r * 100).toFixed(1)} unit="cm" />
            <Readout label="1/r²" value={fmt(1 / (r * r))} unit="m⁻²" />
            <Readout label="|q₁q₂|" value={fmt(Math.abs(q1 * q2))} unit="µC²" />
            <Readout label="k|q₁q₂|/(εr·r²)" value={fmt(F)} unit="N" sub="مقایسه با نیروسنج" />
          </div>
        </Panel>
      </>}
    />
  );
}

export const coulombMeta: ExperimentMeta = {
  id: "coulomb", title: "قانون کولن", subtitle: "نیروی بین دو بار نقطه‌ای", icon: "🧲",
  params: [{ id: "q1", label: "q₁", min: -10, max: 10, def: 2, unit: "µC" }, { id: "q2", label: "q₂", min: -10, max: 10, def: -3, unit: "µC" }, { id: "er", label: "εr", min: 1, max: 100, def: 1, unit: "" }],
  prediction: { question: "اگر فاصلهٔ دو بار را دو برابر کنیم، نیروی الکتریکی بین آن‌ها چه می‌شود؟", options: ["نصف می‌شود", "یک‌چهارم می‌شود", "دو برابر می‌شود", "تغییر نمی‌کند"], correct: 1 },
  analysis: ["r را از ۱۰ به ۲۰ سانتی‌متر ببرید؛ نسبت نیروی جدید به قدیم چقدر است؟", "نمودار F بر حسب 1/r² چه شکلی دارد؟ خط راست به چه معناست؟", "q₁ را دو برابر کنید؛ F چند برابر می‌شود؟", "اگر محیط را به آب (εr=80) تغییر دهید، چه اتفاقی برای نیرو می‌افتد؟"],
  conclusion: <>
    <p className="text-xs leading-6">نیروی بین دو بار نقطه‌ای با حاصل‌ضرب بارها نسبت مستقیم و با <b>مجذور فاصله</b> نسبت وارون دارد. با دو برابر شدن فاصله، نیرو یک‌چهارم می‌شود. نیرو در راستای خط واصل دو بار است و طبق قانون سوم نیوتون دو نیرو هم‌اندازه و مخالف‌اند.</p>
    <Formula label="قانون کولن">F = k |q₁ q₂| / r² ,  k = 8.99×10⁹ N·m²/C²</Formula>
    <Formula label="در محیط با ثابت دی‌الکتریک εr">F = k |q₁ q₂| / (εr r²)</Formula>
  </>,
  definition: <p className="leading-6"><Term k={["q1", "q2"]}>اندازهٔ نیرو با حاصل‌ضرب اندازهٔ دو بار نسبت مستقیم دارد.</Term> <Term k="r">اندازهٔ نیرو با مجذور فاصله نسبت وارون دارد.</Term> <Term k="er">در محیط دی‌الکتریک، نیرو εr برابر کوچک‌تر می‌شود.</Term></p>,
  Component: Coulomb,
};
