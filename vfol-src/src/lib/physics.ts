// ================= Physical constants =================
export const C = 299792458; // m/s
export const H = 6.62607015e-34; // J s
export const Q = 1.602176634e-19; // C
export const KB = 1.380649e-23; // J/K

export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
export const dBm2mW = (d: number) => Math.pow(10, d / 10);
export const mW2dBm = (m: number) => (m <= 0 ? -Infinity : 10 * Math.log10(m));
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const linspace = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

// Gaussian random (Box–Muller)
export function gauss(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
// deterministic pseudo random for stable traces
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// erfc approximation (Numerical Recipes)
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}
export const berFromQ = (q: number) => 0.5 * erfc(q / Math.SQRT2);
export function qFromBer(ber: number): number {
  // bisection
  let lo = 0, hi = 20;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (berFromQ(m) > ber) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

// ================= Geometrical optics =================
export function snell(n1: number, n2: number, theta1Deg: number) {
  const th1 = rad(theta1Deg);
  const s2 = (n1 / n2) * Math.sin(th1);
  const thetaC = n2 < n1 ? deg(Math.asin(n2 / n1)) : NaN;
  const tir = s2 > 1;
  const theta2 = tir ? NaN : deg(Math.asin(s2));
  // Fresnel (s and p, average) reflectance
  let R = 1;
  if (!tir) {
    const c1 = Math.cos(th1), c2 = Math.cos(rad(theta2));
    const rs = (n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2);
    const rp = (n2 * c1 - n1 * c2) / (n2 * c1 + n1 * c2);
    R = (rs * rs + rp * rp) / 2;
  }
  return { theta2, tir, thetaC, R, T: 1 - R };
}
export const fresnelNormal = (n1: number, n2: number) => Math.pow((n1 - n2) / (n1 + n2), 2);
export const numericalAperture = (n1: number, n2: number) => Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
export const acceptanceAngle = (NA: number, n0 = 1) => deg(Math.asin(clamp(NA / n0, 0, 1)));
export const relativeIndexDiff = (n1: number, n2: number) => (n1 * n1 - n2 * n2) / (2 * n1 * n1);

// ================= Modes =================
export const vNumber = (aUm: number, lambdaNm: number, NA: number) => (2 * Math.PI * aUm * 1000 * NA) / lambdaNm;
export const cutoffWavelength = (aUm: number, NA: number) => (2 * Math.PI * aUm * 1000 * NA) / 2.405; // nm
export function numModes(V: number, profile: "step" | "graded") {
  if (V < 2.405) return 1;
  return profile === "step" ? Math.round((V * V) / 2) : Math.round((V * V) / 4);
}
// LP mode cutoffs (zeros of Bessel functions)
export const LP_MODES: { name: string; cutoff: number; l: number; m: number }[] = [
  { name: "LP01", cutoff: 0, l: 0, m: 1 },
  { name: "LP11", cutoff: 2.405, l: 1, m: 1 },
  { name: "LP21", cutoff: 3.832, l: 2, m: 1 },
  { name: "LP02", cutoff: 3.832, l: 0, m: 2 },
  { name: "LP31", cutoff: 5.136, l: 3, m: 1 },
  { name: "LP12", cutoff: 5.520, l: 1, m: 2 },
  { name: "LP41", cutoff: 6.380, l: 4, m: 1 },
  { name: "LP22", cutoff: 7.016, l: 2, m: 2 },
  { name: "LP03", cutoff: 7.016, l: 0, m: 3 },
  { name: "LP51", cutoff: 7.588, l: 5, m: 1 },
  { name: "LP32", cutoff: 8.417, l: 3, m: 2 },
  { name: "LP13", cutoff: 8.654, l: 1, m: 3 },
  { name: "LP61", cutoff: 8.771, l: 6, m: 1 },
  { name: "LP42", cutoff: 9.761, l: 4, m: 2 },
  { name: "LP71", cutoff: 9.936, l: 7, m: 1 },
  { name: "LP23", cutoff: 10.173, l: 2, m: 3 },
  { name: "LP04", cutoff: 10.173, l: 0, m: 4 },
];
export const guidedLP = (V: number) => LP_MODES.filter((m) => m.cutoff < V);
// Marcuse approximation for MFD (step index, 0.8<V<2.5)
export function mfd(aUm: number, V: number) {
  const w = aUm * (0.65 + 1.619 * Math.pow(V, -1.5) + 2.879 * Math.pow(V, -6));
  return 2 * w;
}
// LP01 approximate w (cladding decay parameter) by Rudolph–Neumann
export function lp01Params(V: number) {
  const w = clamp(1.1428 * V - 0.996, 0.05, V - 1e-3);
  const u = Math.sqrt(Math.max(1e-6, V * V - w * w));
  const b = (w * w) / (V * V);
  return { u, w, b };
}
export function effectiveIndex(n1: number, n2: number, V: number) {
  const { b } = lp01Params(V);
  return Math.sqrt(n2 * n2 + b * (n1 * n1 - n2 * n2));
}
// Bessel J0/J1 (polynomial approximations) for field plots
export function besselJ0(x: number): number {
  const ax = Math.abs(x);
  if (ax < 8) {
    const y = x * x;
    return (57568490574.0 + y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))))) /
      (57568490411.0 + y * (1029532985.0 + y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y)))));
  }
  const z = 8 / ax, y = z * z, xx = ax - 0.785398164;
  return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * (1 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)))) - z * Math.sin(xx) * (-0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))));
}
export function besselJ1(x: number): number {
  const ax = Math.abs(x);
  if (ax < 8) {
    const y = x * x;
    return (x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))))) /
      (144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y)))));
  }
  const z = 8 / ax, y = z * z, xx = ax - 2.356194491;
  const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * (1 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)))) - z * Math.sin(xx) * (0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))));
  return x < 0 ? -ans : ans;
}
// K1 modified Bessel approx (large-argument asymptotic with correction)
export const besselK1 = (x: number) => Math.sqrt(Math.PI / (2 * x)) * Math.exp(-x) * (1 + 3 / (8 * x) - 15 / (128 * x * x));

