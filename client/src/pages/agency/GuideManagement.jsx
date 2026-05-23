import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Star, Phone, Check, Eye } from 'lucide-react';

export function GuideManagement({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    rating: 5.0,
    contact: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty) return;

    const newGuide = {
      id: `G-${200 + data.guides.length + 1}`,
      name: formData.name,
      specialty: formData.specialty,
      rating: parseFloat(formData.rating) || 5.0,
      status: 'Available',
      activeTours: 0,
      contact: formData.contact || '+91 99999 88888'
    };

    setData(prev => ({
      ...prev,
      guides: [...prev.guides, newGuide]
    }));

    setFormData({ name: '', specialty: '', rating: 5.0, contact: '' });
    setShowAddForm(false);
  };

  const toggleAvailability = (id) => {
    setData(prev => ({
      ...prev,
      guides: prev.guides.map(g => {
        if (g.id === id) {
          return { ...g, status: g.status === 'Available' ? 'Unavailable' : 'Available' };
        }
        return g;
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Tourist Guide Roster</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage specialized travel guides and assignment status</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-xs"
        >
          <Plus size={16} /> Register Guide
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
            <h4 className="font-bold text-sm">Register Travel Guide</h4>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Specialty</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  placeholder="e.g. Hiking & Local History"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 98765 XXXXX"
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

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.guides.map((g) => (
          <motion.div
            key={g.id}
            layout
            className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{g.id}</span>
                <span className={`badge ${
                  g.status === 'Available' ? 'badge-success' : 
                  g.status === 'Assigned' ? 'badge-info' : 'badge-danger'
                } text-[9px]`}>
                  {g.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))/0.1] to-[hsl(var(--accent))/0.1] flex items-center justify-center font-black text-[hsl(var(--primary))] text-base shrink-0 border border-[hsl(var(--primary))/0.1]">
                  {g.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-sm">{g.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{g.specialty}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold">{g.rating.toFixed(1)} / 5.0 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="opacity-60" />
                  <span>{g.contact}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {g.activeTours} Active Tours
              </span>
              <button
                onClick={() => toggleAvailability(g.id)}
                className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline"
              >
                Toggle Availability
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default GuideManagement;
