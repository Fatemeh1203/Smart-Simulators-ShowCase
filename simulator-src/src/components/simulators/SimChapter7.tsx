import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { BarChart3, HelpCircle, RefreshCw, CheckCircle } from 'lucide-react';

export const SimChapter7: React.FC = () => {
  // Spinner state
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [redCount, setRedCount] = useState<number>(0);
  const [blueCount, setBlueCount] = useState<number>(0);

  // Bar chart creator state (sports survey)
  const [sports, setSports] = useState([
    { name: 'فوتبال', count: 8, color: 'bg-blue-500' },
    { name: 'شنا', count: 5, color: 'bg-teal-500' },
    { name: 'والیبال', count: 6, color: 'bg-amber-500' },
    { name: 'بسکتبال', count: 3, color: 'bg-rose-500' },
  ]);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);

    // Random spin angle between 1080 and 2160 degrees
    const randomAngle = Math.floor(Math.random() * 1080) + 1080;
    const finalRotation = rotation + randomAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Determine result based on final angle % 360
      // Wheel has 4 quadrants: 3 Red, 1 Blue.
      // Let's say 0-270 is Red, 270-360 is Blue
      const normalized = finalRotation % 360;
      if (normalized >= 270) {
        setSpinResult('آبی');
        setBlueCount((prev) => prev + 1);
      } else {
        setSpinResult('قرمز');
        setRedCount((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleSportChange = (index: number, delta: number) => {
    const next = [...sports];
    let val = next[index].count + delta;
    if (val < 0) val = 0;
    if (val > 12) val = 12;
    next[index].count = val;
    setSports(next);
  };

  const totalSpins = redCount + blueCount;

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: PROBABILITY SPINNER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-teal-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-200">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">چرخنده شانس و بررسی احتمال</h3>
            <p className="text-slate-500 text-sm md:text-base">چرخنده ۳ قسمت قرمز و ۱ قسمت آبی دارد. دکمه چرخش را بزن و ثبت نتایج را در جدول ببین!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Spinner Graphics */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
            <div className="relative flex items-center justify-center my-4">
              {/* Pointer Triangle */}
              <div className="absolute -top-4 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-slate-800 drop-shadow"></div>
              
              {/* Wheel SVG */}
              <div 
                className="transition-transform duration-1500 ease-out drop-shadow-xl"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg width="240" height="240" viewBox="0 0 200 200">
                  {/* 3 Red Slices (270 degrees) */}
                  <path d="M 100 100 L 100 5 A 95 95 0 1 1 5 100 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                  {/* 1 Blue Slice (90 degrees top left) */}
                  <path d="M 100 100 L 5 100 A 95 95 0 0 1 100 5 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
                  
                  {/* Center hub */}
                  <circle cx="100" cy="100" r="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
                  <circle cx="100" cy="100" r="6" fill="#334155" />
                </svg>
              </div>
            </div>

            <button
              disabled={isSpinning}
              onClick={spinWheel}
              className={`mt-4 px-10 py-4 rounded-2xl font-black text-xl text-white shadow-lg transition-all ${isSpinning ? 'bg-slate-400 cursor-not-allowed' : 'btn-3d-green shadow-emerald-200'}`}
            >
              {isSpinning ? 'در حال چرخش...' : 'بچرخان! (شروع بازی)'}
            </button>

            {spinResult && (
              <div className="mt-4 bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm font-bold text-slate-800 animate-bounce">
                نتیجه چرخش: <span className={spinResult === 'قرمز' ? 'text-rose-600' : 'text-blue-600'}>{spinResult}</span>
              </div>
            )}
          </div>

          {/* Probability Analysis & Data Table */}
          <div className="bg-teal-50/60 p-6 rounded-3xl border border-teal-200 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-base font-bold text-teal-900 block mb-3">آمار ثبت شده از چرخش‌ها:</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm text-center">
                  <div className="w-4 h-4 bg-rose-500 rounded-full mx-auto mb-1"></div>
                  <span className="text-xs font-bold text-slate-500 block">تعداد افتادن روی قرمز</span>
                  <span className="text-4xl font-black text-rose-600 font-['Vazirmatn']">{toFaDigit(redCount)}</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
                  <span className="text-xs font-bold text-slate-500 block">تعداد افتادن روی آبی</span>
                  <span className="text-4xl font-black text-blue-600 font-['Vazirmatn']">{toFaDigit(blueCount)}</span>
                </div>
              </div>
            </div>

            {/* Live comparative bar */}
            {totalSpins > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-teal-100">
                <span className="text-xs font-bold text-slate-600 block mb-2">مقایسه نتایج واقعی (مجموع {toFaDigit(totalSpins)} بار چرخش):</span>
                <div className="w-full h-6 bg-slate-100 rounded-xl overflow-hidden flex">
                  <div style={{ width: `${(redCount / totalSpins) * 100}%` }} className="bg-rose-500 h-full transition-all duration-300"></div>
                  <div style={{ width: `${(blueCount / totalSpins) * 100}%` }} className="bg-blue-500 h-full transition-all duration-300"></div>
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-teal-100 flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1">بررسی شانس (نظری):</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  چون قسمت‌های قرمز ۳ برابر آبی هستند، شانس ایستادن روی قرمز ۳ از ۴ (بیشتر) و شانس آبی ۱ از ۴ (کمتر) است.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BAR CHART CREATOR */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-200">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">کارگاه رسم نمودار ستونی (سرشماری ورزش‌ها)</h3>
            <p className="text-slate-500 text-sm md:text-base">تعداد علاقه‌مندان به هر ورزش را تغییر بده و نحوه رشد ستون‌ها را در نمودار مشاهده کن.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-3 lg:col-span-1">
            {sports.map((sp, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">{sp.name}</span>
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => handleSportChange(idx, -1)} className="text-xl font-bold text-rose-500 hover:bg-rose-50 px-2 rounded-lg">-</button>
                  <span className="text-2xl font-black text-slate-800 w-6 text-center">{toFaDigit(sp.count)}</span>
                  <button onClick={() => handleSportChange(idx, 1)} className="text-xl font-bold text-emerald-600 hover:bg-emerald-50 px-2 rounded-lg">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart Graphics */}
          <div className="lg:col-span-2 bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 relative grid-paper">
            {/* Chart grid background lines & Y axis numbers */}
            <div className="flex items-end justify-around h-60 w-full pt-6 relative z-10">
              {sports.map((sp, idx) => {
                const heightPercentage = (sp.count / 12) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full w-16 md:w-20">
                    <span className="text-base font-black text-slate-700 mb-2 font-['Vazirmatn']">{toFaDigit(sp.count)}</span>
                    <div 
                      className={`w-full ${sp.color} rounded-t-2xl shadow-lg transition-all duration-300 flex items-end justify-center pb-2`}
                      style={{ height: `${Math.max(8, heightPercentage)}%` }}
                    ></div>
                    <span className="text-xs font-bold text-slate-600 mt-3 block bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-200">
                      {sp.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-2xl border border-blue-200 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800 font-medium">
            نکته طلایی آمار: نمودار ستونی بهترین ابزار برای مقایسه سریع تعداد است. با یک نگاه می‌توان فهمید کدام ورزش بیشترین و کدام کمترین طرفدار را دارد!
          </p>
        </div>
      </div>
    </div>
  );
};