// ================= Attenuation =================
// Spectral attenuation model (dB/km), lambda in nm
export function attenuationSpectrum(lambdaNm: number, ohPeak = 0.5, model: "ideal" | "realistic" | "experimental" = "realistic") {
  const l = lambdaNm / 1000; // µm
  if (model === "ideal") return 0.2 + 0.75 / Math.pow(l, 4) - 0.75 / Math.pow(1.55, 4); // flat 0.2 at 1550 + Rayleigh
  const rayleigh = 0.75 / Math.pow(l, 4);
  const ir = 7.81e11 * Math.exp(-48.48 / l);
  const uv = 1.542e-2 * Math.exp(4.63 / l) / 1e3; // small
  const oh = ohPeak * Math.exp(-Math.pow((lambdaNm - 1383) / 12, 2)) + 0.1 * ohPeak * Math.exp(-Math.pow((lambdaNm - 1240) / 15, 2)) + 0.05 * ohPeak * Math.exp(-Math.pow((lambdaNm - 950) / 12, 2));
  return rayleigh + ir + uv + oh + 0.02;
}
export const powerAfter = (P0dBm: number, alphaDbKm: number, Lkm: number) => P0dBm - alphaDbKm * Lkm;

// Macrobend loss (Marcuse) — returns dB per turn
export function bendLossPerTurn(RmM: number, aUm: number, lambdaNm: number, n1: number, n2: number) {
  const NA = numericalAperture(n1, n2);
  const V = vNumber(aUm, lambdaNm, NA);
  const { u, w } = lp01Params(V);
  const a = aUm * 1e-6, lam = lambdaNm * 1e-9, R = RmM * 1e-3;
  const kappa = u / a, gamma = w / a;
  const neff = effectiveIndex(n1, n2, V);
  const beta = (2 * Math.PI * neff) / lam;
  const K1 = besselK1(w);
  const expo = (-(2 * Math.pow(gamma, 3)) / (3 * beta * beta)) * R;
  const alphaNp = (Math.sqrt(Math.PI) * kappa * kappa * Math.exp(expo)) / (2 * Math.pow(gamma, 1.5) * V * V * Math.sqrt(R) * K1 * K1); // Np/m
  const alphaDbM = 4.343 * alphaNp;
  return alphaDbM * 2 * Math.PI * R; // dB per full turn
}

// ================= Dispersion =================
// Standard SMF (G.652): D(λ) = S0/4 (λ − λ0^4/λ^3)
export function dispersionSMF(lambdaNm: number, lambda0 = 1310, S0 = 0.092) {
  return (S0 / 4) * (lambdaNm - Math.pow(lambda0, 4) / Math.pow(lambdaNm, 3)); // ps/(nm·km)
}
export function fiberDispersion(type: "smf" | "dsf" | "nzdsf" | "dcf", lambdaNm: number) {
  if (type === "smf") return dispersionSMF(lambdaNm);
  if (type === "dsf") return dispersionSMF(lambdaNm, 1550, 0.075);
  if (type === "nzdsf") return dispersionSMF(lambdaNm, 1510, 0.045); // ~+4 at 1550
  return -80 + 0.3 * (lambdaNm - 1550); // DCF
}
export const chromaticBroadening = (D: number, Lkm: number, dLambdaNm: number) => Math.abs(D) * Lkm * dLambdaNm; // ps
export const beta2FromD = (D: number, lambdaNm: number) => -(D * 1e-6 * Math.pow(lambdaNm * 1e-9, 2)) / (2 * Math.PI * C) * 1e24; // ps^2/km  (D ps/nm/km)
export function modalDispersion(n1: number, n2: number, Lkm: number, profile: "step" | "graded") {
  const delta = (n1 - n2) / n1;
  const L = Lkm * 1e3;
  const dt = profile === "step" ? (L * n1 * delta) / C : (L * n1 * delta * delta) / (8 * C); // seconds
  return dt * 1e9; // ns
}
export const pmdDelay = (Dpmd: number, Lkm: number) => Dpmd * Math.sqrt(Lkm); // ps

