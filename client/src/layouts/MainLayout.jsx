import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatAssistant from '../components/ChatAssistant';
import ThemeSwitcher from '../components/ThemeSwitcher';

const DASHBOARD_PATHS = ['/admin/dashboard', '/agency/dashboard', '/dashboard'];

const MainLayout = () => {
  const location = useLocation();
  const isDashboard = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));

  if (isDashboard) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-32">
        <Outlet />
      </main>
      <Footer />
      <ChatAssistant />
      <ThemeSwitcher />
    </div>
  );
};

export default MainLayout;
