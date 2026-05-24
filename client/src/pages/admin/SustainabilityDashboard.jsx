import React from 'react';
import { Leaf, Award, Recycle, CloudRain } from 'lucide-react';

export function SustainabilityDashboard({ data }) {
  const cards = [
    { label: 'Carbon Offset Goal', value: `${data.sustainability.carbonOffset} Tonnes`, desc: 'Offset via smart routes & trees', icon: CloudRain, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Smart Plastics Collected', value: `${data.sustainability.totalPlasticsCollected} kg`, desc: 'Retrieved from smart waste bins', icon: Recycle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Green Fleet Ratio', value: `${data.sustainability.greenFleetRatio}%`, desc: 'Buses powered by solar/electric', icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Leaf size={24} className="text-emerald-500 animate-pulse" />
        <div>
          <h3 className="font-black text-base">Sustainability & Eco Metrics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review carbon indexes, smart-waste operations, and eco targets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eco Score Circular Meter */}
        <div className="glass-surface rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h4 className="font-bold text-sm">Overall City Eco-Score</h4>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Simple circular visual */}
            <div className="w-full h-full rounded-full border-[10px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-black text-emerald-500">{data.sustainability.ecoScore}</span>
                <span className="text-xs text-slate-400 block font-bold">/ 100</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">Score updates based on real-time transit load reduction and waste recycle efficiency.</p>
        </div>

        {/* Info Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 stat-card-glow flex flex-col justify-between"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} mb-4`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h4 className="text-xl font-black mt-1">{card.value}</h4>
                <p className="text-[10px] text-slate-500 mt-2">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SustainabilityDashboard;
