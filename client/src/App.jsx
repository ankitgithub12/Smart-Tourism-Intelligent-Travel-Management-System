import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import ChatAssistant from './components/ChatAssistant';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import MyTrips from './pages/MyTrips';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Placeholder */}
        <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">SmartTourism</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
              <a href="/destinations" className="hover:text-blue-600 transition-colors">Destinations</a>
              <a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="/trips" className="hover:text-blue-600 transition-colors">My Trips</a>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                Login
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/trips" element={<MyTrips />} />
          </Routes>
        </main>

        {/* Floating Chat Assistant */}
        <ChatAssistant />

        {/* Footer Placeholder */}
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
          <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
            &copy; 2026 Smart Tourism & Intelligent Travel Management. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
