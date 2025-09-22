import React, { useMemo } from 'react';
import { Question } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface MultiSelectQuestionProps {
  question: Question;
  showResults?: boolean;
}

const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const selectedAnswers = (currentAttempt?.answers[question.id] as string[]) || [];
  const correctAnswers = question.answer as string[];

  // Memoize shuffled options to prevent re-shuffling on re-renders
  const shuffledOptions = useMemo(() => {
    if (!question.options) return [];
    
    // Create a stable shuffle based on question ID to ensure consistency
    const options = [...question.options];
    let seed = 0;
    for (let i = 0; i < question.id.length; i++) {
      seed += question.id.charCodeAt(i);
    }
    
    // Simple seeded shuffle algorithm
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor((seed * (i + 1)) % (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
      seed = (seed * 9301 + 49297) % 233280;
    }
    
    return options;
  }, [question.id, question.options]);

  const handleAnswerChange = (option: string) => {
    if (showResults) return;
    
    const newAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter(answer => answer !== option)
      : [...selectedAnswers, option];
    
    saveAnswer(question.id, newAnswers);
  };

  return (
    <div className="space-y-4">
      <div 
        className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
        Select all that apply
      </div>
      
      <div className="space-y-3">
        {shuffledOptions.map((option, index) => {
          const isSelected = selectedAnswers.includes(option);
          const isCorrect = showResults && correctAnswers.includes(option);
          const shouldBeSelected = showResults && correctAnswers.includes(option);
          const isWrong = showResults && isSelected && !correctAnswers.includes(option);
          
          let optionClass = "flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ";
          
          if (showResults) {
            if (isCorrect && isSelected) {
              optionClass += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ";
            } else if (shouldBeSelected && !isSelected) {
              optionClass += "border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 ";
            } else if (isWrong) {
              optionClass += "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 ";
            } else {
              optionClass += "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 ";
            }
          } else {
            if (isSelected) {
              optionClass += "border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 ";
            } else {
              optionClass += "border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-25 dark:hover:bg-primary-900/20 ";
            }
          }
          
          return (
            <label key={index} className={optionClass}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleAnswerChange(option)}
                disabled={showResults}
                className="sr-only"
              />
              
              <div className={`
                w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200
                ${showResults
                  ? isCorrect && isSelected
                    ? 'border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-400'
                    : shouldBeSelected && !isSelected
                    ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-500 dark:bg-yellow-400'
                    : isWrong
                    ? 'border-red-500 dark:border-red-400 bg-red-500 dark:bg-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                  : isSelected
                  ? 'border-primary-500 dark:border-primary-400 bg-primary-500 dark:bg-primary-400'
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <span className="text-gray-900 dark:text-gray-200 flex-1 transition-colors duration-300">{option}</span>
              
              {showResults && isCorrect && isSelected && (
                <div className="ml-2 text-green-600 dark:text-green-400 font-medium text-sm transition-colors duration-300">✓ Correct</div>
              )}
              {showResults && shouldBeSelected && !isSelected && (
                <div className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium text-sm transition-colors duration-300">⚠ Missed</div>
              )}
              {showResults && isWrong && (
                <div className="ml-2 text-red-600 dark:text-red-400 font-medium text-sm transition-colors duration-300">✗ Wrong</div>
              )}
            </label>
          );
        })}
      </div>
      
      {showResults && question.rationale && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
          <div className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-300">Explanation:</div>
          <div className="text-blue-800 dark:text-blue-400 transition-colors duration-300">{question.rationale}</div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectQuestion;