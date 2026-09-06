import { useEffect, useMemo, useRef, useState } from "react";
import { LabCanvas, World } from "../components/LabCanvas";
import { Button, Formula, Panel, Readout, Segmented, Slider, Term, Toggle } from "../components/ui";
import { EPS0, fmt, fmtSI } from "../physics/core";
import { ExperimentLayout, ExperimentMeta } from "./types";
import { useParam, useResettable } from "../hooks";
import { LiveChart } from "../components/Chart";
import { drawCapacitor } from "./capacitorView";
import { useStore } from "../store";

const SCALE = 400;
const TAU = 0.7; // s, charging animation time constant

/** Capacitor charge dynamics: when connected Q → C·Vb exponentially; when disconnected Q is conserved. */
function useCapCharge(C: number, Vb: number, connected: boolean) {
  const qRef = useRef(C * Vb);
  const iRef = useRef(0);
  const [Q, setQ] = useResettable(C * Vb);
  const { resetKey } = useStore();
  useEffect(() => { qRef.current = C * Vb; setQ(C * Vb); /* eslint-disable-next-line */ }, [resetKey]);
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = () => {
      const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (connected) {
        const target = C * Vb; const dq = (target - qRef.current) * (1 - Math.exp(-dt / TAU));
        iRef.current = dq / Math.max(dt, 1e-3); qRef.current += dq;
        if (Math.abs(target - qRef.current) < 1e-15) { qRef.current = target; iRef.current = 0; }
        setQ(qRef.current);
      } else iRef.current = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [C, Vb, connected]);
  return { Q, setQ: (q: number) => { qRef.current = q; setQ(q); }, current: iRef };
}

