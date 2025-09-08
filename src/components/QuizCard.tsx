import React from 'react';
import { Clock, CheckCircle, Circle, Play, RotateCcw } from 'lucide-react';
import { Quiz } from '../types/quiz';
import { useQuizStore } from '../store/quizStore';

interface QuizCardProps {
  quiz: Quiz;
  progress: number;
  score: number;
  onStart: () => void;
  hasPastAttempt: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  progress,
  score,
  onStart,
  hasPastAttempt
}) => {
  const { hasInProgressQuiz, getInProgressAttempt } = useQuizStore();
  
  const hasInProgress = hasInProgressQuiz(quiz.id);
  const inProgressAttempt = getInProgressAttempt(quiz.id);
  
  const theme = getThemeColors();

  function getThemeColors() {
    if (quiz.category === 'lesson') {
      return {
        gradient: 'from-blue-600 to-blue-800',
        progressBg: 'from-blue-500 to-blue-700',
        buttonBg: 'bg-blue-700 hover:bg-blue-800',
        buttonText: 'text-white'
      };
    } else {
      // Mock final exams keep the purple theme
      return {
        gradient: 'from-purple-500 to-purple-700',
        progressBg: 'from-purple-500 to-purple-600',
        buttonBg: 'bg-purple-600 hover:bg-purple-700',
        buttonText: 'text-white'
      };
    }
  }

  const getButtonText = () => {
    if (hasInProgress) {
      return 'Continue Quiz';
    } else if (hasPastAttempt) {
      return 'View Past Results / Retake Quiz';
    } else {
      return 'Start Quiz';
    }
  };

  const getButtonIcon = () => {
    if (hasInProgress) {
      return <RotateCcw className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />;
    } else {
      return <Play className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />;
    }
  };

  const getProgressInfo = () => {
    if (hasInProgress && inProgressAttempt) {
      const answeredQuestions = Object.keys(inProgressAttempt.answers).length;
      const totalQuestions = quiz.questions.length;
      const progressPercentage = (answeredQuestions / totalQuestions) * 100;
      
      return {
        percentage: progressPercentage,
        text: `${answeredQuestions}/${totalQuestions} questions answered`
      };
    }
    
    return {
      percentage: progress,
      text: `${progress}%`
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300`}
      />

      <div className="relative bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]">
        {hasInProgress && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            In Progress
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {quiz.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            {hasPastAttempt ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-gray-300" />
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{progressInfo.text}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`w-full 
                ${hasInProgress 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : hasPastAttempt 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : theme.buttonBg
                } 
                ${theme.buttonText} font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 group`}

              style={{ width: `${progressInfo.percentage}%` }}
            />
          </div>

          {!hasInProgress && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Score</span>
              <span className="font-medium text-gray-900">
                {score.toFixed(1)}%
                {quiz.category === 'mockFinal' && quiz.weight > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Weight: {quiz.weight}%)
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {hasInProgress && inProgressAttempt?.isUnlimited 
                ? 'Unlimited time' 
                : quiz.timeOptions.length > 0 
                  ? `${quiz.timeOptions.join(', ')} minutes available`
                  : 'No time limit'
              }
            </span>
          </div>
        </div>

        <button
          onClick={onStart}
          className={`w-full 
            ${hasInProgress 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : hasPastAttempt 
                ? 'bg-green-600 hover:bg-green-700' 
                : theme.buttonBg
            } 
            ${theme.buttonText} font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 group`}

        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default QuizCard;