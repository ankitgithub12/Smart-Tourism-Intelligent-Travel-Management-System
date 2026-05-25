import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Hotel, UtensilsCrossed, Car, UserCheck, Bike, CheckCircle, ArrowRight, ArrowLeft, Download, Save, CreditCard, Star, Sparkles, AlertCircle, Leaf, Flame, Sprout } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api, { aiAPI, tripAPI } from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { parseAIJsonObject } from '../utils/parseAIResponse';

const steps = ['Hotel', 'Food', 'Cab', 'Guide', 'Vehicle', 'Summary'];

const foodThemes = {
  'Vegetarian': {
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    borderColor: 'border-emerald-500',
    selectedBg: 'bg-emerald-500/5',
    glow: 'shadow-[0_8px_30px_rgb(16_185_129/0.15)]',
    desc: 'Fresh and nutritious plant-based lacto-vegetarian meals.',
    badge: '100% Lacto-Veg'
  },
  'Non-Vegetarian': {
    icon: Flame,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    borderColor: 'border-rose-500',
    selectedBg: 'bg-rose-500/5',
    glow: 'shadow-[0_8px_30px_rgb(244_63_94/0.15)]',
    desc: 'Delicious traditional meat, poultry, and seafood options.',
    badge: 'Traditional Cuisine'
  },
  'Vegan': {
    icon: Sprout,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    borderColor: 'border-teal-500',
    selectedBg: 'bg-teal-500/5',
    glow: 'shadow-[0_8px_30px_rgb(20_184_166/0.15)]',
    desc: '100% dairy-free and cruelty-free animal-product-free meals.',
    badge: 'Plant-Powered'
  }
};

const getFoodTheme = (label) => {
  const normalized = String(label).toLowerCase();
  if (normalized.includes('vegan')) return foodThemes['Vegan'];
  if (normalized.includes('non')) return foodThemes['Non-Vegetarian'];
  return foodThemes['Vegetarian'];
};