// ================= 10. Capacitor =================
function CapacitorLab() {
  const [Acm, setA] = useParam("A", 200); // cm²
  const [dmm, setD] = useParam("d", 3); // mm
  const [Vb, setVb] = useParam("Vb", 12);
  const [connected, setConnected] = useState(true);
  const flow = useRef({ phase: 0 });
  const { touch } = useStore();
  const A = Acm * 1e-4, d = dmm * 1e-3;
  const C = EPS0 * A / d;
  const { Q, setQ, current } = useCapCharge(C, Vb, connected);
  const V = Q / C, E = V / d, U = 0.5 * Q * Q / C;
  const [history, setHistory] = useState<{ t: number; Q: number; V: number }[]>([]);
  const t0 = useRef(performance.now());
  useEffect(() => { const id = setInterval(() => setHistory(h => [...h.slice(-120), { t: +((performance.now() - t0.current) / 1000).toFixed(1), Q: Q * 1e9, V }]), 150); return () => clearInterval(id); }, [Q, V]);

  const draw = (ctx: CanvasRenderingContext2D, w: World) => drawCapacitor(ctx, w, { A, d, Vb, Q, C, V, kappa: 1, insert: 0, connected, current: current.current }, flow.current);

  const dataD = useMemo(() => { const o = []; for (let dd = 0.5; dd <= 10; dd += 0.25) o.push({ d: dd, C: EPS0 * A / (dd * 1e-3) * 1e12 }); return o; }, [A]);
  const dataA = useMemo(() => { const o = []; for (let aa = 10; aa <= 500; aa += 10) o.push({ A: aa, C: EPS0 * aa * 1e-4 / d * 1e12 }); return o; }, [d]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="خازن" minHeight={520}
        probe={() => ({ V, E: { x: E, y: 0 }, extra: { "ولتاژ خازن": fmtSI(V, "V") } })}
        logValues={() => ({ "A (cm²)": Acm, "d (mm)": dmm, "Vb (V)": Vb, متصل: connected ? "بله" : "خیر", "C (pF)": +(C * 1e12).toFixed(2), "Q (nC)": +(Q * 1e9).toFixed(3), "V (V)": +V.toFixed(2), "E (V/m)": +E.toFixed(0), "U (nJ)": +(U * 1e9).toFixed(3) })} />}
      controls={<>
        <Panel title="مدار">
          <Toggle id="connected" label={connected ? "خازن به باتری متصل است" : "خازن از باتری جداست"} checked={connected} onChange={setConnected} />
          <p className="mt-2 text-[11px] text-slate-500">{connected ? "با تغییر d یا A، بار Q تغییر می‌کند و V ثابت (برابر باتری) می‌ماند." : "با تغییر d یا A، بار Q ثابت می‌ماند و V تغییر می‌کند."}</p>
        </Panel>
        <Panel title="هندسهٔ خازن">
          <Slider id="A" label="مساحت صفحات A" value={Acm} min={10} max={500} step={5} unit="cm²" onChange={setA} />
          <div className="h-3" />
          <Slider id="d" label="فاصلهٔ صفحات d" value={dmm} min={0.5} max={10} step={0.1} unit="mm" onChange={setD} />
        </Panel>
        <Panel title="منبع">
          <Slider id="Vb" label="ولتاژ باتری" value={Vb} min={0} max={24} step={0.5} unit="V" onChange={setVb} />
          {!connected && <div className="mt-3"><Slider id="Q" label="بار خازن (دستی)" value={+(Q * 1e9).toFixed(3)} min={0} max={10} step={0.01} unit="nC" onChange={v => { setQ(v * 1e-9); touch("Q"); }} /></div>}
          <div className="mt-3 flex gap-2"><Button variant="ghost" className="flex-1" onClick={() => { setConnected(false); setQ(0); touch("Q"); }}>تخلیهٔ کامل</Button></div>
        </Panel>
      </>}
      bottom={<>
        <Panel title="کمیت‌های خازن">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="ظرفیت C = ε₀A/d" value={fmt(C * 1e12)} unit="pF" accent="text-cyan-500" />
            <Readout label="بار Q = CV" value={fmt(Q * 1e9)} unit="nC" accent="text-rose-500" />
            <Readout label="ولتاژ V = Q/C" value={V.toFixed(2)} unit="V" accent="text-emerald-500" />
            <Readout label="میدان E = V/d" value={fmt(E)} unit="V/m" accent="text-purple-500" />
            <Readout label="انرژی U = ½CV²" value={fmt(U * 1e9)} unit="nJ" accent="text-amber-500" />
            <Readout label="σ = Q/A" value={fmt(Q / A * 1e9)} unit="nC/m²" />
          </div>
        </Panel>
        <Panel title="C بر حسب d و A">
          <LiveChart data={dataD} xKey="d" series={[{ key: "C", color: "#22d3ee", name: "C (pF)" }]} xLabel="d (mm)" yLabel="C (pF)" marker={{ x: dmm, y: C * 1e12 }} height={150} />
          <LiveChart data={dataA} xKey="A" series={[{ key: "C", color: "#a855f7", name: "C (pF)" }]} xLabel="A (cm²)" yLabel="C (pF)" marker={{ x: Acm, y: C * 1e12 }} height={150} />
        </Panel>
        <Panel title="Q و V در زمان (شارژ/تخلیه)">
          <LiveChart data={history} xKey="t" series={[{ key: "Q", color: "#f43f5e", name: "Q (nC)" }, { key: "V", color: "#10b981", name: "V (V)" }]} xLabel="t (s)" yLabel="" />
        </Panel>
      </>}
    />
  );
}

