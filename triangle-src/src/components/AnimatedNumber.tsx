import { useEffect, useRef, useState } from "react";
import { fa } from "../lib/geometry";

interface Props {
  value: number;
  digits?: number;
  className?: string;
  suffix?: string;
}

/** عددی که با انیمیشن نرم به مقدار جدید می‌رسد */
export default function AnimatedNumber({
  value,
  digits = 1,
  className = "",
  suffix = "",
}: Props) {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState(false);
  const raf = useRef<number | null>(null);
  const from = useRef(value);
  const lastRounded = useRef(value.toFixed(digits));

  useEffect(() => {
    const start = performance.now();
    const startVal = from.current;
    const duration = 220;
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = startVal + (value - startVal) * eased;
      setDisplay(v);
      from.current = v;
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    const rounded = value.toFixed(digits);
    if (rounded !== lastRounded.current) {
      lastRounded.current = rounded;
      setBump(true);
      const id = setTimeout(() => setBump(false), 250);
      return () => {
        clearTimeout(id);
        if (raf.current) cancelAnimationFrame(raf.current);
      };
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, digits]);

  return (
    <span
      className={`inline-block tabular-nums ${bump ? "num-bump" : ""} ${className}`}
    >
      {fa(display.toFixed(digits))}
      {suffix}
    </span>
  );
}
