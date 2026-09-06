import {
  BATTERY_INTERNAL_OHMS,
  BATTERY_VOLTS,
  BULB_OHMS,
  CircuitState,
  RESISTOR_OHMS,
  SWITCH_OHMS,
  termKey,
  WIRE_OHMS,
} from "./types";

export type Status = "empty" | "lit" | "open" | "short" | "partial" | "noBattery" | "noBulb";

export interface Highlights {
  terminals: Set<string>; // termKey
  components: Set<string>;
  wireEnds: Set<string>; // `${wireId}:a` | `${wireId}:b`
  wires: Set<string>;
}

export interface Analysis {
  status: Status;
  message: string;
  hint: string | null;
  anyLit: boolean;
  allLit: boolean;
  litCount: number;
  bulbBrightness: Record<string, number>;
  bulbCurrent: Record<string, number>;
  /** current flowing from end a to end b of a wire (amps) */
  wireCurrent: Record<string, number>;
  /** current flowing from terminal 0 to terminal 1 through a component (amps) */
  compCurrent: Record<string, number>;
  shortCircuit: boolean;
  highlights: Highlights;
}

const GMIN = 1e-7;
const FULL_BRIGHT_AMPS = 0.55;
const SHORT_AMPS = 4;

function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-14) continue;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let k = col; k <= n; k++) M[r][k] -= f * M[col][k];
    }
  }
  return M.map((row, i) => (Math.abs(row[i]) < 1e-14 ? 0 : row[n] / row[i]));
}

class UnionFind {
  parent = new Map<string, string>();
  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let p = this.parent.get(x)!;
    if (p !== x) {
      p = this.find(p);
      this.parent.set(x, p);
    }
    return p;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

export function analyze(state: CircuitState): Analysis {
  const comps = Object.values(state.components);
  const wires = Object.values(state.wires);
  const highlights: Highlights = {
    terminals: new Set(),
    components: new Set(),
    wireEnds: new Set(),
    wires: new Set(),
  };

  // ---- node numbering: each terminal is its own node ----
  const nodeIndex = new Map<string, number>();
  for (const c of comps) {
    nodeIndex.set(termKey(c.id, 0), nodeIndex.size);
    nodeIndex.set(termKey(c.id, 1), nodeIndex.size);
  }
  const n = nodeIndex.size;
  const G: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const I: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) G[i][i] += GMIN;

  const stamp = (a: number, b: number, ohms: number) => {
    const g = 1 / ohms;
    G[a][a] += g;
    G[b][b] += g;
    G[a][b] -= g;
    G[b][a] -= g;
  };

  for (const w of wires) {
    if (w.a.kind === "terminal" && w.b.kind === "terminal") {
      const a = nodeIndex.get(termKey(w.a.compId, w.a.index));
      const b = nodeIndex.get(termKey(w.b.compId, w.b.index));
      if (a === undefined || b === undefined || a === b) continue;
      stamp(a, b, WIRE_OHMS);
    }
  }
  for (const c of comps) {
    const a = nodeIndex.get(termKey(c.id, 0))!;
    const b = nodeIndex.get(termKey(c.id, 1))!;
    switch (c.type) {
      case "bulb":
        stamp(a, b, BULB_OHMS);
        break;
      case "resistor":
        stamp(a, b, RESISTOR_OHMS[c.level]);
        break;
      case "switch":
        if (c.closed) stamp(a, b, SWITCH_OHMS);
        break;
      case "battery": {
        // Norton equivalent: current source in parallel with internal resistance
        stamp(a, b, BATTERY_INTERNAL_OHMS);
        const isrc = BATTERY_VOLTS[c.level] / BATTERY_INTERNAL_OHMS;
        I[a] += isrc; // terminal 0 is "+"
        I[b] -= isrc;
        break;
      }
    }
  }

  const V = n > 0 ? solveLinear(G, I) : [];
  const vOf = (compId: string, index: 0 | 1) => V[nodeIndex.get(termKey(compId, index))!] ?? 0;

  const wireCurrent: Record<string, number> = {};
  for (const w of wires) {
    if (w.a.kind === "terminal" && w.b.kind === "terminal") {
      const va = vOf(w.a.compId, w.a.index);
      const vb = vOf(w.b.compId, w.b.index);
      wireCurrent[w.id] = (va - vb) / WIRE_OHMS;
    } else wireCurrent[w.id] = 0;
  }

  const compCurrent: Record<string, number> = {};
  const bulbCurrent: Record<string, number> = {};
  const bulbBrightness: Record<string, number> = {};
  let shortCircuit = false;
  for (const c of comps) {
    const va = vOf(c.id, 0);
    const vb = vOf(c.id, 1);
    let i = 0;
    switch (c.type) {
      case "bulb":
        i = (va - vb) / BULB_OHMS;
        bulbCurrent[c.id] = Math.abs(i);
        bulbBrightness[c.id] = Math.min(1.3, Math.abs(i) / FULL_BRIGHT_AMPS);
        if (Math.abs(i) < 0.03) bulbBrightness[c.id] = 0;
        break;
      case "resistor":
        i = (va - vb) / RESISTOR_OHMS[c.level];
        break;
      case "switch":
        i = c.closed ? (va - vb) / SWITCH_OHMS : 0;
        break;
      case "battery": {
        // current leaving the + terminal (0) into the circuit
        i = -(BATTERY_VOLTS[c.level] - (va - vb)) / BATTERY_INTERNAL_OHMS;
        if (Math.abs(i) > SHORT_AMPS) shortCircuit = true;
        break;
      }
    }
    compCurrent[c.id] = i;
  }

