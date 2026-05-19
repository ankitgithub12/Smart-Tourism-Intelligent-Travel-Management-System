import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Wave Top */}
      <div className="relative h-20">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" fill="hsl(var(--bg-dark-start))" opacity="0.95" />
          <path d="M0,50 C320,20 640,70 960,40 C1200,20 1360,60 1440,50 L1440,80 L0,80 Z" fill="hsl(var(--bg-dark-start))" />
        </svg>
      </div>

      <div className="bg-[hsl(var(--bg-dark-start))] text-white/90 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-xl flex items-center justify-center shadow-lg">
                  <Compass size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white">SmartTourism</p>
                  <p className="text-[10px] text-[hsl(var(--primary-light))] font-semibold tracking-wider uppercase">AI Powered</p>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                AI-powered smart tourism platform for seamless trip planning, hotel booking, and intelligent travel management.
              </p>
              <div className="flex gap-3">
                {[FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[hsl(var(--primary)/0.2)] hover:border-[hsl(var(--primary)/0.3)] transition-all">
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Explore</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Destinations', path: '/destinations' },
                  { label: 'Travel Packages', path: '/packages' },
                  { label: 'Hotels', path: '/hotels' },
                  { label: 'Smart Planner', path: '/planner' },
                  { label: 'AI Assistant', path: '/ai-assistant' },
                ].map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-white/40 hover:text-[hsl(var(--primary-light))] transition-colors flex items-center gap-2 group">
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', path: '/about' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Privacy Policy', path: '/privacy' },
                  { label: 'Terms of Service', path: '/terms' },
                  { label: 'Careers', path: '/careers' },
                ].map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-white/40 hover:text-[hsl(var(--primary-light))] transition-colors flex items-center gap-2 group">
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Stay Updated</h4>
              <p className="text-sm text-white/40 mb-4">Get travel tips & exclusive deals straight to your inbox.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[hsl(var(--primary)/0.4)] transition-colors"
                />
                <button className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-xs text-white/30 flex items-center gap-2"><Phone size={12} /> +91 98765 43210</p>
                <p className="text-xs text-white/30 flex items-center gap-2"><Mail size={12} /> hello@smarttourism.com</p>
                <p className="text-xs text-white/30 flex items-center gap-2"><MapPin size={12} /> India</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/30">© {year} SmartTourism. All rights reserved.</p>
            <p className="text-xs text-white/30">Built with ❤️ using AI & Modern Technology</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
