import type { Params, StageId } from "../model/waterCycle";

export interface StageInfo {
  id: StageId;
  fa: string;
  en: string;
  icon: string;
  color: string; // tailwind bg color class for chip
  ring: string;
  short: string;
  cause: string;
  effect: string;
}

export const STAGES: StageInfo[] = [
  {
    id: "evaporation",
    fa: "تبخیر",
    en: "Evaporation",
    icon: "☀️",
    color: "bg-amber-100 text-amber-900 border-amber-300",
    ring: "ring-amber-400",
    short:
      "انرژی خورشید باعث تبدیل آب مایع سطح دریاها و دریاچه‌ها به بخار آب و حرکت آن به سمت جو می‌شود.",
    cause: "گرمای خورشید انرژی جنبشی مولکول‌های آب را بالا می‌برد تا از سطح آب جدا شوند.",
    effect: "بخار آب وارد هوا می‌شود؛ هرچه خورشید شدیدتر و هوا خشک‌تر باشد، تبخیر بیشتر است.",
  },
  {
    id: "transpiration",
    fa: "تعرق",
    en: "Transpiration",
    icon: "🌿",
    color: "bg-green-100 text-green-900 border-green-300",
    ring: "ring-green-400",
    short:
      "گیاهان آب را از ریشه جذب کرده و از روزنه‌های برگ به شکل بخار آب به هوا پس می‌دهند.",
    cause: "نور و گرما روزنه‌های برگ را باز می‌کند و آب از برگ‌ها تبخیر می‌شود.",
    effect: "بخش مهمی از بخار آب جو (به‌ویژه در جنگل‌ها) از تعرق تأمین می‌شود.",
  },
  {
    id: "condensation",
    fa: "تراکم",
    en: "Condensation",
    icon: "💨",
    color: "bg-sky-100 text-sky-900 border-sky-300",
    ring: "ring-sky-400",
    short:
      "بخار آب هنگام بالا رفتن سرد می‌شود و دوباره به قطرات ریز آب مایع تبدیل می‌شود.",
    cause: "هوای گرم و مرطوب بالا می‌رود، در ارتفاع سرد می‌شود و به نقطه اشباع می‌رسد.",
    effect: "قطرات ریز آب دور ذرات غبار جمع می‌شوند و هسته‌ی تشکیل ابر را می‌سازند.",
  },
  {
    id: "cloud",
    fa: "تشکیل ابر",
    en: "Cloud Formation",
    icon: "☁️",
    color: "bg-slate-100 text-slate-900 border-slate-300",
    ring: "ring-slate-400",
    short:
      "میلیون‌ها قطره‌ی ریز حاصل از تراکم کنار هم ابر را می‌سازند؛ با ادامه تراکم، ابر متراکم‌تر و تیره‌تر می‌شود.",
    cause: "ادامه‌ی تراکم بخار، تعداد و اندازه‌ی قطرات ابر را زیاد می‌کند.",
    effect: "ابرهای متراکم و سنگین آماده‌ی بارش می‌شوند و نور خورشید کمتری عبور می‌دهند.",
  },
  {
    id: "precipitation",
    fa: "بارش",
    en: "Precipitation",
    icon: "🌧️",
    color: "bg-blue-100 text-blue-900 border-blue-300",
    ring: "ring-blue-400",
    short:
      "وقتی قطرات ابر آن‌قدر بزرگ شوند که هوا نتواند آن‌ها را نگه دارد، به شکل باران یا برف فرو می‌ریزند.",
    cause: "قطرات ابر به هم می‌پیوندند و سنگین می‌شوند؛ جاذبه آن‌ها را پایین می‌کشد.",
    effect: "آب به زمین بازمی‌گردد؛ در دمای زیر صفر به شکل برف و در دمای بالاتر به شکل باران.",
  },
  {
    id: "runoff",
    fa: "روان‌آب",
    en: "Runoff",
    icon: "🏞️",
    color: "bg-cyan-100 text-cyan-900 border-cyan-300",
    ring: "ring-cyan-400",
    short:
      "بخشی از آب باران روی سطح زمین در جهت شیب جاری می‌شود و به رودخانه‌ها و دریاچه‌ها می‌رسد.",
    cause: "شیب زمین و ناتوانی خاک در جذب همه‌ی آب، باعث جاری شدن آب روی سطح می‌شود.",
    effect: "رودخانه‌ها پرآب می‌شوند و آب به دریاچه/اقیانوس برمی‌گردد. پوشش گیاهی کم → روان‌آب بیشتر و فرسایش خاک.",
  },
  {
    id: "infiltration",
    fa: "نفوذ",
    en: "Infiltration",
    icon: "⬇️",
    color: "bg-orange-100 text-orange-900 border-orange-300",
    ring: "ring-orange-400",
    short:
      "بخشی از آب باران به درون خاک نفوذ می‌کند و سفره‌های آب زیرزمینی را تغذیه می‌کند.",
    cause: "خاک متخلخل و ریشه‌ی گیاهان مسیرهایی برای پایین رفتن آب ایجاد می‌کنند.",
    effect: "آب زیرزمینی ذخیره می‌شود و به‌آرامی به چشمه‌ها، رودها و دریاچه‌ها بازمی‌گردد.",
  },
  {
    id: "collection",
    fa: "جمع‌آوری آب",
    en: "Collection",
    icon: "🌊",
    color: "bg-indigo-100 text-indigo-900 border-indigo-300",
    ring: "ring-indigo-400",
    short:
      "آب در دریاچه‌ها، رودخانه‌ها، اقیانوس‌ها و سفره‌های زیرزمینی جمع می‌شود و دوباره آماده‌ی تبخیر است.",
    cause: "روان‌آب و آب زیرزمینی به پایین‌ترین نقاط سرزمین جریان می‌یابند.",
    effect: "چرخه کامل می‌شود: خورشید دوباره این آب را تبخیر می‌کند و همه‌چیز از نو آغاز می‌شود.",
  },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<
  StageId,
  StageInfo
>;

/* ───────────── آزمایش‌ها ───────────── */

export interface Experiment {
  id: string;
  title: string;
  icon: string;
  description: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  before: Partial<Params>;
  after: Partial<Params>;
  metrics: { key: MetricKey; label: string }[];
}

export type MetricKey =
  | "evaporation"
  | "transpiration"
  | "condensation"
  | "precipitation"
  | "runoff"
  | "infiltration"
  | "saturation"
  | "precipType";

export const EXPERIMENTS: Experiment[] = [
  {
    id: "strong-sun",
    title: "آزمایش ۱: خورشید شدید",
    icon: "🔆",
    description: "شدت تابش خورشید را از ۳۰٪ به ۱۰۰٪ افزایش می‌دهیم.",
    question: "پیش‌بینی کن: آیا تبخیر بیشتر می‌شود یا کمتر؟",
    options: ["تبخیر کمتر می‌شود", "تبخیر بیشتر می‌شود", "تغییری نمی‌کند"],
    correct: 1,
    explanation:
      "انرژی خورشید عامل اصلی تبخیر است. تابش بیشتر → انرژی بیشتر برای مولکول‌های آب → تبخیر و تعرق بیشتر و چرخه سریع‌تر.",
    before: { sun: 30, temp: 25, humidity: 50 },
    after: { sun: 100, temp: 25, humidity: 50 },
    metrics: [
      { key: "evaporation", label: "شدت تبخیر" },
      { key: "transpiration", label: "شدت تعرق" },
    ],
  },
  {
    id: "cold-air",
    title: "آزمایش ۲: هوای سرد",
    icon: "🥶",
    description: "دما را از ۲۵°C به ۵-°C کاهش می‌دهیم.",
    question: "پیش‌بینی کن: نوع بارش چه تغییری می‌کند؟",
    options: ["باران می‌بارد", "برف می‌بارد", "بارشی رخ نمی‌دهد"],
    correct: 1,
    explanation:
      "در دمای زیر صفر، قطرات آب داخل ابر یخ می‌زنند و به شکل بلورهای برف می‌بارند. همچنین سطح دریاچه یخ می‌بندد و تبخیر بسیار کم می‌شود.",
    before: { temp: 25, humidity: 70, rain: 70 },
    after: { temp: -5, humidity: 70, rain: 70 },
    metrics: [
      { key: "precipType", label: "نوع بارش" },
      { key: "evaporation", label: "شدت تبخیر" },
    ],
  },
  {
    id: "high-humidity",
    title: "آزمایش ۳: رطوبت بالا",
    icon: "💦",
    description: "رطوبت هوا را از ۲۰٪ به ۹۵٪ افزایش می‌دهیم.",
    question: "پیش‌بینی کن: تشکیل ابر و احتمال بارش چگونه تغییر می‌کند؟",
    options: ["ابر کمتر و بارش کمتر", "ابر بیشتر و بارش بیشتر", "بدون تغییر"],
    correct: 1,
    explanation:
      "هوای مرطوب به نقطه اشباع نزدیک‌تر است؛ بخار آب سریع‌تر متراکم می‌شود، ابرها زودتر سنگین می‌شوند و بارش زودتر آغاز می‌شود.",
    before: { humidity: 20, temp: 25, sun: 60 },
    after: { humidity: 95, temp: 25, sun: 60 },
    metrics: [
      { key: "saturation", label: "درصد اشباع هوا" },
      { key: "condensation", label: "شدت تراکم" },
    ],
  },
  {
    id: "deforestation",
    title: "آزمایش ۴: جنگل‌زدایی",
    icon: "🪓",
    description: "پوشش گیاهی را از ۱۰۰٪ به ۱۰٪ کاهش می‌دهیم.",
    question: "پیش‌بینی کن: با از بین رفتن جنگل، روان‌آب چه می‌شود؟",
    options: ["روان‌آب بیشتر و نفوذ کمتر", "روان‌آب کمتر و نفوذ بیشتر", "بدون تغییر"],
    correct: 0,
    explanation:
      "ریشه‌ی گیاهان خاک را متخلخل نگه می‌دارد و سرعت آب را کم می‌کند. بدون گیاه، نفوذ و تعرق کم می‌شود، آب روی سطح جاری می‌شود و خطر سیل و فرسایش بالا می‌رود.",
    before: { vegetation: 100, rain: 80, humidity: 70 },
    after: { vegetation: 10, rain: 80, humidity: 70 },
    metrics: [
      { key: "transpiration", label: "شدت تعرق" },
      { key: "runoff", label: "میزان روان‌آب" },
      { key: "infiltration", label: "میزان نفوذ" },
    ],
  },
];

/* ───────────── چالش‌های پیش‌بینی ───────────── */

export interface Challenge {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correct: number;
  reason: string;
  params: Partial<Params>;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    scenario: "دمای هوا ۳۵°C است، رطوبت ۸۰٪ و شدت تابش خورشید ۹۰٪.",
    question: "چه اتفاقی برای تبخیر و تشکیل ابر می‌افتد؟",
    options: [
      "تبخیر کاهش می‌یابد و ابر تشکیل نمی‌شود",
      "تبخیر افزایش می‌یابد و ابرها سریع متراکم می‌شوند",
      "تغییری ایجاد نمی‌شود",
    ],
    correct: 1,
    reason:
      "خورشید شدید و دمای بالا تبخیر را زیاد می‌کند؛ رطوبت ۸۰٪ یعنی هوا نزدیک اشباع است، پس بخار اضافی سریع متراکم شده و ابرهای سنگین بارانی می‌سازد (مثل رگبارهای تابستانی مناطق گرم و مرطوب).",
    params: { temp: 35, humidity: 80, sun: 90, rain: 60, wind: 30, vegetation: 70 },
  },
  {
    id: "c2",
    scenario: "دمای هوا ۸-°C است و ابرها کاملاً متراکم شده‌اند.",
    question: "بارش به چه شکلی خواهد بود؟",
    options: ["باران شدید", "برف", "هیچ بارشی رخ نمی‌دهد"],
    correct: 1,
    reason:
      "در دمای زیر صفر، قطرات ابر یخ می‌زنند و به شکل بلورهای برف می‌بارند. برف روی کوه‌ها و زمین می‌نشیند و آب آن با گرم شدن هوا آزاد می‌شود.",
    params: { temp: -8, humidity: 75, sun: 30, rain: 80, wind: 30, vegetation: 50 },
  },
  {
    id: "c3",
    scenario: "خورشید ۸۰٪ می‌تابد اما رطوبت هوا فقط ۱۰٪ است (مثل کویر).",
    question: "ابرها چگونه شکل می‌گیرند؟",
    options: [
      "ابرهای زیادی تشکیل می‌شود",
      "بخار زیاد است اما به‌سختی متراکم می‌شود و ابر کمی ساخته می‌شود",
      "اصلاً تبخیری رخ نمی‌دهد",
    ],
    correct: 1,
    reason:
      "هوای خشک تبخیر را آسان می‌کند، اما چون هوا از اشباع دور است، بخار به‌سختی متراکم می‌شود؛ ابر و بارش کم می‌ماند. به همین دلیل کویرها با وجود خورشید داغ، باران کمی دارند.",
    params: { temp: 38, humidity: 10, sun: 80, rain: 40, wind: 50, vegetation: 15 },
  },
  {
    id: "c4",
    scenario: "پوشش گیاهی ۱۰٪ است و باران شدیدی می‌بارد.",
    question: "بیشتر آب باران به کجا می‌رود؟",
    options: [
      "به درون خاک نفوذ می‌کند",
      "روی سطح زمین جاری شده و به رودخانه می‌ریزد (خطر سیل)",
      "بلافاصله تبخیر می‌شود",
    ],
    correct: 1,
    reason:
      "بدون پوشش گیاهی، خاک فشرده‌تر است و ریشه‌ای برای هدایت آب به عمق وجود ندارد؛ بیشتر آب به شکل روان‌آب حرکت می‌کند و خطر سیل و فرسایش خاک افزایش می‌یابد.",
    params: { temp: 22, humidity: 85, sun: 40, rain: 95, wind: 40, vegetation: 10 },
  },
];
