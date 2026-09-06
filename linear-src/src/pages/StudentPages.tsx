import { useEffect, useState } from "react";
import { Btn, Card, Formula, I, Icon, Insight, ProgressBar, ProgressRing, Stat, Tag } from "../components/UI";
import { useApp } from "../context";
import { badges, lessons, questions } from "../data";
import { toFa } from "../math";
import type { LessonId, Question } from "../types";
import {
  Challenges,
  CompareLab,
  ConvertLab,
  EquationLab,
  ExploreLab,
  GraphToEqLab,
  Lab3D,
  MatchingGame,
  PlaneLab,
  SlopeLab,
  SolverPage,
  TwoLinesLab,
  TwoPointLab,
} from "./GraphLabs";

export function StudentDashboard() {
  const { name, xp, overall, level, solved, correct, minutes, activity, mission, setStudentView, completed, streak } = useApp();
  const acc = solved ? Math.round((correct / solved) * 100) : 0;
  const missionDone = mission.pos && mission.neg && mission.zero;
  return (
    <div className="space-y-4 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--text-mute)]">داشبورد من</div>
          <h1 className="text-2xl font-black md:text-3xl">{name ? `سلام ${name}` : "سلام"}</h1>
          <p className="mt-1 text-sm text-[var(--text-mute)]">امروز شیب را نخوان؛ آن را روی صفحه بساز.</p>
        </div>
        <Tag>رشته یادگیری · سطح {toFa(level.level)}</Tag>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4">
          <ProgressRing value={overall} label="پیشرفت" />
          <div>
            <div className="text-sm text-[var(--text-mute)]">مسیر یادگیری</div>
            <div className="font-bold">{toFa(completed.length)} از {toFa(13)} مرحله</div>
            <ProgressBar value={overall} className="mt-2 w-36" />
          </div>
        </Card>
        <Stat label="امتیاز XP" value={toFa(xp)} hint={`${toFa(level.into)} از ${toFa(level.need)} تا سطح بعد`} />
        <Stat label="تمرین حل‌شده" value={toFa(solved)} hint={`پاسخ درست: ${toFa(correct)} · دقت ${toFa(acc)}٪`} />
        <Stat label="زمان یادگیری" value={`${toFa(minutes)} دقیقه`} hint={`رشته پیگیری: ${toFa(streak)} روز`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <Tag tone="warn">مأموریت امروز</Tag>
              <h3 className="mt-2 text-xl font-black">شکارچی شیب</h3>
              <p className="mt-1 text-sm leading-7">۳ خط با شیب مثبت، منفی و صفر پیدا کن. نقاط را در آزمایشگاه شیب جابه‌جا کن.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Tag tone={mission.pos ? "ok" : "mute"}>{mission.pos ? "مثبت ✓" : "مثبت"}</Tag>
                <Tag tone={mission.neg ? "ok" : "mute"}>{mission.neg ? "منفی ✓" : "منفی"}</Tag>
                <Tag tone={mission.zero ? "ok" : "mute"}>{mission.zero ? "صفر ✓" : "صفر"}</Tag>
              </div>
              <Btn className="mt-4" onClick={() => setStudentView("slope")}>
                شروع مأموریت
              </Btn>
            </div>
            <div className="text-4xl">{missionDone ? "🏆" : "🎯"}</div>
          </div>
          {missionDone && <p className="mt-3 text-sm text-emerald-500">مأموریت کامل شد · نشان استاد شیب باز شد · +۱۰۰ XP</p>}
        </Card>
        <Card>
          <h3 className="font-bold">آخرین فعالیت‌ها</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {activity.map((a, i) => (
              <li key={i} className="flex justify-between gap-2 rounded-2xl bg-[var(--bg-soft)] px-3 py-2">
                <span>{a.text}</span>
                <span className="shrink-0 text-[11px] text-[var(--text-mute)]">{a.t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["آزمایشگاه شیب", "نقاط را بکش و m را ببین", "slope", I.slope],
          ["معادله و نمودار", "لغزنده m و b", "equation", I.chart],
          ["مسیر یادگیری", "۱۳ مرحله مفهومی", "path", I.path],
        ].map(([t, d, v, ic]) => (
          <Card key={t} onClick={() => setStudentView(v as "slope")} className="cursor-pointer">
            <Icon d={ic} />
            <div className="mt-2 font-bold">{t}</div>
            <p className="text-sm text-[var(--text-mute)]">{d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PathPage() {
  const { completed, lessonProgress, openLesson, xp } = useApp();
  return (
    <div className="anim-in">
      <h1 className="text-2xl font-black">مسیر یادگیری</h1>
      <p className="mt-1 text-sm text-[var(--text-mute)]">هر مرحله را باز کن، آزمایش کن، بعد قفل بعدی را بشکن.</p>
      <div className="relative mt-6 space-y-3">
        <div className="absolute bottom-6 top-6 right-[27px] w-[2px] bg-gradient-to-b from-cyan-400 to-indigo-500 opacity-40" />
        {lessons.map((l, i) => {
          const unlocked = i === 0 || completed.includes(lessons[i - 1].id) || completed.includes(l.id) || (lessonProgress[lessons[i - 1].id] ?? 0) >= 40;
          const prog = completed.includes(l.id) ? 100 : lessonProgress[l.id] ?? 0;
          return (
            <button
              key={l.id}
              disabled={!unlocked}
              onClick={() => unlocked && openLesson(l.id)}
              className={`relative flex w-full items-center gap-4 rounded-3xl border p-4 text-right transition ${
                unlocked ? "glass card-3d" : "border-[var(--line)] opacity-55"
              }`}
            >
              <div
                className={`z-[1] grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black ${
                  unlocked ? "bg-gradient-to-br from-indigo-500 to-cyan-400 text-white" : "bg-black/10 dark:bg-white/10"
                }`}
              >
                {unlocked ? toFa(l.index) : <Icon d={I.lock} className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{l.title}</span>
                  <Tag tone={prog === 100 ? "ok" : "mute"}>{prog === 100 ? "کامل" : `${toFa(prog)}٪`}</Tag>
                  <Tag>{toFa(l.xp)} XP</Tag>
                </div>
                <p className="mt-1 truncate text-sm text-[var(--text-mute)]">{l.subtitle}</p>
                <ProgressBar value={prog} className="mt-2" />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--text-mute)]">XP فعلی: {toFa(xp)}</p>
    </div>
  );
}

function LessonInteractive({ id }: { id: LessonId }) {
  if (id === "coord" || id === "points" || id === "line") return <PlaneLab />;
  if (id === "slope" || id === "slope-sign" || id === "hv") return <SlopeLab />;
  if (id === "equation" || id === "slope-intercept" || id === "graph-eq") return <EquationLab />;
  if (id === "two-points") return <TwoPointLab />;
  if (id === "convert") return <ConvertLab />;
  if (id === "two-lines") return <TwoLinesLab />;
  return <Challenges />;
}

export function LessonPage() {
  const { lessonId, completeLesson, setLessonProgress, markAnswer, setStudentView } = useApp();
  const lesson = lessons.find((l) => l.id === lessonId)!;
  const qs = questions.filter((q) => q.lesson === lessonId || (lessonId === "mixed" && q.lesson === "mixed")).slice(0, 3);
  const [tab, setTab] = useState<"theory" | "lab" | "practice">("theory");
  return (
    <div className="space-y-4 anim-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button className="text-sm text-[var(--text-mute)]" onClick={() => setStudentView("path")}>
            مسیر یادگیری
          </button>
          <h1 className="text-2xl font-black">{lesson.title}</h1>
          <p className="text-sm text-[var(--text-mute)]">{lesson.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Tag>{toFa(lesson.minutes)} دقیقه</Tag>
          <Tag tone="ok">{toFa(lesson.xp)} XP</Tag>
        </div>
      </div>
      <div className="flex gap-2">
        {[
          ["theory", "مفهوم"],
          ["lab", "آزمایش"],
          ["practice", "تمرین"],
        ].map(([k, t]) => (
          <Btn key={k} variant={tab === k ? "primary" : "soft"} onClick={() => setTab(k as typeof tab)}>
            {t}
          </Btn>
        ))}
      </div>
      {tab === "theory" && (
        <div className="space-y-3">
          {lesson.formula && (
            <Card className="text-center">
              <div className="text-xs text-[var(--text-mute)]">فرمول این مرحله</div>
              <div className="mt-2 text-2xl">
                <Formula className="!bg-transparent text-2xl">{lesson.formula}</Formula>
              </div>
            </Card>
          )}
          {lesson.theory.map((t) => (
            <Card key={t.title}>
              <h3 className="font-bold">{t.title}</h3>
              <p className="mt-2 leading-8 text-sm">{t.body}</p>
            </Card>
          ))}
          <Insight text={lesson.insight} />
          <Btn
            onClick={() => {
              setLessonProgress(lesson.id, 45);
              setTab("lab");
            }}
          >
            برو به آزمایش
          </Btn>
        </div>
      )}
      {tab === "lab" && (
        <div className="space-y-3">
          <LessonInteractive id={lesson.id} />
          <Btn
            onClick={() => {
              setLessonProgress(lesson.id, 75);
              setTab("practice");
            }}
          >
            برو به تمرین
          </Btn>
        </div>
      )}
      {tab === "practice" && (
        <PracticeList
          qs={qs.length ? qs : questions.slice(0, 3)}
          onDone={() => {
            completeLesson(lesson.id);
            setStudentView("path");
          }}
          onAnswer={markAnswer}
        />
      )}
    </div>
  );
}

function PracticeList({ qs, onDone, onAnswer }: { qs: Question[]; onDone: () => void; onAnswer: (ok: boolean) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [blank, setBlank] = useState("");
  const q = qs[i];
  if (!q) return null;
  const check = (val: string) => {
    const ok = String(q.answer) === val || String(q.answer) === val.replace("ي", "ی");
    onAnswer(ok);
    setPicked(val);
  };
  const ok = picked !== null && (String(q.answer) === picked || (q.kind === "tf" && String(q.answer) === picked));
  return (
    <Card>
      <div className="text-xs text-[var(--text-mute)]">
        سؤال {toFa(i + 1)} از {toFa(qs.length)} · {q.difficulty === "easy" ? "آسان" : q.difficulty === "medium" ? "متوسط" : "سخت"}
      </div>
      <h3 className="mt-2 font-bold leading-8">{q.prompt}</h3>
      {q.kind === "blank" && (
        <div className="mt-3 flex gap-2">
          <input
            value={blank}
            onChange={(e) => setBlank(e.target.value)}
            className="focus-ring flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2 ltr"
          />
          <Btn onClick={() => check(blank)}>ثبت</Btn>
        </div>
      )}
      {q.options && (
        <div className="mt-3 grid gap-2">
          {q.options.map((op) => (
            <button
              key={op}
              onClick={() => check(op)}
              className={`rounded-2xl border px-3 py-2 text-right text-sm ${
                picked === op ? (ok && picked === op ? "border-emerald-400 bg-emerald-500/15" : "border-rose-400 bg-rose-500/10") : "border-[var(--line)]"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      )}
      {q.kind === "tf" && (
        <div className="mt-3 flex gap-2">
          <Btn variant="ok" onClick={() => check("true")}>
            درست
          </Btn>
          <Btn variant="danger" onClick={() => check("false")}>
            نادرست
          </Btn>
        </div>
      )}
      {picked !== null && (
        <div className="mt-3 rounded-2xl bg-[var(--bg-soft)] p-3 text-sm leading-7">
          {ok ? "پاسخ درست است." : `این پاسخ کامل نیست. ${q.errorHint}`}
          <div className="mt-1 text-[var(--text-mute)]">{q.explanation}</div>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        {i < qs.length - 1 ? (
          <Btn
            disabled={picked === null}
            onClick={() => {
              setI(i + 1);
              setPicked(null);
              setBlank("");
            }}
          >
            سؤال بعد
          </Btn>
        ) : (
          <Btn disabled={picked === null} onClick={onDone}>
            پایان و ثبت مرحله
          </Btn>
        )}
      </div>
    </Card>
  );
}

export function QuizPage() {
  const { markAnswer, addXp, setStudentView } = useApp();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const qs = questions.slice(0, 8);
  const q = qs[i];
  const [left, setLeft] = useState(15 * 60);
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [started]);
  if (!started) {
    return (
      <Card className="anim-in">
        <h1 className="text-2xl font-black">آزمونک خط و شیب</h1>
        <p className="mt-2 text-sm leading-7">۸ سؤال · ۱۵ دقیقه · تصحیح خودکار. بعد از پایان، تحلیل خطا می‌بینی.</p>
        <Btn className="mt-4" onClick={() => setStarted(true)}>
          شروع آزمون
        </Btn>
      </Card>
    );
  }
  if (i >= qs.length) {
    return (
      <Card>
        <h2 className="text-xl font-black">نتیجه</h2>
        <p className="mt-2">
          {toFa(score)} از {toFa(qs.length)} درست · {toFa(Math.round((score / qs.length) * 100))}٪
        </p>
        <ProgressBar value={(score / qs.length) * 100} className="mt-3" />
        <Btn className="mt-4" onClick={() => setStudentView("dashboard")}>
          بازگشت
        </Btn>
      </Card>
    );
  }
  return (
    <Card className="anim-in">
      <div className="flex justify-between text-sm text-[var(--text-mute)]">
        <span>
          سؤال {toFa(i + 1)} / {toFa(qs.length)}
        </span>
        <span>
          زمان باقی {toFa(Math.floor(left / 60))}:{toFa(String(left % 60).padStart(2, "0"))}
        </span>
      </div>
      <h3 className="mt-3 font-bold leading-8">{q.prompt}</h3>
      <div className="mt-3 grid gap-2">
        {(q.options ?? ["درست", "نادرست"]).map((op) => (
          <button
            key={op}
            onClick={() => setPicked(op)}
            className={`rounded-2xl border px-3 py-2 text-right ${picked === op ? "border-indigo-400 bg-indigo-500/15" : "border-[var(--line)]"}`}
          >
            {op}
          </button>
        ))}
      </div>
      <Btn
        className="mt-4"
        disabled={!picked}
        onClick={() => {
          const ans = q.kind === "tf" ? (picked === "درست" ? "true" : "false") : picked;
          const ok = String(q.answer) === String(ans);
          markAnswer(ok);
          if (ok) {
            setScore((s) => s + 1);
            addXp(10, "پاسخ آزمون");
          }
          setPicked(null);
          setI((x) => x + 1);
        }}
      >
        ثبت پاسخ
      </Btn>
    </Card>
  );
}

export function AchievementsPage() {
  const { badgesGot, xp, level, streak, mission } = useApp();
  return (
    <div className="space-y-4 anim-in">
      <h1 className="text-2xl font-black">دستاوردها</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="سطح" value={toFa(level.level)} />
        <Stat label="XP" value={toFa(xp)} />
        <Stat label="رشته" value={`${toFa(streak)} روز`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const got = badgesGot.includes(b.id) || (b.id === "slope-master" && mission.pos && mission.neg && mission.zero);
          return (
            <Card key={b.id} className={got ? "" : "opacity-50"}>
              <div className="text-3xl">{b.icon}</div>
              <div className="mt-2 font-bold">{b.title}</div>
              <p className="text-sm text-[var(--text-mute)]">{b.desc}</p>
              <div className="mt-2">{got ? <Tag tone="ok">باز شده</Tag> : <Tag tone="mute">قفل</Tag>}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressPage() {
  const { completed, lessonProgress, solved, correct, minutes, overall } = useApp();
  return (
    <div className="space-y-4 anim-in">
      <h1 className="text-2xl font-black">پیشرفت</h1>
      <Card className="flex flex-wrap items-center gap-6">
        <ProgressRing value={overall} size={140} label="کل مسیر" />
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Stat label="مراحل کامل" value={`${toFa(completed.length)} / ۱۳`} />
          <Stat label="دقت" value={`${toFa(solved ? Math.round((correct / solved) * 100) : 0)}٪`} />
          <Stat label="زمان" value={`${toFa(minutes)} دقیقه`} />
          <Stat label="تمرین" value={toFa(solved)} />
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">جزئیات مراحل</h3>
        <div className="mt-3 space-y-3">
          {lessons.map((l) => {
            const v = completed.includes(l.id) ? 100 : lessonProgress[l.id] ?? 0;
            return (
              <div key={l.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{l.title}</span>
                  <span>{toFa(v)}٪</span>
                </div>
                <ProgressBar value={v} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function SettingsPage({ teacher = false }: { teacher?: boolean }) {
  const { theme, toggleTheme, fontScale, setFontScale, highContrast, setHighContrast, logout, name } = useApp();
  return (
    <div className="space-y-4 anim-in max-w-xl">
      <h1 className="text-2xl font-black">تنظیمات</h1>
      <Card>
        <div className="text-sm text-[var(--text-mute)]">حساب</div>
        <div className="mt-1 font-bold">{name || "بدون نام"} · {teacher ? "معلم" : "دانش‌آموز"}</div>
      </Card>
      <Card className="flex items-center justify-between">
        <div>
          <div className="font-bold">پوسته</div>
          <div className="text-sm text-[var(--text-mute)]">{theme === "dark" ? "تیره" : "روشن"}</div>
        </div>
        <Btn variant="soft" onClick={toggleTheme}>
          <Icon d={theme === "dark" ? I.sun : I.moon} />
          تغییر
        </Btn>
      </Card>
      <Card>
        <div className="font-bold">اندازه قلم</div>
        <input className="mt-3 w-full" type="range" min={0.9} max={1.25} step={0.05} value={fontScale} onChange={(e) => setFontScale(+e.target.value)} />
      </Card>
      <Card className="flex items-center justify-between">
        <div>
          <div className="font-bold">کنتراست بالا</div>
          <div className="text-sm text-[var(--text-mute)]">خوانایی بیشتر برای متن و نمودار</div>
        </div>
        <Btn variant={highContrast ? "primary" : "soft"} onClick={() => setHighContrast(!highContrast)}>
          {highContrast ? "فعال" : "خاموش"}
        </Btn>
      </Card>
      <Btn variant="danger" onClick={logout}>
        <Icon d={I.logout} />
        خروج
      </Btn>
    </div>
  );
}

function LineHub() {
  const [tab, setTab] = useState<"two" | "rel" | "conv">("two");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Btn variant={tab === "two" ? "primary" : "soft"} onClick={() => setTab("two")}>
          دو نقطه
        </Btn>
        <Btn variant={tab === "rel" ? "primary" : "soft"} onClick={() => setTab("rel")}>
          رابطه دو خط
        </Btn>
        <Btn variant={tab === "conv" ? "primary" : "soft"} onClick={() => setTab("conv")}>
          تبدیل معادله
        </Btn>
      </div>
      {tab === "two" && <TwoPointLab />}
      {tab === "rel" && <TwoLinesLab />}
      {tab === "conv" && <ConvertLab />}
    </div>
  );
}

function EquationHub() {
  const [tab, setTab] = useState<"eq" | "graph">("eq");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Btn variant={tab === "eq" ? "primary" : "soft"} onClick={() => setTab("eq")}>
          معادله → نمودار
        </Btn>
        <Btn variant={tab === "graph" ? "primary" : "soft"} onClick={() => setTab("graph")}>
          نمودار → معادله
        </Btn>
      </div>
      {tab === "eq" ? <EquationLab /> : <GraphToEqLab />}
    </div>
  );
}

export function PracticeHub() {
  const { setStudentView } = useApp();
  const items = [
    ["چالش‌ها", "رسم خط با هدف مشخص", "challenges"],
    ["اتصال معادله و نمودار", "هر فرمول به نمودار خودش", "matching"],
    ["حل مرحله‌ای", "از دو نقطه تا معادله", "solver"],
    ["آزمونک", "۸ سؤال زمان‌دار", "quizzes"],
  ] as const;
  return (
    <div className="grid gap-3 md:grid-cols-2 anim-in">
      {items.map(([t, d, v]) => (
        <Card key={v} onClick={() => setStudentView(v)}>
          <div className="font-bold">{t}</div>
          <p className="mt-1 text-sm text-[var(--text-mute)]">{d}</p>
        </Card>
      ))}
    </div>
  );
}

export function StudentRouter() {
  const { studentView } = useApp();
  switch (studentView) {
    case "dashboard":
      return <StudentDashboard />;
    case "path":
      return <PathPage />;
    case "lesson":
      return <LessonPage />;
    case "plane":
      return <PlaneLab />;
    case "slope":
      return <SlopeLab />;
    case "equation":
      return <EquationHub />;
    case "linelab":
      return <LineHub />;
    case "explore":
      return <ExploreLab />;
    case "challenges":
      return (
        <div className="space-y-4">
          <PracticeHub />
          <Challenges />
        </div>
      );
    case "matching":
      return <MatchingGame />;
    case "quizzes":
    case "quiz":
      return <QuizPage />;
    case "achievements":
      return <AchievementsPage />;
    case "progress":
      return <ProgressPage />;
    case "settings":
      return <SettingsPage />;
    case "solver":
      return <SolverPage />;
    case "compare":
      return <CompareLab />;
    case "lab3d":
      return <Lab3D />;
    case "mission":
      return <SlopeLab />;
    default:
      return <StudentDashboard />;
  }
}
