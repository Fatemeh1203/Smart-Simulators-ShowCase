const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export const fa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
export const deg = (n: number) => `${fa(Math.round(n))}°`;
