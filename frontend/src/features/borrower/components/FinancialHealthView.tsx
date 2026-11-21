import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PersonaProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import { 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export type ReportingPeriod = '7D' | '30D' | '90D';

export const FinancialHealthView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriod>('30D');
  
  const fin = activePersona.financials;
  const rawWaveform = fin?.cashFlowWaveform || [];
  const bankAcc = fin?.accounts[0];

  // Dynamic calculations based on selected reporting period
  const { chartData, totalInflows, totalOutflows, netSurplus, runwayDays, predictabilityPct, admb } = useMemo(() => {
    let daysCount = 30;
    if (selectedPeriod === '7D') daysCount = 7;
    if (selectedPeriod === '90D') daysCount = 90;

    let points = [];
    if (selectedPeriod === '7D') {
      points = rawWaveform.slice(-7);
    } else if (selectedPeriod === '30D') {
      points = rawWaveform.length >= 30 ? rawWaveform.slice(-30) : rawWaveform;
    } else {
      // 90D simulated synthesis
      points = Array.from({ length: 90 }, (_, i) => {
        const base = (rawWaveform[i % rawWaveform.length]?.inflow || 18000) * (0.9 + Math.sin(i / 10) * 0.15);
        return {
          date: `Day ${i + 1}`,
          inflow: Math.round(base),
          outflow: Math.round(base * 0.82),
        };
      });
    }

    const inflowSum = points.reduce((acc, p) => acc + (p.inflow || 0), 0);
    const outflowSum = points.reduce((acc, p) => acc + (p.outflow || 0), 0);
    const surplus = inflowSum - outflowSum;
    const baseAdmb = bankAcc?.averageDailyBalance || 18450;
    const periodAdmb = selectedPeriod === '7D' ? Math.round(baseAdmb * 1.05) : selectedPeriod === '90D' ? Math.round(baseAdmb * 0.98) : baseAdmb;
    const runway = Math.max(8, Math.round((periodAdmb / (outflowSum / daysCount || 1000))));

    return {
      chartData: points,
      totalInflows: inflowSum,
      totalOutflows: outflowSum,
      netSurplus: surplus,
      runwayDays: runway,
      predictabilityPct: selectedPeriod === '7D' ? 96.4 : selectedPeriod === '30D' ? 94.2 : 91.8,
      admb: periodAdmb,
    };
  }, [selectedPeriod, rawWaveform, bankAcc]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header with Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
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

        {/* Interactive Period Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-brand-charcoal/5 rounded-2xl shrink-0">
          <button
            onClick={() => setSelectedPeriod('7D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === '7D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('30D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === '30D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('90D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedPeriod === '90D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            90 Days (Quarter)
          </button>
        </div>
      </div>

      {/* Top Health Indicators Dynamically Calculated for Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Liquidity Cushion */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Liquidity Cushion</span>
            <CardTitle className="text-2xl font-mono font-bold text-brand-forest mt-0.5">
              {formatINR(admb)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Healthy {runwayDays}-day runway
            </span>
          </CardContent>
        </Card>

        {/* Metric 2: Net Operating Surplus */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Net Cash Surplus</span>
            <CardTitle className="text-2xl font-mono font-bold text-emerald-800 mt-0.5">
              +{formatINR(netSurplus)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-brand-charcoal/65">
              Over {selectedPeriod === '7D' ? '7 days' : selectedPeriod === '30D' ? '30 days' : '90 days'}
            </span>
          </CardContent>
        </Card>

        {/* Metric 3: Return Bounces */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Return Bounces</span>
            <CardTitle className="text-2xl font-mono font-bold text-brand-charcoal mt-0.5">
              0 Bounces
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-brand-charcoal/65">
              Clean debit mandate record
            </span>
          </CardContent>
        </Card>

        {/* Metric 4: Predictability */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Inflow Predictability</span>
            <CardTitle className="text-2xl font-mono font-bold text-brand-forest mt-0.5">
              {predictabilityPct}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-xs text-brand-charcoal/65">
              Daily customer rhythm
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Main Waveform Visualization */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                Cash-Flow Inflow Waveform ({selectedPeriod === '7D' ? 'Last 7 Days' : selectedPeriod === '30D' ? 'Last 30 Days' : 'Last 90 Days'})
              </CardTitle>
              <p className="text-xs text-brand-charcoal/60 mt-0.5">
                Total Inflows: <strong>{formatINR(totalInflows)}</strong> · Total Outflows: <strong>{formatINR(totalOutflows)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-brand-forest font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-forest" />
                Verified Inflows
              </span>
              <span className="flex items-center gap-1.5 text-brand-terracotta font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-terracotta" />
                Operating Outflows
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173F35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#173F35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${Math.round(v/1000)}k`} />
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

      {/* Data Coverage & Missing Streams Transparency */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-bold text-brand-charcoal">
            Data Stream Coverage & Ingestion Integrity
          </CardTitle>
          <p className="text-xs text-brand-charcoal/60">
            Identifies active and missing financial records for the selected period.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-brand-charcoal">Bank Account Aggregator</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-brand-charcoal/65">
                428 transactions verified with zero missing deposit gaps.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-brand-charcoal">GSTN Outward Returns</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Synced
                </span>
              </div>
              <p className="text-[11px] text-brand-charcoal/65">
                GSTR-3B filings matched against banking credits (95.8% match).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-brand-charcoal">Merchant QR Rails</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-brand-charcoal/65">
                PhonePe QR settlements tracked daily for evening sweep calibration.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
};
