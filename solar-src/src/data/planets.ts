export interface PlanetDef {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  color: string;
  color2: string;
  radius: number; // نمایشی (پیکسل در صفحه مرجع ۸۰۰×۸۰۰)
  orbitR: number; // نمایشی (پیکسل در صفحه مرجع ۸۰۰×۸۰۰)
  distanceMkm: number; // میلیون کیلومتر (واقعی)
  periodDays: number; // روز زمینی (واقعی)
  dayHours: number; // طول یک شبانه‌روز به ساعت
  moons: number;
  fact: string;
  hasRings?: boolean;
  order: number;
}

export const SUN_RADIUS = 24;

export const PLANETS: PlanetDef[] = [
  {
    id: "mercury",
    name: "عطارد",
    nickname: "کوچک‌ترین و نزدیک‌ترین",
    emoji: "☿",
    color: "#b8b0a3",
    color2: "#6d675f",
    radius: 5,
    orbitR: 46,
    distanceMkm: 57.9,
    periodDays: 88,
    dayHours: 1408,
    moons: 0,
    fact: "عطارد آن‌قدر به خورشید نزدیک است که روزهایش بسیار داغ و شب‌هایش بسیار سرد است!",
    order: 1,
  },
  {
    id: "venus",
    name: "زهره",
    nickname: "داغ‌ترین سیاره",
    emoji: "♀",
    color: "#f3d08a",
    color2: "#c98a2a",
    radius: 8,
    orbitR: 72,
    distanceMkm: 108.2,
    periodDays: 225,
    dayHours: 5832,
    moons: 0,
    fact: "زهره با ابرهای ضخیمش داغ‌ترین سیاره منظومه شمسی است، حتی از عطارد هم داغ‌تر!",
    order: 2,
  },
  {
    id: "earth",
    name: "زمین",
    nickname: "خانه‌ی ما",
    emoji: "🌍",
    color: "#3b82f6",
    color2: "#16a34a",
    radius: 9,
    orbitR: 100,
    distanceMkm: 149.6,
    periodDays: 365,
    dayHours: 24,
    moons: 1,
    fact: "زمین تنها سیاره‌ای است که می‌دانیم روی آن موجودات زنده وجود دارند. اینجا خانه‌ی ماست!",
    order: 3,
  },
  {
    id: "mars",
    name: "مریخ",
    nickname: "سیاره سرخ",
    emoji: "♂",
    color: "#ef6c3d",
    color2: "#9a3412",
    radius: 7,
    orbitR: 132,
    distanceMkm: 227.9,
    periodDays: 687,
    dayHours: 24.6,
    moons: 2,
    fact: "خاک مریخ زنگ‌زده و قرمز است. بلندترین کوه منظومه شمسی روی مریخ است!",
    order: 4,
  },
  {
    id: "jupiter",
    name: "مشتری",
    nickname: "غول بزرگ",
    emoji: "♃",
    color: "#e8c39e",
    color2: "#a65f2c",
    radius: 21,
    orbitR: 188,
    distanceMkm: 778.5,
    periodDays: 4333,
    dayHours: 10,
    moons: 95,
    fact: "مشتری آن‌قدر بزرگ است که بیش از ۱۳۰۰ زمین در آن جا می‌شود! لکه‌ی قرمز بزرگش یک توفان غول‌پیکر است.",
    order: 5,
  },
  {
    id: "saturn",
    name: "زحل",
    nickname: "سیاره‌ی حلقه‌دار",
    emoji: "♄",
    color: "#f1dc9c",
    color2: "#b9975b",
    radius: 18,
    orbitR: 244,
    distanceMkm: 1432,
    periodDays: 10759,
    dayHours: 10.7,
    moons: 146,
    fact: "حلقه‌های زیبای زحل از میلیون‌ها تکه یخ و سنگ ساخته شده‌اند.",
    hasRings: true,
    order: 6,
  },
  {
    id: "uranus",
    name: "اورانوس",
    nickname: "غول یخی خوابیده",
    emoji: "♅",
    color: "#8fe3f0",
    color2: "#2aa8bd",
    radius: 14,
    orbitR: 298,
    distanceMkm: 2867,
    periodDays: 30687,
    dayHours: 17,
    moons: 28,
    fact: "اورانوس به پهلو خوابیده و می‌چرخد! مثل توپی که روی زمین قل می‌خورد.",
    order: 7,
  },
  {
    id: "neptune",
    name: "نپتون",
    nickname: "دورترین و آبی‌ترین",
    emoji: "♆",
    color: "#4f7bff",
    color2: "#1e3a8a",
    radius: 13,
    orbitR: 352,
    distanceMkm: 4515,
    periodDays: 60190,
    dayHours: 16,
    moons: 16,
    fact: "نپتون تندترین بادهای منظومه شمسی را دارد؛ سریع‌تر از هر توفانی روی زمین!",
    order: 8,
  },
];

export const planetById = (id: string) => PLANETS.find((p) => p.id === id)!;

export const ORDINALS = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم"];

export function formatPeriod(days: number): string {
  if (days < 1000) return `${Math.round(days).toLocaleString("fa-IR")} روز`;
  const years = days / 365.25;
  const y = years < 10 ? years.toFixed(1) : Math.round(years).toString();
  return `${Number(y).toLocaleString("fa-IR")} سال زمینی`;
}

export const fa = (n: number, digits = 0) =>
  n.toLocaleString("fa-IR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
