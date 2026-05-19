import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Trash2 } from 'lucide-react';

const SavedDestinations = () => {
  const savedPlaces = [
    { id: 1, name: 'Goa', type: 'Beach Destination', rating: 4.8, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format', match: '98%' },
    { id: 2, name: 'Manali', type: 'Hill Station', rating: 4.7, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format', match: '85%' },
    { id: 3, name: 'Kerala', type: 'Nature Retreat', rating: 4.9, img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format', match: '92%' },
  ];

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2">Saved Destinations</h1>
          <p className="text-[hsl(var(--text-muted))]">Places you've liked and saved for later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlaces.map((place, i) => (
            <motion.div key={place.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-3xl p-4 flex flex-col relative group">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4">
                <img src={place.img} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {place.rating}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-emerald-400">
                  {place.match} AI Match
                </div>
              </div>
              <div className="flex justify-between items-start px-2 mb-4">
                <div>
                  <h3 className="text-xl font-bold">{place.name}</h3>
                  <p className="text-sm text-[hsl(var(--text-muted))] flex items-center gap-1"><MapPin size={12} /> {place.type}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <button className="btn-primary w-full !py-3">Plan Trip Here</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedDestinations;
