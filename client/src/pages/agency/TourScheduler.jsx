import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Clock, Users, User, ChevronRight, Check } from 'lucide-react';

export function TourScheduler({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    packageId: '',
    date: '',
    time: '09:00 AM',
    guideId: '',
    capacity: 20
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.packageId || !formData.date || !formData.guideId) return;

    const selectedPkg = data.packages.find(p => p.id === parseInt(formData.packageId));
    const selectedGuide = data.guides.find(g => g.id === formData.guideId);

    const newTour = {
      id: `T-${100 + data.tours.length + 1}`,
      package: selectedPkg ? selectedPkg.name : 'Unknown Tour',
      date: formData.date,
      time: formData.time,
      guide: selectedGuide ? selectedGuide.name : 'Unassigned',
      status: 'Upcoming',
      capacity: parseInt(formData.capacity),
      filled: 0
    };

    setData(prev => ({
      ...prev,
      tours: [...prev.tours, newTour]
    }));

    setFormData({ packageId: '', date: '', time: '09:00 AM', guideId: '', capacity: 20 });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Tour Scheduling</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Plan dates, slots, and guides for upcoming groups</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-xs"
        >
          <Plus size={16} /> Schedule Tour
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
            <h4 className="font-bold text-sm">Schedule Group Departure</h4>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Select Package</label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                >
                  <option value="">-- Choose Package --</option>
                  {data.packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Departure Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Time Slot</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Select Guide</label>
                <select
                  name="guideId"
                  value={formData.guideId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                >
                  <option value="">-- Choose Guide --</option>
                  {data.guides.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary !py-2 text-xs">Confirm</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 btn-secondary !py-2 text-xs">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.tours.map((tour) => {
          const fillRatio = (tour.filled / tour.capacity) * 100;
          return (
            <motion.div
              key={tour.id}
              layout
              className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tour.id}</span>
                  <span className={`badge ${
                    tour.status === 'Fully Booked' ? 'badge-danger' : 'badge-success'
                  } text-[9px]`}>
                    {tour.status}
                  </span>
                </div>
                <h4 className="font-black text-sm mb-4 leading-tight">{tour.package}</h4>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="text-[hsl(var(--primary))]" />
                    <span>{tour.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={14} className="text-[hsl(var(--primary))]" />
                    <span>{tour.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <User size={14} className="text-[hsl(var(--primary))]" />
                    <span>Guide: <strong>{tour.guide}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold flex items-center gap-1">
                    <Users size={12} className="text-slate-400" /> Capacity Filled
                  </span>
                  <span className="font-black">{tour.filled} / {tour.capacity}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fillRatio >= 100 ? 'bg-rose-500' : fillRatio > 75 ? 'bg-amber-500' : 'bg-[hsl(var(--primary))]'
                    }`}
                    style={{ width: `${fillRatio}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default TourScheduler;
