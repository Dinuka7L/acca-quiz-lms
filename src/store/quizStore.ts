import { create } from 'zustand';
import { Quiz, QuizAttempt, QuizState, QuestionStatus } from '../types/quiz';
import { persist, createJSONStorage } from 'zustand/middleware';

// Storage management utilities
const STORAGE_LIMITS = {
  MAX_ANSWER_LENGTH: 10000, // 10k characters per answer
  MAX_TOTAL_SIZE: 4 * 1024 * 1024, // 4MB total storage limit
  WARNING_SIZE: 3 * 1024 * 1024, // 3MB warning threshold
};

const storageUtils = {
  // Calculate size of data in bytes
  getDataSize: (data: any): number => {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Fallback estimation
    }
  },

  // Check if storage is approaching limits
  isStorageNearLimit: (data: any): boolean => {
    return storageUtils.getDataSize(data) > STORAGE_LIMITS.WARNING_SIZE;
  },

  // Truncate answer if too long
  truncateAnswer: (answer: any, maxLength: number = STORAGE_LIMITS.MAX_ANSWER_LENGTH): any => {
    if (typeof answer === 'string' && answer.length > maxLength) {
      return answer.substring(0, maxLength) + '... [Answer truncated due to length]';
    }
    return answer;
  },

  // Clean up old attempts to free space
  cleanupOldAttempts: (attempts: QuizAttempt[]): QuizAttempt[] => {
    // Keep only the latest 3 completed attempts per quiz
    const attemptsByQuiz = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.quizId]) acc[attempt.quizId] = [];
      acc[attempt.quizId].push(attempt);
      return acc;
    }, {} as Record<string, QuizAttempt[]>);

    const cleanedAttempts: QuizAttempt[] = [];
    
    Object.values(attemptsByQuiz).forEach(quizAttempts => {
      // Sort by completion time, keep latest completed attempts
      const completed = quizAttempts
        .filter(a => a.isCompleted)
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
        .slice(0, 3);
      
      // Keep all incomplete attempts (in progress)
      const incomplete = quizAttempts.filter(a => !a.isCompleted);
      
      cleanedAttempts.push(...completed, ...incomplete);
    });

    return cleanedAttempts;
  },

  // Emergency storage cleanup
  emergencyCleanup: (state: any): any => {
    try {
      // Remove non-essential data
      const cleanedState = {
        ...state,
        attempts: storageUtils.cleanupOldAttempts(state.attempts || []),
      };

      // Truncate long answers in current attempt
      if (cleanedState.currentAttempt?.answers) {
        const truncatedAnswers: Record<string, any> = {};
        Object.entries(cleanedState.currentAttempt.answers).forEach(([key, value]) => {
          truncatedAnswers[key] = storageUtils.truncateAnswer(value);
        });
        cleanedState.currentAttempt.answers = truncatedAnswers;
      }

      // Truncate answers in all attempts
      cleanedState.attempts = cleanedState.attempts.map((attempt: QuizAttempt) => ({
        ...attempt,
        answers: Object.fromEntries(
          Object.entries(attempt.answers || {}).map(([key, value]) => [
            key,
            storageUtils.truncateAnswer(value)
          ])
        )
      }));

      return cleanedState;
    } catch (error) {
      // Ultimate fallback - return minimal state
      return {
        ...state,
        attempts: [],
        currentAttempt: null,
        currentQuiz: null,
      };
    }
  }
};

