export interface AlleleInfo {
  symbol: string;
  label: string;
  color: string;
}

export interface Trait {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  dominant: AlleleInfo;
  recessive: AlleleInfo;
}

export interface Organism {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  traits: Trait[];
}

const T = (
  id: string,
  name: string,
  nameEn: string,
  emoji: string,
  letter: string,
  domLabel: string,
  domColor: string,
  recLabel: string,
  recColor: string
): Trait => ({
  id,
  name,
  nameEn,
  emoji,
  dominant: { symbol: letter.toUpperCase(), label: domLabel, color: domColor },
  recessive: { symbol: letter.toLowerCase(), label: recLabel, color: recColor },
});

export const ORGANISMS: Organism[] = [
  {
    id: "flower",
    name: "گل",
    nameEn: "Flower",
    emoji: "🌸",
    description: "مدل ساده‌ی آموزشی؛ چهار صفت مستقل با وراثت مندلی.",
    traits: [
      T("color", "رنگ گل", "Flower color", "🌸", "A", "قرمز", "#e11d48", "سفید", "#f8fafc"),
      T("height", "ارتفاع", "Height", "🌱", "B", "بلند", "#16a34a", "کوتاه", "#84cc16"),
      T("leaf", "رنگ برگ", "Leaf color", "🌿", "C", "سبز", "#15803d", "زرد", "#eab308"),
      T("seed", "شکل دانه", "Seed shape", "🌰", "D", "صاف", "#92400e", "چروک", "#a16207"),
    ],
  },
  {
    id: "pea",
    name: "نخود",
    nameEn: "Pea plant",
    emoji: "🫛",
    description: "همان گیاهی که مندل با آن قوانین وراثت را کشف کرد.",
    traits: [
      T("color", "رنگ گل", "Flower color", "🌸", "A", "بنفش", "#7c3aed", "سفید", "#f8fafc"),
      T("height", "ارتفاع ساقه", "Stem height", "🌱", "B", "بلند", "#16a34a", "کوتاه", "#84cc16"),
      T("leaf", "رنگ دانه", "Seed color", "🟡", "C", "زرد", "#eab308", "سبز", "#22c55e"),
      T("seed", "شکل دانه", "Seed shape", "🫘", "D", "گرد", "#a16207", "چروک", "#78350f"),
    ],
  },
  {
    id: "rabbit",
    name: "خرگوش",
    nameEn: "Rabbit",
    emoji: "🐰",
    description: "مدل ساده‌شده‌ی آموزشی؛ صفات واقعی خرگوش پیچیده‌ترند.",
    traits: [
      T("color", "رنگ خز", "Fur color", "🐰", "A", "قهوه‌ای", "#92400e", "سفید", "#f8fafc"),
      T("height", "اندازه بدن", "Body size", "📏", "B", "بزرگ", "#0f766e", "کوچک", "#14b8a6"),
      T("leaf", "طول گوش", "Ear length", "👂", "C", "بلند", "#be123c", "کوتاه", "#fb7185"),
      T("seed", "رنگ چشم", "Eye color", "👁️", "D", "قهوه‌ای", "#78350f", "آبی", "#38bdf8"),
    ],
  },
  {
    id: "creature",
    name: "موجود فرضی",
    nameEn: "Imaginary creature",
    emoji: "👾",
    description: "یک موجود خیالی برای تمرین بدون هیچ ادعای زیستی.",
    traits: [
      T("color", "رنگ بدن", "Body color", "🎨", "A", "آبی", "#2563eb", "نارنجی", "#f97316"),
      T("height", "شاخ", "Horns", "🦄", "B", "دارد", "#7c3aed", "ندارد", "#a78bfa"),
      T("leaf", "بال", "Wings", "🪽", "C", "دارد", "#0891b2", "ندارد", "#67e8f9"),
      T("seed", "خال", "Spots", "🔵", "D", "دارد", "#db2777", "ندارد", "#f9a8d4"),
    ],
  },
];

export const GENOTYPE_OPTIONS = (t: Trait) => {
  const D = t.dominant.symbol;
  const r = t.recessive.symbol;
  return [
    { value: D + D, zygosity: "هموزیگوت غالب (Homozygous dominant)", short: "هموزیگوت غالب" },
    { value: D + r, zygosity: "هتروزیگوت (Heterozygous)", short: "هتروزیگوت" },
    { value: r + r, zygosity: "هموزیگوت مغلوب (Homozygous recessive)", short: "هموزیگوت مغلوب" },
  ];
};
