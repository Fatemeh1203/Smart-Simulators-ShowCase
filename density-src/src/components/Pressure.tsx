import { useState } from "react";
import { Card, Btn } from "./ui";
import { useLab } from "../store";
import { fmt } from "../data";

const TOP = 30;
const BOTTOM = 330;
const LEFT = 40;
const RIGHT = 250;
const GROUND = 370;
const HOLES = [
  { y: 110, name: "سوراخ بالا", emoji: "1️⃣" },
  { y: 200, name: "سوراخ وسط", emoji: "2️⃣" },
  { y: 300, name: "سوراخ پایین", emoji: "3️⃣" },
];

export function Pressure() {
  const { state, dispatch, award, toast } = useLab();
  const [open, setOpen] = useState<boolean[]>([false, false, false]);
  const [depth, setDepth] = useState(30);

  const toggle = (i: number) => {
    const next = open.map((v, j) => (j === i ? !v : v));
    setOpen(next);
    if (!open[i]) {
      if (!state.holesOpened.includes(i)) {
        dispatch({ type: "hole", i });
        award(1, `${HOLES[i].name} را باز کردی!`);
        if (state.holesOpened.length === 2) {
          dispatch({ type: "note", auto: true, text: "💦 فهمیدم: آب از سوراخ پایین‌تر با فشار بیشتری بیرون می‌آید؛ هرچه عمق بیشتر، فشار بیشتر." });
        }
      } else {
        toast(`${HOLES[i].name} باز شد`, 0, "info");
      }
    }
  };

  const streamPath = (holeY: number) => {
    const d = holeY - TOP; // عمق سوراخ
    const v = Math.sqrt(d) * 0.75; // سرعت خروج ~ ریشه‌ی عمق
    let path = `M ${RIGHT} ${holeY}`;
    const pts: string[] = [];
    let landing = RIGHT;
    for (let t = 0; t < 60; t += 1) {
      const x = RIGHT + v * t * 1.2;
      const y = holeY + 0.03 * t * t * 2.2;
      if (y >= GROUND) {
        landing = x;
        break;
      }
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    path += " " + pts.join(" ");
    return { path, landing };
  };

  const pressureLevel = (d: number) => (d < 100 ? { t: "کم", c: "#4ade80" } : d < 200 ? { t: "متوسط", c: "#fbbf24" } : { t: "زیاد", c: "#f43f5e" });
  const gauge = Math.min(100, depth);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7">
        <Card title="مخزن سوراخ‌دار" emoji="💦" action={<Btn size="sm" color="slate" onClick={() => setOpen([false, false, false])}>همه را ببند</Btn>}>
          <div className="text-sm text-slate-600 mb-2">روی درپوش‌ها بزن تا سوراخ‌ها باز شوند. به فاصله‌ی پرتاب آب نگاه کن! 👀</div>
          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 520 400" className="w-full max-w-[560px] mx-auto" style={{ minWidth: 320 }}>
              {/* زمین */}
              <rect x="0" y={GROUND} width="520" height="30" fill="#bae6fd" />
              <rect x="0" y={GROUND} width="520" height="4" fill="#7dd3fc" />
              {/* مخزن */}
              <rect x={LEFT - 6} y={TOP - 10} width={RIGHT - LEFT + 12} height={BOTTOM - TOP + 16} rx="10" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="6" />
              <rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BOTTOM - TOP} fill="url(#wg)" />
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#0369a1" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              {/* برچسب‌های عمق و فشار */}
              {HOLES.map((h, i) => {
                const d = h.y - TOP;
                const p = pressureLevel(d);
                return (
                  <g key={i}>
                    <text x={LEFT - 12} y={h.y + 4} fontSize="11" fill="#0c4a6e" textAnchor="end" fontWeight="bold">
                      عمق {fmt(Math.round(d / 10), 0)}
                    </text>
                    <rect x={LEFT + 8} y={h.y - 8} width={(d / 300) * 120} height="16" rx="8" fill={p.c} opacity="0.85" />
                    <text x={LEFT + 12} y={h.y + 4} fontSize="10" fill="#fff" fontWeight="bold">
                      فشار {p.t}
                    </text>
                  </g>
                );
              })}
              {/* جریان‌ها */}
              {HOLES.map((h, i) => {
                if (!open[i]) return null;
                const { path, landing } = streamPath(h.y);
                return (
                  <g key={i}>
                    <path d={path} fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
                    <path d={path} fill="none" stroke="#e0f2fe" strokeWidth="2" className="flow-anim" />
                    <ellipse cx={landing} cy={GROUND + 2} rx="16" ry="4" fill="#38bdf8" opacity="0.6" />
                    <text x={landing} y={GROUND + 22} fontSize="11" fill="#0c4a6e" textAnchor="middle" fontWeight="bold">
                      {fmt(Math.round((landing - RIGHT) / 10), 0)} سانتی‌متر
                    </text>
                  </g>
                );
              })}
              {/* درپوش‌ها */}
              {HOLES.map((h, i) => (
                <g key={i} onClick={() => toggle(i)} className="cursor-pointer">
                  <circle cx={RIGHT} cy={h.y} r="12" fill={open[i] ? "#0ea5e9" : "#a16207"} stroke="#fff" strokeWidth="3" />
                  <text x={RIGHT + 22} y={h.y + 4} fontSize="12" fill="#1e3a5f" fontWeight="bold">
                    {open[i] ? "باز" : "بسته"} {h.emoji}
                  </text>
                </g>
              ))}
              <text x={(LEFT + RIGHT) / 2} y={TOP - 16} fontSize="12" fill="#0c4a6e" textAnchor="middle" fontWeight="bold">
                سطح آب
              </text>
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {HOLES.map((h, i) => (
              <button key={i} onClick={() => toggle(i)} className={`rounded-2xl py-2 font-bold text-sm border-2 transition ${open[i] ? "bg-sky-500 text-white border-sky-600" : "bg-white border-slate-200 hover:bg-sky-50"}`}>
                {h.emoji} {h.name}: {open[i] ? "باز 💧" : "بسته 🔒"}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <Card title="چه چیزی می‌بینی؟" emoji="🔎">
          <div className="text-sm leading-7 text-slate-700 space-y-1">
            <div className={open.filter(Boolean).length >= 2 ? "font-bold text-sky-900" : ""}>
              💦 آب از سوراخ <b>پایین‌تر</b> با فشار بیشتری بیرون می‌آید و دورتر می‌ریزد.
            </div>
            <div>📏 هرچه عمق بیشتر شود، آبِ بیشتری روی آن نقطه فشار می‌آورد.</div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 font-black text-amber-900 text-center text-base mt-2">
              هرچه پایین‌تر برویم، فشار آب بیشتر می‌شود. ⬇️💪
            </div>
          </div>
        </Card>

        <Card title="غواص کوچولو" emoji="🤿">
          <div className="text-sm text-slate-600 mb-2">غواص را پایین ببر و ببین فشار چقدر می‌شود.</div>
          <div className="flex gap-3 items-stretch">
            <div className="relative w-20 h-56 rounded-2xl overflow-hidden border-2 border-sky-200 bg-gradient-to-b from-sky-200 via-sky-400 to-sky-800 shrink-0">
              <div className="absolute left-1/2 -translate-x-1/2 text-3xl transition-all duration-300" style={{ top: `${depth * 0.8}%` }}>
                🤿
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <input type="range" min={0} max={100} value={depth} onChange={(e) => setDepth(+e.target.value)} className="w-full" style={{ direction: "ltr" }} />
              <div className="text-sm">عمق: <b>{fmt(depth / 10, 1)}</b> متر</div>
              <div className="text-sm">فشار روی غواص:</div>
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-green-400 via-amber-400 to-rose-500 transition-all duration-300" style={{ width: `${gauge}%` }} />
              </div>
              <div className="text-xs text-slate-600 leading-5">
                {depth < 25 ? "😊 نزدیک سطح، فشار کم است." : depth < 60 ? "😮 گوش‌ها کمی فشار حس می‌کنند!" : "😣 خیلی عمیق! فشار آب زیاد است؛ غواص‌ها باید مراقب باشند."}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
