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

// Accent colors (cyan / teal), matching the app's primary/accent tones.
const C_NODE = [34, 211, 238]; // cyan-400
const C_EDGE = [56, 189, 248]; // sky-400
const C_PULSE = [125, 252, 220]; // teal glow

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

      // dark backdrop with a subtle radial depth glow
      const bg = ctx.createRadialGradient(cxp, cyp * 0.85, 0, cxp, cyp, Math.max(W, H) * 0.75);
      bg.addColorStop(0, "#0b1522");
      bg.addColorStop(0.55, "#070d16");
      bg.addColorStop(1, "#04070d");
      ctx.fillStyle = bg;
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

      // edges
      ctx.lineWidth = 1;
      for (let k = 0; k < edges.length; k++) {
        const a = proj[edges[k].a];
        const b = proj[edges[k].b];
        const near = 1 - (a.depth + b.depth) / 2; // 1 near .. 0 far
        const alpha = 0.05 + near * 0.28;
        ctx.strokeStyle = `rgba(${C_EDGE[0]},${C_EDGE[1]},${C_EDGE[2]},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = proj[i];
        const near = 1 - p.depth;
        const r = 0.6 + p.s * 2.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${C_NODE[0]},${C_NODE[1]},${C_NODE[2]},${0.25 + near * 0.6})`;
        ctx.fill();
      }

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
