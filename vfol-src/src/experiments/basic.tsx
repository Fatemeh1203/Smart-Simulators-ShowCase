import { useMemo, useState } from "react";
import { Panel, Slider, Stat, Segmented, Select, Badge, fmt } from "../components/ui";
import { XYChart, Palette } from "../components/Chart";
import { Fiber3D, ModeField } from "../components/Fiber3D";
import { Compare, RecordBar, useExplain, type ExperimentDef, type SimProps } from "../components/ExperimentShell";
import * as P from "../lib/physics";
import { noisy, noisyAdd, B, commonErrors } from "./common";
import { useStore } from "../lib/store";

// ============ Experiment 1: Snell & TIR ============
function SnellSim({ model, noise, record }: SimProps) {
  const { lang } = useStore();
  const [n1, setN1] = useState(1.48), [n2, setN2] = useState(1.46), [th, setTh] = useState(70);
  const r = P.snell(n1, n2, th);
  const meas = useMemo(() => ({ thetaC: noisyAdd(r.thetaC, 0.4, model, noise.inst), theta2: noisyAdd(r.theta2, 0.5, model, noise.meas) }), [r.thetaC, r.theta2, model, noise]);
  const curve = useMemo(() => P.linspace(0, 89.9, 180).map((a) => { const s = P.snell(n1, n2, a); return { x: +a.toFixed(1), R: +(s.R * 100).toFixed(3), T: +(s.T * 100).toFixed(3) }; }), [n1, n2]);
  const explain = useExplain({ n1, n2, θ1: th }, {
    n1: B("Increasing n₁ makes the medium optically denser: the critical angle θc = asin(n₂/n₁) decreases, so TIR happens over a wider range of incidence angles.", "افزایش n₁ محیط را چگال‌تر می‌کند: زاویه بحرانی θc = asin(n₂/n₁) کوچک‌تر شده و بازتاب کلی داخلی در بازه وسیع‌تری از زوایا رخ می‌دهد."),
    n2: B("Raising n₂ toward n₁ reduces the index contrast; θc grows toward 90° and it becomes harder to trap light (NA shrinks).", "نزدیک شدن n₂ به n₁ اختلاف ضریب را کم می‌کند؛ θc به ۹۰° نزدیک شده و به‌دام‌انداختن نور دشوارتر می‌شود (NA کاهش می‌یابد)."),
    θ1: B("Snell's law n₁sinθ₁ = n₂sinθ₂ sets the refracted angle. When sinθ₂ would exceed 1, no real solution exists → total internal reflection.", "قانون اسنل n₁sinθ₁ = n₂sinθ₂ زاویه شکست را تعیین می‌کند. وقتی sinθ₂ از ۱ بزرگ‌تر شود، جواب حقیقی وجود ندارد → بازتاب کلی داخلی."),
  });
  // SVG geometry
  const W = 520, Hh = 300, cx = W / 2, cy = Hh / 2, len = 130;
  const a = P.rad(th);
  const inc = { x: cx - len * Math.sin(a), y: cy - len * Math.cos(a) };
  const ref = { x: cx + len * Math.sin(a), y: cy - len * Math.cos(a) };
  const b = r.tir ? 0 : P.rad(r.theta2);
  const tra = { x: cx + len * Math.sin(b), y: cy + len * Math.cos(b) };
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label="n₁ (core)" value={n1} min={1.3} max={1.8} step={0.001} onChange={setN1} fmt={(v) => v.toFixed(3)} />
        <Slider label="n₂ (cladding)" value={n2} min={1.0} max={1.8} step={0.001} onChange={setN2} fmt={(v) => v.toFixed(3)} />
        <Slider label="θ₁ (incidence)" value={th} min={0} max={89.9} step={0.1} unit="°" onChange={setTh} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="θc" value={fmt(r.thetaC, 2)} unit="°" tone="brand" />
          <Stat label="θ₂" value={r.tir ? "—" : fmt(r.theta2, 2)} unit="°" />
          <Stat label="R (Fresnel)" value={fmt(r.R * 100, 2)} unit="%" tone={r.tir ? "good" : "default"} />
          <Stat label={lang === "fa" ? "وضعیت" : "State"} value={r.tir ? "TIR" : n2 > n1 ? (lang === "fa" ? "شکست" : "Refraction") : (lang === "fa" ? "شکست جزئی" : "Partial")} tone={r.tir ? "good" : "warn"} />
        </div>
        <RecordBar onRecord={() => record({ n1, n2, theta1: th }, { thetaC_theory: +r.thetaC.toFixed(3), theory: +r.thetaC.toFixed(3), measured: +meas.thetaC.toFixed(3), theta2: r.tir ? "TIR" : +r.theta2.toFixed(3), R_pct: +(r.R * 100).toFixed(3) })} />
        {explain}
      </Panel>
      <Panel title={lang === "fa" ? "مسیر پرتو" : "Ray diagram"} className="lg:col-span-2">
        <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full ltr">
          <rect x={0} y={0} width={W} height={cy} fill="#3b82f6" opacity=".12" /><rect x={0} y={cy} width={W} height={cy} fill="#22c55e" opacity=".08" />
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="currentColor" strokeWidth="1" opacity=".5" />
          <line x1={cx} y1={20} x2={cx} y2={Hh - 20} stroke="currentColor" strokeDasharray="4 4" opacity=".35" />
          <text x={10} y={20} fontSize="12" fill="currentColor" opacity=".8">n₁ = {n1.toFixed(3)}</text><text x={10} y={Hh - 10} fontSize="12" fill="currentColor" opacity=".8">n₂ = {n2.toFixed(3)}</text>
          <line x1={inc.x} y1={inc.y} x2={cx} y2={cy} stroke="#f59e0b" strokeWidth="3" className="flow" />
          <line x1={cx} y1={cy} x2={ref.x} y2={ref.y} stroke="#f59e0b" strokeWidth={r.tir ? 3 : 1 + 2 * r.R} opacity={r.tir ? 1 : 0.35 + r.R} className="flow" />
          {!r.tir && <line x1={cx} y1={cy} x2={tra.x} y2={tra.y} stroke="#10b981" strokeWidth={1 + 2 * r.T} className="flow" />}
          {Number.isFinite(r.thetaC) && <path d={`M ${cx} ${cy} L ${cx - len * 0.5 * Math.sin(P.rad(r.thetaC))} ${cy - len * 0.5 * Math.cos(P.rad(r.thetaC))}`} stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" />}
          <text x={cx - 110} y={cy - 8} fontSize="11" fill="#f59e0b">θ₁={th.toFixed(1)}°</text>
          {!r.tir && <text x={cx + 12} y={cy + 60} fontSize="11" fill="#10b981">θ₂={r.theta2.toFixed(1)}°</text>}
          {Number.isFinite(r.thetaC) && <text x={cx - 70} y={cy - 40} fontSize="11" fill="#ef4444">θc={r.thetaC.toFixed(1)}°</text>}
          {r.tir && <text x={cx + 20} y={cy - 100} fontSize="14" fontWeight="700" fill="#f59e0b">Total Internal Reflection</text>}
        </svg>
        <div className="mt-2"><XYChart data={curve} series={[{ key: "R", name: "R (%)" }, { key: "T", name: "T (%)", color: "#10b981" }]} xLabel="θ₁ (°)" yLabel="%" height={200} refX={Number.isFinite(r.thetaC) ? [{ x: +r.thetaC.toFixed(1), label: "θc" }] : []} legend brush={false} /></div>
        <div className="mt-3"><Compare rows={[{ label: "θc", theory: r.thetaC, measured: meas.thetaC, unit: "°" }, ...(r.tir ? [] : [{ label: "θ₂", theory: r.theta2, measured: meas.theta2, unit: "°" }])]} /></div>
      </Panel>
    </div>
  );
}

