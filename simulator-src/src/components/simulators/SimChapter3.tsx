import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { Grid2X2, Apple, ShoppingBasket, CheckCircle } from 'lucide-react';

export const SimChapter3: React.FC = () => {
  // Area multiplication state
  // pairs: [num1, num2] -> [tens1, ones1, tens2, ones2]
  const mulPairs = [
    { n1: 14, n2: 12, t1: 10, o1: 4, t2: 10, o2: 2 },
    { n1: 15, n2: 13, t1: 10, o1: 5, t2: 10, o2: 3 },
    { n1: 21, n2: 14, t1: 20, o1: 1, t2: 10, o2: 4 },
    { n1: 12, n2: 11, t1: 10, o1: 2, t2: 10, o2: 1 }
  ];
  const [selectedPairIdx, setSelectedPairIdx] = useState<number>(0);

  // Division simulation state
  const [totalApples, setTotalApples] = useState<number>(23); // dividend
  const [numBaskets, setNumBaskets] = useState<number>(5);    // divisor

  const currentPair = mulPairs[selectedPairIdx];
  const p1 = currentPair.t1 * currentPair.t2;
  const p2 = currentPair.t1 * currentPair.o2;
  const p3 = currentPair.o1 * currentPair.t2;
  const p4 = currentPair.o1 * currentPair.o2;
  const totalAreaMul = p1 + p2 + p3 + p4;

  const quotient = Math.floor(totalApples / numBaskets);
  const remainder = totalApples % numBaskets;

  const handleApplesChange = (delta: number) => {
    let val = totalApples + delta;
    if (val < 5) val = 5;
    if (val > 45) val = 45;
    setTotalApples(val);
  };

  const handleBasketsChange = (delta: number) => {
    let val = numBaskets + delta;
    if (val < 2) val = 2;
    if (val > 8) val = 8;
    setNumBaskets(val);
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: AREA MULTIPLICATION MODEL */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-200">
            <Grid2X2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">جدول ضرب مساحتی (دو رقمی در دو رقمی)</h3>
            <p className="text-slate-500 text-sm md:text-base">برای ضرب دو عدد بزرگ، آن‌ها را به دهگان و یکان باز می‌کنیم و مساحت ۴ قسمت را جمع می‌کنیم!</p>
          </div>
        </div>

        {/* Pair selector buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {mulPairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPairIdx(idx)}
              className={`px-6 py-3 rounded-2xl font-bold text-base md:text-lg transition-all ${selectedPairIdx === idx ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {toFaDigit(pair.n1)} × {toFaDigit(pair.n2)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Visual Grid table */}
          <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200 overflow-x-auto">
            <div className="min-w-[320px]">
              {/* Header Row */}
              <div className="grid grid-cols-3 text-center mb-2 font-black text-lg text-amber-900">
                <div>×</div>
                <div className="bg-amber-200 py-1 rounded-xl">{toFaDigit(currentPair.t1)}</div>
                <div className="bg-amber-200 py-1 rounded-xl">{toFaDigit(currentPair.o1)}</div>
              </div>

              {/* Tens row */}
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div className="bg-amber-200 flex items-center justify-center font-black text-lg text-amber-900 rounded-xl py-4">
                  {toFaDigit(currentPair.t2)}
                </div>
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center shadow">
                  <span className="text-xs text-slate-400 font-bold mb-1">{toFaDigit(currentPair.t1)} × {toFaDigit(currentPair.t2)}</span>
                  <span className="text-3xl font-black text-slate-800">{toFaDigit(p1)}</span>
                </div>
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center shadow">
                  <span className="text-xs text-slate-400 font-bold mb-1">{toFaDigit(currentPair.o1)} × {toFaDigit(currentPair.t2)}</span>
                  <span className="text-3xl font-black text-slate-800">{toFaDigit(p3)}</span>
                </div>
              </div>

              {/* Ones row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-amber-200 flex items-center justify-center font-black text-lg text-amber-900 rounded-xl py-4">
                  {toFaDigit(currentPair.o2)}
                </div>
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center shadow">
                  <span className="text-xs text-slate-400 font-bold mb-1">{toFaDigit(currentPair.t1)} × {toFaDigit(currentPair.o2)}</span>
                  <span className="text-3xl font-black text-slate-800">{toFaDigit(p2)}</span>
                </div>
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center shadow">
                  <span className="text-xs text-slate-400 font-bold mb-1">{toFaDigit(currentPair.o1)} × {toFaDigit(currentPair.o2)}</span>
                  <span className="text-3xl font-black text-slate-800">{toFaDigit(p4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addition calculation breakdown */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
            <h4 className="text-xl font-bold text-slate-800">مراحل جمع مساحت‌ها:</h4>
            
            <div className="space-y-3 font-['Vazirmatn'] text-lg font-bold text-slate-700">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span>مساحت قسمت اول (دهگان در دهگان):</span>
                <span className="text-blue-600 font-black">{toFaDigit(p1)}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span>مساحت قسمت دوم:</span>
                <span className="text-blue-600 font-black">{toFaDigit(p3)}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span>مساحت قسمت سوم:</span>
                <span className="text-blue-600 font-black">{toFaDigit(p2)}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span>مساحت قسمت چهارم (یکان در یکان):</span>
                <span className="text-blue-600 font-black">{toFaDigit(p4)}</span>
              </div>
            </div>

            <div className="border-t-2 border-slate-300 pt-4 flex items-center justify-between text-2xl font-black text-slate-800">
              <span>مجموع کل (حاصل ضرب):</span>
              <span className="bg-emerald-500 text-white px-6 py-2 rounded-2xl shadow-lg shadow-emerald-200">
                {toFaDigit(totalAreaMul)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DIVISION WITH REMAINDER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-200">
            <ShoppingBasket className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">شبیه‌ساز تقسیم باقیمانده‌دار (سبدهای سیب)</h3>
            <p className="text-slate-500 text-sm md:text-base">سیب‌ها را در سبدها به طور مساوی تقسیم کن تا متوجه شوی چند سیب داخل هر سبد می‌افتد و چند سیب باقی می‌ماند.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-rose-800 block">کل سیب‌ها (مقسوم)</span>
              <span className="text-xs text-rose-600 font-medium block">تعداد سیب‌هایی که می‌خواهیم پخش کنیم</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow border border-rose-100">
              <button onClick={() => handleApplesChange(-1)} className="text-2xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
              <span className="text-3xl font-black text-slate-800 w-10 text-center">{toFaDigit(totalApples)}</span>
              <button onClick={() => handleApplesChange(1)} className="text-2xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
            </div>
          </div>

          <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-purple-800 block">تعداد سبدها (مقسوم علیه)</span>
              <span className="text-xs text-purple-600 font-medium block">تعداد گروه‌های مساوی</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow border border-purple-100">
              <button onClick={() => handleBasketsChange(-1)} className="text-2xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
              <span className="text-3xl font-black text-slate-800 w-10 text-center">{toFaDigit(numBaskets)}</span>
              <button onClick={() => handleBasketsChange(1)} className="text-2xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
            </div>
          </div>
        </div>

        {/* Baskets & Remainder visual */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mb-8">
          {/* Baskets grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: numBaskets }).map((_, i) => (
              <div key={i} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                <ShoppingBasket className="w-12 h-12 text-amber-600 mb-2" />
                <span className="text-xs font-bold text-slate-600 mb-2">سبد شماره {toFaDigit(i + 1)}</span>
                <div className="flex flex-wrap justify-center gap-1 min-h-[40px] bg-white w-full p-2 rounded-xl border border-amber-100 shadow-inner">
                  {Array.from({ length: quotient }).map((_, j) => (
                    <Apple key={j} className="w-5 h-5 text-rose-600 fill-rose-500 animate-pulse-soft" />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-800 mt-2">
                  {toFaDigit(quotient)} سیب
                </span>
              </div>
            ))}
          </div>

          {/* Remainder section */}
          <div className="bg-rose-50 border-2 border-dashed border-rose-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-lg font-bold text-rose-900 mb-1">باقیمانده (خارج سبد)</span>
            <p className="text-xs text-rose-700 mb-4">این سیب‌ها به تعداد کافی نبودند که به همه سبدها برسند!</p>
            
            <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-xl border border-rose-200 w-full min-h-[70px] shadow-inner items-center">
              {remainder === 0 ? (
                <span className="text-sm font-bold text-emerald-600">بدون باقیمانده (بخش‌پذیر)</span>
              ) : (
                Array.from({ length: remainder }).map((_, i) => (
                  <Apple key={i} className="w-7 h-7 text-amber-500 fill-amber-400 animate-wiggle" />
                ))
              )}
            </div>
            <span className="text-base font-black text-rose-800 mt-3">
              {toFaDigit(remainder)} سیب باقیمانده
            </span>
          </div>
        </div>

        {/* Division Equation */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-4">رابطه اصلی تقسیم:</h4>
          <div className="flex flex-wrap items-center justify-center gap-4 text-center font-['Vazirmatn'] text-lg md:text-xl font-black text-slate-800 bg-white p-4 rounded-2xl shadow border border-slate-200">
            <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-xl">
              <span className="text-xs block text-blue-600 font-bold mb-1">خارج قسمت</span>
              {toFaDigit(quotient)}
            </div>
            <span>×</span>
            <div className="bg-purple-100 text-purple-900 px-4 py-2 rounded-xl">
              <span className="text-xs block text-purple-600 font-bold mb-1">مقسوم علیه</span>
              {toFaDigit(numBaskets)}
            </div>
            <span>+</span>
            <div className="bg-rose-100 text-rose-900 px-4 py-2 rounded-xl">
              <span className="text-xs block text-rose-600 font-bold mb-1">باقیمانده</span>
              {toFaDigit(remainder)}
            </div>
            <span>=</span>
            <div className="bg-emerald-500 text-white px-6 py-2 rounded-xl shadow-md shadow-emerald-200">
              <span className="text-xs block text-emerald-100 font-bold mb-1">مقسوم (کل)</span>
              {toFaDigit(totalApples)}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>نکته مهم: باقیمانده ({toFaDigit(remainder)}) همیشه باید کوچک‌تر از مقسوم علیه ({toFaDigit(numBaskets)}) باشد!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
