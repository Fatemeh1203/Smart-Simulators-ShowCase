import { useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import Quiz, { type QuizData } from "../components/Quiz";
import Toolbar from "../components/Toolbar";
import { Bubble, KidButton, Panel, Toggle } from "../components/ui";
import { deg } from "../lab/format";
import { makeObject } from "../lab/objects";
import { useDiscoveries } from "../lab/useDiscoveries";
import { useLab } from "../lab/useLab";

const QUIZ: QuizData = {
  question: "وقتی نور وارد آب می‌شود، چه اتفاقی برای مسیر آن می‌افتد؟",
  options: [
    { emoji: "🟢", text: "مسیرش کمی کج می‌شود", correct: true },
    { emoji: "🔵", text: "نور برمی‌گردد و وارد آب نمی‌شود" },
    { emoji: "🟡", text: "هیچ تغییری نمی‌کند" },
  ],
  afterCorrect: "درسته! به این اتفاق «شکست نور» می‌گوییم.",
  afterWrong: "بیا نور را به آب بتابانیم و نگاه کنیم!",
};

const initial = () => [
  makeObject("source", 500, 90, { angle: 62, label: "چراغ‌قوه" }),
  makeObject("water", 560, 370, { w: 300, h: 170, showPencil: true }),
];

export default function WaterLab() {
  const lab = useLab(initial);
  const [quizDone, setQuizDone] = useState(false);
  const [showAngles, setShowAngles] = useState(true);
  useDiscoveries(lab, quizDone);

  const entry = lab.trace.events.find((e) => e.type === "refract");
  const water = lab.objects.find((o) => o.kind === "water");

  const addGlass = () => lab.add("glass", 300, 420, { w: 160, h: 110 });

  return (
    <>
      {!quizDone && <Quiz quiz={QUIZ} onDone={() => setQuizDone(true)} />}
      <LabLayout
        title="آب و شکست نور"
        emoji="💧"
        subtitle="به مداد داخل آب نگاه کن، بعد نور را وارد آب کن و مسیرش را دنبال کن."
        tools={
          <>
            <Inspector lab={lab} />
            <Toolbar lab={lab} tools={["water", "glass", "mirror", "source"]} />
          </>
        }
        info={
          <>
            <Panel title="مشاهده" emoji="👀">
              <div className="mb-3 flex flex-wrap gap-2">
                <Toggle checked={showAngles} onChange={setShowAngles} label="نشان دادن نقطه شکست" />
                {water && <Toggle checked={!!water.showPencil} onChange={(v) => lab.update(water.id, { showPencil: v })} label="✏️ مداد در آب" />}
              </div>
              {entry ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-yellow-100 p-3 text-center">
                    <div className="text-xs font-bold text-yellow-700">زاویه ورود (در هوا)</div>
                    <div className="text-3xl font-black text-yellow-800">{deg(entry.incidence)}</div>
                  </div>
                  <div className="rounded-2xl bg-cyan-100 p-3 text-center">
                    <div className="text-xs font-bold text-cyan-700">زاویه بعد از ورود ({entry.objectKind === "water" ? "در آب" : "در شیشه"})</div>
                    <div className="text-3xl font-black text-cyan-800">{deg(entry.outAngle)}</div>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">نور هنوز وارد آب نشده. چراغ‌قوه را بچرخان تا پرتو به آب بخورد.</p>
              )}
              <KidButton onClick={addGlass} color="bg-cyan-500 text-white" className="mt-3 w-full !py-2 !text-base">
                🧊 یک قطعه شیشه هم اضافه کن
              </KidButton>
            </Panel>
            <Bubble>
              {entry ? (
                <>
                  وقتی نور از یک ماده (هوا) وارد ماده‌ی دیگری (آب) می‌شود، ممکن است مسیرش تغییر کند. به این اتفاق <span className="text-cyan-600">شکست نور</span> می‌گوییم. 💧
                  <div className="mt-1 text-xs text-slate-500">به همین دلیل مداد داخل آب شکسته به نظر می‌رسد!</div>
                </>
              ) : (
                <>به مداد داخل آب نگاه کن... انگار شکسته! 🤔 حالا نور را وارد آب کن تا بفهمی چرا.</>
              )}
            </Bubble>
            <Notebook compact />
          </>
        }
      >
        <LabCanvas lab={lab} showAngles={showAngles} />
      </LabLayout>
    </>
  );
}
