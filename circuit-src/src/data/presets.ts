import { makeComponent } from "../circuit/model";
import { CircuitComponent, CircuitState, Wire, WireEnd } from "../circuit/types";

type PartSpec = {
  id: string;
  type: CircuitComponent["type"];
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
  level?: CircuitComponent["level"];
  closed?: boolean;
};

type EndSpec = string | { x: number; y: number }; // "id:0" or free point

function end(spec: EndSpec): WireEnd {
  if (typeof spec === "string") {
    const [compId, idx] = spec.split(":");
    return { kind: "terminal", compId, index: Number(idx) as 0 | 1 };
  }
  return { kind: "free", x: spec.x, y: spec.y };
}

export function build(parts: PartSpec[], wires: [EndSpec, EndSpec][]): CircuitState {
  const state: CircuitState = { components: {}, wires: {} };
  for (const p of parts) {
    state.components[p.id] = makeComponent(p.type, p.x, p.y, {
      id: p.id,
      rotation: p.rotation ?? 0,
      level: p.level,
      closed: p.closed,
    });
  }
  wires.forEach(([a, b], i) => {
    const w: Wire = { id: `w${i + 1}`, a: end(a), b: end(b) };
    state.wires[w.id] = w;
  });
  return state;
}

/** battery + closed switch + bulb, all lit */
export const presetSwitchLoop = () =>
  build(
    [
      { id: "bat", type: "battery", x: 480, y: 470 },
      { id: "sw", type: "switch", x: 480, y: 170, closed: true },
      { id: "lamp", type: "bulb", x: 760, y: 320, rotation: 90 },
    ],
    [
      ["bat:1", "lamp:0"],
      ["lamp:1", "sw:1"],
      ["sw:0", "bat:0"],
    ]
  );

/** weak battery + bulb */
export const presetBatteryTest = () =>
  build(
    [
      { id: "bat", type: "battery", x: 400, y: 450, level: "low" },
      { id: "lamp", type: "bulb", x: 400, y: 190 },
    ],
    [
      ["bat:1", "lamp:1"],
      ["lamp:0", "bat:0"],
    ]
  );

/** battery + low resistor + bulb */
export const presetResistorTest = () =>
  build(
    [
      { id: "bat", type: "battery", x: 480, y: 470 },
      { id: "res", type: "resistor", x: 480, y: 170, level: "low" },
      { id: "lamp", type: "bulb", x: 760, y: 320, rotation: 90 },
    ],
    [
      ["bat:1", "lamp:0"],
      ["lamp:1", "res:1"],
      ["res:0", "bat:0"],
    ]
  );

/** battery + bulb already lit (mission 2 & 4 start) */
export const presetSimpleLoop = () =>
  build(
    [
      { id: "bat", type: "battery", x: 480, y: 460 },
      { id: "lamp", type: "bulb", x: 480, y: 190 },
    ],
    [
      ["bat:1", "lamp:1"],
      ["lamp:0", "bat:0"],
    ]
  );

/** broken circuit for mission 3: one wire end left dangling */
export const presetBroken = () =>
  build(
    [
      { id: "bat", type: "battery", x: 460, y: 470 },
      { id: "sw", type: "switch", x: 460, y: 170, closed: true },
      { id: "lamp", type: "bulb", x: 760, y: 320, rotation: 90 },
    ],
    [
      ["bat:1", "lamp:0"],
      ["lamp:1", { x: 560, y: 212 }],
      ["sw:0", "bat:0"],
    ]
  );
