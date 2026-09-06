import React, { useState } from "react";
import { type LabObject, density, fmt, OUTCOME_INFO, classify } from "../data";
import { ObjectView } from "./ObjectView";
import { Modal, Btn, Stat } from "./ui";
import { useLab } from "../store";

interface Props {
  objects: LabObject[];
  onDragStart: (obj: LabObject, e: React.PointerEvent) => void;
  onQuickDrop: (obj: LabObject) => void;
}

export function Shelf({ objects, onDragStart, onQuickDrop }: Props) {
  const [info, setInfo] = useState<LabObject | null>(null);
  const { state } = useLab();
  const tested = new Set(state.results.map((r) => r.name));

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {objects.map((o) => (
          <div key={o.id} className="bg-gradient-to-b from-white to-sky-50 rounded-2xl border border-sky-100 p-2 flex flex-col items-center gap-1 shadow-sm relative">
            {tested.has(o.name) && <span className="absolute top-1 left-1 text-xs" title="آزمایش شده">✅</span>}
            <div
              className="no-select cursor-grab active:cursor-grabbing h-16 flex items-center justify-center"
              onPointerDown={(e) => onDragStart(o, e)}
              title="بگیر و داخل آب بینداز"
            >
              <ObjectView obj={o} scale={0.55} />
            </div>
            <div className="text-xs font-black text-sky-900 text-center leading-4">{o.name}</div>
            <div className="text-[10px] text-slate-500">{fmt(o.mass, 0)} گرم · {fmt(o.volume, 0)} سی‌سی</div>
            <div className="flex gap-1 w-full">
              <button onClick={() => onQuickDrop(o)} className="flex-1 text-[11px] font-bold bg-sky-500 text-white rounded-lg py-1 hover:bg-sky-600 active:scale-95">
                بینداز 💧
              </button>
              <button onClick={() => setInfo(o)} className="text-[11px] font-bold bg-slate-100 text-slate-700 rounded-lg px-2 py-1 hover:bg-slate-200" title="اطلاعات بیشتر">
                ℹ️
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!info} onClose={() => setInfo(null)}>
        {info && <InfoCard obj={info} onClose={() => setInfo(null)} />}
      </Modal>
    </>
  );
}

export function InfoCard({ obj, onClose, reveal }: { obj: LabObject; onClose: () => void; reveal?: boolean }) {
  const [more, setMore] = useState(false);
  const rho = density(obj);
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <ObjectView obj={obj} scale={0.9} />
      </div>
      <h3 className="text-xl font-black text-sky-900">{obj.name}</h3>
      <div className="text-sm text-slate-500 mb-3">جنس: {obj.material}{obj.hollow ? " (توخالی)" : ""}</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="جرم" value={obj.mass} unit="گرم" emoji="⚖️" />
        <Stat label="حجم" value={obj.volume} unit="سی‌سی" emoji="📦" />
        <Stat label="چگالی" value={rho} unit="گرم/سی‌سی" emoji="🧮" />
      </div>
      {!more ? (
        <Btn color="slate" size="sm" onClick={() => setMore(true)}>اطلاعات بیشتر 🔍</Btn>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-right leading-7 text-slate-700">
          <div>🧮 چگالی = جرم ÷ حجم = {fmt(obj.mass, 0)} ÷ {fmt(obj.volume, 0)} = <b>{fmt(rho, 2)}</b></div>
          <div>💧 چگالی آب = <b>۱</b> گرم بر سانتی‌متر مکعب</div>
          <div>
            {rho < 1 ? "یعنی هر سی‌سی از این جسم از یک سی‌سی آب سبک‌تر است." : rho > 1 ? "یعنی هر سی‌سی از این جسم از یک سی‌سی آب سنگین‌تر است." : "یعنی هر سی‌سی از این جسم دقیقاً به اندازه‌ی یک سی‌سی آب وزن دارد."}
          </div>
          {obj.fact && <div className="mt-1">💡 {obj.fact}</div>}
          {reveal && <div className="mt-1 font-bold">{OUTCOME_INFO[classify(rho)].emoji} {OUTCOME_INFO[classify(rho)].label}</div>}
        </div>
      )}
      <div className="mt-4">
        <Btn onClick={onClose}>باشه 👍</Btn>
      </div>
    </div>
  );
}
