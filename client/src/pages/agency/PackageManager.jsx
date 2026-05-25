import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Image as ImageIcon, MapPin, Calendar, X, Power } from 'lucide-react';
import { agencyAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export function PackageManager({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    duration: '',
    price: '',
    itinerary: '',
    imageFile: null,
  });

  // Edit Mode State
  const [editingPackage, setEditingPackage] = useState(null);
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    destination: '',
    duration: '',
    price: '',
    itinerary: '',
    status: 'Active',
    imageFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.destination || !formData.price) return;

    const toastId = toast.loading('Creating package...');
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('destination', formData.destination);
      payload.append('duration', formData.duration || '3 Days, 2 Nights');
      payload.append('price', parseFloat(formData.price));
      payload.append('itinerary', formData.itinerary || '');
      if (formData.imageFile) payload.append('image_file', formData.imageFile);

      const res = await agencyAPI.createPackage(payload);
      setData(res.data.agency);
      setFormData({ name: '', destination: '', duration: '', price: '', itinerary: '', imageFile: null });
      setShowAddForm(false);
      toast.success('Package created successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create package.', { id: toastId });
    }
  };

  const startEdit = (pkg) => {
    setEditingPackage(pkg);
    setEditData({
      id: pkg.id,
      name: pkg.name,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price,
      itinerary: pkg.itinerary || '',
      status: pkg.status || 'Active',
      imageFile: null,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.name || !editData.destination || !editData.price) return;

    const toastId = toast.loading('Updating package...');
    try {
      const payload = new FormData();
      payload.append('_method', 'PUT'); // spoof put
      payload.append('name', editData.name);
      payload.append('destination', editData.destination);
      payload.append('duration', editData.duration || '3 Days, 2 Nights');
      payload.append('price', parseFloat(editData.price));
      payload.append('itinerary', editData.itinerary || '');
      payload.append('status', editData.status);
      if (editData.imageFile) payload.append('image_file', editData.imageFile);

      const res = await agencyAPI.updatePackage(editData.id, payload);
      setData(res.data.agency);
      setEditingPackage(null);
      toast.success('Package updated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update package.', { id: toastId });
    }
  };

  const toggleStatus = async (pkg) => {
    const nextStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
    const toastId = toast.loading(`Changing status to ${nextStatus}...`);
    try {
      const res = await agencyAPI.updatePackageStatus(pkg.id, nextStatus);
      setData(res.data.agency);
      toast.success(`Package is now ${nextStatus}.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle package status.', { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    const toastId = toast.loading('Deleting package...');
    try {
      const res = await agencyAPI.deletePackage(id);
      setData(res.data.agency);
      toast.success('Package deleted successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete package.', { id: toastId });
    }
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
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Package Title</label>
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

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Destination</label>
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

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Package Image</label>
                  <label className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs cursor-pointer hover:border-[hsl(var(--primary))] transition-colors">
                    <ImageIcon size={14} className="text-[hsl(var(--primary))]" />
                    <span className="truncate">{formData.imageFile?.name || 'Upload image'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Itinerary / Tour Details</label>
                <textarea
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleInputChange}
                  placeholder="Describe day-by-day plan..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-6 text-xs font-bold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary !py-2 !px-6 text-xs font-bold"
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
              <span className={`absolute top-3 right-3 badge ${pkg.status === 'Active' ? 'badge-success' : 'badge-danger'} text-[9px]`}>
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
                {pkg.itinerary && (
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 italic">
                    "{pkg.itinerary}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</p>
                  <p className="text-sm font-black text-[hsl(var(--primary))]">₹{pkg.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {pkg.bookings} booked
                  </span>
                  
                  <button
                    onClick={() => toggleStatus(pkg)}
                    className={`p-1.5 rounded-lg transition-colors ${pkg.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-500/10'}`}
                    title={pkg.status === 'Active' ? 'Deactivate Package' : 'Activate Package'}
                  >
                    <Power size={13} />
                  </button>

                  <button
                    onClick={() => startEdit(pkg)}
                    className="p-1.5 rounded-lg hover:bg-sky-500/10 text-sky-500 transition-colors"
                    title="Edit Package"
                  >
                    <Edit size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Package Modal */}
      <AnimatePresence>
        {editingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-surface max-w-lg w-full rounded-2xl p-6 shadow-xl border border-white/10 relative"
            >
              <button
                onClick={() => setEditingPackage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>

              <h4 className="font-black text-base mb-4">Edit Package Details</h4>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Package Title</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={editData.destination}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={editData.duration}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Status</label>
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Replace Image</label>
                    <label className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs cursor-pointer hover:border-[hsl(var(--primary))] transition-colors">
                      <ImageIcon size={14} className="text-[hsl(var(--primary))]" />
                      <span className="truncate">{editData.imageFile?.name || 'Upload image'}</span>
                      <input type="file" accept="image/*" onChange={(e) => setEditData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Itinerary / Tour Details</label>
                  <textarea
                    name="itinerary"
                    value={editData.itinerary}
                    onChange={handleEditInputChange}
                    placeholder="Describe day-by-day plan..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-primary !py-2 !px-6 text-xs font-bold"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="btn-secondary !py-2 !px-6 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PackageManager;
