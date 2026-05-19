import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, darkMode, toggleDark, themes } = useTheme();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-12 h-12 rounded-full glass-surface shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        title="Change Theme"
      >
        <Palette size={20} className="text-[hsl(var(--primary))]" />
      </button>

      {/* Theme Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative glass-surface rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Theme & Appearance</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-[hsl(var(--primary)/0.1)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] mb-6">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon size={20} className="text-[hsl(var(--primary))]" /> : <Sun size={20} className="text-[hsl(var(--secondary))]" />}
                  <span className="font-semibold text-sm">Dark Mode</span>
                </div>
                <button
                  onClick={toggleDark}
                  className={`w-12 h-7 rounded-full relative transition-colors ${darkMode ? 'bg-[hsl(var(--primary))]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left hover:scale-[1.02] ${
                      theme === t.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] shadow-lg'
                        : 'border-transparent bg-[hsl(var(--primary)/0.03)] hover:border-[hsl(var(--primary)/0.2)]'
                    }`}
                  >
                    {theme === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <span className="text-2xl mb-2 block">{t.emoji}</span>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs opacity-60 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSwitcher;
