import React from 'react';
import { Clock, CheckCircle, Circle, Play, RotateCcw } from 'lucide-react';
import { Quiz } from '../types/quiz';
import { useQuizStore } from '../store/quizStore';
import { getDefaultGradientColors, generateGradientClasses } from '../utils/quizLoader';

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
  
  // Get gradient colors from quiz or use defaults
  const gradientColors = quiz.gradientColors || getDefaultGradientColors(quiz.category);
  const gradientClasses = generateGradientClasses(gradientColors);
  
  // Generate button colors based on the gradient
  const buttonColor = gradientColors[2]; // Use the third color for buttons
  const buttonHoverColor = gradientColors[3]; // Use the fourth color for hover

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
        className={`absolute inset-0 ${gradientClasses} rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300`}
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
              className={`h-2 rounded-full transition-all duration-200
                ${hasInProgress 
                  ? 'bg-orange-500' 
                  : hasPastAttempt 
                    ? 'bg-green-500' 
                    : ''
                }`}
              style={{ 
                width: `${progressInfo.percentage}%`,
                backgroundColor: hasInProgress 
                  ? '#f97316' 
                  : hasPastAttempt 
                    ? '#10b981' 
                    : buttonColor
              }}
            />
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
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
          className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group hover:transform hover:scale-105
            ${hasInProgress 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : hasPastAttempt 
                ? 'bg-green-600 hover:bg-green-700' 
                : ''
            } 
            text-white`}
          style={{
            backgroundColor: hasInProgress 
              ? '#ea580c' 
              : hasPastAttempt 
                ? '#059669' 
                : buttonColor
          }}
          onMouseEnter={(e) => {
            if (!hasInProgress && !hasPastAttempt) {
              e.currentTarget.style.backgroundColor = buttonHoverColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!hasInProgress && !hasPastAttempt) {
              e.currentTarget.style.backgroundColor = buttonColor;
            }
          }}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default QuizCard;