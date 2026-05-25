import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, User, Compass, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, ShieldAlert, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationRead } from '../redux/notificationsSlice';


export function DashboardLayout({
  children, role, navItems, title, activeTab, onTabChange,
  connected = false, loading = false, onRefresh
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const isAuthority = role === 'authority';
  const primaryGrad = 'from-blue-600 to-blue-800';
  const sidebarWidth = collapsed ? '72px' : '256px';

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark-mode' : ''}`}
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #111827 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)'
      }}
    >
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden shadow-2xl
          ${darkMode
            ? 'bg-[#0d1117]/95 border-r border-white/5'
            : 'bg-white/90 border-r border-slate-200/60'}
          backdrop-blur-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${primaryGrad} flex items-center justify-center shadow-lg shrink-0`}>
              <Compass size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight truncate
                  bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  SmartTourism
                </span>
                <span className={`text-[9px] font-bold tracking-widest uppercase mt-0.5
                  text-blue-500`}>
                  {isAuthority ? 'City Command' : 'Agency Hub'}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = onTabChange ? activeTab === item.path : location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => { onTabChange?.(item.path); setMobileOpen(false); }}
                title={collapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 group relative overflow-hidden
                  ${isActive
                    ? `bg-gradient-to-r ${primaryGrad} text-white shadow-lg shadow-blue-500/20`
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  />
                )}
                <Icon size={17} className="shrink-0 relative z-10" />
                {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className={`p-3 border-t ${darkMode ? 'border-white/5' : 'border-slate-200/60'} shrink-0`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${primaryGrad} flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider truncate text-blue-500">
                  {role}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Main area ── */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-[var(--sidebar-width)]"
        style={{ '--sidebar-width': sidebarWidth }}
      >
        {/* Top header */}
        <header className={`h-16 sticky top-0 z-30 flex items-center justify-between px-6
          backdrop-blur-2xl border-b shrink-0
          ${darkMode
            ? 'bg-[#0d1117]/80 border-white/5'
            : 'bg-white/70 border-slate-200/60'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 className="text-sm font-black tracking-tight">{title}</h1>
              <p className="text-[10px] font-semibold text-blue-500 mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold
              ${connected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {connected ? (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <Wifi size={10} />
                  LIVE
                </>
              ) : (
                <>
                  <WifiOff size={10} />
                  POLLING
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`p-2 rounded-xl transition-colors
                  ${darkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Refresh Data"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className={`p-2 rounded-xl transition-colors
                ${darkMode ? 'hover:bg-white/5 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(o => !o)}
                className={`p-2 rounded-xl relative transition-colors
                  ${darkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0d1117]" />
                )}
              </button>
 
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className={`absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl p-4 border z-50
                      ${darkMode
                        ? 'bg-[#0d1117]/95 border-white/10 backdrop-blur-2xl'
                        : 'bg-white/95 border-slate-200 backdrop-blur-2xl'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">Live Notifications</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">
                        LIVE
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.read && dispatch(markNotificationRead(notif.id))}
                            className={`p-3 rounded-xl text-xs border cursor-pointer transition-colors ${
                              notif.read
                                ? (darkMode ? 'bg-white/3 border-white/5 opacity-60' : 'bg-slate-50 border-slate-100 opacity-60')
                                : (darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100')
                            }`}
                          >
                            <p className={`font-bold ${
                              notif.type === 'alert' ? 'text-rose-500' : notif.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                            }`}>
                              {notif.title || 'System Notification'}
                            </p>
                            <p className="text-slate-500 mt-0.5">{notif.message}</p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {new Date(notif.time || notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-xs text-slate-500 font-medium">No new notifications.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${primaryGrad} flex items-center justify-center text-white text-xs font-bold shadow-md`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className={`absolute right-0 top-full mt-2 w-44 rounded-xl shadow-2xl p-1.5 border z-50
                      ${darkMode
                        ? 'bg-[#0d1117]/95 border-white/10 backdrop-blur-2xl'
                        : 'bg-white/95 border-slate-200 backdrop-blur-2xl'
                      }`}
                  >
                    <Link
                      to="/profile"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold
                        ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={13} className="opacity-50" /> My Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
