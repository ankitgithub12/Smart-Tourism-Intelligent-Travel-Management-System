import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, Star, Users, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialSaved = [
  { id: 1, name: 'City Palace', location: 'Jaipur, Rajasthan', rating: 4.8, crowdLevel: 'High', category: 'Heritage', image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?q=80&w=600&auto=format&fit=crop' },
  { id: 2, name: 'Amber Fort', location: 'Amer, Rajasthan', rating: 4.9, crowdLevel: 'Medium', category: 'Fort', image: 'https://images.unsplash.com/photo-1590050752117-23a97b62b423?q=80&w=600&auto=format&fit=crop' },
  { id: 3, name: 'Nahargarh Fort', location: 'Jaipur, Rajasthan', rating: 4.6, crowdLevel: 'Low', category: 'Fort', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop' },
];

const crowdColors = { Low: 'bg-green-500', Medium: 'bg-orange-500', High: 'bg-red-500' };

const SavedDestinations = () => {
  const [saved, setSaved] = useState(initialSaved);

  const removePlace = (id) => setSaved(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bookmark className="text-blue-600" size={28} /> Saved Destinations
            </h1>
            <p className="text-gray-500 mt-1">{saved.length} place{saved.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link to="/destinations"
            className="text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors">
            + Add More Places
          </Link>
        </div>

        {saved.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <Heart size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved places yet</h3>
            <p className="text-gray-400 mb-6">Browse destinations and save your favourites for quick access.</p>
            <Link to="/destinations" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
              Explore Destinations
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {saved.map((place, idx) => (
                <motion.div key={place.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.07 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group card-hover">
                  <div className="relative h-52 overflow-hidden">
                    <img src={place.image} alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <button onClick={() => removePlace(place.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm">
                      <X size={16} />
                    </button>
                    <div className={`absolute bottom-3 left-3 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${crowdColors[place.crowdLevel]}`}>
                      <Users size={11} /> {place.crowdLevel}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-blue-600 text-xs font-semibold flex items-center gap-1 mb-1">
                      <MapPin size={11} /> {place.location}
                    </p>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{place.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{place.category}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" /> {place.rating}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDestinations;
