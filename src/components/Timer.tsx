import React, { useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Infinity } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';

const Timer: React.FC = () => {
  const { 
    timeRemaining, 
    isTimerRunning, 
    setTimeRemaining, 
    submitQuiz, 
    calculateTimeRemaining,
    currentAttempt 
  } = useQuizStore();
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Check if current quiz is unlimited
  const isUnlimited = currentAttempt?.isUnlimited || false;

  useEffect(() => {
    if (!isTimerRunning || !currentAttempt || isUnlimited) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update timer immediately when starting
    const actualTimeRemaining = calculateTimeRemaining();
    if (actualTimeRemaining !== timeRemaining) {
      setTimeRemaining(actualTimeRemaining);
    }

    // If time has already run out, submit immediately
    if (actualTimeRemaining <= 0) {
      submitQuiz(true); // Pass true for auto-submit
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up a more frequent interval to catch up after tab switching
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const actualTime = calculateTimeRemaining();
      
      // Update the time based on actual elapsed time, not just decrementing
      setTimeRemaining(actualTime);
      
      // If time is up, submit the quiz
      if (actualTime <= 0) {
        submitQuiz(true); // Pass true for auto-submit
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      
      lastUpdateRef.current = now;
    }, 250); // Update every 250ms for smoother countdown and better tab-switching detection

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerRunning, currentAttempt, calculateTimeRemaining, setTimeRemaining, submitQuiz, isUnlimited]);

  // Handle page visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isTimerRunning && currentAttempt && !isUnlimited) {
        // When tab becomes visible again, immediately sync with actual time
        const actualTime = calculateTimeRemaining();
        setTimeRemaining(actualTime);
        
        if (actualTime <= 0) {
          submitQuiz(true); // Pass true for auto-submit
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerRunning, currentAttempt, calculateTimeRemaining, setTimeRemaining, submitQuiz, isUnlimited]);

  // Handle page focus/blur events as additional backup
  useEffect(() => {
    const handleFocus = () => {
      if (isTimerRunning && currentAttempt && !isUnlimited) {
        const actualTime = calculateTimeRemaining();
        setTimeRemaining(actualTime);
        
        if (actualTime <= 0) {
          submitQuiz(true); // Pass true for auto-submit
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isTimerRunning, currentAttempt, calculateTimeRemaining, setTimeRemaining, submitQuiz, isUnlimited]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(Math.max(0, seconds) / 60);
    const remainingSeconds = Math.max(0, seconds) % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't show timer for unlimited quizzes
  if (isUnlimited) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-green-200 dark:border-green-700 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-300">
            <Infinity className="h-5 w-5 text-green-600 dark:text-green-400 transition-colors duration-300" />
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium transition-colors duration-300">
              Time Limit
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums transition-colors duration-300">
              Unlimited
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400 transition-colors duration-300">
          ✨ Take your time!
        </div>
      </div>
    );
  }

  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCritical = timeRemaining < 60; // Less than 1 minute
  const isTimeUp = timeRemaining <= 0;

  return (
    <div className={`
      bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 transition-all duration-300
      ${isTimeUp ? 'border-red-600 dark:border-red-500 bg-red-100/90 dark:bg-red-900/30' : isCritical ? 'border-red-500 dark:border-red-400 bg-red-50/90 dark:bg-red-900/20' : isLowTime ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-50/90 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-600'}
    `}>
      <div className="flex items-center space-x-3">
        <div className={`
          p-2 rounded-full transition-colors duration-300
          ${isTimeUp ? 'bg-red-200 dark:bg-red-800/50' : isCritical ? 'bg-red-100 dark:bg-red-800/30' : isLowTime ? 'bg-yellow-100 dark:bg-yellow-800/30' : 'bg-gray-100 dark:bg-gray-700'}
        `}>
          {isTimeUp || isCritical ? (
            <AlertTriangle className={`h-5 w-5 ${isTimeUp ? 'text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'} transition-colors duration-300`} />
          ) : (
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
          )}
        </div>
        
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium transition-colors duration-300">
            Time Remaining
          </div>
          <div className={`
            text-2xl font-bold tabular-nums transition-colors duration-300
            ${isTimeUp ? 'text-red-700 dark:text-red-300' : isCritical ? 'text-red-600 dark:text-red-400' : isLowTime ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}
          `}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      {isTimeUp && (
        <div className="mt-2 text-xs font-medium text-red-700 dark:text-red-300 animate-pulse transition-colors duration-300">
          🚨 Time's up! Submitting quiz...
        </div>
      )}
      {!isTimeUp && isLowTime && (
        <div className={`
          mt-2 text-xs font-medium animate-pulse transition-colors duration-300
          ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}
        `}>
          {isCritical ? '⚠️ Critical time!' : '⏰ Time is running low'}
        </div>
      )}
    </div>
  );
};

export default Timer;