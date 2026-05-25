import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';

const COLORS = ['#2dd4bf', '#f59e0b', '#f43f5e'];

export function TouristAnalytics({ data }) {
  const analytics = data.analytics || {
    totalSales: 0,
    totalRevenue: 0,
    totalBookings: 0,
    popularPackage: { name: 'N/A', bookings: 0 },
    statusDistribution: { Confirmed: 0, Pending: 0, Cancelled: 0 }
  };

  const packageData = (data.packages || []).map((pkg) => ({
    name: pkg.name,
    bookings: Number(pkg.bookings || 0)
  }));

  const statusData = [
    { name: 'Confirmed', value: Number(analytics.statusDistribution?.Confirmed || 0) },
    { name: 'Pending', value: Number(analytics.statusDistribution?.Pending || 0) },
    { name: 'Cancelled', value: Number(analytics.statusDistribution?.Cancelled || 0) },
  ];

  const totalBookings = statusData.reduce((total, entry) => total + entry.value, 0);

  const kpis = [
    { label: 'Total Sales Count', value: analytics.totalSales, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Successful bookings' },
    { label: 'Analytics Revenue', value: `₹${Number(analytics.totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-sky-500', bg: 'bg-sky-500/10', desc: 'Total confirmed earnings' },
    { label: 'Booking Entries', value: analytics.totalBookings, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Overall requests received' },
    { label: 'Popular Package', value: `${analytics.popularPackage.name} (${analytics.popularPackage.bookings} booked)`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Most selected package' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Tourist Analytics Dashboard</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Analysis calculated from your packages and booking records</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-surface rounded-2xl p-5 flex items-center gap-4 stat-card-glow shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} shrink-0`}>
              <kpi.icon size={22} className={kpi.color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <p className="text-lg font-black mt-0.5 max-w-[170px] truncate" title={kpi.value}>{kpi.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Sales Bar Chart */}
        <div className="glass-surface rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm mb-4">Package Sales Performance</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" fontSize={10} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-55" />
                <YAxis fontSize={10} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-55" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="glass-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h4 className="font-bold text-sm mb-4">Booking Status Distribution</h4>
          <div className="h-64 flex flex-col md:flex-row items-center justify-around">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 text-xs font-bold shrink-0">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-700 dark:text-slate-350">{entry.name}:</span>
                  <span className="font-black text-slate-900 dark:text-white">{entry.value} bookings ({totalBookings ? Math.round((entry.value / totalBookings) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TouristAnalytics;
