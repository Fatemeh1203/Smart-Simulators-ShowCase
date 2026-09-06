// ساده‌سازی آموزشی مدل فتوسنتز — نه یک مدل دقیق فیزیولوژیک

export interface Params {
  light: number; // 0..100
  co2: number; // 0..100
  water: number; // 0..100
  temp: number; // 5..45 °C
}

export type FactorKey = 'light' | 'co2' | 'water' | 'temp';

export const DEFAULT_PARAMS: Params = { light: 60, co2: 60, water: 70, temp: 25 };

export const FACTOR_META: Record<
  FactorKey,
  { label: string; en: string; icon: string; color: string; unit: string; min: number; max: number }
> = {
  light: { label: 'شدت نور', en: 'Light', icon: '☀️', color: '#f59e0b', unit: '%', min: 0, max: 100 },
  co2: { label: 'دی‌اکسید کربن', en: 'CO₂', icon: '💨', color: '#64748b', unit: '%', min: 0, max: 100 },
  water: { label: 'آب', en: 'H₂O', icon: '💧', color: '#0ea5e9', unit: '%', min: 0, max: 100 },
  temp: { label: 'دما', en: 'Temperature', icon: '🌡️', color: '#ef4444', unit: '°C', min: 5, max: 45 },
};

// پاسخ اشباع‌شونده (شبیه منحنی میکائیلیس-منتن): در مقادیر کم تقریباً خطی، در مقادیر زیاد به سقف می‌رسد
const K = 0.4;
export function saturating(x01: number): number {
  const x = Math.max(0, Math.min(1, x01));
  return ((1 + K) * x) / (x + K);
}

// منحنی زنگوله‌ای دما: بهینه حدود ۲۷ درجه، افت سریع‌تر در دماهای بالا (غیرفعال شدن آنزیم‌ها)
const T_OPT = 27;
export function tempFactor(t: number): number {
  const sigma = t <= T_OPT ? 12 : 8;
  const v = Math.exp(-Math.pow((t - T_OPT) / sigma, 2));
  return t >= 46 ? 0 : v;
}

export interface ModelResult {
  rate: number; // 0..100
  factors: Record<FactorKey, number>; // 0..1
  limiting: FactorKey | null;
  status: 'high' | 'medium' | 'low';
}

export function computeModel(p: Params): ModelResult {
  const factors: Record<FactorKey, number> = {
    light: saturating(p.light / 100),
    co2: saturating(p.co2 / 100),
    water: saturating(p.water / 100),
    temp: tempFactor(p.temp),
  };
  const keys: FactorKey[] = ['light', 'co2', 'water', 'temp'];
  let minKey: FactorKey = 'light';
  let minVal = Infinity;
  let sum = 0;
  for (const k of keys) {
    sum += factors[k];
    if (factors[k] < minVal) {
      minVal = factors[k];
      minKey = k;
    }
  }
  const mean = sum / keys.length;
  // قانون عامل محدودکننده (لیبیگ): کمترین عامل تعیین‌کننده است؛ سایر عوامل فقط اثر کوچکی دارند
  const rate01 = minVal * (0.85 + 0.15 * mean);
  const rate = Math.round(Math.max(0, Math.min(1, rate01)) * 100);
  const limiting: FactorKey | null = minVal < 0.9 ? minKey : null;
  const status: ModelResult['status'] = rate >= 70 ? 'high' : rate >= 40 ? 'medium' : 'low';
  return { rate, factors, limiting, status };
}

export function statusLabel(s: ModelResult['status']) {
  switch (s) {
    case 'high':
      return { text: 'بالا', emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    case 'medium':
      return { text: 'متوسط', emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    default:
      return { text: 'پایین', emoji: '🔴', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }
}

export function limitingExplanation(key: FactorKey | null, p: Params): string {
  if (!key) return 'همه عوامل در محدوده مطلوب هستند؛ گیاه با حداکثر توان فتوسنتز می‌کند.';
  switch (key) {
    case 'light':
      return 'نور کافی نیست؛ حتی با CO₂ و آب فراوان، انرژی لازم برای واکنش‌های نوری تأمین نمی‌شود.';
    case 'co2':
      return 'CO₂ کم است؛ مواد اولیه‌ی ساخت گلوکز کافی نیست و افزایش نور دیگر کمکی نمی‌کند.';
    case 'water':
      return 'آب کم است؛ گیاه روزنه‌ها را می‌بندد و ورود CO₂ و واکنش‌های فتوسنتز کاهش می‌یابد.';
    case 'temp':
      return p.temp > T_OPT
        ? 'دما بسیار بالاست؛ آنزیم‌های فتوسنتز آسیب می‌بینند و فعالیت به‌شدت کم می‌شود.'
        : 'دما بسیار پایین است؛ آنزیم‌ها کند کار می‌کنند و سرعت واکنش‌ها افت می‌کند.';
  }
}

export function clampParams(p: Params): Params {
  return {
    light: Math.max(0, Math.min(100, Math.round(p.light))),
    co2: Math.max(0, Math.min(100, Math.round(p.co2))),
    water: Math.max(0, Math.min(100, Math.round(p.water))),
    temp: Math.max(5, Math.min(45, Math.round(p.temp))),
  };
}
