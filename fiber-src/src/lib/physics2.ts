// ============================================================
//  PHASE 2 — SMS structure : SMF-28 – MMF(62.5/125) – SMF-28
//  Multi-Mode Interference (MMI) + self-imaging.
//  Independent module; Phase 3 EXTENDS this (adds nanoparticle microbend).
// ============================================================
import {
  MU0,
  HELMHOLTZ_FACTOR,
  verdetSilica,
  linspace,
  clamp,
  besselJ0,
} from "./core";

export interface P2Params {
  D_um: number; // MMF core diameter (µm)  default 62.5
  Lmmf_mm: number; // MMF length (mm)        default 90
  lambdaNm: number; // wavelength (nm)        default 1550
  NA: number; // numerical aperture     default 0.275 (OM1)
  I_A: number; // Helmholtz current (A)  default 18
  nCladExt: number; // external cladding index default 1.0 (air)
  turns: number; // Helmholtz turns       default 1600
  R_cm: number; // Helmholtz radius (cm) default 6
  // Magneto-optic thin-film cladding coating on the MMF (real mechanism of
  // an SMS magnetic sensor: a magnetic-fluid / MO film whose index follows B).
  moClad?: number; // max tunable Δn of the MO cladding
  moCladSat?: number; // saturation field of the MO cladding (T)
}

export const P2_DEFAULT: P2Params = {
  D_um: 62.5,
  Lmmf_mm: 90,
  lambdaNm: 830,
  NA: 0.275,
  I_A: 18,
  nCladExt: 1.0,
  turns: 1600,
  R_cm: 6,
  // Magneto-optic cladding (e.g. ferrofluid-coated no-core MMF):
  // a realistic Δn_max ≈ 8×10⁻³ produces several visible fringe shifts.
  moClad: 0.008,
  moCladSat: 0.6, // T
};

export function mmfCore(p: P2Params) {
  const n_clad = 1.444; // silica clad @1550
  const n_core = Math.sqrt(n_clad * n_clad + p.NA * p.NA);
  return { n_core, n_clad, a_um: p.D_um / 2 };
}
/** V-number of the MMF */
export function mmfV(p: P2Params): number {
  const lam = p.lambdaNm / 1000;
  return (2 * Math.PI / lam) * (p.D_um / 2) * p.NA;
}

// ---- Magneto-optic perturbation (Faraday, silica) -----------
/** circular birefringence Δn_c = V·B·λ/π  (from θ=VBL=(π/λ)Δn_c·L) */
export function faradayDn(p: P2Params, I?: number): number {
  const B = helmholtzB(p, I);
  return (verdetSilica(p.lambdaNm) * B * (p.lambdaNm * 1e-9)) / Math.PI;
}
/** Helmholtz center field (T) */
export function helmholtzB(p: P2Params, I?: number): number {
  const Rm = p.R_cm / 100;
  return (HELMHOLTZ_FACTOR * MU0 * p.turns * (I ?? p.I_A)) / Rm;
}
/**
 * Effective index shift of MMF modes under field. Three contributions:
 *  1) silica Faraday (small, ∝ B)              — faradayDn
 *  2) magneto-optic cladding coating (∝ tanh B) — moClad  (Phase 2 sensor)
 *  3) nanoparticle/magnetic-fluid cladding       — dnFluid (Phase 3)
 */
export function effectiveDn(p: P2Params, moGain = 0, dnFluid = 0): number {
  const B = helmholtzB(p);
  const clad = (p.moClad ?? 0) * Math.tanh(B / (p.moCladSat ?? 0.8));
  return faradayDn(p) * (1 + moGain) + dnFluid + clad;
}
/** magneto-optic cladding contribution at field B (for breakdown display) */
export function moCladDn(p: P2Params, I?: number): number {
  const B = helmholtzB(p, I);
  return (p.moClad ?? 0) * Math.tanh(B / (p.moCladSat ?? 0.6));
}
/**
 * Effective indices of the first few LP0m modes, with and without field.
 * The cladding/MO perturbation is MODE-DEPENDENT: higher-order modes have a
 * larger evanescent (cladding) fraction w_m=(u_m/V)², so n_eff shifts more.
 * It is this RELATIVE shift (not the common Faraday term) that changes |E|².
 */
