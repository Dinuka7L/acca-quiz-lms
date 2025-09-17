import React from "react";
import { ArrowUpRight, Trash2, Moon, Sun } from "lucide-react";
import { useQuizStore } from '../store/quizStore';
import { useThemeStore } from '../store/themeStore';

const Footer: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  
  const handleResetData = () => {
  if (window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
    // Clear persisted storage
    useQuizStore.persist.clearStorage();

    // Reset the in-memory state to initial default
    useQuizStore.setState(useQuizStore.getInitialState());

    // Reload the page
    window.location.reload();
  }
};

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 dark:border-gray-600 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* About Section */}
        <div className="text-sm text-white dark:text-gray-200 space-y-2">
          <h3 className="font-semibold text-red-400 dark:text-red-300">About This LMS</h3>
          <p className="transition-colors duration-300">
            This Learning Management System provides interactive quizzes and study tools to help you prepare effectively for your final exams.
          </p>
          <p className="transition-colors duration-300">
            Features include multiple question types, auto-evaluation, progress tracking, and instant feedback.
          </p>
        </div>

        {/* Disclaimer Section */}
        <div className="text-sm text-gray-300 dark:text-gray-400 space-y-2">
          <h3 className="font-semibold text-red-400 dark:text-red-300">Data & Privacy Notice</h3>
          <p className="transition-colors duration-300">
            Your quiz progress is saved <b>only</b> on this device using your browser's storage.
          </p>
          <p className="transition-colors duration-300">
            If you clear your browser’s history, cookies, or site data, your progress will be permanently lost.
          </p>
          <p className="transition-colors duration-300">
            No information is sent to any external server.
          </p>

          {/* Reset Data Button */}
          <button
            onClick={handleResetData}
            className="mt-2 inline-flex items-center text-red-300 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Reset All Data
          </button>
        </div>

        {/* Contact Section */}
        <div className="text-sm text-white dark:text-gray-200 space-y-2 md:text-right">
          <h3 className="font-semibold text-red-400 dark:text-red-300">Contact Developer</h3>
          <p className="transition-colors duration-300">2025 Academia.</p>
          <a
            href="https://www.linkedin.com/in/dinuka-liyanage/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-red-400 dark:text-red-300 hover:underline transition-colors duration-300"
          >
            <span className="mr-1">Get in touch on LinkedIn</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
          
          {/* Dark Mode Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-600 dark:border-gray-500">
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg transition-all duration-300 hover:scale-105"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
