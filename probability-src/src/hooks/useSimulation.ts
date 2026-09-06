import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawOutcome, mulberry32, randomSeed, type ExperimentConfig } from "../lib/probability";

export type SimStatus = "idle" | "running" | "paused";

interface RunPlan {
  target: number;
  done: number;
  animated: boolean;
}

/** Pace rules: how many trials per tick and delay between ticks. */
function pace(target: number, animated: boolean): { batch: number; delay: number } {
  if (!animated) return { batch: Number.MAX_SAFE_INTEGER, delay: 0 };
  if (target <= 10) return { batch: 1, delay: 1150 }; // one full animation per trial
  if (target <= 100) return { batch: 1, delay: 28 };
  if (target <= 1000) return { batch: 10, delay: 22 };
  return { batch: 125, delay: 18 };
}

export function useSimulation(cfg: ExperimentConfig) {
  const [outcomes, setOutcomes] = useState<number[]>([]);
  const [status, setStatus] = useState<SimStatus>("idle");
  const [seed, setSeed] = useState<number>(() => randomSeed());
  const [run, setRun] = useState<RunPlan | null>(null);
  const [lastOutcome, setLastOutcome] = useState<number | null>(null);
  const [animTick, setAnimTick] = useState(0); // increments only for per-trial animated draws
  const [batchTick, setBatchTick] = useState(0); // increments for every state flush

  const rngRef = useRef(mulberry32(seed));
  const outcomesRef = useRef<number[]>([]);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const runRef = useRef<RunPlan>({ target: 0, done: 0, animated: true });
  const timerRef = useRef<number | null>(null);
  const statusRef = useRef<SimStatus>("idle");

  const setStat = (s: SimStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const tick = useCallback(() => {
    timerRef.current = null;
    if (statusRef.current !== "running") return;
    const r = runRef.current;
    const remaining = r.target - r.done;
    if (remaining <= 0) {
      setStat("idle");
      return;
    }
    const { batch, delay } = pace(r.target, r.animated);
    const k = Math.min(batch, remaining);
    const arr = outcomesRef.current;
    let last = -1;
    for (let i = 0; i < k; i++) {
      last = drawOutcome(cfgRef.current, rngRef.current);
      arr.push(last);
    }
    r.done += k;
    setOutcomes(arr.slice());
    setLastOutcome(last);
    setBatchTick((t) => t + 1);
    if (r.animated && batch === 1 && r.target <= 10) setAnimTick((t) => t + 1);
    setRun({ ...r });
    if (r.done >= r.target) {
      setStat("idle");
      return;
    }
    timerRef.current = window.setTimeout(tick, delay);
  }, []);

  /** Add `n` new trials to the current experiment. */
  const start = useCallback(
    (n: number, animated = true) => {
      if (statusRef.current === "running" || n <= 0) return;
      clearTimer();
      runRef.current = { target: n, done: 0, animated };
      setRun({ ...runRef.current });
      setStat("running");
      tick();
    },
    [tick],
  );

  /** Run trials until the total reaches `total`. */
  const runTo = useCallback(
    (total: number, animated = true) => {
      const need = total - outcomesRef.current.length;
      if (need > 0) start(need, animated);
    },
    [start],
  );

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    clearTimer();
    setStat("paused");
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    setStat("running");
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    clearTimer();
    setStat("idle");
    setRun(null);
  }, []);

  /** Clear results; keep the same seed so "repeat" reproduces the same sequence. */
  const reset = useCallback(
    (newSeed?: number) => {
      clearTimer();
      const s = newSeed ?? seed;
      if (newSeed !== undefined) setSeed(newSeed);
      rngRef.current = mulberry32(s);
      outcomesRef.current = [];
      setOutcomes([]);
      setLastOutcome(null);
      setRun(null);
      setStat("idle");
    },
    [seed],
  );

  /** New random seed + clear. */
  const newExperiment = useCallback(() => {
    reset(randomSeed());
  }, [reset]);

  /** Same seed, same number of trials → identical results. */
  const repeat = useCallback(() => {
    const total = outcomesRef.current.length;
    if (total === 0) return;
    clearTimer();
    rngRef.current = mulberry32(seed);
    outcomesRef.current = [];
    setOutcomes([]);
    setLastOutcome(null);
    runRef.current = { target: total, done: 0, animated: true };
    setRun({ ...runRef.current });
    setStat("running");
    // allow React to flush the cleared state before the first tick
    timerRef.current = window.setTimeout(tick, 50);
  }, [seed, tick]);

  useEffect(() => () => clearTimer(), []);

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const o of outcomes) m.set(o, (m.get(o) ?? 0) + 1);
    return m;
  }, [outcomes]);

  const progress = run ? (run.target > 0 ? run.done / run.target : 1) : 0;

  return {
    outcomes,
    counts,
    total: outcomes.length,
    status,
    seed,
    run,
    progress,
    lastOutcome,
    animTick,
    batchTick,
    start,
    runTo,
    pause,
    resume,
    stop,
    reset,
    newExperiment,
    repeat,
  };
}
