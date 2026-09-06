import { useEffect, useRef } from "react";
import { useStore } from "./store";
import type { LabApi } from "./useLab";

/** Watches the live trace and unlocks notebook cards when phenomena are observed. */
export function useDiscoveries(lab: LabApi, enabled = true) {
  const { discover } = useStore();
  const timers = useRef<Record<string, number>>({});
  const { trace, showRays } = lab;
  const on = enabled && showRays;

  const hasReflect = on && trace.events.some((e) => e.type === "reflect");
  const hasRefract = on && trace.events.some((e) => e.type === "refract");
  const hasFocus = on && !!trace.focusPoint;
  const hasConcave = on && trace.events.some((e) => e.type === "lens" && e.objectKind === "concave");

  const schedule = (key: "reflect" | "refract" | "lens" | "concave", on: boolean, ms: number) => {
    if (on && !timers.current[key]) {
      timers.current[key] = window.setTimeout(() => discover(key), ms);
    }
    if (!on && timers.current[key]) {
      clearTimeout(timers.current[key]);
      delete timers.current[key];
    }
  };

  useEffect(() => schedule("reflect", hasReflect, 1200), [hasReflect]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => schedule("refract", hasRefract, 1500), [hasRefract]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => schedule("lens", hasFocus, 1500), [hasFocus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => schedule("concave", hasConcave, 1500), [hasConcave]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => Object.values(timers.current).forEach((t) => clearTimeout(t)), []);
}
