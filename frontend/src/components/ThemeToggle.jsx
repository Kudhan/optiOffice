import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border-l-4 border-transparent hover:bg-slate-800/50 hover:text-white text-slate-300 w-full text-left"
        >
            <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
        </button>
    );
};

export default ThemeToggle;
