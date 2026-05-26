import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Filter, Compass, AlertTriangle, Star, Activity, Sparkles, Castle, Trees, Loader } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { placesAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { parseAIJsonArray } from '../utils/parseAIResponse';

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    70% { transform: scale(1.5); opacity: 0; }
    100% { transform: scale(1); opacity: 0.3; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  @media (prefers-color-scheme: dark) {
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(styleSheet);

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
        const placesWithIds = placesData.map((place, index) => ({
          ...place,
          id: place.id || `place-${Date.now()}-${index}-${Math.random()}`,
          rating: place.rating || 4.0,
          crowd_level: place.crowd_level || 50,
          category: place.category || 'landmark',
          description: place.description || 'A beautiful tourist destination with unique attractions.'
        }));
        setPlaces(placesWithIds);
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
    if (!searchTerm.trim()) return places;
    
    return places.filter(place =>
      place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [places, searchTerm]);

  // Handle Dynamic Search & Ask AI if no results
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    // Check if we have local matches
    const matches = places.filter(place =>
      place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matches.length > 0) {
      focusOnPlace(matches[0]);
      toast.success(`Found ${matches.length} local matches for "${searchTerm}"`);
      return;
    }

    // No local matches: call Gemini AI
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
    "crowd_level": 55,
    "latitude": 27.1751,
    "longitude": 78.0421,
    "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400"
  }
]
Ensure coordinates are highly accurate. Return RAW JSON only, no markdown formatting.`;

      const res = await aiAPI.chat(prompt);
      let replyText = res.data?.reply || res.data || '';
      
      // Clean the response
      replyText = replyText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let newPlaces;
      try {
        newPlaces = JSON.parse(replyText);
        if (!Array.isArray(newPlaces)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        newPlaces = parseAIJsonArray(replyText);
        if (!Array.isArray(newPlaces) || newPlaces.length === 0) {
          throw new Error('Could not parse AI response');
        }
      }
      
      if (newPlaces && newPlaces.length > 0) {
        const formattedNewPlaces = newPlaces.map((p, idx) => ({
          ...p,
          id: `ai-${Date.now()}-${idx}-${Math.random()}`,
          rating: p.rating || 4.0,
          crowd_level: p.crowd_level || 50,
          category: p.category || 'landmark',
          description: p.description || 'A fascinating destination worth exploring.'
        }));

        setPlaces(prev => [...formattedNewPlaces, ...prev]);
        
        setTimeout(() => {
          focusOnPlace(formattedNewPlaces[0]);
        }, 100);

        toast.success(`✨ Loaded ${formattedNewPlaces.length} attractions!`, { id: toastId });
      } else {
        throw new Error('No valid places found');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Could not find attractions. Try "Paris", "Tokyo", or "New York".', { id: toastId });
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Handle AI Crowd Prediction
  const handleAIPredict = useCallback(async (place) => {
    if (!place || !place.id) {
      toast.error('Invalid place data');
      return;
    }
    
    // Check if we already have a prediction
    if (aiPredictions[place.id]) {
      toast.success('AI prediction already available');
      return;
    }
    
    setPredictingId(place.id);
    const toastId = toast.loading(`🤖 Analyzing ${place.name}...`);
    
    try {
      // Simulate API call with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const locationData = `${place.name}, ${place.location}. ${place.description}`;
      const res = await aiAPI.crowdPredict(
        {
          location_data: locationData,
          latitude: place.latitude,
          longitude: place.longitude
        },
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      let predictionData = null;
      
      if (res.data?.prediction && typeof res.data.prediction === 'object') {
        predictionData = {
          advice: res.data.prediction.advice || res.data.prediction.message || '',
          temperature: res.data.prediction.temperature || 'N/A',
          weather: res.data.prediction.weather || 'N/A',
          level: res.data.prediction.level || 'medium',
          label: res.data.prediction.label || 'Medium',
          confidence: res.data.prediction.confidence ?? 0
        };
      } else {
        const text = res.data?.prediction || res.data?.reply || '';
        const crowdLevel = place.crowd_level || 50;
        let advice = text;
        if (!advice) {
          if (crowdLevel > 70) {
            advice = `⚠️ This location tends to be very crowded. Consider visiting early morning or late evening for a better experience.`;
          } else if (crowdLevel > 40) {
            advice = `📊 Moderate crowd levels expected. Good time to visit, but book tickets in advance if possible.`;
          } else {
            advice = `🌟 This spot has lower crowd levels. Perfect time for a relaxed visit and great photos!`;
          }
        }
        predictionData = {
          advice: advice,
          temperature: 'N/A',
          weather: 'N/A',
          level: crowdLevel >= 70 ? 'high' : crowdLevel >= 40 ? 'medium' : 'low',
          label: crowdLevel >= 70 ? 'High' : crowdLevel >= 40 ? 'Medium' : 'Low',
          confidence: 0
        };
      }
      
      // Update state with new prediction
      setAiPredictions(prev => {
        const updated = { ...prev, [place.id]: predictionData };
        console.log('Prediction added for', place.name, predictionData);
        return updated;
      });
      
      toast.success(`Analysis complete for ${place.name}!`, { id: toastId });
      
    } catch (err) {
      console.error('Prediction error:', err);
      
      // Set fallback prediction even on error
      const fallbackPrediction = {
        advice: `📌 ${place.name} is a popular destination. Best time to visit is during off-peak seasons (spring or fall) to avoid crowds.`,
        temperature: 'N/A',
        weather: 'N/A',
        level: 'medium',
        label: 'Medium',
        confidence: 0
      };
      
      setAiPredictions(prev => {
        const updated = { ...prev, [place.id]: fallbackPrediction };
        return updated;
      });
      
      toast.error('Using crowd estimation data instead.', { id: toastId });
    } finally {
      setPredictingId(null);
    }
  }, [aiPredictions]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false
      }).setView([26.9124, 75.7873], 12);

      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);
    } catch (err) {
      console.error('Map initialization error:', err);
    }

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
      let color = '#10b981';
      let status = 'Low';
      
      if (level >= 80) {
        color = '#f43f5e';
        status = 'Critical';
      } else if (level >= 60) {
        color = '#ef4444';
        status = 'High';
      } else if (level >= 30) {
        color = '#f59e0b';
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
      
      const prediction = aiPredictions[place.id];
      let predictionHtml = '';
      if (prediction) {
        if (typeof prediction === 'object') {
          const tempHtml = prediction.temperature !== 'N/A' ? `<span style="background: white; padding: 2px 5px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600;">🌡️ ${prediction.temperature}</span>` : '';
          const weatherHtml = prediction.weather !== 'N/A' ? `<span style="background: white; padding: 2px 5px; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600; margin-left: 4px;">🌤️ ${prediction.weather}</span>` : '';
          predictionHtml = `
            <div style="margin-top: 8px; padding: 6px; background: #e0e7ff; border-radius: 8px; font-size: 10px; color: #1e3a8a; line-height: 1.3;">
              <div style="margin-bottom: 4px; display: flex; align-items: center;">
                ${tempHtml}
                ${weatherHtml}
              </div>
              <strong>✨ AI:</strong> ${prediction.advice}
            </div>
          `;
        } else {
          predictionHtml = `<div style="margin-top: 8px; padding: 6px; background: #e0e7ff; border-radius: 8px; font-size: 10px; color: #1e3a8a;"><strong>✨ AI:</strong> ${prediction.substring(0, 100)}</div>`;
        }
      }

      const popupContent = `
        <div style="font-family: inherit; width: 220px; padding: 2px;">
          ${place.image ? `<img src="${place.image}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : ''}
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 2px 0; color: #1f2937;">${place.name}</h4>
          <p style="font-size: 10px; color: #6b7280; margin: 0 0 6px 0;">${place.location}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 9px; font-weight: 700; background-color: ${color}20; color: ${color}; padding: 1px 5px; border-radius: 3px;">
              ${status} Crowd
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #f59e0b;">★ ${parseFloat(place.rating).toFixed(1)}</span>
          </div>
          ${predictionHtml}
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [filteredPlaces, aiPredictions]);

  const focusOnPlace = (place) => {
    if (!place) return;
    
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    if (!isNaN(lat) && !isNaN(lng) && mapInstance.current) {
      mapInstance.current.setView([lat, lng], 14);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-blue-600 dark:text-blue-400 font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} /> AI-Powered Travel
          </p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Interactive Tourism Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Discover destinations worldwide with real-time AI crowd predictions
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 transition-all gap-2">
            <Search size={22} className="text-blue-500 ml-1" />
            <input
              type="text"
              placeholder="Search cities or places (e.g., Goa, Paris, Tokyo)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent outline-none text-base md:text-lg text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearchingAI}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSearchingAI ? 'Searching...' : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Map */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-4 h-[600px] relative flex flex-col border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <MapPin size={20} className="text-blue-500" /> Live Map View
              </h2>
              <div className="flex gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High</span>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-2xl relative border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div ref={mapRef} className="w-full h-full" />
              
              {/* Status Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-white z-[1000]">
                <div className="flex items-center gap-2">
                  <Compass size={18} className="text-blue-400" />
                  <span className="text-xs font-bold">{filteredPlaces.length} locations loaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px]">AI Connected</span>
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
            <h2 className="font-bold text-lg px-2 flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity size={20} className="text-blue-500" /> AI Insights
            </h2>
            
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-500">Locations</p>
                  <p className="text-xl font-black text-blue-600">{filteredPlaces.length}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-500">Avg Crowd</p>
                  <p className="text-xl font-black text-amber-500">
                    {filteredPlaces.length > 0 
                      ? Math.round(filteredPlaces.reduce((acc, curr) => acc + (parseInt(curr.crowd_level) || 0), 0) / filteredPlaces.length)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-500">Predictions</p>
                  <p className="text-xl font-black text-emerald-500">{Object.keys(aiPredictions).length}</p>
                </div>
              </div>
            </div>

            {/* Places List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size={32} className="animate-spin text-blue-500 mb-3" />
                  <p className="text-sm text-gray-500">Loading destinations...</p>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Compass size={40} className="mx-auto opacity-30 mb-2" />
                  <p className="text-sm">No places found</p>
                  <p className="text-xs mt-1">Try searching for a city</p>
                </div>
              ) : (
                filteredPlaces.map((place) => {
                  const level = parseInt(place.crowd_level) || 0;
                  let statusColor = 'bg-emerald-500';
                  let statusText = 'Low';
                  
                  if (level >= 70) {
                    statusColor = 'bg-rose-500';
                    statusText = 'High';
                  } else if (level >= 40) {
                    statusColor = 'bg-amber-500';
                    statusText = 'Moderate';
                  }
                  
                  const hasPrediction = aiPredictions[place.id];
                  const isPredicting = predictingId === place.id;
                  
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => focusOnPlace(place)}
                      className="bg-white dark:bg-gray-800 p-3 rounded-xl border-l-4 cursor-pointer hover:shadow-lg transition-all border-gray-200 dark:border-gray-700"
                      style={{ borderLeftColor: level >= 70 ? '#f43f5e' : level >= 40 ? '#f59e0b' : '#10b981' }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                          <MapPin size={12} className="text-blue-500" />
                          {place.name}
                        </h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-1">{place.location}</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {place.description}
                      </p>
                      
                      {/* AI Prediction Display */}
                      {hasPrediction ? (
                        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/60 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Sparkles size={12} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                              <span className="text-[10px] font-extrabold text-blue-800 dark:text-blue-300">AI Analysis</span>
                            </div>
                            {typeof aiPredictions[place.id] === 'object' && aiPredictions[place.id].confidence > 0 && (
                              <span className="text-[8px] bg-blue-200/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                {aiPredictions[place.id].confidence}% Match
                              </span>
                            )}
                          </div>
                          
                          {typeof aiPredictions[place.id] === 'object' ? (
                            <div className="space-y-2 text-[10px] text-gray-700 dark:text-gray-300">
                              <div className="flex flex-wrap gap-1.5">
                                {aiPredictions[place.id].temperature !== 'N/A' && (
                                  <span className="flex items-center gap-0.5 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 font-bold text-blue-600 dark:text-blue-400">
                                    🌡️ {aiPredictions[place.id].temperature}
                                  </span>
                                )}
                                {aiPredictions[place.id].weather !== 'N/A' && (
                                  <span className="flex items-center gap-0.5 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 font-bold text-indigo-600 dark:text-indigo-400">
                                    🌤️ {aiPredictions[place.id].weather}
                                  </span>
                                )}
                                {aiPredictions[place.id].label && (
                                  <span className="flex items-center gap-0.5 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 font-bold text-amber-600 dark:text-amber-400">
                                    👥 {aiPredictions[place.id].label}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-blue-900 dark:text-blue-200 leading-relaxed font-medium mt-1">
                                {aiPredictions[place.id].advice}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                              {aiPredictions[place.id]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAIPredict(place);
                          }}
                          disabled={isPredicting}
                          className="mt-2 text-[9px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {isPredicting ? (
                            <>
                              <Loader size={10} className="animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            '✨ Get AI Prediction'
                          )}
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;