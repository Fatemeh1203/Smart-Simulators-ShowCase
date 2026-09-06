import { useEffect, useMemo, useState } from "react";
import { CoordinatePlane } from "../components/CoordinatePlane";
import { Btn, Card, Field, I, Icon, ProgressBar, ProgressRing, Stat, Tag } from "../components/UI";
import { useApp } from "../context";
import { classStudents, lessons, questions, sampleAssignments, sampleQuizzes } from "../data";
import { formatNum, toFa } from "../math";
import { EquationLab, SlopeLab, TwoPointLab } from "./GraphLabs";
import { SettingsPage } from "./StudentPages";
import type { Assignment, Point } from "../types";

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-xl bg-gradient-to-t from-indigo-500 to-cyan-400"
            style={{ height: `${(v / max) * 100}%` }}
            title={`${labels[i]}: ${v}`}
          />
          <div className="text-[10px] text-[var(--text-mute)]">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export function TeacherDashboard() {
  const { name, setTeacherView } = useApp();
  const avg = Math.round(classStudents.reduce((a, s) => a + s.progress, 0) / classStudents.length);
  const acc = Math.round(classStudents.reduce((a, s) => a + s.accuracy, 0) / classStudents.length);
  const mins = classStudents.reduce((a, s) => a + s.minutes, 0);
  return (
    <div className="space-y-4 anim-in">
      <div>
        <div className="text-sm text-[var(--text-mute)]">پنل معلم</div>
        <h1 className="text-2xl font-black">{name ? `${name}، کلاس ۹/۱ آماده است` : "داشبورد کلاس"}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="دانش‌آموزان" value={toFa(classStudents.length)} hint="کلاس نمونه ۹/۱" />
        <Stat label="میانگین پیشرفت" value={`${toFa(avg)}٪`} />
        <Stat label="میانگین دقت" value={`${toFa(acc)}٪`} />
        <Stat label="زمان مطالعه کلاس" value={`${toFa(mins)} دقیقه`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold">پیشرفت هفتگی</h3>
          <div className="mt-4">
            <BarChart values={[58, 62, 67, 71, 74, 76, 78]} labels={["ش", "ی", "د", "س", "چ", "پ", "ج"]} />
          </div>
        </Card>
        <Card>
          <h3 className="font-bold">نقاط ضعف کلاس</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-2xl bg-[var(--bg-soft)] p-3">۷۴٪ دانش‌آموزان در مبحث شیب عملکرد مناسب دارند.</li>
            <li className="rounded-2xl bg-rose-500/10 p-3">بیشترین خطا در «پیدا کردن معادله خط از دو نقطه» ثبت شده است.</li>
            <li className="rounded-2xl bg-amber-500/10 p-3">خط عمودی و شیب تعریف‌نشده هنوز برای ۴ دانش‌آموز مبهم است.</li>
          </ul>
          <Btn className="mt-3" variant="soft" onClick={() => setTeacherView("analytics")}>
            تحلیل کامل
          </Btn>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card onClick={() => setTeacherView("assignments")}>
          <Tag>۲ فعال</Tag>
          <div className="mt-2 font-bold">تمرین‌های فعال</div>
          <p className="text-sm text-[var(--text-mute)]">شیب خط و معادله از دو نقطه</p>
        </Card>
        <Card onClick={() => setTeacherView("quizzes")}>
          <Tag tone="ok">۲ آزمون</Tag>
          <div className="mt-2 font-bold">آزمون‌های فعال</div>
          <p className="text-sm text-[var(--text-mute)]">آزمونک شیب و معادله خط</p>
        </Card>
        <Card onClick={() => setTeacherView("live")}>
          <Tag tone="danger">زنده</Tag>
          <div className="mt-2 font-bold">کلاس زنده</div>
          <p className="text-sm text-[var(--text-mute)]">سؤال لحظه‌ای با نمودار پاسخ</p>
        </Card>
      </div>
    </div>
  );
}

export function ClassesPage() {
  const { setTeacherStudentId } = useApp();
  const [q, setQ] = useState("");
  const list = classStudents.filter((s) => s.code.includes(q) || s.id.includes(q));
  return (
    <div className="space-y-4 anim-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">کلاس ۹/۱</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی کد دانش‌آموز"
          className="focus-ring rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2 text-sm"
        />
      </div>
      <div className="overflow-auto rounded-3xl border border-[var(--line)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-[var(--bg-soft)] text-[var(--text-mute)]">
            <tr>
              {["کد", "پیشرفت", "دقت", "زمان", "ضعف", "آخرین فعالیت"].map((h) => (
                <th key={h} className="p-3 text-right font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer border-t border-[var(--line)] hover:bg-indigo-500/5"
                onClick={() => setTeacherStudentId(s.id)}
              >
                <td className="p-3 font-bold">{s.code}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={s.progress} className="w-24" />
                    <span>{toFa(s.progress)}٪</span>
                  </div>
                </td>
                <td className="p-3">{toFa(s.accuracy)}٪</td>
                <td className="p-3">{toFa(s.minutes)} دقیقه</td>
                <td className="p-3">{s.weak}</td>
                <td className="p-3 text-[var(--text-mute)]">{s.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StudentDetail() {
  const { teacherStudentId, setTeacherStudentId } = useApp();
  const s = classStudents.find((x) => x.id === teacherStudentId) ?? classStudents[0];
  return (
    <div className="space-y-4 anim-in">
      <button className="text-sm text-[var(--text-mute)]" onClick={() => setTeacherStudentId(null)}>
        بازگشت به کلاس
      </button>
      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing value={s.progress} />
        <div>
          <h1 className="text-2xl font-black">{s.code}</h1>
          <p className="text-sm text-[var(--text-mute)]">آخرین فعالیت: {s.last}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="XP" value={toFa(s.xp)} />
        <Stat label="دقت" value={`${toFa(s.accuracy)}٪`} />
        <Stat label="زمان" value={`${toFa(s.minutes)} دقیقه`} />
        <Stat label="نمره اخیر" value={toFa(s.scores[s.scores.length - 1])} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-bold">نقطه قوت</h3>
          <p className="mt-2 text-emerald-500">{s.strong}</p>
          <h3 className="mt-4 font-bold">نقطه ضعف</h3>
          <p className="mt-2 text-rose-400">{s.weak}</p>
        </Card>
        <Card>
          <h3 className="font-bold">روند نمرات</h3>
          <div className="mt-4">
            <BarChart values={s.scores} labels={s.scores.map((_, i) => `آ${toFa(i + 1)}`)} />
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-bold">اشتباهات پرتکرار</h3>
        <ul className="mt-2 list-disc pr-5 text-sm leading-8">
          <li>جابه‌جا کردن Δx و Δy هنگام محاسبه شیب</li>
          <li>فراموش کردن علامت منفی در شیب نزولی</li>
          <li>عدم جایگذاری نقطه برای یافتن b</li>
        </ul>
      </Card>
    </div>
  );
}

export function ContentPage() {
  return (
    <div className="space-y-3 anim-in">
      <h1 className="text-2xl font-black">محتوای آموزشی</h1>
      {lessons.map((l) => (
        <Card key={l.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold">
                {toFa(l.index)}. {l.title}
              </div>
              <p className="text-sm text-[var(--text-mute)]">{l.subtitle}</p>
            </div>
            <Tag>{toFa(l.minutes)} دقیقه</Tag>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AssignmentsPage() {
  const { setTeacherView } = useApp();
  const items = sampleAssignments;
  return (
    <div className="space-y-4 anim-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">تکالیف</h1>
        <Btn onClick={() => setTeacherView("assignment-builder")}>
          <Icon d={I.plus} className="h-4 w-4" />
          تکلیف جدید
        </Btn>
      </div>
      {items.map((a) => (
        <Card key={a.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold">{a.title}</div>
              <p className="text-sm text-[var(--text-mute)]">
                {a.topic} · {toFa(a.count)} سؤال · {toFa(a.minutes)} دقیقه
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tag tone={a.status === "فعال" ? "ok" : a.status === "پایان‌یافته" ? "mute" : "warn"}>{a.status}</Tag>
              <Tag>{a.level}</Tag>
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-mute)]">
            از {a.start} تا {a.end}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AssignmentBuilder() {
  const { setTeacherView } = useApp();
  const [form, setForm] = useState<Assignment>({
    id: "new",
    title: "",
    topic: "شیب خط",
    level: "متوسط",
    count: 8,
    minutes: 20,
    start: "",
    end: "",
    status: "پیش‌نویس",
  });
  const [sent, setSent] = useState(false);
  return (
    <Card className="max-w-xl space-y-3 anim-in">
      <h1 className="text-xl font-black">سازنده تکلیف</h1>
      <Field label="عنوان" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--text-mute)]">موضوع</span>
        <select
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2.5"
        >
          {lessons.map((l) => (
            <option key={l.id}>{l.title}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(["آسان", "متوسط", "سخت"] as const).map((lv) => (
          <Btn key={lv} variant={form.level === lv ? "primary" : "soft"} onClick={() => setForm({ ...form, level: lv })}>
            {lv}
          </Btn>
        ))}
      </div>
      <Field label="تعداد سؤال" type="number" value={form.count} onChange={(v) => setForm({ ...form, count: Number(v) })} />
      <Field label="زمان (دقیقه)" type="number" value={form.minutes} onChange={(v) => setForm({ ...form, minutes: Number(v) })} />
      <Field label="تاریخ شروع" value={form.start} onChange={(v) => setForm({ ...form, start: v })} />
      <Field label="تاریخ پایان" value={form.end} onChange={(v) => setForm({ ...form, end: v })} />
      <Btn
        className="w-full"
        onClick={() => {
          if (!form.title.trim()) return;
          setSent(true);
        }}
      >
        ارسال برای کلاس
      </Btn>
      {sent && <p className="text-sm text-emerald-500">تکلیف «{form.title}» برای کلاس ۹/۱ ارسال شد.</p>}
      <Btn variant="ghost" onClick={() => setTeacherView("assignments")}>
        بازگشت
      </Btn>
    </Card>
  );
}

export function TeacherQuizzes() {
  const { setTeacherView } = useApp();
  return (
    <div className="space-y-4 anim-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">آزمون‌ها</h1>
        <Btn onClick={() => setTeacherView("quiz-builder")}>آزمون‌ساز</Btn>
      </div>
      {sampleQuizzes.map((z) => (
        <Card key={z.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold">{z.title}</div>
              <p className="text-sm text-[var(--text-mute)]">
                {z.topic} · {toFa(z.count)} سؤال · {toFa(z.minutes)} دقیقه
              </p>
            </div>
            <Tag tone={z.status === "فعال" ? "ok" : "warn"}>{z.status}</Tag>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function QuizBuilder() {
  const { setTeacherView } = useApp();
  const [n, setN] = useState(8);
  const [level, setLevel] = useState("متوسط");
  const [mins, setMins] = useState(15);
  const bank = questions.slice(0, n);
  const [made, setMade] = useState(false);
  return (
    <div className="space-y-4 anim-in">
      <h1 className="text-2xl font-black">آزمون‌ساز</h1>
      <Card className="grid gap-3 md:grid-cols-3">
        <Field label="تعداد سؤال" type="number" value={n} onChange={(v) => setN(Number(v))} />
        <Field label="زمان" type="number" value={mins} onChange={(v) => setMins(Number(v))} />
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--text-mute)]">سطح</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2.5">
            <option>آسان</option>
            <option>متوسط</option>
            <option>سخت</option>
          </select>
        </label>
      </Card>
      <Card>
        <h3 className="font-bold">بانک سؤال انتخاب‌شده</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {bank.map((q) => (
            <li key={q.id} className="rounded-2xl bg-[var(--bg-soft)] p-2">
              {q.prompt}
            </li>
          ))}
        </ul>
        <Btn className="mt-3" onClick={() => setMade(true)}>
          ساخت آزمون با تصحیح خودکار
        </Btn>
        {made && (
          <p className="mt-2 text-sm text-emerald-500">
            آزمون {toFa(n)} سؤالی با زمان {toFa(mins)} دقیقه آماده شد. امتیازدهی خودکار فعال است.
          </p>
        )}
      </Card>
      <Btn variant="ghost" onClick={() => setTeacherView("quizzes")}>
        بازگشت
      </Btn>
    </div>
  );
}

export function AnalyticsPage() {
  const weakCount: Record<string, number> = {};
  classStudents.forEach((s) => {
    weakCount[s.weak] = (weakCount[s.weak] ?? 0) + 1;
  });
  const hardest = Object.entries(weakCount).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="space-y-4 anim-in">
      <h1 className="text-2xl font-black">تحلیل عملکرد</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="میانگین نمره" value={toFa(74)} />
        <Stat label="پاسخ صحیح کلاس" value="۷۱٪" />
        <Stat label="سخت‌ترین مبحث" value={hardest[0]} hint={`${toFa(hardest[1])} دانش‌آموز`} />
      </div>
      <Card>
        <h3 className="font-bold">عملکرد هر دانش‌آموز</h3>
        <div className="mt-3 space-y-2">
          {classStudents.map((s) => (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <div className="w-28 shrink-0">{s.code}</div>
              <ProgressBar value={s.accuracy} className="flex-1" />
              <div className="w-12">{toFa(s.accuracy)}٪</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">ضعیف‌ترین مباحث</h3>
        <div className="mt-3">
          <BarChart
            values={Object.values(weakCount)}
            labels={Object.keys(weakCount).map((k) => k.slice(0, 8))}
          />
        </div>
      </Card>
    </div>
  );
}

export function LiveClassroom() {
  const { setPresentation, setTeacherView } = useApp();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1200);
    return () => clearInterval(t);
  }, []);
  const states = useMemo(() => {
    return classStudents.map((s, i) => {
      const phase = Math.min(2, Math.floor((tick + i) / 3));
      const correct = [0, 2, 3, 5, 6, 8, 9].includes(i);
      if (phase === 0) return { s, st: "none" as const };
      return { s, st: correct ? ("ok" as const) : ("bad" as const) };
    });
  }, [tick]);
  const ok = states.filter((x) => x.st === "ok").length;
  const bad = states.filter((x) => x.st === "bad").length;
  const none = states.filter((x) => x.st === "none").length;
  return (
    <div className="space-y-4 anim-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">کلاس زنده</h1>
        <Btn
          variant="soft"
          onClick={() => {
            setPresentation(true);
            setTeacherView("presentation");
          }}
        >
          حالت نمایش
        </Btn>
      </div>
      <Card>
        <div className="text-sm text-[var(--text-mute)]">سؤال جاری</div>
        <h2 className="mt-1 text-xl font-black">شیب خط گذرنده از A(1, 2) و B(3, 6) چقدر است؟</h2>
        <div className="mt-3 h-48">
          <CoordinatePlane
            readOnly
            points={[
              { id: "A", x: 1, y: 2, label: "A", color: "#22d3ee" },
              { id: "B", x: 3, y: 6, label: "B", color: "#a78bfa" },
            ]}
            lines={[{ id: "l", a: "A", b: "B", color: "#818cf8" }]}
          />
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="صحیح" value={toFa(ok)} hint="🟢" />
        <Stat label="غلط" value={toFa(bad)} hint="🔴" />
        <Stat label="بدون پاسخ" value={toFa(none)} hint="⚪" />
      </div>
      <Card>
        <div className="mb-2 flex h-3 overflow-hidden rounded-full">
          <div className="bg-emerald-400" style={{ width: `${(ok / 12) * 100}%` }} />
          <div className="bg-rose-400" style={{ width: `${(bad / 12) * 100}%` }} />
          <div className="bg-slate-400/40" style={{ width: `${(none / 12) * 100}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {states.map(({ s, st }) => (
            <div key={s.id} className="flex items-center gap-2 rounded-2xl bg-[var(--bg-soft)] px-3 py-2 text-sm">
              <span>{st === "ok" ? "🟢" : st === "bad" ? "🔴" : "⚪"}</span>
              {s.code}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function PresentationMode() {
  const { setPresentation, setTeacherView } = useApp();
  const [m, setM] = useState(2);
  const [b, setB] = useState(1);
  const pts: Point[] = [{ id: "p", x: 0, y: b, label: "", color: "#22d3ee" }];
  return (
    <div className="flex min-h-[70vh] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black md:text-3xl">شیب این خط چقدر است؟</h1>
        <Btn
          variant="ghost"
          onClick={() => {
            setPresentation(false);
            setTeacherView("live");
          }}
        >
          خروج از نمایش
        </Btn>
      </div>
      <div className="min-h-[50vh] flex-1 overflow-hidden rounded-3xl border border-[var(--line)]">
        <CoordinatePlane
          readOnly
          showCoords={false}
          points={pts}
          lines={[{ id: "l", a: "p", m, intercept: b, color: "#a78bfa" }]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-lg">
        <span className="formula text-2xl">y = {formatNum(m)}x + {formatNum(b)}</span>
        <label className="flex items-center gap-2 text-sm">
          m
          <input type="range" min={-4} max={4} step={0.1} value={m} onChange={(e) => setM(+e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          b
          <input type="range" min={-4} max={4} step={0.1} value={b} onChange={(e) => setB(+e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export function TeacherLab() {
  const [tab, setTab] = useState<"slope" | "eq" | "two">("slope");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Btn variant={tab === "slope" ? "primary" : "soft"} onClick={() => setTab("slope")}>
          شیب
        </Btn>
        <Btn variant={tab === "eq" ? "primary" : "soft"} onClick={() => setTab("eq")}>
          معادله
        </Btn>
        <Btn variant={tab === "two" ? "primary" : "soft"} onClick={() => setTab("two")}>
          دو نقطه
        </Btn>
      </div>
      {tab === "slope" && <SlopeLab />}
      {tab === "eq" && <EquationLab />}
      {tab === "two" && <TwoPointLab />}
    </div>
  );
}

export function TeacherRouter() {
  const { teacherView } = useApp();
  switch (teacherView) {
    case "dashboard":
      return <TeacherDashboard />;
    case "classes":
      return <ClassesPage />;
    case "student":
      return <StudentDetail />;
    case "content":
      return <ContentPage />;
    case "assignments":
      return <AssignmentsPage />;
    case "assignment-builder":
      return <AssignmentBuilder />;
    case "quizzes":
      return <TeacherQuizzes />;
    case "quiz-builder":
      return <QuizBuilder />;
    case "analytics":
      return <AnalyticsPage />;
    case "lab":
      return <TeacherLab />;
    case "live":
      return <LiveClassroom />;
    case "presentation":
      return <PresentationMode />;
    case "settings":
      return <SettingsPage teacher />;
    default:
      return <TeacherDashboard />;
  }
}
