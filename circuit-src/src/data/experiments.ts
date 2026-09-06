import { Analysis } from "../circuit/analyze";
import { CircuitState } from "../circuit/types";
import { GuessQuestion } from "./missions";
import { presetBatteryTest, presetResistorTest, presetSwitchLoop } from "./presets";

export interface Experiment {
  id: string;
  emoji: string;
  title: string;
  intro: string;
  guess: GuessQuestion;
  task: string;
  preset: () => CircuitState;
  done: (a: Analysis, s: CircuitState) => boolean;
  result: string;
  lesson: string;
}

export const experiments: Experiment[] = [
  {
    id: "switch",
    emoji: "🔘",
    title: "آزمایش کلید",
    intro: "در این مدار کلید بسته است و لامپ روشن است.",
    guess: {
      question: "اگر کلید را باز کنیم، چه اتفاقی برای لامپ می‌افتد؟",
      options: [
        { emoji: "💡", text: "روشن می‌ماند" },
        { emoji: "🌑", text: "خاموش می‌شود" },
        { emoji: "✨", text: "پرنورتر می‌شود" },
      ],
      correct: 1,
      explanation: "با باز شدن کلید، مسیرِ جریان قطع می‌شود و لامپ خاموش می‌شود.",
    },
    task: "حالا روی کلید بزن تا باز شود 🔴 و به لامپ نگاه کن.",
    preset: presetSwitchLoop,
    done: (a, s) => Object.values(s.components).some((c) => c.type === "switch" && !c.closed) && !a.anyLit,
    result: "لامپ خاموش شد و نقطه‌های نورانی روی سیم‌ها ایستادند!",
    lesson: "وقتی کلید بسته است، راه عبور جریان باز است و لامپ می‌تواند روشن شود. وقتی کلید باز است، راه قطع است.",
  },
  {
    id: "battery",
    emoji: "🔋",
    title: "آزمایش باتری",
    intro: "در این مدار یک باتری ضعیف داریم و لامپ کم‌نور است.",
    guess: {
      question: "اگر باتری قوی‌تری بگذاریم، چه اتفاقی برای لامپ می‌افتد؟",
      options: [
        { emoji: "🌗", text: "کم‌نورتر می‌شود" },
        { emoji: "😐", text: "فرقی نمی‌کند" },
        { emoji: "✨", text: "پرنورتر می‌شود" },
      ],
      correct: 2,
      explanation: "باتری قوی‌تر جریان بیشتری در مدار می‌فرستد و لامپ پرنورتر می‌شود.",
    },
    task: "روی باتری بزن و آن را «قوی» انتخاب کن 🔋 و به نور لامپ نگاه کن.",
    preset: presetBatteryTest,
    done: (a, s) => Object.values(s.components).some((c) => c.type === "battery" && c.level === "high") && a.anyLit,
    result: "لامپ خیلی پرنورتر شد و نقطه‌ها روی سیم تندتر حرکت کردند!",
    lesson: "باتری انرژی الکتریکی را فراهم می‌کند. باتری قوی‌تر = جریان بیشتر = نور بیشتر.",
  },
  {
    id: "resistor",
    emoji: "🔧",
    title: "آزمایش مقاومت",
    intro: "در این مدار یک مقاومت کم داریم.",
    guess: {
      question: "اگر مقاومت را زیاد کنیم، چه اتفاقی برای لامپ می‌افتد؟",
      options: [
        { emoji: "✨", text: "پرنورتر می‌شود" },
        { emoji: "🌗", text: "کم‌نورتر می‌شود" },
        { emoji: "💥", text: "می‌ترکد" },
      ],
      correct: 1,
      explanation: "مقاومت بیشتر یعنی عبور جریان سخت‌تر است؛ پس جریان کمتر و نور کمتر می‌شود.",
    },
    task: "روی مقاومت بزن و آن را «زیاد» انتخاب کن 🔧 و نور لامپ را ببین.",
    preset: presetResistorTest,
    done: (a, s) => Object.values(s.components).some((c) => c.type === "resistor" && c.level === "high") && a.anyLit,
    result: "لامپ خیلی کم‌نور شد و نقطه‌ها آهسته‌تر حرکت کردند!",
    lesson: "مقاومت باعث می‌شود عبور جریان سخت‌تر شود. هرچه مقاومت بیشتر، نور کمتر.",
  },
];
