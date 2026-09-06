import {
  CANVAS_H,
  CANVAS_W,
  type HitEvent,
  type LabObject,
  type Medium,
  type Segment,
  type TraceResult,
  type Vec,
} from "./types";

const EPS = 0.01;
const MAX_BOUNCES = 14;
const DEG = 180 / Math.PI;

export const rad = (d: number) => (d * Math.PI) / 180;
export const dirFromAngle = (deg: number): Vec => ({ x: Math.cos(rad(deg)), y: Math.sin(rad(deg)) });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
export const len = (a: Vec) => Math.hypot(a.x, a.y);
export const norm = (a: Vec): Vec => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const dist = (a: Vec, b: Vec) => len(sub(a, b));
export const angleOf = (v: Vec) => Math.atan2(v.y, v.x) * DEG;

/** endpoints of a "plate" object (mirror or lens) */
export function plateEnds(o: LabObject): [Vec, Vec] {
  const L = o.length ?? 120;
  const d = dirFromAngle(o.angle);
  return [
    { x: o.x - (d.x * L) / 2, y: o.y - (d.y * L) / 2 },
    { x: o.x + (d.x * L) / 2, y: o.y + (d.y * L) / 2 },
  ];
}

export function rectOf(o: LabObject) {
  const w = o.w ?? 160;
  const h = o.h ?? 110;
  return { x0: o.x - w / 2, y0: o.y - h / 2, x1: o.x + w / 2, y1: o.y + h / 2 };
}

export function pointInRect(p: Vec, o: LabObject) {
  const r = rectOf(o);
  return p.x > r.x0 && p.x < r.x1 && p.y > r.y0 && p.y < r.y1;
}

interface Hit {
  t: number;
  point: Vec;
  normal: Vec; // oriented against the ray direction
  obj: LabObject | null;
  kind: "mirror" | "lens" | "rect" | "target" | "bounds";
}

function raySegment(p: Vec, d: Vec, a: Vec, b: Vec): { t: number; normal: Vec } | null {
  const e = sub(b, a);
  const denom = d.x * e.y - d.y * e.x;
  if (Math.abs(denom) < 1e-9) return null;
  const ap = sub(a, p);
  const t = (ap.x * e.y - ap.y * e.x) / denom;
  const s = (ap.x * d.y - ap.y * d.x) / denom;
  if (t <= EPS || s < 0 || s > 1) return null;
  let n = norm({ x: -e.y, y: e.x });
  if (dot(n, d) > 0) n = mul(n, -1);
  return { t, normal: n };
}

function rayRect(p: Vec, d: Vec, o: LabObject): { t: number; normal: Vec } | null {
  const r = rectOf(o);
  let tmin = -Infinity;
  let tmax = Infinity;
  let nMin: Vec = { x: 0, y: 0 };
  let nMax: Vec = { x: 0, y: 0 };
  // X slabs
  if (Math.abs(d.x) < 1e-9) {
    if (p.x < r.x0 || p.x > r.x1) return null;
  } else {
    let t1 = (r.x0 - p.x) / d.x;
    let t2 = (r.x1 - p.x) / d.x;
    let n1: Vec = { x: -1, y: 0 };
    let n2: Vec = { x: 1, y: 0 };
    if (t1 > t2) {
      [t1, t2] = [t2, t1];
      [n1, n2] = [n2, n1];
    }
    if (t1 > tmin) { tmin = t1; nMin = n1; }
    if (t2 < tmax) { tmax = t2; nMax = n2; }
  }
  // Y slabs
  if (Math.abs(d.y) < 1e-9) {
    if (p.y < r.y0 || p.y > r.y1) return null;
  } else {
    let t1 = (r.y0 - p.y) / d.y;
    let t2 = (r.y1 - p.y) / d.y;
    let n1: Vec = { x: 0, y: -1 };
    let n2: Vec = { x: 0, y: 1 };
    if (t1 > t2) {
      [t1, t2] = [t2, t1];
      [n1, n2] = [n2, n1];
    }
    if (t1 > tmin) { tmin = t1; nMin = n1; }
    if (t2 < tmax) { tmax = t2; nMax = n2; }
  }
  if (tmax < tmin || tmax <= EPS) return null;
  if (tmin > EPS) {
    // entering from outside
    let n = nMin;
    if (dot(n, d) > 0) n = mul(n, -1);
    return { t: tmin, normal: n };
  }
  // inside: exit
  let n = nMax;
  if (dot(n, d) > 0) n = mul(n, -1);
  return { t: tmax, normal: n };
}

function rayCircle(p: Vec, d: Vec, c: Vec, r: number): number | null {
  const oc = sub(p, c);
  const b = dot(oc, d);
  const cc = dot(oc, oc) - r * r;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const t1 = -b - s;
  const t2 = -b + s;
  if (t1 > EPS) return t1;
  if (t2 > EPS) return t2;
  return null;
}

