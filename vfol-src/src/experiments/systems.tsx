import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, Slider, Stat, Segmented, Select, Badge, Button, fmt, sci, Callout } from "../components/ui";
import { XYChart, AreaSpectrum, Palette } from "../components/Chart";
import { Compare, RecordBar, useExplain, type ExperimentDef, type SimProps } from "../components/ExperimentShell";
import * as P from "../lib/physics";
import { noisy, noisyAdd, B, commonErrors } from "./common";
import { Plus, Trash2 } from "lucide-react";

// ============ Experiment 8: OTDR ============
function OtdrSim({ model, noise, record, sim, lang }: SimProps) {
  const [L, setL] = useState(40), [alpha, setAlpha] = useState(0.2), [pulse, setPulse] = useState(100), [P0, setP0] = useState(10);
  const [events, setEvents] = useState<P.OtdrEvent[]>([
    { id: "c1", type: "connector", pos: 0.5, loss: 0.4, refl: -45 }, { id: "s1", type: "splice", pos: 12, loss: 0.08 }, { id: "b1", type: "bend", pos: 22, loss: 0.9 }, { id: "c2", type: "connector", pos: 30, loss: 0.5, refl: -38 },
  ]);
  const [sel, setSel] = useState<string | null>("s1");
  const varied = useMemo(() => events.map((e) => ({ ...e, loss: e.type === "connector" && noise.conn && model === "experimental" ? Math.max(0.05, e.loss + 0.15 * P.gauss()) : e.type === "splice" && noise.splice && model === "experimental" ? Math.max(0.01, e.loss + 0.04 * P.gauss()) : e.loss })), [events, noise, model]);
  const avgSeed = Math.floor(sim.t / 5);
  const out = useMemo(() => P.otdrTrace({ L, alpha, events: varied, pulseNs: pulse, P0, model, seed: 42 + avgSeed }), [L, alpha, varied, pulse, P0, model, avgSeed]);
  const update = (id: string, patch: Partial<P.OtdrEvent>) => setEvents((ev) => ev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const add = (type: P.OtdrEvent["type"]) => { const id = type[0] + Math.random().toString(36).slice(2, 6); setEvents((ev) => [...ev, { id, type, pos: +(L / 2).toFixed(1), loss: type === "connector" ? 0.4 : type === "splice" ? 0.1 : type === "mechsplice" ? 0.3 : type === "bend" ? 0.8 : 0, refl: type === "connector" ? -40 : type === "mechsplice" ? -50 : type === "break" ? -20 : undefined }]); setSel(id); };
  const totalLoss = useMemo(() => { const brk = varied.find((e) => e.type === "break"); const end = brk ? brk.pos : L; return alpha * end + varied.filter((e) => e.pos <= end).reduce((a, e) => a + e.loss, 0); }, [varied, alpha, L]);
  const measTotal = useMemo(() => noisyAdd(totalLoss, 0.1, model, noise.meas), [totalLoss, model, noise]);
  const current = events.find((e) => e.id === sel);
  const brk = events.find((e) => e.type === "break");
  const typeName: Record<string, string> = lang === "fa" ? { connector: "کانکتور", splice: "اسپلایس فیوژن", mechsplice: "اسپلایس مکانیکی", bend: "خمش", break: "شکستگی", end: "انتهای فیبر" } : { connector: "Connector", splice: "Fusion splice", mechsplice: "Mechanical splice", bend: "Bend", break: "Break", end: "Fiber end" };
  const explain = useExplain({ pulse, L, α: alpha }, {
    pulse: B("Longer pulses inject more energy → higher backscatter and dynamic range, but poorer spatial resolution and longer dead zones (Δz = c·τ/2n).", "پالس بلندتر انرژی بیشتری تزریق می‌کند ← بازپراکنش و محدوده دینامیکی بالاتر، اما تفکیک مکانی بدتر و ناحیه مرده طولانی‌تر (Δz = c·τ/2n)."),
    L: B("The trace slope is −2α (two-way path) so the backscatter level drops by 2αL before the end reflection.", "شیب منحنی −2α است (مسیر رفت‌وبرگشت) بنابراین سطح بازپراکنش پیش از بازتاب انتهایی به اندازه 2αL افت می‌کند."),
    α: B("The OTDR measures the one-way attenuation from the slope: α = −(slope)/2 in dB/km.", "OTDR تضعیف یک‌طرفه را از شیب اندازه می‌گیرد: α = −(شیب)/2 بر حسب dB/km."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "تنظیمات OTDR" : "OTDR settings"} className="space-y-4">
        <Slider label={lang === "fa" ? "طول فیبر" : "Fiber length"} value={L} min={2} max={120} step={1} unit="km" onChange={setL} />
        <Slider label="α" value={alpha} min={0.15} max={1} step={0.01} unit="dB/km" onChange={setAlpha} />
        <Slider label={lang === "fa" ? "پهنای پالس" : "Pulse width"} value={pulse} min={5} max={10000} step={5} unit="ns" onChange={setPulse} />
        <Slider label={lang === "fa" ? "توان پالس" : "Pulse power"} value={P0} min={0} max={20} step={1} unit="dBm" onChange={setP0} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label={lang === "fa" ? "تفکیک مکانی" : "Resolution"} value={fmt(out.resolutionKm * 1000, 1)} unit="m" />
          <Stat label={lang === "fa" ? "محدوده دینامیکی" : "Dynamic range"} value={fmt(out.dynamicRange, 1)} unit="dB" />
          <Stat label={lang === "fa" ? "انتهای فیبر" : "Fiber end"} value={fmt(out.fiberEnd, 2)} unit="km" tone={brk ? "bad" : "good"} />
          <Stat label={lang === "fa" ? "تلفات کل لینک" : "Total link loss"} value={fmt(totalLoss, 2)} unit="dB" />
        </div>
        <div className="text-xs font-semibold">{lang === "fa" ? "افزودن رویداد" : "Add event"}</div>
        <div className="flex flex-wrap gap-1.5">{(["connector", "splice", "mechsplice", "bend", "break"] as const).map((tp) => <Button key={tp} size="sm" variant="outline" onClick={() => add(tp)}><Plus size={11} />{typeName[tp]}</Button>)}</div>
        {current && (
          <div className="panel-2 p-3 space-y-3">
            <div className="flex justify-between items-center text-xs"><Badge>{typeName[current.type]}</Badge><Button size="sm" variant="danger" onClick={() => { setEvents((ev) => ev.filter((e) => e.id !== current.id)); setSel(null); }}><Trash2 size={11} /></Button></div>
            <Slider label={lang === "fa" ? "مکان" : "Position"} value={current.pos} min={0} max={L} step={0.1} unit="km" onChange={(v) => update(current.id, { pos: v })} />
            {current.type !== "break" && <Slider label={lang === "fa" ? "تلفات" : "Loss"} value={current.loss} min={0} max={3} step={0.01} unit="dB" onChange={(v) => update(current.id, { loss: v })} />}
            {current.refl !== undefined && <Slider label={lang === "fa" ? "بازتاب" : "Reflectance"} value={current.refl} min={-70} max={-14} step={1} unit="dB" onChange={(v) => update(current.id, { refl: v })} />}
          </div>
        )}
        <RecordBar onRecord={() => record({ L_km: L, alpha, pulse_ns: pulse, events: events.length }, { theory: +totalLoss.toFixed(3), measured: +measTotal.toFixed(3), resolution_m: +(out.resolutionKm * 1000).toFixed(1), fiber_end_km: +out.fiberEnd.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="OTDR Trace" right={<span className="text-[10px] muted num">avg #{avgSeed}</span>}>
          <XYChart data={out.trace.map((p) => ({ x: p.z, y: p.dB }))} series={[{ key: "y", name: "Backscatter (dB)" }]} xLabel="Distance (km)" yLabel="dB" height={300} refX={events.map((e) => ({ x: e.pos, label: typeName[e.type].slice(0, 6), color: e.type === "break" ? "#ef4444" : e.type === "bend" ? "#f59e0b" : "#8b5cf6" }))} />
          <div className="text-[10px] muted mt-1">{lang === "fa" ? "شیب = −2α؛ پله = تلفات رویداد؛ قله = بازتاب فرنل (کانکتور/شکستگی/انتها)." : "Slope = −2α; step = event loss; spike = Fresnel reflection (connector/break/end)."}</div>
        </Panel>
        <Panel title={lang === "fa" ? "جدول رویدادها" : "Event table"}>
          <table className="w-full text-xs"><thead><tr className="muted text-[11px]"><th className="text-start">#</th><th>{lang === "fa" ? "نوع" : "Type"}</th><th>{lang === "fa" ? "فاصله (km)" : "Distance (km)"}</th><th>{lang === "fa" ? "تلفات (dB)" : "Loss (dB)"}</th><th>{lang === "fa" ? "بازتاب (dB)" : "Refl. (dB)"}</th><th>{lang === "fa" ? "تجمعی (dB)" : "Cumulative (dB)"}</th></tr></thead>
            <tbody>{[...varied].sort((a, b) => a.pos - b.pos).map((e, i, arr) => { const cum = alpha * e.pos + arr.slice(0, i + 1).reduce((s, x) => s + x.loss, 0); return <tr key={e.id} onClick={() => setSel(e.id)} className={`border-t border-line cursor-pointer ${sel === e.id ? "bg-brand-500/10" : ""}`}><td className="py-1.5 num">{i + 1}</td><td className="text-center">{typeName[e.type]}</td><td className="num text-center">{noisyAdd(e.pos, out.resolutionKm / 3, model, noise.inst).toFixed(3)}</td><td className="num text-center">{e.type === "break" ? "—" : e.loss.toFixed(3)}</td><td className="num text-center">{e.refl !== undefined ? e.refl.toFixed(1) : "—"}</td><td className="num text-center">{cum.toFixed(2)}</td></tr>; })}
              <tr className="border-t border-line font-semibold"><td className="py-1.5">∎</td><td className="text-center">{brk ? typeName.break : typeName.end}</td><td className="num text-center">{out.fiberEnd.toFixed(2)}</td><td colSpan={2} /><td className="num text-center">{totalLoss.toFixed(2)}</td></tr></tbody></table>
          <div className="mt-3"><Compare rows={[{ label: lang === "fa" ? "تلفات کل (dB)" : "Total loss (dB)", theory: totalLoss, measured: measTotal }]} /></div>
        </Panel>
      </div>
    </div>
  );
}

// ============ Experiment 9: Link budget ============
function LinkBudgetSim({ model, noise, record, lang }: SimProps) {
  const [Pt, setPt] = useState(0), [L, setL] = useState(40), [lam, setLam] = useState(1550), [nConn, setNConn] = useState(2), [connLoss, setConnLoss] = useState(0.5), [nSplice, setNSplice] = useState(8), [spliceLoss, setSpliceLoss] = useState(0.1), [splitN, setSplitN] = useState(1), [coupler, setCoupler] = useState(0), [gain, setGain] = useState(0), [sens, setSens] = useState(-28), [margin, setMargin] = useState(3), [bitRate, setBitRate] = useState(10);
  const alpha = model === "ideal" ? (lam > 1400 ? 0.2 : 0.35) : P.attenuationSpectrum(lam, 0.5, model);
  const connEff = model === "experimental" && noise.conn ? connLoss + 0.15 : connLoss;
  const spliceEff = model === "experimental" && noise.splice ? spliceLoss + 0.03 : spliceLoss;
  const lb = P.linkBudget({ Pt, L, alpha, nConn, connLoss, nSplice, spliceLoss, splitN, splitExcess: 1, couplerLoss: coupler, gain, sens, margin });
  const lbReal = P.linkBudget({ Pt, L, alpha, nConn, connLoss: connEff, nSplice, spliceLoss: spliceEff, splitN, splitExcess: 1.2, couplerLoss: coupler, gain, sens, margin });
  const measPr = useMemo(() => noisyAdd(lbReal.Pr, 0.2, model, noise.meas), [lbReal.Pr, model, noise]);
  const dispPen = P.chromaticBroadening(P.fiberDispersion("smf", lam), L, 0.1) * bitRate * 1e-3; // fraction of bit slot
  const dispersionOk = dispPen < 0.25;
  const curve = useMemo(() => P.linspace(0, 200, 100).map((z) => ({ x: +z.toFixed(1), Pr: +P.linkBudget({ Pt, L: z, alpha, nConn, connLoss, nSplice: Math.round(z / 5), spliceLoss, splitN, splitExcess: 1, couplerLoss: coupler, gain, sens, margin }).Pr.toFixed(2) })), [Pt, alpha, nConn, connLoss, spliceLoss, splitN, coupler, gain, sens, margin]);
  const explain = useExplain({ Pt, L, λ: lam, splitN, gain, sens }, {
    Pt: B("Transmitter power sets the starting point of the budget. Beyond ~+17 dBm, nonlinear effects (SBS) appear.", "توان فرستنده نقطه شروع بودجه است. بالاتر از ~+17 dBm اثرات غیرخطی (SBS) ظاهر می‌شوند."),
    L: B("Fiber loss αL plus roughly one splice per 4–5 km of cable dominates long links.", "تلفات فیبر αL به‌علاوه تقریباً یک اسپلایس در هر ۴–۵ km کابل بر لینک‌های بلند غالب است."),
    λ: B("α is ~0.2 dB/km at 1550 nm vs ~0.35 at 1310 nm — but dispersion is larger at 1550 nm.", "α حدود ۰٫۲ dB/km در ۱۵۵۰ nm در برابر ~۰٫۳۵ در ۱۳۱۰ nm است — اما پاشندگی در ۱۵۵۰ nm بیشتر است."),
    splitN: B("A 1:N splitter costs 10·log₁₀(N) dB plus excess loss — 1:32 ≈ 15 dB + 1 dB (PON).", "اسپلیتر 1:N هزینه 10·log₁₀(N) dB به‌علاوه تلفات اضافی دارد — 1:32 ≈ 15 dB + 1 dB (PON)."),
    gain: B("An EDFA adds gain but also ASE noise; it restores power, not signal quality (OSNR).", "EDFA بهره اضافه می‌کند اما نویز ASE هم؛ توان را بازیابی می‌کند نه کیفیت سیگنال (OSNR) را."),
    sens: B("Receiver sensitivity is the minimum power for the target BER (e.g. 1e-12). APDs are ~8–10 dB more sensitive than PINs.", "حساسیت گیرنده کمترین توان برای BER هدف است (مثلاً 1e-12). APDها حدود ۸–۱۰ dB از PIN حساس‌ترند."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای لینک" : "Link parameters"} className="space-y-3">
        <Slider label="P_tx" value={Pt} min={-10} max={20} step={0.5} unit="dBm" onChange={setPt} />
        <Slider label="L" value={L} min={1} max={200} step={1} unit="km" onChange={setL} />
        <Slider label="λ" value={lam} min={1260} max={1650} step={10} unit="nm" onChange={setLam} />
        <Slider label={lang === "fa" ? "نرخ بیت" : "Bit rate"} value={bitRate} min={0.1} max={100} step={0.1} unit="Gb/s" onChange={setBitRate} />
        <div className="grid grid-cols-2 gap-3">
          <Slider label={lang === "fa" ? "تعداد کانکتور" : "# connectors"} value={nConn} min={0} max={10} onChange={setNConn} /><Slider label={lang === "fa" ? "تلفات کانکتور" : "Conn. loss"} value={connLoss} min={0.1} max={1.5} step={0.05} unit="dB" onChange={setConnLoss} />
          <Slider label={lang === "fa" ? "تعداد اسپلایس" : "# splices"} value={nSplice} min={0} max={50} onChange={setNSplice} /><Slider label={lang === "fa" ? "تلفات اسپلایس" : "Splice loss"} value={spliceLoss} min={0.01} max={0.5} step={0.01} unit="dB" onChange={setSpliceLoss} />
        </div>
        <Select label="Splitter" value={String(splitN)} onChange={(v) => setSplitN(+v)} options={[1, 2, 4, 8, 16, 32, 64].map((n) => ({ value: String(n), label: n === 1 ? (lang === "fa" ? "بدون اسپلیتر" : "none") : `1:${n}` }))} />
        <Slider label={lang === "fa" ? "تلفات کوپلر/فیلتر" : "Coupler/filter loss"} value={coupler} min={0} max={10} step={0.1} unit="dB" onChange={setCoupler} />
        <Slider label={lang === "fa" ? "بهره تقویت‌کننده" : "Amplifier gain"} value={gain} min={0} max={30} step={0.5} unit="dB" onChange={setGain} />
        <Slider label={lang === "fa" ? "حساسیت گیرنده" : "Rx sensitivity"} value={sens} min={-45} max={-10} step={0.5} unit="dBm" onChange={setSens} />
        <Slider label={lang === "fa" ? "حاشیه لازم" : "Required margin"} value={margin} min={0} max={10} step={0.5} unit="dB" onChange={setMargin} />
        <RecordBar onRecord={() => record({ Pt, L_km: L, lambda_nm: lam, nConn, nSplice, splitN, gain }, { theory: +lb.Pr.toFixed(3), measured: +measPr.toFixed(3), total_loss_dB: +lb.total.toFixed(3), margin_dB: +lb.powerMargin.toFixed(3), feasible: lb.feasible && dispersionOk ? "yes" : "no" })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "بودجه توان" : "Power budget"} right={<Badge tone={lb.feasible && dispersionOk ? "good" : "bad"}>{lb.feasible && dispersionOk ? (lang === "fa" ? "امکان‌پذیر" : "FEASIBLE") : (lang === "fa" ? "امکان‌ناپذیر" : "NOT FEASIBLE")}</Badge>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <Stat label={lang === "fa" ? "تلفات فیبر" : "Fiber"} value={fmt(lb.fiber, 2)} unit="dB" sub={`α=${alpha.toFixed(3)}`} /><Stat label={lang === "fa" ? "کانکتورها" : "Connectors"} value={fmt(lb.conn, 2)} unit="dB" /><Stat label={lang === "fa" ? "اسپلایس‌ها" : "Splices"} value={fmt(lb.splice, 2)} unit="dB" /><Stat label="Splitter" value={fmt(lb.splitter, 2)} unit="dB" />
            <Stat label={lang === "fa" ? "تلفات کل" : "Total loss"} value={fmt(lb.total, 2)} unit="dB" tone="brand" /><Stat label="P_rx" value={fmt(lb.Pr, 2)} unit="dBm" tone={lb.Pr > -3 ? "warn" : "default"} sub={lb.Pr > -3 ? (lang === "fa" ? "خطر اشباع" : "saturation risk") : ""} /><Stat label={lang === "fa" ? "حاشیه توان" : "Power margin"} value={fmt(lb.powerMargin, 2)} unit="dB" tone={lb.powerMargin >= margin ? "good" : "bad"} /><Stat label={lang === "fa" ? "پاشندگی" : "Dispersion"} value={fmt(dispPen * 100, 0)} unit="% UI" tone={dispersionOk ? "good" : "bad"} sub="< 25%" />
          </div>
          {/* waterfall */}
          <svg viewBox="0 0 560 130" className="w-full ltr">
            {(() => { const items = [{ l: "Tx", v: Pt }, { l: "fiber", v: -lb.fiber }, { l: "conn", v: -lb.conn }, { l: "splice", v: -lb.splice }, { l: "split", v: -lb.splitter }, { l: "coupler", v: -coupler }, { l: "gain", v: gain }]; const min = Math.min(sens - 5, lb.Pr - 5), max = Math.max(Pt + 5, lb.Pr + 5, Pt + gain); const y = (v: number) => 110 - ((v - min) / (max - min)) * 100; let cur = 0; const w = 60; return <g>{items.map((it, i) => { const from = i === 0 ? 0 : cur; cur = i === 0 ? it.v : cur + it.v; const top = Math.min(y(from), y(cur)), h = Math.max(1.5, Math.abs(y(from) - y(cur))); return <g key={it.l}><rect x={10 + i * 70} y={i === 0 ? y(it.v) : top} width={w} height={i === 0 ? 110 - y(it.v) : h} rx={3} fill={i === 0 ? "#337bff" : it.v >= 0 ? "#10b981" : "#f43f5e"} opacity=".8" /><text x={10 + i * 70 + w / 2} y={125} fontSize="9" textAnchor="middle" fill="currentColor" opacity=".7">{it.l}</text><text x={10 + i * 70 + w / 2} y={(i === 0 ? y(it.v) : top) - 3} fontSize="9" textAnchor="middle" fill="currentColor">{it.v.toFixed(1)}</text></g>; })}<line x1={0} y1={y(sens)} x2={560} y2={y(sens)} stroke="#f59e0b" strokeDasharray="4 3" /><text x={505} y={y(sens) - 3} fontSize="9" fill="#f59e0b">sens {sens} dBm</text><line x1={0} y1={y(lb.Pr)} x2={560} y2={y(lb.Pr)} stroke="#337bff" strokeDasharray="2 3" /><text x={505} y={y(lb.Pr) - 3} fontSize="9" fill="#337bff">Prx {lb.Pr.toFixed(1)}</text></g>; })()}
          </svg>
          <div className="mt-2"><Compare rows={[{ label: "P_rx (dBm)", theory: lb.Pr, measured: measPr }, { label: lang === "fa" ? "تلفات کل (dB)" : "Total loss (dB)", theory: lb.total, measured: Pt + gain - measPr }]} /></div>
        </Panel>
        <Panel title="Received power vs distance"><XYChart data={curve} series={[{ key: "Pr", name: "P_rx (dBm)" }]} xLabel="L (km)" yLabel="dBm" height={200} refY={[{ y: sens, label: "sensitivity" }, { y: sens + margin, label: "sens+margin", color: "#10b981" }]} refX={[{ x: L, label: "L" }]} brush={false} /></Panel>
      </div>
    </div>
  );
}

// ============ Experiment 10: OSA ============
function OsaSim({ model, noise, record, lang }: SimProps) {
  const [type, setType] = useState<"led" | "fp" | "dfb" | "tunable" | "broadband" | "pulse">("dfb"), [lam, setLam] = useState(1550), [pw, setPw] = useState(0), [lw, setLw] = useState(0.05), [fm, setFm] = useState(0), [md, setMd] = useState(0.5);
  const spec = useMemo(() => P.sourceSpectrum({ type, lambda: lam, power: pw, linewidthNm: lw, modFreqGHz: fm, modDepth: md, model: model === "experimental" && noise.det ? "experimental" : "ideal" }), [type, lam, pw, lw, fm, md, model, noise]);
  const peak = spec.reduce((a, b) => (b.y > a.y ? b : a), spec[0]);
  const half = peak.y - 3; const above = spec.filter((p) => p.y >= half); const fwhm = above.length ? above[above.length - 1].x - above[0].x : 0;
  const lwHz = (lw * 1e-9 * P.C) / Math.pow(lam * 1e-9, 2);
  const smsr = type === "fp" ? 1.5 : type === "dfb" ? 45 : NaN;
  const explain = useExplain({ λ: lam, P: pw, Δλ: lw, f_m: fm }, {
    λ: B("The spectral peak follows the source center wavelength; a tunable laser sweeps it (used for FBG interrogation, swept-wavelength measurements).", "قله طیفی از طول موج مرکزی منبع پیروی می‌کند؛ لیزر قابل تنظیم آن را جاروب می‌کند (برای بازخوانی FBG و اندازه‌گیری جاروب طول موج)."),
    P: B("Total power is the integral of the spectrum; on a log scale it shifts the trace vertically.", "توان کل انتگرال طیف است؛ در مقیاس لگاریتمی منحنی را عمودی جابه‌جا می‌کند."),
    Δλ: B("Linewidth in nm relates to Hz by Δν = cΔλ/λ². DFB: ~1–10 MHz (≪ OSA RBW), FP: ~1 nm multi-mode, LED: 30–60 nm.", "پهنای خط بر حسب nm با Δν = cΔλ/λ² به هرتز مرتبط است. DFB: ~۱–۱۰ MHz (≪ RBW طیف‌سنج)، FP: ~۱ nm چندمود، LED: ۳۰–۶۰ nm."),
    f_m: B("Intensity modulation at f_m creates sidebands at ±f_m·λ²/c (10 GHz ≈ 0.08 nm at 1550 nm) — the modulation bandwidth widens the spectrum.", "مدولاسیون شدت در f_m نوارهای کناری در ±f_m·λ²/c ایجاد می‌کند (10 GHz ≈ 0.08 nm در ۱۵۵۰ nm) — پهنای باند مدولاسیون طیف را پهن می‌کند."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "منبع نوری" : "Optical source"} className="space-y-4">
        <Select label={lang === "fa" ? "نوع منبع" : "Source type"} value={type} onChange={(v) => { setType(v); setLw(v === "led" ? 40 : v === "broadband" ? 60 : v === "fp" ? 0.3 : 0.05); }} options={[{ value: "dfb", label: "DFB laser" }, { value: "fp", label: "Fabry–Perot laser" }, { value: "led", label: "LED" }, { value: "tunable", label: "Tunable laser" }, { value: "broadband", label: "Broadband (SLED/ASE)" }, { value: "pulse", label: "Pulse source" }]} />
        <Slider label="λ" value={lam} min={1250} max={1650} step={0.1} unit="nm" onChange={setLam} fmt={(v) => v.toFixed(1)} />
        <Slider label={lang === "fa" ? "توان" : "Power"} value={pw} min={-20} max={15} step={0.5} unit="dBm" onChange={setPw} />
        <Slider label={lang === "fa" ? "پهنای خط" : "Linewidth"} value={lw} min={0.005} max={80} step={0.005} unit="nm" onChange={setLw} fmt={(v) => (v < 1 ? v.toFixed(3) : v.toFixed(1))} />
        <Slider label={lang === "fa" ? "فرکانس مدولاسیون" : "Modulation freq."} value={fm} min={0} max={40} step={0.5} unit="GHz" onChange={setFm} />
        <Slider label={lang === "fa" ? "عمق مدولاسیون" : "Modulation depth"} value={md} min={0} max={1} step={0.05} onChange={setMd} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="λ_peak" value={fmt(peak.x, 3)} unit="nm" tone="brand" /><Stat label="P_peak" value={fmt(peak.y, 2)} unit="dBm" />
          <Stat label="FWHM (−3 dB)" value={fmt(fwhm, 3)} unit="nm" /><Stat label="Δν" value={lwHz > 1e9 ? fmt(lwHz / 1e9, 2) + " GHz" : fmt(lwHz / 1e6, 1) + " MHz"} />
          <Stat label="SMSR" value={Number.isFinite(smsr) ? fmt(smsr, 0) : "—"} unit="dB" /><Stat label="ν" value={fmt(P.C / (lam * 1e-9) / 1e12, 3)} unit="THz" />
        </div>
        <RecordBar onRecord={() => record({ source: type, lambda_nm: lam, P_dBm: pw, linewidth_nm: lw, fm_GHz: fm }, { theory: lam, measured: +peak.x.toFixed(4), fwhm_nm: +fwhm.toFixed(4), peak_dBm: +peak.y.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="Optical Spectrum Analyzer — Power vs Wavelength"><AreaSpectrum data={spec} xLabel="λ (nm)" yLabel="dBm" height={320} yDomain={[-75, 20]} />
          <div className="mt-3"><Compare rows={[{ label: "λ_peak (nm)", theory: lam, measured: peak.x, digits: 3 }, { label: "P_peak (dBm)", theory: pw, measured: peak.y, digits: 2 }]} /></div></Panel>
        <Callout tone="info">{lang === "fa" ? "RBW (پهنای باند تفکیک) طیف‌سنج در اینجا ≈ span/300 است؛ خطوط باریک‌تر از RBW با پهنای RBW نمایش داده می‌شوند و قله آن‌ها به‌اندازه نسبت پهنا کاهش می‌یابد — دقیقاً مانند OSA واقعی." : "The OSA resolution bandwidth here is ≈ span/300; lines narrower than the RBW are displayed at the RBW width with peak reduced by the width ratio — exactly like a real grating OSA."}</Callout>
      </div>
    </div>
  );
}

// ============ Experiment 11: WDM ============
function WdmSim({ model, noise, record, lang }: SimProps) {
  const [nCh, setNCh] = useState(8), [spacing, setSpacing] = useState(100), [center, setCenter] = useState(1550.12), [pw, setPw] = useState(0), [bitRate, setBitRate] = useState(10), [L, setL] = useState(80), [ftype, setF] = useState<"smf" | "dsf" | "nzdsf">("smf"), [fwm, setFwm] = useState(true);
  const spNm = (spacing * 1e9 * Math.pow(center * 1e-9, 2)) / P.C * 1e9;
  const chans = useMemo(() => Array.from({ length: nCh }, (_, i) => center + (i - (nCh - 1) / 2) * spNm), [nCh, center, spNm]);
  const modWidth = (bitRate * 1e9 * Math.pow(center * 1e-9, 2)) / P.C * 1e9; // nm
  const D = P.fiberDispersion(ftype, center);
  const nl = P.nonlinearMetrics({ P0mW: P.dBm2mW(pw), gamma: 1.3, Lkm: L, alphaDb: 0.2, Aeff: 80, linewidthMHz: 10, nCh, spacingGHz: spacing, D, lambda: center });
  const fwmDb = 10 * Math.log10(Math.max(1e-12, nl.etaFWM)) + 20 * Math.log10(1.3 * P.dBm2mW(pw) * 1e-3 * nl.Leff * 1e3 / 1e3 + 1e-12) - 30 + pw + 10 * Math.log10(nl.nFWM);
  const crosstalkDb = -10 * Math.log10(1 + Math.pow(spacing / (bitRate * 2.5), 4)); // filter overlap crosstalk approx
  const spec = useMemo(() => {
    const xs = P.linspace(chans[0] - 2 * spNm, chans[chans.length - 1] + 2 * spNm, 700);
    const rbw = (xs[1] - xs[0]) * 2;
    return xs.map((x) => { let mw = P.dBm2mW(-60); for (const c of chans) { const w = Math.sqrt(modWidth * modWidth + rbw * rbw); mw += P.dBm2mW(pw) * Math.exp(-4 * Math.LN2 * Math.pow((x - c) / w, 2)); } if (fwm && chans.length > 1) { const w = Math.sqrt(modWidth * modWidth + rbw * rbw); for (let k = 1; k <= 2; k++) { mw += P.dBm2mW(fwmDb) * (Math.exp(-4 * Math.LN2 * Math.pow((x - (chans[0] - k * spNm)) / w, 2)) + Math.exp(-4 * Math.LN2 * Math.pow((x - (chans[chans.length - 1] + k * spNm)) / w, 2))); } } let v = P.mW2dBm(mw); if (model === "experimental" && noise.det) v += 0.3 * P.gauss(); return { x: +x.toFixed(4), y: +v.toFixed(2) }; });
  }, [chans, spNm, pw, modWidth, fwm, fwmDb, model, noise]);
  const osnrPenalty = fwm ? Math.max(0, 10 * Math.log10(1 + P.dBm2mW(fwmDb) / P.dBm2mW(pw) * 100)) : 0;
  const totalCap = nCh * bitRate;
  const explain = useExplain({ N: nCh, Δf: spacing, P: pw, B: bitRate, L }, {
    N: B("More channels multiply capacity (N×B) and the number of FWM products ≈ N²(N−1)/2.", "کانال‌های بیشتر ظرفیت (N×B) و تعداد محصولات FWM ≈ N²(N−1)/2 را چند برابر می‌کنند."),
    Δf: B("ITU grid: 100 GHz ≈ 0.8 nm, 50 GHz ≈ 0.4 nm. Narrower spacing raises spectral efficiency but increases linear crosstalk and FWM phase-matching efficiency.", "شبکه ITU: 100 GHz ≈ 0.8 nm، 50 GHz ≈ 0.4 nm. فاصله باریک‌تر بازده طیفی را زیاد اما همشنوایی خطی و بازده تطبیق فاز FWM را افزایش می‌دهد."),
    P: B("FWM product power scales as P³ — raising per-channel power quickly creates ghost channels.", "توان محصول FWM با P³ مقیاس می‌شود — افزایش توان هر کانال به‌سرعت کانال‌های شبح ایجاد می‌کند."),
    B: B("Modulation broadens each channel to ≈ B in optical frequency; at 50 GHz spacing, 40 Gb/s NRZ channels overlap.", "مدولاسیون هر کانال را تا ≈ B در فرکانس نوری پهن می‌کند؛ در فاصله ۵۰ GHz کانال‌های ۴۰ Gb/s NRZ هم‌پوشانی می‌کنند."),
    L: B("FWM builds up over the effective length L_eff = (1−e^{−αL})/α ≈ 21 km — so beyond ~20 km extra length hardly increases FWM.", "FWM در طول مؤثر L_eff = (1−e^{−αL})/α ≈ 21 km انباشته می‌شود — بنابراین فراتر از ~۲۰ km طول اضافی به‌سختی FWM را زیاد می‌کند."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای WDM" : "WDM parameters"} className="space-y-4">
        <Slider label={lang === "fa" ? "تعداد کانال" : "Channels"} value={nCh} min={1} max={40} step={1} onChange={setNCh} />
        <Select label={lang === "fa" ? "فاصله کانال" : "Channel spacing"} value={String(spacing)} onChange={(v) => setSpacing(+v)} options={[12.5, 25, 50, 100, 200].map((s) => ({ value: String(s), label: `${s} GHz (${((s * 1e9 * 1550e-9 ** 2) / P.C * 1e9).toFixed(2)} nm)` }))} />
        <Slider label={lang === "fa" ? "طول موج مرکزی" : "Center λ"} value={center} min={1530} max={1565} step={0.01} unit="nm" onChange={setCenter} fmt={(v) => v.toFixed(2)} />
        <Slider label={lang === "fa" ? "توان هر کانال" : "Power / channel"} value={pw} min={-15} max={10} step={0.5} unit="dBm" onChange={setPw} />
        <Slider label={lang === "fa" ? "نرخ بیت" : "Bit rate"} value={bitRate} min={1} max={100} step={1} unit="Gb/s" onChange={setBitRate} />
        <Slider label="L" value={L} min={1} max={200} step={1} unit="km" onChange={setL} />
        <Select label={lang === "fa" ? "فیبر" : "Fiber"} value={ftype} onChange={setF} options={[{ value: "smf", label: "G.652 (D≈17)" }, { value: "nzdsf", label: "G.655 (D≈4)" }, { value: "dsf", label: "G.653 (D≈0)" }]} />
        <Segmented value={fwm ? "on" : "off"} onChange={(v) => setFwm(v === "on")} options={[{ value: "on", label: "FWM on" }, { value: "off", label: "FWM off" }]} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label={lang === "fa" ? "ظرفیت کل" : "Capacity"} value={totalCap >= 1000 ? fmt(totalCap / 1000, 2) : totalCap} unit={totalCap >= 1000 ? "Tb/s" : "Gb/s"} tone="brand" /><Stat label={lang === "fa" ? "بازده طیفی" : "Spectral eff."} value={fmt(bitRate / spacing, 2)} unit="b/s/Hz" />
          <Stat label="η_FWM" value={fmt(10 * Math.log10(nl.etaFWM), 1)} unit="dB" tone={nl.etaFWM > 0.1 ? "bad" : "good"} /><Stat label={lang === "fa" ? "همشنوایی خطی" : "Linear XT"} value={fmt(crosstalkDb, 1)} unit="dB" tone={crosstalkDb > -20 ? "bad" : "good"} />
          <Stat label={lang === "fa" ? "پهنای باند کل" : "Total BW"} value={fmt(nCh * spNm, 2)} unit="nm" /><Stat label={lang === "fa" ? "جریمه OSNR" : "OSNR penalty"} value={fmt(osnrPenalty, 2)} unit="dB" tone={osnrPenalty > 1 ? "warn" : "good"} />
        </div>
        <RecordBar onRecord={() => record({ channels: nCh, spacing_GHz: spacing, P_dBm: pw, bitrate_Gbps: bitRate, L_km: L, fiber: ftype }, { theory: +(nCh * spNm).toFixed(3), measured: +(spec.filter((p) => p.y > pw - 10).length * (spec[1].x - spec[0].x)).toFixed(3), capacity_Gbps: totalCap, eta_fwm_dB: +(10 * Math.log10(nl.etaFWM)).toFixed(2), xt_dB: +crosstalkDb.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="WDM Spectrum" right={<Badge tone={nl.etaFWM > 0.1 && fwm ? "bad" : "good"}>{ftype === "dsf" && fwm ? (lang === "fa" ? "FWM شدید (D≈0)" : "Severe FWM (D≈0)") : "OK"}</Badge>}><AreaSpectrum data={spec} xLabel="λ (nm)" yLabel="dBm" height={320} yDomain={[-65, 15]} color="#8b5cf6" /></Panel>
        <Panel title={lang === "fa" ? "کانال‌ها (شبکه ITU-T)" : "Channels (ITU-T grid)"}><div className="flex flex-wrap gap-1">{chans.map((c, i) => <span key={i} className="num text-[10px] px-2 py-1 rounded-md panel-2">{i + 1}: {c.toFixed(2)} nm / {(P.C / (c * 1e-9) / 1e12).toFixed(2)} THz</span>)}</div></Panel>
      </div>
    </div>
  );
}

// ============ Experiment 12: EDFA ============
function EdfaSim({ model, noise, record, lang }: SimProps) {
  const [Pin, setPin] = useState(-20), [pump, setPump] = useState(100), [len, setLen] = useState(10), [nsp, setNsp] = useState(1.5), [lam, setLam] = useState(1550);
  const r = P.edfa({ PinDbm: Pin, pumpMw: pump, lengthM: len, nsp, lambda: lam, model: model === "experimental" && noise.det ? "experimental" : "ideal" });
  const measG = useMemo(() => noisyAdd(r.gainDb, 0.3, model, noise.meas), [r.gainDb, model, noise]);
  const gainVsPin = useMemo(() => P.linspace(-40, 5, 60).map((p) => ({ x: +p.toFixed(1), G: +P.edfa({ PinDbm: p, pumpMw: pump, lengthM: len, nsp, lambda: lam, model: "ideal" }).gainDb.toFixed(2), Pout: +P.edfa({ PinDbm: p, pumpMw: pump, lengthM: len, nsp, lambda: lam, model: "ideal" }).PoutDbm.toFixed(2) })), [pump, len, nsp, lam]);
  const gainVsPump = useMemo(() => P.linspace(5, 400, 60).map((pp) => ({ x: +pp.toFixed(0), G: +P.edfa({ PinDbm: Pin, pumpMw: pp, lengthM: len, nsp, lambda: lam, model: "ideal" }).gainDb.toFixed(2) })), [Pin, len, nsp, lam]);
  const explain = useExplain({ P_in: Pin, P_pump: pump, L_EDF: len, n_sp: nsp }, {
    P_in: B("At high input the population inversion is depleted: gain compresses (saturation) while output power approaches P_sat. The 3-dB compression point defines the saturation output power.", "در ورودی بالا وارونگی جمعیت تخلیه می‌شود: بهره فشرده (اشباع) شده و توان خروجی به P_sat نزدیک می‌شود. نقطه فشردگی ۳ dB توان خروجی اشباع را تعریف می‌کند."),
    P_pump: B("980 nm pump excites Er³⁺ to ⁴I₁₁/₂ which decays to the metastable ⁴I₁₃/₂; more pump → more inversion → more gain and lower NF (approaching 3 dB).", "پمپ ۹۸۰ nm یون Er³⁺ را به ⁴I₁₁/₂ برمی‌انگیزد که به تراز شبه‌پایدار ⁴I₁₃/₂ واپاشی می‌کند؛ پمپ بیشتر ← وارونگی بیشتر ← بهره بیشتر و NF کمتر (نزدیک ۳ dB)."),
    L_EDF: B("Gain grows with erbium length until the pump is depleted; beyond the optimum length the unpumped tail re-absorbs signal at 1530 nm and adds noise.", "بهره با طول اربیوم زیاد می‌شود تا پمپ تخلیه شود؛ فراتر از طول بهینه، دنباله پمپ‌نشده سیگنال را در ۱۵۳۰ nm بازجذب کرده و نویز اضافه می‌کند."),
    n_sp: B("Spontaneous-emission factor n_sp = N₂/(N₂−N₁) ≥ 1; NF ≈ 2n_sp for high gain, so complete inversion gives the 3 dB quantum limit.", "ضریب گسیل خودبه‌خودی n_sp = N₂/(N₂−N₁) ≥ 1؛ برای بهره بالا NF ≈ 2n_sp، بنابراین وارونگی کامل حد کوانتومی ۳ dB را می‌دهد."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای EDFA" : "EDFA parameters"} className="space-y-4">
        <Slider label="P_in" value={Pin} min={-40} max={5} step={0.5} unit="dBm" onChange={setPin} />
        <Slider label={lang === "fa" ? "توان پمپ (980 nm)" : "Pump power (980 nm)"} value={pump} min={5} max={400} step={5} unit="mW" onChange={setPump} />
        <Slider label={lang === "fa" ? "طول فیبر اربیوم" : "Er fiber length"} value={len} min={1} max={40} step={0.5} unit="m" onChange={setLen} />
        <Slider label="n_sp" value={nsp} min={1} max={4} step={0.05} onChange={setNsp} fmt={(v) => v.toFixed(2)} />
        <Slider label="λ_signal" value={lam} min={1525} max={1575} step={0.5} unit="nm" onChange={setLam} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Gain" value={fmt(r.gainDb, 2)} unit="dB" tone="brand" sub={`G₀ = ${r.smallSignalDb.toFixed(1)} dB`} /><Stat label="P_out" value={fmt(r.PoutDbm, 2)} unit="dBm" />
          <Stat label="P_ASE (0.1 nm)" value={fmt(r.PaseDbm, 1)} unit="dBm" /><Stat label="NF" value={fmt(r.NF, 2)} unit="dB" tone={r.NF < 5 ? "good" : "warn"} />
          <Stat label="OSNR (0.1 nm)" value={fmt(r.osnr, 1)} unit="dB" tone={r.osnr > 20 ? "good" : "warn"} /><Stat label="P_sat" value={fmt(r.Psat, 1)} unit="dBm" />
        </div>
        <RecordBar onRecord={() => record({ Pin_dBm: Pin, pump_mW: pump, L_m: len, nsp, lambda_nm: lam }, { theory: +r.gainDb.toFixed(3), measured: +measG.toFixed(3), Pout_dBm: +r.PoutDbm.toFixed(2), NF_dB: +r.NF.toFixed(2), OSNR_dB: +r.osnr.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "طیف خروجی (سیگنال + ASE)" : "Output spectrum (signal + ASE)"}><AreaSpectrum data={r.spectrum} xLabel="λ (nm)" yLabel="dBm" height={260} yDomain={[-75, 25]} color="#10b981" extra={[{ key: "ase", name: "ASE", color: "#f59e0b", dash: true }]} />
          <div className="mt-3"><Compare rows={[{ label: "Gain (dB)", theory: r.gainDb, measured: measG }]} /></div></Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="Gain & P_out vs P_in"><XYChart data={gainVsPin} series={[{ key: "G", name: "Gain (dB)" }, { key: "Pout", name: "P_out (dBm)", color: Palette[2] }]} xLabel="P_in (dBm)" height={200} refX={[{ x: Pin, label: "P_in" }]} legend brush={false} /></Panel>
          <Panel title="Gain vs pump power"><XYChart data={gainVsPump} series={[{ key: "G", name: "Gain (dB)", color: Palette[3] }]} xLabel="P_pump (mW)" yLabel="dB" height={200} refX={[{ x: pump, label: "pump" }]} brush={false} /></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Eye diagram canvas ============
function EyeCanvas({ eye, height = 240 }: { eye: ReturnType<typeof P.eyeDiagram>; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return; const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.width, Hh = cv.height; ctx.clearRect(0, 0, W, Hh);
    ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, W, Hh);
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1; for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo((W * i) / 8, 0); ctx.lineTo((W * i) / 8, Hh); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, (Hh * i) / 8); ctx.lineTo(W, (Hh * i) / 8); ctx.stroke(); }
    const n = eye.traces[0]?.length ?? 1;
    ctx.lineWidth = 1.2; ctx.globalCompositeOperation = "lighter";
    for (const tr of eye.traces) { ctx.strokeStyle = "rgba(56,189,248,.22)"; ctx.beginPath(); tr.forEach((v, i) => { const x = (i / (n - 1)) * W, y = Hh - (v + 0.2) / 1.5 * Hh; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); }
    ctx.globalCompositeOperation = "source-over";
    // decision threshold + sampling instant
    const yth = Hh - ((eye.m1 + eye.m0) / 2 + 0.2) / 1.5 * Hh; ctx.strokeStyle = "rgba(251,191,36,.8)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(0, yth); ctx.lineTo(W, yth); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, Hh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "10px JetBrains Mono, monospace"; ctx.fillText(`Q=${eye.Q.toFixed(2)}  BER≈${eye.ber.toExponential(1)}  H=${eye.eyeHeight.toFixed(2)}  W=${eye.eyeWidth.toFixed(2)} UI`, 8, 14);
  }, [eye, height]);
  return <canvas ref={ref} width={560} height={height} className="w-full rounded-lg ltr" style={{ aspectRatio: `560/${height}` }} />;
}

// ============ Experiment 13: PIN vs APD ============
function PinApdSim({ model, noise, record, lang }: SimProps) {
  const [Pr, setPr] = useState(-25), [R, setR] = useState(0.8), [M, setM] = useState(10), [x, setX] = useState(0.7), [bw, setBw] = useState(7.5), [Id, setId] = useState(2), [T, setT] = useState(300), [RL, setRL] = useState(50), [ext, setExt] = useState(10);
  const base = { PrDbm: Pr, R, M, x, bwGHz: bw, Id, T, RL, extinction: ext, format: "nrz" as const };
  const pin = P.receiverPerformance({ ...base, type: "pin" }), apd = P.receiverPerformance({ ...base, type: "apd" });
  const sPin = P.sensitivity({ ...base, type: "pin" }), sApd = P.sensitivity({ ...base, type: "apd" });
  const measQpin = useMemo(() => noisy(pin.Q, 0.05, model, noise.det), [pin.Q, model, noise]);
  const curve = useMemo(() => P.linspace(-40, -5, 70).map((p) => ({ x: +p.toFixed(1), pin: Math.max(1e-15, P.receiverPerformance({ ...base, PrDbm: p, type: "pin" }).ber), apd: Math.max(1e-15, P.receiverPerformance({ ...base, PrDbm: p, type: "apd" }).ber) })), [R, M, x, bw, Id, T, RL, ext]); // eslint-disable-line
  const gainCurve = useMemo(() => P.linspace(1, 60, 60).map((m) => ({ x: +m.toFixed(0), Q: +P.receiverPerformance({ ...base, M: m, type: "apd" }).Q.toFixed(2) })), [Pr, R, x, bw, Id, T, RL, ext]); // eslint-disable-line
  const optM = gainCurve.reduce((a, b) => (b.Q > a.Q ? b : a), gainCurve[0]);
  const eyePin = useMemo(() => P.eyeDiagram({ bitRateGbps: bw / 0.75, bwGHz: bw, snr: pin.Q, jitterUI: 0.02, extinction: ext }), [bw, pin.Q, ext]);
  const eyeApd = useMemo(() => P.eyeDiagram({ bitRateGbps: bw / 0.75, bwGHz: bw, snr: apd.Q, jitterUI: 0.02, extinction: ext }), [bw, apd.Q, ext]);
  const explain = useExplain({ P_r: Pr, M, x, B: bw, T, R_L: RL }, {
    P_r: B("Signal current ∝ P while thermal noise is constant: at low power the receiver is thermal-noise limited and Q ∝ P; APD gain lifts the signal above the thermal floor.", "جریان سیگنال ∝ P است در حالی که نویز حرارتی ثابت است: در توان کم گیرنده محدود به نویز حرارتی است و Q ∝ P؛ بهره APD سیگنال را بالاتر از کف حرارتی می‌برد."),
    M: B("APD gain multiplies signal by M but shot noise by M²F(M), F = M^x. There is an optimum M where excess noise starts to dominate thermal noise.", "بهره APD سیگنال را در M ضرب می‌کند اما نویز شات را در M²F(M) با F = M^x. یک M بهینه وجود دارد که در آن نویز اضافی شروع به غلبه بر نویز حرارتی می‌کند."),
    x: B("Excess-noise index: Si ≈ 0.3–0.5, InGaAs ≈ 0.7, Ge ≈ 1.0. Lower x → higher optimum gain and better sensitivity.", "شاخص نویز اضافی: Si ≈ 0.3–0.5، InGaAs ≈ 0.7، Ge ≈ 1.0. x کمتر ← بهره بهینه بالاتر و حساسیت بهتر."),
    B: B("All noise variances scale with bandwidth B ≈ 0.75×bit rate; doubling the bit rate costs ~1.5 dB sensitivity in the thermal-limited regime.", "همه واریانس‌های نویز با پهنای باند B ≈ 0.75×نرخ بیت مقیاس می‌شوند؛ دو برابر کردن نرخ بیت ~۱٫۵ dB حساسیت در رژیم حرارتی هزینه دارد."),
    T: B("Thermal noise σ² = 4kTB/R_L grows linearly with temperature; APD gain also drops with T (needs bias compensation).", "نویز حرارتی σ² = 4kTB/R_L به‌صورت خطی با دما زیاد می‌شود؛ بهره APD نیز با T کم می‌شود (نیازمند جبران بایاس)."),
    R_L: B("Larger load resistance lowers thermal noise but reduces bandwidth (RC); transimpedance amplifiers break this trade-off.", "مقاومت بار بزرگ‌تر نویز حرارتی را کم اما پهنای باند (RC) را کاهش می‌دهد؛ تقویت‌کننده‌های ترانس‌امپدانس این مصالحه را می‌شکنند."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای گیرنده" : "Receiver parameters"} className="space-y-3">
        <Slider label="P_received" value={Pr} min={-45} max={-5} step={0.5} unit="dBm" onChange={setPr} />
        <Slider label={lang === "fa" ? "پاسخ‌دهی R" : "Responsivity R"} value={R} min={0.3} max={1.1} step={0.01} unit="A/W" onChange={setR} />
        <Slider label="APD gain M" value={M} min={1} max={60} step={1} onChange={setM} />
        <Slider label={lang === "fa" ? "شاخص نویز اضافی x" : "Excess-noise index x"} value={x} min={0.2} max={1} step={0.05} onChange={setX} />
        <Slider label={lang === "fa" ? "پهنای باند" : "Bandwidth"} value={bw} min={0.5} max={40} step={0.5} unit="GHz" onChange={setBw} />
        <Slider label={lang === "fa" ? "جریان تاریک" : "Dark current"} value={Id} min={0} max={100} step={1} unit="nA" onChange={setId} />
        <Slider label={lang === "fa" ? "دما" : "Temperature"} value={T} min={250} max={360} step={1} unit="K" onChange={setT} />
        <Slider label="R_L" value={RL} min={50} max={5000} step={50} unit="Ω" onChange={setRL} />
        <Slider label={lang === "fa" ? "نسبت خاموشی" : "Extinction ratio"} value={ext} min={3} max={30} step={1} onChange={setExt} fmt={(v) => `${v} (${(10 * Math.log10(v)).toFixed(1)} dB)`} />
        <RecordBar onRecord={() => record({ Pr_dBm: Pr, R, M, x, BW_GHz: bw, T_K: T }, { theory: +pin.Q.toFixed(3), measured: +measQpin.toFixed(3), Q_apd: +apd.Q.toFixed(3), BER_pin: pin.ber, BER_apd: apd.ber, sens_pin_dBm: +sPin.toFixed(2), sens_apd_dBm: +sApd.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="PIN photodiode" right={<Badge tone={pin.ber < 1e-9 ? "good" : "bad"}>BER {sci(pin.ber)}</Badge>}>
            <div className="grid grid-cols-2 gap-2 mb-2"><Stat label="Q" value={fmt(pin.Q, 2)} tone="brand" /><Stat label={lang === "fa" ? "حساسیت (1e-9)" : "Sensitivity (1e-9)"} value={fmt(sPin, 1)} unit="dBm" /><Stat label="σ_shot" value={sci(pin.shot)} unit="A" /><Stat label="σ_thermal" value={sci(pin.thermal)} unit="A" /></div>
            <EyeCanvas eye={eyePin} height={180} />
          </Panel>
          <Panel title="APD" right={<Badge tone={apd.ber < 1e-9 ? "good" : "bad"}>BER {sci(apd.ber)}</Badge>}>
            <div className="grid grid-cols-2 gap-2 mb-2"><Stat label="Q" value={fmt(apd.Q, 2)} tone="brand" /><Stat label={lang === "fa" ? "حساسیت (1e-9)" : "Sensitivity (1e-9)"} value={fmt(sApd, 1)} unit="dBm" tone="good" sub={`${(sPin - sApd).toFixed(1)} dB better`} /><Stat label="σ_shot (×M²F)" value={sci(apd.shot)} unit="A" /><Stat label={lang === "fa" ? "M بهینه" : "Optimum M"} value={optM.x} sub={`Q=${optM.Q}`} /></div>
            <EyeCanvas eye={eyeApd} height={180} />
          </Panel>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="BER vs received power"><XYChart data={curve} series={[{ key: "pin", name: "PIN" }, { key: "apd", name: "APD", color: Palette[1] }]} xLabel="P_r (dBm)" yLabel="BER" height={220} logY yDomain={[1e-15, 1]} refY={[{ y: 1e-9, label: "1e-9" }]} refX={[{ x: Pr, label: "P_r" }]} legend brush={false} /></Panel>
          <Panel title="Q vs APD gain M"><XYChart data={gainCurve} series={[{ key: "Q", name: "Q", color: Palette[3] }]} xLabel="M" yLabel="Q" height={220} refX={[{ x: optM.x, label: "M_opt", color: "#10b981" }, { x: M, label: "M" }]} brush={false} /></Panel>
        </div>
        <Panel title={lang === "fa" ? "نظریه در برابر اندازه‌گیری" : "Theory vs measurement"}><Compare rows={[{ label: "Q (PIN)", theory: pin.Q, measured: measQpin }]} /></Panel>
      </div>
    </div>
  );
}

// ============ Experiment 14: Eye diagram ============
function EyeSim({ model, noise, record, lang }: SimProps) {
  const [br, setBr] = useState(10), [bw, setBw] = useState(7.5), [snr, setSnr] = useState(8), [jit, setJit] = useState(0.03), [ext, setExt] = useState(10), [disp, setDisp] = useState(20), [format, setFormat] = useState<"nrz" | "pam4">("nrz");
  const eye = useMemo(() => P.eyeDiagram({ bitRateGbps: br, bwGHz: bw, snr: model === "experimental" && noise.det ? snr * 0.85 : snr, jitterUI: model === "experimental" && noise.laser ? jit * 1.5 : jit, extinction: ext, dispersionPs: disp, format }), [br, bw, snr, jit, ext, disp, format, model, noise]);
  const Tb = 1000 / br;
  const isiPen = Math.min(0.95, eye.tr / Tb);
  const explain = useExplain({ B: br, BW: bw, SNR: snr, jitter: jit, ER: ext, Δτ: disp }, {
    B: B("Higher bit rate shrinks the unit interval; fixed rise time and dispersion then consume a larger fraction of the eye → ISI closes the eye horizontally and vertically.", "نرخ بیت بالاتر بازه واحد را کوچک می‌کند؛ زمان خیز و پاشندگی ثابت سهم بیشتری از چشم را مصرف می‌کنند ← ISI چشم را افقی و عمودی می‌بندد."),
    BW: B("Receiver bandwidth ≈ 0.7–0.75×B is optimal: too low → ISI (slow edges), too high → more noise.", "پهنای باند گیرنده ≈ 0.7–0.75×B بهینه است: خیلی کم ← ISI (لبه‌های کند)، خیلی زیاد ← نویز بیشتر."),
    SNR: B("Amplitude noise thickens the rails; Q ≈ (μ₁−μ₀)/(σ₁+σ₀) determines BER = ½erfc(Q/√2).", "نویز دامنه ریل‌ها را ضخیم می‌کند؛ Q ≈ (μ₁−μ₀)/(σ₁+σ₀) مقدار BER = ½erfc(Q/√2) را تعیین می‌کند."),
    jitter: B("Timing jitter smears the crossing points and narrows the eye width — the horizontal margin for the sampling clock.", "جیتر زمانی نقاط تقاطع را لکه‌دار و پهنای چشم را باریک می‌کند — حاشیه افقی برای ساعت نمونه‌برداری."),
    ER: B("Low extinction ratio raises the '0' level, reducing eye height and wasting average power (ER penalty ≈ 10log((r+1)/(r−1))).", "نسبت خاموشی کم سطح «۰» را بالا برده و ارتفاع چشم را کم و توان متوسط را هدر می‌دهد (جریمه ER ≈ 10log((r+1)/(r−1)))."),
    Δτ: B("Dispersion adds to the rise time in RMS: t_r² = t_tx² + t_fiber² + t_rx²; the classic rise-time budget requires t_r < 0.7/B (NRZ).", "پاشندگی به‌صورت RMS به زمان خیز اضافه می‌شود: t_r² = t_tx² + t_fiber² + t_rx²؛ بودجه زمان خیز کلاسیک t_r < 0.7/B (NRZ) را می‌طلبد."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای سیستم" : "System parameters"} className="space-y-4">
        <Segmented value={format} onChange={setFormat} options={[{ value: "nrz", label: "NRZ-OOK" }, { value: "pam4", label: "PAM4" }]} />
        <Slider label={lang === "fa" ? "نرخ بیت" : "Bit rate"} value={br} min={1} max={56} step={1} unit="Gb/s" onChange={setBr} />
        <Slider label={lang === "fa" ? "پهنای باند گیرنده" : "Rx bandwidth"} value={bw} min={0.5} max={40} step={0.5} unit="GHz" onChange={setBw} />
        <Slider label="SNR (Q)" value={snr} min={1} max={20} step={0.25} onChange={setSnr} />
        <Slider label={lang === "fa" ? "جیتر RMS" : "RMS jitter"} value={jit} min={0} max={0.15} step={0.005} unit="UI" onChange={setJit} fmt={(v) => v.toFixed(3)} />
        <Slider label={lang === "fa" ? "نسبت خاموشی" : "Extinction ratio"} value={ext} min={2} max={30} step={1} onChange={setExt} />
        <Slider label={lang === "fa" ? "پهن‌شدگی پاشندگی" : "Dispersion broadening"} value={disp} min={0} max={150} step={1} unit="ps" onChange={setDisp} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Q" value={fmt(eye.Q, 2)} tone={eye.Q > 6 ? "good" : "bad"} /><Stat label="BER" value={sci(eye.ber)} tone={eye.ber < 1e-9 ? "good" : "bad"} />
          <Stat label={lang === "fa" ? "ارتفاع چشم" : "Eye height"} value={fmt(eye.eyeHeight, 3)} unit="a.u." tone={eye.eyeHeight > 0.3 ? "good" : "warn"} /><Stat label={lang === "fa" ? "پهنای چشم" : "Eye width"} value={fmt(eye.eyeWidth, 2)} unit="UI" />
          <Stat label="t_rise (10–90%)" value={fmt(eye.tr, 1)} unit="ps" sub={`${(isiPen * 100).toFixed(0)}% of T_b`} /><Stat label="T_bit" value={fmt(Tb, 1)} unit="ps" />
        </div>
        <RecordBar onRecord={() => record({ bitrate: br, BW_GHz: bw, SNR: snr, jitter_UI: jit, ER: ext, disp_ps: disp, format }, { theory: +snr.toFixed(3), measured: +eye.Q.toFixed(3), BER: eye.ber, eye_height: +eye.eyeHeight.toFixed(3), eye_width_UI: +eye.eyeWidth.toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="Eye Diagram Analyzer"><EyeCanvas eye={eye} height={300} />
          <div className="mt-3"><Compare rows={[{ label: "Q (set vs measured from eye)", theory: snr, measured: eye.Q }]} /></div></Panel>
        <Callout tone={eye.Q > 6 ? "good" : "warn"} title={lang === "fa" ? "تشخیص" : "Diagnosis"}>
          {isiPen > 0.6 ? (lang === "fa" ? "ISI غالب است: زمان خیز بیش از ۶۰٪ بازه بیت را می‌گیرد — پهنای باند را افزایش دهید یا پاشندگی را جبران کنید." : "ISI dominates: rise time exceeds 60% of the bit period — increase bandwidth or compensate dispersion.") : jit > 0.06 ? (lang === "fa" ? "جیتر بالا: پهنای چشم کاهش یافته — از بازیابی ساعت بهتر یا لیزر با نویز فاز کمتر استفاده کنید." : "High jitter: eye width reduced — improve clock recovery or use a lower phase-noise laser.") : eye.Q < 6 ? (lang === "fa" ? "محدود به نویز: توان دریافتی را افزایش دهید یا از APD/پیش‌تقویت‌کننده استفاده کنید." : "Noise-limited: increase received power or use an APD / optical preamplifier.") : (lang === "fa" ? "چشم باز؛ BER < 1e-9 قابل دستیابی است." : "Eye open; BER < 1e-9 achievable.")}
        </Callout>
      </div>
    </div>
  );
}

// ============ Experiment 15: BER ============
function BerSim({ model, noise, record, lang }: SimProps) {
  const [br, setBr] = useState(10), [Pr, setPr] = useState(-24), [rx, setRx] = useState<P.RxType>("pin"), [format, setFormat] = useState<"nrz" | "rz" | "pam4">("nrz"), [noiseF, setNoiseF] = useState(1), [ext, setExt] = useState(10);
  const base = { type: rx, PrDbm: Pr, R: 0.9, M: 10, x: 0.7, bwGHz: 0.75 * br, Id: 5, T: 300 * noiseF, RL: 50, extinction: ext, format };
  const r = P.receiverPerformance(base);
  const sens = P.sensitivity(base), sens12 = P.sensitivity(base, 1e-12);
  const measBer = useMemo(() => (model === "experimental" && noise.det ? r.ber * Math.pow(10, 0.3 * P.gauss()) : r.ber), [r.ber, model, noise]);
  const curve = useMemo(() => P.linspace(-42, -8, 80).map((p) => { const row: Record<string, number> = { x: +p.toFixed(1) }; (["pin", "apd", "coherent"] as P.RxType[]).forEach((tp) => { row[tp] = Math.max(1e-16, P.receiverPerformance({ ...base, type: tp, PrDbm: p }).ber); }); return row; }), [br, format, noiseF, ext]); // eslint-disable-line
  const snrCurve = useMemo(() => P.linspace(0, 20, 80).map((q) => ({ x: +q.toFixed(2), ber: Math.max(1e-16, P.berFromQ(q)), berPam4: Math.max(1e-16, P.berFromQ(q / 3)) })), []);
  const explain = useExplain({ B: br, P_r: Pr, N: noiseF, ER: ext }, {
    B: B("Doubling the bit rate doubles the noise bandwidth and requires ~1.5 dB (thermal) to 3 dB (shot) more power for the same BER.", "دو برابر کردن نرخ بیت پهنای باند نویز را دو برابر می‌کند و برای BER یکسان ~۱٫۵ dB (حرارتی) تا ۳ dB (شات) توان بیشتری لازم دارد."),
    P_r: B("BER falls extremely fast with power (waterfall curve): ~1 dB more power can improve BER by 2–3 orders of magnitude near Q ≈ 6–7.", "BER با توان به‌شدت افت می‌کند (منحنی آبشاری): ~۱ dB توان بیشتر نزدیک Q ≈ 6–7 می‌تواند BER را ۲–۳ مرتبه بزرگی بهبود دهد."),
    N: B("The noise factor scales the thermal noise (equivalent to a noisier front-end amplifier).", "ضریب نویز، نویز حرارتی را مقیاس می‌کند (معادل تقویت‌کننده جلویی نویزی‌تر)."),
    ER: B("Finite extinction ratio wastes power in the '0' level; ER penalty ≈ 10log₁₀((r+1)/(r−1)) dB.", "نسبت خاموشی محدود توان را در سطح «۰» هدر می‌دهد؛ جریمه ER ≈ 10log₁₀((r+1)/(r−1)) dB."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای BER" : "BER parameters"} className="space-y-4">
        <Select label={lang === "fa" ? "نوع گیرنده" : "Receiver type"} value={rx} onChange={setRx} options={[{ value: "pin", label: "PIN" }, { value: "apd", label: "APD (M=10)" }, { value: "coherent", label: "Coherent (LO)" }]} />
        <Select label={lang === "fa" ? "فرمت مدولاسیون" : "Modulation format"} value={format} onChange={setFormat} options={[{ value: "nrz", label: "NRZ-OOK" }, { value: "rz", label: "RZ-OOK" }, { value: "pam4", label: "PAM4" }]} />
        <Slider label={lang === "fa" ? "نرخ بیت" : "Bit rate"} value={br} min={0.5} max={100} step={0.5} unit="Gb/s" onChange={setBr} />
        <Slider label="P_received" value={Pr} min={-45} max={-5} step={0.25} unit="dBm" onChange={setPr} />
        <Slider label={lang === "fa" ? "ضریب نویز" : "Noise factor"} value={noiseF} min={0.5} max={5} step={0.1} onChange={setNoiseF} />
        <Slider label={lang === "fa" ? "نسبت خاموشی" : "Extinction ratio"} value={ext} min={3} max={30} step={1} onChange={setExt} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="BER" value={sci(r.ber)} tone={r.ber < 1e-9 ? "good" : r.ber < 1e-3 ? "warn" : "bad"} sub={r.ber < 1e-3 && r.ber > 1e-12 ? "FEC-correctable" : ""} /><Stat label="Q" value={fmt(r.Q, 2)} tone="brand" sub={`${r.snrDb.toFixed(1)} dB`} />
          <Stat label={lang === "fa" ? "حساسیت @1e-9" : "Sens. @1e-9"} value={fmt(sens, 1)} unit="dBm" /><Stat label={lang === "fa" ? "حساسیت @1e-12" : "Sens. @1e-12"} value={fmt(sens12, 1)} unit="dBm" />
          <Stat label={lang === "fa" ? "حاشیه" : "Margin"} value={fmt(Pr - sens, 1)} unit="dB" tone={Pr - sens > 0 ? "good" : "bad"} /><Stat label={lang === "fa" ? "خطا در ثانیه" : "Errors / s"} value={sci(r.ber * br * 1e9)} />
        </div>
        <RecordBar onRecord={() => record({ bitrate: br, Pr_dBm: Pr, rx, format, noiseF, ER: ext }, { theory: r.ber, measured: measBer, Q: +r.Q.toFixed(3), sens_dBm: +sens.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="BER vs Received Power"><XYChart data={curve} series={[{ key: "pin", name: "PIN" }, { key: "apd", name: "APD", color: Palette[1] }, { key: "coherent", name: "Coherent", color: Palette[2] }]} xLabel="P_r (dBm)" yLabel="BER" height={280} logY yDomain={[1e-16, 1]} refY={[{ y: 1e-9, label: "1e-9" }, { y: 1e-12, label: "1e-12", color: "#8b5cf6" }, { y: 3.8e-3, label: "FEC limit", color: "#10b981" }]} refX={[{ x: Pr, label: "P_r" }]} legend brush={false} /></Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="BER vs Q (SNR)"><XYChart data={snrCurve} series={[{ key: "ber", name: "OOK", color: Palette[3] }, { key: "berPam4", name: "PAM4", color: Palette[4] }]} xLabel="Q" yLabel="BER" height={200} logY yDomain={[1e-16, 1]} refX={[{ x: 6, label: "Q=6" }, { x: 7.03, label: "Q=7" }]} legend brush={false} /></Panel>
          <Panel title={lang === "fa" ? "نظریه در برابر اندازه‌گیری" : "Theory vs measurement"}><Compare rows={[{ label: "log₁₀(BER)", theory: Math.log10(r.ber), measured: Math.log10(measBer) }, { label: "Q", theory: r.Q, measured: P.qFromBer(measBer) }]} />
            <div className="text-[10px] muted mt-2">{lang === "fa" ? "در مدل تجربی، BER اندازه‌گیری‌شده از شمارش خطا در زمان محدود تخمین زده می‌شود و پراکندگی آماری دارد." : "In the Experimental model the measured BER is estimated from error counting over finite time and shows statistical scatter."}</div></Panel>
        </div>
      </div>
    </div>
  );
}

const q = (en: string, fa: string) => B(en, fa);
export const systemExperiments: ExperimentDef[] = [
  { id: "otdr", num: 8, category: "systems", level: 1, title: q("OTDR — Fault Location & Link Characterization", "OTDR — مکان‌یابی خطا و مشخصه‌یابی لینک"), short: q("Build a realistic link with connectors, splices, bends and breaks and read the backscatter trace.", "لینکی واقع‌گرایانه با کانکتور، اسپلایس، خمش و شکستگی بسازید و منحنی بازپراکنش را بخوانید."),
    objective: q("Interpret OTDR traces: measure attenuation from slope, event loss from steps, locate reflective and non-reflective events, understand dead zone and dynamic range.", "تفسیر منحنی OTDR: اندازه‌گیری تضعیف از شیب، تلفات رویداد از پله‌ها، مکان‌یابی رویدادهای بازتابی و غیربازتابی، درک ناحیه مرده و محدوده دینامیکی."),
    prerequisites: [q("Rayleigh backscatter", "بازپراکنش رایلی"), q("Fresnel reflection", "بازتاب فرنل"), q("dB arithmetic", "محاسبات dB")],
    equipment: [q("OTDR (1310/1550/1625 nm)", "OTDR"), q("Launch fiber (dead-zone box)", "فیبر پرتاب"), q("Fiber link under test", "لینک تحت آزمون"), q("Cleaning kit & inspection scope", "کیت تمیزکاری و میکروسکوپ")],
    theory: { basic: q("An OTDR sends a short light pulse into the fiber and listens for the tiny fraction scattered back. The later the echo arrives, the farther it came from (z = c·t/2n). The echo weakens along the fiber (slope = fiber loss), drops abruptly at splices/bends (steps) and spikes at connectors or breaks (reflections).", "OTDR پالس کوتاهی به فیبر می‌فرستد و به کسر ناچیز بازپراکنده‌شده گوش می‌دهد. هرچه پژواک دیرتر برسد، از دورتر آمده است (z = c·t/2n). پژواک در طول فیبر ضعیف می‌شود (شیب = تلفات فیبر)، در اسپلایس/خمش ناگهان افت می‌کند (پله) و در کانکتور یا شکستگی قله می‌زند (بازتاب)."),
      engineering: q("Backscatter level P_bs = P₀·S·α_s·(cτ/2n) is ~−50 dB relative to the pulse for 100 ns. Trade-off: long pulses → high dynamic range but long dead zones (≈ pulse length + recovery); short pulses → fine resolution but noisy far end. Averaging improves SNR ∝ √N. Gainers appear at splices between fibers of different backscatter coefficients — bidirectional averaging removes them.", "سطح بازپراکنش P_bs = P₀·S·α_s·(cτ/2n) برای ۱۰۰ ns حدود −۵۰ dB نسبت به پالس است. مصالحه: پالس بلند ← محدوده دینامیکی بالا اما ناحیه مرده طولانی؛ پالس کوتاه ← تفکیک خوب اما انتهای نویزی. میانگین‌گیری SNR را ∝ √N بهبود می‌دهد. «gainer» در اسپلایس بین فیبرهایی با ضریب بازپراکنش متفاوت ظاهر می‌شود — میانگین دوطرفه آن را حذف می‌کند."),
      advanced: q("The trace is the convolution of the fiber impulse response with the pulse shape; coherent Rayleigh noise limits narrow-linewidth sources. Reflectance is R = 10log(P_refl/P_inc); a PC connector ≈ −45 dB, APC ≈ −65 dB, a flat cleave ≈ −14.7 dB (Fresnel 3.5%). Event dead zone ≈ pulse width + detector saturation recovery.", "منحنی، کانولوشن پاسخ ضربه فیبر با شکل پالس است؛ نویز رایلی همدوس منابع باریک‌خط را محدود می‌کند. بازتاب R = 10log(P_refl/P_inc)؛ کانکتور PC ≈ −45 dB، APC ≈ −65 dB، برش صاف ≈ −14.7 dB (فرنل ۳٫۵٪). ناحیه مرده رویداد ≈ پهنای پالس + بازیابی اشباع آشکارساز."),
      research: q("Distributed sensing extends OTDR: φ-OTDR (coherent Rayleigh phase) for vibration/DAS, Raman-OTDR ratio of anti-Stokes/Stokes for temperature (DTS), Brillouin (BOTDR/BOTDA) frequency shift ≈ 1 MHz/°C and 0.05 MHz/µε for strain/temperature. Coded (Golay/Simplex) pulse sequences trade dynamic range against resolution without long pulses.", "حسگری توزیعی OTDR را گسترش می‌دهد: φ-OTDR (فاز رایلی همدوس) برای ارتعاش/DAS، نسبت آنتی‌استوکس/استوکس رامان برای دما (DTS)، جابه‌جایی فرکانس بریلوئن (BOTDR/BOTDA) ≈ 1 MHz/°C و 0.05 MHz/µε برای کرنش/دما. دنباله‌های پالس کدشده (Golay/Simplex) بدون پالس بلند محدوده دینامیکی را در برابر تفکیک مبادله می‌کنند.") },
    equations: [{ eq: "z = c · t / (2 n_g)", desc: q("Distance from round-trip time", "فاصله از زمان رفت‌وبرگشت") }, { eq: "Δz = c · τ / (2 n_g)", desc: q("Spatial resolution for pulse width τ", "تفکیک مکانی برای پهنای پالس τ") }, { eq: "slope[dB/km] = −2α", desc: q("Two-way loss per unit length", "تلفات دوطرفه بر واحد طول") }, { eq: "R_Fresnel = ((n₁−n₂)/(n₁+n₂))² ≈ 3.5 % (glass/air)", desc: q("End / break reflection", "بازتاب انتها / شکستگی") }],
    procedure: [q("Set pulse width 100 ns, L = 40 km. Identify the launch connector spike.", "پهنای پالس ۱۰۰ ns و L = 40 km. قله کانکتور ورودی را شناسایی کنید."), q("Measure the slope between events and compute α.", "شیب بین رویدادها را اندازه گرفته و α را محاسبه کنید."), q("Move the splice event and verify the step position follows.", "رویداد اسپلایس را جابه‌جا کنید و تأیید کنید مکان پله دنبال می‌کند."), q("Add a break at 25 km and observe the trace end and noise floor.", "شکستگی در ۲۵ km اضافه کرده و انتهای منحنی و کف نویز را مشاهده کنید."), q("Reduce pulse width to 10 ns: compare resolution vs dynamic range.", "پهنای پالس را به ۱۰ ns کاهش دهید: تفکیک در برابر محدوده دینامیکی را مقایسه کنید.")],
    errors: [q("Index-of-refraction setting error → distance error (0.1% per 0.0015 n).", "خطای تنظیم ضریب شکست ← خطای فاصله."), q("Dead zone hides events close together.", "ناحیه مرده رویدادهای نزدیک را پنهان می‌کند."), q("Ghost reflections from strong reflectors.", "بازتاب‌های شبح از بازتابنده‌های قوی."), ...commonErrors.slice(0, 1)],
    conclusion: q("The OTDR provides a one-ended map of loss and reflections; correct pulse width and averaging are key to accurate fault location.", "OTDR نقشه یک‌سر تلفات و بازتاب‌ها را می‌دهد؛ پهنای پالس و میانگین‌گیری صحیح کلید مکان‌یابی دقیق خطا هستند."),
    questions: [{ q: q("A trace slope of −0.44 dB/km means fiber attenuation α = ?", "شیب −0.44 dB/km یعنی تضعیف فیبر α = ؟"), type: "numeric", answer: 0.22, tolerance: 0.01, unit: "dB/km", hints: [q("The pulse travels out and back.", "پالس رفت‌وبرگشت می‌کند."), q("Divide by two.", "بر دو تقسیم کنید.")], explanation: q("Two-way path → slope = 2α → α = 0.22 dB/km.", "مسیر دوطرفه ← شیب = 2α ← α = 0.22 dB/km.") }, { q: q("Which event produces a step down without a spike?", "کدام رویداد پله‌ای رو به پایین بدون قله ایجاد می‌کند؟"), type: "mc", answer: 1, options: [q("PC connector", "کانکتور PC"), q("Fusion splice", "اسپلایس فیوژن"), q("Fiber break in air", "شکستگی در هوا"), q("Fiber end", "انتهای فیبر")], hints: [q("Spikes come from index discontinuities (glass/air).", "قله‌ها از ناپیوستگی ضریب (شیشه/هوا) می‌آیند."), q("A fusion splice has no air gap.", "اسپلایس فیوژن فاصله هوایی ندارد.")], explanation: q("A fusion splice is a non-reflective event: only loss (step), no Fresnel spike.", "اسپلایس فیوژن رویداد غیربازتابی است: فقط تلفات (پله)، بدون قله فرنل.") }, { q: q("Pulse width 1 µs, n = 1.468 → spatial resolution in m?", "پهنای پالس 1 µs و n = 1.468 ← تفکیک مکانی به متر؟"), type: "numeric", answer: 102, tolerance: 3, unit: "m", hints: [q("Δz = cτ/2n.", "Δz = cτ/2n."), q("3e8 × 1e-6 / (2 × 1.468).", "3e8 × 1e-6 / (2 × 1.468).")], explanation: q("Δz = 3×10⁸ × 10⁻⁶ / 2.936 ≈ 102 m.", "Δz = 3×10⁸ × 10⁻⁶ / 2.936 ≈ 102 m.") }],
    Sim: OtdrSim, dataKeys: { x: "pulse_ns", y: ["resolution_m", "measured"] } },
  { id: "linkbudget", num: 9, category: "systems", level: 2, title: q("Optical Link Budget", "بودجه توان لینک نوری"), short: q("Add connectors, splices, splitters and amplifiers; check whether the receiver still sees enough light.", "کانکتور، اسپلایس، اسپلیتر و تقویت‌کننده اضافه کنید؛ بررسی کنید آیا گیرنده هنوز نور کافی می‌بیند."),
    objective: q("Compute total loss, received power, power margin and feasibility of a point-to-point or PON link, including the dispersion limit.", "محاسبه تلفات کل، توان دریافتی، حاشیه توان و امکان‌پذیری لینک نقطه‌به‌نقطه یا PON شامل حد پاشندگی."),
    prerequisites: [q("Attenuation", "تضعیف"), q("Receiver sensitivity", "حساسیت گیرنده"), q("Dispersion basics", "مبانی پاشندگی")],
    equipment: [q("Laser transmitter", "فرستنده لیزری"), q("Fiber spools", "قرقره‌های فیبر"), q("Connectors, splices, splitters", "کانکتورها، اسپلایس‌ها، اسپلیترها"), q("EDFA (optional)", "EDFA (اختیاری)"), q("Power meter / receiver", "توان‌سنج / گیرنده")],
    theory: { basic: q("Add up every loss between the transmitter and receiver. If what remains is more than the receiver needs (its sensitivity) plus a safety margin, the link works.", "همه تلفات بین فرستنده و گیرنده را جمع کنید. اگر آنچه باقی می‌ماند بیش از نیاز گیرنده (حساسیت) به‌علاوه حاشیه ایمنی باشد، لینک کار می‌کند."),
      engineering: q("P_rx = P_tx − αL − N_c·L_c − N_s·L_s − L_split − L_other + G. Typical values: L_c 0.3–0.5 dB, L_s 0.05–0.1 dB, 1:32 splitter 17 dB. Margin 3–6 dB covers aging, repairs and temperature. A second check — the rise-time / dispersion budget — often limits before power at ≥10 Gb/s over 1550 nm.", "P_rx = P_tx − αL − N_c·L_c − N_s·L_s − L_split − L_other + G. مقادیر معمول: L_c 0.3–0.5 dB، L_s 0.05–0.1 dB، اسپلیتر 1:32 حدود 17 dB. حاشیه ۳–۶ dB کهنگی، تعمیرات و دما را پوشش می‌دهد. بررسی دوم — بودجه زمان خیز/پاشندگی — اغلب در ≥۱۰ Gb/s روی ۱۵۵۰ nm زودتر از توان محدود می‌کند."),
      advanced: q("For amplified links the budget becomes an OSNR budget: OSNR ≈ 58 + P_ch − L_span − NF − 10log(N_spans) (dB, 0.1 nm). Penalties (dispersion, PMD, nonlinearity, crosstalk) are subtracted from the margin. Power should stay below the nonlinear threshold and above the receiver overload limit.", "برای لینک‌های تقویت‌شده بودجه به بودجه OSNR تبدیل می‌شود: OSNR ≈ 58 + P_ch − L_span − NF − 10log(N_spans) (dB، 0.1 nm). جریمه‌ها (پاشندگی، PMD، غیرخطی، همشنوایی) از حاشیه کم می‌شوند. توان باید زیر آستانه غیرخطی و بالای حد اضافه‌بار گیرنده بماند."),
      research: q("Modern design uses the Gaussian-noise (GN) model to treat nonlinear interference as additive noise, optimizing launch power per span (P_opt where ASE = 2·NLI). Statistical link budgets treat component losses as random variables and target a confidence level rather than worst case.", "طراحی مدرن از مدل نویز گاوسی (GN) برای در نظر گرفتن تداخل غیرخطی به‌عنوان نویز افزایشی استفاده کرده و توان تزریق هر span را بهینه می‌کند (P_opt جایی که ASE = 2·NLI). بودجه‌های آماری تلفات قطعات را متغیر تصادفی در نظر گرفته و سطح اطمینان را هدف می‌گیرند نه بدترین حالت.") },
    equations: [{ eq: "P_rx = P_tx − Σ Losses + Σ Gains", desc: q("Basic link budget", "بودجه لینک پایه") }, { eq: "L_split = 10 log₁₀(N) + L_excess", desc: q("1:N splitter loss", "تلفات اسپلیتر 1:N") }, { eq: "Margin = P_rx − P_sens ≥ M_safety", desc: q("Feasibility condition", "شرط امکان‌پذیری") }, { eq: "t_sys = √(t_tx² + t_chrom² + t_modal² + t_rx²) < 0.7/B", desc: q("Rise-time budget (NRZ)", "بودجه زمان خیز (NRZ)") }],
    procedure: [q("Design a 40 km, 10 Gb/s, 1550 nm link with 2 connectors and 8 splices; P_tx = 0 dBm, sensitivity −28 dBm.", "لینک ۴۰ km، ۱۰ Gb/s، ۱۵۵۰ nm با ۲ کانکتور و ۸ اسپلایس طراحی کنید؛ P_tx = 0 dBm، حساسیت −28 dBm."), q("Increase L until the margin drops below 3 dB; note the reach.", "L را افزایش دهید تا حاشیه زیر ۳ dB برود؛ برد را یادداشت کنید."), q("Insert a 1:32 splitter (PON) and re-evaluate; add an EDFA if needed.", "اسپلیتر 1:32 (PON) اضافه و دوباره ارزیابی کنید؛ در صورت نیاز EDFA بیفزایید."), q("Check the dispersion indicator at 10 and 40 Gb/s.", "شاخص پاشندگی را در ۱۰ و ۴۰ Gb/s بررسی کنید.")],
    errors: [q("Connector loss variability (0.1–0.75 dB).", "تغییرپذیری تلفات کانکتور (۰٫۱–۰٫۷۵ dB)."), q("Aging of laser (−1 to −2 dB over life).", "کهنگی لیزر."), q("Unaccounted penalties (dispersion, PMD, reflections).", "جریمه‌های محاسبه‌نشده."), ...commonErrors.slice(2, 3)],
    conclusion: q("A feasible link needs both a positive power margin and an acceptable dispersion/rise-time budget.", "لینک امکان‌پذیر هم به حاشیه توان مثبت و هم به بودجه پاشندگی/زمان خیز قابل قبول نیاز دارد."),
    questions: [{ q: q("P_tx = 0 dBm, 80 km @ 0.2 dB/km, 2 connectors @ 0.5 dB, 16 splices @ 0.1 dB → P_rx (dBm)?", "P_tx = 0 dBm، ۸۰ km @ 0.2 dB/km، ۲ کانکتور @ 0.5 dB، ۱۶ اسپلایس @ 0.1 dB ← P_rx (dBm)؟"), type: "numeric", answer: -18.6, tolerance: 0.3, unit: "dBm", hints: [q("Fiber: 16 dB.", "فیبر: ۱۶ dB."), q("Total = 16 + 1 + 1.6 = 18.6 dB.", "کل = 16 + 1 + 1.6 = 18.6 dB.")], explanation: q("P_rx = 0 − 18.6 = −18.6 dBm.", "P_rx = 0 − 18.6 = −18.6 dBm.") }, { q: q("Loss of an ideal 1:32 splitter?", "تلفات اسپلیتر ایده‌آل 1:32؟"), type: "numeric", answer: 15.05, tolerance: 0.3, unit: "dB", hints: [q("10 log₁₀(32).", "10 log₁₀(32)."), q("32 = 2⁵ → 5 × 3.01 dB.", "32 = 2⁵ ← 5 × 3.01 dB.")], explanation: q("10·log₁₀(32) = 15.05 dB; real devices add ~1 dB excess.", "10·log₁₀(32) = 15.05 dB؛ قطعات واقعی ~۱ dB اضافه دارند.") }],
    Sim: LinkBudgetSim, dataKeys: { x: "L_km", y: ["theory", "measured", "margin_dB"] } },
  { id: "osa", num: 10, category: "systems", level: 1, title: q("Optical Spectrum Analyzer — Source Spectra", "طیف‌سنج نوری — طیف منابع"), short: q("Compare LED, Fabry–Perot and DFB spectra; see modulation sidebands.", "طیف LED، فابری–پرو و DFB را مقایسه کنید؛ نوارهای کناری مدولاسیون را ببینید."),
    objective: q("Measure center wavelength, linewidth/FWHM, SMSR and modulation sidebands of different optical sources.", "اندازه‌گیری طول موج مرکزی، پهنای خط/FWHM، SMSR و نوارهای کناری مدولاسیون منابع مختلف."),
    prerequisites: [q("Wavelength–frequency relation", "رابطه طول موج–فرکانس"), q("Laser cavity modes", "مودهای کاواک لیزر")],
    equipment: [q("OSA (0.02 nm RBW)", "طیف‌سنج نوری"), q("LED, FP, DFB, tunable sources", "منابع LED، FP، DFB، قابل تنظیم"), q("RF signal generator + modulator", "مولد RF + مدولاتور")],
    theory: { basic: q("An OSA plots power versus wavelength. An LED is broad (tens of nm), a Fabry–Perot laser shows a comb of modes, and a DFB laser is a single very narrow line.", "OSA توان را بر حسب طول موج رسم می‌کند. LED پهن است (ده‌ها نانومتر)، لیزر فابری–پرو شانه‌ای از مودها نشان می‌دهد و لیزر DFB یک خط بسیار باریک است."),
      engineering: q("FP mode spacing Δλ = λ²/(2n_gL_cav) (~1 nm for 300 µm InP). DFB SMSR > 40 dB is required for WDM. Δν = cΔλ/λ²; a 0.1 nm RBW = 12.5 GHz at 1550 nm, so laser linewidths (MHz) cannot be resolved by a grating OSA — use self-heterodyne. Intensity modulation at f_m creates sidebands at ±f_m; chirp adds extra FM sidebands.", "فاصله مود FP برابر Δλ = λ²/(2n_gL_cav) (~۱ nm برای InP ۳۰۰ µm). برای WDM به SMSR > 40 dB نیاز است. Δν = cΔλ/λ²؛ RBW برابر 0.1 nm معادل 12.5 GHz در ۱۵۵۰ nm است، بنابراین پهنای خط لیزر (MHz) با OSA توری قابل تفکیک نیست — از self-heterodyne استفاده کنید. مدولاسیون شدت در f_m نوارهای کناری ±f_m ایجاد می‌کند؛ چیرپ نوارهای FM اضافه می‌کند."),
      advanced: q("The measured spectrum is the true spectrum convolved with the OSA filter function (RBW). Lineshapes: Lorentzian for phase-noise-limited lasers (Schawlow–Townes Δν = πhν(Δν_c)²n_sp/P·(1+α_H²)), Gaussian for inhomogeneous sources. Relative intensity noise and mode partition noise in FP lasers cause dispersion penalties.", "طیف اندازه‌گیری‌شده، طیف واقعی کانوالو شده با تابع فیلتر OSA (RBW) است. شکل خط: لورنتسی برای لیزرهای محدود به نویز فاز (Schawlow–Townes با Δν = πhν(Δν_c)²n_sp/P·(1+α_H²))، گاوسی برای منابع ناهمگن. نویز شدت نسبی و نویز تقسیم مود در لیزرهای FP جریمه پاشندگی ایجاد می‌کنند."),
      research: q("High-resolution spectroscopy uses heterodyne OSAs (coherent detection with a swept LO, ~MHz resolution) or Brillouin-based filters. Frequency combs provide absolute wavelength calibration; optical frequency-domain reflectometry exploits swept lasers for mm-resolution distributed measurements.", "طیف‌سنجی با تفکیک بالا از OSAهای هتروداین (آشکارسازی همدوس با LO جاروب‌شونده، تفکیک ~MHz) یا فیلترهای مبتنی بر بریلوئن استفاده می‌کند. شانه‌های فرکانسی کالیبراسیون مطلق طول موج فراهم می‌کنند؛ OFDR از لیزرهای جاروبی برای اندازه‌گیری توزیعی با تفکیک mm بهره می‌برد.") },
    equations: [{ eq: "Δν = c · Δλ / λ²", desc: q("Linewidth conversion", "تبدیل پهنای خط") }, { eq: "Δλ_FP = λ² / (2 n_g L_cav)", desc: q("Fabry–Perot mode spacing", "فاصله مودهای فابری–پرو") }, { eq: "Δλ_sideband = f_m · λ² / c", desc: q("Modulation sideband offset", "آفست نوار کناری مدولاسیون") }, { eq: "SMSR = 10 log₁₀(P_main / P_side)", desc: q("Side-mode suppression ratio", "نسبت سرکوب مود کناری") }],
    procedure: [q("Select DFB at 1550 nm, 0 dBm; read peak and FWHM.", "DFB در ۱۵۵۰ nm و 0 dBm را انتخاب کنید؛ قله و FWHM را بخوانید."), q("Switch to FP; measure mode spacing and SMSR.", "به FP بروید؛ فاصله مود و SMSR را اندازه بگیرید."), q("Select LED; measure the −3 dB width.", "LED را انتخاب کنید؛ پهنای −3 dB را اندازه بگیرید."), q("Apply 10 GHz modulation to the DFB; measure sideband offset and verify Δλ = f_m λ²/c.", "مدولاسیون ۱۰ GHz به DFB اعمال کنید؛ آفست نوار کناری را اندازه گرفته و Δλ = f_m λ²/c را تأیید کنید.")],
    errors: [q("RBW broadens narrow lines.", "RBW خطوط باریک را پهن می‌کند."), q("Wavelength calibration ±0.01–0.05 nm.", "کالیبراسیون طول موج ±0.01–0.05 nm."), q("Polarization-dependent response of the grating.", "پاسخ وابسته به قطبش توری.")],
    conclusion: q("Source spectral width directly determines chromatic dispersion penalty and WDM channel compatibility.", "پهنای طیفی منبع مستقیماً جریمه پاشندگی رنگی و سازگاری کانال WDM را تعیین می‌کند."),
    questions: [{ q: q("Sideband offset for 10 GHz modulation at 1550 nm (nm)?", "آفست نوار کناری برای مدولاسیون ۱۰ GHz در ۱۵۵۰ nm (nm)؟"), type: "numeric", answer: 0.08, tolerance: 0.005, unit: "nm", hints: [q("Δλ = f λ²/c.", "Δλ = f λ²/c."), q("1e10 × (1550e-9)² / 3e8.", "1e10 × (1550e-9)² / 3e8.")], explanation: q("Δλ = 10¹⁰ × 2.4×10⁻¹² / 3×10⁸ ≈ 8×10⁻¹¹ m = 0.08 nm.", "Δλ = 10¹⁰ × 2.4×10⁻¹² / 3×10⁸ ≈ 8×10⁻¹¹ m = 0.08 nm.") }, { q: q("Which source is best for 80 km at 10 Gb/s and 1550 nm?", "کدام منبع برای ۸۰ km در ۱۰ Gb/s و ۱۵۵۰ nm بهترین است؟"), type: "mc", answer: 2, options: [q("LED", "LED"), q("Fabry–Perot laser", "لیزر فابری–پرو"), q("Externally modulated DFB", "DFB با مدولاسیون خارجی"), q("Broadband ASE source", "منبع ASE پهن‌باند")], hints: [q("Think about Δτ = D·L·Δλ.", "به Δτ = D·L·Δλ فکر کنید."), q("Narrowest spectrum, no chirp.", "باریک‌ترین طیف، بدون چیرپ.")], explanation: q("An externally modulated DFB has the narrowest effective linewidth (no chirp), minimizing dispersion penalty.", "DFB با مدولاسیون خارجی باریک‌ترین پهنای خط مؤثر (بدون چیرپ) را دارد و جریمه پاشندگی را کمینه می‌کند.") }],
    Sim: OsaSim, dataKeys: { x: "linewidth_nm", y: ["fwhm_nm"] } },
  { id: "wdm", num: 11, category: "systems", level: 2, title: q("WDM — Multi-Channel Spectrum & Crosstalk", "WDM — طیف چندکاناله و همشنوایی"), short: q("Stack channels on the ITU grid, tighten the spacing, and watch FWM ghosts appear.", "کانال‌ها را روی شبکه ITU بچینید، فاصله را تنگ کنید و ظهور شبح‌های FWM را ببینید."),
    objective: q("Design a DWDM channel plan, evaluate spectral efficiency, linear crosstalk and four-wave-mixing impairment versus fiber dispersion.", "طراحی طرح کانال DWDM، ارزیابی بازده طیفی، همشنوایی خطی و اختلال FWM بر حسب پاشندگی فیبر."),
    prerequisites: [q("Source spectra", "طیف منابع"), q("Dispersion", "پاشندگی"), q("Nonlinear Kerr effect (intro)", "اثر کر (مقدماتی)")],
    equipment: [q("N DFB lasers on ITU grid", "N لیزر DFB روی شبکه ITU"), q("AWG multiplexer / demultiplexer", "مالتی‌پلکسر / دی‌مالتی‌پلکسر AWG"), q("OSA", "طیف‌سنج"), q("Fiber spans", "spanهای فیبر")],
    theory: { basic: q("WDM sends many colors through one fiber at once. Each color is a separate channel; a multiplexer combines them and a demultiplexer separates them. Capacity = channels × bit rate.", "WDM چند رنگ را هم‌زمان از یک فیبر می‌فرستد. هر رنگ یک کانال جداست؛ مالتی‌پلکسر آن‌ها را ترکیب و دی‌مالتی‌پلکسر جدا می‌کند. ظرفیت = تعداد کانال × نرخ بیت."),
      engineering: q("ITU-T G.694.1 grid: 193.1 THz anchor, 100/50/25/12.5 GHz spacing; the C-band (1530–1565 nm) holds 40–96 channels. Spectral efficiency = B/Δf. Linear crosstalk from filter overlap and nonlinear crosstalk (XPM, FWM) set the minimum spacing; FWM efficiency η ∝ α²/(α² + Δβ²) with Δβ = β₂(2πΔf)² — near-zero dispersion (DSF) is catastrophic for WDM, motivating NZ-DSF.", "شبکه ITU-T G.694.1: لنگر 193.1 THz، فاصله ۱۰۰/۵۰/۲۵/۱۲٫۵ GHz؛ باند C (۱۵۳۰–۱۵۶۵ nm) ۴۰–۹۶ کانال جای می‌دهد. بازده طیفی = B/Δf. همشنوایی خطی از هم‌پوشانی فیلتر و همشنوایی غیرخطی (XPM، FWM) کمینه فاصله را تعیین می‌کنند؛ بازده FWM η ∝ α²/(α² + Δβ²) با Δβ = β₂(2πΔf)² — پاشندگی نزدیک صفر (DSF) برای WDM فاجعه‌بار است و انگیزه NZ-DSF شد."),
      advanced: q("FWM product at f_ijk = f_i + f_j − f_k has power P_ijk = (D_g γ L_eff)² P_i P_j P_k η/9 ·e^{−αL}; the number of products N²(N−1)/2 grows cubically. Unequal channel spacing avoids products falling on channels. Raman tilt transfers power from short to long wavelengths (~dB across C-band at high total power).", "محصول FWM در f_ijk = f_i + f_j − f_k توان P_ijk = (D_g γ L_eff)² P_i P_j P_k η/9 ·e^{−αL} دارد؛ تعداد محصولات N²(N−1)/2 به‌صورت مکعبی رشد می‌کند. فاصله کانال نابرابر از افتادن محصولات روی کانال‌ها جلوگیری می‌کند. شیب رامان توان را از طول موج‌های کوتاه به بلند منتقل می‌کند."),
      research: q("Flexible-grid (12.5 GHz slots) and superchannels with Nyquist pulse shaping approach 1 symbol/s/Hz per polarization; coherent DSP compensates linear impairments so the nonlinear Shannon limit — modeled by the GN/EGN models — becomes the capacity ceiling. Space-division multiplexing (multicore/few-mode) is the next axis.", "شبکه انعطاف‌پذیر (اسلات ۱۲٫۵ GHz) و ابرکانال‌ها با شکل‌دهی پالس نایکوئیست به ۱ symbol/s/Hz در هر قطبش نزدیک می‌شوند؛ DSP همدوس اختلالات خطی را جبران می‌کند بنابراین حد شانون غیرخطی — مدل‌شده با GN/EGN — سقف ظرفیت می‌شود. مالتی‌پلکس فضایی (چندهسته‌ای/کم‌مود) محور بعدی است.") },
    equations: [{ eq: "Δλ = Δf · λ² / c", desc: q("Grid spacing in wavelength (100 GHz ≈ 0.8 nm)", "فاصله شبکه بر حسب طول موج") }, { eq: "SE = B / Δf  [b/s/Hz]", desc: q("Spectral efficiency", "بازده طیفی") }, { eq: "η_FWM = α²/(α²+Δβ²)·[1 + 4e^{−αL}sin²(ΔβL/2)/(1−e^{−αL})²]", desc: q("FWM phase-matching efficiency", "بازده تطبیق فاز FWM") }, { eq: "N_FWM = N²(N−1)/2", desc: q("Number of FWM products", "تعداد محصولات FWM") }],
    procedure: [q("Set 8 channels, 100 GHz, 0 dBm, G.652; note η_FWM.", "۸ کانال، ۱۰۰ GHz، 0 dBm، G.652؛ η_FWM را یادداشت کنید."), q("Switch to G.653 (D≈0) and observe FWM ghosts.", "به G.653 (D≈0) بروید و شبح‌های FWM را مشاهده کنید."), q("Reduce spacing to 50 GHz at 40 Gb/s; check linear crosstalk.", "فاصله را در ۴۰ Gb/s به ۵۰ GHz کاهش دهید؛ همشنوایی خطی را بررسی کنید."), q("Find the maximum channel count that fits 1530–1565 nm.", "بیشینه تعداد کانالی که در ۱۵۳۰–۱۵۶۵ nm جا می‌شود را بیابید.")],
    errors: [q("Laser wavelength drift vs grid (±2.5 GHz allowed).", "رانش طول موج لیزر نسبت به شبکه."), q("Mux/demux passband ripple and PDL.", "ریپل گذرباند و PDL مالتی‌پلکسر."), q("Gain ripple of EDFAs across channels.", "ریپل بهره EDFA در کانال‌ها.")],
    conclusion: q("WDM capacity scales with channel count, but spacing is bounded by modulation bandwidth, filter crosstalk and dispersion-controlled FWM.", "ظرفیت WDM با تعداد کانال مقیاس می‌شود، اما فاصله توسط پهنای باند مدولاسیون، همشنوایی فیلتر و FWM کنترل‌شده با پاشندگی محدود است."),
    questions: [{ q: q("Channel spacing 50 GHz at 1550 nm in nm?", "فاصله کانال ۵۰ GHz در ۱۵۵۰ nm بر حسب nm؟"), type: "numeric", answer: 0.4, tolerance: 0.02, unit: "nm", hints: [q("Δλ = Δf λ²/c.", "Δλ = Δf λ²/c."), q("100 GHz ≈ 0.8 nm.", "100 GHz ≈ 0.8 nm.")], explanation: q("5×10¹⁰ × (1.55×10⁻⁶)² / 3×10⁸ ≈ 0.4 nm.", "5×10¹⁰ × (1.55×10⁻⁶)² / 3×10⁸ ≈ 0.4 nm.") }, { q: q("Why is DSF (D≈0 at 1550 nm) unsuitable for DWDM?", "چرا DSF (D≈0 در ۱۵۵۰ nm) برای DWDM نامناسب است؟"), type: "mc", answer: 0, options: [q("FWM is phase-matched and generates strong crosstalk", "FWM تطبیق فاز شده و همشنوایی قوی ایجاد می‌کند"), q("Its attenuation is too high", "تضعیف آن بسیار زیاد است"), q("It is multimode at 1550 nm", "در ۱۵۵۰ nm چندمود است"), q("It cannot be spliced", "قابل اسپلایس نیست")], hints: [q("What does dispersion do to phase matching?", "پاشندگی با تطبیق فاز چه می‌کند؟"), q("Δβ ∝ β₂ → 0.", "Δβ ∝ β₂ ← 0.")], explanation: q("With β₂ ≈ 0 the FWM phase mismatch vanishes, η → 1 and mixing products land on neighbouring channels.", "با β₂ ≈ 0 عدم تطبیق فاز FWM صفر می‌شود، η → 1 و محصولات اختلاط روی کانال‌های مجاور می‌افتند.") }],
    Sim: WdmSim, dataKeys: { x: "spacing_GHz", y: ["eta_fwm_dB", "xt_dB"] } },
  { id: "edfa", num: 12, category: "systems", level: 2, title: q("EDFA — Gain, Saturation & ASE Noise", "EDFA — بهره، اشباع و نویز ASE"), short: q("Pump erbium-doped fiber and measure gain, output power, noise figure and the ASE spectrum.", "فیبر آلاییده به اربیوم را پمپ کنید و بهره، توان خروجی، عدد نویز و طیف ASE را اندازه بگیرید."),
    objective: q("Characterize an EDFA: small-signal gain, gain saturation, ASE power, noise figure and OSNR as functions of pump and input power.", "مشخصه‌یابی EDFA: بهره سیگنال کوچک، اشباع بهره، توان ASE، عدد نویز و OSNR بر حسب توان پمپ و ورودی."),
    prerequisites: [q("Stimulated emission & population inversion", "گسیل برانگیخته و وارونگی جمعیت"), q("OSNR", "OSNR")],
    equipment: [q("Er-doped fiber 1–40 m", "فیبر آلاییده به اربیوم"), q("980 nm pump laser + WDM coupler", "لیزر پمپ ۹۸۰ nm + کوپلر WDM"), q("Isolators", "ایزولاتورها"), q("OSA & power meter", "طیف‌سنج و توان‌سنج")],
    theory: { basic: q("Erbium ions pumped at 980 nm store energy and release it into a passing 1550 nm signal, amplifying it. Some energy is released spontaneously as broadband light (ASE) — that is the amplifier's noise.", "یون‌های اربیوم پمپ‌شده در ۹۸۰ nm انرژی ذخیره کرده و آن را به سیگنال عبوری ۱۵۵۰ nm می‌دهند و تقویتش می‌کنند. بخشی از انرژی به‌صورت خودبه‌خودی به شکل نور پهن‌باند (ASE) آزاد می‌شود — این نویز تقویت‌کننده است."),
      engineering: q("Typical: G = 20–35 dB, P_sat,out = 13–23 dBm, NF = 4–6 dB. Gain saturates as G = G₀·exp(−(G−1)P_in/P_sat) (Saleh). ASE in bandwidth B₀: P_ASE = 2n_sp(G−1)hνB₀; NF ≈ 2n_sp(G−1)/G + 1/G → 3 dB limit. OSNR after N identical spans: OSNR = 58 + P_in − NF − 10logN (dB/0.1 nm).", "مقادیر معمول: G = 20–35 dB، P_sat,out = 13–23 dBm، NF = 4–6 dB. بهره به‌صورت G = G₀·exp(−(G−1)P_in/P_sat) (صالح) اشباع می‌شود. ASE در پهنای باند B₀: P_ASE = 2n_sp(G−1)hνB₀؛ NF ≈ 2n_sp(G−1)/G + 1/G ← حد ۳ dB. OSNR پس از N span یکسان: OSNR = 58 + P_in − NF − 10logN (dB/0.1 nm)."),
      advanced: q("The Giles model integrates dN₂/dt rate equations with absorption/emission cross-sections σ_a(λ), σ_e(λ) along the fiber for pump, signal and ±ASE; the gain spectrum follows from ∫[σ_e N₂ − σ_a N₁]dz. Gain flattening filters equalize the 1530 nm peak; L-band EDFAs use long, low-inversion fibers.", "مدل Giles معادلات نرخ dN₂/dt را با سطح مقطع جذب/گسیل σ_a(λ)، σ_e(λ) در طول فیبر برای پمپ، سیگنال و ±ASE انتگرال می‌گیرد؛ طیف بهره از ∫[σ_e N₂ − σ_a N₁]dz حاصل می‌شود. فیلترهای تخت‌کننده بهره قله ۱۵۳۰ nm را برابر می‌کنند؛ EDFAهای باند L از فیبرهای بلند با وارونگی کم استفاده می‌کنند."),
      research: q("Beyond EDFA: distributed Raman amplification lowers effective NF (negative equivalent NF), hybrid Raman/EDFA extends reach; phase-sensitive amplifiers reach 0 dB NF; multi-band (S+C+L) and multicore amplifiers target next-generation capacity. Transient control (gain clamping) matters in dynamic WDM networks.", "فراتر از EDFA: تقویت توزیعی رامان NF مؤثر را کم می‌کند (NF معادل منفی)، ترکیب رامان/EDFA برد را افزایش می‌دهد؛ تقویت‌کننده‌های حساس به فاز به NF = 0 dB می‌رسند؛ تقویت‌کننده‌های چندباندی (S+C+L) و چندهسته‌ای ظرفیت نسل بعد را هدف می‌گیرند. کنترل گذرا (قفل بهره) در شبکه‌های WDM پویا مهم است.") },
    equations: [{ eq: "G = G₀ · exp(−(G − 1) · P_in / P_sat)", desc: q("Saturated gain (implicit)", "بهره اشباع‌شده (ضمنی)") }, { eq: "P_ASE = 2 n_sp (G − 1) h ν B₀", desc: q("ASE power in optical bandwidth B₀ (both polarizations)", "توان ASE در پهنای باند نوری B₀") }, { eq: "NF = 2 n_sp (G−1)/G + 1/G  →  ≥ 3 dB", desc: q("Noise figure (quantum limit 3 dB)", "عدد نویز (حد کوانتومی ۳ dB)") }, { eq: "OSNR = P_out / P_ASE(0.1 nm)", desc: q("Optical signal-to-noise ratio", "نسبت سیگنال به نویز نوری") }],
    procedure: [q("P_in = −20 dBm, pump 100 mW, L = 10 m; record G, NF.", "P_in = −20 dBm، پمپ ۱۰۰ mW، L = 10 m؛ G و NF را ثبت کنید."), q("Sweep P_in from −40 to +5 dBm; identify the 3-dB compression point.", "P_in را از −40 تا +5 dBm جاروب کنید؛ نقطه فشردگی ۳ dB را شناسایی کنید."), q("Sweep pump power; plot gain vs pump.", "توان پمپ را جاروب کنید؛ بهره بر حسب پمپ را رسم کنید."), q("Vary Er length; find the optimum for this pump.", "طول اربیوم را تغییر دهید؛ بهینه را برای این پمپ بیابید.")],
    errors: [q("OSA-based NF depends on accurate ASE interpolation under the signal.", "NF مبتنی بر OSA به درون‌یابی دقیق ASE زیر سیگنال وابسته است."), q("Source spontaneous emission counted as ASE.", "گسیل خودبه‌خودی منبع به‌عنوان ASE شمرده می‌شود."), q("Polarization hole burning / PDG.", "PDG.")],
    conclusion: q("An EDFA restores power with ~30 dB gain but adds ASE; OSNR degrades with each amplifier stage.", "EDFA توان را با ~۳۰ dB بهره بازیابی می‌کند اما ASE می‌افزاید؛ OSNR با هر طبقه تقویت افت می‌کند."),
    questions: [{ q: q("Minimum possible NF of a high-gain optical amplifier (dB)?", "کمترین NF ممکن تقویت‌کننده نوری با بهره بالا (dB)؟"), type: "numeric", answer: 3, tolerance: 0.2, unit: "dB", hints: [q("n_sp ≥ 1.", "n_sp ≥ 1."), q("NF ≈ 2n_sp.", "NF ≈ 2n_sp.")], explanation: q("With complete inversion n_sp = 1 → NF = 2 → 3 dB (quantum limit).", "با وارونگی کامل n_sp = 1 ← NF = 2 ← 3 dB (حد کوانتومی).") }, { q: q("Increasing input power into a saturated EDFA does what to gain?", "افزایش توان ورودی به EDFA اشباع چه اثری بر بهره دارد؟"), type: "mc", answer: 1, options: [q("Increases it", "افزایش می‌دهد"), q("Decreases it (gain compression)", "کاهش می‌دهد (فشردگی بهره)"), q("No effect", "بی‌اثر"), q("Makes NF negative", "NF را منفی می‌کند")], hints: [q("Where does the energy come from?", "انرژی از کجا می‌آید؟"), q("Finite inversion depletes.", "وارونگی محدود تخلیه می‌شود.")], explanation: q("Stronger signal depletes the inversion faster than the pump restores it; gain compresses toward output-power saturation.", "سیگنال قوی‌تر وارونگی را سریع‌تر از بازیابی پمپ تخلیه می‌کند؛ بهره به سمت اشباع توان خروجی فشرده می‌شود.") }],
    Sim: EdfaSim, dataKeys: { x: "Pin_dBm", y: ["theory", "measured", "NF_dB"] } },
  { id: "pinapd", num: 13, category: "systems", level: 2, title: q("PIN vs APD Receivers", "گیرنده‌های PIN در برابر APD"), short: q("Compare noise, Q-factor, BER, sensitivity and eye diagrams of PIN and avalanche photodiodes.", "نویز، ضریب Q، BER، حساسیت و نمودار چشمی فتودیودهای PIN و بهمنی را مقایسه کنید."),
    objective: q("Model shot, thermal and excess noise; compute Q, BER, optimum APD gain and receiver sensitivity.", "مدل‌سازی نویز شات، حرارتی و اضافی؛ محاسبه Q، BER، بهره بهینه APD و حساسیت گیرنده."),
    prerequisites: [q("Photodetection & responsivity", "آشکارسازی نوری و پاسخ‌دهی"), q("Gaussian noise statistics", "آمار نویز گاوسی")],
    equipment: [q("PIN and APD receivers", "گیرنده‌های PIN و APD"), q("Variable optical attenuator", "تضعیف‌کننده متغیر"), q("BERT / pattern generator", "BERT"), q("Sampling oscilloscope", "اسیلوسکوپ نمونه‌بردار")],
    theory: { basic: q("A PIN diode converts photons to electrons one-to-one (R ≈ 0.8 A/W). An APD multiplies each electron by M through avalanche — a bigger signal — but the avalanche is random, adding extra noise. At low light APDs win; at high light PINs are simpler.", "دیود PIN فوتون‌ها را یک‌به‌یک به الکترون تبدیل می‌کند (R ≈ 0.8 A/W). APD هر الکترون را از طریق بهمن در M ضرب می‌کند — سیگنال بزرگ‌تر — اما بهمن تصادفی است و نویز اضافی می‌افزاید. در نور کم APD برنده است؛ در نور زیاد PIN ساده‌تر است."),
      engineering: q("σ²_shot = 2q(RP + I_d)M²F(M)B, F = M^x; σ²_th = 4kTB/R_L·F_n. Q = (I₁−I₀)/(σ₁+σ₀), BER = ½erfc(Q/√2): Q = 6 → 1e-9, 7 → 1e-12. Sensitivity in the thermal limit: P̄ = Qσ_th/(MR) — APD improves it by ~M until excess noise dominates; M_opt ≈ (4kTF_n/(qx R_L I))^(1/(2+x)).", "σ²_shot = 2q(RP + I_d)M²F(M)B با F = M^x؛ σ²_th = 4kTB/R_L·F_n. Q = (I₁−I₀)/(σ₁+σ₀)، BER = ½erfc(Q/√2): Q = 6 ← 1e-9، ۷ ← 1e-12. حساسیت در حد حرارتی: P̄ = Qσ_th/(MR) — APD تا زمانی که نویز اضافی غالب شود آن را ~M برابر بهبود می‌دهد؛ M_opt ≈ (4kTF_n/(qx R_L I))^(1/(2+x))."),
      advanced: q("McIntyre's theory gives F(M) = kM + (2 − 1/M)(1 − k) with ionization ratio k (Si 0.02, InGaAs/InP 0.4); the power-law F = M^x is an engineering fit. Gain-bandwidth product limits APDs at high bit rates; SACM structures separate absorption and multiplication. Coherent receivers replace APD gain with LO gain and reach the shot-noise limit.", "نظریه McIntyre می‌دهد F(M) = kM + (2 − 1/M)(1 − k) با نسبت یونش k (Si 0.02، InGaAs/InP 0.4)؛ توان‌نمایی F = M^x برازش مهندسی است. حاصل‌ضرب بهره-پهنای باند APDها را در نرخ بیت بالا محدود می‌کند؛ ساختارهای SACM جذب و تکثیر را جدا می‌کنند. گیرنده‌های همدوس بهره APD را با بهره LO جایگزین کرده و به حد نویز شات می‌رسند."),
      research: q("Quantum limit for OOK direct detection: 10 photons/bit average for BER 1e-9 (Poisson). Single-photon APDs (Geiger mode) and SNSPDs enable QKD; optical preamplified receivers with n_sp ≈ 1 reach ~38 photons/bit. Analytical BER with ASE uses χ² statistics (Marcuse) rather than Gaussian.", "حد کوانتومی آشکارسازی مستقیم OOK: میانگین ۱۰ فوتون بر بیت برای BER 1e-9 (پواسون). APDهای تک‌فوتون (حالت گایگر) و SNSPD امکان QKD را می‌دهند؛ گیرنده‌های پیش‌تقویت نوری با n_sp ≈ 1 به ~۳۸ فوتون بر بیت می‌رسند. BER تحلیلی با ASE از آمار χ² (مارکوز) به‌جای گاوسی استفاده می‌کند.") },
    equations: [{ eq: "I = M · R · P,   R = ηq/(hν)", desc: q("Photocurrent, responsivity", "جریان نوری، پاسخ‌دهی") }, { eq: "σ²_shot = 2q(RP + I_d) M² F(M) B,  F = M^x", desc: q("Shot noise with excess noise factor", "نویز شات با ضریب نویز اضافی") }, { eq: "σ²_th = 4 k T B / R_L", desc: q("Thermal (Johnson) noise", "نویز حرارتی") }, { eq: "Q = (I₁ − I₀)/(σ₁ + σ₀),  BER = ½ erfc(Q/√2)", desc: q("Q-factor and BER", "ضریب Q و BER") }],
    procedure: [q("Set P_r = −25 dBm, B = 7.5 GHz (10 Gb/s). Compare Q for PIN and APD (M=10).", "P_r = −25 dBm و B = 7.5 GHz (10 Gb/s). Q را برای PIN و APD (M=10) مقایسه کنید."), q("Sweep M and locate M_opt.", "M را جاروب کرده و M_opt را بیابید."), q("Change x from 0.3 (Si) to 1.0 (Ge) and observe M_opt shift.", "x را از ۰٫۳ (Si) به ۱٫۰ (Ge) تغییر دهید و جابه‌جایی M_opt را ببینید."), q("Record sensitivities at 1e-9 for both; compute the APD advantage.", "حساسیت‌ها را در 1e-9 برای هر دو ثبت و مزیت APD را محاسبه کنید.")],
    errors: [q("Gaussian approximation of avalanche statistics.", "تقریب گاوسی آمار بهمن."), q("Amplifier noise figure not included explicitly.", "عدد نویز تقویت‌کننده به‌صورت صریح لحاظ نشده."), q("APD gain temperature drift.", "رانش دمایی بهره APD.")],
    conclusion: q("APDs offer 5–10 dB better sensitivity at an optimum gain set by the excess-noise index; PINs excel at high power and high speed.", "APDها در بهره بهینه تعیین‌شده توسط شاخص نویز اضافی ۵–۱۰ dB حساسیت بهتر دارند؛ PINها در توان و سرعت بالا برتری دارند."),
    questions: [{ q: q("Q required for BER = 1e-12?", "Q لازم برای BER = 1e-12؟"), type: "numeric", answer: 7.03, tolerance: 0.1, hints: [q("BER = ½erfc(Q/√2).", "BER = ½erfc(Q/√2)."), q("Q = 6 gives 1e-9; slightly higher.", "Q = 6 برابر 1e-9 است؛ کمی بیشتر.")], explanation: q("Q ≈ 7.03 → BER ≈ 1e-12 (Q = 6 → 1e-9).", "Q ≈ 7.03 ← BER ≈ 1e-12 (Q = 6 ← 1e-9).") }, { q: q("Why is there an optimum APD gain?", "چرا بهره بهینه APD وجود دارد؟"), type: "mc", answer: 2, options: [q("Gain is limited by bias voltage", "بهره توسط ولتاژ بایاس محدود است"), q("Responsivity drops with M", "پاسخ‌دهی با M کم می‌شود"), q("Signal grows ∝ M but shot noise ∝ M²F(M), eventually exceeding thermal noise", "سیگنال ∝ M رشد می‌کند اما نویز شات ∝ M²F(M) و سرانجام از نویز حرارتی فراتر می‌رود"), q("Dark current disappears", "جریان تاریک ناپدید می‌شود")], hints: [q("Compare how signal and noise scale with M.", "مقیاس سیگنال و نویز با M را مقایسه کنید."), q("F(M) = M^x grows with M.", "F(M) = M^x با M رشد می‌کند.")], explanation: q("Beyond M_opt the multiplied shot noise (∝ M^{2+x}) grows faster than signal (∝ M), reducing Q.", "فراتر از M_opt نویز شات تکثیرشده (∝ M^{2+x}) سریع‌تر از سیگنال (∝ M) رشد می‌کند و Q کاهش می‌یابد.") }],
    Sim: PinApdSim, dataKeys: { x: "Pr_dBm", y: ["theory", "Q_apd"] } },
  { id: "eye", num: 14, category: "systems", level: 2, title: q("Eye Diagram Analysis", "تحلیل نمودار چشمی"), short: q("Bandwidth, noise, jitter, extinction ratio and dispersion — see how each closes the eye.", "پهنای باند، نویز، جیتر، نسبت خاموشی و پاشندگی — ببینید هر کدام چگونه چشم را می‌بندند."),
    objective: q("Generate eye diagrams from a PRBS stream and quantify eye height, width, Q, jitter and ISI.", "تولید نمودار چشمی از دنباله PRBS و کمی‌سازی ارتفاع، پهنا، Q، جیتر و ISI چشم."),
    prerequisites: [q("Digital signalling (NRZ/PAM4)", "سیگنال‌دهی دیجیتال"), q("Receiver noise", "نویز گیرنده")],
    equipment: [q("Pattern generator (PRBS-31)", "مولد الگو"), q("Optical transmitter", "فرستنده نوری"), q("Sampling oscilloscope with optical head", "اسیلوسکوپ نمونه‌بردار"), q("Clock recovery", "بازیابی ساعت")],
    theory: { basic: q("Overlaying many bit periods on top of each other draws an 'eye'. A wide-open eye means 1s and 0s are easy to tell apart at the sampling instant. Noise thickens the lines, slow edges narrow the opening, jitter blurs the crossings.", "روی‌هم‌گذاری بازه‌های بیت زیاد یک «چشم» می‌کشد. چشم کاملاً باز یعنی تفکیک ۱ و ۰ در لحظه نمونه‌برداری آسان است. نویز خطوط را ضخیم، لبه‌های کند دهانه را باریک و جیتر تقاطع‌ها را مبهم می‌کند."),
      engineering: q("Eye height = (μ₁−3σ₁) − (μ₀+3σ₀); eye width from crossing jitter. Optimum Rx bandwidth ≈ 0.75B balances ISI against noise. Mask testing (IEEE/ITU) checks compliance. PAM4 has three eyes each with 1/3 amplitude → ~9.5 dB SNR penalty vs NRZ at the same symbol rate but doubles bits/symbol.", "ارتفاع چشم = (μ₁−3σ₁) − (μ₀+3σ₀)؛ پهنای چشم از جیتر تقاطع. پهنای باند بهینه Rx ≈ 0.75B تعادل ISI و نویز است. آزمون ماسک (IEEE/ITU) انطباق را بررسی می‌کند. PAM4 سه چشم با دامنه ۱/۳ دارد ← ~۹٫۵ dB جریمه SNR نسبت به NRZ در نرخ نماد یکسان اما بیت بر نماد دو برابر."),
      advanced: q("The eye is the superposition of the channel response to all bit patterns; ISI from a band-limited channel h(t) is Σ_{k≠0} a_k h(t−kT). Equalization (FFE/DFE) reopens the eye; jitter decomposes into random (Gaussian, from phase noise) and deterministic (data-dependent, periodic) parts, characterized by the bathtub curve.", "چشم برهم‌نهی پاسخ کانال به همه الگوهای بیت است؛ ISI کانال باند-محدود h(t) برابر Σ_{k≠0} a_k h(t−kT) است. همسان‌سازی (FFE/DFE) چشم را بازمی‌کند؛ جیتر به تصادفی (گاوسی، از نویز فاز) و قطعی (وابسته به داده، تناوبی) تجزیه می‌شود که با منحنی وان حمام مشخص می‌شود."),
      research: q("For coherent systems constellation diagrams and EVM replace the eye; TDECQ (transmitter dispersion eye closure quaternary) is the PAM4 standard metric using a reference equalizer. Machine-learning based eye-diagram analysis enables optical performance monitoring in real networks.", "برای سیستم‌های همدوس نمودار منظومه و EVM جایگزین چشم می‌شوند؛ TDECQ معیار استاندارد PAM4 با همسان‌ساز مرجع است. تحلیل چشم مبتنی بر یادگیری ماشین پایش عملکرد نوری در شبکه‌های واقعی را ممکن می‌کند.") },
    equations: [{ eq: "t_r ≈ 0.35 / BW", desc: q("10–90% rise time of first-order receiver", "زمان خیز ۱۰–۹۰٪ گیرنده مرتبه اول") }, { eq: "Eye height = (μ₁ − 3σ₁) − (μ₀ + 3σ₀)", desc: q("Vertical opening (3σ)", "دهانه عمودی (3σ)") }, { eq: "Q = (μ₁ − μ₀)/(σ₁ + σ₀)", desc: q("Q from eye statistics", "Q از آمار چشم") }, { eq: "Penalty_ER = 10 log₁₀((r+1)/(r−1))", desc: q("Extinction-ratio power penalty", "جریمه توان نسبت خاموشی") }],
    procedure: [q("10 Gb/s, BW 7.5 GHz, SNR 8, jitter 0.03 UI: record Q, height, width.", "۱۰ Gb/s، BW 7.5 GHz، SNR 8، جیتر 0.03 UI: Q، ارتفاع و پهنا را ثبت کنید."), q("Reduce BW to 3 GHz → observe ISI closure.", "BW را به ۳ GHz کاهش دهید ← بسته شدن ISI را ببینید."), q("Increase jitter to 0.1 UI → observe crossing blur.", "جیتر را به 0.1 UI افزایش دهید ← تاری تقاطع را ببینید."), q("Add 100 ps dispersion; compute rise-time budget.", "۱۰۰ ps پاشندگی اضافه کنید؛ بودجه زمان خیز را محاسبه کنید."), q("Switch to PAM4 at the same baud; compare Q.", "به PAM4 با همان baud بروید؛ Q را مقایسه کنید.")],
    errors: [q("Finite sample count underestimates tails (3σ vs true BER).", "تعداد نمونه محدود دنباله‌ها را کم‌تخمین می‌زند."), q("Scope bandwidth and its own jitter.", "پهنای باند اسیلوسکوپ و جیتر خودش."), q("Trigger/clock recovery bandwidth filters low-frequency jitter.", "پهنای باند بازیابی ساعت جیتر فرکانس پایین را فیلتر می‌کند.")],
    conclusion: q("The eye diagram is the fastest qualitative and quantitative health check of a digital optical link.", "نمودار چشمی سریع‌ترین بررسی کیفی و کمی سلامت لینک نوری دیجیتال است."),
    questions: [{ q: q("Rise time of a 7.5 GHz first-order receiver (ps)?", "زمان خیز گیرنده مرتبه اول ۷٫۵ GHz (ps)؟"), type: "numeric", answer: 46.7, tolerance: 2, unit: "ps", hints: [q("t_r = 0.35/BW.", "t_r = 0.35/BW."), q("0.35 / 7.5e9.", "0.35 / 7.5e9.")], explanation: q("0.35 / 7.5 GHz = 46.7 ps — about 47% of a 100 ps bit period.", "0.35 / 7.5 GHz = 46.7 ps — حدود ۴۷٪ بازه بیت ۱۰۰ ps.") }, { q: q("Which impairment mainly reduces eye WIDTH?", "کدام اختلال عمدتاً پهنای چشم را کم می‌کند؟"), type: "mc", answer: 1, options: [q("Amplitude noise", "نویز دامنه"), q("Timing jitter", "جیتر زمانی"), q("Low extinction ratio", "نسبت خاموشی کم"), q("Dark current", "جریان تاریک")], hints: [q("Width is a horizontal (time) quantity.", "پهنا کمیتی افقی (زمانی) است."), q("What blurs the crossing points?", "چه چیزی نقاط تقاطع را تار می‌کند؟")], explanation: q("Jitter spreads the crossing instants horizontally, shrinking the time window for error-free sampling.", "جیتر لحظات تقاطع را افقی پخش می‌کند و پنجره زمانی نمونه‌برداری بدون خطا را کوچک می‌کند.") }],
    Sim: EyeSim, dataKeys: { x: "BW_GHz", y: ["measured", "eye_height"] } },
  { id: "ber", num: 15, category: "systems", level: 2, title: q("Bit Error Rate vs Received Power", "نرخ خطای بیت بر حسب توان دریافتی"), short: q("Waterfall curves for PIN, APD and coherent receivers with NRZ, RZ and PAM4.", "منحنی‌های آبشاری برای گیرنده‌های PIN، APD و همدوس با NRZ، RZ و PAM4."),
    objective: q("Generate BER-vs-power and BER-vs-Q curves, determine sensitivity at 1e-9/1e-12 and the FEC threshold margin.", "تولید منحنی‌های BER-توان و BER-Q، تعیین حساسیت در 1e-9/1e-12 و حاشیه آستانه FEC."),
    prerequisites: [q("Receiver noise model", "مدل نویز گیرنده"), q("Gaussian Q-function", "تابع Q گاوسی")],
    equipment: [q("BERT (pattern generator + error detector)", "BERT"), q("Variable optical attenuator", "تضعیف‌کننده متغیر"), q("Calibrated power meter", "توان‌سنج کالیبره"), q("Receivers under test", "گیرنده‌های تحت آزمون")],
    theory: { basic: q("BER is the fraction of bits received wrongly. Raising the received power raises the signal above the noise and BER plunges — a 'waterfall' curve. Telecom targets 1e-12 (one error per trillion bits).", "BER کسری از بیت‌هاست که اشتباه دریافت می‌شوند. افزایش توان دریافتی سیگنال را بالاتر از نویز می‌برد و BER سقوط می‌کند — منحنی «آبشاری». مخابرات 1e-12 را هدف می‌گیرد (یک خطا در هر تریلیون بیت)."),
      engineering: q("BER = ½erfc(Q/√2); in the thermal-noise limit Q ∝ P so BER drops ~2–3 decades per dB near Q≈6. Sensitivity scales with √B (thermal) or B (shot). FEC (RS(255,239) → 8.3e-5, SD-FEC → 2e-2 pre-FEC) relaxes the required raw BER by several dB of power. PAM4 costs ~9.5 dB in Q, RZ gains ~1–2 dB peak-power advantage.", "BER = ½erfc(Q/√2)؛ در حد نویز حرارتی Q ∝ P بنابراین BER نزدیک Q≈6 حدود ۲–۳ دهه در هر dB افت می‌کند. حساسیت با √B (حرارتی) یا B (شات) مقیاس می‌شود. FEC (RS(255,239) ← 8.3e-5، SD-FEC ← 2e-2 پیش از FEC) BER خام لازم را چند dB توان تسهیل می‌کند. PAM4 حدود ۹٫۵ dB در Q هزینه دارد، RZ ~۱–۲ dB مزیت توان پیک دارد."),
      advanced: q("Coherent detection with LO power P_LO gives I ∝ 2R√(P_s P_LO): shot noise of the LO dominates and the sensitivity approaches the quantum limit (e.g. 18 photons/bit for BPSK homodyne, 36 for DPSK). Error floors arise from crosstalk, RIN, ISI or laser phase noise — a BER curve that flattens instead of falling.", "آشکارسازی همدوس با توان LO برابر P_LO می‌دهد I ∝ 2R√(P_s P_LO): نویز شات LO غالب است و حساسیت به حد کوانتومی نزدیک می‌شود (مثلاً ۱۸ فوتون بر بیت برای BPSK هومودین، ۳۶ برای DPSK). کف خطا از همشنوایی، RIN، ISI یا نویز فاز لیزر ناشی می‌شود — منحنی BER که به‌جای افت تخت می‌شود."),
      research: q("Measured BER at 1e-12 requires >1e13 bits for 95% confidence (~17 min at 10 Gb/s); Q-extrapolation from the tails or decision-threshold sweeping (Bergano method) shortens tests. For soft-decision FEC, generalized mutual information (GMI/NGMI) replaces pre-FEC BER as the performance metric.", "اندازه‌گیری BER در 1e-12 برای اطمینان ۹۵٪ به بیش از 1e13 بیت نیاز دارد (~۱۷ دقیقه در ۱۰ Gb/s)؛ برون‌یابی Q از دنباله‌ها یا جاروب آستانه تصمیم (روش Bergano) آزمون‌ها را کوتاه می‌کند. برای FEC نرم، اطلاعات متقابل تعمیم‌یافته (GMI/NGMI) جایگزین BER پیش از FEC می‌شود.") },
    equations: [{ eq: "BER = ½ erfc(Q / √2) ≈ e^{−Q²/2} / (Q√(2π))", desc: q("Gaussian-noise BER", "BER نویز گاوسی") }, { eq: "Q = 6 → 1e-9,  Q = 7.03 → 1e-12", desc: q("Common targets", "اهداف رایج") }, { eq: "P_sens ≈ Q (σ_th + q Q B) / R", desc: q("Sensitivity incl. shot term (OOK, ER→∞)", "حساسیت شامل جمله شات") }, { eq: "Q_PAM4 ≈ Q_NRZ / 3", desc: q("PAM4 penalty at equal peak power", "جریمه PAM4 در توان پیک برابر") }],
    procedure: [q("PIN, NRZ, 10 Gb/s: sweep P_r from −35 to −15 dBm; record BER at each step.", "PIN، NRZ، ۱۰ Gb/s: P_r را از −35 تا −15 dBm جاروب کنید؛ BER هر گام را ثبت کنید."), q("Find sensitivity at 1e-9 and 1e-12.", "حساسیت را در 1e-9 و 1e-12 بیابید."), q("Repeat for APD and coherent; tabulate the improvement.", "برای APD و همدوس تکرار کنید؛ بهبود را جدول کنید."), q("Switch to PAM4 at the same symbol rate and quantify the penalty.", "به PAM4 با همان نرخ نماد بروید و جریمه را کمی کنید."), q("Increase the bit rate to 40 Gb/s; note the sensitivity shift.", "نرخ بیت را به ۴۰ Gb/s افزایش دهید؛ جابه‌جایی حساسیت را یادداشت کنید.")],
    errors: [q("Insufficient error count (statistical confidence).", "شمارش خطای ناکافی (اطمینان آماری)."), q("Attenuator calibration and polarization dependence.", "کالیبراسیون تضعیف‌کننده و وابستگی به قطبش."), q("Pattern dependence (PRBS length).", "وابستگی به الگو (طول PRBS).")],
    conclusion: q("BER falls steeply with received power; receiver type, bit rate and modulation format shift the waterfall curve horizontally.", "BER با توان دریافتی به‌شدت افت می‌کند؛ نوع گیرنده، نرخ بیت و فرمت مدولاسیون منحنی آبشاری را افقی جابه‌جا می‌کنند."),
    questions: [{ q: q("BER for Q = 6 (order of magnitude, enter as 1e-9 → 9)?", "BER برای Q = 6 (مرتبه بزرگی؛ 1e-9 را به‌صورت 9 وارد کنید)؟"), type: "numeric", answer: 9, tolerance: 0.3, hints: [q("½erfc(6/√2).", "½erfc(6/√2)."), q("Classic telecom number.", "عدد کلاسیک مخابرات.")], explanation: q("Q = 6 → BER ≈ 1×10⁻⁹.", "Q = 6 ← BER ≈ 1×10⁻⁹.") }, { q: q("A BER curve that flattens at 1e-6 regardless of power indicates:", "منحنی BER که مستقل از توان در 1e-6 تخت می‌شود نشان‌دهنده:"), type: "mc", answer: 2, options: [q("Thermal noise limit", "حد نویز حرارتی"), q("Shot noise limit", "حد نویز شات"), q("An error floor from ISI / crosstalk / RIN", "کف خطا ناشی از ISI / همشنوایی / RIN"), q("Perfect operation", "عملکرد کامل")], hints: [q("More power does not help.", "توان بیشتر کمکی نمی‌کند."), q("Signal-proportional impairments.", "اختلالات متناسب با سیگنال.")], explanation: q("Impairments that scale with the signal (ISI, crosstalk, RIN, phase noise) cannot be overcome by power — an error floor.", "اختلالاتی که با سیگنال مقیاس می‌شوند (ISI، همشنوایی، RIN، نویز فاز) با توان قابل غلبه نیستند — کف خطا.") }],
    Sim: BerSim, dataKeys: { x: "Pr_dBm", y: ["theory", "measured"] } },
];
