import React, { useState } from 'react';
import { Chapter } from '../data/curriculum';
import { toFaDigit } from '../utils/numberWords';
import { CheckCircle2, XCircle, Star, RotateCcw, Award, HelpCircle } from 'lucide-react';

interface QuizViewProps {
  chapter: Chapter;
  onFinishQuiz: (stars: number) => void;
  soundEnabled: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  chapter,
  onFinishQuiz,
  // @ts-ignore
  soundEnabled
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQuestion = chapter.quizzes[currentIdx];

  const handleSelectOption = (index: number) => {
    if (showExplanation || quizFinished) return;
    setSelectedOption(index);
    setShowExplanation(true);

    if (index === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < chapter.quizzes.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finish quiz
      // Score is out of 5. Let's award stars equal to score (or min 1 if tried)
      const finalScore = (selectedOption === currentQuestion.correctAnswer ? score + 1 : score);
      const starsEarned = Math.max(1, finalScore);
      setQuizFinished(true);
      onFinishQuiz(starsEarned);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 max-w-3xl mx-auto text-center space-y-8 my-8">
        <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-amber-300">
          <Award className="w-14 h-14 animate-bounce" />
        </div>

        <div className="space-y-3">
          <h3 className="text-3xl font-black text-slate-800">پایان آزمون {chapter.title}!</h3>
          <p className="text-base text-slate-600 font-medium">به پاس تلاش و پاسخگویی به سوالات، امتیازات زیر به کارنامه تو اضافه شد:</p>
        </div>

        {/* Big Score Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <div className="flex items-center gap-2 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-500">تعداد پاسخ صحیح:</span>
            <span className="text-2xl font-black text-emerald-600 font-['Vazirmatn']">{toFaDigit(score)} از {toFaDigit(chapter.quizzes.length)}</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-500 text-white px-8 py-4 rounded-2xl shadow-lg shadow-amber-200">
            <Star className="w-7 h-7 fill-white animate-pulse-soft" />
            <span className="text-2xl font-black font-['Vazirmatn']">{toFaDigit(Math.max(1, score))} ستاره امتیاز</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handleRestartQuiz}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl transition-all shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            <span>آزمون مجدد</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Quiz Top bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl text-white shadow-md ${chapter.color}`}>
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">آزمون پایانی: {chapter.title}</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">با دقت سوال را بخوان و بهترین گزینه را انتخاب کن</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-slate-100 px-5 py-3 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-600">سوال</span>
          <span className="text-lg font-black text-slate-800 font-['Vazirmatn']">
            {toFaDigit(currentIdx + 1)} از {toFaDigit(chapter.quizzes.length)}
          </span>
        </div>
      </div>

      {/* Main Question Box */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-8">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h4 className="text-lg md:text-2xl font-black text-slate-800 leading-relaxed font-['Vazirmatn']">
            {currentQuestion.question}
          </h4>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;

            let buttonStyle = "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200";

            if (showExplanation) {
              if (isCorrect) {
                buttonStyle = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-200 animate-pulse-soft";
              } else if (isSelected) {
                buttonStyle = "bg-rose-500 text-white border-rose-600 animate-wiggle";
              } else {
                buttonStyle = "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={showExplanation}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-5 rounded-2xl border-2 font-bold text-base md:text-lg text-right transition-all flex items-center justify-between ${buttonStyle}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${showExplanation && (isCorrect || isSelected) ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}>
                    {toFaDigit(idx + 1)}
                  </div>
                  <span className="font-['Vazirmatn']">{option}</span>
                </div>

                {showExplanation && isCorrect && <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />}
                {showExplanation && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Box & Next Button */}
        {showExplanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in">
            <div className="space-y-1 text-right">
              <span className="text-xs font-black text-blue-700 bg-blue-200 px-3 py-1 rounded-full inline-block mb-1">پاسخ‌نامه و توضیح آموزشی</span>
              <p className="text-sm md:text-base font-bold text-blue-950 leading-relaxed font-['Vazirmatn']">
                {currentQuestion.explanation}
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="btn-3d-blue text-white px-8 py-3 rounded-2xl font-black text-base shadow-lg shadow-blue-200 w-full sm:w-auto flex-shrink-0 text-center"
            >
              {currentIdx + 1 < chapter.quizzes.length ? 'سوال بعدی' : 'مشاهده نتیجه آزمون'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