// ================= OTDR =================
export type OtdrEvent = { id: string; type: "connector" | "splice" | "mechsplice" | "bend" | "break" | "end"; pos: number; loss: number; refl?: number };
export function otdrTrace(opts: { L: number; alpha: number; events: OtdrEvent[]; pulseNs: number; P0: number; model: "ideal" | "realistic" | "experimental"; nGroup?: number; seed?: number; }) {
  const { L, alpha, events, pulseNs, P0, model } = opts;
  const N = 800;
  const rand = seeded(opts.seed ?? 42);
  const pulseKm = (pulseNs * 1e-9 * C) / (2 * 1.468) / 1e3; // spatial resolution (km)
  const S = -32 + 10 * Math.log10(Math.max(1, pulseNs) / 10); // backscatter level relative (dB) for given pulse width
  const dynRange = P0 + S + 10 + (model === "ideal" ? 60 : 0); // approx
  const zEnd = L * 1.15;
  const pts: { z: number; dB: number }[] = [];
  const sorted = [...events].sort((a, b) => a.pos - b.pos);
  const brk = sorted.find((e) => e.type === "break");
  const fiberEnd = brk ? Math.min(brk.pos, L) : L;
  for (let i = 0; i < N; i++) {
    const z = (zEnd * i) / (N - 1);
    let level = P0 + S - 2 * alpha * z;
    let reflSpike = 0;
    for (const e of sorted) {
      if (z >= e.pos) level -= e.loss;
      if (e.refl !== undefined && e.refl > -80 && z >= e.pos - 0.002 && z < e.pos + pulseKm) {
        const amp = e.refl - S + 5; // reflective peak above backscatter
        reflSpike = Math.max(reflSpike, amp * Math.exp(-Math.pow((z - e.pos) / (pulseKm * 0.7), 2)));
        if (model !== "ideal") level -= 0; // dead zone shown via spike width
      }
    }
    // fiber end / break: Fresnel reflection then noise floor
    if (z > fiberEnd) {
      level = -Infinity;
    } else if (z > fiberEnd - pulseKm) {
      reflSpike = Math.max(reflSpike, (brk ? 10 : 14) * Math.exp(-Math.pow((z - fiberEnd) / (pulseKm * 0.7), 2)) + 5);
    }
    const floor = P0 + S - dynRange;
    let val = Math.max(level + reflSpike, floor);
    if (model === "experimental") {
      const snr = Math.max(0.05, (val - floor) / 5);
      val += (gauss() * 0.15) / snr + (rand() - 0.5) * 0.05;
    } else if (model === "realistic") {
      const snr = Math.max(0.05, (val - floor) / 5);
      val += ((rand() - 0.5) * 0.12) / snr;
    }
    if (!isFinite(val)) val = floor + (model === "ideal" ? 0 : gauss() * 0.5);
    pts.push({ z: +z.toFixed(4), dB: +val.toFixed(3) });
  }
  return { trace: pts, resolutionKm: pulseKm, dynamicRange: dynRange, fiberEnd };
}

// ================= Link budget =================
export function linkBudget(p: { Pt: number; L: number; alpha: number; nConn: number; connLoss: number; nSplice: number; spliceLoss: number; splitN: number; splitExcess: number; couplerLoss: number; gain: number; sens: number; margin: number; }) {
  const fiber = p.L * p.alpha;
  const conn = p.nConn * p.connLoss;
  const splice = p.nSplice * p.spliceLoss;
  const splitter = p.splitN > 1 ? 10 * Math.log10(p.splitN) + p.splitExcess : 0;
  const total = fiber + conn + splice + splitter + p.couplerLoss;
  const Pr = p.Pt - total + p.gain;
  const powerMargin = Pr - p.sens;
  return { fiber, conn, splice, splitter, total, Pr, powerMargin, feasible: powerMargin >= p.margin };
}
export const riseTimeBudget = (tTx: number, tRx: number, tChrom: number, tModal: number) => Math.sqrt(tTx ** 2 + tRx ** 2 + tChrom ** 2 + tModal ** 2);

