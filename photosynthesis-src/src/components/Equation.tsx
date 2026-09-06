import { useState } from 'react';

interface Term {
  id: string;
  text: string;
  color: string;
  title: string;
  desc: string;
}

const TERMS: Term[] = [
  {
    id: 'co2',
    text: '6CO₂',
    color: 'bg-slate-700 text-white',
    title: 'دی‌اکسید کربن (CO₂)',
    desc: 'دی‌اکسید کربن از هوا و از طریق روزنه‌های برگ وارد برگ می‌شود. کربن موجود در آن، اسکلت اصلی مولکول گلوکز را می‌سازد.',
  },
  {
    id: 'h2o',
    text: '6H₂O',
    color: 'bg-sky-500 text-white',
    title: 'آب (H₂O)',
    desc: 'آب توسط ریشه از خاک جذب و از راه آوندهای چوبی ساقه به برگ منتقل می‌شود. در واکنش‌های نوری، آب تجزیه شده و اکسیژن آزاد می‌کند.',
  },
  {
    id: 'light',
    text: 'انرژی نور',
    color: 'bg-amber-400 text-slate-900',
    title: 'انرژی نور (Light Energy)',
    desc: 'کلروفیل موجود در کلروپلاست، انرژی نور خورشید را جذب می‌کند. این انرژی برای تبدیل مواد اولیه به گلوکز لازم است. بدون نور، فتوسنتز متوقف می‌شود.',
  },
  {
    id: 'glucose',
    text: 'C₆H₁₂O₆',
    color: 'bg-orange-500 text-white',
    title: 'گلوکز (Glucose)',
    desc: 'گلوکز قند ساده‌ای است که انرژی شیمیایی را ذخیره می‌کند. گیاه از آن برای رشد، تنفس و ساختن نشاسته و سلولز استفاده می‌کند.',
  },
  {
    id: 'o2',
    text: '6O₂',
    color: 'bg-cyan-500 text-white',
    title: 'اکسیژن (O₂)',
    desc: 'اکسیژن به‌عنوان یکی از محصولات فتوسنتز آزاد می‌شود و از راه روزنه‌ها به هوا می‌رود. همان اکسیژنی که ما تنفس می‌کنیم!',
  },
  {
    id: 'chloroplast',
    text: 'کلروپلاست',
    color: 'bg-emerald-600 text-white',
    title: 'کلروپلاست (Chloroplast)',
    desc: 'اندامکی سبز درون سلول‌های برگ که فتوسنتز در آن انجام می‌شود. رنگ سبز آن به‌خاطر رنگ‌دانه‌ی کلروفیل است.',
  },
];

export default function Equation() {
  const [active, setActive] = useState<Term | null>(null);
  const t = (id: string) => TERMS.find((x) => x.id === id)!;
  const Btn = ({ term }: { term: Term }) => (
    <button
      onClick={() => setActive(active?.id === term.id ? null : term)}
      className={`rounded-xl px-4 py-2 text-xl font-black shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${term.color} ${active?.id === term.id ? 'ring-4 ring-emerald-300 scale-105' : ''}`}
      dir="ltr"
    >
      {term.text}
    </button>
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-l from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
      <h3 className="mb-1 text-lg font-black text-slate-800">🧪 معادله‌ی فتوسنتز (Photosynthesis Equation)</h3>
      <p className="mb-4 text-xs text-slate-500">روی هر بخش از معادله کلیک کنید تا توضیح آن را ببینید.</p>
      <div className="flex flex-wrap items-center justify-center gap-3" dir="ltr">
        <Btn term={t('co2')} />
        <span className="text-2xl font-black text-slate-400">+</span>
        <Btn term={t('h2o')} />
        <span className="text-2xl font-black text-slate-400">+</span>
        <Btn term={t('light')} />
        <span className="mx-2 flex flex-col items-center text-slate-500">
          <span className="text-[10px] font-semibold">در</span>
          <span className="text-3xl font-black leading-none text-emerald-600">→</span>
          <button onClick={() => setActive(active?.id === 'chloroplast' ? null : t('chloroplast'))} className="text-[11px] font-bold text-emerald-700 underline decoration-dotted">
            کلروپلاست
          </button>
        </span>
        <Btn term={t('glucose')} />
        <span className="text-2xl font-black text-slate-400">+</span>
        <Btn term={t('o2')} />
      </div>
      {active && (
        <div key={active.id} className="fade-up mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <div className="mb-1 font-black text-emerald-700">{active.title}</div>
          <p className="text-sm leading-7 text-slate-700">{active.desc}</p>
        </div>
      )}
    </div>
  );
}
