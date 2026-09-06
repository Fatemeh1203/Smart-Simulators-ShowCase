import React from "react";
import { type LabObject, sizeOf } from "../data";

export function ObjectView({ obj, scale = 1, style, className = "" }: { obj: LabObject; scale?: number; style?: React.CSSProperties; className?: string }) {
  const { w, h } = sizeOf(obj);
  const W = w * scale;
  const H = h * scale;
  const radius = obj.shape === "circle" ? "9999px" : obj.shape === "rect" ? "10px" : "12px";
  const fontSize = Math.max(14, Math.min(W, H) * 0.5);
  return (
    <div
      className={`flex items-center justify-center relative shadow-lg ${className}`}
      style={{
        width: W,
        height: H,
        background: obj.color,
        borderRadius: radius,
        border: obj.hollow ? "4px dashed rgba(255,255,255,0.8)" : "2px solid rgba(255,255,255,0.6)",
        boxShadow: "inset -6px -6px 12px rgba(0,0,0,0.15), inset 6px 6px 12px rgba(255,255,255,0.35), 0 6px 14px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      <span style={{ fontSize, lineHeight: 1 }} className="drop-shadow">
        {obj.emoji}
      </span>
    </div>
  );
}
