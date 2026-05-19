import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-surface max-w-md w-full p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      >
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
        <p className="text-[hsl(var(--text-muted))] mb-8">
          Thank you! Your payment was successful, and your trip is now officially booked. You can download the PDF receipt in your trips list.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/my-trips" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
            View My Trips <Calendar size={18} />
          </Link>
          <Link to="/" className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 font-semibold">
            Back to Home <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
