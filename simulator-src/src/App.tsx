import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SimulatorContainer } from './components/SimulatorContainer';
import { ReportCard } from './components/ReportCard';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'report' | 'simulator'>('dashboard');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('دانش‌آموز کوشا');
  const [studentAvatar, setStudentAvatar] = useState<string>('🦁');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<number, number>>({});

  // Load state from localStorage on init
  useEffect(() => {
    const savedQuizzes = localStorage.getItem('grade4_math_quizzes');
    if (savedQuizzes) {
      try {
        setCompletedQuizzes(JSON.parse(savedQuizzes));
      } catch (e) {
        console.error(e);
      }
    }
    const savedName = localStorage.getItem('grade4_math_name');
    if (savedName) setStudentName(savedName);
    const savedAvatar = localStorage.getItem('grade4_math_avatar');
    if (savedAvatar) setStudentAvatar(savedAvatar);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('grade4_math_quizzes', JSON.stringify(completedQuizzes));
  }, [completedQuizzes]);

  useEffect(() => {
    localStorage.setItem('grade4_math_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('grade4_math_avatar', studentAvatar);
  }, [studentAvatar]);

  const handleSelectChapter = (id: number) => {
    setSelectedChapterId(id);
    setCurrentView('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (chapterId: number, stars: number) => {
    setCompletedQuizzes(prev => ({
      ...prev,
      [chapterId]: Math.max(prev[chapterId] || 0, stars)
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام پیشرفت و نمرات آزمون‌ها را پاک کنید؟')) {
      setCompletedQuizzes({});
      setCurrentView('dashboard');
      localStorage.removeItem('grade4_math_quizzes');
    }
  };

  const totalStars = Object.values(completedQuizzes).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Vazirmatn'] text-slate-800 antialiased">
      {/* Navbar */}
      <Navbar
        studentName={studentName}
        studentAvatar={studentAvatar}
        totalStars={totalStars}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onResetProgress={handleResetProgress}
        currentView={currentView}
      />

      {/* Main Container Views */}
      <div className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            studentName={studentName}
            setStudentName={setStudentName}
            studentAvatar={studentAvatar}
            setStudentAvatar={setStudentAvatar}
            onSelectChapter={handleSelectChapter}
            completedQuizzes={completedQuizzes}
          />
        )}

        {currentView === 'simulator' && (
          <SimulatorContainer
            selectedChapterId={selectedChapterId}
            onSelectChapter={handleSelectChapter}
            completedQuizzes={completedQuizzes}
            onFinishQuiz={handleFinishQuiz}
            soundEnabled={soundEnabled}
          />
        )}

        {currentView === 'report' && (
          <ReportCard
            studentName={studentName}
            studentAvatar={studentAvatar}
            completedQuizzes={completedQuizzes}
          />
        )}
      </div>
    </div>
  );
}

export default App;