// ================= Spectrum / sources =================
export function sourceSpectrum(p: { type: "led" | "fp" | "dfb" | "tunable" | "broadband" | "pulse"; lambda: number; power: number; linewidthNm: number; modFreqGHz: number; modDepth: number; span?: number; N?: number; noiseFloor?: number; model: string; }) {
  const N = p.N ?? 600;
  const span = p.span ?? Math.max(4, p.linewidthNm * 20, p.type === "led" || p.type === "broadband" ? 200 : 4);
  const xs = linspace(p.lambda - span / 2, p.lambda + span / 2, N);
  const floor = p.noiseFloor ?? -70;
  const lines: { l: number; pw: number; w: number }[] = [];
  if (p.type === "led") lines.push({ l: p.lambda, pw: p.power, w: Math.max(20, p.linewidthNm * 8) });
  else if (p.type === "broadband") lines.push({ l: p.lambda, pw: p.power, w: Math.max(40, p.linewidthNm * 10) });
  else if (p.type === "fp") {
    const spacing = (p.lambda * p.lambda) / (2 * 3.5 * 300e3); // nm, cavity 300 µm
    for (let k = -8; k <= 8; k++) lines.push({ l: p.lambda + k * spacing, pw: p.power - 1.5 * k * k, w: Math.max(0.05, p.linewidthNm) });
  } else lines.push({ l: p.lambda, pw: p.power, w: Math.max(0.005, p.linewidthNm) });
  // modulation sidebands
  const sbNm = (p.modFreqGHz * 1e9 * p.lambda * p.lambda) / (C * 1e9); // Δλ = f λ²/c  (nm)
  const withSb = [...lines];
  if (p.modFreqGHz > 0 && p.modDepth > 0 && p.type !== "led" && p.type !== "broadband") {
    for (const ln of lines) {
      const sbPw = ln.pw + 20 * Math.log10(p.modDepth / 2 + 1e-9);
      withSb.push({ l: ln.l - sbNm, pw: sbPw, w: ln.w }, { l: ln.l + sbNm, pw: sbPw, w: ln.w });
    }
  }
  const rbw = span / N * 2;
  return xs.map((x) => {
    let mw = dBm2mW(floor);
    for (const ln of withSb) {
      const w = Math.sqrt(ln.w * ln.w + rbw * rbw);
      mw += dBm2mW(ln.pw) * Math.exp(-4 * Math.LN2 * Math.pow((x - ln.l) / w, 2)) * (ln.w / w);
    }
    let v = mW2dBm(mw);
    if (p.model === "experimental") v += gauss() * 0.3;
    return { x: +x.toFixed(4), y: +v.toFixed(2) };
  });
}

// ================= EDFA =================
export function edfa(p: { PinDbm: number; pumpMw: number; lengthM: number; nsp: number; lambda: number; model: string; }) {
  // small-signal gain grows with pump & length (saturating), Saleh-like output saturation
  const g0 = Math.min(45, 0.09 * p.pumpMw * Math.min(1, p.lengthM / 12) * (p.lengthM > 25 ? 25 / p.lengthM : 1) + 0.3 * Math.min(p.lengthM, 12)); // dB
  const G0 = dBm2mW(g0);
  const PsatMw = 0.12 * p.pumpMw + 1; // saturation output power grows with pump
  const Pin = dBm2mW(p.PinDbm);
  // solve G = G0 exp(-(G-1)Pin/Psat)
  let G = G0;
  for (let i = 0; i < 100; i++) G = G0 * Math.exp((-(G - 1) * Pin) / PsatMw);
  const gainDb = 10 * Math.log10(Math.max(1, G));
  const nu = C / (p.lambda * 1e-9);
  const Bo = 12.5e9; // 0.1 nm
  const Pase = 2 * p.nsp * (G - 1) * H * nu * Bo * 1e3; // mW in 0.1nm
  const NF = 10 * Math.log10((2 * p.nsp * (G - 1)) / G + 1 / G);
  const Pout = Pin * G;
  const osnr = 10 * Math.log10(Pout / Math.max(Pase, 1e-12));
  // spectrum
  const xs = linspace(1520, 1580, 300);
  const gainShape = (l: number) => 1 - 0.25 * Math.exp(-Math.pow((l - 1530) / 6, 2)) * -1 - 0.35 * Math.pow((l - 1550) / 30, 2);
  const spectrum = xs.map((l) => {
    const ase = mW2dBm(Pase * (0.6 + 0.4 * gainShape(l)) * Math.exp(-Math.pow((l - 1545) / 25, 2) * 0.4)) + (p.model === "experimental" ? gauss() * 0.4 : 0);
    const sig = mW2dBm(Pout) + 10 * Math.log10(Math.exp(-4 * Math.LN2 * Math.pow((l - p.lambda) / 0.15, 2)) + 1e-12);
    return { x: +l.toFixed(2), y: +Math.max(ase, sig, -75).toFixed(2), ase: +ase.toFixed(2) };
  });
  return { gainDb, smallSignalDb: g0, PoutDbm: mW2dBm(Pout), PaseDbm: mW2dBm(Pase), NF, osnr, spectrum, Psat: mW2dBm(PsatMw) };
}

