export type Shape = "circle" | "square" | "rect";
export type Outcome = "float" | "suspend" | "sink";

export interface LabObject {
  id: string;
  name: string;
  emoji: string;
  material: string;
  mass: number; // گرم
  volume: number; // سانتی‌متر مکعب
  shape: Shape;
  color: string; // css gradient
  hollow?: boolean;
  custom?: boolean;
  fact?: string;
}

export const WATER_DENSITY = 1;
export const PX_PER_CM = 10;

export const density = (o: { mass: number; volume: number }) => o.mass / o.volume;

export function classify(rho: number): Outcome {
  if (rho < 0.97) return "float";
  if (rho > 1.03) return "sink";
  return "suspend";
}

export const OUTCOME_INFO: Record<Outcome, { label: string; emoji: string; color: string; explain: string }> = {
  float: {
    label: "شناور می‌شود",
    emoji: "🟢",
    color: "bg-green-100 text-green-800 border-green-300",
    explain: "چگالی این جسم از آب کمتر است، پس روی آب شناور می‌ماند.",
  },
  suspend: {
    label: "در آب معلق می‌ماند",
    emoji: "🔵",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    explain: "چگالی جسم و آب تقریباً برابر است، پس جسم در آب معلق می‌ماند.",
  },
  sink: {
    label: "فرو می‌رود",
    emoji: "🔴",
    color: "bg-red-100 text-red-800 border-red-300",
    explain: "چگالی این جسم از آب بیشتر است، پس جسم فرو می‌رود.",
  },
};

/** اندازه‌ی ظاهری جسم (پیکسل) بر اساس حجم */
export function sizeOf(o: { volume: number; shape: Shape }): { w: number; h: number } {
  if (o.shape === "circle") {
    const r = Math.cbrt((3 * o.volume) / (4 * Math.PI));
    const d = Math.max(28, 2 * r * PX_PER_CM);
    return { w: d, h: d };
  }
  const s = Math.max(26, Math.cbrt(o.volume) * PX_PER_CM);
  if (o.shape === "rect") return { w: s * 1.5, h: s / 1.5 };
  return { w: s, h: s };
}

export const OBJECTS: LabObject[] = [
  {
    id: "plastic-ball", name: "توپ پلاستیکی", emoji: "⚽", material: "پلاستیک", mass: 50, volume: 500,
    shape: "circle", color: "linear-gradient(135deg,#fde68a,#f59e0b)",
    fact: "توپ پلاستیکی خیلی سبک است ولی جای زیادی می‌گیرد؛ برای همین شناور می‌ماند.",
  },
  {
    id: "wood", name: "چوب", emoji: "🪵", material: "چوب", mass: 300, volume: 500,
    shape: "rect", color: "linear-gradient(135deg,#d6a26b,#8b5a2b)",
    fact: "چوب پر از سوراخ‌های ریز و هواست، پس چگالی‌اش از آب کمتر است.",
  },
  {
    id: "stone", name: "سنگ", emoji: "🪨", material: "سنگ", mass: 1300, volume: 500,
    shape: "circle", color: "linear-gradient(135deg,#a3a3a3,#525252)",
    fact: "سنگ فشرده و سنگین است؛ چگالی‌اش تقریباً ۲/۵ برابر آب است.",
  },
  {
    id: "iron", name: "آهن", emoji: "🧲", material: "آهن", mass: 3900, volume: 500,
    shape: "square", color: "linear-gradient(135deg,#94a3b8,#334155)",
    fact: "آهن حدود ۸ برابر آب چگال است. پس چطور کشتی‌های آهنی شناورند؟ در بخش قایق کشف کن!",
  },
  {
    id: "metal", name: "قطعه فلز", emoji: "🔩", material: "آلومینیوم", mass: 810, volume: 300,
    shape: "rect", color: "linear-gradient(135deg,#e2e8f0,#64748b)",
    fact: "آلومینیوم سبک‌ترین فلز معمولی است، ولی باز هم از آب سنگین‌تر است.",
  },
  {
    id: "cork", name: "چوب‌پنبه", emoji: "🍾", material: "چوب‌پنبه", mass: 60, volume: 250,
    shape: "rect", color: "linear-gradient(135deg,#f5deb3,#c49a6c)",
    fact: "چوب‌پنبه یکی از سبک‌ترین مواد طبیعی است؛ برای همین در بطری‌ها استفاده می‌شود.",
  },
  {
    id: "ice", name: "یخ", emoji: "🧊", material: "یخ", mass: 460, volume: 500,
    shape: "square", color: "linear-gradient(135deg,#e0f2fe,#7dd3fc)",
    fact: "یخ کمی از آب سبک‌تر است. برای همین کوه‌های یخ فقط نوکشان بیرون آب است!",
  },
  {
    id: "hollow-ball", name: "توپ توخالی", emoji: "🏐", material: "پلاستیک + هوا", mass: 40, volume: 800,
    shape: "circle", color: "linear-gradient(135deg,#fecdd3,#fb7185)", hollow: true,
    fact: "داخل این توپ پر از هواست. هوا خیلی سبک است، پس چگالی کل توپ خیلی کم می‌شود.",
  },
  {
    id: "wood-cube-big", name: "مکعب چوبی بزرگ", emoji: "🟫", material: "چوب", mass: 600, volume: 1000,
    shape: "square", color: "linear-gradient(135deg,#c8905a,#7c4a1e)",
    fact: "با اینکه بزرگ است، چون از چوب ساخته شده شناور می‌ماند. اندازه به‌تنهایی مهم نیست!",
  },
  {
    id: "iron-cube-small", name: "مکعب آهنی کوچک", emoji: "⬛", material: "آهن", mass: 780, volume: 100,
    shape: "square", color: "linear-gradient(135deg,#71717a,#27272a)",
    fact: "کوچک است ولی خیلی سنگین. مکعب‌های کوچک هم می‌توانند فرو بروند.",
  },
  {
    id: "plastic-cube", name: "مکعب پلاستیکی", emoji: "🟦", material: "پلاستیک ویژه", mass: 500, volume: 500,
    shape: "square", color: "linear-gradient(135deg,#93c5fd,#3b82f6)",
    fact: "چگالی این مکعب دقیقاً مثل آب است. حدس می‌زنی چه می‌شود؟",
  },
  {
    id: "glass-cube", name: "مکعب شیشه‌ای", emoji: "🔷", material: "شیشه", mass: 750, volume: 300,
    shape: "square", color: "linear-gradient(135deg,#ccfbf1,#5eead4)",
    fact: "شیشه شفاف است ولی سنگین؛ چگالی‌اش ۲/۵ برابر آب است.",
  },
];

