import { ComponentType } from "../circuit/types";

export type PartKind = ComponentType | "wire";

export interface PartInfo {
  kind: PartKind;
  emoji: string;
  name: string;
  short: string;
  detail: string;
  color: string;
}

export const partsInfo: PartInfo[] = [
  {
    kind: "battery",
    emoji: "🔋",
    name: "باتری",
    short: "انرژی الکتریکی را فراهم می‌کند.",
    detail: "باتری مثل یک پمپ است که برق را در مدار هُل می‌دهد. یک سرِ آن «+» و سرِ دیگرش «−» است. باتریِ قوی‌تر، هُلِ بیشتری می‌دهد!",
    color: "from-orange-300 to-amber-400",
  },
  {
    kind: "bulb",
    emoji: "💡",
    name: "لامپ",
    short: "انرژی الکتریکی را به نور تبدیل می‌کند.",
    detail: "وقتی جریان از سیمِ نازکِ داخل لامپ می‌گذرد، آن سیم داغ می‌شود و نور می‌دهد. هرچه جریان بیشتر، نور بیشتر.",
    color: "from-yellow-200 to-yellow-400",
  },
  {
    kind: "switch",
    emoji: "🔘",
    name: "کلید",
    short: "راه عبور جریان را باز یا بسته می‌کند.",
    detail: "کلید مثل یک پل است. وقتی بسته است 🟢 جریان از روی آن می‌گذرد. وقتی باز است 🔴 پل برداشته می‌شود و جریان نمی‌تواند رد شود.",
    color: "from-emerald-200 to-green-400",
  },
  {
    kind: "wire",
    emoji: "〰️",
    name: "سیم",
    short: "مسیر عبور جریان را فراهم می‌کند.",
    detail: "سیم مثل جاده‌ای برای برق است. برای کشیدن سیم، از یک پایانه (دایرهٔ کوچک) به پایانهٔ دیگر بکش.",
    color: "from-sky-200 to-blue-400",
  },
  {
    kind: "resistor",
    emoji: "🔧",
    name: "مقاومت",
    short: "در برابر عبور جریان مقاومت ایجاد می‌کند.",
    detail: "مقاومت مثل یک جادهٔ باریک است که ماشین‌ها (جریان) در آن آهسته‌تر می‌روند. با مقاومتِ بیشتر، لامپ کم‌نورتر می‌شود.",
    color: "from-fuchsia-200 to-purple-400",
  },
];