export function modeEffectiveIndices(p: P2Params, nShow = 6) {
  const { n_core, a_um } = mmfCore(p);
  const lam = p.lambdaNm / 1000;
  const k0 = (2 * Math.PI) / lam;
  const V = mmfV(p);
  const dnc = faradayDn(p); // circular birefringence (R-L split), common to all
  const dClad = moCladDn(p);
  const out: { m: number; u: number; neff0: number; neff: number; nR: number; nL: number }[] = [];
  let count = 0;
  for (const u of J0_ZEROS) {
    if (u > V) break;
    const beta0 = Math.sqrt((k0 * n_core) ** 2 - (u / a_um) ** 2);
    const neff0 = beta0 / k0;
    const w = (u * u) / (V * V); // cladding fraction
    const neff = neff0 + dClad * w + dnc; // field-on effective index
    out.push({
      m: count + 1,
      u,
      neff0,
      neff,
      nR: neff + dnc / 2, // right-circular eigen-index
      nL: neff - dnc / 2, // left-circular eigen-index
    });
    count++;
    if (count >= nShow) break;
  }
  return { modes: out, dnc, dClad, V };
}

// ---- LP_0m modal basis for a centered Gaussian launch --------
/** first M zeros of J0 (transverse eigenvalues u_m) */
const J0_ZEROS = [
  2.4048, 5.5201, 8.6537, 11.7915, 14.9309, 18.0711, 21.2116, 24.3525, 27.4935,
  30.6346, 33.7758, 36.9171, 40.0584, 43.1998, 46.3412, 49.4826, 52.6241,
  55.7655, 58.9070, 62.0485, 65.1899, 68.3313, 71.4726,
];
/** modes (u,β) guided by the MMF, plus Gaussian excitation c_m */
export interface MMFMode {
  u: number;
  beta: number; // per µm
  c: number; // amplitude excitation
}
export function mmfModes(p: P2Params, moGain = 0, dnFluid = 0): MMFMode[] {
  const { n_core, n_clad, a_um } = mmfCore(p);
  const lam = p.lambdaNm / 1000; // µm
  const k0 = (2 * Math.PI) / lam;
  const V = mmfV(p);
  const w_in = 5.2; // launched SMF Gaussian 1/e radius (µm)
  const B = helmholtzB(p);
  // Bulk Faraday perturbation (common to all modes → only rotates polarisation,
  // barely changes |E|²): this is why pure silica shows little MMI change.
  const dnCommon = faradayDn(p) * (1 + moGain);
  // Cladding / fluid perturbation is MODE-DEPENDENT: higher-order modes have a
  // larger evanescent overlap with the cladding (∝ u²/V²), so their effective
  // index shifts more than low-order modes. This RELATIVE shift changes |E|².
  const dnClad =
    (p.moClad ?? 0) * Math.tanh(B / (p.moCladSat ?? 0.8)) + dnFluid;
  const modes: MMFMode[] = [];
  for (const u of J0_ZEROS) {
    if (u > V) break;
    const cladFrac = (u * u) / (V * V); // 0..1 (fraction in cladding)
    const dnEff_m = dnCommon + dnClad * cladFrac;
    const beta0 = Math.sqrt((k0 * n_core) ** 2 - (u / a_um) ** 2);
    const beta = beta0 + k0 * dnEff_m;
    // excitation ∝ exp(-(u·w_in/(2a))²)
    const c = Math.exp(-Math.pow((u * w_in) / (2 * a_um), 2));
    modes.push({ u, beta, c });
  }
  // keep β above cladding value
  return modes.filter((m) => m.beta > k0 * n_clad);
}
/** normalize excitation amplitudes to unit input power */
export function normalizedModes(p: P2Params, moGain = 0, dnFluid = 0) {
  const m = mmfModes(p, moGain, dnFluid);
  const sumC2 = m.reduce((s, x) => s + x.c * x.c, 0) || 1;
  const norm = Math.sqrt(sumC2);
  return m.map((x) => ({ ...x, c: x.c / norm }));
}

