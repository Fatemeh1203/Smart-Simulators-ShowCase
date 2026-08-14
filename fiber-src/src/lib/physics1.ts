// ============================================================
//  PHASE 1 — Two-Mode Fiber : Faraday effect + Microbend
//  Coupling between LP01 and LP11, polarization rotation.
//  Fully independent module (does not touch Phase 2/3).
// ============================================================
import { verdetSilica, coilB, linspace, sinc2, MU0 } from "./core";

export interface P1Params {
  a_um: number; // core radius (µm)   default 3.85
  lambdaNm: number; // laser wavelength (nm) default 830
  NA: number; // numerical aperture     default 0.12 → V≈3.5 (two-mode)
  Lambda_um: number; // microbend period (µm) default 400 (0.4 mm)
  L_m: number; // interaction length (m) default 0.20
  I_A: number; // applied current (A)
  kB: number; // field coefficient (T/A) default 0.024 (24 mT/A)
  kappa0: number; // baseline coupling coeff (rad/m)
  gammaMO: number; // magneto-optic coupling enhancement (per Tesla)
}

export const P1_DEFAULT: P1Params = {
  a_um: 3.85,
  lambdaNm: 830,
  NA: 0.12,
  Lambda_um: 400,
  L_m: 0.2,
  I_A: 18,
  kB: 0.024,
  kappa0: 4.5,
  gammaMO: 1.6,
};

// ---- derived quantities -------------------------------------
/** V-number of the fiber (guidance). Two-mode ⇔ 2.405 < V < 3.832 */
export function vNumber(p: P1Params): number {
  const lam = p.lambdaNm / 1000; // µm
  return (2 * Math.PI / lam) * p.a_um * p.NA;
}
/** core & cladding indices from NA with silica baseline n_clad≈1.46 */
export function indices(p: P1Params) {
  const n_clad = 1.46;
  const n_core = Math.sqrt(n_clad * n_clad + p.NA * p.NA);
  return { n_clad, n_core };
}
export interface ModeParams {
  neff01: number;
  neff11: number;
  dn: number;
  Lambda_beat_um: number;
}
/** beat length = λ / Δn_eff ; equals the phase-matching microbend period */
export function modeParams(p: P1Params): ModeParams {
  const lam = p.lambdaNm / 1000; // µm
  const { n_core, n_clad } = indices(p);
  const V = vNumber(p);
  // approx effective-index split between LP01 & LP11 from normalized b
  const b01 = 1 - 1.3 / V + 0.4 / (V * V); // LP01 near top of well
  const b11 = clamp01((V - 2.405) / 3.0) * 0.5; // LP11 rises above cutoff
  const neff01 = Math.sqrt(n_clad * n_clad + b01 * (n_core * n_core - n_clad * n_clad));
  const neff11 = Math.sqrt(n_clad * n_clad + b11 * (n_core * n_core - n_clad * n_clad));
  const dn = neff01 - neff11;
  return { neff01, neff11, dn, Lambda_beat_um: lam / dn };
}
function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

/** Magnetic field [T] for a given current (project coil) */
export function fieldB(p: P1Params): number {
  return coilB(p.I_A, p.kB);
}
/** Faraday rotation  θ = V·B·L   (rad) */
export function faradayRotation(p: P1Params, Lfactor = 1): number {
  return verdetSilica(p.lambdaNm) * fieldB(p) * p.L_m * Lfactor;
}

// ---- Coupled-mode LP01 ↔ LP11 --------------------------------
/**
 * Magneto-optic perturbation adds (i) extra coupling and (ii) phase detuning.
 * κ_eff(B) = κ0·(1+γ·B)            (microbend + magneto-optic perturbation)
 * δ(B)    = 2·V·B·(λ/2π) ... circular-birefringence detuning
 * Power transfer (Yariv, Optical Electronics):
 *   P11(z) = κ²/(κ²+δ²) · sin²(√(κ²+δ²)·z)   ,  P01 = 1 - P11
 */
