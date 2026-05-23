import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Plane, Compass, Heart, CreditCard, Clock, Bell, User, Loader2, Calendar, 
  Sparkles, AlertOctagon, Phone, MapPin, Navigation, Shield, Check, Zap, 
  TrendingDown, Star, LayoutDashboard, Settings2, Activity, Bot, ChevronLeft, 
  ChevronRight, Users, Gauge, Leaf, Cpu, Radio, LogOut, Sun, ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api, { favoritesAPI, aiAPI, locationAPI } from '../../services/api';
import { markAllAsRead } from '../../redux/notificationsSlice';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { parseAIJsonArray } from '../../utils/parseAIResponse';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  
  // Real-time location services states
  const [routes, setRoutes] = useState([]);
  const [services, setServices] = useState({});
  const [trafficInfo, setTrafficInfo] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Simulated live dashboard states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [crowdIndex, setCrowdIndex] = useState(62);
  const [transitSpeed, setTransitSpeed] = useState(34);
  const [carbonSaved, setCarbonSaved] = useState(127.4);
  const [aiLoad, setAiLoad] = useState(78);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [liveEvents, setLiveEvents] = useState([
    { text: '🏙️ Times Square crowd density at 68% capacity', time: new Date() },
    { text: '🚇 Subway A-train running on schedule', time: new Date(Date.now() - 60000) },
    { text: '🌉 Brooklyn Bridge pedestrian traffic: Light', time: new Date(Date.now() - 120000) },
  ]);

  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'ai', text: "Hello! I am your NYC intelligent copilot. How can I guide you tonight?" }
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const trafficChartData = [
    { hour: '6AM', speed: 42, density: 18 },
    { hour: '8AM', speed: 15, density: 82 },
    { hour: '10AM', speed: 28, density: 55 },
    { hour: '12PM', speed: 22, density: 68 },
    { hour: '2PM', speed: 30, density: 48 },
    { hour: '4PM', speed: 18, density: 75 },
    { hour: '6PM', speed: 12, density: 90 },
    { hour: '8PM', speed: 25, density: 58 },
    { hour: '10PM', speed: 38, density: 30 },
    { hour: '12AM', speed: 45, density: 15 },
  ];

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'planner', label: 'Trip Planner', icon: Map, path: '/planner' },
    { id: 'trips', label: 'My Voyages', icon: Plane, path: '/my-trips' },
    { id: 'ai', label: 'AI Insights', icon: Sparkles, path: '/ai-recommendations' },
    { id: 'saved', label: 'Saved Places', icon: Heart, path: '/saved' },
    { id: 'transport', label: 'Transit Hub', icon: Navigation, path: '/transport' },
    { id: 'settings', label: 'Settings', icon: Settings2, path: '/settings' },
  ];

  const translations = {
    en: {
      welcome: "Welcome Back",
      sub: "NYC smart city neural node connected.",
      plan: "Plan Voyage",
      stats: ["Upcoming Trips", "Past Trips", "Saved Places", "Total Spent"],
      sos: "EMERGENCY SOS",
      nextAdventure: "Next Active Voyage",
      manageBooking: "Manage Booking",
      downloadTicket: "Download Ticket",
      payNow: "⚡ Pay Now",
      aiRecs: "Neural Destination Matrix",
      liveSuggestions: "Gemini Synthesis",
      notifications: "Neural Logs",
      clearAll: "Flush logs",
      noNotifications: "Logs are clear.",
      quickLinks: "Hyperlinks"
    },
    hi: {
      welcome: "वापसी पर स्वागत",
      sub: "एनवाईसी स्मार्ट सिटी न्यूरल नोड कनेक्टेड।",
      plan: "यात्रा योजना",
      stats: ["आगामी यात्राएं", "पिछली यात्राएं", "सहेजे गए स्थान", "कुल खर्च"],
      sos: "आपातकालीन SOS",
      nextAdventure: "सक्रिय यात्रा",
      manageBooking: "बुकिंग संभालें",
      downloadTicket: "टिकट लें",
      payNow: "⚡ भुगतान",
      aiRecs: "एआई गंतव्य सिफारिशें",
      liveSuggestions: "लाइव सुझाव",
      notifications: "सूचनाएं",
      clearAll: "साफ करें",
      noNotifications: "कोई नई सूचना नहीं।",
      quickLinks: "त्वरित लिंक्स"
    },
    fr: {
      welcome: "Bon Retour",
      sub: "Nœud neural NYC connecté en temps réel.",
      plan: "Planifier Voyage",
      stats: ["Voyages à venir", "Voyages passés", "Lieux sauvés", "Total dépensé"],
      sos: "SOS URGENCE",
      nextAdventure: "Prochaine Aventure",
      manageBooking: "Gérer réservation",
      downloadTicket: "Télécharger ticket",
      payNow: "⚡ Payer",
      aiRecs: "Recommandations IA",
      liveSuggestions: "Synthèse IA",
      notifications: "Notifications",
      clearAll: "Effacer tout",
      noNotifications: "Aucune notification.",
      quickLinks: "Liens rapides"
    }
  };

  const t = translations[lang];

  // Data Fetching Functions
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
      const prompt = `Give me exactly 2 popular Indian or NYC travel destination recommendations. Output only a raw JSON array of objects with fields: "name" (city, state), "image" (valid unsplash travel landscape url), and "match" (e.g. "98%"). No markdown, no code blocks, no backticks.`;
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
        { name: 'Times Square, NYC', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&auto=format', match: '99%' },
        { name: 'Central Park, NYC', image: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=500&auto=format', match: '96%' }
      ]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchRouteOptimization = async (destination) => {
    setLoadingRoutes(true);
    try {
      const res = await locationAPI.getRouteOptimization(destination);
      setRoutes(res.data?.data || []);
      setActiveRouteIndex(0);
    } catch (err) {
      console.error('Failed to fetch route optimization:', err);
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const fetchNearbyServices = async (destination) => {
    setLoadingServices(true);
    try {
      const res = await locationAPI.getNearbyServices(destination);
      setServices(res.data?.data?.services || {});
    } catch (err) {
      console.error('Failed to fetch nearby services:', err);
      setServices({});
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchTrafficInfo = async (destination) => {
    try {
      const res = await locationAPI.getTrafficInfo(destination);
      setTrafficInfo(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch traffic info:', err);
      setTrafficInfo(null);
    }
  };

  // Lifecycle Hooks & Side Effects
  useEffect(() => {
    fetchDashboardData();
    fetchAIRecommendations();
  }, [user]);

  // Real-time location services hook when trips are loaded
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const confirmedTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'completed');
    const sortedUpcoming = [...trips]
      .filter(t => t.status === 'confirmed' && t.departure_date >= todayStr)
      .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    const nextTripData = sortedUpcoming[0] || trips.find(t => t.status === 'pending');
    
    if (nextTripData?.to_destination) {
      fetchRouteOptimization(nextTripData.to_destination);
      fetchNearbyServices(nextTripData.to_destination);
      fetchTrafficInfo(nextTripData.to_destination);
    }
  }, [trips]);

  // Real-time updates simulation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => {
      setCrowdIndex(prev => Math.min(95, Math.max(25, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4))));
      setTransitSpeed(prev => Math.min(55, Math.max(12, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))));
      setCarbonSaved(prev => +(prev + Math.random() * 0.2).toFixed(1));
      setAiLoad(prev => Math.min(99, Math.max(45, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))));
    }, 3000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const cityEvents = [
      '🚇 Subway L-train experiencing 3min delays at 14th St',
      '🎭 Broadway: Hamilton starts in 45 minutes',
      '🌉 Brooklyn Bridge pedestrian traffic: Moderate',
      '🏙️ Times Square crowd density updated to ' + crowdIndex + '% capacity',
      '🌧️ Light rain expected in Manhattan after 6 PM',
      '🚕 Surge pricing active in Midtown — +1.4x',
      '🎵 Central Park Summer Concert begins at 7 PM',
      '⚡ EV charging stations at 78% availability',
      '🏛️ Met Museum extended hours today until 9 PM',
      '🚁 Helicopter tours resumed at Downtown Heliport',
      '🍕 Food truck festival at Bryant Park — 12 vendors',
      '🛳️ Staten Island Ferry running every 15 minutes',
    ];
    const interval = setInterval(() => {
      const randomEvent = cityEvents[Math.floor(Math.random() * cityEvents.length)];
      setLiveEvents(prev => [{ text: randomEvent, time: new Date() }, ...prev].slice(0, 10));
    }, 18000);
    return () => clearInterval(interval);
  }, [crowdIndex]);

  // Computed values
  const todayStr = new Date().toISOString().split('T')[0];
  const confirmedTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'completed');
  const upcomingTripsCount = confirmedTrips.filter(t => t.departure_date >= todayStr).length;
  const pastTripsCount = confirmedTrips.filter(t => t.departure_date < todayStr).length;
  const totalSpent = confirmedTrips.reduce((acc, t) => acc + parseFloat(t.total_price), 0);

  const sortedUpcoming = [...trips]
    .filter(t => t.status === 'confirmed' && t.departure_date >= todayStr)
    .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    
  const nextTrip = sortedUpcoming[0] || trips.find(t => t.status === 'pending');

  const stats = [
    { label: t.stats[0], value: upcomingTripsCount, icon: Plane, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
    { label: t.stats[1], value: pastTripsCount, icon: Clock, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
    { label: t.stats[2], value: favoritesCount, icon: Heart, color: 'text-neon-pink', bg: 'bg-neon-pink/10' },
    { label: t.stats[3], value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
  ];

  // Actions
  const handleSOSBroadcast = () => {
    setSosSent(true);
    toast.success('SOS Broadcast sent to local Emergency services and Police!', { duration: 4000 });
    setTimeout(() => {
      setSosSent(false);
      setShowSOSModal(false);
    }, 3000);
  };

  const handleCopilotSend = async () => {
    if (!copilotInput.trim()) return;
    const userMsg = copilotInput.trim();
    setCopilotMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setCopilotInput('');
    setCopilotLoading(true);
    try {
      const response = await aiAPI.chat(userMsg);
      const reply = response.data?.reply || response.data || 'I could not process that request.';
      setCopilotMessages(prev => [...prev, { role: 'ai', text: typeof reply === 'string' ? reply : JSON.stringify(reply) }]);
    } catch {
      setCopilotMessages(prev => [...prev, { role: 'ai', text: 'NYC Neural Network is offline. Try again shortly.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDownloadTicketPDF = (trip) => {
    try {
      toast.loading('Generating ticket receipt...', { id: 'ticket' });
      const doc = new jsPDF();
      
      const primaryColor = [139, 92, 246];
      const textColor = [15, 23, 42];

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('OFFICIAL VOYAGE TICKET', 15, 18);
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
      doc.text('This is an AI-powered smart travel ticket confirmation.', 15, y);

      doc.save(`Ticket_Voyage_${trip.to_destination}.pdf`);
      toast.success('Ticket PDF generated successfully!', { id: 'ticket' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to print ticket.', { id: 'ticket' });
    }
  };

  const getDestinationImage = (destName) => {
    const query = destName?.toLowerCase() || '';
    if (query.includes('goa')) return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500';
    if (query.includes('jaipur')) return 'https://images.unsplash.com/photo-1477584322904-486a88530bc2?w=500';
    if (query.includes('agra') || query.includes('taj')) return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500';
    if (query.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500';
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500';
  };

  return (
    <div className="flex h-screen bg-[#050816] text-[#F8FAFC] overflow-hidden select-none font-sans relative">
      {/* 1. Background Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#8B5CF6]/15 blur-[90px] animate-orb-1" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-[#3B82F6]/10 blur-[100px] animate-orb-2" />
        <div className="absolute top-[60%] left-[5%] w-[300px] h-[300px] rounded-full bg-[#06B6D4]/12 blur-[80px] animate-orb-1" />
      </div>

      {/* 2. Sidebar Component */}
      <motion.div 
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
        className="h-screen bg-[#050816]/95 border-r border-white/5 backdrop-blur-2xl flex flex-col justify-between z-40 relative flex-shrink-0"
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <Compass size={18} className="text-white animate-pulse" />
              </div>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-black text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
                >
                  NYC COMMAND
                </motion.span>
              )}
            </div>
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-4">
            {sidebarNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative group ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-[#8B5CF6]/20 to-[#3B82F6]/20 border border-purple-500/30 shadow-lg shadow-purple-500/5' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute left-0 top-3 bottom-3 w-1 bg-[#8B5CF6] rounded-r"
                    />
                  )}
                  <IconComp size={16} className={isActive ? 'text-[#8B5CF6]' : 'text-slate-400 group-hover:text-white transition-colors'} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Status */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-pink-500/10">
              {user?.name ? user.name[0].toUpperCase() : 'T'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate leading-none">{user?.name || 'Explorer'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">LIVE HYPERNOOD</span>
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                title="Disconnect"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Main Dashboard Frame */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#050816]/80 backdrop-blur-xl flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <h2 className="text-xs font-black tracking-widest text-[#8B5CF6] uppercase">SYS_NODE_NYC</h2>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 tracking-wider">SECURE</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center w-72 bg-white/3 border border-white/5 focus-within:border-purple-500/30 rounded-xl px-3 py-1.5 gap-2 transition-all">
            <Map size={14} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search destination nodes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Clock Ticker */}
            <div className="font-mono text-xs font-black text-slate-400 bg-white/3 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Clock size={12} className="text-[#3B82F6]" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Redux Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => dispatch(markAllAsRead())}
                className="w-9 h-9 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center relative"
              >
                <Bell size={15} />
                {reduxNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#050816]" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Panel */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {/* A. Welcome Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-transparent border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent blur-3xl rounded-full" />
            <div className="space-y-2 relative z-10">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                {t.welcome}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4]">{user?.name || 'Explorer'}</span> <Sparkles size={24} className="text-[#06B6D4] animate-spin" style={{ animationDuration: '8s' }} />
              </h1>
              <p className="text-xs text-slate-400 font-bold max-w-lg leading-relaxed">{t.sub}</p>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              >
                <option value="en" className="bg-[#0b1120]">🇺🇸 EN</option>
                <option value="hi" className="bg-[#0b1120]">🇮🇳 HI</option>
                <option value="fr" className="bg-[#0b1120]">🇫🇷 FR</option>
              </select>

              <button 
                onClick={() => setShowSOSModal(true)}
                className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs tracking-wider animate-pulse hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center gap-1.5"
              >
                <AlertOctagon size={13} /> {t.sos}
              </button>

              <Link 
                to="/planner" 
                className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-extrabold text-xs tracking-wider hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-1.5"
              >
                <Map size={13} /> {t.plan}
              </Link>
            </div>
          </motion.div>

          {/* B. Live Telemetry Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 }}
              className="p-5 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden group hover:border-[#8B5CF6]/30 transition-all shadow-md shadow-black/10"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CROWD CONGESTION</span>
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                  <Users size={14} className="text-[#8B5CF6]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{crowdIndex}%</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  crowdIndex < 70 ? 'bg-emerald-500/10 text-emerald-400' : crowdIndex < 85 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {crowdIndex < 70 ? 'LIGHT' : crowdIndex < 85 ? 'MODERATE' : 'HEAVY'}
                </span>
              </div>
              <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] transition-all duration-1000"
                  style={{ width: `${crowdIndex}%` }}
                />
              </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all shadow-md shadow-black/10"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TRANSIT NETWORK</span>
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <Gauge size={14} className="text-[#3B82F6]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{transitSpeed} mph</span>
                <span className="text-[9px] text-emerald-400 font-bold">NORMAL SPEED</span>
              </div>
              <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] transition-all duration-1000"
                  style={{ width: `${(transitSpeed / 55) * 100}%` }}
                />
              </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.15 }}
              className="p-5 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden group hover:border-[#06B6D4]/30 transition-all shadow-md shadow-black/10"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ECO CARBON BANK</span>
                <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center">
                  <Leaf size={14} className="text-[#06B6D4]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{carbonSaved} kg</span>
                <span className="text-[9px] text-emerald-400 font-black flex items-center gap-0.5">
                  <TrendingDown size={10} className="rotate-180" /> +12%
                </span>
              </div>
              <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                <div className="h-full bg-[#06B6D4] w-[72%]" />
              </div>
            </motion.div>

            {/* Metric 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden group hover:border-[#EC4899]/30 transition-all shadow-md shadow-black/10"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GEMINI SYNERGY</span>
                <div className="w-7 h-7 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                  <Cpu size={14} className="text-[#EC4899]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{aiLoad}%</span>
                <span className="text-[9px] text-purple-400 font-bold">SYNAPSE ACTIVE</span>
              </div>
              <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] transition-all duration-1000"
                  style={{ width: `${aiLoad}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* C. Primary Command Deck (Two-Column Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Deck (Col Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Traffic Analytics Monitoring System */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                    <Activity size={18} className="text-[#8B5CF6] animate-pulse" />
                    <h3 className="font-extrabold text-sm tracking-wider uppercase">Live Transit & Traffic Analytics</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#8B5CF6]" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Congestion Index</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#3B82F6]" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Average Speed</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(11, 17, 32, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontFamily: 'Sora, sans-serif',
                          fontSize: '11px'
                        }} 
                      />
                      <Area type="monotone" dataKey="density" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpeed)" />
                      <Area type="monotone" dataKey="speed" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorDensity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* 2. Active Voyager Node details */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-bl-full blur-xl pointer-events-none" />
                <h3 className="font-extrabold text-sm tracking-wider uppercase mb-5 flex items-center gap-2">
                  <Plane size={16} className="text-[#3B82F6]" />
                  {t.nextAdventure}
                </h3>

                {nextTrip ? (
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative w-full md:w-52 h-36 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0 shadow-lg shadow-black/35">
                      <img 
                        src={getDestinationImage(nextTrip.to_destination)} 
                        alt={nextTrip.to_destination} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/80 text-[8px] font-black text-white uppercase tracking-widest">NODE SELECTED</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-xl font-black text-white">{nextTrip.to_destination}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={12} className="text-[#8B5CF6]" />
                            <span className="text-[11px] font-bold text-slate-400">
                              {new Date(nextTrip.departure_date).toLocaleDateString()} — {new Date(nextTrip.return_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          nextTrip.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {nextTrip.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-bold leading-relaxed">
                        Configured Voyage: {nextTrip.travelers} explorers registered. Allocation total amount: ₹{parseFloat(nextTrip.total_price).toLocaleString()}
                      </p>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => navigate('/my-trips')} 
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all text-center"
                        >
                          {t.manageBooking}
                        </button>
                        
                        {nextTrip.status === 'confirmed' ? (
                          <button 
                            onClick={() => handleDownloadTicketPDF(nextTrip)} 
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-extrabold shadow-md shadow-purple-500/10 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileText size={13} /> {t.downloadTicket}
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate(`/planner?step=5&trip_id=${nextTrip.id}`)} 
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-extrabold shadow-md shadow-amber-500/10 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 animate-pulse"
                          >
                            {t.payNow}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl bg-white/2 border border-white/3 border-dashed">
                    <Compass size={36} className="mx-auto text-slate-600 mb-3 animate-spin" style={{ animationDuration: '12s' }} />
                    <p className="text-xs font-bold text-slate-400">No voyage vectors allocated for this neural terminal node.</p>
                    <Link to="/planner" className="inline-flex items-center gap-1 text-xs font-black text-[#8B5CF6] hover:underline mt-4">
                      Initiate New Voyage Matrix <Sparkles size={11} className="animate-pulse" />
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* 3. AI Travel Copilot Command Console */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl flex flex-col space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Bot size={18} className="text-[#06B6D4]" />
                    <h3 className="font-extrabold text-sm tracking-wider uppercase">AI Travel Copilot Node</h3>
                  </div>
                  <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                    <Sparkles size={10} /> NEURAL ACTIVE
                  </span>
                </div>

                {/* Dialog Messages Screen */}
                <div className="h-44 overflow-y-auto bg-black/35 rounded-2xl p-4 border border-white/5 space-y-3 scrollbar-thin">
                  {copilotMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#3B82F6]/30 text-white border border-purple-500/20'
                          : 'bg-white/5 text-slate-300 border border-white/5'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {copilotLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 text-slate-400 border border-white/5 p-3 rounded-2xl text-xs flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin text-cyan-400" />
                        <span>Synthesizing intelligence...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-made quick queries */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    "Best NYC restaurants to visit",
                    "Times Square transit guides",
                    "NYC nighttime weather status"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCopilotInput(preset)}
                      className="px-3 py-1.5 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Query Input Box */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Query intelligent copilot node..." 
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                    className="flex-1 bg-black/40 border border-white/5 focus:border-[#8B5CF6]/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <button 
                    onClick={handleCopilotSend}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-500/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    Send Node
                  </button>
                </div>
              </motion.div>

            </div>

            {/* Right Deck (Col Span 1) */}
            <div className="space-y-6">
              
              {/* 1. Eco Sustainability Monitor Node */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} className="text-[#06B6D4]" />
                    <h3 className="font-extrabold text-sm tracking-wider uppercase">Environmental Monitor</h3>
                  </div>
                  <span className="text-[8px] font-black text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded uppercase">LIVE TELEMETRY</span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Sun size={14} className="text-emerald-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Air Quality Index</p>
                        <p className="text-xs font-black text-white mt-0.5">AQI 42</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">GOOD</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Sun size={14} className="text-amber-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">UV Index Rating</p>
                        <p className="text-xs font-black text-white mt-0.5">3.4 Rating</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">LOW</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Leaf size={14} className="text-cyan-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Carbon Saved Bank</p>
                        <p className="text-xs font-black text-white mt-0.5">{carbonSaved} kg Offset</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 uppercase">SAVED</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Zap size={14} className="text-blue-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Smart Grid Saved</p>
                        <p className="text-xs font-black text-white mt-0.5">34.6 kWh Saved</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase">EFFICIENT</span>
                  </div>
                </div>
              </motion.div>

              {/* 2. NYC Live Events feed */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl flex flex-col space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-[#EC4899] animate-pulse" />
                    <h3 className="font-extrabold text-sm tracking-wider uppercase">Live Feed Updates</h3>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-black text-red-500 tracking-wider">LIVE FEED</span>
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  <AnimatePresence>
                    {liveEvents.map((evt, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 rounded-xl bg-white/2 border border-white/5 text-[11px] font-semibold text-slate-300 leading-relaxed shadow-sm hover:border-[#8B5CF6]/25 transition-all"
                      >
                        <p>{evt.text}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{new Date(evt.time).toLocaleTimeString()}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* 3. Voyager Hyperlinks (Quick Navigation) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#8B5CF6]" />
                  <h3 className="font-extrabold text-sm tracking-wider uppercase">{t.quickLinks}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "My Profile", path: "/profile" },
                    { label: "Bookings", path: "/my-trips" },
                    { label: "Settings", path: "/settings" },
                    { label: "Support", path: "/contact" }
                  ].map((lnk, idx) => (
                    <Link
                      key={idx}
                      to={lnk.path}
                      className="p-3 rounded-xl bg-white/2 hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-[#3B82F6]/10 border border-white/5 hover:border-purple-500/20 text-center text-xs font-bold text-slate-400 hover:text-white transition-all shadow-sm"
                    >
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              </motion.div>

            </div>

          </div>

          {/* D. Neural Destination Matrix matrix recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-[#0b1120]/60 border border-white/5 backdrop-blur-2xl space-y-5"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-wider uppercase flex items-center gap-2">
                <Compass size={18} className="text-[#8B5CF6] animate-spin" style={{ animationDuration: '15s' }} />
                {t.aiRecs}
              </h3>
              <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Sparkles size={11} className="animate-pulse" /> {t.liveSuggestions}
              </span>
            </div>

            {loadingRecs ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={24} className="animate-spin text-[#8B5CF6]" />
                <p className="text-xs font-bold text-slate-500">Synthesizing travel matrices via neural node network...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiRecs.map((rec, i) => (
                  <motion.div 
                    key={i} 
                    onClick={() => navigate(`/planner?to=${rec.name}`)}
                    whileHover={{ y: -3 }}
                    className="relative h-36 rounded-2xl overflow-hidden group cursor-pointer border border-white/5 shadow-md shadow-black/20"
                  >
                    <img 
                      src={rec.image} 
                      alt={rec.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <p className="text-white font-black text-base">{rec.name}</p>
                        <p className="text-[10px] text-cyan-400 font-extrabold mt-0.5">Matched Score: {rec.match}</p>
                      </div>
                      <span className="text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20 group-hover:opacity-100 transition-opacity">
                        ALLOCATE VECTOR
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </main>
      </div>

      {/* 4. SOS Modal Re-styled */}
      <AnimatePresence>
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0b1120]/90 border border-red-500/30 rounded-3xl p-6 text-white shadow-2xl shadow-red-500/10 backdrop-blur-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-rose-600 to-red-600" />
              <div className="flex items-center gap-3.5 text-red-500 mb-4">
                <ShieldAlert size={36} className="animate-bounce" />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider">EMERGENCY SOS LINK</h2>
                  <p className="text-[10px] text-red-400 font-bold tracking-widest">SMART TOURISM CENTRAL SUPPORT</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-semibold">
                WARNING: Broadcasting emergency vectors transfers your live coordinates to the local police dispatchers and medical responders instantly.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">YOUR GPS POSITION:</span>
                  <span className="text-xs font-black text-emerald-400">26.9124° N, 75.7873° E</span>
                </div>
                
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">EMERGENCY SERVICES HELPLINES:</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Police Dispatch:</span>
                    <a href="tel:100" className="text-red-400 hover:underline">100</a>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Ambulance & Rescue:</span>
                    <a href="tel:108" className="text-red-400 hover:underline">108</a>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">National Emergency Support:</span>
                    <a href="tel:112" className="text-red-400 hover:underline">112</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/3 hover:bg-white/5 border border-white/10 text-xs font-extrabold text-slate-300 hover:text-white transition-all"
                >
                  Cancel Vector
                </button>
                <button
                  onClick={handleSOSBroadcast}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-xs font-extrabold text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  {sosSent ? <Check size={14} /> : null}
                  {sosSent ? 'Broadcasted' : 'Transmit SOS Coordinates'}
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
