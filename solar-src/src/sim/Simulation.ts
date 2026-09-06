import { PLANETS, SUN_RADIUS, type PlanetDef } from "../data/planets";

export type BodyKind = "kepler" | "physics";
export type BodyStatus = "ok" | "crashed" | "escaped";

export interface Body {
  id: string;
  name: string;
  emoji: string;
  color: string;
  color2: string;
  radius: number;
  hasRings: boolean;
  isCustom: boolean;
  baseOrbitR: number;
  basePeriod: number;
  orbitR: number; // شعاع مدار فعلی (کپلری)
  period: number; // زمان یک دور (روز)
  GM: number; // ثابت گرانشی مؤثر برای حالت فیزیکی
  kind: BodyKind;
  angle: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speedFactor: number;
  trail: { x: number; y: number }[];
  travelled: number; // زاویه‌ی طی‌شده از آخرین بازنشانی دور
  laps: number;
  status: BodyStatus;
  startAngle: number;
  // برای آزمایش سرعت: کمترین و بیشترین فاصله مشاهده‌شده
  minR: number;
  maxR: number;
  bornAt: number;
}

export const ESCAPE_R = 1400;
const TWO_PI = Math.PI * 2;

/** مدت یک دور بر اساس فاصله‌ی نمایشی — درون‌یابی از داده‌های واقعی سیارات (مدل ساده‌شده) */
export function periodAtDisplayR(r: number): number {
  const pts = PLANETS.map((p) => ({ r: p.orbitR, t: p.periodDays }));
  const lr = Math.log(r);
  if (r <= pts[0].r) {
    const a = pts[0], b = pts[1];
    const k = (Math.log(b.t) - Math.log(a.t)) / (Math.log(b.r) - Math.log(a.r));
    return Math.exp(Math.log(a.t) + k * (lr - Math.log(a.r)));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (r <= b.r) {
      const k = (Math.log(b.t) - Math.log(a.t)) / (Math.log(b.r) - Math.log(a.r));
      return Math.exp(Math.log(a.t) + k * (lr - Math.log(a.r)));
    }
  }
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const k = (Math.log(b.t) - Math.log(a.t)) / (Math.log(b.r) - Math.log(a.r));
  return Math.exp(Math.log(b.t) + k * (lr - Math.log(b.r)));
}

export const gmFor = (orbitR: number, period: number) => Math.pow(TWO_PI / period, 2) * Math.pow(orbitR, 3);

function makeBody(p: PlanetDef, startAngle: number): Body {
  const b: Body = {
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    color: p.color,
    color2: p.color2,
    radius: p.radius,
    hasRings: !!p.hasRings,
    isCustom: false,
    baseOrbitR: p.orbitR,
    basePeriod: p.periodDays,
    orbitR: p.orbitR,
    period: p.periodDays,
    GM: gmFor(p.orbitR, p.periodDays),
    kind: "kepler",
    angle: startAngle,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speedFactor: 1,
    trail: [],
    travelled: 0,
    laps: 0,
    status: "ok",
    startAngle,
    minR: p.orbitR,
    maxR: p.orbitR,
    bornAt: 0,
  };
  b.x = Math.cos(startAngle) * p.orbitR;
  b.y = Math.sin(startAngle) * p.orbitR;
  return b;
}

const START_ANGLES = [0.4, 2.1, 5.2, 3.6, 1.2, 4.4, 0.9, 2.9];

export interface CustomPlanetInput {
  name: string;
  color: string;
  color2?: string;
  radius: number;
  orbitR: number;
  speedFactor: number;
  hasRings?: boolean;
}

