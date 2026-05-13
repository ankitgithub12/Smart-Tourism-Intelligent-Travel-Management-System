import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Compass, User, UserCog, AlertCircle, CheckCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const roles = [
  { value: 'tourist', label: '🧳 Tourist', desc: 'I want to explore destinations' },
  { value: 'agency', label: '🏢 Travel Agency', desc: 'I manage travel services' },
  { value: 'authority', label: '🏛️ City Authority', desc: 'I manage city tourism' },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'tourist' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, dismissError } = useAuth();

  const handleChange = (e) => {
    dismissError();
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Compass size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">SmartTourism</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input id="reg-name" type="text" name="name" value={formData.name}
                  onChange={handleChange} required placeholder="Your full name"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input id="reg-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required minLength={8} placeholder="Min. 8 characters"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <label key={role.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="role" value={role.value}
                      checked={formData.role === role.value} onChange={handleChange} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      formData.role === role.value ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {formData.role === role.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{role.label}</span>
                      <p className="text-xs text-gray-400">{role.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} id="register-submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-60">
              {loading ? 'Creating Account...' : <><CheckCircle size={18} /> Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="#" className="text-blue-600 hover:underline">Terms of Service</Link> and{' '}
            <Link to="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>

      {/* Right decorative */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <UserCog size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Join the Platform</h2>
          <p className="text-blue-200 leading-relaxed">
            Get access to AI-powered travel recommendations, live crowd monitoring, smart routing, and a personalised dashboard.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {['Free AI travel recommendations', 'Real-time crowd alerts', 'Smart route suggestions', 'Booking management'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-blue-100">
                <CheckCircle size={16} className="text-green-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
