import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-200 focus:outline-none"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <div className="flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <span className="text-xs font-bold uppercase hidden md:inline">Dark Mode</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xl">☀️</span>
          <span className="text-xs font-bold uppercase hidden md:inline">Light Mode</span>
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;