// ================= Receivers =================
export type RxType = "pin" | "apd" | "coherent";
export function receiverPerformance(p: { type: RxType; PrDbm: number; R: number; M: number; x: number; bwGHz: number; Id: number; T: number; RL: number; extinction: number; format: "nrz" | "rz" | "pam4"; }) {
  const P = dBm2mW(p.PrDbm) * 1e-3; // W avg
  const r = p.extinction; // linear extinction ratio P1/P0
  const P1 = (2 * P * r) / (r + 1), P0 = (2 * P) / (r + 1);
  const M = p.type === "apd" ? p.M : 1;
  const F = p.type === "apd" ? Math.pow(M, p.x) : 1;
  const B = p.bwGHz * 1e9;
  const I1 = M * p.R * P1, I0 = M * p.R * P0;
  const th = (4 * KB * p.T * B) / p.RL;
  const s1 = Math.sqrt(2 * Q * (p.R * P1 + p.Id * 1e-9) * M * M * F * B + th);
    const s0 = Math.sqrt(2 * Q * (p.R * P0 + p.Id * 1e-9) * M * M * F * B + th);
  let Qf = (I1 - I0) / (s1 + s0);
  if (p.type === "coherent") Qf *= 3.2; // LO gain approx shot-noise-limited
  if (p.format === "pam4") Qf /= 3; // 3 eyes, 1/3 amplitude
  if (p.format === "rz") Qf *= 1.2;
  const ber = berFromQ(Qf);
  return { Q: Qf, ber, I1, I0, s1, s0, shot: Math.sqrt(2 * Q * p.R * P * M * M * F * B), thermal: Math.sqrt(th), snrDb: 20 * Math.log10(Math.max(1e-9, Qf)) };
}
export function sensitivity(p: Parameters<typeof receiverPerformance>[0], targetBer = 1e-9) {
  let lo = -60, hi = 10;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (receiverPerformance({ ...p, PrDbm: m }).ber > targetBer) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

// ================= FBG =================
export function fbg(p: { periodNm: number; neff: number; lengthMm: number; dn: number; dT: number; strainUe: number; N?: number; }) {
  const alphaT = 0.55e-6, xi = 8.6e-6, pe = 0.22;
  const lB0 = 2 * p.neff * p.periodNm;
  const shift = lB0 * ((1 - pe) * p.strainUe * 1e-6 + (alphaT + xi) * p.dT);
  const lB = lB0 + shift;
  const L = p.lengthMm * 1e-3;
  const kappa = (Math.PI * p.dn) / (lB * 1e-9); // 1/m
  const Rmax = Math.pow(Math.tanh(kappa * L), 2);
  const bw = (lB * lB / (Math.PI * p.neff * L * 1e9)) * Math.sqrt(Math.pow(kappa * L, 2) + Math.PI * Math.PI); // nm (approx FWHM)
  const span = Math.max(1.5, bw * 6);
  const xs = linspace(lB - span / 2, lB + span / 2, p.N ?? 400);
  const spec = xs.map((l) => {
    const delta = 2 * Math.PI * p.neff * (1 / (l * 1e-9) - 1 / (lB * 1e-9)); // detuning 1/m
    let R: number;
    const k2 = kappa * kappa, d2 = delta * delta;
    if (k2 > d2) {
      const s = Math.sqrt(k2 - d2);
      R = Math.pow(Math.sinh(s * L), 2) / (Math.pow(Math.cosh(s * L), 2) - d2 / k2);
    } else {
      const s = Math.sqrt(d2 - k2);
      R = Math.pow(Math.sin(s * L), 2) / (d2 / k2 - Math.pow(Math.cos(s * L), 2) + 1e-12);
    }
    return { x: +l.toFixed(4), R: +clamp(R, 0, 1).toFixed(5), T: +(1 - clamp(R, 0, 1)).toFixed(5) };
  });
  return { lB0, lB, shift, Rmax, kappa, bw, spec };
}

// ================= FFT & NLSE =================
export function fft(re: Float64Array, im: Float64Array, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (inverse ? 1 : -1);
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j], ui = im[i + j];
        const vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci;
        const vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j] = ur + vr; im[i + j] = ui + vi;
        re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
