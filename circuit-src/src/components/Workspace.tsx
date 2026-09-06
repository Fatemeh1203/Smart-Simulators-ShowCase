import { Dispatch, RefObject, useRef, useState } from "react";
import { Analysis } from "../circuit/analyze";
import { Action, nearestTerminal, terminalDegree, terminalPosition, uid, wireEndPosition } from "../circuit/model";
import { CircuitComponent, CircuitState, Selection, termKey, Wire, WireEnd, WORKSPACE_H, WORKSPACE_W } from "../circuit/types";
import { clientToSvg } from "../utils/svg";
import { BatteryGlyph, BulbGlyph, FlowDots, LEVEL_LABEL_BATTERY, LEVEL_LABEL_RESISTOR, ResistorGlyph, SwitchGlyph } from "./parts";

interface Props {
  state: CircuitState;
  analysis: Analysis;
  dispatch: Dispatch<Action>;
  selection: Selection;
  setSelection: (s: Selection) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  onInteract?: () => void;
}

type Drag =
  | { kind: "component"; id: string; dx: number; dy: number; startX: number; startY: number; moved: boolean }
  | { kind: "newWire"; from: { compId: string; index: 0 | 1 } }
  | { kind: "endpoint"; wireId: string; end: "a" | "b" }
  | { kind: "wire"; wireId: string; startX: number; startY: number; a: { x: number; y: number }; b: { x: number; y: number }; moved: boolean };

const SNAP = 28;

