import React from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, Home, ChevronLeft, ChevronUp  } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuestionRenderer from '../components/QuestionRenderer';
import { useQuizStore } from '../store/quizStore';
import { useEffect, useState } from 'react';

interface QuizResultsProps {
  onGoHome: () => void;
  onRetakeQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ onGoHome, onRetakeQuiz }) => {
  const { currentQuiz, currentAttempt } = useQuizStore();

  const [showScrollTop, setShowScrollTop] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};



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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300">
      <Header currentQuiz={currentQuiz.title} />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-600/50 mb-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center transition-colors duration-300">
              <Award className="h-10 w-10 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Quiz Completed!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {currentQuiz.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
              <div className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Score</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">out of {totalMarks}</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300">{percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Percentage</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
              <div className={`text-2xl font-bold ${getGradeColor(getGrade(percentage))}`}>
                {getGrade(percentage)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Grade</div>
            </div>
            
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onGoHome}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
            
            <button
              onClick={onRetakeQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Question Review</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Review your answers and see the correct solutions
            </div>
          </div>
          
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = currentAttempt.answers[question.id];
            const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
            
            return (
              <div key={question.id} className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300">
                    Question {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 transition-colors duration-300" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 transition-colors duration-300" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {hasAnswer ? 'Answered' : 'Not answered'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300">
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
              onClick={onGoHome}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
              </button>
        </div>


        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

      </main>
      

      <Footer />
    </div>
  );
};

export default QuizResults;