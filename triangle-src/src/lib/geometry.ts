export type Point = { x: number; y: number };
export type Triangle = { A: Point; B: Point; C: Point };

/** یک سانتی‌متر چند پیکسل در بوم است */
export const SCALE = 40;
/** ابعاد بوم بر حسب سانتی‌متر */
export const CANVAS_W_CM = 16;
export const CANVAS_H_CM = 11;

export const dist = (p: Point, q: Point) =>
  Math.hypot(p.x - q.x, p.y - q.y);

export const round1 = (n: number) => Math.round(n * 10) / 10;

export type TriangleType =
  | "equilateral"
  | "isosceles"
  | "scalene"
  | "right"
  | "right-isosceles"
  | "degenerate";

export interface TriangleStats {
  /** طول ضلع‌ها به سانتی‌متر */
  AB: number;
  BC: number;
  AC: number;
  /** زاویه‌ها به درجه */
  angA: number;
  angB: number;
  angC: number;
  perimeter: number;
  area: number;
  /** قاعده = BC ، ارتفاع از رأس A */
  base: number;
  height: number;
  /** پای ارتفاع روی خط BC */
  foot: Point;
  type: TriangleType;
  isRight: boolean;
}

function angleAt(v: Point, p: Point, q: Point): number {
  const a = dist(v, p);
  const b = dist(v, q);
  const c = dist(p, q);
  if (a < 1e-6 || b < 1e-6) return 0;
  const cos = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function projectOntoLine(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return { ...a };
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return { x: a.x + t * dx, y: a.y + t * dy };
}

export function classify(
  AB: number,
  BC: number,
  AC: number,
  angles: number[],
  area: number,
): { type: TriangleType; isRight: boolean } {
  if (area < 0.05) return { type: "degenerate", isRight: false };
  const tolSide = 0.25; // cm
  const eq = (x: number, y: number) => Math.abs(x - y) < tolSide;
  const isRight = angles.some((a) => Math.abs(a - 90) < 2);
  const allEq = eq(AB, BC) && eq(BC, AC) && eq(AB, AC);
  const twoEq = eq(AB, BC) || eq(BC, AC) || eq(AB, AC);
  if (allEq) return { type: "equilateral", isRight: false };
  if (isRight && twoEq) return { type: "right-isosceles", isRight: true };
  if (isRight) return { type: "right", isRight: true };
  if (twoEq) return { type: "isosceles", isRight: false };
  return { type: "scalene", isRight: false };
}

export function computeStats(t: Triangle): TriangleStats {
  const { A, B, C } = t;
  const AB = dist(A, B);
  const BC = dist(B, C);
  const AC = dist(A, C);
  const angA = angleAt(A, B, C);
  const angB = angleAt(B, A, C);
  const angC = angleAt(C, A, B);
  const perimeter = AB + BC + AC;
  const area =
    Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2;
  const base = BC;
  const height = base > 1e-6 ? (2 * area) / base : 0;
  const foot = projectOntoLine(A, B, C);
  const { type, isRight } = classify(AB, BC, AC, [angA, angB, angC], area);
  return {
    AB,
    BC,
    AC,
    angA,
    angB,
    angC,
    perimeter,
    area,
    base,
    height,
    foot,
    type,
    isRight,
  };
}

export const TYPE_INFO: Record<
  TriangleType,
  { emoji: string; title: string; desc: string; color: string; bg: string }
> = {
  equilateral: {
    emoji: "🟢",
    title: "مثلث متساوی‌الاضلاع",
    desc: "هر سه ضلع این مثلث با هم برابر هستند و هر سه زاویه ۶۰ درجه‌اند.",
    color: "text-emerald-700",
    bg: "bg-emerald-100 border-emerald-300",
  },
  isosceles: {
    emoji: "🔵",
    title: "مثلث متساوی‌الساقین",
    desc: "دو ضلع این مثلث با هم برابر هستند. به این دو ضلع «ساق» می‌گوییم.",
    color: "text-blue-700",
    bg: "bg-blue-100 border-blue-300",
  },
  scalene: {
    emoji: "🟣",
    title: "مثلث مختلف‌الاضلاع",
    desc: "هر سه ضلع این مثلث با هم فرق دارند. هیچ دو ضلعی برابر نیستند.",
    color: "text-purple-700",
    bg: "bg-purple-100 border-purple-300",
  },
  right: {
    emoji: "🟠",
    title: "مثلث قائم‌الزاویه",
    desc: "یکی از زاویه‌های این مثلث ۹۰ درجه است؛ درست مثل گوشه‌ی یک کتاب!",
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-300",
  },
  "right-isosceles": {
    emoji: "🟠",
    title: "مثلث قائم‌الزاویه متساوی‌الساقین",
    desc: "یک زاویه‌ی ۹۰ درجه دارد و دو ضلعش هم با هم برابرند. دو ویژگی با هم!",
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-300",
  },
  degenerate: {
    emoji: "⚪",
    title: "این که مثلث نیست!",
    desc: "سه نقطه روی یک خط افتاده‌اند. یکی از نقطه‌ها را کمی جابه‌جا کن.",
    color: "text-gray-700",
    bg: "bg-gray-100 border-gray-300",
  },
};

/** تبدیل عدد به ارقام فارسی */
export const fa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const fmt = (n: number, digits = 1) => fa(n.toFixed(digits));

export const DEFAULT_TRIANGLE: Triangle = {
  A: { x: 8, y: 2 },
  B: { x: 3.5, y: 8.5 },
  C: { x: 12.5, y: 8.5 },
};

export const SECOND_TRIANGLE: Triangle = {
  A: { x: 5, y: 2.5 },
  B: { x: 3, y: 8.5 },
  C: { x: 13, y: 8.5 },
};

export const clampPoint = (p: Point): Point => ({
  x: Math.min(CANVAS_W_CM - 0.5, Math.max(0.5, p.x)),
  y: Math.min(CANVAS_H_CM - 0.5, Math.max(0.5, p.y)),
});
