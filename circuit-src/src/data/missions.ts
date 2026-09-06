import { Analysis, analyze } from "../circuit/analyze";
import { emptyState } from "../circuit/model";
import { CircuitState } from "../circuit/types";
import { presetBroken, presetSimpleLoop } from "./presets";

export interface GuessQuestion {
  question: string;
  options: { emoji: string; text: string }[];
  correct: number;
  explanation: string;
}

export interface Mission {
  id: string;
  order: number;
  emoji: string;
  title: string;
  goal: string;
  steps: string[];
  points: { label: string; emoji: string; value: number }[];
  preset: () => CircuitState;
  check: (a: Analysis, s: CircuitState) => boolean;
  guess: GuessQuestion;
  successText: string;
}

export const missions: Mission[] = [
  {
    id: "m1",
    order: 1,
    emoji: "💡",
    title: "لامپ را روشن کن",
    goal: "باتری، لامپ و سیم را طوری وصل کن که لامپ روشن شود.",
    steps: ["یک باتری و یک لامپ به میز بیاور", "با سیم یک سر باتری را به یک سر لامپ وصل کن", "سر دیگر لامپ را به سر دیگر باتری وصل کن"],
    points: [
      { label: "ساخت مدار صحیح", emoji: "⭐", value: 20 },
      { label: "روشن کردن لامپ", emoji: "💡", value: 10 },
    ],
    preset: () => emptyState(),
    check: (a) => a.anyLit,
    guess: {
      question: "برای این‌که لامپ روشن شود چند سیم لازم داریم؟",
      options: [
        { emoji: "1️⃣", text: "فقط یک سیم کافی است" },
        { emoji: "2️⃣", text: "دو سیم، تا یک حلقهٔ کامل بسازیم" },
        { emoji: "0️⃣", text: "بدون سیم هم روشن می‌شود" },
      ],
      correct: 1,
      explanation:
        "برق باید از یک سرِ باتری بیرون بیاید، از لامپ بگذرد و به سرِ دیگر باتری برگردد. پس یک «حلقهٔ بسته» لازم داریم و برای آن حداقل دو سیم می‌خواهیم.",
    },
    successText: "لامپ روشن شد چون یک مسیرِ کامل برای عبور جریان ساختی! 🎉",
  },
  {
    id: "m2",
    order: 2,
    emoji: "🔘",
    title: "یک کلید به مدار اضافه کن",
    goal: "کلید را طوری در مدار بگذار که بتوانی لامپ را روشن و خاموش کنی.",
    steps: ["یکی از سیم‌ها را بردار", "یک کلید بین باتری و لامپ بگذار", "کلید را ببند تا لامپ روشن شود"],
    points: [
      { label: "ساخت مدار صحیح", emoji: "⭐", value: 20 },
      { label: "روشن کردن لامپ", emoji: "💡", value: 10 },
      { label: "استفاده صحیح از کلید", emoji: "🔘", value: 10 },
    ],
    preset: presetSimpleLoop,
    check: (a, s) => {
      if (!a.anyLit) return false;
      // there must be a closed switch whose opening turns the lamp off
      return Object.values(s.components).some((c) => {
        if (c.type !== "switch" || !c.closed) return false;
        const alt: CircuitState = {
          ...s,
          components: { ...s.components, [c.id]: { ...c, closed: false } },
        };
        return !analyze(alt).anyLit;
      });
    },
    guess: {
      question: "کلید را کجا بگذاریم تا بتواند لامپ را خاموش کند؟",
      options: [
        { emoji: "🔗", text: "در مسیر حلقه، مثل یک پل" },
        { emoji: "🏝️", text: "کنار مدار، بدون سیم" },
        { emoji: "🔋", text: "روی باتری بچسبانیم" },
      ],
      correct: 0,
      explanation: "کلید باید در مسیرِ جریان باشد. وقتی باز می‌شود، مسیر قطع می‌شود و برق نمی‌تواند به لامپ برسد.",
    },
    successText: "عالی! حالا با کلید می‌توانی راهِ جریان را باز و بسته کنی.",
  },
  {
    id: "m3",
    order: 3,
    emoji: "🔍",
    title: "مدار خراب است! مشکل را پیدا کن",
    goal: "این مدار باید لامپ را روشن کند ولی نمی‌کند. قسمت قطع‌شده را پیدا کن و درستش کن.",
    steps: ["به علامت‌های قرمز نگاه کن", "سیم قطع‌شده را پیدا کن", "سرِ سیم را روی پایانهٔ درست بگذار"],
    points: [
      { label: "پیدا کردن خطا", emoji: "🔍", value: 20 },
      { label: "روشن کردن لامپ", emoji: "💡", value: 10 },
    ],
    preset: presetBroken,
    check: (a) => a.anyLit,
    guess: {
      question: "چرا لامپ در یک مدارِ باز روشن نمی‌شود؟",
      options: [
        { emoji: "🪫", text: "چون باتری خالی است" },
        { emoji: "✂️", text: "چون مسیرِ جریان قطع است" },
        { emoji: "💡", text: "چون لامپ سوخته است" },
      ],
      correct: 1,
      explanation: "جریان فقط در یک حلقهٔ کامل حرکت می‌کند. اگر حتی یک جا قطع باشد، هیچ جریانی نمی‌گذرد و لامپ خاموش می‌ماند.",
    },
    successText: "کارآگاه برق! 🕵️ قطعی را پیدا کردی و مدار دوباره کامل شد.",
  },
  {
    id: "m4",
    order: 4,
    emoji: "🔧",
    title: "لامپ را کم‌نور کن",
    goal: "با اضافه کردن یک مقاومت به مدار، لامپ را کم‌نورتر کن (ولی خاموش نشود!).",
    steps: ["یک سیم را بردار", "یک مقاومت بین باتری و لامپ بگذار", "روی مقاومت بزن و اندازهٔ آن را عوض کن"],
    points: [
      { label: "ساخت مدار صحیح", emoji: "⭐", value: 20 },
      { label: "روشن کردن لامپ", emoji: "💡", value: 10 },
    ],
    preset: presetSimpleLoop,
    check: (a, s) => {
      if (!a.anyLit) return false;
      const dim = Object.values(a.bulbBrightness).some((b) => b > 0.04 && b < 0.8);
      const resistorInPath = Object.values(s.components).some(
        (c) => c.type === "resistor" && Math.abs(a.compCurrent[c.id] ?? 0) > 0.03
      );
      return dim && resistorInPath;
    },
    guess: {
      question: "اگر یک مقاومت به مدار اضافه کنیم، لامپ چه می‌شود؟",
      options: [
        { emoji: "✨", text: "پرنورتر می‌شود" },
        { emoji: "🌗", text: "کم‌نورتر می‌شود" },
        { emoji: "😐", text: "فرقی نمی‌کند" },
      ],
      correct: 1,
      explanation: "مقاومت باعث می‌شود عبور جریان سخت‌تر شود. جریانِ کمتر یعنی نورِ کمتر.",
    },
    successText: "مقاومت راه را برای جریان سخت‌تر کرد و لامپ کم‌نور شد. 🌗",
  },
  {
    id: "m5",
    order: 5,
    emoji: "💡💡",
    title: "دو لامپ را روشن کن",
    goal: "مداری بساز که هر دو لامپ در آن روشن باشند.",
    steps: ["یک باتری و دو لامپ بیاور", "هر دو لامپ را در مسیر جریان قرار بده", "امتحان کن: پشت سر هم یا کنار هم؟"],
    points: [
      { label: "ساخت مدار صحیح", emoji: "⭐", value: 20 },
      { label: "روشن کردن لامپ", emoji: "💡", value: 10 },
    ],
    preset: () => emptyState(),
    check: (a) => a.litCount >= 2,
    guess: {
      question: "اگر دو لامپ را پشت‌سرهم (در یک حلقه) بگذاریم، نورشان چطور می‌شود؟",
      options: [
        { emoji: "🔆", text: "هر دو خیلی پرنور" },
        { emoji: "🌗", text: "هر دو کمی کم‌نورتر" },
        { emoji: "💡", text: "فقط یکی روشن می‌شود" },
      ],
      correct: 1,
      explanation:
        "وقتی دو لامپ پشت‌سرهم باشند، جریان باید از هر دو بگذرد و راه سخت‌تر می‌شود؛ پس هر دو کمی کم‌نورتر می‌شوند. اگر کنار هم (موازی) وصل شوند، هر کدام پرنور می‌مانند!",
    },
    successText: "دو لامپ روشن! تو حالا می‌دانی جریان چطور بین قطعات پخش می‌شود. 🌟",
  },
];

export const totalMissionPoints = missions.reduce(
  (sum, m) => sum + m.points.reduce((s, p) => s + p.value, 0),
  0
);
