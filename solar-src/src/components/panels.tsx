import { useEffect, useState } from "react";
import { fa, formatPeriod, planetById } from "../data/planets";
import type { Simulation } from "../sim/Simulation";
import { periodAtDisplayR } from "../sim/Simulation";
import GuessBox from "./GuessBox";
import PlanetPicker from "./PlanetPicker";
import { cn } from "../utils/cn";

export function PanelTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-black">{children}</h2>
      {sub && <p className="text-sm text-white/70 leading-6">{sub}</p>}
    </div>
  );
}

export const ScaleNote = () => (
  <p className="text-[11px] leading-5 text-sky-200/70 bg-sky-500/10 rounded-xl p-2 mt-3">
    📐 در این مدل، اندازه و فاصله سیارات برای اینکه بتوانیم همه‌ی آن‌ها را روی صفحه ببینیم، به‌صورت نمایشی کوچک شده‌اند.
  </p>
);

/* ---------------- حالت آزاد ---------------- */
export function FreePanel({
  sim,
  selectedId,
  onSelect,
  tick,
}: {
  sim: Simulation;
  selectedId: string | null;
  onSelect: (id: string) => void;
  tick: number;
}) {
  void tick;
  const body = selectedId ? sim.get(selectedId) : undefined;
  const isPlanet = body && !body.isCustom;
  return (
    <div>
      <PanelTitle sub="اینجا هیچ مأموریتی نیست! هر چه دوست داری امتحان کن.">🔬 آزمایش آزاد</PanelTitle>
      <div className="space-y-3 text-sm">
        <div className="bg-white/10 rounded-2xl p-3 leading-7">
          👆 روی هر سیاره کلیک کن تا اطلاعاتش را ببینی.
          <br />
          ⏩ با دکمه‌های پایین، زمان را تند یا کند کن.
          <br />
          ⏸ حرکت را متوقف کن و دوباره شروع کن.
        </div>
        <div>
          <div className="font-bold mb-1">یک سیاره انتخاب کن:</div>
          <PlanetPicker value={selectedId} onChange={onSelect} />
        </div>
        {isPlanet && body && (
          <div className="bg-white/10 rounded-2xl p-3 space-y-2">
            <div className="font-bold">
              📏 فاصله‌ی {body.name} از خورشید را تغییر بده:
            </div>
            <input
              type="range"
              min={34}
              max={370}
              value={Math.round(body.orbitR)}
              onChange={(e) => sim.setOrbitR(body.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/80">
              <span>نزدیک</span>
              <span>یک دور ≈ {formatPeriod(body.period)}</span>
              <span>دور</span>
            </div>
            {body.orbitR !== body.baseOrbitR && (
              <button onClick={() => sim.restore(body.id)} className="big-btn w-full bg-white/15 hover:bg-white/25 text-sm py-2">
                ↩️ برگرداندن به مدار واقعی
              </button>
            )}
          </div>
        )}
        <div className="bg-gradient-to-l from-amber-500/20 to-orange-500/20 rounded-2xl p-3 leading-7">
          <div className="font-black text-amber-200">چه چیزهایی یاد می‌گیریم؟</div>
          🪐 سیارات به دور خورشید حرکت می‌کنند.
          <br />
          🔁 هر سیاره مدار و زمان متفاوتی برای گردش دارد.
          <br />
          📏 سیاره‌های دورتر، مسیر بزرگ‌تر و حرکت کندتری دارند.
        </div>
      </div>
      <ScaleNote />
    </div>
  );
}

/* ---------------- آزمایش سرعت ---------------- */
const SPEEDS = [
  { f: 0.7, label: "سرعت کم", emoji: "🐢", desc: "حرکت آرام" },
  { f: 1, label: "سرعت معمولی", emoji: "🚶", desc: "حرکت عادی" },
  { f: 1.25, label: "سرعت زیاد", emoji: "🐇", desc: "حرکت سریع" },
  { f: 1.45, label: "خیلی زیاد!", emoji: "🚀", desc: "خیلی سریع" },
];

export function SpeedLabPanel({
  sim,
  selectedId,
  onSelect,
  tick,
  onEnsurePlaying,
}: {
  sim: Simulation;
  selectedId: string | null;
  onSelect: (id: string) => void;
  tick: number;
  onEnsurePlaying: () => void;
}) {
  void tick;
  const [guess, setGuess] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [applied, setApplied] = useState<number | null>(null);
  const pid = selectedId && planetById(selectedId) ? selectedId : "earth";
  const body = sim.get(pid)!;

  useEffect(() => {
    if (!revealed && applied !== null && applied < 1 && body) {
      const changed = body.minR < body.orbitR * 0.85 || body.maxR > body.orbitR * 1.15 || body.status !== "ok";
      if (changed) setRevealed(true);
    }
  }, [tick, applied, revealed, body]);

  const apply = (f: number) => {
    if (f === 1) sim.restore(pid);
    else sim.setSpeedFactor(pid, f);
    setApplied(f);
    onEnsurePlaying();
  };

  const status = body.status;
  const ratioMin = body.minR / body.orbitR;
  const ratioMax = body.maxR / body.orbitR;

  return (
    <div>
      <PanelTitle sub="اگر سرعت سیاره را تغییر دهیم، مسیر حرکتش چه می‌شود؟">🧪 آزمایش: اگر سرعت را تغییر دهیم؟</PanelTitle>
      <div className="space-y-3 text-sm">
        <div>
          <div className="font-bold mb-1">۱) سیاره را انتخاب کن:</div>
          <PlanetPicker
            value={pid}
            onChange={(id) => {
              if (applied !== null) sim.restore(pid);
              onSelect(id);
              setApplied(null);
              setRevealed(false);
              setGuess(null);
            }}
          />
        </div>
        <GuessBox
          question={`اگر ${body.name} آهسته‌تر از حالت عادی حرکت کند، به نظرت چه اتفاقی می‌افتد؟`}
          options={[
            { id: "closer", emoji: "🟢", label: "به سمت خورشید کشیده می‌شود" },
            { id: "farther", emoji: "🔵", label: "از خورشید دورتر می‌رود" },
            { id: "same", emoji: "🟡", label: "هیچ تغییری نمی‌کند" },
          ]}
          correctId="closer"
          chosen={guess}
          revealed={revealed}
          onChoose={setGuess}
        />
        <div>
          <div className="font-bold mb-1">۲) سرعت {body.name} را انتخاب کن:</div>
          <div className="grid grid-cols-2 gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s.f}
                onClick={() => apply(s.f)}
                className={cn(
                  "big-btn text-base py-2 flex flex-col items-center",
                  applied === s.f || (applied === null && s.f === 1)
                    ? "bg-yellow-400 text-yellow-950 shadow-lg"
                    : "bg-white/10 hover:bg-white/20"
                )}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>{s.label}</span>
                <span className="text-xs opacity-75">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
        {applied !== null && applied !== 1 && (
          <div className="bg-white/10 rounded-2xl p-3 space-y-1 animate-pop">
            <div className="font-black">👀 نتیجه‌ی زنده:</div>
            {status === "crashed" && <div className="text-rose-300 font-bold">💥 {body.name} آن‌قدر کند شد که به سمت خورشید سقوط کرد!</div>}
            {status === "escaped" && <div className="text-sky-300 font-bold">🚀 {body.name} آن‌قدر تند رفت که از منظومه شمسی فرار کرد!</div>}
            {status === "ok" && (
              <>
                <div>نزدیک‌ترین فاصله: {fa(ratioMin * 100)}٪ مدار قبلی</div>
                <div>دورترین فاصله: {fa(ratioMax * 100)}٪ مدار قبلی</div>
                <div className="text-white/80">
                  {applied < 1
                    ? "مسیر به شکل بیضی درآمده و سیاره به خورشید نزدیک‌تر می‌شود."
                    : "مسیر به شکل بیضی درآمده و سیاره از خورشید دورتر می‌رود."}
                </div>
              </>
            )}
            <button onClick={() => apply(1)} className="big-btn w-full bg-white/15 hover:bg-white/25 text-sm py-2 mt-1">
              ↩️ برگرداندن به حالت عادی و مقایسه
            </button>
          </div>
        )}
        <div className="bg-gradient-to-l from-emerald-500/20 to-teal-500/20 rounded-2xl p-3 leading-7">
          <div className="font-black text-emerald-200">💡 نکته:</div>
          «سرعت یک جسم می‌تواند روی مسیر حرکت آن اثر بگذارد.»
          <br />
          🐢 کندتر ← به سمت خورشید کشیده می‌شود.
          <br />
          🐇 تندتر ← مسیرش بزرگ‌تر می‌شود.
          <br />
          🚀 خیلی تند ← از منظومه فرار می‌کند!
        </div>
      </div>
      <ScaleNote />
    </div>
  );
}

