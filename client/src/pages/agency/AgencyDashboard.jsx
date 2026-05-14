import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  Star, 
  Briefcase, 
  Plus,
  MessageSquare,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { bookingsAPI, placesAPI } from '../../services/api';

const AgencyDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch bookings specifically for this agency
        const bookingsRes = await bookingsAPI.getAll();
        setBookings(bookingsRes.data);
      } catch (error) {
        console.error('Error fetching agency data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, []);

  const stats = [
    { title: 'Total Packages', value: '12', change: '+2', icon: Package, color: 'bg-blue-600' },
    { title: 'Active Bookings', value: bookings.length, change: '+12%', icon: Users, color: 'bg-emerald-600' },
    { title: 'Total Revenue', value: `$${(bookings.length * 250).toLocaleString()}`, change: '+18%', icon: TrendingUp, color: 'bg-indigo-600' },
    { title: 'Avg. Rating', value: '4.8', change: 'Top 5%', icon: Star, color: 'bg-orange-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading agency dashboard...</p>
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
            <h1 className="text-3xl font-extrabold text-gray-900">Agency Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your travel packages and track your performance in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <MessageSquare size={18} /> Inquiries
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2">
              <Plus size={18} /> New Package
            </button>
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
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-blue-900/10`}>
                  <stat.icon size={22} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                  <ArrowUpRight size={14} />
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings Table */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={24} />
                  Recent Package Bookings
                </h2>
                <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                      <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Package</th>
                      <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.slice(0, 5).map((booking, i) => (
                      <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs uppercase tracking-tighter shadow-inner">
                              {booking.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{booking.user?.name || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600 font-medium">{booking.place?.name || 'Custom Package'}</td>
                        <td className="py-4 text-sm text-gray-500">{new Date(booking.booking_date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            'Confirmed' === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            Confirmed
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-gray-400 italic">No recent bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={24} />
                Revenue Performance
              </h2>
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                 <div className="text-center">
                    <p className="text-gray-400 text-sm font-medium italic">Real-time revenue stream visualization...</p>
                    <div className="flex gap-1 justify-center mt-3">
                       {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Side Panel: Insights & Top Packages */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <h2 className="text-xl font-bold mb-4">Market Insight</h2>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Demand for <strong>Cultural Walking Tours</strong> is up by 40% this week based on AI sentiment analysis.
              </p>
              <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                Analyze Market
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="text-orange-500" size={24} />
                Recent Reviews
              </h2>
              <div className="space-y-5">
                 {[
                   { user: 'Alex M.', rating: 5, text: 'Amazing experience! The guide was very knowledgeable.', time: '2h ago' },
                   { user: 'Julia S.', rating: 4, text: 'Great tour, but would appreciate more water breaks.', time: '1d ago' }
                 ].map((r, i) => (
                   <div key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm text-gray-900">{r.user}</span>
                        <div className="flex text-orange-400">
                           {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 italic">"{r.text}"</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{r.time}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
