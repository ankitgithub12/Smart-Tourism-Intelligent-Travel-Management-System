import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Send } from 'lucide-react';

export function CrowdMonitor({ data }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Crowd Density Monitoring</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live crowd capacity sensors and risk assessment metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.crowdZones.map((zone) => {
          const isCritical = zone.density >= 75;
          return (
            <motion.div
              key={zone.id}
              layout
              className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{zone.id}</span>
                  <span className={`badge ${
                    zone.status === 'Critical' ? 'badge-danger' : 
                    zone.status === 'High' ? 'badge-warning' : 
                    zone.status === 'Moderate' ? 'badge-info' : 'badge-success'
                  } text-[9px]`}>
                    {zone.status}
                  </span>
                </div>
                
                <h4 className="font-black text-sm mb-4">{zone.name}</h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                      <span className="opacity-70 flex items-center gap-1">
                        <Users size={12} /> Live Visitors
                      </span>
                      <span>{zone.visitors} est.</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          zone.density >= 75 ? 'bg-rose-500' : zone.density >= 55 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${zone.density}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black">{zone.density}% Capacity</span>
                {isCritical && (
                  <button className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-rose-500/20 transition-all">
                    <Send size={10} /> Broadcast Alert
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default CrowdMonitor;
