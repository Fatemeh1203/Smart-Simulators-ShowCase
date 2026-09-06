import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeModel, DEFAULT_PARAMS, type Params, clampParams } from '../lib/model';

export interface HistoryPoint {
  t: number; // seconds of simulated time
  rate: number;
}

const HISTORY_MAX = 120;
const SAMPLE_EVERY = 0.5; // seconds of sim time

export function useSimulation(initial: Params = DEFAULT_PARAMS) {
  const [params, setParamsState] = useState<Params>(initial);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [time, setTime] = useState(0);
  const [oxygen, setOxygen] = useState(0);
  const [glucose, setGlucose] = useState(0);
  const [history, setHistory] = useState<HistoryPoint[]>([{ t: 0, rate: computeModel(initial).rate }]);

  const model = useMemo(() => computeModel(params), [params]);

  const refs = useRef({ rate: model.rate, running, speed, time: 0, lastSample: 0, o2: 0, glu: 0 });
  refs.current.rate = model.rate;
  refs.current.running = running;
  refs.current.speed = speed;

  // حلقه‌ی زمان شبیه‌سازی (به‌روزرسانی حالت ~۸ بار در ثانیه برای عملکرد روان)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dtReal = Math.min(0.1, (now - last) / 1000);
      last = now;
      const r = refs.current;
      if (r.running) {
        const dt = dtReal * r.speed;
        r.time += dt;
        // در نرخ ۱۰۰٪ حدود ۳ مولکول اکسیژن در هر ثانیه‌ی شبیه‌سازی
        r.o2 += (r.rate / 100) * 3 * dt;
        r.glu += (r.rate / 100) * 0.5 * dt;
        acc += dtReal;
        if (r.time - r.lastSample >= SAMPLE_EVERY) {
          r.lastSample = r.time;
          const point = { t: Math.round(r.time * 10) / 10, rate: r.rate };
          setHistory((h) => {
            const next = [...h, point];
            return next.length > HISTORY_MAX ? next.slice(next.length - HISTORY_MAX) : next;
          });
        }
        if (acc >= 0.125) {
          acc = 0;
          setTime(r.time);
          setOxygen(r.o2);
          setGlucose(r.glu);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setParams = useCallback((updater: Partial<Params> | ((p: Params) => Params)) => {
    setParamsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return clampParams(next);
    });
  }, []);

  const reset = useCallback(() => {
    setParamsState(DEFAULT_PARAMS);
    const r = refs.current;
    r.time = 0;
    r.lastSample = 0;
    r.o2 = 0;
    r.glu = 0;
    setTime(0);
    setOxygen(0);
    setGlucose(0);
    setHistory([{ t: 0, rate: computeModel(DEFAULT_PARAMS).rate }]);
    setRunning(true);
    setSpeed(1);
  }, []);

  // انیمیشن نرم تغییر پارامترها (برای حالت معلم و آزمایش‌ها)
  const animateTo = useCallback(
    (target: Partial<Params>, durationMs = 1200) => {
      const start = performance.now();
      let from: Params | null = null;
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / durationMs);
        const e = 1 - Math.pow(1 - k, 3);
        setParamsState((prev) => {
          if (!from) from = prev;
          const f = from;
          const next: Params = { ...prev };
          (Object.keys(target) as (keyof Params)[]).forEach((key) => {
            const tv = target[key]!;
            next[key] = f[key] + (tv - f[key]) * e;
          });
          return clampParams(next);
        });
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    [],
  );

  return {
    params,
    setParams,
    animateTo,
    model,
    running,
    setRunning,
    speed,
    setSpeed,
    time,
    oxygen,
    glucose,
    history,
    reset,
  };
}

export type Simulation = ReturnType<typeof useSimulation>;