interface QuizStore extends QuizState {
  randomizeQuestions: boolean;
  // Actions
  setQuizzes: (quizzes: Quiz[]) => void;
  startQuiz: (quizId: string, timeLimit: number) => void;
  setCurrentQuestion: (index: number) => void;
  saveAnswer: (questionId: string, answer: any) => void;
  toggleQuestionFlag: (questionId: string) => void;
  submitQuiz: (isAutoSubmit?: boolean) => void;
  setTimeRemaining: (time: number) => void;
  setTimerRunning: (running: boolean) => void;
  resetQuiz: () => void;
  getQuizProgress: (quizId: string) => number;
  getQuizScore: (quizId: string) => number;
  getTotalMarksObtained: () => number;
  getTotalPossibleMarks: () => number;
  // Methods for mock final exams
  getMockFinalProgress: () => number;
  getMockFinalMarksObtained: () => number;
  getMockFinalTotalMarks: () => number;
  getLessonQuizzes: () => Quiz[];
  getMockFinalQuizzes: () => Quiz[];
  // New method for calculating actual time remaining
  calculateTimeRemaining: () => number;
  setRandomizeQuestions: (value: boolean) => void;
  setCurrentAttemptAndQuiz: (attempt: QuizAttempt, quiz: Quiz) => void;
  // New methods for progress saving
  pauseQuiz: () => void;
  resumeQuiz: (quizId: string) => void;
  hasInProgressQuiz: (quizId: string) => boolean;
  getInProgressAttempt: (quizId: string) => QuizAttempt | null;
  saveProgress: () => void;
  // Storage management
  checkStorageHealth: () => { isHealthy: boolean; size: number; warning?: string };
  cleanupStorage: () => void;
}

const createInitialState = (): QuizState & {
  randomizeQuestions: boolean;
} => ({
  randomizeQuestions: true,
  quizzes: [],
  attempts: [],
  currentQuiz: null,
  currentAttempt: null,
  currentQuestionIndex: 0,
  questionStatuses: {},
  timeRemaining: 0,
  isTimerRunning: false,
});

// Function to shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to normalize text for comparison (handles typos and variations)
const normalizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Function to check if two strings are similar (handles minor typos)
const isSimilarText = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || !correctAnswer) return false;
  if (typeof userAnswer !== 'string' || typeof correctAnswer !== 'string') return false;
  
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);
  
  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) return true;
  
  // Check for minor typos using Levenshtein distance
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
  
  // Allow up to 20% character differences for typos
  const threshold = Math.ceil(maxLength * 0.2);
  return distance <= threshold;
};

// Levenshtein distance algorithm for typo detection
const levenshteinDistance = (str1: string, str2: string): number => {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);
  
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Updated function to calculate essay score based on keywords with custom threshold
const calculateEssayScore = (userAnswer: string, idealKeywords: string[], requiredKeywords: number = 4): number => {
  if (!userAnswer || !idealKeywords || idealKeywords.length === 0) return 0;
  if (typeof userAnswer !== 'string') return 0;
  
  const normalizedAnswer = normalizeText(userAnswer);
  let matchedKeywords = 0;
  
  idealKeywords.forEach(keyword => {
    if (keyword && typeof keyword === 'string') {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword && normalizedAnswer.includes(normalizedKeyword)) {
        matchedKeywords++;
      }
    }
  });
  
  // If matched keywords meet or exceed the required threshold, give full marks
  if (matchedKeywords >= requiredKeywords) {
    return 100;
  }
  
  // Otherwise, give partial marks based on the percentage of required keywords found
  return (matchedKeywords / requiredKeywords) * 100;
};