/* ---------------- آزمایش فاصله ---------------- */
export function DistanceLabPanel({
  sim,
  selectedId,
  onSelect,
  tick,
  onEnsurePlaying,
}: {
  sim: Simulation;
  selectedId: string | null;
  onSelect: (id: string) => void;
  tick: number;
  onEnsurePlaying: () => void;
}) {
  void tick;
  const [guess, setGuess] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const pid = selectedId && planetById(selectedId) ? selectedId : "earth";
  const body = sim.get(pid)!;
  const def = planetById(pid);

  const r = Math.round(body.orbitR);
  const period = body.period;
  const basePeriod = body.basePeriod;
  const speedRatio = (body.orbitR / body.baseOrbitR) * (basePeriod / period); // نسبت سرعت مداری (طول مسیر ÷ زمان)

  useEffect(() => {
    if (!revealed && body.orbitR > body.baseOrbitR * 1.12) setRevealed(true);
  }, [tick, revealed, body]);

  return (
    <div>
      <PanelTitle sub="با تغییر فاصله، مدار و زمان یک دور کامل چه تغییری می‌کند؟">📏 آزمایش: فاصله از خورشید</PanelTitle>
      <div className="space-y-3 text-sm">
        <div>
          <div className="font-bold mb-1">۱) سیاره را انتخاب کن:</div>
          <PlanetPicker
            value={pid}
            onChange={(id) => {
              sim.restore(pid);
              onSelect(id);
              setRevealed(false);
              setGuess(null);
            }}
          />
        </div>
        <GuessBox
          question={`اگر ${def.name} را از خورشید دورتر کنیم، به نظرت چه اتفاقی می‌افتد؟`}
          options={[
            { id: "bigger", emoji: "🟢", label: "مدار بزرگ‌تر می‌شود و یک دور بیشتر طول می‌کشد" },
            { id: "smaller", emoji: "🔵", label: "مدار کوچک‌تر می‌شود" },
            { id: "same", emoji: "🟡", label: "هیچ تغییری نمی‌کند" },
          ]}
          correctId="bigger"
          chosen={guess}
          revealed={revealed}
          onChoose={setGuess}
        />
        <div className="bg-white/10 rounded-2xl p-3 space-y-2">
          <div className="font-bold">۲) فاصله‌ی {def.name} را تغییر بده:</div>
          <input
            type="range"
            min={34}
            max={370}
            value={r}
            onChange={(e) => {
              sim.setOrbitR(pid, Number(e.target.value));
              onEnsurePlaying();
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/70">
            <span>☀️ نزدیک به خورشید</span>
            <span>دور از خورشید 🧊</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-xs text-white/60">قبل (مدار واقعی)</div>
            <div className="font-black text-base">{formatPeriod(basePeriod)}</div>
            <div className="text-xs">اندازه‌ی مدار: {fa(body.baseOrbitR)}</div>
          </div>
          <div className="bg-yellow-400/15 rounded-2xl p-3 border border-yellow-300/40">
            <div className="text-xs text-yellow-100/80">حالا (آزمایش)</div>
            <div className="font-black text-base text-yellow-200">{formatPeriod(period)}</div>
            <div className="text-xs">اندازه‌ی مدار: {fa(r)}</div>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-3">
          <div className="flex justify-between">
            <span>سرعت حرکت مداری:</span>
            <span className="font-black">
              {Math.abs(speedRatio - 1) < 0.03 ? "مثل قبل" : speedRatio < 1 ? `کندتر (${fa(speedRatio * 100)}٪)` : `تندتر (${fa(speedRatio * 100)}٪)`}
            </span>
          </div>
          <div className="h-3 bg-black/30 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-l from-yellow-300 to-orange-400 transition-all" style={{ width: `${Math.min(100, speedRatio * 50)}%` }} />
          </div>
        </div>
        {body.orbitR !== body.baseOrbitR && (
          <button onClick={() => sim.restore(pid)} className="big-btn w-full bg-white/15 hover:bg-white/25 text-sm py-2">
            ↩️ برگرداندن به مدار واقعی
          </button>
        )}
        <div className="bg-gradient-to-l from-sky-500/20 to-indigo-500/20 rounded-2xl p-3 leading-7">
          <div className="font-black text-sky-200">💡 نکته:</div>
          «سیاره‌هایی که از خورشید دورتر هستند، معمولاً مسیر بزرگ‌تری برای طی کردن دارند و حرکت مداری آن‌ها کندتر است.»
        </div>
      </div>
      <ScaleNote />
    </div>
  );
}

