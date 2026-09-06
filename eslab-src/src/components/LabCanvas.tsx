import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { fmtSI, Vec, vlen } from "../physics/core";
import { Save } from "lucide-react";

export interface World {
  w: number; h: number; scale: number; dark: boolean; t: number;
  toPx: (x: number, y: number) => Vec;
  toM: (px: number, py: number) => Vec;
}

export interface DragBody {
  id: string;
  x: number; y: number; // meters
  r: number; // hit radius px
  onMove?: (x: number, y: number) => void;
  onDown?: () => void;
  locked?: boolean;
}

export interface ProbeResult { E?: Vec; V?: number; F?: Vec; extra?: Record<string, string> }

interface Props {
  scale: number; // px per meter
  draw: (ctx: CanvasRenderingContext2D, world: World) => void;
  bodies?: DragBody[];
  probe?: (x: number, y: number) => ProbeResult;
  expName: string;
  onHover?: (p: Vec | null) => void;
  className?: string;
  overlayLabels?: string[]; // legend
  logValues?: () => Record<string, number | string>;
  minHeight?: number;
}

export function LabCanvas({ scale, draw, bodies = [], probe, expName, onHover, className, logValues, minHeight = 380 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { theme, tools, addLog } = useStore();
  const [size, setSize] = useState({ w: 600, h: 400 });
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const bodiesRef = useRef(bodies);
  bodiesRef.current = bodies;
  const probeRef = useRef(probe);
  probeRef.current = probe;

  // tool positions (meters)
  const toolPos = useRef({ r1: { x: -0.3, y: -0.3 }, r2: { x: 0.3, y: -0.3 }, sensor: { x: 0.25, y: 0.2 }, volt: { x: -0.25, y: 0.2 } });
  const hoverRef = useRef<Vec | null>(null);
  const dragging = useRef<string | null>(null);
  const [readings, setReadings] = useState<Record<string, string>>({});
  const startRef = useRef(performance.now());

  // resize
  useEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(200, r.width), h: Math.max(minHeight, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [minHeight]);

  const mkWorld = useCallback((): World => {
    const { w, h } = size;
    return {
      w, h, scale, dark: theme === "dark", t: (performance.now() - startRef.current) / 1000,
      toPx: (x, y) => ({ x: w / 2 + x * scale, y: h / 2 - y * scale }),
      toM: (px, py) => ({ x: (px - w / 2) / scale, y: (h / 2 - py) / scale }),
    };
  }, [size, scale, theme]);

  // render loop
  useEffect(() => {
    let raf = 0;
    let lastReadUpdate = 0;
    const loop = () => {
      const cv = ref.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        if (cv.width !== size.w * dpr || cv.height !== size.h * dpr) {
          cv.width = size.w * dpr; cv.height = size.h * dpr;
          cv.style.width = size.w + "px"; cv.style.height = size.h + "px";
        }
        const ctx = cv.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const world = mkWorld();
        ctx.clearRect(0, 0, size.w, size.h);
        drawRef.current(ctx, world);
        drawTools(ctx, world);
        const now = performance.now();
        if (now - lastReadUpdate > 120) { lastReadUpdate = now; updateReadings(world); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, mkWorld, tools]);

  function updateReadings(world: World) {
    const r: Record<string, string> = {};
    const tp = toolPos.current;
    if (tools.ruler) r["خط‌کش"] = fmtSI(Math.hypot(tp.r1.x - tp.r2.x, tp.r1.y - tp.r2.y), "m");
    const pr = probeRef.current;
    if (pr) {
      if (tools.fieldsensor || tools.forcemeter) {
        const res = pr(tp.sensor.x, tp.sensor.y);
        if (tools.fieldsensor && res.E) r["حسگر میدان"] = fmtSI(vlen(res.E), "N/C");
        if (tools.forcemeter && res.F) r["نیروسنج"] = fmtSI(vlen(res.F), "N");
        if (res.extra) Object.assign(r, res.extra);
      }
      if (tools.voltmeter) {
        const res = pr(tp.volt.x, tp.volt.y);
        if (res.V !== undefined) r["ولت‌متر"] = fmtSI(res.V, "V");
      }
    }
    if (tools.coords && hoverRef.current) {
      r["مختصات"] = `(${hoverRef.current.x.toFixed(3)}, ${hoverRef.current.y.toFixed(3)}) m`;
    }
    setReadings(prev => {
      const a = JSON.stringify(prev), b = JSON.stringify(r);
      return a === b ? prev : r;
    });
    void world;
  }

  function drawTools(ctx: CanvasRenderingContext2D, world: World) {
    const tp = toolPos.current;
    const dark = world.dark;
    ctx.save();
    if (tools.ruler) {
      const a = world.toPx(tp.r1.x, tp.r1.y), b = world.toPx(tp.r2.x, tp.r2.y);
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // ticks every 5 cm
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
      const tick = 0.05 * world.scale;
      ctx.lineWidth = 1.5;
      for (let d = 0; d <= L; d += tick) {
        const big = Math.round(d / tick) % 2 === 0;
        const px = a.x + ux * d, py = a.y + uy * d;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - uy * (big ? 10 : 6), py + ux * (big ? 10 : 6)); ctx.stroke();
      }
      for (const p of [a, b]) {
        ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      }
      const d = Math.hypot(tp.r1.x - tp.r2.x, tp.r1.y - tp.r2.y);
      label(ctx, `${(d * 100).toFixed(1)} cm`, (a.x + b.x) / 2, (a.y + b.y) / 2 - 16, "#f59e0b", dark);
    }
    const pr = probeRef.current;
    if (tools.fieldsensor || tools.forcemeter) {
      const p = world.toPx(tp.sensor.x, tp.sensor.y);
      ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - 14, p.y); ctx.lineTo(p.x + 14, p.y); ctx.moveTo(p.x, p.y - 14); ctx.lineTo(p.x, p.y + 14); ctx.stroke();
      if (pr) {
        const res = pr(tp.sensor.x, tp.sensor.y);
        if (res.E && tools.fieldsensor) {
          const m = vlen(res.E);
          if (m > 0) { const len = 40; arrow(ctx, p.x, p.y, p.x + (res.E.x / m) * len, p.y - (res.E.y / m) * len, "#a855f7", 2.5); }
          label(ctx, `E = ${fmtSI(m, "N/C")}`, p.x, p.y - 22, "#a855f7", dark);
        }
        if (res.F && tools.forcemeter) label(ctx, `F = ${fmtSI(vlen(res.F), "N")}`, p.x, p.y + 30, "#a855f7", dark);
      }
    }
    if (tools.voltmeter) {
      const p = world.toPx(tp.volt.x, tp.volt.y);
      ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2; ctx.fillStyle = dark ? "#064e3b" : "#d1fae5";
      ctx.beginPath(); ctx.roundRect(p.x - 12, p.y - 12, 24, 24, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#10b981"; ctx.font = "bold 12px Vazirmatn"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("V", p.x, p.y + 1);
      if (pr) { const res = pr(tp.volt.x, tp.volt.y); if (res.V !== undefined) label(ctx, `V = ${fmtSI(res.V, "V")}`, p.x, p.y - 24, "#10b981", dark); }
    }
    if (tools.coords && hoverRef.current) {
      const p = world.toPx(hoverRef.current.x, hoverRef.current.y);
      ctx.strokeStyle = dark ? "rgba(148,163,184,.4)" : "rgba(71,85,105,.4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, world.h); ctx.moveTo(0, p.y); ctx.lineTo(world.w, p.y); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // pointer handling
  const hitTest = (px: number, py: number, world: World): string | null => {
    const tp = toolPos.current;
    const handles: [string, Vec, number][] = [];
    if (tools.ruler) { handles.push(["tool:r1", tp.r1, 14], ["tool:r2", tp.r2, 14]); }
    if (tools.fieldsensor || tools.forcemeter) handles.push(["tool:sensor", tp.sensor, 16]);
    if (tools.voltmeter) handles.push(["tool:volt", tp.volt, 16]);
    for (const [id, p, r] of handles) { const q = world.toPx(p.x, p.y); if (Math.hypot(q.x - px, q.y - py) <= r) return id; }
    let best: string | null = null, bd = Infinity;
    for (const b of bodiesRef.current) {
      if (b.locked) continue;
      const q = world.toPx(b.x, b.y);
      const d = Math.hypot(q.x - px, q.y - py);
      if (d <= b.r && d < bd) { bd = d; best = b.id; }
    }
    return best;
  };

  const getPos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { px: e.clientX - r.left, py: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const { px, py } = getPos(e);
    const world = mkWorld();
    const id = hitTest(px, py, world);
    if (id) {
      dragging.current = id;
      (e.target as Element).setPointerCapture(e.pointerId);
      const b = bodiesRef.current.find(bb => bb.id === id);
      b?.onDown?.();
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const { px, py } = getPos(e);
    const world = mkWorld();
    const m = world.toM(Math.max(0, Math.min(size.w, px)), Math.max(0, Math.min(size.h, py)));
    hoverRef.current = m;
    onHover?.(m);
    const id = dragging.current;
    if (!id) {
      const cv = ref.current; if (cv) cv.style.cursor = hitTest(px, py, world) ? "grab" : "crosshair";
      return;
    }
    if (id.startsWith("tool:")) {
      const k = id.slice(5) as "r1" | "r2" | "sensor" | "volt";
      toolPos.current[k] = m;
    } else {
      const b = bodiesRef.current.find(bb => bb.id === id);
      b?.onMove?.(m.x, m.y);
    }
  };
  const onPointerUp = () => { dragging.current = null; };
  const onLeave = () => { hoverRef.current = null; onHover?.(null); };

  const entries = Object.entries(readings);

  return (
    <div ref={wrapRef} className={"relative h-full w-full overflow-hidden rounded-2xl lab-grid bg-white dark:bg-[#0a1020] " + (className ?? "")} style={{ minHeight }}>
      <canvas
        ref={ref}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={onLeave}
        className="absolute inset-0"
      />
      {entries.length > 0 && (
        <div className="pointer-events-none absolute right-2 top-2 flex flex-col gap-1">
          {entries.map(([k, v]) => (
            <div key={k} className="glass rounded-lg px-2 py-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">{k}: </span>
              <span className="num font-bold text-slate-800 dark:text-cyan-200">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tools.logger && logValues && (
        <button
          onClick={() => addLog(expName, { ...logValues(), ...Object.fromEntries(entries.filter(([k]) => k !== "مختصات")) })}
          className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-lg hover:bg-cyan-500 active:scale-95"
        >
          <Save size={13} /> ثبت داده
        </button>
      )}
    </div>
  );
}

// ===== drawing helpers exported for experiments =====
export function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2, head = 9) {
  const dx = x2 - x1, dy = y2 - y1; const L = Math.hypot(dx, dy); if (L < 1) return;
  const ux = dx / L, uy = dy / L;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * head * 0.6, y2 - uy * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * head - uy * head * 0.5, y2 - uy * head + ux * head * 0.5);
  ctx.lineTo(x2 - ux * head + uy * head * 0.5, y2 - uy * head - ux * head * 0.5);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, dark: boolean, size = 12) {
  ctx.save(); ctx.font = `bold ${size}px Vazirmatn, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const w = ctx.measureText(text).width + 12;
  ctx.fillStyle = dark ? "rgba(2,6,23,.75)" : "rgba(255,255,255,.85)";
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - 10, w, 20, 6); ctx.fill();
  ctx.fillStyle = color; ctx.fillText(text, x, y + 1); ctx.restore();
}

export function chargeBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, q: number, glow = true, t = 0) {
  const pos = q > 0, neutral = q === 0;
  const c1 = neutral ? "#94a3b8" : pos ? "#f43f5e" : "#3b82f6";
  const c2 = neutral ? "#475569" : pos ? "#9f1239" : "#1e3a8a";
  ctx.save();
  if (glow && !neutral) {
    const g = ctx.createRadialGradient(x, y, r, x, y, r * 2.2 + Math.sin(t * 3) * 2);
    g.addColorStop(0, pos ? "rgba(244,63,94,.35)" : "rgba(59,130,246,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, "#fff"); g.addColorStop(0.25, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
  if (!neutral) {
    ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(2, r * 0.18); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x + r * 0.45, y);
    if (pos) { ctx.moveTo(x, y - r * 0.45); ctx.lineTo(x, y + r * 0.45); }
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAxes(ctx: CanvasRenderingContext2D, world: World) {
  const o = world.toPx(0, 0);
  ctx.save(); ctx.strokeStyle = world.dark ? "rgba(148,163,184,.18)" : "rgba(71,85,105,.18)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(world.w, o.y); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, world.h); ctx.stroke();
  ctx.restore();
}

export function fieldColor(mag: number, maxMag: number) {
  const t = Math.min(1, Math.log10(1 + (mag / maxMag) * 99) / 2);
  const h = 200 - t * 200; // blue -> red
  return `hsl(${h} 90% ${45 + t * 15}%)`;
}
