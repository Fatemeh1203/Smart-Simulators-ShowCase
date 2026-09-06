import type { LabObject, ObjKind } from "./types";

let counter = 1;
export const uid = (prefix = "o") => `${prefix}${counter++}_${Math.random().toString(36).slice(2, 6)}`;

export const TOOL_INFO: Record<ObjKind, { emoji: string; name: string; hint: string }> = {
  source: { emoji: "🔦", name: "چراغ‌قوه", hint: "منبع نور؛ می‌توانی زاویه‌اش را عوض کنی" },
  mirror: { emoji: "🪞", name: "آینه", hint: "نور را برمی‌گرداند (بازتاب)" },
  convex: { emoji: "🔍", name: "عدسی محدب", hint: "پرتوها را به هم نزدیک می‌کند" },
  concave: { emoji: "🔎", name: "عدسی مقعر", hint: "پرتوها را از هم دور می‌کند" },
  glass: { emoji: "🧊", name: "قطعه شیشه", hint: "نور موقع ورود مسیرش کج می‌شود (شکست)" },
  water: { emoji: "💧", name: "ظرف آب", hint: "نور موقع ورود به آب می‌شکند" },
  protractor: { emoji: "📐", name: "نقاله", hint: "برای اندازه‌گیری زاویه؛ نزدیک آینه بگذار" },
  target: { emoji: "🎯", name: "هدف", hint: "سعی کن نور را به آن برسانی" },
};

export function makeObject(kind: ObjKind, x: number, y: number, extra: Partial<LabObject> = {}): LabObject {
  const base: LabObject = { id: uid(kind[0]), kind, x, y, angle: 0, movable: true, rotatable: true, deletable: true };
  switch (kind) {
    case "source":
      return { ...base, angle: 0, rayMode: "single", rayCount: 1, spread: 30, ...extra };
    case "mirror":
      return { ...base, angle: 45, length: 130, ...extra };
    case "convex":
      return { ...base, angle: 90, length: 120, focal: 160, ...extra };
    case "concave":
      return { ...base, angle: 90, length: 120, focal: -160, ...extra };
    case "glass":
      return { ...base, w: 150, h: 110, n: 1.5, rotatable: false, ...extra };
    case "water":
      return { ...base, w: 200, h: 130, n: 1.33, rotatable: false, ...extra };
    case "target":
      return { ...base, r: 26, rotatable: false, ...extra };
    case "protractor":
      return { ...base, rotatable: false, ...extra };
  }
}
