import React from "react";

/** Convert a pointer event into SVG viewBox coordinates. */
export function svgPoint(e: React.PointerEvent | PointerEvent, svg: SVGSVGElement | null) {
  if (!svg) return { x: 0, y: 0 };
  const r = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const x = ((e.clientX - r.left) / r.width) * vb.width + vb.x;
  const y = ((e.clientY - r.top) / r.height) * vb.height + vb.y;
  return { x, y };
}

export const LIQUIDS: Record<string, { name: string; rho: number; color: string; top: string }> = {
  water: { name: "آب", rho: 1000, color: "rgba(56,189,248,.45)", top: "rgba(125,211,252,.9)" },
  seawater: { name: "آب دریا", rho: 1025, color: "rgba(14,165,233,.5)", top: "rgba(56,189,248,.9)" },
  oil: { name: "روغن", rho: 800, color: "rgba(251,191,36,.45)", top: "rgba(253,224,71,.9)" },
  glycerin: { name: "گلیسیرین", rho: 1260, color: "rgba(167,139,250,.45)", top: "rgba(196,181,253,.9)" },
  mercury: { name: "جیوه", rho: 13600, color: "rgba(203,213,225,.75)", top: "rgba(241,245,249,.95)" },
  custom: { name: "دلخواه", rho: 1500, color: "rgba(52,211,153,.45)", top: "rgba(110,231,183,.9)" },
};
