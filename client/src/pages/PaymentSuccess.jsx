import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, ArrowRight, Loader } from 'lucide-react';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const tripId = searchParams.get('trip_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && tripId) {
      paymentAPI.confirm(sessionId, parseInt(tripId))
        .then(() => {
          setLoading(false);
          toast.success('Trip booking confirmed!');
        })
        .catch((err) => {
          console.error(err);
          setError(err.response?.data?.error || 'Failed to verify payment status.');
          setLoading(false);
          toast.error('Could not verify payment status.');
        });
    } else {
      setLoading(false);
      setError('Missing payment reference details.');
    }
  }, [sessionId, tripId]);

  useEffect(() => {
    if (!loading && !error && tripId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/trip-itinerary/${tripId}`);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, error, tripId, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-surface max-w-md w-full p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader className="animate-spin text-[hsl(var(--primary))]" size={48} />
            <h2 className="text-xl font-bold">Verifying your payment...</h2>
            <p className="text-sm text-[hsl(var(--text-muted))]">Please wait while we confirm your booking with Stripe.</p>
          </div>
        ) : error ? (
          <>
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500"
            >
              <XCircle size={48} />
            </motion.div>

            {/* Error Message */}
            <h1 className="text-3xl font-black mb-3">Verification Failed</h1>
            <p className="text-[hsl(var(--text-muted))] mb-8">
              {error}. If you were charged, please contact support with your session ID: <code className="block mt-2 p-2 bg-black/10 rounded font-mono text-xs">{sessionId}</code>
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Link to="/my-trips" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
                Go to My Trips <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500"
            >
              <CheckCircle size={48} />
            </motion.div>

            {/* Success Message */}
            <h1 className="text-3xl font-black mb-3">Booking Confirmed!</h1>
            <p className="text-[hsl(var(--text-muted))] mb-4">
              Thank you! Your payment was successful, and your trip is now officially booked.
            </p>

            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs font-bold text-emerald-600 mb-8 animate-pulse">
              Redirecting to your ticket pass in {countdown} seconds...
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Link to={`/trip-itinerary/${tripId}`} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
                View My Ticket <Calendar size={18} />
              </Link>
              <Link to="/" className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
                Back to Home <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