export function couplingCoeff(p: P1Params): number {
  return p.kappa0 * (1 + p.gammaMO * fieldB(p));
}
export function detuning(p: P1Params): number {
  // phase mismatch vs the fixed microbend grating (rad/m)
  return 2 * verdetSilica(p.lambdaNm) * fieldB(p);
}
/** mode powers vs axial position z (m). Input fully in LP01. */
export function modePowerVsZ(p: P1Params, zArr: number[]) {
  const k = couplingCoeff(p);
  const d = detuning(p) / 2;
  const s = Math.sqrt(k * k + d * d);
  const amp = (k * k) / (k * k + d * d);
  const p01: number[] = [];
  const p11: number[] = [];
  for (const z of zArr) {
    const t = amp * Math.sin(s * z) ** 2;
    p11.push(t);
    p01.push(1 - t);
  }
  return { p01, p11, kappa: k, detuning: 2 * d, transferMax: amp };
}

// ---- Mode field distributions --------------------------------
/** mode-field radius (Marcuse approximation) */
export function mfdRadius(p: P1Params): number {
  const V = vNumber(p);
  const w_a = 0.65 + 1.619 / Math.pow(V, 1.5) + 2.879 / Math.pow(V, 6);
  return w_a * p.a_um; // µm
}
/**
 * LP01 amplitude (Gaussian) and LP11 amplitude (first excited, two-lobed).
 * Returns intensity |E|² on an (x,y) grid in µm.
 * phiRot: Faraday-induced rotation of the LP11 lobes (rad).
 */
export interface FieldGrid {
  x: number[];
  y: number[];
  LP01: number[][];
  LP11: number[][];
  total: number[][];
  maxVal: number;
}
export function modeFieldGrid(p: P1Params, phiRot = 0, N = 56): FieldGrid {
  const w = mfdRadius(p);
  const R = 2.4 * p.a_um; // window half-width (µm)
  const xs = linspace(-R, R, N);
  const ys = linspace(-R, R, N);
  const w11 = w * 1.15;
  const LP01: number[][] = [];
  const LP11: number[][] = [];
  const total: number[][] = [];
  // power split from coupling at the fiber end (z = L)
  const zEnd = p.L_m;
  const { p11 } = modePowerVsZ(p, [zEnd]);
  const amp11 = Math.sqrt(p11[0]);
  const amp01 = Math.sqrt(1 - p11[0]);
  for (let j = 0; j < N; j++) {
    const row1: number[] = [];
    const row2: number[] = [];
    const rowT: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = xs[i];
      const y = ys[j];
      const r = Math.sqrt(x * x + y * y);
      const phi = Math.atan2(y, x);
      const e01 = Math.exp(-(r * r) / (w * w));
      // LP11: radially weighted × cos(φ-φ_rot), node on axis
      const radial = (r / w11) * Math.exp(-(r * r) / (w11 * w11));
      const e11 = radial * Math.cos(phi - phiRot);
      const I01 = e01 * e01;
      // coherent superposition for the total field
      const Etot = amp01 * e01 + amp11 * e11;
      const Itot = Etot * Etot;
      row1.push(I01);
      row2.push(e11 * e11);
      rowT.push(Itot);
    }
    LP01.push(row1);
    LP11.push(row2);
    total.push(rowT);
  }
  // normalize each grid to its own peak for clean, comparable display
  const norm = (g: number[][]) => {
    let mx = 1e-9;
    for (const r of g) for (const v of r) if (v > mx) mx = v;
    return g.map((r) => r.map((v) => v / mx));
  };
  return { x: xs, y: ys, LP01: norm(LP01), LP11: norm(LP11), total: norm(total), maxVal: 1 };
}

// ---- Spectra & sensitivity -----------------------------------
/** LP01–LP11 beat interference transmission vs wavelength (nm) */
export function tmodeSpectrum(p: P1Params, lamArr: number[]) {
  const { dn } = modeParams(p);
  const L = p.L_m;
  // visibility rises with the effective coupling (field-dependent)
  const vis = Math.min(0.9, Math.tanh(couplingCoeff(p) * L * 0.9));
  const T: number[] = [];
  for (const lam of lamArr) {
    const lamM = lam * 1e-9;
    const dphi = (2 * Math.PI / lamM) * dn * L;
    T.push(1 - vis * 0.5 * (1 - Math.cos(dphi)));
  }
  return T.map((t) => clamp01(t));
}
/** Phase-matching (coupling efficiency) vs microbend period Λ (µm) */
export function phaseMatchVsLambda(p: P1Params, lamArr: number[]) {
  const { Lambda_beat_um } = modeParams(p);
  const out: number[] = [];
  for (const lam of lamArr) {
    const arg = Math.PI * (1 / lam - 1 / Lambda_beat_um) * lam;
    out.push(sinc2(arg));
  }
  return out;
}
/** polarization-transmitted power through analyzer @45° : T=sin²θ */
export function analyzerPower(thetaRad: number): number {
  return Math.sin(thetaRad) ** 2;
}
/** sensitivity dθ/dI  = V·kB·L  (rad/A) */
export function sensitivityTheta(p: P1Params): number {
  return verdetSilica(p.lambdaNm) * p.kB * p.L_m;
}

