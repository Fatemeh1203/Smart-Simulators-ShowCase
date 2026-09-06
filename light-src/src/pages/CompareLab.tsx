import { useEffect, useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import Notebook from "../components/Notebook";
import { Bubble, Panel } from "../components/ui";
import { makeObject } from "../lab/objects";
import { useStore } from "../lab/store";
import { useDiscoveries } from "../lab/useDiscoveries";
import { useLab } from "../lab/useLab";

const reflectScene = () => [
  makeObject("source", 160, 120, { angle: 40 }),
  makeObject("mirror", 480, 400, { angle: 0, length: 220 }),
];
const refractScene = () => [
  makeObject("source", 250, 80, { angle: 50 }),
  makeObject("water", 520, 380, { w: 300, h: 170 }),
];

export default function CompareLab() {
  const [tab, setTab] = useState<"reflect" | "refract">("reflect");
  const [seen, setSeen] = useState<Set<string>>(new Set(["reflect"]));
  const reflectLab = useLab(reflectScene);
  const refractLab = useLab(refractScene);
  const { discover } = useStore();
  useDiscoveries(reflectLab);
  useDiscoveries(refractLab);

  useEffect(() => {
    setSeen((s) => new Set(s).add(tab));
  }, [tab]);
  useEffect(() => {
    if (seen.size === 2) {
      const t = setTimeout(() => discover("compare"), 2500);
      return () => clearTimeout(t);
    }
  }, [seen, discover]);

  const lab = tab === "reflect" ? reflectLab : refractLab;

  return (
    <div className="mx-auto max-w-[1500px] px-3 pb-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-4xl">⚖️</span>
        <div>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">مقایسه بازتاب و شکست</h1>
          <p className="text-sm font-bold text-slate-500">هر دو آزمایش را ببین و تفاوت‌شان را پیدا کن.</p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("reflect")}
          className={`rounded-3xl border-4 p-4 text-right transition ${tab === "reflect" ? "border-sky-400 bg-sky-100 shadow-lg" : "border-white bg-white/70 hover:bg-sky-50"}`}
        >
          <div className="text-2xl font-black text-sky-800">🪞 بازتاب</div>
          <div className="mt-1 text-base font-bold text-slate-600">نور به آینه برخورد می‌کند و برمی‌گردد.</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-sky-700">
            <span className="rounded-full bg-sky-200 px-2 py-0.5">نور برمی‌گردد ↩️</span>
            <span className="rounded-full bg-sky-200 px-2 py-0.5">زاویه‌ها برابرند</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setTab("refract")}
          className={`rounded-3xl border-4 p-4 text-right transition ${tab === "refract" ? "border-cyan-400 bg-cyan-100 shadow-lg" : "border-white bg-white/70 hover:bg-cyan-50"}`}
        >
          <div className="text-2xl font-black text-cyan-800">💧 شکست</div>
          <div className="mt-1 text-base font-bold text-slate-600">نور وارد آب یا شیشه می‌شود و مسیرش تغییر می‌کند.</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-cyan-700">
            <span className="rounded-full bg-cyan-200 px-2 py-0.5">نور عبور می‌کند ↘️</span>
            <span className="rounded-full bg-cyan-200 px-2 py-0.5">مسیر کج می‌شود</span>
          </div>
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <div className="order-2 xl:order-1">
          <Inspector lab={lab} />
        </div>
        <div className="order-1 xl:order-2">
          {tab === "reflect" ? (
            <LabCanvas key="reflect" lab={reflectLab} showAngles autoProtractor />
          ) : (
            <LabCanvas key="refract" lab={refractLab} showAngles />
          )}
        </div>
        <div className="order-3 space-y-4">
          <Bubble>
            {tab === "reflect" ? (
              <>در <span className="text-sky-600">بازتاب</span>، نور به آینه می‌خورد و به همان محیط (هوا) برمی‌گردد. مثل توپی که به دیوار می‌خورد! ⚽</>
            ) : (
              <>در <span className="text-cyan-600">شکست</span>، نور وارد ماده‌ی جدید می‌شود و همان‌جا مسیرش کمی کج می‌شود. مثل ماشینی که از آسفالت وارد شن می‌شود و می‌پیچد! 🚗</>
            )}
          </Bubble>
          <Panel title="تفاوت اصلی" emoji="💡">
            <table className="w-full text-sm font-bold text-slate-700">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 text-sky-700">🪞 بازتاب</td>
                  <td className="py-2">نور برمی‌گردد</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-700">💧 شکست</td>
                  <td className="py-2">نور رد می‌شود ولی کج می‌شود</td>
                </tr>
              </tbody>
            </table>
            {seen.size < 2 && <p className="mt-2 text-xs font-bold text-amber-700">👆 آزمایش دیگر را هم ببین تا کشف جدید بگیری!</p>}
          </Panel>
          <Notebook compact />
        </div>
      </div>
    </div>
  );
}
