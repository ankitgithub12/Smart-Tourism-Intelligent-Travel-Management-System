import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Plane, Compass, Heart, CreditCard, Clock, Bell, User, Loader2, Calendar, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api, { favoritesAPI, aiAPI } from '../../services/api';
import { markAllAsRead } from '../../redux/notificationsSlice';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

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

  useEffect(() => {
    fetchDashboardData();
    fetchAIRecommendations();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch user trips
      const tripsRes = await api.get('/trips');
      setTrips(tripsRes.data.data || []);

      // 2. Fetch user favorites
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
      
      replyText = replyText.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

      const startIdx = replyText.indexOf('[');
      const endIdx = replyText.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        replyText = replyText.substring(startIdx, endIdx + 1);
      }
      
      const parsed = JSON.parse(replyText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiRecs(parsed);
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch {
      // Fallback recommendations if AI service is temporarily offline/busy
      setAiRecs([
        { name: 'Munnar, Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format', match: '98%' },
        { name: 'Havelock Island, Andaman', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format', match: '95%' }
      ]);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Calculations for Realtime Stats
  const todayStr = new Date().toISOString().split('T')[0];
  
  const confirmedTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'completed');
  const upcomingTripsCount = confirmedTrips.filter(t => t.departure_date >= todayStr).length;
  const pastTripsCount = confirmedTrips.filter(t => t.departure_date < todayStr).length;
  const totalSpent = confirmedTrips.reduce((acc, t) => acc + parseFloat(t.total_price), 0);

  // Identify next adventure (earliest upcoming confirmed trip, or fallback to pending trip)
  const sortedUpcoming = [...trips]
    .filter(t => t.status === 'confirmed' && t.departure_date >= todayStr)
    .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    
  const nextTrip = sortedUpcoming[0] || trips.find(t => t.status === 'pending');

  const stats = [
    { label: 'Upcoming Trips', value: upcomingTripsCount, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Past Trips', value: pastTripsCount, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Saved Places', value: favoritesCount, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  // Helper function to dynamically pull a destination image
  const getDestinationImage = (destName) => {
    const query = destName?.toLowerCase() || '';
    if (query.includes('goa')) return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500';
    if (query.includes('jaipur')) return 'https://images.unsplash.com/photo-1477584322904-486a88530bc2?w=500';
    if (query.includes('agra') || query.includes('taj')) return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500';
    if (query.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500';
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500'; // Default beautiful travel photo
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              Welcome Back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-500">{user?.name || 'Traveler'}</span>!
            </h1>
            <p className="text-[hsl(var(--text-muted))] text-sm">Here is a real-time status of your trips, plans, and AI suggestions.</p>
          </div>
          <Link to="/planner" className="btn-primary !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-indigo-500/15">
            <Map size={16} /> Plan New Trip
          </Link>
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
                    <Plane size={20} className="text-blue-500 animate-pulse" /> Next Adventure
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
                            Manage Booking
                          </button>
                          {nextTrip.status === 'confirmed' ? (
                            <button 
                              onClick={() => handleDownloadTicketPDF(nextTrip)} 
                              className="flex-1 btn-secondary !py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5"
                            >
                              Download Ticket
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/planner?step=5&trip_id=${nextTrip.id}`)} 
                              className="flex-1 btn-secondary !py-2.5 text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                            >
                              ⚡ Pay Now
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

                {/* AI Suggestions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }} 
                  className="glass-surface rounded-3xl p-6 border border-white/5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-[hsl(var(--text))]">
                      <Compass size={20} className="text-[hsl(var(--primary))]" /> AI Travel Recommendations
                    </h2>
                    <span className="text-[10px] uppercase font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" /> Live suggestions
                    </span>
                  </div>

                  {loadingRecs ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 size={24} className="animate-spin text-[hsl(var(--primary))]" />
                      <p className="text-[10px] text-[hsl(var(--text-muted))]">Gemini generating personalized locations...</p>
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
                            <p className="text-[9px] text-emerald-400 font-extrabold mt-0.5">{rec.match} Match Match Score</p>
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
                      <Bell size={20} className="text-amber-500" /> Notifications
                    </h2>
                    {reduxNotifications.length > 0 && (
                      <button 
                        onClick={() => dispatch(markAllAsRead())} 
                        className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline"
                      >
                        Clear All
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
                        No new notifications.
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
                    <User size={20} className="text-[hsl(var(--primary))]" /> Quick Links
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
    </div>
  );
};

export default TouristDashboard;
