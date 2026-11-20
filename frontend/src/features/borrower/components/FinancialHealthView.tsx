import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import { Activity, TrendingUp, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const FinancialHealthView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const fin = activePersona.financials;
  const waveform = fin?.cashFlowWaveform || [];
  const bankAcc = fin?.accounts[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Cash-Flow Diagnostics
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Financial Health Mirror & Vitality Metrics
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Dynamic analysis of your enterprise’s operational cadence, daily liquidity cushion, and revenue stability.
        </p>
      </div>

      {/* Top 3 Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Liquidity Cushion</span>
            <CardTitle className="text-2xl font-mono text-brand-forest">
              {formatINR(bankAcc?.averageDailyBalance || 18450)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Healthy 22-day runway
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Bounce Rate (90d)</span>
            <CardTitle className="text-2xl font-mono text-emerald-800">
              0 Bounces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              100% clean bank debit history
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Inflow Predictability</span>
            <CardTitle className="text-2xl font-mono text-brand-forest">
              94.2%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Consistent retail demand pattern
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Main Waveform Visualization */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">30-Day Cash-Flow Inflow Waveform</CardTitle>
              <p className="text-xs text-brand-charcoal/60">Daily verified deposits and UPI merchant sweeps</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-brand-forest font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-forest" />
                Inflows
              </span>
              <span className="flex items-center gap-1 text-brand-charcoal/40">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-charcoal/20" />
                Outflows
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waveform}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173F35" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#173F35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(val: number) => [formatINR(val), 'Volume']}
                  contentStyle={{ backgroundColor: '#1A1A1A', color: '#F7F4EC', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="inflow" stroke="#173F35" strokeWidth={2.5} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="outflow" stroke="#C96B4B" strokeWidth={1.5} fillOpacity={0} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
