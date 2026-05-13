import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, Twitter, Instagram, Facebook, Linkedin, ArrowRight } from 'lucide-react';

const footerLinks = {
  Explore: [
    { label: 'Destinations', path: '/destinations' },
    { label: 'AI Recommendations', path: '/ai-recommendations' },
    { label: 'Smart Routes', path: '/dashboard' },
    { label: 'Crowd Status', path: '/dashboard' },
  ],
  Account: [
    { label: 'My Profile', path: '/profile' },
    { label: 'My Trips', path: '/trips' },
    { label: 'Saved Places', path: '/saved' },
    { label: 'Login / Register', path: '/login' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Branding Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Compass size={20} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg block leading-none">SmartTourism</span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">AI Powered Platform</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Revolutionizing urban tourism with real-time AI insights, smart crowd management, and personalized travel planning for a better city experience.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-gray-400">
                <MapPin size={14} className="text-blue-500 shrink-0" />
                Smart City HQ, Jaipur, Rajasthan 302001
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Phone size={14} className="text-blue-500 shrink-0" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <Mail size={14} className="text-blue-500 shrink-0" />
                hello@smarttourism.ai
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{group}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-blue-400 text-sm transition-colors flex items-center gap-1 group"
                    >
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Smart Tourism & Intelligent Travel Management. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Icon size={16} className="text-gray-400 hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
