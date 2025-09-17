import React from 'react';
import { Question } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface DropdownQuestionProps {
  question: Question;
  showResults?: boolean;
}

const DropdownQuestion: React.FC<DropdownQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const userAnswers = (currentAttempt?.answers[question.id] as Record<string, string>) || {};

  const handleDropdownChange = (blankId: string, value: string) => {
    if (showResults) return;
    
    const newAnswers = { ...userAnswers };
    newAnswers[blankId] = value;
    
    saveAnswer(question.id, newAnswers);
  };

  const getDropdownBlank = (blankId: string) => {
    return question.dropdownBlanks?.find(blank => blank.id === blankId);
  };

  const isCorrectAnswer = (blankId: string): boolean => {
    const blank = getDropdownBlank(blankId);
    return blank ? userAnswers[blankId] === blank.correctAnswer : false;
  };

  const isWrongAnswer = (blankId: string): boolean => {
    const blank = getDropdownBlank(blankId);
    return blank ? userAnswers[blankId] && userAnswers[blankId] !== blank.correctAnswer : false;
  };

  // Parse the question text to identify dropdown blanks
  const parseQuestionWithDropdowns = (questionText: string) => {
    const parts = questionText.split(/(\[dropdown_\d+\])/g);
    return parts.map((part, index) => {
      const dropdownMatch = part.match(/\[dropdown_(\d+)\]/);
      if (dropdownMatch) {
        const blankId = `dropdown_${dropdownMatch[1]}`;
        const blank = getDropdownBlank(blankId);
        
        if (!blank) return <span key={index} className="text-red-500">[Invalid dropdown]</span>;
        
        const selectedValue = userAnswers[blankId] || '';
        const isCorrect = showResults && isCorrectAnswer(blankId);
        const isWrong = showResults && isWrongAnswer(blankId);
        
        return (
          <select
            key={index}
            value={selectedValue}
            onChange={(e) => handleDropdownChange(blankId, e.target.value)}
            disabled={showResults}
            className={`
              mx-1 px-3 py-1 border-2 rounded-md font-medium transition-all duration-200
              ${showResults
                ? isCorrect
                  ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : isWrong
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'
              }
            `}
          >
            <option value="">Select...</option>
            {blank.options.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300">
        {parseQuestionWithDropdowns(question.question)}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
        Select the correct option from each dropdown menu to complete the sentence.
      </div>
      
      {showResults && (
        <div className="space-y-4">
          {question.dropdownBlanks?.map((blank, index) => {
            const userAnswer = userAnswers[blank.id];
            const isCorrect = userAnswer === blank.correctAnswer;
            
            return (
              <div key={blank.id} className={`p-3 rounded-lg border transition-colors duration-300 ${isCorrect ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30' : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30'}`}>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  {blank.id.replace('dropdown_', 'Dropdown ')}:
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Your answer: </span>
                    <span className={`font-medium transition-colors duration-300 ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                      {userAnswer || 'Not answered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Correct: </span>
                    <span className="font-medium text-green-800 dark:text-green-300 transition-colors duration-300">{blank.correctAnswer}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {question.rationale && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-300">Explanation:</div>
              <div className="text-blue-800 dark:text-blue-400 transition-colors duration-300">{question.rationale}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownQuestion;