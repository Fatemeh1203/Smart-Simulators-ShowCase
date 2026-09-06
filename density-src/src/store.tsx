import React, { createContext, useContext, useEffect, useReducer, useCallback, useState } from "react";
import type { Outcome, LabObject } from "./data";

export interface ResultRow {
  id: number;
  name: string;
  emoji: string;
  guess: Outcome | null;
  actual: Outcome;
  density: number;
  volume: number;
  mass: number;
  time: number;
}

export interface Note {
  id: number;
  text: string;
  time: number;
  auto?: boolean;
}

export interface LabState {
  stars: number;
  results: ResultRow[];
  floated: string[];
  sank: string[];
  suspendedBuilt: boolean;
  bigFloat: boolean;
  smallSink: boolean;
  holesOpened: number[];
  quizDone: boolean;
  boatDone: boolean;
  boatRecord: number;
  notebook: Note[];
  claimedMissions: string[];
  claimedDiscoveries: string[];
  compareDone: string[];
  cylinderMeasured: boolean;
}

const initial: LabState = {
  stars: 0,
  results: [],
  floated: [],
  sank: [],
  suspendedBuilt: false,
  bigFloat: false,
  smallSink: false,
  holesOpened: [],
  quizDone: false,
  boatDone: false,
  boatRecord: 0,
  notebook: [],
  claimedMissions: [],
  claimedDiscoveries: [],
  compareDone: [],
  cylinderMeasured: false,
};

type Action =
  | { type: "stars"; n: number }
  | { type: "result"; row: ResultRow; obj: LabObject }
  | { type: "flag"; key: keyof LabState; value: unknown }
  | { type: "hole"; i: number }
  | { type: "note"; text: string; auto?: boolean }
  | { type: "deleteNote"; id: number }
  | { type: "boatRecord"; n: number }
  | { type: "claimMission"; id: string }
  | { type: "claimDiscovery"; id: string }
  | { type: "compare"; id: string }
  | { type: "reset" };

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function reducer(s: LabState, a: Action): LabState {
  switch (a.type) {
    case "stars":
      return { ...s, stars: s.stars + a.n };
    case "result": {
      const { row, obj } = a;
      const floated = row.actual === "float" ? uniq([...s.floated, obj.id]) : s.floated;
      const sank = row.actual === "sink" ? uniq([...s.sank, obj.id]) : s.sank;
      const suspendedBuilt = s.suspendedBuilt || (!!obj.custom && row.actual === "suspend");
      const bigFloat = s.bigFloat || (!!obj.custom && obj.volume >= 1200 && row.actual === "float");
      const smallSink = s.smallSink || (!!obj.custom && obj.volume <= 200 && row.actual === "sink");
      return { ...s, results: [...s.results, row], floated, sank, suspendedBuilt, bigFloat, smallSink };
    }
    case "flag":
      return { ...s, [a.key]: a.value };
    case "hole":
      return { ...s, holesOpened: uniq([...s.holesOpened, a.i]) };
    case "note":
      return { ...s, notebook: [...s.notebook, { id: Date.now() + Math.random(), text: a.text, time: Date.now(), auto: a.auto }] };
    case "deleteNote":
      return { ...s, notebook: s.notebook.filter((n) => n.id !== a.id) };
    case "boatRecord":
      return { ...s, boatRecord: Math.max(s.boatRecord, a.n), boatDone: s.boatDone || a.n > 0 };
    case "claimMission":
      return { ...s, claimedMissions: uniq([...s.claimedMissions, a.id]) };
    case "claimDiscovery":
      return { ...s, claimedDiscoveries: uniq([...s.claimedDiscoveries, a.id]) };
    case "compare":
      return { ...s, compareDone: uniq([...s.compareDone, a.id]) };
    case "reset":
      return initial;
    default:
      return s;
  }
}

export interface Toast {
  id: number;
  text: string;
  stars?: number;
  kind?: "ok" | "info" | "bad";
}

interface Ctx {
  state: LabState;
  dispatch: React.Dispatch<Action>;
  showForces: boolean;
  setShowForces: (v: boolean) => void;
  guessMode: boolean;
  setGuessMode: (v: boolean) => void;
  toasts: Toast[];
  toast: (text: string, stars?: number, kind?: Toast["kind"]) => void;
  award: (n: number, text: string) => void;
}

const LabContext = createContext<Ctx | null>(null);

const KEY = "density-lab-v1";

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...init, ...JSON.parse(raw) } : init;
    } catch {
      return init;
    }
  });
  const [showForces, setShowForces] = useState(false);
  const [guessMode, setGuessMode] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const toast = useCallback((text: string, stars?: number, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, stars, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const award = useCallback(
    (n: number, text: string) => {
      dispatch({ type: "stars", n });
      toast(text, n);
    },
    [toast]
  );

  return (
    <LabContext.Provider value={{ state, dispatch, showForces, setShowForces, guessMode, setGuessMode, toasts, toast, award }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const c = useContext(LabContext);
  if (!c) throw new Error("useLab outside provider");
  return c;
}
