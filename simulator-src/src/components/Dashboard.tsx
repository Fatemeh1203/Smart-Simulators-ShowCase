import React from 'react';
import { CHAPTERS, Chapter } from '../data/curriculum';
import { toFaDigit } from '../utils/numberWords';
import { Sparkles, Star, CheckCircle2, ChevronLeft, Award, Play } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  studentName: string;
  setStudentName: (name: string) => void;
  studentAvatar: string;
  setStudentAvatar: (avatar: string) => void;
  onSelectChapter: (id: number) => void;
  completedQuizzes: Record<number, number>;
}

const AVATARS = ['🦁', '🦊', '🐯', '🐼', '🐰', '👦', '👧', '👨‍🚀', '👩‍🚀', '🦄'];

export const Dashboard: React.FC<DashboardProps> = ({
  studentName,
  setStudentName,
  studentAvatar,
  setStudentAvatar,
  onSelectChapter,
  completedQuizzes
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-4 md:px-8">
      {/* HERO BANNER & VIRTUAL MASCOT */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border-4 border-white/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Hero Info */}
        <div className="relative z-10 space-y-6 text-right max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-yellow-300 font-bold text-xs md:text-sm shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>شبیه‌ساز و آزمایشگاه تعاملی بازی و ریاضی</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight font-['Vazirmatn']">
            سلام {studentName}! <br />
            به دنیای شگفت‌انگیز ریاضی چهارم خوش اومدی
          </h1>

          <p className="text-base md:text-lg text-blue-100 leading-relaxed font-medium">
            من «آقای کوشا» راهنمای تو هستم! اینجا قرار نیست فقط فرمول حفظ کنی؛ با چرخاندن نقاله، خرد کردن پیتزای کسرها و ساختن شکل‌های هندسی، ریاضی رو یاد می‌گیری و لذت می‌بری!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onSelectChapter(1)}
              className="btn-3d-yellow text-slate-900 font-black px-8 py-4 rounded-2xl text-base md:text-lg shadow-lg shadow-amber-500/30 flex items-center gap-2"
            >
              <Play className="w-5 h-5 text-slate-900 fill-slate-900" />
              <span>شروع اولین کاوش (درس اول)</span>
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
              <span>پایان هر درس، آزمون و جایزه داره!</span>
            </div>
          </div>
        </div>

        {/* Profile Customization / Mascot Box */}
        <div className="relative z-10 bg-white text-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 w-full lg:w-96 flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-4 py-1 rounded-full">ساخت شخصیت دلخواه</span>
          
          {/* Avatar selector */}
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-slate-500 block text-right">آواتار خودت رو انتخاب کن:</label>
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setStudentAvatar(av)}
                  className={`text-2xl p-2 rounded-xl transition-all ${studentAvatar === av ? 'bg-blue-500 shadow-md shadow-blue-200 scale-125 z-10' : 'hover:bg-slate-200'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-slate-500 block text-right">نام زیبای تو:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-4 text-center font-bold text-lg text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="نامت را بنویس..."
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 w-full flex items-center justify-between text-right">
            <div>
              <span className="text-xs font-bold text-amber-900 block">امتیاز کل آواتار تو:</span>
              <span className="text-[11px] text-amber-700 block">با شرکت در آزمون‌ها بیشترش کن!</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-black text-xl font-['Vazirmatn']">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {toFaDigit(Object.values(completedQuizzes).reduce((a, b) => a + b, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER CARDS SECTION */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">فصل‌های آموزشی کتاب ریاضی چهارم</h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">آزمایشگاه و شبیه‌ساز هر درس را انتخاب کن و یادگیری را شروع کن!</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-200 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 self-start sm:self-auto">
            <span>مجموع دروس: {toFaDigit(CHAPTERS.length)} فصل</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CHAPTERS.map((ch: Chapter) => {
            // dynamically get icon from Lucide
            // @ts-ignore
            const IconComponent = LucideIcons[ch.iconName] || LucideIcons.HelpCircle;
            const stars = completedQuizzes[ch.id];
            const isCompleted = stars !== undefined;

            return (
              <div
                key={ch.id}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-between transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-slate-300 group"
              >
                <div className="space-y-6">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl text-white shadow-lg ${ch.color}`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-2xl text-amber-700 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{toFaDigit(stars)} امتیاز آزمون</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-2xl">آزمون داده نشده</span>
                    )}
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">
                      {ch.subtitle}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {ch.description}
                  </p>

                  {/* Learning goals */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">اهداف شبیه‌سازی این درس:</span>
                    {ch.goals.slice(0, 3).map((goal, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={() => onSelectChapter(ch.id)}
                  className={`mt-8 w-full py-4 px-6 rounded-2xl font-bold text-sm md:text-base transition-all flex items-center justify-between text-white shadow-lg ${ch.color}`}
                >
                  <span>ورود به شبیه‌ساز و آزمون</span>
                  <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
