import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, ArrowLeft, Infinity, RotateCcw, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import { useQuizStore } from '../store/quizStore';

interface QuizSetupProps {
  quizId: string;
  onStart: (timeLimit: number) => void;
  onBack: () => void;
  onViewResults: (quizId: string) => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ quizId, onStart, onBack, onViewResults }) => {
  const {
    quizzes,
    randomizeQuestions,
    setRandomizeQuestions,
    hasInProgressQuiz,
    getInProgressAttempt,
    resumeQuiz
  } = useQuizStore();

  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Focus to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const quiz = quizzes.find(q => q.id === quizId);
  const { attempts } = useQuizStore();
  const pastAttempt = attempts.find(
    a =>
      a.quizId === quizId &&
      a.isCompleted &&
      a.answers &&
      Object.keys(a.answers).length > 0
  );

  const hasInProgress = hasInProgressQuiz(quizId);
  const inProgressAttempt = getInProgressAttempt(quizId);

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const handleStart = () => {
    if (selectedTime !== null) {
      onStart(selectedTime);
    } else {
      setShowTimeWarning(true);
    }
  };

  const handleContinue = () => {
    resumeQuiz(quizId);
    // Navigate to quiz interface - this will be handled by the parent component
    window.dispatchEvent(new CustomEvent('continueQuiz'));
  };

  const handleTimeSelection = (time: number | null) => {
    setSelectedTime(time);
    if (time !== null) {
      setShowTimeWarning(false);
    }
  };

  // Special value for no time limit (using -1 to represent unlimited time)
  const NO_TIME_LIMIT = -1;

  const getInProgressInfo = () => {
    if (!inProgressAttempt) return null;

    const answeredQuestions = Object.keys(inProgressAttempt.answers).length;
    const totalQuestions = quiz.questions.length;
    const currentQuestion = (inProgressAttempt.currentQuestionIndex || 0) + 1;

    return {
      answeredQuestions,
      totalQuestions,
      currentQuestion,
      timeSpent: inProgressAttempt.timeSpent || 0,
      isUnlimited: inProgressAttempt.isUnlimited
    };
  };

  const inProgressInfo = getInProgressInfo();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300">
      <Header currentQuiz={quiz.title} onNavigateHome={onBack} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
            <div className="text-center mb-8">
              <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center transition-colors duration-300">
                <Clock className="h-10 w-10 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {quiz.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                {quiz.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
                  <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Questions</div>
                  <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{quiz.questions.length} questions</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
                  <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Total Marks</div>
                  <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{quiz.totalMarks} marks</div>
                </div>
              </div>
            </div>

            {/* In Progress Section */}
            {hasInProgress && inProgressInfo && (
              <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-full transition-colors duration-300">
                    <RotateCcw className="h-6 w-6 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 transition-colors duration-300">Quiz In Progress</h3>
                    <p className="text-orange-700 dark:text-orange-400 transition-colors duration-300">You have an unfinished quiz that you can continue</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3 transition-colors duration-300">
                    <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Progress</div>
                    <div className="text-orange-600 dark:text-orange-400 transition-colors duration-300">
                      Question {inProgressInfo.currentQuestion} of {inProgressInfo.totalQuestions}
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3 transition-colors duration-300">
                    <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Answered</div>
                    <div className="text-orange-600 dark:text-orange-400 transition-colors duration-300">
                      {inProgressInfo.answeredQuestions}/{inProgressInfo.totalQuestions} questions
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3 transition-colors duration-300">
                    <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Time Spent</div>
                    <div className="text-orange-600 dark:text-orange-400 transition-colors duration-300">
                      {inProgressInfo.isUnlimited ? 'Unlimited' : formatTime(inProgressInfo.timeSpent)}
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-3 transition-colors duration-300">
                    <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Status</div>
                    <div className="text-orange-600 dark:text-orange-400 transition-colors duration-300">Paused</div>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Continue Where You Left Off</span>
                </button>

                <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-800/30 rounded-lg transition-colors duration-300">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0 transition-colors duration-300" />
                    <div className="text-xs text-orange-800 dark:text-orange-300 transition-colors duration-300">
                      <strong>Note:</strong> Continuing will resume your quiz from where you left off.
                      Starting a new quiz will discard your current progress.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Time Selection Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center transition-colors duration-300">
                {hasInProgress ? 'Or Start a New Quiz' : 'Select Time Limit'}
              </h2>
              
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* No Time Limit Option */}
                <button
                  onClick={() => handleTimeSelection(NO_TIME_LIMIT)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${selectedTime === NO_TIME_LIMIT
                      ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-25 dark:hover:bg-green-900/20 text-gray-900 dark:text-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Infinity className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium transition-colors duration-300">No Limit</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Unlimited time</div>
                </button>

                {/* Regular Time Options */}
                {quiz.timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelection(time)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-center
                      ${selectedTime === time
                        ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-25 dark:hover:bg-primary-900/20 text-gray-900 dark:text-gray-200'
                      }
                    `}
                  >
                    <div className="text-2xl font-bold mb-1">{time}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">minutes</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Randomization Toggle */}
            {!hasInProgress && (
              <div className="mb-8 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="randomizeToggle"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="h-4 w-4 text-primary-600 dark:text-primary-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300"
                />
                <label htmlFor="randomizeToggle" className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Randomize Question Order
                </label>
              </div>
            )}


            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8 transition-colors duration-300">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 dark:text-yellow-400 mt-0.5 transition-colors duration-300">⚠️</div>
                <div className="text-yellow-800 dark:text-yellow-300 text-sm transition-colors duration-300">
                  <div className="font-medium mb-1">Important Instructions:</div>
                  <ul className="space-y-1">
                    <li>• Your progress is automatically saved as you answer questions</li>
                    <li>• You can safely close your browser and return later to continue</li>
                    <li>• Timer pauses when you leave and resumes when you return (timed quizzes only)</li>
                    <li>• You can navigate between questions freely</li>
                    <li>• All data is stored locally on your device - no information is sent to servers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Warning Popup Card */}
              {showTimeWarning && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-800 dark:text-red-300 flex items-center mb-4 transition-colors duration-300">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 transition-colors duration-300" />
                  <span>Please select a time limit before starting the quiz.</span>
                </div>
              )}
              
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors duration-200 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>

              {pastAttempt && (
                <button
                  onClick={() => onViewResults(quizId)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto"
                >
                  <span>View Past Results</span>
                </button>
              )}

              <button
                onClick={handleStart}
                className={`
                  flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto
                  ${selectedTime !== null
                    ? 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white transform hover:scale-105'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span>{hasInProgress ? 'Start New Quiz' : 'Start Quiz'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            

          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizSetup;