// ============================================================
//  Core physical constants & math utilities
//  Fiber-Optic Current Sensor Simulator
//  All relations referenced to peer-reviewed sources.
// ============================================================

export const MU0 = 4 * Math.PI * 1e-7; // vacuum permeability [T·m/A]

/** Speed of light [m/s] */
export const C0 = 2.998e8;

// ------------------------------------------------------------
//  Verdet constant of fused silica
//  A. M. Smith measured V ≈ 3.61 rad/(T·m) @632.8 nm and
//  ≈ 2.05 rad/(T·m) @830 nm for single-mode SiO2 fiber
//  (Sensors 17, 1899, 2017; Appl. Opt. 17, 52, 1978).
//  Wavelength dispersion: V ∝ ν² ∝ 1/λ² (Cruz et al., Appl. Opt. 1996).
// ------------------------------------------------------------
export function verdetSilica(lambdaNm: number): number {
  // anchored at 830 nm → 2.05 rad/(T·m)
  return 2.05 * Math.pow(830 / lambdaNm, 2);
}

// ------------------------------------------------------------
//  Helmholtz coil — on-axis field at the geometric center.
//  B = (4/5)^(3/2) · μ0·N·I / R  = 0.7155·μ0·N·I/R
//  With R=0.06 m, N=1600 → exactly 24.0 mT/A  (matches project spec).
// ------------------------------------------------------------
export const HELMHOLTZ_FACTOR = Math.pow(4 / 5, 1.5); // 0.7155
export function helmholtzCenterB(N: number, R_m: number, I_A: number): number {
  return (HELMHOLTZ_FACTOR * MU0 * N * I_A) / R_m;
}
// field coefficient (T per A) for the standard project coil
export const kB_STANDARD = 0.024; // 24 mT/A

/** Magnetic field from the project coil: B[I] = kB · I  [Tesla] */
export function coilB(I_A: number, kB = kB_STANDARD): number {
  return kB * I_A;
}

// ------------------------------------------------------------
//  Math helpers
// ------------------------------------------------------------
export function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [a];
  const out = new Array<number>(n);
  const d = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) out[i] = a + d * i;
  return out;
}
export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
/** sinc²(x) = (sin x / x)² (with limit 1 at x=0) */
export function sinc2(x: number): number {
  const t = Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x;
  return t * t;
}
/** Bessel J0 — polynomial approx (Abramowitz & Stegun 9.4.1/9.4.3) */
export function besselJ0(x: number): number {
  const ax = Math.abs(x);
  if (ax < 8) {
    const y = x * x;
    const t = y * (1 - y * (1 - y * (1 - y * (1 - y / 16) / 100) / 64) / 36) / 4;
    return 1 - t;
  }
  const z = 8 / ax;
  const th = ax - Math.PI / 4;
  const f0 =
    0.79788456 +
    z * (0.00000156 + z * (0.0128785 + z * (-0.00028318 - 0.0129176 * z)));
  const c0 =
    1 +
    z * (-0.00029311 + z * (-1.0893e-5 + z * (0.00017128 + 0.0000020017 * z)));
  return Math.sqrt(f0 / ax) * c0 * Math.cos(th);
}
/** Bessel J1 — polynomial approx (Abramowitz & Stegun 9.4.4/9.4.6) */
export function besselJ1(x: number): number {
  if (Math.abs(x) < 1e-9) return 0;
  const ax = Math.abs(x);
  let s = 1;
  if (x < 0) s = -1;
  if (ax < 8) {
    const y = x * x;
    const t = y * (1 - y * (1 - y * (1 - y * (1 - y / 30) / 90) / 56) / 12);
    return (s * ax / 2) * (1 - t);
  }
  const z = 8 / ax;
  const th = ax - 3 * Math.PI / 4;
  const f1 =
    0.79788456 +
    z * (-0.00000077 + z * (-0.0256013 + z * (0.00039054 + 0.032468 * z)));
  const c1 =
    1 +
    z * (0.00063771 + z * (-0.00076727 + z * (-0.00194815 + 0.00020938 * z)));
  return s * Math.sqrt(f1 / ax) * c1 * Math.cos(th);
}

/** safe tanh-based saturation (Langevin-like) */
export function langevin(x: number): number {
  // coth(x)-1/x ; for large x → 1
  if (Math.abs(x) < 1e-6) return x / 3;
  if (Math.abs(x) > 20) return Math.sign(x);
  return 1 / Math.tanh(x) - 1 / x;
}

export const deg = (rad: number) => (rad * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