const TripPlanner = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [travelerName, setTravelerName] = useState('');
  const [depDate, setDepDate] = useState('');
  const [retDate, setRetDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [started, setStarted] = useState(false);
  const [budgetAlerted, setBudgetAlerted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [cabOptions, setCabOptions] = useState([]);
  const [guides, setGuides] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Selections
  const [wantHotel, setWantHotel] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [wantFood, setWantFood] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [wantCab, setWantCab] = useState(null);
  const [selectedCab, setSelectedCab] = useState(null);
  const [wantGuide, setWantGuide] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [wantVehicle, setWantVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    tripAPI.options()
      .then((res) => {
        setPackages(res.data.packages || []);
        setHotels(res.data.hotels || []);
        setFoodOptions(res.data.foodOptions || []);
        setCabOptions(res.data.cabOptions || []);
        setGuides(res.data.guides || []);
        setVehicles(res.data.vehicles || []);

        const packageId = searchParams.get('package_id');
        if (packageId) {
          const pkg = (res.data.packages || []).find(item => String(item.id) === String(packageId));
          if (pkg) {
            setSelectedPackage(pkg);
            setTo(pkg.destination);
          }
        }
      })
      .catch((err) => console.error('Failed to load trip options', err));
  }, [searchParams]);

  useEffect(() => {
    if (!depDate || !selectedPackage?.duration_days) return;
    const nextReturn = new Date(depDate);
    nextReturn.setDate(nextReturn.getDate() + Number(selectedPackage.duration_days) - 1);
    setRetDate(nextReturn.toISOString().slice(0, 10));
  }, [depDate, selectedPackage]);

  const nights = depDate && retDate ? Math.max(1, Math.ceil((new Date(retDate) - new Date(depDate)) / 86400000)) : 3;
  const days = nights + 1;

  const packageCost = selectedPackage ? Number(selectedPackage.price || 0) * travelers : 0;
  const hotelCost = selectedHotel ? selectedHotel.price * nights : 0;
  const foodCost = selectedFood ? selectedFood.price * days * travelers : 0;
  const cabCost = selectedCab ? selectedCab.price * travelers : 0;
  const guideCost = selectedGuide ? selectedGuide.price * days : 0;
  const vehicleCost = selectedVehicle ? selectedVehicle.price * days : 0;

  const subtotal = packageCost + hotelCost + foodCost + cabCost + guideCost + vehicleCost;
  const tax = Math.round(subtotal * 0.05);
  const discount = subtotal > 20000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax - discount;

  useEffect(() => {
    if (started && total > budget) {
      if (!budgetAlerted) {
        toast.error(`⚠️ Budget Limit Exceeded! Your current selections total ₹${total.toLocaleString()}, exceeding your limit of ₹${budget.toLocaleString()}.`, {
          duration: 6000,
          id: 'budget-warning'
        });
        setBudgetAlerted(true);
      }
    } else {
      setBudgetAlerted(false);
    }
  }, [total, budget, started, budgetAlerted]);

  const next = () => { if (step < 5) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const validateStartFields = () => {
    if (!travelerName.trim()) return 'Please enter traveler name.';
    if (!to.trim()) return 'Please enter destination.';
    if (!depDate || depDate < today) return 'Departure date cannot be in the past.';
    if (!retDate || retDate <= depDate) return 'Return date must be after departure date.';
    return null;
  };

  const buildTripData = () => ({
    traveler_name: travelerName.trim(),
    from_location: from,
    to_destination: to,
    departure_date: depDate,
    return_date: retDate,
    travelers,
    agency_package_id: selectedPackage?.id,
    hotel_id: selectedHotel?.id,
    food_package_id: selectedFood?.id,
    cab_service_id: selectedCab?.is_agency_vehicle ? null : selectedCab?.id,
    agency_guide_id: selectedGuide?.id,
    agency_vehicle_id: selectedVehicle?.id || (selectedCab?.is_agency_vehicle ? selectedCab.vehicle_id : null),
    subtotal,
    tax,
    discount,
    total_price: total,
  });

  const startManualPlanning = () => {
    const error = validateStartFields();
    if (error) {
      toast.error(error);
      return;
    }
    setStarted(true);
  };

  // AI Planner Auto-fill
  const handleAISuggest = async () => {
    const fieldError = validateStartFields();
    if (fieldError) {
      toast.error(fieldError);
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading('✨ Gemini AI is analyzing options for your itinerary...');
    try {
      const hotelsText = hotels.map((h, i) => `- Option ${i + 1}: ${h.name} (${h.stars} stars, ID: ${h.id}, price: ₹${h.price} per night)`).join('\n');
      const foodText = foodOptions.map((f, i) => `- Option ${i + 1}: ${f.label} (ID: ${f.id}, price: ₹${f.price} per day)`).join('\n');
      const cabsText = cabOptions.map((c, i) => `- Option ${i + 1}: ${c.label} (ID: ${c.id}, price: ₹${c.price} per person)`).join('\n');
      const guidesText = guides.map((g, i) => `- Option ${i + 1}: ${g.name} (${g.type}, ID: ${g.id}, price: ₹${g.price} per day)`).join('\n');
      const vehiclesText = vehicles.map((v, i) => `- Option ${i + 1}: ${v.type} (${v.model}, ID: ${v.id}, price: ₹${v.price} per day)`).join('\n');

      const prompt = `I want to plan a trip from "${from}" to "${to}" from ${depDate} to ${retDate} for ${travelers} travelers with a budget of ₹${budget}.
Please customize my trip by selecting the best options from our available services:
Hotels:
${hotelsText}

Food options:
${foodText}

Cab options:
${cabsText}

Guides:
${guidesText}

Vehicles:
${vehiclesText}

Select exactly one option for each category (Hotel, Food, Cab, Guide, Vehicle) to keep the total cost within the budget of ₹${budget}. If the budget is very low, do not select expensive options or suggest null (false/null) for some categories.
Return ONLY a valid JSON object matching the following schema:
{
  "hotel_id": [hotel ID number/null],
  "food_id": [food ID number/null],
  "cab_id": [cab ID number/null],
  "guide_id": "[guide ID string/null]",
  "vehicle_id": "[vehicle ID string/null]",
  "plan_summary": "detailed summary explaining this customization, cost logic, and destination advice"
}
Return raw JSON only, no markdown, no backticks, no code fence.`;

      const res = await aiAPI.chat(prompt);
      const replyText = res.data?.reply || res.data || '';

      const parsed = parseAIJsonObject(replyText);

      // Pre-fill
      if (parsed.hotel_id) {
        setWantHotel(true);
        setSelectedHotel(hotels.find(h => String(h.id) === String(parsed.hotel_id)) || null);
      } else {
        setWantHotel(false);
        setSelectedHotel(null);
      }

      if (parsed.food_id) {
        setWantFood(true);
        setSelectedFood(foodOptions.find(f => String(f.id) === String(parsed.food_id)) || null);
      } else {
        setWantFood(false);
        setSelectedFood(null);
      }

      if (parsed.cab_id) {
        setWantCab(true);
        setSelectedCab(cabOptions.find(c => String(c.id) === String(parsed.cab_id)) || null);
      } else {
        setWantCab(false);
        setSelectedCab(null);
      }

      if (parsed.guide_id) {
        setWantGuide(true);
        setSelectedGuide(guides.find(g => String(g.id) === String(parsed.guide_id)) || null);
      } else {
        setWantGuide(false);
        setSelectedGuide(null);
      }

      if (parsed.vehicle_id) {
        setWantVehicle(true);
        setSelectedVehicle(vehicles.find(v => String(v.id) === String(parsed.vehicle_id)) || null);
      } else {
        setWantVehicle(false);
        setSelectedVehicle(null);
      }

      setAiSummary(parsed.plan_summary || 'Custom AI trip configuration complete.');
      setStarted(true);
      setStep(5); // Go straight to review
      toast.success('✨ Gemini AI has customized your plan!', { id: toastId });
    } catch (err) {
      console.error('AI parsing error:', err);
      toast.error('AI planning failed. Proceeding manually.', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      toast.loading('Preparing your checkout session...', { id: 'checkout' });

      const tripData = buildTripData();

      const { data: tripRes } = await api.post('/trips', tripData);
      const tripId = tripRes.data.id;

      // Redirect to Stripe checkout
      const { data: checkoutRes } = await api.post('/trips/checkout', { trip_id: tripId });
      toast.success('Redirecting to secure gateway...', { id: 'checkout' });
      window.location.href = checkoutRes.url;
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Please log in to book your trip!';
      toast.error(msg, { id: 'checkout' });
    }
  };

  const handleSave = async () => {
    try {
      toast.loading('Saving your itinerary...', { id: 'save-trip' });

      const tripData = buildTripData();

      await api.post('/trips', tripData);
      toast.success('Itinerary saved successfully! View it in your dashboard.', { id: 'save-trip' });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Please log in to save your itinerary!';
      toast.error(msg, { id: 'save-trip' });
    }
  };

  const handleDownloadPDF = () => {
    try {
      toast.loading('Generating PDF itinerary...', { id: 'pdf' });
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
      doc.text(`PLAN DATED: ${new Date().toLocaleDateString('en-IN')}`, 18, 38);
      doc.text(`PRINTED ON: ${new Date().toLocaleString('en-IN')}`, 18, 44);

      // Top Right: Booking ID Block
      doc.setFillColor(...primaryBlue);
      doc.rect(140, 15, 52, 31, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('PLAN ID', 145, 21);
      doc.setFontSize(13);
      doc.text('#ST-DRAFT', 145, 28);
      doc.setFontSize(8);
      doc.setTextColor(220, 220, 255);
      doc.text('STATUS: PLAN DRAFT', 145, 36);
      doc.text('PAYMENT: PENDING', 145, 42);

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

      const passengerName = travelerName || 'Guest Traveler';
      const formattedDep = depDate ? new Date(depDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      const formattedRet = retDate ? new Date(retDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
      const durationDays = `${days} Days / ${nights} Nights`;

      writeLeftField('Passenger Name', passengerName);
      writeLeftField('Departure Station', from || 'Not Specified');
      writeLeftField('Destination', to || 'Not Specified');
      writeLeftField('Departure Date', formattedDep);
      writeLeftField('Return Date', formattedRet);
      writeLeftField('Travelers Count', `${travelers} Traveler(s) (${durationDays})`);

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

      const packageName = selectedPackage?.name || 'Custom Self-Planned Trip';
      const hotelName = selectedHotel ? `${selectedHotel.name} (${selectedHotel.stars} Stars)` : 'Self Arranged / No Hotel';
      const hotelAddress = selectedHotel ? `Cost: INR ${hotelCost.toLocaleString()} (${nights} nights)` : '';

      // Cab / transit service
      let cabDetails = 'Self Arranged / No Cab';
      let cabDriver = '';
      if (selectedCab) {
        cabDetails = selectedCab.label || 'Transit Cab';
        cabDriver = `Cost: INR ${cabCost.toLocaleString()}`;
      }

      // Guide details
      let guideDetails = 'Not Requested';
      let guideSpecialty = '';
      if (selectedGuide) {
        guideDetails = selectedGuide.name;
        guideSpecialty = `Cost: INR ${guideCost.toLocaleString()} (${days} days)`;
      }

      // Rental Vehicle
      let rentalDetails = 'Not Requested';
      if (selectedVehicle) {
        rentalDetails = `${selectedVehicle.type} (${selectedVehicle.model})`;
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
      doc.text('ESTIMATED TOTAL', 140, 231);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`INR ${subtotal.toLocaleString()}`, 22, 238);
      doc.text(`INR ${tax.toLocaleString()}`, 58, 238);
      doc.text(`INR ${discount.toLocaleString()}`, 98, 238);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryBlue);
      doc.text(`INR ${total.toLocaleString()}`, 140, 238);

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
      doc.text(`*ST-DRAFT-${depDate ? String(depDate).slice(0, 10) : ''}*`, 15, 270);

      // Travel Agency & Contact details in footer
      const agencyName = selectedPackage?.agency?.name 
        || selectedGuide?.agency?.name 
        || selectedVehicle?.agency?.name 
        || 'Smart Tourism Travel Authority';
      const agencyEmail = selectedPackage?.agency?.email 
        || selectedGuide?.agency?.email 
        || selectedVehicle?.agency?.email 
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
      doc.save(`Itinerary_${to || 'Trip'}.pdf`);
      toast.success('Itinerary PDF downloaded successfully!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF.', { id: 'pdf' });
    }
  };

  // Start Form Screen
  if (!started) {
    return (
      <div className="min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background)/0.9)] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="text-[hsl(var(--primary))] font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="animate-pulse" /> AI ITINERARY GENERATOR
            </p>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600">
              Plan Your Dream Trip
            </h1>
            <p className="text-[hsl(var(--text-muted))] max-w-md mx-auto text-sm">
              Enter your dates and budget. Choose between a guided customization wizard or instant AI planning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-surface rounded-3xl p-6 md:p-8 shadow-2xl border border-white/5 relative overflow-hidden"
          >
            {/* Ambient Background Blur inside the card */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[hsl(var(--primary))] opacity-10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 relative z-10">
              {packages.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Package Booking</label>
                  <select
                    value={selectedPackage?.id || ''}
                    onChange={(e) => {
                      const pkg = packages.find(item => String(item.id) === e.target.value) || null;
                      setSelectedPackage(pkg);
                      if (pkg) setTo(pkg.destination);
                    }}
                    className="w-full glass-surface rounded-xl px-4 py-3 border border-white/5 bg-transparent text-sm outline-none"
                  >
                    <option value="">Custom trip planning</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name} · {pkg.duration} · ₹{Number(pkg.price).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Traveler Name</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Users size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="text" value={travelerName} onChange={e => setTravelerName(e.target.value)} placeholder="Name on booking" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">From Location</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <MapPin size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="City of departure" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">To Destination</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <MapPin size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Destination" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Departure Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Calendar size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="date" min={today} value={depDate} onChange={e => setDepDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Return Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Calendar size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="date" min={depDate || today} value={retDate} onChange={e => setRetDate(e.target.value)} disabled={Boolean(selectedPackage?.duration_days)} className="w-full bg-transparent text-sm outline-none disabled:opacity-70" />
                </div>
                {selectedPackage?.duration_days && <p className="text-[10px] text-[hsl(var(--primary))] font-bold mt-1">Auto-calculated from fixed package duration: {selectedPackage.duration}</p>}
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Travelers</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Users size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="number" min="1" max="25" value={travelers} onChange={e => setTravelers(+e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Total Budget (₹)</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all justify-between">
                  <div className="flex items-center flex-1 mr-3">
                    <DollarSign size={18} className="text-[hsl(var(--primary))] mr-2" />
                    <input type="range" min="5000" max="200000" step="5000" value={budget} onChange={e => setBudget(+e.target.value)} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]" />
                  </div>
                  <span className="text-sm font-extrabold text-[hsl(var(--primary))] whitespace-nowrap">₹{budget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                onClick={startManualPlanning}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-700 text-white font-extrabold text-base hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Manual Wizard <ArrowRight size={18} />
              </button>
              <button
                onClick={handleAISuggest}
                disabled={aiLoading}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-black text-base hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {aiLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Planning...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="animate-bounce" /> Magic AI Auto-Fill
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active Wizard Screen
  return (
    <div className="min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--background)/0.95)]">
      <div className="max-w-4xl mx-auto">

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4 scrollbar-thin">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 relative ${i < step
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md'
                    : i === step
                      ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110'
                      : 'glass-surface text-[hsl(var(--text-muted))] border border-white/5'
                  }`}
              >
                {i < step ? <CheckCircle size={18} /> : i + 1}
                {i === step && <div className="absolute -inset-1 rounded-full border-2 border-[hsl(var(--primary))] opacity-50 animate-ping" />}
              </button>
              <span className={`ml-2.5 text-xs font-black uppercase tracking-wider hidden sm:block ${i === step ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--text-muted))] opacity-60'}`}>{s}</span>
              {i < 5 && <div className={`w-8 md:w-16 h-0.5 mx-3 ${i < step ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Live Budget Tracker */}
        <div className={`mb-6 p-4 rounded-2xl glass-surface border transition-all duration-300 ${total > budget
            ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.07)]'
            : 'border-emerald-500/20 bg-emerald-500/5'
          }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${total > budget
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">Live Budget Tracker</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider ${total > budget
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                    {total > budget ? 'Exceeded' : 'Safe'}
                  </span>
                  <span className="text-xs text-[hsl(var(--text-muted))] font-bold">
                    Limit: ₹{budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 sm:text-right w-full sm:w-auto justify-between sm:justify-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">Total Spent</p>
                <p className={`text-base font-black ${total > budget ? 'text-rose-400' : 'text-[hsl(var(--primary))]'}`}>
                  ₹{total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                  {total > budget ? 'Exceeded By' : 'Remaining'}
                </p>
                <p className={`text-base font-black ${total > budget ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{Math.abs(budget - total).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Card Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
            className="glass-surface rounded-3xl p-6 md:p-8 shadow-2xl border border-white/5"
          >

            {/* STEP 0: Hotel */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-[hsl(var(--text))]">
                  <Hotel size={24} className="text-[hsl(var(--primary))]" /> Hotel Customization
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Select a premium stay for your {nights} nights package.</p>

                {wantHotel === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantHotel(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Hotels</button>
                    <button onClick={() => { setWantHotel(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Hotel</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotels.map(h => (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHotel(h)}
                        className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${selectedHotel?.id === h.id
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] shadow-lg shadow-blue-500/5'
                            : 'border-transparent bg-white/3 hover:border-white/10 hover:bg-white/5'
                          }`}
                      >
                        <img src={h.img} alt={h.name} className="w-full md:w-32 h-32 rounded-xl object-cover" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="font-extrabold text-base text-[hsl(var(--text))]">{h.name}</h3>
                              <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5"><Star size={12} fill="currentColor" />{h.rating}</span>
                            </div>
                            <div className="flex gap-0.5 mb-2">{Array.from({ length: h.stars }).map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}</div>
                            <div className="flex flex-wrap gap-1">{h.amenities.map((a, i) => <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-extrabold tracking-wide">{a}</span>)}</div>
                          </div>
                        </div>
                        <div className="text-right flex md:flex-col justify-between items-end md:justify-center border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          <div>
                            <p className="text-2xl font-black text-[hsl(var(--primary))]">₹{h.price.toLocaleString()}</p>
                            <p className="text-xs opacity-50">/ night</p>
                          </div>
                          <p className="text-xs font-extrabold text-blue-500 mt-1">{nights} nights = ₹{(h.price * nights).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Food */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-[hsl(var(--text))]">
                  <UtensilsCrossed size={24} className="text-[hsl(var(--primary))]" /> Dining Plan Selection
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Choose a meal plan for {days} days, serving {travelers} travelers.</p>

                {wantFood === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantFood(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, Select Meal</button>
                    <button onClick={() => { setWantFood(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Meals</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {foodOptions.map(f => {
                      const theme = getFoodTheme(f.label);
                      const Icon = theme.icon;
                      const isSelected = selectedFood?.id === f.id;
                      return (
                        <motion.div
                          key={f.id}
                          whileHover={{ y: -6, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedFood(f)}
                          className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 relative flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl ${
                            isSelected
                              ? `${theme.borderColor} ${theme.selectedBg} ${theme.glow} scale-[1.02] shadow-lg`
                              : 'border-slate-200/50 dark:border-slate-800/50 bg-white/4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white dark:border-slate-900 z-10">
                              ✓
                            </div>
                          )}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.bg}`}>
                                <Icon size={24} className={theme.color} />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${theme.bg} ${theme.color}`}>
                                {theme.badge}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-base text-[hsl(var(--text))] mb-1 flex items-center gap-1.5">
                              {f.emoji} {f.label} Plan
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                              {theme.desc}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-1">
                            <p className="text-2xl font-black text-[hsl(var(--primary))]">
                              ₹{(f.price * days * travelers).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex justify-between items-center">
                              <span>₹{f.price}/person/day</span>
                              <span className="opacity-70">{days} Days · {travelers} Pax</span>
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Cab */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-[hsl(var(--text))]">
                  <Car size={24} className="text-[hsl(var(--primary))]" /> Transit & Transfers
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Need airport pick-up, drop-off, and point-to-point transfers?</p>

                {wantCab === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantCab(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Cabs</button>
                    <button onClick={() => { setWantCab(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Cab</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cabOptions.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCab(c)}
                        className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border-2 ${selectedCab?.id === c.id
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                            : 'border-transparent bg-white/3 hover:border-white/10'
                          }`}
                      >
                        <div>
                          <p className="font-extrabold text-base text-[hsl(var(--text))]">{c.label}</p>
                          <p className="text-xs opacity-50">{c.desc}</p>
                        </div>
                        <p className="text-xl font-black text-[hsl(var(--primary))]">₹{(c.price * travelers).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Guide */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-[hsl(var(--text))]">
                  <UserCheck size={24} className="text-[hsl(var(--primary))]" /> Local Tour Guide
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Hire a certified local expert for your sightseeing tours ({days} days).</p>

                {wantGuide === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantGuide(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, Assign Guide</button>
                    <button onClick={() => { setWantGuide(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Guide</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guides.map(g => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGuide(g)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedGuide?.id === g.id
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                            : 'border-transparent bg-white/3 hover:border-white/10'
                          }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div>
                            <p className="font-extrabold text-base text-[hsl(var(--text))]">{g.name}</p>
                            <p className="text-xs opacity-60">{g.type} · {g.exp} · <Star size={11} className="inline text-amber-500 fill-amber-500 mr-0.5" />{g.rating}</p>
                            <p className="text-[10px] opacity-40 mt-0.5">Languages: {g.langs}</p>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <p className="text-xl font-black text-[hsl(var(--primary))]">₹{g.price}/day</p>
                            <p className="text-xs opacity-40">{days} days = ₹{(g.price * days).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Vehicle */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-[hsl(var(--text))]">
                  <Bike size={24} className="text-[hsl(var(--primary))]" /> Rental Vehicle
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Reserve a private vehicle for self-driving or cruising around the destination.</p>

                {wantVehicle === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantVehicle(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Vehicles</button>
                    <button onClick={() => { setWantVehicle(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Renting</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map(v => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedVehicle?.id === v.id
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] scale-[1.02]'
                            : 'border-transparent bg-white/3 hover:border-white/10'
                          }`}
                      >
                        <p className="font-extrabold text-base text-[hsl(var(--text))]">{v.type}</p>
                        <p className="text-xs opacity-50">{v.seats} Seats · {v.fuel}</p>
                        <p className="text-lg font-black text-[hsl(var(--primary))] mt-2.5">₹{v.price} / day <span className="text-xs opacity-40 font-normal">({days}D = ₹{(v.price * days).toLocaleString()})</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Summary */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-[hsl(var(--text))]">
                  <CheckCircle size={24} className="text-emerald-500" /> Itinerary Summary
                </h2>

                {aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-blue-600/10 border border-blue-500/20 text-sm shadow-inner"
                  >
                    <p className="font-extrabold text-[hsl(var(--primary))] mb-1 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-blue-500 animate-pulse" /> AI Consultant Review
                    </p>
                    <p className="text-[hsl(var(--text-muted))] leading-relaxed italic text-xs">
                      {typeof aiSummary === 'object' ? (aiSummary.plan_summary || JSON.stringify(aiSummary)) : aiSummary}
                    </p>
                  </motion.div>
                )}

                <div className="bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] rounded-2xl p-6 mb-6">
                  <p className="font-black text-lg text-[hsl(var(--text))]">{from || 'Departure'} → {to || 'Destination'}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))] uppercase font-bold tracking-wider mt-1">{travelerName} · {days} Days · {nights} Nights · {travelers} Travelers</p>
                  {selectedPackage && <p className="text-[10px] text-[hsl(var(--primary))] font-bold mt-2">Package: {selectedPackage.name} ({selectedPackage.duration})</p>}
                </div>

                <div className="space-y-3 mb-8">
                  {selectedHotel && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>🏨 {selectedHotel.name} ({nights}N)</span><span className="font-bold">₹{hotelCost.toLocaleString()}</span></div>}
                  {selectedPackage && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>Package base price ({travelers} traveler{travelers > 1 ? 's' : ''})</span><span className="font-bold">₹{packageCost.toLocaleString()}</span></div>}
                  {selectedFood && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>{selectedFood.emoji} {selectedFood.label} Plan ({days}D)</span><span className="font-bold">₹{foodCost.toLocaleString()}</span></div>}
                  {selectedCab && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>🚕 {selectedCab.label} Transfer</span><span className="font-bold">₹{cabCost.toLocaleString()}</span></div>}
                  {selectedGuide && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>🧑‍🏫 {selectedGuide.name} ({days}D)</span><span className="font-bold">₹{guideCost.toLocaleString()}</span></div>}
                  {selectedVehicle && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>🚗 {selectedVehicle.type} Rental ({days}D)</span><span className="font-bold">₹{vehicleCost.toLocaleString()}</span></div>}

                  {subtotal === 0 && (
                    <div className="p-4 text-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center justify-center gap-1.5">
                      <AlertCircle size={16} /> No items selected. Backtrack and choose services.
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 space-y-2 mt-4">
                    <div className="flex justify-between text-sm text-[hsl(var(--text-muted))]"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-[hsl(var(--text-muted))]"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div>
                    {discount > 0 && <div className="flex justify-between text-sm text-emerald-500 font-bold"><span>Special AI Discount (10%)</span><span>-₹{discount.toLocaleString()}</span></div>}
                    <div className="flex justify-between text-2xl font-black pt-3 border-t border-white/10 text-[hsl(var(--text))]">
                      <span>Total Price</span>
                      <span className="text-[hsl(var(--primary))]">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={handleCheckout} className="py-3 px-6 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"><CreditCard size={16} /> Book & Checkout</button>
                  <button onClick={handleSave} className="py-3 px-6 rounded-xl bg-neutral-800 text-white font-extrabold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/5"><Save size={16} /> Save Itinerary</button>
                  <button onClick={handleDownloadPDF} className="py-3 px-6 rounded-xl bg-neutral-800 text-white font-extrabold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/5"><Download size={16} /> Download PDF</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Control Buttons */}
        <div className="flex justify-between mt-6 px-2">
          <button
            onClick={prev}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-sm disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center gap-2 border border-white/5"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < 5 && (
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 text-white font-extrabold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-blue-500/15"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TripPlanner;
