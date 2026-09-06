import { useEffect, useMemo, useRef, useState } from "react";
import { LabCanvas, arrow, chargeBall, drawAxes, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Slider, Term, Toggle } from "../components/ui";
import { E_CHARGE, K, coulombForce, fmt, fmtSI } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { LiveChart } from "../components/Chart";
import { useStore } from "../store";

const SCALE = 520; // px per meter
const MASS = 2e-4; // 0.2 g pith ball

function ChargeLab() {
  const [qA, setQA] = useParam("qA", 6); // nC
  const [qB, setQB] = useParam("qB", -6);
  const [pos, setPos] = useResettable({ a: { x: -0.25, y: 0 }, b: { x: 0.25, y: 0 } });
  const pA = pos.a, pB = pos.b;
  const setPA = (p: { x: number; y: number }) => setPos(s => ({ ...s, a: p }));
  const setPB = (p: { x: number; y: number }) => setPos(s => ({ ...s, b: p }));
  const [released, setReleased] = useState(false);
  const vel = useRef({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
  const posRef = useRef(pos); posRef.current = pos;
  const { touch } = useStore();
  const [trail, setTrail] = useState<{ t: number; r: number; F: number }[]>([]);

  const r = Math.hypot(pA.x - pB.x, pA.y - pB.y);
  const F = coulombForce(qA * 1e-9, qB * 1e-9, r);
  const attract = qA * qB < 0;
  const nA = Math.round(Math.abs(qA * 1e-9) / E_CHARGE), nB = Math.round(Math.abs(qB * 1e-9) / E_CHARGE);

  // dynamics (semi-implicit Euler on refs, mirrored to state each frame)
  useEffect(() => {
    if (!released) { vel.current = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } }; return; }
    let raf = 0, last = performance.now(), acc = 0, tt = 0;
    const step = () => {
      const now = performance.now(); const dt = Math.min(0.03, (now - last) / 1000); last = now;
      const { a, b } = posRef.current;
      const dx = b.x - a.x, dy = b.y - a.y; const d = Math.max(0.06, Math.hypot(dx, dy));
      const f = (K * qA * 1e-9 * qB * 1e-9) / (d * d); // signed: >0 repulsive
      const ux = dx / d, uy = dy / d;
      const ax = (-f * ux) / MASS, ay = (-f * uy) / MASS;
      const v = vel.current;
      v.a.x = (v.a.x + ax * dt) * 0.985; v.a.y = (v.a.y + ay * dt) * 0.985;
      v.b.x = (v.b.x - ax * dt) * 0.985; v.b.y = (v.b.y - ay * dt) * 0.985;
      const na = { x: a.x + v.a.x * dt, y: a.y + v.a.y * dt };
      const nb = { x: b.x + v.b.x * dt, y: b.y + v.b.y * dt };
      for (const [p, vv] of [[na, v.a], [nb, v.b]] as const) {
        if (Math.abs(p.x) > 0.55) { p.x = Math.sign(p.x) * 0.55; vv.x *= -0.5; }
        if (Math.abs(p.y) > 0.3) { p.y = Math.sign(p.y) * 0.3; vv.y *= -0.5; }
      }
      const dd = Math.hypot(na.x - nb.x, na.y - nb.y);
      if (dd < 0.07 && f < 0) { v.a = { x: 0, y: 0 }; v.b = { x: 0, y: 0 }; } else setPos({ a: na, b: nb });
      acc += dt; tt += dt;
      if (acc > 0.1) { acc = 0; const rr = Math.hypot(na.x - nb.x, na.y - nb.y); setTrail(t => [...t.slice(-100), { t: +tt.toFixed(1), r: rr, F: coulombForce(qA * 1e-9, qB * 1e-9, rr) }]); }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [released, qA, qB]);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawAxes(ctx, w);
    const a = w.toPx(pA.x, pA.y), b = w.toPx(pB.x, pB.y);
    // distance line
    ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = w.dark ? "rgba(148,163,184,.4)" : "rgba(71,85,105,.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    label(ctx, `r = ${(r * 100).toFixed(1)} cm`, (a.x + b.x) / 2, (a.y + b.y) / 2 - 40, w.dark ? "#cbd5e1" : "#334155", w.dark);
    // balls with electrons
    const R = 30;
    for (const [p, q, name] of [[a, qA, "A"], [b, qB, "B"]] as const) {
      chargeBall(ctx, p.x, p.y, R, 0, false, w.t);
      // draw electrons/holes
      const n = Math.min(30, Math.round(Math.abs(q) / 0.5));
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + (i % 3) * 0.7 + w.t * 0.15;
        const rr = R * (0.35 + 0.55 * ((i * 7) % 5) / 5);
        const ex = p.x + rr * Math.cos(ang), ey = p.y + rr * Math.sin(ang);
        if (q < 0) { ctx.fillStyle = "#60a5fa"; ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 6px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("−", ex, ey); }
        else { ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ex - 3, ey); ctx.lineTo(ex + 3, ey); ctx.moveTo(ex, ey - 3); ctx.lineTo(ex, ey + 3); ctx.stroke(); }
      }
      // aura
      if (q !== 0) { ctx.strokeStyle = q > 0 ? "rgba(244,63,94,.5)" : "rgba(59,130,246,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, R + 4 + Math.sin(w.t * 3) * 1.5, 0, Math.PI * 2); ctx.stroke(); }
      label(ctx, `${name}: ${q > 0 ? "+" : ""}${q.toFixed(2)} nC`, p.x, p.y + R + 18, q > 0 ? "#f43f5e" : q < 0 ? "#3b82f6" : "#94a3b8", w.dark);
    }
    // force arrows
    if (F > 0) {
      const len = Math.min(140, 20 + 30 * Math.log10(1 + F * 1e6));
      const ux = (b.x - a.x) / Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)), uy = (b.y - a.y) / Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const s = attract ? 1 : -1;
      arrow(ctx, a.x, a.y - 44, a.x + s * ux * len, a.y - 44 + s * uy * len, "#f59e0b", 3);
      arrow(ctx, b.x, b.y - 44, b.x - s * ux * len, b.y - 44 - s * uy * len, "#f59e0b", 3);
      label(ctx, `${attract ? "جاذبه" : "دافعه"}  F = ${fmtSI(F, "N")}`, w.w / 2, 24, "#f59e0b", w.dark);
    } else label(ctx, "یکی از اجسام خنثی است → نیروی الکتریکی صفر", w.w / 2, 24, "#94a3b8", w.dark);
  };

  const chartData = useMemo(() => {
    const out = [];
    for (let rr = 0.05; rr <= 0.8; rr += 0.01) out.push({ r: +(rr * 100).toFixed(1), F: coulombForce(qA * 1e-9, qB * 1e-9, rr) * 1e6 });
    return out;
  }, [qA, qB]);

  const addE = (which: "A" | "B", n: number) => {
    const dq = -(n * E_CHARGE) * 1e9; // adding electrons -> more negative (nC)
    if (which === "A") setQA(+(qA + dq).toFixed(3)); else setQB(+(qB + dq).toFixed(3));
    touch(which === "A" ? "qA" : "qB");
  };
  const rub = () => { const dq = 2; setQA(+(qA + dq).toFixed(3)); setQB(+(qB - dq).toFixed(3)); touch("rub"); };

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="بار الکتریکی"
        bodies={[{ id: "A", x: pA.x, y: pA.y, r: 34, onMove: (x, y) => { setReleased(false); setPA({ x, y }); } }, { id: "B", x: pB.x, y: pB.y, r: 34, onMove: (x, y) => { setReleased(false); setPB({ x, y }); } }]}
        probe={(x, y) => { const E = { x: 0, y: 0 }; for (const [p, q] of [[pA, qA], [pB, qB]] as const) { const dx = x - p.x, dy = y - p.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2); if (d > 1e-3) { const e = K * q * 1e-9 / d2; E.x += e * dx / d; E.y += e * dy / d; } } return { E }; }}
        logValues={() => ({ "qA (nC)": qA, "qB (nC)": qB, "r (cm)": +(r * 100).toFixed(2), "F (µN)": +(F * 1e6).toFixed(4), نوع: attract ? "جاذبه" : "دافعه" })} />}
      controls={<>
        <Panel title="جسم A">
          <Slider id="qA" label="بار A" value={qA} min={-20} max={20} step={0.1} unit="nC" onChange={setQA} />
          <div className="mt-2 flex gap-1.5">
            <Button variant="ghost" className="flex-1" onClick={() => addE("A", 1e10)}>+ ۱۰¹⁰ الکترون</Button>
            <Button variant="ghost" className="flex-1" onClick={() => addE("A", -1e10)}>− ۱۰¹⁰ الکترون</Button>
          </div>
          <p className="num mt-1 text-[11px] text-slate-500">{qA < 0 ? "الکترون اضافی" : qA > 0 ? "کمبود الکترون" : "خنثی"}: {nA.toExponential(3)}</p>
        </Panel>
        <Panel title="جسم B">
          <Slider id="qB" label="بار B" value={qB} min={-20} max={20} step={0.1} unit="nC" onChange={setQB} />
          <div className="mt-2 flex gap-1.5">
            <Button variant="ghost" className="flex-1" onClick={() => addE("B", 1e10)}>+ ۱۰¹⁰ الکترون</Button>
            <Button variant="ghost" className="flex-1" onClick={() => addE("B", -1e10)}>− ۱۰¹⁰ الکترون</Button>
          </div>
          <p className="num mt-1 text-[11px] text-slate-500">{qB < 0 ? "الکترون اضافی" : qB > 0 ? "کمبود الکترون" : "خنثی"}: {nB.toExponential(3)}</p>
        </Panel>
        <Panel title="آزمایش">
          <Button className="w-full" variant="ghost" onClick={rub}>مالش A به B (انتقال الکترون از A به B)</Button>
          <div className="mt-3"><Toggle label="رها کردن اجسام (دینامیک)" checked={released} onChange={v => { setReleased(v); if (v) setTrail([]); }} /></div>
          <p className="mt-2 text-[11px] text-slate-500">جرم هر گلوله ۰٫۲ گرم فرض شده است. اجسام را بکشید تا دوباره ثابت شوند.</p>
        </Panel>
      </>}
      bottom={<>
        <Panel title="اندازه‌گیری‌ها">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="فاصله r" value={(r * 100).toFixed(1)} unit="cm" />
            <Readout label="نیرو F" value={fmt(F * 1e6)} unit="µN" accent="text-amber-500" />
            <Readout label="بار کل سیستم" value={(qA + qB).toFixed(2)} unit="nC" accent="text-emerald-500" />
            <Readout label="نوع برهم‌کنش" value={F === 0 ? "—" : attract ? "جاذبه" : "دافعه"} />
          </div>
        </Panel>
        <Panel title="نمودار F بر حسب r (با بارهای فعلی)">
          <LiveChart data={chartData} xKey="r" series={[{ key: "F", color: "#f59e0b", name: "F (µN)" }]} xLabel="r (cm)" yLabel="F (µN)" marker={{ x: +(r * 100).toFixed(1), y: F * 1e6 }} />
        </Panel>
        <Panel title={released ? "ثبت زمانی حرکت" : "تعریف"}>
          {released && trail.length > 2 ? <LiveChart data={trail} xKey="t" series={[{ key: "r", color: "#22d3ee", name: "r (m)" }]} xLabel="t (s)" yLabel="r (m)" /> : (
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
              <Term k={["qA", "qB"]}>بار الکتریکی خاصیتی از ماده است که با کمبود یا فزونی الکترون ایجاد می‌شود.</Term> <Term k="rub">در مالش، الکترون از یک جسم به جسم دیگر منتقل می‌شود؛ جسمی که الکترون از دست می‌دهد مثبت و جسمی که می‌گیرد منفی می‌شود.</Term> بارهای هم‌نام یکدیگر را می‌رانند و بارهای ناهم‌نام یکدیگر را می‌ربایند.
            </p>
          )}
        </Panel>
      </>}
    />
  );
}

