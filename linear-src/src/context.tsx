import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { badges, lessons } from "./data";
import type { LessonId, Role, StudentView, TeacherView, Theme } from "./types";
import { xpToLevel } from "./math";

type Mission = {
  pos: boolean;
  neg: boolean;
  zero: boolean;
};

type State = {
  theme: Theme;
  role: Role | null;
  name: string;
  studentView: StudentView;
  teacherView: TeacherView;
  lessonId: LessonId;
  teacherStudentId: string | null;
  xp: number;
  solved: number;
  correct: number;
  minutes: number;
  completed: LessonId[];
  lessonProgress: Record<string, number>;
  badgesGot: string[];
  streak: number;
  mission: Mission;
  activity: { t: string; text: string }[];
  presentation: boolean;
  fontScale: number;
  highContrast: boolean;
};

type Ctx = State & {
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  login: (name: string, role: Role) => void;
  logout: () => void;
  setStudentView: (v: StudentView) => void;
  setTeacherView: (v: TeacherView) => void;
  openLesson: (id: LessonId) => void;
  addXp: (n: number, why: string) => void;
  completeLesson: (id: LessonId) => void;
  setLessonProgress: (id: string, n: number) => void;
  markAnswer: (ok: boolean) => void;
  earnBadge: (id: string) => void;
  setMission: (m: Partial<Mission>) => void;
  setTeacherStudentId: (id: string | null) => void;
  setPresentation: (v: boolean) => void;
  setFontScale: (n: number) => void;
  setHighContrast: (v: boolean) => void;
  overall: number;
  level: { level: number; into: number; need: number };
};

const KEY = "line-lab-v1";

const initial: State = {
  theme: "dark",
  role: null,
  name: "",
  studentView: "dashboard",
  teacherView: "dashboard",
  lessonId: "coord",
  teacherStudentId: null,
  xp: 0,
  solved: 0,
  correct: 0,
  minutes: 0,
  completed: [],
  lessonProgress: {},
  badgesGot: [],
  streak: 1,
  mission: { pos: false, neg: false, zero: false },
  activity: [{ t: "الان", text: "ورود به آزمایشگاه خط و معادله" }],
  presentation: false,
  fontScale: 1,
  highContrast: false,
};

const C = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...initial, ...JSON.parse(raw), role: null, presentation: false };
    } catch {
      /* ignore */
    }
    return initial;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", s.theme === "dark");
    document.documentElement.style.fontSize = `${16 * s.fontScale}px`;
    document.documentElement.classList.toggle("contrast-more", s.highContrast);
  }, [s.theme, s.fontScale, s.highContrast]);

  useEffect(() => {
    const { presentation, ...rest } = s;
    void presentation;
    localStorage.setItem(KEY, JSON.stringify(rest));
  }, [s]);

  useEffect(() => {
    const t = setInterval(() => {
      setS((p) => (p.role ? { ...p, minutes: p.minutes + 1 } : p));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const overall = useMemo(() => {
    const n = lessons.length;
    const sum = lessons.reduce((a, l) => a + (s.completed.includes(l.id) ? 100 : s.lessonProgress[l.id] ?? 0), 0);
    return Math.round(sum / n);
  }, [s.completed, s.lessonProgress]);

  const level = xpToLevel(s.xp);

  const api: Ctx = {
    ...s,
    overall,
    level,
    setTheme: (theme) => setS((p) => ({ ...p, theme })),
    toggleTheme: () => setS((p) => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" })),
    login: (name, role) =>
      setS((p) => ({
        ...p,
        name: name.trim(),
        role,
        studentView: "dashboard",
        teacherView: "dashboard",
        activity: [{ t: "الان", text: role === "student" ? "شروع یادگیری در داشبورد" : "ورود به پنل معلم" }, ...p.activity].slice(0, 8),
      })),
    logout: () => setS((p) => ({ ...p, role: null, name: "", presentation: false })),
    setStudentView: (studentView) => setS((p) => ({ ...p, studentView })),
    setTeacherView: (teacherView) => setS((p) => ({ ...p, teacherView })),
    openLesson: (lessonId) => setS((p) => ({ ...p, lessonId, studentView: "lesson" })),
    addXp: (n, why) =>
      setS((p) => ({
        ...p,
        xp: p.xp + n,
        activity: [{ t: "الان", text: `${why}  +${n} XP` }, ...p.activity].slice(0, 8),
      })),
    completeLesson: (id) =>
      setS((p) => {
        if (p.completed.includes(id)) return p;
        const lesson = lessons.find((l) => l.id === id);
        return {
          ...p,
          completed: [...p.completed, id],
          lessonProgress: { ...p.lessonProgress, [id]: 100 },
          xp: p.xp + (lesson?.xp ?? 50),
          activity: [{ t: "الان", text: `مرحله «${lesson?.title}» کامل شد` }, ...p.activity].slice(0, 8),
        };
      }),
    setLessonProgress: (id, n) =>
      setS((p) => ({ ...p, lessonProgress: { ...p.lessonProgress, [id]: Math.max(p.lessonProgress[id] ?? 0, n) } })),
    markAnswer: (ok) =>
      setS((p) => ({
        ...p,
        solved: p.solved + 1,
        correct: p.correct + (ok ? 1 : 0),
        xp: p.xp + (ok ? 20 : 4),
      })),
    earnBadge: (id) =>
      setS((p) => {
        if (p.badgesGot.includes(id)) return p;
        const b = badges.find((x) => x.id === id);
        return {
          ...p,
          badgesGot: [...p.badgesGot, id],
          xp: p.xp + 80,
          activity: [{ t: "الان", text: `نشان «${b?.title}» باز شد` }, ...p.activity].slice(0, 8),
        };
      }),
    setMission: (m) =>
      setS((p) => {
        const mission = { ...p.mission, ...m };
        let next = { ...p, mission };
        if (mission.pos && mission.neg && mission.zero && !p.badgesGot.includes("slope-master")) {
          next = {
            ...next,
            badgesGot: [...p.badgesGot, "slope-master"],
            xp: p.xp + 180,
            activity: [{ t: "الان", text: "مأموریت شکارچی شیب کامل شد" }, ...p.activity].slice(0, 8),
          };
        }
        return next;
      }),
    setTeacherStudentId: (teacherStudentId) => setS((p) => ({ ...p, teacherStudentId, teacherView: teacherStudentId ? "student" : "classes" })),
    setPresentation: (presentation) => setS((p) => ({ ...p, presentation })),
    setFontScale: (fontScale) => setS((p) => ({ ...p, fontScale })),
    setHighContrast: (highContrast) => setS((p) => ({ ...p, highContrast })),
  };

  return <C.Provider value={api}>{children}</C.Provider>;
}

export function useApp() {
  const v = useContext(C);
  if (!v) throw new Error("useApp");
  return v;
}
