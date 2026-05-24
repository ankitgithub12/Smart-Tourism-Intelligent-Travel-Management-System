import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle, Award } from 'lucide-react';

export function SmartRecommendations({ data }) {
  const pendingCount = (data.bookings || []).filter((booking) => booking.status === 'Pending').length;
  const idleVehicles = (data.vehicles || []).filter((vehicle) => vehicle.status === 'Idle').length;
  const availableGuides = (data.guides || []).filter((guide) => guide.status === 'Available').length;
  const packageCount = (data.packages || []).length;

  const recommendations = [
    {
      title: 'Booking Queue',
      description: pendingCount
        ? `${pendingCount} booking request(s) are waiting for confirmation in your live queue.`
        : 'There are no pending booking requests right now.',
      icon: TrendingUp,
      badge: 'Bookings',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500',
    },
    {
      title: 'Fleet Availability',
      description: idleVehicles
        ? `${idleVehicles} vehicle(s) are idle and available for upcoming dispatches.`
        : 'No vehicle is currently marked idle. Review active or maintenance assignments.',
      icon: AlertCircle,
      badge: 'Fleet',
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
    },
    {
      title: 'Guide Coverage',
      description: `${availableGuides} available guide(s) can support ${packageCount} listed package(s).`,
      icon: Award,
      badge: 'Resources',
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Lightbulb size={24} className="text-amber-500" />
        <div>
          <h3 className="font-black text-base">Smart Operational Insights</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current recommendations calculated from saved agency activity</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <div key={recommendation.title} className={`border rounded-2xl p-5 shadow-sm ${recommendation.color}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-current shrink-0">
                <recommendation.icon size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10 text-current">
                {recommendation.badge}
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">{recommendation.title}</h4>
            <p className="text-xs opacity-85 leading-relaxed text-slate-600 dark:text-slate-300">{recommendation.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartRecommendations;
