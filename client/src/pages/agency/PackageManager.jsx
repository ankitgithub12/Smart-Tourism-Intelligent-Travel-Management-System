import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Image as ImageIcon, MapPin, Calendar, CreditCard } from 'lucide-react';

export function PackageManager({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    duration: '',
    price: '',
    image: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.destination || !formData.price) return;

    const newPackage = {
      id: data.packages.length + 1,
      name: formData.name,
      destination: formData.destination,
      duration: formData.duration || '3 Days, 2 Nights',
      price: parseFloat(formData.price),
      status: 'Active',
      bookings: 0,
      image: formData.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'
    };

    setData(prev => ({
      ...prev,
      packages: [...prev.packages, newPackage]
    }));

    setFormData({ name: '', destination: '', duration: '', price: '', image: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setData(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Travel Package Manager</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">List and customize tourism packages</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-xs"
        >
          <Plus size={16} /> Add Package
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-surface rounded-2xl p-6 shadow-md border border-[hsl(var(--primary))/0.1]"
          >
            <h4 className="font-bold text-sm mb-4">Create New Package</h4>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Package Title</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Kerala Backwaters"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Alleppey, Kerala"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 4 Days, 3 Nights"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 14999"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary !py-2 text-xs font-bold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn-secondary !py-2 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            layout
            className="glass-surface rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between border border-slate-200/40 dark:border-slate-800/40 hover:shadow-md transition-shadow"
          >
            <div className="relative h-40 shrink-0">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 badge badge-success text-[9px]">
                {pkg.status}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-sm line-clamp-1">{pkg.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                  <MapPin size={12} className="text-[hsl(var(--primary))]" />
                  <span>{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Calendar size={12} className="text-[hsl(var(--primary))]" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</p>
                  <p className="text-sm font-black text-[hsl(var(--primary))]">₹{pkg.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {pkg.bookings} booked
                  </span>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PackageManager;
