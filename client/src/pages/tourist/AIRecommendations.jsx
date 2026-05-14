import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, MapPin, Star, Users, Clock, Loader2, Sparkles } from 'lucide-react';
import { aiAPI } from '../services/api';

const sampleRecs = [
  { name: 'Nahargarh Fort', location: 'Jaipur', crowdLevel: 'Low', bestTime: 'Morning', rating: 4.6, reason: 'Less crowded with stunning city views at sunrise.' },
  { name: 'Albert Hall Museum', location: 'Jaipur', crowdLevel: 'Low', bestTime: 'Afternoon', rating: 4.4, reason: 'Rich cultural exhibits with minimal weekend crowds.' },
  { name: 'Jal Mahal', location: 'Jaipur', crowdLevel: 'Medium', bestTime: 'Evening', rating: 4.7, reason: 'Spectacular sunset views; best visited in golden hour.' },
];

const crowdColors = { Low: 'bg-green-100 text-green-700', Medium: 'bg-orange-100 text-orange-700', High: 'bg-red-100 text-red-700' };

const AIRecommendations = () => {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preferences.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await aiAPI.recommend(preferences);
      // Use API result if valid, otherwise fall back to sample data for demo
      const result = response.data?.recommendation;
      setRecommendations(Array.isArray(result) && result.length > 0 ? result : sampleRecs);
    } catch {
      setRecommendations(sampleRecs);
      setError('AI service is offline — showing sample recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Less crowded heritage sites in Jaipur',
    'Best places for families with kids',
    'Romantic spots with low traffic',
    'Morning visits with great views',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
              <p className="text-gray-500 text-sm">Powered by Hugging Face sentence-transformers</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tell the AI your preferences</h2>
          <p className="text-sm text-gray-500 mb-6">Describe what kind of places you enjoy, your travel style, or what you want to avoid.</p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input id="ai-pref-input" type="text" value={preferences} onChange={e => setPreferences(e.target.value)}
              placeholder="e.g. Less crowded heritage sites, good for photography..."
              className="flex-1 px-5 py-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            <button type="submit" disabled={loading || !preferences.trim()} id="ai-recommend-btn"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Thinking...' : 'Get AI Tips'}
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-gray-400 font-medium self-center">Quick prompts:</span>
            {quickPrompts.map((p) => (
              <button key={p} onClick={() => setPreferences(p)}
                className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm flex items-center gap-2">
            <Sparkles size={16} /> {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {hasSearched && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500" />
                Recommended for You
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${crowdColors[rec.crowdLevel]}`}>
                        <Users size={11} /> {rec.crowdLevel} Crowd
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" /> {rec.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{rec.name}</h3>
                    <p className="text-blue-600 text-xs font-semibold flex items-center gap-1 mb-3">
                      <MapPin size={11} /> {rec.location}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{rec.reason}</p>
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                      <Clock size={12} /> Best time: {rec.bestTime}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                <Brain size={30} className="text-white" />
              </div>
              <p className="text-gray-500 font-medium">AI is analysing your preferences...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIRecommendations;