export function fftshift(a: Float64Array | number[]) {
  const n = a.length, h = n >> 1;
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = a[(i + h) % n];
  return out;
}
// Split-step Fourier NLSE: dA/dz = -i β2/2 d²A/dT² + iγ|A|²A - α/2 A
export function nlse(p: { T0ps: number; P0W: number; beta2: number; gamma: number; Lkm: number; alphaDb: number; steps: number; N?: number; shape?: "sech" | "gauss"; snapshots?: number; chirp?: number; }) {
  const N = p.N ?? 256;
  const Tw = p.T0ps * 40;
  const dt = Tw / N;
  const t = Array.from({ length: N }, (_, i) => -Tw / 2 + i * dt);
  const re = new Float64Array(N), im = new Float64Array(N);
  const A0 = Math.sqrt(p.P0W);
  const Cc = p.chirp ?? 0;
  for (let i = 0; i < N; i++) {
    const x = t[i] / p.T0ps;
    const amp = p.shape === "gauss" ? A0 * Math.exp(-x * x / 2) : A0 / Math.cosh(x);
    const ph = (-Cc * x * x) / 2;
    re[i] = amp * Math.cos(ph); im[i] = amp * Math.sin(ph);
  }
  const w = Array.from({ length: N }, (_, i) => (2 * Math.PI * ((i < N / 2 ? i : i - N) / Tw))); // rad/ps
  const dz = p.Lkm / p.steps;
  const alpha = (p.alphaDb / 4.343); // 1/km
  const snapsN = p.snapshots ?? 40;
  const every = Math.max(1, Math.floor(p.steps / snapsN));
  const evolution: number[][] = [];
  const zs: number[] = [];
  const store = () => {
    evolution.push(Array.from({ length: N }, (_, i) => re[i] * re[i] + im[i] * im[i]));
    zs.push(evolution.length === 1 ? 0 : zs[zs.length - 1] + every * dz);
  };
  store();
  // dispersion operator half-step: exp(i β2/2 ω² dz/2)  (β2 ps²/km, ω rad/ps)
  const dispHalf = w.map((ww) => (p.beta2 / 2) * ww * ww * (dz / 2));
  for (let s = 1; s <= p.steps; s++) {
    // half dispersion
    fft(re, im);
    for (let i = 0; i < N; i++) { const c = Math.cos(dispHalf[i]), sn = Math.sin(dispHalf[i]); const r = re[i], m = im[i]; re[i] = r * c - m * sn; im[i] = r * sn + m * c; }
    fft(re, im, true);
    // nonlinear + loss
    for (let i = 0; i < N; i++) {
      const I = re[i] * re[i] + im[i] * im[i];
      const ph = p.gamma * I * dz; // γ W⁻¹km⁻¹ * W * km
      const att = Math.exp((-alpha * dz) / 2);
      const c = Math.cos(ph), sn = Math.sin(ph); const r = re[i], m = im[i];
      re[i] = (r * c - m * sn) * att; im[i] = (r * sn + m * c) * att;
    }
    fft(re, im);
    for (let i = 0; i < N; i++) { const c = Math.cos(dispHalf[i]), sn = Math.sin(dispHalf[i]); const r = re[i], m = im[i]; re[i] = r * c - m * sn; im[i] = r * sn + m * c; }
    fft(re, im, true);
    if (s % every === 0) store();
  }
  // final spectrum
  const sr = Float64Array.from(re), si = Float64Array.from(im);
  fft(sr, si);
  const spec = fftshift(Array.from({ length: N }, (_, i) => sr[i] * sr[i] + si[i] * si[i]));
  const freq = fftshift(w).map((x: number) => x / (2 * Math.PI)); // THz
  const LD = (p.T0ps * p.T0ps) / Math.abs(p.beta2 || 1e-9);
  const LNL = 1 / (p.gamma * p.P0W || 1e-9);
  const Nsol = Math.sqrt(LD / LNL);
  return { t, evolution, zs, spec, freq, LD, LNL, Nsol, final: Array.from({ length: N }, (_, i) => re[i] * re[i] + im[i] * im[i]) };
}

