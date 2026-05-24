import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Calendar, Users, Star, ArrowRight, Brain, 
  TrendingUp, Shield, ChevronRight, Quote, Zap, Globe, Hotel, 
  UtensilsCrossed, Car, Leaf, DollarSign, Activity, Compass, 
  Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { FaUmbrellaBeach, FaRoute, FaMountain, FaWater } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const destinations = [
  { id: 1, name: 'Goa Golden Beaches', location: 'Goa, India', rating: 4.9, crowdLevel: 'Medium', type: 'Coastal', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop', tags: ['Sunsets', 'Water Sports'] },
  { id: 2, name: 'Jaipur Heritage Palace', location: 'Rajasthan, India', rating: 4.8, crowdLevel: 'High', type: 'Heritage', image: 'https://images.unsplash.com/photo-1600100397608-f010f418c5e4?w=800&auto=format&fit=crop', tags: ['Culture', 'Bazaars'] },
  { id: 3, name: 'Kerala Backwaters', location: 'Kerala, India', rating: 4.9, crowdLevel: 'Low', type: 'Nature', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop', tags: ['Houseboats', 'Ayurveda'] },
  { id: 4, name: 'Manali Snowy Valley', location: 'Himachal Pradesh', rating: 4.7, crowdLevel: 'Low', type: 'Adventure', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop', tags: ['Trekking', 'Skiing'] },
];

const features = [
  { icon: Brain, title: 'AI Smart Planner', desc: 'Instant multi-modal itineraries tailored to your unique style, timeline, and optimized budget limits.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(59, 130, 246, 0.3)' },
  { icon: Hotel, title: 'Hotel Ecosystem', desc: 'Secure the most beautiful stays with transparent real-time availability, ratings, and eco-friendly choices.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(6, 182, 212, 0.3)' },
  { icon: UtensilsCrossed, title: 'Intelligent Dining', desc: 'Dietary-customized meal packages curated for your entire journey — Veg, Vegan, or local culinary adventures.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(245, 158, 11, 0.3)' },
  { icon: Car, title: 'Autonomous Fleet & Transit', desc: 'Seamlessly schedule smart cab transfers or self-driven electric vehicles at the tap of a button.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(99, 102, 241, 0.3)' },
  { icon: Leaf, title: 'Eco Carbon Tracking', desc: 'Earn points and reward offsets as you monitor your trip footprint with live, actionable sustainability stats.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(16, 185, 129, 0.3)' },
  { icon: Shield, title: 'Integrated Command SOS', desc: 'Explore with absolute peace of mind supported by instant security, nearby emergency nodes, and live support.', color: 'from-blue-500 to-blue-700', shadow: 'rgba(244, 63, 94, 0.3)' },
];

const mockTelemetry = {
  activeTourists: 14205,
  ecoScore: 88,
  carbonSaved: '124.5 tons',
  transitStatus: 'Optimal Flow',
  smartAlert: 'Green Zone compliance active across coastal regions.'
};

const crowdColors = { Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30', High: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };

const Home = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleMakeTrip = (e) => {
    e.preventDefault();
    if (!from.trim()) {
      toast.error('Please enter a starting city!');
      return;
    }
    if (!to.trim()) {
      toast.error('Please enter a destination city!');
      return;
    }
    if (!date) {
      toast.error('Please choose a departure date!');
      return;
    }
    if (new Date(date) < new Date(today)) {
      toast.error('Departure date cannot be in the past!');
      return;
    }
    if (!guests || parseInt(guests) < 1) {
      toast.error('Please enter at least 1 guest!');
      return;
    }
    navigate(`/planner?from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}&date=${date}&guests=${guests}`);
  };

  return (
    <div className="overflow-hidden page-shell text-gray-900">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="page-hero relative min-h-[78vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
        {/* Futuristic Background Mesh Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-blue-200/10 rounded-full blur-[140px]" style={{ animationDelay: '3s' }} />
        
        {/* Animated Cyber Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-2xl text-white text-xs font-black tracking-wider uppercase mb-8 shadow-inner"
          >
            <Sparkles size={14} className="text-blue-100" /> Live Smart Travel Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tight text-white font-sans"
          >
            The Future of <br className="hidden md:inline" />
            <span className="text-blue-100 drop-shadow-lg">
              Intelligent Tourism
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-blue-100 text-base md:text-lg mb-14 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Powered by next-gen Gemini AI context engine. Custom design your hotels, electric vehicles, and local guides in real time with unified tracking.
          </motion.p>

          {/* Premium Glassmorphic Booking Form */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 50 }}
            className="max-w-5xl mx-auto"
          >
            <form 
              onSubmit={handleMakeTrip} 
              className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-white/95 border border-white/25 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-blue-950/20"
            >
              {/* FROM */}
              <div className="col-span-1 md:col-span-3 flex flex-col items-start bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100 hover:border-blue-300 focus-within:border-blue-500 transition-all text-left">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin size={11} className="text-blue-400" /> Departure point
                </span>
                <input 
                  type="text" 
                  placeholder="e.g. New Delhi" 
                  value={from} 
                  onChange={e => setFrom(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none font-bold" 
                />
              </div>

              {/* TO */}
              <div className="col-span-1 md:col-span-3 flex flex-col items-start bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100 hover:border-blue-300 focus-within:border-blue-500 transition-all text-left">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin size={11} className="text-blue-600" /> Destination
                </span>
                <input 
                  type="text" 
                  placeholder="e.g. South Goa" 
                  value={to} 
                  onChange={e => setTo(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none font-bold" 
                />
              </div>

              {/* DATE */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-start bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100 hover:border-blue-300 focus-within:border-blue-500 transition-all text-left">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar size={11} className="text-blue-600" /> Departure Date
                </span>
                <input 
                  type="date" 
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 outline-none font-bold" 
                />
              </div>

              {/* GUESTS */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-start bg-blue-50 rounded-2xl px-4 py-3 border border-blue-100 hover:border-blue-300 focus-within:border-blue-500 transition-all text-left">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Users size={11} className="text-blue-600" /> Guests
                </span>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 outline-none font-bold" 
                />
              </div>

              {/* ACTION BUTTON */}
              <button 
                type="submit"
                className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-4 rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-blue-500/20 cursor-pointer"
              >
                <Search size={18} /> GENERATE
              </button>
            </form>
          </motion.div>

          {/* Floating Neon Indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-[10px] font-bold text-blue-100 uppercase tracking-widest">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> Real-time DB Active
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200" /> API Gateway Configured
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" /> Echo Sync Listening
            </span>
          </div>
        </div>
      </section>

      {/* ═══════ LIVE ECO-CITY TELEMETRY OVERLAY ═══════ */}
      <section className="relative z-20 py-8 px-6 -mt-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="blue-panel p-6 rounded-3xl backdrop-blur-2xl flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                Live City Command Telemetry <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Active feed</span>
              </h4>
              <p className="text-xs text-gray-500">Environmental & tourist load analytics for smart travels.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 w-full lg:w-auto">
            <div className="text-left md:border-l md:border-white/[0.05] md:pl-6">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Live Tourists</p>
              <p className="text-lg font-black text-blue-400">{mockTelemetry.activeTourists.toLocaleString()}</p>
            </div>
            <div className="text-left border-l border-white/[0.05] pl-6">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Eco Score</p>
              <p className="text-lg font-black text-blue-600">{mockTelemetry.ecoScore}/100</p>
            </div>
            <div className="text-left border-l border-white/[0.05] pl-6">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Carbon Saved</p>
              <p className="text-lg font-black text-blue-600">{mockTelemetry.carbonSaved}</p>
            </div>
            <div className="text-left border-l border-white/[0.05] pl-6">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Traffic status</p>
              <p className="text-lg font-black text-blue-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping" /> {mockTelemetry.transitStatus}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ DEEP FEATURE ARCHITECTURE ═══════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute -top-32 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-3">Modular Engine</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Hyper-personalized Features</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mt-4 leading-relaxed">
              Every detail is powered by our REST APIs & live databases to deliver structured real-time analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="blue-panel p-7 rounded-3xl backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), ${feat.shadow}, transparent 80%)`
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--x', `${x}px`);
                    e.currentTarget.style.setProperty('--y', `${y}px`);
                  }}
                />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
                  <feat.icon size={22} />
                </div>
                <h3 className="font-extrabold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{feat.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LIVE CROWD MONITOR & TRENDING PLACES ═══════ */}
      <section className="py-20 px-6 relative bg-blue-50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <p className="text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-3">Live Crowds & Status</p>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900">Trending Destinations</h2>
            </div>
            <Link 
              to="/destinations" 
              className="flex items-center gap-2 text-blue-600 font-extrabold text-sm hover:gap-3 transition-all"
            >
              Explore all locations <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((place, idx) => (
              <motion.div 
                key={place.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full justify-between overflow-hidden"
              >
                <div>
                  <div className="relative h-56 rounded-[1.8rem] overflow-hidden">
                    <img 
                      src={place.image} 
                      alt={place.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Badge type */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-black/40 backdrop-blur-md text-white/95 border border-white/10 tracking-widest">
                      {place.type}
                    </span>

                    {/* Stars */}
                    <div className="absolute top-3 right-3 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-amber-400 flex items-center gap-1">
                      <Star size={11} fill="currentColor" /> {place.rating}
                    </div>

                    {/* Live Crowd Badge */}
                    <div className={`absolute bottom-3 left-3 text-[9px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border ${crowdColors[place.crowdLevel]}`}>
                      <Users size={10} /> Crowd: {place.crowdLevel}
                    </div>
                  </div>

                  <div className="p-4 text-left">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <MapPin size={11} /> {place.location}
                    </p>
                    <h3 className="font-extrabold text-base mb-3 leading-snug group-hover:text-blue-600 transition-colors">{place.name}</h3>
                    
                    {/* Inner Tags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {place.tags.map((t, i) => (
                        <span key={i} className="text-[8px] font-bold text-gray-500 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 text-left">
                  <Link 
                    to="/destinations" 
                    className="text-xs text-blue-600 font-extrabold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Select Destination <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REAL-TIME TELEMETRY SYSTEM BRAND TESTIMONIAL ═══════ */}
      <section className="py-24 px-6 relative overflow-hidden bg-white">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-3">Platform Feedback</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Trust from our Ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="blue-panel p-8 rounded-3xl text-left flex flex-col justify-between h-full">
              <div>
                <Quote size={32} className="text-blue-400 opacity-20 mb-6" />
                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                  "The AI custom auto-fill on the Trip Planner saved me hours of manually filtering hotels and guides. The exact cost was precisely calculated!"
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm text-white">
                  P
                </div>
                <div>
                  <p className="text-gray-900 font-extrabold text-sm">Priya Sharma</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Solo Traveler</p>
                </div>
              </div>
            </div>

            <div className="blue-panel p-8 rounded-3xl text-left flex flex-col justify-between h-full">
              <div>
                <Quote size={32} className="text-blue-400 opacity-20 mb-6" />
                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                  "Connecting the agency portal to the dynamic database migrations made tracking our scheduled tours and vehicles 100% real-time. Absolutely professional."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm text-white">
                  R
                </div>
                <div>
                  <p className="text-gray-900 font-extrabold text-sm">Rahul Mehta</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Rajasthan Tours Manager</p>
                </div>
              </div>
            </div>

            <div className="blue-panel p-8 rounded-3xl text-left flex flex-col justify-between h-full">
              <div>
                <Quote size={32} className="text-blue-400 opacity-20 mb-6" />
                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                  "Integrating the live telemetry emergency dispatcher ensures that security warnings across Old Town and Boardwalk are recorded instantly."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm text-white">
                  A
                </div>
                <div>
                  <p className="text-gray-900 font-extrabold text-sm">Anjali Singh</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">City Authority Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HIGH-END FUTURISTIC CTA ═══════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="page-hero p-12 md:p-16 rounded-3xl border border-blue-100 backdrop-blur-2xl shadow-2xl shadow-blue-950/10 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 relative z-10 leading-tight">
              Begin Your Intelligent <br />
              Journey Today
            </h2>
            <p className="text-blue-100 text-sm mb-10 max-w-lg mx-auto relative z-10 font-medium">
              Join thousands of eco-travelers accessing the unified smart travel command dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 max-w-md mx-auto">
              <Link 
                to="/planner" 
                className="flex-1 bg-white text-blue-700 font-extrabold px-8 py-4 rounded-2xl hover:bg-blue-50 active:scale-95 transition-all shadow-xl shadow-blue-950/10"
              >
                Plan AI Trip
              </Link>
              <Link 
                to="/destinations" 
                className="flex-1 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] active:scale-95 transition-all"
              >
                Explore Places
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

