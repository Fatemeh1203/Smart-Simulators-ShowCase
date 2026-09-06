import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { type LabObject, type Outcome, OUTCOME_INFO, classify, density, sizeOf, fmt, PX_PER_CM } from "../data";
import { useLab } from "../store";
import { ObjectView } from "./ObjectView";

export const TANK_W = 460;
export const TANK_H = 470;
const BASE_WATER = 310; // ارتفاع اولیه آب (پیکسل)
const AREA = 400; // سطح مقطع مخزن (سانتی‌متر مربع)
const G = 520;

export interface Body {
  uid: number;
  obj: LabObject;
  x: number;
  y: number;
  vy: number;
  w: number;
  h: number;
  f: number; // کسر غوطه‌ور
  phase: "pending" | "falling" | "held" | "done";
  guess: Outcome | null;
  result?: Outcome;
  t: number;
  logged: boolean;
}

export interface TankHandle {
  drop: (obj: LabObject, x?: number, opts?: { skipGuess?: boolean }) => void;
  dropAtClient: (obj: LabObject, clientX: number, clientY: number, opts?: { skipGuess?: boolean }) => boolean;
  clear: () => void;
}

interface Props {
  onResult?: (b: Body) => void;
  compact?: boolean;
}

let UID = 1;

export const Tank = forwardRef<TankHandle, Props>(function Tank({ onResult }, ref) {
  const { showForces, guessMode, dispatch, award, toast, state } = useLab();
  const bodiesRef = useRef<Body[]>([]);
  const [bodies, setBodies] = useState<Body[]>([]);
  const [waterTop, setWaterTop] = useState(TANK_H - BASE_WATER);
  const [banner, setBanner] = useState<{ text: string; sub?: string; outcome: Outcome } | null>(null);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tankRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef(state.results);
  resultsRef.current = state.results;
  const heldRef = useRef<{ uid: number; dx: number; dy: number } | null>(null);
  const bannerTimer = useRef<number | null>(null);

  // مقیاس واکنش‌گرا
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const calc = () => {
      if (el.clientWidth > 0) setScale(Math.min(1, el.clientWidth / TANK_W));
    };
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    calc();
    return () => ro.disconnect();
  }, []);

  const pending = bodies.find((b) => b.phase === "pending");

  const finish = useCallback(
    (b: Body) => {
      const rho = density(b.obj);
      const res = classify(rho);
      b.result = res;
      b.phase = "done";
      if (b.logged) return;
      b.logged = true;
      const info = OUTCOME_INFO[res];
      const firstTime = !resultsRef.current.some((r) => r.name === b.obj.name);
      dispatch({
        type: "result",
        obj: b.obj,
        row: { id: Date.now() + Math.random(), name: b.obj.name, emoji: b.obj.emoji, guess: b.guess, actual: res, density: rho, volume: b.obj.volume, mass: b.obj.mass, time: Date.now() },
      });
      dispatch({ type: "note", auto: true, text: `${b.obj.emoji} ${b.obj.name} ${info.label}. (چگالی: ${fmt(rho, 2)})` });
      let sub = info.explain;
      if (b.guess) {
        if (b.guess === res) {
          award(1, "دانشمند کوچولو، این یکی را درست پیش‌بینی کردی!");
        } else {
          sub = `اشکالی ندارد! تو حدس زدی «${OUTCOME_INFO[b.guess].label}» ولی جسم ${info.label}. ${info.explain}`;
          toast("حدس اشتباه هم بخشی از علم است! دوباره امتحان کن.", 0, "info");
        }
      }
      if (firstTime) setTimeout(() => award(1, "آزمایش با موفقیت انجام شد!"), 900);
      setBanner({ text: `${b.obj.emoji} ${b.obj.name} ${info.label}!`, sub, outcome: res });
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
      bannerTimer.current = window.setTimeout(() => setBanner(null), 7000);
      onResult?.(b);
    },
    [dispatch, award, toast, onResult]
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;

  // حلقه فیزیک
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const list = bodiesRef.current;
      const sumV = list.reduce((s, b) => s + b.f * b.obj.volume, 0);
      const wt = TANK_H - BASE_WATER - (sumV / AREA) * PX_PER_CM;
      const bottom = TANK_H - 6;
      for (const b of list) {
        if (b.phase === "pending" || b.phase === "held") {
          b.f = Math.max(0, Math.min(1, (b.y + b.h / 2 - wt) / b.h));
          continue;
        }
        const f = Math.max(0, Math.min(1, (b.y + b.h / 2 - wt) / b.h));
        b.f = f;
        const rho = density(b.obj);
        const neutral = Math.abs(rho - 1) <= 0.03;
        let a: number;
        if (neutral && f >= 0.999) {
          const target = wt + (bottom - wt) * 0.5;
          a = (target - b.y) * 3 - b.vy * 3;
        } else {
          const drag = f > 0 ? 2.4 + (f > 0.99 ? 1.5 : 0) : 0.15;
          a = G * (1 - f / rho) - drag * b.vy;
        }
        b.vy += a * dt;
        b.y += b.vy * dt;
        if (b.y + b.h / 2 >= bottom) {
          b.y = bottom - b.h / 2;
          b.vy = Math.abs(b.vy) > 40 ? -b.vy * 0.15 : 0;
        }
        b.t += dt;
        if (b.phase === "falling" && ((b.t > 1.6 && Math.abs(b.vy) < 6) || b.t > 5)) finishRef.current(b);
      }
      setWaterTop((w) => w + (wt - w) * 0.25);
      setBodies([...list]);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dropObj = useCallback(
    (obj: LabObject, x?: number, opts?: { skipGuess?: boolean }) => {
      const { w, h } = sizeOf(obj);
      const cx = Math.max(w / 2 + 6, Math.min(TANK_W - w / 2 - 6, x ?? TANK_W / 2 + (Math.random() - 0.5) * 200));
      const skip = opts?.skipGuess || !guessMode;
      const b: Body = { uid: UID++, obj, x: cx, y: 40 + h / 2, vy: 0, w, h, f: 0, phase: skip ? "falling" : "pending", guess: null, t: 0, logged: false };
      bodiesRef.current = [...bodiesRef.current, b];
      setBanner(null);
    },
    [guessMode]
  );

  useImperativeHandle(
    ref,
    () => ({
      drop: dropObj,
      dropAtClient: (obj, clientX, clientY, opts) => {
        const el = tankRef.current;
        if (!el) return false;
        const r = el.getBoundingClientRect();
        if (clientX < r.left - 30 || clientX > r.right + 30 || clientY < r.top - 60 || clientY > r.bottom + 30) return false;
        dropObj(obj, (clientX - r.left) / scale, opts);
        return true;
      },
      clear: () => {
        bodiesRef.current = [];
        setBanner(null);
      },
    }),
    [dropObj, scale]
  );

  const chooseGuess = (g: Outcome) => {
    const b = bodiesRef.current.find((x) => x.phase === "pending");
    if (!b) return;
    b.guess = g;
    b.phase = "falling";
    b.t = 0;
  };

  const remove = (uid: number) => {
    bodiesRef.current = bodiesRef.current.filter((b) => b.uid !== uid);
  };

  // جابه‌جایی جسم داخل مخزن
  const onBodyDown = (e: React.PointerEvent, b: Body) => {
    if (b.phase === "pending") return;
    e.stopPropagation();
    const rect = tankRef.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / scale;
    const py = (e.clientY - rect.top) / scale;
    heldRef.current = { uid: b.uid, dx: px - b.x, dy: py - b.y };
    b.phase = "held";
    b.vy = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const hd = heldRef.current;
    if (!hd) return;
    const b = bodiesRef.current.find((x) => x.uid === hd.uid);
    if (!b) return;
    const rect = tankRef.current!.getBoundingClientRect();
    b.x = Math.max(b.w / 2, Math.min(TANK_W - b.w / 2, (e.clientX - rect.left) / scale - hd.dx));
    b.y = Math.max(b.h / 2, Math.min(TANK_H - 6 - b.h / 2, (e.clientY - rect.top) / scale - hd.dy));
  };
  const onUp = (e: React.PointerEvent) => {
    const hd = heldRef.current;
    if (!hd) return;
    heldRef.current = null;
    const b = bodiesRef.current.find((x) => x.uid === hd.uid);
    if (!b) return;
    const rect = tankRef.current!.getBoundingClientRect();
    const outside = e.clientX < rect.left - 20 || e.clientX > rect.right + 20 || e.clientY < rect.top - 40 || e.clientY > rect.bottom + 20;
    if (outside) remove(b.uid);
    else {
      // اگر قبلاً نتیجه ثبت شده، فقط حرکت طبیعی ادامه می‌یابد و دوباره ثبت نمی‌شود
      b.phase = b.logged ? "done" : "falling";
      b.t = 0;
    }
  };

  const sumV = bodies.reduce((s, b) => s + b.f * b.obj.volume, 0);
  const rise = sumV / AREA; // سانتی‌متر

  return (
    <div ref={wrapRef} className="w-full select-none flex justify-center overflow-hidden" style={{ height: TANK_H * scale + 16 }}>
      <div style={{ width: TANK_W, height: TANK_H, transform: `scale(${scale})`, transformOrigin: "top center", flexShrink: 0 }} className="relative">
        {/* بدنه مخزن */}
        <div
          ref={tankRef}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="absolute inset-0 rounded-b-[36px] rounded-t-xl overflow-hidden no-select"
          style={{
            background: "linear-gradient(180deg,#f0f9ff 0%,#e0f2fe 100%)",
            border: "6px solid rgba(148,197,235,0.9)",
            borderTop: "none",
            boxShadow: "inset 0 0 40px rgba(56,189,248,0.15), 0 20px 40px rgba(14,116,144,0.15)",
          }}
        >
          {/* خط‌کش */}
          <div className="absolute right-1 top-0 bottom-0 w-8 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => {
              const y = TANK_H - 6 - i * 50;
              return (
                <div key={i} className="absolute right-0 flex items-center gap-1" style={{ top: y - 1 }}>
                  <span className="text-[10px] text-sky-800/70 font-bold">{fmt(i * 5, 0)}</span>
                  <div className="w-3 h-0.5 bg-sky-800/40" />
                </div>
              );
            })}
          </div>

          {/* آب */}
          <div
            className="absolute left-0 right-0 bottom-0 transition-none"
            style={{
              top: waterTop,
              background: "linear-gradient(180deg,rgba(56,189,248,0.55) 0%,rgba(14,165,233,0.7) 60%,rgba(3,105,161,0.85) 100%)",
            }}
          >
            <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden">
              <svg className="wave-anim absolute top-0 h-6" style={{ width: TANK_W * 2 }} viewBox={`0 0 ${TANK_W * 2} 24`} preserveAspectRatio="none">
                <path d={wavePath(TANK_W * 2, 24, 60, 5)} fill="rgba(125,211,252,0.9)" />
              </svg>
              <svg className="wave-anim-slow absolute top-1 h-6" style={{ width: TANK_W * 2 }} viewBox={`0 0 ${TANK_W * 2} 24`} preserveAspectRatio="none">
                <path d={wavePath(TANK_W * 2, 24, 90, 4)} fill="rgba(56,189,248,0.7)" />
              </svg>
            </div>
            {/* حباب‌ها */}
            {[40, 120, 250, 380].map((x, i) => (
              <div key={i} className="bubble absolute bottom-4 w-2 h-2 rounded-full bg-white/60" style={{ left: x, animationDelay: `${i * 1.1}s` }} />
            ))}
          </div>

          {/* برچسب سطح آب */}
          <div className="absolute left-2 pointer-events-none text-[11px] font-bold text-sky-900 bg-white/80 rounded-lg px-2 py-0.5 shadow" style={{ top: waterTop - 26 }}>
            {rise > 0.05 ? `💧 آب ${fmt(rise, 1)} سانتی‌متر بالا آمد (${fmt(Math.round(sumV), 0)} سی‌سی جابه‌جا شد)` : "سطح آب"}
          </div>

          {/* اجسام */}
          {bodies.map((b) => (
            <div
              key={b.uid}
              className={`absolute cursor-grab active:cursor-grabbing ${b.phase === "pending" ? "wobble" : ""}`}
              style={{ left: b.x - b.w / 2, top: b.y - b.h / 2, width: b.w, height: b.h, opacity: b.f > 0 ? 0.92 : 1 }}
              onPointerDown={(e) => onBodyDown(e, b)}
            >
              <ObjectView obj={b.obj} />
              {b.phase === "done" && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => remove(b.uid)}
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white text-rose-500 text-xs font-black shadow border border-rose-200"
                  title="برداشتن"
                >
                  ✕
                </button>
              )}
              {b.result && (
                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full border ${OUTCOME_INFO[b.result].color}`}>
                  {OUTCOME_INFO[b.result].emoji} چگالی {fmt(density(b.obj), 2)}
                </div>
              )}
            </div>
          ))}

          {/* نیروها */}
          {showForces && (
            <svg className="absolute inset-0 pointer-events-none" width={TANK_W} height={TANK_H}>
              <defs>
                <marker id="arrUp" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,8 L4,0 L8,8 Z" fill="#16a34a" />
                </marker>
                <marker id="arrDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,8 L4,0 L8,8 Z" fill="#dc2626" />
                </marker>
              </defs>
              {bodies
                .filter((b) => b.phase !== "pending")
                .map((b) => {
                  const Fb = b.f * b.obj.volume;
                  const Fg = b.obj.mass;
                  const k = 90 / Math.max(Fb, Fg, 1);
                  const Lb = Fb * k;
                  const Lg = Fg * k;
                  return (
                    <g key={b.uid}>
                      {Lb > 2 && (
                        <>
                          <line x1={b.x - 10} y1={b.y} x2={b.x - 10} y2={b.y - Lb} stroke="#16a34a" strokeWidth="5" markerEnd="url(#arrUp)" />
                          <text x={b.x - 16} y={b.y - Lb - 6} fontSize="11" fontWeight="bold" fill="#166534" textAnchor="end">
                            ⬆ نیروی شناوری
                          </text>
                        </>
                      )}
                      <line x1={b.x + 10} y1={b.y} x2={b.x + 10} y2={b.y + Lg} stroke="#dc2626" strokeWidth="5" markerEnd="url(#arrDown)" />
                      <text x={b.x + 16} y={b.y + Lg + 14} fontSize="11" fontWeight="bold" fill="#991b1b" textAnchor="start">
                        ⬇ گرانش (وزن)
                      </text>
                    </g>
                  );
                })}
            </svg>
          )}

          {/* حدس بزن */}
          {pending && (
            <div className="absolute inset-x-4 top-24 bg-white/95 rounded-3xl shadow-2xl p-4 pop-in border-2 border-amber-200 z-10">
              <div className="text-center font-black text-sky-900 text-lg mb-1">🤔 فکر می‌کنی چه اتفاقی می‌افتد؟</div>
              <div className="text-center text-sm text-slate-600 mb-3">
                {pending.obj.emoji} {pending.obj.name} — جرم {fmt(pending.obj.mass, 0)} گرم، حجم {fmt(pending.obj.volume, 0)} سی‌سی
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["float", "suspend", "sink"] as Outcome[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => chooseGuess(o)}
                    className={`rounded-2xl border-2 p-2 font-bold text-sm hover:scale-105 active:scale-95 transition ${OUTCOME_INFO[o].color}`}
                  >
                    <div className="text-2xl">{OUTCOME_INFO[o].emoji}</div>
                    {OUTCOME_INFO[o].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* پیام نتیجه */}
          {banner && !pending && (
            <div className={`absolute bottom-3 inset-x-3 rounded-2xl border-2 p-3 pop-in shadow-lg z-10 ${OUTCOME_INFO[banner.outcome].color} bg-opacity-95`} style={{ background: "rgba(255,255,255,0.95)" }}>
              <div className="font-black text-base flex items-center justify-between">
                <span>{banner.text}</span>
                <button onClick={() => setBanner(null)} className="text-slate-400 text-sm">✕</button>
              </div>
              {banner.sub && <div className="text-sm mt-1 text-slate-700 leading-6">{banner.sub}</div>}
            </div>
          )}

          {bodies.length === 0 && (
            <div className="absolute inset-x-0 top-10 text-center text-sky-700/70 font-bold text-base pointer-events-none">
              یک جسم را بگیر و اینجا بینداز 👇
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function wavePath(w: number, h: number, len: number, amp: number) {
  let d = `M0 ${h / 2}`;
  for (let x = 0; x <= w; x += len) {
    d += ` q ${len / 4} ${-amp * 2} ${len / 2} 0 t ${len / 2} 0`;
  }
  d += ` L${w} ${h} L0 ${h} Z`;
  return d;
}
