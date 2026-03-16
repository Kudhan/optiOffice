import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || 
               (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <button 
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border-l-4 border-transparent hover:bg-slate-800/50 hover:text-white text-slate-300 w-full text-left"
        >
            <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
        </button>
    );
};

export default ThemeToggle;