// ================= Nonlinear thresholds =================
export function nonlinearMetrics(p: { P0mW: number; gamma: number; Lkm: number; alphaDb: number; Aeff: number; linewidthMHz: number; nCh: number; spacingGHz: number; D: number; lambda: number; }) {
  const alpha = p.alphaDb / 4.343;
  const Leff = (1 - Math.exp(-alpha * p.Lkm)) / alpha;
  const phiSPM = p.gamma * (p.P0mW * 1e-3) * Leff; // rad
  const phiXPM = 2 * phiSPM * (p.nCh - 1);
  const gR = 1e-13, gB = 5e-11; // m/W
  const Aeff = p.Aeff * 1e-12;
  const PthSRS = (16 * Aeff) / (gR * Leff * 1e3) * 1e3; // mW
  const dnuB = 20e6;
  const PthSBS = ((21 * Aeff) / (gB * Leff * 1e3)) * (1 + (p.linewidthMHz * 1e6) / dnuB) * 1e3; // mW
  // FWM efficiency vs channel spacing
  const beta2 = beta2FromD(p.D, p.lambda) * 1e-24 * 1e-3; // s²/m
  const dw = 2 * Math.PI * p.spacingGHz * 1e9;
  const dbeta = Math.abs(beta2) * dw * dw;
  const a = alpha / 1e3;
  const eta = (a * a) / (a * a + dbeta * dbeta) * (1 + (4 * Math.exp(-a * p.Lkm * 1e3) * Math.pow(Math.sin((dbeta * p.Lkm * 1e3) / 2), 2)) / Math.pow(1 - Math.exp(-a * p.Lkm * 1e3), 2));
  const nFWM = (p.nCh * p.nCh * (p.nCh - 1)) / 2;
  return { Leff, phiSPM, phiXPM, PthSRS, PthSBS, etaFWM: eta, nFWM, LNL: 1 / (p.gamma * p.P0mW * 1e-3) };
}

// ================= Polarization =================
export function polarizationState(ExAmp: number, EyAmp: number, deltaDeg: number) {
  const d = rad(deltaDeg);
  const S0 = ExAmp ** 2 + EyAmp ** 2;
  const S1 = ExAmp ** 2 - EyAmp ** 2;
  const S2 = 2 * ExAmp * EyAmp * Math.cos(d);
  const S3 = 2 * ExAmp * EyAmp * Math.sin(d);
  const psi = deg(0.5 * Math.atan2(S2, S1));
  const chi = deg(0.5 * Math.asin(clamp(S3 / (S0 || 1), -1, 1)));
  const dop = Math.sqrt(S1 ** 2 + S2 ** 2 + S3 ** 2) / (S0 || 1);
  let kind = "elliptical";
  if (Math.abs(S3) < 1e-6 * S0 + 1e-9) kind = "linear";
  else if (Math.abs(S1) < 1e-3 * S0 && Math.abs(S2) < 1e-3 * S0) kind = "circular";
  const ellipse = Array.from({ length: 121 }, (_, i) => { const t = (2 * Math.PI * i) / 120; return { x: ExAmp * Math.cos(t), y: EyAmp * Math.cos(t + d) }; });
  return { S0, S1, S2, S3, psi, chi, dop, kind, ellipse };
}

// ================= Curve fitting =================
export function fitLinear(xs: number[], ys: number[]) {
  const n = xs.length; const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  const b = sxy / (sxx || 1e-12), a = my - b * mx;
  const r2 = syy ? (sxy * sxy) / (sxx * syy) : 1;
  return { a, b, r2, f: (x: number) => a + b * x, label: `y = ${a.toPrecision(4)} + ${b.toPrecision(4)}·x` };
}
export function fitExp(xs: number[], ys: number[]) {
  const ok = ys.every((y) => y > 0);
  if (!ok) return null;
  const f = fitLinear(xs, ys.map(Math.log));
  return { A: Math.exp(f.a), k: f.b, r2: f.r2, f: (x: number) => Math.exp(f.a) * Math.exp(f.b * x), label: `y = ${Math.exp(f.a).toPrecision(4)}·exp(${f.b.toPrecision(4)}·x)` };
}
export function fitPower(xs: number[], ys: number[]) {
  if (!xs.every((x) => x > 0) || !ys.every((y) => y > 0)) return null;
  const f = fitLinear(xs.map(Math.log), ys.map(Math.log));
  return { A: Math.exp(f.a), n: f.b, r2: f.r2, f: (x: number) => Math.exp(f.a) * Math.pow(x, f.b), label: `y = ${Math.exp(f.a).toPrecision(4)}·x^${f.b.toPrecision(4)}` };
}
export function fitPoly2(xs: number[], ys: number[]) {
  // normal equations for quadratic
  const n = xs.length; let s0 = n, s1 = 0, s2 = 0, s3 = 0, s4 = 0, t0 = 0, t1 = 0, t2 = 0;
  for (let i = 0; i < n; i++) { const x = xs[i], y = ys[i]; s1 += x; s2 += x * x; s3 += x ** 3; s4 += x ** 4; t0 += y; t1 += x * y; t2 += x * x * y; }
  const A = [[s0, s1, s2], [s1, s2, s3], [s2, s3, s4]], bv = [t0, t1, t2];
  // gaussian elimination
  for (let i = 0; i < 3; i++) { for (let j = i + 1; j < 3; j++) { const f = A[j][i] / (A[i][i] || 1e-12); for (let k = i; k < 3; k++) A[j][k] -= f * A[i][k]; bv[j] -= f * bv[i]; } }
  const c = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let s = bv[i]; for (let k = i + 1; k < 3; k++) s -= A[i][k] * c[k]; c[i] = s / (A[i][i] || 1e-12); }
  const f = (x: number) => c[0] + c[1] * x + c[2] * x * x;
  const my = t0 / n; let ssr = 0, sst = 0; for (let i = 0; i < n; i++) { ssr += (ys[i] - f(xs[i])) ** 2; sst += (ys[i] - my) ** 2; }
  return { c, r2: sst ? 1 - ssr / sst : 1, f, label: `y = ${c[0].toPrecision(4)} + ${c[1].toPrecision(4)}·x + ${c[2].toPrecision(4)}·x²` };
}

