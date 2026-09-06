import React, { useEffect, useRef, useState } from "react";
import { OBJECTS, COMPARE_PAIRS, type LabObject, fmt, OUTCOME_INFO } from "../data";
import { Tank, type TankHandle, type Body } from "./Tank";
import { Shelf } from "./Shelf";
import { Builder } from "./Builder";
import { Cylinder } from "./Cylinder";
import { ObjectView } from "./ObjectView";
import { Card, Btn } from "./ui";
import { useLab } from "../store";

type Panel = "objects" | "build" | "compare" | "measure";

export function Lab() {
  const tank = useRef<TankHandle>(null);
  const { showForces, setShowForces, guessMode, setGuessMode, state, dispatch, award, toast } = useLab();
  const [drag, setDrag] = useState<{ obj: LabObject; x: number; y: number } | null>(null);
  const dragRef = useRef<typeof drag>(null);
  const [panel, setPanel] = useState<Panel>("objects");
  const [compareInfo, setCompareInfo] = useState<{ title: string; lesson: string; a: LabObject; b: LabObject; done: number; id: string } | null>(null);
  const compareRef = useRef(compareInfo);
  compareRef.current = compareInfo;

  // درگ سراسری
  const startDrag = (obj: LabObject, e: React.PointerEvent) => {
    e.preventDefault();
    const d = { obj, x: e.clientX, y: e.clientY };
    dragRef.current = d;
    setDrag(d);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const d = { ...dragRef.current, x: e.clientX, y: e.clientY };
      dragRef.current = d;
      setDrag(d);
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      setDrag(null);
      const ok = tank.current?.dropAtClient(d.obj, e.clientX, e.clientY);
      if (!ok) toast("جسم را داخل مخزن آب رها کن 💧", 0, "info");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [toast]);

  const quickDrop = (obj: LabObject) => tank.current?.drop(obj);

  const runCompare = (p: (typeof COMPARE_PAIRS)[number]) => {
    const a = OBJECTS.find((o) => o.id === p.a)!;
    const b = OBJECTS.find((o) => o.id === p.b)!;
    tank.current?.clear();
    setCompareInfo({ title: p.title, lesson: p.lesson, a, b, done: 0, id: p.a + p.b });
    setTimeout(() => tank.current?.drop(a, 140, { skipGuess: true }), 50);
    setTimeout(() => tank.current?.drop(b, 320, { skipGuess: true }), 400);
  };

  const onResult = (_b: Body) => {
    const c = compareRef.current;
    if (!c) return;
    const done = c.done + 1;
    setCompareInfo({ ...c, done });
    if (done >= 2 && !state.compareDone.includes(c.id)) {
      dispatch({ type: "compare", id: c.id });
      dispatch({ type: "note", auto: true, text: `🔬 مقایسه ${c.title}: ${c.lesson}` });
      award(1, "مقایسه انجام شد! به نتیجه نگاه کن.");
    }
  };

  const recent = state.results.slice(-5).reverse();

  const panels: { id: Panel; label: string; emoji: string }[] = [
    { id: "objects", label: "اجسام", emoji: "🧺" },
    { id: "build", label: "خودت بساز!", emoji: "🛠️" },
    { id: "compare", label: "مقایسه کن", emoji: "⚖️" },
    { id: "measure", label: "اندازه‌گیری حجم", emoji: "📏" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* ستون راست: پنل‌ها */}
      <div className="lg:col-span-4 xl:col-span-4 order-2 lg:order-1">
        <Card>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {panels.map((p) => (
              <button key={p.id} onClick={() => setPanel(p.id)} className={`rounded-xl py-1.5 text-[11px] sm:text-xs font-bold flex flex-col items-center gap-0.5 transition ${panel === p.id ? "bg-sky-500 text-white shadow" : "bg-sky-50 text-sky-800 hover:bg-sky-100"}`}>
                <span className="text-lg">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>

          {panel === "objects" && (
            <>
              <div className="text-xs text-slate-500 mb-2">جسم را بگیر و داخل آب بینداز، یا دکمه «بینداز» را بزن.</div>
              <Shelf objects={OBJECTS} onDragStart={startDrag} onQuickDrop={quickDrop} />
            </>
          )}
          {panel === "build" && (
            <>
              <h3 className="font-black text-violet-800 mb-2">🛠️ خودت جسم بساز!</h3>
              <Builder onDrop={quickDrop} onDragStart={startDrag} />
            </>
          )}
          {panel === "compare" && (
            <div className="space-y-2">
              <h3 className="font-black text-sky-900">⚖️ دو جسم را با هم مقایسه کن</h3>
              <div className="text-xs text-slate-500">هر دو جسم هم‌زمان در آب می‌افتند. ببین کدام شناور می‌ماند.</div>
              {COMPARE_PAIRS.map((p) => {
                const a = OBJECTS.find((o) => o.id === p.a)!;
                const b = OBJECTS.find((o) => o.id === p.b)!;
                const done = state.compareDone.includes(p.a + p.b);
                return (
                  <button key={p.title} onClick={() => runCompare(p)} className="w-full bg-gradient-to-l from-sky-50 to-white border border-sky-100 rounded-2xl p-2 flex items-center gap-2 hover:shadow transition text-right">
                    <ObjectView obj={a} scale={0.4} />
                    <span className="text-slate-400 font-black">vs</span>
                    <ObjectView obj={b} scale={0.4} />
                    <span className="flex-1 text-sm font-bold text-sky-900">{p.title}</span>
                    {done && <span>✅</span>}
                  </button>
                );
              })}
              {compareInfo && compareInfo.done >= 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm leading-7 pop-in">
                  <div className="font-black text-amber-900">🔎 نتیجه مقایسه:</div>
                  <div className="text-slate-700">{compareInfo.lesson}</div>
                  <div className="font-bold text-violet-800 mt-1">بزرگ‌تر بودن جسم الزاماً به معنی فرو رفتن آن نیست!</div>
                </div>
              )}
            </div>
          )}
          {panel === "measure" && (
            <>
              <h3 className="font-black text-sky-900 mb-2">📏 آزمایش جابه‌جایی آب</h3>
              <Cylinder />
            </>
          )}
        </Card>
      </div>

      {/* ستون وسط: مخزن */}
      <div className="lg:col-span-8 xl:col-span-8 order-1 lg:order-2 space-y-3">
        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="text-lg font-black text-sky-900 flex-1">💧 مخزن آب</h2>
            <label className="flex items-center gap-1 text-sm font-bold bg-amber-50 border border-amber-200 rounded-xl px-2 py-1 cursor-pointer">
              <input type="checkbox" checked={guessMode} onChange={(e) => setGuessMode(e.target.checked)} className="w-4 h-4" />
              🤔 حدس بزن!
            </label>
            <label className="flex items-center gap-1 text-sm font-bold bg-green-50 border border-green-200 rounded-xl px-2 py-1 cursor-pointer">
              <input type="checkbox" checked={showForces} onChange={(e) => setShowForces(e.target.checked)} className="w-4 h-4" />
              ↕️ نیروها را نشان بده
            </label>
            <Btn size="sm" color="slate" onClick={() => { tank.current?.clear(); setCompareInfo(null); }}>🧹 خالی کن</Btn>
          </div>
          <Tank ref={tank} onResult={onResult} />
          <div className="text-[11px] text-slate-500 mt-1 text-center">می‌توانی اجسام داخل آب را با انگشت یا ماوس جابه‌جا کنی؛ برای برداشتن، آن را بیرون مخزن بکش.</div>
        </Card>

        {recent.length > 0 && (
          <Card title="آخرین آزمایش‌ها" emoji="📋" className="!p-3">
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <div key={r.id} className={`text-xs font-bold px-2 py-1 rounded-xl border flex items-center gap-1 ${OUTCOME_INFO[r.actual].color}`}>
                  <span>{r.emoji}</span>
                  <span>{r.name}</span>
                  <span className="opacity-70">· چگالی {fmt(r.density, 2)}</span>
                  {r.guess && <span>{r.guess === r.actual ? "⭐" : "❌"}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* لایه درگ */}
      {drag && (
        <div className="fixed z-[70] pointer-events-none" style={{ left: drag.x, top: drag.y, transform: "translate(-50%,-50%) scale(0.8)" }}>
          <ObjectView obj={drag.obj} />
        </div>
      )}
    </div>
  );
}
