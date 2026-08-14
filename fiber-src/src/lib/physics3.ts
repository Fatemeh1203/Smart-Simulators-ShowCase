// ============================================================
//  PHASE 3 — SMS + Microbend + Magnetic Nanoparticles
//  Polymer microbend teeth (~10 cm) with ferrofluid injected.
//  EXTENDS Phase 2 SMS optics (imported, not duplicated).
// ============================================================
import { MU0, sinc2 } from "./core";
import { helmholtzB, mmfCore, selfImagingPeriodUm, P2_DEFAULT, type P2Params } from "./physics2";

// ---- Nanoparticle materials ----------------------------------
export type NPType = "Fe3O4" | "gFe2O3" | "ferrofluid";
export interface NPMaterial {
  type: NPType;
  Ms: number; // saturation magnetization of BULK particle (kA/m)
  Msat_T: number; // field (T) at ~saturation
  dnFluidMax: number; // max tunable refractive-index change of fluid
  label: string;
  note: string;
}
export const NP_MATERIALS: Record<NPType, NPMaterial> = {
  Fe3O4: {
    type: "Fe3O4",
    Ms: 480, // magnetite, ~92 emu/g
    Msat_T: 0.35,
    dnFluidMax: 0.018,
    label: "Fe₃O₄ (مگنتیت)",
    note: "بالاترین مغناطش اشباع؛ مناسب برای اعمال نیرو/فشار.",
  },
  gFe2O3: {
    type: "gFe2O3",
    Ms: 370, // maghemite, ~74 emu/g, chemically stable
    Msat_T: 0.30,
    dnFluidMax: 0.013,
    label: "γ-Fe₂O₃ (ماگمیت)",
    note: "پایدارتر شیمیایی، مغناطش کمتر.",
  },
  ferrofluid: {
    type: "ferrofluid",
    Ms: 460, // Fe3O4-based superparamagnetic fluid
    Msat_T: 0.12,
    dnFluidMax: 0.055,
    label: "Ferrofluid (Fe₃O₄)",
    note: "سیال، غلظت قابل‌تنظیم؛ بهترین گزینه برای تزریق داخل میکروخمش.",
  },
};

export interface P3Params extends P2Params {
  np: NPType; // nanoparticle type
  phi: number; // volume fraction of magnetic material
  Lmb_mm: number; // microbend active length (mm) default 100
  Lambda_mb_um: number; // microbend period (µm) default 1500
  eta: number; // evanescent coupling factor (0..1)
  Cpe: number; // photoelastic coeff Δn per Pa  (fused silica ~6e-11)
  concen: number; // field concentration factor in gaps
}

export const P3_DEFAULT: P3Params = {
  ...(P2_DEFAULT as P2Params), // inherit MMF + Helmholtz baseline (830 nm)
  moClad: 0, // Phase-3 perturbation comes ONLY from the nanoparticles/ferrofluid
  np: "ferrofluid",
  phi: 0.06,
  Lmb_mm: 100,
  Lambda_mb_um: 1500,
  eta: 0.25,
  Cpe: 6e-11,
  concen: 3.5,
};

/** magnetization of the magnetic medium vs field (Langevin-like, in A/m) */
export function magnetization(p: P3Params, I?: number): number {
  const mat = NP_MATERIALS[p.np];
  const B = helmholtzB({ ...p3ToP2(p), I_A: I ?? p.I_A }, I);
  const MsFluid = mat.Ms * 1000 * p.phi; // A/m (bulk × volume fraction)
  // Langevin L(ξ) with ξ ∝ B/Msat ; approximated by tanh
  const xi = B / mat.Msat_T;
  const L = xi / Math.sqrt(1 + xi * xi); // smooth saturation → ~tanh
  return MsFluid * L;
}
/** Magnetic (Kelvin) pressure on the fiber:  P = ½·μ0·M² · concen  */
export function magneticPressure(p: P3Params, I?: number): number {
  const M = magnetization(p, I);
  return 0.5 * MU0 * M * M * p.concen;
}
/** effective-index change from photoelastic effect  Δn = Cpe · σ */
export function photoelasticDn(p: P3Params, I?: number): number {
  return p.Cpe * magneticPressure(p, I);
}
/** ferrofluid magneto-optic (tunable cladding) Δn_fluid */
export function fluidDn(p: P3Params, I?: number): number {
  const mat = NP_MATERIALS[p.np];
  const B = helmholtzB(p3ToP2(p), I);
  return mat.dnFluidMax * Math.tanh(B / mat.Msat_T);
}
/** total effective-index perturbation imparted to MMF modes */
export function totalDnEff(p: P3Params, I?: number): number {
  return p.eta * fluidDn(p, I) + photoelasticDn(p, I);
}
// helper: strip P3 extras to a P2Params object
export function p3ToP2(p: P3Params): P2Params {
  const { np, phi, Lmb_mm, Lambda_mb_um, eta, Cpe, concen, ...rest } = p;
  void np; void phi; void Lmb_mm; void Lambda_mb_um; void eta; void Cpe; void concen;
  return rest;
}
/** combined moGain for reusing Phase-2 SMS optics */
export function moGainP3(p: P3Params): number {
  // magnify the silica Faraday term when a magnetic fluid is present
  const dnFluid = fluidDn(p);
  return clampNum(dnFluid / 2e-7, 0, 1e6);
}
function clampNum(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

/** sensitivity of the SMS+NP sensor: dλ/dI (nm/A) by finite difference */
export function sensitivityNmPerA(p: P3Params): number {
  const dI = 0.2;
  const n_core = mmfCore(p3ToP2(p)).n_core;
  const dn1 = totalDnEff(p, p.I_A - dI);
  const dn2 = totalDnEff(p, p.I_A + dI);
  const ddn = (dn2 - dn1) / (2 * dI);
  return (p.lambdaNm * ddn) / n_core;
}

// ---- parametric sweep helpers (for the extra Phase-3 charts) ----
/** microbend beat period (≈ half the MMF self-imaging period) */
export function mbBeatUm(p: P3Params): number {
  return selfImagingPeriodUm(p3ToP2(p)) / 2;
}
/** sensitivity vs volume fraction φ (more particles → more pressure, saturating) */
export function sensitivityVsConc(p: P3Params, phiArr: number[]) {
  return phiArr.map((phi) => sensitivityNmPerA({ ...p, phi }));
}
/** sensitivity vs microbend period Λ — sinc² phase matching around the beat */
export function sensitivityVsPeriod(p: P3Params, lamArr_um: number[]) {
  const Lb = mbBeatUm(p);
  const base = sensitivityNmPerA(p);
  return lamArr_um.map((L) => base * sinc2(Math.PI * (1 / L - 1 / Lb) * L));
}
/** magnetization vs current (A/m) — Langevin-like saturation */
export function magnetizationVsI(p: P3Params, iArr: number[]) {
  return iArr.map((i) => magnetization(p, i));
}
/** ferrofluid Δn_fluid vs field B (T) for a given material */
export function fluidDnVsB(matKey: NPType, bArr: number[]) {
  const mat = NP_MATERIALS[matKey];
  return bArr.map((b) => mat.dnFluidMax * Math.tanh(b / mat.Msat_T));
}
