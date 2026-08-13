import React from 'react';
import { toFaDigit } from '../utils/numberWords';
import { Star, Volume2, VolumeX, RotateCcw, Award, Home } from 'lucide-react';

interface NavbarProps {
  studentName: string;
  studentAvatar: string;
  totalStars: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onNavigate: (view: 'dashboard' | 'report' | 'simulator') => void;
  onResetProgress: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  studentName,
  studentAvatar,
  totalStars,
  soundEnabled,
  setSoundEnabled,
  onNavigate,
  onResetProgress,
  currentView
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-4 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Brand / Title & Quick Nav */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 active:scale-95 transition-all group"
        >
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:rotate-6 transition-transform">
            <span className="text-2xl font-black">۴</span>
          </div>
          <div className="hidden sm:block text-right">
            <h1 className="text-lg font-black text-slate-800 tracking-tight">ریاضی چهارم دبستان</h1>
            <p className="text-xs font-bold text-blue-600">شبیه‌ساز و آزمایشگاه تعاملی</p>
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${currentView === 'dashboard' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Home className="w-4 h-4" />
            <span>میز کار</span>
          </button>

          <button 
            onClick={() => onNavigate('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${currentView === 'report' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            <Award className="w-4 h-4" />
            <span>کارنامه من</span>
          </button>
        </div>
      </div>

      {/* Student stats & Tools */}
      <div className="flex items-center gap-3">
        {/* Star Counter */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse-soft" />
          <span className="text-base md:text-lg font-black text-amber-900 font-['Vazirmatn']">
            {toFaDigit(totalStars)}
          </span>
        </div>

        {/* Student Avatar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-2xl">
          <span className="text-2xl">{studentAvatar}</span>
          <span className="text-xs md:text-sm font-bold text-slate-700 max-w-[90px] truncate">{studentName}</span>
        </div>

        {/* Sound toggle */}
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm active:scale-95"
          title={soundEnabled ? 'قطع صدا' : 'وصل صدا'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
        </button>

        {/* Reset Progress */}
        <button 
          onClick={onResetProgress}
          className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all shadow-sm active:scale-95 hidden sm:block"
          title="شروع مجدد و بازنشانی پیشرفت"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};
