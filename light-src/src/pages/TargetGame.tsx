import { useEffect, useState } from "react";
import Inspector from "../components/Inspector";
import LabCanvas from "../components/LabCanvas";
import LabLayout from "../components/LabLayout";
import Notebook from "../components/Notebook";
import { Bubble, Confetti, KidButton, Panel, Stars, SuccessBanner, useDebouncedFlag } from "../components/ui";
import { fa } from "../lab/format";
import { makeObject } from "../lab/objects";
import { playChime, useStore } from "../lab/store";
import type { LabObject } from "../lab/types";
import { useLab } from "../lab/useLab";

const fixed = { movable: false, rotatable: false, deletable: false };
const rotOnly = { movable: false, rotatable: true, deletable: false };
const freeMirror = { movable: true, rotatable: true, deletable: false };

export const LEVELS: { title: string; hint: string; build: () => LabObject[] }[] = [
  {
    title: "مرحله ۱: یک آینه",
    hint: "آینه را بچرخان تا نور به بالا برگردد و به ستاره برسد.",
    build: () => [
      makeObject("source", 100, 300, { angle: 0, ...fixed }),
      makeObject("mirror", 600, 300, { angle: 20, length: 130, ...rotOnly }),
      makeObject("target", 600, 80, { ...fixed }),
    ],
  },
  {
    title: "مرحله ۲: دو آینه",
    hint: "نور باید از آینه‌ی اول به آینه‌ی دوم و بعد به ستاره برسد.",
    build: () => [
      makeObject("source", 100, 100, { angle: 0, ...fixed }),
      makeObject("mirror", 700, 100, { angle: 70, length: 130, ...rotOnly }),
      makeObject("mirror", 700, 440, { angle: 110, length: 130, ...rotOnly }),
      makeObject("target", 160, 440, { ...fixed }),
    ],
  },
  {
    title: "مرحله ۳: سه آینه",
    hint: "سه آینه، سه پیچ! یکی‌یکی آینه‌ها را تنظیم کن.",
    build: () => [
      makeObject("source", 90, 470, { angle: 0, ...fixed }),
      makeObject("mirror", 450, 470, { angle: 100, length: 120, ...rotOnly }),
      makeObject("mirror", 450, 90, { angle: 160, length: 120, ...rotOnly }),
      makeObject("mirror", 800, 90, { angle: 20, length: 120, ...rotOnly }),
      makeObject("target", 800, 420, { ...fixed }),
    ],
  },
  {
    title: "مرحله ۴: مسیر پیچیده",
    hint: "این‌بار یک آینه را می‌توانی جابه‌جا کنی و یک شیشه هم سر راه است که نور را کمی کج می‌کند!",
    build: () => [
      makeObject("source", 80, 470, { angle: 0, ...fixed }),
      makeObject("mirror", 300, 470, { angle: 100, length: 120, ...rotOnly }),
      makeObject("mirror", 300, 70, { angle: 160, length: 120, ...rotOnly }),
      makeObject("mirror", 760, 120, { angle: 30, length: 120, ...freeMirror, label: "آینه متحرک" }),
      makeObject("glass", 690, 300, { w: 120, h: 100, ...fixed }),
      makeObject("target", 620, 470, { r: 24, ...fixed }),
    ],
  },
];

export default function TargetGame() {
  const { gameLevel, completeLevel, discover, score } = useStore();
  const [level, setLevel] = useState(Math.min(gameLevel, LEVELS.length - 1));
  const lab = useLab(LEVELS[level].build);
  const [done, setDone] = useState(false);

  useEffect(() => {
    lab.replaceAll(LEVELS[level].build());
    setDone(false);
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const hit = lab.trace.targetsHit.size > 0;
  const stableHit = useDebouncedFlag(hit, 500);

  useEffect(() => {
    if (stableHit && !done) {
      setDone(true);
      playChime("success");
      completeLevel(level + 1);
      discover("target");
    }
  }, [stableHit, done, level, completeLevel, discover]);

  const mirrors = lab.objects.filter((o) => o.kind === "mirror");
  const bounces = lab.trace.events.filter((e) => e.type === "reflect").length;

  return (
    <>
      <Confetti show={done} />
      <LabLayout
        title="نور را به هدف برسان!"
        emoji="🎯"
        subtitle="آینه‌ها را بچرخان تا پرتو نور به ستاره برسد."
        tools={
          <>
            <Panel title="مرحله‌ها" emoji="🗺️">
              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map((_l, i) => {
                  const unlocked = i <= gameLevel;
                  const active = i === level;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => setLevel(i)}
                      className={`rounded-2xl border-4 py-2 text-xl font-black transition ${active ? "border-orange-400 bg-orange-100 text-orange-700" : unlocked ? "border-white bg-white text-slate-600 hover:bg-orange-50" : "border-slate-200 bg-slate-100 text-slate-300"}`}
                    >
                      {unlocked ? fa(i + 1) : "🔒"}
                      {i < gameLevel && <div className="text-xs">⭐</div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-center text-sm font-bold text-slate-600">🏅 امتیاز کل: {fa(score)}</div>
            </Panel>
            <Inspector lab={lab} lockRays />
          </>
        }
        info={
          <>
            <Panel title={LEVELS[level].title} emoji="🚀">
              <p className="text-sm font-bold leading-6 text-slate-600">{LEVELS[level].hint}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm font-bold">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-800">🪞 آینه‌ها: {fa(mirrors.length)}</div>
                <div className="rounded-xl bg-yellow-100 p-2 text-yellow-800">↩️ بازتاب‌ها: {fa(bounces)}</div>
              </div>
              <KidButton onClick={() => { lab.replaceAll(LEVELS[level].build()); setDone(false); }} color="bg-slate-200 text-slate-700" className="mt-3 w-full !py-2 !text-base">
                🔄 دوباره از اول
              </KidButton>
            </Panel>
            {done ? (
              <SuccessBanner
                text="آفرین! مسیر نور را پیدا کردی."
                sub={level < LEVELS.length - 1 ? "آماده‌ای برای مرحله سخت‌تر؟" : "همه مرحله‌ها را تمام کردی! تو قهرمان نوری! 🏆"}
                stars={3}
                onNext={level < LEVELS.length - 1 ? () => setLevel(level + 1) : undefined}
              />
            ) : (
              <Bubble emoji="🦉">
                {bounces === 0 && <>روی یک آینه بزن و دایره نارنجی ↻ را بکش تا بچرخد. نور را دنبال کن! 🔦</>}
                {bounces > 0 && !hit && <>خوبه! نور از {fa(bounces)} آینه برگشت. حالا آینه‌ی بعدی را کمی بچرخان تا نور دقیقاً به ستاره بخورد. ⭐</>}
              </Bubble>
            )}
            <div className="text-center">
              <Stars n={Math.min(3, gameLevel)} max={LEVELS.length} />
              <div className="text-xs font-bold text-slate-500">مرحله‌های تمام‌شده: {fa(gameLevel)} از {fa(LEVELS.length)}</div>
            </div>
            <Notebook compact />
          </>
        }
      >
        <LabCanvas lab={lab} allowDrop={false} />
      </LabLayout>
    </>
  );
}