export const capacitorMeta: ExperimentMeta = {
  id: "capacitor", title: "خازن", subtitle: "خازن تخت، شارژ و ظرفیت", icon: "🔌",
  params: [{ id: "A", label: "مساحت", min: 10, max: 500, def: 200, unit: "cm²" }, { id: "d", label: "فاصله", min: 0.5, max: 10, def: 3, unit: "mm" }, { id: "Vb", label: "ولتاژ باتری", min: 0, max: 24, def: 12, unit: "V" }],
  prediction: { question: "خازنی به باتری متصل است. اگر فاصلهٔ صفحات را دو برابر کنیم، بار ذخیره‌شده چه می‌شود؟", options: ["دو برابر", "نصف", "بدون تغییر", "چهار برابر"], correct: 1 },
  analysis: ["در حالت متصل، d را دو برابر کنید: C، Q و V هر کدام چه شدند؟", "خازن را جدا کنید و دوباره d را دو برابر کنید: این بار کدام ثابت ماند؟", "نمودار C بر حسب d چه شکلی است؟ و C بر حسب A؟", "به حرکت الکترون‌ها هنگام شارژ نگاه کنید: از کدام صفحه به کدام صفحه می‌روند؟"],
  conclusion: <>
    <p className="text-xs leading-6">ظرفیت خازن تخت فقط به هندسهٔ آن بستگی دارد. با اتصال به باتری، ولتاژ خازن ثابت و برابر ولتاژ باتری است و Q = CV با تغییر C تغییر می‌کند. با جدا کردن از باتری، بار Q جایی برای رفتن ندارد و ثابت می‌ماند؛ در این حالت V = Q/C تغییر می‌کند.</p>
    <Formula label="ظرفیت خازن تخت">C = ε₀ A / d ,  ε₀ = 8.85×10⁻¹² F/m</Formula>
    <Formula label="تعریف ظرفیت">C = Q / V</Formula>
    <Formula label="میدان یکنواخت بین صفحات">E = V / d</Formula>
  </>,
  definition: <p className="leading-6"><Term k="A">ظرفیت با مساحت صفحات نسبت مستقیم دارد.</Term> <Term k="d">ظرفیت با فاصلهٔ صفحات نسبت وارون دارد.</Term> <Term k={["Vb", "connected"]}>در اتصال به باتری، V ثابت است و Q = CV.</Term> <Term k="Q">در حالت جدا، Q ثابت است و V = Q/C.</Term></p>,
  Component: CapacitorLab,
};

