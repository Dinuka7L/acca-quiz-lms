import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, AlertTriangle, HardDrive } from 'lucide-react';
import Header from '../components/Header';
import Timer from '../components/Timer';
import QuestionNavigation from '../components/QuestionNavigation';
import QuickNavigation from '../components/QuickNavigation';
import QuestionRenderer from '../components/QuestionRenderer';
import { useQuizStore } from '../store/quizStore';

interface QuizInterfaceProps {
  onSubmit: () => void;
  onNavigateHome?: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ onSubmit, onNavigateHome }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  
  const { 
    currentQuiz, 
    currentQuestionIndex, 
    questionStatuses,
    setCurrentQuestion,
    currentAttempt,
    timeRemaining,
    isTimerRunning,
    pauseQuiz,
    checkStorageHealth,
    cleanupStorage
  } = useQuizStore();

  // Check storage health periodically
  useEffect(() => {
    const checkStorage = () => {
      const health = checkStorageHealth();
      if (!health.isHealthy && health.warning) {
        setStorageWarning(health.warning);
      } else {
        setStorageWarning(null);
      }
    };

    // Check immediately and then every 30 seconds
    checkStorage();
    const interval = setInterval(checkStorage, 30000);

    return () => clearInterval(interval);
  }, [checkStorageHealth]);

  // Handle page visibility change and beforeunload events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentAttempt && !currentAttempt.isCompleted) {
        // User switched tabs or minimized window - pause the quiz
        pauseQuiz();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentAttempt && !currentAttempt.isCompleted) {
        // User is trying to close/refresh the page - pause the quiz
        pauseQuiz();
        
        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = 'Your quiz progress will be saved. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    // Listen for continue quiz event from QuizSetup
    const handleContinueQuiz = () => {
      // This will be triggered when user clicks continue from setup page
      // The quiz state should already be restored by resumeQuiz()
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('continueQuiz', handleContinueQuiz);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('continueQuiz', handleContinueQuiz);
    };
  }, [currentAttempt, pauseQuiz]);

  // Auto-navigate to results when quiz is submitted (either manually or by timer)
  useEffect(() => {
    if (currentAttempt?.isSubmitted && !isTimerRunning) {
      // Small delay to show the appropriate message
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        onSubmit();
      }, currentAttempt.isAutoSubmitted ? 2000 : 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentAttempt?.isSubmitted, isTimerRunning, onSubmit, currentAttempt?.isAutoSubmitted]);

  if (!currentQuiz) {
    return <div>No quiz active</div>;
  }

  // If quiz is already submitted, show a loading state with dynamic message
  if (currentAttempt?.isSubmitted || isSubmitting) {
    const isAutoSubmitted = currentAttempt?.isAutoSubmitted;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAutoSubmitted ? 'Time\'s Up!' : 'Quiz Submitted!'}
          </h2>
          <p className="text-gray-600">
            {isAutoSubmitted 
              ? 'Your quiz has been automatically submitted. Calculating results...'
              : 'Processing your answers and calculating results...'
            }
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestionIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    
    try {
      const { submitQuiz } = useQuizStore.getState();
      await submitQuiz(false); // Pass false to indicate manual submit
    } catch (error) {
      setIsSubmitting(false);
      // Show user-friendly error message
      alert('There was an issue submitting your quiz. Your progress has been saved. Please try again.');
    }
  };

  const handleNavigateHome = () => {
    if (currentAttempt && !currentAttempt.isCompleted) {
      // Pause the quiz before navigating away
      pauseQuiz();
    }
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleCleanupStorage = () => {
    cleanupStorage();
    setStorageWarning(null);
  };

  const getUnansweredQuestions = () => {
    return currentQuiz.questions.filter(q => !questionStatuses[q.id]?.answered);
  };

  const unansweredQuestions = getUnansweredQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300">
      <Header currentQuiz={currentQuiz.title} onNavigateHome={handleNavigateHome} />
      
      {/* Storage Warning Banner */}
      {storageWarning && (
        <div className="bg-orange-100 dark:bg-orange-900/30 border-b border-orange-200 dark:border-orange-700 px-4 py-3 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
              <div className="text-orange-800 dark:text-orange-300 transition-colors duration-300">
                <span className="font-medium">Storage Warning:</span> {storageWarning}
              </div>
            </div>
            <button
              onClick={handleCleanupStorage}
              className="px-3 py-1 bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white text-sm rounded transition-colors duration-200"
            >
              Clean Up
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-600/50 p-4 overflow-y-auto transition-colors duration-300">
          <QuestionNavigation />
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-2 rounded-full font-medium transition-colors duration-300">
                    Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                  </div>
                </div>
                
                {/* Auto-save indicator */}
                <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full transition-colors duration-300">
                  ✓ Progress auto-saved
                </div>
              </div>
              
              <QuestionRenderer question={currentQuestion} />
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-600/50 p-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${isFirstQuestion
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }
                `}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {questionStatuses[currentQuestion.id]?.answered ? (
                  <span className="text-green-600 dark:text-green-400 font-medium transition-colors duration-300">✓ Answered</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium transition-colors duration-300">Not answered</span>
                )}
              </div>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105
                  ${isSubmitting 
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white'
                  }
                `}
              >
                <span>{isLastQuestion ? 'Submit Quiz' : 'Next'}</span>
                {isLastQuestion ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <aside className="w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-l border-gray-200/50 dark:border-gray-600/50 p-4 space-y-4 transition-colors duration-300">
          <Timer />
          <QuickNavigation />
        </aside>
      </main>
      
      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full transition-colors duration-300">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                Submit Quiz?
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                Are you sure you want to submit your quiz? This action cannot be undone.
              </p>
              
              {unansweredQuestions.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 transition-colors duration-300">
                  <div className="font-medium text-red-900 dark:text-red-300 mb-2 transition-colors duration-300">
                    ⚠️ Unanswered Questions ({unansweredQuestions.length})
                  </div>
                  <div className="text-red-800 dark:text-red-400 text-sm space-y-1 transition-colors duration-300">
                    {unansweredQuestions.slice(0, 5).map((q, index) => (
                      <div key={q.id}>
                        • Question {currentQuiz.questions.findIndex(qu => qu.id === q.id) + 1}
                      </div>
                    ))}
                    {unansweredQuestions.length > 5 && (
                      <div>• ... and {unansweredQuestions.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizInterface;