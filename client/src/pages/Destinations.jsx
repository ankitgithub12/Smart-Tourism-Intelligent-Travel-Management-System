import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Filter, Compass, AlertTriangle, Star, Activity, Sparkles } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { placesAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { parseAIJsonArray } from '../utils/parseAIResponse';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [aiPredictions, setAiPredictions] = useState({});
  const [predictingId, setPredictingId] = useState(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Fetch initial places from DB
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await placesAPI.getAll();
        const placesData = res.data?.data || res.data || [];
        setPlaces(placesData);
      } catch (err) {
        console.error('Error fetching places:', err);
        toast.error('Failed to load destinations.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Filter local places matching search
  const filteredPlaces = useMemo(() => {
    return places.filter(place =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [places, searchTerm]);

  // Handle Dynamic Search & Ask AI if no results
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    // Check if we have local matches
    const matches = places.filter(place =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matches.length > 0) {
      focusOnPlace(matches[0]);
      return;
    }

    // No local matches: call Gemini AI to fetch coordinates and attractions dynamically
    setIsSearchingAI(true);
    const toastId = toast.loading(`✨ AI is exploring attractions for "${searchTerm}"...`);
    try {
      const prompt = `Create a list of 5 popular tourist attractions or places matching "${searchTerm}".
Return EXACTLY a JSON array of objects with the following schema:
[
  {
    "name": "Attraction Name",
    "location": "City, State/Country",
    "description": "Engaging description of why tourists visit here.",
    "category": "heritage | nature | landmark | adventure",
    "rating": 4.8,
    "crowd_level": 55, // Estimated current crowd percentage 0-100
    "latitude": 27.1751, // Float coordinate
    "longitude": 78.0421, // Float coordinate
    "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" // Valid Unsplash travel image URL
  }
]
Ensure coordinates are highly accurate for Leaflet mapping. Return RAW JSON only, no markdown formatting, no backticks, no code fence.`;

      const res = await aiAPI.chat(prompt);
      let replyText = res.data?.reply || res.data || '';
      
      const newPlaces = parseAIJsonArray(replyText);
      if (Array.isArray(newPlaces) && newPlaces.length > 0) {
        const formattedNewPlaces = newPlaces.map((p, idx) => ({
          ...p,
          id: `ai-${Date.now()}-${idx}`
        }));

        // Put the new places at the start of the list
        setPlaces(prev => [...formattedNewPlaces, ...prev]);
        
        // Let state settle, then center map on first new item
        setTimeout(() => {
          focusOnPlace(formattedNewPlaces[0]);
        }, 100);

        toast.success(`✨ AI dynamically loaded ${formattedNewPlaces.length} attractions in "${searchTerm}"!`, { id: toastId });
      } else {
        toast.error('AI could not locate attractions for that search. Try cities or countries.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        toast.error('AI was busy or returned conversational text. Please try again in a few seconds!', { id: toastId });
      } else {
        toast.error('Search failed. Try a city like "Paris", "Goa", or "New York".', { id: toastId });
      }
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Handle AI Crowd Prediction for a specific place
  const handleAIPredict = async (place) => {
    if (aiPredictions[place.id]) {
      return;
    }
    setPredictingId(place.id);
    const toastId = toast.loading(`⚡ Gemini AI predicting crowd status for ${place.name}...`);
    try {
      const locationData = `${place.name}, ${place.location}. Description: ${place.description}. Base occupancy index is ${place.crowd_level}%.`;
      const res = await aiAPI.crowdPredict(locationData);
      
      const predictionVal = res.data?.prediction;
      let finalText = '';
      if (predictionVal && typeof predictionVal === 'object') {
        finalText = `${predictionVal.advice} (Confidence: ${predictionVal.confidence}%)`;
      } else if (res.data?.reply) {
        finalText = res.data.reply;
      } else {
        finalText = 'No prediction available.';
      }
      
      setAiPredictions(prev => ({
        ...prev,
        [place.id]: finalText
      }));
      toast.success(`Crowd analysis loaded!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI prediction.', { id: toastId });
    } finally {
      setPredictingId(null);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false
    }).setView([26.9124, 75.7873], 12);

    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync Markers with list
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    markersGroup.current.clearLayers();

    filteredPlaces.forEach((place) => {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const level = parseInt(place.crowd_level) || 0;
      let color = '#10b981'; // Green
      let status = 'Low';
      if (level >= 80) {
        color = '#f43f5e'; // Rose
        status = 'Critical';
      } else if (level >= 60) {
        color = '#ef4444'; // Red
        status = 'High';
      } else if (level >= 30) {
        color = '#f59e0b'; // Amber
        status = 'Moderate';
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>
            <div style="position: absolute; width: 14px; height: 14px; margin: 7px; border-radius: 50%; background-color: ${color}; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup.current);

      const predictionHtml = aiPredictions[place.id]
        ? `<div style="margin-top: 8px; font-size: 10px; background-color: #2563eb12; border: 1px solid #2563eb25; border-radius: 6px; padding: 6px; color: #1d4ed8; line-height: 1.3;">
             <strong>✨ AI Insight:</strong> <em>${aiPredictions[place.id]}</em>
           </div>`
        : `<button id="popup-btn-${place.id}" style="width: 100%; border: none; background-color: #2563eb; color: white; padding: 6px; border-radius: 6px; font-weight: bold; font-size: 10px; cursor: pointer; margin-top: 8px; box-shadow: 0 2px 4px rgba(99,102,241,0.3);">
             Analyze Crowd Status
           </button>`;

      const popupContent = `
        <div style="font-family: inherit; width: 190px; padding: 2px;">
          ${place.image ? `<img src="${place.image}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : ''}
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 2px 0; color: #1f2937;">${place.name}</h4>
          <p style="font-size: 10px; color: #6b7280; margin: 0 0 6px 0;">${place.location}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 9px; font-weight: 700; background-color: ${color}20; color: ${color}; padding: 1px 5px; border-radius: 3px; text-transform: uppercase;">
              ${status} Crowd
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #f59e0b;">★ ${parseFloat(place.rating).toFixed(1)}</span>
          </div>
          ${predictionHtml}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        setSelectedPlace(place);
        const btn = document.getElementById(`popup-btn-${place.id}`);
        if (btn) {
          btn.onclick = () => handleAIPredict(place);
        }
      });
    });
  }, [filteredPlaces, aiPredictions]);

  // Center map on select place
  const focusOnPlace = (place) => {
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    if (!isNaN(lat) && !isNaN(lng) && mapInstance.current) {
      mapInstance.current.setView([lat, lng], 14);
      markersGroup.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const mLatLng = layer.getLatLng();
          if (mLatLng.lat === lat && mLatLng.lng === lng) {
            layer.openPopup();
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background)/0.9)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-[hsl(var(--primary))] font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} /> Explore Without Boundaries
          </p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600">
            Interactive Tourism Map
          </h1>
          <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto text-sm md:text-base">
            Discover destinations worldwide. Search any city beyond Jaipur to dynamically plot real-time AI crowd predictions.
          </p>
        </motion.div>

        {/* Premium Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="flex items-center glass-surface rounded-2xl px-4 py-3 shadow-xl border border-[hsl(var(--primary)/0.15)] focus-within:border-[hsl(var(--primary))] transition-all gap-2">
            <Search size={22} className="text-[hsl(var(--primary))] ml-1" />
            <input
              type="text"
              placeholder="Search worldwide cities or places (e.g. Goa, Paris, Agra)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full bg-transparent outline-none text-base md:text-lg text-[hsl(var(--text))] placeholder-[hsl(var(--text-muted))]"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearchingAI}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-500/20"
            >
              {isSearchingAI ? 'Exploring...' : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Map and Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Map Area */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 glass-surface rounded-3xl p-4 h-[600px] relative overflow-hidden flex flex-col border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="font-bold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                <MapPin size={20} className="text-[hsl(var(--primary))]" /> Live Map View
              </h2>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High
                </span>
              </div>
            </div>
            
            <div className="flex-1 bg-[hsl(var(--primary)/0.03)] rounded-2xl relative border border-[hsl(var(--primary)/0.1)] overflow-hidden shadow-inner">
              {/* Map Mount Target */}
              <div ref={mapRef} className="w-full h-full z-0" />

              {/* Dynamic Bottom Status Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-white z-[1000] shadow-2xl">
                <div className="flex items-center gap-3">
                  <Compass size={22} className="text-[hsl(var(--primary))] animate-spin" style={{ animationDuration: '8s' }} />
                  <div>
                    <p className="font-extrabold text-xs tracking-wide">AI Connected Map</p>
                    <p className="text-[10px] opacity-70">
                      Showing {filteredPlaces.length} locations across map context
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-95">Realtime Connected</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 flex flex-col h-[600px]"
          >
            <h2 className="font-bold text-lg px-2 flex items-center gap-2 text-[hsl(var(--text))]">
              <Activity size={20} className="text-blue-500" /> AI Insights Center
            </h2>
            
            {/* Quick Stat Panel */}
            <div className="glass-surface p-4 rounded-2xl border border-[hsl(var(--primary)/0.15)] bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider opacity-60">Locations</p>
                  <p className="text-lg font-black text-[hsl(var(--primary))]">{filteredPlaces.length}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider opacity-60">Avg Crowd</p>
                  <p className="text-lg font-black text-amber-500">
                    {filteredPlaces.length > 0 
                      ? Math.round(filteredPlaces.reduce((acc, curr) => acc + (parseInt(curr.crowd_level) || 0), 0) / filteredPlaces.length)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider opacity-60">Network</p>
                  <p className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-0.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Scroll Container */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-3"></div>
                    <p className="text-sm">Retrieving destinations...</p>
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="text-center py-20 text-[hsl(var(--text-muted))]">
                    <Compass size={40} className="mx-auto opacity-30 mb-2" />
                    <p className="text-xs">No local spots found.</p>
                    <p className="text-[10px] mt-1 opacity-70">Use search bar above to look up cities worldwide!</p>
                  </div>
                ) : (
                  filteredPlaces.map((place, i) => {
                    const level = parseInt(place.crowd_level) || 0;
                    let status = 'Low';
                    let statusColor = 'rgb(16 185 129)'; // emerald
                    let icon = '🌳';
                    
                    if (['heritage', 'fort', 'observatory', 'palace', 'monument', 'temple'].some(c => place.category.toLowerCase().includes(c))) {
                      icon = '🕌';
                    } else if (place.category.toLowerCase().includes('nature') || place.category.toLowerCase().includes('hill')) {
                      icon = '🏔️';
                    } else if (place.category.toLowerCase().includes('landmark') || place.category.toLowerCase().includes('square')) {
                      icon = '📍';
                    }

                    if (level >= 80) {
                      status = 'Critical';
                      statusColor = 'rgb(244 63 94)'; // rose
                    } else if (level >= 60) {
                      status = 'High';
                      statusColor = 'rgb(239 68 68)'; // red
                    } else if (level >= 30) {
                      status = 'Moderate';
                      statusColor = 'rgb(245 158 11)'; // amber
                    }

                    const prediction = aiPredictions[place.id];

                    return (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => focusOnPlace(place)}
                        className="glass-surface p-4 rounded-2xl border-l-4 cursor-pointer hover:bg-[hsl(var(--primary)/0.03)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/5 shadow-md"
                        style={{ borderLeftColor: statusColor }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="font-bold text-sm text-[hsl(var(--text))] flex items-center gap-1.5">
                            <span className="text-base">{icon}</span> {place.name}
                          </h3>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[hsl(var(--text-muted))] line-clamp-2 mb-2">
                          {place.description}
                        </p>
                        
                        {prediction ? (
                          <div className="mt-2 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-700 dark:text-blue-300 leading-normal">
                            <p className="font-bold mb-0.5 flex items-center gap-1">
                              <span>✨</span> AI Custom Advice:
                            </p>
                            <p className="italic">{typeof prediction === 'object' ? (prediction.advice || JSON.stringify(prediction)) : prediction}</p>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAIPredict(place);
                            }}
                            disabled={predictingId === place.id}
                            className="mt-2 text-[10px] text-[hsl(var(--primary))] font-bold hover:underline flex items-center gap-1"
                          >
                            {predictingId === place.id ? '⚡ Asking Gemini AI...' : '⚡ Get AI Predictions'}
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Destinations;