  const bulbs = comps.filter((c) => c.type === "bulb");
  const batteries = comps.filter((c) => c.type === "battery");
  const litBulbs = bulbs.filter((b) => bulbBrightness[b.id] > 0.04);
  const anyLit = litBulbs.length > 0;
  const allLit = bulbs.length > 0 && litBulbs.length === bulbs.length;

  // ---- diagnostics ----
  let status: Status;
  let message: string;
  let hint: string | null = null;

  if (comps.length === 0) {
    status = "empty";
    message = "قطعات را از جعبه‌ابزار به اینجا بکش و مدار بساز!";
  } else if (batteries.length === 0) {
    status = "noBattery";
    message = "مدار باتری ندارد! 🔋";
    hint = "بدون باتری انرژی الکتریکی وجود ندارد. یک باتری اضافه کن.";
    for (const b of bulbs) highlights.components.add(b.id);
  } else if (bulbs.length === 0) {
    status = "noBulb";
    message = "لامپ کجاست؟ 💡";
    hint = "یک لامپ به مدار اضافه کن تا نتیجه را ببینی.";
  } else if (shortCircuit && !anyLit) {
    status = "short";
    message = "اتصال کوتاه! ⚡ برق از یک راه میان‌بُر می‌گذرد و به لامپ نمی‌رسد.";
    hint = "سیمی که دو سر باتری را مستقیم به هم وصل کرده پیدا کن و آن را بردار.";
    for (const w of wires) if (Math.abs(wireCurrent[w.id] ?? 0) > SHORT_AMPS) highlights.wires.add(w.id);
  } else if (allLit) {
    status = "lit";
    message = "🎉 آفرین! مدار کامل شد و لامپ روشن شد.";
    if (shortCircuit) hint = "مواظب باش! یک قسمت از مدار اتصال کوتاه دارد ⚡";
  } else {
    status = anyLit ? "partial" : "open";
    message = anyLit
      ? "یک لامپ روشن شد ولی لامپ دیگر هنوز خاموش است."
      : "یک قسمت از مدار هنوز باز است. مسیر برق را بررسی کن.";

    // ---- find where the break is ----
    const uf = new UnionFind();
    for (const c of comps) uf.union(termKey(c.id, 0), termKey(c.id, 1));
    for (const w of wires)
      if (w.a.kind === "terminal" && w.b.kind === "terminal")
        uf.union(termKey(w.a.compId, w.a.index), termKey(w.b.compId, w.b.index));

    const interesting = new Set<string>();
    for (const b of bulbs) if (!(bulbBrightness[b.id] > 0.04)) interesting.add(uf.find(termKey(b.id, 0)));
    for (const b of batteries) interesting.add(uf.find(termKey(b.id, 0)));

    const degree = new Map<string, number>();
    for (const w of wires)
      for (const e of [w.a, w.b])
        if (e.kind === "terminal") {
          const k = termKey(e.compId, e.index);
          degree.set(k, (degree.get(k) ?? 0) + 1);
        }

    const hints: string[] = [];
    let dangling = 0;
    for (const c of comps) {
      const grp = uf.find(termKey(c.id, 0));
      if (!interesting.has(grp)) continue;
      for (const idx of [0, 1] as const) {
        const k = termKey(c.id, idx);
        if (!degree.get(k)) {
          highlights.terminals.add(k);
          dangling++;
        }
      }
      if (c.type === "switch" && !c.closed) highlights.components.add(c.id);
    }
    let freeEnds = 0;
    for (const w of wires) {
      const grpTouch = [w.a, w.b].some(
        (e) => e.kind === "terminal" && interesting.has(uf.find(termKey(e.compId, e.index)))
      );
      if (w.a.kind === "free" && (grpTouch || w.b.kind === "free")) {
        highlights.wireEnds.add(`${w.id}:a`);
        freeEnds++;
      }
      if (w.b.kind === "free" && (grpTouch || w.a.kind === "free")) {
        highlights.wireEnds.add(`${w.id}:b`);
        freeEnds++;
      }
    }
    const openSwitches = comps.filter((c) => c.type === "switch" && !c.closed && highlights.components.has(c.id));

    if (dangling > 0) hints.push("پایانه‌های قرمز به هیچ سیمی وصل نیستند.");
    if (freeEnds > 0) hints.push("سرِ سیم قرمز به جایی وصل نشده است. آن را روی یک پایانه بگذار.");
    if (openSwitches.length > 0) hints.push("کلید باز است! 🔴 روی کلید بزن تا بسته شود.");
    if (hints.length === 0) {
      hints.push("لامپ در یک حلقهٔ بسته با باتری نیست. سیم‌ها باید از یک سر باتری به لامپ و از لامپ به سر دیگر باتری برسند.");
      for (const b of bulbs) if (!(bulbBrightness[b.id] > 0.04)) highlights.components.add(b.id);
    }
    hint = hints.join(" ");
  }

  return {
    status,
    message,
    hint,
    anyLit,
    allLit,
    litCount: litBulbs.length,
    bulbBrightness,
    bulbCurrent,
    wireCurrent,
    compCurrent,
    shortCircuit,
    highlights,
  };
}
