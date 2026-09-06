import { useEffect, useRef, useState } from "react";
import { toFa } from "../lib/probability";

interface Props {
  outcome: number | null; // 1..6
  animTick: number;
  batchTick: number;
  highlight?: number[]; // event set for coloring result label
  size?: number;
}

// cube rotation (x,y) that brings face n to the front
const FACE_ROT: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  2: [0, -90],
  5: [0, 90],
  3: [-90, 0],
  4: [90, 0],
};

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Face({ n, transform }: { n: number; transform: string }) {
  return (
    <div className="dice-face" style={{ transform }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {PIPS[n].includes(i) && <div className="pip" />}
        </div>
      ))}
    </div>
  );
}

export default function DiceVisual({ outcome, animTick, batchTick, highlight = [], size = 150 }: Props) {
  const [rolling, setRolling] = useState(false);
  const [rot, setRot] = useState<[number, number]>([0, 0]);
  const [vars, setVars] = useState({ fx: 0, fy: 0, tx: 0, ty: 0 });
  const rotRef = useRef<[number, number]>([0, 0]);
  const lastAnim = useRef(animTick);
  const lastBatch = useRef(batchTick);

  const targetFor = (n: number): [number, number] => {
    const [bx, by] = FACE_ROT[n];
    const [cx, cy] = rotRef.current;
    const baseX = cx - (cx % 360);
    const baseY = cy - (cy % 360);
    return [baseX + 720 + bx, baseY + 720 + by];
  };

  useEffect(() => {
    if (animTick === lastAnim.current || outcome === null) return;
    lastAnim.current = animTick;
    lastBatch.current = batchTick;
    const [fx, fy] = rotRef.current;
    const [tx, ty] = targetFor(outcome);
    setVars({ fx, fy, tx, ty });
    setRolling(true);
    const t = window.setTimeout(() => {
      rotRef.current = [tx, ty];
      setRot([tx, ty]);
      setRolling(false);
    }, 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animTick]);

  useEffect(() => {
    if (batchTick === lastBatch.current || outcome === null || rolling) return;
    lastBatch.current = batchTick;
    const [bx, by] = FACE_ROT[outcome];
    const [cx, cy] = rotRef.current;
    const t: [number, number] = [cx - (cx % 360) + 360 + bx, cy - (cy % 360) + 360 + by];
    rotRef.current = t;
    setRot(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchTick]);

  useEffect(() => {
    if (outcome === null) {
      rotRef.current = [0, 0];
      setRot([0, 0]);
    }
  }, [outcome]);

  const h = size / 2;
  const inEvent = outcome !== null && highlight.includes(outcome);

  return (
    <div className="dice-scene flex flex-col items-center gap-4 select-none">
      <div style={{ width: size, height: size, marginTop: 20 }}>
        <div
          className={`dice-cube ${rolling ? "rolling" : ""}`}
          style={
            {
              width: size,
              height: size,
              transform: rolling ? undefined : `rotateX(${rot[0]}deg) rotateY(${rot[1]}deg)`,
              transition: rolling ? "none" : "transform .35s ease",
              "--fx": `${vars.fx}deg`,
              "--fy": `${vars.fy}deg`,
              "--tx": `${vars.tx}deg`,
              "--ty": `${vars.ty}deg`,
            } as React.CSSProperties
          }
        >
          <Face n={1} transform={`translateZ(${h}px)`} />
          <Face n={6} transform={`rotateY(180deg) translateZ(${h}px)`} />
          <Face n={2} transform={`rotateY(90deg) translateZ(${h}px)`} />
          <Face n={5} transform={`rotateY(-90deg) translateZ(${h}px)`} />
          <Face n={3} transform={`rotateX(90deg) translateZ(${h}px)`} />
          <Face n={4} transform={`rotateX(-90deg) translateZ(${h}px)`} />
        </div>
      </div>
      <div className="h-8 text-lg font-bold text-slate-700">
        {outcome === null ? (
          <span className="text-slate-400">آماده‌ی پرتاب…</span>
        ) : rolling ? (
          <span className="text-slate-400">در حال چرخش…</span>
        ) : (
          <span className="pop-in inline-block" key={`${outcome}-${batchTick}`}>
            نتیجه: <span className="text-2xl font-black text-indigo-600">{toFa(outcome)}</span>
            {highlight.length > 0 && highlight.length < 6 && (
              <span className={`mr-2 rounded-full px-2 py-0.5 text-sm ${inEvent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {inEvent ? "✓ در رویداد" : "✗ خارج از رویداد"}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
