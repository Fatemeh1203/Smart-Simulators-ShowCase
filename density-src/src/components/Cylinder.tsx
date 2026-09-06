import { useState } from "react";
import { OBJECTS, type LabObject, density, fmt } from "../data";
import { ObjectView } from "./ObjectView";
import { Btn } from "./ui";
import { useLab } from "../store";

const CAP = 2000;
const BASE = 500;
const H = 340;
const pxPerMl = H / CAP;

export function Cylinder() {
  const { state, dispatch, award } = useLab();
  const [obj, setObj] = useState<LabObject | null>(null);
  const [inside, setInside] = useState(false);
  const [pushed, setPushed] = useState(false);

  const rho = obj ? density(obj) : 0;
  const floats = rho < 0.97;
  const displaced = !obj || !inside ? 0 : floats && !pushed ? Math.round(obj.mass) : obj.volume;
  const level = BASE + displaced;

  const put = (o: LabObject) => {
    setObj(o);
    setInside(false);
    setPushed(false);
    setTimeout(() => setInside(true), 50);
  };

  const measure = () => {
    if (!state.cylinderMeasured) {
      dispatch({ type: "flag", key: "cylinderMeasured", value: true });
      award(1, "حجم جسم را با جابه‌جایی آب اندازه گرفتی!");
    }
    dispatch({ type: "note", auto: true, text: `📏 حجم ${obj?.name} را با استوانه اندازه گرفتم: ${fmt(obj?.volume ?? 0, 0)} سی‌سی` });
  };

  return (
    <div className="flex gap-3">
      {/* استوانه */}
      <div className="relative shrink-0" style={{ width: 110, height: H + 20 }}>
        <div className="absolute inset-x-2 top-2 bottom-0 rounded-b-2xl border-4 border-t-0 border-sky-300 bg-sky-50/60 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out" style={{ height: level * pxPerMl, background: "linear-gradient(180deg,rgba(56,189,248,0.6),rgba(3,105,161,0.85))" }}>
            <div className="absolute -top-1 inset-x-0 h-2 bg-sky-200/80 rounded-full" />
          </div>
          {obj && inside && (
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
              style={{
                bottom: floats && !pushed ? level * pxPerMl - 22 : rho > 1.03 ? 4 : (level * pxPerMl) / 2 - 20,
              }}
            >
              <ObjectView obj={obj} scale={0.45} />
            </div>
          )}
        </div>
        {/* درجه‌بندی */}
        {Array.from({ length: 9 }).map((_, i) => {
          const ml = (i + 1) * 250;
          if (ml > CAP) return null;
          return (
            <div key={i} className="absolute left-0 flex items-center gap-0.5 pointer-events-none" style={{ bottom: ml * pxPerMl - 1 }}>
              <div className="w-3 h-0.5 bg-sky-700/60" />
              <span className="text-[9px] text-sky-800 font-bold">{fmt(ml, 0)}</span>
            </div>
          );
        })}
        <div className="absolute -bottom-0 inset-x-0 text-center text-[10px] text-slate-500">میلی‌لیتر</div>
      </div>

      {/* کنترل‌ها */}
      <div className="flex-1 text-sm space-y-2">
        <div className="text-xs text-slate-500">یک جسم انتخاب کن:</div>
        <div className="flex flex-wrap gap-1">
          {OBJECTS.slice(0, 12).map((o) => (
            <button key={o.id} onClick={() => put(o)} className={`text-lg rounded-xl border w-9 h-9 flex items-center justify-center ${obj?.id === o.id ? "bg-sky-500 border-sky-600" : "bg-white hover:bg-sky-50"}`} title={o.name}>
              {o.emoji}
            </button>
          ))}
        </div>

        <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100 leading-7">
          <div>سطح آب اول: <b>{fmt(BASE, 0)}</b> میلی‌لیتر</div>
          <div>سطح آب حالا: <b className="text-sky-700 text-base">{fmt(level, 0)}</b> میلی‌لیتر</div>
          {obj && inside && (
            <div className="pop-in">
              <div className="text-sky-900">💧 وقتی جسم وارد آب شد، <b>{fmt(displaced, 0)}</b> میلی‌لیتر آب کنار رفت.</div>
              {floats && !pushed ? (
                <div className="text-amber-800 text-xs mt-1">
                  این جسم شناور است و فقط بخشی از آن زیر آب رفته. برای اندازه‌گیری حجم کامل، آن را با دست زیر آب فشار بده! 👇
                </div>
              ) : (
                <div className="text-green-800 font-bold">
                  📏 حجم جسم = {fmt(level, 0)} − {fmt(BASE, 0)} = {fmt(displaced, 0)} سی‌سی
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {obj && inside && floats && !pushed && (
            <Btn size="sm" color="amber" onClick={() => setPushed(true)}>👇 زیر آب فشار بده</Btn>
          )}
          {obj && inside && (!floats || pushed) && (
            <Btn size="sm" color="green" onClick={measure}>✅ ثبت اندازه‌گیری</Btn>
          )}
          {obj && (
            <Btn size="sm" color="slate" onClick={() => { setObj(null); setInside(false); setPushed(false); }}>خالی کن</Btn>
          )}
        </div>
        <div className="text-[11px] text-slate-500 leading-5">
          💡 هر جسمی که وارد آب می‌شود، به اندازه‌ی جایی که می‌گیرد، آب را کنار می‌زند. پس با نگاه کردن به سطح آب می‌فهمیم جسم چقدر جا گرفته است!
        </div>
      </div>
    </div>
  );
}
