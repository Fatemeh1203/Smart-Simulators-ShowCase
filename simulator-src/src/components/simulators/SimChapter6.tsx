import React, { useState } from 'react';
import { toFaDigit } from '../../utils/numberWords';
import { Shapes, Maximize2, CheckCircle, Info } from 'lucide-react';

export const SimChapter6: React.FC = () => {
  // Shape state
  const [selectedShape, setSelectedShape] = useState<string>('rect'); // rect, square, par, trap
  const [width, setWidth] = useState<number>(6); // base/length
  const [height, setHeight] = useState<number>(4); // width/height

  // Calculated perimeter and area
  let perimeter = 0;
  let area = 0;
  let formulaArea = "";
  let formulaPerimeter = "";
  let shapeName = "";
  let shapeProps = "";

  if (selectedShape === 'rect') {
    shapeName = "مستطیل";
    perimeter = (width + height) * 2;
    area = width * height;
    formulaArea = `طول × عرض = ${toFaDigit(width)} × ${toFaDigit(height)} = ${toFaDigit(area)}`;
    formulaPerimeter = `(طول + عرض) × ۲ = (${toFaDigit(width)} + ${toFaDigit(height)}) × ۲ = ${toFaDigit(perimeter)}`;
    shapeProps = "ضلع‌های روبه‌رو موازی و مساوی‌اند و هر ۴ زاویه قائمه (۹۰ درجه) هستند.";
  } else if (selectedShape === 'square') {
    shapeName = "مربع";
    perimeter = width * 4;
    area = width * width;
    formulaArea = `ضلع × خودش = ${toFaDigit(width)} × ${toFaDigit(width)} = ${toFaDigit(area)}`;
    formulaPerimeter = `ضلع × ۴ = ${toFaDigit(width)} × ۴ = ${toFaDigit(perimeter)}`;
    shapeProps = "هر ۴ ضلع مساوی‌اند و هر ۴ زاویه قائمه هستند (مربع یک مستطیل خاص است!).";
  } else if (selectedShape === 'par') {
    shapeName = "متوازی‌الاضلاع";
    // approximate slant side as height+1 for visual perimeter estimation
    const slant = height + 1;
    perimeter = (width + slant) * 2;
    area = width * height;
    formulaArea = `قاعده × ارتفاع = ${toFaDigit(width)} × ${toFaDigit(height)} = ${toFaDigit(area)}`;
    formulaPerimeter = `مجموع ۴ ضلع = (${toFaDigit(width)} + ${toFaDigit(slant)}) × ۲ = ${toFaDigit(perimeter)} (تقریبی)`;
    shapeProps = "ضلع‌های روبه‌رو موازی و مساوی‌اند اما زاویه‌ها قائمه نیستند (دو زاویه تند و دو زاویه باز).";
  } else if (selectedShape === 'trap') {
    shapeName = "ذوزنقه";
    const topWidth = Math.max(1, width - 2);
    // approximate slant sides
    const slant1 = height + 1;
    const slant2 = height; 
    perimeter = width + topWidth + slant1 + slant2;
    area = ((width + topWidth) * height) / 2;
    formulaArea = `(قاعده بزرگ + قاعده کوچک) × ارتفاع ÷ ۲ = (${toFaDigit(width)} + ${toFaDigit(topWidth)}) × ${toFaDigit(height)} ÷ ۲ = ${toFaDigit(area)}`;
    formulaPerimeter = `مجموع ۴ ضلع = ${toFaDigit(width)} + ${toFaDigit(topWidth)} + ${toFaDigit(slant1)} + ${toFaDigit(slant2)} = ${toFaDigit(perimeter)}`;
    shapeProps = "فقط دو ضلع با هم موازی‌اند (قاعده بزرگ و قاعده کوچک) و دو ضلع دیگر موازی نیستند.";
  }

  // Polygon points calculator for SVG (base grid 300x220, scaling factor 20px per unit)
  // Origin at (40, 180)
  const getPoints = () => {
    const scale = 25;
    const baseX = 40;
    const baseY = 180;
    const w = width * scale;
    const h = (selectedShape === 'square' ? width : height) * scale;

    if (selectedShape === 'rect' || selectedShape === 'square') {
      return `${baseX},${baseY} ${baseX + w},${baseY} ${baseX + w},${baseY - h} ${baseX},${baseY - h}`;
    } else if (selectedShape === 'par') {
      const offset = 30; // slant offset
      return `${baseX},${baseY} ${baseX + w},${baseY} ${baseX + w + offset},${baseY - h} ${baseX + offset},${baseY - h}`;
    } else if (selectedShape === 'trap') {
      const topW = Math.max(1, width - 2) * scale;
      const offset = 25;
      return `${baseX},${baseY} ${baseX + w},${baseY} ${baseX + topW + offset},${baseY - h} ${baseX + offset},${baseY - h}`;
    }
    return "";
  };

  return (
    <div className="space-y-10 py-4">
      {/* SECTION 1: GEOBOARD SHAPE BUILDER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-200">
            <Shapes className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">جئوبورد و مساحت‌سنج هوشمند</h3>
            <p className="text-slate-500 text-sm md:text-base">یک شکل انتخاب کن، طول و عرض آن را تغییر بده و محاسبه فوری محیط و مساحت را بررسی کن.</p>
          </div>
        </div>

        {/* Shape selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'rect', label: 'مستطیل' },
            { id: 'square', label: 'مربع' },
            { id: 'par', label: 'متوازی‌الاضلاع' },
            { id: 'trap', label: 'ذوزنقه' },
          ].map((sh) => (
            <button
              key={sh.id}
              onClick={() => setSelectedShape(sh.id)}
              className={`py-3 px-4 rounded-2xl font-bold text-sm md:text-base transition-all ${selectedShape === sh.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {sh.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Geoboard SVG drawing */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 relative overflow-hidden grid-paper">
            <svg width="340" height="220" viewBox="0 0 340 220" className="drop-shadow-lg">
              {/* Shape Polygon */}
              <polygon points={getPoints()} fill="#c7d2fe" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round" />
              
              {/* Height dashed line for Parallelogram/Trapezoid */}
              {(selectedShape === 'par' || selectedShape === 'trap') && (
                <line 
                  x1={selectedShape === 'par' ? 70 : 65} 
                  y1="180" 
                  x2={selectedShape === 'par' ? 70 : 65} 
                  y2={180 - height * 25} 
                  stroke="#dc2626" 
                  strokeWidth="2" 
                  strokeDasharray="5,5" 
                />
              )}
            </svg>
            <div className="mt-4 flex items-center gap-6 text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <span className="text-indigo-700">قاعده/طول: {toFaDigit(width)}</span>
              {selectedShape !== 'square' && <span className="text-rose-600">ارتفاع/عرض: {toFaDigit(height)}</span>}
            </div>
          </div>

          {/* Controls & Properties */}
          <div className="bg-indigo-50/60 p-6 rounded-3xl border border-indigo-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-bold text-indigo-900 block mb-2">طول / قاعده (افقی):</span>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {selectedShape !== 'square' && (
                <div>
                  <span className="text-sm font-bold text-indigo-900 block mb-2">عرض / ارتفاع (عمودی):</span>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Properties Info box */}
            <div className="bg-white p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
              <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1">ویژگی هندسی {shapeName}:</span>
                <p className="text-xs text-slate-600 leading-relaxed">{shapeProps}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Perimeter Card */}
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-6 h-6 text-emerald-600" />
                <span className="text-lg font-bold text-slate-800">محیط (دور تا دور)</span>
              </div>
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-black text-xl shadow-md shadow-emerald-200">
                {toFaDigit(perimeter)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">فرمول و محاسبه:</span>
              <p className="text-sm md:text-base font-bold text-emerald-900 font-['Vazirmatn']">{formulaPerimeter}</p>
            </div>
          </div>

          {/* Area Card */}
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shapes className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-slate-800">مساحت (سطح پوشش)</span>
              </div>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black text-xl shadow-md shadow-blue-200">
                {toFaDigit(area)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">فرمول و محاسبه:</span>
              <p className="text-sm md:text-base font-bold text-blue-900 font-['Vazirmatn']">{formulaArea}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <p className="text-sm text-slate-700 font-medium">
            یادآوری مهم: مساحت متوازی‌الاضلاع و مستطیل بسیار شبیه هم هستند؛ چون اگر گوشه متوازی‌الاضلاع را ببریم و طرف دیگر بگذاریم، دقیقاً به یک مستطیل تبدیل می‌شود!
          </p>
        </div>
      </div>
    </div>
  );
};
