import React from 'react';
import { Truck, Activity, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export function TransportTracker({ data, setData }) {
  const triggerStatusUpdate = (id) => {
    setData(prev => ({
      ...prev,
      publicTransports: prev.publicTransports.map(pt => {
        if (pt.id === id) {
          const nextStatus = pt.status === 'On Time' ? 'Delayed' : 'On Time';
          return { ...pt, status: nextStatus };
        }
        return pt;
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Public Transit Tracking</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live coordinates, schedule logs, and passenger volume tracking</p>
        </div>
      </div>

      {/* Grid of Transit Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.publicTransports.map((pt) => {
          const fillRatio = (pt.currentLoad / pt.capacity) * 100;
          return (
            <div
              key={pt.id}
              className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{pt.id}</span>
                  <span className={`badge ${
                    pt.status === 'On Time' ? 'badge-success' : 'badge-warning'
                  } text-[9px]`}>
                    {pt.status}
                  </span>
                </div>

                <h4 className="font-black text-sm mb-4">{pt.line}</h4>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="opacity-75">Pass. Capacity</span>
                      <span>{pt.currentLoad} / {pt.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          fillRatio > 85 ? 'bg-rose-500' : fillRatio > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillRatio}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Speed Vector:</span>
                    <span className="text-slate-800 dark:text-slate-300">{pt.speed} km/h</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => triggerStatusUpdate(pt.id)}
                  className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Toggle Route Log
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TransportTracker;
