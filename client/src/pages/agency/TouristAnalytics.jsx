import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const ageData = [
  { name: '18-25', value: 340 },
  { name: '26-35', value: 520 },
  { name: '36-50', value: 290 },
  { name: '50+', value: 110 }
];

const destData = [
  { name: 'Goa Beaches', bookings: 420 },
  { name: 'Manali Trek', bookings: 310 },
  { name: 'Jaipur Palace', bookings: 290 },
  { name: 'Desert Dune', bookings: 180 }
];

const COLORS = ['#38bdf8', '#2dd4bf', '#818cf8', '#fb7185'];

export function TouristAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Tourist Analytics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Deep dive analysis of customer demographics and package demands</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Bookings Chart */}
        <div className="glass-surface rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm mb-4">Popular Package Sales</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destData}>
                <XAxis dataKey="name" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
                <YAxis fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Demographics Pie Chart */}
        <div className="glass-surface rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-sm mb-4">Tourist Age Distribution</h4>
          <div className="h-64 flex flex-col md:flex-row items-center justify-around">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 text-xs font-bold">
              {ageData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name} Years ({Math.round(entry.value / 12.6)}%)</span>
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
