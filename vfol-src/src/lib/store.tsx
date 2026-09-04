import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { tr, type Lang, type Key, type Bi } from "./i18n";

export type Level = 1 | 2 | 3;
export type Mode = "student" | "instructor" | "research" | "free";
export type Model = "ideal" | "realistic" | "experimental";
export type Goal = "learn" | "experiment" | "teach" | "research";

export interface NoiseFlags { meas: boolean; inst: boolean; conn: boolean; splice: boolean; temp: boolean; laser: boolean; det: boolean; }
export interface DataRecord { id: string; exp: string; time: string; params: Record<string, number | string>; results: Record<string, number | string>; }
export interface Constraint { key: string; op: ">=" | "<=" | "=="; value: number; label: string; }
export interface Assignment { id: string; title: string; description: string; timeLimit: number; hidden: string; constraints: Constraint[]; disabled: string[]; fault: string; createdAt: string; }
export interface Submission { id: string; assignmentId: string; time: string; design: unknown; metrics: Record<string, number>; score: number; details: { label: string; pass: boolean }[]; }

interface Store {
  lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; L: (b: Bi) => string; dir: "rtl" | "ltr";
  theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void;
  level: Level; setLevel: (l: Level) => void;
  mode: Mode; setMode: (m: Mode) => void;
  model: Model; setModel: (m: Model) => void;
  goal: Goal; setGoal: (g: Goal) => void;
  guided: boolean; setGuided: (g: boolean) => void;
  onboarded: boolean; setOnboarded: (b: boolean) => void;
  noise: NoiseFlags; setNoise: (n: Partial<NoiseFlags>) => void;
  records: DataRecord[]; addRecord: (r: Omit<DataRecord, "id" | "time">) => void; clearRecords: (exp?: string) => void;
  notes: Record<string, string>; setNote: (exp: string, v: string) => void;
  assignments: Assignment[]; saveAssignment: (a: Assignment) => void; deleteAssignment: (id: string) => void;
  submissions: Submission[]; addSubmission: (s: Submission) => void;
  activeAssignment: string | null; setActiveAssignment: (id: string | null) => void;
  view: string; setView: (v: string) => void;
  quiz: Record<string, { correct: number; attempts: number }>; setQuizResult: (exp: string, correct: number, attempts: number) => void;
}

const Ctx = createContext<Store | null>(null);
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem("vofl:" + k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const persist = (k: string, v: unknown) => { try { localStorage.setItem("vofl:" + k, JSON.stringify(v)); } catch { /* ignore */ } };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangS] = useState<Lang>(() => load("lang", "fa"));
  const [theme, setThemeS] = useState<"light" | "dark">(() => load("theme", "dark"));
  const [level, setLevelS] = useState<Level>(() => load("level", 1));
  const [mode, setModeS] = useState<Mode>(() => load("mode", "student"));
  const [model, setModelS] = useState<Model>(() => load("model", "realistic"));
  const [goal, setGoalS] = useState<Goal>(() => load("goal", "learn"));
  const [guided, setGuidedS] = useState<boolean>(() => load("guided", true));
  const [onboarded, setOnboardedS] = useState<boolean>(() => load("onboarded", false));
  const [noise, setNoiseS] = useState<NoiseFlags>(() => load("noise", { meas: true, inst: true, conn: true, splice: true, temp: false, laser: true, det: true }));
  const [records, setRecords] = useState<DataRecord[]>(() => load("records", []));
  const [notes, setNotes] = useState<Record<string, string>>(() => load("notes", {}));
  const [assignments, setAssignments] = useState<Assignment[]>(() => load("assignments", []));
  const [submissions, setSubmissions] = useState<Submission[]>(() => load("submissions", []));
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [view, setView] = useState<string>(() => load("view", "home"));
  const [quiz, setQuiz] = useState<Record<string, { correct: number; attempts: number }>>(() => load("quiz", {}));

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); persist("theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.setAttribute("dir", lang === "fa" ? "rtl" : "ltr"); document.documentElement.lang = lang; persist("lang", lang); }, [lang]);
  useEffect(() => persist("level", level), [level]);
  useEffect(() => persist("mode", mode), [mode]);
  useEffect(() => persist("model", model), [model]);
  useEffect(() => persist("goal", goal), [goal]);
  useEffect(() => persist("guided", guided), [guided]);
  useEffect(() => persist("onboarded", onboarded), [onboarded]);
  useEffect(() => persist("noise", noise), [noise]);
  useEffect(() => persist("records", records), [records]);
  useEffect(() => persist("notes", notes), [notes]);
  useEffect(() => persist("assignments", assignments), [assignments]);
  useEffect(() => persist("submissions", submissions), [submissions]);
  useEffect(() => persist("view", view), [view]);
  useEffect(() => persist("quiz", quiz), [quiz]);

  const t = useCallback((k: Key) => tr(lang, k), [lang]);
  const L = useCallback((b: Bi) => b[lang], [lang]);

  const value = useMemo<Store>(() => ({
    lang, setLang: setLangS, t, L, dir: lang === "fa" ? "rtl" : "ltr",
    theme, setTheme: setThemeS, level, setLevel: setLevelS, mode, setMode: setModeS, model, setModel: setModelS,
    goal, setGoal: setGoalS, guided, setGuided: setGuidedS, onboarded, setOnboarded: setOnboardedS,
    noise, setNoise: (n) => setNoiseS((p) => ({ ...p, ...n })),
    records,
    addRecord: (r) => setRecords((p) => [...p, { ...r, id: Math.random().toString(36).slice(2, 9), time: new Date().toISOString() }]),
    clearRecords: (exp) => setRecords((p) => (exp ? p.filter((r) => r.exp !== exp) : [])),
    notes, setNote: (exp, v) => setNotes((p) => ({ ...p, [exp]: v })),
    assignments, saveAssignment: (a) => setAssignments((p) => [...p.filter((x) => x.id !== a.id), a]),
    deleteAssignment: (id) => setAssignments((p) => p.filter((x) => x.id !== id)),
    submissions, addSubmission: (s) => setSubmissions((p) => [...p, s]),
    activeAssignment, setActiveAssignment, view, setView,
    quiz, setQuizResult: (exp, correct, attempts) => setQuiz((p) => ({ ...p, [exp]: { correct, attempts } })),
  }), [lang, t, L, theme, level, mode, model, goal, guided, onboarded, noise, records, notes, assignments, submissions, activeAssignment, view, quiz]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("store");
  return s;
}

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
export function toCSV(rows: DataRecord[]) {
  if (!rows.length) return "";
  const keys = Array.from(new Set(rows.flatMap((r) => [...Object.keys(r.params).map((k) => "p:" + k), ...Object.keys(r.results).map((k) => "r:" + k)])));
  const head = ["id", "experiment", "time", ...keys].join(",");
  const body = rows.map((r) => [r.id, r.exp, r.time, ...keys.map((k) => { const [t, n] = k.split(":"); const v = t === "p" ? r.params[n] : r.results[n]; return v === undefined ? "" : String(v); })].join(","));
  return [head, ...body].join("\n");
}
