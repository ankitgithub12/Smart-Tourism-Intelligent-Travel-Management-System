import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Users, Info, Heart, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { crowdColor, truncateText } from '../utils/helpers';
import { placesAPI } from '../services/api';

const categories = ['All', 'Heritage', 'Fort', 'Landmark', 'Observatory', 'Nature'];

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await placesAPI.getAll();
        setPlaces(response.data.data || response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load destinations. Using fallback data.");
        // Fallback data
        setPlaces([
          { id: 1, name: 'City Palace, Jaipur', description: 'A complex of courtyards, gardens and buildings.', location: 'Jaipur, Rajasthan', category: 'Heritage', crowdLevel: 'High', rating: 4.8, image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?q=80&w=1000&auto=format&fit=crop' },
          { id: 2, name: 'Amber Fort', description: 'Amer Fort is a fort located in Amer, Rajasthan.', location: 'Amer, Rajasthan', category: 'Fort', crowdLevel: 'Medium', rating: 4.9, image: 'https://images.unsplash.com/photo-1590050752117-23a97b62b423?q=80&w=1000&auto=format&fit=crop' },
          { id: 3, name: 'Hawa Mahal', description: 'The Hawa Mahal is a palace in the city of Jaipur.', location: 'Jaipur, Rajasthan', category: 'Landmark', crowdLevel: 'Low', rating: 4.7, image: 'https://images.unsplash.com/photo-1603262110263-fb0110e71329?q=80&w=1000&auto=format&fit=crop' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="max-w-xl">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Discover Jaipur</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Discover Destinations</h1>
            <p className="text-gray-500 font-medium leading-relaxed">Find the best places to visit with real-time AI crowd insights and smart city tips.</p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search places or locations..." 
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Fetching amazing places for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex items-center gap-3">
            <Info size={18} /> {error}
          </div>
        )}

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {!loading && filteredPlaces.map((place, idx) => (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={place.image} 
                    alt={place.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-xs font-black text-blue-600 flex items-center gap-1.5 shadow-sm">
                      <Star size={14} fill="currentColor" />
                      {place.rating}
                    </div>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                      <Heart size={18} />
                    </button>
                  </div>
                  <div className={`absolute bottom-4 left-4 px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md ${crowdColor(place.crowdLevel)}`}>
                    <Users size={14} />
                    {place.crowdLevel} Crowd
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                    <MapPin size={12} />
                    {place.location}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {place.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 flex-1">
                    {truncateText(place.description, 100)}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Calendar size={14} /> Available
                    </div>
                    <button className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                      Book Now
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlaces.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
