import React, { useMemo } from 'react';
import { Question } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface MultipleChoiceQuestionProps {
  question: Question;
  showResults?: boolean;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const selectedAnswer = currentAttempt?.answers[question.id] as string;

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

  const handleAnswerChange = (answer: string) => {
    if (!showResults) {
      saveAnswer(question.id, answer);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      
      <div className="space-y-3">
        {shuffledOptions.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = showResults && option === question.answer;
          const isWrong = showResults && isSelected && option !== question.answer;
          
          let optionClass = "flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ";
          
          if (showResults) {
            if (isCorrect) {
              optionClass += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ";
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
                type="radio"
                name={question.id}
                value={option}
                checked={isSelected}
                onChange={() => handleAnswerChange(option)}
                disabled={showResults}
                className="sr-only"
              />
              
              <div className={`
                w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
                ${showResults
                  ? isCorrect
                    ? 'border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-400'
                    : isWrong
                    ? 'border-red-500 dark:border-red-400 bg-red-500 dark:bg-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                  : isSelected
                  ? 'border-primary-500 dark:border-primary-400 bg-primary-500 dark:bg-primary-400'
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {(isSelected || (showResults && isCorrect)) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              
              <span className="text-gray-900 dark:text-gray-200 flex-1 transition-colors duration-300">{option}</span>
              
              {showResults && isCorrect && (
                <div className="ml-2 text-green-600 dark:text-green-400 font-medium text-sm transition-colors duration-300">✓ Correct</div>
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

export default MultipleChoiceQuestion;