import React, { useState, useMemo } from 'react';
import { Question, MatchPair } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface MatchingQuestionProps {
  question: Question;
  showResults?: boolean;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const userAnswers = (currentAttempt?.answers[question.id] as Record<string, string>) || {};
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Memoize the shuffled right items to prevent re-shuffling on re-renders
  const shuffledRightItems = useMemo(() => {
    const rightItems = question.matchPairs?.map(p => p.right) || [];
    // Create a stable shuffle based on question ID to ensure consistency
    const items = [...rightItems];
    let seed = 0;
    for (let i = 0; i < question.id.length; i++) {
      seed += question.id.charCodeAt(i);
    }
    
    // Simple seeded shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor((seed * (i + 1)) % (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
      seed = (seed * 9301 + 49297) % 233280;
    }
    
    return items;
  }, [question.id, question.matchPairs]);

  const handleLeftClick = (leftItem: string) => {
    if (showResults) return;
    setSelectedLeft(selectedLeft === leftItem ? null : leftItem);
  };

  const handleRightClick = (rightItem: string) => {
    if (showResults || !selectedLeft) return;
    
    const newAnswers = { ...userAnswers };
    
    // Remove any existing match for this right item
    Object.keys(newAnswers).forEach(left => {
      if (newAnswers[left] === rightItem) {
        delete newAnswers[left];
      }
    });
    
    // Add new match
    newAnswers[selectedLeft] = rightItem;
    
    saveAnswer(question.id, newAnswers);
    setSelectedLeft(null);
  };

  const getMatchForLeft = (leftItem: string): string | undefined => {
    return userAnswers[leftItem];
  };

  const getCorrectMatchForLeft = (leftItem: string): string => {
    const pair = question.matchPairs?.find(p => p.left === leftItem);
    return pair?.right || '';
  };

  const isCorrectMatch = (leftItem: string): boolean => {
    return userAnswers[leftItem] === getCorrectMatchForLeft(leftItem);
  };

  const leftItems = question.matchPairs?.map(p => p.left) || [];

  return (
    <div className="space-y-6">
      <div
        className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      
      <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
        Click on items from the left column, then click on the corresponding item from the right column to create matches.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="font-medium text-gray-700 dark:text-gray-300 text-center mb-4 transition-colors duration-300">Match these items:</div>
          {leftItems.map((leftItem, index) => {
            const isSelected = selectedLeft === leftItem;
            const matchedRight = getMatchForLeft(leftItem);
            const isMatched = !!matchedRight;
            const isCorrect = showResults && isCorrectMatch(leftItem);
            
            let itemClass = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
            
            if (showResults) {
              if (isCorrect) {
                itemClass += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 ";
              } else if (isMatched) {
                itemClass += "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30 ";
              } else {
                itemClass += "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 ";
              }
            } else {
              if (isSelected) {
                itemClass += "border-primary-500 dark:border-primary-400 bg-primary-100 dark:bg-primary-900/30 ";
              } else if (isMatched) {
                itemClass += "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ";
              } else {
                itemClass += "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-25 dark:hover:bg-primary-900/20 ";
              }
            }
            
            return (
              <div
                key={index}
                onClick={() => handleLeftClick(leftItem)}
                className={itemClass}
              >
                <div className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{leftItem}</div>
                {matchedRight && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
                    → {matchedRight}
                    {showResults && (
                      <span className={`ml-2 font-bold transition-colors duration-300 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Right Column */}
        <div className="space-y-3">
          <div className="font-medium text-gray-700 dark:text-gray-300 text-center mb-4 transition-colors duration-300">With these items:</div>
          {shuffledRightItems.map((rightItem, index) => {
            const isUsed = Object.values(userAnswers).includes(rightItem);
            const canSelect = selectedLeft && !showResults;
            
            let itemClass = "p-4 rounded-lg border-2 transition-all duration-200 ";
            
            if (showResults) {
              itemClass += "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 ";
            } else {
              if (canSelect) {
                itemClass += "border-primary-300 dark:border-primary-500 bg-primary-25 dark:bg-primary-900/20 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer ";
              } else if (isUsed) {
                itemClass += "border-blue-300 dark:border-blue-500 bg-blue-25 dark:bg-blue-900/20 cursor-not-allowed ";
              } else {
                itemClass += "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-not-allowed ";
              }
            }
            
            return (
              <div
                key={index}
                onClick={() => handleRightClick(rightItem)}
                className={itemClass}
              >
                <div className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{rightItem}</div>
                {isUsed && !showResults && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300">Used</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {showResults && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
          <div className="font-medium text-blue-900 dark:text-blue-300 mb-3 transition-colors duration-300">Correct matches:</div>
          <div className="space-y-2">
            {question.matchPairs?.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <span className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{pair.left}</span>
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">→</span>
                <span className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{pair.right}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingQuestion;