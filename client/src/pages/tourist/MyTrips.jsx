import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState({ isOpen: false, trip: null });

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.delete(id);
        setTrips(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await bookingsAPI.getAll();
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Briefcase className="text-blue-600" size={32} />
              My Trips & Bookings
            </h1>
            <p className="text-gray-500 font-medium">Manage your upcoming and past travel experiences in real-time.</p>
          </div>
          <Link 
            to="/destinations" 
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            Book New Experience
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="space-y-6">
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group"
              >
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                  {trip.place?.image ? (
                     <img src={trip.place.image} alt={trip.place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <MapPin size={40} className="text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        new Date(trip.booking_date) >= new Date() ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {new Date(trip.booking_date) >= new Date() ? 'Upcoming' : 'Completed'}
                      </span>
                      <span className="text-xs font-bold text-gray-400">ID: BK-{trip.id}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {trip.place?.name || 'Travel Experience'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-blue-500" />
                        {new Date(trip.booking_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-blue-500" />
                        {trip.time || '10:00 AM - 04:00 PM'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => setTicketModal({ isOpen: true, trip })}
                    className="w-full md:w-32 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-100 transition-colors"
                  >
                    View Ticket
                  </button>
                  <button 
                    onClick={() => handleCancelBooking(trip.id)}
                    className="w-full md:w-32 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    Cancel Trip
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500 mb-8">You haven't booked any experiences yet. Start exploring now!</p>
            <Link to="/destinations" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-200">
              Explore Destinations
            </Link>
          </div>
        )}

        {/* Helpful Tips Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-slate-800 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6">Smart Travel Tips</h2>
              <div className="space-y-4">
                {[
                  'Check crowd density 1 hour before visiting popular spots.',
                  'Use our AI route optimizer to save time in traffic.',
                  'Book during weekdays for lower crowd indices.'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-400 shrink-0 mt-1" />
                    <p className="text-gray-300 font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
               <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <MapPin size={24} />
                     </div>
                     <div>
                        <h4 className="font-black">Smart Itinerary</h4>
                        <p className="text-xs text-blue-200">Dynamic AI Route Active</p>
                     </div>
                  </div>
                  <div className="space-y-3">
                     {[0, 1].map(i => (
                       <div key={i} className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-2/3 shadow-lg shadow-blue-500/50"></div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {ticketModal.isOpen && ticketModal.trip && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white text-center relative">
                <h3 className="text-xl font-black mb-1">{ticketModal.trip.place?.name}</h3>
                <p className="text-blue-200 text-xs tracking-widest uppercase">E-Ticket</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-4">
                  <div className="text-gray-500 text-sm">Booking ID</div>
                  <div className="font-bold">BK-{ticketModal.trip.id}</div>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-4">
                  <div className="text-gray-500 text-sm">Date</div>
                  <div className="font-bold">{new Date(ticketModal.trip.booking_date).toLocaleDateString()}</div>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-4">
                  <div className="text-gray-500 text-sm">Visitors</div>
                  <div className="font-bold">{ticketModal.trip.number_of_people}</div>
                </div>
                <div className="flex justify-between pb-2">
                  <div className="text-gray-500 text-sm">Total Paid</div>
                  <div className="font-bold text-green-600">₹{ticketModal.trip.total_price}</div>
                </div>
                
                <button 
                  onClick={() => setTicketModal({ isOpen: false, trip: null })}
                  className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTrips;
