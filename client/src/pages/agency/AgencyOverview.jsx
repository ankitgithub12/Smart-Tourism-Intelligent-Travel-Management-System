import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, Building2, Star, TrendingUp,
  ArrowUpRight, Package, Clock, Calendar
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const mockChartData = [
  { name: 'Mon', revenue: 45000 },
  { name: 'Tue', revenue: 52000 },
  { name: 'Wed', revenue: 49000 },
  { name: 'Thu', revenue: 63000 },
  { name: 'Fri', revenue: 58000 },
  { name: 'Sat', revenue: 85000 },
  { name: 'Sun', revenue: 92000 },
];

export function AgencyOverview({ data, setTab }) {
  // Update stat objects with actual values from data state
  const stats = [
    { label: 'Active Bookings', value: data.bookings.filter(b => b.status === 'Confirmed').length + 40, icon: Users, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Total Revenue', value: '₹2.8L', icon: DollarSign, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { label: 'Listed Properties', value: data.packages.length + 8, icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-surface rounded-2xl p-5 flex items-center gap-4 stat-card-glow shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} shrink-0`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xl font-black mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart View */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-base">Weekly Revenue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total earnings breakdown from listed packages</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} /> +12.4%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} className="opacity-50" />
                <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} className="opacity-50" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Short Info */}
        <div className="space-y-6">
          <div className="glass-surface rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4">Quick Management</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTab('packages')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-500/10 hover:text-indigo-500 dark:hover:bg-indigo-500/10 transition-all text-center flex flex-col items-center gap-2 border border-slate-200/50 dark:border-slate-800/50"
              >
                <Package size={22} />
                <span className="text-xs font-bold">Packages</span>
              </button>
              <button 
                onClick={() => setTab('tours')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-teal-500/10 hover:text-teal-500 dark:hover:bg-teal-500/10 transition-all text-center flex flex-col items-center gap-2 border border-slate-200/50 dark:border-slate-800/50"
              >
                <Calendar size={22} />
                <span className="text-xs font-bold">Schedules</span>
              </button>
            </div>
          </div>

          <div className="glass-surface rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-3">Live Feed</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="font-bold">Booking Confirmed</p>
                  <p className="text-slate-500 dark:text-slate-400">Rahul Sharma booked Ocean Breeze Escape</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">5 mins ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="font-bold">Pending Approval</p>
                  <p className="text-slate-500 dark:text-slate-400">New cab request from Priya Patel</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">15 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table Overview */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-black text-base">Recent Activity Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest active travel reservations</p>
          </div>
          <button onClick={() => setTab('bookings')} className="text-xs font-bold text-[hsl(var(--primary))] hover:underline">
            View All Bookings
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Listing</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((booking, i) => (
                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="font-bold text-sm">{booking.customer}</td>
                  <td className="text-xs font-semibold">{booking.listing}</td>
                  <td className="text-xs text-slate-500 dark:text-slate-400">{booking.dates}</td>
                  <td className="text-sm font-black">₹{booking.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'Confirmed' ? 'badge-success' : 
                      booking.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AgencyOverview;
