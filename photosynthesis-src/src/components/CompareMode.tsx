import { useEffect, useMemo, useRef, useState } from 'react';
import { computeModel, FACTOR_META, limitingExplanation, statusLabel, type Params } from '../lib/model';
import PlantScene from './PlantScene';
import ControlPanel from './ControlPanel';
import type { HistoryPoint } from '../hooks/useSimulation';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  running: boolean;
  speed: number;
  onExit: () => void;
}

const PRESETS: { label: string; a: Params; b: Params }[] = [
  { label: 'CO₂ کم در گیاه B', a: { light: 80, co2: 80, water: 80, temp: 25 }, b: { light: 80, co2: 20, water: 80, temp: 25 } },
  { label: 'نور کم در گیاه B', a: { light: 80, co2: 80, water: 80, temp: 25 }, b: { light: 15, co2: 80, water: 80, temp: 25 } },
  { label: 'کم‌آبی در گیاه B', a: { light: 80, co2: 80, water: 80, temp: 25 }, b: { light: 80, co2: 80, water: 10, temp: 25 } },
  { label: 'گرمای شدید در گیاه B', a: { light: 80, co2: 80, water: 80, temp: 25 }, b: { light: 80, co2: 80, water: 80, temp: 42 } },
];

export default function CompareMode({ running, speed, onExit }: Props) {
  const [a, setA] = useState<Params>(PRESETS[0].a);
  const [b, setB] = useState<Params>(PRESETS[0].b);
  const [o2, setO2] = useState({ a: 0, b: 0 });
  const [history, setHistory] = useState<(HistoryPoint & { rateB: number })[]>([]);
  const mA = useMemo(() => computeModel(a), [a]);
  const mB = useMemo(() => computeModel(b), [b]);
  const live = useRef({ ra: mA.rate, rb: mB.rate, running, speed, t: 0 });
  live.current.ra = mA.rate;
  live.current.rb = mB.rate;
  live.current.running = running;
  live.current.speed = speed;

  useEffect(() => {
    const id = setInterval(() => {
      const l = live.current;
      if (!l.running) return;
      const dt = 0.5 * l.speed;
      l.t += dt;
      setO2((o) => ({ a: o.a + (l.ra / 100) * 3 * dt, b: o.b + (l.rb / 100) * 3 * dt }));
      setHistory((h) => [...h, { t: Math.round(l.t * 10) / 10, rate: l.ra, rateB: l.rb }].slice(-80));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setA(p.a);
    setB(p.b);
  };

  const winner = mA.rate === mB.rate ? null : mA.rate > mB.rate ? 'A' : 'B';

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-slate-800">🌿🌿 مقایسه دو گیاه (Plant A vs Plant B)</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="rounded-lg border border-teal-300 bg-white px-3 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100">
              {p.label}
            </button>
          ))}
          <button onClick={onExit} className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300">
            بستن
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { id: 'A', p: a, set: setA, m: mA, o: o2.a, color: '#0d9488' },
          { id: 'B', p: b, set: setB, m: mB, o: o2.b, color: '#7c3aed' },
        ].map(({ id, p, set, m, o, color }) => {
          const st = statusLabel(m.status);
          return (
            <div key={id} className={`rounded-2xl border-2 bg-white p-3 shadow-sm ${winner === id ? 'border-emerald-400' : 'border-slate-200'}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-lg font-black" style={{ color }}>
                  گیاه {id} {winner === id && <span className="text-sm">🏆 نرخ بالاتر</span>}
                </div>
                <div className={`rounded-full border px-3 py-1 text-sm font-black ${st.bg} ${st.color}`}>
                  {st.emoji} {m.rate}% — {st.text}
                </div>
              </div>
              <PlantScene params={p} rate={m.rate} running={running} speed={speed} compact title={`گیاه ${id}`} />
              <div className={`mt-2 rounded-xl border p-2 text-xs ${m.limiting ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <b>عامل محدودکننده:</b> {m.limiting ? `${FACTOR_META[m.limiting].icon} ${FACTOR_META[m.limiting].label}` : '✅ هیچ‌کدام'} — <span className="text-slate-600">{limitingExplanation(m.limiting, p)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800">
                <span>اکسیژن تولیدشده (O₂)</span>
                <span className="text-lg tabular-nums">{Math.floor(o)}</span>
              </div>
              <div className="mt-2">
                <ControlPanel params={p} onChange={(patch) => set((prev) => ({ ...prev, ...patch }))} factors={m.factors} limiting={m.limiting} compact />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-1 text-sm font-bold text-slate-700">📈 مقایسه زنده نرخ فتوسنتز</div>
        <div style={{ height: 180 }} dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.length ? history : [{ t: 0, rate: mA.rate, rateB: mB.rate }]} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v)}s`} minTickGap={30} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Vazirmatn', direction: 'rtl', fontSize: 12 }} formatter={(v, n) => [`${v}%`, n === 'rate' ? 'گیاه A' : 'گیاه B']} />
              <Legend formatter={(v) => (v === 'rate' ? 'گیاه A' : 'گیاه B')} />
              <Area type="monotone" dataKey="rate" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} strokeWidth={3} isAnimationActive={false} dot={false} />
              <Area type="monotone" dataKey="rateB" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={3} isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
