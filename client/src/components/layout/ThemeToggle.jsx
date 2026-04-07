import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark'); // Default to dark as per specs

  useEffect(() => {
    // Check localStorage
    const savedTheme = localStorage.getItem('stemspace-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyThemeClass(savedTheme);
    } else {
      applyThemeClass('dark'); // Default init
    }
  }, []);

  const applyThemeClass = (currentTheme) => {
    const htmlElement = document.documentElement;
    if (currentTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('stemspace-theme', newTheme);
    applyThemeClass(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
        theme === 'dark' ? 'bg-[var(--accent-violet)]' : 'bg-gray-300'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <div 
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-[var(--accent-violet)]" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
