import { useRef, useState } from "react";
import { LabCanvas, chargeBall, label, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Slider, Term } from "../components/ui";
import { E_CHARGE } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { useStore } from "../store";
import { LiveChart } from "../components/Chart";

const SCALE = 500;
interface Flying { from: "A" | "B"; t: number }

function Conservation() {
  const [nA0] = useParam("nA0", 0); // initial net electron count (positive = excess electrons)
  const [nB0] = useParam("nB0", 0);
  const [nA, setNA] = useResettable(nA0); // excess electrons on A (negative = deficit)
  const [nB, setNB] = useResettable(nB0);
  const [count, setCount] = useParam("count", 5);
  const [history, setHistory] = useResettable<{ step: number; qA: number; qB: number; total: number }[]>([{ step: 0, qA: -nA0, qB: -nB0, total: -nA0 - nB0 }]);
  const flying = useRef<Flying[]>([]);
  const [, force] = useState(0);
  const { touch } = useStore();
  const [attempt, setAttempt] = useState("");

  const qA = -nA * E_CHARGE, qB = -nB * E_CHARGE;
  const total = qA + qB;
  const transferred = nB - nB0; // electrons moved A→B net

  const transfer = (dir: "AB" | "BA") => {
    const n = Math.round(count);
    if (dir === "AB") { setNA(nA - n); setNB(nB + n); } else { setNA(nA + n); setNB(nB - n); }
    for (let i = 0; i < Math.min(n, 12); i++) flying.current.push({ from: dir === "AB" ? "A" : "B", t: -i * 0.08 });
    const newA = dir === "AB" ? nA - n : nA + n, newB = dir === "AB" ? nB + n : nB - n;
    setHistory(h => [...h, { step: h.length, qA: -newA * E_CHARGE * 1e19, qB: -newB * E_CHARGE * 1e19, total: (-newA - newB) * E_CHARGE * 1e19 }]);
    touch("transfer");
  };

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    const a = w.toPx(-0.3, 0), b = w.toPx(0.3, 0);
    const R = 52;
    chargeBall(ctx, a.x, a.y, R, qA, true, w.t);
    chargeBall(ctx, b.x, b.y, R, qB, true, w.t);
    ctx.font = "bold 22px Vazirmatn"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("A", a.x, a.y - 2); ctx.fillText("B", b.x, b.y - 2);
    label(ctx, `nA = ${nA >= 0 ? "+" : ""}${nA} e⁻`, a.x, a.y + R + 18, nA > 0 ? "#3b82f6" : nA < 0 ? "#f43f5e" : "#94a3b8", w.dark);
    label(ctx, `nB = ${nB >= 0 ? "+" : ""}${nB} e⁻`, b.x, b.y + R + 18, nB > 0 ? "#3b82f6" : nB < 0 ? "#f43f5e" : "#94a3b8", w.dark);
    label(ctx, `qA = ${(qA * 1e19).toFixed(3)}×10⁻¹⁹ C`, a.x, a.y + R + 40, w.dark ? "#cbd5e1" : "#334155", w.dark, 11);
    label(ctx, `qB = ${(qB * 1e19).toFixed(3)}×10⁻¹⁹ C`, b.x, b.y + R + 40, w.dark ? "#cbd5e1" : "#334155", w.dark, 11);
    // channel
    ctx.save(); ctx.strokeStyle = w.dark ? "rgba(148,163,184,.25)" : "rgba(71,85,105,.25)"; ctx.lineWidth = 14; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(a.x + R, a.y); ctx.lineTo(b.x - R, b.y); ctx.stroke(); ctx.restore();
    // flying electrons
    const alive: Flying[] = [];
    for (const f of flying.current) {
      f.t += 0.02;
      if (f.t < 1) alive.push(f);
      if (f.t < 0) continue;
      const s = f.from === "A" ? f.t : 1 - f.t;
      const x = a.x + R + (b.x - a.x - 2 * R) * s, y = a.y + Math.sin(f.t * Math.PI * 3) * 6;
      ctx.fillStyle = "#60a5fa"; ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff"; ctx.font = "bold 8px sans-serif"; ctx.fillText("−", x, y);
    }
    flying.current = alive;
    if (alive.length) force(v => v + 1);
    label(ctx, `بار کل سیستم: ${(total * 1e19).toFixed(3)}×10⁻¹⁹ C  (ثابت)`, w.w / 2, 26, "#10b981", w.dark, 13);
  };

  const parsed = parseFloat(attempt);
  const ratio = isNaN(parsed) ? null : parsed / 1.602;
  const isInt = ratio !== null && Math.abs(ratio - Math.round(ratio)) < 1e-3;

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="پایستگی بار" logValues={() => ({ nA, nB, "qA (×1e-19 C)": +(qA * 1e19).toFixed(3), "qB (×1e-19 C)": +(qB * 1e19).toFixed(3), "کل (×1e-19 C)": +(total * 1e19).toFixed(3) })} />}
      controls={<>
        <Panel title="انتقال الکترون">
          <Slider id="count" label="تعداد الکترون در هر انتقال" value={count} min={1} max={50} step={1} unit="e⁻" onChange={setCount} />
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => transfer("AB")}>A ← B  انتقال</Button>
            <Button className="flex-1" variant="ghost" onClick={() => transfer("BA")}>B ← A  انتقال</Button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">دکمهٔ اول الکترون‌ها را از A به B می‌فرستد (A مثبت‌تر، B منفی‌تر می‌شود).</p>
        </Panel>
        <Panel title="آزمون کوانتیده بودن">
          <p className="mb-2 text-xs text-slate-600 dark:text-slate-300">یک مقدار بار بر حسب ۱۰⁻¹⁹ کولن وارد کنید. آیا چنین باری در طبیعت ممکن است؟</p>
          <input dir="ltr" value={attempt} onChange={e => setAttempt(e.target.value)} placeholder="مثلاً 4.806 یا 2.5" className="num w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
          {ratio !== null && (
            <div className={"mt-2 rounded-lg px-2 py-1.5 text-xs font-bold " + (isInt ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/15 text-rose-600 dark:text-rose-300")}>
              q / e = {ratio.toFixed(3)} → {isInt ? `ممکن است: n = ${Math.round(ratio)}` : "ناممکن! بار باید مضرب صحیحی از e باشد."}
            </div>
          )}
        </Panel>
      </>}
      bottom={<>
        <Panel title="جدول پایستگی بار">
          <table className="num w-full text-xs">
            <thead><tr className="text-slate-500"><th className="py-1 text-right">کمیت</th><th>A</th><th>B</th><th>کل</th></tr></thead>
            <tbody className="text-center">
              <tr><td className="text-right">بار اولیه (×10⁻¹⁹ C)</td><td>{(-nA0 * 1.602).toFixed(3)}</td><td>{(-nB0 * 1.602).toFixed(3)}</td><td className="font-bold text-emerald-500">{((-nA0 - nB0) * 1.602).toFixed(3)}</td></tr>
              <tr><td className="text-right">الکترون منتقل‌شده (A→B)</td><td colSpan={2}>{transferred}</td><td>—</td></tr>
              <tr><td className="text-right">بار نهایی (×10⁻¹⁹ C)</td><td>{(qA * 1e19).toFixed(3)}</td><td>{(qB * 1e19).toFixed(3)}</td><td className="font-bold text-emerald-500">{(total * 1e19).toFixed(3)}</td></tr>
            </tbody>
          </table>
        </Panel>
        <Panel title="نمودار بار در طول آزمایش">
          <LiveChart data={history} xKey="step" series={[{ key: "qA", color: "#f43f5e", name: "qA" }, { key: "qB", color: "#3b82f6", name: "qB" }, { key: "total", color: "#10b981", name: "کل" }]} xLabel="مرحله" yLabel="q (×10⁻¹⁹ C)" />
        </Panel>
        <Panel title="خلاصه">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="بار A" value={(qA * 1e19).toFixed(2)} unit="×10⁻¹⁹ C" accent={qA > 0 ? "text-rose-500" : "text-blue-500"} />
            <Readout label="بار B" value={(qB * 1e19).toFixed(2)} unit="×10⁻¹⁹ C" accent={qB > 0 ? "text-rose-500" : "text-blue-500"} />
            <Readout label="بار کل" value={(total * 1e19).toFixed(2)} unit="×10⁻¹⁹ C" accent="text-emerald-500" sub="همیشه ثابت" />
            <Readout label="تعداد کل انتقال" value={history.length - 1} unit="بار" />
          </div>
        </Panel>
      </>}
    />
  );
}

