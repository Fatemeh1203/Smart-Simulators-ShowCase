import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BodyState, Params, initialState, stepBody } from "./physics";

export type SimStatus = "idle" | "running" | "paused" | "finished";

export interface Sample {
  t: number;
  x: number;
  v: number;
  a: number;
  net: number;
}

const DT = 1 / 240; // physics sub-step (s)
const SAMPLE_EVERY = 0.05; // s
const MAX_SAMPLES = 1200;

export function useSimulation(paramsList: Params[], options?: { maxTime?: number }) {
  const key = JSON.stringify(paramsList);
  // stable reference to params for use inside animation loop
  const paramsRef = useRef(paramsList);
  paramsRef.current = paramsList;

  const [status, setStatus] = useState<SimStatus>("idle");
  const statusRef = useRef<SimStatus>("idle");
  const [states, setStates] = useState<BodyState[]>(() => paramsList.map(initialState));
  const statesRef = useRef(states);
  const histRef = useRef<Sample[][]>(paramsList.map(() => []));
  const [histVersion, setHistVersion] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const timeScaleRef = useRef(1);
  timeScaleRef.current = timeScale;

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const lastSampleRef = useRef(-1);
  const maxTime = options?.maxTime;

  const setStatusBoth = (s: SimStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  // While idle, live-reflect parameter changes in the static preview
  useEffect(() => {
    if (statusRef.current === "idle") {
      const s = paramsRef.current.map(initialState);
      statesRef.current = s;
      setStates(s);
      histRef.current = paramsRef.current.map(() => []);
      setHistVersion((v) => v + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const pushSample = (cur: BodyState[]) => {
    cur.forEach((s, i) => {
      const arr = histRef.current[i] ?? (histRef.current[i] = []);
      arr.push({ t: s.t, x: s.x, v: s.v, a: s.a, net: s.net });
      if (arr.length > MAX_SAMPLES) arr.shift();
    });
  };

  const loop = useCallback(
    (ts: number) => {
      if (statusRef.current !== "running") return;
      const last = lastTsRef.current ?? ts;
      const elapsed = Math.min((ts - last) / 1000, 0.1) * timeScaleRef.current;
      lastTsRef.current = ts;
      accRef.current += elapsed;

      let cur = statesRef.current;
      const p = paramsRef.current;
      while (accRef.current >= DT) {
        cur = cur.map((s, i) => stepBody(s, p[i], DT));
        accRef.current -= DT;
        if (cur[0].t - lastSampleRef.current >= SAMPLE_EVERY - 1e-9) {
          pushSample(cur);
          lastSampleRef.current = cur[0].t;
        }
      }
      statesRef.current = cur;
      setStates(cur);
      setHistVersion((v) => v + 1);

      if (maxTime !== undefined && cur[0].t >= maxTime) {
        setStatusBoth("finished");
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [maxTime]
  );

  const stopRaf = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const start = useCallback(() => {
    stopRaf();
    const s = paramsRef.current.map(initialState);
    statesRef.current = s;
    setStates(s);
    histRef.current = paramsRef.current.map(() => []);
    lastSampleRef.current = 0;
    pushSample(s);
    accRef.current = 0;
    lastTsRef.current = null;
    setStatusBoth("running");
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    stopRaf();
    setStatusBoth("paused");
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    lastTsRef.current = null;
    setStatusBoth("running");
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const reset = useCallback(() => {
    stopRaf();
    const s = paramsRef.current.map(initialState);
    statesRef.current = s;
    setStates(s);
    histRef.current = paramsRef.current.map(() => []);
    setHistVersion((v) => v + 1);
    accRef.current = 0;
    lastTsRef.current = null;
    setStatusBoth("idle");
  }, []);

  useEffect(() => () => stopRaf(), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const histories = useMemo(() => histRef.current.map((h) => h.slice()), [histVersion]);

  return { status, states, histories, start, pause, resume, reset, timeScale, setTimeScale };
}
