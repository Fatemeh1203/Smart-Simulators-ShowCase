import { useEffect, useMemo, useRef } from 'react';
import type { Params } from '../lib/model';

// ---------- هندسه صحنه (viewBox 800x600) ----------
export const W = 800;
export const H = 600;
const SUN = { x: 105, y: 95 };
const SOIL_Y = 440;
const STEM_BASE = { x: 400, y: SOIL_Y };
const ROOT_TIPS = [
  { x: 335, y: 520 },
  { x: 465, y: 532 },
  { x: 400, y: 578 },
  { x: 365, y: 562 },
  { x: 438, y: 560 },
];

interface LeafDef {
  attach: { x: number; y: number };
  angle: number; // degrees, direction leaf points to
  len: number;
  side: 'left' | 'right' | 'top';
}
const LEAF_DEFS: LeafDef[] = [
  { attach: { x: 400, y: 412 }, angle: -160, len: 112, side: 'left' },
  { attach: { x: 400, y: 362 }, angle: -20, len: 118, side: 'right' },
  { attach: { x: 400, y: 312 }, angle: -152, len: 120, side: 'left' },
  { attach: { x: 400, y: 262 }, angle: -32, len: 112, side: 'right' },
  { attach: { x: 400, y: 218 }, angle: -148, len: 104, side: 'left' },
  { attach: { x: 400, y: 176 }, angle: -90, len: 92, side: 'top' },
];

export interface LeafGeom extends LeafDef {
  finalAngle: number;
  center: { x: number; y: number };
}

export function getLeaves(water: number): LeafGeom[] {
  const droop = (1 - Math.min(1, water / 30)) * 22; // پژمردگی در کم‌آبی
  return LEAF_DEFS.map((d) => {
    let a = d.angle;
    if (d.side === 'left') a -= droop;
    else if (d.side === 'right') a += droop;
    else a += droop * 0.6;
    const rad = (a * Math.PI) / 180;
    return {
      ...d,
      finalAngle: a,
      center: { x: d.attach.x + Math.cos(rad) * d.len * 0.55, y: d.attach.y + Math.sin(rad) * d.len * 0.55 },
    };
  });
}

// ---------- ذرات ----------
type PType = 'co2' | 'h2o' | 'light' | 'o2' | 'glucose' | 'flash';
interface Particle {
  type: PType;
  x: number;
  y: number;
  age: number;
  life: number;
  speed: number;
  pts?: { x: number; y: number }[];
  seg?: number;
  pos?: number;
  vx?: number;
  vy?: number;
  phase?: number;
  dir?: { x: number; y: number };
  done?: boolean;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function stepAlongPath(p: Particle, d: number) {
  const pts = p.pts!;
  let seg = p.seg ?? 0;
  let pos = p.pos ?? 0;
  while (d > 0 && seg < pts.length - 1) {
    const L = dist(pts[seg], pts[seg + 1]);
    if (pos + d >= L) {
      d -= L - pos;
      seg++;
      pos = 0;
    } else {
      pos += d;
      d = 0;
    }
  }
  p.seg = seg;
  p.pos = pos;
  if (seg >= pts.length - 1) {
    p.x = pts[pts.length - 1].x;
    p.y = pts[pts.length - 1].y;
    p.done = true;
  } else {
    const a = pts[seg];
    const b = pts[seg + 1];
    const L = dist(a, b) || 1;
    const k = pos / L;
    p.x = a.x + (b.x - a.x) * k;
    p.y = a.y + (b.y - a.y) * k;
  }
}

interface SceneProps {
  params: Params;
  rate: number; // 0..100
  running: boolean;
  speed: number;
  compact?: boolean;
  onLeafClick?: (index: number) => void;
  title?: string;
}

export default function PlantScene({ params, rate, running, speed, compact, onLeafClick, title }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const live = useRef({ params, rate, running, speed, compact: !!compact });
  live.current = { params, rate, running, speed, compact: !!compact };

  const leaves = useMemo(() => getLeaves(params.water), [params.water]);

  // ---------- حلقه‌ی ذرات روی Canvas ----------
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const particles: Particle[] = [];
    const acc = { co2: 0, h2o: 0, light: 0, o2: 0, glucose: 0 };
    let raf = 0;
    let last = performance.now();
    let simT = 0;

    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);

