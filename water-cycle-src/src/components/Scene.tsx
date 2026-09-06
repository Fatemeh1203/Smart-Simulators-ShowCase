import { useEffect, useRef } from "react";
import {
  computeRates,
  stepState,
  clamp,
  INITIAL_STATE,
  type Params,
  type Rates,
  type SimState,
  type StageId,
} from "../model/waterCycle";

/* ───────────── ثابت‌های هندسی صحنه (مختصات منطقی 1000×600) ───────────── */
const W = 1000;
const H = 600;
const LAKE_RIGHT = 380;
const BEDROCK_Y = 562;
const CONDENSE_Y = 255;

const MTN: [number, number][] = [
  [620, 403],
  [700, 310],
  [770, 215],
  [880, 125],
  [960, 215],
  [1000, 255],
];

function groundY(x: number): number {
  if (x < LAKE_RIGHT) return 420;
  return 420 - ((x - LAKE_RIGHT) / (W - LAKE_RIGHT)) * 45;
}
function mtnY(x: number): number {
  if (x <= MTN[0][0] || x > W) return Infinity;
  for (let i = 0; i < MTN.length - 1; i++) {
    const [x1, y1] = MTN[i];
    const [x2, y2] = MTN[i + 1];
    if (x >= x1 && x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  return Infinity;
}
function surfaceY(x: number): number {
  return Math.min(groundY(x), mtnY(x));
}
function lakeLevel(surfaceWater: number) {
  return 462 - surfaceWater * 0.42;
}
function waterTableY(gw: number) {
  return BEDROCK_Y - 10 - gw * 0.85;
}

const TREE_SLOTS: { x: number; h: number; s: number }[] = [
  { x: 418, h: 38, s: 1 },
  { x: 610, h: 42, s: 1.05 },
  { x: 500, h: 46, s: 1.1 },
  { x: 560, h: 36, s: 0.95 },
  { x: 445, h: 40, s: 1 },
  { x: 585, h: 44, s: 1.05 },
  { x: 470, h: 34, s: 0.9 },
  { x: 530, h: 40, s: 1 },
  { x: 640, h: 30, s: 0.85 },
  { x: 400, h: 32, s: 0.9 },
  { x: 515, h: 30, s: 0.85 },
  { x: 600, h: 30, s: 0.8 },
  { x: 485, h: 28, s: 0.8 },
  { x: 545, h: 28, s: 0.8 },
];

type PType = "vapor" | "transp" | "rain" | "snow" | "runoff" | "infil" | "gflow";
interface Particle {
  t: PType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  seed: number;
  drop?: boolean; // بخار تبدیل به قطره شده (تراکم)
  target?: number;
}
interface Cloud {
  x: number;
  y: number;
  s: number;
  seed: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const STAGE_REGION: Record<StageId, [number, number, number, number]> = {
  evaporation: [190, 385, 175, 70],
  transpiration: [520, 335, 140, 60],
  condensation: [420, 245, 260, 42],
  cloud: [520, 130, 420, 75],
  precipitation: [600, 290, 300, 100],
  runoff: [520, 408, 150, 28],
  infiltration: [720, 475, 130, 60],
  collection: [190, 460, 175, 48],
};

const PARTICLE_STAGE: Record<PType, StageId[]> = {
  vapor: ["evaporation", "condensation"],
  transp: ["transpiration", "condensation"],
  rain: ["precipitation", "runoff", "infiltration"],
  snow: ["precipitation"],
  runoff: ["runoff", "collection"],
  infil: ["infiltration", "collection"],
  gflow: ["collection", "infiltration"],
};

export interface SceneProps {
  params: Params;
  running: boolean;
  speed: number;
  highlight: StageId | null;
  teaching: boolean;
  resetToken: number;
  onStats: (r: Rates, s: SimState) => void;
}

export default function Scene({
  params,
  running,
  speed,
  highlight,
  teaching,
  resetToken,
  onStats,
}: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ params, running, speed, highlight, teaching, onStats });
  propsRef.current = { params, running, speed, highlight, teaching, onStats };

  const simRef = useRef<SimState>({ ...INITIAL_STATE });
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const snowDepthRef = useRef(0);
  const lastReset = useRef(resetToken);

  useEffect(() => {
    if (lastReset.current !== resetToken) {
      lastReset.current = resetToken;
      simRef.current = { ...INITIAL_STATE };
      particlesRef.current = [];
      snowDepthRef.current = 0;
      cloudsRef.current.forEach((c, i) => {
        c.x = 120 + i * 200;
      });
    }
  }, [resetToken]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;

    cloudsRef.current = [
      { x: 120, y: 118, s: 1.05, seed: 0.2 },
      { x: 320, y: 150, s: 0.85, seed: 1.1 },
      { x: 520, y: 100, s: 1.15, seed: 2.3 },
      { x: 720, y: 145, s: 0.9, seed: 3.7 },
      { x: 920, y: 120, s: 1, seed: 4.9 },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = wrap.clientWidth;
      const ch = (cw * H) / W;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.height = `${ch}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let statTimer = 0;
    let anim = 0; // زمان انیمیشن (همیشه جلو می‌رود حتی هنگام توقف)
    const acc: Record<string, number> = {};

    const spawn = (n: number, key: string, dt: number, fn: () => void) => {
      acc[key] = (acc[key] ?? 0) + n * dt;
      while (acc[key] >= 1) {
        acc[key] -= 1;
        if (particlesRef.current.length < 1100) fn();
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const realDt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { params: p, running: run, speed: spd, highlight: hl, teaching, onStats: cb } =
        propsRef.current;

      const simDt = run ? realDt * spd : 0;
      const animDt = run ? realDt * Math.min(spd, 2.5) : 0; // هنگام توقف، صحنه کاملاً ثابت می‌ماند
      anim += animDt;
      const uiT = now / 1000; // ساعت رابط کاربری (برای حلقه‌ی راهنما، همیشه فعال)

      if (run) simRef.current = stepState(p, simRef.current, simDt);
      const s = simRef.current;
      const rates = computeRates(p, s);

      /* ── نرخ‌های نمایشی (در حالت آموزشی مرحله انتخاب‌شده تقویت می‌شود) ── */
      const vis = { ...rates };
      let visInf = rates.infiltrationFraction;
      let visCloud = s.cloud;
      if (teaching && hl) {
        const boost = 60;
        if (hl === "evaporation") vis.evaporation = Math.max(vis.evaporation, boost);
        if (hl === "transpiration") vis.transpiration = Math.max(vis.transpiration, boost);
        if (hl === "condensation") {
          vis.evaporation = Math.max(vis.evaporation, 40);
          vis.transpiration = Math.max(vis.transpiration, 30);
          vis.condensation = Math.max(vis.condensation, boost);
        }
        if (hl === "cloud") {
          vis.condensation = Math.max(vis.condensation, boost);
          visCloud = Math.max(visCloud, 45 + 35 * (0.5 + 0.5 * Math.sin(anim * 0.8)));
        }
        if (hl === "precipitation") {
          vis.precipitation = Math.max(vis.precipitation, boost);
          visCloud = Math.max(visCloud, 70);
        }
        if (hl === "runoff") {
          vis.precipitation = Math.max(vis.precipitation, 45);
          visCloud = Math.max(visCloud, 60);
          visInf = 0.15;
        }
        if (hl === "infiltration") {
          vis.precipitation = Math.max(vis.precipitation, 45);
          visCloud = Math.max(visCloud, 60);
          visInf = 0.85;
        }
        if (hl === "collection") {
          vis.runoff = Math.max(vis.runoff, 40);
          vis.precipitation = Math.max(vis.precipitation, 25);
          visCloud = Math.max(visCloud, 50);
        }
        if (vis.precipitation > 0.5 && rates.precipType === "none")
          vis.precipType = p.temp <= 1 ? "snow" : "rain";
      }
      const snowing = vis.precipType === "snow";
      const windV = (p.wind / 100) * 60;
      const lakeY = lakeLevel(s.surfaceWater);
      const wtY = waterTableY(s.groundwater);
      const dimFor = (ids: StageId[]) => (!teaching || !hl ? 1 : ids.includes(hl) ? 1 : 0.18);

      /* ── حرکت ابرها ── */
      for (const c of cloudsRef.current) {
        c.x += (4 + windV * 0.9) * animDt;
        if (c.x > W + 120) c.x -= W + 240;
      }

      /* ── برف روی زمین ── */
      if (snowing && vis.precipitation > 1)
        snowDepthRef.current = clamp(snowDepthRef.current + vis.precipitation * 0.004 * animDt, 0, 10);
      else if (p.temp > 1) snowDepthRef.current = clamp(snowDepthRef.current - 1.2 * animDt, 0, 10);

      /* ── تولید ذرات ── */
      const P = particlesRef.current;
      const visibleTrees = Math.round((p.vegetation / 100) * TREE_SLOTS.length);

      if (!rates.frozenLake || (teaching && hl === "evaporation"))
        spawn(vis.evaporation * 0.55, "vapor", animDt, () => {
          P.push({
            t: "vapor",
            x: rnd(15, LAKE_RIGHT - 20),
            y: lakeY - 2,
            vx: windV * 0.35 + rnd(-6, 6),
            vy: -rnd(22, 40),
            life: 0,
            max: rnd(5, 7.5),
            r: rnd(2.5, 5),
            seed: Math.random() * 10,
          });
        });

      if (visibleTrees > 0)
        spawn(vis.transpiration * 0.3, "transp", animDt, () => {
          const t = TREE_SLOTS[Math.floor(Math.random() * visibleTrees)];
          P.push({
            t: "transp",
            x: t.x + rnd(-14, 14) * t.s,
            y: groundY(t.x) - t.h - 18 * t.s,
            vx: windV * 0.35 + rnd(-5, 5),
            vy: -rnd(20, 34),
            life: 0,
            max: rnd(4.5, 6.5),
            r: rnd(2, 4),
            seed: Math.random() * 10,
          });
        });

      // قطرات تراکم اضافی (حالت آموزشی تراکم)
      if (teaching && hl === "condensation")
        spawn(25, "cond", animDt, () => {
          P.push({
            t: "vapor",
            x: rnd(120, 900),
            y: CONDENSE_Y + rnd(0, 30),
            vx: windV * 0.3,
            vy: -rnd(15, 25),
            life: 3.5,
            max: 6,
            r: 2.2,
            seed: Math.random() * 10,
            drop: true,
          });
        });

      const activeClouds = cloudsRef.current.filter((c) => c.x > -60 && c.x < W + 60);
      if (vis.precipitation > 0.5 && activeClouds.length)
        spawn(vis.precipitation * (snowing ? 0.9 : 1.6), "precip", animDt, () => {
          const c = activeClouds[Math.floor(Math.random() * activeClouds.length)];
          const spread = 70 * c.s * (0.6 + visCloud / 130);
          P.push({
            t: snowing ? "snow" : "rain",
            x: c.x + rnd(-spread, spread),
            y: c.y + 28 * c.s,
            vx: snowing ? windV * 0.6 : windV * 0.9,
            vy: snowing ? rnd(35, 55) : rnd(230, 330),
            life: 0,
            max: 10,
            r: snowing ? rnd(1.8, 3) : 1.5,
            seed: Math.random() * 10,
          });
        });

      // جریان آب زیرزمینی به سمت دریاچه
      spawn(2 + s.groundwater * 0.06, "gflow", animDt, () => {
        P.push({
          t: "gflow",
          x: rnd(400, 960),
          y: rnd(wtY + 6, BEDROCK_Y - 6),
          vx: -rnd(9, 18),
          vy: 0,
          life: 0,
          max: 30,
          r: 1.6,
          seed: Math.random() * 10,
        });
      });

      /* ── به‌روزرسانی ذرات ── */
      const next: Particle[] = [];
      for (const q of P) {
        q.life += animDt;
        if (q.life > q.max) continue;
        switch (q.t) {
          case "vapor":
          case "transp": {
            q.x += (q.vx + Math.sin(anim * 2 + q.seed) * 8) * animDt;
            q.y += q.vy * animDt;
            if (!q.drop && q.y < CONDENSE_Y + rnd(-15, 15)) q.drop = true;
            if (q.drop) {
              q.vy = Math.max(q.vy * 0.98, -12);
              if (q.y < 175) continue;
            }
            if (q.x > W + 10) q.x = -10;
            if (q.x < -10) q.x = W + 10;
            break;
          }
          case "rain":
          case "snow": {
            if (q.t === "snow") q.x += (q.vx + Math.sin(anim * 1.5 + q.seed) * 14) * animDt;
            else q.x += q.vx * animDt;
            q.y += q.vy * animDt;
            if (q.x < -5 || q.x > W + 5) continue;
            const surf = q.x < LAKE_RIGHT ? lakeY : surfaceY(q.x);
            if (q.y >= surf) {
              if (q.x >= LAKE_RIGHT && q.t === "rain") {
                const onSoil = mtnY(q.x) > groundY(q.x) - 1;
                const goInf = onSoil && Math.random() < visInf;
                if (goInf)
                  next.push({
                    t: "infil",
                    x: q.x,
                    y: surf + 2,
                    vx: rnd(-3, 3),
                    vy: rnd(11, 20),
                    life: 0,
                    max: 20,
                    r: 1.7,
                    seed: 0,
                    target: wtY,
                  });
                else
                  next.push({
                    t: "runoff",
                    x: q.x,
                    y: surf - 2,
                    vx: 0,
                    vy: 0,
                    life: 0,
                    max: 20,
                    r: rnd(1.6, 2.4),
                    seed: Math.random() * 10,
                  });
              }
              continue;
            }
            break;
          }
          case "runoff": {
            const dl = surfaceY(q.x - 4);
            const dr = surfaceY(q.x + 4);
            const dir = dr > dl ? 1 : -1;
            const slope = Math.abs(dr - dl) / 8;
            const sp = clamp(45 + 320 * slope, 45, 170);
            q.x += dir * sp * animDt;
            q.y = surfaceY(q.x) - 2 - Math.abs(Math.sin(anim * 6 + q.seed)) * 1.5;
            if (q.x < LAKE_RIGHT + 4 || q.x > W) continue;
            break;
          }
          case "infil": {
            q.x += q.vx * animDt + Math.sin(anim * 3 + q.life) * 0.4;
            q.y += q.vy * animDt;
            if (q.y >= (q.target ?? wtY)) continue;
            break;
          }
          case "gflow": {
            q.x += q.vx * animDt;
            if (q.y < wtY + 2) q.y += 10 * animDt;
            if (q.x < LAKE_RIGHT - 30) continue;
            break;
          }
        }
        next.push(q);
      }
      particlesRef.current = next;

      /* ═══════════════════════ رسم ═══════════════════════ */
      const dpr = canvas.width / W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // آسمان
      const dim = clamp((1 - p.sun / 100) * 0.45 + (visCloud / 100) * 0.45, 0, 0.85);
      const cold = clamp((10 - p.temp) / 40, 0, 0.5);
      const lerp3 = (a: number[], b: number[], t: number) => [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ];
      const rgb = (c: number[]) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
      const mix = (a: number[], b: number[], t: number) => rgb(lerp3(a, b, t));
      const skyTop = rgb(lerp3(lerp3([48, 138, 226], [150, 190, 230], cold), [95, 108, 128], dim));
      const skyBot = rgb(lerp3(lerp3([186, 226, 252], [222, 236, 248], cold), [170, 178, 190], dim));
      const sky = ctx.createLinearGradient(0, 0, 0, 420);
      sky.addColorStop(0, skyTop);
      sky.addColorStop(1, skyBot);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, 440);

      // خورشید
      {
        const a = dimFor(["evaporation", "transpiration"]);
        const sr = 28 + p.sun * 0.16;
        const sx = 110,
          sy = 95;
        ctx.save();
        ctx.globalAlpha = a;
        const glow = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 3.2);
        glow.addColorStop(0, `rgba(255,210,80,${0.15 + (p.sun / 100) * 0.55})`);
        glow.addColorStop(1, "rgba(255,210,80,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(sx - sr * 3.5, sy - sr * 3.5, sr * 7, sr * 7);
        // پرتوها
        ctx.strokeStyle = `rgba(255,190,50,${0.25 + (p.sun / 100) * 0.55})`;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        const n = 12;
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + anim * 0.25;
          const l1 = sr + 8,
            l2 = sr + 14 + (p.sun / 100) * 22 + Math.sin(anim * 3 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(sx + Math.cos(ang) * l1, sy + Math.sin(ang) * l1);
          ctx.lineTo(sx + Math.cos(ang) * l2, sy + Math.sin(ang) * l2);
          ctx.stroke();
        }
        const sg = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, 2, sx, sy, sr);
        sg.addColorStop(0, "#fff7c2");
        sg.addColorStop(1, p.sun > 50 ? "#ffb52e" : "#ffcf6a");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // کوه
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["precipitation", "runoff"]);
        ctx.beginPath();
        ctx.moveTo(MTN[0][0], MTN[0][1] + 4);
        MTN.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(W, 420);
        ctx.lineTo(MTN[0][0], 420);
        ctx.closePath();
        const mg = ctx.createLinearGradient(700, 130, 900, 400);
        mg.addColorStop(0, "#8d7b6c");
        mg.addColorStop(1, "#5d5048");
        ctx.fillStyle = mg;
        ctx.fill();
        // سایه‌ی سمت راست
        ctx.beginPath();
        ctx.moveTo(880, 125);
        ctx.lineTo(960, 215);
        ctx.lineTo(1000, 255);
        ctx.lineTo(1000, 380);
        ctx.lineTo(880, 380);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.13)";
        ctx.fill();
        // برف قله
        if (rates.mountainSnow || (snowing && vis.precipitation > 1)) {
          const frac = clamp((11 - p.temp) / 28, 0.08, 0.85);
          const snowY = 125 + frac * 230;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(MTN[0][0], MTN[0][1] + 4);
          MTN.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(W, 420);
          ctx.lineTo(MTN[0][0], 420);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.beginPath();
          ctx.moveTo(600, 100);
          ctx.lineTo(1000, 100);
          ctx.lineTo(1000, snowY + 10);
          for (let x = 1000; x >= 600; x -= 25)
            ctx.lineTo(x, snowY + Math.sin(x * 0.15) * 9 + (x % 50 === 0 ? 6 : -4));
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // ابرها
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["condensation", "cloud", "precipitation"]);
        const d = visCloud / 100;
        const scale = 0.5 + d * 0.8;
        const alpha = clamp(0.18 + d * 0.85, 0, 1);
        const shade = Math.round(255 - d * 125);
        const puffs = [
          [0, 0, 40],
          [38, -12, 32],
          [-40, -6, 30],
          [14, -30, 28],
          [-16, -26, 25],
          [64, 8, 24],
          [-68, 8, 22],
        ];
        for (const c of cloudsRef.current) {
          const sc = scale * c.s;
          const pulse = teaching && hl === "cloud" ? 1 + 0.04 * Math.sin(anim * 3 + c.seed) : 1;
          const drawPuffs = (dx: number, dy: number, col: string, a: number) => {
            ctx.fillStyle = col;
            ctx.globalAlpha = a * dimFor(["condensation", "cloud", "precipitation"]);
            ctx.beginPath();
            for (const [px, py, pr] of puffs) {
              ctx.moveTo(c.x + px * sc + dx + pr * sc * pulse, c.y + py * sc + dy);
              ctx.arc(c.x + px * sc + dx, c.y + py * sc + dy, pr * sc * pulse, 0, Math.PI * 2);
            }
            ctx.fill();
          };
          drawPuffs(0, 9, `rgb(${shade - 45},${shade - 40},${shade - 28})`, alpha);
          drawPuffs(0, 0, `rgb(${shade},${shade},${Math.min(255, shade + 6)})`, alpha);
        }
        ctx.restore();
      }

      // مقطع خاک
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["infiltration", "collection", "runoff"]);
        ctx.beginPath();
        ctx.moveTo(0, 420);
        ctx.lineTo(LAKE_RIGHT, 420);
        for (let x = LAKE_RIGHT; x <= W; x += 20) ctx.lineTo(x, groundY(x));
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        const sg = ctx.createLinearGradient(0, 400, 0, H);
        sg.addColorStop(0, "#8a5a3c");
        sg.addColorStop(0.45, "#6e4630");
        sg.addColorStop(1, "#4a3224");
        ctx.fillStyle = sg;
        ctx.fill();
        // سنگ بستر
        ctx.fillStyle = "#3b3b45";
        ctx.fillRect(0, BEDROCK_Y, W, H - BEDROCK_Y);
        // سفره آب زیرزمینی
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 420);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, groundY(x) + 6);
        ctx.lineTo(W, BEDROCK_Y);
        ctx.lineTo(0, BEDROCK_Y);
        ctx.closePath();
        ctx.clip();
        const gwg = ctx.createLinearGradient(0, wtY, 0, BEDROCK_Y);
        gwg.addColorStop(0, "rgba(70,150,235,0.55)");
        gwg.addColorStop(1, "rgba(40,110,200,0.75)");
        ctx.fillStyle = gwg;
        ctx.beginPath();
        ctx.moveTo(0, wtY + 4);
        for (let x = 0; x <= W; x += 25) ctx.lineTo(x, wtY + Math.sin(x * 0.03 + anim * 0.5) * 3);
        ctx.lineTo(W, BEDROCK_Y);
        ctx.lineTo(0, BEDROCK_Y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // ریشه‌ها/بافت خاک
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
          const x = 390 + ((i * 97) % 600);
          const y = groundY(x) + 12 + ((i * 53) % 90);
          ctx.beginPath();
          ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // دریاچه
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["evaporation", "collection", "runoff"]);
        const basin = () => {
          ctx.beginPath();
          ctx.moveTo(0, 418);
          ctx.lineTo(0, 490);
          ctx.quadraticCurveTo(190, 520, LAKE_RIGHT - 10, 440);
          ctx.lineTo(LAKE_RIGHT + 6, 419);
          ctx.closePath();
        };
        basin();
        ctx.fillStyle = "#c8a878"; // ساحل شنی
        ctx.fill();
        ctx.save();
        basin();
        ctx.clip();
        const wg = ctx.createLinearGradient(0, lakeY, 0, 520);
        wg.addColorStop(0, rates.frozenLake ? "#bfe3f5" : "#4fb0f0");
        wg.addColorStop(1, "#1d5fb0");
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(-5, lakeY);
        for (let x = 0; x <= LAKE_RIGHT + 10; x += 12)
          ctx.lineTo(x, lakeY + (rates.frozenLake ? 0 : Math.sin(x * 0.05 + anim * 2) * 1.6));
        ctx.lineTo(LAKE_RIGHT + 10, 530);
        ctx.lineTo(-5, 530);
        ctx.closePath();
        ctx.fill();
        // موج‌های سطحی
        if (!rates.frozenLake) {
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = 1.5;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            for (let x = 20 + k * 30; x <= 330 - k * 20; x += 6)
              ctx.lineTo(x, lakeY + 8 + k * 11 + Math.sin(x * 0.08 + anim * 2.5 + k) * 1.8);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.fillRect(0, lakeY - 2, LAKE_RIGHT + 10, 6);
        }
        ctx.restore();
        ctx.restore();
      }

      // برف/چمن روی زمین
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["runoff", "transpiration", "infiltration"]);
        const v = p.vegetation / 100;
        const grass = mix([200, 168, 106], [62, 150, 60], v);
        ctx.strokeStyle = grass;
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(LAKE_RIGHT, 420);
        for (let x = LAKE_RIGHT; x <= MTN[0][0] + 10; x += 15) ctx.lineTo(x, groundY(x));
        ctx.stroke();
        // رودخانه
        const flow = 3 + rates.runoff * 0.12 + s.groundwater * 0.03;
        ctx.strokeStyle = "rgba(60,160,240,0.9)";
        ctx.lineWidth = flow;
        ctx.beginPath();
        ctx.moveTo(790, mtnY(790) + 4);
        for (let x = 790; x >= MTN[0][0]; x -= 10) ctx.lineTo(x, surfaceY(x) + 4);
        for (let x = MTN[0][0]; x >= LAKE_RIGHT - 4; x -= 10) ctx.lineTo(x, groundY(x) + 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = Math.max(1, flow * 0.35);
        ctx.setLineDash([10, 14]);
        ctx.lineDashOffset = anim * (40 + rates.runoff) ;
        ctx.stroke();
        ctx.setLineDash([]);
        // برف روی زمین
        if (snowDepthRef.current > 0.3) {
          ctx.strokeStyle = "rgba(255,255,255,0.92)";
          ctx.lineWidth = snowDepthRef.current;
          ctx.beginPath();
          ctx.moveTo(LAKE_RIGHT, 418);
          for (let x = LAKE_RIGHT; x <= W; x += 15) ctx.lineTo(x, surfaceY(x) - 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // درختان
      {
        ctx.save();
        ctx.globalAlpha = dimFor(["transpiration", "infiltration", "runoff"]);
        for (let i = 0; i < visibleTrees; i++) {
          const t = TREE_SLOTS[i];
          const gy = groundY(t.x);
          const sway = Math.sin(anim * 1.5 + i) * (p.wind / 100) * 4;
          ctx.fillStyle = "#6b4a2b";
          ctx.fillRect(t.x - 3 * t.s, gy - t.h, 6 * t.s, t.h);
          const cy = gy - t.h;
          const cs = t.s;
          ctx.fillStyle = "#2f7d32";
          ctx.beginPath();
          ctx.arc(t.x - 12 * cs + sway, cy + 4, 13 * cs, 0, Math.PI * 2);
          ctx.arc(t.x + 12 * cs + sway, cy + 4, 13 * cs, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#43a047";
          ctx.beginPath();
          ctx.arc(t.x + sway, cy - 8 * cs, 15 * cs, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.arc(t.x - 5 * cs + sway, cy - 13 * cs, 6 * cs, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ذرات
      {
        for (const q of particlesRef.current) {
          const a = dimFor(PARTICLE_STAGE[q.t]);
          const lf = q.life / q.max;
          switch (q.t) {
            case "vapor":
            case "transp": {
              if (q.drop) {
                ctx.globalAlpha = a * 0.9 * (1 - Math.max(0, (175 - q.y) / 60));
                ctx.fillStyle = "#8fd0ff";
                ctx.beginPath();
                ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
              } else {
                const fade = lf < 0.15 ? lf / 0.15 : 1 - Math.max(0, (lf - 0.6) / 0.4);
                ctx.globalAlpha = a * 0.6 * fade;
                ctx.fillStyle = q.t === "transp" ? "rgba(225,255,230,1)" : "rgba(255,255,255,1)";
                ctx.beginPath();
                ctx.arc(q.x, q.y, q.r * (1 + lf * 0.8), 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            case "rain": {
              ctx.globalAlpha = a * 0.85;
              ctx.strokeStyle = "#5aa9f5";
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(q.x, q.y);
              ctx.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035);
              ctx.stroke();
              break;
            }
            case "snow": {
              ctx.globalAlpha = a * 0.95;
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case "runoff": {
              ctx.globalAlpha = a * 0.95;
              ctx.fillStyle = "#3b9cf5";
              ctx.beginPath();
              ctx.ellipse(q.x, q.y, q.r * 1.8, q.r, 0, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case "infil": {
              ctx.globalAlpha = a * 0.85;
              ctx.fillStyle = "#7cc4ff";
              ctx.beginPath();
              ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case "gflow": {
              ctx.globalAlpha = a * 0.55;
              ctx.fillStyle = "#cfe9ff";
              ctx.beginPath();
              ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // نشانگر باد
      {
        ctx.save();
        ctx.globalAlpha = 0.9;
        const wx = 940,
          wy = 40;
        const len = 16 + (p.wind / 100) * 50;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        for (let k = 0; k < 3; k++) {
          const off = ((anim * (20 + p.wind)) % 30) - 30;
          ctx.beginPath();
          ctx.moveTo(wx - len - 20 + off, wy + k * 9);
          ctx.lineTo(wx - 20 + off * 0.5, wy + k * 9);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(wx - 8, wy + 9);
        ctx.lineTo(wx - 18, wy + 1);
        ctx.moveTo(wx - 8, wy + 9);
        ctx.lineTo(wx - 18, wy + 17);
        ctx.stroke();
        ctx.restore();
      }

      /* ── برچسب‌ها ── */
      const label = (
        text: string,
        x: number,
        y: number,
        activity: number,
        stage: StageId,
        color: string
      ) => {
        let a = 0.35 + 0.65 * clamp(activity, 0, 1);
        if (teaching && hl) a = hl === stage ? 1 : 0.12;
        else if (hl === stage) a = 1;
        const big = hl === stage;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = `${big ? 700 : 600} ${big ? 16 : 13}px Vazirmatn, sans-serif`;
        ctx.direction = "rtl";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const wdt = ctx.measureText(text).width + 22;
        const hgt = big ? 30 : 24;
        ctx.fillStyle = big ? color : "rgba(255,255,255,0.88)";
        ctx.strokeStyle = color;
        ctx.lineWidth = big ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(x - wdt / 2, y - hgt / 2, wdt, hgt, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = big ? "#ffffff" : "#123";
        ctx.fillText(text, x, y + 1);
        ctx.restore();
      };
      label("تبخیر (Evaporation)", 190, 345, vis.evaporation / 50, "evaporation", "#d97706");
      label("تعرق (Transpiration)", 520, 300, vis.transpiration / 40, "transpiration", "#16a34a");
      label("تراکم (Condensation)", 420, 225, vis.condensation / 40, "condensation", "#0284c7");
      label("تشکیل ابر (Cloud)", 520, 60, visCloud / 60, "cloud", "#475569");
      label(
        snowing ? "بارش برف (Snow)" : "بارش (Precipitation)",
        700,
        330,
        vis.precipitation / 30,
        "precipitation",
        "#2563eb"
      );
      label("روان‌آب (Runoff)", 500, 445, vis.runoff / 20, "runoff", "#0891b2");
      label("نفوذ (Infiltration)", 720, 470, vis.infiltration / 20, "infiltration", "#ea580c");
      label("آب زیرزمینی (Groundwater)", 850, 545, 0.4, "collection", "#4338ca");
      label("جمع‌آوری آب (Collection)", 190, 490, 0.5, "collection", "#4338ca");

      // حلقه‌ی Highlight
      if (hl) {
        const [cx, cy, rx, ry] = STAGE_REGION[hl];
        ctx.save();
        ctx.strokeStyle = "rgba(255,230,80,0.95)";
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = -uiT * 30;
        const pl = 1 + 0.04 * Math.sin(uiT * 4);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * pl, ry * pl, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowColor = "rgba(255,230,80,0.8)";
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      }

      // آمار
      statTimer += realDt;
      if (statTimer > 0.15) {
        statTimer = 0;
        cb(rates, s);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-sky-200">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
