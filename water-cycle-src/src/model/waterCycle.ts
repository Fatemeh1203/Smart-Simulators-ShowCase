// ─────────────────────────────────────────────────────────────
//  مدل آموزشی چرخه آب — روابط ساده اما علمی
// ─────────────────────────────────────────────────────────────

export interface Params {
  sun: number; // 0..100  شدت تابش خورشید
  temp: number; // -10..50 دما (°C)
  humidity: number; // 0..100 رطوبت هوا
  rain: number; // 0..100 احتمال/شدت بارش
  wind: number; // 0..100 سرعت باد
  vegetation: number; // 0..100 پوشش گیاهی
}

export const DEFAULT_PARAMS: Params = {
  sun: 60,
  temp: 25,
  humidity: 50,
  rain: 50,
  wind: 40,
  vegetation: 70,
};

export interface SimState {
  vapor: number; // بخار آب موجود در هوا 0..100
  cloud: number; // تراکم ابر 0..100
  surfaceWater: number; // آب سطحی (دریاچه) 0..100
  groundwater: number; // آب زیرزمینی 0..100
  raining: boolean; // آیا بارش آغاز شده؟ (هیسترزیس)
  time: number; // زمان شبیه‌سازی (ثانیه)
}

export const INITIAL_STATE: SimState = {
  vapor: 20,
  cloud: 15,
  surfaceWater: 60,
  groundwater: 40,
  raining: false,
  time: 0,
};

export type StageId =
  | "evaporation"
  | "transpiration"
  | "condensation"
  | "cloud"
  | "precipitation"
  | "runoff"
  | "infiltration"
  | "collection";

export interface Rates {
  evaporation: number; // 0..100
  transpiration: number; // 0..100
  condensation: number; // 0..100
  cloudDensity: number; // 0..100
  precipitation: number; // 0..100
  runoff: number; // 0..100
  infiltration: number; // 0..100
  infiltrationFraction: number; // 0..1
  surfaceWater: number; // 0..100
  groundwater: number; // 0..100
  vapor: number; // 0..100
  airCapacity: number; // ظرفیت هوا برای بخار 0..100
  saturation: number; // درصد اشباع 0..150
  precipType: "rain" | "snow" | "none";
  precipActive: boolean;
  precipThreshold: number;
  mountainSnow: boolean;
  mountainTemp: number;
  frozenLake: boolean;
}

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

/** ضریب دما برای تبخیر: زیر صفر آب یخ می‌زند و تبخیر تقریباً متوقف می‌شود */
export function tempFactor(temp: number): number {
  if (temp <= 0) return 0.03;
  return clamp(0.12 + temp / 38, 0.05, 1.25);
}

/** ظرفیت نگهداری بخار توسط هوا؛ با دما افزایش می‌یابد */
export function airCapacity(temp: number): number {
  return clamp(22 + temp * 1.55, 6, 100);
}

