import React from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="relative min-height-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-50 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Explore the World <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Smarter & Better
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience intelligent travel management with AI-powered recommendations, 
            real-time crowd insights, and seamless route optimization.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-gray-100">
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-gray-100 py-3">
              <MapPin className="text-blue-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Where to go?" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-gray-100 py-3">
              <Calendar className="text-blue-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="When?" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 flex items-center px-4 w-full py-3">
              <Users className="text-blue-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="How many?" 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
              />
            </div>
            <button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </motion.div>

        {/* Stats / Features Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Live Crowd Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">AI Recommendations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Smart Routing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
