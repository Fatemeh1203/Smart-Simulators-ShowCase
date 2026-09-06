import { useMemo, useState } from "react";
import TriangleCanvas from "./TriangleCanvas";
import StatsPanel, { TypeCard } from "./StatsPanel";
import {
  CANVAS_H_CM,
  CANVAS_W_CM,
  DEFAULT_TRIANGLE,
  TYPE_INFO,
  computeStats,
  fmt,
  type Triangle,
} from "../lib/geometry";

const COLORS = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#fb923c"];

function randomTriangle(): Triangle {
  const r = (min: number, max: number) => min + Math.random() * (max - min);
  let t: Triangle;
  do {
    t = {
      A: { x: r(1, CANVAS_W_CM - 1), y: r(1, CANVAS_H_CM - 1) },
      B: { x: r(1, CANVAS_W_CM - 1), y: r(1, CANVAS_H_CM - 1) },
      C: { x: r(1, CANVAS_W_CM - 1), y: r(1, CANVAS_H_CM - 1) },
    };
  } while (computeStats(t).area < 6);
  return t;
}

const PRESETS: { label: string; emoji: string; t: Triangle }[] = [
  {
    label: "متساوی‌الاضلاع",
    emoji: "🟢",
    t: { A: { x: 8, y: 2.3 }, B: { x: 4.5, y: 8.36 }, C: { x: 11.5, y: 8.36 } },
  },
  {
    label: "قائم‌الزاویه",
    emoji: "🟠",
    t: { A: { x: 4, y: 2 }, B: { x: 4, y: 8.5 }, C: { x: 12, y: 8.5 } },
  },
  {
    label: "متساوی‌الساقین",
    emoji: "🔵",
    t: { A: { x: 8, y: 1.5 }, B: { x: 5.5, y: 8.5 }, C: { x: 10.5, y: 8.5 } },
  },
  {
    label: "مختلف‌الاضلاع",
    emoji: "🟣",
    t: { A: { x: 5, y: 2 }, B: { x: 3, y: 8.5 }, C: { x: 13, y: 7 } },
  },
];

interface Saved {
  id: number;
  t: Triangle;
  color: string;
}

export default function BuildMode() {
  const [tri, setTri] = useState<Triangle>(DEFAULT_TRIANGLE);
  const [colorIdx, setColorIdx] = useState(0);
  const [album, setAlbum] = useState<Saved[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [built, setBuilt] = useState(0);
  const stats = useMemo(() => computeStats(tri), [tri]);

  const save = () => {
    setAlbum((a) => [{ id: Date.now(), t: tri, color: COLORS[colorIdx] }, ...a].slice(0, 6));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-3">
        <div className="rounded-3xl bg-white/90 p-3 shadow-lg border-4 border-pink-200">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black text-pink-700">
            <span className="text-2xl">🎨</span> خودت مثلث بساز!
          </h2>
          <p className="mt-1 text-sm font-bold text-gray-600">
            سه نقطه را هر جا که دوست داری بگذار. بعد ببین چه مثلثی ساختی!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setTri(randomTriangle());
                setShowReport(true);
              }}
              className="rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 px-4 py-2 font-black text-white shadow transition hover:brightness-110 active:scale-95"
            >
              🎲 مثلث تصادفی
            </button>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setTri(p.t);
                  setShowReport(true);
                }}
                className="rounded-2xl bg-white border-2 border-pink-200 px-3 py-2 text-sm font-black text-pink-700 transition hover:bg-pink-50 active:scale-95"
              >
                {p.emoji} {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1 mr-auto">
              <span className="text-xs font-bold text-gray-500">رنگ:</span>
              {COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setColorIdx(i)}
                  className={`h-7 w-7 rounded-full border-4 transition ${
                    colorIdx === i ? "border-gray-700 scale-110" : "border-white"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label="رنگ"
                />
              ))}
            </div>
          </div>
        </div>

        <TriangleCanvas
          triangle={tri}
          onChange={setTri}
          fillColor={COLORS[colorIdx]}
          onDragEnd={() => {
            setShowReport(true);
            setBuilt((b) => b + 1);
          }}
        />

        {showReport && (
          <div key={built} className="animate-pop rounded-3xl bg-gradient-to-br from-yellow-50 to-pink-50 p-4 shadow-lg border-4 border-yellow-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-yellow-800">📋 شناسنامه‌ی مثلث تو</h3>
              <button
                onClick={save}
                className="rounded-xl bg-yellow-400 px-3 py-1.5 text-sm font-black text-yellow-900 shadow transition hover:bg-yellow-300 active:scale-95"
              >
                📸 ذخیره در آلبوم
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Chip label="AB" value={`${fmt(stats.AB)} cm`} c="bg-purple-100 text-purple-800" />
              <Chip label="BC" value={`${fmt(stats.BC)} cm`} c="bg-purple-100 text-purple-800" />
              <Chip label="AC" value={`${fmt(stats.AC)} cm`} c="bg-purple-100 text-purple-800" />
              <Chip label="محیط" value={`${fmt(stats.perimeter)} cm`} c="bg-emerald-100 text-emerald-800" />
              <Chip label="زاویه A" value={`${fmt(stats.angA, 0)}°`} c="bg-red-100 text-red-800" />
              <Chip label="زاویه B" value={`${fmt(stats.angB, 0)}°`} c="bg-blue-100 text-blue-800" />
              <Chip label="زاویه C" value={`${fmt(stats.angC, 0)}°`} c="bg-green-100 text-green-800" />
              <Chip label="مساحت" value={`${fmt(stats.area)} cm²`} c="bg-amber-100 text-amber-800" />
            </div>
            <div className="mt-3">
              <TypeCard stats={stats} small />
            </div>
          </div>
        )}

        {album.length > 0 && (
          <div className="rounded-3xl bg-white/90 p-4 shadow-lg">
            <h3 className="mb-2 font-black text-indigo-700">🖼️ آلبوم مثلث‌های من</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {album.map((s) => {
                const st = computeStats(s.t);
                const info = TYPE_INFO[st.type];
                return (
                  <button
                    key={s.id}
                    onClick={() => setTri(s.t)}
                    className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 p-2 text-right transition hover:border-indigo-300 active:scale-95"
                  >
                    <svg viewBox="0 0 160 110" className="w-full rounded-xl bg-white">
                      <polygon
                        points={`${s.t.A.x * 10},${s.t.A.y * 10} ${s.t.B.x * 10},${s.t.B.y * 10} ${s.t.C.x * 10},${s.t.C.y * 10}`}
                        fill={s.color}
                        stroke="#4f46e5"
                        strokeWidth={2}
                      />
                    </svg>
                    <div className="mt-1 text-xs font-black text-gray-700">
                      {info.emoji} {info.title}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      محیط {fmt(st.perimeter)} | مساحت {fmt(st.area)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <StatsPanel stats={stats} showExplain={false} />
    </div>
  );
}

function Chip({ label, value, c }: { label: string; value: string; c: string }) {
  return (
    <div className={`rounded-xl ${c} px-2 py-1.5 flex items-center justify-between`}>
      <span className="font-bold text-xs">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}
