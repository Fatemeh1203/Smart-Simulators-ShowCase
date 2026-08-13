import React from 'react';
import { CHAPTERS, Chapter } from '../data/curriculum';
import { toFaDigit } from '../utils/numberWords';
import { Star, CheckCircle, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  selectedChapterId: number;
  onSelectChapter: (id: number) => void;
  completedQuizzes: Record<number, number>; // chapterId -> star count
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedChapterId,
  onSelectChapter,
  completedQuizzes
}) => {
  return (
    <aside className="w-full lg:w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 lg:min-h-[calc(100vh-80px)] shadow-sm">
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-1">فصل‌های کتاب ریاضی چهارم</h2>
        <p className="text-xs text-slate-500">جهت ورود به شبیه‌ساز روی هر درس کلیک کنید</p>
      </div>

      <div className="flex flex-col gap-3.5">
        {CHAPTERS.map((ch: Chapter) => {
          const starsEarned = completedQuizzes[ch.id];
          const isCompleted = starsEarned !== undefined;
          const isSelected = selectedChapterId === ch.id;

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-right group ${isSelected ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200 translate-x-1' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${isSelected ? 'bg-slate-700 text-white' : ch.bgLight + ' ' + ch.borderColor + ' border'}`}>
                  {toFaDigit(ch.id)}
                </div>
                <div>
                  <span className={`text-sm font-bold block ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {ch.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {toFaDigit(starsEarned)} امتیاز
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">شبیه‌سازی و آزمون</span>
                    )}
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </div>
              </div>

              <ChevronLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
        <span className="text-xs font-bold text-slate-600 block mb-1">طراحی شده برای مدارس و دانش‌آموزان</span>
        <p className="text-[11px] text-slate-400">منطبق بر آخرین بودجه‌بندی وزارت آموزش و پرورش</p>
      </div>
    </aside>
  );
};
