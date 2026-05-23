import React from 'react';
import { Truck, Trash2, Zap, Droplets, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function ResourceMonitor({ data, setData }) {
  const handleEmptyBin = (id) => {
    setData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        wasteBins: prev.resources.wasteBins.map(bin => {
          if (bin.id === id) {
            return { ...bin, fillLevel: 0, status: 'Normal' };
          }
          return bin;
        })
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Resource & Waste Utility Sensors</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track electrical load curves, grid water pressure flow, and smart bin telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Trash Bins */}
        <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            <Trash2 size={16} className="text-amber-500" /> Smart Trash Bins
          </h4>
          <div className="space-y-3">
            {data.resources.wasteBins.map((bin) => {
              const isFull = bin.fillLevel >= 85;
              return (
                <div key={bin.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{bin.location} <strong className="text-[10px] text-slate-400">{bin.id}</strong></span>
                      <span className={isFull ? 'text-rose-500 font-black' : 'opacity-80'}>{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-rose-500 animate-pulse' : bin.fillLevel > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      ></div>
                    </div>
                  </div>
                  {isFull && (
                    <button
                      onClick={() => handleEmptyBin(bin.id)}
                      className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/20"
                    >
                      Empty
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Electrical & Water Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Power usage Area Chart */}
          <div className="glass-surface rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-1.5">
              <Zap size={16} className="text-amber-400" /> Grid Electrical Demand (MWh)
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.resources.powerUsage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
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
                  <Area type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={2.5} fill="rgba(245, 158, 11, 0.05)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Water usage Area Chart */}
          <div className="glass-surface rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-1.5">
              <Droplets size={16} className="text-sky-500" /> Utility Water Distribution Flow (KL/h)
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.resources.waterConsumption}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
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
                  <Area type="monotone" dataKey="flow" stroke="#0ea5e9" strokeWidth={2.5} fill="rgba(14, 165, 233, 0.05)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceMonitor;
