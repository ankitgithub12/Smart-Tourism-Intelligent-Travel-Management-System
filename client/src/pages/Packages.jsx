import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Calendar, ArrowRight, Search } from 'lucide-react';
import { FaUmbrellaBeach, FaMountain, FaCity, FaTree } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { listingAPI } from '../services/api';

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
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const loadPackages = () => {
      listingAPI.getPackages()
        .then((res) => setPackages(res.data || []))
        .catch((err) => console.error('Failed to load packages', err));
    };

    loadPackages();
    const interval = setInterval(loadPackages, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = packages.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.destination.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <Star size={12} fill="currentColor" /> {Number(pkg.rating || 0).toFixed(1)}
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-black text-lg">{pkg.name}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1"><MapPin size={11} /> {pkg.destination}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4 text-xs text-[hsl(var(--text-muted))] font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {pkg.duration}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {pkg.reviews} reviews</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(pkg.includes || []).map((item, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">{item}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[hsl(var(--primary))]">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))]">per person</p>
                  </div>
                  <Link to={`/planner?package_id=${pkg.id}&to=${encodeURIComponent(pkg.destination)}`} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2">
                    Book <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {!filtered.length && (
          <div className="glass-surface rounded-2xl p-10 text-center text-sm text-[hsl(var(--text-muted))]">
            No travel packages are available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
