import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Trash2, Heart, Compass, Loader2 } from 'lucide-react';
import { favoritesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const SavedDestinations = () => {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const res = await favoritesAPI.getAll();
      setSavedPlaces(res.data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      toast.error('Could not load your wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (placeId) => {
    const toastId = toast.loading('Removing from wishlist...');
    try {
      await favoritesAPI.remove(placeId);
      // Real-time local state filtering
      setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
      toast.success('Removed from wishlist!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item', { id: toastId });
    }
  };

  const getDestinationImage = (place) => {
    if (place.image) {
      // If it has a fully qualified url or absolute path
      if (place.image.startsWith('http') || place.image.startsWith('/')) {
        return place.image;
      }
    }
    const query = place.name?.toLowerCase() || '';
    if (query.includes('goa')) return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600';
    if (query.includes('manali')) return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600';
    if (query.includes('kerala')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600';
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600';
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-[hsl(var(--bg-start))] to-[hsl(var(--bg-end))]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-2.5">
              <Heart size={28} className="text-rose-500 fill-rose-500" /> Saved Wishlist
            </h1>
            <p className="text-[hsl(var(--text-muted))] text-sm">
              Your curated destinations saved for upcoming travel plans.
            </p>
          </div>
          <Link to="/destinations" className="btn-secondary !py-2.5 text-xs font-bold">
            Explore Destinations
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="animate-spin text-[hsl(var(--primary))]" />
              <p className="text-xs text-[hsl(var(--text-muted))] font-bold">Loading wishlist...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {savedPlaces.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {savedPlaces.map((place, i) => (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="glass-surface rounded-3xl p-4 flex flex-col justify-between border border-[hsl(var(--glass-border))] relative group card-hover shadow-xl"
                  >
                    <div>
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 border border-[hsl(var(--glass-border))] shadow-md">
                        <img 
                          src={getDestinationImage(place)} 
                          alt={place.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute top-3 right-3 bg-[hsl(var(--surface)/0.9)] backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-500 flex items-center gap-1 border border-[hsl(var(--glass-border))]">
                          <Star size={11} fill="currentColor" /> {Number(place.rating || 4.5).toFixed(1)}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-emerald-500/95 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-wider">
                          {place.category || 'Spot'}
                        </div>
                      </div>

                      <div className="flex justify-between items-start px-1 mb-4">
                        <div>
                          <h3 className="text-lg font-black text-[hsl(var(--text))] group-hover:text-[hsl(var(--primary))] transition-colors">
                            {place.name}
                          </h3>
                          <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1 mt-1 font-semibold">
                            <MapPin size={11} className="text-[hsl(var(--primary))]" /> {place.location}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(place.id)}
                          className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-500/10 active:scale-95"
                          title="Remove from favorites"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/planner?to=${place.name}`)}
                      className="btn-primary w-full !py-3 font-extrabold text-xs tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                    >
                      <Compass size={14} /> Plan Trip Here
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-[hsl(var(--primary)/0.03)] border border-[hsl(var(--glass-border))] rounded-3xl max-w-lg mx-auto px-6 shadow-xl"
              >
                <Compass size={48} className="mx-auto text-neutral-600 mb-4 animate-spin-slow" />
                <h3 className="text-lg font-black text-[hsl(var(--text))] mb-2">Your wishlist is empty</h3>
                <p className="text-xs text-[hsl(var(--text-muted))] leading-relaxed max-w-sm mx-auto mb-6">
                  Explore gorgeous locations, beaches, hill stations, and heritage sights to start curating your dream journeys.
                </p>
                <Link to="/destinations" className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold">
                  Browse Destinations
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SavedDestinations;
