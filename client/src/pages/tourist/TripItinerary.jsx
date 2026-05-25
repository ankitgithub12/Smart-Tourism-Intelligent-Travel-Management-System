import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Hotel, Car, CheckCircle, Clock, XCircle, ArrowLeft, Download, Users, Phone, Mail, Compass } from 'lucide-react';
import api, { tripAPI } from '../../services/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
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
    if (!trip || !itineraryRef.current) {
      toast.error('Unable to generate PDF');
      return;
    }

    setDownloading(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      const element = itineraryRef.current;
      
      // Create a clone of the element to avoid modifying the original
      const cloneElement = element.cloneNode(true);
      cloneElement.style.width = '800px';
      cloneElement.style.padding = '40px';
      cloneElement.style.backgroundColor = '#ffffff';
      
      // Remove any problematic CSS variables or modern color functions
      const allElements = cloneElement.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove any inline styles that might contain oklch
        if (el.style) {
          const computedStyle = window.getComputedStyle(el);
          const bgColor = computedStyle.backgroundColor;
          const color = computedStyle.color;
          
          // Replace with solid colors
          if (bgColor && (bgColor.includes('oklch') || bgColor === 'rgba(0, 0, 0, 0)' || !bgColor)) {
            el.style.backgroundColor = '#ffffff';
          }
          if (color && (color.includes('oklch') || color === 'rgba(0, 0, 0, 0)')) {
            el.style.color = '#000000';
          }
        }
      });
      
      // Create a temporary container to render the clone
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.appendChild(cloneElement);
      document.body.appendChild(tempContainer);
      
      // Capture the cloned element
      const canvas = await html2canvas(cloneElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: cloneElement.scrollWidth,
        onclone: (clonedDoc, element) => {
          // Additional cleanup in the cloned document
          const clonedElements = clonedDoc.querySelectorAll('*');
          clonedElements.forEach(el => {
            const computedStyle = clonedDoc.defaultView.getComputedStyle(el);
            if (computedStyle.backgroundColor?.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            if (computedStyle.color?.includes('oklch')) {
              el.style.color = '#000000';
            }
          });
        }
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`trip_itinerary_${trip.id}_${trip.from_location}_to_${trip.to_destination}.pdf`);
      toast.success('Itinerary PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF generation error:', error);
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
              onClick={() => navigate(`/planner?step=5&trip_id=${trip.id}`)} 
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