// ============ Experiment 2: Numerical Aperture ============
function NASim({ model, noise, record, sim }: SimProps) {
  const { lang } = useStore();
  const [n1, setN1] = useState(1.48), [n2, setN2] = useState(1.46), [a, setA] = useState(25);
  const NA = P.numericalAperture(n1, n2), theta = P.acceptanceAngle(NA), delta = P.relativeIndexDiff(n1, n2);
  const measNA = useMemo(() => noisy(NA, 0.03, model, noise.meas), [NA, model, noise]);
  const curve = useMemo(() => P.linspace(n2 + 0.001, n2 + 0.1, 60).map((x) => ({ x: +x.toFixed(4), NA: +P.numericalAperture(x, n2).toFixed(4), theta: +P.acceptanceAngle(P.numericalAperture(x, n2)).toFixed(2) })), [n2]);
  const explain = useExplain({ n1, n2, a }, {
    n1: B("NA = √(n₁²−n₂²): a larger core index widens the acceptance cone. The core radius does not appear in NA (but affects V-number).", "NA = √(n₁²−n₂²): ضریب هسته بزرگ‌تر مخروط پذیرش را باز‌تر می‌کند. شعاع هسته در NA ظاهر نمی‌شود (اما بر V اثر دارد)."),
    n2: B("Reducing n₂ increases the index contrast, hence NA and acceptance angle increase.", "کاهش n₂ اختلاف ضریب را زیاد می‌کند؛ بنابراین NA و زاویه پذیرش افزایش می‌یابند."),
    a: B("The core radius does not change NA, but it scales the physical cone cross-section and the V-number (mode count).", "شعاع هسته NA را تغییر نمی‌دهد، اما سطح مقطع مخروط و عدد V (تعداد مود) را تغییر می‌دهد."),
  });
  const W = 520, Hh = 240, x0 = 260, cy = Hh / 2;
  const coreH = Math.max(14, a * 1.4), t = P.rad(theta);
  const coneLen = 200;
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label="n₁ (core)" value={n1} min={1.44} max={1.62} step={0.001} onChange={setN1} fmt={(v) => v.toFixed(3)} />
        <Slider label="n₂ (cladding)" value={n2} min={1.40} max={1.60} step={0.001} onChange={setN2} fmt={(v) => v.toFixed(3)} />
        <Slider label={lang === "fa" ? "شعاع هسته a" : "Core radius a"} value={a} min={2} max={50} step={0.5} unit="µm" onChange={setA} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="NA" value={fmt(NA, 4)} tone="brand" />
          <Stat label={lang === "fa" ? "زاویه پذیرش θa" : "Acceptance θa"} value={fmt(theta, 2)} unit="°" />
          <Stat label="Δ" value={fmt(delta * 100, 3)} unit="%" />
          <Stat label={lang === "fa" ? "زاویه کل مخروط" : "Full cone"} value={fmt(2 * theta, 1)} unit="°" />
        </div>
        <RecordBar onRecord={() => record({ n1, n2, a }, { theory: +NA.toFixed(4), measured: +measNA.toFixed(4), acceptance_deg: +theta.toFixed(3), delta_pct: +(delta * 100).toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "مخروط پذیرش" : "Cone of acceptance"}>
          <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full ltr">
            <rect x={x0} y={cy - coreH * 2.2} width={W - x0} height={coreH * 4.4} fill="#94a3b8" opacity=".25" />
            <rect x={x0} y={cy - coreH / 2} width={W - x0} height={coreH} fill="#3b82f6" opacity=".45" />
            <path d={`M ${x0} ${cy} L ${x0 - coneLen * Math.cos(t)} ${cy - coneLen * Math.sin(t)} A ${coneLen} ${coneLen} 0 0 0 ${x0 - coneLen * Math.cos(t)} ${cy + coneLen * Math.sin(t)} Z`} fill="#f59e0b" opacity=".18" />
            {[-1, -0.5, 0, 0.5, 1].map((k, i) => { const ang = k * t; const p = (sim.t * 3 + i * 20) % coneLen; return <g key={i}><line x1={x0 - coneLen * Math.cos(ang)} y1={cy - coneLen * Math.sin(ang)} x2={x0} y2={cy} stroke="#f59e0b" strokeWidth="1.5" opacity=".8" /><circle cx={x0 - (coneLen - p) * Math.cos(ang)} cy={cy - (coneLen - p) * Math.sin(ang)} r="3" fill="#fbbf24" /></g>; })}
            {(() => { const ang = t * 1.35; return <line x1={x0 - coneLen * Math.cos(ang)} y1={cy - coneLen * Math.sin(ang)} x2={x0} y2={cy} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />; })()}
            {/* zigzag inside core */}
            {(() => { const pts: string[] = []; const critical = P.rad(90 - (Number.isFinite(P.snell(n1, n2, 0).thetaC) ? P.snell(n1, n2, 0).thetaC : 80)); const dx = (coreH / 2) / Math.tan(Math.max(0.05, critical)); let x = x0, up = true; pts.push(`M ${x} ${cy}`); x += dx / 2; pts.push(`L ${x} ${cy - coreH / 2}`); while (x < W) { x += dx; up = !up; pts.push(`L ${x} ${up ? cy - coreH / 2 : cy + coreH / 2}`); } return <path d={pts.join(" ")} stroke="#fbbf24" strokeWidth="2" fill="none" className="flow" />; })()}
            <text x={x0 - 190} y={cy - coneLen * Math.sin(t) - 8} fontSize="11" fill="#f59e0b">θa = {theta.toFixed(1)}°</text>
            <text x={x0 - 240} y={cy - coneLen * Math.sin(t * 1.35) - 6} fontSize="10" fill="#ef4444">{lang === "fa" ? "خارج از مخروط: تلف می‌شود" : "outside cone: lost"}</text>
            <text x={x0 + 10} y={cy - coreH * 2.2 - 6} fontSize="11" fill="currentColor" opacity=".7">n₂ cladding</text><text x={x0 + 10} y={cy + 4} fontSize="11" fill="#fff">n₁ core</text>
          </svg>
          <div className="mt-3"><Compare rows={[{ label: "NA", theory: NA, measured: measNA, digits: 4 }, { label: "θa (°)", theory: theta, measured: P.acceptanceAngle(measNA) }]} /></div>
        </Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="NA vs n₁"><XYChart data={curve} series={[{ key: "NA", name: "NA" }]} xLabel="n₁" yLabel="NA" height={200} brush={false} refX={[{ x: +n1.toFixed(4), label: "n₁" }]} /></Panel>
          <Panel title={lang === "fa" ? "ساختار سه‌بعدی فیبر" : "3D fiber structure"}><Fiber3D coreUm={a * 2} t={sim.t} height={200} /></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Experiment 3: Single mode vs Multimode ============
function ModesSim({ model, noise, record, level }: SimProps) {
  const { lang } = useStore();
  const [lam, setLam] = useState(1310), [a, setA] = useState(4.1), [NA, setNA] = useState(0.12), [profile, setProfile] = useState<"step" | "graded">("step");
  const V = P.vNumber(a, lam, NA), modes = P.guidedLP(V), M = P.numModes(V, profile), lc = P.cutoffWavelength(a, NA), MFD = P.mfd(a, V);
  const single = V < 2.405;
  const measV = useMemo(() => noisy(V, 0.02, model, noise.meas), [V, model, noise]);
  const curve = useMemo(() => P.linspace(600, 1700, 120).map((l) => ({ x: Math.round(l), V: +P.vNumber(a, l, NA).toFixed(3) })), [a, NA]);
  const field = useMemo(() => { const { u, w } = P.lp01Params(Math.max(0.8, V)); const J0a = P.besselJ0(u); return P.linspace(-3 * a, 3 * a, 121).map((r) => { const rr = Math.abs(r); const val = rr <= a ? P.besselJ0((u * rr) / a) : J0a * Math.exp(-(w * (rr - a)) / a); const n = rr <= a ? (profile === "step" ? 1.46 : 1.46 - 0.01 * (rr / a) ** 2) : 1.45; return { x: +r.toFixed(2), I: +(val * val).toFixed(4), n: +n.toFixed(4) }; }); }, [a, V, profile]);
  const explain = useExplain({ λ: lam, a, NA }, {
    λ: B("V ∝ 1/λ: longer wavelengths reduce V. Below the cutoff wavelength λc the fiber supports more than LP01.", "V ∝ 1/λ: طول موج بلندتر V را کم می‌کند. زیر طول موج قطع λc، فیبر بیش از LP01 را هدایت می‌کند."),
    a: B("V ∝ a: a larger core admits more LP modes (M ≈ V²/2 for step index). Single-mode requires V < 2.405.", "V ∝ a: هسته بزرگ‌تر مودهای LP بیشتری را می‌پذیرد (M ≈ V²/2 برای پله‌ای). تک‌مود نیازمند V < 2.405 است."),
    NA: B("V ∝ NA: higher NA confines light better but pushes the fiber toward multimode operation.", "V ∝ NA: عدد NA بالاتر نور را بهتر محدود می‌کند اما فیبر را به سمت چندمودی می‌برد."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label="λ" value={lam} min={600} max={1700} step={5} unit="nm" onChange={setLam} />
        <Slider label={lang === "fa" ? "شعاع هسته a" : "Core radius a"} value={a} min={1} max={31.25} step={0.1} unit="µm" onChange={setA} />
        <Slider label="NA" value={NA} min={0.05} max={0.35} step={0.005} onChange={setNA} fmt={(v) => v.toFixed(3)} />
        <Segmented value={profile} onChange={setProfile} options={[{ value: "step", label: "Step index" }, { value: "graded", label: "Graded index" }]} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="V-number" value={fmt(V, 3)} tone={single ? "good" : "warn"} sub={single ? "V < 2.405" : "V ≥ 2.405"} />
          <Stat label={lang === "fa" ? "تعداد مود" : "# modes"} value={M} sub={profile === "step" ? "≈ V²/2" : "≈ V²/4"} />
          <Stat label="λc (cutoff)" value={fmt(lc, 0)} unit="nm" />
          <Stat label="MFD (Marcuse)" value={fmt(MFD, 2)} unit="µm" sub={V < 0.8 || V > 2.5 ? (lang === "fa" ? "خارج از بازه اعتبار" : "outside validity") : ""} />
        </div>
        <RecordBar onRecord={() => record({ lambda_nm: lam, a_um: a, NA, profile }, { theory: +V.toFixed(4), measured: +measV.toFixed(4), modes: M, lp_modes: modes.length, cutoff_nm: +lc.toFixed(1), mfd_um: +MFD.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "وضعیت مود" : "Mode status"} right={<Badge tone={single ? "good" : "warn"}>{single ? "SINGLE MODE" : "MULTIMODE"}</Badge>}>
          <div className="flex flex-wrap gap-1.5 mb-3">{P.LP_MODES.slice(0, level >= 2 ? 17 : 8).map((m) => <span key={m.name} className={`px-2 py-1 rounded-lg text-[11px] num border ${m.cutoff < V ? "bg-brand-500/15 border-brand-500/40 text-brand-600 dark:text-brand-300 font-semibold" : "border-line muted opacity-60"}`}>{m.name} <span className="opacity-60">({m.cutoff})</span></span>)}</div>
          <XYChart data={curve} series={[{ key: "V", name: "V" }]} xLabel="λ (nm)" yLabel="V" height={200} refY={[{ y: 2.405, label: "single-mode cutoff" }]} refX={[{ x: lam, label: "λ" }, ...(lc > 600 && lc < 1700 ? [{ x: Math.round(lc), label: "λc", color: "#10b981" }] : [])]} brush={false} />
          <div className="mt-3"><Compare rows={[{ label: "V", theory: V, measured: measV }, { label: "λc (nm)", theory: lc, measured: P.cutoffWavelength(a, NA * (measV / V)), digits: 1 }]} /></div>
        </Panel>
        <div className="grid md:grid-cols-3 gap-4">
          <Panel title={lang === "fa" ? "پروفایل ضریب شکست" : "Refractive index profile"} className="md:col-span-1"><XYChart data={field} series={[{ key: "n", name: "n(r)", color: Palette[3] }]} xLabel="r (µm)" height={180} brush={false} yDomain={[1.445, 1.465]} /></Panel>
          <Panel title={lang === "fa" ? "توزیع میدان مود LP01" : "LP01 mode field distribution"} className="md:col-span-1"><XYChart data={field} series={[{ key: "I", name: "|E|²" }]} xLabel="r (µm)" height={180} brush={false} refX={[{ x: a, label: "a" }, { x: -a, label: "-a" }]} /></Panel>
          <Panel title="2D"><div className="flex justify-center"><ModeField V={V} aUm={a} profile={profile} w={MFD / 2} /></div></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Experiment 4: Attenuation ============
function AttenuationSim({ model, noise, record, sim }: SimProps) {
  const { lang } = useStore();
  const [L, setL] = useState(40), [alphaMan, setAlphaMan] = useState(0.2), [P0, setP0] = useState(0), [lam, setLam] = useState(1550), [auto, setAuto] = useState(true);
  const alpha = auto && model !== "ideal" ? P.attenuationSpectrum(lam, 0.5, model) : alphaMan;
  const Pend = P.powerAfter(P0, alpha, L);
  const measured = useMemo(() => noisyAdd(noisyAdd(Pend, 0.15, model, noise.meas), noise.laser && model === "experimental" ? 0.1 : 0, model, true) - (model !== "ideal" ? 0.3 : 0), [Pend, model, noise]);
  const curve = useMemo(() => P.linspace(0, L, 100).map((z) => { const p = P.powerAfter(P0, alpha, z); const me = model === "experimental" ? p + 0.1 * P.gauss() : p; return { x: +z.toFixed(2), dBm: +p.toFixed(3), mW: +P.dBm2mW(p).toFixed(5), meas: +me.toFixed(3) }; }), [L, alpha, P0, model]);
  const spectrum = useMemo(() => P.linspace(800, 1700, 180).map((l) => ({ x: Math.round(l), a: +P.attenuationSpectrum(l, 0.5, model === "ideal" ? "ideal" : "realistic").toFixed(4) })), [model]);
  const pos = (sim.t * 0.02 * L) % (L + 0.001);
  const explain = useExplain({ L, α: alphaMan, P0, λ: lam }, {
    L: B("Loss in dB grows linearly with length: Loss = α·L. In linear units power decays exponentially P(z)=P₀e^(−αz).", "تلفات بر حسب dB به‌صورت خطی با طول زیاد می‌شود: Loss = α·L. در مقیاس خطی توان به‌صورت نمایی افت می‌کند P(z)=P₀e^(−αz)."),
    α: B("The attenuation coefficient sums Rayleigh scattering (∝1/λ⁴), IR absorption, OH⁻ peaks and imperfections.", "ضریب تلفات مجموع پراکندگی رایلی (∝1/λ⁴)، جذب فروسرخ، قله‌های OH⁻ و نقص‌هاست."),
    P0: B("Input power shifts the dBm curve vertically; the slope (dB/km) is unchanged.", "توان ورودی منحنی dBm را عمودی جابه‌جا می‌کند؛ شیب (dB/km) تغییر نمی‌کند."),
    λ: B("Silica has minimum loss near 1550 nm (~0.2 dB/km); around 1383 nm the OH⁻ water peak raises loss; below 1000 nm Rayleigh scattering dominates.", "سیلیکا در حدود ۱۵۵۰ نانومتر کمترین تلفات (~۰٫۲ dB/km) را دارد؛ نزدیک ۱۳۸۳ nm قله آب OH⁻ تلفات را زیاد می‌کند؛ زیر ۱۰۰۰ nm پراکندگی رایلی غالب است."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label={lang === "fa" ? "طول فیبر L" : "Fiber length L"} value={L} min={1} max={150} step={1} unit="km" onChange={setL} />
        <Slider label="P₀" value={P0} min={-20} max={20} step={0.5} unit="dBm" onChange={setP0} />
        <Slider label="λ" value={lam} min={800} max={1700} step={5} unit="nm" onChange={setLam} />
        <Segmented value={auto ? "auto" : "manual"} onChange={(v) => setAuto(v === "auto")} options={[{ value: "auto", label: lang === "fa" ? "α از مدل طیفی" : "α from spectral model" }, { value: "manual", label: lang === "fa" ? "α دستی" : "manual α" }]} />
        {(!auto || model === "ideal") && <Slider label="α" value={alphaMan} min={0.05} max={5} step={0.01} unit="dB/km" onChange={setAlphaMan} />}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="α" value={fmt(alpha, 3)} unit="dB/km" tone="brand" />
          <Stat label={lang === "fa" ? "تلفات کل" : "Total loss"} value={fmt(alpha * L, 2)} unit="dB" />
          <Stat label="P(L)" value={fmt(Pend, 2)} unit="dBm" />
          <Stat label="P(L)" value={P.dBm2mW(Pend).toPrecision(3)} unit="mW" />
        </div>
        <RecordBar onRecord={() => record({ L_km: L, alpha_dBkm: +alpha.toFixed(4), P0_dBm: P0, lambda_nm: lam }, { theory: +Pend.toFixed(3), measured: +measured.toFixed(3), loss_dB: +(alpha * L).toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="Power vs Distance" right={<span className="num text-xs muted">{lang === "fa" ? "موقعیت پالس" : "pulse at"} {pos.toFixed(1)} km</span>}>
          <svg viewBox="0 0 520 40" className="w-full ltr mb-2"><rect x={10} y={14} width={500} height={12} rx={6} fill="#3b82f6" opacity=".25" /><rect x={10} y={14} width={500 * (pos / L)} height={12} rx={6} fill="#3b82f6" opacity=".5" /><circle cx={10 + 500 * (pos / L)} cy={20} r={7 * Math.pow(10, (P.powerAfter(P0, alpha, pos) - P0) / 20) + 2} fill="#fbbf24" className="pulse-glow" /><text x={10} y={10} fontSize="9" fill="currentColor" opacity=".7">Tx {P0} dBm</text><text x={470} y={10} fontSize="9" fill="currentColor" opacity=".7">Rx {Pend.toFixed(1)} dBm</text></svg>
          <XYChart data={curve} series={[{ key: "dBm", name: "P (dBm) theory" }, ...(model === "experimental" ? [{ key: "meas", name: "measured", color: "#f43f5e" }] : [])]} xLabel="z (km)" yLabel="dBm" height={220} refX={[{ x: +pos.toFixed(2), label: "pulse", color: "#fbbf24" }]} legend />
          <XYChart data={curve} series={[{ key: "mW", name: "P (mW) — exponential", color: Palette[2] }]} xLabel="z (km)" yLabel="mW" height={160} brush={false} />
          <div className="mt-3"><Compare rows={[{ label: "P(L) dBm", theory: Pend, measured, unit: "dBm" }, { label: "Loss (dB)", theory: alpha * L, measured: P0 - measured, unit: "dB" }]} /></div>
        </Panel>
        <Panel title={lang === "fa" ? "طیف تلفات سیلیکا α(λ)" : "Silica attenuation spectrum α(λ)"}><XYChart data={spectrum} series={[{ key: "a", name: "α (dB/km)", color: Palette[1] }]} xLabel="λ (nm)" yLabel="dB/km" height={200} refX={[{ x: lam, label: "λ" }, { x: 1383, label: "OH⁻", color: "#8b5cf6" }]} brush={false} yDomain={[0, 4]} /></Panel>
      </div>
    </div>
  );
}

// ============ Experiment 5: Bending loss ============
function BendingSim({ model, noise, record, sim }: SimProps) {
  const { lang } = useStore();
  const [R, setR] = useState(12), [turns, setTurns] = useState(5), [lam, setLam] = useState(1550), [a, setA] = useState(4.1), [dn, setDn] = useState(0.0050);
  const n1 = 1.4504;
  const n2 = n1 - dn;
  const perTurn = P.bendLossPerTurn(R, a, lam, n1, n2), total = perTurn * turns;
  const measured = useMemo(() => noisy(total, 0.08, model, noise.meas) + (model !== "ideal" ? 0.02 * turns : 0), [total, turns, model, noise]);
  const curve = useMemo(() => P.linspace(4, 40, 100).map((r) => ({ x: +r.toFixed(2), loss: +Math.min(60, P.bendLossPerTurn(r, a, lam, n1, n2) * turns).toFixed(4), l1310: +Math.min(60, P.bendLossPerTurn(r, a, 1310, n1, n2) * turns).toFixed(4), l1625: +Math.min(60, P.bendLossPerTurn(r, a, 1625, n1, n2) * turns).toFixed(4) })), [a, lam, n1, n2, turns]);
  const explain = useExplain({ R, N: turns, λ: lam, a, Δn: dn }, {
    R: B("Bend loss decreases exponentially with radius: α_bend ∝ R^(−1/2)·exp(−U·R). In the bend, the evanescent tail must travel faster than light in the cladding and radiates away.", "تلفات خمش با شعاع به‌صورت نمایی کم می‌شود: α_bend ∝ R^(−1/2)·exp(−U·R). در خم، دنباله میرا باید سریع‌تر از نور در روکش حرکت کند و تابش می‌کند."),
    N: B("Loss per turn is fixed by the physics; total loss scales linearly with the number of turns.", "تلفات هر دور توسط فیزیک تعیین می‌شود؛ تلفات کل با تعداد دورها خطی افزایش می‌یابد."),
    λ: B("Longer wavelengths are less confined (larger MFD, smaller w), so bending loss rises sharply — this is why 1625 nm is used to test bends.", "طول موج بلندتر کمتر محدود می‌شود (MFD بزرگ‌تر، w کوچک‌تر) و تلفات خمش به‌شدت زیاد می‌شود — به همین دلیل ۱۶۲۵ nm برای آزمون خمش استفاده می‌شود."),
    a: B("A larger core raises V and confinement, reducing bend sensitivity (as long as the fiber remains single-mode).", "هسته بزرگ‌تر V و محدودسازی را زیاد و حساسیت به خمش را کم می‌کند (تا زمانی که تک‌مود بماند)."),
    Δn: B("Higher index contrast (as in G.657 bend-insensitive fibers) confines the mode more strongly and lowers bend loss.", "اختلاف ضریب بیشتر (مانند فیبرهای G.657) مود را قوی‌تر محدود کرده و تلفات خمش را کم می‌کند."),
  });
  const V = P.vNumber(a, lam, P.numericalAperture(n1, n2));
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label={lang === "fa" ? "شعاع خمش R" : "Bend radius R"} value={R} min={4} max={40} step={0.25} unit="mm" onChange={setR} />
        <Slider label={lang === "fa" ? "تعداد دور" : "Turns N"} value={turns} min={1} max={20} step={1} onChange={setTurns} />
        <Slider label="λ" value={lam} min={1260} max={1650} step={5} unit="nm" onChange={setLam} />
        <Slider label="a" value={a} min={3} max={6} step={0.05} unit="µm" onChange={setA} />
        <Slider label="n₁ − n₂" value={dn} min={0.003} max={0.012} step={0.0001} onChange={setDn} fmt={(v) => v.toFixed(4)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label={lang === "fa" ? "تلفات هر دور" : "Loss / turn"} value={perTurn < 1e-3 ? perTurn.toExponential(2) : fmt(perTurn, 4)} unit="dB" />
          <Stat label={lang === "fa" ? "تلفات کل" : "Total"} value={fmt(Math.min(60, total), 3)} unit="dB" tone={total > 1 ? "bad" : total > 0.1 ? "warn" : "good"} />
          <Stat label="V" value={fmt(V, 3)} tone={V < 2.405 ? "good" : "warn"} />
          <Stat label="MFD" value={fmt(P.mfd(a, V), 2)} unit="µm" />
        </div>
        <RecordBar onRecord={() => record({ R_mm: R, turns, lambda_nm: lam, a_um: a, dn }, { theory: +total.toFixed(5), measured: +measured.toFixed(5), per_turn_dB: +perTurn.toFixed(6) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="Loss vs Bend Radius"><XYChart data={curve} series={[{ key: "loss", name: `${lam} nm` }, { key: "l1310", name: "1310 nm", color: Palette[2], dash: true }, { key: "l1625", name: "1625 nm", color: Palette[1], dash: true }]} xLabel="R (mm)" yLabel="dB" height={240} logY yDomain={[1e-5, 60]} refX={[{ x: R, label: "R" }]} legend brush={false} />
          <div className="mt-3"><Compare rows={[{ label: lang === "fa" ? "تلفات کل (dB)" : "Total loss (dB)", theory: total, measured, digits: 4 }]} /></div></Panel>
        <Panel title={lang === "fa" ? "فیبر خم‌شده" : "Bent fiber"}><Fiber3D bend={Math.min(1.2, 12 / R)} t={sim.t} height={200} /></Panel>
      </div>
    </div>
  );
}

// ============ Experiment 6: Chromatic dispersion ============
function ChromDispSim({ model, noise, record, sim }: SimProps) {
  const { lang } = useStore();
  const [lam, setLam] = useState(1550), [L, setL] = useState(50), [dl, setDl] = useState(0.1), [T0, setT0] = useState(100), [ftype, setF] = useState<"smf" | "dsf" | "nzdsf" | "dcf">("smf"), [manualD, setManualD] = useState(17), [useManual, setUseManual] = useState(false);
  const D = useManual ? manualD : P.fiberDispersion(ftype, lam);
  const dT = P.chromaticBroadening(D, L, dl), Tout = Math.sqrt(T0 * T0 + dT * dT);
  const measured = useMemo(() => noisy(Tout, 0.04, model, noise.meas), [Tout, model, noise]);
  const bitRateLimit = 1 / (4 * Tout * 1e-12) / 1e9; // Gb/s approx (Δt < T/4)
  const curve = useMemo(() => P.linspace(0, Math.max(L, 1), 80).map((z) => ({ x: +z.toFixed(2), dT: +P.chromaticBroadening(D, z, dl).toFixed(3), T: +Math.sqrt(T0 * T0 + P.chromaticBroadening(D, z, dl) ** 2).toFixed(3) })), [D, L, dl, T0]);
  const Dcurve = useMemo(() => P.linspace(1250, 1650, 100).map((l) => ({ x: Math.round(l), smf: +P.fiberDispersion("smf", l).toFixed(3), dsf: +P.fiberDispersion("dsf", l).toFixed(3), nzdsf: +P.fiberDispersion("nzdsf", l).toFixed(3) })), []);
  const zNow = ((sim.t * 0.02) % 1) * L;
  const pulse = useMemo(() => { const Tz = Math.sqrt(T0 * T0 + P.chromaticBroadening(D, zNow, dl) ** 2); return P.linspace(-4 * Tout, 4 * Tout, 160).map((t) => ({ x: +t.toFixed(1), in: +Math.exp(-(t * t) / (2 * (T0 / 2.355) ** 2)).toFixed(4), out: +((T0 / Tz) * Math.exp(-(t * t) / (2 * (Tz / 2.355) ** 2))).toFixed(4) })); }, [T0, D, zNow, dl, Tout]);
  const explain = useExplain({ λ: lam, L, Δλ: dl, T0, D: manualD }, {
    λ: B("D(λ) = (S₀/4)(λ − λ₀⁴/λ³). For G.652 fiber the zero-dispersion wavelength is ~1310 nm; at 1550 nm D ≈ +17 ps/(nm·km) (anomalous).", "D(λ) = (S₀/4)(λ − λ₀⁴/λ³). برای فیبر G.652 طول موج پاشندگی صفر ~۱۳۱۰ nm است؛ در ۱۵۵۰ nm مقدار D ≈ +17 ps/(nm·km) (پاشندگی نابهنجار)."),
    L: B("Broadening Δτ = |D|·L·Δλ accumulates linearly with distance.", "پهن‌شدگی Δτ = |D|·L·Δλ به‌صورت خطی با فاصله انباشته می‌شود."),
    Δλ: B("A wider source spectrum (LED ≫ FP ≫ DFB) means more wavelengths with different group velocities → more broadening.", "طیف پهن‌تر منبع (LED ≫ FP ≫ DFB) یعنی طول موج‌های بیشتر با سرعت گروه متفاوت → پهن‌شدگی بیشتر."),
    T0: B("Output width is the RMS combination: T_out = √(T₀² + Δτ²). Short pulses are affected relatively more.", "پهنای خروجی ترکیب RMS است: T_out = √(T₀² + Δτ²). پالس‌های کوتاه نسبتاً بیشتر متأثر می‌شوند."),
    D: B("The sign of D decides whether red or blue travels faster; magnitude sets the amount of broadening. DCF has large negative D to compensate.", "علامت D تعیین می‌کند قرمز یا آبی سریع‌تر برود؛ اندازه آن مقدار پهن‌شدگی را تعیین می‌کند. DCF دارای D منفی بزرگ برای جبران است."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Select label={lang === "fa" ? "نوع فیبر" : "Fiber type"} value={ftype} onChange={setF} options={[{ value: "smf", label: "G.652 SMF" }, { value: "dsf", label: "G.653 DSF" }, { value: "nzdsf", label: "G.655 NZ-DSF" }, { value: "dcf", label: "DCF" }]} />
        <Slider label="λ" value={lam} min={1250} max={1650} step={1} unit="nm" onChange={setLam} />
        <Slider label="L" value={L} min={1} max={200} step={1} unit="km" onChange={setL} />
        <Slider label={lang === "fa" ? "پهنای طیفی Δλ" : "Spectral width Δλ"} value={dl} min={0.001} max={50} step={0.001} unit="nm" onChange={setDl} fmt={(v) => v < 1 ? v.toFixed(3) : v.toFixed(1)} />
        <Slider label="T₀ (FWHM)" value={T0} min={1} max={2000} step={1} unit="ps" onChange={setT0} />
        <Segmented value={useManual ? "m" : "a"} onChange={(v) => setUseManual(v === "m")} options={[{ value: "a", label: "D(λ) auto" }, { value: "m", label: "D manual" }]} />
        {useManual && <Slider label="D" value={manualD} min={-100} max={30} step={0.1} unit="ps/(nm·km)" onChange={setManualD} />}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="D" value={fmt(D, 2)} unit="ps/(nm·km)" tone="brand" />
          <Stat label="Δτ" value={fmt(dT, 1)} unit="ps" />
          <Stat label="T_out" value={fmt(Tout, 1)} unit="ps" />
          <Stat label={lang === "fa" ? "حد نرخ بیت" : "Bit-rate limit"} value={fmt(bitRateLimit, 2)} unit="Gb/s" sub="B·Δτ < 1/4" />
          <Stat label="β₂" value={fmt(P.beta2FromD(D, lam), 2)} unit="ps²/km" />
          <Stat label="L_D" value={fmt((T0 / 1.665) ** 2 / Math.abs(P.beta2FromD(D, lam) || 1e-9), 1)} unit="km" />
        </div>
        <RecordBar onRecord={() => record({ lambda_nm: lam, L_km: L, dlambda_nm: dl, T0_ps: T0, D: +D.toFixed(3) }, { theory: +Tout.toFixed(3), measured: +measured.toFixed(3), broadening_ps: +dT.toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title="Pulse Broadening vs Distance"><XYChart data={curve} series={[{ key: "T", name: "T_out (ps)" }, { key: "dT", name: "Δτ (ps)", color: Palette[1], dash: true }]} xLabel="z (km)" yLabel="ps" height={220} refX={[{ x: +zNow.toFixed(2), label: "pulse" }]} legend brush={false} />
          <div className="mt-3"><Compare rows={[{ label: "T_out (ps)", theory: Tout, measured, digits: 2 }]} /></div></Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={`${lang === "fa" ? "شکل پالس در z =" : "Pulse shape at z ="} ${zNow.toFixed(1)} km`}><XYChart data={pulse} series={[{ key: "in", name: "input", dash: true }, { key: "out", name: "output", color: Palette[1] }]} xLabel="t (ps)" height={200} legend brush={false} /></Panel>
          <Panel title="D(λ)"><XYChart data={Dcurve} series={[{ key: "smf", name: "SMF" }, { key: "dsf", name: "DSF", color: Palette[2] }, { key: "nzdsf", name: "NZ-DSF", color: Palette[4] }]} xLabel="λ (nm)" yLabel="ps/(nm·km)" height={200} refX={[{ x: lam, label: "λ" }]} refY={[{ y: 0 }]} legend brush={false} /></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Experiment 7: Modal dispersion ============
function ModalDispSim({ model, noise, record, sim }: SimProps) {
  const { lang } = useStore();
  const [d, setD] = useState(50), [n1, setN1] = useState(1.48), [n2, setN2] = useState(1.46), [L, setL] = useState(2), [profile, setProfile] = useState<"step" | "graded">("step");
  const NA = P.numericalAperture(n1, n2), dt = P.modalDispersion(n1, n2, L, profile), bw = 0.44 / (dt * 1e-9) / 1e6; // MHz
  const V = P.vNumber(d / 2, 850, NA), M = P.numModes(V, profile);
  const measured = useMemo(() => noisy(dt, 0.06, model, noise.meas) * (model === "realistic" ? 0.85 : 1), [dt, model, noise]);
  const curve = useMemo(() => P.linspace(0.05, Math.max(L, 0.5), 60).map((z) => ({ x: +z.toFixed(2), step: +P.modalDispersion(n1, n2, z, "step").toFixed(5), graded: +P.modalDispersion(n1, n2, z, "graded").toFixed(6) })), [n1, n2, L]);
  const pulse = useMemo(() => { const T0 = 0.5; const Tz = Math.sqrt(T0 * T0 + dt * dt); return P.linspace(-3 * Math.max(Tz, 1), 3 * Math.max(Tz, 1), 150).map((t) => ({ x: +t.toFixed(2), in: +Math.exp(-(t * t) / (2 * (T0 / 2.355) ** 2)).toFixed(4), out: +((T0 / Tz) * Math.exp(-(t * t) / (2 * (Tz / 2.355) ** 2))).toFixed(4) })); }, [dt]);
  const explain = useExplain({ d, n1, n2, L }, {
    d: B("Core diameter changes the number of modes (V²/2) but the step-index delay spread Δt = L·n₁·Δ/c does not depend on d in the ray model.", "قطر هسته تعداد مودها (V²/2) را تغییر می‌دهد، اما در مدل پرتویی پراکندگی تأخیر پله‌ای Δt = L·n₁·Δ/c به d وابسته نیست."),
    n1: B("Δ = (n₁−n₂)/n₁ sets the path-length difference between the axial ray and the steepest guided ray.", "Δ = (n₁−n₂)/n₁ اختلاف طول مسیر بین پرتو محوری و تندترین پرتو هدایت‌شده را تعیین می‌کند."),
    n2: B("Reducing n₂ increases Δ and NA, so the extreme ray travels a much longer zigzag path → larger spread.", "کاهش n₂ مقدار Δ و NA را زیاد می‌کند، بنابراین پرتو حدی مسیر زیگزاگ بلندتری طی می‌کند → پراکندگی بزرگ‌تر."),
    L: B("Modal delay spread is linear in L; therefore the bandwidth-distance product (MHz·km) is the fiber's figure of merit.", "پراکندگی تأخیر مودی با L خطی است؛ بنابراین حاصل‌ضرب پهنای باند-فاصله (MHz·km) شاخص کیفیت فیبر است."),
  });
  const W = 520, Hh = 150, ch = 70, cy = Hh / 2;
  const rays = [0, 0.4, 0.8, 1].map((k) => { const thc = P.snell(n1, n2, 0).thetaC; const ang = P.rad(90 - thc) * k; return ang; });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پنل پارامترها" : "Parameter Panel"} className="space-y-4">
        <Slider label={lang === "fa" ? "قطر هسته" : "Core diameter"} value={d} min={10} max={100} step={0.5} unit="µm" onChange={setD} />
        <Slider label="n₁" value={n1} min={1.45} max={1.55} step={0.001} onChange={setN1} fmt={(v) => v.toFixed(3)} />
        <Slider label="n₂" value={n2} min={1.40} max={1.50} step={0.001} onChange={setN2} fmt={(v) => v.toFixed(3)} />
        <Slider label="L" value={L} min={0.1} max={10} step={0.1} unit="km" onChange={setL} />
        <Segmented value={profile} onChange={setProfile} options={[{ value: "step", label: "Step index" }, { value: "graded", label: "Graded (parabolic)" }]} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="NA" value={fmt(NA, 3)} /><Stat label="Δ" value={fmt(((n1 - n2) / n1) * 100, 3)} unit="%" />
          <Stat label="Δt" value={dt < 0.01 ? (dt * 1000).toFixed(2) + " ps" : fmt(dt, 3) + " ns"} tone="brand" />
          <Stat label={lang === "fa" ? "پهنای باند" : "Bandwidth"} value={bw > 1000 ? fmt(bw / 1000, 2) : fmt(bw, 1)} unit={bw > 1000 ? "GHz" : "MHz"} />
          <Stat label="B·L" value={fmt((bw * L) / (bw > 1000 ? 1 : 1), 0)} unit="MHz·km" /><Stat label={`M (850 nm)`} value={M} sub={`V=${V.toFixed(1)}`} />
        </div>
        <RecordBar onRecord={() => record({ d_um: d, n1, n2, L_km: L, profile }, { theory: +dt.toFixed(5), measured: +measured.toFixed(5), bw_MHz: +bw.toFixed(2) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "مسیر پرتوها در فیبر چندمودی" : "Ray paths in multimode fiber"}>
          <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full ltr">
            <rect x={0} y={cy - ch} width={W} height={2 * ch} fill="#94a3b8" opacity=".2" /><rect x={0} y={cy - ch / 2} width={W} height={ch} fill="#3b82f6" opacity=".35" />
            {rays.map((ang, i) => { if (ang < 0.01) return <line key={i} x1={0} y1={cy} x2={W} y2={cy} stroke={Palette[i]} strokeWidth="2" className="flow" />; if (profile === "graded") { const amp = (ch / 2) * (ang / rays[3]); const per = 160 / (ang / rays[3]) + 40; const pts = P.linspace(0, W, 120).map((x) => `${x},${cy - amp * Math.sin((2 * Math.PI * x) / per)}`).join(" "); return <polyline key={i} points={pts} fill="none" stroke={Palette[i]} strokeWidth="2" className="flow" />; } const dx = (ch / 2) / Math.tan(ang); const pts: string[] = [`0,${cy}`]; let x = dx / 2, up = true; pts.push(`${x},${cy - ch / 2}`); while (x < W) { x += dx; up = !up; pts.push(`${x},${up ? cy - ch / 2 : cy + ch / 2}`); } return <polyline key={i} points={pts.join(" ")} fill="none" stroke={Palette[i]} strokeWidth="2" className="flow" />; })}
            <circle cx={(sim.t * 6) % W} cy={cy} r={4} fill="#fbbf24" />
          </svg>
        </Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="Pulse spreading vs distance"><XYChart data={curve} series={[{ key: "step", name: "step (ns)" }, { key: "graded", name: "graded (ns)", color: Palette[2] }]} xLabel="L (km)" yLabel="ns" height={200} legend brush={false} logY yDomain={["auto", "auto"]} /></Panel>
          <Panel title={lang === "fa" ? "پالس ورودی/خروجی" : "Input/Output pulse"}><XYChart data={pulse} series={[{ key: "in", name: "in", dash: true }, { key: "out", name: "out", color: Palette[1] }]} xLabel="t (ns)" height={200} legend brush={false} /></Panel>
        </div>
        <Panel title={lang === "fa" ? "نظریه در برابر اندازه‌گیری" : "Theory vs measurement"}><Compare rows={[{ label: "Δt (ns)", theory: dt, measured, digits: 4 }]} /></Panel>
      </div>
    </div>
  );
}

export const basicExperiments: ExperimentDef[] = [
  {
    id: "snell", num: 1, category: "basic", level: 1, title: B("Snell's Law & Total Internal Reflection", "قانون اسنل و بازتاب کلی داخلی"), short: B("Vary n₁, n₂ and the incidence angle; watch the ray refract or totally reflect and measure the critical angle.", "n₁ و n₂ و زاویه تابش را تغییر دهید؛ شکست یا بازتاب کلی پرتو را ببینید و زاویه بحرانی را اندازه بگیرید."),
    objective: B("Understand how light is guided in a fiber core by total internal reflection and determine the critical angle experimentally.", "درک چگونگی هدایت نور در هسته فیبر توسط بازتاب کلی داخلی و تعیین تجربی زاویه بحرانی."),
    prerequisites: [B("Refractive index and speed of light in media", "ضریب شکست و سرعت نور در محیط"), B("Basic trigonometry", "مثلثات پایه")],
    equipment: [B("He-Ne laser / laser pointer", "لیزر He-Ne"), B("Semicircular glass block or prism", "بلوک نیم‌دایره شیشه‌ای"), B("Rotary stage with angular scale", "پایه چرخان با درجه‌بندی زاویه"), B("Optical power meter", "توان‌سنج نوری")],
    theory: {
      basic: B("When light passes from a denser medium (n₁) to a rarer one (n₂ < n₁), it bends away from the normal. At the critical angle θc the refracted ray grazes the interface; beyond it, all light is reflected back — total internal reflection (TIR). This is exactly how the core of an optical fiber traps light.", "وقتی نور از محیط چگال‌تر (n₁) به محیط رقیق‌تر (n₂ < n₁) می‌رود، از خط عمود دور می‌شود. در زاویه بحرانی θc پرتو شکست‌یافته موازی سطح می‌شود؛ فراتر از آن، تمام نور بازتاب می‌شود — بازتاب کلی داخلی (TIR). هسته فیبر نوری دقیقاً به همین شکل نور را به دام می‌اندازد."),
      engineering: B("Fresnel equations give the reflectance for s and p polarizations; below θc some power is transmitted, and at θc reflectance jumps to unity. In fibers, the small index contrast (Δ≈0.3%) gives θc ≈ 85°, so only rays close to the axis are guided — the origin of the numerical aperture.", "معادلات فرنل بازتاب را برای قطبش‌های s و p می‌دهند؛ زیر θc بخشی از توان عبور می‌کند و در θc بازتاب به یک می‌رسد. در فیبرها اختلاف ضریب کوچک (Δ≈0.3٪) باعث θc ≈ 85° می‌شود، بنابراین فقط پرتوهای نزدیک محور هدایت می‌شوند — منشأ روزنه عددی."),
      advanced: B("Under TIR the transmitted field is evanescent: E ∝ exp(−γz) with γ = k₀√(n₁²sin²θ − n₂²). Its penetration depth 1/γ is a fraction of a wavelength and carries no time-averaged power normal to the interface, yet it enables frustrated TIR and directional couplers. The Goos–Hänchen shift accompanies the reflection.", "در TIR میدان عبوری میراست: E ∝ exp(−γz) با γ = k₀√(n₁²sin²θ − n₂²). عمق نفوذ 1/γ کسری از طول موج است و توان متوسط عمود بر سطح حمل نمی‌کند، اما امکان FTIR و کوپلرهای جهتی را فراهم می‌کند. جابه‌جایی Goos–Hänchen همراه بازتاب رخ می‌دهد."),
      research: B("The ray picture is the ω→∞ limit of Maxwell's equations. A rigorous treatment matches tangential E and H at the boundary yielding the Fresnel coefficients; complex angles describe evanescent waves. In waveguides the self-consistency (transverse resonance) condition on the round-trip phase — including the Fresnel phase shifts — quantizes the allowed angles, producing discrete modes.", "تصویر پرتویی حد ω→∞ معادلات ماکسول است. برخورد دقیق با تطبیق مؤلفه‌های مماسی E و H در مرز، ضرایب فرنل را می‌دهد؛ زوایای مختلط امواج میرا را توصیف می‌کنند. در موجبرها شرط خودسازگاری (تشدید عرضی) روی فاز رفت‌وبرگشت — شامل جابه‌جایی‌های فاز فرنل — زوایای مجاز را کوانتیزه کرده و مودهای گسسته ایجاد می‌کند."),
    },
    equations: [{ eq: "n₁ sin θ₁ = n₂ sin θ₂", desc: B("Snell's law: θ₁ incidence, θ₂ refraction", "قانون اسنل: θ₁ تابش، θ₂ شکست") }, { eq: "θc = asin(n₂ / n₁)", desc: B("Critical angle (requires n₁ > n₂)", "زاویه بحرانی (نیازمند n₁ > n₂)") }, { eq: "r_s = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂)", desc: B("Fresnel amplitude coefficient (s-pol); R = |r|²", "ضریب دامنه فرنل (قطبش s)؛ R = |r|²") }],
    procedure: [B("Set n₁ = 1.48 and n₂ = 1.46 (typical core/cladding).", "n₁ = 1.48 و n₂ = 1.46 را تنظیم کنید (هسته/روکش معمول)."), B("Sweep θ₁ from 0° upward and observe the refracted ray angle.", "θ₁ را از صفر افزایش دهید و زاویه پرتو شکست‌یافته را مشاهده کنید."), B("Find the angle where the refracted ray disappears; record it as measured θc.", "زاویه‌ای که پرتو شکست‌یافته ناپدید می‌شود را بیابید و به‌عنوان θc اندازه‌گیری‌شده ثبت کنید."), B("Repeat for at least three n₂ values and compare with asin(n₂/n₁).", "برای حداقل سه مقدار n₂ تکرار و با asin(n₂/n₁) مقایسه کنید."), B("Switch to the Experimental model and quantify the measurement uncertainty.", "به مدل تجربی بروید و عدم قطعیت اندازه‌گیری را کمی کنید.")],
    errors: [B("Angular reading resolution of the rotary stage (±0.5°).", "حد تفکیک خواندن زاویه (±0.5°)."), B("Beam divergence blurs the exact TIR onset.", "واگرایی باریکه، آغاز دقیق TIR را مبهم می‌کند."), ...commonErrors.slice(0, 1)],
    conclusion: B("TIR occurs for θ₁ > θc = asin(n₂/n₁); the smaller the index contrast, the closer θc is to 90°.", "TIR برای θ₁ > θc = asin(n₂/n₁) رخ می‌دهد؛ هرچه اختلاف ضریب کمتر باشد، θc به ۹۰° نزدیک‌تر است."),
    questions: [
      { q: B("For n₁ = 1.50 and n₂ = 1.00 (glass/air), what is θc in degrees?", "برای n₁ = 1.50 و n₂ = 1.00 (شیشه/هوا) θc چند درجه است؟"), type: "numeric", answer: 41.81, tolerance: 0.5, unit: "°", hints: [B("Use θc = asin(n₂/n₁).", "از θc = asin(n₂/n₁) استفاده کنید."), B("asin(1/1.5) = asin(0.667).", "asin(1/1.5) = asin(0.667).")], explanation: B("θc = asin(1.00/1.50) = asin(0.6667) ≈ 41.8°.", "θc = asin(1.00/1.50) = asin(0.6667) ≈ 41.8°."), deep: B("Above 41.8° the transmitted wavevector component k_z becomes imaginary — an evanescent wave with no net power flow across the interface.", "بالای ۴۱٫۸° مؤلفه k_z بردار موج عبوری موهومی می‌شود — موج میرا بدون شار توان خالص از مرز.") },
      { q: B("What happens to θc if n₂ increases toward n₁?", "اگر n₂ به n₁ نزدیک شود، θc چه می‌شود؟"), type: "mc", answer: 1, options: [B("It decreases toward 0°", "به سمت صفر کاهش می‌یابد"), B("It increases toward 90°", "به سمت ۹۰° افزایش می‌یابد"), B("It stays constant", "ثابت می‌ماند"), B("TIR becomes impossible for all angles", "TIR برای همه زوایا ناممکن می‌شود")], hints: [B("Think about asin(x) as x → 1.", "به asin(x) وقتی x → 1 فکر کنید."), B("asin(1) = 90°.", "asin(1) = 90°.")], explanation: B("As n₂/n₁ → 1, asin → 90°, so only grazing rays are totally reflected.", "با n₂/n₁ → 1 تابع asin → 90° می‌شود؛ فقط پرتوهای مماسی بازتاب کلی می‌شوند.") },
    ],
    assumptions: B("Plane-wave, lossless, isotropic, non-magnetic media; sharp planar interface; monochromatic light.", "موج تخت، محیط بدون تلفات، همسانگرد و غیرمغناطیسی؛ مرز صفحه‌ای تیز؛ نور تک‌رنگ."),
    Sim: SnellSim, dataKeys: { x: "n2", y: ["theory", "measured"] },
  },
  {
    id: "na", num: 2, category: "basic", level: 1, title: B("Numerical Aperture & Acceptance Cone", "روزنه عددی و مخروط پذیرش"), short: B("See how the index contrast defines the light-gathering cone of the fiber.", "ببینید اختلاف ضریب شکست چگونه مخروط جمع‌آوری نور فیبر را تعیین می‌کند."),
    objective: B("Determine NA and acceptance angle from n₁ and n₂, visualize the acceptance cone and relate it to launch efficiency.", "تعیین NA و زاویه پذیرش از n₁ و n₂، مشاهده مخروط پذیرش و ارتباط آن با بازده تزریق نور."),
    prerequisites: [B("Snell's law and TIR", "قانون اسنل و TIR"), B("Fiber geometry: core, cladding, coating", "هندسه فیبر: هسته، روکش، پوشش")],
    equipment: [B("Laser source on a rotary mount", "منبع لیزر روی پایه چرخان"), B("Multimode fiber patch cord", "پچ‌کورد فیبر چندمود"), B("Optical power meter", "توان‌سنج نوری"), B("Screen for far-field cone", "پرده برای مخروط میدان دور")],
    theory: {
      basic: B("Only rays entering within a cone of half-angle θa can satisfy TIR at the core–cladding boundary. NA = sin θa = √(n₁² − n₂²) is a single number describing how much light the fiber accepts.", "فقط پرتوهایی که درون مخروطی با نیم‌زاویه θa وارد شوند می‌توانند شرط TIR را در مرز هسته–روکش برآورده کنند. NA = sin θa = √(n₁² − n₂²) عددی است که میزان پذیرش نور توسط فیبر را توصیف می‌کند."),
      engineering: B("Coupling efficiency from an LED (Lambertian) scales as NA²; from a laser it depends on the beam divergence vs θa. Larger NA improves coupling but increases modal dispersion and bend sensitivity trade-offs. NA ≈ n₁√(2Δ) for weakly guiding fibers.", "بازده کوپلینگ از LED (لامبرتی) با NA² مقیاس می‌شود؛ از لیزر به واگرایی باریکه نسبت به θa بستگی دارد. NA بزرگ‌تر کوپلینگ را بهتر می‌کند اما پاشندگی مودی را زیاد می‌کند. برای فیبرهای با هدایت ضعیف NA ≈ n₁√(2Δ)."),
      advanced: B("For graded-index fibers the local NA varies with radius: NA(r) = √(n²(r) − n₂²), largest on axis. The measured far-field NA (at 5% intensity) differs slightly from the theoretical value because of leaky modes and finite length.", "در فیبرهای شیب‌ضریب NA محلی با شعاع تغییر می‌کند: NA(r) = √(n²(r) − n₂²) و روی محور بیشینه است. NA میدان دور اندازه‌گیری‌شده (در ۵٪ شدت) به دلیل مودهای نشتی و طول محدود کمی با مقدار نظری تفاوت دارد."),
      research: B("Rigorously, NA is tied to the V-parameter and to the étendue (phase-space volume) the waveguide supports: number of guided modes ≈ (πa·NA/λ)²·2. Étendue conservation limits coupling between sources and fibers irrespective of optics used.", "به‌طور دقیق، NA به پارامتر V و به étendue (حجم فضای فاز) پشتیبانی‌شده توسط موجبر مرتبط است: تعداد مودهای هدایت‌شده ≈ 2·(πa·NA/λ)². پایستگی étendue کوپلینگ بین منابع و فیبرها را مستقل از اپتیک به‌کاررفته محدود می‌کند."),
    },
    equations: [{ eq: "NA = √(n₁² − n₂²) ≈ n₁√(2Δ)", desc: B("Numerical aperture", "روزنه عددی") }, { eq: "θa = asin(NA / n₀)", desc: B("Acceptance half-angle (n₀ = 1 in air)", "نیم‌زاویه پذیرش (n₀ = 1 در هوا)") }, { eq: "Δ = (n₁² − n₂²)/(2n₁²)", desc: B("Relative index difference", "اختلاف ضریب نسبی") }],
    procedure: [B("Set n₁ = 1.48, n₂ = 1.46; read NA and θa.", "n₁ = 1.48 و n₂ = 1.46 را تنظیم کرده و NA و θa را بخوانید."), B("Vary n₂ in 0.005 steps and record NA each time.", "n₂ را با گام ۰٫۰۰۵ تغییر داده و هر بار NA را ثبت کنید."), B("Change the core radius and confirm NA is unchanged.", "شعاع هسته را تغییر دهید و تأیید کنید NA تغییر نمی‌کند."), B("Plot NA vs n₁ from the data table and compare with theory.", "از جدول داده NA بر حسب n₁ را رسم و با نظریه مقایسه کنید.")],
    errors: [B("Far-field cone edge definition (5% vs 1/e²).", "تعریف لبه مخروط میدان دور (۵٪ در برابر 1/e²)."), ...commonErrors.slice(0, 2)],
    conclusion: B("NA depends only on the index contrast; typical SMF NA ≈ 0.12–0.14 and MMF ≈ 0.2–0.275.", "NA فقط به اختلاف ضریب بستگی دارد؛ NA معمول SMF حدود ۰٫۱۲–۰٫۱۴ و MMF حدود ۰٫۲–۰٫۲۷۵ است."),
    questions: [
      { q: B("n₁ = 1.48, n₂ = 1.46 → NA = ?", "n₁ = 1.48 و n₂ = 1.46 ← NA = ?"), type: "numeric", answer: 0.2425, tolerance: 0.005, hints: [B("Square both indices and subtract.", "هر دو ضریب را مربع کرده و تفریق کنید."), B("1.48² − 1.46² = 0.0588; take the square root.", "1.48² − 1.46² = 0.0588؛ جذر بگیرید.")], explanation: B("NA = √(2.1904 − 2.1316) = √0.0588 ≈ 0.2425.", "NA = √(2.1904 − 2.1316) = √0.0588 ≈ 0.2425.") },
      { q: B("Doubling the core radius does what to NA?", "دو برابر کردن شعاع هسته چه اثری بر NA دارد؟"), type: "mc", answer: 2, options: [B("Doubles it", "دو برابر می‌شود"), B("Halves it", "نصف می‌شود"), B("No change", "بدون تغییر"), B("Quadruples it", "چهار برابر می‌شود")], hints: [B("Look at the NA formula — does a appear?", "به فرمول NA نگاه کنید — آیا a در آن هست؟"), B("NA depends only on n₁ and n₂.", "NA فقط به n₁ و n₂ بستگی دارد.")], explanation: B("NA = √(n₁²−n₂²) has no dependence on core radius; radius affects V-number instead.", "NA = √(n₁²−n₂²) به شعاع هسته وابسته نیست؛ شعاع بر عدد V اثر می‌گذارد.") },
    ],
    Sim: NASim, dataKeys: { x: "n2", y: ["theory", "measured"] },
  },
  {
    id: "modes", num: 3, category: "basic", level: 1, title: B("Single Mode vs Multimode — V-number & LP Modes", "تک‌مود در برابر چندمود — عدد V و مودهای LP"), short: B("Tune wavelength, core radius and NA to cross the single-mode cutoff and count LP modes.", "طول موج، شعاع هسته و NA را تنظیم کنید تا از قطع تک‌مودی عبور کرده و مودهای LP را بشمارید."),
    objective: B("Compute V, determine single/multimode operation, list guided LP modes, and estimate cutoff wavelength and mode-field diameter.", "محاسبه V، تعیین عملکرد تک/چندمودی، فهرست مودهای LP هدایت‌شده و تخمین طول موج قطع و قطر میدان مود."),
    prerequisites: [B("NA and index profile", "NA و پروفایل ضریب"), B("Concept of a waveguide mode", "مفهوم مود موجبر")],
    equipment: [B("Tunable laser (600–1700 nm)", "لیزر قابل تنظیم"), B("SMF-28 and 50/125 MMF samples", "نمونه‌های SMF-28 و MMF 50/125"), B("Near-field imaging camera", "دوربین تصویربرداری میدان نزدیک"), B("Cutoff-wavelength test setup (bend-reference)", "چیدمان آزمون طول موج قطع")],
    theory: {
      basic: B("A fiber supports a discrete set of light patterns called modes. The normalized frequency V = 2πa·NA/λ tells how many modes fit: when V < 2.405 only the fundamental LP01 mode propagates (single-mode). Bigger cores, higher NA or shorter wavelengths increase V.", "فیبر مجموعه‌ای گسسته از الگوهای نوری به نام مود را هدایت می‌کند. فرکانس نرمالیزه V = 2πa·NA/λ می‌گوید چند مود جا می‌شود: وقتی V < 2.405 فقط مود بنیادی LP01 منتشر می‌شود (تک‌مود). هسته بزرگ‌تر، NA بالاتر یا طول موج کوتاه‌تر V را زیاد می‌کند."),
      engineering: B("The number of modes ≈ V²/2 (step) or V²/4 (parabolic). Cutoff wavelength λc = 2πa·NA/2.405 must be below the operating window (e.g. λc ≈ 1260 nm for G.652). Mode-field diameter (Marcuse: w/a = 0.65 + 1.619V^−1.5 + 2.879V^−6) governs splice loss and bending sensitivity.", "تعداد مودها ≈ V²/2 (پله‌ای) یا V²/4 (سهموی). طول موج قطع λc = 2πa·NA/2.405 باید زیر پنجره کاری باشد (مثلاً λc ≈ 1260 nm برای G.652). قطر میدان مود (مارکوز: w/a = 0.65 + 1.619V^−1.5 + 2.879V^−6) تلفات اسپلایس و حساسیت به خمش را تعیین می‌کند."),
      advanced: B("Under the weakly-guiding approximation the scalar wave equation yields LP_lm modes: J_l(ur/a) in the core and K_l(wr/a) in the cladding, with u² + w² = V². The eigenvalue equation u·J_{l−1}(u)/J_l(u) = −w·K_{l−1}(w)/K_l(w) gives the propagation constant β and normalized b = w²/V². LP11 cuts off at the first zero of J₀ (2.405).", "در تقریب هدایت ضعیف، معادله موج اسکالر مودهای LP_lm را می‌دهد: J_l(ur/a) در هسته و K_l(wr/a) در روکش با u² + w² = V². معادله ویژه‌مقدار u·J_{l−1}(u)/J_l(u) = −w·K_{l−1}(w)/K_l(w) ثابت انتشار β و b = w²/V² نرمالیزه را می‌دهد. LP11 در اولین صفر J₀ (۲٫۴۰۵) قطع می‌شود."),
      research: B("Full-vector analysis (HE, EH, TE, TM) splits each LP group by small amounts ∝ Δ; LP11 comprises TE01, TM01 and HE21. Numerical mode solvers (finite-difference / finite-element) are required for arbitrary profiles and photonic-crystal fibers, where an effective cladding index n_FSM replaces n₂. Group index and waveguide dispersion follow from d(Vb)/dV and V·d²(Vb)/dV².", "تحلیل تمام‌برداری (HE, EH, TE, TM) هر گروه LP را با مقادیر کوچک ∝ Δ می‌شکافد؛ LP11 شامل TE01, TM01 و HE21 است. حل‌گرهای عددی مود (تفاضل/اجزای محدود) برای پروفایل‌های دلخواه و فیبرهای بلور فوتونی لازم‌اند، جایی که ضریب مؤثر روکش n_FSM جایگزین n₂ می‌شود. ضریب گروه و پاشندگی موجبری از d(Vb)/dV و V·d²(Vb)/dV² به‌دست می‌آیند."),
    },
    equations: [{ eq: "V = (2π a / λ) · NA", desc: B("Normalized frequency; a core radius", "فرکانس نرمالیزه؛ a شعاع هسته") }, { eq: "V < 2.405  ⇒ single mode", desc: B("Single-mode condition (first zero of J₀)", "شرط تک‌مودی (اولین صفر J₀)") }, { eq: "M ≈ V²/2 (step), V²/4 (graded)", desc: B("Approximate number of modes", "تعداد تقریبی مودها") }, { eq: "λc = 2π a NA / 2.405", desc: B("Cutoff wavelength", "طول موج قطع") }, { eq: "2w = 2a(0.65 + 1.619V⁻¹·⁵ + 2.879V⁻⁶)", desc: B("Mode-field diameter (Marcuse)", "قطر میدان مود (مارکوز)") }],
    procedure: [B("Start with SMF-28: a = 4.1 µm, NA = 0.12, λ = 1310 nm. Verify V < 2.405.", "با SMF-28 شروع کنید: a = 4.1 µm، NA = 0.12، λ = 1310 nm. تأیید کنید V < 2.405."), B("Decrease λ until LP11 appears; record λc.", "λ را کم کنید تا LP11 ظاهر شود؛ λc را ثبت کنید."), B("Switch to a = 25 µm, NA = 0.2 (MMF 50/125) at 850 nm and count modes.", "به a = 25 µm و NA = 0.2 (MMF 50/125) در ۸۵۰ nm بروید و مودها را بشمارید."), B("Plot V vs λ and compare with the cutoff line.", "V بر حسب λ را رسم و با خط قطع مقایسه کنید.")],
    errors: [B("Marcuse MFD formula valid only for 0.8 < V < 2.5.", "فرمول MFD مارکوز فقط برای 0.8 < V < 2.5 معتبر است."), B("Effective cutoff in cabled fiber is lower than theoretical (bend-induced leakage).", "قطع مؤثر در فیبر کابل‌شده کمتر از مقدار نظری است (نشت ناشی از خم)."), ...commonErrors.slice(3)],
    conclusion: B("Single-mode operation requires V < 2.405 — achieved with small cores (~8–9 µm) and low NA at telecom wavelengths.", "عملکرد تک‌مودی نیازمند V < 2.405 است — با هسته‌های کوچک (~۸–۹ µm) و NA کم در طول موج‌های مخابراتی."),
    questions: [
      { q: B("a = 4.1 µm, NA = 0.12, λ = 1550 nm → V = ?", "a = 4.1 µm، NA = 0.12، λ = 1550 nm ← V = ?"), type: "numeric", answer: 1.995, tolerance: 0.05, hints: [B("Convert a to nm: 4100 nm.", "a را به نانومتر تبدیل کنید: 4100 nm."), B("V = 2π·4100·0.12/1550.", "V = 2π·4100·0.12/1550.")], explanation: B("V = 2π × 4100 × 0.12 / 1550 ≈ 1.99 → single mode.", "V = 2π × 4100 × 0.12 / 1550 ≈ 1.99 ← تک‌مود.") },
      { q: B("Which LP mode is the first higher-order mode to appear above V = 2.405?", "اولین مود مرتبه بالاتر که بالای V = 2.405 ظاهر می‌شود کدام است؟"), type: "mc", answer: 0, options: [B("LP11", "LP11"), B("LP02", "LP02"), B("LP21", "LP21"), B("LP31", "LP31")], hints: [B("Its cutoff is the first zero of J₀.", "قطع آن اولین صفر J₀ است."), B("LP21 and LP02 share cutoff 3.832.", "LP21 و LP02 قطع مشترک ۳٫۸۳۲ دارند.")], explanation: B("LP11 has cutoff V = 2.405; LP21/LP02 follow at 3.832.", "LP11 دارای قطع V = 2.405 است؛ LP21/LP02 در ۳٫۸۳۲ می‌آیند.") },
    ],
    numerics: B("The 2D field is computed from the LP01 Bessel solution J₀(ur/a) inside and J₀(u)·exp(−w(r−a)/a) outside, with (u, w) from the Rudolph–Neumann fit w ≈ 1.1428V − 0.996.", "میدان دوبعدی از جواب بسل LP01 با J₀(ur/a) در داخل و J₀(u)·exp(−w(r−a)/a) در خارج محاسبه می‌شود؛ (u, w) از برازش Rudolph–Neumann با w ≈ 1.1428V − 0.996."),
    Sim: ModesSim, dataKeys: { x: "lambda_nm", y: ["theory", "modes"] },
  },
  {
    id: "attenuation", num: 4, category: "basic", level: 1, title: B("Attenuation — Power vs Distance", "تضعیف — توان بر حسب فاصله"), short: B("Watch optical power decay exponentially along the fiber and read the loss in dB.", "کاهش نمایی توان نوری در طول فیبر را ببینید و تلفات را بر حسب dB بخوانید."),
    objective: B("Measure fiber attenuation, relate linear and logarithmic power scales, and understand the spectral loss of silica.", "اندازه‌گیری تضعیف فیبر، ارتباط مقیاس‌های خطی و لگاریتمی توان و درک تلفات طیفی سیلیکا."),
    prerequisites: [B("dB and dBm units", "واحدهای dB و dBm"), B("Exponential decay", "افت نمایی")],
    equipment: [B("Stabilized laser source", "منبع لیزر پایدار"), B("Fiber spools 1–150 km", "قرقره‌های فیبر ۱–۱۵۰ km"), B("Optical power meter", "توان‌سنج نوری"), B("Cut-back reference", "مرجع cut-back")],
    theory: {
      basic: B("As light travels, some power is scattered and absorbed. In dB the loss is simply α × L; in mW it falls exponentially. Silica fiber loses only ~0.2 dB/km at 1550 nm — light can travel 100 km and still keep 1% of its power.", "با حرکت نور بخشی از توان پراکنده و جذب می‌شود. بر حسب dB تلفات فقط α × L است؛ بر حسب mW به‌صورت نمایی افت می‌کند. فیبر سیلیکا در ۱۵۵۰ nm فقط ~۰٫۲ dB/km تلفات دارد — نور می‌تواند ۱۰۰ km طی کند و همچنان ۱٪ توان خود را حفظ کند."),
      engineering: B("α(λ) = A/λ⁴ (Rayleigh) + IR absorption tail + OH⁻ absorption peaks (1383, 1240 nm) + UV tail + imperfection loss. Three windows (850, 1310, 1550 nm) emerged from this curve; low-water-peak fiber (G.652.D) removes the 1383 nm peak enabling CWDM across 1270–1610 nm.", "α(λ) = A/λ⁴ (رایلی) + دنباله جذب فروسرخ + قله‌های جذب OH⁻ (۱۳۸۳ و ۱۲۴۰ nm) + دنباله فرابنفش + تلفات نقص. سه پنجره (۸۵۰، ۱۳۱۰، ۱۵۵۰ nm) از این منحنی حاصل شد؛ فیبر کم‌قله‌آب (G.652.D) قله ۱۳۸۳ nm را حذف کرده و CWDM را در ۱۲۷۰–۱۶۱۰ nm ممکن می‌سازد."),
      advanced: B("Rayleigh scattering arises from frozen-in density and composition fluctuations at the glass transition: α_R ≈ (8π³/3λ⁴)n⁸p²kT_fβ_T. Adding GeO₂ raises α_R; pure-silica-core fibers reach 0.14 dB/km. The IR edge is multiphonon Si–O absorption ∝ exp(−C/λ).", "پراکندگی رایلی از نوسانات چگالی و ترکیب منجمدشده در دمای انتقال شیشه ناشی می‌شود: α_R ≈ (8π³/3λ⁴)n⁸p²kT_fβ_T. افزودن GeO₂ مقدار α_R را زیاد می‌کند؛ فیبرهای هسته سیلیکای خالص به ۰٫۱۴ dB/km می‌رسند. لبه فروسرخ جذب چندفونونی Si–O ∝ exp(−C/λ) است."),
      research: B("Beyond linear loss, the power budget must consider distributed Rayleigh backscatter (used by OTDR), stimulated scattering thresholds at high power and polarization-dependent loss. Hollow-core fibers (NANF) now reach <0.2 dB/km with a different loss mechanism (surface scattering, microbending, leakage).", "فراتر از تلفات خطی، بودجه توان باید بازپراکنش توزیعی رایلی (مورد استفاده OTDR)، آستانه‌های پراکندگی برانگیخته در توان بالا و تلفات وابسته به قطبش را در نظر بگیرد. فیبرهای هسته توخالی (NANF) اکنون با سازوکار تلفات متفاوت (پراکندگی سطحی، ریزخمش، نشت) به کمتر از ۰٫۲ dB/km رسیده‌اند."),
    },
    equations: [{ eq: "P(z) = P₀ · exp(−α_Np z)", desc: B("Linear-scale decay, α in Np/km", "افت خطی، α بر حسب Np/km") }, { eq: "P(z)[dBm] = P₀[dBm] − α[dB/km] · z", desc: B("Logarithmic form", "شکل لگاریتمی") }, { eq: "α[dB/km] = 4.343 · α[Np/km]", desc: B("Unit conversion", "تبدیل واحد") }, { eq: "Loss[dB] = 10 log₁₀(P_in / P_out)", desc: B("Insertion loss definition", "تعریف تلفات") }],
    procedure: [B("Set P₀ = 0 dBm, λ = 1550 nm and L = 10 km; record P(L).", "P₀ = 0 dBm، λ = 1550 nm و L = 10 km را تنظیم و P(L) را ثبت کنید."), B("Repeat for L = 20, 40, 80 km. From the slope of P vs L determine α.", "برای L = 20, 40, 80 km تکرار کنید. از شیب P بر حسب L مقدار α را تعیین کنید."), B("Switch λ to 1310 nm and 850 nm and compare α.", "λ را به ۱۳۱۰ و ۸۵۰ nm تغییر داده و α را مقایسه کنید."), B("Enable the Experimental model; estimate the uncertainty of the slope.", "مدل تجربی را فعال کنید؛ عدم قطعیت شیب را تخمین بزنید.")],
    errors: [B("Connector loss at the launch counted as fiber loss (use cut-back).", "تلفات کانکتور ورودی به‌عنوان تلفات فیبر (از cut-back استفاده کنید)."), B("Power meter linearity and wavelength calibration.", "خطی بودن و کالیبراسیون طول موج توان‌سنج."), ...commonErrors.slice(2, 3)],
    conclusion: B("Loss in dB accumulates linearly with distance; the 1550 nm window minimizes α for silica.", "تلفات بر حسب dB به‌صورت خطی با فاصله انباشته می‌شود؛ پنجره ۱۵۵۰ nm مقدار α را برای سیلیکا کمینه می‌کند."),
    questions: [
      { q: B("P₀ = 3 dBm, α = 0.25 dB/km, L = 60 km → P(L) in dBm?", "P₀ = 3 dBm، α = 0.25 dB/km، L = 60 km ← P(L) بر حسب dBm؟"), type: "numeric", answer: -12, tolerance: 0.2, unit: "dBm", hints: [B("Total loss = α × L.", "تلفات کل = α × L."), B("0.25 × 60 = 15 dB; subtract from 3 dBm.", "0.25 × 60 = 15 dB؛ از 3 dBm کم کنید.")], explanation: B("P = 3 − 15 = −12 dBm (≈ 63 µW).", "P = 3 − 15 = −12 dBm (≈ 63 µW).") },
      { q: B("Why is fiber loss minimum near 1550 nm?", "چرا تلفات فیبر نزدیک ۱۵۵۰ nm کمینه است؟"), type: "mc", answer: 1, options: [B("Because lasers are cheaper there", "چون لیزرها آنجا ارزان‌ترند"), B("Rayleigh scattering falls as 1/λ⁴ while IR absorption rises at longer λ", "پراکندگی رایلی با 1/λ⁴ کم می‌شود و جذب فروسرخ در λ بلندتر زیاد می‌شود"), B("Water absorption peaks there", "قله جذب آب آنجاست"), B("The refractive index is smallest there", "ضریب شکست آنجا کمترین است")], hints: [B("Two competing mechanisms.", "دو سازوکار رقیب."), B("One decreases with λ, the other increases.", "یکی با λ کم می‌شود و دیگری زیاد.")], explanation: B("The minimum lies where the decreasing Rayleigh term meets the rising multiphonon IR absorption edge.", "کمینه جایی است که جمله کاهشی رایلی با لبه صعودی جذب فروسرخ چندفونونی برخورد می‌کند.") },
    ],
    Sim: AttenuationSim, dataKeys: { x: "L_km", y: ["theory", "measured"] },
  },
  {
    id: "bending", num: 5, category: "basic", level: 1, title: B("Macro-Bending Loss", "تلفات خمش"), short: B("Coil the fiber tighter and watch power leak into the cladding — exponentially.", "فیبر را محکم‌تر بپیچید و نشت نمایی توان به روکش را ببینید."),
    objective: B("Quantify bend loss as a function of bend radius, wavelength and fiber design.", "کمی‌سازی تلفات خمش بر حسب شعاع خمش، طول موج و طراحی فیبر."),
    prerequisites: [B("Mode field & evanescent tail", "میدان مود و دنباله میرا"), B("V-number", "عدد V")],
    equipment: [B("Mandrels 4–40 mm", "مندرل‌های ۴–۴۰ mm"), B("1310/1550/1625 nm source", "منبع ۱۳۱۰/۱۵۵۰/۱۶۲۵ nm"), B("Power meter", "توان‌سنج")],
    theory: {
      basic: B("If a fiber is bent too sharply, light at the outer edge would have to travel faster than allowed in the cladding, so it escapes. Loss grows dramatically as the radius shrinks and is worse at longer wavelengths.", "اگر فیبر خیلی تند خم شود، نور در لبه بیرونی باید سریع‌تر از حد مجاز در روکش حرکت کند و بنابراین فرار می‌کند. تلفات با کوچک شدن شعاع به‌شدت زیاد و در طول موج بلندتر بدتر می‌شود."),
      engineering: B("Bend loss follows α ∝ R^(−1/2) exp(−(2w³/3a³β²)R). G.652 fiber tolerates R ≥ 30 mm; G.657.A2/B3 fibers tolerate 7.5/5 mm by raising Δ or adding a trench. Testing at 1625 nm reveals bends invisible at 1310 nm.", "تلفات خمش از α ∝ R^(−1/2) exp(−(2w³/3a³β²)R) پیروی می‌کند. فیبر G.652 شعاع R ≥ 30 mm را تحمل می‌کند؛ فیبرهای G.657.A2/B3 با افزایش Δ یا افزودن ترانشه ۷٫۵/۵ mm را تحمل می‌کنند. آزمون در ۱۶۲۵ nm خم‌هایی را آشکار می‌کند که در ۱۳۱۰ nm نامرئی‌اند."),
      advanced: B("Marcuse's formula (used here) results from matching the LP01 field to a radiating cylindrical wave in the bent cladding using a conformal transformation n'(x) = n(x)(1 + x/R). Elastic-optic corrections use R_eff ≈ 1.28R for silica. Whispering-gallery resonances at the coating produce oscillations in loss vs λ.", "فرمول مارکوز (به‌کاررفته در اینجا) از تطبیق میدان LP01 با موج استوانه‌ای تابشی در روکش خم‌شده با تبدیل همدیس n'(x) = n(x)(1 + x/R) حاصل می‌شود. تصحیح الاستو-اپتیک از R_eff ≈ 1.28R برای سیلیکا استفاده می‌کند. تشدیدهای whispering-gallery در پوشش، نوسان تلفات بر حسب λ ایجاد می‌کنند."),
      research: B("Rigorous treatments solve the vector wave equation in the equivalent straight waveguide with a tilted index profile, using PML boundaries (finite-element) to compute complex n_eff; Im(n_eff) yields loss. Micro-bending (random ~mm perturbations) couples LP01 to radiation via a power-spectrum model and scales as (MFD)^6.", "برخوردهای دقیق معادله موج برداری را در موجبر مستقیم معادل با پروفایل ضریب شیب‌دار و مرزهای PML (اجزای محدود) حل کرده و n_eff مختلط را محاسبه می‌کنند؛ Im(n_eff) تلفات را می‌دهد. ریزخمش (اغتشاش تصادفی ~mm) از طریق مدل طیف توان LP01 را به تابش کوپل می‌کند و با (MFD)^6 مقیاس می‌شود."),
    },
    equations: [{ eq: "α_b = (√π κ² e^{−(2γ³/3β²)R}) / (2 γ^{3/2} V² √R K₁²(γa))", desc: B("Marcuse macro-bend loss coefficient (Np/m)", "ضریب تلفات خمش مارکوز (Np/m)") }, { eq: "κ = u/a,  γ = w/a,  u² + w² = V²", desc: B("Core/cladding transverse parameters", "پارامترهای عرضی هسته/روکش") }, { eq: "Loss_turn[dB] = 4.343 · α_b · 2πR", desc: B("Loss per full turn", "تلفات هر دور کامل") }],
    procedure: [B("Set λ = 1550 nm, a = 4.1 µm, Δn = 0.005, N = 5 turns.", "λ = 1550 nm، a = 4.1 µm، Δn = 0.005 و N = 5 دور را تنظیم کنید."), B("Sweep R from 40 mm down to 5 mm; record loss at 30, 20, 15, 10, 7.5 mm.", "R را از ۴۰ تا ۵ mm کم کنید؛ تلفات را در ۳۰، ۲۰، ۱۵، ۱۰ و ۷٫۵ mm ثبت کنید."), B("Repeat at 1310 nm and 1625 nm.", "در ۱۳۱۰ و ۱۶۲۵ nm تکرار کنید."), B("Plot ln(loss) vs R and verify the exponential law.", "ln(تلفات) بر حسب R را رسم و قانون نمایی را تأیید کنید.")],
    errors: [B("Mandrel radius tolerance and fiber not fully in contact.", "رواداری شعاع مندرل و تماس ناقص فیبر."), B("Stress-optic correction (R_eff ≠ R).", "تصحیح تنش-اپتیک (R_eff ≠ R)."), ...commonErrors.slice(3)],
    conclusion: B("Bend loss is exponential in R and strongly wavelength dependent; keep R ≥ 30 mm for standard SMF.", "تلفات خمش در R نمایی و به‌شدت وابسته به طول موج است؛ برای SMF استاندارد R ≥ 30 mm را رعایت کنید."),
    questions: [
      { q: B("Which wavelength is most sensitive to bending?", "کدام طول موج به خمش حساس‌تر است؟"), type: "mc", answer: 2, options: [B("1310 nm", "1310 nm"), B("1550 nm", "1550 nm"), B("1625 nm", "1625 nm"), B("All equal", "همه برابر")], hints: [B("Consider mode confinement vs λ.", "محدودسازی مود را بر حسب λ در نظر بگیرید."), B("Longer λ → larger MFD → weaker confinement.", "λ بلندتر ← MFD بزرگ‌تر ← محدودسازی ضعیف‌تر.")], explanation: B("At 1625 nm V is smallest, the field extends farther into the cladding and radiates more easily in a bend.", "در ۱۶۲۵ nm عدد V کمترین است، میدان بیشتر به روکش نفوذ می‌کند و در خم آسان‌تر تابش می‌کند.") },
      { q: B("Halving the number of turns changes the total bend loss by a factor of:", "نصف کردن تعداد دورها تلفات کل خمش را چند برابر می‌کند؟"), type: "numeric", answer: 0.5, tolerance: 0.05, hints: [B("Loss per turn is constant.", "تلفات هر دور ثابت است."), B("Total = N × loss/turn.", "کل = N × تلفات هر دور.")], explanation: B("Total loss is linear in N, so it halves (factor 0.5).", "تلفات کل با N خطی است، پس نصف می‌شود (ضریب ۰٫۵).") },
    ],
    assumptions: B("Weakly guiding step-index fiber; LP01 only; no coating interference; R ≫ a.", "فیبر پله‌ای با هدایت ضعیف؛ فقط LP01؛ بدون تداخل پوشش؛ R ≫ a."),
    Sim: BendingSim, dataKeys: { x: "R_mm", y: ["theory", "measured"] },
  },
  {
    id: "chromatic", num: 6, category: "basic", level: 1, title: B("Chromatic Dispersion", "پاشندگی رنگی"), short: B("Different wavelengths travel at different speeds — see the pulse spread with distance.", "طول موج‌های مختلف با سرعت‌های متفاوت حرکت می‌کنند — پهن‌شدگی پالس با فاصله را ببینید."),
    objective: B("Compute pulse broadening from D, L and Δλ; identify the zero-dispersion wavelength and the dispersion-limited bit rate.", "محاسبه پهن‌شدگی پالس از D، L و Δλ؛ شناسایی طول موج پاشندگی صفر و نرخ بیت محدودشده توسط پاشندگی."),
    prerequisites: [B("Group velocity", "سرعت گروه"), B("Source spectral width", "پهنای طیفی منبع")],
    equipment: [B("Pulsed DFB / FP / LED sources", "منابع پالسی DFB / FP / LED"), B("Sampling oscilloscope", "اسیلوسکوپ نمونه‌بردار"), B("Fiber spools (SMF, DSF, NZ-DSF, DCF)", "قرقره‌های فیبر"), B("Phase-shift dispersion analyzer", "تحلیلگر پاشندگی")],
    theory: {
      basic: B("A light pulse contains a range of wavelengths. In glass each wavelength has a slightly different speed, so the pulse spreads out as it travels. The spread is Δτ = D·L·Δλ. If pulses overlap, bits cannot be told apart.", "یک پالس نوری شامل بازه‌ای از طول موج‌هاست. در شیشه هر طول موج سرعت کمی متفاوت دارد، بنابراین پالس هنگام حرکت پهن می‌شود. پهن‌شدگی Δτ = D·L·Δλ است. اگر پالس‌ها هم‌پوشانی کنند، بیت‌ها قابل تفکیک نیستند."),
      engineering: B("D = D_material + D_waveguide. Material dispersion of silica crosses zero at 1276 nm; waveguide dispersion (negative) shifts λ₀ to ~1310 nm for G.652 and to 1550 nm for DSF. Design rule: B·Δτ < 1/4 (NRZ). At 10 Gb/s over G.652 with a DFB (Δλ from chirp/modulation ≈ 0.1 nm) the reach is ~60–80 km without compensation.", "D = D_ماده + D_موجبر. پاشندگی ماده سیلیکا در ۱۲۷۶ nm صفر می‌شود؛ پاشندگی موجبری (منفی) λ₀ را برای G.652 به ~۱۳۱۰ nm و برای DSF به ۱۵۵۰ nm منتقل می‌کند. قانون طراحی: B·Δτ < 1/4 (NRZ). در ۱۰ Gb/s روی G.652 با DFB (Δλ ≈ 0.1 nm) برد ~۶۰–۸۰ km بدون جبران است."),
      advanced: B("The propagation constant is expanded β(ω) = β₀ + β₁Δω + ½β₂Δω² + ⅙β₃Δω³…; D = −(2πc/λ²)β₂. A Gaussian pulse of width T₀ broadens as T(z)/T₀ = √(1 + (z/L_D)²), L_D = T₀²/|β₂|, and acquires a linear chirp. For transform-limited pulses Δλ is set by the pulse itself, not the laser linewidth.", "ثابت انتشار بسط داده می‌شود β(ω) = β₀ + β₁Δω + ½β₂Δω² + ⅙β₃Δω³…؛ D = −(2πc/λ²)β₂. پالس گاوسی با پهنای T₀ به‌صورت T(z)/T₀ = √(1 + (z/L_D)²) با L_D = T₀²/|β₂| پهن می‌شود و چیرپ خطی می‌گیرد. برای پالس‌های حد تبدیل، Δλ توسط خود پالس تعیین می‌شود نه پهنای خط لیزر."),
      research: B("Near λ₀ third-order dispersion β₃ dominates and produces asymmetric pulses with oscillatory tails (Airy). In WDM systems dispersion slope S causes residual dispersion per channel after DCF compensation; slope-matched DCF and electronic (DSP) compensation in coherent receivers address it. Dispersion also governs FWM phase matching and modulation instability.", "نزدیک λ₀ پاشندگی مرتبه سوم β₃ غالب است و پالس‌های نامتقارن با دنباله‌های نوسانی (Airy) ایجاد می‌کند. در سیستم‌های WDM شیب پاشندگی S پاشندگی باقیمانده در هر کانال پس از جبران DCF ایجاد می‌کند؛ DCF با شیب منطبق و جبران الکترونیکی (DSP) در گیرنده همدوس آن را حل می‌کند. پاشندگی همچنین تطبیق فاز FWM و ناپایداری مدولاسیون را تعیین می‌کند."),
    },
    equations: [{ eq: "Δτ = |D| · L · Δλ", desc: B("Broadening: D ps/(nm·km), L km, Δλ nm", "پهن‌شدگی: D ps/(nm·km)، L km، Δλ nm") }, { eq: "D(λ) = (S₀/4)(λ − λ₀⁴/λ³)", desc: B("Sellmeier-based fit for G.652 (S₀≈0.092 ps/nm²/km, λ₀≈1310 nm)", "برازش برای G.652") }, { eq: "T_out = √(T₀² + Δτ²)", desc: B("RMS pulse width after propagation", "پهنای RMS پالس پس از انتشار") }, { eq: "β₂ = −D λ² / (2πc)", desc: B("GVD parameter", "پارامتر GVD") }, { eq: "B · Δτ ≤ 1/4", desc: B("Dispersion-limited bit rate (NRZ rule of thumb)", "حد نرخ بیت ناشی از پاشندگی") }],
    procedure: [B("Select G.652, λ = 1550 nm, Δλ = 0.1 nm, T₀ = 100 ps.", "G.652، λ = 1550 nm، Δλ = 0.1 nm، T₀ = 100 ps را انتخاب کنید."), B("Vary L from 10 to 200 km and record T_out.", "L را از ۱۰ تا ۲۰۰ km تغییر داده و T_out را ثبت کنید."), B("Set λ = 1310 nm and observe near-zero broadening.", "λ = 1310 nm را تنظیم و پهن‌شدگی نزدیک صفر را مشاهده کنید."), B("Replace the DFB (0.1 nm) with an LED (Δλ = 40 nm) and compare.", "DFB (0.1 nm) را با LED (Δλ = 40 nm) جایگزین و مقایسه کنید."), B("Compute the maximum bit rate for each case.", "بیشینه نرخ بیت را برای هر مورد محاسبه کنید.")],
    errors: [B("Chirp of directly-modulated lasers increases effective Δλ.", "چیرپ لیزرهای مدوله مستقیم Δλ مؤثر را زیاد می‌کند."), B("Temperature shifts λ₀ by ~0.03 nm/°C.", "دما λ₀ را حدود ۰٫۰۳ nm/°C جابه‌جا می‌کند."), ...commonErrors.slice(3)],
    conclusion: B("Chromatic dispersion scales with D·L·Δλ; operate near λ₀, use narrow-linewidth sources or compensate with DCF/DSP.", "پاشندگی رنگی با D·L·Δλ مقیاس می‌شود؛ نزدیک λ₀ کار کنید، از منابع باریک‌خط استفاده کنید یا با DCF/DSP جبران کنید."),
    questions: [
      { q: B("D = 17 ps/(nm·km), L = 80 km, Δλ = 0.1 nm → Δτ (ps)?", "D = 17 ps/(nm·km)، L = 80 km، Δλ = 0.1 nm ← Δτ (ps)؟"), type: "numeric", answer: 136, tolerance: 3, unit: "ps", hints: [B("Multiply the three quantities.", "سه کمیت را در هم ضرب کنید."), B("17 × 80 × 0.1.", "17 × 80 × 0.1.")], explanation: B("Δτ = 17 × 80 × 0.1 = 136 ps — already > 1/4 of a 10 Gb/s bit slot (100 ps): compensation needed.", "Δτ = 17 × 80 × 0.1 = 136 ps — بیشتر از ۱/۴ اسلات بیت ۱۰ Gb/s (100 ps): جبران لازم است.") },
      { q: B("Which fiber has D ≈ 0 at 1550 nm?", "کدام فیبر در ۱۵۵۰ nm دارای D ≈ 0 است؟"), type: "mc", answer: 1, options: [B("G.652 SMF", "G.652 SMF"), B("G.653 DSF", "G.653 DSF"), B("G.655 NZ-DSF", "G.655 NZ-DSF"), B("DCF", "DCF")], hints: [B("'Dispersion-shifted' means λ₀ moved.", "«پاشندگی‌جابه‌جاشده» یعنی λ₀ منتقل شده."), B("NZ-DSF deliberately keeps a small non-zero D to suppress FWM.", "NZ-DSF عمداً D کوچک غیرصفر نگه می‌دارد تا FWM را سرکوب کند.")], explanation: B("DSF has its zero-dispersion wavelength shifted to 1550 nm (but suffers FWM in WDM).", "DSF طول موج پاشندگی صفر خود را به ۱۵۵۰ nm منتقل کرده است (اما در WDM از FWM رنج می‌برد).") },
    ],
    Sim: ChromDispSim, dataKeys: { x: "L_km", y: ["theory", "measured"] },
  },
  {
    id: "modal", num: 7, category: "basic", level: 1, title: B("Modal Dispersion in Multimode Fiber", "پاشندگی مودی در فیبر چندمود"), short: B("Rays on different zig-zag paths arrive at different times — step vs graded index.", "پرتوها در مسیرهای زیگزاگ متفاوت در زمان‌های مختلف می‌رسند — پله‌ای در برابر شیب‌ضریب."),
    objective: B("Estimate intermodal delay spread and bandwidth-distance product for step- and graded-index fibers.", "تخمین پراکندگی تأخیر بین‌مودی و حاصل‌ضرب پهنای باند-فاصله برای فیبرهای پله‌ای و شیب‌ضریب."),
    prerequisites: [B("Ray optics in fibers", "اپتیک پرتویی در فیبر"), B("NA and Δ", "NA و Δ")],
    equipment: [B("850 nm VCSEL / pulsed LED", "VCSEL / LED پالسی ۸۵۰ nm"), B("50/125 and 62.5/125 MMF", "MMF 50/125 و 62.5/125"), B("Fast photodiode + oscilloscope", "فتودیود سریع + اسیلوسکوپ")],
    theory: {
      basic: B("In a multimode fiber, light takes many paths. The straight (axial) ray arrives first; the steepest ray zig-zags and arrives last. This time difference smears out pulses. Graded-index fibers fix most of this: rays that travel farther move through lower-index glass and thus faster.", "در فیبر چندمود نور مسیرهای زیادی طی می‌کند. پرتو مستقیم (محوری) اول می‌رسد؛ تندترین پرتو زیگزاگ می‌زند و آخر می‌رسد. این اختلاف زمانی پالس‌ها را لکه‌دار می‌کند. فیبرهای شیب‌ضریب بیشتر این مشکل را حل می‌کنند: پرتوهایی که مسیر بیشتری می‌روند از شیشه با ضریب کمتر و بنابراین سریع‌تر عبور می‌کنند."),
      engineering: B("Step index: Δt = L n₁ Δ / c ≈ 50 ns/km for Δ = 1% → bandwidth ~ 10–20 MHz·km. Parabolic (α = 2) profile: Δt = L n₁ Δ² / 8c → ~ 1000× smaller; OM3/OM4 reach 2000/4700 MHz·km at 850 nm. Optimum profile exponent α_opt ≈ 2(1 − 1.2Δ) accounts for profile dispersion.", "پله‌ای: Δt = L n₁ Δ / c ≈ 50 ns/km برای Δ = 1٪ ← پهنای باند ~۱۰–۲۰ MHz·km. پروفایل سهموی (α = 2): Δt = L n₁ Δ² / 8c ← ~۱۰۰۰ برابر کوچک‌تر؛ OM3/OM4 به ۲۰۰۰/۴۷۰۰ MHz·km در ۸۵۰ nm می‌رسند. توان بهینه پروفایل α_opt ≈ 2(1 − 1.2Δ) پاشندگی پروفایل را در نظر می‌گیرد."),
      advanced: B("In the WKB picture, mode groups of principal number m have group delay τ(m) that depends on the profile exponent α; for α = α_opt the delays of all groups equalize to first order in Δ. Mode coupling (from micro-bends) randomizes delays, making the spread grow as √L beyond the coupling length instead of L.", "در تصویر WKB، گروه‌های مودی با عدد اصلی m تأخیر گروهی τ(m) دارند که به توان پروفایل α وابسته است؛ برای α = α_opt تأخیر همه گروه‌ها در مرتبه اول Δ برابر می‌شود. کوپلینگ مود (از ریزخمش‌ها) تأخیرها را تصادفی می‌کند و پراکندگی فراتر از طول کوپلینگ به‌جای L با √L رشد می‌کند."),
      research: B("Differential mode delay (DMD) measurement launches a small spot at various radial offsets and records arrival times; the effective modal bandwidth (EMB) depends on launch conditions (encircled flux). Few-mode fibers for MDM exploit controlled modal delay; the impulse response is modeled with a modal transfer matrix including coupling.", "اندازه‌گیری تأخیر تفاضلی مود (DMD) لکه کوچکی را در آفست‌های شعاعی مختلف تزریق و زمان رسیدن را ثبت می‌کند؛ پهنای باند مودی مؤثر (EMB) به شرایط تزریق (شار محصور) وابسته است. فیبرهای کم‌مود برای MDM از تأخیر مودی کنترل‌شده بهره می‌برند؛ پاسخ ضربه با ماتریس انتقال مودی شامل کوپلینگ مدل می‌شود."),
    },
    equations: [{ eq: "Δt_step = L · n₁ · Δ / c", desc: B("Step-index delay spread", "پراکندگی تأخیر پله‌ای") }, { eq: "Δt_graded = L · n₁ · Δ² / (8c)", desc: B("Parabolic graded-index delay spread", "پراکندگی تأخیر شیب‌ضریب سهموی") }, { eq: "B_opt ≈ 0.44 / Δt", desc: B("Optical bandwidth (Gaussian approx.)", "پهنای باند نوری (تقریب گاوسی)") }, { eq: "Δ = (n₁ − n₂)/n₁", desc: B("Relative index difference", "اختلاف ضریب نسبی") }],
    procedure: [B("Set n₁ = 1.48, n₂ = 1.46, L = 1 km, step index; record Δt.", "n₁ = 1.48، n₂ = 1.46، L = 1 km، پله‌ای؛ Δt را ثبت کنید."), B("Switch to graded index; note the improvement factor.", "به شیب‌ضریب بروید؛ ضریب بهبود را یادداشت کنید."), B("Vary Δ and confirm Δt ∝ Δ (step) and ∝ Δ² (graded).", "Δ را تغییر دهید و تأیید کنید Δt ∝ Δ (پله‌ای) و ∝ Δ² (شیب‌ضریب)."), B("Compute the bandwidth-distance product.", "حاصل‌ضرب پهنای باند-فاصله را محاسبه کنید.")],
    errors: [B("Mode coupling reduces spread relative to the ray model.", "کوپلینگ مود پراکندگی را نسبت به مدل پرتویی کم می‌کند."), B("Launch conditions (overfilled vs restricted) change the result.", "شرایط تزریق (پرشده در برابر محدود) نتیجه را تغییر می‌دهد."), ...commonErrors.slice(3)],
    conclusion: B("Modal dispersion limits MMF to short links; graded index reduces it by ~Δ/8, i.e. by orders of magnitude.", "پاشندگی مودی MMF را به لینک‌های کوتاه محدود می‌کند؛ شیب‌ضریب آن را حدود Δ/8 یعنی چند مرتبه بزرگی کاهش می‌دهد."),
    questions: [
      { q: B("n₁ = 1.5, Δ = 1%, L = 1 km step index → Δt in ns?", "n₁ = 1.5، Δ = 1٪، L = 1 km پله‌ای ← Δt بر حسب ns؟"), type: "numeric", answer: 50, tolerance: 2, unit: "ns", hints: [B("Δt = L n₁ Δ / c.", "Δt = L n₁ Δ / c."), B("1000 × 1.5 × 0.01 / 3e8.", "1000 × 1.5 × 0.01 / 3e8.")], explanation: B("Δt = 1000 × 1.5 × 0.01 / 3×10⁸ = 5×10⁻⁸ s = 50 ns.", "Δt = 1000 × 1.5 × 0.01 / 3×10⁸ = 5×10⁻⁸ s = 50 ns.") },
      { q: B("Why does a parabolic profile reduce modal dispersion?", "چرا پروفایل سهموی پاشندگی مودی را کم می‌کند؟"), type: "mc", answer: 0, options: [B("Off-axis rays travel through lower index and speed up, compensating their longer path", "پرتوهای دور از محور از ضریب کمتر عبور کرده و سریع‌تر می‌شوند و مسیر بلندتر جبران می‌شود"), B("It removes all higher-order modes", "همه مودهای مرتبه بالا را حذف می‌کند"), B("It increases the NA", "NA را زیاد می‌کند"), B("It reduces attenuation", "تضعیف را کم می‌کند")], hints: [B("Think about v = c/n(r).", "به v = c/n(r) فکر کنید."), B("Longer path but faster speed.", "مسیر بلندتر اما سرعت بیشتر.")], explanation: B("In a graded profile the ray's local speed increases with radius, nearly equalizing transit times.", "در پروفایل شیب‌دار سرعت محلی پرتو با شعاع زیاد می‌شود و زمان‌های عبور تقریباً برابر می‌شوند.") },
    ],
    Sim: ModalDispSim, dataKeys: { x: "L_km", y: ["theory", "measured"] },
  },
];
