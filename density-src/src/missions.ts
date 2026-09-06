import type { LabState } from "./store";

export interface Mission {
  id: string;
  title: string;
  emoji: string;
  stars: number;
  badge: string;
  hint: string;
  tab: string;
  check: (s: LabState) => { done: boolean; progress: string };
}

export const MISSIONS: Mission[] = [
  {
    id: "m1", title: "سه جسم پیدا کن که روی آب شناور شوند.", emoji: "🟢", stars: 2, badge: "شکارچی شناورها",
    hint: "به آزمایشگاه برو و اجسام سبک را در آب بینداز.", tab: "lab",
    check: (s) => ({ done: s.floated.length >= 3, progress: `${Math.min(3, s.floated.length)} از ۳` }),
  },
  {
    id: "m2", title: "جسمی پیدا کن که در آب فرو برود.", emoji: "🔴", stars: 2, badge: "کاشف عمق",
    hint: "اجسام سنگین و فشرده را امتحان کن.", tab: "lab",
    check: (s) => ({ done: s.sank.length >= 1, progress: s.sank.length >= 1 ? "انجام شد" : "۰ از ۱" }),
  },
  {
    id: "m3", title: "جسمی بساز که در آب معلق بماند.", emoji: "🔵", stars: 2, badge: "استاد تعادل",
    hint: "در بخش «خودت جسم بساز!» جرم و حجم را طوری تنظیم کن که چگالی برابر ۱ شود.", tab: "lab",
    check: (s) => ({ done: s.suspendedBuilt, progress: s.suspendedBuilt ? "انجام شد" : "هنوز نه" }),
  },
  {
    id: "m4", title: "بدون امتحان کردن، حدس بزن کدام جسم شناور می‌شود.", emoji: "🧠", stars: 2, badge: "پیش‌گوی دانا",
    hint: "در همین صفحه، آزمون کوتاه «حدس بزن» را انجام بده.", tab: "missions",
    check: (s) => ({ done: s.quizDone, progress: s.quizDone ? "انجام شد" : "هنوز نه" }),
  },
  {
    id: "m5", title: "یک جسم بزرگ بساز که شناور بماند.", emoji: "🎈", stars: 2, badge: "غول سبک",
    hint: "حجم را بالای ۱۲۰۰ بگذار ولی جرم را کم نگه دار.", tab: "lab",
    check: (s) => ({ done: s.bigFloat, progress: s.bigFloat ? "انجام شد" : "هنوز نه" }),
  },
  {
    id: "m6", title: "یک جسم کوچک بساز که فرو برود.", emoji: "🪨", stars: 2, badge: "کوتوله سنگین",
    hint: "حجم را زیر ۲۰۰ بگذار و جرم را زیاد کن.", tab: "lab",
    check: (s) => ({ done: s.smallSink, progress: s.smallSink ? "انجام شد" : "هنوز نه" }),
  },
  {
    id: "m7", title: "آب را از سوراخ‌های مختلف خارج کن و ببین کدام فشار بیشتری دارد.", emoji: "💦", stars: 2, badge: "مهندس فشار",
    hint: "به بخش «فشار آب» برو و هر سه سوراخ را باز کن.", tab: "pressure",
    check: (s) => ({ done: s.holesOpened.length >= 3, progress: `${Math.min(3, s.holesOpened.length)} از ۳ سوراخ` }),
  },
  {
    id: "m8", title: "چالش قایق: قایقی بساز که با بار شناور بماند.", emoji: "⛵", stars: 3, badge: "ناخدای کوچک",
    hint: "در بخش «قایق بساز» رکورد بارگیری ثبت کن.", tab: "boat",
    check: (s) => ({ done: s.boatDone, progress: s.boatDone ? "انجام شد" : "هنوز نه" }),
  },
];

export interface Discovery {
  id: string;
  text: string;
  emoji: string;
  check: (s: LabState) => boolean;
}

export const DISCOVERIES: Discovery[] = [
  {
    id: "d1", emoji: "⚖️",
    text: "اجسامی که چگالی‌شان از آب کمتر است شناور می‌مانند و اجسامی که چگالی بیشتری دارند فرو می‌روند.",
    check: (s) => s.floated.length >= 1 && s.sank.length >= 1,
  },
  {
    id: "d2", emoji: "📏",
    text: "اندازه‌ی جسم به‌تنهایی تعیین نمی‌کند که شناور باشد یا فرو برود؛ چگالی مهم است.",
    check: (s) =>
      s.bigFloat || s.smallSink || (s.floated.includes("wood-cube-big") && s.sank.includes("iron-cube-small")) || s.compareDone.length >= 2,
  },
  {
    id: "d3", emoji: "🔵",
    text: "اگر چگالی جسم تقریباً برابر آب باشد، جسم در آب معلق می‌ماند.",
    check: (s) => s.results.some((r) => r.actual === "suspend"),
  },
  {
    id: "d4", emoji: "💧",
    text: "وقتی جسم وارد آب می‌شود، مقداری آب را کنار می‌زند و سطح آب بالا می‌آید. با این روش می‌توان حجم جسم را اندازه گرفت.",
    check: (s) => s.cylinderMeasured,
  },
  {
    id: "d5", emoji: "💦",
    text: "هرچه پایین‌تر برویم، فشار آب بیشتر می‌شود.",
    check: (s) => s.holesOpened.length >= 2,
  },
  {
    id: "d6", emoji: "⛵",
    text: "قایق باید بتواند آب کافی را جابه‌جا کند تا شناور بماند؛ به همین دلیل کشتی‌های آهنی هم شناورند.",
    check: (s) => s.boatDone,
  },
  {
    id: "d7", emoji: "🧮",
    text: "چگالی = جرم ÷ حجم. با زیاد کردن جرم چگالی بیشتر و با زیاد کردن حجم چگالی کمتر می‌شود.",
    check: (s) => s.results.filter((r) => r.name.startsWith("جسم من")).length >= 2,
  },
];
