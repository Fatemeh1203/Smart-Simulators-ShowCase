import { useEffect, useRef, useState } from "react";
import { fa } from "../data/planets";
import { cn } from "../utils/cn";

const CONTINENTS = [
  { lon: 0.2, lat: 0.35, w: 0.42, h: 0.28 },
  { lon: 1.4, lat: -0.25, w: 0.3, h: 0.35 },
  { lon: 2.6, lat: 0.2, w: 0.5, h: 0.3 },
  { lon: 3.9, lat: -0.4, w: 0.35, h: 0.22 },
  { lon: 5.0, lat: 0.45, w: 0.38, h: 0.24 },
  { lon: 5.9, lat: -0.05, w: 0.25, h: 0.3 },
];

export default function DayNightView({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [info, setInfo] = useState({ isDay: true, hour: 12, turns: 0 });
  const stateRef = useRef({ rot: 0, playing: true, speed: 1, turns: 0, completed: false });
  stateRef.current.playing = playing;
  stateRef.current.speed = speed;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    let raf = 0;
    let last = performance.now();
    let lastInfo = 0;

    const draw = (now: number) => {
      const st = stateRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (st.playing) st.rot += dt * 0.5 * st.speed;
      const turns = Math.floor(st.rot / (Math.PI * 2));
      if (turns !== st.turns) st.turns = turns;
      if (turns >= 1 && !st.completed) {
        st.completed = true;
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

      const R = Math.min(w, h) * 0.28;
      const ex = w * 0.6, ey = h * 0.5;
      const sx = w * 0.12, sy = h * 0.5;
      const t = now / 1000;

      // خورشید
      const SR = Math.min(w, h) * 0.11;
      const glow = ctx.createRadialGradient(sx, sy, SR * 0.5, sx, sy, SR * 3);
      glow.addColorStop(0, "rgba(255,200,60,0.5)");
      glow.addColorStop(1, "rgba(255,120,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.2);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        ctx.strokeStyle = "rgba(255,220,120,0.6)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * SR * 1.2, Math.sin(a) * SR * 1.2);
        ctx.lineTo(Math.cos(a) * SR * (1.6 + 0.15 * Math.sin(t * 3 + i)), Math.sin(a) * SR * (1.6 + 0.15 * Math.sin(t * 3 + i)));
        ctx.stroke();
      }
      ctx.restore();
      const sg = ctx.createRadialGradient(sx - SR * 0.3, sy - SR * 0.3, SR * 0.1, sx, sy, SR);
      sg.addColorStop(0, "#fff7c2");
      sg.addColorStop(0.6, "#ffd23f");
      sg.addColorStop(1, "#ff8c1a");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, sy, SR, 0, Math.PI * 2);
      ctx.fill();

      // پرتوهای نور به سمت زمین
      for (let i = -3; i <= 3; i++) {
        const yy = ey + i * R * 0.28;
        const grad = ctx.createLinearGradient(sx + SR, 0, ex - R, 0);
        grad.addColorStop(0, "rgba(255,230,120,0.35)");
        grad.addColorStop(1, "rgba(255,230,120,0.05)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 10]);
        ctx.lineDashOffset = -t * 40;
        ctx.beginPath();
        ctx.moveTo(sx + SR + 10, yy);
        ctx.lineTo(ex - R - 6, yy);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // زمین
      const og = ctx.createRadialGradient(ex - R * 0.4, ey - R * 0.4, R * 0.1, ex, ey, R);
      og.addColorStop(0, "#7dd3fc");
      og.addColorStop(0.6, "#2563eb");
      og.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(ex, ey, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, R, 0, Math.PI * 2);
      ctx.clip();
      // قاره‌ها
      for (const c of CONTINENTS) {
        const lam = c.lon + st.rot;
        const vis = Math.cos(lam);
        if (vis <= 0.02) continue;
        const x = ex + Math.sin(lam) * R * Math.cos(c.lat);
        const y = ey - Math.sin(c.lat) * R;
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(x, y, c.w * R * vis, c.h * R, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // ابرها
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 5; i++) {
        const lam = i * 1.3 + st.rot * 1.1;
        const vis = Math.cos(lam);
        if (vis <= 0) continue;
        ctx.beginPath();
        ctx.ellipse(ex + Math.sin(lam) * R * 0.8, ey + Math.sin(i * 2) * R * 0.5, R * 0.3 * vis, R * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // نشانگر «ما اینجاییم»
      const mlam = 0.9 + st.rot; // طول جغرافیایی خانه
      const mlat = 0.55;
      const mvis = Math.cos(mlam);
      const mx = ex + Math.sin(mlam) * R * Math.cos(mlat);
      const my = ey - Math.sin(mlat) * R;
      // سایه‌ی شب (سمت دور از خورشید = راست)
      const ng = ctx.createLinearGradient(ex - R * 0.15, 0, ex + R * 0.25, 0);
      ng.addColorStop(0, "rgba(2,6,23,0)");
      ng.addColorStop(1, "rgba(2,6,23,0.88)");
      ctx.fillStyle = ng;
      ctx.fillRect(ex - R, ey - R, R * 2, R * 2);
      // چراغ‌های شهر در شب
      if (mvis > 0 && Math.sin(mlam) > 0.1) {
        ctx.fillStyle = "rgba(255,230,120,0.9)";
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(mx + (i % 3) * 5 - 5, my + Math.floor(i / 3) * 5 - 2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // نشانگر روی سطح
      const isDay = Math.sin(mlam) < 0; // سمت چپ (رو به خورشید) روز است
      if (mvis > -0.05) {
        ctx.font = `${Math.max(18, R * 0.16)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("📍", mx, my + 4);
        ctx.font = `bold ${Math.max(12, R * 0.09)}px Vazirmatn, sans-serif`;
        ctx.textBaseline = "top";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        const label = isDay ? "☀️ اینجا روز است" : "🌙 اینجا شب است";
        ctx.strokeText(label, mx, my + 6);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, mx, my + 6);
      }
      // محور چرخش
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex, ey - R - 24);
      ctx.lineTo(ex, ey + R + 24);
      ctx.stroke();
      ctx.setLineDash([]);
      // فلش چرخش
      ctx.font = `${Math.max(22, R * 0.2)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔄", ex, ey - R - 40);
      ctx.font = `bold 14px Vazirmatn, sans-serif`;
      ctx.fillStyle = "#e0e7ff";
      ctx.fillText("زمین به دور خودش می‌چرخد", ex, ey + R + 44);
      ctx.fillStyle = "#fde68a";
      ctx.fillText("☀️ سمت رو به خورشید: روز", ex - R * 0.55, ey - R - 70);
      ctx.fillStyle = "#c7d2fe";
      ctx.fillText("🌙 سمت پشت به خورشید: شب", ex + R * 0.55, ey - R - 70);

      if (now - lastInfo > 150) {
        lastInfo = now;
        // ساعت تقریبی: ظهر وقتی نشانگر دقیقاً رو به خورشید است (sin = -1)
        const phase = ((mlam + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const hour = Math.floor(((phase / (Math.PI * 2)) * 24 + 12) % 24);
        setInfo({ isDay, hour, turns: st.turns });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={wrapRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="block absolute inset-0" />
        <div className={cn("absolute top-3 left-3 rounded-2xl px-4 py-2 font-black text-lg glass", info.isDay ? "text-yellow-200" : "text-indigo-200")}>
          {info.isDay ? "☀️ روز" : "🌙 شب"} — ساعت تقریبی {fa(info.hour)}
        </div>
        <div className="absolute top-3 right-3 glass rounded-2xl px-4 py-2 font-bold">🔄 تعداد شبانه‌روز: {fa(info.turns)}</div>
      </div>
      <div className="glass rounded-3xl mx-3 mb-3 p-3 flex flex-wrap items-center gap-3 justify-center">
        <button onClick={() => setPlaying((p) => !p)} className={cn("big-btn min-w-[120px]", playing ? "bg-amber-400 text-amber-950" : "bg-green-500 text-white")}>
          {playing ? "⏸ توقف" : "▶️ چرخش"}
        </button>
        <label className="flex items-center gap-2 text-sm font-bold">
          🐢 <input type="range" min={0.2} max={4} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /> 🐇 سرعت چرخش
        </label>
        <button onClick={() => (stateRef.current.rot += 0.35)} className="big-btn bg-white/10 hover:bg-white/20 text-base">
          ⏭ کمی بچرخان
        </button>
        <div className="text-sm bg-indigo-500/20 rounded-2xl px-3 py-2 leading-6 max-w-md">
          💡 «چرخش زمین به دور خودش باعث به وجود آمدن شب و روز می‌شود.» نیمه‌ای که رو به خورشید است روز و نیمه‌ی دیگر شب است. یک دور کامل = یک شبانه‌روز = ۲۴ ساعت.
        </div>
      </div>
    </div>
  );
}
