import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Hotel, Car, CheckCircle, Clock, XCircle, ArrowLeft, Download, Users, Phone, Mail, Compass } from 'lucide-react';
import api, { tripAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const TripItinerary = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState('');
  const [downloading, setDownloading] = useState(false);
  const itineraryRef = useRef(null);

  const fetchTripDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please login to view trip details');
        navigate('/login');
        return;
      }
      
      const res = await api.get(`/trips/${tripId}`);
      
      if (res.data && res.data.data) {
        setTrip(res.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
      
      if (err.response?.status === 404) {
        toast.error('Trip not found');
        setTrip(null);
      } else if (err.response?.status === 401) {
        toast.error('Unauthorized. Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to fetch trip details');
        setTrip(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
    
    const savedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    let echoInstance = null;
    const channelName = savedUser?.id ? `App.Models.User.${savedUser.id}` : null;
    
    if (channelName && tripId) {
      import('../../services/echo').then(({ default: echo }) => {
        echoInstance = echo;
        const channel = echo.private(channelName);
        
        channel.listen('.BookingStatusUpdated', (data) => {
          console.log('Real-time booking update received in itinerary:', data);
          if (String(data.id) === String(tripId)) {
            fetchTripDetails();
            toast.success('Your itinerary status has been updated in real-time!', { icon: '🔄' });
          }
        });
      }).catch(err => {
        console.error('Failed to initialize Echo inside Itinerary:', err);
      });
    }

    return () => {
      if (echoInstance && channelName) {
        echoInstance.private(channelName).stopListening('.BookingStatusUpdated');
      }
    };
  }, [tripId]);

  const handleDownloadPDF = async () => {
    if (!trip) {
      toast.error('Unable to generate PDF');
      return;
    }

    setDownloading(true);
    const toastId = toast.loading('Generating PDF...');

    try {
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
      doc.save(`trip_itinerary_${trip.id}_${trip.from_location}_to_${trip.to_destination}.pdf`);
      toast.success('Itinerary PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const canCancel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return ['pending', 'confirmed'].includes(trip?.status) && new Date(trip.departure_date) >= today;
  };

  const handleCancelTrip = async () => {
    const toastId = toast.loading('Cancelling trip...');
    try {
      const res = await tripAPI.cancel(trip.id);
      setTrip(res.data.data);
      toast.success('Trip cancelled successfully.', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to cancel trip.', { id: toastId });
    }
  };

  const handleRateTrip = async () => {
    if (!rating) {
      toast.error('Choose a rating first.');
      return;
    }

    const toastId = toast.loading('Submitting rating...');
    try {
      const res = await tripAPI.rate(trip.id, { rating: Number(rating) });
      setTrip(res.data.data);
      toast.success('Rating updated.', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit rating.', { id: toastId });
    }
  };

  const handlePayNow = async () => {
    const toastId = toast.loading('Redirecting to payment gateway...');
    try {
      const { data: checkoutRes } = await paymentAPI.createCheckoutSession(trip.id);
      window.location.href = checkoutRes.url;
    } catch (err) {
      console.error(err);
      toast.error('Failed to redirect to payment. Please try again.', { id: toastId });
    }
  };

  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  const statusIcons = {
    confirmed: <CheckCircle size={16} />,
    completed: <CheckCircle size={16} />,
    pending: <Clock size={16} />,
    cancelled: <XCircle size={16} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 px-6 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen py-10 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <button onClick={() => navigate('/my-trips')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">Back to My Trips</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <button 
            onClick={() => navigate('/my-trips')} 
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:gap-3 transition-all font-semibold bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft size={20} /> Back to My Trips
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className={`flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm border border-gray-200 ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={16} className={downloading ? 'animate-pulse' : ''} /> 
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Itinerary Content for PDF */}
        <div ref={itineraryRef} className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden" style={{ color: '#000000' }}>
          <div className="p-8">
            {/* Trip Header */}
            <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-200 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: '#111827' }}>
                  {trip.from_location} 
                  <span className="text-gray-400 text-lg mx-3">→</span> 
                  {trip.to_destination}
                </h1>
                {trip.description && (
                  <p className="text-gray-600 text-sm font-medium mt-1">{trip.description}</p>
                )}
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider ${statusColors[trip.status]}`}>
                {statusIcons[trip.status]} {trip.status}
              </span>
            </div>

            {/* Trip Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Dates */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-emerald-600" />
                  <h3 className="font-bold" style={{ color: '#111827' }}>Travel Dates</h3>
                </div>
                <p className="text-xl font-black mb-0.5" style={{ color: '#111827' }}>
                  {new Date(trip.departure_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider mb-4">Departure</p>
                <p className="text-xl font-black mb-0.5" style={{ color: '#111827' }}>
                  {new Date(trip.return_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Return</p>
              </div>

              {/* Travelers */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-emerald-600" />
                  <h3 className="font-bold" style={{ color: '#111827' }}>Travelers & Duration</h3>
                </div>
                <p className="text-xl font-black mb-0.5" style={{ color: '#111827' }}>{trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}</p>
                <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider mb-4">{trip.traveler_name || 'Traveler'} traveling</p>
                <p className="text-xl font-black mb-0.5" style={{ color: '#111827' }}>
                  {Math.ceil((new Date(trip.return_date) - new Date(trip.departure_date)) / (1000 * 60 * 60 * 24))} Days
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Trip Duration</p>
              </div>
            </div>

            {/* Accommodations & Services */}
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-5 tracking-tight" style={{ color: '#111827' }}>Bookings & Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trip.hotel ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Hotel size={18} className="text-emerald-600" />
                      <h3 className="font-bold" style={{ color: '#111827' }}>Hotel Accommodation</h3>
                    </div>
                    <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.hotel?.name || 'N/A'}</p>
                    <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{trip.hotel?.address || 'Address not available'}</p>
                    {trip.hotel?.price && (
                      <p className="text-xs font-black mt-3 text-emerald-600 bg-emerald-100 inline-block px-2.5 py-1 rounded-md">
                        ₹{Number(trip.hotel.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                      <Hotel size={24} />
                      <p className="text-xs font-bold">No hotel booked</p>
                    </div>
                  </div>
                )}

                {trip.cabService ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Car size={18} className="text-emerald-600" />
                      <h3 className="font-bold" style={{ color: '#111827' }}>Transportation</h3>
                    </div>
                    <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.cabService?.name || trip.cabService?.label || 'N/A'}</p>
                    <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{trip.cabService?.type || 'Cab Service'}</p>
                    {trip.cabService?.price && (
                      <p className="text-xs font-black mt-3 text-emerald-600 bg-emerald-100 inline-block px-2.5 py-1 rounded-md">
                        ₹{Number(trip.cabService.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                      <Car size={24} />
                      <p className="text-xs font-bold">No cab service booked</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guide Information */}
            {trip.guide && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Tour Guide</h3>
                <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.guide?.name || 'N/A'}</p>
                {trip.guide?.phone && (
                  <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                    <Phone size={12} /> {trip.guide.phone}
                  </p>
                )}
              </div>
            )}

            {trip.agencyGuide && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Assigned Agency Guide</h3>
                <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.agencyGuide.name}</p>
                <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                  <Compass size={12} /> {trip.agencyGuide.specialty}
                </p>
              </div>
            )}

            {/* Food Package Information */}
            {trip.foodPackage && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Food Package</h3>
                <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.foodPackage?.name || 'N/A'}</p>
                {trip.foodPackage?.price && (
                  <p className="text-xs font-black mt-2 text-emerald-600">₹{Number(trip.foodPackage.price).toLocaleString()}</p>
                )}
              </div>
            )}

            {/* Rental Vehicle Information */}
            {trip.rentalVehicle && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Rental Vehicle</h3>
                <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.rentalVehicle?.name || 'N/A'}</p>
                {trip.rentalVehicle?.price && (
                  <p className="text-xs font-black mt-2 text-emerald-600">₹{Number(trip.rentalVehicle.price).toLocaleString()}</p>
                )}
              </div>
            )}

            {trip.agencyVehicle && (
              <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold mb-2" style={{ color: '#111827' }}>Assigned Agency Vehicle</h3>
                <p className="text-base font-extrabold" style={{ color: '#111827' }}>{trip.agencyVehicle.model}</p>
                <p className="text-xs text-gray-600 mt-1.5">{trip.agencyVehicle.type} · Driver: {trip.agencyVehicle.driver}</p>
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="bg-gradient-to-r from-emerald-50 to-gray-50 rounded-3xl p-8 border border-gray-200">
              <h2 className="text-2xl font-black mb-6 tracking-tight" style={{ color: '#111827' }}>Price Breakdown</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 text-sm font-medium">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span style={{ color: '#111827' }}>₹{Number(trip.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax (GST)</span>
                  <span style={{ color: '#111827' }}>₹{Number(trip.tax || 0).toLocaleString()}</span>
                </div>
                {trip.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-bold text-emerald-600">-₹{Number(trip.discount || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black" style={{ color: '#111827' }}>Total Amount</span>
                <span className="text-3xl font-black text-emerald-600">
                  ₹{Number(trip.total_price || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer for PDF */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Trip ID: {trip.id}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show on screen, not in PDF */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
          {trip.status === 'pending' && (
            <button 
              onClick={handlePayNow} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm active:scale-95 transition-all"
            >
              Pay Now
            </button>
          )}
          {canCancel() && (
            <button 
              onClick={handleCancelTrip} 
              className="flex-1 rounded-xl font-extrabold text-xs tracking-wider uppercase py-3.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95"
            >
              Cancel Trip
            </button>
          )}
          <button 
            onClick={() => navigate('/my-trips')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-gray-300"
          >
            Back to Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripItinerary;