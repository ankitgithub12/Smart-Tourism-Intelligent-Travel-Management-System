import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Search, Filter, Waves, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockHotels = [
  { id: 1, name: 'Ocean Pearl Resort', location: 'Goa, India', stars: 5, price: 8500, rating: 4.9, reviews: 342, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format', amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym'] },
  { id: 2, name: 'Heritage Palace Hotel', location: 'Jaipur, India', stars: 5, price: 12000, rating: 4.8, reviews: 256, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format', amenities: ['wifi', 'pool', 'restaurant', 'parking'] },
  { id: 3, name: 'Mountain View Lodge', location: 'Manali, India', stars: 4, price: 4500, rating: 4.7, reviews: 189, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format', amenities: ['wifi', 'restaurant', 'parking'] },
  { id: 4, name: 'Backwater Houseboat', location: 'Kerala, India', stars: 4, price: 6000, rating: 4.9, reviews: 198, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format', amenities: ['restaurant', 'pool'] },
  { id: 5, name: 'City Business Suites', location: 'Mumbai, India', stars: 4, price: 5500, rating: 4.5, reviews: 145, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format', amenities: ['wifi', 'gym', 'restaurant', 'parking'] },
  { id: 6, name: 'Beachside Villa', location: 'Andaman, India', stars: 5, price: 15000, rating: 4.9, reviews: 89, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format', amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym'] },
];

const amenityIcons = { wifi: Wifi, pool: Waves, restaurant: UtensilsCrossed, parking: Car, gym: Dumbbell };
const amenityLabels = { wifi: 'WiFi', pool: 'Pool', restaurant: 'Dining', parking: 'Parking', gym: 'Gym' };

const Hotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filtered = mockHotels
    .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.location.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : b.rating - a.rating);

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Hotels & Stays</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Find Your Perfect Stay</h1>
          <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto">Luxury resorts, cozy lodges, and unique stays — handpicked for every budget.</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 flex items-center glass-surface rounded-2xl px-4 py-3">
            <Search size={18} className="text-[hsl(var(--text-muted))] mr-3" />
            <input type="text" placeholder="Search hotels..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            {[{ key: 'rating', label: 'Top Rated' }, { key: 'price', label: 'Lowest Price' }].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${sortBy === s.key ? 'bg-[hsl(var(--primary))] text-white shadow-lg' : 'glass-surface'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel, idx) => (
            <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
              className="glass-surface rounded-3xl overflow-hidden card-hover group">
              <div className="relative h-52 overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {hotel.rating}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">{hotel.name}</h3>
                <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1 mb-4"><MapPin size={11} /> {hotel.location} · {hotel.reviews} reviews</p>
                <div className="flex gap-2 mb-4">
                  {hotel.amenities.map(a => {
                    const Icon = amenityIcons[a];
                    return Icon ? (
                      <div key={a} className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center" title={amenityLabels[a]}>
                        <Icon size={14} className="text-[hsl(var(--primary))]" />
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[hsl(var(--primary))]">₹{hotel.price.toLocaleString()}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))]">per night</p>
                  </div>
                  <Link to="/planner" className="btn-primary !py-2.5 !px-5 text-sm">Book Now</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
