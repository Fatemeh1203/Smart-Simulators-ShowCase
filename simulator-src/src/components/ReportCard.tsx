import React from 'react';
import { CHAPTERS, Chapter } from '../data/curriculum';
import { toFaDigit } from '../utils/numberWords';
import { Award, Printer, Star, AlertCircle } from 'lucide-react';

interface ReportCardProps {
  studentName: string;
  studentAvatar: string;
  completedQuizzes: Record<number, number>;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  studentName,
  studentAvatar,
  completedQuizzes
}) => {
  const totalChapters = CHAPTERS.length;
  const completedCount = Object.keys(completedQuizzes).length;
  const totalStars = Object.values(completedQuizzes).reduce((a, b) => a + b, 0);

  // Qualitative score helper
  const getQualityLabel = (stars: number | undefined) => {
    if (stars === undefined) return { label: 'آزمون داده نشده', color: 'text-slate-400 bg-slate-100' };
    if (stars >= 4) return { label: 'خیلی خوب', color: 'text-emerald-700 bg-emerald-100 border border-emerald-300' };
    if (stars >= 3) return { label: 'خوب', color: 'text-blue-700 bg-blue-100 border border-blue-300' };
    if (stars >= 2) return { label: 'قابل قبول', color: 'text-amber-700 bg-amber-100 border border-amber-300' };
    return { label: 'نیاز به تلاش بیشتر', color: 'text-rose-700 bg-rose-100 border border-rose-300' };
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 space-y-8">
      {/* Action Topbar (Hidden in print) */}
      <div className="print:hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">کارنامه هوشمند پیشرفت تحصیلی</h2>
          <p className="text-sm text-slate-500 mt-1">والدین و معلمان گرامی می‌توانند این کارنامه را چاپ یا به صورت PDF ذخیره کنند.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-3d-green text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-5 h-5" />
          <span>چاپ کارنامه (نسخه چاپی)</span>
        </button>
      </div>

      {/* Official Report Card Container */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-slate-200 print:shadow-none print:border-none print:p-0 space-y-10">
        
        {/* Official Header */}
        <div className="border-b-4 border-slate-800 pb-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 tracking-widest block">جمهوری اسلامی ایران - وزارت آموزش و پرورش</span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">کارنامه هوشمند ارزشیابی کیفی - توصیفی</h1>
            <p className="text-base font-bold text-blue-600">پایه چهارم دوره ابتدایی - آزمایشگاه بازی و ریاضی</p>
          </div>

          <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-6 flex items-center gap-4 min-w-[240px] justify-center shadow-inner">
            <span className="text-4xl">{studentAvatar}</span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">نام دانش‌آموز:</span>
              <span className="text-xl font-black text-slate-800 block truncate">{studentName}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">تعداد فصل‌های آزمون داده</span>
            <span className="text-3xl font-black text-blue-700 font-['Vazirmatn']">
              {toFaDigit(completedCount)} از {toFaDigit(totalChapters)}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">امتیاز کل کسب شده</span>
            <div className="flex items-center justify-center gap-1 text-3xl font-black text-amber-700 font-['Vazirmatn']">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              <span>{toFaDigit(totalStars)} ستاره</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">وضعیت تحصیلی کلی</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">
              {completedCount === 0 ? 'در انتظار آزمون' : (totalStars / completedCount >= 3.5 ? 'خیلی خوب (تایید)' : 'خوب')}
            </span>
          </div>
        </div>

        {/* Grades Table */}
        <div className="border-2 border-slate-200 rounded-3xl overflow-hidden shadow-inner">
          <div className="bg-slate-800 text-white font-bold py-4 px-6 text-lg text-right">
            جزئیات نمرات و ارزیابی فصل به فصل
          </div>

          <div className="divide-y divide-slate-200 bg-white">
            {CHAPTERS.map((ch: Chapter) => {
              const stars = completedQuizzes[ch.id];
              const qual = getQualityLabel(stars);

              return (
                <div key={ch.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-center font-bold text-slate-800 text-lg flex-shrink-0">
                      {toFaDigit(ch.id)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800">{ch.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 max-w-md line-clamp-1">{ch.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    {stars !== undefined ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-base font-['Vazirmatn']">
                        <Star className="w-5 h-5 fill-amber-500" />
                        <span>{toFaDigit(stars)} از ۵</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>شرکت نکرده</span>
                      </div>
                    )}

                    <span className={`px-5 py-2 rounded-2xl font-bold text-sm min-w-[120px] text-center ${qual.color}`}>
                      {qual.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Evaluation & Signatures */}
        <div className="border-t-2 border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 text-right">
            <div className="flex items-center gap-2 text-blue-700 font-black text-lg">
              <Award className="w-6 h-6" />
              <span>توصیه آموزشی دستیار هوشمند (استاد کوشا):</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              «دانش‌آموز عزیز {studentName}، تلاش تو در آزمایشگاه تعاملی ریاضی چهارم شایسته تقدیر است. کار با ابزارهای زاویه، کسر و اعشار نشان‌دهنده هوش بالای توست. به تمرین ادامه بده تا همیشه بدرخشی!»
            </p>
          </div>

          {/* Stamp / Signature box */}
          <div className="flex items-center justify-around text-center py-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">مهر و تاییدیه سامانه</span>
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-emerald-600 flex flex-col items-center justify-center text-emerald-700 font-black text-xs mx-auto shadow-inner bg-emerald-50/50 rotate-12">
                <span>تایید رسمی</span>
                <span className="text-[9px] block text-emerald-600 mt-1">شبیه‌ساز چهارم</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">امضای استاد راهنما</span>
              <div className="text-2xl font-black text-slate-700 italic font-['Vazirmatn'] my-4">
                استاد کوشا
              </div>
              <span className="text-[11px] text-slate-400 block">آموزگار هوشمند ریاضی</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
          سامانه شبیه‌ساز و آزمایشگاه تخصصی آموزش ریاضیات ابتدایی
        </div>
      </div>
    </div>
  );
};
