import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, Camera, MapPin, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { avatarUrl, getRoleLabel, formatDate } from '../utils/helpers';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = [
    { icon: MapPin, label: 'Places Visited', value: '12', color: 'bg-blue-50 text-blue-600' },
    { icon: Calendar, label: 'Trips Booked', value: '4', color: 'bg-green-50 text-green-600' },
    { icon: TrendingUp, label: 'Loyalty Points', value: '1,250', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-500 mb-10">Manage your account settings and preferences.</p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left - Avatar & Stats */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                <img src={avatarUrl(user?.name || 'User')} alt="avatar"
                  className="w-24 h-24 rounded-full ring-4 ring-blue-100" />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                <Shield size={12} /> {getRoleLabel(user?.role)}
              </span>
              <p className="text-xs text-gray-400 mt-3">Member since {formatDate(user?.created_at || new Date().toISOString())}</p>
            </motion.div>

            {/* Stats */}
            <div className="space-y-3">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right - Edit Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Personal Information
            </h2>

            {saved && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
                <CheckCircle size={18} /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input id="profile-name" type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input id="profile-email" type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                  <Shield size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{getRoleLabel(user?.role)}</span>
                  <span className="ml-auto text-xs text-gray-400">Contact support to change role</span>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" id="save-profile"
                  className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
