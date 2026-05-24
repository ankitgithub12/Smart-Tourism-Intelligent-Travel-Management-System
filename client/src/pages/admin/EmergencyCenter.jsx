import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Send, Check } from 'lucide-react';
import { telemetryAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export function EmergencyCenter({ data, setData }) {
  const handleResolveIncident = async (id) => {
    const toastId = toast.loading('Resolving incident...');
    try {
      const res = await telemetryAPI.updateEmergency(id, 'Resolved');
      setData(res.data.telemetry);
      toast.success('Incident resolved!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve incident.', { id: toastId });
    }
  };

  const handleDispatchIncident = async (id) => {
    const toastId = toast.loading('Dispatching responders...');
    try {
      const res = await telemetryAPI.updateEmergency(id, 'Dispatched');
      setData(res.data.telemetry);
      toast.success('Responders dispatched!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch responders.', { id: toastId });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-500" /> Emergency Command & Dispatch
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Coordinate emergency medical, police, or safety units across city zones</p>
        </div>
      </div>

      {/* Emergency Incidents Table */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Severity</th>
                <th>Incident Category</th>
                <th>Location / Zone</th>
                <th>Reporter Source</th>
                <th>Time Logged</th>
                <th>Status</th>
                <th className="text-right">Dispatch Control</th>
              </tr>
            </thead>
            <tbody>
              {data.emergencies.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="font-bold text-xs text-slate-400">{item.id}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      item.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                      item.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.type}</td>
                  <td className="text-xs font-semibold">{item.location}</td>
                  <td className="text-xs text-slate-500 dark:text-slate-400">{item.reporter}</td>
                  <td className="text-xs text-slate-400">{item.time}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Resolved' ? 'badge-success' : 
                      item.status === 'Dispatched' ? 'badge-info' : 'badge-warning'
                    } text-[9px]`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {item.status !== 'Resolved' && (
                      <div className="flex gap-2 justify-end">
                        {item.status === 'Pending Review' && (
                          <button
                            onClick={() => handleDispatchIncident(item.id)}
                            className="p-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            title="Dispatch Responders"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveIncident(item.id)}
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Mark Resolved"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data.emergencies.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-xs text-slate-400">
                    No active emergency incidents logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmergencyCenter;
