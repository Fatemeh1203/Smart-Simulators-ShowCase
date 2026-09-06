import { useEffect, useMemo, useRef, useState } from "react";
import { BALL_COLORS, fmtPct, toFa } from "../lib/probability";

interface Props {
  bag: number[];
  onChange: (bag: number[]) => void;
  outcome: number | null;
  animTick: number;
  batchTick: number;
  disabled?: boolean;
}

const MAX_PER_COLOR = 20;

export default function BagVisual({ bag, onChange, outcome, animTick, batchTick, disabled }: Props) {
  const total = bag.reduce((a, b) => a + b, 0);
  const [shaking, setShaking] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const lastAnim = useRef(animTick);
  const lastBatch = useRef(batchTick);

  useEffect(() => {
    if (animTick === lastAnim.current) return;
    lastAnim.current = animTick;
    lastBatch.current = batchTick;
    setShaking(true);
    const t = window.setTimeout(() => {
      setShaking(false);
      setPopKey((k) => k + 1);
    }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animTick]);

  useEffect(() => {
    if (batchTick === lastBatch.current) return;
    lastBatch.current = batchTick;
    setPopKey((k) => k + 1);
  }, [batchTick]);

  // Deterministic pseudo-random layout of balls inside the bag
  const { balls, ballSize } = useMemo(() => {
    const cols = total <= 24 ? 6 : total <= 48 ? 8 : 10;
    const size = total <= 24 ? 26 : total <= 48 ? 20 : 16;
    const list: { color: number; x: number; y: number }[] = [];
    let idx = 0;
    bag.forEach((count, color) => {
      for (let i = 0; i < count; i++) {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const jitter = ((idx * 37) % 11) - 5;
        list.push({ color, x: 9 + col * (76 / cols) + jitter * 0.3, y: 84 - row * (size / 2.4) + jitter * 0.25 });
        idx++;
      }
    });
    return { balls: list, ballSize: size };
  }, [bag, total]);

  const change = (i: number, d: number) => {
    const next = [...bag];
    next[i] = Math.max(0, Math.min(MAX_PER_COLOR, next[i] + d));
    if (next.reduce((a, b) => a + b, 0) === 0) return; // keep at least one ball
    onChange(next);
  };

  const picked = outcome !== null && outcome >= 0 ? BALL_COLORS[outcome] : null;

  return (
    <div className="flex w-full flex-col items-center gap-5 md:flex-row md:items-start md:justify-center md:gap-10">
      {/* Bag */}
      <div className="flex flex-col items-center">
        <div className="h-16 flex items-end justify-center">
          {picked && !shaking && (
            <div key={popKey} className="ball-pop flex flex-col items-center">
              <div className="h-12 w-12 rounded-full shadow-lg" style={{ background: picked.bg }} />
            </div>
          )}
        </div>
        <div className={`relative ${shaking ? "shake" : ""}`} style={{ width: 230, height: 250 }}>
          <svg viewBox="0 0 100 110" className="absolute inset-0 h-full w-full drop-shadow-xl">
            <defs>
              <linearGradient id="bagGlass" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d="M30 6 Q50 0 70 6 L78 22 Q98 45 96 80 Q94 108 50 108 Q6 108 4 80 Q2 45 22 22 Z"
              fill="url(#bagGlass)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <path d="M32 8 Q50 3 68 8" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 40 Q10 60 14 85" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
          </svg>
          {balls.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-full shadow-md transition-all duration-300"
              style={{
                width: ballSize,
                height: ballSize,
                left: `${b.x}%`,
                top: `${b.y}%`,
                background: BALL_COLORS[b.color].bg,
              }}
            />
          ))}
          {total === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-400">کیسه خالی است</div>}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          مجموع: <b className="text-slate-800">{toFa(total)}</b> توپ
        </div>
        <div className="h-7 text-lg font-bold text-slate-700">
          {picked && !shaking ? (
            <span key={popKey} className="pop-in inline-block">
              نتیجه: <span style={{ color: picked.color }}>توپ {picked.label}</span>
            </span>
          ) : outcome === null ? (
            <span className="text-slate-400">آماده‌ی انتخاب…</span>
          ) : (
            <span className="text-slate-400">در حال انتخاب…</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-xs space-y-3">
        <div className="text-sm font-semibold text-slate-500">ترکیب کیسه (Sample Space)</div>
        {BALL_COLORS.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full" style={{ background: c.bg }} />
              <span className="font-bold text-slate-700">{c.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => change(c.id, -1)}
                disabled={disabled || bag[c.id] <= 0}
                className="h-8 w-8 rounded-lg bg-slate-100 text-lg font-black text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                aria-label={`کم کردن ${c.label}`}
              >
                −
              </button>
              <span className="num w-8 text-center text-lg font-black text-slate-800">{toFa(bag[c.id])}</span>
              <button
                onClick={() => change(c.id, +1)}
                disabled={disabled || bag[c.id] >= MAX_PER_COLOR}
                className="h-8 w-8 rounded-lg bg-slate-100 text-lg font-black text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                aria-label={`اضافه کردن ${c.label}`}
              >
                +
              </button>
            </div>
            <span className="num w-16 text-left text-sm font-bold" style={{ color: c.color }}>
              {total ? fmtPct(bag[c.id] / total, 1) : "—"}
            </span>
          </div>
        ))}
        {disabled ? (
          <div className="text-xs text-amber-600">در حین اجرا نمی‌توان ترکیب کیسه را تغییر داد.</div>
        ) : (
          <div className="text-xs text-slate-400">با تغییر ترکیب، احتمال نظری فوراً محاسبه و نتایج قبلی پاک می‌شود.</div>
        )}
      </div>
    </div>
  );
}
