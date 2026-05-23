import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Wallet, CreditCard, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const monthData = [
  { month: 'Jan', amount: 180000 },
  { month: 'Feb', monthAmount: 220000 },
  { month: 'Mar', amount: 250000 },
  { month: 'Apr', amount: 280000 },
  { month: 'May', amount: 340000 }
];

export function RevenueDashboard({ data }) {
  const cards = [
    { label: 'Total Earnings', value: '₹3,40,000', change: '+15.2%', desc: 'Gross receipts this month', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Payouts', value: '₹12,500', change: '8 bookings', desc: 'Awaiting trip completions', icon: CreditCard, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Refund/Reversals', value: '₹4,500', change: '-2.4%', desc: 'Cancelled reservations', icon: RefreshCw, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Revenue & Financial Ledger</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Monitor payments, payouts, and monthly gross profit margins</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 stat-card-glow flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                card.color === 'text-rose-500' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {card.change}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
              <h4 className="text-2xl font-black mt-1">{card.value}</h4>
              <p className="text-[10px] text-slate-500 mt-2">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-sm mb-6">Year-to-Date Revenue Growth</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
              <YAxis fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RevenueDashboard;
