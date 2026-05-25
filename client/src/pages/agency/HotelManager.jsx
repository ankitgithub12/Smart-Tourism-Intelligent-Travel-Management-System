import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Image as ImageIcon, MapPin, Star, Wifi, Car, UtensilsCrossed, Waves, Dumbbell, X, Power } from 'lucide-react';
import { agencyAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const amenityIcons = { wifi: Wifi, pool: Waves, restaurant: UtensilsCrossed, parking: Car, gym: Dumbbell };

export function HotelManager({ data, setData }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    stars: 3,
    price_per_night: '',
    amenities: 'wifi,restaurant',
    imageFile: null,
  });

  // Edit Hotel State
  const [editingHotel, setEditingHotel] = useState(null);
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    location: '',
    stars: 3,
    price_per_night: '',
    amenities: '',
    status: 'Active',
    imageFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.price_per_night) return;

    const toastId = toast.loading('Creating hotel...');
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('location', formData.location);
      payload.append('stars', formData.stars);
      payload.append('price_per_night', formData.price_per_night);
      payload.append('amenities', formData.amenities);
      if (formData.imageFile) payload.append('image_file', formData.imageFile);

      const res = await agencyAPI.createHotel(payload);
      setData(res.data.agency);
      setFormData({ name: '', location: '', stars: 3, price_per_night: '', amenities: 'wifi,restaurant', imageFile: null });
      setShowAddForm(false);
      toast.success('Hotel created successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create hotel.', { id: toastId });
    }
  };

  const startEdit = (hotel) => {
    setEditingHotel(hotel);
    setEditData({
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      stars: hotel.stars,
      price_per_night: hotel.price,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(',') : hotel.amenities || '',
      status: hotel.status || 'Active',
      imageFile: null,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.name || !editData.location || !editData.price_per_night) return;

    const toastId = toast.loading('Updating hotel...');
    try {
      const payload = new FormData();
      payload.append('_method', 'PUT'); // spoof put
      payload.append('name', editData.name);
      payload.append('location', editData.location);
      payload.append('stars', editData.stars);
      payload.append('price_per_night', editData.price_per_night);
      payload.append('amenities', editData.amenities);
      payload.append('status', editData.status);
      if (editData.imageFile) payload.append('image_file', editData.imageFile);

      const res = await agencyAPI.updateHotel(editData.id, payload);
      setData(res.data.agency);
      setEditingHotel(null);
      toast.success('Hotel updated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update hotel.', { id: toastId });
    }
  };

  const toggleStatus = async (hotel) => {
    const nextStatus = hotel.status === 'Active' ? 'Inactive' : 'Active';
    const toastId = toast.loading(`Changing status to ${nextStatus}...`);
    try {
      const res = await agencyAPI.updateHotelStatus(hotel.id, nextStatus);
      setData(res.data.agency);
      toast.success(`Hotel is now ${nextStatus}.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle hotel status.', { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    const toastId = toast.loading('Deleting hotel...');
    try {
      const res = await agencyAPI.deleteHotel(id);
      setData(res.data.agency);
      toast.success('Hotel deleted successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete hotel.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Hotel Manager</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add stays that appear on the public hotels page</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-xs">
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-surface rounded-2xl p-6 shadow-md border border-[hsl(var(--primary))/0.1]">
            <h4 className="font-bold text-sm mb-4">Create New Hotel</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Hotel name" className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none" required />
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none" required />
              <input type="number" min="1" max="5" name="stars" value={formData.stars} onChange={handleInputChange} placeholder="Stars" className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none" required />
              <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleInputChange} placeholder="Price per night" className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none" required />
              <input name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="wifi,pool,parking" className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none" />
              <label className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs cursor-pointer">
                <ImageIcon size={14} className="text-[hsl(var(--primary))]" />
                <span className="truncate">{formData.imageFile?.name || 'Upload image'}</span>
                <input type="file" accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))} className="hidden" />
              </label>
              <div className="flex gap-2 lg:col-span-6">
                <button type="submit" className="btn-primary !py-2 !px-5 text-xs font-bold">Create</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary !py-2 !px-5 text-xs font-bold">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(data.hotels || []).map((hotel) => (
          <motion.div key={hotel.id} layout className="glass-surface rounded-2xl overflow-hidden shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between">
            <div>
              <div className="relative h-40">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <span className={`absolute top-3 right-3 badge ${hotel.status === 'Active' ? 'badge-success' : 'badge-danger'} text-[9px]`}>
                  {hotel.status}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-black text-sm line-clamp-1">{hotel.name}</h4>
                <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-2"><MapPin size={12} /> {hotel.location}</p>
                <div className="flex gap-1.5 mt-3">
                  {(hotel.amenities || []).slice(0, 5).map((amenity) => {
                    const Icon = amenityIcons[String(amenity).toLowerCase()];
                    return Icon ? <span key={amenity} className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center"><Icon size={13} /></span> : null;
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
              <div className="flex justify-between items-center pt-3">
                <p className="text-sm font-black text-[hsl(var(--primary))]">₹{Number(hotel.price || 0).toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStatus(hotel)}
                    className={`p-1.5 rounded-lg transition-colors ${hotel.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-500/10'}`}
                    title={hotel.status === 'Active' ? 'Deactivate Hotel' : 'Activate Hotel'}
                  >
                    <Power size={13} />
                  </button>

                  <button
                    onClick={() => startEdit(hotel)}
                    className="p-1.5 rounded-lg hover:bg-sky-500/10 text-sky-500 transition-colors"
                    title="Edit Hotel"
                  >
                    <Edit size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(hotel.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="Delete Hotel"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Hotel Modal */}
      <AnimatePresence>
        {editingHotel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-surface max-w-lg w-full rounded-2xl p-6 shadow-xl border border-white/10 relative"
            >
              <button
                onClick={() => setEditingHotel(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>

              <h4 className="font-black text-base mb-4">Edit Hotel Details</h4>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Hotel Name</label>
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
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editData.location}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Star Rating</label>
                    <input
                      type="number"
                      name="stars"
                      min="1"
                      max="5"
                      value={editData.stars}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Price Per Night (₹)</label>
                    <input
                      type="number"
                      name="price_per_night"
                      value={editData.price_per_night}
                      onChange={handleEditInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Amenities (comma separated)</label>
                    <input
                      type="text"
                      name="amenities"
                      value={editData.amenities}
                      onChange={handleEditInputChange}
                      placeholder="e.g. wifi,pool,gym"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Replace Image</label>
                  <label className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs cursor-pointer hover:border-[hsl(var(--primary))] transition-colors">
                    <ImageIcon size={14} className="text-[hsl(var(--primary))]" />
                    <span className="truncate">{editData.imageFile?.name || 'Upload image'}</span>
                    <input type="file" accept="image/*" onChange={(e) => setEditData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))} className="hidden" />
                  </label>
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
                    onClick={() => setEditingHotel(null)}
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

export default HotelManager;
