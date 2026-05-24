import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, Truck, ShieldAlert, CheckCircle, Leaf,
  MapPin, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export function AdminOverview({ data, setTab }) {
  const cityData = data.cityData;
  const stats = [
    { label: 'Avg Crowd Density', value: `${Math.round(data.crowdZones.reduce((acc, curr) => acc + curr.density, 0) / data.crowdZones.length)}%`, icon: Users, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Active Transit Lines', value: data.publicTransports.length, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Pending Agency Approvals', value: data.agencies.filter(a => a.status === 'Pending').length, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Sustainability Score', value: `${data.sustainability.ecoScore}/100`, icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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

      {cityData && (
        <div className="glass-surface rounded-2xl p-5 shadow-sm border border-blue-100/70">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Actual City Data Feed</p>
              <h3 className="font-black text-lg">{cityData.city}, {cityData.country}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Live context from {Object.values(cityData.sources || {}).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-blue-50 dark:bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-black text-slate-400">Weather</p>
                <p className="text-sm font-black text-blue-600">
                  {cityData.weather?.temperature != null ? `${Math.round(cityData.weather.temperature)}°C` : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-black text-slate-400">Condition</p>
                <p className="text-sm font-black text-blue-600">{cityData.weather?.condition || 'N/A'}</p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-black text-slate-400">Air Quality</p>
                <p className="text-sm font-black text-blue-600">{cityData.airQuality?.label || 'N/A'}</p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-black text-slate-400">Live POIs</p>
                <p className="text-sm font-black text-blue-600">{cityData.touristPlaces?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Emergency Feed */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <ShieldAlert className="text-rose-500 animate-pulse" size={20} />
                Live Incident command Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts reported by AI street cams and citizens</p>
            </div>
            <button
              onClick={() => setTab('emergency')}
              className="text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              Dispatch Center
            </button>
          </div>

          <div className="space-y-3">
            {data.emergencies.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      item.severity === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.severity} severity
                    </span>
                    <span className="text-[10px] font-black text-slate-400">{item.id}</span>
                  </div>
                  <h4 className="font-bold text-xs mt-1.5">{item.type}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.location} • {item.reporter}</p>
                </div>
                <span className="badge badge-warning text-[9px]">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Controls/Traffic Overview */}
        <div className="space-y-6">
          <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm">Zone Alerts</h3>
            <div className="space-y-3">
              {data.crowdZones.slice(0, 2).map((zone) => (
                <div key={zone.id} className="flex items-center justify-between text-xs">
                  <span className="font-bold">{zone.name}</span>
                  <span className={`badge ${zone.status === 'Critical' ? 'badge-danger' : 'badge-warning'} text-[9px]`}>
                    {zone.density}% cap
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setTab('crowd')}
              className="w-full btn-primary !py-2 text-xs font-bold"
            >
              Analyze Density
            </button>
          </div>

          <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm">Public Resources</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <button 
                onClick={() => setTab('resources')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center gap-1 hover:bg-slate-100"
              >
                <span className="text-xs font-black">Waste Fill</span>
                <span className="text-[11px] text-slate-400">95% Critical</span>
              </button>
              <button 
                onClick={() => setTab('sustainability')}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center gap-1 hover:bg-slate-100"
              >
                <span className="text-xs font-black">Green Fleet</span>
                <span className="text-[11px] text-slate-400">{data.sustainability.greenFleetRatio}% ratio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
