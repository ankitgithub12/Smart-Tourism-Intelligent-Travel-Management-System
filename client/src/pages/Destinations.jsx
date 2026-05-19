import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Filter, Compass, AlertTriangle } from 'lucide-react';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dummy map data - in a real app, integrate Google Maps or Mapbox here
  const mapRegions = [
    { id: 1, name: 'North India', desc: 'Mountains & Heritage', top: '20%', left: '30%', crowd: 'Moderate', color: 'bg-amber-500' },
    { id: 2, name: 'West India', desc: 'Beaches & Deserts', top: '50%', left: '20%', crowd: 'High', color: 'bg-rose-500' },
    { id: 3, name: 'South India', desc: 'Nature & Temples', top: '75%', left: '35%', crowd: 'Low', color: 'bg-emerald-500' },
    { id: 4, name: 'East India', desc: 'Culture & Hills', top: '45%', left: '60%', crowd: 'Low', color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Explore</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Interactive Tourism Map</h1>
          <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto">Discover destinations with real-time AI crowd prediction and interactive geography.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center glass-surface rounded-2xl px-4 py-3 shadow-lg">
            <Search size={20} className="text-[hsl(var(--primary))] mr-3" />
            <input type="text" placeholder="Search for cities, states, or attractions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent outline-none text-lg" />
            <button className="p-2 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3 glass-surface rounded-3xl p-4 h-[600px] relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="font-bold text-lg flex items-center gap-2"><MapPin size={20} className="text-[hsl(var(--primary))]" /> Live Map View</h2>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low Crowd</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High</span>
              </div>
            </div>
            
            <div className="flex-1 bg-[hsl(var(--primary)/0.03)] rounded-2xl relative border border-[hsl(var(--primary)/0.1)] overflow-hidden">
              {/* Map Background Placeholder */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              {/* Interactive Map Points */}
              {mapRegions.map((region, i) => (
                <motion.div key={region.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2, type: 'spring' }}
                  className="absolute group cursor-pointer" style={{ top: region.top, left: region.left }}>
                  
                  {/* Point */}
                  <div className="relative">
                    <div className={`absolute -inset-2 ${region.color} opacity-20 rounded-full animate-ping`} />
                    <div className={`w-4 h-4 ${region.color} rounded-full shadow-lg border-2 border-white`} />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="glass-surface p-3 rounded-xl shadow-xl text-center">
                      <p className="font-bold text-sm">{region.name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-muted))] mb-2">{region.desc}</p>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${region.color} text-white`}>
                        {region.crowd} Crowd
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/40 backdrop-blur border border-white/10 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Compass size={24} className="text-[hsl(var(--primary))]" />
                  <div>
                    <p className="font-bold text-sm">Map Integration Ready</p>
                    <p className="text-xs opacity-70">Connect Google Maps API in settings.</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-xs font-bold">Connect API</button>
              </div>
            </div>
          </div>

          {/* AI Crowd Alert Sidebar */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg px-2 flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500" /> Live AI Insights</h2>
            
            {[
              { title: 'Goa Beaches', status: 'High Alert', desc: 'Expected peak crowd this weekend due to festival.', icon: '🏖️' },
              { title: 'Taj Mahal', status: 'Moderate', desc: 'Best time to visit is early morning 6 AM - 8 AM.', icon: '🕌' },
              { title: 'Munnar Hills', status: 'Low Crowd', desc: 'Perfect quiet getaway right now.', icon: '⛰️' },
              { title: 'Mumbai City', status: 'Critical', desc: 'Heavy traffic and tourist influx reported.', icon: '🏙️' },
            ].map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                className="glass-surface p-4 rounded-2xl border-l-4" style={{ borderLeftColor: insight.status === 'Critical' || insight.status === 'High Alert' ? 'rgb(244 63 94)' : insight.status === 'Moderate' ? 'rgb(245 158 11)' : 'rgb(16 185 129)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm flex items-center gap-2"><span>{insight.icon}</span> {insight.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    insight.status === 'Critical' || insight.status === 'High Alert' ? 'bg-rose-500/10 text-rose-500' : 
                    insight.status === 'Moderate' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>{insight.status}</span>
                </div>
                <p className="text-xs text-[hsl(var(--text-muted))]">{insight.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
