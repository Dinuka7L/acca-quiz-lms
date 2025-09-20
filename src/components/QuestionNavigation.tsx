import React from 'react';
import { Flag, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';

const QuestionNavigation: React.FC = () => {
  const { 
    currentQuiz, 
    currentQuestionIndex, 
    questionStatuses, 
    setCurrentQuestion,
    toggleQuestionFlag 
  } = useQuizStore();

  if (!currentQuiz) return null;

  const getQuestionIcon = (questionId: string, index: number) => {
    const status = questionStatuses[questionId];
    
    if (status?.answered) {
      return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-300" />;
    } else if (status?.visited) {
      return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 transition-colors duration-300" />;
    }
  };

  const getQuestionButtonClass = (questionId: string, index: number) => {
    const status = questionStatuses[questionId];
    const isCurrent = index === currentQuestionIndex;
    
    let baseClass =
      "relative flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ";

    if (isCurrent) {
      baseClass +=
        "bg-primary-100 dark:bg-primary-900/30 border-primary-500 dark:border-primary-400 ";
    } else if (status?.answered) {
      baseClass +=
        "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/40 ";
    } else if (status?.visited) {
      baseClass +=
        "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/40 ";
    } else {
      baseClass +=
        "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 ";
    }
    
    return baseClass;
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Questions
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {currentQuestionIndex + 1} of {currentQuiz.questions.length}
        </div>
      </div>
      
      {/* Questions */}
      <div className="space-y-2 max-h-96 overflow-y-auto px-2 ">
        {currentQuiz.questions.map((question, index) => {
          const status = questionStatuses[question.id];
          
          return (
            <div key={question.id} className="relative">
              <button
                onClick={() => setCurrentQuestion(index)}
                className={getQuestionButtonClass(question.id, index)}
              >
                <div className="flex items-center space-x-3">
                  {getQuestionIcon(question.id, index)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Q{index + 1}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {status?.flagged && (
                    <Flag className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 transition-colors duration-100" />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    &nbsp;{question.marks}pts
                  </span>
                </div>
              </button>
              
              {/* Flag button */}
              <button
                onClick={() => toggleQuestionFlag(question.id)}
                className="absolute -top-1 mt-3 -right-1 p-1 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-100"
                title={status?.flagged ? 'Remove flag' : 'Flag for review'}
              >
                <Flag
                  className={`h-3 w-3 transition-colors duration-100 ${
                    status?.flagged
                      ? 'text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 transition-colors duration-300" />
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Answered
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Visited
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="h-3 w-3 text-gray-300 dark:text-gray-600 transition-colors duration-300" />
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Not visited
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Flag className="h-3 w-3 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 transition-colors duration-300" />
            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Flagged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;
