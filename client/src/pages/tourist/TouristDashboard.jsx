import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  Calendar,
  Compass,
  Heart,
  Navigation,
  Clock,
  ChevronRight,
  TrendingUp,
  Map,
  Star as StarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { bookingsAPI, placesAPI } from '../../services/api';

const TouristDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedPlacesCount, setSavedPlacesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, placesRes] = await Promise.all([
          bookingsAPI.getAll(),
          placesAPI.getAll()
        ]);
        
        setBookings(bookingsRes.data);
        // Simulate saved places for now if no specific API exists
        setSavedPlacesCount(Math.floor(Math.random() * 10) + 5);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const upcomingTrips = bookings
    .filter(b => new Date(b.booking_date) >= new Date())
    .slice(0, 3);

  const completedTrips = bookings
    .filter(b => new Date(b.booking_date) < new Date())
    .length;

  const stats = [
    { title: 'Trips Taken', value: completedTrips, change: '+1 this month', icon: Compass, color: 'bg-blue-600' },
    { title: 'Saved Places', value: savedPlacesCount, change: 'Explore more', icon: Heart, color: 'bg-pink-600' },
    { title: 'Points Earned', value: completedTrips * 150, change: 'Silver Rank', icon: StarIcon, color: 'bg-orange-600' },
    { title: 'Upcoming', value: upcomingTrips.length, change: upcomingTrips.length > 0 ? 'Ready to go?' : 'Plan a trip', icon: Calendar, color: 'bg-emerald-600' },
  ];

  const aiSuggestions = [
    { name: 'Nahargarh Fort', reason: '80% less crowded now', icon: MapPin },
    { name: 'Jal Mahal', reason: 'Best sunset view today', icon: Navigation },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading your smart dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
              Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}!
            </h1>
            <p className="text-gray-500 font-medium">Ready for your next adventure? Here's your real-time travel overview.</p>
          </div>
          <div className="flex gap-3">
             <Link to="/destinations" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2">
              <Compass size={18} /> Explore More
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                <stat.icon size={80} />
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-900/10`}>
                <stat.icon size={22} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-gray-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Trips */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  Your Upcoming Schedule
                </h2>
                <Link to="/my-trips" className="text-sm font-bold text-blue-600 hover:underline">View All Trips</Link>
              </div>
              
              <div className="space-y-4">
                {upcomingTrips.length > 0 ? upcomingTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{trip.place?.name || 'Dream Destination'}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                            <Calendar size={12} /> {new Date(trip.booking_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                            <Clock size={12} /> {trip.time || 'All Day'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No upcoming trips. Time to explore!</p>
                    <Link to="/destinations" className="inline-block mt-4 text-blue-600 font-bold text-sm hover:underline">Browse Destinations →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Itinerary Feature */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <TrendingUp size={24} /> AI Smart Itinerary
                 </h2>
                 <p className="text-blue-100 mb-6 max-w-lg">
                    Based on your preferences and real-time crowd data, we've optimized your next trip to save you 2 hours of waiting time.
                 </p>
                 <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                       View Optimal Route <Navigation size={18} />
                    </button>
                    <button className="px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all">
                       Customize
                    </button>
                 </div>
               </div>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Compass className="text-orange-500" size={24} />
                Smart Recommendations
              </h2>
              <div className="space-y-4">
                 {aiSuggestions.map((suggestion, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          <suggestion.icon size={16} />
                        </div>
                        <span className="font-bold text-gray-900">{suggestion.name}</span>
                      </div>
                      <p className="text-xs text-orange-700 font-medium">{suggestion.reason}</p>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-sm hover:border-blue-300 hover:text-blue-600 transition-all">
                 + Add Preference
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Map className="text-emerald-600" size={24} />
                Destination Pulse
              </h2>
              <div className="aspect-square bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:15px_15px]"></div>
                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Live Feed Active</p>
                  <p className="text-white/40 text-[8px] mt-2 uppercase">Jaipur Sector 4</p>
                </div>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;
