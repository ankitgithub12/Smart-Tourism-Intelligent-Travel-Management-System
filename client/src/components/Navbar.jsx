import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, MapPin, Compass, Heart } from 'lucide-react';
import { FaUmbrellaBeach, FaHotel, FaRoute, FaRobot, FaInfoCircle, FaPhoneAlt } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Destinations', path: '/destinations', icon: FaUmbrellaBeach },
  { label: 'Packages', path: '/packages' },
  { label: 'Hotels', path: '/hotels', icon: FaHotel },
  { label: 'Smart Planner', path: '/planner', icon: FaRoute },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();

  const getDashboardRoute = (role) => {
    if (role === 'admin' || role === 'authority') return '/admin/dashboard';
    if (role === 'agency') return '/agency/dashboard';
    return '/dashboard';
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-surface shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Compass size={20} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm tracking-tight">SmartTourism</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[hsl(var(--primary))]">AI Powered</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-bold'
                      : 'hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to={getDashboardRoute(user?.role)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    (isActive('/dashboard') || isActive('/agency/dashboard') || isActive('/admin/dashboard'))
                      ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-bold'
                      : 'hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors border border-[hsl(var(--primary)/0.1)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`opacity-50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-surface rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-[hsl(var(--primary)/0.1)]">
                          <p className="text-xs opacity-50 font-medium">Signed in as</p>
                          <p className="text-sm font-bold truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                            <User size={16} className="opacity-40" /> My Profile
                          </Link>
                          <Link to={getDashboardRoute(user?.role)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                            <LayoutDashboard size={16} className="opacity-40" /> Dashboard
                          </Link>
                          <Link to="/my-trips" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                            <MapPin size={16} className="opacity-40" /> My Trips
                          </Link>
                          <Link to="/saved" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                            <Heart size={16} className="opacity-40" /> Wishlist
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm !py-2.5 !px-5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden glass-surface border-t border-[hsl(var(--primary)/0.1)]"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.path)
                        ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] font-bold'
                        : 'hover:bg-[hsl(var(--primary)/0.05)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardRoute(user?.role)} className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)]">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary)/0.05)]">Profile</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">Sign Out</button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link to="/login" className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold border border-[hsl(var(--primary)/0.2)]">Sign In</Link>
                    <Link to="/register" className="flex-1 text-center btn-primary text-sm !py-3">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