/* ---------------- سیاره خودت را بساز ---------------- */
const COLORS = ["#f43f5e", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899", "#e2e8f0", "#92400e"];

export function BuildPanel({ sim, onLaunched, tick, onEnsurePlaying }: { sim: Simulation; onLaunched: (id: string) => void; tick: number; onEnsurePlaying: () => void }) {
  void tick;
  const [name, setName] = useState("");
  const [size, setSize] = useState(10);
  const [dist, setDist] = useState(160);
  const [color, setColor] = useState(COLORS[6]);
  const [speed, setSpeed] = useState(1);
  const [rings, setRings] = useState(false);
  const [launched, setLaunched] = useState(false);
  const period = periodAtDisplayR(dist);
  const customs = sim.bodies.filter((b) => b.isCustom);

  const launch = () => {
    const b = sim.addCustom({ name: name.trim() || `سیاره‌ی من ${customs.length + 1}`, color, radius: size, orbitR: dist, speedFactor: speed, hasRings: rings });
    onLaunched(b.id);
    onEnsurePlaying();
    setLaunched(true);
    setTimeout(() => setLaunched(false), 1500);
  };

  return (
    <div>
      <PanelTitle sub="یک سیاره‌ی جدید طراحی کن و آن را به مدار بفرست!">🪐 سیاره خودت را بساز!</PanelTitle>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-center py-2">
          <div
            className="rounded-full relative transition-all"
            style={{
              width: size * 5 + 20,
              height: size * 5 + 20,
              background: `radial-gradient(circle at 35% 35%, #fff8, ${color} 45%, #0008)`,
              boxShadow: `0 0 30px ${color}88`,
            }}
          >
            {rings && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-white/60"
                style={{ width: (size * 5 + 20) * 1.9, height: (size * 5 + 20) * 0.55, transform: "translate(-50%,-50%) rotate(-15deg)" }}
              />
            )}
          </div>
        </div>
        <label className="block">
          <div className="font-bold mb-1">✏️ نام سیاره:</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: سیاره‌ی شکلاتی"
            className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 outline-none focus:border-yellow-300"
          />
        </label>
        <label className="block">
          <div className="font-bold mb-1">📦 اندازه: {size < 8 ? "کوچک" : size < 15 ? "متوسط" : "بزرگ"}</div>
          <input type="range" min={4} max={22} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block">
          <div className="font-bold mb-1">📏 فاصله از خورشید: {dist < 90 ? "نزدیک" : dist < 220 ? "متوسط" : "دور"}</div>
          <input type="range" min={36} max={370} value={dist} onChange={(e) => setDist(Number(e.target.value))} className="w-full" />
          <div className="text-xs text-white/70 mt-1">⏱ اگر با سرعت معمولی حرکت کند، یک دورش حدود {formatPeriod(period)} طول می‌کشد.</div>
        </label>
        <div>
          <div className="font-bold mb-1">🎨 رنگ:</div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn("w-8 h-8 rounded-full border-2 transition-transform", color === c ? "border-white scale-125" : "border-transparent")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold mb-1">💨 سرعت حرکت:</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { f: 0.8, l: "🐢 کم" },
              { f: 1, l: "🚶 معمولی" },
              { f: 1.25, l: "🐇 زیاد" },
            ].map((s) => (
              <button key={s.f} onClick={() => setSpeed(s.f)} className={cn("big-btn text-sm py-2", speed === s.f ? "bg-yellow-400 text-yellow-950" : "bg-white/10 hover:bg-white/20")}>
                {s.l}
              </button>
            ))}
          </div>
          {speed !== 1 && <div className="text-xs text-amber-200 mt-1">⚠️ با سرعت غیرمعمولی، مدار دایره‌ای نمی‌ماند و بیضی می‌شود!</div>}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={rings} onChange={(e) => setRings(e.target.checked)} className="w-5 h-5" />
          <span className="font-bold">💍 حلقه داشته باشد</span>
        </label>
        <button onClick={launch} className={cn("big-btn w-full text-xl text-white shadow-xl", launched ? "bg-green-500" : "bg-gradient-to-l from-pink-500 to-orange-500 hover:brightness-110")}>
          {launched ? "✅ سیاره در مدار قرار گرفت!" : "🚀 سیاره را به مدار بفرست!"}
        </button>
        {customs.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-3">
            <div className="font-bold mb-2">سیاره‌های تو ({fa(customs.length)}):</div>
            <ul className="space-y-1">
              {customs.map((c) => (
                <li key={c.id} className="flex items-center justify-between bg-black/20 rounded-xl px-2 py-1">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }} />
                    {c.name}
                    <span className="text-xs opacity-70">{c.status === "ok" ? "🟢 در مدار" : c.status === "crashed" ? "💥 برخورد" : "🚀 فرار کرد"}</span>
                  </span>
                  <button onClick={() => sim.removeCustom(c.id)} className="text-rose-300 hover:text-rose-200 px-1">
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ScaleNote />
    </div>
  );
}
