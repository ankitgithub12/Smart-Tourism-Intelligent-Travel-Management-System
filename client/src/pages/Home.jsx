import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Brain, TrendingUp, Bus, Shield, ChevronRight, Quote, Zap, BarChart3, Globe } from 'lucide-react';

const destinations = [
  { id: 1, name: 'City Palace', location: 'Jaipur, Rajasthan', rating: 4.8, crowdLevel: 'High', image: 'https://images.unsplash.com/photo-1599661046289-e31897851d41?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Amber Fort', location: 'Amer, Rajasthan', rating: 4.9, crowdLevel: 'Medium', image: 'https://images.unsplash.com/photo-1590050752117-23a97b62b423?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Hawa Mahal', location: 'Jaipur, Rajasthan', rating: 4.7, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1603262110263-fb0110e71329?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'Jantar Mantar', location: 'Jaipur, Rajasthan', rating: 4.5, crowdLevel: 'Low', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop' },
];

const features = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Personalised suggestions using Hugging Face sentence-transformers.', color: 'from-blue-500 to-blue-600' },
  { icon: TrendingUp, title: 'Crowd Prediction', desc: 'Real-time and predictive crowd analytics for every hotspot.', color: 'from-purple-500 to-purple-600' },
  { icon: Bus, title: 'Smart Transport', desc: 'Live route optimisation and transport availability in real time.', color: 'from-green-500 to-green-600' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'JWT & Sanctum auth with encrypted endpoints and role-based access.', color: 'from-orange-500 to-orange-600' },
  { icon: BarChart3, title: 'City Analytics', desc: 'Authorities get live dashboards showing tourist flows and resources.', color: 'from-red-500 to-red-600' },
  { icon: Globe, title: 'Multilingual Ready', desc: 'Built for global tourists with future multilingual AI support.', color: 'from-teal-500 to-teal-600' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Solo Traveller', text: 'SmartTourism transformed my Jaipur trip. The crowd alerts helped me visit City Palace at the perfect time!', rating: 5 },
  { name: 'Rahul Mehta', role: 'Travel Agency Manager', text: 'The admin dashboard gives us visibility into tourist flow. A game-changer for tour planning.', rating: 5 },
  { name: 'Anjali Singh', role: 'City Tourism Officer', text: 'We saw a 30% drop in traffic bottlenecks during peak season after deploying this platform.', rating: 5 },
];

const crowdColors = { Low: 'bg-green-500', Medium: 'bg-orange-500', High: 'bg-red-500' };
const stats = [
  { value: '50K+', label: 'Happy Tourists' }, { value: '200+', label: 'Destinations' },
  { value: '95%', label: 'Accuracy Rate' }, { value: '24/7', label: 'AI Support' },
];

const Home = () => {
  const [searchWhere, setSearchWhere] = useState('');

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-white">
        <div className="absolute top-[-5%] left-[-10%] w-[45%] h-[45%] bg-blue-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap size={12} /> AI-Powered Smart Tourism Platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Explore the World<br /><span className="gradient-text">Smarter & Safer</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            AI-powered crowd predictions, real-time transport optimisation, and personalised destination recommendations.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-2 flex flex-col md:flex-row gap-1 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <MapPin className="text-blue-500 mr-3 shrink-0" size={18} />
              <input type="text" placeholder="Where to go?" value={searchWhere} onChange={e => setSearchWhere(e.target.value)} className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
            <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <Calendar className="text-blue-500 mr-3 shrink-0" size={18} />
              <input type="text" placeholder="When?" className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
            <div className="flex-1 flex items-center px-4 py-3">
              <Users className="text-blue-500 mr-3 shrink-0" size={18} />
              <input type="text" placeholder="Travellers?" className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
            <Link to={`/destinations?q=${searchWhere}`} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
              <Search size={18} /> Search
            </Link>
          </motion.div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {['Live Crowd Status', 'AI Recommendations', 'Smart Routing', 'Real-time Analytics'].map((label, i) => (
              <span key={i} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-blue-200 text-sm font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Popular Destinations</p>
              <h2 className="text-4xl font-bold text-gray-900">Top Places to Visit</h2>
            </div>
            <Link to="/destinations" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">View All <ArrowRight size={18} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((place, idx) => (
              <motion.div key={place.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm card-hover border border-gray-100 group">
                <div className="relative h-52 overflow-hidden">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {place.rating}
                  </div>
                  <div className={`absolute bottom-3 left-3 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${crowdColors[place.crowdLevel]}`}>
                    <Users size={11} /> {place.crowdLevel}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-blue-600 text-xs font-semibold flex items-center gap-1 mb-1"><MapPin size={11} /> {place.location}</p>
                  <h3 className="text-gray-900 font-bold mb-3 group-hover:text-blue-600 transition-colors">{place.name}</h3>
                  <Link to="/destinations" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">Explore <ChevronRight size={14} /></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Smart City Technology</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything for Smarter Travel</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                className="p-7 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feat.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-blue-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-4xl font-bold text-white mb-4">What People Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-7">
                <Quote size={24} className="text-blue-400 mb-4" />
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
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

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-14 relative overflow-hidden shadow-2xl shadow-blue-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <h2 className="text-4xl font-extrabold text-white mb-4 relative z-10">Start Your Smart Journey Today</h2>
              <p className="text-blue-100 mb-8 max-w-lg mx-auto relative z-10">Join thousands of travellers who use AI insights to explore smarter, avoid crowds, and make the most of every trip.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg">Get Started Free</Link>
                <Link to="/destinations" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">Explore Destinations</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
