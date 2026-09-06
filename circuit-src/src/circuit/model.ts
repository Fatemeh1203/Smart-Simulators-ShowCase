import {
  CircuitComponent,
  CircuitState,
  ComponentType,
  Level,
  TERMINAL_OFFSET,
  Wire,
  WireEnd,
  WORKSPACE_H,
  WORKSPACE_W,
} from "./types";

let counter = 1;
export const uid = (prefix = "c") => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

export const emptyState = (): CircuitState => ({ components: {}, wires: {} });

export function makeComponent(
  type: ComponentType,
  x: number,
  y: number,
  opts: Partial<CircuitComponent> = {}
): CircuitComponent {
  return {
    id: opts.id ?? uid(type[0]),
    type,
    x,
    y,
    rotation: opts.rotation ?? 0,
    level: opts.level ?? (type === "battery" ? "medium" : "low"),
    closed: opts.closed ?? true,
  };
}

export function terminalPosition(c: CircuitComponent, index: 0 | 1) {
  const local = index === 0 ? -TERMINAL_OFFSET : TERMINAL_OFFSET;
  const rad = (c.rotation * Math.PI) / 180;
  return {
    x: c.x + local * Math.cos(rad),
    y: c.y + local * Math.sin(rad),
  };
}

export function wireEndPosition(state: CircuitState, end: WireEnd): { x: number; y: number } | null {
  if (end.kind === "free") return { x: end.x, y: end.y };
  const c = state.components[end.compId];
  if (!c) return null;
  return terminalPosition(c, end.index);
}

export function clampPos(x: number, y: number) {
  return {
    x: Math.max(60, Math.min(WORKSPACE_W - 60, x)),
    y: Math.max(50, Math.min(WORKSPACE_H - 50, y)),
  };
}

export function terminalsOf(state: CircuitState) {
  const list: { compId: string; index: 0 | 1; x: number; y: number }[] = [];
  for (const c of Object.values(state.components)) {
    for (const index of [0, 1] as const) {
      const p = terminalPosition(c, index);
      list.push({ compId: c.id, index, x: p.x, y: p.y });
    }
  }
  return list;
}

export function nearestTerminal(
  state: CircuitState,
  x: number,
  y: number,
  radius = 26,
  exclude?: { compId: string; index: 0 | 1 }
) {
  let best: { compId: string; index: 0 | 1; d: number } | null = null;
  for (const t of terminalsOf(state)) {
    if (exclude && exclude.compId === t.compId && exclude.index === t.index) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d <= radius && (!best || d < best.d)) best = { compId: t.compId, index: t.index, d };
  }
  return best;
}

/** count how many wire ends are attached to a given terminal */
export function terminalDegree(state: CircuitState, compId: string, index: 0 | 1) {
  let n = 0;
  for (const w of Object.values(state.wires)) {
    for (const e of [w.a, w.b]) {
      if (e.kind === "terminal" && e.compId === compId && e.index === index) n++;
    }
  }
  return n;
}

// ---------------- reducer ----------------

export type Action =
  | { type: "reset"; state?: CircuitState }
  | { type: "addComponent"; component: CircuitComponent }
  | { type: "moveComponent"; id: string; x: number; y: number }
  | { type: "removeComponent"; id: string }
  | { type: "setLevel"; id: string; level: Level }
  | { type: "toggleSwitch"; id: string }
  | { type: "rotate"; id: string }
  | { type: "addWire"; wire: Wire }
  | { type: "removeWire"; id: string }
  | { type: "setWireEnd"; id: string; end: "a" | "b"; value: WireEnd };

export function circuitReducer(state: CircuitState, action: Action): CircuitState {
  switch (action.type) {
    case "reset":
      return action.state ? cloneState(action.state) : emptyState();
    case "addComponent":
      return {
        ...state,
        components: { ...state.components, [action.component.id]: action.component },
      };
    case "moveComponent": {
      const c = state.components[action.id];
      if (!c) return state;
      const p = clampPos(action.x, action.y);
      return { ...state, components: { ...state.components, [c.id]: { ...c, ...p } } };
    }
    case "removeComponent": {
      const components = { ...state.components };
      delete components[action.id];
      // detach wires that touched this component -> they become free ends at old position
      const wires: Record<string, Wire> = {};
      for (const w of Object.values(state.wires)) {
        const fix = (e: WireEnd): WireEnd => {
          if (e.kind === "terminal" && e.compId === action.id) {
            const p = wireEndPosition(state, e) ?? { x: 100, y: 100 };
            return { kind: "free", x: p.x, y: p.y };
          }
          return e;
        };
        const nw = { ...w, a: fix(w.a), b: fix(w.b) };
        // remove wires that are now fully free AND were attached to the removed component on both ends
        const touchedBoth =
          w.a.kind === "terminal" && w.a.compId === action.id && w.b.kind === "terminal" && w.b.compId === action.id;
        if (!touchedBoth) wires[w.id] = nw;
      }
      return { components, wires };
    }
    case "setLevel": {
      const c = state.components[action.id];
      if (!c) return state;
      return { ...state, components: { ...state.components, [c.id]: { ...c, level: action.level } } };
    }
    case "toggleSwitch": {
      const c = state.components[action.id];
      if (!c || c.type !== "switch") return state;
      return { ...state, components: { ...state.components, [c.id]: { ...c, closed: !c.closed } } };
    }
    case "rotate": {
      const c = state.components[action.id];
      if (!c) return state;
      const rotation = (((c.rotation + 90) % 360) as 0 | 90 | 180 | 270);
      return { ...state, components: { ...state.components, [c.id]: { ...c, rotation } } };
    }
    case "addWire":
      return { ...state, wires: { ...state.wires, [action.wire.id]: action.wire } };
    case "removeWire": {
      const wires = { ...state.wires };
      delete wires[action.id];
      return { ...state, wires };
    }
    case "setWireEnd": {
      const w = state.wires[action.id];
      if (!w) return state;
      return { ...state, wires: { ...state.wires, [w.id]: { ...w, [action.end]: action.value } } };
    }
    default:
      return state;
  }
}

export function cloneState(s: CircuitState): CircuitState {
  return JSON.parse(JSON.stringify(s));
}
