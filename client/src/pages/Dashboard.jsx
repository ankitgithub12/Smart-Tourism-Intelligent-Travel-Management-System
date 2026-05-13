import React from 'react';
import { 
  BarChart3, 
  Users, 
  Map as MapIcon, 
  TrendingUp, 
  AlertTriangle, 
  Bus, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { title: 'Total Tourists', value: '12,482', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { title: 'Avg. Stay Time', value: '4.2 Days', change: '+5%', icon: Calendar, color: 'bg-green-500' },
    { title: 'Traffic Index', value: 'High', change: 'Alert', icon: TrendingUp, color: 'bg-orange-500' },
    { title: 'Active Transport', value: '84 Units', change: 'Normal', icon: Bus, color: 'bg-purple-500' },
  ];

  const hotspots = [
    { name: 'City Palace', crowd: '85%', status: 'Overcrowded', trend: 'up' },
    { name: 'Amber Fort', crowd: '40%', status: 'Normal', trend: 'down' },
    { name: 'Hawa Mahal', crowd: '65%', status: 'High', trend: 'stable' },
    { name: 'Jantar Mantar', crowd: '25%', status: 'Low', trend: 'down' },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring and AI-driven city insights</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md">
              Live View
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
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
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
          {/* Crowd Monitoring */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={24} />
                Crowd Density by Location
              </h2>
              <select className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="space-y-6">
              {hotspots.map((spot, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700">{spot.name}</span>
                    <span className={`text-sm font-bold ${
                      spot.crowd.replace('%', '') > 70 ? 'text-red-500' : 'text-green-500'
                    }`}>{spot.crowd} Full</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: spot.crowd }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${
                        spot.crowd.replace('%', '') > 70 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-blue-50 rounded-2xl flex items-start gap-4 border border-blue-100">
              <AlertTriangle className="text-blue-600 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-blue-900">AI Recommendation</h4>
                <p className="text-sm text-blue-700">
                  Detected unusual growth at <strong>City Palace</strong>. Suggest rerouting incoming tourist buses to <strong>Amber Fort</strong> for the next 2 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Side Panel: Recent Alerts & AI Insights */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapIcon className="text-green-600" size={24} />
                Live Map Status
              </h2>
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <p className="text-gray-400 font-medium">Interactive Map Loading...</p>
                {/* Simulated markers */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl text-white">
              <h2 className="text-xl font-bold mb-4">Resource Optimization</h2>
              <p className="text-blue-100 text-sm mb-6">
                Based on historical festival data, we predict a 40% increase in traffic tomorrow morning.
              </p>
              <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                Deploy Extra Transit
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
