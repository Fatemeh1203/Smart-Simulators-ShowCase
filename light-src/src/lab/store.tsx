import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type DiscoveryId = "reflect" | "angles" | "lens" | "refract" | "compare" | "target" | "concave" | "straight";

export const DISCOVERIES: Record<DiscoveryId, { emoji: string; text: string; color: string }> = {
  straight: { emoji: "🔦", text: "نور در خط راست حرکت می‌کند.", color: "bg-yellow-100 border-yellow-300" },
  reflect: { emoji: "🪞", text: "نور از آینه بازتاب می‌شود.", color: "bg-sky-100 border-sky-300" },
  angles: { emoji: "📐", text: "زاویه تابش و بازتاب برابرند.", color: "bg-green-100 border-green-300" },
  lens: { emoji: "🔍", text: "عدسی می‌تواند مسیر نور را تغییر دهد.", color: "bg-purple-100 border-purple-300" },
  concave: { emoji: "🔎", text: "عدسی مقعر پرتوها را از هم دور می‌کند.", color: "bg-fuchsia-100 border-fuchsia-300" },
  refract: { emoji: "💧", text: "نور هنگام عبور از بعضی مواد مسیرش تغییر می‌کند.", color: "bg-cyan-100 border-cyan-300" },
  compare: { emoji: "⚖️", text: "بازتاب یعنی برگشتن نور؛ شکست یعنی کج شدن مسیر نور.", color: "bg-orange-100 border-orange-300" },
  target: { emoji: "🎯", text: "با چرخاندن آینه می‌توانم مسیر نور را کنترل کنم.", color: "bg-pink-100 border-pink-300" },
};

interface StoreState {
  discoveries: DiscoveryId[];
  missionStars: Record<number, number>;
  gameLevel: number; // highest completed level
  score: number;
}

interface StoreApi extends StoreState {
  discover: (id: DiscoveryId) => void;
  setMissionStars: (mission: number, stars: number) => void;
  completeLevel: (level: number) => void;
  addScore: (n: number) => void;
  lastDiscovery: DiscoveryId | null;
  resetAll: () => void;
}

const KEY = "light-lab-v1";
const defaultState: StoreState = { discoveries: [], missionStars: {}, gameLevel: 0, score: 0 };

const Ctx = createContext<StoreApi | null>(null);

export function playChime(kind: "success" | "click" | "wrong" = "success") {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const notes = kind === "success" ? [523, 659, 784, 1046] : kind === "click" ? [660] : [300, 220];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      o.start(t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.stop(t + 0.3);
    });
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [lastDiscovery, setLast] = useState<DiscoveryId | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const discover = useCallback((id: DiscoveryId) => {
    if (stateRef.current.discoveries.includes(id)) return;
    stateRef.current = { ...stateRef.current, discoveries: [...stateRef.current.discoveries, id] };
    setLast(id);
    setTimeout(() => setLast((l) => (l === id ? null : l)), 3500);
    playChime("success");
    setState((s) => (s.discoveries.includes(id) ? s : { ...s, discoveries: [...s.discoveries, id], score: s.score + 5 }));
  }, []);

  const setMissionStars = useCallback((m: number, stars: number) => {
    setState((s) => {
      const prev = s.missionStars[m] ?? 0;
      if (stars <= prev) return s;
      return { ...s, missionStars: { ...s.missionStars, [m]: stars }, score: s.score + (stars - prev) * 10 };
    });
  }, []);

  const completeLevel = useCallback((level: number) => {
    setState((s) => (level > s.gameLevel ? { ...s, gameLevel: level, score: s.score + 10 } : s));
  }, []);

  const addScore = useCallback((n: number) => setState((s) => ({ ...s, score: s.score + n })), []);
  const resetAll = useCallback(() => setState(defaultState), []);

  const api = useMemo<StoreApi>(
    () => ({ ...state, discover, setMissionStars, completeLevel, addScore, lastDiscovery, resetAll }),
    [state, discover, setMissionStars, completeLevel, addScore, lastDiscovery, resetAll],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}
