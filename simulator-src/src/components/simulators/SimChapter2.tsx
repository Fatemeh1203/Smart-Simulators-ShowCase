import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { PieChart, Plus, ArrowLeft, CheckCircle2, Equal } from 'lucide-react';

export const SimChapter2: React.FC = () => {
  // Pizza simulator state
  const [pizzaTotal, setPizzaTotal] = useState<number>(8); // denominator
  const [pizzaEaten, setPizzaEaten] = useState<number>(3); // numerator

  // Equivalent fraction state
  const [baseNum] = useState<number>(2);
  const [baseDen] = useState<number>(3);
  const [multiplier, setMultiplier] = useState<number>(2);

  // Addition lab state
  const [addNum1, setAddNum1] = useState<number>(2);
  const [addNum2, setAddNum2] = useState<number>(1);
  const [addDen] = useState<number>(5); // Fixed denominator for grade 4 addition practice

  const handlePizzaTotalChange = (val: number) => {
    if (val < 2) val = 2;
    if (val > 12) val = 12;
    setPizzaTotal(val);
    if (pizzaEaten > val) setPizzaEaten(val);
  };

  const handlePizzaEatenChange = (val: number) => {
    if (val < 0) val = 0;
    if (val > pizzaTotal) val = pizzaTotal;
    setPizzaEaten(val);
  };

  // SVG pie slice calculator
  const getSlicePath = (index: number, total: number) => {
    const angle = 360 / total;
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;
    
    // Convert to radians
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 100 + 90 * Math.cos(startRad);
    const y1 = 100 + 90 * Math.sin(startRad);
    const x2 = 100 + 90 * Math.cos(endRad);
    const y2 = 100 + 90 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;

    return `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: PIZZA / FRACTION BUILDER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-200">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">آزمایشگاه کسر و برش‌های پیتزا</h3>
            <p className="text-slate-500 text-sm md:text-base">تعداد قسمت‌های پیتزا (مخرج) و تعداد قسمت‌های انتخاب شده (صورت) را تنظیم کن تا کسر ساخته شود!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Controls & Fraction display */}
          <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-around">
              {/* Numerator control */}
              <div className="text-center">
                <span className="text-sm font-bold text-emerald-800 block mb-2">صورت کسر (انتخاب شده)</span>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow border border-emerald-100">
                  <button onClick={() => handlePizzaEatenChange(pizzaEaten - 1)} className="text-2xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
                  <span className="text-4xl font-black text-slate-800 w-10">{toFaDigit(pizzaEaten)}</span>
                  <button onClick={() => handlePizzaEatenChange(pizzaEaten + 1)} className="text-2xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
                </div>
              </div>

              {/* Fraction visual fraction */}
              <div className="flex flex-col items-center justify-center font-black text-5xl text-emerald-900 mx-4">
                <span className="mb-1">{toFaDigit(pizzaEaten)}</span>
                <div className="w-16 h-1.5 bg-emerald-800 rounded-full my-1"></div>
                <span className="mt-1">{toFaDigit(pizzaTotal)}</span>
              </div>

              {/* Denominator control */}
              <div className="text-center">
                <span className="text-sm font-bold text-emerald-800 block mb-2">مخرج کسر (کل قسمت‌ها)</span>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow border border-emerald-100">
                  <button onClick={() => handlePizzaTotalChange(pizzaTotal - 1)} className="text-2xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-xl">-</button>
                  <span className="text-4xl font-black text-slate-800 w-10">{toFaDigit(pizzaTotal)}</span>
                  <button onClick={() => handlePizzaTotalChange(pizzaTotal + 1)} className="text-2xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-xl">+</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-slate-700 font-bold text-sm md:text-base">
              <span>توضیح کسر:</span>
              <span className="text-emerald-700 bg-emerald-100 px-4 py-1 rounded-xl">
                {toFaDigit(pizzaEaten)} قسمت از {toFaDigit(pizzaTotal)} قسمت مساوی
              </span>
            </div>
          </div>

          {/* Pizza SVG Graphics */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <svg width="240" height="240" viewBox="0 0 200 200" className="drop-shadow-lg">
              <circle cx="100" cy="100" r="95" fill="#fef3c7" stroke="#d97706" strokeWidth="6" />
              {Array.from({ length: pizzaTotal }).map((_, i) => {
                const isSelected = i < pizzaEaten;
                return (
                  <path
                    key={i}
                    d={getSlicePath(i, pizzaTotal)}
                    fill={isSelected ? '#f59e0b' : '#fef3c7'}
                    stroke="#b45309"
                    strokeWidth="3"
                    className="transition-colors duration-300 cursor-pointer hover:opacity-90"
                    onClick={() => {
                      if (isSelected) handlePizzaEatenChange(pizzaEaten - 1);
                      else handlePizzaEatenChange(pizzaEaten + 1);
                    }}
                  />
                );
              })}
              {/* Add pepperoni dots for selected slices to look like delicious pizza */}
              {Array.from({ length: pizzaTotal }).map((_, i) => {
                const isSelected = i < pizzaEaten;
                if (!isSelected) return null;
                const angle = (i + 0.5) * (360 / pizzaTotal);
                const rad = (angle - 90) * Math.PI / 180;
                const cx = 100 + 55 * Math.cos(rad);
                const cy = 100 + 55 * Math.sin(rad);
                return (
                  <circle key={`pep-${i}`} cx={cx} cy={cy} r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                );
              })}
            </svg>
            <span className="text-xs text-slate-400 mt-4 font-semibold">روی قاچ‌های پیتزا کلیک کن تا کم و زیاد بشن!</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: EQUIVALENT FRACTIONS & ADDITION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EQUIVALENT FRACTIONS */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-200">
                <Equal className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">ماشین کسرهای مساوی</h3>
                <p className="text-slate-500 text-sm">صورت و مخرج را در یک عدد ضرب کن تا کسر مساوی بسازی.</p>
              </div>
            </div>

            {/* Multiplier buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[2, 3, 4].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setMultiplier(mult)}
                  className={`py-3 rounded-2xl font-black text-base transition-all ${multiplier === mult ? 'bg-teal-500 text-white shadow-lg shadow-teal-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  ضرب در {toFaDigit(mult)} (×{toFaDigit(mult)})
                </button>
              ))}
            </div>

            {/* Visualization */}
            <div className="bg-teal-50/60 p-6 rounded-3xl border border-teal-200 flex items-center justify-around mb-6">
              {/* Original Fraction */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-teal-800 mb-2">کسر اولیه</span>
                <div className="flex flex-col items-center justify-center font-black text-4xl text-slate-800 bg-white p-4 rounded-2xl shadow border border-teal-100 w-20">
                  <span>{toFaDigit(baseNum)}</span>
                  <div className="w-12 h-1 bg-slate-800 my-2"></div>
                  <span>{toFaDigit(baseDen)}</span>
                </div>
              </div>

              {/* Arrow and operation */}
              <div className="flex flex-col items-center text-teal-600 font-bold">
                <span className="text-sm bg-teal-100 px-3 py-1 rounded-full mb-1">× {toFaDigit(multiplier)}</span>
                <ArrowLeft className="w-8 h-8" />
              </div>

              {/* Equivalent Fraction */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-teal-800 mb-2">کسر مساوی</span>
                <div className="flex flex-col items-center justify-center font-black text-4xl text-teal-900 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 w-20">
                  <span>{toFaDigit(baseNum * multiplier)}</span>
                  <div className="w-12 h-1 bg-white my-2"></div>
                  <span>{toFaDigit(baseDen * multiplier)}</span>
                </div>
              </div>
            </div>

            {/* Visual Bars */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>کسر {toFaDigit(baseNum)}/{toFaDigit(baseDen)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-8 bg-slate-100 rounded-xl overflow-hidden p-1 border border-slate-200">
                  {Array.from({ length: baseDen }).map((_, i) => (
                    <div key={i} className={`rounded-lg ${i < baseNum ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>کسر {toFaDigit(baseNum * multiplier)}/{toFaDigit(baseDen * multiplier)} (همان مقدار!)</span>
                </div>
                <div className="grid gap-1 h-8 bg-slate-100 rounded-xl overflow-hidden p-1 border border-slate-200" style={{ gridTemplateColumns: `repeat(${baseDen * multiplier}, minmax(0, 1fr))` }}>
                  {Array.from({ length: baseDen * multiplier }).map((_, i) => (
                    <div key={i} className={`rounded-lg ${i < baseNum * multiplier ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FRACTION ADDITION LAB */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-200">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">آزمایشگاه جمع کسرها</h3>
                <p className="text-slate-500 text-sm">وقتی مخرج‌ها مساوی است، فقط صورت‌ها را با هم جمع می‌کنیم!</p>
              </div>
            </div>

            {/* Addition display */}
            <div className="bg-blue-50/60 p-6 rounded-3xl border border-blue-200 flex items-center justify-around mb-6">
              {/* Fraction 1 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  <button onClick={() => addNum1 > 0 && setAddNum1(addNum1 - 1)} className="bg-white px-2 py-0.5 text-xs font-bold text-rose-500 rounded shadow">-</button>
                  <span className="text-xs font-bold text-blue-800">کسر اول</span>
                  <button onClick={() => (addNum1 + addNum2 < addDen) && setAddNum1(addNum1 + 1)} className="bg-white px-2 py-0.5 text-xs font-bold text-emerald-600 rounded shadow">+</button>
                </div>
                <div className="flex flex-col items-center justify-center font-black text-3xl text-blue-700 bg-white p-3 rounded-2xl shadow border border-blue-100 w-16">
                  <span>{toFaDigit(addNum1)}</span>
                  <div className="w-10 h-1 bg-blue-700 my-1.5"></div>
                  <span>{toFaDigit(addDen)}</span>
                </div>
              </div>

              <span className="text-4xl font-black text-blue-600">+</span>

              {/* Fraction 2 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  <button onClick={() => addNum2 > 0 && setAddNum2(addNum2 - 1)} className="bg-white px-2 py-0.5 text-xs font-bold text-rose-500 rounded shadow">-</button>
                  <span className="text-xs font-bold text-blue-800">کسر دوم</span>
                  <button onClick={() => (addNum1 + addNum2 < addDen) && setAddNum2(addNum2 + 1)} className="bg-white px-2 py-0.5 text-xs font-bold text-emerald-600 rounded shadow">+</button>
                </div>
                <div className="flex flex-col items-center justify-center font-black text-3xl text-amber-600 bg-white p-3 rounded-2xl shadow border border-amber-100 w-16">
                  <span>{toFaDigit(addNum2)}</span>
                  <div className="w-10 h-1 bg-amber-600 my-1.5"></div>
                  <span>{toFaDigit(addDen)}</span>
                </div>
              </div>

              <span className="text-4xl font-black text-blue-600">=</span>

              {/* Result Fraction */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-emerald-800 mb-2">حاصل جمع</span>
                <div className="flex flex-col items-center justify-center font-black text-3xl text-white bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200 w-16">
                  <span>{toFaDigit(addNum1 + addNum2)}</span>
                  <div className="w-10 h-1 bg-white my-1.5"></div>
                  <span>{toFaDigit(addDen)}</span>
                </div>
              </div>
            </div>

            {/* Visual Combined Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-3">
                <span>نمایش تصویری روی محور ۵ قسمتی:</span>
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">{toFaDigit(addNum1 + addNum2)} از {toFaDigit(addDen)} پر شده</span>
              </div>
              <div className="grid grid-cols-5 gap-2 h-12 bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
                {Array.from({ length: addDen }).map((_, i) => {
                  let bgClass = "bg-slate-200";
                  if (i < addNum1) bgClass = "bg-blue-500 animate-pulse-soft";
                  else if (i < addNum1 + addNum2) bgClass = "bg-amber-500 animate-pulse-soft";
                  return <div key={i} className={`rounded-xl ${bgClass} flex items-center justify-center text-white font-bold text-xs`}>{toFaDigit(i + 1)}</div>;
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div>کسر اول ({toFaDigit(addNum1)})</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div>کسر دوم ({toFaDigit(addNum2)})</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">
              نکته طلایی: در جمع و تفریق کسرها، مخرج (اندازه قطعه‌ها) دست نمی‌خورد و فقط صورت‌ها (تعداد قطعه‌ها) جمع می‌شوند!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
