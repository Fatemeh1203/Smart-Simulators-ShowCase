export type ComponentType = "battery" | "bulb" | "switch" | "resistor";
export type Level = "low" | "medium" | "high";

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  /** battery: weak/normal/strong, resistor: low/medium/high */
  level: Level;
  /** switch only */
  closed: boolean;
}

export interface TerminalRef {
  compId: string;
  index: 0 | 1;
}

export type WireEnd =
  | { kind: "terminal"; compId: string; index: 0 | 1 }
  | { kind: "free"; x: number; y: number };

export interface Wire {
  id: string;
  a: WireEnd;
  b: WireEnd;
}

export interface CircuitState {
  components: Record<string, CircuitComponent>;
  wires: Record<string, Wire>;
}

export type Selection =
  | { kind: "component"; id: string }
  | { kind: "wire"; id: string }
  | null;

export const WORKSPACE_W = 960;
export const WORKSPACE_H = 620;

/** distance from component centre to each terminal (local x axis) */
export const TERMINAL_OFFSET = 52;

export const BATTERY_VOLTS: Record<Level, number> = { low: 3, medium: 6, high: 9 };
export const RESISTOR_OHMS: Record<Level, number> = { low: 5, medium: 15, high: 40 };
export const BULB_OHMS = 10;
export const WIRE_OHMS = 0.01;
export const SWITCH_OHMS = 0.01;
export const BATTERY_INTERNAL_OHMS = 0.5;

export const termKey = (compId: string, index: number) => `${compId}:${index}`;
