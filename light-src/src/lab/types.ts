export type Vec = { x: number; y: number };

export type ObjKind =
  | "source"
  | "mirror"
  | "convex"
  | "concave"
  | "glass"
  | "water"
  | "target"
  | "protractor";

export type RayMode = "single" | "fan" | "parallel";

export interface LabObject {
  id: string;
  kind: ObjKind;
  x: number;
  y: number;
  /** rotation in degrees (screen coordinates, clockwise) */
  angle: number;
  // source
  rayMode?: RayMode;
  rayCount?: number;
  spread?: number;
  // mirror / lens
  length?: number;
  focal?: number;
  // rectangles (glass / water)
  w?: number;
  h?: number;
  n?: number;
  showPencil?: boolean;
  // target
  r?: number;
  // permissions
  movable?: boolean;
  rotatable?: boolean;
  deletable?: boolean;
  label?: string;
}

export type Medium = "air" | "water" | "glass";

export interface Segment {
  a: Vec;
  b: Vec;
  medium: Medium;
  rayIndex: number;
  bounce: number;
}

export type HitType = "reflect" | "refract" | "tir" | "lens" | "target";

export interface HitEvent {
  type: HitType;
  point: Vec;
  /** unit normal pointing toward the side the ray came from */
  normal: Vec;
  inDir: Vec;
  outDir: Vec;
  objectId: string;
  objectKind: ObjKind;
  incidence: number; // degrees
  outAngle: number; // degrees
  rayIndex: number;
}

export interface TraceResult {
  segments: Segment[];
  events: HitEvent[];
  targetsHit: Set<string>;
  focusPoint: Vec | null;
  firstMirrorHit: HitEvent | null;
}

export const CANVAS_W = 900;
export const CANVAS_H = 540;
