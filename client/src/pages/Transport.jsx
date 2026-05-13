import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Users, Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Transport = () => {
  const [transports, setTransports] = useState([
    { id: 1, type: 'Electric Bus', plate: 'RJ-14-EB-0021', route: 'Pink City Circuit', location: 'Johari Bazar', load: 85, status: 'Active', capacity: 40 },
    { id: 2, type: 'Smart Van', plate: 'RJ-14-SV-8842', route: 'Amber Fort Shuttle', location: 'Amer Road', load: 30, status: 'Active', capacity: 12 },
    { id: 3, type: 'Metro Link', plate: 'ML-04', route: 'Mansarovar - Badi Chaupar', location: 'Sindhi Camp', load: 95, status: 'Crowded', capacity: 200 },
    { id: 4, type: 'Electric Rickshaw', plate: 'RJ-14-ER-1102', route: 'Hawa Mahal Loop', location: 'Badi Chaupar', load: 10, status: 'Delayed', capacity: 4 },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Crowded': return 'text-orange-600 bg-orange-50';
      case 'Delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Smart Transit Monitor</h1>
            <p className="text-gray-500 font-medium text-lg">Real-time tracking of Jaipur's eco-friendly transport network.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Activity size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">System Status</p>
                  <p className="text-lg font-black text-green-600">Optimal</p>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {transports.map((unit, idx) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Bus size={32} />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-xl font-black text-gray-900">{unit.type}</h3>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase">{unit.plate}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      {unit.route}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      Next Stop: {unit.location}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48 pt-4 md:pt-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black text-gray-400 uppercase">Live Load</span>
                    <span className={`text-sm font-black ${unit.load > 80 ? 'text-orange-500' : 'text-blue-600'}`}>
                      {unit.load}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${unit.load}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${unit.load > 80 ? 'bg-orange-500' : 'bg-blue-600'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
              <h3 className="text-2xl font-black mb-6">AI Optimization</h3>
              <p className="text-blue-100 font-medium mb-8">System suggests rerouting 4 units to Amber Fort to handle peak afternoon crowd.</p>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition-colors shadow-lg">
                Apply Suggestions
              </button>
            </div>

            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-black text-gray-900 mb-6">Transit Alerts</h4>
              <div className="space-y-6">
                {[
                  { icon: <AlertTriangle className="text-orange-500" />, title: 'Congestion: Johari Bazar', time: '10 mins ago' },
                  { icon: <CheckCircle2 className="text-green-500" />, title: 'New Unit RJ-14-EB-0045 Online', time: '1 hour ago' },
                  { icon: <Users className="text-blue-500" />, title: 'Peak Demand Predicted (3 PM)', time: 'Forecast' }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 mt-1">{alert.icon}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{alert.title}</p>
                      <p className="text-xs font-medium text-gray-400">{alert.time}</p>
                    </div>
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

export default Transport;
