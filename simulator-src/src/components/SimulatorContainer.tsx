import React, { useState } from 'react';
import { CHAPTERS } from '../data/curriculum';
import { Sidebar } from './Sidebar';
import { QuizView } from './QuizView';
import { SimChapter1 } from './simulators/SimChapter1';
import { SimChapter2 } from './simulators/SimChapter2';
import { SimChapter3 } from './simulators/SimChapter3';
import { SimChapter4 } from './simulators/SimChapter4';
import { SimChapter5 } from './simulators/SimChapter5';
import { SimChapter6 } from './simulators/SimChapter6';
import { SimChapter7 } from './simulators/SimChapter7';
import { Sparkles, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface SimulatorContainerProps {
  selectedChapterId: number;
  onSelectChapter: (id: number) => void;
  completedQuizzes: Record<number, number>;
  onFinishQuiz: (chapterId: number, stars: number) => void;
  soundEnabled: boolean;
}

export const SimulatorContainer: React.FC<SimulatorContainerProps> = ({
  selectedChapterId,
  onSelectChapter,
  completedQuizzes,
  onFinishQuiz,
  soundEnabled
}) => {
  const [activeTab, setActiveTab] = useState<'sim' | 'quiz'>('sim');

  const currentChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];
  
  // @ts-ignore
  const IconComponent = LucideIcons[currentChapter.iconName] || LucideIcons.HelpCircle;

  const handleFinishQuiz = (stars: number) => {
    onFinishQuiz(currentChapter.id, stars);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      {/* Right Sidebar */}
      <Sidebar
        selectedChapterId={selectedChapterId}
        onSelectChapter={(id) => {
          onSelectChapter(id);
          setActiveTab('sim'); // reset tab on chapter switch
        }}
        completedQuizzes={completedQuizzes}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
        {/* Chapter Header */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-right w-full md:w-auto">
            <div className={`p-6 rounded-3xl text-white shadow-xl ${currentChapter.color} flex-shrink-0`}>
              <IconComponent className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{currentChapter.title}</h2>
              <p className="text-xs md:text-sm text-slate-500 font-bold mt-1 max-w-xl leading-relaxed">{currentChapter.subtitle}</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-full md:w-auto justify-center flex-shrink-0">
            <button
              onClick={() => setActiveTab('sim')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all ${activeTab === 'sim' ? 'bg-white text-blue-700 shadow-md border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>شبیه‌ساز آموزشی</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all ${activeTab === 'quiz' ? 'bg-white text-emerald-700 shadow-md border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>آزمون فصل</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-opacity duration-300">
          {activeTab === 'sim' ? (
            <div>
              {currentChapter.id === 1 && <SimChapter1 />}
              {currentChapter.id === 2 && <SimChapter2 />}
              {currentChapter.id === 3 && <SimChapter3 />}
              {currentChapter.id === 4 && <SimChapter4 />}
              {currentChapter.id === 5 && <SimChapter5 />}
              {currentChapter.id === 6 && <SimChapter6 />}
              {currentChapter.id === 7 && <SimChapter7 />}
            </div>
          ) : (
            <QuizView
              key={currentChapter.id}
              chapter={currentChapter}
              onFinishQuiz={handleFinishQuiz}
              soundEnabled={soundEnabled}
            />
          )}
        </div>
      </main>
    </div>
  );
};
