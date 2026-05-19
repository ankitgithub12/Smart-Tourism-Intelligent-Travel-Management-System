import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, TrendingUp, Hotel, Car, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgencyDashboard = () => {
  const stats = [
    { label: 'Active Bookings', value: 45, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Revenue (Month)', value: '₹2.4L', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Listed Properties', value: 12, icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2">Agency Portal</h1>
            <p className="text-[hsl(var(--text-muted))]">Manage your listings, bookings, and revenue.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            Add Listing
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-3xl p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-muted))]">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Bookings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-surface rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2"><TrendingUp size={20} className="text-[hsl(var(--primary))]" /> Recent Bookings</h2>
                <Link to="#" className="text-sm text-[hsl(var(--primary))] font-semibold hover:underline">View All</Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[hsl(var(--primary)/0.1)]">
                      <th className="pb-3 text-sm font-semibold text-[hsl(var(--text-muted))]">Customer</th>
                      <th className="pb-3 text-sm font-semibold text-[hsl(var(--text-muted))]">Listing</th>
                      <th className="pb-3 text-sm font-semibold text-[hsl(var(--text-muted))]">Dates</th>
                      <th className="pb-3 text-sm font-semibold text-[hsl(var(--text-muted))]">Amount</th>
                      <th className="pb-3 text-sm font-semibold text-[hsl(var(--text-muted))]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Rahul Sharma', listing: 'Ocean Pearl Resort', dates: '12 Jun - 16 Jun', amount: '₹34,000', status: 'Confirmed', color: 'text-emerald-500 bg-emerald-500/10' },
                      { name: 'Priya Patel', listing: 'Private Cab Service', dates: '14 Jun', amount: '₹1,500', status: 'Pending', color: 'text-amber-500 bg-amber-500/10' },
                      { name: 'Amit Kumar', listing: 'Goa Heritage Tour', dates: '20 Jun', amount: '₹4,000', status: 'Confirmed', color: 'text-emerald-500 bg-emerald-500/10' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[hsl(var(--primary)/0.05)] last:border-0 hover:bg-[hsl(var(--primary)/0.02)] transition-colors">
                        <td className="py-4 font-semibold">{row.name}</td>
                        <td className="py-4 text-sm">{row.listing}</td>
                        <td className="py-4 text-sm text-[hsl(var(--text-muted))]">{row.dates}</td>
                        <td className="py-4 font-bold">{" "}{row.amount}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.color}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-surface rounded-3xl p-6">
              <h2 className="font-bold text-lg mb-4">Manage Listings</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] transition-colors flex flex-col items-center justify-center gap-2 text-sm font-semibold">
                  <Hotel size={24} className="text-[hsl(var(--primary))]" /> Hotels
                </button>
                <button className="p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] transition-colors flex flex-col items-center justify-center gap-2 text-sm font-semibold">
                  <Car size={24} className="text-[hsl(var(--primary))]" /> Cabs
                </button>
                <button className="p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] transition-colors flex flex-col items-center justify-center gap-2 text-sm font-semibold">
                  <MapPin size={24} className="text-[hsl(var(--primary))]" /> Packages
                </button>
                <button className="p-4 rounded-2xl bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] transition-colors flex flex-col items-center justify-center gap-2 text-sm font-semibold">
                  <Users size={24} className="text-[hsl(var(--primary))]" /> Guides
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