export default function Workspace({ state, analysis, dispatch, selection, setSelection, svgRef, onInteract }: Props) {
  const dragRef = useRef<Drag | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [snapTarget, setSnapTarget] = useState<{ compId: string; index: 0 | 1 } | null>(null);
  const [hoverTerminal, setHoverTerminal] = useState<string | null>(null);

  const toSvg = (e: { clientX: number; clientY: number }) => clientToSvg(svgRef.current!, e.clientX, e.clientY);

  const capture = (e: React.PointerEvent) => {
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  // ---------- pointer down handlers ----------
  const onComponentDown = (e: React.PointerEvent, c: CircuitComponent) => {
    e.stopPropagation();
    e.preventDefault();
    capture(e);
    const p = toSvg(e);
    dragRef.current = { kind: "component", id: c.id, dx: c.x - p.x, dy: c.y - p.y, startX: p.x, startY: p.y, moved: false };
    setSelection({ kind: "component", id: c.id });
  };

  const onTerminalDown = (e: React.PointerEvent, compId: string, index: 0 | 1) => {
    e.stopPropagation();
    e.preventDefault();
    capture(e);
    dragRef.current = { kind: "newWire", from: { compId, index } };
    setPointer(toSvg(e));
    setSelection(null);
  };

  const onEndpointDown = (e: React.PointerEvent, wireId: string, end: "a" | "b") => {
    e.stopPropagation();
    e.preventDefault();
    capture(e);
    dragRef.current = { kind: "endpoint", wireId, end };
    const p = toSvg(e);
    setPointer(p);
    dispatch({ type: "setWireEnd", id: wireId, end, value: { kind: "free", x: p.x, y: p.y } });
  };

  const onWireDown = (e: React.PointerEvent, w: Wire) => {
    e.stopPropagation();
    e.preventDefault();
    capture(e);
    setSelection({ kind: "wire", id: w.id });
    const p = toSvg(e);
    const a = wireEndPosition(state, w.a);
    const b = wireEndPosition(state, w.b);
    if (w.a.kind === "free" && w.b.kind === "free" && a && b) {
      dragRef.current = { kind: "wire", wireId: w.id, startX: p.x, startY: p.y, a, b, moved: false };
    } else {
      dragRef.current = null;
    }
  };

  const onBackgroundDown = () => {
    setSelection(null);
  };

  // ---------- move / up ----------
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const p = toSvg(e);
    if (d.kind === "component") {
      if (!d.moved && Math.hypot(p.x - d.startX, p.y - d.startY) > 4) d.moved = true;
      if (d.moved) dispatch({ type: "moveComponent", id: d.id, x: p.x + d.dx, y: p.y + d.dy });
    } else if (d.kind === "newWire") {
      setPointer(p);
      const t = nearestTerminal(state, p.x, p.y, SNAP, d.from);
      setSnapTarget(t ? { compId: t.compId, index: t.index } : null);
    } else if (d.kind === "endpoint") {
      setPointer(p);
      const w = state.wires[d.wireId];
      const other = w ? (d.end === "a" ? w.b : w.a) : null;
      const exclude = other && other.kind === "terminal" ? { compId: other.compId, index: other.index } : undefined;
      const t = nearestTerminal(state, p.x, p.y, SNAP, exclude);
      setSnapTarget(t ? { compId: t.compId, index: t.index } : null);
      dispatch({ type: "setWireEnd", id: d.wireId, end: d.end, value: { kind: "free", x: p.x, y: p.y } });
    } else if (d.kind === "wire") {
      const ddx = p.x - d.startX;
      const ddy = p.y - d.startY;
      if (!d.moved && Math.hypot(ddx, ddy) > 4) d.moved = true;
      if (d.moved) {
        dispatch({ type: "setWireEnd", id: d.wireId, end: "a", value: { kind: "free", x: d.a.x + ddx, y: d.a.y + ddy } });
        dispatch({ type: "setWireEnd", id: d.wireId, end: "b", value: { kind: "free", x: d.b.x + ddx, y: d.b.y + ddy } });
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    setPointer(null);
    setSnapTarget(null);
    if (!d) return;
    const p = toSvg(e);
    onInteract?.();
    if (d.kind === "component") {
      if (!d.moved) {
        const c = state.components[d.id];
        if (c?.type === "switch") dispatch({ type: "toggleSwitch", id: c.id });
      }
    } else if (d.kind === "newWire") {
      const t = nearestTerminal(state, p.x, p.y, SNAP, d.from);
      const from = terminalPosition(state.components[d.from.compId], d.from.index);
      const a: WireEnd = { kind: "terminal", compId: d.from.compId, index: d.from.index };
      if (t) {
        dispatch({ type: "addWire", wire: { id: uid("w"), a, b: { kind: "terminal", compId: t.compId, index: t.index } } });
      } else if (Math.hypot(p.x - from.x, p.y - from.y) > 40) {
        dispatch({ type: "addWire", wire: { id: uid("w"), a, b: { kind: "free", x: p.x, y: p.y } } });
      }
    } else if (d.kind === "endpoint") {
      const w = state.wires[d.wireId];
      const other = w ? (d.end === "a" ? w.b : w.a) : null;
      const exclude = other && other.kind === "terminal" ? { compId: other.compId, index: other.index } : undefined;
      const t = nearestTerminal(state, p.x, p.y, SNAP, exclude);
      if (t) dispatch({ type: "setWireEnd", id: d.wireId, end: d.end, value: { kind: "terminal", compId: t.compId, index: t.index } });
    }
  };

  // ---------- rendering helpers ----------
  const comps = Object.values(state.components);
  const wires = Object.values(state.wires);
  const hl = analysis.highlights;
  const selectedId = selection?.id ?? null;

  const wireD = (a: { x: number; y: number }, b: { x: number; y: number }) => `M${a.x} ${a.y} L${b.x} ${b.y}`;

  return (
    <svg
      ref={svgRef}
      className="workspace w-full h-full font-sans"
      viewBox={`0 0 ${WORKSPACE_W} ${WORKSPACE_H}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerDown={onBackgroundDown}
    >
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="1.6" fill="#c7d7ee" />
        </pattern>
        <linearGradient id="table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf3ff" />
        </linearGradient>
      </defs>
      <rect width={WORKSPACE_W} height={WORKSPACE_H} rx={24} fill="url(#table)" />
      <rect width={WORKSPACE_W} height={WORKSPACE_H} rx={24} fill="url(#grid)" />

      {comps.length === 0 && (
        <g style={{ pointerEvents: "none" }}>
          <text x={WORKSPACE_W / 2} y={WORKSPACE_H / 2 - 20} textAnchor="middle" fontSize={64}>
            🧲
          </text>
          <text x={WORKSPACE_W / 2} y={WORKSPACE_H / 2 + 40} textAnchor="middle" fontSize={26} fontWeight={800} fill="#64748b">
            قطعات را از جعبه‌ابزار به اینجا بکش!
          </text>
          <text x={WORKSPACE_W / 2} y={WORKSPACE_H / 2 + 76} textAnchor="middle" fontSize={18} fill="#94a3b8">
            بعد برای سیم‌کشی از یک دایرهٔ پایانه به دایرهٔ دیگر بکش
          </text>
        </g>
      )}

      {/* ---------- wires ---------- */}
      {wires.map((w) => {
        const a = wireEndPosition(state, w.a);
        const b = wireEndPosition(state, w.b);
        if (!a || !b) return null;
        const d = wireD(a, b);
        const cur = analysis.wireCurrent[w.id] ?? 0;
        const isSel = selectedId === w.id && selection?.kind === "wire";
        const isBad = hl.wires.has(w.id);
        return (
          <g key={w.id}>
            {isSel && <path d={d} stroke="#38bdf8" strokeWidth={16} strokeLinecap="round" opacity={0.5} fill="none" />}
            {isBad && <path d={d} stroke="#ef4444" strokeWidth={16} strokeLinecap="round" className="pulse-box" fill="none" />}
            <path d={d} stroke="#c2410c" strokeWidth={9} strokeLinecap="round" fill="none" />
            <path d={d} stroke="#fb923c" strokeWidth={5} strokeLinecap="round" fill="none" />
            <FlowDots d={d} current={cur} />
            {/* hit area */}
            <path d={d} stroke="transparent" strokeWidth={22} fill="none" style={{ cursor: "pointer" }} onPointerDown={(e) => onWireDown(e, w)} />
          </g>
        );
      })}

      {/* ---------- components ---------- */}
      {comps.map((c) => {
        const cur = analysis.compCurrent[c.id] ?? 0;
        const isSel = selectedId === c.id && selection?.kind === "component";
        const isBad = hl.components.has(c.id);
        const label =
          c.type === "battery"
            ? `باتری ${LEVEL_LABEL_BATTERY[c.level]}`
            : c.type === "resistor"
              ? `مقاومت ${LEVEL_LABEL_RESISTOR[c.level]}`
              : c.type === "switch"
                ? c.closed
                  ? "کلید بسته 🟢"
                  : "کلید باز 🔴"
                : null;
        const vertical = c.rotation % 180 !== 0;
        return (
          <g key={c.id}>
            <g transform={`translate(${c.x} ${c.y}) rotate(${c.rotation})`} style={{ cursor: "grab" }} onPointerDown={(e) => onComponentDown(e, c)}>
              {isSel && <rect x={-58} y={-40} width={116} height={80} rx={14} fill="#bae6fd" opacity={0.55} />}
              {isBad && <rect x={-58} y={-40} width={116} height={80} rx={14} fill="none" stroke="#ef4444" strokeWidth={4} strokeDasharray="8 6" className="pulse-box" />}
              {/* invisible hit box */}
              <rect x={-40} y={-34} width={80} height={68} fill="transparent" />
              {c.type === "battery" && <BatteryGlyph c={c} current={cur} />}
              {c.type === "bulb" && <BulbGlyph c={c} brightness={analysis.bulbBrightness[c.id] ?? 0} current={cur} />}
              {c.type === "switch" && <SwitchGlyph c={c} current={cur} />}
              {c.type === "resistor" && <ResistorGlyph c={c} current={cur} />}
            </g>
            {label && (
              <text x={c.x} y={c.y + (vertical ? 74 : 44)} textAnchor="middle" fontSize={13} fontWeight={700} fill="#475569" style={{ pointerEvents: "none" }}>
                {label}
              </text>
            )}
            {/* terminals */}
            {([0, 1] as const).map((idx) => {
              const p = terminalPosition(c, idx);
              const key = termKey(c.id, idx);
              const connected = terminalDegree(state, c.id, idx) > 0;
              const isSnap = snapTarget?.compId === c.id && snapTarget.index === idx;
              const bad = hl.terminals.has(key);
              return (
                <g key={idx}>
                  {bad && <circle cx={p.x} cy={p.y} r={14} className="pulse-ring" />}
                  {isSnap && <circle cx={p.x} cy={p.y} r={18} fill="#22c55e" opacity={0.35} />}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoverTerminal === key || isSnap ? 11 : 9}
                    fill={connected ? "#334155" : bad ? "#fee2e2" : "#ffffff"}
                    stroke={bad ? "#ef4444" : isSnap ? "#16a34a" : "#334155"}
                    strokeWidth={3}
                    style={{ cursor: "crosshair", transition: "r 0.1s" }}
                    onPointerDown={(e) => onTerminalDown(e, c.id, idx)}
                    onPointerEnter={() => setHoverTerminal(key)}
                    onPointerLeave={() => setHoverTerminal(null)}
                  />
                  {/* larger invisible touch target */}
                  <circle cx={p.x} cy={p.y} r={18} fill="transparent" style={{ cursor: "crosshair" }} onPointerDown={(e) => onTerminalDown(e, c.id, idx)} />
                </g>
              );
            })}
            {/* delete button for selected component */}
            {isSel && (
              <g
                transform={`translate(${c.x + 46} ${c.y - 46})`}
                style={{ cursor: "pointer" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  dispatch({ type: "removeComponent", id: c.id });
                  setSelection(null);
                  onInteract?.();
                }}
              >
                <circle r={15} fill="#ef4444" stroke="#fff" strokeWidth={3} />
                <text y={6} textAnchor="middle" fontSize={18} fontWeight={900} fill="#fff">
                  ✕
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ---------- free wire ends & selected wire handles ---------- */}
      {wires.map((w) => {
        const a = wireEndPosition(state, w.a);
        const b = wireEndPosition(state, w.b);
        if (!a || !b) return null;
        const isSel = selectedId === w.id && selection?.kind === "wire";
        const ends: { key: "a" | "b"; pos: { x: number; y: number }; end: WireEnd }[] = [
          { key: "a", pos: a, end: w.a },
          { key: "b", pos: b, end: w.b },
        ];
        return (
          <g key={`h-${w.id}`}>
            {ends.map(({ key, pos, end }) => {
              const free = end.kind === "free";
              const bad = hl.wireEnds.has(`${w.id}:${key}`);
              if (!free && !isSel) return null;
              return (
                <g key={key}>
                  {bad && <circle cx={pos.x} cy={pos.y} r={14} className="pulse-ring" />}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={free ? 9 : 11}
                    fill={free ? "#fb923c" : "#38bdf8"}
                    stroke={bad ? "#ef4444" : "#fff"}
                    strokeWidth={3}
                    style={{ cursor: "grab" }}
                    onPointerDown={(e) => onEndpointDown(e, w.id, key)}
                  />
                  <circle cx={pos.x} cy={pos.y} r={18} fill="transparent" style={{ cursor: "grab" }} onPointerDown={(e) => onEndpointDown(e, w.id, key)} />
                </g>
              );
            })}
            {isSel && (
              <g
                transform={`translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 28})`}
                style={{ cursor: "pointer" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  dispatch({ type: "removeWire", id: w.id });
                  setSelection(null);
                  onInteract?.();
                }}
              >
                <circle r={15} fill="#ef4444" stroke="#fff" strokeWidth={3} />
                <text y={6} textAnchor="middle" fontSize={18} fontWeight={900} fill="#fff">
                  ✕
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ---------- rubber band for new wire ---------- */}
      {pointer && dragRef.current?.kind === "newWire" && (() => {
        const d = dragRef.current;
        const from = terminalPosition(state.components[d.from.compId], d.from.index);
        const to = snapTarget ? terminalPosition(state.components[snapTarget.compId], snapTarget.index) : pointer;
        return (
          <g style={{ pointerEvents: "none" }}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#fb923c" strokeWidth={6} strokeLinecap="round" strokeDasharray={snapTarget ? undefined : "10 8"} opacity={0.85} />
            <circle cx={to.x} cy={to.y} r={9} fill="#fb923c" stroke="#fff" strokeWidth={3} />
          </g>
        );
      })()}
    </svg>
  );
}
