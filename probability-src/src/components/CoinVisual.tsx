import { useEffect, useRef, useState } from "react";
import { COIN_OUTCOMES } from "../lib/probability";

interface Props {
  outcome: number | null; // 0 heads, 1 tails
  animTick: number; // changes → play full toss animation
  batchTick: number; // changes → quick face update
  size?: number;
}

export default function CoinVisual({ outcome, animTick, batchTick, size = 170 }: Props) {
  const [rot, setRot] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [vars, setVars] = useState<{ from: number; to: number }>({ from: 0, to: 0 });
  const lastAnim = useRef(animTick);
  const lastBatch = useRef(batchTick);
  const rotRef = useRef(0);

  // Full toss animation (single trials)
  useEffect(() => {
    if (animTick === lastAnim.current || outcome === null) return;
    lastAnim.current = animTick;
    lastBatch.current = batchTick;
    const from = rotRef.current;
    const base = from - (from % 360);
    const to = base + 1440 + (outcome === 1 ? 180 : 0);
    setVars({ from, to });
    setFlipping(true);
    const t = window.setTimeout(() => {
      rotRef.current = to;
      setRot(to);
      setFlipping(false);
    }, 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animTick]);

  // Quick face update (batch runs)
  useEffect(() => {
    if (batchTick === lastBatch.current || outcome === null || flipping) return;
    lastBatch.current = batchTick;
    const from = rotRef.current;
    const base = from - (from % 360);
    const to = base + 360 + (outcome === 1 ? 180 : 0);
    rotRef.current = to;
    setRot(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchTick]);

  useEffect(() => {
    if (outcome === null) {
      rotRef.current = 0;
      setRot(0);
    }
  }, [outcome]);

  const faceStyle = (grad: string, ring: string) => ({
    background: grad,
    boxShadow: `inset 0 0 0 ${size * 0.05}px ${ring}, inset 0 0 ${size * 0.18}px rgba(0,0,0,.25), 0 10px 30px rgba(0,0,0,.25)`,
  });

  return (
    <div className="coin-scene flex flex-col items-center gap-3 select-none">
      <div
        className={`coin ${flipping ? "flipping" : ""}`}
        style={
          {
            width: size,
            height: size,
            transform: flipping ? undefined : `rotateY(${rot}deg)`,
            transition: flipping ? "none" : "transform .35s ease",
            "--from": `${vars.from}deg`,
            "--to": `${vars.to}deg`,
          } as React.CSSProperties
        }
      >
        {/* Heads */}
        <div className="coin-face" style={faceStyle("radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 55%, #b45309)", "#fbbf24")}>
          <div className="flex flex-col items-center text-amber-950">
            <span style={{ fontSize: size * 0.42, lineHeight: 1 }}>🦁</span>
            <span className="font-black" style={{ fontSize: size * 0.14 }}>
              شیر
            </span>
          </div>
        </div>
        {/* Tails */}
        <div className="coin-face back" style={faceStyle("radial-gradient(circle at 35% 30%, #c7d2fe, #6366f1 55%, #3730a3)", "#818cf8")}>
          <div className="flex flex-col items-center text-indigo-950">
            <span className="font-black" style={{ fontSize: size * 0.3, lineHeight: 1 }}>
              ۱
            </span>
            <span className="font-black" style={{ fontSize: size * 0.14 }}>
              خط
            </span>
          </div>
        </div>
      </div>
      <div className="h-8 text-lg font-bold text-slate-700">
        {outcome === null ? (
          <span className="text-slate-400">آماده‌ی پرتاب…</span>
        ) : flipping ? (
          <span className="text-slate-400">در حال پرتاب…</span>
        ) : (
          <span className="pop-in inline-block" key={`${outcome}-${batchTick}`}>
            نتیجه: <span style={{ color: COIN_OUTCOMES[outcome].color }}>{COIN_OUTCOMES[outcome].label}</span>
          </span>
        )}
      </div>
    </div>
  );
}
