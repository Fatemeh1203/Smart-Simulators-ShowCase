import { World, arrow, label } from "../components/LabCanvas";
import { fmtSI } from "../physics/core";

export interface CapState {
  A: number; // m²
  d: number; // m
  Vb: number; // battery volts
  Q: number; // coulombs on capacitor
  C: number; // farads
  V: number; // capacitor voltage
  kappa: number;
  insert: number; // 0..1 fraction of dielectric inserted
  connected: boolean;
  current: number; // A (dQ/dt), sign: + charging
}

export function drawCapacitor(ctx: CanvasRenderingContext2D, w: World, s: CapState, flowRef: { phase: number }) {
  const cx = w.w / 2, cy = w.h / 2 - 20;
  const gap = 24 + (s.d * 1000) * 16; // px
  const ph = 70 + Math.sqrt(s.A * 1e4) * 7; // px, plate height ∝ √A
  const pw = 10;
  const lx = cx - gap / 2 - pw, rx = cx + gap / 2;
  const top = cy - ph / 2, bot = cy + ph / 2;
  const dark = w.dark;

  // dielectric
  if (s.insert > 0 && s.kappa > 1) {
    const h = ph * s.insert;
    ctx.fillStyle = dark ? "rgba(251,191,36,.18)" : "rgba(245,158,11,.22)";
    ctx.strokeStyle = "rgba(245,158,11,.7)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(lx + pw + 2, top, gap - 4, h, 4); ctx.fill(); ctx.stroke();
    // polarised molecules
    const E = s.V / s.d; const pol = Math.min(1, E / 3e4);
    const cols = Math.max(1, Math.floor((gap - 12) / 22)), rows = Math.max(1, Math.floor(h / 22));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const mx = lx + pw + 12 + i * ((gap - 14) / cols) + 4, my = top + 12 + j * (h / rows);
      const off = 4 * pol;
      ctx.fillStyle = "rgba(59,130,246,.9)"; ctx.beginPath(); ctx.arc(mx - off, my, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(244,63,94,.9)"; ctx.beginPath(); ctx.arc(mx + off, my, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    label(ctx, `κ = ${s.kappa}`, cx, top + h + 12, "#f59e0b", dark, 10);
  }

  // field lines between plates (density ∝ E)
  const E = s.V / s.d;
  const nLines = Math.min(24, Math.round(E / 2500));
  for (let i = 0; i < nLines; i++) {
    const y = top + ((i + 0.5) / nLines) * ph;
    arrow(ctx, lx + pw + 4, y, rx - 4, y, dark ? "rgba(168,85,247,.75)" : "rgba(126,34,206,.7)", 1.5, 7);
  }

  // plates
  const plate = (x: number, sign: number) => {
    const g = ctx.createLinearGradient(x, 0, x + pw, 0);
    g.addColorStop(0, "#94a3b8"); g.addColorStop(0.5, "#e2e8f0"); g.addColorStop(1, "#64748b");
    ctx.fillStyle = g; ctx.fillRect(x, top, pw, ph);
    const n = Math.min(40, Math.round(Math.abs(s.Q) / 2e-9));
    for (let i = 0; i < n; i++) {
      const y = top + ((i % 20) + 0.5) / Math.min(20, n) * ph, xx = x + (i < 20 ? 2 : 8) + (sign > 0 ? -12 : 12) * 0;
      const px = sign > 0 ? x + pw + 6 : x - 6; void xx;
      ctx.fillStyle = sign > 0 ? "#f43f5e" : "#3b82f6"; ctx.beginPath(); ctx.arc(px, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - 1.6, y); ctx.lineTo(px + 1.6, y); if (sign > 0) { ctx.moveTo(px, y - 1.6); ctx.lineTo(px, y + 1.6); } ctx.stroke();
    }
  };
  plate(lx, +1); plate(rx, -1);
  label(ctx, `+Q = ${fmtSI(s.Q, "C")}`, lx - 30, top - 16, "#f43f5e", dark, 11);
  label(ctx, `−Q`, rx + pw + 20, top - 16, "#3b82f6", dark, 11);
  label(ctx, `d = ${(s.d * 1000).toFixed(1)} mm`, cx, bot + 16, dark ? "#e2e8f0" : "#334155", dark, 11);
  label(ctx, `A = ${(s.A * 1e4).toFixed(0)} cm²`, lx - 40, cy, dark ? "#e2e8f0" : "#334155", dark, 10);
  label(ctx, `E = ${fmtSI(E, "V/m")}`, cx, cy - ph / 2 - 40, "#a855f7", dark, 11);

  // circuit: wires from plates to battery at bottom
  const wy = bot + 70; const bx = cx; const bw = 60;
  const swx = lx - 40; // switch position on left wire
  ctx.strokeStyle = dark ? "#cbd5e1" : "#334155"; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(lx + pw / 2, bot); ctx.lineTo(lx + pw / 2, wy); ctx.lineTo(swx, wy);
  ctx.moveTo(swx - 34, wy); ctx.lineTo(bx - bw / 2, wy);
  ctx.moveTo(bx + bw / 2, wy); ctx.lineTo(rx + pw / 2, wy); ctx.lineTo(rx + pw / 2, bot);
  ctx.stroke();
  // switch
  ctx.beginPath(); ctx.moveTo(swx, wy);
  if (s.connected) ctx.lineTo(swx - 34, wy); else ctx.lineTo(swx - 30, wy - 18);
  ctx.strokeStyle = s.connected ? "#10b981" : "#f59e0b"; ctx.stroke();
  ctx.fillStyle = dark ? "#cbd5e1" : "#334155"; ctx.beginPath(); ctx.arc(swx, wy, 4, 0, Math.PI * 2); ctx.arc(swx - 34, wy, 4, 0, Math.PI * 2); ctx.fill();
  label(ctx, s.connected ? "کلید بسته" : "کلید باز", swx - 17, wy + 18, s.connected ? "#10b981" : "#f59e0b", dark, 10);
  // battery
  ctx.strokeStyle = dark ? "#e2e8f0" : "#1e293b"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(bx - 8, wy - 18); ctx.lineTo(bx - 8, wy + 18); ctx.stroke(); // long (+)
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx + 6, wy - 10); ctx.lineTo(bx + 6, wy + 10); ctx.stroke(); // short (−)
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - bw / 2, wy); ctx.lineTo(bx - 8, wy); ctx.moveTo(bx + 6, wy); ctx.lineTo(bx + bw / 2, wy); ctx.stroke();
  label(ctx, `باتری ${s.Vb.toFixed(1)} V`, bx, wy + 30, dark ? "#e2e8f0" : "#334155", dark, 11);
  ctx.fillStyle = "#f43f5e"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("+", bx - 18, wy - 22);
  ctx.fillStyle = "#3b82f6"; ctx.fillText("−", bx + 16, wy - 22);

  // electrons flowing (from + plate → battery → − plate when charging)
  const path: [number, number][] = [[lx + pw / 2, bot], [lx + pw / 2, wy], [bx - bw / 2, wy], [bx + bw / 2, wy], [rx + pw / 2, wy], [rx + pw / 2, bot]];
  const segLens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segLens.reduce((a, b) => a + b, 0);
  const speed = Math.max(-1, Math.min(1, s.current / 1e-8)); // normalised
  flowRef.phase = (flowRef.phase + speed * 2.2 + 1000) % 40;
  if (s.connected && Math.abs(speed) > 0.01) {
    for (let dpos = flowRef.phase; dpos < total; dpos += 40) {
      let rem = dpos, k = 0; while (k < segLens.length && rem > segLens[k]) { rem -= segLens[k]; k++; }
      if (k >= segLens.length) break;
      const a = path[k], b = path[k + 1]; const t = rem / segLens[k];
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      ctx.fillStyle = "#60a5fa"; ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    label(ctx, `I = ${fmtSI(Math.abs(s.current), "A")} (${s.current > 0 ? "شارژ" : "تخلیه"})`, cx, wy - 34, "#60a5fa", dark, 10);
  }

  // voltmeter across plates (top)
  const vy = top - 60;
  ctx.strokeStyle = "#10b981"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(lx + pw / 2, top); ctx.lineTo(lx + pw / 2, vy); ctx.lineTo(cx - 34, vy); ctx.moveTo(cx + 34, vy); ctx.lineTo(rx + pw / 2, vy); ctx.lineTo(rx + pw / 2, top); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = dark ? "#052e16" : "#ecfdf5"; ctx.beginPath(); ctx.arc(cx, vy, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const ang = Math.PI + (Math.min(1, s.V / Math.max(1, s.Vb * 2 || 24))) * Math.PI;
  ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, vy + 8); ctx.lineTo(cx + 24 * Math.cos(ang), vy + 8 + 24 * Math.sin(ang)); ctx.stroke();
  ctx.fillStyle = "#10b981"; ctx.font = "bold 11px Vazirmatn"; ctx.textAlign = "center"; ctx.fillText(`${s.V.toFixed(2)} V`, cx, vy + 22);
  ctx.fillText("V", cx, vy - 14);
}
