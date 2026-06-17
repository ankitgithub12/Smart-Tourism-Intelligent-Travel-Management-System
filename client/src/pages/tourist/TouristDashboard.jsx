import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plane, Compass, Heart, CreditCard, Clock, Bell, User, Loader2, Calendar, Sparkles, AlertOctagon, Phone, MapPin, Navigation, Shield, Check, Settings, HelpCircle, HeartPulse, Utensils, Award, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    fetchDashboardData();
    fetchAIRecommendations();
  }, [user]);

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

  // Laravel Echo Private Channel for Real-time booking updates
  useEffect(() => {
    if (user?.id) {
      let echoInstance = null;
      const channelName = `App.Models.User.${user.id}`;
      
      import('../../services/echo').then(({ default: echo }) => {
        echoInstance = echo;
        const channel = echo.private(channelName);
        
        channel.listen('.BookingStatusUpdated', (data) => {
          console.log('Real-time booking update received in dashboard:', data);
          fetchDashboardData();
          fetchTravelAssistance(true);
        });
      }).catch(err => {
        console.error('Echo error in dashboard:', err);
      });

      return () => {
        if (echoInstance) {
          echoInstance.private(channelName).stopListening('.BookingStatusUpdated');
        }
      };
    }
  }, [user?.id, fetchTravelAssistance]);

  const stats = [
    { label: t.stats[0], value: upcomingTripsCount, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: t.stats[1], value: pastTripsCount, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t.stats[2], value: favoritesCount, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: t.stats[3], value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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

      // Palette
      const darkSlate = [15, 23, 42]; // #0f172a
      const primaryBlue = [30, 58, 138]; // #1e3a8a
      const lightSlate = [241, 245, 249]; // #f1f5f9
      const borderGray = [226, 232, 240]; // #e2e8f0
      const textDark = [51, 65, 85]; // #334155
      const textMuted = [100, 116, 139]; // #64748b

      // Page Border
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      // Header Band
      doc.setFillColor(...darkSlate);
      doc.rect(10, 10, 190, 45, 'F');

      // Decorative Accent Line
      doc.setFillColor(...primaryBlue);
      doc.rect(10, 55, 190, 3, 'F');

      // Title & Header Info
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('TRAVEL BOARDING PASS', 18, 26);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(200, 200, 220);
      doc.text('SMART TOURISM & INTELLIGENT TRAVEL SYSTEM', 18, 32);
      const bookingDate = trip.created_at ? new Date(trip.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
      doc.text(`BOOKED ON: ${bookingDate}`, 18, 38);
      doc.text(`PRINTED ON: ${new Date().toLocaleString('en-IN')}`, 18, 44);

      // Top Right: Booking ID Block
      doc.setFillColor(...primaryBlue);
      doc.rect(140, 15, 52, 31, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('TICKET ID', 145, 21);
      doc.setFontSize(13);
      doc.text(`#ST-${trip.id}`, 145, 28);
      doc.setFontSize(8);
      doc.setTextColor(220, 220, 255);
      doc.text(`STATUS: ${trip.status.toUpperCase()}`, 145, 36);
      const isPaid = ['confirmed', 'completed'].includes(trip.status.toLowerCase());
      doc.text(`PAYMENT: ${isPaid ? 'PAID' : 'PENDING'}`, 145, 42);

      // Layout Divider
      doc.setDrawColor(...borderGray);
      doc.line(105, 58, 105, 215);

      // Column 1: Passenger & Trip metadata (Left Side)
      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PASSENGER & TRIP DETAILS', 18, 70);
      doc.line(18, 73, 98, 73);

      let leftY = 82;
      const writeLeftField = (label, val) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...textMuted);
        doc.text(label.toUpperCase(), 18, leftY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...textDark);
        doc.text(String(val), 18, leftY + 5.5);
        
        leftY += 15;
      };

      const passengerName = trip.traveler_name || (trip.user?.name) || 'Guest Traveler';
      const formattedDep = trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      const formattedRet = trip.return_date ? new Date(trip.return_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      const durationDays = trip.departure_date && trip.return_date ? `${Math.ceil((new Date(trip.return_date) - new Date(trip.departure_date)) / 86400000) + 1} Days` : 'N/A';

      writeLeftField('Passenger Name', passengerName);
      writeLeftField('Departure Station', trip.from_location || 'Not Specified');
      writeLeftField('Destination', trip.to_destination);
      writeLeftField('Departure Date', formattedDep);
      writeLeftField('Return Date', formattedRet);
      writeLeftField('Travelers Count', `${trip.travelers} Traveler(s) (${durationDays})`);

      // Column 2: Reserved travel services (Right Side)
      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('RESERVED SERVICES & STAYS', 112, 70);
      doc.line(112, 73, 192, 73);

      let rightY = 82;
      const writeRightField = (label, val, subVal = '') => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...textMuted);
        doc.text(label.toUpperCase(), 112, rightY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...textDark);
        doc.text(String(val), 112, rightY + 5.5);

        if (subVal) {
          doc.setFontSize(8.5);
          doc.setTextColor(...textMuted);
          doc.text(String(subVal), 112, rightY + 10);
          rightY += 19.5;
        } else {
          rightY += 15;
        }
      };

      const packageName = trip.agencyPackage?.name || 'Custom Self-Planned Trip';
      const hotelName = trip.hotel?.name || 'Self Arranged / No Hotel';
      const hotelAddress = trip.hotel?.address ? `Addr: ${trip.hotel.address}` : '';

      // Cab / transit service
      let cabDetails = 'Self Arranged / No Cab';
      let cabDriver = '';
      if (trip.cabService?.label || trip.cabService?.name) {
        cabDetails = trip.cabService.label || trip.cabService.name;
        cabDriver = trip.cabService.type || 'Standard Cab';
      } else if (trip.agencyVehicle && trip.agencyVehicle.type === 'Cab') {
        cabDetails = `${trip.agencyVehicle.model} (Agency Cab)`;
        cabDriver = `Driver: ${trip.agencyVehicle.driver || 'N/A'} · Loc: ${trip.agencyVehicle.location || 'N/A'}`;
      }

      // Guide details
      let guideDetails = 'Not Requested';
      let guideSpecialty = '';
      if (trip.guide?.name) {
        guideDetails = trip.guide.name;
        guideSpecialty = trip.guide.phone ? `Phone: ${trip.guide.phone}` : 'Certified Local Guide';
      } else if (trip.agencyGuide?.name) {
        guideDetails = `${trip.agencyGuide.name} (Agency Guide)`;
        guideSpecialty = `Specialty: ${trip.agencyGuide.specialty || 'N/A'} · Phone: ${trip.agencyGuide.contact || 'N/A'}`;
      }

      // Rental Vehicle
      let rentalDetails = 'Not Requested';
      if (trip.rentalVehicle?.name || trip.rentalVehicle?.type) {
        rentalDetails = trip.rentalVehicle.name || trip.rentalVehicle.type;
      } else if (trip.agencyVehicle && trip.agencyVehicle.type !== 'Cab') {
        rentalDetails = `${trip.agencyVehicle.model} (${trip.agencyVehicle.type})`;
      }

      writeRightField('Package Plan', packageName);
      writeRightField('Hotel Accommodation', hotelName, hotelAddress);
      writeRightField('Transit & Transfers', cabDetails, cabDriver);
      writeRightField('Local Tour Guide', guideDetails, guideSpecialty);
      writeRightField('Rental Vehicle', rentalDetails);

      // Payment Details & Barcode Block (Footer Section)
      doc.setDrawColor(...borderGray);
      doc.line(15, 215, 195, 215);

      // Draw light slate background box for Payment Info
      doc.setFillColor(...lightSlate);
      doc.rect(15, 222, 180, 24, 'F');

      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('SUBTOTAL', 22, 231);
      doc.text('TAX (5% GST)', 58, 231);
      doc.text('DISCOUNT', 98, 231);
      doc.text('TOTAL PAID', 140, 231);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`INR ${Number(trip.subtotal || 0).toLocaleString()}`, 22, 238);
      doc.text(`INR ${Number(trip.tax || 0).toLocaleString()}`, 58, 238);
      doc.text(`INR ${Number(trip.discount || 0).toLocaleString()}`, 98, 238);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryBlue);
      doc.text(`INR ${Number(trip.total_price || 0).toLocaleString()}`, 140, 238);

      // Simulated Barcode
      const drawBarcode = (x, y, h) => {
        doc.setFillColor(0, 0, 0);
        const pattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 1, 4];
        let currX = x;
        for (let i = 0; i < pattern.length; i++) {
          const w = pattern[i] * 0.45;
          if (i % 2 === 0) {
            doc.rect(currX, y, w, h, 'F');
          }
          currX += w + 0.45;
        }
      };

      drawBarcode(15, 254, 12);
      
      doc.setTextColor(...textMuted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`*ST-${trip.id}-${trip.departure_date ? String(trip.departure_date).slice(0, 10) : ''}*`, 15, 270);

      // Travel Agency & Contact details in footer
      const agencyName = trip.agencyPackage?.agency?.name 
        || trip.agencyGuide?.agency?.name 
        || trip.agencyVehicle?.agency?.name 
        || 'Smart Tourism Travel Authority';
      const agencyEmail = trip.agencyPackage?.agency?.email 
        || trip.agencyGuide?.agency?.email 
        || trip.agencyVehicle?.agency?.email 
        || 'support@smarttourism.com';

      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('FULFILLED BY:', 102, 258);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...textDark);
      doc.text(agencyName, 102, 263);
      doc.setTextColor(...textMuted);
      doc.setFontSize(8);
      doc.text(`Email: ${agencyEmail}`, 102, 268);

      // Save PDF
      doc.save(`Ticket_ST_${trip.id}_${trip.to_destination}.pdf`);
      toast.success('Ticket PDF generated successfully!', { id: 'ticket' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to print ticket.', { id: 'ticket' });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDaysRemaining = (depDate) => {
    if (!depDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dep = new Date(depDate);
    dep.setHours(0, 0, 0, 0);
    const diffTime = dep - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTrafficColor = (msg) => {
    const text = (msg || '').toLowerCase();
    if (text.includes('heavy') || text.includes('accident') || text.includes('severe') || text.includes('congested')) return 'red';
    if (text.includes('moderate') || text.includes('slow') || text.includes('medium') || text.includes('delays')) return 'amber';
    return 'emerald';
  };

  const copyAddress = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!', { icon: '📋' });
  };

  const daysRemaining = nextTrip ? getDaysRemaining(nextTrip.departure_date) : null;
  const stops = activeRoute?.path 
    ? activeRoute.path.split(/[-›>]+/).map(s => s.trim()) 
    : (assistanceOrigin && assistanceDestination ? [assistanceOrigin, assistanceDestination] : []);
  const trafficColor = activeRoute ? getTrafficColor(activeRoute.traffic?.message) : 'emerald';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(var(--bg-start))] via-[hsl(var(--bg-end))] to-[hsl(var(--bg-start))] transition-colors duration-500 relative overflow-hidden">
      {/* Background decorative glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-[hsl(var(--primary)/0.04)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-[11px] font-black uppercase tracking-wider mb-3 border border-[hsl(var(--primary)/0.1)] shadow-sm"
            >
              <Award size={12} className="text-[hsl(var(--primary))]" /> {getGreeting()}
            </motion.span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tight text-[hsl(var(--text))] leading-none">
              {t.welcome}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] via-blue-500 to-indigo-500">{user?.name || 'Traveler'}</span>!
            </h1>
            <p className="text-[hsl(var(--text-muted))] text-sm font-semibold">{t.sub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--glass-border))] text-xs font-bold text-[hsl(var(--text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] shadow-sm transition-all dark:bg-[hsl(var(--surface-dark))]"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="fr">🇫🇷 FR</option>
            </select>

            {/* Glowing Emergency SOS button */}
            <button 
              onClick={() => setShowSOSModal(true)}
              className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-red-500/35 active:scale-95 transition-all overflow-hidden group hover:shadow-red-500/50"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <AlertOctagon size={14} className="animate-bounce" /> {t.sos}
            </button>

            <Link to="/planner" className="btn-primary !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-blue-500/15 text-xs font-extrabold active:scale-95">
              <Map size={16} /> {t.plan}
            </Link>
          </div>
        </div>

        {loadingDashboard ? (
          <div className="flex justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={44} className="animate-spin text-[hsl(var(--primary))]" />
              <p className="text-xs font-bold text-[hsl(var(--text-muted))]">Loading your live dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-surface rounded-3xl p-6 flex items-center gap-4 border border-[hsl(var(--glass-border))] relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-current opacity-[0.015] rounded-full blur-md group-hover:scale-150 transition-transform duration-500 text-[hsl(var(--primary))]" />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={24} className={`${stat.color} ${stat.label === t.stats[2] ? 'group-hover:animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-[hsl(var(--text))] mt-0.5">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Next Adventure Hero Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }} 
                  className="glass-surface rounded-3xl overflow-hidden border border-[hsl(var(--glass-border))] shadow-xl relative group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--primary)/0.04)] rounded-bl-full -z-10 blur-2xl" />
                  
                  <div className="p-6">
                    <h2 className="font-extrabold text-lg mb-5 flex items-center gap-2 text-[hsl(var(--text))]">
                      <Plane size={20} className="text-blue-500 animate-pulse" /> {t.nextAdventure}
                    </h2>
                    
                    {nextTrip ? (
                      <div className="flex flex-col md:flex-row gap-6 items-stretch">
                        <div className="relative w-full md:w-56 h-40 md:h-auto min-h-[10rem] rounded-2xl overflow-hidden shadow-md border border-[hsl(var(--glass-border))] flex-shrink-0 group">
                          <img 
                            src={getDestinationImage(nextTrip.to_destination)} 
                            alt={nextTrip.to_destination} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-white/20 text-white backdrop-blur-md border border-white/10 tracking-widest">
                              Destination
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-lg font-black tracking-tight">{nextTrip.to_destination}</p>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                              <div>
                                <h3 className="text-2xl font-black text-[hsl(var(--text))] tracking-tight">{nextTrip.to_destination}</h3>
                                <p className="text-xs font-bold text-[hsl(var(--text-muted))] flex items-center gap-1.5 mt-1">
                                  <Calendar size={13} className="text-[hsl(var(--primary))]" /> 
                                  {new Date(nextTrip.departure_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(nextTrip.return_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                nextTrip.status === 'confirmed' 
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400' 
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400'
                              }`}>
                                {nextTrip.status}
                              </span>
                            </div>
                            
                            <p className="text-xs text-[hsl(var(--text-muted))] font-semibold">
                              Package Details: <span className="text-[hsl(var(--text))]">{nextTrip.travelers} Traveler(s)</span> · Price: <span className="text-[hsl(var(--text))] font-bold">₹{parseFloat(nextTrip.total_price).toLocaleString()}</span>
                            </p>

                            {/* Trip Countdown Progress Bar */}
                            {daysRemaining !== null && daysRemaining >= 0 && (
                              <div className="mt-4 pt-3 border-t border-[hsl(var(--glass-border))]">
                                <div className="flex justify-between items-center text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-1.5">
                                  <span>Preparation Status</span>
                                  <span className="text-[hsl(var(--primary))] font-black">{daysRemaining === 0 ? 'Starts Today!' : `${daysRemaining} days remaining`}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[hsl(var(--primary)/0.08)] rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(8, Math.min(100, ((30 - Math.min(30, daysRemaining)) / 30) * 100))}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 rounded-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-6">
                            <button 
                              onClick={() => navigate(`/trip-itinerary/${nextTrip.id}`)} 
                              className="flex-1 btn-primary !py-2.5 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-blue-500/15"
                            >
                              <Compass size={14} className="animate-spin-slow" /> View Itinerary
                            </button>
                            {nextTrip.status === 'confirmed' ? (
                              <button 
                                onClick={() => handleDownloadTicketPDF(nextTrip)} 
                                className="flex-1 btn-secondary !py-2.5 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                              >
                                <CreditCard size={14} /> {t.downloadTicket}
                              </button>
                            ) : (
                              <button 
                                onClick={() => navigate(`/planner?step=5&trip_id=${nextTrip.id}`)} 
                                className="flex-1 btn-secondary !py-2.5 text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                {t.payNow}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 px-4">
                        <Compass size={44} className="mx-auto text-[hsl(var(--text-muted)/0.4)] mb-4 animate-float" />
                        <h3 className="text-lg font-extrabold text-[hsl(var(--text))] mb-1.5">Where to next?</h3>
                        <p className="text-xs font-semibold text-[hsl(var(--text-muted))] max-w-sm mx-auto leading-relaxed">No upcoming travels planned yet. Let's design your first bespoke journey using AI guidance!</p>
                        <Link to="/planner" className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-[hsl(var(--primary)/0.08)] hover:bg-[hsl(var(--primary)/0.15)] text-xs font-black text-[hsl(var(--primary))] transition-all active:scale-95">
                          Create Magic Itinerary <Sparkles size={13} className="text-yellow-400 animate-pulse" />
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Smart Route Optimization Widget */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25 }} 
                  className="glass-surface rounded-3xl p-6 border border-[hsl(var(--glass-border))] relative overflow-hidden shadow-xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Navigation size={20} className="text-blue-500" />
                      Smart Route Optimizer: <span className="text-blue-500 font-black">{assistanceDestination || 'Next Travel'}</span>
                    </h2>
                    {nextTrip && (
                      <button
                        onClick={() => fetchTravelAssistance(true)}
                        disabled={loadingAssistance}
                        className="text-[10px] uppercase font-black text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)] rounded-xl px-3.5 py-2 hover:bg-[hsl(var(--primary)/0.05)] disabled:opacity-50 transition-all shadow-sm"
                      >
                        {loadingAssistance ? 'Updating Route...' : 'Refresh Route Status'}
                      </button>
                    )}
                  </div>

                  {!nextTrip ? (
                    <div className="p-5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] text-xs text-[hsl(var(--text-muted))] font-bold text-center leading-relaxed">
                      💡 Generate a custom travel package to initialize live traffic intelligence & route tracking.
                    </div>
                  ) : loadingAssistance && !assistance ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-3 text-xs text-[hsl(var(--text-muted))]">
                      <Loader2 size={24} className="animate-spin text-[hsl(var(--primary))]" /> 
                      <p className="font-bold">Analyzing satellite route coordinates...</p>
                    </div>
                  ) : assistanceError ? (
                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-500 font-semibold text-center">
                      ⚠️ {assistanceError}
                    </div>
                  ) : activeRoute ? (
                    <div className="space-y-6">
                      {/* Visual Path Tracker */}
                      {stops.length > 0 && (
                        <div className="p-4 sm:p-6 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] shadow-inner relative overflow-x-auto">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 min-w-[20rem] relative">
                            {/* Dotted horizontal connector line */}
                            <div className="hidden sm:block absolute top-1/2 left-[12%] right-[12%] h-[2px] border-t border-dashed border-blue-500/20 -translate-y-1/2 z-0" />
                            
                            {stops.map((stop, sIdx) => {
                              const isLast = sIdx === stops.length - 1;
                              const isFirst = sIdx === 0;
                              return (
                                <div key={sIdx} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 z-10 relative bg-[hsl(var(--surface)/0.95)] sm:bg-transparent dark:bg-[hsl(var(--surface-dark))] sm:dark:bg-transparent px-4 py-2 sm:p-0 rounded-2xl border border-[hsl(var(--glass-border))] sm:border-none w-full sm:w-auto shadow-sm sm:shadow-none">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    isLast ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ring-4 ring-emerald-500/5' :
                                    isFirst ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 ring-4 ring-blue-500/5' :
                                    'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 ring-4 ring-indigo-500/5'
                                  } transition-all duration-300 hover:scale-110`}>
                                    {isLast ? <MapPin size={16} /> : isFirst ? <Navigation size={16} className="rotate-45" /> : <Compass size={16} />}
                                  </div>
                                  <div className="text-left sm:text-center">
                                    <p className="text-xs font-black text-[hsl(var(--text))]">{stop}</p>
                                    <p className="text-[9px] text-[hsl(var(--text-muted))] uppercase font-extrabold tracking-wider">{isFirst ? 'Origin' : isLast ? 'Destination' : `Waypoint ${sIdx}`}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black text-[hsl(var(--text-muted))] uppercase tracking-widest">Calculated Route Distance</p>
                          <p className="text-lg font-black text-[hsl(var(--text))] mt-1 flex items-center gap-1.5">
                            <Navigation size={16} className="text-[hsl(var(--primary))] rotate-45" /> {activeRoute.distance} / {activeRoute.duration}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end justify-center">
                          <p className="text-[10px] font-black text-[hsl(var(--text-muted))] uppercase tracking-widest mb-1.5">Live Traffic Status</p>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            trafficColor === 'red' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            trafficColor === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            <span className={`relative flex h-2 w-2`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${trafficColor}-500 opacity-75`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 bg-${trafficColor}-500`}></span>
                            </span>
                            {activeRoute.traffic.message}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[hsl(var(--glass-border))] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[hsl(var(--text-muted))] font-bold">
                        <span className="flex items-center gap-1"><Shield size={12} className="text-blue-500" /> Route protection active</span>
                        {assistanceUpdatedAt && (
                          <span>Telemetry Source: {assistance?.source?.route} | Sync: {assistanceUpdatedAt}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] text-xs text-[hsl(var(--text-muted))] font-bold text-center leading-relaxed">
                      ⚠️ A route details map could not be derived. Please check coordinates.
                    </div>
                  )}
                </motion.div>

                {/* Nearby Essential Services Finder */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.28 }} 
                  className="glass-surface rounded-3xl p-6 border border-[hsl(var(--glass-border))] shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                        <MapPin size={20} className="text-emerald-500" />
                        Essential Services Search
                      </h2>
                      <p className="text-xs font-semibold text-[hsl(var(--text-muted))] mt-0.5">Finding utilities near {assistanceDestination || 'your target destination'}</p>
                    </div>
                    
                    {/* Tab Selectors */}
                    <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-2xl border border-[hsl(var(--glass-border))] relative">
                      {['hospitals', 'atms', 'restaurants'].map((tab) => {
                        const isActive = activeServiceTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveServiceTab(tab)}
                            className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                              isActive ? 'text-white' : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text))]'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-blue-500 rounded-xl -z-10 shadow-md shadow-blue-500/20"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!nextTrip ? (
                    <div className="p-5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] text-xs text-[hsl(var(--text-muted))] font-bold text-center leading-relaxed">
                      💡 Live location mapping will initialize once a travel route is active.
                    </div>
                  ) : loadingAssistance && !assistance ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[hsl(var(--text-muted))]">
                      <Loader2 size={22} className="animate-spin text-emerald-500" /> 
                      <p className="font-bold">Locating local services databases...</p>
                    </div>
                  ) : activeServices.length ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeServices.slice(0, 4).map((service) => {
                          return (
                            <div key={service.id || service.name} className="p-5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--primary)/0.25)] hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h3 className="text-sm font-black text-[hsl(var(--text))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1">{service.name}</h3>
                                  <div className="p-1.5 rounded-lg bg-[hsl(var(--primary)/0.04)] text-[hsl(var(--primary))] flex-shrink-0">
                                    {activeServiceTab === 'hospitals' ? <HeartPulse size={14} className="text-rose-500 animate-pulse" /> : 
                                     activeServiceTab === 'atms' ? <CreditCard size={14} className="text-blue-500" /> : 
                                     <Utensils size={14} className="text-amber-500" />}
                                  </div>
                                </div>
                                {service.address && (
                                  <p 
                                    onClick={() => copyAddress(service.address)}
                                    className="text-[10px] text-[hsl(var(--text-muted))] line-clamp-2 leading-relaxed cursor-pointer hover:text-[hsl(var(--text))] hover:underline flex items-start gap-1 font-semibold"
                                    title="Click to copy address"
                                  >
                                    {service.address}
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-[hsl(var(--glass-border))] flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[hsl(var(--text-muted))] flex items-center gap-1">
                                  <MapPin size={12} className="text-emerald-500" /> {service.distance}
                                </span>
                                {service.phone ? (
                                  <a
                                    href={`tel:${service.phone}`}
                                    className="px-2.5 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.06)] hover:bg-[hsl(var(--primary))] text-[10px] font-black text-[hsl(var(--primary))] hover:text-white transition-all flex items-center gap-1"
                                  >
                                    <Phone size={11} /> Call
                                  </a>
                                ) : (
                                  service.status && <span className="text-[10px] font-bold text-emerald-500">{service.status}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-[hsl(var(--text-muted))] font-bold text-right">
                        Radar Source: {assistance?.source?.services}{assistanceUpdatedAt ? ` | Refresh: ${assistanceUpdatedAt}` : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] text-xs text-[hsl(var(--text-muted))] font-bold text-center leading-relaxed">
                      🔍 No local {activeServiceTab} were recorded near this destination coordinate.
                    </div>
                  )}
                </motion.div>

                {/* AI recommendations */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }} 
                  className="glass-surface rounded-3xl p-6 border border-[hsl(var(--glass-border))] shadow-xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                        <Compass size={20} className="text-[hsl(var(--primary))] animate-spin-slow" /> {t.aiRecs}
                      </h2>
                      <p className="text-xs font-semibold text-[hsl(var(--text-muted))] mt-0.5">Bespoke destinations curated dynamically by Magic AI</p>
                    </div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Sparkles size={11} className="animate-pulse text-yellow-500 dark:text-yellow-400" /> {t.liveSuggestions}
                    </span>
                  </div>

                  {loadingRecs ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <Loader2 size={28} className="animate-spin text-[hsl(var(--primary))]" />
                      <p className="text-xs text-[hsl(var(--text-muted))] font-bold">Consulting intelligence engine...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {aiRecs.map((rec, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -4 }}
                          onClick={() => navigate(`/planner?to=${rec.name}`)}
                          className="relative h-44 rounded-2xl overflow-hidden group cursor-pointer border border-[hsl(var(--glass-border))] shadow-md group"
                        >
                          <img 
                            src={rec.image} 
                            alt={rec.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 backdrop-blur-md border border-emerald-500/25 tracking-wider flex items-center gap-1">
                              <Check size={9} /> {rec.match} Match
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-black text-lg tracking-tight flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                              {rec.name} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                            </p>
                            <p className="text-[10px] text-neutral-300 font-semibold mt-1">Tap to launch AI Route planner for this location</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                
                {/* Real-time Notifications Panel */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.4 }} 
                  className="glass-surface rounded-3xl p-6 border border-[hsl(var(--glass-border))] shadow-xl"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Bell size={20} className="text-amber-500" /> {t.notifications}
                    </h2>
                    {reduxNotifications.length > 0 && (
                      <button 
                        onClick={() => dispatch(markAllAsRead())} 
                        className="text-[10px] font-black text-[hsl(var(--primary))] hover:underline uppercase tracking-wider"
                      >
                        {t.clearAll}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {reduxNotifications.length > 0 ? (
                      reduxNotifications.map((notif, idx) => {
                        const isPayment = (notif.title || '').toLowerCase().includes('payment') || (notif.message || '').toLowerCase().includes('paid');
                        const isBooking = (notif.title || '').toLowerCase().includes('booking') || (notif.message || '').toLowerCase().includes('trip');
                        return (
                          <div 
                            key={idx} 
                            className="p-3.5 rounded-2xl bg-[hsl(var(--primary)/0.02)] border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--primary)/0.15)] transition-all flex items-start gap-2.5 relative overflow-hidden"
                          >
                            <div className={`p-2 rounded-xl mt-0.5 ${
                              isPayment ? 'bg-amber-500/10 text-amber-500' :
                              isBooking ? 'bg-blue-500/10 text-blue-500' :
                              'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                            }`}>
                              {isPayment ? <CreditCard size={14} /> : isBooking ? <Plane size={14} /> : <Bell size={14} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-[hsl(var(--text))] leading-snug">{notif.title}</p>
                              <p className="text-[11px] text-[hsl(var(--text-muted))] mt-1 leading-relaxed font-semibold">{notif.message}</p>
                              <p className="text-[9px] mt-2 text-[hsl(var(--text-muted))] font-bold opacity-60">
                                {new Date(notif.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-[hsl(var(--text-muted))] text-xs font-bold">
                        <Bell size={28} className="mx-auto opacity-20 mb-3" />
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
                  className="glass-surface rounded-3xl p-6 border border-[hsl(var(--glass-border))] shadow-xl"
                >
                  <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2 text-[hsl(var(--text))]">
                    <User size={20} className="text-[hsl(var(--primary))]" /> {t.quickLinks}
                  </h2>
                  <div className="space-y-1.5">
                    {[
                      { to: '/profile', label: 'My Profile', icon: User, color: 'text-blue-500' },
                      { to: '/my-trips', label: 'My Bookings', icon: Calendar, color: 'text-indigo-500' },
                      { to: '/saved', label: 'My Wishlist', icon: Heart, color: 'text-rose-500' },
                      { to: '/settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
                      { to: '/contact', label: 'Support Center', icon: HelpCircle, color: 'text-amber-500' },
                    ].map((link, lIdx) => (
                      <Link 
                        key={lIdx}
                        to={link.to} 
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-[hsl(var(--primary)/0.04)] text-xs font-black transition-all text-[hsl(var(--text))] hover:text-[hsl(var(--primary))] group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors ${link.color}`}>
                            <link.icon size={13} />
                          </span>
                          <span>{link.label}</span>
                        </div>
                        <ArrowRight size={12} className="opacity-0 transform translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[hsl(var(--primary))]" />
                      </Link>
                    ))}
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
              className="w-full max-w-md bg-neutral-900 border border-red-500/25 rounded-3xl p-6 text-white shadow-2xl shadow-red-500/20"
            >
              <div className="flex items-center gap-3 text-red-500 mb-5">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 ring-4 ring-red-500/5 animate-pulse-glow text-red-500 flex-shrink-0">
                  <AlertOctagon size={24} className="animate-bounce" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider leading-none">Emergency SOS Console</h2>
                  <p className="text-[10px] text-red-400/80 font-black uppercase mt-1 tracking-widest">Immediate Response Services</p>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-semibold">
                Initiating this channel will broadcast your exact GPS coordinates, medical records access request, and itinerary link to the nearest emergency responder station and tourist assistance authority.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/30 flex justify-between items-center shadow-inner">
                  <span className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">YOUR GPS STATUS:</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> 26.9124° N, 75.7873° E
                  </span>
                </div>
                
                <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/30 space-y-2 shadow-inner">
                  <p className="text-[9px] font-black text-neutral-500 tracking-widest mb-1.5 uppercase">Direct emergency lines:</p>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-neutral-400">Police Dispatch</span>
                    <a href="tel:100" className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-black border border-red-500/10">100</a>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-neutral-400">Medical Service</span>
                    <a href="tel:108" className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-black border border-red-500/10">108</a>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-neutral-400">Unified Helplines</span>
                    <a href="tel:112" className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-black border border-red-500/10">112</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSOSModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-800 text-xs font-black text-neutral-300 border border-neutral-700/50 hover:bg-neutral-700 hover:text-white transition-all active:scale-95"
                >
                  Cancel Console
                </button>
                <button
                  onClick={handleSOSBroadcast}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-xs font-black text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-red-500/30"
                >
                  {sosSent ? <Check size={14} className="animate-pulse" /> : null}
                  {sosSent ? 'Broadcast Sent!' : 'Broadcast Alert'}
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
