import React from "react";
import { Clock, CheckCircle, Circle, Play, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Quiz } from "../types/quiz";
import { useQuizStore } from "../store/quizStore";
import {
  getDefaultGradientColors,
  generateGradientClasses,
} from "../utils/quizLoader";

interface QuizCardProps {
  quiz: Quiz;
  progress: number;
  score: number;
  onStart: () => void;
  hasPastAttempt: boolean;
  expanded?: boolean; // pass true when subject section is expanded
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  progress,
  score,
  onStart,
  hasPastAttempt,
  expanded = false,
}) => {
  const { hasInProgressQuiz, getInProgressAttempt } = useQuizStore();

  const hasInProgress = hasInProgressQuiz(quiz.id);
  const inProgressAttempt = getInProgressAttempt(quiz.id);

  // Gradient colors (from JSON or fallback)
  const gradientColors =
    quiz.gradientColors || getDefaultGradientColors(quiz.category);
  const gradientClasses = generateGradientClasses(gradientColors);

  const buttonColor = gradientColors[2];
  const buttonHoverColor = gradientColors[3];

  const getButtonText = () => {
    if (hasInProgress) return "Continue Quiz";
    if (hasPastAttempt) return "View Past Results / Retake Quiz";
    return "Start Quiz";
  };

  const getButtonIcon = () =>
    hasInProgress ? (
      <RotateCcw className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
    ) : (
      <Play className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
    );

  const getProgressInfo = () => {
    if (hasInProgress && inProgressAttempt) {
      const answered = Object.keys(inProgressAttempt.answers).length;
      const total = quiz.questions.length;
      return {
        percentage: (answered / total) * 100,
        text: `${answered}/${total} questions answered`,
      };
    }
    return { percentage: progress, text: `${progress}%` };
  };

  const progressInfo = getProgressInfo();

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.35, ease: "easeInOut" } }}
      className="group relative"
    >
      {/* Gradient + Abstract pattern background */}
      <div
        className={`absolute inset-0 ${gradientClasses} rounded-2xl overflow-hidden`}
      >
        {/* Abstract lightweight pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 80% 70%, white 2px, transparent 2px)",
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Card Content */}
      <motion.div
        layout
        className={`relative ${
          expanded ? "bg-white/20" : "bg-white/70"
        } backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300`}
      >
        {hasInProgress && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            In Progress
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
            <p className="text-gray-700 text-sm">{quiz.description}</p>
          </div>
          <div className="flex items-center">
            {hasPastAttempt ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-gray-300" />
            )}
          </div>
        </div>

        {/* Expanding details */}
        <motion.div
          layout
          initial={false}
          animate={{ opacity: expanded ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Progress</span>
            <span className="font-medium text-gray-900">
              {progressInfo.text}
            </span>
          </div>
          <div className="w-full bg-gray-200/70 rounded-full h-2">
            <motion.div
              layout
              className="h-2 rounded-full"
              style={{
                width: `${progressInfo.percentage}%`,
                backgroundColor: hasInProgress
                  ? "#f97316"
                  : hasPastAttempt
                  ? "#10b981"
                  : buttonColor,
              }}
            />
          </div>

          {/* Score */}
          {!hasInProgress && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Score</span>
              <span className="font-medium text-gray-900">
                {score.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Time info */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {hasInProgress && inProgressAttempt?.isUnlimited
                ? "Unlimited time"
                : quiz.timeOptions.length > 0
                ? `${quiz.timeOptions.join(", ")} minutes available`
                : "No time limit"}
            </span>
          </div>

          {/* Button */}
          <button
            onClick={onStart}
            className="w-full font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 group hover:scale-105 text-white"
            style={{
              backgroundColor: hasInProgress
                ? "#ea580c"
                : hasPastAttempt
                ? "#059669"
                : buttonColor,
            }}
            onMouseEnter={(e) => {
              if (!hasInProgress && !hasPastAttempt) {
                e.currentTarget.style.backgroundColor = buttonHoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!hasInProgress && !hasPastAttempt) {
                e.currentTarget.style.backgroundColor = buttonColor;
              }
            }}
          >
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuizCard;