export const conservationMeta: ExperimentMeta = {
  id: "conservation", title: "پایستگی و کوانتیده بودن بار", subtitle: "انتقال الکترون بین دو جسم", icon: "🔁",
  params: [{ id: "nA0", label: "الکترون اضافی اولیه A", min: -50, max: 50, def: 0, unit: "e" }, { id: "nB0", label: "الکترون اضافی اولیه B", min: -50, max: 50, def: 0, unit: "e" }, { id: "count", label: "تعداد در هر انتقال", min: 1, max: 50, def: 5, unit: "e" }],
  prediction: { question: "اگر ۱۰ الکترون از جسم A به جسم B منتقل شود، بار کل سیستم (A+B) چه تغییری می‌کند؟", options: ["به اندازهٔ 10e کم می‌شود", "به اندازهٔ 10e زیاد می‌شود", "تغییری نمی‌کند", "دو برابر می‌شود"], correct: 2 },
  analysis: ["پس از هر انتقال، مجموع بار دو جسم را با مقدار اولیه مقایسه کنید.", "آیا می‌توانید باری برابر 2.5e ایجاد کنید؟ چرا؟", "نمودار «کل» چه شکلی دارد؟ این چه معنایی دارد؟"],
  conclusion: <>
    <p className="text-xs leading-6"><b>پایستگی بار:</b> در یک سیستم بسته، مجموع جبری بارها ثابت می‌ماند؛ بار فقط از جسمی به جسم دیگر منتقل می‌شود. <b>کوانتیده بودن بار:</b> هر بار الکتریکی مضرب صحیحی از بار بنیادی e است.</p>
    <Formula label="کوانتش بار">q = ±n e ,  n = 1, 2, 3, …</Formula>
    <Formula label="پایستگی بار">q_A + q_B = ثابت</Formula>
  </>,
  definition: <p className="leading-6"><Term k="transfer">در هر انتقال، بار یک جسم به همان اندازه کم و بار جسم دیگر زیاد می‌شود؛ مجموع ثابت است.</Term> <Term k="count">تعداد الکترون‌ها همیشه عدد صحیح است؛ پس بار کوانتیده است.</Term></p>,
  Component: Conservation,
};
