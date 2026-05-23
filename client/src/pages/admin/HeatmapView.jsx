import React, { useState } from 'react';
import { Map, Info, Sliders } from 'lucide-react';

const mockGrid = [
  { sector: 'Sector A-1', label: 'Beachside West', density: 85, fill: 'bg-rose-500/80 border-rose-500' },
  { sector: 'Sector A-2', label: 'Beachside Center', density: 92, fill: 'bg-rose-600/90 border-rose-600' },
  { sector: 'Sector A-3', label: 'Beachside East', density: 74, fill: 'bg-amber-500/70 border-amber-500' },
  { sector: 'Sector B-1', label: 'Heritage Gate', density: 62, fill: 'bg-amber-500/60 border-amber-500' },
  { sector: 'Sector B-2', label: 'Museum Complex', density: 45, fill: 'bg-sky-500/50 border-sky-500' },
  { sector: 'Sector B-3', label: 'Old Town Square', density: 78, fill: 'bg-rose-500/80 border-rose-500' },
  { sector: 'Sector C-1', label: 'Central Hub Level 1', density: 88, fill: 'bg-rose-500/90 border-rose-500' },
  { sector: 'Sector C-2', label: 'Shopping Lane East', density: 34, fill: 'bg-emerald-500/40 border-emerald-500' },
  { sector: 'Sector C-3', label: 'Commercial Market', density: 50, fill: 'bg-sky-500/50 border-sky-500' }
];

export function HeatmapView() {
  const [time, setTime] = useState('14:00');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Crowd Heatmap Simulation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Grid visualization of sector-by-sector density levels</p>
        </div>
      </div>

      {/* Control Slider Card */}
      <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold flex items-center gap-1.5 opacity-80">
            <Sliders size={14} /> Simulate Peak Forecast Time
          </span>
          <span className="font-black text-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.1] px-2.5 py-0.5 rounded-full">{time} Hour</span>
        </div>
        <input
          type="range"
          min="08:00"
          max="22:00"
          step="2"
          value={time === '14:00' ? 14 : time === '08:00' ? 8 : time === '10:00' ? 10 : time === '12:00' ? 12 : time === '16:00' ? 16 : time === '18:00' ? 18 : time === '20:00' ? 20 : 22}
          onChange={(e) => {
            const val = e.target.value;
            setTime(`${val.padStart(2, '0')}:00`);
          }}
          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Heatmap Grid */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-4">
            {mockGrid.map((item) => (
              <div
                key={item.sector}
                className={`aspect-video rounded-xl border flex flex-col justify-between p-4 text-white shadow-sm transition-all duration-300 hover:scale-[1.02] ${item.fill}`}
              >
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase opacity-75">{item.sector}</p>
                  <h4 className="font-black text-xs mt-1 leading-tight">{item.label}</h4>
                </div>
                <span className="font-black text-lg self-end">{item.density}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend / Stats Card */}
        <div className="glass-surface rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Color Key Intensity</h4>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-rose-600/90 border border-rose-600 block shrink-0"></span>
                <span>Critical Risk (&gt; 80% Density)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-amber-500/70 border border-amber-500 block shrink-0"></span>
                <span>High Density (60% - 80%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-sky-500/50 border border-sky-500 block shrink-0"></span>
                <span>Moderate Level (35% - 60%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-emerald-500/40 border border-emerald-500 block shrink-0"></span>
                <span>Low Occupancy (&lt; 35%)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 text-xs mt-6 flex items-start gap-2.5">
            <Info size={16} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
            <p className="leading-relaxed opacity-80">Grid colors automatically shift on real-time capacity count increases.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeatmapView;
