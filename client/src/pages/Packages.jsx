import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Users, Calendar, ArrowRight, Search, X, ShieldAlert, Sparkles, CreditCard, Compass } from 'lucide-react';
import { FaUmbrellaBeach, FaMountain, FaCity, FaTree } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { listingAPI, tripAPI, paymentAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const categories = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'beach', label: 'Beach', icon: FaUmbrellaBeach },
  { id: 'adventure', label: 'Adventure', icon: FaMountain },
  { id: 'heritage', label: 'Heritage', icon: FaCity },
  { id: 'nature', label: 'Nature', icon: FaTree },
];

const Packages = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  
  // Auth state
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  // Booking Modal State
  const [bookingPackage, setBookingPackage] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    travelerName: '',
    fromLocation: '',
    departureDate: '',
    travelers: 1,
    specialRequests: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const selectedPkgDetails = useMemo(() => {
    if (!selectedPackageId) return null;
    return packages.find(p => p.id === selectedPackageId) || null;
  }, [selectedPackageId, packages]);

  // Simple rich text / markdown renderer for itinerary
  const renderRichItinerary = (text) => {
    if (!text || !text.trim()) {
      return (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
          📌 No day-wise itinerary details have been added for this package yet. Please contact the travel agency for custom planning!
        </div>
      );
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Header check: e.g. Day 1, ### Day 1, or starts with #
          if (trimmed.startsWith('#') || /^day\s+\d+/i.test(trimmed)) {
            const cleanText = trimmed.replace(/^#+\s*/, '');
            return (
              <h4 key={idx} className="text-sm font-black text-[hsl(var(--primary))] flex items-center gap-2 mt-4 first:mt-0">
                <span className="w-1.5 h-4 rounded-full bg-[hsl(var(--primary))]" /> {cleanText}
              </h4>
            );
          }

          // Bullet point check
          if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
            const cleanText = trimmed.substring(1).trim();
            return (
              <li key={idx} className="text-xs text-[hsl(var(--text-muted))] list-disc pl-4 ml-2 leading-relaxed">
                {parseBoldText(cleanText)}
              </li>
            );
          }

          // Default paragraph
          return (
            <p key={idx} className="text-xs text-[hsl(var(--text))] leading-relaxed">
              {parseBoldText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const parseBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|<b>.*?<\/b>)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-[hsl(var(--text))]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        return <strong key={i} className="font-extrabold text-[hsl(var(--text))]">{part.slice(3, -4)}</strong>;
      }
      return part;
    });
  };

  useEffect(() => {
    const loadPackages = () => {
      listingAPI.getPackages()
        .then((res) => setPackages(res.data || []))
        .catch((err) => console.error('Failed to load packages', err));
    };

    loadPackages();
    const interval = setInterval(loadPackages, 15000);

    let echoInstance = null;
    import('../services/echo').then(({ default: echo }) => {
      echoInstance = echo;
      const channel = echo.channel('packages');
      
      channel.listen('.PackageUpdated', (data) => {
        console.log('Real-time package update received:', data);
        const { action, packageData } = data;
        
        setPackages((prev) => {
          if (action === 'delete') {
            return prev.filter(p => p.id !== packageData.id);
          }
          if (action === 'create') {
            if (packageData.status === 'Inactive') return prev;
            if (prev.some(p => p.id === packageData.id)) return prev;
            return [packageData, ...prev];
          }
          if (action === 'update') {
            if (packageData.status === 'Inactive') {
              return prev.filter(p => p.id !== packageData.id);
            }
            const exists = prev.some(p => p.id === packageData.id);
            if (exists) {
              return prev.map(p => p.id === packageData.id ? { ...p, ...packageData } : p);
            } else {
              return [packageData, ...prev];
            }
          }
          return prev;
        });
      });
    }).catch(err => {
      console.error('Failed to initialize Echo inside Packages:', err);
    });

    return () => {
      clearInterval(interval);
      if (echoInstance) {
        echoInstance.channel('packages').stopListening('.PackageUpdated');
      }
    };
  }, []);

  const filtered = packages.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenBooking = (pkg) => {
    if (!user) {
      toast.error('Please log in to book a package.');
      navigate('/login');
      return;
    }
    setBookingPackage(pkg);
    setBookingForm({
      travelerName: user.name || '',
      fromLocation: '',
      departureDate: '',
      travelers: 1,
      specialRequests: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  // Helper to calculate return date
  const returnDate = useMemo(() => {
    if (!bookingForm.departureDate || !bookingPackage?.duration) return '';
    const match = bookingPackage.duration.match(/(\d+)\s*day/i);
    const durationDays = match ? Math.max(1, parseInt(match[1])) : 3;
    const nextReturn = new Date(bookingForm.departureDate);
    nextReturn.setDate(nextReturn.getDate() + durationDays - 1);
    return nextReturn.toISOString().slice(0, 10);
  }, [bookingForm.departureDate, bookingPackage]);

  // Pricing calculations
  const subtotal = bookingPackage ? Number(bookingPackage.price || 0) * bookingForm.travelers : 0;
  const tax = Math.round(subtotal * 0.05);
  const discount = subtotal > 20000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax - discount;

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.travelerName.trim()) return toast.error('Please enter traveler name.');
    if (!bookingForm.departureDate) return toast.error('Please select departure date.');

    setBookingLoading(true);
    const toastId = toast.loading('Confirming your package booking...');

    try {
      const payload = {
        traveler_name: bookingForm.travelerName.trim(),
        from_location: bookingForm.fromLocation,
        to_destination: bookingPackage.destination,
        departure_date: bookingForm.departureDate,
        return_date: returnDate,
        travelers: bookingForm.travelers,
        agency_package_id: bookingPackage.id,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total_price: total,
        status: 'pending',
        special_requests: bookingForm.specialRequests,
      };

      const res = await tripAPI.create(payload);
      const tripId = res.data.data.id;

      toast.loading('Redirecting to payment gateway...', { id: toastId });
      const { data: checkoutRes } = await paymentAPI.createCheckoutSession(tripId);
      window.location.href = checkoutRes.url;
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to book package. Please try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Travel Packages</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Curated Travel Experiences</h1>
          <p className="text-[hsl(var(--text-muted))] max-w-xl mx-auto">Handpicked packages with hotels, meals, transport, and guides — all at the best prices.</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 flex items-center glass-surface rounded-2xl px-4 py-3">
            <Search size={18} className="text-[hsl(var(--text-muted))] mr-3" />
            <input type="text" placeholder="Search packages..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                    : 'glass-surface hover:bg-[hsl(var(--primary)/0.1)]'
                }`}>
                <cat.icon size={14} /> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg, idx) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
              className="glass-surface rounded-3xl overflow-hidden card-hover group flex flex-col justify-between">
              <div className="relative h-48 overflow-hidden shrink-0">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {Number(pkg.rating || 5.0).toFixed(1)}
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-black text-lg">{pkg.name}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1"><MapPin size={11} /> {pkg.destination}</p>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4 text-xs text-[hsl(var(--text-muted))] font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {pkg.duration}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {pkg.reviews} reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(pkg.includes || []).map((item, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <p className="text-xl font-black text-[hsl(var(--primary))] font-mono">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-[10px] text-[hsl(var(--text-muted))]">per person</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setSelectedPackageId(pkg.id)} className="btn-secondary !py-2 !px-3.5 text-xs">
                      Details
                    </button>
                    <button onClick={() => handleOpenBooking(pkg)} className="btn-primary !py-2 !px-3.5 text-xs flex items-center gap-1">
                      Book <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {!filtered.length && (
          <div className="glass-surface rounded-2xl p-10 text-center text-sm text-[hsl(var(--text-muted))]">
            No travel packages are available yet.
          </div>
        )}
      </div>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {bookingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-surface max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden"
            >
              <button
                onClick={() => setBookingPackage(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="mb-5">
                <p className="text-[hsl(var(--primary))] font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="animate-pulse" /> Confirm Package Booking
                </p>
                <h3 className="text-xl font-black">{bookingPackage.name}</h3>
                <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1"><MapPin size={11} /> {bookingPackage.destination}</p>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Traveler Name</label>
                  <input
                    type="text"
                    name="travelerName"
                    value={bookingForm.travelerName}
                    onChange={handleFormChange}
                    placeholder="Full name as on ID"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">From Location</label>
                    <input
                      type="text"
                      name="fromLocation"
                      value={bookingForm.fromLocation}
                      onChange={handleFormChange}
                      placeholder="Departure City"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Number of Travelers</label>
                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      max="15"
                      value={bookingForm.travelers}
                      onChange={handleFormChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Departure Date</label>
                    <input
                      type="date"
                      name="departureDate"
                      min={today}
                      value={bookingForm.departureDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500 opacity-60">Return Date (Auto)</label>
                    <input
                      type="date"
                      value={returnDate}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-slate-500">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={bookingForm.specialRequests}
                    onChange={handleFormChange}
                    placeholder="e.g. Dietary preferences, room requests..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                  />
                </div>

                {/* Price summary block */}
                <div className="bg-[hsl(var(--primary)/0.04)] border border-[hsl(var(--primary)/0.1)] rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Cost ({bookingForm.travelers} traveler{bookingForm.travelers > 1 ? 's' : ''})</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Package Discount (10%)</span>
                      <span className="font-bold">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[hsl(var(--text))]">
                    <span>Total Price</span>
                    <span className="text-[hsl(var(--primary))]">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 btn-primary py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                  >
                    {bookingLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={14} /> Confirm Booking
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingPackage(null)}
                    className="flex-1 btn-secondary py-3 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Package Details & Itinerary Modal */}
      <AnimatePresence>
        {selectedPkgDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-surface max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative"
            >
              {/* Cover Image */}
              <div className="relative h-64 w-full">
                <img
                  src={selectedPkgDetails.image}
                  alt={selectedPkgDetails.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <button
                  onClick={() => setSelectedPackageId(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-wider">
                    {selectedPkgDetails.category} Experience
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mt-2">{selectedPkgDetails.name}</h2>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {selectedPkgDetails.destination} · <Calendar size={12} /> {selectedPkgDetails.duration}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 max-h-[45vh] overflow-y-auto custom-scrollbar">
                {/* Services Inclusions */}
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-3">Package Inclusions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Hotel Stay', 'Meals Plan', 'Transit Services', 'Local Tour Guide'].map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary */}
                <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-5">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Compass size={14} className="text-[hsl(var(--primary))]" /> Day-wise Tour Itinerary
                  </h3>
                  <div className="bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-850">
                    {renderRichItinerary(selectedPkgDetails.itinerary)}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Price</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[hsl(var(--primary))]">₹{selectedPkgDetails.price.toLocaleString()}</span>
                    <span className="text-xs text-[hsl(var(--text-muted))]">per person</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedPackageId(null);
                      handleOpenBooking(selectedPkgDetails);
                    }}
                    className="flex-1 sm:flex-initial btn-primary py-3 px-6 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                  >
                    Book Now <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedPackageId(null)}
                    className="flex-1 sm:flex-initial btn-secondary py-3 px-6 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Packages;
