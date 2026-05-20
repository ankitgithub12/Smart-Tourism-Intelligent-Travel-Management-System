import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Shield, Globe, Palette, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, setTheme, darkMode, toggleDark, themes } = useTheme();

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-2">Settings</h1>
        <p className="text-[hsl(var(--text-muted))] mb-10">Customize your experience</p>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-surface rounded-3xl p-6 mb-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-6"><Palette size={20} className="text-[hsl(var(--primary))]" /> Appearance</h2>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] mb-4">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-[hsl(var(--primary))]" />
              <span className="font-semibold text-sm">Dark Mode</span>
            </div>
            <button onClick={toggleDark} className={`w-12 h-7 rounded-full relative transition-colors ${darkMode ? 'bg-[hsl(var(--primary))]' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-surface rounded-3xl p-6 mb-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-6"><Bell size={20} className="text-[hsl(var(--primary))]" /> Notifications</h2>
          {['Email Notifications', 'Push Notifications', 'Booking Alerts', 'Promotional Emails'].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[hsl(var(--primary)/0.05)] last:border-0">
              <span className="text-sm font-medium">{item}</span>
              <button className="w-10 h-6 rounded-full bg-[hsl(var(--primary))] relative">
                <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-surface rounded-3xl p-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-6"><Shield size={20} className="text-[hsl(var(--primary))]" /> Privacy & Security</h2>
          {['Two-Factor Authentication', 'Location Sharing', 'Activity Tracking'].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[hsl(var(--primary)/0.05)] last:border-0">
              <span className="text-sm font-medium">{item}</span>
              <button className={`w-10 h-6 rounded-full relative ${i === 0 ? 'bg-[hsl(var(--primary))]' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${i === 0 ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
