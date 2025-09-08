import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import QuizSetup from './pages/QuizSetup';
import QuizInterface from './pages/QuizInterface';
import QuizResults from './pages/QuizResults';
import { useQuizStore } from './store/quizStore';
import { loadQuiz } from './utils/quizLoader';

type AppState = 'home' | 'dashboard' | 'setup' | 'quiz' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { startQuiz, submitQuiz, resetQuiz, hasInProgressQuiz, resumeQuiz, setQuizzes } = useQuizStore();

  // Listen for continue quiz event
  useEffect(() => {
    const handleContinueQuiz = () => {
      setCurrentState('quiz');
    };

    window.addEventListener('continueQuiz', handleContinueQuiz);
    
    return () => {
      window.removeEventListener('continueQuiz', handleContinueQuiz);
    };
  }, []);

  const handleStartQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      // Load the specific quiz data
      const quizPath = getQuizPath(quizId);
      if (quizPath) {
        const quiz = await loadQuiz(quizPath);
        // Update the quiz in the store
        const { quizzes } = useQuizStore.getState();
        const updatedQuizzes = quizzes.map(q => q.id === quizId ? quiz : q);
        if (!quizzes.find(q => q.id === quizId)) {
          updatedQuizzes.push(quiz);
        }
        setQuizzes(updatedQuizzes);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('Failed to load quiz. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(false);
    
    setSelectedQuizId(quizId);
    
    // Check if there's an in-progress quiz
    if (hasInProgressQuiz(quizId)) {
      setCurrentState('setup'); // Go to setup to show continue option
    } else {
      setCurrentState('setup');
    }
  };

  // Helper function to get quiz path from quiz ID
  const getQuizPath = (quizId: string): string | null => {
    const pathMapping: Record<string, string> = {
      'quiz- lesson 01- Overiew of IT&S': 'lessonQuizzes/OverviewOfITSystems',
      'quiz-Computer Hardware': 'lessonQuizzes/Hardware',
      'quiz-software-03': 'lessonQuizzes/Software',
      'quiz-data-and-databases-1': 'lessonQuizzes/DataAndDatabases',
      'quiz- Networking and Communication': 'lessonQuizzes/NetworkingFundamentals',
      'quiz-Information Systems Security': 'lessonQuizzes/InformationSecurity',
      'Business Process-Quiz': 'lessonQuizzes/BusinessProcess',
      'quiz-Information Systems Development': 'lessonQuizzes/InformationSystemsDevelopment',
      'quiz-Emerging Technologies in IT': 'lessonQuizzes/EmergingTechnologiesInIT',
      'quiz-python fundamentals': 'lessonQuizzes/PythonFundamentals',
      'python-operators-test': 'lessonQuizzes/PythonOperators',
      'quiz-conditional-statements-1': 'lessonQuizzes/PythonConditionalStatements',
      'mock-Part 01 - Chapter 1': 'mockExamQuizzes/mockFinalPart1',
      'mock-final-4': 'mockExamQuizzes/mockFinalPart4',
      'quiz - Chapter 1 - Overview of Financial Accounting and Reporting': 'lessonQuizzes/OverviewFinancialAccountingandReporting',
    };
    return pathMapping[quizId] || null;
  };

  const handleBeginQuiz = (timeLimit: number) => {
    if (selectedQuizId) {
      startQuiz(selectedQuizId, timeLimit);
      setCurrentState('quiz');
    }
  };

  const handleSubmitQuiz = () => {
    submitQuiz();
    setCurrentState('results');
  };

  const handleReturnHome = () => {
    resetQuiz();
    setSelectedQuizId(null);
    setCurrentState('dashboard');
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    setCurrentState('setup');
  };

  const handleBackToDashboard = () => {
    resetQuiz();
    setSelectedQuizId(null);
    setCurrentState('home');
  };

  const handleGoToDashboard = () => {
    setCurrentState('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const renderCurrentState = () => {
    switch (currentState) {
      case 'home':
        return <Home onStartQuiz={handleStartQuiz} />;
        
      case 'dashboard':
        return <Dashboard onStartQuiz={handleStartQuiz} onGoHome={handleBackToDashboard} />;
      
      case 'setup':
        return selectedQuizId ? (
          <QuizSetup
            quizId={selectedQuizId}
            onStart={handleBeginQuiz}
            onBack={handleBackToDashboard}
            onViewResults={(quizId) => {
              const { attempts, quizzes, setCurrentAttemptAndQuiz } = useQuizStore.getState();

              const attempt = attempts.find(
                (a) => a.quizId === quizId && a.isCompleted
              );
              const quiz = quizzes.find((q) => q.id === quizId);

              if (attempt && quiz) {
                setCurrentAttemptAndQuiz(attempt, quiz);
                setCurrentState('results');
              }
            }}
          />
        ) : null;

      
      case 'quiz':
        return <QuizInterface onSubmit={handleSubmitQuiz} onNavigateHome={handleReturnHome} />;
      
      case 'results':
        return (
          <QuizResults
            onReturnHome={handleReturnHome}
            onRetakeQuiz={handleRetakeQuiz}
          />
        );
      
      default:
        return <Home onStartQuiz={handleStartQuiz} />;
    }
  };

  return (
    <div className="font-inter">
      {renderCurrentState()}
    </div>
  );
}

export default App;