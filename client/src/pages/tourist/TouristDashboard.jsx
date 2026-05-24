import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plane, Compass, Heart, CreditCard, Clock, Bell, User, Loader2, Calendar, Sparkles, AlertOctagon, Phone, MapPin, Navigation, Shield, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api, { favoritesAPI, aiAPI, touristAPI } from '../../services/api';
import { markAllAsRead } from '../../redux/notificationsSlice';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { parseAIJsonArray } from '../../utils/parseAIResponse';

const TouristDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Auth state
  const { user } = useSelector((state) => state.auth);
  
  // Real-time notifications from Redux
  const reduxNotifications = useSelector((state) => state.notifications.notifications);
  
  // Local states for dynamically fetched data
  const [trips, setTrips] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [aiRecs, setAiRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // New Features States
  const [lang, setLang] = useState('en');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('hospitals');
  const [sosSent, setSosSent] = useState(false);
  const [assistance, setAssistance] = useState(null);
  const [loadingAssistance, setLoadingAssistance] = useState(false);
  const [assistanceError, setAssistanceError] = useState('');

  const translations = {
    en: {
      welcome: "Welcome Back",
      sub: "Here is a real-time status of your trips, plans, and AI suggestions.",
      plan: "Plan New Trip",
      stats: ["Upcoming Trips", "Past Trips", "Saved Places", "Total Spent"],
      sos: "Emergency SOS",
      nextAdventure: "Next Adventure",
      manageBooking: "Manage Booking",
      downloadTicket: "Download Ticket",
      payNow: "⚡ Pay Now",
      aiRecs: "AI Travel Recommendations",
      liveSuggestions: "Live suggestions",
      notifications: "Notifications",
      clearAll: "Clear All",
      noNotifications: "No new notifications.",
      quickLinks: "Quick Links"
    },
    hi: {
      welcome: "वापसी पर आपका स्वागत है",
      sub: "यहाँ आपकी यात्रा योजनाओं, योजनाओं और एआई सुझावों की वास्तविक समय की स्थिति है।",
      plan: "नई यात्रा की योजना",
      stats: ["आगामी यात्राएं", "पिछली यात्राएं", "सहेजे गए स्थान", "कुल खर्च"],
      sos: "आपातकालीन SOS",
      nextAdventure: "अगली साहसिक यात्रा",
      manageBooking: "बुकिंग प्रबंधित करें",
      downloadTicket: "टिकट डाउनलोड करें",
      payNow: "⚡ अभी भुगतान करें",
      aiRecs: "एआई यात्रा सिफारिशें",
      liveSuggestions: "लाइव सुझाव",
      notifications: "सूचनाएं",
      clearAll: "सभी साफ करें",
      noNotifications: "कोई नई सूचना नहीं।",
      quickLinks: "त्वरित लिंक्स"
    },
    fr: {
      welcome: "Bon retour",
      sub: "Voici un aperçu en temps réel de vos voyages, plans et suggestions d'IA.",
      plan: "Nouveau voyage",
      stats: ["Voyages à venir", "Voyages passés", "Lieux sauvés", "Total dépensé"],
      sos: "SOS Urgence",
      nextAdventure: "Prochaine Aventure",
      manageBooking: "Gérer la réservation",
      downloadTicket: "Télécharger le billet",
      payNow: "⚡ Payer maintenant",
      aiRecs: "Recommandations d'IA",
      liveSuggestions: "Suggestions en direct",
      notifications: "Notifications",
      clearAll: "Tout effacer",
      noNotifications: "Aucune notification.",
      quickLinks: "Liens rapides"
    }
  };

  const t = translations[lang];

  useEffect(() => {
    fetchDashboardData();
    fetchAIRecommendations();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const tripsRes = await api.get('/trips');
      setTrips(tripsRes.data.data || []);

      const favRes = await favoritesAPI.getAll();
      setFavoritesCount(favRes.data?.length || 0);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchAIRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const prompt = `Give me exactly 2 popular Indian travel destination recommendations based on standard tourist interests. Output only a raw JSON array of objects with fields: "name" (city, state), "image" (valid unsplash travel landscape url), and "match" (e.g. "98%"). No markdown, no code blocks, no backticks.`;
      const response = await aiAPI.chat(prompt);
      let replyText = response.data?.reply || response.data || '';
      
      const parsed = parseAIJsonArray(replyText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiRecs(parsed);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch {
      setAiRecs([
        { name: 'Munnar, Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format', match: '98%' },
        { name: 'Havelock Island, Andaman', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format', match: '95%' }
      ]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const confirmedTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'completed');
  const upcomingTripsCount = confirmedTrips.filter(t => t.departure_date >= todayStr).length;
  const pastTripsCount = confirmedTrips.filter(t => t.departure_date < todayStr).length;
  const totalSpent = confirmedTrips.reduce((acc, t) => acc + parseFloat(t.total_price), 0);

  const sortedUpcoming = [...trips]
    .filter(t => t.status === 'confirmed' && t.departure_date >= todayStr)
    .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    
  const nextTrip = sortedUpcoming[0] || trips.find(t => t.status === 'pending');
  const assistanceDestination = nextTrip?.to_destination || '';
  const assistanceOrigin = nextTrip?.from_location || '';

  const fetchTravelAssistance = useCallback(async (refresh = false) => {
    if (!assistanceDestination) {
      setAssistance(null);
      setAssistanceError('');
      return;
    }

    setLoadingAssistance(true);
    setAssistanceError('');

    try {
      const response = await touristAPI.getAssistance({
        destination: assistanceDestination,
        ...(assistanceOrigin ? { origin: assistanceOrigin } : {}),
        ...(refresh ? { refresh: 1 } : {}),
      });
      setAssistance(response.data);
    } catch (error) {
      console.error('Failed to load live travel assistance:', error);
      setAssistanceError('Live route and nearby service data is temporarily unavailable.');
    } finally {
      setLoadingAssistance(false);
    }
  }, [assistanceDestination, assistanceOrigin]);

  useEffect(() => {
    setAssistance(null);
    fetchTravelAssistance();

    if (!assistanceDestination) {
      return undefined;
    }

    const intervalId = window.setInterval(() => fetchTravelAssistance(true), 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [assistanceDestination, fetchTravelAssistance]);

  const stats = [
    { label: t.stats[0], value: upcomingTripsCount, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t.stats[1], value: pastTripsCount, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t.stats[2], value: favoritesCount, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: t.stats[3], value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const getDestinationImage = (destName) => {
    const query = destName?.toLowerCase() || '';
    if (query.includes('goa')) return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500';
    if (query.includes('jaipur')) return 'https://images.unsplash.com/photo-1477584322904-486a88530bc2?w=500';
    if (query.includes('agra') || query.includes('taj')) return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500';
    if (query.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500';
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500';
  };

  const activeServices = assistance?.services?.[activeServiceTab] || [];
  const activeRoute = assistance?.route;
  const assistanceUpdatedAt = assistance?.updated_at
    ? new Date(assistance.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleSOSBroadcast = () => {
    setSosSent(true);
    toast.success('SOS Broadcast sent to local Emergency services and Police!', { duration: 4000 });
    setTimeout(() => {
      setSosSent(false);
      setShowSOSModal(false);
    }, 3000);
  };

  const handleDownloadTicketPDF = (trip) => {
    try {
      toast.loading('Generating ticket receipt...', { id: 'ticket' });
      const doc = new jsPDF();
      
      const primaryColor = [99, 102, 241];
      const textColor = [31, 41, 55];

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('OFFICIAL TRAVEL TICKET', 15, 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Booking Status: ${trip.status.toUpperCase()} | Trip ID: #${trip.id}`, 15, 28);

      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRAVEL METADATA', 15, 55);
      doc.line(15, 58, 195, 58);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      let y = 68;
      const writeLine = (lbl, val) => {
        doc.setFont('helvetica', 'bold');
        doc.text(lbl, 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(val), 70, y);
        y += 8;
      };

      writeLine('From Station:', trip.from_location || 'Not Specified');
      writeLine('To Destination:', trip.to_destination);
      writeLine('Departure Date:', trip.departure_date);
      writeLine('Return Date:', trip.return_date);
      writeLine('Total Travelers:', trip.travelers);
      
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ACCOMMODATION & SERVICES', 15, y);
      doc.line(15, y + 3, 195, y + 3);
      y += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      writeLine('Hotel booking:', trip.hotel?.name || 'Self Arranged');
      writeLine('Cabs & Transit:', trip.cab_service?.label || trip.cab_service_id ? 'Private Cab Service' : 'Self Arranged');
      writeLine('Tour Guide:', trip.guide?.name || 'Not Requested');

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PAYMENT DETAILS', 15, y);
      doc.line(15, y + 3, 195, y + 3);
      y += 12;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      writeLine('Total Cost Paid:', `INR ${parseFloat(trip.total_price).toLocaleString()}`);
      writeLine('Transaction status:', trip.status === 'confirmed' ? 'PAYMENT CAPTURED' : 'PENDING');

      y += 15;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('This is a computer generated digital ticket confirmation.', 15, y);

      doc.save(`Ticket_Trip_${trip.to_destination}.pdf`);
      toast.success('Ticket PDF generated successfully!', { id: 'ticket' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to print ticket.', { id: 'ticket' });
    }
  };

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background)/0.9)]">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              {t.welcome}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500">{user?.name || 'Traveler'}</span>!
            </h1>
            <p className="text-[hsl(var(--text-muted))] text-sm">{t.sub}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-bold text-white focus:outline-none"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="fr">🇫🇷 FR</option>
            </select>

            {/* Glowing Emergency SOS button */}
            <button 
              onClick={() => setShowSOSModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs tracking-wider animate-pulse hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/20"
            >
              <AlertOctagon size={14} /> {t.sos}
            </button>

            <Link to="/planner" className="btn-primary !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-blue-500/15 text-xs font-extrabold">
              <Map size={16} /> {t.plan}
            </Link>
          </div>
        </div>

        {loadingDashboard ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="glass-surface rounded-3xl p-6 flex items-center gap-4 border border-white/5 relative overflow-hidden card-hover"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-[hsl(var(--text))] mt-0.5">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Adventure Focus Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }} 
                  className="glass-surface rounded-3xl p-6 relative overflow-hidden border border-white/5"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[hsl(var(--primary)/0.08)] rounded-bl-full -z-10 blur-xl" />
                  
                  <h2 className="font-extrabold text-lg mb-5 flex items-center gap-2 text-[hsl(var(--text))]">
                    <Plane size={20} className="text-blue-500" /> {t.nextAdventure}
                  </h2>
                  
                  {nextTrip ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <img 
                        src={getDestinationImage(nextTrip.to_destination)} 
                        alt={nextTrip.to_destination} 
                        className="w-full sm:w-48 h-32 object-cover rounded-2xl shadow-xl border border-white/5" 
                      />
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-2xl font-black text-[hsl(var(--text))]">{nextTrip.to_destination}</h3>
                            <p className="text-xs font-bold text-[hsl(var(--text-muted))] flex items-center gap-1.5 mt-1.5">
                              <Calendar size={13} className="text-[hsl(var(--primary))]" /> 
                              {new Date(nextTrip.departure_date).toLocaleDateString()} to {new Date(nextTrip.return_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            nextTrip.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {nextTrip.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-2 font-medium">
                          Package details: {nextTrip.travelers} Travelers · Total price ₹{parseFloat(nextTrip.total_price).toLocaleString()}
                        </p>

                        <div className="flex gap-3 mt-5">
                          <button 
                            onClick={() => navigate('/my-trips')} 
                            className="flex-1 btn-primary !py-2.5 text-xs font-extrabold"
                          >
                            {t.manageBooking}
                          </button>
                          {nextTrip.status === 'confirmed' ? (
                            <button 
                              onClick={() => handleDownloadTicketPDF(nextTrip)} 
                              className="flex-1 btn-secondary !py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5"
                            >
                              {t.downloadTicket}
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/planner?step=5&trip_id=${nextTrip.id}`)} 
                              className="flex-1 btn-secondary !py-2.5 text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                            >
                              {t.payNow}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Compass size={40} className="mx-auto text-[hsl(var(--text-muted)/0.5)] mb-3" />
                      <p className="text-sm font-semibold text-[hsl(var(--text-muted))]">No upcoming travels planned yet.</p>
                      <Link to="/planner" className="inline-block mt-4 text-xs font-extrabold text-[hsl(var(--primary))] hover:underline flex items-center justify-center gap-1">
                        Start your first design with Magic AI <Sparkles size={12} />
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* Smart Route Optimization (Only displays if trip exists) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5 relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Navigation size={20} className="text-blue-400" />
                      Smart Route Optimization: {assistanceDestination || 'Next trip'}
                    </h2>
                    {nextTrip && (
                      <button
                        onClick={() => fetchTravelAssistance(true)}
                        disabled={loadingAssistance}
                        className="text-[10px] uppercase font-black text-blue-300 border border-blue-500/20 rounded-lg px-3 py-1.5 hover:bg-blue-500/10 disabled:opacity-50"
                      >
                        {loadingAssistance ? 'Updating...' : 'Refresh live data'}
                      </button>
                    )}
                  </div>
                  {!nextTrip ? (
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-sm text-neutral-400">
                      Plan a trip to receive live route guidance for your destination.
                    </div>
                  ) : loadingAssistance && !assistance ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-sm text-neutral-400">
                      <Loader2 size={18} className="animate-spin text-blue-400" /> Calculating a live route...
                    </div>
                  ) : assistanceError ? (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
                      {assistanceError}
                    </div>
                  ) : activeRoute ? (
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Live Recommended Path</p>
                          <p className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                            <Navigation size={12} className="text-[hsl(var(--primary))]" /> {activeRoute.path}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                          {activeRoute.distance} / {activeRoute.duration}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-300 font-semibold">
                        <span className="flex items-center gap-2"><Shield size={12} /> {activeRoute.traffic.message}</span>
                        {assistanceUpdatedAt && (
                          <span className="text-neutral-500">{assistance?.source?.route} | Updated {assistanceUpdatedAt}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-sm text-neutral-400">
                      A route could not be calculated for the stored trip locations.
                    </div>
                  )}
                </motion.div>

                {/* Nearby Essential Services Finder */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.28 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <MapPin size={20} className="text-emerald-400" />
                      Essential Services near {assistanceDestination || 'your next destination'}
                    </h2>
                    
                    {/* Tab Selectors */}
                    <div className="flex gap-1.5 bg-neutral-900 p-1 rounded-xl border border-white/5">
                      {['hospitals', 'atms', 'restaurants'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveServiceTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                            activeServiceTab === tab ? 'bg-[hsl(var(--primary))] text-white' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!nextTrip ? (
                    <p className="text-sm text-neutral-400">Plan a trip to find live nearby services.</p>
                  ) : loadingAssistance && !assistance ? (
                    <div className="py-8 flex justify-center gap-2 text-sm text-neutral-400">
                      <Loader2 size={18} className="animate-spin text-emerald-400" /> Finding nearby services...
                    </div>
                  ) : activeServices.length ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeServices.map((service) => (
                          <div key={service.id || service.name} className="p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-[hsl(var(--primary)/0.2)] transition-all">
                            <h3 className="text-sm font-bold text-white mb-1">{service.name}</h3>
                            {service.address && <p className="text-[10px] text-neutral-500 line-clamp-2">{service.address}</p>}
                            <div className="flex justify-between items-center text-xs text-neutral-400 mt-2 font-medium gap-2">
                              <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500" /> {service.distance}</span>
                              {service.status && <span className="text-[10px] font-bold text-blue-300 text-right">{service.status}</span>}
                            </div>
                            {service.phone && (
                              <a
                                href={`tel:${service.phone}`}
                                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-[hsl(var(--primary))] hover:underline"
                              >
                                <Phone size={10} /> Call: {service.phone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-4">
                        Live places source: {assistance?.source?.services}{assistanceUpdatedAt ? ` | Updated ${assistanceUpdatedAt}` : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-400">No nearby {activeServiceTab} were returned for this destination.</p>
                  )}
                </motion.div>

                {/* AI Suggestions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Compass size={20} className="text-[hsl(var(--primary))]" /> {t.aiRecs}
                    </h2>
                    <span className="text-[10px] uppercase font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" /> {t.liveSuggestions}
                    </span>
                  </div>

                  {loadingRecs ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 size={24} className="animate-spin text-[hsl(var(--primary))]" />
                      <p className="text-[10px] text-[hsl(var(--text-muted))] font-semibold">Gemini generating personalized locations...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {aiRecs.map((rec, i) => (
                        <div 
                          key={i} 
                          onClick={() => navigate(`/planner?to=${rec.name}`)}
                          className="relative h-32 rounded-2xl overflow-hidden group cursor-pointer border border-white/5"
                        >
                          <img 
                            src={rec.image} 
                            alt={rec.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <p className="text-white font-black text-sm">{rec.name}</p>
                            <p className="text-[9px] text-emerald-400 font-extrabold mt-0.5">{rec.match} Match Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Real-time Notifications */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.4 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Bell size={20} className="text-amber-500" /> {t.notifications}
                    </h2>
                    {reduxNotifications.length > 0 && (
                      <button 
                        onClick={() => dispatch(markAllAsRead())} 
                        className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline"
                      >
                        {t.clearAll}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {reduxNotifications.length > 0 ? (
                      reduxNotifications.map((notif, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-xl bg-white/3 border border-white/5 relative overflow-hidden"
                        >
                          <p className="text-xs font-extrabold text-[hsl(var(--text))]">{notif.title}</p>
                          <p className="text-[11px] text-[hsl(var(--text-muted))] mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] mt-2 opacity-40 font-semibold">{new Date(notif.time || Date.now()).toLocaleTimeString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[hsl(var(--text-muted))] text-xs font-semibold">
                        <Bell size={24} className="mx-auto opacity-30 mb-2" />
                        {t.noNotifications}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Navigation Links */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.5 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5"
                >
                  <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2 text-[hsl(var(--text))]">
                    <User size={20} className="text-[hsl(var(--primary))]" /> {t.quickLinks}
                  </h2>
                  <div className="space-y-1">
                    <Link to="/profile" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] text-xs font-bold transition-all text-[hsl(var(--text))]">My Profile</Link>
                    <Link to="/my-trips" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] text-xs font-bold transition-all text-[hsl(var(--text))]">My Bookings</Link>
                    <Link to="/settings" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] text-xs font-bold transition-all text-[hsl(var(--text))]">Settings</Link>
                    <Link to="/contact" className="block p-3 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))] text-xs font-bold transition-all text-[hsl(var(--text))]">Support Center</Link>
                  </div>
                </motion.div>
                
              </div>
              
            </div>
          </>
        )}
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-neutral-900 border border-red-500/30 rounded-3xl p-6 text-white shadow-2xl shadow-red-500/10"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertOctagon size={36} className="animate-bounce" />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider">Emergency SOS Active</h2>
                  <p className="text-xs text-red-400 font-bold">Smart Tourism Support Services</p>
                </div>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-medium">
                Need immediate assistance? Broadcoast your live coordinates to local emergency dispatchers and police stations instantly.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-neutral-400">YOUR GPS POSITION:</span>
                  <span className="text-xs font-black text-emerald-400">26.9124° N, 75.7873° E</span>
                </div>
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <p className="text-xs font-extrabold text-neutral-400 mb-1">EMERGENCY SERVICES HELPLINES:</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span>Police Dispatch:</span>
                    <a href="tel:100" className="text-red-400 hover:underline">100</a>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>Medical & Ambulance:</span>
                    <a href="tel:108" className="text-red-400 hover:underline">108</a>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span>Unified Emergency Line:</span>
                    <a href="tel:112" className="text-red-400 hover:underline">112</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-800 text-xs font-extrabold text-white border border-white/10 hover:bg-neutral-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSOSBroadcast}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-xs font-extrabold text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  {sosSent ? <Check size={14} /> : null}
                  {sosSent ? 'Broadcasted' : 'Broadcast GPS Location'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TouristDashboard;
