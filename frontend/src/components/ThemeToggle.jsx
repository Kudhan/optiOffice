import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconSun, IconMoon } from './Icons';

const ThemeToggle = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border hover:bg-primary-surface transition-all text-content-muted flex items-center justify-center"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {darkMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
