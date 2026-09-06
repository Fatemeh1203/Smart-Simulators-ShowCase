import React, { useMemo, useState } from "react";
import { type LabObject, type Shape, MATERIALS, fmt, classify, OUTCOME_INFO } from "../data";
import { ObjectView } from "./ObjectView";
import { Btn } from "./ui";

let customCount = 1;

interface Props {
  onDrop: (obj: LabObject) => void;
  onDragStart: (obj: LabObject, e: React.PointerEvent) => void;
}

export function Builder({ onDrop, onDragStart }: Props) {
  const [mass, setMass] = useState(400);
  const [volume, setVolume] = useState(500);
  const [shape, setShape] = useState<Shape>("square");
  const [mat, setMat] = useState(1);
  const [showHint, setShowHint] = useState(false);

  const rho = mass / volume;
  const outcome = classify(rho);
  const m = MATERIALS[mat];

  const obj: LabObject = useMemo(
    () => ({
      id: `custom-${customCount}`,
      name: `جسم من (${m.name})`,
      emoji: shape === "circle" ? "🔮" : "🎁",
      material: m.name,
      mass,
      volume,
      shape,
      color: m.color,
      custom: true,
    }),
    [mass, volume, shape, m]
  );

  const pickMaterial = (i: number) => {
    setMat(i);
    setMass(Math.round(MATERIALS[i].rho * volume));
  };

  const drop = () => {
    customCount++;
    onDrop({ ...obj, id: `custom-${customCount}` });
  };

  const gauge = Math.min(100, (rho / 2) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="no-select cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center w-24 h-24 bg-sky-50 rounded-2xl border border-dashed border-sky-300" onPointerDown={(e) => onDragStart({ ...obj, id: `custom-${++customCount}` }, e)}>
          <ObjectView obj={obj} scale={Math.min(1, 68 / Math.cbrt(volume) / 10)} />
        </div>
        <div className="flex-1 text-sm">
          <div className="bg-gradient-to-l from-violet-50 to-sky-50 rounded-2xl p-3 border border-violet-100">
            <div className="text-xs text-slate-500 mb-1">🧮 چگالی = جرم ÷ حجم</div>
            <div className="font-black text-sky-900 text-base">
              {fmt(mass, 0)} ÷ {fmt(volume, 0)} = <span className="text-violet-700 text-xl">{fmt(rho, 2)}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-gradient-to-l from-green-300 via-blue-300 to-red-300 relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-violet-600 shadow" style={{ right: `calc(${gauge}% - 10px)` }} />
              <div className="absolute -top-4 text-[10px] text-blue-700 font-bold" style={{ right: "calc(50% - 8px)" }}>آب=۱</div>
            </div>
            <div className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${OUTCOME_INFO[outcome].color}`}>
              پیش‌بینی: {OUTCOME_INFO[outcome].emoji} {OUTCOME_INFO[outcome].label}
            </div>
          </div>
        </div>
      </div>

      <label className="block">
        <div className="flex justify-between text-sm font-bold text-slate-700">
          <span>⚖️ جرم</span>
          <span>{fmt(mass, 0)} گرم</span>
        </div>
        <input type="range" min={20} max={4000} step={10} value={mass} onChange={(e) => setMass(+e.target.value)} className="w-full" />
      </label>
      <label className="block">
        <div className="flex justify-between text-sm font-bold text-slate-700">
          <span>📦 حجم</span>
          <span>{fmt(volume, 0)} سی‌سی</span>
        </div>
        <input type="range" min={50} max={2000} step={10} value={volume} onChange={(e) => setVolume(+e.target.value)} className="w-full" />
      </label>

      <div>
        <div className="text-sm font-bold text-slate-700 mb-1">🧱 جنس (جرم را خودکار تنظیم می‌کند)</div>
        <div className="flex flex-wrap gap-1">
          {MATERIALS.map((mm, i) => (
            <button key={mm.name} onClick={() => pickMaterial(i)} className={`text-xs font-bold px-2 py-1 rounded-xl border transition ${i === mat ? "bg-violet-500 text-white border-violet-600" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
              {mm.emoji} {mm.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700">شکل:</span>
        <button onClick={() => setShape("square")} className={`px-3 py-1 rounded-xl text-sm font-bold border ${shape === "square" ? "bg-sky-500 text-white" : "bg-white"}`}>◼ مکعب</button>
        <button onClick={() => setShape("circle")} className={`px-3 py-1 rounded-xl text-sm font-bold border ${shape === "circle" ? "bg-sky-500 text-white" : "bg-white"}`}>⚫ توپ</button>
      </div>

      <div className="flex gap-2">
        <Btn color="violet" onClick={drop} className="flex-1">بینداز در آب 💧</Btn>
        <Btn color="slate" onClick={() => setShowHint((v) => !v)}>❓</Btn>
      </div>

      {showHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm leading-7 text-slate-700 pop-in">
          <div className="font-black text-amber-900">امتحان کن:</div>
          <ul className="list-disc pr-5">
            <li>اگر جرم را زیاد کنم چه می‌شود؟</li>
            <li>اگر حجم را زیاد کنم چه می‌شود؟</li>
            <li>آیا یک جسم بزرگ همیشه فرو می‌رود؟ (حجم ۲۰۰۰، جرم ۲۰۰)</li>
            <li>آیا یک جسم کوچک همیشه شناور است؟ (حجم ۵۰، جرم ۴۰۰)</li>
            <li>می‌توانی چگالی را دقیقاً ۱ کنی تا معلق بماند؟</li>
          </ul>
          <div className="font-bold text-violet-800 mt-1">💡 اندازه‌ی جسم به‌تنهایی تعیین نمی‌کند که شناور باشد یا فرو برود!</div>
        </div>
      )}
    </div>
  );
}
