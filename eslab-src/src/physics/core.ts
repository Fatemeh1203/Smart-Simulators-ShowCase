// ===== Physical constants (SI) =====
export const K = 8.99e9; // N·m²/C²
export const E_CHARGE = 1.602e-19; // C
export const EPS0 = 8.854e-12; // F/m

export interface Vec { x: number; y: number }
export interface PointCharge { x: number; y: number; q: number } // meters, coulombs

export const vlen = (v: Vec) => Math.hypot(v.x, v.y);

// Coulomb force magnitude (N) with optional relative permittivity
export function coulombForce(q1: number, q2: number, r: number, er = 1) {
  if (r <= 0) return 0;
  return (K * Math.abs(q1 * q2)) / (er * r * r);
}

// Electric field (N/C) at point p from list of charges
export function fieldAt(charges: PointCharge[], px: number, py: number, er = 1, soft = 0): Vec {
  let ex = 0, ey = 0;
  for (const c of charges) {
    const dx = px - c.x, dy = py - c.y;
    const r2 = dx * dx + dy * dy + soft * soft;
    const r = Math.sqrt(r2);
    if (r < 1e-9) continue;
    const e = (K * c.q) / (er * r2);
    ex += (e * dx) / r;
    ey += (e * dy) / r;
  }
  return { x: ex, y: ey };
}

// Electric potential (V) at point p
export function potentialAt(charges: PointCharge[], px: number, py: number, er = 1): number {
  let v = 0;
  for (const c of charges) {
    const r = Math.hypot(px - c.x, py - c.y);
    if (r < 1e-9) return c.q > 0 ? Infinity : -Infinity;
    v += (K * c.q) / (er * r);
  }
  return v;
}

// Field line tracer: RK2 integration in world (meter) coordinates
export function traceFieldLine(
  charges: PointCharge[],
  sx: number, sy: number,
  dir: 1 | -1,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  step: number,
  maxSteps = 900,
): Vec[] {
  const pts: Vec[] = [{ x: sx, y: sy }];
  let x = sx, y = sy;
  for (let i = 0; i < maxSteps; i++) {
    const e1 = fieldAt(charges, x, y);
    const m1 = vlen(e1);
    if (m1 === 0) break;
    const hx = x + (dir * step * e1.x) / m1 / 2, hy = y + (dir * step * e1.y) / m1 / 2;
    const e2 = fieldAt(charges, hx, hy);
    const m2 = vlen(e2);
    if (m2 === 0) break;
    x += (dir * step * e2.x) / m2;
    y += (dir * step * e2.y) / m2;
    pts.push({ x, y });
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) break;
    // stop when reaching a charge of opposite polarity
    let hit = false;
    for (const c of charges) {
      if (Math.hypot(x - c.x, y - c.y) < step * 1.2) { hit = true; break; }
    }
    if (hit) break;
  }
  return pts;
}

// Generate field lines for a set of charges. Lines per unit charge ~ proportional to |q|
export function generateFieldLines(
  charges: PointCharge[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  linesPerUnit: number, // lines per 1 unit of |q| (e.g. per 1 µC)
  unit: number,
  step: number,
): { pts: Vec[]; positive: boolean }[] {
  const lines: { pts: Vec[]; positive: boolean }[] = [];
  const totalPos = charges.filter(c => c.q > 0).reduce((s, c) => s + c.q, 0);
  const totalNeg = charges.filter(c => c.q < 0).reduce((s, c) => s - c.q, 0);
  // Emit from positive charges; if there are no positive, emit from negative backwards
  for (const c of charges) {
    if (c.q === 0) continue;
    const startFromThis = c.q > 0 ? true : totalPos === 0;
    if (!startFromThis && totalNeg > totalPos) {
      // negative excess: also trace backward from negative charges (lines coming from infinity)
    } else if (!startFromThis) continue;
    const n = Math.max(4, Math.round((Math.abs(c.q) / unit) * linesPerUnit));
    const r0 = step * 2.5;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n + 0.01;
      const pts = traceFieldLine(charges, c.x + r0 * Math.cos(a), c.y + r0 * Math.sin(a), c.q > 0 ? 1 : -1, bounds, step);
      lines.push({ pts, positive: c.q > 0 });
    }
  }
  return lines;
}

// ===== Formatting =====
export function fmt(v: number, digits = 3): string {
  if (!isFinite(v)) return v > 0 ? "∞" : "-∞";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-2) {
    const exp = Math.floor(Math.log10(a));
    const m = v / Math.pow(10, exp);
    return `${m.toFixed(digits - 1)}×10^${exp}`;
  }
  return v.toFixed(a >= 100 ? 1 : digits);
}

export function fmtSI(v: number, unit: string, digits = 3): string {
  if (!isFinite(v)) return (v > 0 ? "∞ " : "-∞ ") + unit;
  if (v === 0) return `0 ${unit}`;
  const a = Math.abs(v);
  const prefixes: [number, string][] = [
    [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"], [1e-15, "f"],
  ];
  for (const [f, p] of prefixes) {
    if (a >= f * 0.9999) return `${(v / f).toPrecision(digits)} ${p}${unit}`;
  }
  return `${v.toExponential(digits - 1)} ${unit}`;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
