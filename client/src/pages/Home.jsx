import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Brain, TrendingUp, Shield, ChevronRight, Quote, Zap, Globe, Hotel, UtensilsCrossed, Car, Leaf, DollarSign } from 'lucide-react';
import { FaUmbrellaBeach, FaRoute, FaMountain, FaWater } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const destinations = [
  { id: 1, name: 'Goa Beaches', location: 'Goa, India', rating: 4.9, crowdLevel: 'Medium', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop' },
  { id: 2, name: 'Jaipur Heritage', location: 'Rajasthan, India', rating: 4.8, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1600100397608-f010f418c5e4?w=800&auto=format&fit=crop' },
  { id: 3, name: 'Kerala Backwaters', location: 'Kerala, India', rating: 4.9, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop' },
  { id: 4, name: 'Manali Valley', location: 'Himachal Pradesh', rating: 4.7, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop' },
];

const features = [
  { icon: Brain, title: 'AI Smart Planner', desc: 'Plan complete trips with AI-powered recommendations and budget optimization.', color: 'from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))]' },
  { icon: Hotel, title: 'Hotel Booking', desc: 'Find and book the best hotels with real ratings, reviews and live pricing.', color: 'from-[hsl(var(--accent))] to-[hsl(var(--accent-light))]' },
  { icon: UtensilsCrossed, title: 'Food Planning', desc: 'Customized meal plans — Veg, Non-Veg, Vegan — for your entire trip.', color: 'from-[hsl(var(--secondary))] to-orange-400' },
  { icon: Car, title: 'Cab & Vehicle Rental', desc: 'Book pickups, drops, and rental vehicles from bikes to luxury SUVs.', color: 'from-purple-500 to-purple-600' },
  { icon: Leaf, title: 'Eco Tourism', desc: 'Carbon footprint tracking, eco scores, and green travel suggestions.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Shield, title: 'Emergency System', desc: 'SOS button, nearby hospitals, police stations, and live location sharing.', color: 'from-red-500 to-red-600' },
];

const stats = [
  { value: '50K+', label: 'Happy Tourists' },
  { value: '500+', label: 'Destinations' },
  { value: '200+', label: 'Hotels' },
  { value: '24/7', label: 'AI Support' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Solo Traveller', text: 'The Smart Planner saved me hours! I booked hotel, food, and cab all in one place. Absolutely magical experience.', rating: 5 },
  { name: 'Rahul Mehta', role: 'Travel Agency Manager', text: 'The agency dashboard gives real-time insights into bookings and revenue. A game-changer for our business.', rating: 5 },
  { name: 'Anjali Singh', role: 'Adventure Enthusiast', text: 'Crowd predictions helped me visit places at the perfect time. The AI assistant was like having a local guide!', rating: 5 },
];

const crowdColors = { Low: 'bg-emerald-500', Medium: 'bg-amber-500', High: 'bg-red-500' };

const Home = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
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
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div 
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary-dark)) 0%, hsl(var(--primary)) 100%)' }} 
          className="absolute inset-0 opacity-95" 
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Animated blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-white/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-white/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

        {/* Wave bottom */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--bg-start))" opacity="0.6" />
          <path d="M0,90 C320,50 640,110 960,80 C1200,60 1360,100 1440,90 L1440,120 L0,120 Z" fill="hsl(var(--bg-start))" />
        </svg>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-full mb-8">
            <Zap size={14} /> AI-Powered Smart Tourism Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Explore. Experience.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200">
              Enjoy The World 🌍
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
            Smart trip planning with AI — book hotels, food, cabs, guides & vehicles all in one place.
          </motion.p>

          {/* Smart Booking Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="max-w-5xl mx-auto">
            <form onSubmit={handleMakeTrip} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl">
              {/* FROM */}
              <div className="col-span-1 md:col-span-3 flex flex-col items-start bg-slate-950/25 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 hover:border-white/30 focus-within:border-white/50 focus-within:bg-slate-950/40 transition-all text-left">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={10} className="text-yellow-200" /> From
                </span>
                <input 
                  type="text" 
                  placeholder="Your City" 
                  value={from} 
                  onChange={e => setFrom(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none font-bold" 
                />
              </div>

              {/* TO */}
              <div className="col-span-1 md:col-span-3 flex flex-col items-start bg-slate-950/25 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 hover:border-white/30 focus-within:border-white/50 focus-within:bg-slate-950/40 transition-all text-left">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={10} className="text-emerald-300" /> To
                </span>
                <input 
                  type="text" 
                  placeholder="Destination" 
                  value={to} 
                  onChange={e => setTo(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none font-bold" 
                />
              </div>

              {/* DATE */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-start bg-slate-950/25 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 hover:border-white/30 focus-within:border-white/50 focus-within:bg-slate-950/40 transition-all text-left">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar size={10} className="text-blue-300" /> Departure
                </span>
                <input 
                  type="date" 
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none font-bold [color-scheme:dark]" 
                />
              </div>

              {/* GUESTS */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-start bg-slate-950/25 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 hover:border-white/30 focus-within:border-white/50 focus-within:bg-slate-950/40 transition-all text-left">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Users size={10} className="text-purple-300" /> Guests
                </span>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none font-bold" 
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 px-6 py-4 rounded-2xl font-black text-sm hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition-all shadow-xl shadow-amber-500/10 cursor-pointer"
              >
                <Search size={18} /> MAKE TRIP
              </button>
            </form>
          </motion.div>

          {/* Floating Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-bold text-white/50 uppercase tracking-widest">
            {['Smart Planning', 'Hotel Booking', 'AI Assistant', 'Eco Travel'].map((label, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="py-16 bg-gradient-to-r from-[hsl(var(--primary-dark))] to-[hsl(var(--primary))]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-1">{s.value}</div>
              <div className="text-white/60 text-sm font-semibold">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ POPULAR DESTINATIONS ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Popular Destinations</p>
              <h2 className="text-4xl font-black">Trending Places</h2>
            </div>
            <Link to="/destinations" className="hidden md:flex items-center gap-2 text-[hsl(var(--primary))] font-bold hover:gap-3 transition-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((place, idx) => (
              <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="glass-surface rounded-3xl overflow-hidden card-hover group">
                <div className="relative h-52 overflow-hidden">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {place.rating}
                  </div>
                  <div className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${crowdColors[place.crowdLevel]}`}>
                    <Users size={11} /> {place.crowdLevel}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[hsl(var(--primary))] text-xs font-bold flex items-center gap-1 mb-1">
                    <MapPin size={11} /> {place.location}
                  </p>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-[hsl(var(--primary))] transition-colors">{place.name}</h3>
                  <Link to="/destinations" className="text-sm text-[hsl(var(--primary))] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Explore <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Smart Features</p>
            <h2 className="text-4xl font-black mb-4">Everything for Smarter Travel</h2>
            <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto">One platform for complete trip planning — powered by AI, designed for travelers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                className="glass-surface p-7 rounded-3xl card-hover group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feat.icon size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-[hsl(var(--text-muted))] text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-20 px-6 bg-gradient-to-br from-[hsl(var(--bg-dark-start))] to-[hsl(var(--bg-dark-end))]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[hsl(var(--primary-light))] font-bold text-sm uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-4xl font-black text-white mb-4">What Travelers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-3xl p-7">
                <Quote size={24} className="text-[hsl(var(--primary-light))] mb-4" />
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div 
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary-dark)) 0%, hsl(var(--primary)) 100%)' }}
              className="rounded-3xl p-14 relative overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <h2 className="text-4xl font-black text-white mb-4 relative z-10">Start Your Smart Journey Today</h2>
              <p className="text-blue-100 mb-8 max-w-lg mx-auto relative z-10 text-base font-medium">
                Plan trips, book hotels, hire guides — all powered by AI. Join thousands of happy travelers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link to="/planner" className="bg-white text-blue-600 hover:text-blue-700 font-extrabold px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-blue-900/20">
                  Plan Your Trip
                </Link>
                <Link to="/destinations" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all">
                  Explore Destinations
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