    const spawnCO2 = (lv: LeafGeom[]) => {
      const leaf = pick(lv);
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side < 0 ? rnd(20, 250) : rnd(560, 780);
      const y = rnd(40, 400);
      particles.push({
        type: 'co2',
        x,
        y,
        age: 0,
        life: 99,
        speed: rnd(55, 80),
        pts: [
          { x, y },
          { x: (x + leaf.center.x) / 2 + rnd(-40, 40), y: (y + leaf.center.y) / 2 + rnd(-30, 30) },
          leaf.center,
        ],
        seg: 0,
        pos: 0,
      });
    };
    const spawnH2O = (lv: LeafGeom[]) => {
      const tip = pick(ROOT_TIPS);
      const leaf = pick(lv);
      const start = { x: tip.x + rnd(-60, 60), y: Math.min(590, tip.y + rnd(-10, 25)) };
      particles.push({
        type: 'h2o',
        x: start.x,
        y: start.y,
        age: 0,
        life: 99,
        speed: rnd(60, 85),
        pts: [start, tip, STEM_BASE, { x: 400, y: leaf.attach.y }, leaf.center],
        seg: 0,
        pos: 0,
      });
    };
    const spawnLight = (lv: LeafGeom[]) => {
      const leaf = pick(lv);
      const tx = leaf.center.x + rnd(-18, 18);
      const ty = leaf.center.y + rnd(-10, 10);
      const d = { x: tx - SUN.x, y: ty - SUN.y };
      const L = Math.hypot(d.x, d.y);
      particles.push({
        type: 'light',
        x: SUN.x + rnd(-10, 10),
        y: SUN.y + rnd(-10, 10),
        age: 0,
        life: L / 520,
        speed: 520,
        dir: { x: d.x / L, y: d.y / L },
      });
    };
    const spawnO2 = (lv: LeafGeom[]) => {
      const leaf = pick(lv);
      particles.push({
        type: 'o2',
        x: leaf.center.x + rnd(-15, 15),
        y: leaf.center.y,
        age: 0,
        life: 4,
        speed: rnd(28, 45),
        phase: rnd(0, Math.PI * 2),
        vx: rnd(-8, 8),
      });
    };
    const spawnGlucose = (lv: LeafGeom[]) => {
      const leaf = pick(lv);
      const tip = pick(ROOT_TIPS);
      particles.push({
        type: 'glucose',
        x: leaf.center.x,
        y: leaf.center.y,
        age: 0,
        life: 99,
        speed: 45,
        pts: [leaf.center, leaf.attach, STEM_BASE, tip],
        seg: 0,
        pos: 0,
      });
    };
    const flash = (x: number, y: number, color: string) => {
      particles.push({ type: 'flash', x, y, age: 0, life: 0.6, speed: 0, dir: { x: 0, y: 0 }, phase: 0, vx: 0, vy: 0 });
      (particles[particles.length - 1] as Particle & { color?: string }).color = color;
    };