export class Simulation {
  bodies: Body[] = [];
  time = 0; // روز
  earthSpin = 0; // چرخش زمین به دور خود (رادیان)
  private customCount = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.bodies = PLANETS.map((p, i) => makeBody(p, START_ANGLES[i]));
    this.time = 0;
    this.earthSpin = 0;
    this.customCount = 0;
  }

  get(id: string) {
    return this.bodies.find((b) => b.id === id);
  }

  /** بازگرداندن یک سیاره به مدار اصلی خودش */
  restore(id: string) {
    const b = this.get(id);
    if (!b) return;
    const angle = b.kind === "physics" ? Math.atan2(b.y, b.x) : b.angle;
    b.kind = "kepler";
    b.orbitR = b.baseOrbitR;
    b.period = b.basePeriod;
    b.GM = gmFor(b.orbitR, b.period);
    b.angle = angle;
    b.speedFactor = 1;
    b.status = "ok";
    b.trail = [];
    b.travelled = 0;
    b.laps = 0;
    b.minR = b.orbitR;
    b.maxR = b.orbitR;
    b.x = Math.cos(angle) * b.orbitR;
    b.y = Math.sin(angle) * b.orbitR;
  }

  /** تغییر فاصله‌ی یک سیاره از خورشید — مدار و زمان دور بر اساس مدل ساده تغییر می‌کند */
  setOrbitR(id: string, r: number) {
    const b = this.get(id);
    if (!b) return;
    if (b.kind === "physics") b.angle = Math.atan2(b.y, b.x);
    b.kind = "kepler";
    b.orbitR = r;
    b.period = periodAtDisplayR(r);
    b.GM = gmFor(r, b.period);
    b.status = "ok";
    b.speedFactor = 1;
    b.trail = [];
    b.x = Math.cos(b.angle) * r;
    b.y = Math.sin(b.angle) * r;
  }

  /** تغییر سرعت حرکت سیاره — سیاره وارد حالت فیزیکی (گرانش واقعی ساده‌شده) می‌شود */
  setSpeedFactor(id: string, f: number) {
    const b = this.get(id);
    if (!b) return;
    // اگر سیاره در حالت فیزیکی است، از مکان فعلی‌اش شروع کن
    let angle: number;
    let r: number;
    if (b.kind === "physics" && b.status === "ok") {
      angle = Math.atan2(b.y, b.x);
      r = b.orbitR; // از شعاع مرجع مدار دایره‌ای استفاده می‌کنیم تا آزمایش قابل تکرار باشد
    } else {
      angle = b.kind === "physics" ? Math.atan2(b.y, b.x) : b.angle;
      r = b.orbitR;
    }
    b.kind = "physics";
    b.speedFactor = f;
    b.status = "ok";
    b.trail = [];
    b.travelled = 0;
    b.laps = 0;
    b.angle = angle;
    b.x = Math.cos(angle) * r;
    b.y = Math.sin(angle) * r;
    const vCirc = Math.sqrt(b.GM / r);
    b.vx = -Math.sin(angle) * vCirc * f;
    b.vy = Math.cos(angle) * vCirc * f;
    b.minR = r;
    b.maxR = r;
    b.bornAt = this.time;
  }

  addCustom(input: CustomPlanetInput): Body {
    this.customCount++;
    const id = `custom-${this.customCount}`;
    const angle = Math.random() * TWO_PI;
    const period = periodAtDisplayR(input.orbitR);
    const GM = gmFor(input.orbitR, period);
    const vCirc = Math.sqrt(GM / input.orbitR);
    const b: Body = {
      id,
      name: input.name || `سیاره ${this.customCount}`,
      emoji: "🪐",
      color: input.color,
      color2: input.color2 ?? shade(input.color, -40),
      radius: input.radius,
      hasRings: !!input.hasRings,
      isCustom: true,
      baseOrbitR: input.orbitR,
      basePeriod: period,
      orbitR: input.orbitR,
      period,
      GM,
      kind: "physics",
      angle,
      x: Math.cos(angle) * input.orbitR,
      y: Math.sin(angle) * input.orbitR,
      vx: -Math.sin(angle) * vCirc * input.speedFactor,
      vy: Math.cos(angle) * vCirc * input.speedFactor,
      speedFactor: input.speedFactor,
      trail: [],
      travelled: 0,
      laps: 0,
      status: "ok",
      startAngle: angle,
      minR: input.orbitR,
      maxR: input.orbitR,
      bornAt: this.time,
    };
    this.bodies.push(b);
    return b;
  }

  removeCustom(id: string) {
    this.bodies = this.bodies.filter((b) => b.id !== id);
  }

  clearCustom() {
    this.bodies = this.bodies.filter((b) => !b.isCustom);
  }

  /** آماده‌سازی دو سیاره برای مسابقه: هر دو از خط شروع (زاویه صفر) حرکت می‌کنند */
  lineUp(ids: string[]) {
    ids.forEach((id) => {
      this.restore(id);
      const b = this.get(id)!;
      b.angle = 0;
      b.x = b.orbitR;
      b.y = 0;
      b.travelled = 0;
      b.laps = 0;
    });
  }

  resetLaps(id: string) {
    const b = this.get(id);
    if (b) {
      b.travelled = 0;
      b.laps = 0;
    }
  }

  step(dt: number) {
    if (dt <= 0) return;
    this.time += dt;
    this.earthSpin += TWO_PI * dt; // یک دور کامل در هر روز

    for (const b of this.bodies) {
      if (b.status !== "ok") continue;
      if (b.kind === "kepler") {
        const w = TWO_PI / b.period;
        b.angle += w * dt;
        b.travelled += w * dt;
        if (b.angle > TWO_PI * 1000) b.angle -= TWO_PI * 1000;
        b.x = Math.cos(b.angle) * b.orbitR;
        b.y = Math.sin(b.angle) * b.orbitR;
      } else {
        this.integrate(b, dt);
      }
      b.laps = Math.floor(b.travelled / TWO_PI);
    }
  }

  private integrate(b: Body, dt: number) {
    // زیرگام‌ها برای پایداری — بر اساس نزدیک‌ترین فاصله
    const rNow = Math.hypot(b.x, b.y);
    const localPeriod = TWO_PI * Math.sqrt(Math.pow(Math.max(rNow, 8), 3) / b.GM);
    const subDt = Math.min(dt, localPeriod / 600);
    const n = Math.max(1, Math.ceil(dt / subDt));
    const h = dt / n;

    let prevAngle = Math.atan2(b.y, b.x);
    let ax: number, ay: number;
    {
      const r = Math.hypot(b.x, b.y);
      const r3 = r * r * r;
      ax = (-b.GM * b.x) / r3;
      ay = (-b.GM * b.y) / r3;
    }
    for (let i = 0; i < n; i++) {
      // Leapfrog (kick-drift-kick)
      b.vx += ax * h * 0.5;
      b.vy += ay * h * 0.5;
      b.x += b.vx * h;
      b.y += b.vy * h;
      const r = Math.hypot(b.x, b.y);
      const r3 = r * r * r;
      ax = (-b.GM * b.x) / r3;
      ay = (-b.GM * b.y) / r3;
      b.vx += ax * h * 0.5;
      b.vy += ay * h * 0.5;

      const ang = Math.atan2(b.y, b.x);
      let d = ang - prevAngle;
      if (d > Math.PI) d -= TWO_PI;
      if (d < -Math.PI) d += TWO_PI;
      b.travelled += Math.abs(d);
      prevAngle = ang;

      if (r < b.minR) b.minR = r;
      if (r > b.maxR) b.maxR = r;

      if (r < SUN_RADIUS + b.radius * 0.5) {
        b.status = "crashed";
        break;
      }
      if (r > ESCAPE_R) {
        // فقط اگر انرژی کافی برای فرار داشته باشد (v² ≥ 2GM/r) فرار محسوب می‌شود؛ وگرنه برمی‌گردد
        const v2 = b.vx * b.vx + b.vy * b.vy;
        if (v2 >= (2 * b.GM) / r) {
          b.status = "escaped";
          break;
        }
      }
    }
    // ثبت دنباله
    const last = b.trail[b.trail.length - 1];
    if (!last || Math.hypot(last.x - b.x, last.y - b.y) > 2) {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 260) b.trail.shift();
    }
  }
}

export function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return hex;
  const n = parseInt(c, 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
