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
      <header className="md:hidden relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-600/50 shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Home Button */}
          <div className="z-10 shrink-0">
            <button
              onClick={handleLogoClick}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Return to dashboard"
            >
              <Home className="h-5 w-5 text-gray-800 dark:text-gray-200 transition-colors duration-300" />
            </button>
          </div>
          
          {/* Quiz Name */}
          <div className="flex-grow flex justify-center z-10 mx-2 overflow-hidden">
            <span className="bg-red-800 dark:bg-red-700 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap truncate transition-colors duration-300">
              {currentQuiz || 'Academia'}
            </span>
          </div>

          {/* Academia Logo */}
          <div className="z-10 shrink-0">
            <img
              src="/Academia-logo.png"
              alt="Academia Logo"
              className="w-10 rounded-full"
            />
          </div>
        </div>
      </header>

    


      {/* Desktop Header View */}
<header className="hidden md:block relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-600/50 shadow-md sticky top-0 z-50 transition-colors duration-300">
  <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
    <div className="flex items-center justify-between min-h-[4rem]">
      
      {/* Home Button */}
      <div className="z-10 shrink-0 mr-2">
        <button
          onClick={handleLogoClick}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          title="Return to dashboard"
        >
          <Home className="h-5 w-5 text-gray-800 dark:text-gray-200 transition-colors duration-300" />
        </button>
      </div>

      {/* Quiz Name */}
      <div className="flex-grow flex justify-center z-10 mx-2 overflow-hidden">
        <span className="bg-red-800 dark:bg-red-700 text-white text-sm sm:text-base px-3 py-1 rounded-full font-medium whitespace-nowrap truncate transition-colors duration-300">
          {currentQuiz || 'Academia'}
        </span>
      </div>

      {/* Academia Logo */}
<div className="z-10 shrink-0">
  <button
    onClick={handleLogoClick}
    className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full relative"
    title={isInQuiz ? "Exit quiz and return home" : "Return to dashboard"}
  >
    {/* Light logo */}
    <img
      src="/Academia-logo.png"
      alt="Academia Logo"
      className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto rounded-full object-cover transition-opacity duration-500 dark:opacity-0"
    />
    {/* Dark logo */}
    <img
      src="/Academia-logo-dark.png"
      alt="Academia Logo Dark"
      className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto rounded-full object-cover absolute inset-0 transition-opacity duration-500 opacity-0 dark:opacity-100"
    />
  </button>
</div>


    </div>
  </div>
</header>


      {/* Exit Quiz Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full transition-colors duration-300">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                Exit Quiz?
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                Are you sure you want to exit the quiz?
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 transition-colors duration-300">
                <div className="font-medium text-red-900 dark:text-red-300 mb-2 transition-colors duration-300">
                  ⚠️ Warning
                </div>
                <div className="text-red-800 dark:text-red-400 text-sm transition-colors duration-300">
                  • All your answers will be lost
                  • Timer will be reset
                  • You'll return to the dashboard
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors duration-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
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