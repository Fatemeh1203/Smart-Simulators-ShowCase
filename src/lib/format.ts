// Digit localization is language-aware. The I18nProvider calls setDigitLang()
// so numbers use Persian digits only in Persian mode and Latin digits in
// English mode (previously they were always Persian, which looked mixed).
let digitLang: "en" | "fa" = "en";

export function setDigitLang(lang: "en" | "fa"): void {
  digitLang = lang;
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Localizes ASCII digits to the current language (Persian only when lang=fa). */
export function toPersianDigits(input: string | number): string {
  const s = String(input);
  if (digitLang !== "fa") return s;
  return s.replace(/[0-9]/g, (d) => FA_DIGITS[parseInt(d, 10)]);
}

export function formatNum(value: number, digits = 2): string {
  return toPersianDigits(value.toFixed(digits));
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
