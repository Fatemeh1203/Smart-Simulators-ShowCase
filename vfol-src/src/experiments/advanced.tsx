import { useMemo, useState } from "react";
import { Panel, Slider, Stat, Segmented, Badge, Toggle, fmt, sci, Callout } from "../components/ui";
import { XYChart, Heatmap, Palette } from "../components/Chart";
import { Compare, RecordBar, useExplain, type ExperimentDef, type SimProps } from "../components/ExperimentShell";
import * as P from "../lib/physics";
import { noisy, noisyAdd, B } from "./common";

// ============ FBG ============
function FbgSim({ model, noise, record, lang }: SimProps) {
  const [period, setPeriod] = useState(535.2), [neff, setNeff] = useState(1.4482), [len, setLen] = useState(10), [dn, setDn] = useState(1e-4), [dT, setDT] = useState(0), [strain, setStrain] = useState(0);
  const r = P.fbg({ periodNm: period, neff, lengthMm: len, dn, dT, strainUe: strain });
  const measLB = useMemo(() => noisyAdd(r.lB, 0.005, model, noise.inst) + (model === "experimental" && noise.temp ? 0.01 * P.gauss() : 0), [r.lB, model, noise]);
  const shiftCurveT = useMemo(() => P.linspace(-20, 100, 40).map((t) => ({ x: t, shift: +P.fbg({ periodNm: period, neff, lengthMm: len, dn, dT: t, strainUe: 0, N: 4 }).shift.toFixed(4) })), [period, neff, len, dn]);
  const shiftCurveE = useMemo(() => P.linspace(0, 2000, 40).map((e) => ({ x: e, shift: +P.fbg({ periodNm: period, neff, lengthMm: len, dn, dT: 0, strainUe: e, N: 4 }).shift.toFixed(4) })), [period, neff, len, dn]);
  const explain = useExplain({ Λ: period, n_eff: neff, L: len, Δn: dn, ΔT: dT, ε: strain }, {
    Λ: B("λ_B = 2 n_eff Λ: the Bragg wavelength scales linearly with the grating period — the phase-mask period during inscription sets it.", "λ_B = 2 n_eff Λ: طول موج براگ به‌صورت خطی با دوره توری مقیاس می‌شود — دوره ماسک فاز هنگام حک آن را تعیین می‌کند."),
    n_eff: B("The effective index of the guided mode enters the phase-matching condition; any effect changing n_eff (temperature, strain) shifts λ_B.", "ضریب مؤثر مود هدایت‌شده در شرط تطبیق فاز وارد می‌شود؛ هر اثری که n_eff را تغییر دهد (دما، کرنش) λ_B را جابه‌جا می‌کند."),
    L: B("Longer gratings increase κL (higher peak reflectivity) and narrow the bandwidth Δλ ≈ λ_B²/(π n_eff L)·√((κL)² + π²).", "توری‌های بلندتر κL را زیاد (بازتاب قله بالاتر) و پهنای باند Δλ ≈ λ_B²/(π n_eff L)·√((κL)² + π²) را باریک می‌کنند."),
    Δn: B("Index modulation depth sets the coupling coefficient κ = πΔn/λ_B; R_max = tanh²(κL). Strong gratings (κL > 3) saturate near 100% and broaden.", "عمق مدولاسیون ضریب، ضریب کوپلینگ κ = πΔn/λ_B را تعیین می‌کند؛ R_max = tanh²(κL). توری‌های قوی (κL > 3) نزدیک ۱۰۰٪ اشباع و پهن می‌شوند."),
    ΔT: B("Δλ_B/λ_B = (α + ξ)ΔT ≈ 9.15×10⁻⁶/°C → ~13–14 pm/°C at 1550 nm; ξ (thermo-optic) dominates over α (thermal expansion).", "Δλ_B/λ_B = (α + ξ)ΔT ≈ 9.15×10⁻⁶/°C ← ~۱۳–۱۴ pm/°C در ۱۵۵۰ nm؛ ξ (ترمو-اپتیک) بر α (انبساط حرارتی) غالب است."),
    ε: B("Δλ_B/λ_B = (1 − p_e)ε ≈ 0.78ε → ~1.2 pm/µε at 1550 nm; p_e ≈ 0.22 is the effective photo-elastic coefficient.", "Δλ_B/λ_B = (1 − p_e)ε ≈ 0.78ε ← ~۱٫۲ pm/µε در ۱۵۵۰ nm؛ p_e ≈ 0.22 ضریب مؤثر فوتوالاستیک است."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای توری" : "Grating parameters"} className="space-y-4">
        <Slider label="Λ (period)" value={period} min={400} max={600} step={0.1} unit="nm" onChange={setPeriod} fmt={(v) => v.toFixed(1)} />
        <Slider label="n_eff" value={neff} min={1.44} max={1.47} step={0.0001} onChange={setNeff} fmt={(v) => v.toFixed(4)} />
        <Slider label="L" value={len} min={0.5} max={50} step={0.5} unit="mm" onChange={setLen} />
        <Slider label="Δn (modulation)" value={dn} min={1e-5} max={1e-3} step={1e-5} onChange={setDn} fmt={(v) => v.toExponential(1)} />
        <Slider label="ΔT" value={dT} min={-40} max={150} step={1} unit="°C" onChange={setDT} />
        <Slider label={lang === "fa" ? "کرنش ε" : "Strain ε"} value={strain} min={-1000} max={3000} step={10} unit="µε" onChange={setStrain} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="λ_B" value={fmt(r.lB, 4)} unit="nm" tone="brand" sub={`λ_B0 = ${r.lB0.toFixed(3)}`} /><Stat label="Δλ_B" value={fmt(r.shift * 1000, 1)} unit="pm" />
          <Stat label="R_max" value={fmt(r.Rmax * 100, 2)} unit="%" /><Stat label="κL" value={fmt(r.kappa * len * 1e-3, 2)} />
          <Stat label="FWHM" value={fmt(r.bw * 1000, 0)} unit="pm" /><Stat label="κ" value={fmt(r.kappa, 0)} unit="m⁻¹" />
        </div>
        <RecordBar onRecord={() => record({ period_nm: period, neff, L_mm: len, dn, dT_C: dT, strain_ue: strain }, { theory: +r.lB.toFixed(4), measured: +measLB.toFixed(4), shift_pm: +(r.shift * 1000).toFixed(2), Rmax_pct: +(r.Rmax * 100).toFixed(2), fwhm_pm: +(r.bw * 1000).toFixed(1) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "طیف بازتاب و عبور" : "Reflection & transmission spectrum"}><XYChart data={r.spec.map((p) => ({ x: p.x, R: +(p.R * 100).toFixed(3), T: +(p.T * 100).toFixed(3) }))} series={[{ key: "R", name: "R (%)" }, { key: "T", name: "T (%)", color: Palette[2], dash: true }]} xLabel="λ (nm)" yLabel="%" height={280} refX={[{ x: +r.lB0.toFixed(4), label: "λ_B0", color: "#94a3b8" }, { x: +r.lB.toFixed(4), label: "λ_B" }]} legend />
          <div className="mt-3"><Compare rows={[{ label: "λ_B (nm)", theory: r.lB, measured: measLB, digits: 4 }]} /></div></Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title="Δλ_B vs temperature"><XYChart data={shiftCurveT} series={[{ key: "shift", name: "Δλ (nm)", color: Palette[3] }]} xLabel="ΔT (°C)" yLabel="nm" height={190} brush={false} refX={[{ x: dT, label: "ΔT" }]} /><div className="text-[10px] muted num mt-1">≈ {(r.lB0 * 9.15e-6 * 1000).toFixed(1)} pm/°C</div></Panel>
          <Panel title="Δλ_B vs strain"><XYChart data={shiftCurveE} series={[{ key: "shift", name: "Δλ (nm)", color: Palette[4] }]} xLabel="ε (µε)" yLabel="nm" height={190} brush={false} refX={[{ x: strain, label: "ε" }]} /><div className="text-[10px] muted num mt-1">≈ {(r.lB0 * 0.78e-6 * 1000).toFixed(2)} pm/µε</div></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Polarization ============
function PolSim({ model, noise, record, lang, sim }: SimProps) {
  const [Ex, setEx] = useState(1), [Ey, setEy] = useState(0.6), [delta, setDelta] = useState(45), [dnB, setDnB] = useState(3e-4), [L, setL] = useState(1), [lam, setLam] = useState(1550), [pmf, setPmf] = useState(false), [Dpmd, setDpmd] = useState(0.1), [Lpmd, setLpmd] = useState(100);
  // birefringent fiber adds phase retardation
  const retard = pmf ? 0 : (2 * Math.PI * dnB * L * 1e-3) / (lam * 1e-9) * (180 / Math.PI); // deg
  const totalDelta = (delta + retard) % 360;
  const st = P.polarizationState(Ex, Ey, totalDelta);
  const LB = (lam * 1e-9) / dnB; // beat length m
  const pmd = P.pmdDelay(Dpmd, Lpmd);
  const measDop = useMemo(() => noisy(st.dop, 0.02, model, noise.det), [st.dop, model, noise]);
  const measPmd = useMemo(() => noisy(pmd, 0.15, model, noise.meas), [pmd, model, noise]);
  const kindName: Record<string, string> = lang === "fa" ? { linear: "خطی", circular: "دایره‌ای", elliptical: "بیضوی" } : { linear: "Linear", circular: "Circular", elliptical: "Elliptical" };
  const pmdCurve = useMemo(() => P.linspace(1, 1000, 60).map((l) => ({ x: +l.toFixed(0), pmd: +P.pmdDelay(Dpmd, l).toFixed(3), limit10: 10, limit40: 2.5 })), [Dpmd]);
  const evo = useMemo(() => P.linspace(0, Math.max(1e-3, L), 60).map((z) => { const d = delta + (2 * Math.PI * dnB * z * 1e-3) / (lam * 1e-9) * 180 / Math.PI; const s = P.polarizationState(Ex, Ey, d); return { x: +z.toFixed(4), S1: +s.S1.toFixed(3), S2: +s.S2.toFixed(3), S3: +s.S3.toFixed(3) }; }), [L, delta, dnB, lam, Ex, Ey]);
  const explain = useExplain({ E_x: Ex, E_y: Ey, δ: delta, Δn: dnB, L, D_PMD: Dpmd }, {
    E_x: B("Changing the x amplitude rotates the linear component (azimuth ψ = ½atan2(S₂,S₁)) and alters the ellipticity.", "تغییر دامنه x مؤلفه خطی را می‌چرخاند (آزیموت ψ = ½atan2(S₂,S₁)) و بیضویت را تغییر می‌دهد."),
    E_y: B("Equal amplitudes with δ = ±90° give circular polarization; unequal → elliptical.", "دامنه‌های برابر با δ = ±90° قطبش دایره‌ای می‌دهند؛ نابرابر ← بیضوی."),
    δ: B("The phase difference δ between E_x and E_y defines handedness and ellipticity: S₃ = 2E_xE_y sinδ.", "اختلاف فاز δ بین E_x و E_y دست‌گردی و بیضویت را تعریف می‌کند: S₃ = 2E_xE_y sinδ."),
    Δn: B("Birefringence Δn = |n_x − n_y| produces retardation 2πΔnL/λ; the state repeats every beat length L_B = λ/Δn (PMF: ~3–5 mm; standard SMF: ~10–50 m).", "دوشکستی Δn = |n_x − n_y| تأخیر فاز 2πΔnL/λ ایجاد می‌کند؛ حالت هر طول ضربان L_B = λ/Δn تکرار می‌شود (PMF: ~۳–۵ mm؛ SMF استاندارد: ~۱۰–۵۰ m)."),
    L: B("In a uniform birefringent fiber the SOP traces a circle on the Poincaré sphere around the birefringence axis as z increases.", "در فیبر دوشکست یکنواخت با افزایش z، SOP دایره‌ای روی کره پوانکاره حول محور دوشکستی رسم می‌کند."),
    D_PMD: B("Random mode coupling makes DGD grow as √L: Δτ = D_PMD√L. Legacy fiber ~0.5–2 ps/√km, modern ≤0.1 ps/√km; tolerance ≈ 10% of the bit period.", "کوپلینگ تصادفی مود باعث رشد DGD با √L می‌شود: Δτ = D_PMD√L. فیبر قدیمی ~۰٫۵–۲ ps/√km، مدرن ≤0.1 ps/√km؛ تحمل ≈ ۱۰٪ بازه بیت."),
  });
  const ph = (sim.t * 12) % 360;
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "حالت قطبش" : "Polarization state"} className="space-y-4">
        <Slider label="E_x" value={Ex} min={0} max={1} step={0.01} onChange={setEx} /><Slider label="E_y" value={Ey} min={0} max={1} step={0.01} onChange={setEy} />
        <Slider label="δ (phase)" value={delta} min={-180} max={180} step={1} unit="°" onChange={setDelta} />
        <div className="text-xs font-semibold pt-2">{lang === "fa" ? "فیبر دوشکست / کنترل‌کننده قطبش" : "Birefringent fiber / polarization controller"}</div>
        <Toggle checked={pmf} onChange={setPmf} label={lang === "fa" ? "فیبر حافظ قطبش (تزریق روی محور)" : "Polarization-maintaining fiber (launch on axis)"} />
        <Slider label="Δn (birefringence)" value={dnB} min={1e-7} max={1e-3} step={1e-7} onChange={setDnB} fmt={(v) => v.toExponential(2)} />
        <Slider label="L" value={L} min={0} max={10} step={0.001} unit="m" onChange={setL} fmt={(v) => v.toFixed(3)} />
        <Slider label="λ" value={lam} min={1300} max={1600} step={1} unit="nm" onChange={setLam} />
        <div className="text-xs font-semibold pt-2">PMD</div>
        <Slider label="D_PMD" value={Dpmd} min={0.02} max={2} step={0.01} unit="ps/√km" onChange={setDpmd} /><Slider label="L_link" value={Lpmd} min={1} max={1000} step={1} unit="km" onChange={setLpmd} />
        <RecordBar onRecord={() => record({ Ex, Ey, delta_deg: delta, dn: dnB, L_m: L, D_pmd: Dpmd, L_km: Lpmd }, { theory: +st.dop.toFixed(4), measured: +measDop.toFixed(4), kind: st.kind, psi_deg: +st.psi.toFixed(2), chi_deg: +st.chi.toFixed(2), pmd_ps: +pmd.toFixed(3), pmd_meas: +measPmd.toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={lang === "fa" ? "بیضی قطبش" : "Polarization ellipse"} right={<Badge>{kindName[st.kind]}</Badge>}>
            <svg viewBox="-1.3 -1.3 2.6 2.6" className="w-full ltr" style={{ maxHeight: 240 }}>
              <line x1={-1.2} y1={0} x2={1.2} y2={0} stroke="currentColor" strokeWidth=".01" opacity=".4" /><line x1={0} y1={-1.2} x2={0} y2={1.2} stroke="currentColor" strokeWidth=".01" opacity=".4" />
              <polyline points={st.ellipse.map((p) => `${p.x},${-p.y}`).join(" ")} fill="rgba(51,123,255,.12)" stroke="#337bff" strokeWidth=".03" />
              {(() => { const t = P.rad(ph); const x = Ex * Math.cos(t), y = Ey * Math.cos(t + P.rad(totalDelta)); return <g><line x1={0} y1={0} x2={x} y2={-y} stroke="#f43f5e" strokeWidth=".035" /><circle cx={x} cy={-y} r=".06" fill="#f43f5e" /><line x1={0} y1={0} x2={x} y2={0} stroke="#10b981" strokeWidth=".02" strokeDasharray=".05 .03" /><line x1={0} y1={0} x2={0} y2={-y} stroke="#f59e0b" strokeWidth=".02" strokeDasharray=".05 .03" /></g>; })()}
              <text x={1.05} y={-0.05} fontSize=".12" fill="currentColor">x</text><text x={0.05} y={-1.05} fontSize=".12" fill="currentColor">y</text>
            </svg>
            <div className="grid grid-cols-2 gap-2 mt-2"><Stat label="ψ (azimuth)" value={fmt(st.psi, 1)} unit="°" /><Stat label="χ (ellipticity)" value={fmt(st.chi, 1)} unit="°" /><Stat label="DOP" value={fmt(st.dop, 3)} /><Stat label="δ_total" value={fmt(totalDelta, 1)} unit="°" /></div>
          </Panel>
          <Panel title={lang === "fa" ? "کره پوانکاره (تصویر)" : "Poincaré sphere (projection)"}>
            <svg viewBox="-1.3 -1.3 2.6 2.6" className="w-full ltr" style={{ maxHeight: 240 }}>
              <circle cx={0} cy={0} r={1} fill="rgba(139,92,246,.08)" stroke="#8b5cf6" strokeWidth=".02" />
              <ellipse cx={0} cy={0} rx={1} ry={0.3} fill="none" stroke="#8b5cf6" strokeWidth=".012" strokeDasharray=".04 .03" />
              <line x1={-1} y1={0} x2={1} y2={0} stroke="currentColor" strokeWidth=".01" opacity=".4" /><line x1={0} y1={-1} x2={0} y2={1} stroke="currentColor" strokeWidth=".01" opacity=".4" />
              <text x={1.02} y={0.05} fontSize=".1" fill="currentColor">S₁ (H)</text><text x={-1.25} y={0.05} fontSize=".1" fill="currentColor">V</text><text x={0.03} y={-1.05} fontSize=".1" fill="currentColor">S₃ (RCP)</text><text x={0.03} y={1.12} fontSize=".1" fill="currentColor">LCP</text>
              <polyline points={evo.map((p) => `${p.S1 / (st.S0 || 1) + 0.3 * p.S2 / (st.S0 || 1)},${-p.S3 / (st.S0 || 1) + 0.15 * p.S2 / (st.S0 || 1)}`).join(" ")} fill="none" stroke="#10b981" strokeWidth=".02" />
              {(() => { const s0 = st.S0 || 1; const x = st.S1 / s0 + 0.3 * st.S2 / s0, y = -st.S3 / s0 + 0.15 * st.S2 / s0; return <circle cx={x} cy={y} r=".07" fill="#f43f5e" />; })()}
            </svg>
            <div className="grid grid-cols-3 gap-2 mt-2"><Stat label="S₁" value={fmt(st.S1 / (st.S0 || 1), 3)} /><Stat label="S₂" value={fmt(st.S2 / (st.S0 || 1), 3)} /><Stat label="S₃" value={fmt(st.S3 / (st.S0 || 1), 3)} /></div>
          </Panel>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={lang === "fa" ? "دوشکستی" : "Birefringence"}><div className="grid grid-cols-2 gap-2"><Stat label="L_B (beat length)" value={LB < 1 ? fmt(LB * 1000, 2) : fmt(LB, 2)} unit={LB < 1 ? "mm" : "m"} tone="brand" /><Stat label={lang === "fa" ? "تأخیر فاز" : "Retardation"} value={fmt(retard % 360, 1)} unit="°" /><Stat label="Δτ (DGD, L)" value={fmt((dnB * L) / P.C * 1e12, 4)} unit="ps" /><Stat label={lang === "fa" ? "PMD لینک" : "Link PMD"} value={fmt(pmd, 2)} unit="ps" tone={pmd > 10 ? "bad" : "good"} /></div>
            <div className="mt-3"><Compare rows={[{ label: "DOP", theory: st.dop, measured: measDop }, { label: "PMD (ps)", theory: pmd, measured: measPmd }]} /></div></Panel>
          <Panel title="PMD vs link length"><XYChart data={pmdCurve} series={[{ key: "pmd", name: "Δτ (ps)" }, { key: "limit10", name: "10 Gb/s limit", color: "#f59e0b", dash: true }, { key: "limit40", name: "40 Gb/s limit", color: "#f43f5e", dash: true }]} xLabel="L (km)" yLabel="ps" height={200} refX={[{ x: Lpmd, label: "L" }]} legend brush={false} /></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Nonlinear effects ============
function NonlinearSim({ model, noise, record, lang }: SimProps) {
  const [P0, setP0] = useState(10), [gamma, setGamma] = useState(1.3), [L, setL] = useState(50), [Aeff, setAeff] = useState(80), [lw, setLw] = useState(10), [nCh, setNCh] = useState(8), [sp, setSp] = useState(50), [D, setD] = useState(17), [T0, setT0] = useState(10);
  const [fx, setFx] = useState({ kerr: true, spm: true, xpm: true, fwm: true, srs: true, sbs: true });
  const m = P.nonlinearMetrics({ P0mW: P0, gamma, Lkm: L, alphaDb: 0.2, Aeff, linewidthMHz: lw, nCh, spacingGHz: sp, D, lambda: 1550 });
  const beta2 = P.beta2FromD(D, 1550);
  const sim = useMemo(() => P.nlse({ T0ps: T0, P0W: (fx.kerr && fx.spm ? P0 : 0) * 1e-3, beta2: 0, gamma, Lkm: Math.min(L, 100), alphaDb: 0.2, steps: 60, N: 512, shape: "gauss", snapshots: 4 }), [T0, P0, gamma, L, fx]);
  const simIn = useMemo(() => P.nlse({ T0ps: T0, P0W: P0 * 1e-3, beta2: 0, gamma: 0, Lkm: 0.001, alphaDb: 0, steps: 1, N: 512, shape: "gauss", snapshots: 1 }), [T0, P0]);
  const spec = useMemo(() => { const mx = Math.max(...simIn.spec); return sim.freq.map((f: number, i: number) => ({ x: +(f * 1000).toFixed(2), out: +(10 * Math.log10(sim.spec[i] / mx + 1e-9)).toFixed(2), in: +(10 * Math.log10(simIn.spec[i] / mx + 1e-9)).toFixed(2) })).filter((p) => Math.abs(p.x) < 3000 / T0); }, [sim, simIn, T0]);
  const measPhi = useMemo(() => noisy(m.phiSPM, 0.05, model, noise.meas), [m.phiSPM, model, noise]);
  const srsRatio = P0 / m.PthSRS, sbsRatio = P0 / m.PthSBS;
  const explain = useExplain({ P0, γ: gamma, L, A_eff: Aeff, Δν: lw, N: nCh, Δf: sp, D }, {
    P0: B("All Kerr effects scale with power: φ_SPM = γP₀L_eff. SBS threshold (~mW for CW narrow-linewidth) is the first nonlinear limit reached.", "همه اثرات کر با توان مقیاس می‌شوند: φ_SPM = γP₀L_eff. آستانه SBS (~mW برای CW باریک‌خط) اولین حد غیرخطی است."),
    γ: B("γ = 2πn₂/(λA_eff) with n₂ ≈ 2.6×10⁻²⁰ m²/W; SMF ≈ 1.3, DCF ≈ 5, HNLF ≈ 10–20 W⁻¹km⁻¹.", "γ = 2πn₂/(λA_eff) با n₂ ≈ 2.6×10⁻²⁰ m²/W؛ SMF ≈ 1.3، DCF ≈ 5، HNLF ≈ 10–20 W⁻¹km⁻¹."),
    L: B("Nonlinear interaction saturates at L_eff = (1 − e^{−αL})/α ≈ 21.7 km for α = 0.2 dB/km.", "برهم‌کنش غیرخطی در L_eff = (1 − e^{−αL})/α ≈ 21.7 km برای α = 0.2 dB/km اشباع می‌شود."),
    A_eff: B("Larger effective area dilutes intensity → lower γ and higher SRS/SBS thresholds (large-A_eff fibers for submarine links).", "سطح مؤثر بزرگ‌تر شدت را رقیق می‌کند ← γ کمتر و آستانه‌های SRS/SBS بالاتر (فیبرهای A_eff بزرگ برای لینک‌های زیردریایی)."),
    Δν: B("SBS threshold rises with source linewidth: P_th ∝ (1 + Δν_L/Δν_B), Δν_B ≈ 20 MHz — dithering the laser suppresses SBS.", "آستانه SBS با پهنای خط منبع زیاد می‌شود: P_th ∝ (1 + Δν_L/Δν_B) با Δν_B ≈ 20 MHz — لرزاندن لیزر SBS را سرکوب می‌کند."),
    N: B("XPM from N−1 neighbours is twice as effective as SPM per unit power: φ_XPM = 2γL_eff Σ P_j.", "XPM از N−1 همسایه به ازای واحد توان دو برابر SPM مؤثر است: φ_XPM = 2γL_eff Σ P_j."),
    Δf: B("FWM efficiency drops as (β₂Δω²)² grows — wider spacing or more dispersion suppresses it.", "بازده FWM با رشد (β₂Δω²)² کاهش می‌یابد — فاصله بیشتر یا پاشندگی بیشتر آن را سرکوب می‌کند."),
    D: B("Dispersion walks channels off each other, reducing XPM/FWM; but it must later be compensated. This is the design logic of NZ-DSF.", "پاشندگی کانال‌ها را از هم دور می‌کند و XPM/FWM را کم می‌کند؛ اما بعداً باید جبران شود. این منطق طراحی NZ-DSF است."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترها" : "Parameters"} className="space-y-3">
        <Slider label="P₀ (per channel)" value={P0} min={0.1} max={500} step={0.1} unit="mW" onChange={setP0} fmt={(v) => `${v.toFixed(1)} (${P.mW2dBm(v).toFixed(1)} dBm)`} />
        <Slider label="γ" value={gamma} min={0.5} max={20} step={0.1} unit="W⁻¹km⁻¹" onChange={setGamma} />
        <Slider label="L" value={L} min={1} max={200} step={1} unit="km" onChange={setL} />
        <Slider label="A_eff" value={Aeff} min={10} max={150} step={1} unit="µm²" onChange={setAeff} />
        <Slider label={lang === "fa" ? "پهنای خط لیزر" : "Laser linewidth"} value={lw} min={0.1} max={1000} step={0.1} unit="MHz" onChange={setLw} />
        <Slider label="N channels" value={nCh} min={1} max={80} step={1} onChange={setNCh} /><Slider label="Δf" value={sp} min={12.5} max={200} step={12.5} unit="GHz" onChange={setSp} />
        <Slider label="D" value={D} min={-5} max={20} step={0.1} unit="ps/(nm·km)" onChange={setD} /><Slider label="T₀ (pulse)" value={T0} min={1} max={100} step={1} unit="ps" onChange={setT0} />
        <div className="grid grid-cols-2 gap-x-3 pt-1">{(Object.keys(fx) as (keyof typeof fx)[]).map((k) => <Toggle key={k} checked={fx[k]} onChange={(v) => setFx((p) => ({ ...p, [k]: v }))} label={k.toUpperCase()} />)}</div>
        <RecordBar onRecord={() => record({ P0_mW: P0, gamma, L_km: L, Aeff, linewidth_MHz: lw, N: nCh, spacing_GHz: sp, D }, { theory: +m.phiSPM.toFixed(4), measured: +measPhi.toFixed(4), Leff_km: +m.Leff.toFixed(2), Pth_SRS_mW: +m.PthSRS.toFixed(1), Pth_SBS_mW: +m.PthSBS.toFixed(2), eta_FWM: +m.etaFWM.toFixed(4) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="L_eff" value={fmt(m.Leff, 2)} unit="km" /><Stat label="L_NL" value={fmt(m.LNL, 2)} unit="km" /><Stat label="φ_SPM" value={fx.spm && fx.kerr ? fmt(m.phiSPM, 3) : "off"} unit="rad" tone={m.phiSPM > 1 ? "warn" : "good"} /><Stat label="φ_XPM" value={fx.xpm && fx.kerr ? fmt(m.phiXPM, 3) : "off"} unit="rad" tone={m.phiXPM > 1 ? "bad" : "good"} />
          <Stat label="P_th SRS" value={fmt(m.PthSRS, 0)} unit="mW" tone={fx.srs && srsRatio > 1 ? "bad" : "good"} sub={fx.srs ? `P₀/P_th = ${srsRatio.toFixed(3)}` : "off"} /><Stat label="P_th SBS" value={fmt(m.PthSBS, 2)} unit="mW" tone={fx.sbs && sbsRatio > 1 ? "bad" : "good"} sub={fx.sbs ? `P₀/P_th = ${sbsRatio.toFixed(2)}` : "off"} /><Stat label="η_FWM" value={fx.fwm && fx.kerr ? fmt(10 * Math.log10(m.etaFWM), 1) : "off"} unit="dB" tone={m.etaFWM > 0.1 ? "bad" : "good"} /><Stat label="β₂" value={fmt(beta2, 2)} unit="ps²/km" />
        </div>
        <Panel title={lang === "fa" ? "پهن‌شدگی طیفی SPM (خروجی NLSE با β₂ = 0)" : "SPM spectral broadening (NLSE output with β₂ = 0)"}><XYChart data={spec} series={[{ key: "in", name: "input", dash: true }, { key: "out", name: "output", color: Palette[1] }]} xLabel="Δf (GHz)" yLabel="dB (norm.)" height={240} yDomain={[-50, 5]} legend brush={false} />
          <div className="text-[10px] muted mt-1">{lang === "fa" ? `تعداد قله‌ها ≈ φ_max/π + ½ ≈ ${(m.phiSPM / Math.PI + 0.5).toFixed(1)} — ساختار چندقله‌ای نشانه کلاسیک SPM است.` : `Number of peaks ≈ φ_max/π + ½ ≈ ${(m.phiSPM / Math.PI + 0.5).toFixed(1)} — the multi-peak structure is the classic SPM signature.`}</div></Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={lang === "fa" ? "وضعیت اثرات" : "Effect status"}>
            <ul className="text-xs space-y-1.5">
              {[{ n: "SBS", on: fx.sbs, bad: sbsRatio > 1, msg: lang === "fa" ? "بازتاب به عقب استوکس (−11 GHz)؛ توان عبوری محدود می‌شود" : "Backward Stokes (−11 GHz); transmitted power clamps" }, { n: "SRS", on: fx.srs, bad: srsRatio > 1, msg: lang === "fa" ? "انتقال توان به +13 THz (شیب رامان در WDM)" : "Power transfer to +13 THz (Raman tilt in WDM)" }, { n: "SPM", on: fx.spm && fx.kerr, bad: m.phiSPM > 1, msg: lang === "fa" ? "چیرپ خودالقایی + پهن‌شدگی طیف؛ با D>0 پالس فشرده/سالیتون" : "Self-chirp + spectral broadening; with D>0 pulse compression/soliton" }, { n: "XPM", on: fx.xpm && fx.kerr, bad: m.phiXPM > 1, msg: lang === "fa" ? "جیتر زمانی و دامنه در کانال‌های مجاور" : "Timing/amplitude jitter on neighbour channels" }, { n: "FWM", on: fx.fwm && fx.kerr, bad: m.etaFWM > 0.1, msg: lang === "fa" ? `${m.nFWM} محصول اختلاط؛ همشنوایی درون‌باندی` : `${m.nFWM} mixing products; in-band crosstalk` }].map((e) => <li key={e.n} className="flex items-center gap-2"><Badge tone={!e.on ? "muted" : e.bad ? "bad" : "good"}>{e.n}</Badge><span className={!e.on ? "muted line-through" : ""}>{e.msg}</span></li>)}
            </ul>
          </Panel>
          <Panel title={lang === "fa" ? "نظریه در برابر اندازه‌گیری" : "Theory vs measurement"}><Compare rows={[{ label: "φ_SPM (rad)", theory: m.phiSPM, measured: measPhi }]} /><Callout tone="info">{lang === "fa" ? "توان بهینه تزریق در سیستم تقویت‌شده جایی است که نویز غیرخطی ≈ نصف ASE باشد (مدل GN): P_opt ≈ (P_ASE/2η)^{1/3}." : "Optimum launch power in amplified systems sits where nonlinear noise ≈ half the ASE (GN model): P_opt ≈ (P_ASE/2η)^{1/3}."}</Callout></Panel>
        </div>
      </div>
    </div>
  );
}

// ============ Soliton / NLSE ============
function SolitonSim({ model, noise, record, lang, sim: simState }: SimProps) {
  const [T0, setT0] = useState(10), [P0, setP0] = useState(0), [D, setD] = useState(17), [gamma, setGamma] = useState(1.3), [L, setL] = useState(100), [alpha, setAlpha] = useState(0), [shape, setShape] = useState<"sech" | "gauss">("sech"), [chirp, setChirp] = useState(0), [auto, setAuto] = useState(true);
  const beta2 = P.beta2FromD(D, 1550); // ps²/km
  const Psol = Math.abs(beta2) / (gamma * T0 * T0); // W for N=1
  const Puse = auto ? Psol : P0;
  const res = useMemo(() => P.nlse({ T0ps: T0, P0W: Puse, beta2, gamma, Lkm: L, alphaDb: alpha, steps: 200, N: 256, shape, snapshots: 60, chirp }), [T0, Puse, beta2, gamma, L, alpha, shape, chirp]);
  const idx = Math.min(res.evolution.length - 1, simState.running || simState.t > 0 ? simState.t % res.evolution.length : res.evolution.length - 1);
  const snap = res.evolution[idx];
  const fwhm = (arr: number[]) => { const mx = Math.max(...arr); const half = arr.map((v, i) => (v >= mx / 2 ? i : -1)).filter((i) => i >= 0); return half.length ? (half[half.length - 1] - half[0]) * (res.t[1] - res.t[0]) : 0; };
  const win = fwhm(res.evolution[0]), wout = fwhm(res.evolution[res.evolution.length - 1]);
  const linearOut = Math.sqrt(1 + Math.pow(L / res.LD, 2)) * win;
  const measW = useMemo(() => noisy(wout, 0.04, model, noise.meas), [wout, model, noise]);
  const pulseData = useMemo(() => res.t.map((t: number, i: number) => ({ x: +t.toFixed(2), in: +(res.evolution[0][i] * 1e3).toFixed(4), z: +(snap[i] * 1e3).toFixed(4) })).filter((p) => Math.abs(p.x) < 8 * T0), [res, snap, T0]);
  const explain = useExplain({ T0, P0: Puse, D, γ: gamma, L, α: alpha, C: chirp }, {
    T0: B("Soliton power scales as 1/T₀²: shorter pulses need much more peak power (P₁ = |β₂|/(γT₀²)).", "توان سالیتون با 1/T₀² مقیاس می‌شود: پالس‌های کوتاه‌تر توان پیک بسیار بیشتری نیاز دارند (P₁ = |β₂|/(γT₀²))."),
    P0: B("N = √(γP₀T₀²/|β₂|): N<1 → dispersion dominates (broadening); N=1 → fundamental soliton (shape preserved); N=2,3 → higher-order solitons that breathe with period z₀ = πL_D/2.", "N = √(γP₀T₀²/|β₂|): N<1 ← پاشندگی غالب (پهن‌شدگی)؛ N=1 ← سالیتون بنیادی (شکل حفظ می‌شود)؛ N=2,3 ← سالیتون‌های مرتبه بالاتر که با دوره z₀ = πL_D/2 تنفس می‌کنند."),
    D: B("Solitons need anomalous dispersion (D > 0, β₂ < 0) so that SPM chirp and GVD chirp cancel. For D < 0 the pulse broadens faster than linear (SPM + normal GVD).", "سالیتون به پاشندگی نابهنجار (D > 0، β₂ < 0) نیاز دارد تا چیرپ SPM و چیرپ GVD یکدیگر را خنثی کنند. برای D < 0 پالس سریع‌تر از حالت خطی پهن می‌شود (SPM + GVD بهنجار)."),
    γ: B("Higher nonlinearity lowers the soliton power and shortens L_NL.", "غیرخطی بودن بیشتر توان سالیتون را کم و L_NL را کوتاه می‌کند."),
    L: B("Watch the evolution over several dispersion lengths L_D = T₀²/|β₂| to see whether the pulse is stationary.", "تحول را روی چند طول پاشندگی L_D = T₀²/|β₂| دنبال کنید تا ببینید آیا پالس ایستاست."),
    α: B("Loss reduces peak power so N drifts below 1 and the soliton broadens adiabatically; periodic amplification (average-soliton regime) restores it.", "تلفات توان پیک را کم می‌کند و N زیر ۱ می‌رود و سالیتون به‌طور بی‌دررو پهن می‌شود؛ تقویت متناوب (رژیم سالیتون میانگین) آن را بازیابی می‌کند."),
    C: B("Initial chirp with the opposite sign of β₂ first compresses the pulse (like pre-chirped transmission), then it broadens.", "چیرپ اولیه با علامت مخالف β₂ ابتدا پالس را فشرده می‌کند (مانند ارسال پیش‌چیرپ‌شده)، سپس پهن می‌شود."),
  });
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Panel title={lang === "fa" ? "پارامترهای NLSE" : "NLSE parameters"} className="space-y-3">
        <Segmented value={shape} onChange={setShape} options={[{ value: "sech", label: "sech" }, { value: "gauss", label: "Gaussian" }]} />
        <Slider label="T₀" value={T0} min={1} max={50} step={0.5} unit="ps" onChange={setT0} />
        <Segmented value={auto ? "auto" : "man"} onChange={(v) => setAuto(v === "auto")} options={[{ value: "auto", label: lang === "fa" ? "P₀ = توان سالیتون N=1" : "P₀ = N=1 soliton power" }, { value: "man", label: lang === "fa" ? "P₀ دستی" : "manual P₀" }]} />
        {!auto && <Slider label="P₀ (peak)" value={P0} min={0} max={Math.max(0.05, Psol * 12)} step={Psol / 50} unit="W" onChange={setP0} fmt={(v) => v.toFixed(4)} />}
        <Slider label="D" value={D} min={-20} max={25} step={0.5} unit="ps/(nm·km)" onChange={setD} />
        <Slider label="γ" value={gamma} min={0.5} max={10} step={0.1} unit="W⁻¹km⁻¹" onChange={setGamma} />
        <Slider label="L" value={L} min={1} max={500} step={1} unit="km" onChange={setL} />
        <Slider label="α" value={alpha} min={0} max={0.5} step={0.01} unit="dB/km" onChange={setAlpha} />
        <Slider label="C (chirp)" value={chirp} min={-3} max={3} step={0.1} onChange={setChirp} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="N (soliton order)" value={fmt(res.Nsol, 2)} tone={Math.abs(res.Nsol - 1) < 0.1 ? "good" : "warn"} /><Stat label="P₁ (N=1)" value={Psol < 0.01 ? fmt(Psol * 1000, 2) + " mW" : fmt(Psol, 3) + " W"} />
          <Stat label="L_D" value={fmt(res.LD, 1)} unit="km" /><Stat label="L_NL" value={Number.isFinite(res.LNL) ? fmt(res.LNL, 1) : "∞"} unit="km" />
          <Stat label="z₀ (soliton period)" value={fmt((Math.PI / 2) * res.LD, 1)} unit="km" /><Stat label="β₂" value={fmt(beta2, 2)} unit="ps²/km" tone={beta2 < 0 ? "good" : "bad"} sub={beta2 < 0 ? "anomalous" : "normal"} />
        </div>
        <RecordBar onRecord={() => record({ T0_ps: T0, P0_W: +Puse.toFixed(5), D, gamma, L_km: L, alpha, shape, chirp }, { theory: +linearOut.toFixed(3), measured: +measW.toFixed(3), N: +res.Nsol.toFixed(3), fwhm_in: +win.toFixed(3), fwhm_out_nlse: +wout.toFixed(3) })} />
        {explain}
      </Panel>
      <div className="lg:col-span-2 space-y-4">
        <Panel title={lang === "fa" ? "تحول پالس در طول فیبر |A(z,T)|²" : "Pulse evolution along fiber |A(z,T)|²"} right={<span className="num text-[10px] muted">z = {res.zs[idx]?.toFixed(1)} km</span>}>
          <Heatmap data={res.evolution.map((row) => row.filter((_, i) => Math.abs(res.t[i]) < 8 * T0))} xLabel={`T (−${8 * T0} … +${8 * T0} ps)`} yLabel={`z: 0 → ${L} km ↑`} height={230} />
        </Panel>
        <div className="grid md:grid-cols-2 gap-4">
          <Panel title={lang === "fa" ? "شکل پالس" : "Pulse shape"}><XYChart data={pulseData} series={[{ key: "in", name: "z = 0", dash: true }, { key: "z", name: `z = ${res.zs[idx]?.toFixed(0)} km`, color: Palette[1] }]} xLabel="T (ps)" yLabel="P (mW)" height={210} legend brush={false} /></Panel>
          <Panel title={lang === "fa" ? "خطی در برابر NLSE" : "Linear vs NLSE"}>
            <div className="grid grid-cols-2 gap-2 mb-2"><Stat label="FWHM in" value={fmt(win, 2)} unit="ps" /><Stat label={lang === "fa" ? "FWHM خروجی (NLSE)" : "FWHM out (NLSE)"} value={fmt(wout, 2)} unit="ps" tone="brand" /><Stat label={lang === "fa" ? "خطی (فقط GVD)" : "Linear (GVD only)"} value={fmt(linearOut, 2)} unit="ps" /><Stat label={lang === "fa" ? "نسبت" : "Ratio"} value={fmt(wout / win, 3)} tone={Math.abs(wout / win - 1) < 0.1 ? "good" : "warn"} /></div>
            <Compare rows={[{ label: lang === "fa" ? "FWHM خروجی (خطی در برابر شبیه‌سازی)" : "FWHM out (linear theory vs sim)", theory: linearOut, measured: measW, unit: "ps" }]} />
            <div className="text-[10px] muted mt-2">{lang === "fa" ? "«نظری» در اینجا مدل خطی است؛ اختلاف با NLSE اثر خالص غیرخطی را نشان می‌دهد." : "“Theory” here is the linear model; the deviation from NLSE isolates the nonlinear effect."}</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const q = B;
export const advancedExperiments: ExperimentDef[] = [
  { id: "fbg", num: 16, category: "advanced", level: 2, title: q("Fiber Bragg Grating — Reflection Spectrum & Sensing", "توری براگ فیبری — طیف بازتاب و حسگری"), short: q("Coupled-mode theory spectrum; shift λ_B with temperature and strain.", "طیف نظریه مود جفت‌شده؛ جابه‌جایی λ_B با دما و کرنش."),
    objective: q("Compute the FBG reflection spectrum from coupled-mode theory and calibrate its temperature and strain sensitivities.", "محاسبه طیف بازتاب FBG از نظریه مود جفت‌شده و کالیبراسیون حساسیت دما و کرنش آن."),
    prerequisites: [q("Bragg condition & phase matching", "شرط براگ و تطبیق فاز"), q("Effective index", "ضریب مؤثر")],
    equipment: [q("FBG interrogator / tunable laser + OSA", "بازخوان FBG"), q("Circulator", "سیرکولاتور"), q("Thermal chamber, strain stage", "محفظه حرارتی، پایه کرنش")],
    theory: { basic: q("A periodic ripple of refractive index inside the core reflects one specific wavelength λ_B = 2n_effΛ and lets the others pass — a fiber mirror for one colour. Heating or stretching the fiber changes Λ and n_eff, shifting λ_B: this is how FBG sensors work.", "موج دوره‌ای ضریب شکست در هسته یک طول موج خاص λ_B = 2n_effΛ را بازتاب و بقیه را عبور می‌دهد — آینه فیبری برای یک رنگ. گرم یا کشیده شدن فیبر Λ و n_eff را تغییر و λ_B را جابه‌جا می‌کند: حسگرهای FBG این‌گونه کار می‌کنند."),
      engineering: q("R_max = tanh²(κL), κ = πΔn·η/λ_B. Bandwidth Δλ ≈ (λ_B²/πn_effL)√((κL)²+π²). Sensitivities at 1550 nm: 1.2 pm/µε and 13 pm/°C. Applications: DWDM add/drop filters, dispersion compensation (chirped FBG), laser stabilization, structural health monitoring, quasi-distributed sensing via WDM of gratings.", "R_max = tanh²(κL) با κ = πΔn·η/λ_B. پهنای باند Δλ ≈ (λ_B²/πn_effL)√((κL)²+π²). حساسیت‌ها در ۱۵۵۰ nm: 1.2 pm/µε و 13 pm/°C. کاربردها: فیلترهای add/drop در DWDM، جبران پاشندگی (FBG چیرپ‌دار)، پایدارسازی لیزر، پایش سلامت سازه، حسگری شبه‌توزیعی با WDM توری‌ها."),
      advanced: q("Coupled-mode equations dR/dz = iσ̂R + iκS, dS/dz = −iσ̂S − iκ*R with detuning σ̂ = δ + σ − ½dφ/dz yield the closed-form R(δ) = sinh²(sL)/(cosh²(sL) − δ²/κ²), s = √(κ²−δ²). Apodization (Gaussian/raised-cosine Δn envelope) suppresses sidelobes; chirped gratings give wavelength-dependent group delay τ = 2n_eff z(λ)/c for dispersion compensation.", "معادلات مود جفت‌شده dR/dz = iσ̂R + iκS و dS/dz = −iσ̂S − iκ*R با ناکوکی σ̂ = δ + σ − ½dφ/dz جواب بسته R(δ) = sinh²(sL)/(cosh²(sL) − δ²/κ²) با s = √(κ²−δ²) می‌دهند. آپودیزاسیون (پوش گاوسی/کسینوس برآمده Δn) لوب‌های کناری را سرکوب می‌کند؛ توری‌های چیرپ‌دار تأخیر گروهی وابسته به طول موج τ = 2n_eff z(λ)/c برای جبران پاشندگی می‌دهند."),
      research: q("Transfer-matrix (piecewise-uniform) method handles arbitrary apodization/chirp/phase shifts (π-shifted DFB filters). Temperature–strain discrimination uses dual gratings or hybrid FBG/LPG. Femtosecond-written gratings survive >1000 °C; FBG arrays interrogated by OFDR or wavelength-swept lasers reach kHz rates for dynamic strain.", "روش ماتریس انتقال (یکنواخت تکه‌ای) آپودیزاسیون/چیرپ/جابه‌جایی فاز دلخواه (فیلترهای DFB با جابه‌جایی π) را پوشش می‌دهد. تفکیک دما–کرنش از توری‌های دوگانه یا ترکیب FBG/LPG استفاده می‌کند. توری‌های نوشته‌شده با فمتوثانیه بالای ۱۰۰۰ °C دوام می‌آورند؛ آرایه‌های FBG با OFDR یا لیزرهای جاروبی به نرخ kHz برای کرنش دینامیکی می‌رسند.") },
    equations: [{ eq: "λ_B = 2 n_eff Λ", desc: q("Bragg condition", "شرط براگ") }, { eq: "R(δ) = sinh²(sL) / (cosh²(sL) − δ²/κ²),  s = √(κ² − δ²)", desc: q("Uniform grating reflectivity (coupled-mode theory)", "بازتاب توری یکنواخت") }, { eq: "κ = π Δn / λ_B,   R_max = tanh²(κL)", desc: q("Coupling coefficient & peak reflectivity", "ضریب کوپلینگ و بازتاب قله") }, { eq: "Δλ_B/λ_B = (1 − p_e) ε + (α + ξ) ΔT", desc: q("Strain–temperature response (p_e≈0.22, α≈0.55e-6, ξ≈8.6e-6 /°C)", "پاسخ کرنش–دما") }],
    procedure: [q("Λ = 535.2 nm, n_eff = 1.4482 → verify λ_B ≈ 1550 nm.", "Λ = 535.2 nm و n_eff = 1.4482 ← تأیید λ_B ≈ 1550 nm."), q("Vary L and Δn; record R_max and FWHM; check tanh² law.", "L و Δn را تغییر دهید؛ R_max و FWHM را ثبت و قانون tanh² را بررسی کنید."), q("Sweep ΔT 0→100 °C in 20 °C steps and record λ_B; fit the slope (pm/°C).", "ΔT را از ۰ تا ۱۰۰ °C با گام ۲۰ جاروب و λ_B را ثبت کنید؛ شیب (pm/°C) را برازش کنید."), q("Repeat with strain 0→2000 µε; fit pm/µε.", "با کرنش ۰→۲۰۰۰ µε تکرار کنید؛ pm/µε را برازش کنید.")],
    errors: [q("Cross-sensitivity temperature/strain.", "حساسیت متقابل دما/کرنش."), q("Interrogator wavelength accuracy (±1–5 pm).", "دقت طول موج بازخوان."), q("Adhesive strain transfer < 100%.", "انتقال کرنش چسب کمتر از ۱۰۰٪.")],
    conclusion: q("FBGs are narrowband fiber mirrors whose λ_B is a linear, well-calibrated function of temperature and strain.", "FBGها آینه‌های فیبری باریک‌باندی هستند که λ_B آن‌ها تابعی خطی و کالیبره از دما و کرنش است."),
    questions: [{ q: q("Λ = 530 nm, n_eff = 1.45 → λ_B (nm)?", "Λ = 530 nm و n_eff = 1.45 ← λ_B (nm)؟"), type: "numeric", answer: 1537, tolerance: 2, unit: "nm", hints: [q("λ_B = 2 n_eff Λ.", "λ_B = 2 n_eff Λ."), q("2 × 1.45 × 530.", "2 × 1.45 × 530.")], explanation: q("λ_B = 2 × 1.45 × 530 = 1537 nm.", "λ_B = 2 × 1.45 × 530 = 1537 nm.") }, { q: q("A 130 pm shift at 1550 nm with no strain corresponds to ΔT ≈ ?", "جابه‌جایی ۱۳۰ pm در ۱۵۵۰ nm بدون کرنش معادل ΔT ≈ ؟"), type: "numeric", answer: 10, tolerance: 1, unit: "°C", hints: [q("~13 pm/°C.", "~۱۳ pm/°C."), q("130/13.", "130/13.")], explanation: q("ΔT ≈ 130 pm / 13 pm/°C ≈ 10 °C.", "ΔT ≈ 130 pm / 13 pm/°C ≈ 10 °C.") }],
    numerics: q("The spectrum is evaluated analytically per wavelength from the closed-form coupled-mode solution (400 points); for κ² < δ² the hyperbolic functions become trigonometric (sidelobes).", "طیف به‌صورت تحلیلی برای هر طول موج از جواب بسته مود جفت‌شده (۴۰۰ نقطه) محاسبه می‌شود؛ برای κ² < δ² توابع هذلولوی مثلثاتی می‌شوند (لوب‌های کناری)."),
    Sim: FbgSim, dataKeys: { x: "dT_C", y: ["theory", "measured"] } },
  { id: "polarization", num: 17, category: "advanced", level: 2, title: q("Polarization, Birefringence & PMD", "قطبش، دوشکستی و PMD"), short: q("Jones/Stokes description, Poincaré sphere, beat length, PM fiber and PMD scaling.", "توصیف جونز/استوکس، کره پوانکاره، طول ضربان، فیبر PM و مقیاس PMD."),
    objective: q("Visualize linear/circular/elliptical states, propagate through birefringent fiber, and evaluate PMD limits.", "مشاهده حالت‌های خطی/دایره‌ای/بیضوی، انتشار در فیبر دوشکست و ارزیابی حدود PMD."),
    prerequisites: [q("Vector nature of EM waves", "ماهیت برداری امواج EM"), q("Phase and retardation", "فاز و تأخیر فاز")],
    equipment: [q("Polarizer, λ/4 and λ/2 plates", "پلاریزر، تیغه‌های λ/4 و λ/2"), q("Polarization controller (paddles)", "کنترل‌کننده قطبش"), q("Polarimeter", "پلاریمتر"), q("PM fiber, PMD emulator", "فیبر PM، شبیه‌ساز PMD")],
    theory: { basic: q("Light's electric field oscillates in a plane (linear), rotates (circular), or traces an ellipse. Real fibers are slightly asymmetric, so the two axes travel at slightly different speeds — birefringence — and the polarization state keeps changing along the fiber.", "میدان الکتریکی نور در یک صفحه نوسان می‌کند (خطی)، می‌چرخد (دایره‌ای) یا بیضی رسم می‌کند. فیبرهای واقعی کمی نامتقارن‌اند، بنابراین دو محور با سرعت کمی متفاوت حرکت می‌کنند — دوشکستی — و حالت قطبش در طول فیبر تغییر می‌کند."),
      engineering: q("Jones vector (E_x, E_y e^{iδ}); Stokes S₀…S₃ map to the Poincaré sphere. Beat length L_B = λ/Δn. PM (PANDA/bow-tie) fiber has Δn ≈ 3–5×10⁻⁴ so L_B ≈ 3–5 mm and preserves a state launched on an axis (extinction >20 dB). DGD Δτ = ΔnL/c for uniform fiber; with random coupling PMD = D_PMD√L, must stay < ~10% of the bit period.", "بردار جونز (E_x, E_y e^{iδ})؛ استوکس S₀…S₃ روی کره پوانکاره نگاشت می‌شوند. طول ضربان L_B = λ/Δn. فیبر PM (PANDA/bow-tie) دارای Δn ≈ 3–5×10⁻⁴ است بنابراین L_B ≈ 3–5 mm و حالتی که روی محور تزریق شود حفظ می‌شود (خاموشی >20 dB). DGD Δτ = ΔnL/c برای فیبر یکنواخت؛ با کوپلینگ تصادفی PMD = D_PMD√L که باید کمتر از ~۱۰٪ بازه بیت بماند."),
      advanced: q("PMD is a stochastic process: DGD follows a Maxwellian distribution with mean ⟨Δτ⟩; outage probability drives system margin. Principal states of polarization (PSP) are frequency-dependent; second-order PMD (depolarization + PCD) matters at 40 Gb/s+. Polarization-dependent loss (PDL) interacts with PMD to produce non-orthogonal PSPs.", "PMD فرایندی تصادفی است: DGD توزیع ماکسولی با میانگین ⟨Δτ⟩ دارد؛ احتمال قطعی، حاشیه سیستم را تعیین می‌کند. حالت‌های اصلی قطبش (PSP) وابسته به فرکانس‌اند؛ PMD مرتبه دوم (ناقطبیدگی + PCD) در ۴۰ Gb/s+ مهم است. تلفات وابسته به قطبش (PDL) با PMD برهم‌کنش کرده و PSPهای غیرمتعامد ایجاد می‌کند."),
      research: q("Coherent receivers with 2×2 MIMO (CMA/RDE) equalizers undo PMD/rotation adaptively, enabling polarization-division multiplexing (PDM-QPSK/16QAM). Polarization-entangled photons and PM fibers are central to QKD; spun fibers minimize PMD during draw. Fast polarization transients (lightning, mechanical) require µs tracking.", "گیرنده‌های همدوس با همسان‌سازهای MIMO 2×2 (CMA/RDE) به‌صورت وفقی PMD/چرخش را خنثی می‌کنند و مالتی‌پلکس تقسیم قطبش (PDM-QPSK/16QAM) را ممکن می‌سازند. فوتون‌های درهم‌تنیده قطبشی و فیبرهای PM در QKD محوری‌اند؛ فیبرهای چرخانده‌شده PMD را هنگام کشش کمینه می‌کنند. گذراهای سریع قطبش (صاعقه، مکانیکی) نیازمند ردیابی µs هستند.") },
    equations: [{ eq: "S₀=E_x²+E_y², S₁=E_x²−E_y², S₂=2E_xE_y cosδ, S₃=2E_xE_y sinδ", desc: q("Stokes parameters", "پارامترهای استوکس") }, { eq: "ψ = ½ atan2(S₂,S₁),  χ = ½ asin(S₃/S₀)", desc: q("Azimuth & ellipticity angles", "زوایای آزیموت و بیضویت") }, { eq: "L_B = λ / Δn,  φ = 2πΔnL/λ", desc: q("Beat length & retardation", "طول ضربان و تأخیر فاز") }, { eq: "Δτ_PMD = D_PMD √L", desc: q("PMD with strong random mode coupling", "PMD با کوپلینگ تصادفی قوی") }],
    procedure: [q("Set E_x=1, E_y=0 → linear H. Then E_x=E_y=0.707, δ=90° → circular.", "E_x=1، E_y=0 ← خطی افقی. سپس E_x=E_y=0.707، δ=90° ← دایره‌ای."), q("Set Δn = 3e-4 and sweep L from 0 to 10 mm; observe the state cycling every L_B.", "Δn = 3e-4 و L را از ۰ تا ۱۰ mm جاروب کنید؛ چرخش حالت هر L_B را ببینید."), q("Enable PMF and note the state is preserved.", "PMF را فعال کنید و حفظ حالت را یادداشت کنید."), q("Set D_PMD = 0.5 ps/√km, find the max length for 40 Gb/s (Δτ < 2.5 ps).", "D_PMD = 0.5 ps/√km؛ بیشینه طول برای ۴۰ Gb/s (Δτ < 2.5 ps) را بیابید.")],
    errors: [q("Polarimeter calibration & retarder accuracy.", "کالیبراسیون پلاریمتر و دقت تأخیردهنده."), q("Temperature-induced drift of fiber birefringence.", "رانش دمایی دوشکستی فیبر."), q("PMD is statistical — single measurements scatter.", "PMD آماری است — اندازه‌گیری‌های تکی پراکنده‌اند.")],
    conclusion: q("Polarization evolves along real fibers; PM fiber freezes it on an axis, and PMD grows as √L limiting high-rate links.", "قطبش در فیبرهای واقعی تحول می‌یابد؛ فیبر PM آن را روی یک محور ثابت می‌کند و PMD با √L رشد کرده لینک‌های پرسرعت را محدود می‌کند."),
    questions: [{ q: q("Δn = 3×10⁻⁴ at λ = 1550 nm → beat length (mm)?", "Δn = 3×10⁻⁴ در λ = 1550 nm ← طول ضربان (mm)؟"), type: "numeric", answer: 5.17, tolerance: 0.2, unit: "mm", hints: [q("L_B = λ/Δn.", "L_B = λ/Δn."), q("1550e-9 / 3e-4.", "1550e-9 / 3e-4.")], explanation: q("L_B = 1.55×10⁻⁶ / 3×10⁻⁴ = 5.17 mm.", "L_B = 1.55×10⁻⁶ / 3×10⁻⁴ = 5.17 mm.") }, { q: q("D_PMD = 0.5 ps/√km, L = 400 km → Δτ (ps)?", "D_PMD = 0.5 ps/√km و L = 400 km ← Δτ (ps)؟"), type: "numeric", answer: 10, tolerance: 0.5, unit: "ps", hints: [q("√400 = 20.", "√400 = 20."), q("0.5 × 20.", "0.5 × 20.")], explanation: q("Δτ = 0.5 × √400 = 10 ps — the 10 Gb/s limit.", "Δτ = 0.5 × √400 = 10 ps — حد ۱۰ Gb/s.") }],
    Sim: PolSim, dataKeys: { x: "L_km", y: ["pmd_ps", "pmd_meas"] } },
  { id: "nonlinear", num: 18, category: "advanced", level: 3, title: q("Nonlinear Fiber Effects — Kerr, SPM, XPM, FWM, SRS, SBS", "اثرات غیرخطی فیبر — کر، SPM، XPM، FWM، SRS، SBS"), short: q("Toggle each effect, compute thresholds and see SPM spectral broadening from the NLSE.", "هر اثر را فعال/غیرفعال کنید، آستانه‌ها را محاسبه و پهن‌شدگی طیفی SPM را از NLSE ببینید."),
    objective: q("Quantify nonlinear phase shifts, FWM efficiency, SRS/SBS thresholds and their dependence on power, effective area, dispersion and linewidth.", "کمی‌سازی جابه‌جایی فاز غیرخطی، بازده FWM، آستانه‌های SRS/SBS و وابستگی آن‌ها به توان، سطح مؤثر، پاشندگی و پهنای خط."),
    prerequisites: [q("Kerr effect n = n₀ + n₂I", "اثر کر n = n₀ + n₂I"), q("Dispersion & phase matching", "پاشندگی و تطبیق فاز"), q("Fourier transforms", "تبدیل فوریه")],
    equipment: [q("High-power EDFA / booster", "EDFA پرتوان"), q("HNLF / DSF / SMF spools", "قرقره‌های HNLF / DSF / SMF"), q("OSA, autocorrelator", "طیف‌سنج، خودهمبسته‌ساز"), q("Circulator for backward SBS monitoring", "سیرکولاتور برای پایش SBS برگشتی")],
    theory: { basic: q("At high intensity glass becomes slightly 'nonlinear': its refractive index depends on the light intensity (Kerr effect). The pulse then modulates its own phase (SPM), neighbouring channels' phase (XPM), mixes frequencies (FWM), and can scatter off molecular vibrations (Raman) or acoustic waves (Brillouin).", "در شدت بالا شیشه کمی «غیرخطی» می‌شود: ضریب شکست آن به شدت نور وابسته می‌شود (اثر کر). آنگاه پالس فاز خودش (SPM) و فاز کانال‌های مجاور (XPM) را مدوله می‌کند، فرکانس‌ها را مخلوط می‌کند (FWM) و می‌تواند از ارتعاشات مولکولی (رامان) یا امواج صوتی (بریلوئن) پراکنده شود."),
      engineering: q("γ = 2πn₂/(λA_eff) ≈ 1.3 W⁻¹km⁻¹ (SMF). φ_NL = γP L_eff; keep < 1 rad per link. XPM: ×2 per neighbour. FWM: η ∝ [α²/(α²+Δβ²)], Δβ = β₂Δω² → avoid D≈0 in WDM. SBS: P_th ≈ 21A_eff/(g_B L_eff)·(1+Δν_L/Δν_B) ≈ 5–10 mW CW narrow-linewidth; dithering raises it. SRS: P_th ≈ 16A_eff/(g_R L_eff) ≈ 1 W single channel, but WDM tilt appears at ~+20 dBm total.", "γ = 2πn₂/(λA_eff) ≈ 1.3 W⁻¹km⁻¹ (SMF). φ_NL = γP L_eff؛ کمتر از ۱ rad در هر لینک نگه دارید. XPM: ×2 به ازای هر همسایه. FWM: η ∝ [α²/(α²+Δβ²)] با Δβ = β₂Δω² ← از D≈0 در WDM پرهیز کنید. SBS: P_th ≈ 21A_eff/(g_B L_eff)·(1+Δν_L/Δν_B) ≈ 5–10 mW برای CW باریک‌خط؛ لرزاندن آن را بالا می‌برد. SRS: P_th ≈ 16A_eff/(g_R L_eff) ≈ 1 W تک‌کانال، اما شیب WDM در ~+20 dBm کل ظاهر می‌شود."),
      advanced: q("The NLSE ∂A/∂z = −(α/2)A − i(β₂/2)∂²A/∂T² + (β₃/6)∂³A/∂T³ + iγ|A|²A captures Kerr effects; Raman adds a delayed response h_R(t) (f_R ≈ 0.18) yielding soliton self-frequency shift; self-steepening adds (i/ω₀)∂(|A|²A)/∂T. SPM of an unchirped Gaussian produces a spectrum with M ≈ φ_max/π + ½ peaks. Modulation instability occurs for β₂ < 0 with gain g = |β₂Ω|√(Ω_c² − Ω²).", "معادله NLSE به‌صورت ∂A/∂z = −(α/2)A − i(β₂/2)∂²A/∂T² + (β₃/6)∂³A/∂T³ + iγ|A|²A اثرات کر را در بر می‌گیرد؛ رامان پاسخ تأخیری h_R(t) (f_R ≈ 0.18) می‌افزاید که جابه‌جایی خودفرکانسی سالیتون می‌دهد؛ self-steepening جمله (i/ω₀)∂(|A|²A)/∂T را اضافه می‌کند. SPM یک گاوسی بدون چیرپ طیفی با M ≈ φ_max/π + ½ قله می‌دهد. ناپایداری مدولاسیون برای β₂ < 0 با بهره g = |β₂Ω|√(Ω_c² − Ω²) رخ می‌دهد."),
      research: q("Nonlinear interference in coherent WDM is modeled as Gaussian noise (GN/EGN) with PSD ∝ γ²P³/(|β₂|α); digital back-propagation and nonlinear Fourier transform (NFT) transmission aim to exploit rather than suffer the Kerr effect. Supercontinuum generation, parametric amplification (FOPA), and Brillouin lasers/sensors are constructive uses.", "تداخل غیرخطی در WDM همدوس به‌صورت نویز گاوسی (GN/EGN) با PSD ∝ γ²P³/(|β₂|α) مدل می‌شود؛ بازانتشار دیجیتال و ارسال با تبدیل فوریه غیرخطی (NFT) می‌کوشند از اثر کر بهره ببرند نه رنج. تولید ابرپیوستار، تقویت پارامتری (FOPA) و لیزرها/حسگرهای بریلوئن کاربردهای سازنده‌اند.") },
    equations: [{ eq: "γ = 2π n₂ / (λ A_eff),  L_eff = (1 − e^{−αL})/α", desc: q("Nonlinear coefficient and effective length", "ضریب غیرخطی و طول مؤثر") }, { eq: "φ_SPM = γ P₀ L_eff,  φ_XPM = 2γ L_eff Σ_j P_j", desc: q("Self / cross phase modulation", "مدولاسیون فاز خودی / متقابل") }, { eq: "P_th^SBS ≈ 21 A_eff/(g_B L_eff)·(1 + Δν_L/Δν_B)", desc: q("SBS threshold (g_B ≈ 5×10⁻¹¹ m/W)", "آستانه SBS") }, { eq: "P_th^SRS ≈ 16 A_eff/(g_R L_eff)", desc: q("SRS threshold (g_R ≈ 1×10⁻¹³ m/W)", "آستانه SRS") }, { eq: "η_FWM = α²/(α² + Δβ²)·[…],  Δβ = β₂(2πΔf)²", desc: q("FWM phase-matching efficiency", "بازده تطبیق فاز FWM") }],
    procedure: [q("P₀ = 10 mW, SMF, L = 50 km, 10 MHz linewidth: read all thresholds.", "P₀ = 10 mW، SMF، L = 50 km، پهنای خط ۱۰ MHz: همه آستانه‌ها را بخوانید."), q("Reduce linewidth to 0.1 MHz → SBS threshold collapses.", "پهنای خط را به 0.1 MHz کاهش دهید ← آستانه SBS فرومی‌ریزد."), q("Raise P₀ to 200 mW; count SPM spectral peaks vs φ_max/π.", "P₀ را به ۲۰۰ mW برسانید؛ قله‌های طیفی SPM را در برابر φ_max/π بشمارید."), q("Set D = 0 with 8 channels at 50 GHz: observe η_FWM → 0 dB.", "D = 0 با ۸ کانال در ۵۰ GHz: مشاهده η_FWM → 0 dB."), q("Change A_eff from 80 to 150 µm²; note threshold scaling.", "A_eff را از ۸۰ به ۱۵۰ µm² تغییر دهید؛ مقیاس آستانه را یادداشت کنید.")],
    errors: [q("g_R, g_B and n₂ vary with dopants and polarization.", "g_R، g_B و n₂ با آلاینده‌ها و قطبش تغییر می‌کنند."), q("Threshold definitions differ (1% vs equal power).", "تعاریف آستانه متفاوت‌اند."), q("Split-step step size and window aliasing.", "اندازه گام split-step و aliasing پنجره.")],
    conclusion: q("Nonlinear effects set the upper power limit of fiber systems; dispersion management, large A_eff and linewidth control mitigate them.", "اثرات غیرخطی حد بالای توان سیستم‌های فیبری را تعیین می‌کنند؛ مدیریت پاشندگی، A_eff بزرگ و کنترل پهنای خط آن‌ها را کاهش می‌دهند."),
    questions: [{ q: q("γ = 1.3 W⁻¹km⁻¹, P = 100 mW, L_eff = 20 km → φ_SPM (rad)?", "γ = 1.3 W⁻¹km⁻¹، P = 100 mW، L_eff = 20 km ← φ_SPM (rad)؟"), type: "numeric", answer: 2.6, tolerance: 0.1, unit: "rad", hints: [q("φ = γ P L_eff.", "φ = γ P L_eff."), q("1.3 × 0.1 × 20.", "1.3 × 0.1 × 20.")], explanation: q("φ_SPM = 1.3 × 0.1 × 20 = 2.6 rad.", "φ_SPM = 1.3 × 0.1 × 20 = 2.6 rad.") }, { q: q("Which effect has the lowest threshold for a CW narrow-linewidth laser?", "کدام اثر برای لیزر CW باریک‌خط کمترین آستانه را دارد؟"), type: "mc", answer: 3, options: [q("SRS", "SRS"), q("FWM", "FWM"), q("SPM", "SPM"), q("SBS", "SBS")], hints: [q("Gain coefficient ~500× larger than Raman.", "ضریب بهره ~۵۰۰ برابر رامان."), q("Narrow gain bandwidth (~20 MHz).", "پهنای باند بهره باریک (~۲۰ MHz).")], explanation: q("SBS: g_B ≈ 5×10⁻¹¹ m/W ≫ g_R, so for CW light within the 20 MHz Brillouin bandwidth the threshold is only a few mW.", "SBS: g_B ≈ 5×10⁻¹¹ m/W ≫ g_R، بنابراین برای نور CW درون پهنای باند ۲۰ MHz بریلوئن آستانه فقط چند mW است.") }],
    assumptions: q("Scalar NLSE (single polarization), instantaneous Kerr response, no Raman term, no β₃; thresholds from Smith/Agrawal criteria; FWM efficiency for degenerate two-channel case.", "NLSE اسکالر (تک‌قطبش)، پاسخ کر آنی، بدون جمله رامان، بدون β₃؛ آستانه‌ها از معیارهای Smith/Agrawal؛ بازده FWM برای حالت دوکاناله واگن."),
    numerics: q("Symmetric split-step Fourier (N = 512, 60 steps): half-step dispersion in frequency domain, full nonlinear step in time domain via exp(iγ|A|²dz), radix-2 FFT implemented in-browser.", "روش split-step فوریه متقارن (N = 512، ۶۰ گام): نیم‌گام پاشندگی در حوزه فرکانس، گام کامل غیرخطی در حوزه زمان با exp(iγ|A|²dz)، FFT پایه-۲ پیاده‌سازی‌شده در مرورگر."),
    Sim: NonlinearSim, dataKeys: { x: "P0_mW", y: ["theory", "Pth_SBS_mW"] } },
  { id: "soliton", num: 19, category: "advanced", level: 3, title: q("Solitons — Nonlinear Schrödinger Equation", "سالیتون‌ها — معادله شرودینگر غیرخطی"), short: q("Split-step NLSE solver: watch dispersion and Kerr nonlinearity balance into a stable soliton.", "حل‌گر NLSE با split-step: تعادل پاشندگی و غیرخطی کر را در سالیتون پایدار ببینید."),
    objective: q("Solve the NLSE numerically, identify soliton order N, dispersion/nonlinear lengths, soliton period and the effect of loss and chirp.", "حل عددی NLSE، شناسایی مرتبه سالیتون N، طول‌های پاشندگی/غیرخطی، دوره سالیتون و اثر تلفات و چیرپ."),
    prerequisites: [q("GVD (β₂) and SPM", "GVD (β₂) و SPM"), q("Fourier methods", "روش‌های فوریه"), q("Basic PDE numerics", "عددیات پایه PDE")],
    equipment: [q("Mode-locked fiber laser (ps pulses)", "لیزر قفل‌مود فیبری"), q("EDFA booster", "EDFA تقویت‌کننده"), q("SMF/DSF spools", "قرقره‌های SMF/DSF"), q("Autocorrelator & OSA", "خودهمبسته‌ساز و طیف‌سنج")],
    theory: { basic: q("Dispersion spreads a pulse; the Kerr effect chirps it the opposite way when dispersion is anomalous (1550 nm in SMF). At exactly the right power the two cancel and the pulse travels unchanged — a soliton.", "پاشندگی پالس را پهن می‌کند؛ اثر کر وقتی پاشندگی نابهنجار است (۱۵۵۰ nm در SMF) آن را در جهت مخالف چیرپ می‌کند. در توان دقیقاً درست این دو خنثی می‌شوند و پالس بدون تغییر حرکت می‌کند — سالیتون."),
      engineering: q("Fundamental soliton: A(0,T) = √P₁ sech(T/T₀), P₁ = |β₂|/(γT₀²). For T₀ = 10 ps (FWHM 17.6 ps) in SMF: β₂ ≈ −21.7 ps²/km, γ = 1.3 → P₁ ≈ 17 mW. Soliton period z₀ = πL_D/2. Loss breaks the balance; amplifier spacing ≪ z₀ keeps the 'average soliton'. Gordon–Haus jitter from ASE limits soliton systems; dispersion-managed solitons mitigate it.", "سالیتون بنیادی: A(0,T) = √P₁ sech(T/T₀) با P₁ = |β₂|/(γT₀²). برای T₀ = 10 ps (FWHM 17.6 ps) در SMF: β₂ ≈ −21.7 ps²/km، γ = 1.3 ← P₁ ≈ 17 mW. دوره سالیتون z₀ = πL_D/2. تلفات تعادل را می‌شکند؛ فاصله تقویت‌کننده ≪ z₀ «سالیتون میانگین» را حفظ می‌کند. جیتر Gordon–Haus از ASE سیستم‌های سالیتونی را محدود می‌کند؛ سالیتون‌های مدیریت‌پاشندگی آن را کاهش می‌دهند."),
      advanced: q("Normalizing τ = T/T₀, ξ = z/L_D, u = A/√P₀ gives i∂u/∂ξ = ½sgn(β₂)∂²u/∂τ² − N²|u|²u with N² = γP₀T₀²/|β₂| = L_D/L_NL. The NLSE is integrable (Zakharov–Shabat inverse scattering): eigenvalues ζ of the associated linear problem give soliton amplitudes/velocities; an N-soliton input (integer N) evolves periodically with z₀ and returns to its initial shape. Non-integer N sheds dispersive waves and relaxes to the nearest integer soliton.", "با نرمال‌سازی τ = T/T₀، ξ = z/L_D، u = A/√P₀ داریم i∂u/∂ξ = ½sgn(β₂)∂²u/∂τ² − N²|u|²u با N² = γP₀T₀²/|β₂| = L_D/L_NL. NLSE انتگرال‌پذیر است (پراکندگی معکوس Zakharov–Shabat): ویژه‌مقادیر ζ مسئله خطی همراه، دامنه/سرعت سالیتون‌ها را می‌دهند؛ ورودی N-سالیتونی (N صحیح) با دوره z₀ تحول یافته و به شکل اولیه بازمی‌گردد. N غیرصحیح موج پاشنده می‌ریزد و به نزدیک‌ترین سالیتون صحیح آرام می‌گیرد."),
      research: q("Higher-order effects (β₃, Raman self-frequency shift, self-steepening) cause soliton fission and supercontinuum; dissipative solitons in fiber lasers balance gain/loss additionally. Nonlinear Fourier transform (NFT) based communication encodes data on the discrete eigenvalue spectrum; optical rogue waves and Peregrine solitons emerge from modulation instability.", "اثرات مرتبه بالاتر (β₃، جابه‌جایی خودفرکانسی رامان، self-steepening) شکافت سالیتون و ابرپیوستار ایجاد می‌کنند؛ سالیتون‌های اتلافی در لیزرهای فیبری بهره/تلفات را نیز متعادل می‌کنند. مخابرات مبتنی بر تبدیل فوریه غیرخطی (NFT) داده را روی طیف ویژه‌مقدار گسسته کد می‌کند؛ امواج سرکش نوری و سالیتون‌های Peregrine از ناپایداری مدولاسیون پدید می‌آیند.") },
    equations: [{ eq: "∂A/∂z = −(α/2)A − i(β₂/2)∂²A/∂T² + iγ|A|²A", desc: q("Nonlinear Schrödinger equation (retarded frame)", "معادله شرودینگر غیرخطی (چارچوب تأخیری)") }, { eq: "L_D = T₀²/|β₂|,  L_NL = 1/(γP₀),  N² = L_D/L_NL", desc: q("Characteristic lengths & soliton order", "طول‌های مشخصه و مرتبه سالیتون") }, { eq: "P₁ = |β₂| / (γ T₀²),  z₀ = (π/2) L_D", desc: q("Fundamental soliton power & period", "توان سالیتون بنیادی و دوره") }, { eq: "A(z,T) = √P₁ sech(T/T₀) exp(iz/(2L_D))", desc: q("Fundamental soliton solution", "جواب سالیتون بنیادی") }],
    procedure: [q("sech, T₀ = 10 ps, D = 17, γ = 1.3, α = 0, auto power → N = 1. Run and confirm the pulse is stationary over 100 km.", "sech، T₀ = 10 ps، D = 17، γ = 1.3، α = 0، توان خودکار ← N = 1. اجرا کنید و ایستایی پالس روی ۱۰۰ km را تأیید کنید."), q("Set manual P₀ = 4P₁ (N = 2); observe breathing with period z₀.", "P₀ = 4P₁ دستی (N = 2)؛ تنفس با دوره z₀ را ببینید."), q("Set P₀ → 0 (N ≈ 0): compare with linear broadening √(1+(L/L_D)²).", "P₀ → 0 (N ≈ 0): با پهن‌شدگی خطی √(1+(L/L_D)²) مقایسه کنید."), q("Set D = −17 (normal): note enhanced broadening.", "D = −17 (بهنجار): پهن‌شدگی تشدیدشده را یادداشت کنید."), q("Add α = 0.2 dB/km and watch the soliton decay.", "α = 0.2 dB/km اضافه کنید و واپاشی سالیتون را ببینید.")],
    errors: [q("Split-step error O(dz³) per step; check convergence by doubling steps.", "خطای split-step از مرتبه O(dz³) در هر گام؛ همگرایی را با دو برابر کردن گام‌ها بررسی کنید."), q("Time window must contain the broadened pulse (aliasing).", "پنجره زمانی باید پالس پهن‌شده را در بر گیرد (aliasing)."), q("Neglected β₃ and Raman for T₀ < 1 ps.", "β₃ و رامان برای T₀ < 1 ps نادیده گرفته شده‌اند.")],
    conclusion: q("When N = 1 in the anomalous regime, SPM exactly balances GVD and the sech pulse propagates undistorted; loss, chirp and normal dispersion destroy this balance.", "وقتی N = 1 در رژیم نابهنجار باشد، SPM دقیقاً GVD را متعادل می‌کند و پالس sech بدون اعوجاج منتشر می‌شود؛ تلفات، چیرپ و پاشندگی بهنجار این تعادل را از بین می‌برند."),
    questions: [{ q: q("β₂ = −20 ps²/km, γ = 1.3 W⁻¹km⁻¹, T₀ = 10 ps → P₁ (mW)?", "β₂ = −20 ps²/km، γ = 1.3 W⁻¹km⁻¹، T₀ = 10 ps ← P₁ (mW)؟"), type: "numeric", answer: 15.4, tolerance: 0.5, unit: "mW", hints: [q("P₁ = |β₂|/(γT₀²).", "P₁ = |β₂|/(γT₀²)."), q("20 / (1.3 × 100) W.", "20 / (1.3 × 100) W.")], explanation: q("P₁ = 20/(1.3×100) = 0.0154 W = 15.4 mW.", "P₁ = 20/(1.3×100) = 0.0154 W = 15.4 mW.") }, { q: q("Why can't a soliton form at 1310 nm in standard SMF?", "چرا سالیتون در ۱۳۱۰ nm در SMF استاندارد تشکیل نمی‌شود؟"), type: "mc", answer: 1, options: [q("Loss is too high", "تلفات خیلی زیاد است"), q("β₂ ≈ 0 / normal dispersion — no anomalous GVD to balance SPM", "β₂ ≈ 0 / پاشندگی بهنجار — GVD نابهنجاری برای تعادل با SPM نیست"), q("γ is zero there", "γ آنجا صفر است"), q("Fiber is multimode", "فیبر چندمود است")], hints: [q("Where is the zero-dispersion wavelength of G.652?", "طول موج پاشندگی صفر G.652 کجاست؟"), q("Solitons need β₂ < 0.", "سالیتون به β₂ < 0 نیاز دارد.")], explanation: q("At 1310 nm D ≈ 0 (and D < 0 below it), so SPM chirp cannot be compensated by anomalous GVD.", "در ۱۳۱۰ nm مقدار D ≈ 0 (و زیر آن D < 0) است، بنابراین چیرپ SPM نمی‌تواند با GVD نابهنجار جبران شود.") }],
    assumptions: q("Scalar, single-polarization NLSE; instantaneous Kerr; no higher-order dispersion or Raman; noiseless propagation; periodic boundary (FFT).", "NLSE اسکالر تک‌قطبش؛ کر آنی؛ بدون پاشندگی مرتبه بالاتر یا رامان؛ انتشار بدون نویز؛ مرز تناوبی (FFT)."),
    numerics: q("Symmetric split-step Fourier: A(z+dz) = exp(D̂dz/2)·exp(N̂dz)·exp(D̂dz/2)A(z), with D̂ = i(β₂/2)ω² − α/2 applied in frequency domain and N̂ = iγ|A|² in time domain. N = 256 samples over a 40·T₀ window, 200 steps; 60 snapshots form the heat-map.", "روش split-step فوریه متقارن: A(z+dz) = exp(D̂dz/2)·exp(N̂dz)·exp(D̂dz/2)A(z) با D̂ = i(β₂/2)ω² − α/2 در حوزه فرکانس و N̂ = iγ|A|² در حوزه زمان. N = 256 نمونه در پنجره 40·T₀، ۲۰۰ گام؛ ۶۰ برش نقشه حرارتی را می‌سازند."),
    Sim: SolitonSim, dataKeys: { x: "L_km", y: ["theory", "measured"] } },
];
export { sci };