// ================= 11. Dielectric =================
function DielectricLab() {
  const [Acm, setA] = useParam("A", 200);
  const [dmm, setD] = useParam("d", 3);
  const [Vb, setVb] = useParam("Vb", 12);
  const [kappa, setKappa] = useParam("kappa", 4);
  const [insert, setInsert] = useParam("insert", 0);
  const [connected, setConnected] = useState(true);
  const flow = useRef({ phase: 0 });
  const [snap, setSnap] = useResettable<{ C: number; Q: number; V: number; U: number; insert: number } | null>(null);
  const { touch } = useStore();
  const A = Acm * 1e-4, d = dmm * 1e-3;
  const C0 = EPS0 * A / d;
  const C = C0 * (1 + (kappa - 1) * insert); // partially inserted slab = two capacitors in parallel
  const { Q, current } = useCapCharge(C, Vb, connected);
  const V = Q / C, E = V / d, U = 0.5 * Q * Q / C;

  const draw = (ctx: CanvasRenderingContext2D, w: World) => drawCapacitor(ctx, w, { A, d, Vb, Q, C, V, kappa, insert, connected, current: current.current }, flow.current);
  const dataK = useMemo(() => { const o = []; for (let k = 1; k <= 10; k += 0.25) { const c = C0 * (1 + (k - 1) * insert); o.push({ k, C: c * 1e12, Q: connected ? c * Vb * 1e9 : Q * 1e9, V: connected ? Vb : Q / c }); } return o; }, [C0, insert, connected, Vb, Q]);

  const materials = [{ value: "1", label: "خلأ 1" }, { value: "2.1", label: "تفلون 2.1" }, { value: "4", label: "کاغذ 4" }, { value: "6", label: "میکا 6" }, { value: "80", label: "آب 80" }];

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="خازن با دی‌الکتریک" minHeight={520}
        probe={() => ({ V, E: { x: E, y: 0 } })}
        logValues={() => ({ κ: kappa, "درصد ورود": +(insert * 100).toFixed(0), متصل: connected ? "بله" : "خیر", "C (pF)": +(C * 1e12).toFixed(2), "Q (nC)": +(Q * 1e9).toFixed(3), "V (V)": +V.toFixed(2), "U (nJ)": +(U * 1e9).toFixed(3) })} />}
      controls={<>
        <Panel title="حالت مدار">
          <Segmented id="connected" options={[{ value: "on", label: "متصل به باتری (V ثابت)" }, { value: "off", label: "جدا از باتری (Q ثابت)" }]} value={connected ? "on" : "off"} onChange={v => setConnected(v === "on")} />
        </Panel>
        <Panel title="دی‌الکتریک">
          <Segmented id="kappa" options={materials} value={String(kappa)} onChange={v => setKappa(parseFloat(v))} />
          <div className="mt-3"><Slider id="kappa" label="ثابت دی‌الکتریک κ" value={kappa} min={1} max={10} step={0.1} unit="" onChange={setKappa} /></div>
          <div className="mt-3"><Slider id="insert" label="میزان ورود دی‌الکتریک" value={insert} min={0} max={1} step={0.01} unit="" onChange={setInsert} format={v => `${(v * 100).toFixed(0)}٪`} /></div>
          <div className="mt-2 flex gap-2">
            <Button className="flex-1" onClick={() => { setInsert(1); touch("insert"); }}>وارد کردن کامل</Button>
            <Button variant="ghost" className="flex-1" onClick={() => { setInsert(0); touch("insert"); }}>خارج کردن</Button>
          </div>
        </Panel>
        <Panel title="هندسه و منبع">
          <Slider id="A" label="مساحت A" value={Acm} min={10} max={500} step={5} unit="cm²" onChange={setA} />
          <div className="h-3" />
          <Slider id="d" label="فاصله d" value={dmm} min={0.5} max={10} step={0.1} unit="mm" onChange={setD} />
          <div className="h-3" />
          <Slider id="Vb" label="ولتاژ باتری" value={Vb} min={0} max={24} step={0.5} unit="V" onChange={setVb} />
        </Panel>
      </>}
      bottom={<>
        <Panel title="مقایسهٔ قبل/بعد">
          <Button variant="success" className="mb-2 w-full" onClick={() => setSnap({ C, Q, V, U, insert })}>ثبت وضعیت فعلی به‌عنوان «قبل»</Button>
          <table className="num w-full text-xs">
            <thead><tr className="text-slate-500"><th className="text-right">کمیت</th><th>قبل</th><th>اکنون</th><th>نسبت</th></tr></thead>
            <tbody className="text-center">
              {([["C (pF)", snap?.C, C, 1e12], ["Q (nC)", snap?.Q, Q, 1e9], ["V (V)", snap?.V, V, 1], ["U (nJ)", snap?.U, U, 1e9]] as [string, number | undefined, number, number][]).map(([k, b, n, f]) => (
                <tr key={k}><td className="text-right">{k}</td><td>{b !== undefined ? fmt(b * f) : "—"}</td><td className="font-bold">{fmt(n * f)}</td><td className={b ? "text-cyan-500 font-bold" : ""}>{b ? (n / b).toFixed(2) + "×" : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="خوانش‌ها">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="C₀ (بدون دی‌الکتریک)" value={fmt(C0 * 1e12)} unit="pF" />
            <Readout label="C = κC₀" value={fmt(C * 1e12)} unit="pF" accent="text-cyan-500" />
            <Readout label="Q" value={fmt(Q * 1e9)} unit="nC" accent="text-rose-500" />
            <Readout label="V" value={V.toFixed(2)} unit="V" accent="text-emerald-500" />
            <Readout label="E بین صفحات" value={fmt(E)} unit="V/m" accent="text-purple-500" />
            <Readout label="U" value={fmt(U * 1e9)} unit="nJ" accent="text-amber-500" />
          </div>
        </Panel>
        <Panel title={`Q و V بر حسب κ (${connected ? "V ثابت" : "Q ثابت"})`}>
          <LiveChart data={dataK} xKey="k" series={[{ key: "Q", color: "#f43f5e", name: "Q (nC)" }, { key: "V", color: "#10b981", name: "V (V)" }, { key: "C", color: "#22d3ee", name: "C (pF)", dashed: true }]} xLabel="κ" yLabel="" marker={{ x: kappa, y: connected ? Q * 1e9 : V }} />
        </Panel>
      </>}
    />
  );
}

export const dielectricMeta: ExperimentMeta = {
  id: "dielectric", title: "خازن با دی‌الکتریک", subtitle: "اثر دی‌الکتریک در دو حالت متصل و جدا", icon: "🧱",
  params: [{ id: "kappa", label: "κ", min: 1, max: 10, def: 4, unit: "" }, { id: "insert", label: "میزان ورود", min: 0, max: 1, def: 0, unit: "" }, { id: "A", label: "مساحت", min: 10, max: 500, def: 200, unit: "cm²" }, { id: "d", label: "فاصله", min: 0.5, max: 10, def: 3, unit: "mm" }, { id: "Vb", label: "ولتاژ باتری", min: 0, max: 24, def: 12, unit: "V" }],
  prediction: { question: "خازنِ جدا از باتری را با دی‌الکتریک κ=4 پر می‌کنیم. ولتاژ خازن چه می‌شود؟", options: ["۴ برابر", "بدون تغییر", "یک‌چهارم", "صفر"], correct: 2 },
  analysis: ["در حالت متصل، وضعیت را ثبت کنید و دی‌الکتریک را وارد کنید: کدام کمیت‌ها چند برابر شدند؟", "همین کار را در حالت جدا از باتری تکرار کنید: چه تفاوتی دارد؟", "انرژی U در هر دو حالت چگونه تغییر کرد؟ کم شد یا زیاد؟ چرا؟", "به مولکول‌های قطبی‌شده در دی‌الکتریک نگاه کنید: چرا میدان کاهش می‌یابد؟"],
  conclusion: <>
    <p className="text-xs leading-6">دی‌الکتریک با قطبیده شدن، میدان درون خازن را تضعیف می‌کند و ظرفیت را κ برابر می‌کند. اگر خازن <b>به باتری متصل</b> باشد، V ثابت می‌ماند و Q و U هر دو κ برابر می‌شوند (باتری بار بیشتری می‌فرستد). اگر خازن <b>جدا</b> باشد، Q ثابت است، V و E به 1/κ کاهش می‌یابند و U نیز 1/κ می‌شود (دی‌الکتریک به داخل کشیده می‌شود).</p>
    <Formula label="ظرفیت با دی‌الکتریک">C = κ C₀ = κ ε₀ A / d</Formula>
    <Formula label="متصل به باتری">V ثابت → Q' = κQ ,  U' = κU</Formula>
    <Formula label="جدا از باتری">Q ثابت → V' = V/κ ,  E' = E/κ ,  U' = U/κ</Formula>
  </>,
  definition: <p className="leading-6"><Term k={["kappa", "insert"]}>دی‌الکتریک ظرفیت را κ برابر می‌کند.</Term> <Term k="connected">در حالت متصل ولتاژ ثابت است و بار زیاد می‌شود؛ در حالت جدا بار ثابت است و ولتاژ کم می‌شود.</Term> <Term k={["A", "d"]}>هندسه هم‌زمان C₀ را تعیین می‌کند.</Term></p>,
  Component: DielectricLab,
};

// ================= 12. Capacitor energy =================
function CapEnergy() {
  const [Acm, setA] = useParam("A", 200);
  const [dmm, setD] = useParam("d", 2);
  const [kappa, setKappa] = useParam("kappa", 1);
  const [mode, setMode] = useState<"V" | "Q">("V");
  const [Vset, setVset] = useParam("V", 12);
  const [Qset, setQset] = useParam("Q", 5); // nC
  const flow = useRef({ phase: 0 });
  const A = Acm * 1e-4, d = dmm * 1e-3;
  const C = kappa * EPS0 * A / d;
  const Q = mode === "V" ? C * Vset : Qset * 1e-9;
  const V = mode === "V" ? Vset : Q / C;
  const U = 0.5 * C * V * V;
  const E = V / d;
  const unit = 1e-9; // 1 nJ per cell
  const cells = Math.min(400, Math.round(U / unit));

  const draw = (ctx: CanvasRenderingContext2D, w: World) => {
    drawCapacitor(ctx, w, { A, d, Vb: V, Q, C, V, kappa, insert: kappa > 1 ? 1 : 0, connected: mode === "V", current: 0 }, flow.current);
    // energy glow between plates
    const cx = w.w / 2, cy = w.h / 2 - 20; const gap = 24 + dmm * 16; const ph = 70 + Math.sqrt(Acm) * 7;
    const inten = Math.min(0.55, U / 2e-7);
    const g = ctx.createLinearGradient(cx - gap / 2, 0, cx + gap / 2, 0);
    g.addColorStop(0, `rgba(251,191,36,0)`); g.addColorStop(0.5, `rgba(251,191,36,${inten})`); g.addColorStop(1, `rgba(251,191,36,0)`);
    ctx.fillStyle = g; ctx.fillRect(cx - gap / 2, cy - ph / 2, gap, ph);
  };

  const dataV = useMemo(() => { const o = []; for (let v = 0; v <= 24; v += 0.5) o.push({ V: v, U: 0.5 * C * v * v * 1e9 }); return o; }, [C]);
  const dataQ = useMemo(() => { const o = []; for (let q = 0; q <= 10; q += 0.25) o.push({ Q: q, U: 0.5 * (q * 1e-9) ** 2 / C * 1e9 }); return o; }, [C]);

  return (
    <ExperimentLayout
      canvas={<LabCanvas scale={SCALE} draw={draw} expName="انرژی خازن" minHeight={520}
        probe={() => ({ V, E: { x: E, y: 0 } })}
        logValues={() => ({ "C (pF)": +(C * 1e12).toFixed(2), "Q (nC)": +(Q * 1e9).toFixed(3), "V (V)": +V.toFixed(2), "U (nJ)": +(U * 1e9).toFixed(3) })} />}
      controls={<>
        <Panel title="متغیر مستقل">
          <Segmented id="mode" options={[{ value: "V", label: "ولتاژ ثابت (باتری)" }, { value: "Q", label: "بار ثابت (جدا)" }]} value={mode} onChange={setMode} />
          <div className="mt-3">
            {mode === "V" ? <Slider id="V" label="ولتاژ V" value={Vset} min={0} max={24} step={0.5} unit="V" onChange={setVset} /> : <Slider id="Q" label="بار Q" value={Qset} min={0} max={10} step={0.1} unit="nC" onChange={setQset} />}
          </div>
        </Panel>
        <Panel title="ظرفیت (از هندسه)">
          <Slider id="A" label="مساحت A" value={Acm} min={10} max={500} step={5} unit="cm²" onChange={setA} />
          <div className="h-3" />
          <Slider id="d" label="فاصله d" value={dmm} min={0.5} max={10} step={0.1} unit="mm" onChange={setD} />
          <div className="h-3" />
          <Slider id="kappa" label="κ دی‌الکتریک" value={kappa} min={1} max={10} step={0.5} unit="" onChange={setKappa} />
          <p className="num mt-2 text-xs text-cyan-600 dark:text-cyan-300">C = {fmtSI(C, "F")}</p>
        </Panel>
      </>}
      bottom={<>
        <Panel title="انرژی ذخیره‌شده">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="U = ½CV²" value={fmt(U * 1e9)} unit="nJ" accent="text-amber-500" />
            <Readout label="U = Q²/2C" value={fmt(0.5 * Q * Q / C * 1e9)} unit="nJ" />
            <Readout label="U = ½QV" value={fmt(0.5 * Q * V * 1e9)} unit="nJ" />
            <Readout label="چگالی انرژی u = ½ε₀κE²" value={fmt(0.5 * EPS0 * kappa * E * E)} unit="J/m³" />
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>واحدهای انرژی (هر خانه = 1 nJ)</span><span className="num">{cells}{U / unit > 400 ? "+" : ""}</span></div>
            <div className="flex flex-wrap gap-[2px] rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800/60" style={{ minHeight: 40 }}>
              {Array.from({ length: cells }).map((_, i) => <span key={i} className="h-2 w-2 rounded-sm bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,.8)]" />)}
              {cells === 0 && <span className="text-[11px] text-slate-400">هنوز انرژی ذخیره نشده است</span>}
            </div>
          </div>
        </Panel>
        <Panel title="U بر حسب V (سهمی)">
          <LiveChart data={dataV} xKey="V" series={[{ key: "U", color: "#f59e0b", name: "U (nJ)" }]} xLabel="V (V)" yLabel="U (nJ)" marker={{ x: +V.toFixed(1), y: U * 1e9 }} />
        </Panel>
        <Panel title="U بر حسب Q (سهمی)">
          <LiveChart data={dataQ} xKey="Q" series={[{ key: "U", color: "#f43f5e", name: "U (nJ)" }]} xLabel="Q (nC)" yLabel="U (nJ)" marker={{ x: +(Q * 1e9).toFixed(2), y: U * 1e9 }} />
        </Panel>
      </>}
    />
  );
}

export const capEnergyMeta: ExperimentMeta = {
  id: "capenergy", title: "انرژی خازن", subtitle: "انرژی ذخیره‌شده در میدان الکتریکی", icon: "🔆",
  params: [{ id: "V", label: "ولتاژ", min: 0, max: 24, def: 12, unit: "V" }, { id: "Q", label: "بار", min: 0, max: 10, def: 5, unit: "nC" }, { id: "A", label: "مساحت", min: 10, max: 500, def: 200, unit: "cm²" }, { id: "d", label: "فاصله", min: 0.5, max: 10, def: 2, unit: "mm" }, { id: "kappa", label: "κ", min: 1, max: 10, def: 1, unit: "" }],
  prediction: { question: "اگر ولتاژ دو سر خازن را دو برابر کنیم، انرژی ذخیره‌شده چه می‌شود؟", options: ["دو برابر", "چهار برابر", "نصف", "بدون تغییر"], correct: 1 },
  analysis: ["V را از ۶ به ۱۲ ولت ببرید: تعداد خانه‌های انرژی چند برابر شد؟", "در حالت Q ثابت، d را دو برابر کنید: U چه شد؟ این انرژی از کجا آمد؟", "در حالت V ثابت، d را دو برابر کنید: U چه شد؟", "نمودار U بر حسب V چه شکلی دارد؟ خطی است یا سهمی؟"],
  conclusion: <>
    <p className="text-xs leading-6">برای شارژ خازن باید بار را برخلاف میدانِ در حال رشد جابه‌جا کرد؛ این کار به‌صورت انرژی در میدان الکتریکی بین صفحات ذخیره می‌شود. انرژی با مجذور ولتاژ (یا مجذور بار) متناسب است؛ به همین دلیل نمودار سهمی‌شکل است.</p>
    <Formula label="انرژی ذخیره‌شده در خازن">U = ½ C V² = Q² / 2C = ½ Q V</Formula>
  </>,
  definition: <p className="leading-6"><Term k="V">انرژی با مجذور ولتاژ متناسب است.</Term> <Term k="Q">در بار ثابت، انرژی با 1/C متناسب است.</Term> <Term k={["A", "d", "kappa"]}>تغییر ظرفیت، انرژی را در V ثابت به‌طور مستقیم و در Q ثابت به‌طور وارون تغییر می‌دهد.</Term></p>,
  Component: CapEnergy,
};
