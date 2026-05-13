import React from 'react';
import { ShoppingBag, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MyTrips = () => {
  const bookings = [
    {
      id: 'BK-9283',
      place: 'City Palace, Jaipur',
      date: 'May 20, 2026',
      status: 'Confirmed',
      price: '$45.00',
    },
    {
      id: 'BK-1029',
      place: 'Amber Fort',
      date: 'May 22, 2026',
      status: 'Pending',
      price: '$30.00',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-gray-600 mb-10">Manage your bookings and upcoming adventures.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.place}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> Jaipur</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-400">Order ID</p>
                    <p className="font-bold text-gray-900">{booking.id}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {booking.status === 'Confirmed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {booking.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-4">Travel Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Total Bookings</span>
                <span className="font-bold text-white">02</span>
              </div>
              <div className="flex justify-between text-blue-100 text-sm">
                <span>Loyalty Points</span>
                <span className="font-bold text-white">1,250</span>
              </div>
            </div>
            <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-3 rounded-xl font-bold hover:bg-white/30 transition-all">
              Download All Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
