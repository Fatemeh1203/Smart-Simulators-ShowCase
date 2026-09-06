import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Mode = "lab" | "discovery" | "measure" | "teacher";
export type ToolId = "ruler" | "voltmeter" | "forcemeter" | "fieldsensor" | "testcharge" | "coords" | "logger";

export interface LogRow {
  id: number;
  time: string;
  experiment: string;
  values: Record<string, number | string>;
}

export interface TeacherQuestion {
  text: string;
  expected: number | null;
  tolerance: number; // percent
  unit: string;
}

export interface StudentResult {
  id: number;
  experiment: string;
  question: string;
  answer: number;
  expected: number | null;
  errorPct: number | null;
  correct: boolean | null;
  time: string;
}

interface Store {
  theme: "dark" | "light";
  toggleTheme: () => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  expId: string;
  setExpId: (id: string) => void;
  // teacher
  locks: Record<string, boolean>;
  toggleLock: (key: string) => void;
  isLocked: (key: string) => boolean;
  initial: Record<string, number>;
  setInitial: (key: string, v: number | undefined) => void;
  question: TeacherQuestion;
  setQuestion: (q: TeacherQuestion) => void;
  results: StudentResult[];
  submitAnswer: (experiment: string, answer: number) => StudentResult;
  clearResults: () => void;
  // pedagogy
  predictions: Record<string, string>;
  setPrediction: (exp: string, p: string) => void;
  stage: number;
  setStage: (s: number) => void;
  // data logger
  log: LogRow[];
  addLog: (experiment: string, values: Record<string, number | string>) => void;
  clearLog: () => void;
  removeLog: (id: number) => void;
  // tools
  tools: Record<ToolId, boolean>;
  toggleTool: (t: ToolId) => void;
  // reset
  resetKey: number;
  reset: () => void;
  // highlight
  lastChanged: string;
  touch: (param: string) => void;
}

const Ctx = createContext<Store | null>(null);

let logId = 1, resId = 1;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mode, setMode] = useState<Mode>("lab");
  const [expId, setExpIdRaw] = useState("charge");
  const [locks, setLocks] = useState<Record<string, boolean>>({});
  const [initial, setInitialRaw] = useState<Record<string, number>>({});
  const [question, setQuestion] = useState<TeacherQuestion>({ text: "", expected: null, tolerance: 5, unit: "" });
  const [results, setResults] = useState<StudentResult[]>([]);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState<LogRow[]>([]);
  const [tools, setTools] = useState<Record<ToolId, boolean>>({
    ruler: false, voltmeter: false, forcemeter: false, fieldsensor: false, testcharge: true, coords: true, logger: true,
  });
  const [resetKey, setResetKey] = useState(0);
  const [lastChanged, setLastChanged] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!lastChanged) return;
    const t = setTimeout(() => setLastChanged(""), 1800);
    return () => clearTimeout(t);
  }, [lastChanged]);

  const setExpId = useCallback((id: string) => { setExpIdRaw(id); setStage(0); }, []);

  const value = useMemo<Store>(() => ({
    theme,
    toggleTheme: () => setTheme(t => (t === "dark" ? "light" : "dark")),
    mode, setMode,
    expId, setExpId,
    locks,
    toggleLock: key => setLocks(l => ({ ...l, [key]: !l[key] })),
    isLocked: key => !!locks[key],
    initial,
    setInitial: (key, v) => setInitialRaw(i => { const n = { ...i }; if (v === undefined) delete n[key]; else n[key] = v; return n; }),
    question, setQuestion,
    results,
    submitAnswer: (experiment, answer) => {
      let errorPct: number | null = null, correct: boolean | null = null;
      if (question.expected !== null && question.expected !== 0) {
        errorPct = Math.abs((answer - question.expected) / question.expected) * 100;
        correct = errorPct <= question.tolerance;
      }
      const r: StudentResult = { id: resId++, experiment, question: question.text, answer, expected: question.expected, errorPct, correct, time: new Date().toLocaleTimeString("fa-IR") };
      setResults(rs => [r, ...rs]);
      return r;
    },
    clearResults: () => setResults([]),
    predictions,
    setPrediction: (exp, p) => setPredictions(ps => ({ ...ps, [exp]: p })),
    stage, setStage,
    log,
    addLog: (experiment, values) => setLog(l => [...l, { id: logId++, time: new Date().toLocaleTimeString("fa-IR"), experiment, values }]),
    clearLog: () => setLog([]),
    removeLog: id => setLog(l => l.filter(r => r.id !== id)),
    tools,
    toggleTool: t => setTools(ts => ({ ...ts, [t]: !ts[t] })),
    resetKey,
    reset: () => setResetKey(k => k + 1),
    lastChanged,
    touch: p => setLastChanged(p),
  }), [theme, mode, expId, setExpId, locks, initial, question, results, predictions, stage, log, tools, resetKey, lastChanged]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("no store");
  return s;
}
