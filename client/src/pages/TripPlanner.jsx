import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Hotel, UtensilsCrossed, Car, UserCheck, Bike, CheckCircle, ArrowRight, ArrowLeft, Download, Save, CreditCard, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api, { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const steps = ['Hotel', 'Food', 'Cab', 'Guide', 'Vehicle', 'Summary'];

const hotels = [
  { id: 1, name: 'Ocean Pearl Resort', stars: 5, price: 8500, rating: 4.9, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format', amenities: ['Beach View','Pool','WiFi','Breakfast'] },
  { id: 2, name: 'Comfort Inn Suites', stars: 4, price: 4500, rating: 4.6, img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&auto=format', amenities: ['WiFi','Parking','Restaurant'] },
  { id: 3, name: 'Budget Stay Express', stars: 3, price: 2000, rating: 4.2, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format', amenities: ['WiFi','AC'] },
];

const foodOptions = [
  { id: 1, label: 'Vegetarian', emoji: '🥗', price: 800 },
  { id: 2, label: 'Non-Vegetarian', emoji: '🍗', price: 1000 },
  { id: 3, label: 'Vegan', emoji: '🌱', price: 900 },
];

const cabOptions = [
  { id: 1, label: 'Shared Cab', price: 500, desc: 'Affordable, shared ride' },
  { id: 2, label: 'Private Cab', price: 1500, desc: 'Comfortable sedan' },
  { id: 3, label: 'Luxury Car', price: 3500, desc: 'Premium experience' },
];

const guides = [
  { id: 1, name: 'Rajesh Kumar', type: 'Local Guide', rating: 4.8, exp: '5 years', langs: 'Hindi, English', price: 1200 },
  { id: 2, name: 'Maria Fernandes', type: 'Professional', rating: 4.9, exp: '8 years', langs: 'English, Portuguese', price: 2000 },
  { id: 3, name: 'Akira Tanaka', type: 'Multilingual', rating: 4.7, exp: '6 years', langs: 'English, Japanese, Hindi', price: 2500 },
];

const vehicles = [
  { id: 1, type: 'SUV', seats: 7, fuel: 'Diesel', price: 2500 },
  { id: 2, type: 'Sedan', seats: 4, fuel: 'Petrol', price: 1800 },
  { id: 3, type: 'Bike', seats: 2, fuel: 'Petrol', price: 600 },
  { id: 4, type: 'Scooter', seats: 2, fuel: 'Petrol', price: 400 },
  { id: 5, type: 'Electric Vehicle', seats: 4, fuel: 'Electric', price: 2000 },
];

const TripPlanner = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [depDate, setDepDate] = useState('');
  const [retDate, setRetDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [started, setStarted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

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

  const nights = depDate && retDate ? Math.max(1, Math.ceil((new Date(retDate) - new Date(depDate)) / 86400000)) : 3;
  const days = nights + 1;

  const hotelCost = selectedHotel ? selectedHotel.price * nights : 0;
  const foodCost = selectedFood ? selectedFood.price * days * travelers : 0;
  const cabCost = selectedCab ? selectedCab.price * travelers : 0;
  const guideCost = selectedGuide ? selectedGuide.price * days : 0;
  const vehicleCost = selectedVehicle ? selectedVehicle.price * days : 0;
  
  const subtotal = hotelCost + foodCost + cabCost + guideCost + vehicleCost;
  const tax = Math.round(subtotal * 0.05);
  const discount = subtotal > 20000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax - discount;

  const next = () => { if (step < 5) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  // AI Planner Auto-fill
  const handleAISuggest = async () => {
    if (!from || !to || !depDate || !retDate) {
      toast.error('Please enter From Location, To Destination, and travel dates first!');
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading('✨ Gemini AI is analyzing options for your itinerary...');
    try {
      const prompt = `I want to plan a trip from "${from}" to "${to}" from ${depDate} to ${retDate} for ${travelers} travelers with a budget of ₹${budget}.
Please customize my trip by selecting the best options from our available services:
Hotels:
- Option 1: Ocean Pearl Resort (5 stars, ₹8500 per night)
- Option 2: Comfort Inn Suites (4 stars, ₹4500 per night)
- Option 3: Budget Stay Express (3 stars, ₹2000 per night)

Food options:
- Option 1: Vegetarian (₹800 per person per day)
- Option 2: Non-Vegetarian (₹1000 per person per day)
- Option 3: Vegan (₹900 per person per day)

Cab options:
- Option 1: Shared Cab (₹500 per person)
- Option 2: Private Cab (₹1500 per person)
- Option 3: Luxury Car (₹3500 per person)

Guides:
- Option 1: Rajesh Kumar (₹1200 per day)
- Option 2: Maria Fernandes (₹2000 per day)
- Option 3: Akira Tanaka (₹2500 per day)

Vehicles:
- Option 1: SUV (₹2500 per day)
- Option 2: Sedan (₹1800 per day)
- Option 3: Bike (₹600 per day)
- Option 4: Scooter (₹400 per day)
- Option 5: Electric Vehicle (₹2000 per day)

Select exactly one option (Option 1, 2, or 3 etc) for each category (Hotel, Food, Cab, Guide, Vehicle) to keep the total cost within the budget of ₹${budget}. If the budget is very low, do not select expensive options or suggest null (false/null) for some categories.
Return ONLY a valid JSON object matching the following schema:
{
  "hotel_id": 1 | 2 | 3 | null,
  "food_id": 1 | 2 | 3 | null,
  "cab_id": 1 | 2 | 3 | null,
  "guide_id": 1 | 2 | 3 | null,
  "vehicle_id": 1 | 2 | 3 | 4 | 5 | null,
  "plan_summary": "detailed summary explaining this customization, cost logic, and destination advice"
}
Return raw JSON only, no markdown, no backticks, no code fence.`;

      const res = await aiAPI.chat(prompt);
      let replyText = res.data?.reply || res.data || '';
      replyText = replyText.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const parsed = JSON.parse(replyText);

      // Pre-fill
      if (parsed.hotel_id) {
        setWantHotel(true);
        setSelectedHotel(hotels.find(h => h.id === parsed.hotel_id) || null);
      } else {
        setWantHotel(false);
        setSelectedHotel(null);
      }

      if (parsed.food_id) {
        setWantFood(true);
        setSelectedFood(foodOptions.find(f => f.id === parsed.food_id) || null);
      } else {
        setWantFood(false);
        setSelectedFood(null);
      }

      if (parsed.cab_id) {
        setWantCab(true);
        setSelectedCab(cabOptions.find(c => c.id === parsed.cab_id) || null);
      } else {
        setWantCab(false);
        setSelectedCab(null);
      }

      if (parsed.guide_id) {
        setWantGuide(true);
        setSelectedGuide(guides.find(g => g.id === parsed.guide_id) || null);
      } else {
        setWantGuide(false);
        setSelectedGuide(null);
      }

      if (parsed.vehicle_id) {
        setWantVehicle(true);
        setSelectedVehicle(vehicles.find(v => v.id === parsed.vehicle_id) || null);
      } else {
        setWantVehicle(false);
        setSelectedVehicle(null);
      }

      setAiSummary(parsed.plan_summary || 'Custom AI trip configuration complete.');
      setStarted(true);
      setStep(5); // Go straight to review
      toast.success('✨ Gemini AI has customized your plan!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('AI planning failed. Proceeding manually.', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      toast.loading('Preparing your checkout session...', { id: 'checkout' });

      const tripData = {
        from_location: from,
        to_destination: to,
        departure_date: depDate,
        return_date: retDate,
        travelers,
        hotel_id: selectedHotel?.id,
        food_package_id: selectedFood?.id,
        cab_service_id: selectedCab?.id,
        guide_id: selectedGuide?.id,
        rental_vehicle_id: selectedVehicle?.id,
        subtotal,
        tax,
        discount,
        total_price: total,
      };

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

      const tripData = {
        from_location: from,
        to_destination: to,
        departure_date: depDate,
        return_date: retDate,
        travelers,
        hotel_id: selectedHotel?.id,
        food_package_id: selectedFood?.id,
        cab_service_id: selectedCab?.id,
        guide_id: selectedGuide?.id,
        rental_vehicle_id: selectedVehicle?.id,
        subtotal,
        tax,
        discount,
        total_price: total,
      };

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

      // Theme Colors
      const primaryColor = [99, 102, 241];
      const secondaryColor = [31, 41, 55];
      const textColor = [55, 65, 81];

      // Header Band
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('SMART TOURISM ITINERARY', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Personalized AI-Customized Travel Package Details', 15, 30);

      // Section 1
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TRIP DESCRIPTION', 15, 60);
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 63, 195, 63);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);

      let yPos = 72;
      const printLine = (label, val) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(val), 70, yPos);
        yPos += 8;
      };

      printLine('From Location:', from || 'Not Specified');
      printLine('To Destination:', to || 'Not Specified');
      printLine('Departure Date:', depDate || 'Not Specified');
      printLine('Return Date:', retDate || 'Not Specified');
      printLine('Travelers Count:', travelers);
      printLine('Duration Package:', `${days} Days / ${nights} Nights`);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(12);
      doc.text('RESERVED TRAVEL SERVICES', 15, yPos);
      doc.line(15, yPos + 3, 195, yPos + 3);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);

      if (selectedHotel) {
        printLine('Selected Hotel:', `${selectedHotel.name} (${selectedHotel.stars} Stars) - INR ${hotelCost.toLocaleString()}`);
      }
      if (selectedFood) {
        printLine('Meals Selection:', `${selectedFood.label} Package - INR ${foodCost.toLocaleString()}`);
      }
      if (selectedCab) {
        printLine('Transit Cab:', `${selectedCab.label} - INR ${cabCost.toLocaleString()}`);
      }
      if (selectedGuide) {
        printLine('Personal Guide:', `${selectedGuide.name} - INR ${guideCost.toLocaleString()}`);
      }
      if (selectedVehicle) {
        printLine('Rental Vehicle:', `${selectedVehicle.type} - INR ${vehicleCost.toLocaleString()}`);
      }

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(12);
      doc.text('PRICING BREAKDOWN', 15, yPos);
      doc.line(15, yPos + 3, 195, yPos + 3);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      printLine('Subtotal Sum:', `INR ${subtotal.toLocaleString()}`);
      printLine('Tax (5% GST):', `INR ${tax.toLocaleString()}`);
      if (discount > 0) {
        doc.setTextColor(16, 185, 129);
        printLine('AI Promotion Saving:', `-INR ${discount.toLocaleString()}`);
        doc.setTextColor(...textColor);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      printLine('Total Booking Cost:', `INR ${total.toLocaleString()}`);

      yPos += 15;
      doc.setDrawColor(229, 231, 235);
      doc.line(15, yPos, 195, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('Thank you for booking with Smart Tourism. Safe Travels!', 15, yPos);

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
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600">
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
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 relative z-10">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">From Location</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <MapPin size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="text" value={from} onChange={e=>setFrom(e.target.value)} placeholder="City of departure" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">To Destination</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <MapPin size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="text" value={to} onChange={e=>setTo(e.target.value)} placeholder="Destination" className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Departure Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Calendar size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="date" value={depDate} onChange={e=>setDepDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Return Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Calendar size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="date" value={retDate} onChange={e=>setRetDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Travelers</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all">
                  <Users size={18} className="text-[hsl(var(--primary))] mr-3" />
                  <input type="number" min="1" max="25" value={travelers} onChange={e=>setTravelers(+e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block opacity-60">Total Budget (₹)</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3 border border-white/5 focus-within:border-[hsl(var(--primary)/0.4)] transition-all justify-between">
                  <div className="flex items-center flex-1 mr-3">
                    <DollarSign size={18} className="text-[hsl(var(--primary))] mr-2" />
                    <input type="range" min="5000" max="200000" step="5000" value={budget} onChange={e=>setBudget(+e.target.value)} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))]" />
                  </div>
                  <span className="text-sm font-extrabold text-[hsl(var(--primary))] whitespace-nowrap">₹{budget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button 
                onClick={() => setStarted(true)} 
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-700 text-white font-extrabold text-base hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Manual Wizard <ArrowRight size={18} />
              </button>
              <button 
                onClick={handleAISuggest} 
                disabled={aiLoading} 
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-black text-base hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 relative ${
                  i < step 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                    : i === step 
                    ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-110' 
                    : 'glass-surface text-[hsl(var(--text-muted))] border border-white/5'
                }`}
              >
                {i < step ? <CheckCircle size={18} /> : i + 1}
                {i === step && <div className="absolute -inset-1 rounded-full border-2 border-[hsl(var(--primary))] opacity-50 animate-ping" />}
              </button>
              <span className={`ml-2.5 text-xs font-black uppercase tracking-wider hidden sm:block ${i === step ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--text-muted))] opacity-60'}`}>{s}</span>
              {i < 5 && <div className={`w-8 md:w-16 h-0.5 mx-3 ${i < step ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10'}`} />}
            </div>
          ))}
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
                    <button onClick={() => setWantHotel(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Hotels</button>
                    <button onClick={() => { setWantHotel(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Hotel</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotels.map(h => (
                      <div 
                        key={h.id} 
                        onClick={() => setSelectedHotel(h)} 
                        className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                          selectedHotel?.id === h.id 
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] shadow-lg shadow-indigo-500/5' 
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
                            <div className="flex gap-0.5 mb-2">{Array.from({length: h.stars}).map((_,i)=><Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}</div>
                            <div className="flex flex-wrap gap-1">{h.amenities.map((a,i)=><span key={i} className="text-[9px] px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-extrabold tracking-wide">{a}</span>)}</div>
                          </div>
                        </div>
                        <div className="text-right flex md:flex-col justify-between items-end md:justify-center border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          <div>
                            <p className="text-2xl font-black text-[hsl(var(--primary))]">₹{h.price.toLocaleString()}</p>
                            <p className="text-xs opacity-50">/ night</p>
                          </div>
                          <p className="text-xs font-extrabold text-indigo-500 mt-1">{nights} nights = ₹{(h.price*nights).toLocaleString()}</p>
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
                  <UtensilsCrossed size={24} className="text-[hsl(var(--primary))]" /> Dining Plan
                </h2>
                <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Choose a meal plan for {days} days, serving {travelers} travelers.</p>
                
                {wantFood === null ? (
                  <div className="flex gap-4">
                    <button onClick={() => setWantFood(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, Select Meal</button>
                    <button onClick={() => { setWantFood(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Meals</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {foodOptions.map(f => (
                      <div 
                        key={f.id} 
                        onClick={() => setSelectedFood(f)} 
                        className={`p-6 rounded-2xl text-center cursor-pointer transition-all duration-300 border-2 ${
                          selectedFood?.id === f.id 
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] scale-[1.03]' 
                            : 'border-transparent bg-white/3 hover:border-white/10'
                        }`}
                      >
                        <span className="text-5xl block mb-4 animate-bounce" style={{ animationDuration: '3s' }}>{f.emoji}</span>
                        <p className="font-extrabold text-lg mb-1 text-[hsl(var(--text))]">{f.label}</p>
                        <p className="text-xs opacity-50 mb-3">All Meals Included</p>
                        <p className="text-xl font-black text-[hsl(var(--primary))]">₹{(f.price * days * travelers).toLocaleString()}</p>
                        <p className="text-[10px] opacity-40 mt-0.5">₹{f.price}/person/day</p>
                      </div>
                    ))}
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
                    <button onClick={() => setWantCab(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Cabs</button>
                    <button onClick={() => { setWantCab(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Cab</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cabOptions.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCab(c)} 
                        className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border-2 ${
                          selectedCab?.id === c.id 
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
                    <button onClick={() => setWantGuide(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, Assign Guide</button>
                    <button onClick={() => { setWantGuide(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Guide</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guides.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => setSelectedGuide(g)} 
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                          selectedGuide?.id === g.id 
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
                            <p className="text-xs opacity-40">{days} days = ₹{(g.price*days).toLocaleString()}</p>
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
                    <button onClick={() => setWantVehicle(true)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-lg hover:opacity-90 transition-all">Yes, View Vehicles</button>
                    <button onClick={() => { setWantVehicle(false); next(); }} className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-extrabold text-lg hover:bg-neutral-700 transition-all">Skip Renting</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => setSelectedVehicle(v)} 
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                          selectedVehicle?.id === v.id 
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] scale-[1.02]' 
                            : 'border-transparent bg-white/3 hover:border-white/10'
                        }`}
                      >
                        <p className="font-extrabold text-base text-[hsl(var(--text))]">{v.type}</p>
                        <p className="text-xs opacity-50">{v.seats} Seats · {v.fuel}</p>
                        <p className="text-lg font-black text-[hsl(var(--primary))] mt-2.5">₹{v.price} / day <span className="text-xs opacity-40 font-normal">({days}D = ₹{(v.price*days).toLocaleString()})</span></p>
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
                    className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-sm shadow-inner"
                  >
                    <p className="font-extrabold text-[hsl(var(--primary))] mb-1 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-violet-500 animate-pulse" /> AI Consultant Review
                    </p>
                    <p className="text-[hsl(var(--text-muted))] leading-relaxed italic text-xs">
                      {typeof aiSummary === 'object' ? (aiSummary.plan_summary || JSON.stringify(aiSummary)) : aiSummary}
                    </p>
                  </motion.div>
                )}

                <div className="bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] rounded-2xl p-6 mb-6">
                  <p className="font-black text-lg text-[hsl(var(--text))]">{from || 'Departure'} → {to || 'Destination'}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))] uppercase font-bold tracking-wider mt-1">{days} Days · {nights} Nights · {travelers} Travelers</p>
                </div>

                <div className="space-y-3 mb-8">
                  {selectedHotel && <div className="flex justify-between p-3.5 rounded-xl bg-white/3 border border-white/5 text-sm"><span>🏨 {selectedHotel.name} ({nights}N)</span><span className="font-bold">₹{hotelCost.toLocaleString()}</span></div>}
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
                  <button onClick={handleCheckout} className="py-3 px-6 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"><CreditCard size={16} /> Book & Checkout</button>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-indigo-600 text-white font-extrabold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/15"
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
