// ---------- Core probability engine ----------
// All randomness comes from a seeded PRNG (mulberry32). A new seed is
// drawn from crypto for every "new experiment"; replaying the same seed
// reproduces the exact same sequence (repeatability for teaching).

export type ExperimentType = "coin" | "dice" | "bag";

export const TRIAL_OPTIONS = [1, 10, 100, 1000, 10000] as const;

export interface RNG {
  next: () => number; // uniform in [0,1)
}

export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

export function randomSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 4294967296);
}

// ---------- Outcome definitions ----------

export interface OutcomeDef {
  id: number;
  label: string;
  emoji: string;
  color: string; // tailwind-free hex for charts
}

export const COIN_OUTCOMES: OutcomeDef[] = [
  { id: 0, label: "شیر", emoji: "🦁", color: "#f59e0b" },
  { id: 1, label: "خط", emoji: "🔢", color: "#6366f1" },
];

export const DICE_OUTCOMES: OutcomeDef[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: n,
  label: String(n),
  emoji: ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n],
  color: ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"][n],
}));

export interface BallColor {
  id: number;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}
export const BALL_COLORS: BallColor[] = [
  { id: 0, label: "قرمز", emoji: "🔴", color: "#ef4444", bg: "radial-gradient(circle at 35% 30%, #fca5a5, #dc2626 60%, #991b1b)" },
  { id: 1, label: "آبی", emoji: "🔵", color: "#3b82f6", bg: "radial-gradient(circle at 35% 30%, #93c5fd, #2563eb 60%, #1e3a8a)" },
  { id: 2, label: "سبز", emoji: "🟢", color: "#22c55e", bg: "radial-gradient(circle at 35% 30%, #86efac, #16a34a 60%, #14532d)" },
  { id: 3, label: "زرد", emoji: "🟡", color: "#eab308", bg: "radial-gradient(circle at 35% 30%, #fde68a, #ca8a04 60%, #713f12)" },
];

// ---------- Dice events ----------

export interface DiceEvent {
  id: string;
  label: string;
  set: number[];
}

export const DICE_EVENTS: DiceEvent[] = [
  { id: "n1", label: "عدد ۱", set: [1] },
  { id: "n2", label: "عدد ۲", set: [2] },
  { id: "n3", label: "عدد ۳", set: [3] },
  { id: "n4", label: "عدد ۴", set: [4] },
  { id: "n5", label: "عدد ۵", set: [5] },
  { id: "n6", label: "عدد ۶", set: [6] },
  { id: "even", label: "عدد زوج", set: [2, 4, 6] },
  { id: "odd", label: "عدد فرد", set: [1, 3, 5] },
  { id: "gt4", label: "بزرگ‌تر از ۴", set: [5, 6] },
  { id: "lt3", label: "کوچک‌تر از ۳", set: [1, 2] },
  { id: "mul3", label: "مضرب ۳", set: [3, 6] },
  { id: "prime", label: "عدد اول", set: [2, 3, 5] },
];

// ---------- Experiment configuration ----------

export interface ExperimentConfig {
  type: ExperimentType;
  pHeads: number; // 0..1 (coin)
  bag: number[]; // counts per BALL_COLORS index
}

/** Theoretical probability of every elementary outcome. */
export function theoreticalDistribution(cfg: ExperimentConfig): Map<number, number> {
  const m = new Map<number, number>();
  if (cfg.type === "coin") {
    m.set(0, cfg.pHeads);
    m.set(1, 1 - cfg.pHeads);
  } else if (cfg.type === "dice") {
    for (let i = 1; i <= 6; i++) m.set(i, 1 / 6);
  } else {
    const total = cfg.bag.reduce((a, b) => a + b, 0);
    cfg.bag.forEach((c, i) => m.set(i, total > 0 ? c / total : 0));
  }
  return m;
}

/** Draw one outcome using the RNG. Pure random – no bias correction ever. */
export function drawOutcome(cfg: ExperimentConfig, rng: RNG): number {
  const u = rng.next();
  if (cfg.type === "coin") {
    return u < cfg.pHeads ? 0 : 1;
  }
  if (cfg.type === "dice") {
    return Math.floor(u * 6) + 1;
  }
  const total = cfg.bag.reduce((a, b) => a + b, 0);
  if (total === 0) return -1;
  let r = u * total;
  for (let i = 0; i < cfg.bag.length; i++) {
    if (r < cfg.bag[i]) return i;
    r -= cfg.bag[i];
  }
  return cfg.bag.length - 1;
}

export function outcomesFor(cfg: ExperimentConfig): OutcomeDef[] {
  if (cfg.type === "coin") return COIN_OUTCOMES;
  if (cfg.type === "dice") return DICE_OUTCOMES;
  return BALL_COLORS.filter((c) => cfg.bag[c.id] > 0).map((c) => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
    color: c.color,
  }));
}

/** Focus event = set of outcome ids whose union is tracked in convergence/diff cards. */
export function focusSetFor(cfg: ExperimentConfig, focus: { coin: number; diceEvent: string; ball: number }): number[] {
  if (cfg.type === "coin") return [focus.coin];
  if (cfg.type === "dice") return DICE_EVENTS.find((e) => e.id === focus.diceEvent)?.set ?? [6];
  return [focus.ball];
}

export function focusLabelFor(cfg: ExperimentConfig, focus: { coin: number; diceEvent: string; ball: number }): string {
  if (cfg.type === "coin") return COIN_OUTCOMES[focus.coin].label;
  if (cfg.type === "dice") return DICE_EVENTS.find((e) => e.id === focus.diceEvent)?.label ?? "عدد ۶";
  return `توپ ${BALL_COLORS[focus.ball].label}`;
}

export function theoreticalOfSet(cfg: ExperimentConfig, set: number[]): number {
  const dist = theoreticalDistribution(cfg);
  return set.reduce((s, id) => s + (dist.get(id) ?? 0), 0);
}

/** Fraction display like 3/6 for dice or 5/10 for bag. */
export function fractionFor(cfg: ExperimentConfig, set: number[]): string | null {
  if (cfg.type === "dice") return `${toFa(set.length)}/${toFa(6)}`;
  if (cfg.type === "bag") {
    const total = cfg.bag.reduce((a, b) => a + b, 0);
    const num = set.reduce((s, id) => s + (cfg.bag[id] ?? 0), 0);
    return `${toFa(num)}/${toFa(total)}`;
  }
  if (cfg.type === "coin" && Math.abs(cfg.pHeads - 0.5) < 1e-9) return "۱/۲";
  return null;
}

// ---------- Formatting ----------

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function toFa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
export function fmtInt(n: number): string {
  return toFa(n.toLocaleString("en-US"));
}
export function fmtPct(p: number, digits = 2): string {
  if (!isFinite(p)) return "—";
  return toFa((p * 100).toFixed(digits)) + "٪";
}

/** Convergence series: running frequency of `set` after each trial, downsampled. */
export function convergenceSeries(outcomes: number[], set: number[], maxPoints = 400): { n: number; p: number }[] {
  const inSet = new Set(set);
  const N = outcomes.length;
  if (N === 0) return [];
  const pts: { n: number; p: number }[] = [];
  const step = Math.max(1, Math.floor(N / maxPoints));
  let hits = 0;
  for (let i = 0; i < N; i++) {
    if (inSet.has(outcomes[i])) hits++;
    const n = i + 1;
    if (n % step === 0 || n === N || n <= 20) pts.push({ n, p: hits / n });
  }
  return pts;
}