// ---- Verdet constant & amplification -------------------------
/** Representative Verdet constants [rad/(T·m)] near 800–850 nm */
export const VERDET_MATERIALS: {
  key: string;
  label: string;
  V: number;
  color: string;
  note: string;
}[] = [
  { key: "silica", label: "سیلیکا (SMF معمولی)", V: 2.05, color: "#22d3ee", note: "ارزان، ضعیف؛ با چندین دور پیچیدن قابل‌مشاهده." },
  { key: "doped", label: "سیلیکای دوپه‌شده", V: 8, color: "#34d399", note: "~۴ برابر تقویت." },
  { key: "tb", label: "شیشه Tb-دوپه", V: 24, color: "#fbbf24", note: "~۱۲ برابر؛ مناسب حسگر جریان." },
  { key: "tgg", label: "TGG (بلور)", V: 78, color: "#fb7185", note: "~۳۸ برابر؛ ایزولاتور نوری." },
];
/**
 * Faraday CURRENT sensor (fiber coiled N turns around the conductor):
 *   ∮ B·dl = μ₀·I  (Ampère)  ⇒  θ = V·N·∮B·dl = N·V·μ₀·I.
 * This is the main way to AMPLIFY the (small) silica rotation: many turns.
 */
export function coiledFaraday(V: number, Nturns: number, I_A: number): number {
  return Nturns * V * MU0 * I_A;
}

// ---- Faraday effect at the mode level ------------------------
/**
 * Circular birefringence induced by a longitudinal magnetic field.
 * A linearly-polarised mode is the superposition of right- and left-circular
 * eigen-modes, whose indices differ by  Δn_c = n_R − n_L = V·B·λ/π.
 * (from θ = V·B·L = (π/λ)·Δn_c·L  ⇒  Δn_c = V·B·λ/π)
 */
export function circularBirefringence(p: P1Params): number {
  const lam = p.lambdaNm * 1e-9; // m
  return (verdetSilica(p.lambdaNm) * fieldB(p) * lam) / Math.PI;
}
/**
 * Effective indices of the two guided modes (LP01, LP11), decomposed into
 * their right/left circular eigen-indices under a longitudinal field.
 * The magneto-optic perturbation is common to both linear modes of a given
 * order (it rotates them); the LP01↔LP11 coupling is handled separately by
 * couplingCoeff / modePowerVsZ.
 */
export function modeIndicesWithField(p: P1Params) {
  const { neff01, neff11 } = modeParams(p);
  const dnc = circularBirefringence(p); // n_R − n_L
  return {
    neff01,
    neff11,
    // right- and left-circular eigen-indices
    nR01: neff01 + dnc / 2,
    nL01: neff01 - dnc / 2,
    nR11: neff11 + dnc / 2,
    nL11: neff11 - dnc / 2,
    dnc,
    beatLpLp_um: (p.lambdaNm / 1000) / (neff01 - neff11),
  };
}

// ---- Longitudinal vs transverse ------------------------------
/**
 * Longitudinal field → Faraday (circular birefringence), θ = V·B·L.
 * Transverse field  → Cotton–Mouton (linear birefringence ∝ B²).
 * For silica the Cotton–Mouton coefficient K_CM ≈ 4.5×10⁻¹⁵ m²/T²
 * → transverse retardance ~ 3–4 orders weaker than Faraday rotation.
 */
export const K_COTTON_MOUTON_SILICA = 4.5e-15; // m²/T² (typical fused silica)
export function transverseBirefringence(p: P1Params): number {
  const B = fieldB(p);
  return K_COTTON_MOUTON_SILICA * B * B * p.L_m / (p.lambdaNm * 1e-9); // retardance in waves
}