function rayBounds(p: Vec, d: Vec): number {
  let t = Infinity;
  if (d.x > 0) t = Math.min(t, (CANVAS_W - p.x) / d.x);
  if (d.x < 0) t = Math.min(t, (0 - p.x) / d.x);
  if (d.y > 0) t = Math.min(t, (CANVAS_H - p.y) / d.y);
  if (d.y < 0) t = Math.min(t, (0 - p.y) / d.y);
  return Math.max(t, 0);
}

const mediumOf = (o: LabObject | null): Medium =>
  o ? (o.kind === "water" ? "water" : "glass") : "air";
const indexOf = (o: LabObject | null) => (o ? o.n ?? (o.kind === "water" ? 1.33 : 1.5) : 1);

function reflectDir(d: Vec, n: Vec): Vec {
  return norm(sub(d, mul(n, 2 * dot(d, n))));
}

function refractDir(d: Vec, n: Vec, n1: number, n2: number): Vec | null {
  const eta = n1 / n2;
  const cosI = -dot(d, n);
  const sin2T = eta * eta * (1 - cosI * cosI);
  if (sin2T > 1) return null; // total internal reflection
  const cosT = Math.sqrt(1 - sin2T);
  return norm(add(mul(d, eta), mul(n, eta * cosI - cosT)));
}

function lensDir(d: Vec, hit: Vec, lens: LabObject): Vec {
  const f = lens.focal ?? (lens.kind === "convex" ? 150 : -150);
  const a = rad(lens.angle);
  const u: Vec = { x: -Math.sin(a), y: Math.cos(a) }; // optical axis
  const du = dot(d, u);
  if (Math.abs(du) < 0.08) return d;
  const s = f / Math.abs(du);
  const Q = add({ x: lens.x, y: lens.y }, mul(d, s));
  const out = f > 0 ? sub(Q, hit) : sub(hit, Q);
  const o = norm(out);
  // keep going forward
  return dot(o, d) < 0 ? d : o;
}

function sourceRays(src: LabObject): { p: Vec; d: Vec }[] {
  const mode = src.rayMode ?? "single";
  const count = Math.max(1, src.rayCount ?? 1);
  const d = dirFromAngle(src.angle);
  const origin: Vec = { x: src.x, y: src.y };
  if (mode === "single" || count === 1) return [{ p: origin, d }];
  if (mode === "fan") {
    const spread = src.spread ?? 30;
    const rays: { p: Vec; d: Vec }[] = [];
    for (let i = 0; i < count; i++) {
      const a = src.angle - spread / 2 + (spread * i) / (count - 1);
      rays.push({ p: origin, d: dirFromAngle(a) });
    }
    return rays;
  }
  // parallel
  const perp: Vec = { x: -d.y, y: d.x };
  const spacing = src.spread ?? 16;
  const rays: { p: Vec; d: Vec }[] = [];
  for (let i = 0; i < count; i++) {
    const off = (i - (count - 1) / 2) * spacing;
    rays.push({ p: add(origin, mul(perp, off)), d });
  }
  return rays;
}

function lineIntersection(p1: Vec, d1: Vec, p2: Vec, d2: Vec): { t1: number; t2: number } | null {
  const denom = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(denom) < 1e-9) return null;
  const dp = sub(p2, p1);
  const t1 = (dp.x * d2.y - dp.y * d2.x) / denom;
  const t2 = (dp.x * d1.y - dp.y * d1.x) / denom;
  return { t1, t2 };
}