export function errorStats(theory: number, measured: number) {
  const abs = measured - theory;
  const rel = theory !== 0 ? abs / theory : NaN;
  return { abs, rel, pct: rel * 100 };
}

// Eye diagram generation
export function eyeDiagram(p: { bitRateGbps: number; bwGHz: number; snr: number; jitterUI: number; extinction: number; nBits?: number; samples?: number; dispersionPs?: number; format?: "nrz" | "pam4"; }) {
  const nBits = p.nBits ?? 160, S = p.samples ?? 32;
  const rand = seeded(7);
  const levels = p.format === "pam4" ? 4 : 2;
  const bits = Array.from({ length: nBits }, () => Math.floor(rand() * levels) / (levels - 1));
  const Tb = 1000 / p.bitRateGbps; // ps
  // rise time from bandwidth: tr ≈ 0.35/BW ; plus dispersion broadening
  const tr = Math.sqrt(Math.pow(350 / p.bwGHz, 2) + Math.pow(p.dispersionPs ?? 0, 2)); // ps
  const tau = tr / 2.2; // RC time constant
  const dtp = Tb / S;
  const a = 1 - Math.exp(-dtp / tau);
  const traces: number[][] = [];
  let y = 0;
  const r = p.extinction, lo = 1 / r; // normalized low level
  const sigma = 1 / Math.max(1e-3, p.snr) / 2; // noise std relative to amplitude
  const jitterPs = p.jitterUI * Tb;
  const stream: number[] = [];
  for (let b = 0; b < nBits; b++) {
    const target = lo + (1 - lo) * bits[b];
    const jit = gauss() * jitterPs;
    const shiftSamples = Math.round(jit / dtp);
    for (let s = 0; s < S; s++) {
      const useBit = s + shiftSamples < 0 && b > 0 ? lo + (1 - lo) * bits[b - 1] : target;
      y += a * (useBit - y);
      stream.push(y + gauss() * sigma);
    }
  }
  for (let b = 1; b < nBits - 1; b++) traces.push(stream.slice(b * S - S / 2, b * S + S + S / 2));
  // metrics at center sample
  const centerIdx = S; // center of middle bit within 2UI trace
  const ones: number[] = [], zeros: number[] = [];
  traces.forEach((t, i) => { const bit = bits[i + 1]; if (bit === 1) ones.push(t[centerIdx]); else if (bit === 0) zeros.push(t[centerIdx]); });
  const mean = (arr: number[]) => arr.reduce((x, y2) => x + y2, 0) / (arr.length || 1);
  const std = (arr: number[]) => { const m = mean(arr); return Math.sqrt(arr.reduce((x, y2) => x + (y2 - m) ** 2, 0) / (arr.length || 1)); };
  const m1 = mean(ones), m0 = mean(zeros), s1 = std(ones), s0 = std(zeros);
  const Qf = (m1 - m0) / (s1 + s0 || 1e-9);
  const eyeHeight = (m1 - 3 * s1) - (m0 + 3 * s0);
  const eyeWidth = Math.max(0, 1 - 2 * (p.jitterUI * 3) - Math.min(0.9, tr / Tb) * 0.5);
  return { traces, Tb, S, Q: Qf, ber: berFromQ(Qf), eyeHeight, eyeWidth, m1, m0, s1, s0, tr };
}
