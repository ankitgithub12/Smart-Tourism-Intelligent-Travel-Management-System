import React, { useState } from 'react';
import { Search, Check, X, Filter } from 'lucide-react';
import { agencyAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export function BookingManager({ data, setData }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const updateBookingStatus = async (id, newStatus) => {
    const toastId = toast.loading('Updating booking status...');
    try {
      const res = await agencyAPI.updateBookingStatus(id, newStatus);
      setData(res.data.agency);
      toast.success('Booking status updated.', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update booking status.', { id: toastId });
    }
  };

  const filteredBookings = data.bookings.filter(b => {
    const matchesSearch = b.customer.toLowerCase().includes(search.toLowerCase()) || b.listing.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-black text-base">Booking & Reservation Control</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review status pipeline and confirm reservation requests</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-45" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or listing..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
          />
        </div>
      </div>

      {/* Booking Table */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Listing Description</th>
                <th>Dates Assigned</th>
                <th>Gross Total</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="font-bold text-xs text-slate-400">{booking.id}</td>
                  <td className="font-bold text-sm">{booking.customer}</td>
                  <td className="text-xs font-semibold">{booking.listing}</td>
                  <td className="text-xs text-slate-500 dark:text-slate-400">{booking.dates}</td>
                  <td className="text-sm font-black">₹{booking.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'Confirmed' ? 'badge-success' : 
                      booking.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {booking.status === 'Pending' && (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Confirm Request"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                          className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                          title="Decline Request"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-xs text-slate-400">
                    No bookings match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BookingManager;