export const MATERIALS: { name: string; rho: number; emoji: string; color: string }[] = [
  { name: "چوب‌پنبه", rho: 0.25, emoji: "🍾", color: "linear-gradient(135deg,#f5deb3,#c49a6c)" },
  { name: "چوب", rho: 0.6, emoji: "🪵", color: "linear-gradient(135deg,#d6a26b,#8b5a2b)" },
  { name: "یخ", rho: 0.92, emoji: "🧊", color: "linear-gradient(135deg,#e0f2fe,#7dd3fc)" },
  { name: "پلاستیک ویژه", rho: 1.0, emoji: "🟦", color: "linear-gradient(135deg,#93c5fd,#3b82f6)" },
  { name: "شیشه", rho: 2.5, emoji: "🔷", color: "linear-gradient(135deg,#ccfbf1,#5eead4)" },
  { name: "آهن", rho: 7.8, emoji: "🧲", color: "linear-gradient(135deg,#94a3b8,#334155)" },
];

export const COMPARE_PAIRS: { title: string; a: string; b: string; lesson: string }[] = [
  { title: "توپ پلاستیکی و سنگ", a: "plastic-ball", b: "stone", lesson: "هر دو تقریباً هم‌اندازه‌اند، ولی سنگ خیلی سنگین‌تر است؛ پس چگالی‌اش بیشتر است و فرو می‌رود." },
  { title: "چوب و قطعه فلز", a: "wood", b: "metal", lesson: "چوب بزرگ‌تر از قطعه فلز است، ولی شناور می‌ماند! پس بزرگ بودن به معنی فرو رفتن نیست." },
  { title: "مکعب آهنی کوچک و مکعب چوبی بزرگ", a: "iron-cube-small", b: "wood-cube-big", lesson: "مکعب کوچک فرو رفت و مکعب بزرگ شناور ماند. چیزی که مهم است چگالی است، نه اندازه." },
  { title: "یخ و مکعب پلاستیکی", a: "ice", b: "plastic-cube", lesson: "یخ کمی از آب سبک‌تر است و شناور می‌ماند؛ مکعب پلاستیکی با چگالی برابر آب معلق می‌ماند." },
];

export const fmt = (n: number, d = 1) => {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(d);
  return s.replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[+x]).replace(".", "/");
};
