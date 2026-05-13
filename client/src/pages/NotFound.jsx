import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, Search, MapPin } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-50 rounded-full blur-3xl opacity-40" />

      <div className="max-w-lg w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-200"
        >
          <Compass size={64} className="text-white animate-float" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-9xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Destination Not Found</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            It seems like you've wandered into uncharted territory. Even our AI couldn't find this specific route.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Home size={18} /> Back to Home
            </Link>
            <Link
              to="/destinations"
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <Search size={18} /> Explore Places
            </Link>
          </div>
        </motion.div>

        {/* Floating map markers for fun */}
        <div className="absolute -top-12 -left-12 w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 animate-float" style={{ animationDelay: '1s' }}>
          <MapPin size={24} />
        </div>
        <div className="absolute -bottom-12 -right-12 w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-500 animate-float" style={{ animationDelay: '2.5s' }}>
          <MapPin size={24} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
