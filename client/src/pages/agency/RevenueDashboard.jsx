import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RevenueDashboard({ data }) {
  const financials = data.financials || {};
  const cards = [
    { label: 'Total Earnings', value: `INR ${Number(financials.monthlyRevenue || 0).toLocaleString()}`, desc: 'Confirmed receipts this month', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Payouts', value: `INR ${Number(financials.pendingPayouts || 0).toLocaleString()}`, desc: 'Awaiting booking confirmation', icon: CreditCard, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Refund/Reversals', value: `INR ${Number(financials.refunds || 0).toLocaleString()}`, desc: 'Cancelled reservations', icon: RefreshCw, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">Revenue & Financial Ledger</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Values update from stored booking payments and statuses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-surface rounded-2xl p-5 shadow-sm border border-slate-200/40 dark:border-slate-800/40 stat-card-glow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
            <h4 className="text-2xl font-black mt-1">{card.value}</h4>
            <p className="text-[10px] text-slate-500 mt-2">{card.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="glass-surface rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-sm mb-6">Six-Month Confirmed Revenue</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyRevenueSeries || []}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
              <YAxis fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RevenueDashboard;
