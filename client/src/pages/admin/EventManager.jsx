import React, { useState } from 'react';
import { Calendar, Plus, Check, X, ShieldAlert } from 'lucide-react';

const initialEvents = [
  { id: 'EV-501', title: 'Sunset Beach Concert', location: 'Beach Road Boardwalk', date: '2026-05-30', crowdEst: '12,000+', impact: 'High', status: 'Pending Review' },
  { id: 'EV-502', title: 'Heritage Food Festival', location: 'Old Town Square', date: '2026-06-02', crowdEst: '5,000+', impact: 'Moderate', status: 'Approved' },
  { id: 'EV-503', title: 'Museum Art Exhibition', location: 'City Museum Complex', date: '2026-06-05', crowdEst: '1,200+', impact: 'Low', status: 'Approved' }
];

export function EventManager() {
  const [events, setEvents] = useState(initialEvents);

  const handleUpdateStatus = (id, nextStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus } : e));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">City Event & Permit Manager</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review permits and coordinate safety plans for high impact gatherings</p>
        </div>
      </div>

      {/* Events Permit Table */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Title</th>
                <th>Location / Zone</th>
                <th>Departure Date</th>
                <th>Est. Crowds</th>
                <th>Transit Impact</th>
                <th>Permit Status</th>
                <th className="text-right">Permit Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="font-bold text-xs text-slate-400">{event.id}</td>
                  <td className="font-bold text-sm text-slate-800 dark:text-slate-200">{event.title}</td>
                  <td className="text-xs font-semibold">{event.location}</td>
                  <td className="text-xs text-slate-500">{event.date}</td>
                  <td className="text-xs font-bold text-slate-600 dark:text-slate-400">{event.crowdEst}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      event.impact === 'High' ? 'bg-rose-500/10 text-rose-500' :
                      event.impact === 'Moderate' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {event.impact} Impact
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      event.status === 'Approved' ? 'badge-success' : 
                      event.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                    } text-[9px]`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {event.status === 'Pending Review' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdateStatus(event.id, 'Approved')}
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Approve Permit"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(event.id, 'Rejected')}
                          className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                          title="Reject Permit"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventManager;
