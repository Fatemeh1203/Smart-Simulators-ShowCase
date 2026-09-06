import { useEffect, useState } from 'react';
import type { FactorKey, ModelResult, Params } from '../lib/model';

export interface Mission {
  id: number;
  title: string;
  desc: string;
  start: Params;
  locked?: FactorKey[];
  check: (m: ModelResult, p: Params) => boolean;
  hint: string;
  goalText: string;
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'مأموریت ۱: گیاه را نجات بده!',
    desc: 'گیاه در شرایط بدی است. با تنظیم نور، CO₂، آب و دما، نرخ فتوسنتز را به حداقل ۸۰٪ برسان.',
    goalText: 'نرخ فتوسنتز ≥ 80%',
    start: { light: 15, co2: 25, water: 20, temp: 39 },
    check: (m) => m.rate >= 80,
    hint: 'به کارت «عامل محدودکننده» نگاه کن؛ همیشه اول همان عامل را بهبود بده.',
  },
  {
    id: 2,
    title: 'مأموریت ۲: رکورد طلایی',
    desc: 'همه‌ی عوامل را بهینه کن تا نرخ فتوسنتز به ۹۵٪ یا بیشتر برسد.',
    goalText: 'نرخ فتوسنتز ≥ 95%',
    start: { light: 40, co2: 40, water: 40, temp: 12 },
    check: (m) => m.rate >= 95,
    hint: 'دمای بهینه حدود ۲۵ تا ۳۰ درجه است. وقتی هیچ عامل محدودکننده‌ای باقی نماند، به هدف می‌رسی.',
  },
  {
    id: 3,
    title: 'مأموریت ۳: فقط با دما!',
    desc: 'نور، CO₂ و آب قفل شده‌اند (۹۰٪). فقط با تغییر دما، فتوسنتز را زیر ۲۰٪ بیاور تا نشان دهی دما به‌تنهایی می‌تواند عامل محدودکننده شود.',
    goalText: 'نرخ فتوسنتز < 20% فقط با دما',
    start: { light: 90, co2: 90, water: 90, temp: 25 },
    locked: ['light', 'co2', 'water'],
    check: (m) => m.rate < 20,
    hint: 'دما را به بالای ۴۰ درجه یا زیر ۱۰ درجه ببر.',
  },
];

interface Props {
  model: ModelResult;
  params: Params;
  mission: Mission | null;
  onStart: (m: Mission) => void;
  onExit: () => void;
}

export default function ChallengeMode({ model, params, mission, onStart, onExit }: Props) {
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [armed, setArmed] = useState(false);

  // پس از شروع مأموریت، کمی صبر می‌کنیم تا انیمیشن تنظیم شرایط اولیه تمام شود
  useEffect(() => {
    setWon(false);
    setShowHint(false);
    setArmed(false);
    if (!mission) return;
    const t = setTimeout(() => setArmed(true), 1200);
    return () => clearTimeout(t);
  }, [mission?.id]);

  useEffect(() => {
    if (armed && mission && !won && mission.check(model, params)) setWon(true);
  }, [model, params, mission, won, armed]);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-amber-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800">🎯 Challenge Mode — حالت مأموریت</h3>
        {mission && (
          <button onClick={onExit} className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300">
            خروج از مأموریت
          </button>
        )}
      </div>

      {!mission ? (
        <div className="grid gap-3 md:grid-cols-3">
          {MISSIONS.map((m) => (
            <button key={m.id} onClick={() => onStart(m)} className="rounded-2xl border border-fuchsia-200 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="font-black text-fuchsia-700">{m.title}</div>
              <p className="mt-1 text-xs leading-6 text-slate-600">{m.desc}</p>
              <div className="mt-2 inline-block rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-bold text-fuchsia-800">🎯 {m.goalText}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="rounded-xl border border-fuchsia-200 bg-white p-4">
            <div className="text-base font-black text-fuchsia-700">{mission.title}</div>
            <p className="mt-1 text-sm leading-7 text-slate-700">{mission.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-800">🎯 هدف: {mission.goalText}</div>
              <div className={`rounded-full px-3 py-1 text-xs font-bold ${won ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                وضعیت فعلی: {model.rate}%
              </div>
              {mission.locked && <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">🔒 {mission.locked.length} عامل قفل شده</div>}
              <button onClick={() => setShowHint(!showHint)} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200">
                💡 راهنمایی
              </button>
            </div>
            {showHint && <p className="fade-up mt-2 text-xs text-amber-800">{mission.hint}</p>}
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full transition-all duration-500 ${won ? 'bg-emerald-500' : 'bg-fuchsia-500'}`} style={{ width: `${model.rate}%` }} />
            </div>
          </div>

          {won && (
            <div className="animate-pop relative mt-4 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    background: ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'][i % 5],
                    animationDelay: `${(i % 7) * 0.12}s`,
                  }}
                />
              ))}
              <div className="text-4xl">🎉</div>
              <div className="mt-2 text-2xl font-black text-emerald-700">آزمایش موفق شد!</div>
              <p className="mt-1 text-sm text-slate-600">آفرین! شرایط مناسب فتوسنتز را پیدا کردی.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {MISSIONS.filter((m) => m.id !== mission.id).map((m) => (
                  <button key={m.id} onClick={() => onStart(m)} className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-fuchsia-700">
                    {m.title} ←
                  </button>
                ))}
                <button onClick={onExit} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-300">
                  پایان
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
