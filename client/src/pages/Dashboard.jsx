import React from 'react';
import { 
  BarChart3, 
  Users, 
  Map as MapIcon, 
  TrendingUp, 
  AlertTriangle, 
  Bus, 
  Calendar,
  ChevronRight,
  Bell,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { crowdBarColor } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    { title: 'Total Tourists', value: '12,482', change: '+12%', icon: Users, color: 'bg-blue-600', trend: 'up' },
    { title: 'Avg. Stay Time', value: '4.2 Days', change: '+5%', icon: Calendar, color: 'bg-emerald-600', trend: 'up' },
    { title: 'Traffic Index', value: 'High', change: 'Alert', icon: TrendingUp, color: 'bg-orange-600', trend: 'alert' },
    { title: 'Active Transport', value: '84 Units', change: 'Stable', icon: Bus, color: 'bg-indigo-600', trend: 'stable' },
  ];

  const hotspots = [
    { name: 'City Palace', crowd: 85, status: 'Overcrowded', trend: 'up' },
    { name: 'Amber Fort', crowd: 40, status: 'Normal', trend: 'down' },
    { name: 'Hawa Mahal', crowd: 68, status: 'High', trend: 'up' },
    { name: 'Jantar Mantar', crowd: 25, status: 'Low', trend: 'down' },
  ];

  const notifications = [
    { id: 1, type: 'alert', text: 'Crowd surge detected at City Palace.', time: '2 mins ago' },
    { id: 2, type: 'info', text: 'Route optimization suggested for Bus-402.', time: '15 mins ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}!</h1>
            <p className="text-gray-500 font-medium">Here's your smart tourism overview for today.</p>
          </div>
          <div className="flex gap-3">
            <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2">
              <MapIcon size={18} /> Live Monitor
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
                <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                  <stat.icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-600' : 
                  stat.trend === 'alert' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : stat.trend === 'down' ? <ArrowDownRight size={14} /> : null}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crowd Monitoring */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={24} />
                  Live Crowd Density
                </h2>
                <select className="text-sm font-bold border-none bg-gray-50 rounded-xl px-4 py-2 focus:ring-0">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              
              <div className="space-y-7">
                {hotspots.map((spot, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">{spot.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                          spot.crowd > 70 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {spot.status}
                        </span>
                      </div>
                      <span className="text-sm font-black text-gray-900">{spot.crowd}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${spot.crowd}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${crowdBarColor(spot.crowd)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 bg-blue-50 rounded-2xl flex items-start gap-4 border border-blue-100">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                   <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">AI Intelligent Insight</h4>
                  <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    Unusual growth detected at <strong>City Palace</strong>. We recommend checking <strong>Nahargarh Fort</strong> which is currently 80% less crowded.
                  </p>
                </div>
              </div>
            </div>

            {/* Transport Monitoring Placeholder */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bus className="text-indigo-600" size={24} />
                Smart Transport Efficiency
              </h2>
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
                 <div className="text-center">
                    <p className="text-gray-400 text-sm font-medium">Real-time transport mesh loading...</p>
                    <div className="flex gap-1 justify-center mt-3">
                       {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Side Panel: Recent Alerts & AI Insights */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="text-orange-600" size={24} />
                Live Alerts
              </h2>
              <div className="space-y-4">
                 {notifications.map(n => (
                   <div key={n.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{n.text}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{n.time}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <h2 className="text-xl font-bold mb-4">Optimise Your Trip</h2>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Based on your saved destinations and today's traffic, we've generated a <strong>Smart Itinerary</strong>.
              </p>
              <button className="w-full bg-white text-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                View Smart Route
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapIcon className="text-emerald-600" size={24} />
                Destination Pulse
              </h2>
              <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:15px_15px]"></div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Live Feed Active</p>
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
