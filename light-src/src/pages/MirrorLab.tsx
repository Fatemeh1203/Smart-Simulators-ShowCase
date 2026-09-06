import { useEffect, useRef, useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import Quiz, { type QuizData } from "../components/Quiz";
import Toolbar from "../components/Toolbar";
import { Bubble, Panel, Toggle } from "../components/ui";
import { deg } from "../lab/format";
import { makeObject } from "../lab/objects";
import { useStore } from "../lab/store";
import { useDiscoveries } from "../lab/useDiscoveries";
import { useLab } from "../lab/useLab";

const QUIZ: QuizData = {
  question: "اگر آینه را بچرخانیم، مسیر نور چه تغییری می‌کند؟",
  options: [
    { emoji: "🟢", text: "مسیر نور تغییر می‌کند", correct: true },
    { emoji: "🔵", text: "نور ناپدید می‌شود" },
    { emoji: "🟡", text: "هیچ اتفاقی نمی‌افتد" },
  ],
  afterCorrect: "درست حدس زدی! حالا خودت امتحان کن.",
  afterWrong: "بیا آزمایش کنیم و ببینیم واقعاً چه می‌شود!",
};

const initial = () => [
  makeObject("source", 150, 110, { angle: 38, label: "چراغ‌قوه" }),
  makeObject("mirror", 470, 400, { angle: 0, length: 220 }),
];

export default function MirrorLab() {
  const lab = useLab(initial);
  const { discover } = useStore();
  const [quizDone, setQuizDone] = useState(false);
  const [showAngles, setShowAngles] = useState(true);
  const [showProt, setShowProt] = useState(true);
  const seenAngles = useRef(new Set<number>());
  const [changes, setChanges] = useState(0);
  useDiscoveries(lab, quizDone);

  const hit = lab.trace.firstMirrorHit;
  const inc = hit ? Math.round(hit.incidence) : null;

  useEffect(() => {
    if (inc === null || !quizDone) return;
    const s = seenAngles.current;
    if (!s.has(inc)) {
      s.add(inc);
      setChanges(s.size);
      if (s.size >= 4) discover("angles");
    }
  }, [inc, quizDone, discover]);

  return (
    <>
      {!quizDone && <Quiz quiz={QUIZ} onDone={() => setQuizDone(true)} />}
      <LabLayout
        title="آزمایش آینه"
        emoji="🪞"
        subtitle="چراغ‌قوه یا آینه را بچرخان و ببین نور چطور برمی‌گردد."
        tools={
          <>
            <Inspector lab={lab} />
            <Toolbar lab={lab} tools={["mirror", "protractor", "target", "source"]} />
          </>
        }
        info={
          <>
            <Panel title="زاویه‌ها" emoji="📐">
              <div className="mb-3 flex flex-wrap gap-2">
                <Toggle checked={showAngles} onChange={setShowAngles} label="نمایش زاویه‌ها" />
                <Toggle checked={showProt} onChange={setShowProt} label="نقاله" />
              </div>
              {hit ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-green-100 p-3 text-center">
                    <div className="text-xs font-bold text-green-700">زاویه تابش</div>
                    <div className="text-3xl font-black text-green-800">{deg(hit.incidence)}</div>
                    <div className="mx-auto mt-1 h-1.5 w-12 rounded bg-green-500" />
                  </div>
                  <div className="rounded-2xl bg-blue-100 p-3 text-center">
                    <div className="text-xs font-bold text-blue-700">زاویه بازتاب</div>
                    <div className="text-3xl font-black text-blue-800">{deg(hit.outAngle)}</div>
                    <div className="mx-auto mt-1 h-1.5 w-12 rounded bg-blue-500" />
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">نور به آینه نمی‌رسد! چراغ‌قوه یا آینه را بچرخان تا پرتو به آینه بخورد.</p>
              )}
              {hit && (
                <p className="mt-2 text-center text-xs font-bold text-slate-500">
                  زاویه‌ها از «خط عمود» (خط‌چین سفید) اندازه گرفته می‌شوند.
                </p>
              )}
            </Panel>
            <Bubble>
              {!hit && <>نور را به آینه برسان و ببین چه می‌شود! 👀</>}
              {hit && changes < 2 && <>نور بعد از برخورد با آینه برمی‌گردد. 🪞 حالا زاویه چراغ‌قوه یا آینه را تغییر بده!</>}
              {hit && changes >= 2 && (
                <>
                  دیدی؟ زاویه‌ای که نور به آینه می‌رسد با زاویه‌ای که برمی‌گردد <span className="text-green-600">برابر</span> است! 📐✨
                  {changes < 4 && <div className="mt-1 text-xs text-slate-500">چند بار دیگر زاویه را عوض کن تا مطمئن شوی.</div>}
                </>
              )}
            </Bubble>
            <Notebook compact />
          </>
        }
      >
        <LabCanvas lab={lab} showAngles={showAngles} autoProtractor={showProt} />
      </LabLayout>
    </>
  );
}
