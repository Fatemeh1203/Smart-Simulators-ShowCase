import { useState, type ReactNode } from "react";
import { useApp } from "../context";
import type { StudentView, TeacherView } from "../types";
import { I, Icon } from "./UI";
import { Tutor } from "./Tutor";
import patternLight from "../assets/pattern-light.jpg";

const studentNav: { id: StudentView; label: string; d: string }[] = [
  { id: "dashboard", label: "داشبورد", d: I.home },
  { id: "path", label: "مسیر یادگیری", d: I.path },
  { id: "plane", label: "صفحه مختصات", d: I.plane },
  { id: "slope", label: "آزمایشگاه شیب", d: I.slope },
  { id: "equation", label: "معادله و نمودار", d: I.chart },
  { id: "linelab", label: "آزمایشگاه خط", d: I.flask },
  { id: "explore", label: "کاوش آزاد", d: I.spark },
  { id: "compare", label: "نمای مقایسه‌ای", d: I.eye },
  { id: "challenges", label: "تمرین‌ها", d: I.pen },
  { id: "quizzes", label: "آزمون‌ها", d: I.quiz },
  { id: "achievements", label: "دستاوردها", d: I.trophy },
  { id: "progress", label: "پیشرفت", d: I.progress },
  { id: "lab3d", label: "آزمایشگاه سه‌بعدی", d: I.target },
  { id: "settings", label: "تنظیمات", d: I.gear },
];

const teacherNav: { id: TeacherView; label: string; d: string }[] = [
  { id: "dashboard", label: "داشبورد", d: I.home },
  { id: "classes", label: "کلاس‌ها", d: I.users },
  { id: "content", label: "محتوای آموزشی", d: I.book },
  { id: "assignments", label: "تکالیف", d: I.pen },
  { id: "quizzes", label: "آزمون‌ها", d: I.quiz },
  { id: "analytics", label: "تحلیل عملکرد", d: I.chart },
  { id: "lab", label: "آزمایشگاه خط", d: I.flask },
  { id: "live", label: "کلاس زنده", d: I.live },
  { id: "settings", label: "تنظیمات", d: I.gear },
];

const mobileStudent: StudentView[] = ["dashboard", "path", "slope", "equation", "challenges"];
const mobileTeacher: TeacherView[] = ["dashboard", "classes", "assignments", "analytics", "live"];

export function Shell({ children }: { children: ReactNode }) {
  const {
    role,
    name,
    theme,
    toggleTheme,
    studentView,
    setStudentView,
    teacherView,
    setTeacherView,
    presentation,
    logout,
  } = useApp();
  const [open, setOpen] = useState(false);
  const isTeacher = role === "teacher";
  const items = isTeacher ? teacherNav : studentNav;
  const active = isTeacher ? teacherView : studentView;
  const go = (id: string) => {
    if (isTeacher) setTeacherView(id as TeacherView);
    else setStudentView(id as StudentView);
    setOpen(false);
  };

  if (presentation) {
    return <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: theme === "light" ? `url(${patternLight})` : "none",
          backgroundSize: "cover",
        }}
      />
      {theme === "dark" && (
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.16),_transparent_55%)]" />
      )}

      <aside
        className={`glass fixed inset-y-0 right-0 z-40 w-72 overflow-auto p-4 transition md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
            <Icon d={I.slope} />
          </div>
          <div>
            <div className="text-sm font-black">آزمایشگاه خط</div>
            <div className="text-[11px] text-[var(--text-mute)]">{isTeacher ? "حالت معلم" : "حالت دانش‌آموز"}</div>
          </div>
        </div>
        <nav className="space-y-1 pb-24 md:pb-4">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              className={`focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                active === it.id
                  ? "bg-gradient-to-l from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon d={it.d} className="h-4 w-4" />
              {it.label}
            </button>
          ))}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <header className="glass sticky top-0 z-20 mr-0 flex items-center justify-between gap-3 px-4 py-3 md:mr-72">
        <div className="flex items-center gap-2">
          <button className="focus-ring rounded-xl p-2 md:hidden" onClick={() => setOpen(true)} aria-label="منو">
            <Icon d={I.menu} />
          </button>
          <div>
            <div className="text-sm font-bold">{name || "کاربر"}</div>
            <div className="text-[11px] text-[var(--text-mute)]">ریاضی پایه نهم · خط و معادله</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="focus-ring rounded-2xl border border-[var(--line)] p-2" onClick={toggleTheme} aria-label="تغییر پوسته">
            <Icon d={theme === "dark" ? I.sun : I.moon} />
          </button>
          <button className="focus-ring hidden rounded-2xl border border-[var(--line)] p-2 sm:grid" onClick={logout} aria-label="خروج">
            <Icon d={I.logout} />
          </button>
        </div>
      </header>

      <main className="relative mr-0 px-4 py-5 pb-24 md:mr-72 md:px-6 md:pb-8">{children}</main>

      <nav className="glass fixed bottom-0 left-0 right-0 z-30 flex justify-around px-2 py-2 md:hidden">
        {(isTeacher ? mobileTeacher : mobileStudent).map((id) => {
          const it = items.find((x) => x.id === id)!;
          return (
            <button
              key={id}
              onClick={() => go(id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] ${
                active === id ? "text-indigo-500" : "text-[var(--text-mute)]"
              }`}
            >
              <Icon d={it.d} className="h-5 w-5" />
              {it.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>

      {!isTeacher && <Tutor />}
    </div>
  );
}
