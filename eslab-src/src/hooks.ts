import { useEffect, useState } from "react";
import { useStore } from "./store";

/** Numeric parameter that honours teacher-defined initial values and global reset. */
export function useParam(id: string, def: number): [number, (v: number) => void] {
  const { initial, expId, resetKey } = useStore();
  const key = `${expId}.${id}`;
  const start = initial[key] ?? def;
  const [v, setV] = useState(start);
  useEffect(() => { setV(initial[key] ?? def); /* eslint-disable-next-line */ }, [resetKey, initial[key]]);
  return [v, setV];
}

export function useResettable<T>(def: T): [T, (v: T | ((p: T) => T)) => void] {
  const { resetKey } = useStore();
  const [v, setV] = useState<T>(def);
  useEffect(() => { setV(def); /* eslint-disable-next-line */ }, [resetKey]);
  return [v, setV];
}
