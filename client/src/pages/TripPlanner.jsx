import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Hotel, UtensilsCrossed, Car, UserCheck, Bike, CheckCircle, ArrowRight, ArrowLeft, Download, Save, CreditCard, Star, Wifi, Waves } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

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

  const handleCheckout = async () => {
    try {
      toast.loading('Preparing your trip...', { id: 'checkout' });

      // Step 1: Create the trip record in the database
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

      // Step 2: Get Stripe Checkout URL
      const { data: checkoutRes } = await api.post('/trips/checkout', { trip_id: tripId });
      
      toast.success('Redirecting to secure checkout...', { id: 'checkout' });
      
      // Redirect to Stripe
      window.location.href = checkoutRes.url;

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Please login to book a trip!';
      toast.error(msg, { id: 'checkout' });
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[hsl(var(--primary))] font-bold text-sm uppercase tracking-wider mb-2">Smart Trip Planner</p>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Plan Your Dream Trip</h1>
            <p className="text-[hsl(var(--text-muted))]">AI-powered step-by-step trip customization</p>
          </div>
          <div className="glass-surface rounded-3xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">From Location</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><MapPin size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="text" value={from} onChange={e=>setFrom(e.target.value)} placeholder="Your city" className="w-full bg-transparent text-sm outline-none" /></div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">To Destination</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><MapPin size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="text" value={to} onChange={e=>setTo(e.target.value)} placeholder="Destination" className="w-full bg-transparent text-sm outline-none" /></div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Departure Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><Calendar size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="date" value={depDate} onChange={e=>setDepDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" /></div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Return Date</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><Calendar size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="date" value={retDate} onChange={e=>setRetDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" /></div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Travelers</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><Users size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="number" min="1" max="20" value={travelers} onChange={e=>setTravelers(+e.target.value)} className="w-full bg-transparent text-sm outline-none" /></div></div>
              <div><label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Budget (₹)</label>
                <div className="flex items-center glass-surface rounded-xl px-4 py-3"><DollarSign size={16} className="text-[hsl(var(--primary))] mr-3" /><input type="range" min="5000" max="200000" step="1000" value={budget} onChange={e=>setBudget(+e.target.value)} className="w-full" /><span className="ml-3 text-sm font-bold whitespace-nowrap">₹{budget.toLocaleString()}</span></div></div>
            </div>
            <button onClick={() => setStarted(true)} className="w-full btn-primary text-lg !py-4 flex items-center justify-center gap-2">
              MAKE TRIP <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <button onClick={() => setStep(i)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? 'bg-[hsl(var(--primary))] text-white shadow-lg' : 'glass-surface'}`}>
                {i < step ? <CheckCircle size={18} /> : i + 1}
              </button>
              <span className={`ml-2 text-xs font-bold hidden sm:block ${i === step ? 'text-[hsl(var(--primary))]' : 'opacity-40'}`}>{s}</span>
              {i < 5 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < step ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary)/0.15)]'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-surface rounded-3xl p-8">

            {/* STEP 0: Hotel */}
            {step === 0 && (<div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Hotel size={24} className="text-[hsl(var(--primary))]" /> Hotel Selection</h2>
              <p className="text-[hsl(var(--text-muted))] mb-6">Do you want a hotel for your stay?</p>
              {wantHotel === null ? (
                <div className="flex gap-4">
                  <button onClick={() => setWantHotel(true)} className="flex-1 btn-primary !py-4 text-lg">Yes, Show Hotels</button>
                  <button onClick={() => { setWantHotel(false); next(); }} className="flex-1 btn-secondary !py-4 text-lg">Skip</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotels.map(h => (
                    <div key={h.id} onClick={() => setSelectedHotel(h)} className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedHotel?.id === h.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-transparent bg-[hsl(var(--primary)/0.02)] hover:border-[hsl(var(--primary)/0.2)]'}`}>
                      <img src={h.img} alt={h.name} className="w-24 h-24 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{h.name}</h3>
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5"><Star size={10} fill="currentColor" />{h.rating}</span>
                        </div>
                        <div className="flex gap-1 mb-2">{Array.from({length: h.stars}).map((_,i)=><Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                        <div className="flex flex-wrap gap-1">{h.amenities.map((a,i)=><span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-bold">{a}</span>)}</div>
                      </div>
                      <div className="text-right"><p className="text-xl font-black text-[hsl(var(--primary))]">₹{h.price.toLocaleString()}</p><p className="text-xs opacity-50">/night</p><p className="text-xs font-bold mt-1">{nights}N = ₹{(h.price*nights).toLocaleString()}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>)}

            {/* STEP 1: Food */}
            {step === 1 && (<div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><UtensilsCrossed size={24} className="text-[hsl(var(--primary))]" /> Food Planning</h2>
              <p className="text-[hsl(var(--text-muted))] mb-6">Want a food package? ({days} days, {travelers} travelers)</p>
              {wantFood === null ? (
                <div className="flex gap-4"><button onClick={() => setWantFood(true)} className="flex-1 btn-primary !py-4 text-lg">Yes</button><button onClick={() => { setWantFood(false); next(); }} className="flex-1 btn-secondary !py-4 text-lg">Skip</button></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {foodOptions.map(f => (
                    <div key={f.id} onClick={() => setSelectedFood(f)} className={`p-6 rounded-2xl text-center cursor-pointer transition-all border-2 ${selectedFood?.id === f.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-transparent bg-[hsl(var(--primary)/0.02)]'}`}>
                      <span className="text-4xl block mb-3">{f.emoji}</span>
                      <p className="font-bold mb-1">{f.label}</p>
                      <p className="text-xs opacity-50 mb-2">Breakfast + Lunch + Dinner</p>
                      <p className="font-black text-[hsl(var(--primary))]">₹{(f.price * days * travelers).toLocaleString()}</p>
                      <p className="text-[10px] opacity-40">₹{f.price}/person/day</p>
                    </div>
                  ))}
                </div>
              )}
            </div>)}

            {/* STEP 2: Cab */}
            {step === 2 && (<div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Car size={24} className="text-[hsl(var(--primary))]" /> Pickup & Drop</h2>
              <p className="text-[hsl(var(--text-muted))] mb-6">Need pickup and drop cab?</p>
              {wantCab === null ? (
                <div className="flex gap-4"><button onClick={() => setWantCab(true)} className="flex-1 btn-primary !py-4">Yes</button><button onClick={() => { setWantCab(false); next(); }} className="flex-1 btn-secondary !py-4">Skip</button></div>
              ) : (
                <div className="space-y-3">{cabOptions.map(c => (
                  <div key={c.id} onClick={() => setSelectedCab(c)} className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border-2 ${selectedCab?.id === c.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-transparent bg-[hsl(var(--primary)/0.02)]'}`}>
                    <div><p className="font-bold">{c.label}</p><p className="text-xs opacity-50">{c.desc}</p></div>
                    <p className="font-black text-[hsl(var(--primary))]">₹{(c.price * travelers).toLocaleString()}</p>
                  </div>
                ))}</div>
              )}
            </div>)}

            {/* STEP 3: Guide */}
            {step === 3 && (<div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><UserCheck size={24} className="text-[hsl(var(--primary))]" /> Tour Guide</h2>
              <p className="text-[hsl(var(--text-muted))] mb-6">Need a local tour guide?</p>
              {wantGuide === null ? (
                <div className="flex gap-4"><button onClick={() => setWantGuide(true)} className="flex-1 btn-primary !py-4">Yes</button><button onClick={() => { setWantGuide(false); next(); }} className="flex-1 btn-secondary !py-4">Skip</button></div>
              ) : (
                <div className="space-y-3">{guides.map(g => (
                  <div key={g.id} onClick={() => setSelectedGuide(g)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedGuide?.id === g.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-transparent bg-[hsl(var(--primary)/0.02)]'}`}>
                    <div className="flex justify-between items-start">
                      <div><p className="font-bold">{g.name}</p><p className="text-xs opacity-60">{g.type} · {g.exp} · <Star size={10} className="inline text-amber-400 fill-amber-400" /> {g.rating}</p><p className="text-xs opacity-40">Languages: {g.langs}</p></div>
                      <div className="text-right"><p className="font-black text-[hsl(var(--primary))]">₹{g.price}/day</p><p className="text-xs opacity-40">{days}D = ₹{(g.price*days).toLocaleString()}</p></div>
                    </div>
                  </div>
                ))}</div>
              )}
            </div>)}

            {/* STEP 4: Vehicle */}
            {step === 4 && (<div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Bike size={24} className="text-[hsl(var(--primary))]" /> Rental Vehicle</h2>
              <p className="text-[hsl(var(--text-muted))] mb-6">Need a car/bike for local travel?</p>
              {wantVehicle === null ? (
                <div className="flex gap-4"><button onClick={() => setWantVehicle(true)} className="flex-1 btn-primary !py-4">Yes</button><button onClick={() => { setWantVehicle(false); next(); }} className="flex-1 btn-secondary !py-4">Skip</button></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{vehicles.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicle(v)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedVehicle?.id === v.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]' : 'border-transparent bg-[hsl(var(--primary)/0.02)]'}`}>
                    <p className="font-bold">{v.type}</p>
                    <p className="text-xs opacity-50">{v.seats} seats · {v.fuel}</p>
                    <p className="font-black text-[hsl(var(--primary))] mt-2">₹{v.price}/day <span className="text-xs opacity-40">= ₹{(v.price*days).toLocaleString()}</span></p>
                  </div>
                ))}</div>
              )}
            </div>)}

            {/* STEP 5: Summary */}
            {step === 5 && (<div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><CheckCircle size={24} className="text-emerald-500" /> Trip Summary</h2>
              <div className="bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 mb-6">
                <p className="font-bold mb-1">{from || 'Your City'} → {to || 'Destination'}</p>
                <p className="text-sm opacity-60">{days} Days · {nights} Nights · {travelers} Travelers</p>
              </div>
              <div className="space-y-3 mb-6">
                {selectedHotel && <div className="flex justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.03)]"><span>🏨 {selectedHotel.name} ({nights}N)</span><span className="font-bold">₹{hotelCost.toLocaleString()}</span></div>}
                {selectedFood && <div className="flex justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.03)]"><span>{selectedFood.emoji} {selectedFood.label} ({days}D × {travelers}P)</span><span className="font-bold">₹{foodCost.toLocaleString()}</span></div>}
                {selectedCab && <div className="flex justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.03)]"><span>🚕 {selectedCab.label}</span><span className="font-bold">₹{cabCost.toLocaleString()}</span></div>}
                {selectedGuide && <div className="flex justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.03)]"><span>🧑‍🏫 {selectedGuide.name} ({days}D)</span><span className="font-bold">₹{guideCost.toLocaleString()}</span></div>}
                {selectedVehicle && <div className="flex justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.03)]"><span>🚗 {selectedVehicle.type} ({days}D)</span><span className="font-bold">₹{vehicleCost.toLocaleString()}</span></div>}
                <div className="border-t border-[hsl(var(--primary)/0.1)] pt-3 space-y-2">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount (10%)</span><span>-₹{discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-[hsl(var(--primary)/0.1)]"><span>Total</span><span className="text-[hsl(var(--primary))]">₹{total.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={handleCheckout} className="btn-primary flex items-center justify-center gap-2"><CreditCard size={16} /> Book Now</button>
                <button className="btn-secondary flex items-center justify-center gap-2"><Save size={16} /> Save Trip</button>
                <button className="btn-secondary flex items-center justify-center gap-2"><Download size={16} /> Download PDF</button>
              </div>
            </div>)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={prev} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30"><ArrowLeft size={16} /> Back</button>
          {step < 5 && <button onClick={next} className="btn-primary flex items-center gap-2">Next <ArrowRight size={16} /></button>}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
