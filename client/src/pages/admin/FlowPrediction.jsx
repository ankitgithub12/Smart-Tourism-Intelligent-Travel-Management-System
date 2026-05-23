import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Brain, Sliders, AlertTriangle, ShieldCheck } from 'lucide-react';

const mockPredictionData = [
  { hour: '08:00', historic: 400, predicted: 420 },
  { hour: '10:00', historic: 750, predicted: 810 },
  { hour: '12:00', historic: 900, predicted: 1050 },
  { hour: '14:00', historic: 1100, predicted: 1250 },
  { hour: '16:00', historic: 850, predicted: 940 },
  { hour: '18:00', historic: 1200, predicted: 1350 },
  { hour: '20:00', historic: 1400, predicted: 1600 },
  { hour: '22:00', historic: 700, predicted: 850 },
];

export function FlowPrediction() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Brain size={24} className="text-[hsl(var(--primary))] animate-pulse" />
        <div>
          <h3 className="font-black text-base">AI Visitor Flow Projections</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Predictive neural network models forecasting crowd influx trends for the next 24 hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Chart */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h4 className="font-bold text-sm mb-6">Historical vs. AI Predicted Visitor Load</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPredictionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" fontSize={11} stroke="currentColor" tickLine={false} axisLine={false} className="opacity-50" />
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
                <Line type="monotone" dataKey="historic" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Historical Baseline" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={3} name="Predicted Flow" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Metrics & Recommendations */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-sm">Model Accuracy Rating</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
              <span className="font-bold">Confidence score:</span>
              <span className="font-black text-sm">94.8%</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">Model leverages past ticket sales, weather metrics, and calendar holiday markers to extrapolate hourly grids.</p>
          </div>

          <div className="glass-surface rounded-2xl p-5 shadow-sm space-y-3.5 border border-amber-500/10 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle size={18} />
              <h4 className="font-black text-xs uppercase tracking-wider">Early Mitigation Suggestion</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Predicted spike at <strong>20:00</strong> exceeds normal capacity thresholds by 15%. Proactive staging of transit vehicles (METRO-L1) is recommended to absorb load spikes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowPrediction;
