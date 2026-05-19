import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = [
  { id: 'tropical', name: 'Tropical Beach', emoji: '🌴', desc: 'Ocean blue & palm vibes' },
  { id: 'ice', name: 'Greenland Ice', emoji: '🧊', desc: 'Cool arctic tones' },
  { id: 'mountain', name: 'Mountain', emoji: '🏔️', desc: 'Earthy highland feel' },
  { id: 'forest', name: 'Forest', emoji: '🌲', desc: 'Deep greens & nature' },
  { id: 'desert', name: 'Desert', emoji: '🏜️', desc: 'Warm sandy gradients' },
  { id: 'nightcity', name: 'Night City', emoji: '🌃', desc: 'Neon cyber vibes' },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('st-theme') || 'tropical');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('st-dark') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('st-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('st-dark', darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, darkMode, toggleDark, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
