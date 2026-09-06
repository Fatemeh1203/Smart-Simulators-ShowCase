import { useCallback, useMemo, useRef, useState } from "react";
import { makeObject } from "./objects";
import { traceScene } from "./physics";
import type { LabObject, ObjKind } from "./types";

export function useLab(initial: LabObject[] | (() => LabObject[])) {
  const [initialObjects] = useState<LabObject[]>(initial);
  const baseline = useRef<LabObject[]>(initialObjects);
  const [objects, setObjects] = useState<LabObject[]>(initialObjects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRays, setShowRays] = useState(true);

  const add = useCallback((kind: ObjKind, x: number, y: number, extra?: Partial<LabObject>) => {
    const o = makeObject(kind, x, y, extra);
    setObjects((prev) => [...prev, o]);
    setSelectedId(o.id);
    return o;
  }, []);

  const update = useCallback((id: string, patch: Partial<LabObject>) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const remove = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  const reset = useCallback(() => {
    setObjects(baseline.current);
    setSelectedId(null);
  }, []);

  /** Load a new scene; also becomes the new baseline for reset(). */
  const replaceAll = useCallback((objs: LabObject[]) => {
    baseline.current = objs;
    setObjects(objs);
    setSelectedId(null);
  }, []);

  const trace = useMemo(() => traceScene(objects), [objects]);
  const selected = objects.find((o) => o.id === selectedId) ?? null;

  return { objects, add, update, remove, reset, replaceAll, selectedId, setSelectedId, selected, trace, showRays, setShowRays };
}

export type LabApi = ReturnType<typeof useLab>;
