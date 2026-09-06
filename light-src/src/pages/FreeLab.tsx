import { useEffect, useRef, useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import Toolbar from "../components/Toolbar";
import { Bubble, Panel, Toggle } from "../components/ui";
import { deg, fa } from "../lab/format";
import { makeObject } from "../lab/objects";
import { useStore } from "../lab/store";
import { useDiscoveries } from "../lab/useDiscoveries";
import { useLab } from "../lab/useLab";

const initial = () => [makeObject("source", 140, 270, { angle: 0, label: "چراغ‌قوه" })];

export default function FreeLab() {
  const lab = useLab(initial);
  const [showAngles, setShowAngles] = useState(true);
  const [showFocus, setShowFocus] = useState(true);
  const { discover } = useStore();
  useDiscoveries(lab);

  // "light travels straight" — discovered when the student moves/rotates the source
  const firstSource = useRef<{ x: number; y: number; angle: number } | null>(null);
  const src = lab.objects.find((o) => o.kind === "source");
  useEffect(() => {
    if (!src) return;
    if (!firstSource.current) {
      firstSource.current = { x: src.x, y: src.y, angle: src.angle };
      return;
    }
    const f = firstSource.current;
    if (f.x !== src.x || f.y !== src.y || f.angle !== src.angle) {
      const t = setTimeout(() => discover("straight"), 1200);
      return () => clearTimeout(t);
    }
  }, [src, discover]);

  const counts = lab.objects.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.kind]: (acc[o.kind] ?? 0) + 1 }), {});
  const reflects = lab.trace.events.filter((e) => e.type === "reflect").length;
  const refracts = lab.trace.events.filter((e) => e.type === "refract").length;
  const hits = lab.trace.targetsHit.size;
  const mirrorHit = lab.trace.firstMirrorHit;

  return (
    <LabLayout
      title="خودت آزمایش کن"
      emoji="🔬"
      subtitle="هر وسیله‌ای می‌خواهی روی میز بگذار، جابه‌جا کن، بچرخان و نتیجه را ببین."
      tools={
        <>
          <Toolbar lab={lab} />
          <Inspector lab={lab} />
        </>
      }
      info={
        <>
          <Panel title="چه خبر است؟" emoji="📊">
            <div className="mb-3 flex flex-wrap gap-2">
              <Toggle checked={showAngles} onChange={setShowAngles} label="زاویه‌ها" />
              <Toggle checked={showFocus} onChange={setShowFocus} label="نقطه تمرکز" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm font-bold">
              <div className="rounded-xl bg-sky-100 p-2 text-sky-800">🪞 بازتاب: {fa(reflects)}</div>
              <div className="rounded-xl bg-cyan-100 p-2 text-cyan-800">💧 شکست: {fa(refracts)}</div>
              <div className="rounded-xl bg-pink-100 p-2 text-pink-800">🎯 هدف‌ها: {fa(hits)}</div>
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">🧰 وسیله‌ها: {fa(lab.objects.length)}</div>
            </div>
            {mirrorHit && (
              <div className="mt-2 flex justify-between rounded-xl bg-green-50 px-3 py-2 text-sm font-bold">
                <span className="text-green-700">تابش {deg(mirrorHit.incidence)}</span>
                <span className="text-blue-700">بازتاب {deg(mirrorHit.outAngle)}</span>
              </div>
            )}
          </Panel>
          <Bubble>
            {lab.objects.length <= 1 && <>میز خالی است! از جعبه ابزار یک آینه یا ظرف آب بکش و روی میز بینداز. 🧰</>}
            {lab.objects.length > 1 && !reflects && !refracts && !lab.trace.focusPoint && <>حالا چراغ‌قوه را طوری بچرخان که نور به وسیله‌ها بخورد. 🔦</>}
            {reflects > 0 && !refracts && <>نور از آینه برگشت! {counts.mirror > 1 ? "با چند آینه می‌توانی نور را دور کل میز بچرخانی!" : "یک آینه دیگر اضافه کن و مسیر را طولانی‌تر کن."} 🪞</>}
            {refracts > 0 && <>نور موقع ورود به {counts.water ? "آب" : "شیشه"} کج شد! این «شکست نور» است. 💧 حالا زاویه چراغ‌قوه را عوض کن و ببین چقدر کج می‌شود.</>}
          </Bubble>
          <Notebook compact />
        </>
      }
    >
      <LabCanvas lab={lab} showAngles={showAngles} showFocus={showFocus} />
    </LabLayout>
  );
}
