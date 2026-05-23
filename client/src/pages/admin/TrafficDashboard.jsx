import React from 'react';
import { Navigation, AlertTriangle, Compass, MapPin, Gauge } from 'lucide-react';

export function TrafficDashboard({ data }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Traffic Flow Monitoring</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live average vehicle speeds and road congestion indexes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.trafficPoints.map((point) => {
          const isCongested = point.congestion === 'Severe' || point.congestion === 'Heavy';
          return (
            <div
              key={point.id}
              className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 stat-card-glow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{point.id}</span>
                  <span className={`badge ${
                    point.congestion === 'Severe' ? 'badge-danger' : 
                    point.congestion === 'Heavy' ? 'badge-danger' : 
                    point.congestion === 'Moderate' ? 'badge-warning' : 'badge-success'
                  } text-[9px]`}>
                    {point.congestion}
                  </span>
                </div>
                
                <h4 className="font-black text-sm mb-1 leading-tight">{point.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <MapPin size={10} /> Sector Link
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <Gauge size={14} className="opacity-60" />
                  <span className="font-bold">{point.speed} km/h avg</span>
                </div>
                {isCongested && (
                  <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrafficDashboard;
