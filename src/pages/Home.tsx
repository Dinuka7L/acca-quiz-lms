import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Clock, Target, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizCard from '../components/QuizCard';
import { Quiz } from '../types/quiz';
import { loadAllQuizzes, getQuizzesBySubject } from '../utils/quizLoader';
import { useQuizStore } from '../store/quizStore';

interface HomeProps {
  onStartQuiz: (quizId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesBySubject, setQuizzesBySubject] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const { 
    getQuizProgress, 
    getQuizScore, 
    attempts 
  } = useQuizStore();

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const allQuizzes = await loadAllQuizzes();
        setQuizzes(allQuizzes);
        setQuizzesBySubject(getQuizzesBySubject(allQuizzes));
        
        // Expand Mock Final Exams by default
        setExpandedSubjects({ 'Mock Final Exams': true });
      } catch (err) {
        setError('Failed to load quizzes. Please try again later.');
        console.error('Error loading quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  const getSubjectIcon = (subject: string) => {
    if (subject === 'Mock Final Exams') {
      return <GraduationCap className="h-6 w-6" />;
    }
    return <BookOpen className="h-6 w-6" />;
  };

  const getSubjectColor = (subject: string) => {
    if (subject === 'Mock Final Exams') {
      return 'from-purple-500 to-indigo-600';
    }
    return 'from-blue-500 to-teal-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Quizzes</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            USJ - FMSC First Year Quizzess by 2023/2024 Batch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of quizzes organized by subject. Practice with lesson quizzes or test your knowledge with mock final exams.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(quizzesBySubject).map(([subject, subjectQuizzes]) => {
            if (subjectQuizzes.length === 0) return null;
            
            const isExpanded = expandedSubjects[subject];
            const isMockFinal = subject === 'Mock Final Exams';
            
            return (
              <div key={subject} className="relative">
                {/* Subject Header */}
                <div 
                  className={`relative bg-gradient-to-br ${isMockFinal ? 'from-purple-100/60 via-indigo-50/40 to-blue-100/60' : 'from-blue-100/60 via-cyan-50/40 to-teal-100/60'} backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${isMockFinal ? 'from-purple-500/10 to-blue-500/10' : 'from-blue-500/10 to-teal-500/10'} rounded-2xl`} />
                  
                  <button
                    onClick={() => toggleSubject(subject)}
                    className="relative w-full p-6 text-left hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-gradient-to-br ${getSubjectColor(subject)} rounded-full shadow-lg text-white`}>
                          {getSubjectIcon(subject)}
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold bg-gradient-to-r ${isMockFinal ? 'from-purple-700 to-indigo-700' : 'from-blue-700 to-teal-700'} bg-clip-text text-transparent`}>
                            {subject}
                          </h2>
                          <p className="text-gray-700 font-medium">
                            {subjectQuizzes.length} quiz{subjectQuizzes.length !== 1 ? 'es' : ''} available
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {subjectQuizzes.filter(q => getQuizProgress(q.id) === 100).length} completed
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((subjectQuizzes.filter(q => getQuizProgress(q.id) === 100).length / subjectQuizzes.length) * 100)}% progress
                          </div>
                        </div>
                        <ChevronRight 
                          className={`h-6 w-6 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                        />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Quiz Cards */}
                {isExpanded && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pl-4">
                    {subjectQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        progress={getQuizProgress(quiz.id)}
                        score={getQuizScore(quiz.id)}
                        onStart={() => onStartQuiz(quiz.id)}
                        hasPastAttempt={attempts.some(
                          a =>
                            a.quizId === quiz.id &&
                            a.isCompleted &&
                            a.answers &&
                            Object.keys(a.answers).length > 0
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">{quizzes.length}</div>
              <div className="text-gray-600">Total Quizzes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {quizzes.filter(q => getQuizProgress(q.id) === 100).length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {Object.keys(quizzesBySubject).length}
              </div>
              <div className="text-gray-600">Subjects</div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;