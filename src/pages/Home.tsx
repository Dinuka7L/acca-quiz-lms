import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Clock, Target, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizCard from '../components/QuizCard';
import { Quiz } from '../types/quiz';
import { getQuizzesBySubject, generateGradientClasses, getDefaultGradientColors } from '../utils/quizLoader';
import { useQuizStore } from '../store/quizStore';
import { motion, AnimatePresence } from "framer-motion";
import { ShootingStars } from '../components/ui/shooting-stars';
import { StarsBackground } from '../components/ui/stars-background';


interface HomeProps {
  onStartQuiz: (quizId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onStartQuiz }) => {
  const [quizzesBySubject, setQuizzesBySubject] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const { 
    quizzes,
    getQuizProgress, 
    getQuizScore, 
    attempts 
  } = useQuizStore();

  useEffect(() => {
    const organizeQuizzes = () => {
      try {
        if (quizzes.length > 0) {
          setQuizzesBySubject(getQuizzesBySubject(quizzes));
          
          // Expand Mock Final Exams by default
          setExpandedSubjects({ 'Mock Final Exams': true });
        }
      } catch (err) {
        setError('Failed to organize quizzes. Please try again later.');
        console.error('Error organizing quizzes:', err);
      }
    };

    organizeQuizzes();
  }, [quizzes]);

  // Show loading state if no quizzes are loaded yet
  useEffect(() => {
    if (quizzes.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [quizzes]);

  const getSubjectGradientColors = (subject: string, quizzes: Quiz[]): [string, string, string, string] => {
    // Try to get gradient colors from the first quiz in the subject
    const firstQuiz = quizzes[0];
    if (firstQuiz?.gradientColors) {
      return firstQuiz.gradientColors;
    }
    
    // Fallback to default colors based on category
    if (subject === 'Mock Final Exams') {
      return getDefaultGradientColors('mockFinal');
    }
    
    // For other subjects, try to determine from quiz categories
    const hasMockFinal = quizzes.some(q => q.category === 'mockFinal');
    return getDefaultGradientColors(hasMockFinal ? 'mockFinal' : 'lesson');
  };
        

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300">
      <Header />

      
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stars Container */}
          <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
            <StarsBackground starDensity={0.0010} className="h-full w-full" />
            <ShootingStars 
              minSpeed={3} 
              maxSpeed={10}   
              starColor="#9E00FF" 
              trailColor="#2EB9DF"
              starWidth={10}
              starHeight={3}
            />
          </div>

        {/* Header Container */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            ACCA Question Practics LMS
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Explore a comprehensive collection of quizzes organized by subjects. Practice with lesson quizzes and test your knowledge.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
           <i>Note to users: the questions and answers are generated via AI models and not fact checked. Therefore, please verify all information independently.</i>
          </p>
        </div>

        {/* Stats Summary */}
        <div className="mt-12 relative rounded-2xl p-6 bg-white/10 dark:bg-gray-900/20 
                backdrop-blur-xl backdrop-saturate-150 
                shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
                border border-white/20 dark:border-gray-700/20 overflow-hidden">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300">{quizzes.length}</div>
              <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Total Quizzes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                {quizzes.filter(q => getQuizProgress(q.id) === 100).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                {Object.keys(quizzesBySubject).filter(subject => subject !== "Mock Final Exams").length}
              </div>
              <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Subjects</div>
            </div>
          </div>
        </div>

        <div className="space-y-8 mt-5 mb-10">
          {Object.entries(quizzesBySubject).map(([subject, subjectQuizzes]) => {
            if (subjectQuizzes.length === 0) return null;
            
            const isExpanded = expandedSubjects[subject];
            const isMockFinal = subject === 'Mock Final Exams';
            
            // Get gradient colors for this subject
            const gradientColors = getSubjectGradientColors(subject, subjectQuizzes);
            const gradientClasses = generateGradientClasses(gradientColors);
            
            return (
              <div key={subject} className="relative">
                {/* Subject Header */}
                <div 
                  className="relative backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-600/30 overflow-hidden transition-colors duration-300"
                  style={{
                    background: `linear-gradient(to bottom right, ${gradientColors[0]}20, ${gradientColors[1]}15, ${gradientColors[2]}15, ${gradientColors[3]}20)`
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-10"
                    style={{
                      background: `linear-gradient(to bottom right, ${gradientColors[0]}, ${gradientColors[3]})`
                    }}
                  />
                  
                  <button
                    onClick={() => toggleSubject(subject)}
                    className="relative w-full p-6 text-left hover:bg-white/10 dark:hover:bg-gray-700/20 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="p-3 rounded-full shadow-lg text-white"
                          style={{
                            background: `linear-gradient(to bottom right, ${gradientColors[0]}, ${gradientColors[2]})`
                          }}
                        >
                          {getSubjectIcon(subject)}
                        </div>
                        <div>
                          <h2 
                            className="text-2xl font-bold bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${gradientColors[2]}, ${gradientColors[3]})`
                            }}
                          >
                            {subject}
                          </h2>
                          <p className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">
                            {subjectQuizzes.length} quiz{subjectQuizzes.length !== 1 ? 'es' : ''} available
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            {subjectQuizzes.filter(q => getQuizProgress(q.id) === 100).length} completed
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                            {Math.round((subjectQuizzes.filter(q => getQuizProgress(q.id) === 100).length / subjectQuizzes.length) * 100)}% progress
                          </div>
                        </div>
                        <ChevronRight 
                          className={`h-6 w-6 text-gray-600 dark:text-gray-400 transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                        />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Quiz Cards */}
                <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key="quiz-cards"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden mt-6 pl-4"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-5 mr-5 mt-5 items-stretch">
                    {[...subjectQuizzes]
                      .sort((a, b) => {
                        const extractNum = (title: string) => {
                          const match = title.match(/(\d+)/);
                          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
                        };
                        return extractNum(a.title) - extractNum(b.title);
                      })
                      .map((quiz) => (
                        <div key={quiz.id} className="h-full min-h-[150px]">
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
                        </div>
                      ))}

                  </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;