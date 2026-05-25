import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Compass, ArrowLeft } from 'lucide-react';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip_id');

  useEffect(() => {
    if (tripId) {
      paymentAPI.cancel(parseInt(tripId))
        .then(() => {
          toast.error('Payment checkout session was cancelled. Booking draft removed.');
        })
        .catch(err => console.error('Failed to notify payment cancel:', err));
    }
  }, [tripId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-surface max-w-md w-full p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500"
        >
          <XCircle size={48} />
        </motion.div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-black mb-3">Payment Cancelled</h1>
        <p className="text-[hsl(var(--text-muted))] mb-8">
          The payment checkout session was cancelled. Don't worry, no charges were made and no bookings were created.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/packages" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
            View Packages Again <Compass size={18} />
          </Link>
          <Link to="/" className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
            Back to Home <ArrowLeft size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