// Robust scoring function with comprehensive error handling
const calculateQuestionScore = (question: any, userAnswer: any): { score: number; maxScore: number } => {
  try {
    const maxScore = question.marks || 0;
    
    if (!question || typeof question !== 'object') {
      return { score: 0, maxScore };
    }

    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return { score: 0, maxScore };
    }

    switch (question.type) {
      case 'essay': {
        if (question.idealKeywords && Array.isArray(question.idealKeywords) && question.idealKeywords.length > 0) {
          const requiredKeywords = 4;
          const essayScore = calculateEssayScore(userAnswer, question.idealKeywords, requiredKeywords);
          return { score: (essayScore / 100) * maxScore, maxScore };
        }
        return { score: 0, maxScore };
      }

      case 'multipleChoice': {
        if (!question.answer) {
          return { score: 0, maxScore };
        }
        return { score: userAnswer === question.answer ? maxScore : 0, maxScore };
      }

      case 'multiSelect': {
        if (!Array.isArray(question.answer)) {
          return { score: 0, maxScore };
        }
        if (!Array.isArray(userAnswer)) {
          return { score: 0, maxScore };
        }
        
        const correctAnswers = question.answer.sort();
        const userAnswers = userAnswer.sort();
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
        return { score: isCorrect ? maxScore : 0, maxScore };
      }

      case 'fillInBlank': {
        if (!question.answer || typeof question.answer !== 'string') {
          return { score: 0, maxScore };
        }
        if (typeof userAnswer !== 'string') {
          return { score: 0, maxScore };
        }
        
        const isCorrect = isSimilarText(userAnswer, question.answer);
        return { score: isCorrect ? maxScore : 0, maxScore };
      }

      case 'dragDrop': {
        if (!Array.isArray(question.dragItems)) {
          return { score: 0, maxScore };
        }
        if (!userAnswer || typeof userAnswer !== 'object') {
          return { score: 0, maxScore };
        }
        
        let correctCount = 0;
        let totalBlanks = 0;
        
        question.dragItems.forEach((item: any) => {
          if (item && item.category && item.id) {
            totalBlanks++;
            if (userAnswer[item.category] === item.id) {
              correctCount++;
            }
          }
        });
        
        const isCorrect = correctCount === totalBlanks && totalBlanks > 0;
        return { score: isCorrect ? maxScore : 0, maxScore };
      }

      case 'matching': {
        if (!Array.isArray(question.matchPairs)) {
          return { score: 0, maxScore };
        }
        if (!userAnswer || typeof userAnswer !== 'object') {
          return { score: 0, maxScore };
        }
        
        let correctCount = 0;
        let totalPairs = question.matchPairs.length;
        
        question.matchPairs.forEach((pair: any) => {
          if (pair && pair.left && pair.right) {
            if (userAnswer[pair.left] === pair.right) {
              correctCount++;
            }
          }
        });
        
        const isCorrect = correctCount === totalPairs && totalPairs > 0;
        return { score: isCorrect ? maxScore : 0, maxScore };
      }

      case 'dropdown': {
        if (!Array.isArray(question.dropdownBlanks)) {
          return { score: 0, maxScore };
        }
        if (!userAnswer || typeof userAnswer !== 'object') {
          return { score: 0, maxScore };
        }
        
        let correctCount = 0;
        let totalBlanks = question.dropdownBlanks.length;
        
        question.dropdownBlanks.forEach((blank: any) => {
          if (blank && blank.id && blank.correctAnswer) {
            if (userAnswer[blank.id] === blank.correctAnswer) {
              correctCount++;
            }
          }
        });
        
        const isCorrect = correctCount === totalBlanks && totalBlanks > 0;
        return { score: isCorrect ? maxScore : 0, maxScore };
      }

      default:
        return { score: 0, maxScore };
    }
  } catch (error) {
    return { score: 0, maxScore: question.marks || 0 };
  }
};

