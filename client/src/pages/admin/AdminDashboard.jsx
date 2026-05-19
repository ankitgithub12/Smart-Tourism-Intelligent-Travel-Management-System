import React from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, ShieldAlert, BarChart3, Settings, MapPin } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '12.4K', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Trips', value: '1,284', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Revenue', value: '₹4.2M', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'System Alerts', value: 3, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2">System Admin</h1>
            <p className="text-[hsl(var(--text-muted))]">Global platform overview and management.</p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Settings size={16} /> Platform Settings
          </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-surface rounded-3xl p-6">
            <h2 className="font-bold text-lg mb-6">Recent User Signups</h2>
            <div className="space-y-4">
              {[
                { name: 'John Doe', role: 'Tourist', email: 'john@example.com', date: 'Today' },
                { name: 'Travel Goa Co.', role: 'Agency', email: 'contact@travelgoa.com', date: 'Yesterday' },
                { name: 'Alice Smith', role: 'Tourist', email: 'alice@example.com', date: '2 days ago' },
              ].map((user, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--primary)/0.05)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[hsl(var(--primary))]">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'Agency' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {user.role}
                    </span>
                    <p className="text-[10px] text-[hsl(var(--text-muted))] mt-1">{user.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Crowd Management Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-surface rounded-3xl p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><MapPin size={20} className="text-rose-500" /> Active Crowd Alerts</h2>
            <div className="space-y-4">
              {[
                { location: 'Taj Mahal, Agra', level: 'Critical', visitors: '15,000+', trend: 'up' },
                { location: 'Baga Beach, Goa', level: 'High', visitors: '8,000+', trend: 'up' },
                { location: 'Red Fort, Delhi', level: 'Moderate', visitors: '4,000+', trend: 'down' },
              ].map((alert, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--primary)/0.05)]">
                  <div>
                    <p className="font-bold text-sm">{alert.location}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))]">Est. Visitors: {alert.visitors}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    alert.level === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 
                    alert.level === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {alert.level}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
