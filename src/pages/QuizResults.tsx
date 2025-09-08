import React from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, Home, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuestionRenderer from '../components/QuestionRenderer';
import { useQuizStore } from '../store/quizStore';

interface QuizResultsProps {
  onReturnHome: () => void;
  onRetakeQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ onReturnHome, onRetakeQuiz }) => {
  const { currentQuiz, currentAttempt } = useQuizStore();

  if (!currentQuiz || !currentAttempt || !currentAttempt.isCompleted) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">No past results available for this quiz.</p>
    </div>
  );
}

  const score = currentAttempt.score || 0;
  const percentage = currentAttempt.percentage || 0;
  const totalMarks = currentQuiz.totalMarks;
  const weightedScore = (percentage / 100) * currentQuiz.weight;

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header currentQuiz={currentQuiz.title} />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 mb-8">
          <div className="text-center mb-8">
            <div className="p-4 bg-primary-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-10 w-10 text-primary-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600">
              {currentQuiz.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-xs text-gray-500">out of {totalMarks}</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getGradeColor(getGrade(percentage))}`}>
                {getGrade(percentage)}
              </div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{weightedScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Weighted Score</div>
              <div className="text-xs text-gray-500">of {currentQuiz.weight}% total</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onReturnHome}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
            
            <button
              onClick={onRetakeQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Question Review</h2>
            <div className="text-sm text-gray-600">
              Review your answers and see the correct solutions
            </div>
          </div>
          
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = currentAttempt.answers[question.id];
            const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
            
            return (
              <div key={question.id} className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    Question {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {hasAnswer ? 'Answered' : 'Not answered'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </div>
                </div>
                
                <QuestionRenderer question={question} showResults={true} />

                
              </div>
            );
          })}

        </div>
        <div className="flex justify-center mt-8">
        <button
              onClick={onReturnHome}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
              </button>
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default QuizResults;