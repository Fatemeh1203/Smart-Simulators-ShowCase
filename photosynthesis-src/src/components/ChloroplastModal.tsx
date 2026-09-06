import { useEffect, useRef } from 'react';
import type { ModelResult, Params } from '../lib/model';
import { FACTOR_META } from '../lib/model';

interface Props {
  open: boolean;
  onClose: () => void;
  params: Params;
  model: ModelResult;
  running: boolean;
  speed: number;
}

const CHLORO = [
  { x: 470, y: 205 },
  { x: 600, y: 250 },
  { x: 520, y: 320 },
];
const STOMA = { x: 560, y: 452 };
const VEIN_X = 300;

export default function ChloroplastModal({ open, onClose, params, model, running, speed }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (running) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [running, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const rate01 = model.rate / 100;
  const nCO2 = params.co2 === 0 ? 0 : 1 + Math.round((params.co2 / 100) * 4);
  const nH2O = params.water === 0 ? 0 : 1 + Math.round((params.water / 100) * 4);
  const nLight = params.light === 0 ? 0 : 2 + Math.round((params.light / 100) * 6);
  const nO2 = Math.round(rate01 * 5);
  const nGlu = Math.round(rate01 * 3);
  const base = 4 / speed; // seconds

  const items = (n: number) => Array.from({ length: n }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-pop relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-l from-emerald-600 to-emerald-500 px-5 py-3 text-white">
          <div>
            <h2 className="text-xl font-black">🔬 نمای بزرگ‌شده: سلول گیاهی و کلروپلاست (Chloroplast)</h2>
            <p className="text-xs opacity-90">
              نرخ فتوسنتز فعلی: <b>{model.rate}%</b> — عامل محدودکننده: <b>{model.limiting ? FACTOR_META[model.limiting].label : 'هیچ‌کدام'}</b>
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-bold hover:bg-white/30">
            ✕ بستن
          </button>
        </div>

        <svg ref={svgRef} viewBox="0 0 800 520" className="w-full bg-gradient-to-b from-emerald-50 to-white" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
          <defs>
            <radialGradient id="chl">
              <stop offset="0" stopColor="#4ade80" />
              <stop offset="1" stopColor="#15803d" />
            </radialGradient>
            <linearGradient id="cellG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f0fdf4" />
              <stop offset="1" stopColor="#dcfce7" />
            </linearGradient>
          </defs>

          {/* ---- برگ کوچک با رگبرگ (سمت چپ) ---- */}
          <g transform="translate(20,60)">
            <path d="M10,120 Q60,0 190,20 Q160,150 10,120 Z" fill="#4ade80" stroke="#15803d" strokeWidth="2" />
            <path d="M14,118 L180,26" stroke="#166534" strokeWidth="3" />
            {[0.25, 0.45, 0.65].map((k) => (
              <g key={k} stroke="#166534" strokeWidth="1.3" fill="none">
                <path d={`M${14 + 166 * k},${118 - 92 * k} q15,-25 40,-30`} />
                <path d={`M${14 + 166 * k},${118 - 92 * k} q5,22 30,30`} />
              </g>
            ))}
            <rect x="95" y="55" width="34" height="34" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="5 3" />
            <text x="100" y="170" fontSize="13" fontWeight="700" fill="#0f172a">
              برگ (Leaf)
            </text>
            <text x="100" y="188" fontSize="11" fill="#475569">
              رگبرگ (Vein) آب را می‌آورد
            </text>
            <text x="60" y="38" fontSize="11" fill="#7f1d1d" fontWeight="700">
              ناحیه بزرگ‌شده ↘
            </text>
          </g>
          <line x1="149" y1="115" x2="250" y2="90" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1="149" y1="149" x2="250" y2="480" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" />

          {/* ---- رگبرگ (آوند) ---- */}
          <rect x={VEIN_X - 22} y="80" width="44" height="400" rx="14" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={VEIN_X - 14} y1={110 + i * 60} x2={VEIN_X + 14} y2={110 + i * 60} stroke="#7dd3fc" strokeWidth="2" />
          ))}
          <text x={VEIN_X} y="66" textAnchor="middle" fontSize="13" fontWeight="800" fill="#075985">
            رگبرگ (آوند چوبی)
          </text>
          <text x={VEIN_X} y="500" textAnchor="middle" fontSize="11" fill="#075985">
            آب از ریشه ↑
          </text>

          {/* ---- سلول گیاهی ---- */}
          <rect x="360" y="90" width="400" height="380" rx="36" fill="#a3e635" opacity="0.5" />
          <rect x="372" y="102" width="376" height="356" rx="30" fill="url(#cellG)" stroke="#65a30d" strokeWidth="4" />
          <text x="560" y="128" textAnchor="middle" fontSize="15" fontWeight="900" fill="#365314">
            سلول گیاهی (Plant Cell)
          </text>
          <text x="742" y="112" textAnchor="end" fontSize="10" fill="#4d7c0f">
            دیواره سلولی
          </text>
          {/* واکوئل و هسته */}
          <ellipse cx="680" cy="380" rx="55" ry="45" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
          <text x="680" y="384" textAnchor="middle" fontSize="10" fill="#0369a1">
            واکوئل
          </text>
          <circle cx="420" cy="400" r="24" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
          <circle cx="420" cy="400" r="8" fill="#7c3aed" />
          <text x="420" y="438" textAnchor="middle" fontSize="10" fill="#5b21b6">
            هسته
          </text>

          {/* کلروپلاست‌ها */}
          {CHLORO.map((c, i) => (
            <g key={i} transform={`translate(${c.x},${c.y}) rotate(${i * 25 - 20})`}>
              <ellipse rx="58" ry="32" fill="url(#chl)" stroke="#14532d" strokeWidth="2" />
              <ellipse rx="50" ry="25" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.7" />
              {[-30, -10, 10, 30].map((gx) => (
                <g key={gx}>
                  {[-8, -3, 2, 7].map((gy) => (
                    <rect key={gy} x={gx - 7} y={gy} width="14" height="3.5" rx="1" fill="#14532d" opacity="0.85" />
                  ))}
                </g>
              ))}
              <ellipse rx="58" ry="32" fill="#fef08a" opacity={0}>
                <animate attributeName="opacity" values={`0;${0.55 * rate01};0`} dur={`${1.2 / speed}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </ellipse>
            </g>
          ))}
          <text x="470" y="160" textAnchor="middle" fontSize="13" fontWeight="800" fill="#14532d">
            کلروپلاست (Chloroplast)
          </text>
          <text x="470" y="174" textAnchor="middle" fontSize="10" fill="#166534">
            محل انجام فتوسنتز — دارای کلروفیل
          </text>

          {/* روزنه (Stoma) در پایین سلول */}
          <g transform={`translate(${STOMA.x},${STOMA.y})`}>
            <path d="M-46,0 q-8,-26 22,-28 q8,14 0,28 q-10,26 -22,28 q-8,-14 0,-28z" fill="#86efac" stroke="#166534" strokeWidth="2" transform="translate(6,0)" />
            <path d="M46,0 q8,-26 -22,-28 q-8,14 0,28 q10,26 22,28 q8,-14 0,-28z" fill="#86efac" stroke="#166534" strokeWidth="2" transform="translate(-6,0)" />
            <ellipse cx="0" cy="0" rx={4 + 8 * Math.min(1, params.water / 40)} ry="18" fill="#0f172a" opacity="0.85" style={{ transition: 'all 0.5s' }} />
            <text x="0" y="52" textAnchor="middle" fontSize="13" fontWeight="800" fill="#14532d">
              روزنه (Stoma)
            </text>
            <text x="0" y="66" textAnchor="middle" fontSize="10" fill="#166534">
              {params.water < 30 ? 'در کم‌آبی روزنه تنگ می‌شود!' : 'ورود CO₂ و خروج O₂'}
            </text>
          </g>

          {/* نور */}
          <g>
            <circle cx="740" cy="40" r={22 + (params.light / 100) * 10} fill="#fde047" opacity={0.3 + (params.light / 100) * 0.7} />
            <text x="740" y="44" textAnchor="middle" fontSize="16">
              ☀️
            </text>
            <text x="700" y="82" textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="700">
              نور ({params.light}%)
            </text>
          </g>

          {/* ---- ذرات متحرک (SMIL) ---- */}
          {/* CO₂: از زیر روزنه به کلروپلاست */}
          {items(nCO2).map((i) => {
            const c = CHLORO[i % 3];
            return (
              <g key={`c${i}`}>
                <g>
                  <circle r="6" fill="#475569" />
                  <circle cx="-7" r="3.5" fill="#0f172a" />
                  <circle cx="7" r="3.5" fill="#0f172a" />
                  <text y="-11" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">
                    CO₂
                  </text>
                  <animateMotion dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nCO2}s`} path={`M${STOMA.x + (i % 2 ? 30 : -30)},505 L${STOMA.x},${STOMA.y} L${c.x},${c.y}`} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nCO2}s`} />
                </g>
              </g>
            );
          })}
          {/* H₂O: از رگبرگ به کلروپلاست */}
          {items(nH2O).map((i) => {
            const c = CHLORO[(i + 1) % 3];
            const y0 = 470 - ((i * 70) % 300);
            return (
              <g key={`w${i}`}>
                <circle r="5" fill="#0ea5e9" />
                <circle cx="-4" cy="-3" r="2.2" fill="#bae6fd" />
                <circle cx="4" cy="-3" r="2.2" fill="#bae6fd" />
                <text y="-10" textAnchor="middle" fontSize="9" fontWeight="700" fill="#075985">
                  H₂O
                </text>
                <animateMotion dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nH2O}s`} path={`M${VEIN_X},480 L${VEIN_X},${y0} L${c.x},${c.y}`} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nH2O}s`} />
              </g>
            );
          })}
          {/* نور */}
          {items(nLight).map((i) => {
            const c = CHLORO[i % 3];
            const d = 1.2 / speed;
            return (
              <g key={`l${i}`}>
                <line x1="0" y1="0" x2="-16" y2="-14" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
                <animateMotion dur={`${d}s`} repeatCount="indefinite" begin={`${(i * d) / nLight}s`} path={`M740,40 L${c.x + (i % 2 ? 15 : -15)},${c.y - 10}`} />
              </g>
            );
          })}
          {/* O₂: از کلروپلاست به بیرون از روزنه */}
          {items(nO2).map((i) => {
            const c = CHLORO[i % 3];
            return (
              <g key={`o${i}`}>
                <circle cx="-3.5" r="4.2" fill="#22d3ee" />
                <circle cx="3.5" r="4.2" fill="#22d3ee" />
                <text y="-10" textAnchor="middle" fontSize="9" fontWeight="700" fill="#155e75">
                  O₂
                </text>
                <animateMotion dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nO2 + 0.6}s`} path={`M${c.x},${c.y} L${STOMA.x},${STOMA.y} L${STOMA.x + (i % 2 ? 40 : -40)},510`} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${base}s`} repeatCount="indefinite" begin={`${(i * base) / nO2 + 0.6}s`} />
              </g>
            );
          })}
          {/* گلوکز: از کلروپلاست به داخل سلول */}
          {items(nGlu).map((i) => {
            const c = CHLORO[i % 3];
            return (
              <g key={`g${i}`}>
                <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="#f97316" stroke="#fed7aa" />
                <text y="-11" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9a3412">
                  گلوکز
                </text>
                <animateMotion dur={`${base * 1.2}s`} repeatCount="indefinite" begin={`${(i * base) / (nGlu || 1) + 1}s`} path={`M${c.x},${c.y} Q${c.x + 40},${c.y + 60} 680,380`} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${base * 1.2}s`} repeatCount="indefinite" begin={`${(i * base) / (nGlu || 1) + 1}s`} />
              </g>
            );
          })}

          {/* معادله نمادین */}
          <g transform="translate(560,26)">
            <rect x="-190" y="-18" width="330" height="36" rx="18" fill="#ffffff" stroke="#a7f3d0" />
            <text textAnchor="middle" y="6" fontSize="14" fontWeight="800" fill="#065f46" direction="ltr">
              CO₂ + H₂O + نور ⟶ گلوکز (C₆H₁₂O₆) + O₂
            </text>
          </g>
        </svg>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50 p-3 text-xs md:grid-cols-5">
          <Legend color="#475569" label="CO₂ از روزنه وارد می‌شود" />
          <Legend color="#0ea5e9" label="H₂O از رگبرگ می‌رسد" />
          <Legend color="#facc15" label="نور جذب کلروفیل می‌شود" />
          <Legend color="#22d3ee" label="O₂ از روزنه خارج می‌شود" />
          <Legend color="#f97316" label="گلوکز در سلول ذخیره می‌شود" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      <span className="font-semibold text-slate-700">{label}</span>
    </div>
  );
}
