export const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => faDigits[Number(d)]);
}

export function round(n: number, d = 2): number {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function snap(n: number, step = 0.5): number {
  return Math.round(n / step) * step;
}

export function slope(x1: number, y1: number, x2: number, y2: number): number | null {
  const dx = x2 - x1;
  if (Math.abs(dx) < 1e-9) return null;
  return (y2 - y1) / dx;
}

export function intercept(m: number | null, x: number, y: number): number | null {
  if (m === null) return null;
  return y - m * x;
}

export function formatNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "∞";
  const r = round(n, digits);
  if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r));
  return String(r);
}

export function formatFaNum(n: number, digits = 2): string {
  return toFa(formatNum(n, digits));
}

export function slopeKind(m: number | null): "pos" | "neg" | "zero" | "undef" {
  if (m === null) return "undef";
  if (Math.abs(m) < 1e-9) return "zero";
  return m > 0 ? "pos" : "neg";
}

export function kindLabel(k: ReturnType<typeof slopeKind>): string {
  if (k === "pos") return "شیب مثبت";
  if (k === "neg") return "شیب منفی";
  if (k === "zero") return "شیب صفر";
  return "شیب تعریف‌نشده";
}

export function equationFromMB(m: number | null, b: number | null, x1?: number): string {
  if (m === null) {
    if (x1 === undefined) return "x = ثابت";
    return `x = ${formatNum(x1)}`;
  }
  const ms = formatNum(m);
  const bs = formatNum(b ?? 0);
  const bAbs = formatNum(Math.abs(b ?? 0));
  if (Math.abs(m) < 1e-9) return `y = ${bs}`;
  const mPart = Math.abs(m - 1) < 1e-9 ? "x" : Math.abs(m + 1) < 1e-9 ? "-x" : `${ms}x`;
  if (Math.abs(b ?? 0) < 1e-9) return `y = ${mPart}`;
  const sign = (b ?? 0) >= 0 ? "+" : "−";
  return `y = ${mPart} ${sign} ${bAbs}`;
}

export function fracPair(dy: number, dx: number): { n: number; d: number; undef: boolean } {
  if (Math.abs(dx) < 1e-9) return { n: 1, d: 0, undef: true };
  let n = round(dy, 4);
  let d = round(dx, 4);
  const scale = 100;
  let ni = Math.round(n * scale);
  let di = Math.round(d * scale);
  const g = gcd(ni, di);
  ni /= g;
  di /= g;
  if (di < 0) {
    ni = -ni;
    di = -di;
  }
  return { n: ni, d: di, undef: false };
}

export function parseEquation(raw: string): { m: number; b: number } | null {
  const s = raw.replace(/\s+/g, "").replace(/−/g, "-").replace(/y=/i, "");
  if (!s) return null;
  const m1 = s.match(/^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?$/i);
  if (m1) {
    let mStr = m1[1];
    if (mStr === "" || mStr === "+") mStr = "1";
    if (mStr === "-") mStr = "-1";
    const m = Number(mStr);
    const b = m1[2] ? Number(m1[2]) : 0;
    if (Number.isFinite(m) && Number.isFinite(b)) return { m, b };
  }
  const onlyB = Number(s);
  if (Number.isFinite(onlyB) && !s.includes("x")) return { m: 0, b: onlyB };
  return null;
}

export function lineY(m: number, b: number, x: number): number {
  return m * x + b;
}

export function xpToLevel(xp: number): { level: number; into: number; need: number } {
  const need = 200;
  const level = Math.floor(xp / need) + 1;
  const into = xp % need;
  return { level, into, need };
}

export function relation(m1: number | null, m2: number | null, b1: number | null, b2: number | null) {
  if (m1 === null && m2 === null) return "موازی (هر دو عمودی)";
  if (m1 === null || m2 === null) return "متقاطع";
  if (Math.abs(m1 - m2) < 1e-6) {
    if (Math.abs((b1 ?? 0) - (b2 ?? 0)) < 1e-6) return "منطبق";
    return "موازی";
  }
  if (Math.abs(m1 * m2 + 1) < 1e-6) return "متقاطع و عمود";
  return "متقاطع";
}

export function todayFa(): string {
  return new Date().toLocaleDateString("fa-IR");
}
