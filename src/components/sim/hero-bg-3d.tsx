"use client";

import { useEffect, useRef } from "react";

/**
 * Animated 3D network background — a rotating sphere of sensor nodes wired
 * together, with real perspective projection, depth shading, data pulses and
 * subtle mouse parallax. Rendered on a transparent, fixed, full-viewport
 * canvas that sits behind all page content. Fits the digital-twin / smart-grid
 * theme of the I&C Simulator.
 */

type Node = { x: number; y: number; z: number };
type Edge = { a: number; b: number };

const NODE_COUNT = 170;
const SPHERE_R = 1;
const EDGE_DIST = 0.42; // 3D distance threshold for wiring two nodes

// Multi-hue gradient across the sphere: cyan → sky → indigo → violet → fuchsia,
// with an emerald accent — a rich, high-tech palette.
const PALETTE: number[][] = [
  [34, 211, 238], // cyan-400
  [45, 212, 191], // teal-400
  [56, 189, 248], // sky-400
  [129, 140, 248], // indigo-400
  [167, 139, 250], // violet-400
  [232, 121, 249], // fuchsia-400
];

function paletteAt(t: number): number[] {
  const x = Math.min(0.9999, Math.max(0, t)) * (PALETTE.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = PALETTE[i];
  const b = PALETTE[i + 1] ?? a;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

const C_PULSE = [186, 230, 255]; // bright icy-white pulse core

export function HeroBg3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // --- build a fibonacci sphere of nodes ---
    const nodes: Node[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      nodes.push({ x: Math.cos(theta) * r * SPHERE_R, y: y * SPHERE_R, z: Math.sin(theta) * r * SPHERE_R });
    }

    // per-node color: gradient from top (cyan) to bottom (fuchsia), with a
    // slight longitudinal shimmer so neighbours differ subtly.
    const nodeColors = nodes.map((n, i) => {
      const t = (1 - n.y / SPHERE_R) / 2 + Math.sin(i * 0.7) * 0.05;
      return paletteAt(t);
    });

    // --- wire nearby nodes ---
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        if (dx * dx + dy * dy + dz * dz < EDGE_DIST * EDGE_DIST) edges.push({ a: i, b: j });
      }
    }

    // --- data pulses travelling along random edges ---
    const pulses = Array.from({ length: 16 }, () => ({
      edge: (Math.random() * edges.length) | 0,
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.01,
    }));

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // mouse parallax targets
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMove = (e: MouseEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      tmy = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    let yaw = 0;
    const proj = nodes.map(() => ({ x: 0, y: 0, s: 0, depth: 0 }));

    const render = (time: number) => {
      yaw = reduce ? 0.6 : time * 0.00013;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      const pitch = 0.35 + my;
      const totalYaw = yaw + mx;
      const cy = Math.cos(pitch), sy = Math.sin(pitch);
      const cx = Math.cos(totalYaw), sx = Math.sin(totalYaw);

      const cxp = W / 2;
      const cyp = H / 2;
      const scale = Math.min(W, H) * 0.42;
      const focal = 3;

      // rich dark backdrop: deep indigo core → near-black, plus a violet
      // accent glow toward the upper-right for a premium, colourful base.
      const bg = ctx.createRadialGradient(cxp, cyp * 0.8, 0, cxp, cyp, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#101a3a");
      bg.addColorStop(0.5, "#0a1024");
      bg.addColorStop(1, "#05060f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const accent = ctx.createRadialGradient(cxp * 1.25, cyp * 0.55, 0, cxp * 1.25, cyp * 0.55, Math.max(W, H) * 0.55);
      accent.addColorStop(0, "rgba(124,58,237,0.18)");
      accent.addColorStop(1, "rgba(124,58,237,0)");
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, H);

      // project all nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // rotate around Y (yaw)
        let x = n.x * cx - n.z * sx;
        let z = n.x * sx + n.z * cx;
        let y = n.y;
        // rotate around X (pitch)
        const y2 = y * cy - z * sy;
        const z2 = y * sy + z * cy;
        y = y2; z = z2;
        const persp = focal / (focal + z);
        proj[i].x = cxp + x * scale * persp;
        proj[i].y = cyp + y * scale * persp;
        proj[i].s = persp;
        proj[i].depth = (z + 1) / 2; // 0 (near) .. 1 (far)
      }

      // edges — colour blended from the two endpoints, additive neon glow
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1;
      for (let k = 0; k < edges.length; k++) {
        const ia = edges[k].a, ib = edges[k].b;
        const a = proj[ia], b = proj[ib];
        const near = 1 - (a.depth + b.depth) / 2; // 1 near .. 0 far
        const alpha = 0.04 + near * 0.2;
        const ca = nodeColors[ia], cb = nodeColors[ib];
        const rr = ((ca[0] + cb[0]) / 2) | 0;
        const gg = ((ca[1] + cb[1]) / 2) | 0;
        const bb = ((ca[2] + cb[2]) / 2) | 0;
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // nodes — additive glow in each node's own colour
      for (let i = 0; i < nodes.length; i++) {
        const p = proj[i];
        const near = 1 - p.depth;
        const r = 0.6 + p.s * 2.2;
        const c = nodeColors[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${0.35 + near * 0.55})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // pulses
      for (const pl of pulses) {
        if (!reduce) pl.t += pl.speed;
        if (pl.t > 1) { pl.t = 0; pl.edge = (Math.random() * edges.length) | 0; }
        const e = edges[pl.edge];
        if (!e) continue;
        const a = proj[e.a], b = proj[e.b];
        const px = a.x + (b.x - a.x) * pl.t;
        const py = a.y + (b.y - a.y) * pl.t;
        const near = 1 - (a.depth + b.depth) / 2;
        const rad = 1.4 + near * 2.2;
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad * 3);
        g.addColorStop(0, `rgba(${C_PULSE[0]},${C_PULSE[1]},${C_PULSE[2]},${0.5 + near * 0.4})`);
        g.addColorStop(1, "rgba(125,252,220,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

export default HeroBg3D;
