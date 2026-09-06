import { useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import Quiz, { type QuizData } from "../components/Quiz";
import Toolbar from "../components/Toolbar";
import { Bubble, KidButton, Panel } from "../components/ui";
import { fa } from "../lab/format";
import { makeObject } from "../lab/objects";
import { useDiscoveries } from "../lab/useDiscoveries";
import { useLab } from "../lab/useLab";

const QUIZ: QuizData = {
  question: "وقتی چند پرتو نور موازی از عدسی محدب (برآمده) رد می‌شوند، چه می‌شود؟",
  options: [
    { emoji: "🟢", text: "پرتوها به هم نزدیک می‌شوند و در یک نقطه جمع می‌شوند", correct: true },
    { emoji: "🔵", text: "پرتوها همان‌طور صاف ادامه می‌دهند" },
    { emoji: "🟡", text: "پرتوها برمی‌گردند" },
  ],
  afterCorrect: "آفرین! حالا نقطه درخشان را پیدا کن.",
  afterWrong: "بیا ببینیم عدسی با نور چه می‌کند!",
};

const initial = () => [
  makeObject("source", 120, 270, { angle: 0, rayMode: "parallel", rayCount: 5, spread: 20, label: "چراغ‌قوه" }),
  makeObject("convex", 430, 270, { angle: 90, length: 140, focal: 170 }),
];

export default function LensLab() {
  const lab = useLab(initial);
  const [quizDone, setQuizDone] = useState(false);
  useDiscoveries(lab, quizDone);

  const lens = lab.objects.find((o) => o.kind === "convex" || o.kind === "concave");
  const focus = lab.trace.focusPoint;
  const focusDist = focus && lens ? Math.round(Math.hypot(focus.x - lens.x, focus.y - lens.y)) : null;
  const hasConcave = lab.trace.events.some((e) => e.type === "lens" && e.objectKind === "concave");

  const swapLens = (kind: "convex" | "concave") => {
    const current = lab.objects.find((o) => o.kind === "convex" || o.kind === "concave");
    if (current) lab.remove(current.id);
    lab.add(kind, current?.x ?? 430, current?.y ?? 270, { angle: 90, length: 140, focal: kind === "convex" ? 170 : -170 });
  };

  return (
    <>
      {!quizDone && <Quiz quiz={QUIZ} onDone={() => setQuizDone(true)} />}
      <LabLayout
        title="آزمایش عدسی"
        emoji="🔍"
        subtitle="عدسی را جابه‌جا کن و ببین نقطه‌ی تمرکز نور کجا می‌رود."
        tools={
          <>
            <Inspector lab={lab} />
            <Toolbar lab={lab} tools={["convex", "concave", "target", "mirror"]} />
          </>
        }
        info={
          <>
            <Panel title="عدسی را عوض کن" emoji="🔁">
              <div className="grid grid-cols-2 gap-2">
                <KidButton onClick={() => swapLens("convex")} color="bg-sky-400 text-white" className="!px-2 !py-2 !text-base">
                  🔍 محدب
                </KidButton>
                <KidButton onClick={() => swapLens("concave")} color="bg-fuchsia-400 text-white" className="!px-2 !py-2 !text-base">
                  🔎 مقعر
                </KidButton>
              </div>
              {focusDist !== null && (
                <div className="mt-3 rounded-2xl bg-purple-100 p-3 text-center">
                  <div className="text-xs font-bold text-purple-700">فاصله نقطه تمرکز تا عدسی</div>
                  <div className="text-3xl font-black text-purple-800">{fa(focusDist)}</div>
                  <div className="text-xs font-bold text-purple-500">قدم کوچک</div>
                </div>
              )}
            </Panel>
            <Bubble>
              {focus && <>عدسی می‌تواند مسیر نور را تغییر دهد و بعضی پرتوها را به یک نقطه نزدیک کند. ✨ آن نقطه‌ی درخشان را می‌بینی؟ عدسی را جابه‌جا کن تا نقطه هم حرکت کند!</>}
              {!focus && hasConcave && <>عدسی مقعر (فرورفته) برعکس است: پرتوها را از هم <span className="text-fuchsia-600">دور</span> می‌کند! 🔎</>}
              {!focus && !hasConcave && <>چراغ‌قوه را طوری بگذار که پرتوها از وسط عدسی رد شوند. 👀</>}
            </Bubble>
            <Notebook compact />
          </>
        }
      >
        <LabCanvas lab={lab} showFocus />
      </LabLayout>
    </>
  );
}
