import React, { useState } from 'react';
import { ChevronRight, AlertTriangle, Home } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';

interface HeaderProps {
  currentQuiz?: string;
  onNavigateHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentQuiz, onNavigateHome }) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const { currentAttempt, isTimerRunning } = useQuizStore();
  
  const isInQuiz = currentAttempt && isTimerRunning;

  const handleLogoClick = () => {
    if (isInQuiz) {
      setShowExitModal(true);
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <>
      {/* Mobile Header View */}
      <header className="md:hidden relative bg-white/60 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Home Button */}
          <div className="z-10 shrink-0">
            <button
              onClick={handleLogoClick}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
              title="Return to dashboard"
            >
              <Home className="h-5 w-5 text-gray-800" />
            </button>
          </div>
          
          {/* Quiz Name */}
          <div className="flex-grow flex justify-center z-10 mx-2 overflow-hidden">
            <span className="bg-red-800 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap truncate">
              {currentQuiz || ''}
            </span>
          </div>

          
        </div>
      </header>

      {/* Desktop Header View */}
      <header className="hidden md:block relative bg-white/60 backdrop-blur-md border-b border-gray-200/50 shadow-md sticky top-0 z-50">
        {/* Gradient Red Overlay on Left */}
        <div className="absolute inset-y-0 left-0 w-[150px] sm:w-[200px] bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between min-h-[4rem] gap-y-2">
            <div className="z-10 shrink-0 mr-2">
              <button
                onClick={handleLogoClick}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                title="Return to dashboard"
              >
                <Home className="h-5 w-5 text-gray-800" />
              </button>
            </div>
            {/* Left Side: Large Banner */}
            <div className="text-xl sm:text-2xl font-bold text-gray-800 z-10">
              Academia - USJ - FMSC First Year Quizzes
            </div>

            {/* Breadcrumb Navigation */}
            <nav className="flex flex-wrap items-center space-x-1 sm:space-x-2 text-xs sm:text-sm z-10 overflow-x-auto max-w-full">
              <span className="text-gray-600 whitespace-nowrap">Year I</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-gray-600 whitespace-nowrap"></span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-gray-600 whitespace-nowrap"></span>
              {currentQuiz && (
                <>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span className="bg-primary-600 text-white px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap">
                    {currentQuiz}
                  </span>
                </>
              )}
            </nav>

            {/* Right Side: Website Logo - Clickable */}
            <div className="z-10 shrink-0">
              <button
                onClick={handleLogoClick}
                className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
                title={isInQuiz ? "Exit quiz and return home" : "Return to dashboard"}
              >
                <img
                  src="/Academia-logo.png"
                  alt="Website Logo"
                  className="w-16 sm:w-20 md:w-24 lg:w-32 h-auto rounded-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Exit Quiz Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exit Quiz?
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to exit the quiz? Your progress will be lost and you'll need to start over.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="font-medium text-red-900 mb-2">
                  ⚠️ Warning
                </div>
                <div className="text-red-800 text-sm">
                  • All your answers will be lost
                  • Timer will be reset
                  • You'll return to the dashboard
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Home className="h-4 w-4" />
                <span>Exit to Home</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;