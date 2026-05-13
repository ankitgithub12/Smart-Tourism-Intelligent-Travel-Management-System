import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const places = [
    {
      id: 1,
      name: 'City Palace, Jaipur',
      description: 'A complex of courtyards, gardens and buildings, the impressive City Palace is right in the centre of the Old City.',
      location: 'Jaipur, Rajasthan',
      category: 'Heritage',
      crowdLevel: 'High',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Amber Fort',
      description: 'Amer Fort is a fort located in Amer, Rajasthan, India. Amer is a town with an area of 4 square kilometres.',
      location: 'Amer, Rajasthan',
      category: 'Fort',
      crowdLevel: 'Medium',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1590050752117-23a97b62b423?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Hawa Mahal',
      description: 'The Hawa Mahal is a palace in the city of Jaipur, India. Built from red and pink sandstone.',
      location: 'Jaipur, Rajasthan',
      category: 'Landmark',
      crowdLevel: 'Low',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1603262110263-fb0110e71329?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Destinations</h1>
            <p className="text-gray-600">Find the best places to visit with real-time crowd insights and AI-powered tips.</p>
          </div>
          <div className="w-full md:w-auto flex gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search places..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {places.map((place, idx) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  {place.rating}
                </div>
                <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 ${
                  place.crowdLevel === 'High' ? 'bg-red-500/80' : 
                  place.crowdLevel === 'Medium' ? 'bg-orange-500/80' : 'bg-green-500/80'
                } backdrop-blur-md`}>
                  <Users size={14} />
                  {place.crowdLevel} Crowd
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-1 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <MapPin size={12} />
                  {place.location}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {place.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6">
                  {place.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
                    {place.category}
                  </span>
                  <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View Details
                    <Info size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;
