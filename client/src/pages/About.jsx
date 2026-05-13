import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, Globe, Shield, Target, Lightbulb, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Dr. Aryan Kapoor', role: 'AI & ML Lead', avatar: 'AK', color: 'from-blue-500 to-blue-600' },
  { name: 'Sneha Verma', role: 'Full Stack Engineer', avatar: 'SV', color: 'from-purple-500 to-purple-600' },
  { name: 'Ravi Gupta', role: 'Smart City Analyst', avatar: 'RG', color: 'from-green-500 to-green-600' },
  { name: 'Meera Joshi', role: 'UX/UI Designer', avatar: 'MJ', color: 'from-orange-500 to-orange-600' },
];

const techStack = [
  { name: 'React + Tailwind', desc: 'Modern, responsive frontend', icon: '⚛️' },
  { name: 'Laravel REST API', desc: 'Secure, scalable backend', icon: '🔧' },
  { name: 'Supabase + PostgreSQL', desc: 'Real-time database', icon: '🗄️' },
  { name: 'Python FastAPI', desc: 'AI microservice layer', icon: '🐍' },
  { name: 'Hugging Face', desc: 'State-of-the-art AI models', icon: '🤖' },
  { name: 'Google Maps API', desc: 'Live mapping & routing', icon: '🗺️' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'Reducing overcrowding and improving tourist experiences through data intelligence.' },
  { icon: Lightbulb, title: 'Innovation First', desc: 'Cutting-edge AI models integrated with real-world city infrastructure.' },
  { icon: Shield, title: 'Privacy & Security', desc: 'JWT-secured APIs, role-based access control, and encrypted user data.' },
  { icon: Globe, title: 'Smart City Vision', desc: 'Building the foundations for tomorrow's intelligent tourism ecosystems.' },
];

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Award size={12} /> About SmartTourism
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Building the Future of <br />Smart City Tourism
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              We combine artificial intelligence, real-time data, and smart city infrastructure to revolutionise how tourists and city authorities manage urban tourism.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Our Mission</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Reducing Overcrowding, Optimising Cities
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Modern tourist cities face immense pressure during festivals, holidays, and peak seasons — traffic jams, overcrowded attractions, and strained infrastructure. SmartTourism uses AI-powered analytics to predict and prevent these issues before they happen.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              By giving tourists real-time crowd insights and smart route suggestions, and city authorities live dashboards and resource optimisation tools, we create a better experience for everyone.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
              Join the Platform <TrendingUp size={16} />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 gap-5">
            {[{ value: '50K+', label: 'Tourists Served', color: 'bg-blue-50 text-blue-600' },
              { value: '30%', label: 'Congestion Reduced', color: 'bg-green-50 text-green-600' },
              { value: '200+', label: 'Destinations', color: 'bg-purple-50 text-purple-600' },
              { value: '95%', label: 'AI Accuracy', color: 'bg-orange-50 text-orange-600' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-3xl p-8 text-center`}>
                <div className="text-4xl font-extrabold mb-2">{s.value}</div>
                <div className="text-sm font-medium opacity-80">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Core Values</p>
            <h2 className="text-4xl font-bold text-gray-900">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-blue-200">
                  <v.icon size={26} />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Technology Stack</p>
            <h2 className="text-4xl font-bold text-gray-900">Built with Modern Tech</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{tech.name}</h4>
                <p className="text-gray-400 text-xs">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">The Team</p>
            <h2 className="text-4xl font-bold text-gray-900">Meet the Builders</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
