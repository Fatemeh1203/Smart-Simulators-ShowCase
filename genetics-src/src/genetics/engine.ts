import type { Trait } from "./data";

/** Genotype of an individual: traitId -> two-letter string like "Aa" */
export type Genotype = Record<string, string>;

export const isUpper = (c: string) => c === c.toUpperCase();

/** Normalize "aA" -> "Aa" (dominant first) */
export function normalizeGene(g: string): string {
  const [x, y] = [g[0], g[1]];
  if (isUpper(y) && !isUpper(x)) return y + x;
  return x + y;
}

export function zygosity(g: string): "homDom" | "het" | "homRec" {
  const n = normalizeGene(g);
  if (isUpper(n[0]) && isUpper(n[1])) return "homDom";
  if (!isUpper(n[0]) && !isUpper(n[1])) return "homRec";
  return "het";
}

export const ZYGOSITY_LABEL: Record<ReturnType<typeof zygosity>, string> = {
  homDom: "هموزیگوت غالب",
  het: "هتروزیگوت",
  homRec: "هموزیگوت مغلوب",
};

/** Whether the dominant phenotype is expressed for a gene string like "Aa" */
export function isDominantExpressed(g: string): boolean {
  return isUpper(g[0]) || isUpper(g[1]);
}

/** Cartesian product of alleles across active traits → list of gametes (with duplicates) */
export function gametesOf(genotype: Genotype, traits: Trait[]): string[][] {
  let result: string[][] = [[]];
  for (const t of traits) {
    const g = genotype[t.id];
    const alleles = [g[0], g[1]];
    const next: string[][] = [];
    for (const partial of result) for (const a of alleles) next.push([...partial, a]);
    result = next;
  }
  return result;
}

/** Unique gametes (e.g. AA → [A]) — used for display */
export function uniqueGametes(genotype: Genotype, traits: Trait[]): string[] {
  const set = new Set(gametesOf(genotype, traits).map((g) => g.join("")));
  return Array.from(set);
}

export function combineGametes(g1: string[], g2: string[]): string[] {
  return g1.map((a, i) => normalizeGene(a + g2[i]));
}

export const genotypeKey = (genes: string[]) => genes.join("");

export interface PhenotypePart {
  traitId: string;
  dominant: boolean;
  label: string;
  color: string;
}

export function phenotypeOf(genes: string[], traits: Trait[]): PhenotypePart[] {
  return genes.map((g, i) => {
    const t = traits[i];
    const dom = isDominantExpressed(g);
    return {
      traitId: t.id,
      dominant: dom,
      label: dom ? t.dominant.label : t.recessive.label,
      color: dom ? t.dominant.color : t.recessive.color,
    };
  });
}

export const phenotypeKey = (genes: string[]) => genes.map((g) => (isDominantExpressed(g) ? "D" : "r")).join("");

export function phenotypeLabelFromKey(key: string, traits: Trait[]): string {
  return key
    .split("")
    .map((c, i) => (c === "D" ? traits[i].dominant.label : traits[i].recessive.label))
    .join(" • ");
}

export function phenotypeShortLabel(key: string, traits: Trait[]): string {
  if (traits.length === 1) return key === "D" ? `غالب (${traits[0].dominant.label})` : `مغلوب (${traits[0].recessive.label})`;
  return phenotypeLabelFromKey(key, traits);
}

export interface PunnettCell {
  genes: string[];
  key: string;
  phenoKey: string;
}

export interface CrossAnalysis {
  gametes1: string[][];
  gametes2: string[][];
  grid: PunnettCell[][];
  total: number;
  genotypeProb: Record<string, number>; // 0..1
  phenotypeProb: Record<string, number>;
  genotypeOrder: string[];
  phenotypeOrder: string[];
}

/** Order genotypes: dominant-first, e.g. AA, Aa, aa */
function genotypeSortValue(key: string): number {
  let v = 0;
  for (const c of key) v = v * 2 + (isUpper(c) ? 0 : 1);
  return v;
}

export function analyzeCross(p1: Genotype, p2: Genotype, traits: Trait[]): CrossAnalysis {
  const gametes1 = gametesOf(p1, traits);
  const gametes2 = gametesOf(p2, traits);
  const grid: PunnettCell[][] = [];
  const gCount: Record<string, number> = {};
  const pCount: Record<string, number> = {};
  for (const g1 of gametes1) {
    const row: PunnettCell[] = [];
    for (const g2 of gametes2) {
      const genes = combineGametes(g1, g2);
      const key = genotypeKey(genes);
      const pk = phenotypeKey(genes);
      row.push({ genes, key, phenoKey: pk });
      gCount[key] = (gCount[key] || 0) + 1;
      pCount[pk] = (pCount[pk] || 0) + 1;
    }
    grid.push(row);
  }
  const total = gametes1.length * gametes2.length;
  const genotypeProb: Record<string, number> = {};
  const phenotypeProb: Record<string, number> = {};
  for (const k in gCount) genotypeProb[k] = gCount[k] / total;
  for (const k in pCount) phenotypeProb[k] = pCount[k] / total;
  const genotypeOrder = Object.keys(genotypeProb).sort((a, b) => genotypeSortValue(a) - genotypeSortValue(b));
  const phenotypeOrder = Object.keys(phenotypeProb).sort((a, b) => genotypeSortValue(a.replace(/D/g, "A").replace(/r/g, "a")) - genotypeSortValue(b.replace(/D/g, "A").replace(/r/g, "a")));
  return { gametes1, gametes2, grid, total, genotypeProb, phenotypeProb, genotypeOrder, phenotypeOrder };
}

/** All possible genotype keys for the active traits (used for mutation rows & challenge 4) */
export function allGenotypeKeys(traits: Trait[]): string[] {
  let keys = [""];
  for (const t of traits) {
    const D = t.dominant.symbol;
    const r = t.recessive.symbol;
    const opts = [D + D, D + r, r + r];
    keys = keys.flatMap((k) => opts.map((o) => k + o));
  }
  return keys;
}

export interface Child {
  id: number;
  genes: string[];
  key: string;
  phenoKey: string;
  fromGametes: [string[], string[]];
  mutated: boolean;
}

export const MUTATION_RATE = 0.02;

/** Randomly produce one child. Uses Math.random for true (pseudo) randomness — no bias toward theory. */
export function randomChild(
  id: number,
  p1: Genotype,
  p2: Genotype,
  traits: Trait[],
  mutation: boolean,
  rng: () => number = Math.random
): Child {
  const g1: string[] = [];
  const g2: string[] = [];
  let mutated = false;
  for (const t of traits) {
    const a1 = p1[t.id][rng() < 0.5 ? 0 : 1];
    const a2 = p2[t.id][rng() < 0.5 ? 0 : 1];
    g1.push(a1);
    g2.push(a2);
  }
  const flip = (a: string) => (isUpper(a) ? a.toLowerCase() : a.toUpperCase());
  const genes = traits.map((_, i) => {
    let a = g1[i];
    let b = g2[i];
    if (mutation) {
      if (rng() < MUTATION_RATE) {
        a = flip(a);
        mutated = true;
      }
      if (rng() < MUTATION_RATE) {
        b = flip(b);
        mutated = true;
      }
    }
    return normalizeGene(a + b);
  });
  return { id, genes, key: genotypeKey(genes), phenoKey: phenotypeKey(genes), fromGametes: [g1, g2], mutated };
}

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}٪`;
