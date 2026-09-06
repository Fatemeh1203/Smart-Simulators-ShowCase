import { useEffect, useRef, useState } from "react";

/** Tracks which numeric parameters changed recently and in which direction. */
export function useChanged(vals: Record<string, number>, ttl = 2200) {
  const prev = useRef<Record<string, number>>({ ...vals });
  const [active, setActive] = useState<string[]>([]);
  const [dir, setDir] = useState<Record<string, "up" | "down">>({});
  const timers = useRef<Record<string, number>>({});
  const key = Object.entries(vals).map(([k, v]) => `${k}:${v}`).join("|");
  useEffect(() => {
    const changed: string[] = [];
    const d: Record<string, "up" | "down"> = {};
    for (const k of Object.keys(vals)) {
      if (prev.current[k] !== undefined && Math.abs(prev.current[k] - vals[k]) > 1e-12) {
        changed.push(k); d[k] = vals[k] > prev.current[k] ? "up" : "down";
      }
      prev.current[k] = vals[k];
    }
    if (changed.length) {
      setActive((a) => Array.from(new Set([...a, ...changed])));
      setDir((old) => ({ ...old, ...d }));
      for (const k of changed) {
        window.clearTimeout(timers.current[k]);
        timers.current[k] = window.setTimeout(() => setActive((a) => a.filter((x) => x !== k)), ttl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { active, dir };
}
