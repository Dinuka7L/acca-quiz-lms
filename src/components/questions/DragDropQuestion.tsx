import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Question, DragItem } from '../../types/quiz';
import { useQuizStore } from '../../store/quizStore';

interface DragDropQuestionProps {
  question: Question;
  showResults?: boolean;
}

interface DraggableItemProps {
  item: DragItem;
  isAssigned: boolean;
  showResults: boolean;
}

interface DropZoneProps {
  blankId: string;
  assignedItem?: DragItem;
  onDrop: (item: DragItem, blankId: string) => void;
  showResults: boolean;
  correctItem?: DragItem;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, isAssigned, showResults }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: item,
    canDrag: !showResults && !isAssigned,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`
        p-3 rounded-lg border-2 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105' : ''}
        ${showResults || isAssigned
          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-900 dark:text-gray-200'
          : 'border-primary-300 dark:border-primary-500 bg-white dark:bg-gray-800 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-25 dark:hover:bg-primary-900/20 cursor-move hover:shadow-md text-gray-900 dark:text-gray-200'
        }
      `}
    >
      <div className="font-medium text-center text-sm">{item.content}</div>
    </div>
  );
};

const DropZone: React.FC<DropZoneProps> = ({ blankId, assignedItem, onDrop, showResults, correctItem }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'item',
    drop: (item: DragItem) => onDrop(item, blankId),
    canDrop: () => !showResults,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const isCorrect = showResults && assignedItem && correctItem && assignedItem.id === correctItem.id;
  const isWrong = showResults && assignedItem && correctItem && assignedItem.id !== correctItem.id;

  return (
    <div
      ref={drop}
      className={`
        inline-block min-w-32 min-h-10 px-3 py-2 border-2 border-dashed rounded-lg transition-all duration-200 mx-1
        ${isOver && !showResults ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30' : ''}
        ${showResults
          ? isCorrect
            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30'
            : isWrong
            ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
          : 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500'
        }
      `}
    >
      {assignedItem ? (
        <div className={`
          text-center font-medium text-sm transition-colors duration-300
          ${showResults
            ? isCorrect
              ? 'text-green-800 dark:text-green-300'
              : isWrong
              ? 'text-red-800 dark:text-red-300'
              : 'text-gray-800 dark:text-gray-300'
            : 'text-gray-800 dark:text-gray-300'
          }
        `}>
          {assignedItem.content}
          {showResults && (
            <span className="ml-2">
              {isCorrect ? '✓' : isWrong ? '✗' : ''}
            </span>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm transition-colors duration-300">
          Drop here
        </div>
      )}
    </div>
  );
};

const DragDropQuestion: React.FC<DragDropQuestionProps> = ({ 
  question, 
  showResults = false 
}) => {
  const { currentAttempt, saveAnswer } = useQuizStore();
  const userAnswers = (currentAttempt?.answers[question.id] as Record<string, string>) || {};

  const handleDrop = (item: DragItem, blankId: string) => {
    if (showResults) return;

    const newAnswers = { ...userAnswers };
    
    // Remove item from all blanks
    Object.keys(newAnswers).forEach(blank => {
      if (newAnswers[blank] === item.id) {
        delete newAnswers[blank];
      }
    });
    
    // Add item to new blank
    newAnswers[blankId] = item.id;
    
    saveAnswer(question.id, newAnswers);
  };

  const getAssignedItem = (blankId: string): DragItem | undefined => {
    const itemId = userAnswers[blankId];
    return question.dragItems?.find(item => item.id === itemId);
  };

  const getCorrectItem = (blankId: string): DragItem | undefined => {
    return question.dragItems?.find(item => item.category === blankId);
  };

  const getUnassignedItems = (): DragItem[] => {
    const assignedIds = Object.values(userAnswers);
    return question.dragItems?.filter(item => !assignedIds.includes(item.id)) || [];
  };

  // Parse the question text to identify blanks
  const parseQuestionWithBlanks = (questionText: string) => {
    const parts = questionText.split(/(\[blank_\d+\])/g);
    return parts.map((part, index) => {
      const blankMatch = part.match(/\[blank_(\d+)\]/);
      if (blankMatch) {
        const blankId = `blank_${blankMatch[1]}`;
        return (
          <DropZone
            key={index}
            blankId={blankId}
            assignedItem={getAssignedItem(blankId)}
            onDrop={handleDrop}
            showResults={showResults}
            correctItem={getCorrectItem(blankId)}
          />
        );
      }
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed transition-colors duration-300">
          {parseQuestionWithBlanks(question.question)}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Drag the items below to fill in the blanks in the sentence above.
        </div>
        
        {!showResults && (
          <div>
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Available Items:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getUnassignedItems().map(item => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isAssigned={false}
                  showResults={showResults}
                />
              ))}
            </div>
          </div>
        )}
        
        {showResults && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
            <div className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-300">Correct answers:</div>
            <div className="space-y-2">
              {question.dragItems?.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <span className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{item.category.replace('blank_', 'Blank ')}</span>
                  <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">→</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200 transition-colors duration-300">{item.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DragDropQuestion;