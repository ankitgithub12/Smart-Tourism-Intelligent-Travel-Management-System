import React from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MyTrips = () => {
  const trips = [
    {
      id: 'TRP-9021',
      destination: 'Amber Fort & City Palace',
      date: 'Oct 24, 2024',
      status: 'Upcoming',
      type: 'Guided Tour',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'TRP-8842',
      destination: 'Nahargarh Sunset Point',
      date: 'Sept 12, 2024',
      status: 'Completed',
      type: 'Solo Trip',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400&auto=format&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Briefcase className="text-blue-600" size={32} />
              My Trips & Bookings
            </h1>
            <p className="text-gray-500 font-medium">Manage your upcoming and past travel experiences.</p>
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
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                  <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        trip.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {trip.status}
                      </span>
                      <span className="text-xs font-bold text-gray-400">ID: {trip.id}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{trip.destination}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-blue-500" />
                        {trip.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-blue-500" />
                        10:00 AM - 04:00 PM
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button className="w-full md:w-32 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-100 transition-colors">
                    View Ticket
                  </button>
                  <button className="w-full md:w-32 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                    Details <ChevronRight size={14} />
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
            <p className="text-gray-500 mb-8">You haven't booked any experiences yet. Start exploring Jaipur now!</p>
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
                  'Check crowd density 1 hour before visiting City Palace.',
                  'Use our AI route optimizer to save up to 45 mins in traffic.',
                  'Nahargarh Fort has the lowest crowd index on Tuesdays.'
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
                          <div className="h-full bg-blue-500 w-2/3"></div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
