import { useState } from 'react';
import type { Params } from '../lib/model';

export interface Experiment {
  id: number;
  title: string;
  icon: string;
  preset: Partial<Params>;
  question: string;
  answer: string;
  color: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    title: 'آزمایش ۱ — نور کم',
    icon: '🌙',
    preset: { light: 10, co2: 60, water: 70, temp: 25 },
    question: 'چه اتفاقی برای فتوسنتز می‌افتد؟',
    answer:
      'نرخ فتوسنتز به‌شدت کاهش می‌یابد. نور، انرژی لازم برای واکنش‌های نوری را تأمین می‌کند؛ بدون انرژی کافی، حتی با وجود CO₂ و آب فراوان، گلوکز ساخته نمی‌شود. به تعداد کم اشعه‌های نور و خروج کم O₂ توجه کنید.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 2,
    title: 'آزمایش ۲ — CO₂ کم',
    icon: '💨',
    preset: { light: 60, co2: 10, water: 70, temp: 25 },
    question: 'آیا با افزایش نور می‌توانیم فتوسنتز را نامحدود افزایش دهیم؟',
    answer:
      'خیر! حالا نور را تا ۱۰۰٪ بالا ببرید: نرخ فتوسنتز تقریباً تغییری نمی‌کند، چون CO₂ عامل محدودکننده است. این همان «قانون عامل محدودکننده» است: افزایش یک عامل فقط تا جایی مؤثر است که عامل دیگری محدودکننده نشود.',
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 3,
    title: 'آزمایش ۳ — کمبود آب',
    icon: '🏜️',
    preset: { light: 90, co2: 90, water: 10, temp: 25 },
    question: 'با وجود نور و CO₂ فراوان، چرا فتوسنتز پایین است؟',
    answer:
      'آب عامل محدودکننده است. در کم‌آبی، گیاه برای جلوگیری از هدررفت آب (تعرق - Transpiration) روزنه‌های خود را می‌بندد؛ در نتیجه CO₂ هم کمتر وارد برگ می‌شود و فتوسنتز افت می‌کند. به پژمرده شدن برگ‌ها دقت کنید.',
    color: 'from-sky-500 to-cyan-600',
  },
  {
    id: 4,
    title: 'آزمایش ۴ — دمای نامناسب',
    icon: '🔥',
    preset: { light: 80, co2: 80, water: 80, temp: 42 },
    question: 'اثر دمای بالا روی فعالیت فتوسنتزی چیست؟',
    answer:
      'فتوسنتز توسط آنزیم‌ها انجام می‌شود. در دمای خیلی بالا (بالای ۴۰ درجه) ساختار آنزیم‌ها آسیب می‌بیند و واکنش‌ها متوقف می‌شوند. حالا دما را به ۸ درجه برسانید: در سرما هم آنزیم‌ها کند کار می‌کنند. بهترین محدوده حدود ۲۰ تا ۳۰ درجه است.',
    color: 'from-orange-500 to-rose-600',
  },
];

interface Props {
  onApply: (preset: Partial<Params>) => void;
  activeId: number | null;
  setActiveId: (id: number | null) => void;
}

export default function Experiments({ onApply, activeId, setActiveId }: Props) {
  const [revealed, setRevealed] = useState<number | null>(null);
  const active = EXPERIMENTS.find((e) => e.id === activeId) ?? null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-lg font-black text-slate-800">🔬 آزمایش کن!</h3>
      <p className="mb-4 text-xs text-slate-500">با کلیک روی هر آزمایش، شرایط شبیه‌ساز به‌صورت خودکار تنظیم می‌شود. سپس تغییرات را در گیاه، اعداد و نمودار ببینید.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EXPERIMENTS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => {
              onApply(ex.preset);
              setActiveId(ex.id);
              setRevealed(null);
            }}
            className={`rounded-2xl bg-gradient-to-br p-4 text-right text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 ${ex.color} ${activeId === ex.id ? 'ring-4 ring-emerald-300' : ''}`}
          >
            <div className="text-3xl">{ex.icon}</div>
            <div className="mt-1 font-black">{ex.title}</div>
            <div className="mt-1 text-[11px] opacity-90">
              {Object.entries(ex.preset)
                .map(([k, v]) => `${k === 'light' ? 'نور' : k === 'co2' ? 'CO₂' : k === 'water' ? 'آب' : 'دما'}: ${v}${k === 'temp' ? '°C' : '%'}`)
                .join(' • ')}
            </div>
          </button>
        ))}
      </div>
      {active && (
        <div key={active.id} className="fade-up mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-base font-black text-slate-800">❓ {active.question}</div>
            <button onClick={() => setRevealed(revealed === active.id ? null : active.id)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700">
              {revealed === active.id ? 'پنهان کردن پاسخ' : '💡 نمایش توضیح'}
            </button>
          </div>
          {revealed === active.id && <p className="fade-up mt-3 text-sm leading-7 text-slate-700">{active.answer}</p>}
        </div>
      )}
    </div>
  );
}
