import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Fuel, Users, Compass, AlertTriangle, Play, Settings } from 'lucide-react';
import { agencyAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export function VehicleAllocation({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    type: 'Cab',
    driver: '',
    fuel: 100,
    location: 'Main Depot'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.model || !formData.driver) return;

    const toastId = toast.loading('Adding fleet vehicle...');
    try {
      const res = await agencyAPI.createVehicle({
        model: formData.model,
        type: formData.type,
        driver: formData.driver,
        location: formData.location || 'Main Depot'
      });
      setData(res.data.agency);
      setFormData({ model: '', type: 'Cab', driver: '', fuel: 100, location: 'Main Depot' });
      setShowAddForm(false);
      toast.success('Vehicle added successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to add vehicle.', { id: toastId });
    }
  };


  const toggleStatus = (id) => {
    setData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => {
        if (v.id === id) {
          const nextStatus = v.status === 'Active' ? 'Idle' : v.status === 'Idle' ? 'Maintenance' : 'Active';
          return { ...v, status: nextStatus, currentLoad: nextStatus === 'Active' ? 4 : 0 };
        }
        return v;
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Vehicle & Fleet Allocation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track and dispatch cabs, mini-buses, and drivers in real time</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-xs"
        >
          <Car size={16} /> Add Fleet Vehicle
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-surface rounded-2xl p-6 shadow-md border border-[hsl(var(--primary))/0.1] space-y-4"
          >
            <h4 className="font-bold text-sm">Add New Fleet Asset</h4>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Model Name</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g. Maruti Suzuki Ertiga"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Vehicle Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                >
                  <option value="Cab">Sedan Cab</option>
                  <option value="SUV">SUV</option>
                  <option value="Mini Bus">Mini Bus</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Assign Driver</label>
                <input
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  placeholder="Driver's Full Name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Current Depot</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Depot or Hub"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary !py-2 text-xs">Confirm</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 btn-secondary !py-2 text-xs">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.vehicles.map((v) => (
          <motion.div
            key={v.id}
            layout
            className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{v.id}</span>
                <span className={`badge ${
                  v.status === 'Active' ? 'badge-success' : 
                  v.status === 'Idle' ? 'badge-info' : 'badge-warning'
                } text-[9px]`}>
                  {v.status}
                </span>
              </div>

              <h4 className="font-black text-sm mb-1">{v.model}</h4>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{v.type}</p>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="opacity-70">Driver:</span>
                  <span className="font-bold">{v.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Last Loc:</span>
                  <span className="font-bold">{v.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Pass. Load:</span>
                  <span className="font-bold">{v.currentLoad} onboard</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Fuel Level */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
                  <span className="flex items-center gap-1 opacity-70">
                    <Fuel size={12} /> Fuel Level
                  </span>
                  <span>{v.fuel}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      v.fuel < 25 ? 'bg-rose-500 animate-pulse' : v.fuel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${v.fuel}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(v.id)}
                  className="flex-1 text-[10px] font-bold py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                >
                  <Play size={10} className="text-emerald-500" /> Dispatch
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default VehicleAllocation;
