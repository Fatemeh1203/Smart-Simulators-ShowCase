import { useEffect, useMemo, useState } from "react";
import { Card, Btn, Progress } from "./ui";
import { useLab } from "../store";
import { fmt } from "../data";

const HULLS = [
  { name: "کوچک", area: 200, mass: 150, w: 160 },
  { name: "متوسط", area: 400, mass: 300, w: 230 },
  { name: "بزرگ", area: 600, mass: 450, w: 300 },
];
const WALLS = [
  { name: "بدون دیواره", h: 0, mass: 0 },
  { name: "کوتاه", h: 5, mass: 100 },
  { name: "بلند", h: 10, mass: 200 },
];
const CARGO_ITEMS = [
  { emoji: "🍎", name: "سیب", mass: 100 },
  { emoji: "🧸", name: "خرس", mass: 250 },
  { emoji: "📦", name: "جعبه", mass: 500 },
  { emoji: "🛢️", name: "بشکه", mass: 800 },
  { emoji: "🪨", name: "سنگ", mass: 1200 },
  { emoji: "🐘", name: "فیل کوچولو", mass: 2500 },
];
const PX = 9; // پیکسل بر سانتی‌متر

type Mode = "build" | "challenge";

export function Boat() {
  const { state, dispatch, award, toast } = useLab();
  const [mode, setMode] = useState<Mode>("build");
  const [hull, setHull] = useState(1);
  const [hasBottom, setHasBottom] = useState(true);
  const [wall, setWall] = useState(1);
  const [ballast, setBallast] = useState(0);
  const [cargo, setCargo] = useState(0);
  const [items, setItems] = useState<number[]>([]);
  const [sunk, setSunk] = useState(false);
  const [sinkMsg, setSinkMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // پیکربندی بر اساس حالت
  const cfg = useMemo(() => {
    if (mode === "challenge") return { hull: HULLS[1], wall: WALLS[2], hasBottom: true, ballast: 0 };
    return { hull: HULLS[hull], wall: WALLS[wall], hasBottom, ballast };
  }, [mode, hull, wall, hasBottom, ballast]);

  const cargoMass = mode === "challenge" ? items.reduce((s, i) => s + CARGO_ITEMS[i].mass, 0) : cargo * 150;
  const totalMass = cfg.hull.mass + (cfg.hasBottom ? 80 : 0) + cfg.wall.mass + cfg.ballast * 200 + cargoMass;
  const maxDraft = 2 + cfg.wall.h; // سانتی‌متر تا لبه
  const draft = totalMass / cfg.hull.area; // سانتی‌متر
  const willSink = !cfg.hasBottom || draft > maxDraft;
  const freeboard = Math.max(0, maxDraft - draft);
  const fill = Math.min(1, draft / maxDraft);

  useEffect(() => {
    if (willSink && !sunk) {
      setSunk(true);
      const msg = !cfg.hasBottom
        ? "قایق کف ندارد! آب داخل آن می‌رود و نمی‌تواند آب را کنار بزند."
        : "بار خیلی زیاد شد و آب از لبه‌ها وارد قایق شد. قایق باید بتواند آب کافی را جابه‌جا کند تا شناور بماند.";
      setSinkMsg(msg);
      toast("قایق غرق شد! 🌊", 0, "bad");
      if (mode === "challenge") setSaved(false);
    } else if (!willSink && sunk) {
      setSunk(false);
      setSinkMsg(null);
    }
  }, [willSink, sunk, cfg.hasBottom, mode, toast]);

  const resetAll = () => {
    setItems([]);
    setCargo(0);
    setSunk(false);
    setSinkMsg(null);
    setSaved(false);
  };

  const addItem = (i: number) => {
    if (sunk) return;
    setItems((it) => [...it, i]);
    setSaved(false);
  };
  const removeLast = () => setItems((it) => it.slice(0, -1));

  const saveRecord = () => {
    if (sunk || items.length === 0) return;
    const n = items.length;
    const isNew = n > state.boatRecord;
    dispatch({ type: "boatRecord", n });
    setSaved(true);
    if (isNew) {
      award(n > 12 ? 3 : n > 6 ? 2 : 1, `رکورد جدید: ${fmt(n, 0)} وسیله بدون غرق شدن! 🏆`);
      dispatch({ type: "note", auto: true, text: `⛵ توانستم ${fmt(n, 0)} وسیله (${fmt(cargoMass, 0)} گرم) در قایق بگذارم بدون اینکه غرق شود.` });
    } else toast(`${fmt(n, 0)} وسیله! رکوردت ${fmt(state.boatRecord, 0)} است.`, 0, "info");
  };

  const finishBuild = () => {
    if (willSink) return toast("این قایق شناور نمی‌ماند! تغییرش بده.", 0, "bad");
    if (cargo === 0) return toast("اول کمی بار داخل قایق بگذار.", 0, "info");
    if (!state.boatDone) {
      dispatch({ type: "flag", key: "boatDone", value: true });
      award(3, "قایق تو با بار شناور ماند! ناخدای کوچک 🧑‍✈️");
    } else toast("قایق شناور است! حالا چالش بارگیری را امتحان کن.", 0, "info");
    dispatch({ type: "note", auto: true, text: `⛵ قایقی با بدنه ${cfg.hull.name} و دیواره ${cfg.wall.name} ساختم که با ${fmt(cargo, 0)} بار شناور ماند.` });
  };

  // ابعاد ترسیم
  const W = cfg.hull.w;
  const wallPx = cfg.wall.h * PX;
  const hullDepth = 2 * PX;
  const waterY = 210;
  const draftPx = Math.min(draft, maxDraft + 8) * PX;
  const boatTop = waterY - (hullDepth + wallPx) + draftPx; // بالای بدنه
  const sinkOffset = sunk ? 140 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7">
        <Card
          title={mode === "build" ? "قایق بساز!" : "چالش بارگیری"}
          emoji="⛵"
          action={
            <div className="flex gap-1 bg-sky-50 rounded-xl p-1">
              <button onClick={() => { setMode("build"); resetAll(); }} className={`px-3 py-1 rounded-lg text-sm font-bold ${mode === "build" ? "bg-sky-500 text-white" : "text-sky-800"}`}>🛠️ بساز</button>
              <button onClick={() => { setMode("challenge"); resetAll(); }} className={`px-3 py-1 rounded-lg text-sm font-bold ${mode === "challenge" ? "bg-sky-500 text-white" : "text-sky-800"}`}>🏆 چالش</button>
            </div>
          }
        >
          <div className="relative rounded-3xl overflow-hidden border-4 border-sky-200" style={{ height: 360, background: "linear-gradient(180deg,#e0f2fe 0%,#f0f9ff 55%,#38bdf8 55%,#0369a1 100%)" }}>
            {/* موج */}
            <div className="absolute inset-x-0 h-3 bg-sky-200/70 rounded-full" style={{ top: waterY - 6 }} />
            <div className="absolute right-3 text-[11px] font-bold text-sky-900 bg-white/80 rounded px-1" style={{ top: waterY - 26 }}>خط آب</div>

            {/* قایق */}
            <div className="absolute left-1/2 transition-all duration-700 ease-out" style={{ top: boatTop + sinkOffset, transform: `translateX(-50%) rotate(${sunk ? -18 : 0}deg)`, width: W }}>
              {/* دیواره‌ها */}
              {wallPx > 0 && (
                <div className="mx-2 border-x-[10px] border-amber-700 bg-amber-100/30 relative" style={{ height: wallPx }}>
                  {!cfg.hasBottom && <div className="absolute inset-0 bg-sky-400/50" />}
                </div>
              )}
              {/* بار */}
              <div className="absolute inset-x-4 flex flex-wrap-reverse gap-0.5 justify-center items-end content-end" style={{ bottom: hullDepth - 2, height: 140, pointerEvents: "none" }}>
                {mode === "challenge"
                  ? items.map((i, k) => (
                      <span key={k} className="text-2xl pop-in" style={{ lineHeight: 1 }}>{CARGO_ITEMS[i].emoji}</span>
                    ))
                  : Array.from({ length: cargo }).map((_, k) => (
                      <span key={k} className="text-2xl pop-in" style={{ lineHeight: 1 }}>📦</span>
                    ))}
                {cfg.ballast > 0 && Array.from({ length: cfg.ballast }).map((_, k) => <span key={"b" + k} className="text-xl">🏋️</span>)}
              </div>
              {/* بدنه */}
              <div
                className="relative"
                style={{
                  height: hullDepth + 14,
                  background: cfg.hasBottom ? "linear-gradient(180deg,#b45309,#78350f)" : "repeating-linear-gradient(90deg,#b45309 0 20px,transparent 20px 34px)",
                  borderRadius: "6px 6px 70px 70px / 6px 6px 40px 40px",
                  boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.25)",
                }}
              />
              {!cfg.hasBottom && <div className="absolute inset-x-8 bottom-1 text-center text-xs font-bold text-white bg-rose-500/80 rounded">کف ندارد!</div>}
            </div>

            {/* آب روی قایق */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: waterY, background: "linear-gradient(180deg,rgba(56,189,248,0.35),rgba(3,105,161,0.55))" }} />

            {sinkMsg && (
              <div className="absolute inset-x-4 top-4 bg-white/95 border-2 border-rose-300 rounded-2xl p-3 text-sm pop-in shadow-lg">
                <div className="font-black text-rose-700 text-base">🌊 قایق غرق شد!</div>
                <div className="text-slate-700 leading-6 mt-1">{sinkMsg}</div>
                <div className="font-bold text-sky-900 mt-1">«قایق باید بتواند آب کافی را جابه‌جا کند تا شناور بماند.»</div>
                <div className="mt-2">
                  <Btn size="sm" color="rose" onClick={resetAll}>🔄 دوباره</Btn>
                </div>
              </div>
            )}
          </div>

          {/* عقربه‌ها */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
            <div className="bg-sky-50 rounded-xl p-2">
              <div className="text-[11px] text-slate-500">⚖️ جرم کل</div>
              <div className="font-black text-sky-900">{fmt(totalMass, 0)} گرم</div>
            </div>
            <div className="bg-sky-50 rounded-xl p-2">
              <div className="text-[11px] text-slate-500">💧 آب جابه‌جا شده</div>
              <div className="font-black text-sky-900">{fmt(Math.round(Math.min(totalMass, cfg.hull.area * maxDraft)), 0)} سی‌سی</div>
            </div>
            <div className="bg-sky-50 rounded-xl p-2">
              <div className="text-[11px] text-slate-500">📏 فاصله تا لبه</div>
              <div className={`font-black ${freeboard < 2 ? "text-rose-600" : "text-green-700"}`}>{fmt(freeboard, 1)} سانتی‌متر</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1"><span>چقدر پایین رفته؟</span><span>{sunk ? "غرق شد!" : fill > 0.85 ? "خطر! نزدیک لبه" : fill > 0.5 ? "نیمه‌پر" : "راحت شناور"}</span></div>
            <Progress value={fill * 100} max={100} color={fill > 0.85 ? "bg-rose-500" : fill > 0.5 ? "bg-amber-400" : "bg-green-500"} />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-4">
        {mode === "build" ? (
          <Card title="قطعات قایق" emoji="🧩">
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-bold text-slate-700 mb-1">🚤 بدنه</div>
                <div className="flex gap-1">
                  {HULLS.map((h, i) => (
                    <button key={h.name} onClick={() => setHull(i)} className={`flex-1 rounded-xl py-2 font-bold border-2 ${hull === i ? "bg-amber-400 border-amber-500 text-amber-950" : "bg-white border-slate-200"}`}>{h.name}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2">
                <span className="font-bold text-slate-700">🪵 کف قایق</span>
                <button onClick={() => setHasBottom((v) => !v)} className={`px-3 py-1 rounded-lg font-bold ${hasBottom ? "bg-green-500 text-white" : "bg-rose-100 text-rose-700"}`}>{hasBottom ? "دارد ✅" : "ندارد ❌"}</button>
              </div>
              <div>
                <div className="font-bold text-slate-700 mb-1">🧱 دیواره‌ها</div>
                <div className="flex gap-1">
                  {WALLS.map((w, i) => (
                    <button key={w.name} onClick={() => setWall(i)} className={`flex-1 rounded-xl py-2 font-bold border-2 text-xs ${wall === i ? "bg-amber-400 border-amber-500 text-amber-950" : "bg-white border-slate-200"}`}>{w.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700"><span>🏋️ وزنه (برای تعادل)</span><span>{fmt(ballast, 0)}</span></div>
                <input type="range" min={0} max={3} value={ballast} onChange={(e) => setBallast(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700"><span>📦 بار (هر جعبه ۱۵۰ گرم)</span><span>{fmt(cargo, 0)}</span></div>
                <input type="range" min={0} max={40} value={cargo} onChange={(e) => setCargo(+e.target.value)} className="w-full" />
              </div>
              <div className="flex gap-2">
                <Btn color="green" className="flex-1" onClick={finishBuild}>✅ قایق آماده است!</Btn>
                <Btn color="slate" onClick={resetAll}>🔄</Btn>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs leading-6 text-slate-700">
                💡 هرچه بار اضافه می‌کنی قایق پایین‌تر می‌رود و آب بیشتری کنار می‌زند. اگر آب به لبه برسد، قایق غرق می‌شود. بدنه‌ی بزرگ‌تر و دیواره‌ی بلندتر یعنی جای بیشتر برای کنار زدن آب!
              </div>
            </div>
          </Card>
        ) : (
          <Card title="چند وسیله می‌توانی بگذاری؟" emoji="🏆">
            <div className="text-sm text-slate-600 mb-2">وسیله‌ها را داخل قایق بگذار. هر وقت فکر کردی دیگر جا ندارد، «ثبت رکورد» را بزن. اگر غرق شود، امتیازی نمی‌گیری!</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {CARGO_ITEMS.map((it, i) => (
                <button key={it.name} disabled={sunk} onClick={() => addItem(i)} className="bg-white border-2 border-sky-100 rounded-2xl p-2 hover:bg-sky-50 active:scale-95 disabled:opacity-40 flex flex-col items-center">
                  <span className="text-3xl">{it.emoji}</span>
                  <span className="text-xs font-bold text-slate-700">{it.name}</span>
                  <span className="text-[10px] text-slate-400">{fmt(it.mass, 0)} گرم</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between bg-sky-50 rounded-2xl p-3 mb-2">
              <div>
                <div className="text-xs text-slate-500">وسیله‌های داخل قایق</div>
                <div className="text-2xl font-black text-sky-900">{fmt(items.length, 0)}</div>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500">🏅 رکورد تو</div>
                <div className="text-2xl font-black text-amber-600">{fmt(state.boatRecord, 0)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn color="green" className="flex-1" onClick={saveRecord} disabled={sunk || items.length === 0 || saved}>{saved ? "ثبت شد ✅" : "🏁 ثبت رکورد"}</Btn>
              <Btn color="slate" onClick={removeLast} disabled={items.length === 0 || sunk}>↩️</Btn>
              <Btn color="rose" onClick={resetAll}>🔄</Btn>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs leading-6 text-slate-700 mt-3">
              🤔 فکر کن: برای گذاشتن وسیله‌های <b>بیشتر</b>، بهتر است وسیله‌های سبک انتخاب کنی یا سنگین؟ خودت امتحان کن!
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
