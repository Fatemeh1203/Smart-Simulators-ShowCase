import { useEffect, useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import { Bubble, Confetti, KidButton, Panel, Stars, SuccessBanner, useDebouncedFlag } from "../components/ui";
import { fa } from "../lab/format";
import { makeObject } from "../lab/objects";
import { playChime, useStore } from "../lab/store";
import type { LabObject, TraceResult } from "../lab/types";
import { useLab } from "../lab/useLab";

const fixed = { movable: false, rotatable: false, deletable: false };
const rotOnly = { movable: false, rotatable: true, deletable: false };

interface Mission {
  title: string;
  emoji: string;
  text: string;
  tip: string;
  type: "lab" | "classify";
  build?: () => LabObject[];
  check?: (t: TraceResult, objs: LabObject[]) => boolean;
  showFocus?: boolean;
}

const MISSIONS: Mission[] = [
  {
    title: "مأموریت ۱", emoji: "⭐", type: "lab",
    text: "نور را با آینه به ستاره برسان.",
    tip: "آینه را هم می‌توانی جابه‌جا کنی و هم بچرخانی.",
    build: () => [
      makeObject("source", 100, 120, { angle: 0, ...fixed }),
      makeObject("mirror", 420, 300, { angle: 30, length: 130, movable: true, rotatable: true, deletable: false }),
      makeObject("target", 520, 470, { ...fixed }),
    ],
    check: (t) => t.targetsHit.size > 0,
  },
  {
    title: "مأموریت ۲", emoji: "🔁", type: "lab",
    text: "آینه را طوری بچرخان که نور به هدف برسد.",
    tip: "این‌بار آینه ثابت است؛ فقط باید زاویه‌اش را درست کنی.",
    build: () => [
      makeObject("source", 100, 400, { angle: 330, ...fixed }),
      makeObject("mirror", 500, 169, { angle: 10, length: 140, ...rotOnly }),
      makeObject("target", 800, 400, { ...fixed }),
    ],
    check: (t) => t.targetsHit.size > 0,
  },
  {
    title: "مأموریت ۳", emoji: "🪞🪞", type: "lab",
    text: "مسیر نور را با دو آینه تغییر بده.",
    tip: "نور باید از هر دو آینه بازتاب شود و بعد به ستاره برسد.",
    build: () => [
      makeObject("source", 100, 270, { angle: 0, ...fixed }),
      makeObject("mirror", 450, 270, { angle: 100, length: 130, ...rotOnly }),
      makeObject("mirror", 450, 80, { angle: 60, length: 130, ...rotOnly }),
      makeObject("target", 800, 80, { ...fixed }),
    ],
    check: (t) => t.targetsHit.size > 0 && t.events.filter((e) => e.type === "reflect").length >= 2,
  },
  {
    title: "مأموریت ۴", emoji: "🔍", type: "lab", showFocus: true,
    text: "عدسی را در جای مناسب قرار بده تا نور در نقطه مشخص جمع شود.",
    tip: "عدسی را بکش تا نقطه‌ی درخشان تمرکز دقیقاً روی حلقه‌ی هدف بیفتد.",
    build: () => [
      makeObject("source", 90, 270, { angle: 0, rayMode: "parallel", rayCount: 5, spread: 20, ...fixed }),
      makeObject("convex", 300, 270, { angle: 90, length: 140, focal: 170, movable: true, rotatable: false, deletable: false }),
      makeObject("target", 640, 270, { r: 22, ...fixed, label: "نقطه هدف" }),
    ],
    check: (t, objs) => {
      const target = objs.find((o) => o.kind === "target");
      if (!t.focusPoint || !target) return false;
      return Math.hypot(t.focusPoint.x - target.x, t.focusPoint.y - target.y) < 22;
    },
  },
  {
    title: "مأموریت ۵", emoji: "🧠", type: "classify",
    text: "تشخیص بده کدام تصویر مربوط به بازتاب و کدام مربوط به شکست نور است.",
    tip: "به مسیر نور نگاه کن: برمی‌گردد یا کج می‌شود؟",
  },
];

/* ---------- classification mini-scenes ---------- */
type Kind = "reflect" | "refract";
const SCENES: { id: number; title: string; answer: Kind; svg: React.ReactNode }[] = [
  {
    id: 1, title: "نور و آینه", answer: "reflect",
    svg: (
      <svg viewBox="0 0 160 110" className="h-28 w-full">
        <rect width="160" height="110" fill="#0f172a" rx="8" />
        <line x1="30" y1="95" x2="130" y2="95" stroke="#cbd5e1" strokeWidth="6" />
        <line x1="20" y1="20" x2="80" y2="92" stroke="#fde047" strokeWidth="3" />
        <line x1="80" y1="92" x2="140" y2="20" stroke="#fde047" strokeWidth="3" />
        <text x="8" y="18" fontSize="14">🔦</text>
      </svg>
    ),
  },
  {
    id: 2, title: "نی داخل لیوان آب", answer: "refract",
    svg: (
      <svg viewBox="0 0 160 110" className="h-28 w-full">
        <rect width="160" height="110" fill="#0f172a" rx="8" />
        <rect x="50" y="40" width="60" height="60" fill="#38bdf8" fillOpacity="0.6" stroke="#e0f2fe" strokeWidth="2" />
        <line x1="60" y1="10" x2="78" y2="40" stroke="#f472b6" strokeWidth="6" strokeLinecap="round" />
        <line x1="88" y1="42" x2="100" y2="92" stroke="#f472b6" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3, title: "نور وارد شیشه می‌شود", answer: "refract",
    svg: (
      <svg viewBox="0 0 160 110" className="h-28 w-full">
        <rect width="160" height="110" fill="#0f172a" rx="8" />
        <rect x="70" y="10" width="70" height="90" fill="#a5f3fc" fillOpacity="0.4" stroke="#e0f2fe" strokeWidth="2" />
        <line x1="10" y1="20" x2="70" y2="55" stroke="#fde047" strokeWidth="3" />
        <line x1="70" y1="55" x2="140" y2="75" stroke="#fde047" strokeWidth="3" />
        <text x="6" y="18" fontSize="14">🔦</text>
      </svg>
    ),
  },
  {
    id: 4, title: "نور و سطح آب آرام", answer: "reflect",
    svg: (
      <svg viewBox="0 0 160 110" className="h-28 w-full">
        <rect width="160" height="110" fill="#0f172a" rx="8" />
        <rect x="0" y="70" width="160" height="40" fill="#0ea5e9" fillOpacity="0.5" />
        <line x1="20" y1="20" x2="80" y2="70" stroke="#fde047" strokeWidth="3" />
        <line x1="80" y1="70" x2="140" y2="20" stroke="#fde047" strokeWidth="3" />
        <text x="8" y="18" fontSize="14">☀️</text>
        <text x="70" y="60" fontSize="12" fill="#fff">آینه‌ی طبیعی</text>
      </svg>
    ),
  },
];

function ClassifyMission({ onResult }: { onResult: (correct: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, Kind>>({});
  const doneCount = Object.keys(answers).length;
  const finished = doneCount === SCENES.length;
  const correct = SCENES.filter((s) => answers[s.id] === s.answer).length;
  useEffect(() => {
    if (finished) onResult(correct);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rounded-[28px] bg-gradient-to-b from-[#b5722e] to-[#7c4a15] p-3 shadow-[0_12px_0_#5c3610]">
      <div className="grid gap-3 rounded-[18px] bg-[#0b1437] p-4 sm:grid-cols-2">
        {SCENES.map((s) => {
          const a = answers[s.id];
          return (
            <div key={s.id} className="rounded-2xl bg-white p-3">
              {s.svg}
              <div className="mt-2 text-center text-sm font-black text-slate-700">{s.title}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["reflect", "refract"] as Kind[]).map((k) => {
                  let cls = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                  if (a) {
                    if (k === s.answer) cls = "bg-green-200 text-green-900";
                    else if (a === k) cls = "bg-rose-200 text-rose-900";
                    else cls = "bg-slate-100 text-slate-400";
                  }
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={!!a}
                      onClick={() => {
                        playChime(k === s.answer ? "success" : "wrong");
                        setAnswers((p) => ({ ...p, [s.id]: k }));
                      }}
                      className={`rounded-xl py-2 text-sm font-black transition ${cls}`}
                    >
                      {k === "reflect" ? "🪞 بازتاب" : "💧 شکست"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function Missions() {
  const { missionStars, setMissionStars, score, discover } = useStore();
  const [idx, setIdx] = useState(0);
  const m = MISSIONS[idx];
  const lab = useLab(() => MISSIONS[0].build!());
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    if (m.type === "lab" && m.build) lab.replaceAll(m.build());
    setDone(false);
    setEarned(0);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const ok = m.type === "lab" && !!m.check && m.check(lab.trace, lab.objects);
  const stable = useDebouncedFlag(ok, 500);
  useEffect(() => {
    if (stable && !done) {
      setDone(true);
      setEarned(3);
      playChime("success");
      setMissionStars(idx + 1, 3);
      if (idx === 3) discover("lens");
      else discover("target");
    }
  }, [stable, done, idx, setMissionStars, discover]);

  const onClassified = (correct: number) => {
    const stars = correct === 4 ? 3 : correct === 3 ? 2 : 1;
    setEarned(stars);
    setDone(true);
    playChime("success");
    setMissionStars(5, stars);
    discover("compare");
  };

  const totalStars = Object.values(missionStars).reduce((a, b) => a + b, 0);

  return (
    <>
      <Confetti show={done} />
      <LabLayout
        title="ماموریت نور"
        emoji="🏆"
        subtitle="پنج مأموریت، پانزده ستاره! چند ستاره می‌توانی بگیری؟"
        tools={
          <>
            <Panel title="مأموریت‌ها" emoji="📋">
              <div className="space-y-2">
                {MISSIONS.map((mm, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`flex w-full items-center gap-2 rounded-2xl border-4 p-2 text-right transition ${i === idx ? "border-orange-400 bg-orange-100" : "border-white bg-white hover:bg-orange-50"}`}
                  >
                    <span className="text-2xl">{mm.emoji}</span>
                    <span className="flex-1 text-sm font-black text-slate-700">{mm.title}</span>
                    <Stars n={missionStars[i + 1] ?? 0} size="text-sm" />
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-yellow-100 p-2 text-center text-sm font-black text-yellow-900">
                ⭐ {fa(totalStars)} از {fa(15)} ستاره &nbsp;|&nbsp; 🏅 {fa(score)} امتیاز
              </div>
            </Panel>
            {m.type === "lab" && <Inspector lab={lab} lockRays />}
          </>
        }
        info={
          <>
            <Panel title={m.title} emoji={m.emoji}>
              <p className="text-lg font-black leading-8 text-slate-800">«{m.text}»</p>
              <p className="mt-2 text-sm font-bold text-slate-500">💡 {m.tip}</p>
              {m.type === "lab" && (
                <KidButton onClick={() => { lab.replaceAll(m.build!()); setDone(false); }} color="bg-slate-200 text-slate-700" className="mt-3 w-full !py-2 !text-base">
                  🔄 دوباره از اول
                </KidButton>
              )}
            </Panel>
            {done ? (
              <SuccessBanner
                text={earned === 3 ? "آفرین! مأموریت انجام شد." : "خوب بود! مأموریت انجام شد."}
                sub={earned === 3 ? "سه ستاره گرفتی!" : "دفعه بعد می‌توانی ستاره‌های بیشتری بگیری."}
                stars={earned}
                onNext={idx < MISSIONS.length - 1 ? () => setIdx(idx + 1) : undefined}
                nextLabel="مأموریت بعد ⬅"
              />
            ) : (
              <Bubble emoji="🦸">
                {m.type === "classify" ? <>برای هر تصویر بگو بازتاب است یا شکست. 🤔</> : idx === 3 ? <>عدسی را به چپ و راست بکش. نقطه‌ی درخشان باید وسط حلقه بیفتد! ✨</> : <>روی آینه بزن و دایره نارنجی ↻ را بکش تا نور را هدایت کنی. 🔦</>}
              </Bubble>
            )}
            <Notebook compact />
          </>
        }
      >
        {m.type === "lab" ? <LabCanvas lab={lab} allowDrop={false} showFocus={m.showFocus} /> : <ClassifyMission key={idx} onResult={onClassified} />}
      </LabLayout>
    </>
  );
}