    const loop = (now: number) => {
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { params: p, rate: r, running: run, speed: sp, compact: cp } = live.current;
      const dt = run ? dtReal * sp : 0;
      simT += dt;
      const lv = getLeaves(p.water);
      const scale = cp ? 0.55 : 1;

      // تولید ذرات متناسب با پارامترها
      if (run) {
        acc.co2 += (0.3 + (p.co2 / 100) * 2.6) * dt * scale;
        acc.h2o += (0.2 + (p.water / 100) * 2.2) * dt * scale;
        acc.light += (0.2 + (p.light / 100) * 9) * dt * scale;
        acc.o2 += (r / 100) * 3 * dt * scale;
        acc.glucose += (r / 100) * 0.6 * dt * scale;
        while (acc.co2 >= 1 && p.co2 > 0) {
          acc.co2 -= 1;
          spawnCO2(lv);
        }
        if (p.co2 === 0) acc.co2 = 0;
        while (acc.h2o >= 1 && p.water > 0) {
          acc.h2o -= 1;
          spawnH2O(lv);
        }
        if (p.water === 0) acc.h2o = 0;
        while (acc.light >= 1 && p.light > 0) {
          acc.light -= 1;
          spawnLight(lv);
        }
        if (p.light === 0) acc.light = 0;
        while (acc.o2 >= 1) {
          acc.o2 -= 1;
          spawnO2(lv);
        }
        while (acc.glucose >= 1) {
          acc.glucose -= 1;
          spawnGlucose(lv);
        }
      }

      // به‌روزرسانی
      for (const q of particles) {
        q.age += dt;
        switch (q.type) {
          case 'co2':
          case 'h2o':
          case 'glucose':
            stepAlongPath(q, q.speed * dt);
            if (q.done && q.type !== 'glucose' && r > 5) flash(q.x, q.y, q.type === 'co2' ? '#94a3b8' : '#38bdf8');
            break;
          case 'light':
            q.x += q.dir!.x * q.speed * dt;
            q.y += q.dir!.y * q.speed * dt;
            if (q.age >= q.life) q.done = true;
            break;
          case 'o2':
            q.y -= q.speed * dt;
            q.x += (Math.sin(simT * 2 + q.phase!) * 18 + q.vx!) * dt;
            if (q.age >= q.life || q.y < -10) q.done = true;
            break;
          case 'flash':
            if (q.age >= q.life) q.done = true;
            break;
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].done) particles.splice(i, 1);
      if (particles.length > 500) particles.splice(0, particles.length - 500);

      // رسم
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      ctx.scale(cw / W, ch / H);

      // درخشش کلروپلاست‌ها در برگ‌ها متناسب با نرخ فتوسنتز
      lv.forEach((leaf, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(simT * 3 + i * 1.3);
        const a = (r / 100) * (0.18 + 0.32 * pulse);
        if (a > 0.01) {
          const g = ctx.createRadialGradient(leaf.center.x, leaf.center.y, 2, leaf.center.x, leaf.center.y, 34);
          g.addColorStop(0, `rgba(190,255,120,${a})`);
          g.addColorStop(1, 'rgba(190,255,120,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(leaf.center.x, leaf.center.y, 34, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const font = cp ? 'bold 11px Vazirmatn, sans-serif' : 'bold 10px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const q of particles) {
        switch (q.type) {
          case 'light': {
            const L = 26;
            const grad = ctx.createLinearGradient(q.x - q.dir!.x * L, q.y - q.dir!.y * L, q.x, q.y);
            grad.addColorStop(0, 'rgba(253,224,71,0)');
            grad.addColorStop(1, 'rgba(253,224,71,0.95)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(q.x - q.dir!.x * L, q.y - q.dir!.y * L);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            break;
          }
          case 'co2': {
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(q.x - 7, q.y, 3.5, 0, Math.PI * 2);
            ctx.arc(q.x + 7, q.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            if (!cp) {
              ctx.font = font;
              ctx.fillStyle = '#1e293b';
              ctx.fillText('CO₂', q.x, q.y - 12);
            }
            break;
          }
          case 'h2o': {
            ctx.fillStyle = '#0ea5e9';
            ctx.beginPath();
            ctx.arc(q.x, q.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.arc(q.x - 4, q.y - 3, 2.2, 0, Math.PI * 2);
            ctx.arc(q.x + 4, q.y - 3, 2.2, 0, Math.PI * 2);
            ctx.fill();
            if (!cp && q.y < SOIL_Y) {
              ctx.font = font;
              ctx.fillStyle = '#075985';
              ctx.fillText('H₂O', q.x, q.y - 11);
            }
            break;
          }
          case 'o2': {
            const a = Math.max(0, 1 - Math.max(0, q.age - q.life + 1.2) / 1.2);
            ctx.globalAlpha = a;
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.arc(q.x - 3.5, q.y, 4.2, 0, Math.PI * 2);
            ctx.arc(q.x + 3.5, q.y, 4.2, 0, Math.PI * 2);
            ctx.fill();
            if (!cp) {
              ctx.font = font;
              ctx.fillStyle = '#155e75';
              ctx.fillText('O₂', q.x, q.y - 11);
            }
            ctx.globalAlpha = 1;
            break;
          }
          case 'glucose': {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const ang = (Math.PI / 3) * k + simT;
              const px = q.x + Math.cos(ang) * 6.5;
              const py = q.y + Math.sin(ang) * 6.5;
              if (k === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fed7aa';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            if (!cp) {
              ctx.font = font;
              ctx.fillStyle = '#9a3412';
              ctx.fillText('گلوکز', q.x, q.y - 13);
            }
            break;
          }
          case 'flash': {
            const k = q.age / q.life;
            ctx.globalAlpha = 1 - k;
            ctx.strokeStyle = (q as Particle & { color?: string }).color || '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 4 + k * 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
          }
        }
      }
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // ---------- رنگ‌ها بر اساس شرایط ----------
  const light01 = params.light / 100;
  const health = rate / 100;
  const leafFill = mix('#b7a23a', '#22c55e', Math.min(1, health * 1.15 + 0.1));
  const leafDark = mix('#8a7a2a', '#15803d', Math.min(1, health * 1.15 + 0.1));
  const skyTop = mix('#1e2a4a', '#38bdf8', 0.25 + light01 * 0.75);
  const skyBottom = mix('#4a5570', '#e0f2fe', 0.25 + light01 * 0.75);
  const sunR = 34 + light01 * 20;
  const dropletCount = Math.round((params.water / 100) * 14);
  const dropletSpots = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ x: 60 + ((i * 137) % 680) + (i % 3) * 7, y: 470 + ((i * 53) % 110) })),
    [],
  );
  const co2Haze = params.co2 / 100;

  return (
    <div ref={wrapRef} className="relative w-full select-none overflow-hidden rounded-2xl" style={{ aspectRatio: '4 / 3' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={skyTop} />
            <stop offset="1" stopColor={skyBottom} />
          </linearGradient>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5a2b" />
            <stop offset="1" stopColor="#4a2e14" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="#fff7c2" stopOpacity={0.9 * light01 + 0.1} />
            <stop offset="0.5" stopColor="#fde047" stopOpacity={0.35 * light01} />
            <stop offset="1" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={leafDark} />
            <stop offset="1" stopColor={leafFill} />
          </linearGradient>
          <linearGradient id="stemG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f8f3a" />
            <stop offset="0.5" stopColor="#67b35a" />
            <stop offset="1" stopColor="#3f8f3a" />
          </linearGradient>
        </defs>

        {/* آسمان و هوا */}
        <rect x="0" y="0" width={W} height={SOIL_Y} fill="url(#sky)" style={{ transition: 'fill 0.6s' }} />
        <rect x="0" y="0" width={W} height={SOIL_Y} fill="#94a3b8" opacity={co2Haze * 0.14} />
        {/* ابرها */}
        <g opacity={0.55 + light01 * 0.35} fill="#fff">
          <ellipse cx="620" cy="80" rx="60" ry="18" />
          <ellipse cx="660" cy="70" rx="45" ry="20" />
          <ellipse cx="590" cy="72" rx="35" ry="15" />
          <ellipse cx="300" cy="60" rx="50" ry="14" />
          <ellipse cx="330" cy="52" rx="35" ry="16" />
        </g>
        {/* تپه‌های دور */}
        <path d="M0,440 C120,380 220,400 330,420 C420,435 500,395 600,405 C700,415 760,380 800,400 L800,440 Z" fill="#6aa96a" opacity={0.35 + light01 * 0.5} />

        {/* خورشید */}
        <g style={{ transformOrigin: `${SUN.x}px ${SUN.y}px`, animation: 'spin-slow 50s linear infinite' }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={SUN.x + Math.cos(a) * (sunR + 8)}
                y1={SUN.y + Math.sin(a) * (sunR + 8)}
                x2={SUN.x + Math.cos(a) * (sunR + 22 + light01 * 16)}
                y2={SUN.y + Math.sin(a) * (sunR + 22 + light01 * 16)}
                stroke="#fde047"
                strokeWidth="4"
                strokeLinecap="round"
                opacity={0.25 + light01 * 0.75}
              />
            );
          })}
        </g>
        <circle cx={SUN.x} cy={SUN.y} r={sunR * 2.4} fill="url(#sunGlow)" />
        <circle cx={SUN.x} cy={SUN.y} r={sunR} fill={mix('#d6c278', '#fde047', light01)} style={{ transition: 'all 0.5s' }} />
        <circle cx={SUN.x} cy={SUN.y} r={sunR * 0.7} fill={mix('#e5d89a', '#fff7c2', light01)} />

        {/* خاک */}
        <rect x="0" y={SOIL_Y} width={W} height={H - SOIL_Y} fill="url(#soil)" />
        <rect x="0" y={SOIL_Y} width={W} height={H - SOIL_Y} fill="#1d4ed8" opacity={(params.water / 100) * 0.28} style={{ transition: 'opacity 0.6s' }} />
        <path d={`M0,${SOIL_Y} Q100,${SOIL_Y - 6} 200,${SOIL_Y} T400,${SOIL_Y} T600,${SOIL_Y} T800,${SOIL_Y} V${SOIL_Y + 10} H0 Z`} fill="#3f8f3a" />
        {/* علف‌های کوچک */}
        {[40, 130, 240, 560, 660, 740].map((x) => (
          <path key={x} d={`M${x},${SOIL_Y} q-6,-18 -2,-26 M${x},${SOIL_Y} q4,-16 10,-22 M${x},${SOIL_Y} q-1,-20 5,-30`} stroke="#4ea84a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ))}
        {/* قطرات آب در خاک */}
        {dropletSpots.map((s, i) => (
          <g key={i} opacity={i < dropletCount ? 0.9 : 0} style={{ transition: 'opacity 0.5s' }}>
            <path d={`M${s.x},${s.y - 8} q7,9 0,14 q-7,-5 0,-14z`} fill="#38bdf8" />
            <circle cx={s.x - 1.5} cy={s.y + 1} r="1.4" fill="#e0f2fe" />
          </g>
        ))}

        {/* ریشه‌ها */}
        <g stroke="#e9d5a8" fill="none" strokeLinecap="round">
          {ROOT_TIPS.map((t, i) => (
            <path key={i} d={`M400,${SOIL_Y} Q${(400 + t.x) / 2 + (i % 2 ? 20 : -20)},${(SOIL_Y + t.y) / 2} ${t.x},${t.y}`} strokeWidth={i === 2 ? 7 : 4.5} />
          ))}
          <path d="M370,500 q-25,5 -40,20" strokeWidth="2.5" />
          <path d="M430,505 q25,8 35,25" strokeWidth="2.5" />
          <path d="M400,540 q-15,10 -12,28" strokeWidth="2" />
        </g>

        {/* ساقه */}
        <path d="M400,442 C 406,370 394,290 400,172" stroke="#2f6b2b" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M400,442 C 406,370 394,290 400,172" stroke="url(#stemG)" strokeWidth="11" fill="none" strokeLinecap="round" />

        {/* برگ‌ها */}
        {leaves.map((leaf, i) => (
          <g
            key={i}
            style={{
              transform: `translate(${leaf.attach.x}px, ${leaf.attach.y}px) rotate(${leaf.finalAngle}deg)`,
              transition: 'transform 0.8s ease',
              cursor: onLeafClick ? 'pointer' : 'default',
            }}
            onClick={() => onLeafClick?.(i)}
            className="group"
          >
            <path
              d={`M0,0 Q${leaf.len * 0.38},-${leaf.len * 0.26} ${leaf.len},0 Q${leaf.len * 0.38},${leaf.len * 0.26} 0,0`}
              fill="url(#leafG)"
              stroke={leafDark}
              strokeWidth="1.5"
              className="transition-all duration-300 group-hover:brightness-110"
            />
            <path d={`M2,0 L${leaf.len - 6},0`} stroke={leafDark} strokeWidth="1.8" opacity="0.8" />
            {[0.25, 0.45, 0.65].map((k) => (
              <g key={k} stroke={leafDark} strokeWidth="1" opacity="0.6">
                <path d={`M${leaf.len * k},0 q${leaf.len * 0.08},-${leaf.len * 0.1} ${leaf.len * 0.16},-${leaf.len * 0.13}`} fill="none" />
                <path d={`M${leaf.len * k},0 q${leaf.len * 0.08},${leaf.len * 0.1} ${leaf.len * 0.16},${leaf.len * 0.13}`} fill="none" />
              </g>
            ))}
            {/* کلروپلاست‌ها */}
            {[0.35, 0.5, 0.65].map((k, j) => (
              <ellipse key={j} cx={leaf.len * k} cy={j % 2 ? 7 : -7} rx="5" ry="3" fill="#0f5132" opacity={0.35 + health * 0.5} />
            ))}
          </g>
        ))}

        {/* برچسب‌ها */}
        {!compact && (
          <g fontFamily="Vazirmatn, sans-serif" fontSize="13" fontWeight="600" fill="#0f172a" style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.85)', strokeWidth: 4 }} textAnchor="middle">
            <text x={SUN.x} y={SUN.y + sunR + 44}>☀️ خورشید (منبع نور)</text>
            <text x="655" y="130">هوا (Air) — حاوی CO₂ و O₂</text>
            <text x="560" y="180" fontSize="12">↑ اکسیژن (O₂) خارج می‌شود</text>
            <text x="230" y="150" fontSize="12">CO₂ وارد برگ می‌شود →</text>
            <text x="565" y="300">برگ (Leaf) — برای بزرگنمایی کلیک کنید 🔍</text>
            <text x="250" y="362" fontSize="12">کلروپلاست‌ها (Chloroplast) درون برگ</text>
            <text x="450" y="300" fontSize="12">ساقه (Stem)</text>
            <text x="520" y="520">ریشه (Root)</text>
            <text x="90" y="470">خاک (Soil)</text>
            <text x="150" y="585">💧 آب موجود در خاک (H₂O)</text>
            <text x="680" y="585" fontSize="12">گلوکز به ریشه‌ها منتقل می‌شود ↓</text>
          </g>
        )}
        {compact && title && (
          <text x="400" y="34" textAnchor="middle" fontFamily="Vazirmatn, sans-serif" fontSize="26" fontWeight="800" fill="#0f172a" style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.9)', strokeWidth: 6 }}>
            {title}
          </text>
        )}
      </svg>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* وضعیت توقف */}
      {!running && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/25 backdrop-blur-[1px]">
          <div className="rounded-2xl bg-white/90 px-6 py-3 text-xl font-bold text-slate-800 shadow-lg">⏸ شبیه‌سازی متوقف است</div>
        </div>
      )}
    </div>
  );
}

// ---------- ابزار رنگ ----------
function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a: string, b: string, t: number) {
  const k = Math.max(0, Math.min(1, t));
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
