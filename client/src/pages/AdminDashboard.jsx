import React from 'react';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Bus, 
  Shield,
  Search,
  Filter,
  Download,
  Settings,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { crowdBarColor } from '../utils/helpers';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Users', value: '2,842', change: '+5.4%', icon: Users, color: 'bg-blue-600' },
    { title: 'Active Bookings', value: '456', change: '+12.1%', icon: TrendingUp, color: 'bg-green-600' },
    { title: 'Crowd Alerts', value: '3', change: 'Priority', icon: AlertTriangle, color: 'bg-orange-600' },
    { title: 'Security Score', value: '98%', change: 'Stable', icon: Shield, color: 'bg-purple-600' },
  ];

  const hotspots = [
    { name: 'City Palace', crowd: 85, status: 'Critical', trend: 'up' },
    { name: 'Amber Fort', crowd: 45, status: 'Normal', trend: 'stable' },
    { name: 'Hawa Mahal', crowd: 68, status: 'Warning', trend: 'up' },
    { name: 'Jantar Mantar', crowd: 22, status: 'Optimal', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Authority Dashboard</h1>
            <p className="text-gray-500">Global monitoring and infrastructure management</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={16} /> Export Reports
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
              <Settings size={16} /> Settings
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
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                  <stat.icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.change.includes('+') ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={24} />
                  Crowd Density Index
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Filter size={16} className="text-gray-500" />
                  </button>
                  <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {hotspots.map((spot, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{spot.name}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                          spot.status === 'Critical' ? 'bg-red-100 text-red-600' : 
                          spot.status === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {spot.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{spot.crowd}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
                  <h4 className="font-bold text-blue-900">Infrastructure Recommendation</h4>
                  <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    Unusual crowd growth detected at <strong>City Palace</strong>. Suggest activating <strong>Route B bypass</strong> for transport buses and increasing shuttle frequency by 20%.
                  </p>
                </div>
              </div>
            </div>

            {/* Transport Table */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bus className="text-green-600" size={24} />
                Active Transport Units
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Unit ID</th>
                      <th className="pb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Route</th>
                      <th className="pb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="pb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { id: 'BUS-102', route: 'Airport -> City Palace', status: 'In Transit', load: '85%' },
                      { id: 'VAN-405', route: 'Railway -> Amber Fort', status: 'Delayed', load: '40%' },
                      { id: 'BUS-098', route: 'Hawa Mahal -> Jal Mahal', status: 'In Transit', load: '95%' },
                    ].map((unit, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-medium text-gray-900">{unit.id}</td>
                        <td className="py-4 text-sm text-gray-600">{unit.route}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            unit.status === 'Delayed' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm font-bold text-gray-900">{unit.load}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="text-blue-600" size={24} />
                Live Network Status
              </h2>
              <div className="aspect-square bg-slate-900 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Initialising Live Feed...</p>
                </div>
                {/* Simulated markers */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h2 className="text-xl font-bold mb-4">Resource Planner</h2>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Festival season starts in 3 days. AI predicts 400% traffic increase. Would you like to auto-schedule extra transit units?
              </p>
              <button className="w-full bg-white text-indigo-600 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
                Deploy Extra Units
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex flex-col items-center gap-2 border border-transparent hover:border-blue-100">
                   <Users size={20} /> User Log
                </button>
                <button className="p-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex flex-col items-center gap-2 border border-transparent hover:border-blue-100">
                   <MapPin size={20} /> New Place
                </button>
                <button className="p-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex flex-col items-center gap-2 border border-transparent hover:border-blue-100">
                   <Bus size={20} /> Fleet
                </button>
                <button className="p-3 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex flex-col items-center gap-2 border border-transparent hover:border-blue-100">
                   <Shield size={20} /> Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
