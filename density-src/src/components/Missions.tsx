import { useMemo, useState } from "react";
import { MISSIONS } from "../missions";
import { useLab } from "../store";
import { Card, Btn } from "./ui";
import { OBJECTS, classify, density, fmt, OUTCOME_INFO } from "../data";
import { ObjectView } from "./ObjectView";

export function Missions({ goTo }: { goTo: (tab: string) => void }) {
  const { state, dispatch, award, toast } = useLab();
  const done = MISSIONS.filter((m) => m.check(state).done).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7">
        <Card title="مأموریت‌ها" emoji="🎯" action={<span className="text-sm font-bold text-sky-700">{fmt(done, 0)} از {fmt(MISSIONS.length, 0)}</span>}>
          <div className="space-y-2">
            {MISSIONS.map((m, i) => {
              const r = m.check(state);
              return (
                <div key={m.id} className={`rounded-2xl border-2 p-3 flex items-center gap-3 transition ${r.done ? "bg-green-50 border-green-300" : "bg-white border-slate-100"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${r.done ? "bg-green-200" : "bg-sky-100"}`}>{r.done ? "🏅" : m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sky-900 text-sm">مأموریت {fmt(i + 1, 0)}: {m.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.done ? `نشان «${m.badge}» گرفتی! 🎉` : m.hint}</div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-amber-500 text-sm">{"⭐".repeat(m.stars)}</div>
                    <div className={`text-xs font-bold ${r.done ? "text-green-700" : "text-slate-500"}`}>{r.progress}</div>
                    {!r.done && m.tab !== "missions" && (
                      <button onClick={() => goTo(m.tab)} className="text-[11px] text-sky-600 underline mt-1">برو ←</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 space-y-4">
        <Quiz
          onPass={() => {
            if (!state.quizDone) {
              dispatch({ type: "flag", key: "quizDone", value: true });
              award(1, "بدون آزمایش درست حدس زدی! پیش‌گوی دانا 🧠");
            } else toast("باز هم عالی بود!", 0, "info");
          }}
        />
        <Card title="نشان‌های من" emoji="🏅">
          <div className="flex flex-wrap gap-2">
            {MISSIONS.filter((m) => m.check(state).done).map((m) => (
              <div key={m.id} className="bg-gradient-to-b from-amber-100 to-amber-200 border border-amber-300 rounded-2xl px-3 py-2 text-center pop-in">
                <div className="text-2xl">🏅</div>
                <div className="text-xs font-black text-amber-900">{m.badge}</div>
              </div>
            ))}
            {done === 0 && <div className="text-sm text-slate-500">هنوز نشانی نگرفتی. اولین مأموریت را شروع کن!</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Quiz({ onPass }: { onPass: () => void }) {
  const [seed, setSeed] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const items = useMemo(() => {
    const pool = [...OBJECTS].filter((o) => classify(density(o)) !== "suspend");
    const arr = pool.sort(() => Math.random() - 0.5).slice(0, 4);
    return arr;
  }, [seed]);

  const toggle = (id: string) => {
    if (checked) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const correctCount = items.filter((o) => (classify(density(o)) === "float") === picked.includes(o.id)).length;

  const check = () => {
    setChecked(true);
    if (correctCount >= 3) onPass();
  };
  const reset = () => {
    setSeed((s) => s + 1);
    setPicked([]);
    setChecked(false);
  };

  return (
    <Card title="آزمون: کدام‌ها شناور می‌شوند؟" emoji="🧠">
      <div className="text-sm text-slate-600 mb-2">بدون آزمایش، فقط با نگاه به جرم و حجم، اجسامی را که فکر می‌کنی شناور می‌شوند انتخاب کن.</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((o) => {
          const sel = picked.includes(o.id);
          const floats = classify(density(o)) === "float";
          const ok = checked && sel === floats;
          return (
            <button key={o.id} onClick={() => toggle(o.id)} className={`rounded-2xl border-2 p-2 flex flex-col items-center gap-1 transition ${checked ? (ok ? "border-green-400 bg-green-50" : "border-rose-400 bg-rose-50") : sel ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}>
              <ObjectView obj={o} scale={0.45} />
              <div className="text-xs font-black text-sky-900">{o.name}</div>
              <div className="text-[10px] text-slate-500">{fmt(o.mass, 0)} گرم · {fmt(o.volume, 0)} سی‌سی</div>
              {checked && <div className="text-[10px] font-bold">{OUTCOME_INFO[classify(density(o))].emoji} {OUTCOME_INFO[classify(density(o))].label}</div>}
              {!checked && sel && <div className="text-[10px] font-bold text-sky-700">انتخاب شد ✓</div>}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        {!checked ? <Btn color="violet" className="flex-1" onClick={check}>بررسی کن ✅</Btn> : <Btn color="slate" className="flex-1" onClick={reset}>🔄 سؤال جدید</Btn>}
      </div>
      {checked && (
        <div className={`mt-2 text-sm font-bold rounded-2xl p-2 text-center pop-in ${correctCount >= 3 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          {fmt(correctCount, 0)} از ۴ درست! {correctCount >= 3 ? "آفرین دانشمند کوچولو! 🌟" : "راهنمایی: جرم را بر حجم تقسیم کن؛ اگر کمتر از ۱ شد، شناور می‌شود."}
        </div>
      )}
    </Card>
  );
}
