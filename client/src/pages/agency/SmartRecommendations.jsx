import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle, ArrowUpRight, Percent, Award } from 'lucide-react';

export function SmartRecommendations({ data }) {
  const recommendations = [
    {
      title: 'High Demand Surge Forecast',
      description: 'Mountain Peak Trekking is experiencing a 35% search surge. Consider adding 2 additional slots for June 1st.',
      icon: TrendingUp,
      actionText: 'Increase Slots',
      badge: 'High Value',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
    },
    {
      title: 'Optimal Pricing Strategy',
      description: 'Desert Dune Safari bookings are slow. A temporary 10% promotional discount would increase conversion by 22%.',
      icon: Percent,
      actionText: 'Apply Discount',
      badge: 'Promo Suggestion',
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-500'
    },
    {
      title: 'Guide Reassignment Opportunity',
      description: 'Goa Heritage tour is fully booked on May 26th. Guide Sneha Sharma is available; reassigning her would unlock +10 bookings.',
      icon: Award,
      actionText: 'Assign Guide',
      badge: 'Resource Efficiency',
      color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Lightbulb size={24} className="text-amber-500 animate-pulse" />
        <div>
          <h3 className="font-black text-base">AI Smart Recommendations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Contextual optimizations and revenue suggestions generated from travel trend analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${rec.color}`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-current shrink-0">
                  <rec.icon size={20} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10 text-current">
                  {rec.badge}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">{rec.title}</h4>
              <p className="text-xs opacity-85 leading-relaxed text-slate-600 dark:text-slate-300">{rec.description}</p>
            </div>
            <button className="mt-6 w-full btn-primary !py-2 text-xs font-bold text-center">
              {rec.actionText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartRecommendations;
