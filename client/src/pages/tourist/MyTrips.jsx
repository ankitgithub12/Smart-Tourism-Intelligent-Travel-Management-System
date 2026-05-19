import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Hotel, Car, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // For demonstration, we'll use mock data if API fails or token is missing
      if (!token) throw new Error('No token');
      const res = await api.get('/trips');
      setTrips(res.data.data);
    } catch (err) {
      console.log('Using mock trips data');
      setTrips([
        { id: 1, from_location: 'Mumbai', to_destination: 'Goa', departure_date: '2026-06-01', return_date: '2026-06-05', travelers: 2, status: 'confirmed', total_price: 24500, hotel: { name: 'Ocean Pearl Resort' }, cabService: { label: 'Private Cab' } },
        { id: 2, from_location: 'Delhi', to_destination: 'Jaipur', departure_date: '2026-04-10', return_date: '2026-04-12', travelers: 4, status: 'completed', total_price: 18000, hotel: { name: 'Heritage Palace' }, cabService: null },
        { id: 3, from_location: 'Bangalore', to_destination: 'Coorg', departure_date: '2026-07-15', return_date: '2026-07-18', travelers: 2, status: 'pending', total_price: 15000, hotel: null, cabService: { label: 'Shared Cab' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    confirmed: 'bg-emerald-500/10 text-emerald-500',
    completed: 'bg-blue-500/10 text-blue-500',
    pending: 'bg-amber-500/10 text-amber-500',
    cancelled: 'bg-rose-500/10 text-rose-500',
  };

  const statusIcons = {
    confirmed: <CheckCircle size={14} />,
    completed: <CheckCircle size={14} />,
    pending: <Clock size={14} />,
    cancelled: <XCircle size={14} />,
  };

  const filteredTrips = trips.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['confirmed', 'pending'].includes(t.status);
    if (filter === 'past') return t.status === 'completed';
    return t.status === filter;
  });

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2">My Bookings</h1>
          <p className="text-[hsl(var(--text-muted))]">Manage your past and upcoming trips.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-[hsl(var(--primary))] text-white shadow-lg' : 'glass-surface hover:bg-[hsl(var(--primary)/0.1)]'}`}>
              {f} Trips
            </button>
          ))}
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div></div>
        ) : filteredTrips.length === 0 ? (
          <div className="glass-surface rounded-3xl p-12 text-center">
            <MapPin size={48} className="mx-auto text-[hsl(var(--primary)/0.3)] mb-4" />
            <h3 className="text-xl font-bold mb-2">No trips found</h3>
            <p className="text-[hsl(var(--text-muted))] mb-6">You don't have any {filter !== 'all' ? filter : ''} trips yet.</p>
            <button className="btn-primary">Plan a Trip</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrips.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-surface rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center card-hover">
                
                {/* Status & Dates */}
                <div className="w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-[hsl(var(--primary)/0.1)] pb-4 md:pb-0 md:pr-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${statusColors[trip.status]}`}>
                    {statusIcons[trip.status]} {trip.status}
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2"><Calendar size={14} className="text-[hsl(var(--primary))]" /> {new Date(trip.departure_date).toLocaleDateString()}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] pl-6">to {new Date(trip.return_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Main Details */}
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-black mb-1">{trip.from_location} <span className="text-[hsl(var(--text-muted))] text-sm mx-2">→</span> {trip.to_destination}</h3>
                  <p className="text-sm text-[hsl(var(--text-muted))] mb-4">{trip.travelers} Travelers</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {trip.hotel && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] text-xs font-semibold"><Hotel size={12} className="text-[hsl(var(--primary))]" /> {trip.hotel.name}</span>}
                    {trip.cabService && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] text-xs font-semibold"><Car size={12} className="text-[hsl(var(--primary))]" /> {trip.cabService.label}</span>}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="w-full md:w-auto md:text-right shrink-0 border-t md:border-t-0 border-[hsl(var(--primary)/0.1)] pt-4 md:pt-0 pl-0 md:pl-6">
                  <p className="text-xs text-[hsl(var(--text-muted))] mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-[hsl(var(--primary))] mb-4">₹{trip.total_price.toLocaleString()}</p>
                  <div className="flex gap-2 justify-start md:justify-end">
                    <button className="btn-secondary !py-2 !px-4 text-xs">View Itinerary</button>
                    {trip.status === 'pending' && <button className="btn-primary !py-2 !px-4 text-xs">Pay Now</button>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
