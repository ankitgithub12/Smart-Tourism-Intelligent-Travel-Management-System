import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#38bdf8', '#2dd4bf', '#818cf8'];

export function TouristAnalytics({ data }) {
  const packageData = (data.packages || []).map((pkg) => ({ name: pkg.name, bookings: Number(pkg.bookings || 0) }));
  const statusData = ['Confirmed', 'Pending', 'Cancelled'].map((status) => ({
    name: status,
    value: (data.bookings || []).filter((booking) => booking.status === status).length,
  }));
  const totalBookings = statusData.reduce((total, entry) => total + entry.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Tourist Analytics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Analysis calculated from your packages and booking records</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-surface rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm mb-4">Package Sales</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageData}>
                <XAxis dataKey="name" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
                <YAxis fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-surface rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm mb-4">Booking Status Distribution</h4>
          <div className="h-64 flex flex-col md:flex-row items-center justify-around">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs font-bold">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name} ({totalBookings ? Math.round((entry.value / totalBookings) * 100) : 0}%)</span>
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
