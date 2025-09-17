import React from 'react';
import { Question } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface EssayQuestionProps {
  question: Question;
  showResults?: boolean;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const userAnswer = (currentAttempt?.answers[question.id] as string) || '';

  const handleAnswerChange = (value: string) => {
    if (!showResults) {
      // Check if answer is getting too long
      const maxLength = 10000; // 10k characters limit
      if (value.length > maxLength) {
        // Show warning but allow typing (truncation happens in store)
        if (value.length === maxLength + 1) {
          // Show warning only once when limit is first exceeded
          alert(`⚠️ Answer is getting very long (${value.length} characters). Consider being more concise to ensure your answer is saved properly.`);
        }
      }
      
      saveAnswer(question.id, value);
    }
  };

  // Calculate keyword match with custom threshold (default 4 keywords required for full marks)
  const calculateKeywordScore = (requiredKeywords: number = 4): { score: number; matchedCount: number } => {
    if (!userAnswer || !question.idealKeywords || question.idealKeywords.length === 0) {
      return { score: 0, matchedCount: 0 };
    }
    
    const normalizedAnswer = userAnswer.toLowerCase();
    let matchedKeywords = 0;
    
    question.idealKeywords.forEach(keyword => {
      if (normalizedAnswer.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    });
    
    // If matched keywords meet or exceed the required threshold, give full score
    if (matchedKeywords >= requiredKeywords) {
      return { score: 100, matchedCount: matchedKeywords };
    }
    
    // Otherwise, give partial score based on the percentage of required keywords found
    const score = (matchedKeywords / requiredKeywords) * 100;
    return { score, matchedCount: matchedKeywords };
  };

  const requiredKeywords = 4; // You can make this configurable per question if needed
  const { score: keywordScore, matchedCount } = showResults ? calculateKeywordScore(requiredKeywords) : { score: 0, matchedCount: 0 };
  const earnedMarks = showResults ? Math.round((keywordScore / 100) * question.marks * 100) / 100 : 0;

  // Check if answer was truncated
  const wasTruncated = userAnswer.includes('... [Answer truncated due to length]');
  const displayLength = wasTruncated ? userAnswer.length - 35 : userAnswer.length; // Subtract truncation message length

  return (
    <div className="space-y-4">
      <div 
        className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
        This is an essay question. Provide a comprehensive answer in the text area below.
        {question.idealKeywords && question.idealKeywords.length > 0 && (
          <span className="block mt-1 text-blue-600 dark:text-blue-400 transition-colors duration-300">
            💡 Try to include key concepts related to the topic for better scoring. (Need {requiredKeywords} key concepts for full marks)
          </span>
        )}
        <span className="block mt-1 text-orange-600 dark:text-orange-400 text-xs transition-colors duration-300">
          ⚠️ Keep answers concise (recommended under 10,000 characters) for optimal performance.
        </span>
      </div>
      
      <div className="space-y-4">
        <textarea
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          disabled={showResults}
          placeholder="Write your answer here..."
          rows={8}
          className={`
            w-full p-4 border-2 rounded-lg text-base leading-relaxed resize-vertical transition-all duration-200
            ${showResults
              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
              : userAnswer.length > 8000
              ? 'border-orange-300 dark:border-orange-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'
              : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'
            }
          `}
        />
        
        <div className="flex justify-between text-sm">
          <span className={`transition-colors duration-300 ${userAnswer.length > 8000 ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {displayLength.toLocaleString()} characters
            {wasTruncated && <span className="text-red-600 dark:text-red-400 ml-2 transition-colors duration-300">(Truncated for storage)</span>}
          </span>
          <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {userAnswer.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
        </div>
        
        {userAnswer.length > 8000 && !showResults && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg transition-colors duration-300">
            <div className="flex items-start space-x-2">
              <span className="text-orange-600 dark:text-orange-400 transition-colors duration-300">⚠️</span>
              <div className="text-orange-800 dark:text-orange-300 text-sm transition-colors duration-300">
                <strong>Long Answer Warning:</strong> Your answer is getting quite long. 
                Consider being more concise to ensure optimal performance and storage.
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showResults && (
        <div className="mt-6 space-y-4">
          {userAnswer && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
              <div className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Your answer:</div>
              <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed transition-colors duration-300">
                {userAnswer}
              </div>
              {wasTruncated && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm text-red-800 dark:text-red-300 transition-colors duration-300">
                  <strong>Note:</strong> Your original answer was longer but was truncated for storage efficiency. 
                  The scoring is based on the saved portion.
                </div>
              )}
            </div>
          )}
          
          <div className={`p-4 border rounded-lg ${keywordScore >= 70 ? 'bg-green-50 border-green-200' : keywordScore >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`font-medium mb-2 transition-colors duration-300 ${keywordScore >= 70 ? 'text-green-900 dark:text-green-300' : keywordScore >= 40 ? 'text-yellow-900 dark:text-yellow-300' : 'text-red-900 dark:text-red-300'}`}>
              📊 Auto-Evaluation Results
            </div>
            <div className={`mb-3 transition-colors duration-300 ${keywordScore >= 70 ? 'text-green-800 dark:text-green-400' : keywordScore >= 40 ? 'text-yellow-800 dark:text-yellow-400' : 'text-red-800 dark:text-red-400'}`}>
              <div className="flex items-center justify-between">
                <span>Keywords Found: {matchedCount}/{requiredKeywords} required (Total available: {question.idealKeywords?.length || 0})</span>
                <span className="font-bold">Score: {earnedMarks}/{question.marks} marks</span>
              </div>
              <div className="text-sm mt-1">
                {matchedCount >= requiredKeywords 
                  ? `✅ Full marks awarded! Found ${matchedCount} keywords (${requiredKeywords} required)`
                  : `⚠️ Partial marks: ${((matchedCount / requiredKeywords) * 100).toFixed(1)}% of required keywords found`
                }
              </div>
            </div>
            
            {question.idealKeywords && (
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Key concepts to include:</div>
                <div className="flex flex-wrap gap-2">
                  {question.idealKeywords.map((keyword, index) => {
                    const isIncluded = userAnswer.toLowerCase().includes(keyword.toLowerCase());
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                          isIncluded 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-600' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isIncluded ? '✓' : '○'} {keyword}
                      </span>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
                  Note: You need {requiredKeywords} keywords for full marks, but including more shows deeper understanding.
                </div>
              </div>
            )}
          </div>

          {question.rationale && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
              <div className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-300">Explanation:</div>
              <div className="text-blue-800 dark:text-blue-400 transition-colors duration-300">{question.rationale}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EssayQuestion;