import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, User, Compass, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, Radio, ShieldAlert
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export function DashboardLayout({ children, role, navItems, title, activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDark } = useTheme();

  const activePath = location.pathname;

  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[hsl(var(--bg-dark-start))] dark:to-[hsl(var(--bg-dark-end))] text-[hsl(var(--text))] dark:text-slate-200 transition-colors duration-500`}>
      
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        className="fixed top-0 bottom-0 left-0 dashboard-sidebar flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300"
      >
        <div>
          {/* Brand/Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Compass size={20} className="text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-sm tracking-tight gradient-text">SmartTourism</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase opacity-60">
                    {role === 'authority' ? 'City Admin' : 'Agency Hub'}
                  </span>
                </div>
              )}
            </Link>
            {!collapsed && (
              <button 
                onClick={() => setCollapsed(true)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {collapsed && (
              <button 
                onClick={() => setCollapsed(false)} 
                className="mx-auto mt-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = onTabChange ? activeTab === item.path : activePath === item.path;
              const Icon = item.icon;
              const content = (
                <>
                  <Icon size={18} className={isActive ? 'text-[hsl(var(--primary))]' : 'opacity-80'} />
                  {!collapsed && <span>{item.label}</span>}
                </>
              );
              
              const baseClass = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[hsl(var(--primary))/0.15] to-[hsl(var(--accent))/0.05] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] border-l-4 border-[hsl(var(--primary))] shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 opacity-70 hover:opacity-100 text-left'
              }`;

              if (onTabChange) {
                return (
                  <button
                    key={item.path}
                    onClick={() => onTabChange(item.path)}
                    className={baseClass}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={baseClass}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{user?.name || 'Smart Admin'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider font-semibold">{role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ paddingLeft: collapsed ? 80 : 260 }}>
        {/* Top Header */}
        <header className="h-16 sticky top-0 bg-white/70 dark:bg-[hsl(var(--surface-dark))/0.7] backdrop-filter blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black tracking-tight">{title}</h2>
            {/* Real-time pulse indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Feed
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 glass-surface rounded-2xl shadow-2xl p-4 border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">System Notifications</h4>
                      <span className="text-[10px] font-bold bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] px-2 py-0.5 rounded-full">3 New</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <p className="font-bold flex items-center gap-1.5 text-rose-500">
                          <ShieldAlert size={12} /> Crowd Alert: Beach Road
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Visitor density reached 78% capacity</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <p className="font-bold text-sky-500">New Booking Confirmed</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rahul Sharma booked Ocean Breeze Escape</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 glass-surface rounded-xl shadow-2xl p-1.5"
                  >
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                      <User size={14} /> My Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content view */}
        <main className="flex-1 dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
