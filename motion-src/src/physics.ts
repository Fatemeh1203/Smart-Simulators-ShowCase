export const G = 9.81;

export interface Params {
  mass: number; // kg
  force: number; // N (applied, +x direction)
  mu: number; // coefficient of friction (0..1)
  v0: number; // initial velocity m/s
}

export interface BodyState {
  t: number;
  x: number;
  v: number;
  a: number;
  weight: number;
  normal: number;
  frictionMax: number; // μN
  friction: number; // signed friction force acting on body (N)
  net: number; // signed net force
  moving: boolean;
}

export type SurfaceKey = "ice" | "wood" | "concrete" | "rough" | "custom";

export const SURFACES: { key: SurfaceKey; label: string; mu: number; color: string; emoji: string }[] = [
  { key: "ice", label: "یخ", mu: 0.05, color: "#bae6fd", emoji: "🧊" },
  { key: "wood", label: "چوب", mu: 0.3, color: "#d6b27a", emoji: "🪵" },
  { key: "concrete", label: "بتن", mu: 0.6, color: "#a8a29e", emoji: "🧱" },
  { key: "rough", label: "سطح زبر", mu: 0.9, color: "#78716c", emoji: "⛰️" },
];

export function surfaceForMu(mu: number): SurfaceKey {
  const s = SURFACES.find((s) => Math.abs(s.mu - mu) < 1e-6);
  return s ? s.key : "custom";
}

/** Compute all forces given params and current velocity. */
export function computeForces(p: Params, v: number) {
  const weight = p.mass * G;
  const normal = weight; // horizontal surface
  const frictionMax = p.mu * normal;
  const EPS = 1e-6;

  let friction: number;
  let moving: boolean;

  if (Math.abs(v) < EPS) {
    // At rest: static friction balances applied force up to μN
    if (Math.abs(p.force) <= frictionMax + 1e-9) {
      friction = -p.force; // balances exactly
      moving = false;
    } else {
      friction = -Math.sign(p.force) * frictionMax;
      moving = true;
    }
  } else {
    // Kinetic friction opposes motion
    friction = -Math.sign(v) * frictionMax;
    moving = true;
  }

  const net = p.force + friction;
  const a = net / p.mass;
  return { weight, normal, frictionMax, friction, net, a, moving };
}

export function initialState(p: Params): BodyState {
  const f = computeForces(p, p.v0);
  return { t: 0, x: 0, v: p.v0, ...f };
}

/** Advance one time step using semi-implicit Euler with stop handling. */
export function stepBody(s: BodyState, p: Params, dt: number): BodyState {
  const f = computeForces(p, s.v);
  let v = s.v + f.a * dt;
  let x: number;

  // Handle the block coming to rest (friction cannot reverse motion)
  if (s.v !== 0 && Math.sign(v) !== Math.sign(s.v) && Math.sign(v) !== 0) {
    // crossed zero this step -> stop at zero
    const tStop = Math.abs(s.v / f.a);
    x = s.x + s.v * tStop + 0.5 * f.a * tStop * tStop;
    v = 0;
    // after stopping, re-evaluate static friction
    const f2 = computeForces(p, 0);
    if (f2.moving) {
      const rem = dt - tStop;
      v = f2.a * rem;
      x += 0.5 * f2.a * rem * rem;
      return { t: s.t + dt, x, v, ...f2 };
    }
    return { t: s.t + dt, x, v: 0, ...f2 };
  }

  x = s.x + s.v * dt + 0.5 * f.a * dt * dt;
  const fNew = computeForces(p, v);
  return { t: s.t + dt, x, v, ...fNew };
}

export const fmt = (n: number, d = 2) => {
  if (!isFinite(n)) return "—";
  const r = Math.abs(n) < 1e-9 ? 0 : n;
  return r.toFixed(d);
};