export function computeRates(p: Params, s: SimState): Rates {
  const tf = tempFactor(p.temp);
  const sunF = p.sun / 100;
  const humF = p.humidity / 100;

  // تبخیر: انرژی خورشید × دما × (هوای خشک‌تر → تبخیر بیشتر) × مقدار آب موجود
  const evaporation = clamp(
    100 * (0.08 + 0.92 * sunF) * tf * (1 - 0.55 * humF) * (0.25 + 0.75 * (s.surfaceWater / 100)),
    0,
    100
  );

  // تعرق: پوشش گیاهی × نور × دما × خشکی هوا
  const transpiration = clamp(
    100 * (p.vegetation / 100) * (0.25 + 0.75 * sunF) * tf * (1 - 0.4 * humF) * (0.5 + 0.5 * (s.groundwater / 100)),
    0,
    100
  );

  // اشباع: هرچه رطوبت + بخار نسبت به ظرفیت بیشتر باشد، هوا به اشباع نزدیک‌تر است
  const cap = airCapacity(p.temp);
  const saturation = clamp(((0.55 * p.humidity + 0.55 * s.vapor) / cap) * 100, 0, 150);

  // تراکم: بخار موجود × نزدیکی به اشباع × سرد شدن در ارتفاع
  const coolFactor = clamp(1.15 - p.temp / 75, 0.45, 1.3);
  const condensation = clamp(
    100 * (s.vapor / 100) * (0.15 + 0.85 * clamp(saturation / 100, 0, 1.2)) * coolFactor,
    0,
    100
  );

  // بارش با هیسترزیس: وقتی ابر به آستانه‌ی شروع رسید بارش آغاز می‌شود و تا
  // پایین‌تر از آستانه‌ی پایان ادامه می‌یابد. رطوبت و «احتمال بارش» آستانه‌ی شروع را پایین می‌آورند.
  const startTh = clamp(64 - p.humidity * 0.12 - p.rain * 0.12, 36, 64);
  const stopTh = 20;
  const precipActive = s.raining ? s.cloud > stopTh : s.cloud > startTh;
  let precipitation = 0;
  if (precipActive) {
    const excess = clamp((s.cloud - stopTh) / (100 - stopTh), 0, 1);
    const factor = Math.max(p.rain / 100, s.cloud > 92 ? 0.35 : 0);
    precipitation = clamp(100 * Math.pow(excess, 0.7) * factor, 0, 100);
  }

  const precipType: Rates["precipType"] =
    precipitation < 0.5 ? "none" : p.temp <= 1 ? "snow" : "rain";

  // نفوذ در خاک: پوشش گیاهی → خاک متخلخل → نفوذ بیشتر؛ خاک اشباع/یخ‌زده → نفوذ کمتر
  let infiltrationFraction = 0.15 + 0.6 * (p.vegetation / 100);
  infiltrationFraction *= 1 - 0.45 * (s.groundwater / 100);
  if (p.temp <= 0) infiltrationFraction *= 0.35;
  infiltrationFraction = clamp(infiltrationFraction, 0.05, 0.85);

  const infiltration = clamp(precipitation * infiltrationFraction, 0, 100);
  const runoff = clamp(precipitation * (1 - infiltrationFraction), 0, 100);

  const mountainTemp = p.temp - 9; // کاهش دما با ارتفاع (~۶.۵°C در هر کیلومتر)

  return {
    evaporation,
    transpiration,
    condensation,
    cloudDensity: s.cloud,
    precipitation,
    runoff,
    infiltration,
    infiltrationFraction,
    surfaceWater: s.surfaceWater,
    groundwater: s.groundwater,
    vapor: s.vapor,
    airCapacity: cap,
    saturation,
    precipType,
    precipActive,
    precipThreshold: startTh,
    mountainSnow: mountainTemp <= 2,
    mountainTemp,
    frozenLake: p.temp <= 0,
  };
}

/** یک گام زمانی شبیه‌سازی (dt بر حسب ثانیه شبیه‌سازی) */
export function stepState(p: Params, s: SimState, dt: number): SimState {
  const r = computeRates(p, s);
  const windF = p.wind / 100;

  const dVapor =
    (r.evaporation + r.transpiration) * 0.055 -
    r.condensation * 0.075 -
    windF * s.vapor * 0.012;

  const dCloud =
    r.condensation * 0.05 -
    r.precipitation * 0.12 -
    windF * s.cloud * 0.006;

  const baseflow = s.groundwater * 0.0035;
  const dSurface =
    -r.evaporation * 0.004 +
    r.runoff * 0.007 +
    baseflow +
    (58 - s.surfaceWater) * 0.0025; // ورودی/خروجی آرام (رودخانه‌های دیگر)

  const dGround =
    r.infiltration * 0.007 -
    baseflow -
    (p.vegetation / 100) * s.groundwater * 0.0012;

  return {
    vapor: clamp(s.vapor + dVapor * dt, 0, 100),
    cloud: clamp(s.cloud + dCloud * dt, 0, 100),
    surfaceWater: clamp(s.surfaceWater + dSurface * dt, 5, 100),
    groundwater: clamp(s.groundwater + dGround * dt, 0, 100),
    raining: r.precipActive,
    time: s.time + dt,
  };
}

/** میزان فعالیت هر مرحله (0..1) برای Highlight نوار آموزشی */
export function stageActivity(r: Rates): Record<StageId, number> {
  return {
    evaporation: clamp(r.evaporation / 60, 0, 1),
    transpiration: clamp(r.transpiration / 50, 0, 1),
    condensation: clamp(r.condensation / 50, 0, 1),
    cloud: clamp(r.cloudDensity / 70, 0, 1),
    precipitation: clamp(r.precipitation / 40, 0, 1),
    runoff: clamp(r.runoff / 25, 0, 1),
    infiltration: clamp(r.infiltration / 25, 0, 1),
    collection: clamp((r.runoff + r.infiltration) / 30 + r.surfaceWater / 200, 0, 1),
  };
}

/** مرحله غالب در لحظه */
export function dominantStage(r: Rates): StageId {
  if (r.precipitation > 8) {
    if (r.runoff > r.infiltration && r.runoff > 12) return "runoff";
    if (r.infiltration > 12) return "infiltration";
    return "precipitation";
  }
  if (r.cloudDensity > 25 && r.condensation > 20) return "cloud";
  if (r.condensation > 25) return "condensation";
  if (r.evaporation > 15) return "evaporation";
  if (r.transpiration > 15) return "transpiration";
  return "collection";
}
