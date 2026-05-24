import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Hotel, Car, CheckCircle, Clock, XCircle, ArrowLeft, Download, Users, Phone, Mail } from 'lucide-react';
import api, { tripAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TripItinerary = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

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
      
      // Check if it's a 404 error
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

  const handleDownloadPDF = () => {
    if (!trip) return;
    toast.success('Itinerary PDF downloaded successfully!');
    // PDF download logic would go here
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
    confirmed: 'bg-emerald-500/10 text-emerald-500',
    completed: 'bg-blue-500/10 text-blue-500',
    pending: 'bg-amber-500/10 text-amber-500',
    cancelled: 'bg-rose-500/10 text-rose-500',
  };

  const statusIcons = {
    confirmed: <CheckCircle size={16} />,
    completed: <CheckCircle size={16} />,
    pending: <Clock size={16} />,
    cancelled: <XCircle size={16} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen py-10 px-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <button onClick={() => navigate('/my-trips')} className="btn-primary">Back to My Trips</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/my-trips')} className="flex items-center gap-2 text-[hsl(var(--primary))] hover:gap-3 transition-all">
            <ArrowLeft size={20} /> Back to My Trips
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 btn-secondary !py-2 !px-4">
            <Download size={16} /> Download PDF
          </button>
        </div>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-surface rounded-3xl p-8 mb-8">
          {/* Trip Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b border-[hsl(var(--primary)/0.1)]">
            <div>
              <h1 className="text-4xl font-black mb-2">{trip.from_location} <span className="text-[hsl(var(--text-muted))] text-lg mx-3">→</span> {trip.to_destination}</h1>
              {trip.description && <p className="text-[hsl(var(--text-muted))] text-lg">{trip.description}</p>}
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${statusColors[trip.status]}`}>
              {statusIcons[trip.status]} {trip.status}
            </span>
          </div>

          {/* Trip Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Dates */}
            <div className="bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-[hsl(var(--primary))]" />
                <h3 className="font-bold">Travel Dates</h3>
              </div>
              <p className="text-2xl font-black mb-1">{new Date(trip.departure_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="text-sm text-[hsl(var(--text-muted))] mb-3">Departure</p>
              <p className="text-2xl font-black mb-1">{new Date(trip.return_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="text-sm text-[hsl(var(--text-muted))]">Return</p>
            </div>

            {/* Travelers */}
            <div className="bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-[hsl(var(--primary))]" />
                <h3 className="font-bold">Travelers & Duration</h3>
              </div>
              <p className="text-2xl font-black mb-1">{trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}</p>
              <p className="text-sm text-[hsl(var(--text-muted))] mb-3">{trip.traveler_name || 'Traveler'} traveling</p>
              <p className="text-2xl font-black mb-1">{Math.ceil((new Date(trip.return_date) - new Date(trip.departure_date)) / (1000 * 60 * 60 * 24))} Days</p>
              <p className="text-sm text-[hsl(var(--text-muted))]">Trip Duration</p>
            </div>
          </div>

          {/* Accommodations & Services */}
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-4">Bookings & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.hotel ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Hotel size={20} className="text-[hsl(var(--primary))]" />
                    <h3 className="font-bold">Hotel Accommodation</h3>
                  </div>
                  <p className="text-lg font-black">{trip.hotel?.name || 'N/A'}</p>
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-2">{trip.hotel?.address || 'Address not available'}</p>
                  {trip.hotel?.price && <p className="text-sm font-semibold mt-2 text-[hsl(var(--primary))]">₹{trip.hotel.price.toLocaleString()}</p>}
                </motion.div>
              ) : (
                <div className="bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-dashed border-[hsl(var(--primary)/0.2)]">
                  <div className="flex items-center gap-2 text-[hsl(var(--text-muted))]">
                    <Hotel size={20} />
                    <p className="font-bold">No hotel booked</p>
                  </div>
                </div>
              )}

              {trip.cabService ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={20} className="text-[hsl(var(--primary))]" />
                    <h3 className="font-bold">Transportation</h3>
                  </div>
                  <p className="text-lg font-black">{trip.cabService?.name || trip.cabService?.label || 'N/A'}</p>
                  <p className="text-sm text-[hsl(var(--text-muted))] mt-2">{trip.cabService?.type || 'Cab Service'}</p>
                  {trip.cabService?.price && <p className="text-sm font-semibold mt-2 text-[hsl(var(--primary))]">₹{trip.cabService.price.toLocaleString()}</p>}
                </motion.div>
              ) : (
                <div className="bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-dashed border-[hsl(var(--primary)/0.2)]">
                  <div className="flex items-center gap-2 text-[hsl(var(--text-muted))]">
                    <Car size={20} />
                    <p className="font-bold">No cab service booked</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guide Information */}
          {trip.guide ? (
            <div className="mb-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Tour Guide</h3>
              <p className="text-lg font-semibold">{trip.guide?.name || 'N/A'}</p>
              {trip.guide?.phone && <p className="text-sm text-[hsl(var(--text-muted))] mt-1">{trip.guide.phone}</p>}
            </div>
          ) : null}

          {trip.agencyGuide ? (
            <div className="mb-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Assigned Agency Guide</h3>
              <p className="text-lg font-semibold">{trip.agencyGuide.name}</p>
              <p className="text-sm text-[hsl(var(--text-muted))] mt-1">{trip.agencyGuide.specialty}</p>
            </div>
          ) : null}

          {/* Food Package Information */}
          {trip.foodPackage ? (
            <div className="mb-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Food Package</h3>
              <p className="text-lg font-semibold">{trip.foodPackage?.name || 'N/A'}</p>
              {trip.foodPackage?.price && <p className="text-sm text-[hsl(var(--primary))] font-semibold mt-2">₹{trip.foodPackage.price.toLocaleString()}</p>}
            </div>
          ) : null}

          {/* Rental Vehicle Information */}
          {trip.rentalVehicle ? (
            <div className="mb-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Rental Vehicle</h3>
              <p className="text-lg font-semibold">{trip.rentalVehicle?.name || 'N/A'}</p>
              {trip.rentalVehicle?.price && <p className="text-sm text-[hsl(var(--primary))] font-semibold mt-2">₹{trip.rentalVehicle.price.toLocaleString()}</p>}
            </div>
          ) : null}

          {trip.agencyVehicle ? (
            <div className="mb-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Assigned Agency Vehicle</h3>
              <p className="text-lg font-semibold">{trip.agencyVehicle.model}</p>
              <p className="text-sm text-[hsl(var(--text-muted))] mt-1">{trip.agencyVehicle.type} · Driver: {trip.agencyVehicle.driver}</p>
            </div>
          ) : null}

          {/* Pricing Breakdown */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] rounded-2xl p-8 border border-[hsl(var(--primary)/0.1)]">
            <h2 className="text-2xl font-black mb-6">Price Breakdown</h2>
            <div className="space-y-3 mb-6 pb-6 border-b border-[hsl(var(--primary)/0.2)]">
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-muted))]">Subtotal</span>
                <span className="font-semibold">₹{(trip.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-muted))]">Tax (GST)</span>
                <span className="font-semibold">₹{(trip.tax || 0).toLocaleString()}</span>
              </div>
              {trip.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--text-muted))]">Discount</span>
                  <span className="font-semibold text-emerald-500">-₹{(trip.discount || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-black">Total Amount</span>
              <span className="text-3xl font-black text-[hsl(var(--primary))]">₹{(trip.total_price || 0).toLocaleString()}</span>
            </div>
          </div>

          {trip.status !== 'cancelled' && (
            <div className="mt-8 bg-[hsl(var(--primary)/0.05)] rounded-2xl p-6 border border-[hsl(var(--primary)/0.1)]">
              <h3 className="font-bold mb-3">Rate This Booking</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={rating || trip.rating || ''} onChange={(e) => setRating(e.target.value)} className="glass-surface rounded-xl px-4 py-3 text-sm outline-none">
                  <option value="">Choose rating</option>
                  {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} Stars</option>)}
                </select>
                <button onClick={handleRateTrip} className="btn-primary !py-3 !px-5 text-sm">Save Rating</button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-between">
            {trip.status === 'pending' && (
              <button className="btn-primary flex-1">Pay Now</button>
            )}
            {canCancel() && (
              <button onClick={handleCancelTrip} className="flex-1 rounded-xl font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">Cancel Trip</button>
            )}
            <button onClick={() => navigate('/my-trips')} className="btn-secondary flex-1">Back to Trips</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripItinerary;
