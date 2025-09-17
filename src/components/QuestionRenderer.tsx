import React from 'react';
import { Question } from '../types/quiz';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import MultiSelectQuestion from './questions/MultiSelectQuestion';
import FillInBlankQuestion from './questions/FillInBlankQuestion';
import EssayQuestion from './questions/EssayQuestion';
import DragDropQuestion from './questions/DragDropQuestion';
import MatchingQuestion from './questions/MatchingQuestion';
import DropdownQuestion from './questions/DropdownQuestion';

interface QuestionRendererProps {
  question: Question;
  showResults?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, showResults = false }) => {
  // Function to format Python code blocks in question text
  const formatQuestionText = (text: string) => {
    // Replace ```python code blocks with properly formatted code
    const formattedText = text.replace(
      /```python\n([\s\S]*?)\n```/g,
      (match, code) => {
        return `<div class="my-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <pre class="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto"><code>${code.trim()}</code></pre>
        </div>`;
      }
    );

    // Also handle inline code with backticks for Python keywords/functions
    const withInlineCode = formattedText.replace(
      /`([^`]+)`/g,
      '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">$1</code>'
    );

    return withInlineCode;
  };

  const renderQuestion = () => {
    const formattedQuestion = { ...question, question: formatQuestionText(question.question) };
    
    switch (question.type) {
      case 'multipleChoice':
        return <MultipleChoiceQuestion question={formattedQuestion} showResults={showResults} />;
      case 'multiSelect':
        return <MultiSelectQuestion question={formattedQuestion} showResults={showResults} />;
      case 'fillInBlank':
        return <FillInBlankQuestion question={formattedQuestion} showResults={showResults} />;
      case 'essay':
        return <EssayQuestion question={formattedQuestion} showResults={showResults} />;
      case 'dragDrop':
        return <DragDropQuestion question={formattedQuestion} showResults={showResults} />;
      case 'matching':
        return <MatchingQuestion question={formattedQuestion} showResults={showResults} />;
      case 'dropdown':
        return <DropdownQuestion question={formattedQuestion} showResults={showResults} />;
      default:
        return <div className="text-red-500">Unsupported question type: {question.type}</div>;
    }
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      multiSelect: 'Multiple Select',
      fillInBlank: 'Fill in the Blank',
      essay: 'Essay',
      dragDrop: 'Drag & Drop',
      matching: 'Matching',
      dropdown: 'Dropdown'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300">
            {getQuestionTypeLabel(question.type)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </div>
        </div>
      </div>
      
      {/* Display image if provided */}
      {question.image && (
        <div className="mb-6">
          <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <img
              src={question.image}
              alt={question.imageAlt || 'Question image'}
              className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
              style={{ maxHeight: '400px' }}
            />
            {question.imageAlt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center italic transition-colors duration-300">
                {question.imageAlt}
              </p>
            )}
          </div>
        </div>
      )}
      
      {renderQuestion()}
    </div>
  );
};

export default QuestionRenderer;