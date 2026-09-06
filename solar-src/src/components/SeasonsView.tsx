import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

const TILT = (23.5 * Math.PI) / 180;
const SEASONS = [
  { id: 0, name: "پاییز", emoji: "🍂", color: "#f97316", angle: 0 },
  { id: 1, name: "زمستان", emoji: "❄️", color: "#93c5fd", angle: Math.PI / 2 },
  { id: 2, name: "بهار", emoji: "🌱", color: "#4ade80", angle: Math.PI },
  { id: 3, name: "تابستان", emoji: "☀️", color: "#facc15", angle: (Math.PI * 3) / 2 },
];

function seasonOf(theta: number) {
  const d = (((theta + Math.PI / 4) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(d / (Math.PI / 2)) % 4;
}

export default function SeasonsView({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [season, setSeason] = useState(3);
  const [visited, setVisited] = useState<number[]>([]);
  const st = useRef({ theta: (Math.PI * 3) / 2, playing: true, speed: 1, visited: new Set<number>(), completed: false });
  st.current.playing = playing;
  st.current.speed = speed;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    let raf = 0;
    let last = performance.now();
    let lastInfo = 0;

    const draw = (now: number) => {
      const s = st.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (s.playing) s.theta += dt * 0.35 * s.speed;
      const theta = s.theta;
      const sIdx = seasonOf(theta);
      if (!s.visited.has(sIdx)) {
        s.visited.add(sIdx);
      }
      if (s.visited.size === 4 && !s.completed) {
        s.completed = true;
        onComplete();
      }

      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== rect.width * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
      }
      const ctx = canvas.getContext("2d")!;
      const w = rect.width, h = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;

      // ---------- نمای مدار (چپ/میانه) ----------
      const wide = w > h * 1.1;
      const ox = wide ? w * 0.36 : w * 0.5;
      const oy = wide ? h * 0.5 : h * 0.33;
      const Rx = Math.min(wide ? w * 0.28 : w * 0.4, h * 0.36);
      const Ry = Rx * 0.42;

      // مدار
      ctx.strokeStyle = "rgba(147,197,253,0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.ellipse(ox, oy, Rx, Ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // برچسب فصل‌ها روی مدار
      ctx.font = "bold 15px Vazirmatn, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const se of SEASONS) {
        const px = ox + Math.cos(se.angle) * (Rx + 46);
        const py = oy - Math.sin(se.angle) * (Ry + 34);
        ctx.fillStyle = se.id === sIdx ? "#fff" : "rgba(255,255,255,0.55)";
        ctx.fillText(`${se.emoji} ${se.name}`, px, py);
      }

      // خورشید
      const SR = Rx * 0.16;
      const glow = ctx.createRadialGradient(ox, oy, SR * 0.5, ox, oy, SR * 3);
      glow.addColorStop(0, "rgba(255,200,60,0.5)");
      glow.addColorStop(1, "rgba(255,120,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ox, oy, SR * 3, 0, Math.PI * 2);
      ctx.fill();
      const sg = ctx.createRadialGradient(ox - SR * 0.3, oy - SR * 0.3, SR * 0.1, ox, oy, SR);
      sg.addColorStop(0, "#fff7c2");
      sg.addColorStop(0.6, "#ffd23f");
      sg.addColorStop(1, "#ff8c1a");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(ox, oy, SR, 0, Math.PI * 2);
      ctx.fill();

      // زمین روی مدار
      const ex = ox + Math.cos(theta) * Rx;
      const ey = oy - Math.sin(theta) * Ry;
      const ER = Rx * 0.075 * (1 + 0.25 * (1 - Math.sin(theta)) * 0.5);
      drawTiltedEarth(ctx, ex, ey, ER, ox, oy, t);

      // ---------- نمای از پهلو (راست/پایین) ----------
      const vx = wide ? w * 0.76 : w * 0.5;
      const vy = wide ? h * 0.5 : h * 0.74;
      const VR = Math.min(wide ? w * 0.11 : w * 0.16, h * 0.14);
      const boxW = VR * 5.2, boxH = VR * 3.6;
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      roundRect(ctx, vx - boxW / 2, vy - boxH / 2, boxW, boxH, 18);
      ctx.fill();
      ctx.stroke();
      ctx.font = "bold 14px Vazirmatn, sans-serif";
      ctx.fillStyle = "#e0e7ff";
      ctx.textAlign = "center";
      ctx.fillText("🔎 نمای نزدیک: نور خورشید چگونه به زمین می‌تابد؟", vx, vy - boxH / 2 + 18);

      // خورشید کوچک در سمت چپ جعبه
      const ssx = vx - boxW / 2 + VR * 0.7, ssy = vy + VR * 0.1;
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(ssx, ssy, VR * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // پرتوها
      const eex = vx + VR * 1.2, eey = vy + VR * 0.1;
      for (let i = -3; i <= 3; i++) {
        const yy = eey + i * VR * 0.3;
        ctx.strokeStyle = "rgba(255,230,120,0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 30;
        ctx.beginPath();
        ctx.moveTo(ssx + VR * 0.45, yy);
        ctx.lineTo(eex - VR - 4, yy);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // زمین از پهلو با محور کج
      const toward = -TILT * Math.sin(theta); // مثبت = قطب شمال به سمت خورشید
      const axN = { x: -Math.sin(toward), y: -Math.cos(toward) };
      const perp = { x: axN.y, y: -axN.x }; // به سمت خورشید (چپ)
      const eg = ctx.createRadialGradient(eex - VR * 0.4, eey - VR * 0.3, VR * 0.1, eex, eey, VR);
      eg.addColorStop(0, "#7dd3fc");
      eg.addColorStop(0.7, "#2563eb");
      eg.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(eex, eey, VR, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(eex, eey, VR, 0, Math.PI * 2);
      ctx.clip();
      // قاره‌ی نمادین
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.ellipse(eex - VR * 0.2, eey - VR * 0.35, VR * 0.4, VR * 0.25, toward, 0, Math.PI * 2);
      ctx.fill();
      // نیمه‌ی شب (سمت راست)
      ctx.fillStyle = "rgba(2,6,23,0.8)";
      ctx.fillRect(eex, eey - VR, VR, VR * 2);
      // خط استوا
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(eex - perp.x * VR, eey - perp.y * VR);
      ctx.lineTo(eex + perp.x * VR, eey + perp.y * VR);
      ctx.stroke();
      ctx.restore();
      // محور
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(eex - axN.x * VR * 1.3, eey - axN.y * VR * 1.3);
      ctx.lineTo(eex + axN.x * VR * 1.3, eey + axN.y * VR * 1.3);
      ctx.stroke();
      ctx.font = "bold 13px Vazirmatn, sans-serif";
      ctx.fillStyle = "#fecaca";
      ctx.fillText("شمال", eex + axN.x * VR * 1.55, eey + axN.y * VR * 1.55);
      ctx.fillText("جنوب", eex - axN.x * VR * 1.55, eey - axN.y * VR * 1.55);
      // نقطه‌ی «ما» در نیمکره‌ی شمالی
      const lat = (35 * Math.PI) / 180;
      const pxp = eex + VR * (Math.sin(lat) * axN.x + Math.cos(lat) * perp.x);
      const pyp = eey + VR * (Math.sin(lat) * axN.y + Math.cos(lat) * perp.y);
      ctx.font = `${VR * 0.35}px serif`;
      ctx.fillText("📍", pxp, pyp - VR * 0.12);
      const northTowards = toward > 0.05;
      const northAway = toward < -0.05;
      ctx.font = "bold 13px Vazirmatn, sans-serif";
      ctx.fillStyle = northTowards ? "#fde68a" : northAway ? "#bfdbfe" : "#e5e7eb";
      ctx.fillText(
        northTowards ? "نیمکره شمالی رو به خورشید → نور مستقیم‌تر → گرم‌تر" : northAway ? "نیمکره شمالی دور از خورشید → نور مایل‌تر → سردتر" : "نور به دو نیمکره تقریباً برابر می‌تابد",
        vx,
        vy + boxH / 2 - 16
      );

      if (now - lastInfo > 150) {
        lastInfo = now;
        setSeason(sIdx);
        setVisited(Array.from(s.visited));
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const se = SEASONS[season];
  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={wrapRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="block absolute inset-0" />
        <div className="absolute top-3 left-3 glass rounded-2xl px-4 py-2 font-black text-xl flex items-center gap-2" style={{ color: se.color }}>
          <span className="text-3xl">{se.emoji}</span> نیمکره‌ی شمالی: {se.name}
        </div>
        <div className="absolute top-3 right-3 glass rounded-2xl px-3 py-2 text-sm font-bold flex gap-1">
          فصل‌های دیده‌شده:
          {SEASONS.map((x) => (
            <span key={x.id} className={visited.includes(x.id) ? "" : "opacity-25 grayscale"}>
              {x.emoji}
            </span>
          ))}
        </div>
      </div>
      <div className="glass rounded-3xl mx-3 mb-3 p-3 flex flex-wrap items-center gap-3 justify-center">
        <button onClick={() => setPlaying((p) => !p)} className={cn("big-btn min-w-[120px]", playing ? "bg-amber-400 text-amber-950" : "bg-green-500 text-white")}>
          {playing ? "⏸ توقف" : "▶️ حرکت"}
        </button>
        <label className="flex items-center gap-2 text-sm font-bold">
          🐢 <input type="range" min={0.2} max={4} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /> 🐇 سرعت
        </label>
        <div className="flex gap-1">
          {SEASONS.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                st.current.theta = x.angle;
              }}
              className={cn("rounded-xl px-3 py-2 font-bold text-sm border", season === x.id ? "bg-white text-slate-900" : "bg-white/10 border-white/10 hover:bg-white/20")}
            >
              {x.emoji} {x.name}
            </button>
          ))}
        </div>
        <div className="text-sm bg-emerald-500/20 rounded-2xl px-3 py-2 leading-6 max-w-lg">
          💡 «زمین هنگام گردش به دور خورشید، محور خود را با یک شیب مشخص حفظ می‌کند و همین موضوع در شکل‌گیری فصل‌ها نقش دارد.» به خط قرمز (محور) نگاه کن: همیشه به یک سمت کج است!
        </div>
      </div>
    </div>
  );
}

function drawTiltedEarth(ctx: CanvasRenderingContext2D, ex: number, ey: number, R: number, sx: number, sy: number, t: number) {
  const g = ctx.createRadialGradient(ex - R * 0.3, ey - R * 0.3, R * 0.1, ex, ey, R);
  g.addColorStop(0, "#7dd3fc");
  g.addColorStop(0.7, "#2563eb");
  g.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ex, ey, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(ex, ey, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#22c55e";
  for (let i = 0; i < 3; i++) {
    const a = t * 0.8 + i * 2.1;
    ctx.beginPath();
    ctx.ellipse(ex + Math.cos(a) * R * 0.6, ey + Math.sin(a * 0.6) * R * 0.4, R * 0.4, R * 0.25, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // سایه به سمت مخالف خورشید
  const ang = Math.atan2(ey - sy, ex - sx);
  const sg = ctx.createLinearGradient(ex - Math.cos(ang) * R * 0.2, ey - Math.sin(ang) * R * 0.2, ex + Math.cos(ang) * R, ey + Math.sin(ang) * R);
  sg.addColorStop(0, "rgba(2,6,23,0)");
  sg.addColorStop(1, "rgba(2,6,23,0.85)");
  ctx.fillStyle = sg;
  ctx.fillRect(ex - R, ey - R, R * 2, R * 2);
  ctx.restore();
  // محور کج (همیشه به یک سمت: بالا-راست)
  const ax = Math.sin(TILT), ay = -Math.cos(TILT);
  ctx.strokeStyle = "#f87171";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ex - ax * R * 1.6, ey - ay * R * 1.6);
  ctx.lineTo(ex + ax * R * 1.6, ey + ay * R * 1.6);
  ctx.stroke();
  ctx.font = "bold 12px Vazirmatn, sans-serif";
  ctx.fillStyle = "#fecaca";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ش", ex + ax * R * 2, ey + ay * R * 2);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
