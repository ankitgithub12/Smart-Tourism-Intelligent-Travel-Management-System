import React from 'react';
import { ShieldCheck, Check, X, FileText } from 'lucide-react';

export function AgencyApprovals({ data, setData }) {
  const updateAgencyStatus = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      agencies: prev.agencies.map(a => a.id === id ? { ...a, status: newStatus } : a)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Agency Compliance & Approvals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Validate business licenses and approve travel agencies onto the platform</p>
        </div>
      </div>

      {/* Agency list Table */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Agency ID</th>
                <th>Company Name</th>
                <th>Registered Owner</th>
                <th>License Reference</th>
                <th>Application Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="font-bold text-xs text-slate-400">{agency.id}</td>
                  <td className="font-bold text-sm text-slate-800 dark:text-slate-200">{agency.name}</td>
                  <td className="text-xs font-semibold">{agency.owner}</td>
                  <td className="text-xs font-bold text-slate-500">{agency.license}</td>
                  <td className="text-xs text-slate-400">{agency.date}</td>
                  <td>
                    <span className={`badge ${
                      agency.status === 'Approved' ? 'badge-success' : 
                      agency.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                    } text-[9px]`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {agency.status === 'Pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => updateAgencyStatus(agency.id, 'Approved')}
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Approve Agency"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => updateAgencyStatus(agency.id, 'Rejected')}
                          className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                          title="Reject Agency"
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

export default AgencyApprovals;