export const chargeMeta: ExperimentMeta = {
  id: "charge", title: "بار الکتریکی", subtitle: "باردار کردن اجسام، جذب و دفع", icon: "⚡",
  params: [{ id: "qA", label: "بار A", min: -20, max: 20, def: 6, unit: "nC" }, { id: "qB", label: "بار B", min: -20, max: 20, def: -6, unit: "nC" }],
  prediction: { question: "اگر جسم A را با مالش به جسم B، الکترون از دست بدهد، بار A و B چگونه می‌شود؟", options: ["A مثبت و B منفی", "A منفی و B مثبت", "هر دو مثبت", "هر دو خنثی می‌مانند"], correct: 0 },
  analysis: ["با افزودن الکترون به جسم، علامت بار آن به کدام سمت می‌رود؟", "وقتی دو جسم هم‌علامت هستند، جهت پیکان‌های نیرو چگونه است؟", "دکمهٔ مالش را چند بار بزنید: بار کل سیستم چه تغییری می‌کند؟", "با رها کردن اجسام، حرکت آن‌ها با نوع بار چه ارتباطی دارد؟"],
  conclusion: <>
    <p className="text-xs leading-6">جسم‌ها با <b>انتقال الکترون</b> باردار می‌شوند. الکترون بار منفی دارد؛ پس <b>کمبود الکترون = بار مثبت</b> و <b>افزایش الکترون = بار منفی</b>. بارهای هم‌نام دافعه و بارهای ناهم‌نام جاذبه دارند.</p>
    <Formula label="اندازهٔ بار بر حسب تعداد الکترون">q = n · e ,  e = 1.602×10⁻¹⁹ C</Formula>
  </>,
  definition: <p className="leading-6"><Term k={["qA", "qB"]}>بار الکتریکی با تعداد الکترون‌های اضافی یا کم‌شده تعیین می‌شود.</Term> <Term k="rub">در مالش، الکترون‌ها جابه‌جا می‌شوند اما نابود یا خلق نمی‌شوند.</Term></p>,
  Component: ChargeLab,
};
