import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { Clock, Navigation, CheckCircle } from 'lucide-react';

export const SimChapter4: React.FC = () => {
  // Angle simulator state
  const [angle, setAngle] = useState<number>(60);

  // Time difference state
  const [startHour] = useState<number>(7);
  const [startMinute, setStartMinute] = useState<number>(15);
  const [endHour] = useState<number>(7);
  const [endMinute, setEndMinute] = useState<number>(50);

  const diffMinutes = endMinute - startMinute;

  // Classify angle
  let angleType = "زاویه تند (حاده)";
  let angleColor = "text-emerald-600 bg-emerald-100 border-emerald-300";
  if (angle === 90) {
    angleType = "زاویه راست (قائمه)";
    angleColor = "text-blue-600 bg-blue-100 border-blue-300";
  } else if (angle > 90 && angle < 180) {
    angleType = "زاویه باز (منفرجه)";
    angleColor = "text-amber-600 bg-amber-100 border-amber-300";
  } else if (angle === 180) {
    angleType = "زاویه نیم‌صفحه";
    angleColor = "text-rose-600 bg-rose-100 border-rose-300";
  } else if (angle === 0) {
    angleType = "زاویه صفر";
    angleColor = "text-slate-600 bg-slate-100 border-slate-300";
  }

  // Calculate coordinates for SVG angle arms
  // Base origin at (150, 150)
  // Arm length = 110
  const rad = (angle) * (Math.PI / 180);
  const armX = 150 - 110 * Math.cos(rad);
  const armY = 150 - 110 * Math.sin(rad);

  const handleStartMinChange = (delta: number) => {
    let val = startMinute + delta;
    if (val < 0) val = 0;
    if (val >= endMinute) val = endMinute - 1;
    setStartMinute(val);
  };

  const handleEndMinChange = (delta: number) => {
    let val = endMinute + delta;
    if (val <= startMinute) val = startMinute + 1;
    if (val > 59) val = 59;
    setEndMinute(val);
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: PROTRACTOR & ANGLES */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-200">
            <Navigation className="w-7 h-7 rotate-45" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">نقاله مجازی و ساخت زاویه‌ها</h3>
            <p className="text-slate-500 text-sm md:text-base">نوار زاویه را حرکت بده تا بازوهای زاویه تکان بخورند و نوع زاویه را کشف کنی!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Angle visualizer SVG */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden">
            <svg width="300" height="180" viewBox="0 0 300 180" className="drop-shadow-md">
              {/* Protractor background arc */}
              <path d="M 30 150 A 120 120 0 0 1 270 150 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
              
              {/* Protractor degree tick lines */}
              {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
                const r = deg * Math.PI / 180;
                const x1 = 150 - 120 * Math.cos(r);
                const y1 = 150 - 120 * Math.sin(r);
                const x2 = 150 - 110 * Math.cos(r);
                const y2 = 150 - 110 * Math.sin(r);
                return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2" />;
              })}

              {/* Angle Arc fill */}
              {angle > 0 && (
                <path 
                  d={`M 150 150 L 200 150 A 50 50 0 ${angle > 180 ? 1 : 0} 0 ${150 - 50 * Math.cos(rad)} ${150 - 50 * Math.sin(rad)} Z`} 
                  fill="#fecdd3" 
                  opacity="0.7"
                />
              )}

              {/* Base Arm (to 0 degrees / right) */}
              <line x1="150" y1="150" x2="260" y2="150" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              
              {/* Moving Arm */}
              <line x1="150" y1="150" x2={armX} y2={armY} stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
              
              {/* Center point */}
              <circle cx="150" cy="150" r="8" fill="#e11d48" stroke="#ffffff" strokeWidth="3" />
            </svg>

            <div className="mt-4 text-center">
              <span className="text-3xl font-black text-slate-800">{toFaDigit(angle)} درجه</span>
            </div>
          </div>

          {/* Controls & Classification */}
          <div className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-sm font-bold text-rose-900 block mb-3">اهرم تغییر زاویه:</span>
              <input 
                type="range" 
                min="0" 
                max="180" 
                step="5"
                value={angle} 
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full h-3 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                <span>۰ درجه</span>
                <span>۹۰ درجه (قائمه)</span>
                <span>۱۸۰ درجه (نیم‌صفحه)</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setAngle(45)} className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 rounded-xl shadow border border-slate-200">۴۵ درجه (تند)</button>
              <button onClick={() => setAngle(90)} className="bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs py-2 rounded-xl shadow border border-slate-200">۹۰ درجه (راست)</button>
              <button onClick={() => setAngle(135)} className="bg-white hover:bg-slate-50 text-amber-700 font-bold text-xs py-2 rounded-xl shadow border border-slate-200">۱۳۵ درجه (باز)</button>
              <button onClick={() => setAngle(180)} className="bg-white hover:bg-slate-50 text-rose-700 font-bold text-xs py-2 rounded-xl shadow border border-slate-200">۱۸۰ درجه (نیم‌صفحه)</button>
            </div>

            {/* Classification Badge */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between font-bold ${angleColor}`}>
              <span className="text-sm">وضعیت و نام زاویه:</span>
              <span className="text-lg md:text-xl font-black">{angleType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLOCK & TIME DIFFERENCE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-md shadow-purple-200">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">آزمایشگاه ساعت و محاسبه زمان سفر</h3>
            <p className="text-slate-500 text-sm md:text-base">زمان حرکت از خانه و زمان رسیدن به مدرسه را تنظیم کن تا طول مسیر محاسبه شود.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Start Time */}
          <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-purple-900">ساعت حرکت از خانه</span>
              <span className="bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">مبدا</span>
            </div>
            <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-2xl shadow border border-purple-100 font-['Vazirmatn']">
              <span className="text-4xl font-black text-slate-800">{toFaDigit(startHour)}</span>
              <span className="text-4xl font-black text-purple-600">:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleStartMinChange(-5)} className="bg-slate-100 hover:bg-slate-200 font-bold text-rose-500 px-2 py-1 rounded-lg">-۵</button>
                <span className="text-4xl font-black text-slate-800 w-12 text-center">{toFaDigit(startMinute)}</span>
                <button onClick={() => handleStartMinChange(5)} className="bg-slate-100 hover:bg-slate-200 font-bold text-emerald-600 px-2 py-1 rounded-lg">+۵</button>
              </div>
            </div>
          </div>

          {/* End Time */}
          <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-indigo-900">ساعت رسیدن به مدرسه</span>
              <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">مقصد</span>
            </div>
            <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-2xl shadow border border-indigo-100 font-['Vazirmatn']">
              <span className="text-4xl font-black text-slate-800">{toFaDigit(endHour)}</span>
              <span className="text-4xl font-black text-indigo-600">:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEndMinChange(-5)} className="bg-slate-100 hover:bg-slate-200 font-bold text-rose-500 px-2 py-1 rounded-lg">-۵</button>
                <span className="text-4xl font-black text-slate-800 w-12 text-center">{toFaDigit(endMinute)}</span>
                <button onClick={() => handleEndMinChange(5)} className="bg-slate-100 hover:bg-slate-200 font-bold text-emerald-600 px-2 py-1 rounded-lg">+۵</button>
              </div>
            </div>
          </div>
        </div>

        {/* Result & Explanation */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-slate-800">طول مدت سفر (تفاضل دو زمان):</h4>
            <p className="text-sm text-slate-500">چون ساعت هر دو ۷ است، فقط دقیقه‌ها را از هم کم می‌کنیم.</p>
          </div>
          <div className="bg-emerald-500 text-white font-black text-2xl md:text-3xl px-8 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-2">
            <span>{toFaDigit(diffMinutes)}</span>
            <span className="text-xl font-bold">دقیقه</span>
          </div>
        </div>

        <div className="mt-6 bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <p className="text-sm text-purple-800 font-medium">
            نکته تکمیلی ساعت: هر عدد روی ساعت ۳۰ درجه زاویه دارد! مثلاً در ساعت ۳:۰۰، زاویه بین عقربه‌ها دقیقاً ۳ × ۳۰ = ۹۰ درجه (قائمه) است.
          </p>
        </div>
      </div>
    </div>
  );
};
