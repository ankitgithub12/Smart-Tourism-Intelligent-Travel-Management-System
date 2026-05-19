import React from 'react';
import { motion } from 'framer-motion';
import { Map, Plane, Compass, Heart, CreditCard, Clock, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TouristDashboard = () => {
  const stats = [
    { label: 'Upcoming Trips', value: 1, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Past Trips', value: 3, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Saved Places', value: 12, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Total Spent', value: '₹45K', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2">Welcome Back, Tourist!</h1>
            <p className="text-[hsl(var(--text-muted))]">Here is what's happening with your travel plans.</p>
          </div>
          <Link to="/planner" className="btn-primary !py-2.5 flex items-center gap-2">
            <Map size={16} /> Plan New Trip
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-3xl p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-muted))]">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Trip Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-surface rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10" />
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Plane size={20} className="text-blue-500" /> Next Adventure</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&auto=format" alt="Goa" className="w-full sm:w-48 h-32 object-cover rounded-2xl shadow-lg" />
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-black">Goa Beach Paradise</h3>
                      <p className="text-sm text-[hsl(var(--text-muted))]">Starts in 5 days</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">Confirmed</span>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button className="flex-1 btn-primary !py-2 text-sm">View Details</button>
                    <button className="flex-1 btn-secondary !py-2 text-sm">Download Ticket</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-surface rounded-3xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Compass size={20} className="text-[hsl(var(--primary))]" /> AI Recommendations for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Kerala Backwaters', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format', match: '98%' },
                  { name: 'Andaman Islands', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format', match: '94%' },
                ].map((rec, i) => (
                  <div key={i} className="relative h-32 rounded-2xl overflow-hidden group cursor-pointer">
                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-bold">{rec.name}</p>
                      <p className="text-[10px] text-emerald-400 font-black">{rec.match} Match</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-surface rounded-3xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell size={20} className="text-amber-500" /> Notifications</h2>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)]">
                  <p className="text-sm font-semibold mb-1">Payment Successful</p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">Your payment for Goa trip was successful.</p>
                  <p className="text-[10px] mt-2 opacity-50">2 hours ago</p>
                </div>
                <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)]">
                  <p className="text-sm font-semibold mb-1">Weather Alert</p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">Expect light rain in Goa during your visit.</p>
                  <p className="text-[10px] mt-2 opacity-50">1 day ago</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-surface rounded-3xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-[hsl(var(--primary))]" /> Quick Links</h2>
              <div className="space-y-2">
                <Link to="/profile" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors text-sm font-semibold">My Profile</Link>
                <Link to="/my-trips" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors text-sm font-semibold">My Bookings</Link>
                <Link to="/settings" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors text-sm font-semibold">Settings</Link>
                <Link to="/contact" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors text-sm font-semibold">Support</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;