/** SMS transmission vs MMF length (mm) at the current wavelength */
export function transmissionVsLength(p: P2Params, zMm: number[], moGain = 0, dnFluid = 0) {
  const m = normalizedModes(p, moGain, dnFluid);
  const T: number[] = [];
  for (const z of zMm) {
    let re = 0;
    let im = 0;
    for (const mode of m) {
      const ph = mode.beta * z * 1000; // z in µm
      // overlap back into the SMF ≈ |c|² (re-imaging weight)
      const wgt = mode.c * mode.c;
      re += wgt * Math.cos(ph);
      im += wgt * Math.sin(ph);
    }
    T.push(clamp(re * re + im * im, 0, 1));
  }
  return T;
}
/** SMS transmission spectrum vs wavelength (nm) */
export function transmissionVsLambda(p: P2Params, lamArr: number[], moGain = 0, dnFluid = 0) {
  const L_um = p.Lmmf_mm * 1000;
  const T: number[] = [];
  for (const lam of lamArr) {
    const pp: P2Params = { ...p, lambdaNm: lam };
    const m = normalizedModes(pp, moGain, dnFluid);
    let re = 0;
    let im = 0;
    for (const mode of m) {
      const ph = mode.beta * L_um;
      const wgt = mode.c * mode.c;
      re += wgt * Math.cos(ph);
      im += wgt * Math.sin(ph);
    }
    T.push(clamp(re * re + im * im, 0, 1));
  }
  return T;
}
/** Fundamental self-imaging (revival) period z_img = 4·n·a²/λ  (Soldano, JLT 1995) */
export function selfImagingPeriodUm(p: P2Params): number {
  const { a_um, n_core } = mmfCore(p);
  const lam = p.lambdaNm / 1000;
  return (4 * n_core * a_um * a_um) / lam;
}
/** radial MMI field |E(r,z)|² on the (r,z) plane (self-imaging) */
export interface MMIZ {
  r_um: number[];
  z_mm: number[];
  I: number[][]; // [z][r]
}
export interface MMIOpts {
  Nr?: number;
  Nz?: number;
  zMaxMm?: number;
}
export function mmiField(
  p: P2Params,
  moGain = 0,
  dnFluid = 0,
  opts: MMIOpts = {}
): MMIZ {
  const { a_um } = mmfCore(p);
  const m = normalizedModes(p, moGain, dnFluid);
  const Nr = opts.Nr ?? 70;
  const imgUm = selfImagingPeriodUm(p);
  // finest fringe among the kept modes → drives the z-step
  let dMax = 0;
  for (let i = 0; i < m.length; i++)
    for (let j = i + 1; j < m.length; j++) {
      const d = Math.abs(m[i].beta - m[j].beta);
      if (d > dMax) dMax = d;
    }
  const fringeUm = dMax > 1e-9 ? 2 * Math.PI / dMax : imgUm;
  // show up to ~3 self-images OR ~140 fringes (whichever is smaller) so the
  // pattern is ALWAYS resolved even for a strong field (Phase 3).
  const zMaxUm = Math.min(
    p.Lmmf_mm * 1000,
    Math.min(imgUm * 3.2, Math.max(fringeUm * 140, imgUm))
  );
  const zMaxMm = opts.zMaxMm ?? zMaxUm / 1000;
  const Nz = opts.Nz ?? Math.min(640, Math.max(220, Math.ceil(zMaxUm / (fringeUm / 3))));
  const r = linspace(0, a_um * 1.02, Nr);
  const z = linspace(0, zMaxMm, Nz);
  const I: number[][] = [];
  let maxI = 1e-9;
  for (const zz of z) {
    const row: number[] = [];
    const zUm = zz * 1000;
    for (const rr of r) {
      let re = 0;
      let im = 0;
      for (const mode of m) {
        const ph = mode.beta * zUm;
        const prof = besselJ0((mode.u * rr) / a_um) * mode.c;
        re += prof * Math.cos(ph);
        im += prof * Math.sin(ph);
      }
      const v = re * re + im * im;
      row.push(v);
      if (v > maxI) maxI = v;
    }
    I.push(row);
  }
  for (let j = 0; j < I.length; j++)
    for (let i = 0; i < I[0].length; i++) I[j][i] /= maxI;
  return { r_um: r, z_mm: z, I };
}
/** clean symmetric radial intensity |E(r,L)|² at the MMF OUTPUT (full length) */
export function outputProfile(p: P2Params, moGain = 0, dnFluid = 0, Nr = 90) {
  const { a_um } = mmfCore(p);
  const m = normalizedModes(p, moGain, dnFluid);
  const r = linspace(-a_um, a_um, Nr);
  const L_um = p.Lmmf_mm * 1000;
  const raw = r.map((rr) => {
    let re = 0;
    let im = 0;
    for (const mode of m) {
      const ph = mode.beta * L_um;
      const prof = besselJ0((mode.u * Math.abs(rr)) / a_um) * mode.c;
      re += prof * Math.cos(ph);
      im += prof * Math.sin(ph);
    }
    return re * re + im * im;
  });
  const mx = Math.max(...raw, 1e-9);
  return { r_um: r, I: raw.map((v) => v / mx) };
}
/** 2D transverse output field |E(x,y,L)|² (concentric-ring interference) */
export function outputField2D(p: P2Params, moGain = 0, dnFluid = 0, N = 50) {
  const { a_um } = mmfCore(p);
  const m = normalizedModes(p, moGain, dnFluid);
  const L_um = p.Lmmf_mm * 1000;
  const xs = linspace(-a_um, a_um, N);
  const z: number[][] = [];
  let mx = 1e-9;
  for (let j = 0; j < N; j++) {
    const row: number[] = [];
    const y = xs[j];
    for (let i = 0; i < N; i++) {
      const x = xs[i];
      const r = Math.sqrt(x * x + y * y);
      let re = 0;
      let im = 0;
      for (const mode of m) {
        const ph = mode.beta * L_um;
        const prof = besselJ0((mode.u * r) / a_um) * mode.c;
        re += prof * Math.cos(ph);
        im += prof * Math.sin(ph);
      }
      const v = re * re + im * im;
      row.push(v);
      if (v > mx) mx = v;
    }
    z.push(row);
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) z[j][i] /= mx;
  return { x: xs, y: xs, z };
}
/** axial field of a single loop radius R at axial offset x (m) */
function loopBx(R_m: number, x_m: number, NI: number): number {
  const R2 = R_m * R_m;
  const x2 = x_m * x_m;
  return (MU0 * NI * R_m * R_m) / (2 * Math.pow(R2 + x2, 1.5));
}
/** axial field of a Helmholtz pair separated by 'sep' (m), center at 0 */
export function helmholtzProfile(p: P2Params, sep_mm: number[], xMm: number[]) {
  const Rm = p.R_cm / 100;
  const NI = p.turns * p.I_A;
  const B: number[] = [];
  for (let k = 0; k < xMm.length; k++) {
    const x = xMm[k] / 1000;
    const sep = sep_mm[k] ?? sep_mm[sep_mm.length - 1];
    const d = sep / 2000; // half separation
    const b = loopBx(Rm, x - d, NI) + loopBx(Rm, x + d, NI);
    B.push(b * 1000); // mT
  }
  return B;
}
/** field uniformity ΔB/B₀ across ±1 cm vs coil separation (returns mT & ratio) */
export function uniformityVsSeparation(p: P2Params, sepArr: number[]) {
  const Rm = p.R_cm / 100;
  const NI = p.turns * p.I_A;
  const out: { sep: number; center: number; nonUniform: number }[] = [];
  const probe = linspace(-10, 10, 21); // mm
  for (const sep of sepArr) {
    const d = sep / 2000;
    let bMin = Infinity;
    let bMax = -Infinity;
    let bC = 0;
    for (const xm of probe) {
      const x = xm / 1000;
      const b = loopBx(Rm, x - d, NI) + loopBx(Rm, x + d, NI);
      bMin = Math.min(bMin, b);
      bMax = Math.max(bMax, b);
      if (Math.abs(xm) < 0.5) bC = b;
    }
    out.push({
      sep,
      center: bC * 1000,
      nonUniform: ((bMax - bMin) / bC) * 100,
    });
  }
  return out;
}

// ---- sensitivity ---------------------------------------------
/** Faraday rotation inside the MMF section (rad) */
export function smsFaradayRotation(p: P2Params, I?: number): number {
  return verdetSilica(p.lambdaNm) * helmholtzB(p, I) * (p.Lmmf_mm / 1000);
}
/**
 * Transmitted power through an analyzer set at 45° to the input polarizer
 * (optimum linear-operating-point configuration):
 *   T = (1 + sin(2θ)) / 2  →  dT/dθ = 1 at θ=0  (maximum sensitivity).
 */
export function analyzerT(theta: number): number {
  return (1 + Math.sin(2 * theta)) / 2;
}
/** spectral shift Δλ of a fringe under field (approx), nm */
export function spectralShift(p: P2Params, dnEff: number): number {
  // fringe shift Δλ/λ ≈ Δn_eff / n_core  (interferometric)
  const { n_core } = mmfCore(p);
  return (p.lambdaNm * dnEff) / n_core;
}