// Enhanced storage with fault tolerance
const createStorage = () => {
  return {
    getItem: (name: string) => {
      try {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        return null;
      }
    },
    setItem: (name: string, value: any) => {
      try {
        const serialized = JSON.stringify(value);
        
        // Check if data is too large
        if (storageUtils.getDataSize(value) > STORAGE_LIMITS.MAX_TOTAL_SIZE) {
          // Attempt emergency cleanup
          const cleanedValue = storageUtils.emergencyCleanup(value);
          const cleanedSerialized = JSON.stringify(cleanedValue);
          
          if (storageUtils.getDataSize(cleanedValue) > STORAGE_LIMITS.MAX_TOTAL_SIZE) {
            throw new Error('Data too large even after cleanup');
          }
          
          localStorage.setItem(name, cleanedSerialized);
          return;
        }
        
        localStorage.setItem(name, serialized);
      } catch (error) {
        // Storage failed - try emergency cleanup and retry
        try {
          const cleanedValue = storageUtils.emergencyCleanup(value);
          localStorage.setItem(name, JSON.stringify(cleanedValue));
        } catch (retryError) {
          // Ultimate fallback - clear storage and save minimal state
          localStorage.clear();
          const minimalState = {
            quizzes: allQuizzes,
            attempts: [],
            currentQuiz: null,
            currentAttempt: null,
            randomizeQuestions: true,
          };
          localStorage.setItem(name, JSON.stringify(minimalState));
        }
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        // Ignore removal errors
      }
    }
  };
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      // Utility function to create a seeded shuffle for consistent randomization
      createSeededShuffle: (array: any[], seed: string) => {
        const shuffled = [...array];
        let seedValue = 0;
        for (let i = 0; i < seed.length; i++) {
          seedValue += seed.charCodeAt(i);
        }
        
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor((seedValue * (i + 1)) % (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          seedValue = (seedValue * 9301 + 49297) % 233280;
        }
        
        return shuffled;
      },

      // Storage health check
      checkStorageHealth: () => {
        const state = get();
        const size = storageUtils.getDataSize(state);
        const isHealthy = size < STORAGE_LIMITS.WARNING_SIZE;
        
        let warning;
        if (size > STORAGE_LIMITS.WARNING_SIZE) {
          warning = 'Storage is approaching limits. Consider completing and submitting quizzes.';
        }
        
        return { isHealthy, size, warning };
      },

      // Manual storage cleanup
      cleanupStorage: () => {
        const state = get();
        const cleanedAttempts = storageUtils.cleanupOldAttempts(state.attempts);
        set({ attempts: cleanedAttempts });
      },

      // Actions
      setQuizzes: (quizzes: Quiz[]) => {
        set({ quizzes });
      },

      setCurrentAttemptAndQuiz: (attempt, quiz) => {
        set({
          currentAttempt: attempt,
          currentQuiz: quiz
        });
      },

      startQuiz: (quizId: string, timeLimit: number) => {
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        if (!originalQuiz) return;

        // Create a new quiz instance with shuffled questions
        const shuffledQuestions = get().randomizeQuestions
        ? shuffleArray(originalQuiz.questions)
        : originalQuiz.questions;

        
        const quiz: Quiz = {
          ...originalQuiz,
          questions: shuffledQuestions
        };

        const startTime = new Date();
        
        // Handle unlimited time (timeLimit = -1)
        const isUnlimited = timeLimit === -1;
        
        const attempt: QuizAttempt = {
          quizId,
          answers: {},
          startTime,
          timeLimit: isUnlimited ? 0 : timeLimit, // Store 0 for unlimited
          isCompleted: false,
          isSubmitted: false,
          isUnlimited, // Add flag to track unlimited quizzes
          isPaused: false,
          timeSpent: 0,
          currentQuestionIndex: 0,
        };

        const questionStatuses: Record<string, QuestionStatus> = {};
        quiz.questions.forEach(q => {
          questionStatuses[q.id] = {
            answered: false,
            flagged: false,
            visited: false,
          };
        });

        // Remove any existing in-progress attempt for this quiz
        const updatedAttempts = get().attempts.filter(a => !(a.quizId === quizId && !a.isCompleted));
        
        set({
          currentQuiz: quiz,
          currentAttempt: attempt,
          currentQuestionIndex: 0,
          questionStatuses,
          timeRemaining: isUnlimited ? 0 : timeLimit * 60,
          isTimerRunning: !isUnlimited, // Don't run timer for unlimited quizzes
          attempts: [...updatedAttempts, attempt],
        });
      },

      resumeQuiz: (quizId: string) => {
        const inProgressAttempt = get().getInProgressAttempt(quizId);
        const originalQuiz = get().quizzes.find(q => q.id === quizId);
        
        if (!inProgressAttempt || !originalQuiz) return;

        // Restore the quiz with the same question order as when it was started
        const quiz: Quiz = {
          ...originalQuiz,
          questions: originalQuiz.questions // Keep original order for now - could be enhanced to save shuffled order
        };

        // Calculate remaining time
        let timeRemaining = 0;
        if (!inProgressAttempt.isUnlimited && inProgressAttempt.timeLimit > 0) {
          const totalTimeInSeconds = inProgressAttempt.timeLimit * 60;
          const timeSpentSoFar = inProgressAttempt.timeSpent || 0;
          timeRemaining = Math.max(0, totalTimeInSeconds - timeSpentSoFar);
        }

        // Update the attempt to mark it as resumed
        const updatedAttempt = {
          ...inProgressAttempt,
          isPaused: false,
          pausedTime: undefined,
        };

        // Update attempts array
        const updatedAttempts = get().attempts.map(a => 
          a.quizId === quizId && !a.isCompleted ? updatedAttempt : a
        );

        set({
          currentQuiz: quiz,
          currentAttempt: updatedAttempt,
          currentQuestionIndex: inProgressAttempt.currentQuestionIndex || 0,
          questionStatuses: inProgressAttempt.questionStatuses || {},
          timeRemaining,
          isTimerRunning: !inProgressAttempt.isUnlimited,
          attempts: updatedAttempts,
        });
      },

      pauseQuiz: () => {
        const { currentAttempt, timeRemaining, isTimerRunning } = get();
        if (!currentAttempt || currentAttempt.isCompleted) return;

        // Calculate time spent so far
        const now = new Date();
        let timeSpent = currentAttempt.timeSpent || 0;
        
        if (isTimerRunning && !currentAttempt.isUnlimited) {
          const sessionTime = Math.floor((now.getTime() - currentAttempt.startTime.getTime()) / 1000);
          const totalTimeInSeconds = currentAttempt.timeLimit * 60;
          timeSpent = totalTimeInSeconds - timeRemaining;
        }

        const pausedAttempt = {
          ...currentAttempt,
          isPaused: true,
          pausedTime: now,
          timeSpent,
          currentQuestionIndex: get().currentQuestionIndex,
          questionStatuses: get().questionStatuses,
        };

        // Update attempts array
        const updatedAttempts = get().attempts.map(a => 
          a.quizId === currentAttempt.quizId && !a.isCompleted ? pausedAttempt : a
        );

        set({
          attempts: updatedAttempts,
          currentAttempt: pausedAttempt,
          isTimerRunning: false,
        });
      },

      saveProgress: () => {
        const { currentAttempt, currentQuestionIndex, questionStatuses, timeRemaining, isTimerRunning } = get();
        if (!currentAttempt || currentAttempt.isCompleted) return;

        // Calculate time spent so far
        let timeSpent = currentAttempt.timeSpent || 0;
        
        if (isTimerRunning && !currentAttempt.isUnlimited) {
          const now = new Date();
          const sessionTime = Math.floor((now.getTime() - currentAttempt.startTime.getTime()) / 1000);
          const totalTimeInSeconds = currentAttempt.timeLimit * 60;
          timeSpent = totalTimeInSeconds - timeRemaining;
        }

        const updatedAttempt = {
          ...currentAttempt,
          currentQuestionIndex,
          questionStatuses,
          timeSpent,
        };

        // Update attempts array
        const updatedAttempts = get().attempts.map(a => 
          a.quizId === currentAttempt.quizId && !a.isCompleted ? updatedAttempt : a
        );

        set({
          attempts: updatedAttempts,
          currentAttempt: updatedAttempt,
        });
      },

      hasInProgressQuiz: (quizId: string) => {
        return get().attempts.some(a => a.quizId === quizId && !a.isCompleted && !a.isSubmitted);
      },

      getInProgressAttempt: (quizId: string) => {
        return get().attempts.find(a => a.quizId === quizId && !a.isCompleted && !a.isSubmitted) || null;
      },

      setCurrentQuestion: (index: number) => {
        const { currentQuiz, questionStatuses } = get();
        if (!currentQuiz || index < 0 || index >= currentQuiz.questions.length) return;

        const questionId = currentQuiz.questions[index].id;
        const updatedStatuses = {
          ...questionStatuses,
          [questionId]: {
            ...questionStatuses[questionId],
            visited: true,
          },
        };

        set({
          currentQuestionIndex: index,
          questionStatuses: updatedStatuses,
        });

        // Auto-save progress
        setTimeout(() => get().saveProgress(), 100);
      },

      saveAnswer: (questionId: string, answer: any) => {
        const { currentAttempt, questionStatuses } = get();
        if (!currentAttempt) return;

        // Truncate answer if it's too long
        const truncatedAnswer = storageUtils.truncateAnswer(answer);

        const updatedAttempt = {
          ...currentAttempt,
          answers: {
            ...currentAttempt.answers,
            [questionId]: truncatedAnswer,
          },
        };

        const updatedStatuses = {
          ...questionStatuses,
          [questionId]: {
            ...questionStatuses[questionId],
            answered: true,
          },
        };

        set({
          currentAttempt: updatedAttempt,
          questionStatuses: updatedStatuses,
        });

        // Auto-save progress with error handling
        setTimeout(() => {
          try {
            get().saveProgress();
          } catch (error) {
            // If save fails, try emergency cleanup
            get().cleanupStorage();
            try {
              get().saveProgress();
            } catch (retryError) {
              // Silent fail - user can continue, data will be saved on next successful operation
            }
          }
        }, 100);
      },

      toggleQuestionFlag: (questionId: string) => {
        const { questionStatuses } = get();
        const updatedStatuses = {
          ...questionStatuses,
          [questionId]: {
            ...questionStatuses[questionId],
            flagged: !questionStatuses[questionId]?.flagged,
          },
        };

        set({ questionStatuses: updatedStatuses });

        // Auto-save progress
        setTimeout(() => get().saveProgress(), 100);
      },

      submitQuiz: (isAutoSubmit = false) => {
        const { currentAttempt, currentQuiz, attempts, isTimerRunning } = get();
        
        if (!currentAttempt || !currentQuiz) {
          return;
        }

        if (currentAttempt.isSubmitted) {
          return;
        }

        try {
          // Stop the timer immediately (only if it was running)
          if (isTimerRunning) {
            set({ isTimerRunning: false });
          }

          // Calculate score with comprehensive error handling
          let totalScore = 0;
          let totalMarks = 0;

          currentQuiz.questions.forEach((question) => {
            try {
              const userAnswer = currentAttempt.answers[question.id];
              const result = calculateQuestionScore(question, userAnswer);
              
              totalMarks += result.maxScore;
              totalScore += result.score;
            } catch (error) {
              totalMarks += question.marks || 0;
            }
          });

          const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
          const roundedScore = Math.round(totalScore * 100) / 100;
          const roundedPercentage = Math.round(percentage * 100) / 100;

          const completedAttempt: QuizAttempt = {
            ...currentAttempt,
            endTime: new Date(),
            score: roundedScore,
            percentage: roundedPercentage,
            isCompleted: true,
            isSubmitted: true,
            isAutoSubmitted: isAutoSubmit,
            isPaused: false,
          };

          // Update attempts array - remove any incomplete attempts and add the completed one
          const filteredAttempts = attempts.filter(a => !(a.quizId === currentAttempt.quizId && !a.isCompleted));
          const updatedAttempts = [...filteredAttempts, completedAttempt];

          // Clean up old attempts if storage is getting full
          const finalAttempts = storageUtils.isStorageNearLimit({ attempts: updatedAttempts }) 
            ? storageUtils.cleanupOldAttempts(updatedAttempts)
            : updatedAttempts;

          set({
            attempts: finalAttempts,
            currentAttempt: completedAttempt,
            timeRemaining: 0,
          });

        } catch (error) {
          // Emergency fallback - still mark as submitted to prevent infinite loops
          const emergencyAttempt: QuizAttempt = {
            ...currentAttempt,
            endTime: new Date(),
            score: 0,
            percentage: 0,
            isCompleted: true,
            isSubmitted: true,
            isAutoSubmitted: isAutoSubmit,
            isPaused: false,
          };

          const filteredAttempts = attempts.filter(a => !(a.quizId === currentAttempt.quizId && !a.isCompleted));
          const updatedAttempts = [...filteredAttempts, emergencyAttempt];

          set({
            attempts: updatedAttempts,
            currentAttempt: emergencyAttempt,
            timeRemaining: 0,
            isTimerRunning: false,
          });
        }
      },

      // New method to calculate actual time remaining based on timestamps
      calculateTimeRemaining: () => {
        const { currentAttempt, isTimerRunning } = get();
        if (!currentAttempt || !isTimerRunning || currentAttempt.isUnlimited) return 0;

        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - currentAttempt.startTime.getTime()) / 1000);
        const totalTimeInSeconds = currentAttempt.timeLimit * 60;
        const timeSpentBefore = currentAttempt.timeSpent || 0;
        const remainingTime = Math.max(0, totalTimeInSeconds - timeSpentBefore - elapsedSeconds);

        return remainingTime;
      },

      setTimeRemaining: (time: number) => {
        const { isTimerRunning, currentAttempt } = get();
        
        // Only update time if timer is still running, quiz hasn't been submitted, and it's not unlimited
        if (!isTimerRunning || currentAttempt?.isUnlimited) return;
        
        set({ timeRemaining: Math.max(0, time) });
        
        // Auto-submit when time reaches 0
        if (time <= 0) {
          get().submitQuiz(true); // Pass true to indicate auto-submit
        }
      },

      setTimerRunning: (running: boolean) => {
        set({ isTimerRunning: running });
      },

      resetQuiz: () => {
        set({
          currentQuiz: null,
          currentAttempt: null,
          currentQuestionIndex: 0,
          questionStatuses: {},
          timeRemaining: 0,
          isTimerRunning: false,
        });
      },

      setRandomizeQuestions: (value: boolean) => {
        set({ randomizeQuestions: value });
      },

      getQuizProgress: (quizId: string) => {
        const attempt = get().attempts.find(a => a.quizId === quizId);
        return attempt?.isCompleted ? 100 : 0;
      },

      getQuizScore: (quizId: string) => {
        const attempt = get().attempts.find(a => a.quizId === quizId && a.isCompleted);
        return attempt?.percentage || 0;
      },

      getTotalMarksObtained: () => {
        const { attempts } = get();
        return Math.round(attempts.reduce((sum, attempt) => {
          return attempt.isCompleted ? sum + (attempt.score || 0) : sum;
        }, 0) * 100) / 100;
      },

      getTotalPossibleMarks: () => {
        const { quizzes } = get();
        return quizzes.reduce((sum, quiz) => sum + quiz.totalMarks, 0);
      },

      // Methods for mock final exams
      getMockFinalProgress: () => {
        const { attempts } = get();
        const mockFinalQuizzes = get().getMockFinalQuizzes();
        const completedQuizzes = mockFinalQuizzes.filter(quiz => 
          attempts.some(a => a.quizId === quiz.id && a.isCompleted)
        );
        
        return mockFinalQuizzes.length > 0 ? (completedQuizzes.length / mockFinalQuizzes.length) * 100 : 0;
      },

      getMockFinalMarksObtained: () => {
        const { attempts } = get();
        const mockFinalQuizzes = get().getMockFinalQuizzes();
        
        return Math.round(mockFinalQuizzes.reduce((sum, quiz) => {
          const attempt = attempts.find(a => a.quizId === quiz.id && a.isCompleted);
          return sum + (attempt?.score || 0);
        }, 0) * 100) / 100;
      },

      getMockFinalTotalMarks: () => {
        const mockFinalQuizzes = get().getMockFinalQuizzes();
        return mockFinalQuizzes.reduce((sum, quiz) => sum + quiz.totalMarks, 0);
      },

      getLessonQuizzes: () => {
        return get().quizzes.filter(q => q.category === 'lesson');
      },

      getMockFinalQuizzes: () => {
        return get().quizzes.filter(q => q.category === 'mockFinal');
      },
    }),
    {
      version: 10, // Updated to version 10 complete makeover
      name: 'quiz-store',
      storage: createJSONStorage(() => createStorage()),
      migrate: (persistedState, version) => {
        if (version === 10) {
          return persistedState;
        }
        
        // For any older version, perform cleanup and migration
        try {
          const state = persistedState as any;
          if (state && state.attempts) {
            // Clean up old attempts and truncate long answers
            const cleanedAttempts = storageUtils.cleanupOldAttempts(state.attempts).map((attempt: QuizAttempt) => ({
              ...attempt,
              answers: Object.fromEntries(
                Object.entries(attempt.answers || {}).map(([key, value]) => [
                  key,
                  storageUtils.truncateAnswer(value)
                ])
              )
            }));
            
            return {
              ...createInitialState(),
              attempts: cleanedAttempts,
            };
          }
        } catch (error) {
          // If migration fails, start fresh
        }
        
        return {
        };
      },
    }
  )
);

export { createInitialState };