import { useEffect, useRef } from "react";
import type { Simulation, Body } from "../sim/Simulation";
import { SUN_RADIUS } from "../data/planets";

interface Props {
  sim: Simulation;
  playing: boolean;
  daysPerSecond: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onFrame?: (sim: Simulation) => void;
  highlightIds?: string[]; // برای مسابقه
  showStartLine?: boolean;
  focusId?: string | null; // برای برجسته کردن سیاره آزمایش
}

const REF = 760;
const STARS = Array.from({ length: 220 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.4 + 0.3,
  p: (i % 7) / 7,
}));

export default function SolarCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const sizeRef = useRef({ w: 800, h: 600, dpr: 1 });

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const p = propsRef.current;
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (p.playing) {
        p.sim.step(dtReal * p.daysPerSecond);
      }
      p.onFrame?.(p.sim);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTransform = () => {
    const { w, h } = sizeRef.current;
    const s = Math.min(w, h) / REF;
    return { cx: w / 2, cy: h / 2, s };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { w, h, dpr } = sizeRef.current;
    const { sim, selectedId, highlightIds, showStartLine, focusId } = propsRef.current;
    const { cx, cy, s } = getTransform();
    const t = performance.now() / 1000;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // ستاره‌ها
    for (const st of STARS) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + st.p * 6.28));
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const toX = (x: number) => cx + x * s;
    const toY = (y: number) => cy - y * s;
    const dim = (id: string) => (highlightIds && highlightIds.length > 0 ? !highlightIds.includes(id) : false);

    // مدارها
    for (const b of sim.bodies) {
      const isSel = b.id === selectedId || b.id === focusId;
      const alpha = dim(b.id) ? 0.08 : isSel ? 0.95 : 0.32;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, b.orbitR * s, 0, Math.PI * 2);
      ctx.strokeStyle = hexA(b.color, alpha);
      ctx.lineWidth = isSel ? 3 : 1.3;
      if (b.kind === "physics") ctx.setLineDash([4, 6]);
      if (isSel) {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 14;
      }
      ctx.stroke();
      ctx.restore();
    }

    // خط شروع مسابقه
    if (showStartLine && highlightIds && highlightIds.length) {
      const rs = highlightIds.map((id) => sim.get(id)?.orbitR ?? 0);
      const r0 = Math.min(...rs) - 18;
      const r1 = Math.max(...rs) + 18;
      ctx.save();
      const segs = 8;
      for (let i = 0; i < segs; i++) {
        const a = r0 + ((r1 - r0) * i) / segs;
        const bb = r0 + ((r1 - r0) * (i + 1)) / segs;
        ctx.fillStyle = i % 2 === 0 ? "#fff" : "#222";
        ctx.fillRect(toX(a), cy - 4, (bb - a) * s, 8);
      }
      ctx.font = "bold 14px Vazirmatn, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("🏁 خط شروع", toX((r0 + r1) / 2), cy - 12);
      ctx.restore();
    }

    // خورشید
    {
      const R = SUN_RADIUS * s;
      const glow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3.2);
      glow.addColorStop(0, "rgba(255,200,60,0.55)");
      glow.addColorStop(0.4, "rgba(255,140,30,0.18)");
      glow.addColorStop(1, "rgba(255,120,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // پرتوها
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.15);
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const len = R * (1.55 + 0.18 * Math.sin(t * 3 + i));
        ctx.strokeStyle = "rgba(255,220,120,0.55)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * R * 1.15, Math.sin(ang) * R * 1.15);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.restore();

      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      g.addColorStop(0, "#fff7c2");
      g.addColorStop(0.5, "#ffd23f");
      g.addColorStop(1, "#ff8c1a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      if (selectedId === "sun") {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, R + 8 + Math.sin(t * 4) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // چهره‌ی خندان خورشید
      ctx.fillStyle = "rgba(120,60,0,0.75)";
      ctx.beginPath();
      ctx.arc(cx - R * 0.3, cy - R * 0.15, R * 0.09, 0, Math.PI * 2);
      ctx.arc(cx + R * 0.3, cy - R * 0.15, R * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(120,60,0,0.75)";
      ctx.lineWidth = Math.max(1.5, R * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy + R * 0.1, R * 0.4, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.font = `bold ${Math.max(12, 13 * s)}px Vazirmatn, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffe9a8";
      ctx.fillText("خورشید", cx, cy + R + 16 * s + 6);
    }

    // دنباله‌ها و سیاره‌ها
    for (const b of sim.bodies) {
      const isDim = dim(b.id);
      const isSel = b.id === selectedId || b.id === focusId;
      ctx.save();
      if (isDim) ctx.globalAlpha = 0.25;

      // دنباله
      if (b.kind === "kepler") {
        const w = (Math.PI * 2) / b.period;
        const len = Math.min(0.9, Math.max(0.35, w * 60));
        const segs = 16;
        for (let i = 0; i < segs; i++) {
          const a0 = b.angle - len + (len * i) / segs;
          const a1 = b.angle - len + (len * (i + 1)) / segs + 0.002;
          ctx.strokeStyle = hexA(b.color, (i + 1) / segs * 0.85);
          ctx.lineWidth = 2 + (i / segs) * 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, b.orbitR * s, -a1, -a0);
          ctx.stroke();
        }
      } else if (b.trail.length > 1) {
        const n = b.trail.length;
        for (let i = 1; i < n; i++) {
          const p0 = b.trail[i - 1], p1 = b.trail[i];
          ctx.strokeStyle = hexA(b.color, (i / n) * 0.9);
          ctx.lineWidth = 1.5 + (i / n) * 3;
          ctx.beginPath();
          ctx.moveTo(toX(p0.x), toY(p0.y));
          ctx.lineTo(toX(p1.x), toY(p1.y));
          ctx.stroke();
        }
      }

      const px = toX(b.x), py = toY(b.y);
      const R = b.radius * s;

      if (b.status === "crashed") {
        ctx.font = `${Math.max(22, 30 * s)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💥", px, py);
        ctx.restore();
        continue;
      }
      if (b.status === "escaped") {
        // نشان دادن جهت فرار در لبه‌ی صفحه
        const ang = Math.atan2(b.y, b.x);
        const ex = cx + Math.cos(ang) * Math.min(w, h) * 0.46;
        const ey = cy - Math.sin(ang) * Math.min(w, h) * 0.46;
        ctx.font = `${Math.max(20, 26 * s)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🚀", ex, ey);
        ctx.font = `bold 12px Vazirmatn, sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(`${b.name} فرار کرد!`, ex, ey + 22);
        ctx.restore();
        continue;
      }

      // حلقه‌های زحل (نیمه‌ی پشت)
      if (b.hasRings) drawRing(ctx, px, py, R, b.color, true);

      // بدنه‌ی سیاره
      drawPlanetBody(ctx, b, px, py, R, t);

      if (b.hasRings) drawRing(ctx, px, py, R, b.color, false);

      // ماه زمین
      if (b.id === "earth") {
        const ma = (sim.time / 27.3) * Math.PI * 2;
        const mx = px + Math.cos(ma) * R * 2.1;
        const my = py - Math.sin(ma) * R * 2.1;
        ctx.fillStyle = "#d8d8e0";
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(1.5, R * 0.28), 0, Math.PI * 2);
        ctx.fill();
      }

      // انتخاب
      if (isSel) {
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(px, py, (b.hasRings ? R * 2.1 : R) + 7 + Math.sin(t * 5) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // برچسب نام
      ctx.font = `bold ${Math.max(12, 13 * s)}px Vazirmatn, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const ly = py + (b.hasRings ? R * 1.3 : R) + 6;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(5,8,25,0.85)";
      ctx.strokeText(b.name, px, ly);
      ctx.fillStyle = isSel ? "#fff" : "#e5e7ff";
      ctx.fillText(b.name, px, ly);
      ctx.restore();
    }
  };

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { cx, cy, s } = getTransform();
    const rx = (px - cx) / s;
    const ry = -(py - cy) / s;
    const { sim, onSelect } = propsRef.current;
    let best: Body | null = null;
    let bestD = Infinity;
    for (const b of sim.bodies) {
      if (b.status !== "ok") continue;
      const d = Math.hypot(b.x - rx, b.y - ry);
      const hit = Math.max((b.hasRings ? b.radius * 2 : b.radius) + 8, 18);
      if (d < hit && d < bestD) {
        best = b;
        bestD = d;
      }
    }
    if (best) {
      onSelect(best.id);
      return;
    }
    if (Math.hypot(rx, ry) < SUN_RADIUS + 10) {
      onSelect("sun");
      return;
    }
    onSelect(null);
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} onPointerDown={handlePointer} className="block cursor-pointer touch-none" />
    </div>
  );
}

function drawPlanetBody(ctx: CanvasRenderingContext2D, b: Body, px: number, py: number, R: number, t: number) {
  const g = ctx.createRadialGradient(px - R * 0.35, py - R * 0.35, R * 0.1, px, py, R);
  g.addColorStop(0, lighten(b.color, 60));
  g.addColorStop(0.6, b.color);
  g.addColorStop(1, b.color2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(px, py, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, R, 0, Math.PI * 2);
  ctx.clip();
  if (b.id === "earth") {
    // قاره‌های ساده در حال چرخش
    const rot = t * 0.6;
    ctx.fillStyle = "#22c55e";
    for (let i = 0; i < 4; i++) {
      const a = rot + i * 1.7;
      const x = px + Math.cos(a) * R * 0.75;
      const y = py + Math.sin(a * 0.7) * R * 0.5;
      ctx.beginPath();
      ctx.ellipse(x, y, R * 0.42, R * 0.28, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(px + R * 0.2, py - R * 0.3, R * 0.5, R * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.id === "jupiter" || b.id === "saturn") {
    ctx.fillStyle = "rgba(120,60,20,0.28)";
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(px - R, py + i * R * 0.38 - R * 0.07, R * 2, R * 0.14);
    }
    if (b.id === "jupiter") {
      ctx.fillStyle = "rgba(200,60,40,0.75)";
      ctx.beginPath();
      ctx.ellipse(px + R * 0.35, py + R * 0.3, R * 0.28, R * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (b.id === "mars") {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(px, py - R * 0.85, R * 0.4, R * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.id === "mercury") {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(px + Math.cos(i * 1.9) * R * 0.5, py + Math.sin(i * 2.3) * R * 0.5, R * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (b.id === "uranus" || b.id === "neptune") {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(px - R, py - R * 0.2, R * 2, R * 0.12);
  }
  // سایه‌ی سمت دور از خورشید — به سمت مخالف خورشید
  const ang = Math.atan2(b.y, b.x);
  const sx = px + Math.cos(ang) * R * 0.6;
  const sy = py - Math.sin(ang) * R * 0.6;
  const sg = ctx.createRadialGradient(px - Math.cos(ang) * R * 0.5, py + Math.sin(ang) * R * 0.5, R * 0.2, sx, sy, R * 1.6);
  sg.addColorStop(0, "rgba(0,0,0,0)");
  sg.addColorStop(0.55, "rgba(0,0,0,0)");
  sg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = sg;
  ctx.fillRect(px - R, py - R, R * 2, R * 2);
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, px: number, py: number, R: number, color: string, back: boolean) {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.35);
  ctx.strokeStyle = hexA(color, 0.9);
  ctx.lineWidth = Math.max(2, R * 0.45);
  ctx.beginPath();
  if (back) ctx.ellipse(0, 0, R * 1.9, R * 0.55, 0, Math.PI, Math.PI * 2);
  else ctx.ellipse(0, 0, R * 1.9, R * 0.55, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = Math.max(1, R * 0.12);
  ctx.beginPath();
  if (back) ctx.ellipse(0, 0, R * 1.55, R * 0.42, 0, Math.PI, Math.PI * 2);
  else ctx.ellipse(0, 0, R * 1.55, R * 0.42, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

export function hexA(hex: string, a: number) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return hex;
  const n = parseInt(c, 16);
  return `rgba(${n >> 16},${(n >> 8) & 0xff},${n & 0xff},${a})`;
}

function lighten(hex: string, amt: number) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return hex;
  const n = parseInt(c, 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}
