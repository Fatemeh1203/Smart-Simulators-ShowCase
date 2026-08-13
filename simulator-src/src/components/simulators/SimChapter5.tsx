import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { Layers, Inspect, CheckCircle, Plus } from 'lucide-react';

export const SimChapter5: React.FC = () => {
  // Mixed Number state
  const [wholeNum, setWholeNum] = useState<number>(2);
  const [mixNum, setMixNum] = useState<number>(1);
  const [mixDen] = useState<number>(3); // Keep fixed denominator for clear visual plates

  // Decimal state (hundredths)
  const [hundredths, setHundredths] = useState<number>(38); // 0.38

  const improperNum = wholeNum * mixDen + mixNum;

  const tensPart = Math.floor(hundredths / 10);
  const onesPart = hundredths % 10;

  const handleWholeChange = (delta: number) => {
    let val = wholeNum + delta;
    if (val < 1) val = 1;
    if (val > 4) val = 4;
    setWholeNum(val);
  };

  const handleMixNumChange = (delta: number) => {
    let val = mixNum + delta;
    if (val < 1) val = 1;
    if (val >= mixDen) val = mixDen - 1;
    setMixNum(val);
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: MIXED NUMBERS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-md shadow-purple-200">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">شبیه‌ساز عدد مخلوط و تبدیل به کسر</h3>
            <p className="text-slate-500 text-sm md:text-base">تعداد بشقاب‌های کامل (صحیح) و قسمت‌های بشقاب آخر را تنظیم کن تا کسر بزرگ‌تر از واحد ساخته شود.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Controls & Mixed Display */}
          <div className="bg-purple-50/60 p-6 rounded-3xl border border-purple-200 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-around">
              {/* Whole number control */}
              <div className="text-center">
                <span className="text-sm font-bold text-purple-900 block mb-2">عدد صحیح (بشقاب کامل)</span>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow border border-purple-100">
                  <button onClick={() => handleWholeChange(-1)} className="text-xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
                  <span className="text-3xl font-black text-slate-800 w-8">{toFaDigit(wholeNum)}</span>
                  <button onClick={() => handleWholeChange(1)} className="text-xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
                </div>
              </div>

              {/* Mixed Number Visual */}
              <div className="flex items-center gap-2 font-black text-4xl text-purple-950 bg-white p-4 rounded-2xl shadow border border-purple-100">
                <span>{toFaDigit(wholeNum)}</span>
                <div className="flex flex-col items-center text-2xl">
                  <span>{toFaDigit(mixNum)}</span>
                  <div className="w-8 h-1 bg-purple-950 my-1"></div>
                  <span>{toFaDigit(mixDen)}</span>
                </div>
              </div>

              {/* Fraction part control */}
              <div className="text-center">
                <span className="text-sm font-bold text-purple-900 block mb-2">صورت کسر مخلوط</span>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow border border-purple-100">
                  <button onClick={() => handleMixNumChange(-1)} className="text-xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
                  <span className="text-3xl font-black text-slate-800 w-8">{toFaDigit(mixNum)}</span>
                  <button onClick={() => handleMixNumChange(1)} className="text-xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
                </div>
              </div>
            </div>

            {/* Improper Fraction Result */}
            <div className="bg-white p-5 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-700 block">کسر بزرگ‌تر از واحد:</span>
                <span className="text-xs text-slate-500 block"> (صحیح × مخرج) + صورت = صورت جدید</span>
              </div>
              <div className="flex flex-col items-center justify-center font-black text-2xl text-white bg-emerald-500 px-6 py-2 rounded-2xl shadow-lg shadow-emerald-200">
                <span>{toFaDigit(improperNum)}</span>
                <div className="w-8 h-1 bg-white my-1"></div>
                <span>{toFaDigit(mixDen)}</span>
              </div>
            </div>
          </div>

          {/* Visual Plates (Circles) */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-slate-600 mb-4 block">نمایش تصویری بشقاب‌ها (تقسیم شده به {toFaDigit(mixDen)} قسمت)</span>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Full plates */}
              {Array.from({ length: wholeNum }).map((_, i) => (
                <div key={i} className="relative flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#a855f7" stroke="#6b21a8" strokeWidth="4" />
                    {/* Slices lines for 3 parts */}
                    <line x1="50" y1="50" x2="50" y2="5" stroke="#6b21a8" strokeWidth="2" />
                    <line x1="50" y1="50" x2="89" y2="72.5" stroke="#6b21a8" strokeWidth="2" />
                    <line x1="50" y1="50" x2="11" y2="72.5" stroke="#6b21a8" strokeWidth="2" />
                  </svg>
                  <span className="absolute text-white font-bold text-xs bg-purple-900/60 px-2 py-0.5 rounded-full">کامل</span>
                </div>
              ))}

              <Plus className="w-6 h-6 text-slate-400" />

              {/* Partial plate */}
              <div className="relative flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-md">
                  <circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="4" />
                  {/* 1 slice filled */}
                  <path d="M 50 50 L 50 5 A 45 45 0 0 1 89 72.5 Z" fill="#a855f7" stroke="#6b21a8" strokeWidth="2" />
                  <line x1="50" y1="50" x2="50" y2="5" stroke="#6b21a8" strokeWidth="2" />
                  <line x1="50" y1="50" x2="89" y2="72.5" stroke="#6b21a8" strokeWidth="2" />
                  <line x1="50" y1="50" x2="11" y2="72.5" stroke="#6b21a8" strokeWidth="2" />
                </svg>
                <span className="absolute text-purple-950 font-bold text-xs bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">{toFaDigit(mixNum)}/{toFaDigit(mixDen)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DECIMALS (TENTHS & HUNDREDTHS) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-200">
            <Inspect className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">آزمایشگاه اعشاری (دهم و صدم)</h3>
            <p className="text-slate-500 text-sm md:text-base">نوار لغزنده را تکان بده تا متوجه شوی صدم‌ها چطور با ممیز اعشاری (/) نمایش داده می‌شوند.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Controls & Place value table */}
          <div className="bg-blue-50/70 p-6 rounded-3xl border border-blue-200 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-sm font-bold text-blue-900 block mb-2">تعداد خانه‌های رنگی جدول (از ۱۰۰ قسمت):</span>
              <input
                type="range"
                min="1"
                max="99"
                value={hundredths}
                onChange={(e) => setHundredths(parseInt(e.target.value))}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                <span>۱ صدم (۰/۰۱)</span>
                <span>۵۰ صدم (۰/۵۰)</span>
                <span>۹۹ صدم (۰/۹۹)</span>
              </div>
            </div>

            {/* Main Decimal Display */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow flex items-center justify-around text-center">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">کسر معمولی</span>
                <div className="flex flex-col items-center justify-center font-black text-2xl text-blue-900">
                  <span>{toFaDigit(hundredths)}</span>
                  <div className="w-12 h-1 bg-blue-900 my-1"></div>
                  <span>۱۰۰</span>
                </div>
              </div>

              <div className="text-3xl font-black text-slate-400">=</div>

              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">عدد اعشاری (با ممیز)</span>
                <span className="text-4xl font-black text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-200 inline-block font-['Vazirmatn']">
                  ۰/{toFaDigit(hundredths < 10 ? '0' + hundredths : hundredths)}
                </span>
              </div>
            </div>

            {/* Place value table for decimals */}
            <div className="border-2 border-blue-300 rounded-2xl overflow-hidden shadow-inner bg-white">
              <div className="bg-blue-600 text-white font-bold text-center py-2 text-sm">
                جدول ارزش مکانی اعشاری
              </div>
              <div className="grid grid-cols-3 text-center text-xs md:text-sm font-bold bg-blue-50 py-1.5 border-b border-blue-200 text-slate-700">
                <div className="border-l border-blue-200">یکان</div>
                <div className="border-l border-blue-200">دهم</div>
                <div>صدم</div>
              </div>
              <div className="grid grid-cols-3 text-center py-3 text-2xl font-black text-slate-800 font-['Vazirmatn']">
                <div className="border-l border-slate-100 text-slate-400">۰</div>
                <div className="border-l border-slate-100 text-blue-600">{toFaDigit(tensPart)}</div>
                <div className="text-amber-600">{toFaDigit(onesPart)}</div>
              </div>
            </div>
          </div>

          {/* 10x10 Grid */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-500 mb-4 block">جدول ۱۰۰ تایی (هر ردیف ۱۰ تایی = یک دهم)</span>
            
            <div className="grid grid-cols-10 gap-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-[260px] h-[260px] md:w-[300px] md:h-[300px]">
              {Array.from({ length: 100 }).map((_, idx) => {
                const isSelected = idx < hundredths;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setHundredths(idx + 1)}
                    className={`rounded-sm cursor-pointer transition-all duration-150 ${isSelected ? 'bg-blue-500 shadow-sm' : 'bg-slate-100 hover:bg-slate-200'}`}
                  ></div>
                );
              })}
            </div>
            <span className="text-xs text-slate-400 mt-4 font-semibold">روی خانه‌ها کلیک کن تا مقدار اعشار تغییر کند!</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800 font-medium">
            نکته طلایی اعشار: رقم اول بعد از ممیز «دهم» (بسته‌های ۱۰تایی) و رقم دوم «صدم» (دانه‌های تکی) است.
          </p>
        </div>
      </div>
    </div>
  );
};
