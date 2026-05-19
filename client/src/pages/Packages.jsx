import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Users, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import { FaUmbrellaBeach, FaMountain, FaCity, FaTree } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const mockPackages = [
  { id: 1, name: 'Goa Beach Paradise', dest: 'Goa, India', days: 5, nights: 4, price: 15999, rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format', includes: ['Hotel', 'Meals', 'Transport', 'Guide'], category: 'beach' },
  { id: 2, name: 'Royal Rajasthan Tour', dest: 'Rajasthan, India', days: 7, nights: 6, price: 24999, rating: 4.9, reviews: 189, image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?w=600&auto=format', includes: ['Hotel', 'Meals', 'Transport', 'Guide'], category: 'heritage' },
  { id: 3, name: 'Kerala Backwater Escape', dest: 'Kerala, India', days: 4, nights: 3, price: 12999, rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format', includes: ['Houseboat', 'Meals', 'Ayurveda'], category: 'nature' },
  { id: 4, name: 'Himalayan Adventure', dest: 'Manali, India', days: 6, nights: 5, price: 18999, rating: 4.6, reviews: 120, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format', includes: ['Hotel', 'Meals', 'Trekking', 'Guide'], category: 'adventure' },
  { id: 5, name: 'Mumbai City Explorer', dest: 'Mumbai, India', days: 3, nights: 2, price: 8999, rating: 4.5, reviews: 98, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format', includes: ['Hotel', 'Transport', 'Food Tour'], category: 'city' },
  { id: 6, name: 'Andaman Island Bliss', dest: 'Andaman, India', days: 5, nights: 4, price: 29999, rating: 4.9, reviews: 210, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format', includes: ['Resort', 'Meals', 'Snorkeling', 'Ferry'], category: 'beach' },
];

const categories = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'beach', label: 'Beach', icon: FaUmbrellaBeach },
  { id: 'adventure', label: 'Adventure', icon: FaMountain },
  { id: 'heritage', label: 'Heritage', icon: FaCity },
  { id: 'nature', label: 'Nature', icon: FaTree },
];

const Packages = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockPackages.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.dest.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Travel Packages</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Curated Travel Experiences</h1>
          <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto">Handpicked packages with hotels, meals, transport, and guides — all at the best prices.</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 flex items-center glass-surface rounded-2xl px-4 py-3">
            <Search size={18} className="text-[hsl(var(--text-muted))] mr-3" />
            <input type="text" placeholder="Search packages..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                    : 'glass-surface hover:bg-[hsl(var(--primary)/0.1)]'
                }`}>
                <cat.icon size={14} /> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg, idx) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
              className="glass-surface rounded-3xl overflow-hidden card-hover group">
              <div className="relative h-48 overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {pkg.rating}
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-black text-lg">{pkg.name}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1"><MapPin size={11} /> {pkg.dest}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4 text-xs text-[hsl(var(--text-muted))] font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {pkg.days}D/{pkg.nights}N</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {pkg.reviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pkg.includes.map((item, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">{item}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[hsl(var(--primary))]">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))]">per person</p>
                  </div>
                  <Link to="/planner" className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2">
                    Book <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Packages;