export function traceScene(objects: LabObject[]): TraceResult {
  const segments: Segment[] = [];
  const events: HitEvent[] = [];
  const targetsHit = new Set<string>();
  const sources = objects.filter((o) => o.kind === "source");
  const mirrors = objects.filter((o) => o.kind === "mirror");
  const lenses = objects.filter((o) => o.kind === "convex" || o.kind === "concave");
  const rects = objects.filter((o) => o.kind === "glass" || o.kind === "water");
  const targets = objects.filter((o) => o.kind === "target");

  let rayIndex = 0;
  for (const src of sources) {
    for (const ray of sourceRays(src)) {
      let p = ray.p;
      let d = ray.d;
      let inside: LabObject | null = rects.find((r) => pointInRect(p, r)) ?? null;
      for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
        let best: Hit = { t: rayBounds(p, d), point: { x: 0, y: 0 }, normal: { x: 0, y: 0 }, obj: null, kind: "bounds" };
        for (const m of mirrors) {
          const [a, b] = plateEnds(m);
          const h = raySegment(p, d, a, b);
          if (h && h.t < best.t) best = { t: h.t, point: { x: 0, y: 0 }, normal: h.normal, obj: m, kind: "mirror" };
        }
        for (const l of lenses) {
          const [a, b] = plateEnds(l);
          const h = raySegment(p, d, a, b);
          if (h && h.t < best.t) best = { t: h.t, point: { x: 0, y: 0 }, normal: h.normal, obj: l, kind: "lens" };
        }
        for (const r of rects) {
          if (inside && r.id !== inside.id) continue;
          const h = rayRect(p, d, r);
          if (h && h.t < best.t) best = { t: h.t, point: { x: 0, y: 0 }, normal: h.normal, obj: r, kind: "rect" };
        }
        for (const tg of targets) {
          const t = rayCircle(p, d, { x: tg.x, y: tg.y }, tg.r ?? 26);
          if (t !== null && t < best.t) best = { t, point: { x: 0, y: 0 }, normal: { x: 0, y: 0 }, obj: tg, kind: "target" };
        }
        best.point = add(p, mul(d, best.t));
        segments.push({ a: p, b: best.point, medium: mediumOf(inside), rayIndex, bounce });

        if (best.kind === "bounds") break;
        if (best.kind === "target" && best.obj) {
          targetsHit.add(best.obj.id);
          events.push({
            type: "target", point: best.point, normal: mul(d, -1), inDir: d, outDir: d,
            objectId: best.obj.id, objectKind: "target", incidence: 0, outAngle: 0, rayIndex,
          });
          break;
        }
        const n = best.normal;
        const inc = Math.acos(Math.min(1, Math.max(-1, -dot(d, n)))) * DEG;
        if (best.kind === "mirror" && best.obj) {
          const out = reflectDir(d, n);
          events.push({
            type: "reflect", point: best.point, normal: n, inDir: d, outDir: out, objectId: best.obj.id,
            objectKind: "mirror", incidence: inc, outAngle: inc, rayIndex,
          });
          p = add(best.point, mul(out, 0.05));
          d = out;
          continue;
        }
        if (best.kind === "lens" && best.obj) {
          const out = lensDir(d, best.point, best.obj);
          events.push({
            type: "lens", point: best.point, normal: n, inDir: d, outDir: out, objectId: best.obj.id,
            objectKind: best.obj.kind, incidence: inc, outAngle: Math.acos(Math.min(1, Math.max(-1, -dot(out, n)))) * DEG, rayIndex,
          });
          p = add(best.point, mul(out, 0.05));
          d = out;
          continue;
        }
        if (best.kind === "rect" && best.obj) {
          const entering = !inside;
          const n1 = entering ? 1 : indexOf(inside);
          const n2 = entering ? indexOf(best.obj) : 1;
          const out = refractDir(d, n, n1, n2);
          if (!out) {
            const r = reflectDir(d, n);
            events.push({
              type: "tir", point: best.point, normal: n, inDir: d, outDir: r, objectId: best.obj.id,
              objectKind: best.obj.kind, incidence: inc, outAngle: inc, rayIndex,
            });
            p = add(best.point, mul(r, 0.05));
            d = r;
            continue;
          }
          const outAng = Math.acos(Math.min(1, Math.max(-1, dot(out, mul(n, -1))))) * DEG;
          events.push({
            type: "refract", point: best.point, normal: n, inDir: d, outDir: out, objectId: best.obj.id,
            objectKind: best.obj.kind, incidence: inc, outAngle: outAng, rayIndex,
          });
          inside = entering ? best.obj : null;
          p = add(best.point, mul(out, 0.05));
          d = out;
          continue;
        }
        break;
      }
      rayIndex++;
    }
  }

  // focus point for convex lenses: intersect outgoing rays pairwise
  let focusPoint: Vec | null = null;
  const lensOuts = events.filter((e) => e.type === "lens" && e.objectKind === "convex");
  if (lensOuts.length >= 2) {
    const pts: Vec[] = [];
    for (let i = 0; i < lensOuts.length; i++) {
      for (let j = i + 1; j < lensOuts.length; j++) {
        const A = lensOuts[i];
        const B = lensOuts[j];
        const r = lineIntersection(A.point, A.outDir, B.point, B.outDir);
        if (r && r.t1 > 2 && r.t2 > 2 && r.t1 < 900 && r.t2 < 900) {
          pts.push(add(A.point, mul(A.outDir, r.t1)));
        }
      }
    }
    if (pts.length) {
      const avg = pts.reduce((acc, p) => add(acc, p), { x: 0, y: 0 });
      focusPoint = mul(avg, 1 / pts.length);
    }
  }

  const firstMirrorHit = events.find((e) => e.type === "reflect") ?? null;
  return { segments, events, targetsHit, focusPoint, firstMirrorHit };
}
