import { Dispatch } from "react";
import { Action } from "../circuit/model";
import { CircuitState, Level, Selection } from "../circuit/types";

interface Props {
  state: CircuitState;
  selection: Selection;
  dispatch: Dispatch<Action>;
  setSelection: (s: Selection) => void;
}

const batteryLevels: { level: Level; label: string; emoji: string; color: string }[] = [
  { level: "low", label: "ضعیف", emoji: "🔋", color: "bg-green-200 border-green-500 text-green-900" },
  { level: "medium", label: "معمولی", emoji: "🔋🔋", color: "bg-orange-200 border-orange-500 text-orange-900" },
  { level: "high", label: "قوی", emoji: "🔋🔋🔋", color: "bg-red-200 border-red-500 text-red-900" },
];
const resistorLevels: { level: Level; label: string; emoji: string; color: string }[] = [
  { level: "low", label: "کم", emoji: "🟢", color: "bg-green-200 border-green-500 text-green-900" },
  { level: "medium", label: "متوسط", emoji: "🟡", color: "bg-amber-200 border-amber-500 text-amber-900" },
  { level: "high", label: "زیاد", emoji: "🔴", color: "bg-red-200 border-red-500 text-red-900" },
];

export default function PropertyPanel({ state, selection, dispatch, setSelection }: Props) {
  if (!selection) {
    return (
      <div className="rounded-2xl bg-white/80 border-2 border-dashed border-slate-300 p-3 text-center text-sm text-slate-500">
        روی یک قطعه یا سیم بزن تا بتوانی آن را تغییر دهی 👆
      </div>
    );
  }

  if (selection.kind === "wire") {
    const w = state.wires[selection.id];
    if (!w) return null;
    return (
      <div className="rounded-2xl bg-white border-2 border-sky-300 p-3 shadow pop-in">
        <div className="font-black text-slate-800 mb-2">〰️ سیم انتخاب شد</div>
        <p className="text-xs text-slate-600 mb-2">سرِ سیم (دایره‌های آبی) را بکش تا به پایانهٔ دیگری وصل شود.</p>
        <button
          onClick={() => {
            dispatch({ type: "removeWire", id: w.id });
            setSelection(null);
          }}
          className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-black py-2 text-sm"
        >
          🗑️ حذف سیم
        </button>
      </div>
    );
  }

  const c = state.components[selection.id];
  if (!c) return null;
  const names = { battery: "🔋 باتری", bulb: "💡 لامپ", switch: "🔘 کلید", resistor: "🔧 مقاومت" };

  return (
    <div className="rounded-2xl bg-white border-2 border-sky-300 p-3 shadow pop-in space-y-2">
      <div className="font-black text-slate-800">{names[c.type]}</div>

      {c.type === "battery" && (
        <div>
          <div className="text-xs text-slate-600 mb-1">قدرت باتری را انتخاب کن:</div>
          <div className="grid grid-cols-3 gap-1">
            {batteryLevels.map((l) => (
              <button
                key={l.level}
                onClick={() => dispatch({ type: "setLevel", id: c.id, level: l.level })}
                className={`rounded-xl border-2 py-2 text-xs font-black transition-transform ${l.color} ${c.level === l.level ? "scale-105 ring-4 ring-sky-300" : "opacity-70 hover:opacity-100"}`}
              >
                <div className="text-base leading-none mb-1">{l.emoji}</div>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {c.type === "resistor" && (
        <div>
          <div className="text-xs text-slate-600 mb-1">اندازهٔ مقاومت را انتخاب کن:</div>
          <div className="grid grid-cols-3 gap-1">
            {resistorLevels.map((l) => (
              <button
                key={l.level}
                onClick={() => dispatch({ type: "setLevel", id: c.id, level: l.level })}
                className={`rounded-xl border-2 py-2 text-xs font-black transition-transform ${l.color} ${c.level === l.level ? "scale-105 ring-4 ring-sky-300" : "opacity-70 hover:opacity-100"}`}
              >
                <div className="text-base leading-none mb-1">{l.emoji}</div>
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-purple-700 mt-1">مقاومت باعث می‌شود عبور جریان سخت‌تر شود.</p>
        </div>
      )}

      {c.type === "switch" && (
        <button
          onClick={() => dispatch({ type: "toggleSwitch", id: c.id })}
          className={`w-full rounded-xl py-3 font-black text-white text-base shadow ${c.closed ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
        >
          {c.closed ? "🟢 کلید بسته است — باز کن" : "🔴 کلید باز است — ببند"}
        </button>
      )}

      {c.type === "bulb" && <p className="text-xs text-slate-600">لامپ انرژی الکتریکی را به نور تبدیل می‌کند. هرچه جریان بیشتر، نور بیشتر!</p>}

      <div className="flex gap-1">
        <button onClick={() => dispatch({ type: "rotate", id: c.id })} className="flex-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-black py-2 text-sm border-2 border-sky-300">
          🔄 بچرخان
        </button>
        <button
          onClick={() => {
            dispatch({ type: "removeComponent", id: c.id });
            setSelection(null);
          }}
          className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black py-2 text-sm"
        >
          🗑️ حذف
        </button>
      </div>
    </div>
  );
}
