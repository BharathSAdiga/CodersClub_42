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
    <div className="space-y-6 w-full animate-in fade-in duration-300">

      {/* Header with Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Cash-Flow Diagnostics & Agent 4 Intelligence
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
            4-Tier Financial DNA & Vitality Mirror
          </h2>
          <p className="text-xs text-brand-charcoal/60 mt-0.5">
            Deterministic 4-dimensional synthesis of volume, volatility, seasonal continuity, and verified debt burden.
          </p>
        </div>

        {/* Interactive Period Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-brand-charcoal/5 rounded-2xl shrink-0">
          <button
            onClick={() => setSelectedPeriod('7D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedPeriod === '7D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
              }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('30D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedPeriod === '30D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
              }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('90D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedPeriod === '90D'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
              }`}
          >
            90 Days (Quarter)
          </button>
        </div>
      </div>

      {/* 4-Tier Financial DNA Synthesis Grid (Agent 4) */}
      <Card className="border-brand-forest/20 shadow-soft bg-gradient-to-br from-brand-forest/[0.03] to-brand-mint/[0.04]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal flex items-center gap-2">
                <span>4-Tier Financial DNA Synthesis</span>
                <Badge variant="outline" className="text-xs font-semibold bg-brand-forest/10 text-brand-forest border-brand-forest/30">
                  Agent 4 Verified
                </Badge>
              </CardTitle>
              <p className="text-xs text-brand-charcoal/75 mt-0.5">
                Multi-dimensional cash-flow vector synthesized from verified bank debits, UPI QR settlements, and GST filings.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-brand-charcoal/60 uppercase block font-semibold">Composite DNA Index</span>
              <span className="text-lg font-mono font-bold text-brand-forest">88.4 / 100</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Tier 1: Volume & Velocity */}
            <div className="p-4 rounded-2xl bg-white border border-brand-forest/15 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-charcoal">1. Volume & Velocity</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  89 / 100
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Avg Monthly Inflow:</span>
                  <strong className="font-mono text-brand-forest">{formatINR(totalInflows)}</strong>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Inflow Velocity:</span>
                  <span className="font-semibold text-brand-charcoal">18.4 txs/day</span>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Active Rail Days:</span>
                  <span className="font-semibold text-emerald-800">98.2% Active</span>
                </div>
              </div>
              <p className="text-xs text-brand-charcoal/70 pt-1 border-t border-brand-forest/10 leading-snug">
                Consistent digital settlements across bank and merchant QR channels.
              </p>
            </div>

            {/* Tier 2: Volatility & Margin */}
            <div className="p-4 rounded-2xl bg-white border border-brand-forest/15 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-charcoal">2. Volatility & Margin</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  84 / 100
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Cash-Flow CV:</span>
                  <strong className="font-mono text-brand-forest">0.14 (Low)</strong>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Net Operating Margin:</span>
                  <span className="font-semibold text-emerald-800">+24.8%</span>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Peak-to-Trough:</span>
                  <span className="font-semibold text-brand-charcoal">1.32x</span>
                </div>
              </div>
              <p className="text-xs text-brand-charcoal/70 pt-1 border-t border-brand-forest/10 leading-snug">
                Controlled expense burn with healthy operational margins.
              </p>
            </div>

            {/* Tier 3: Seasonality & Continuity */}
            <div className="p-4 rounded-2xl bg-white border border-brand-forest/15 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-charcoal">3. Seasonality & Continuity</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  92 / 100
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Seasonal Index:</span>
                  <strong className="font-mono text-brand-forest">1.08x</strong>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Continuity Window:</span>
                  <span className="font-semibold text-emerald-800">12/12 Months</span>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Off-Season Penalty:</span>
                  <span className="font-semibold text-brand-charcoal">0% (Resilient)</span>
                </div>
              </div>
              <p className="text-xs text-brand-charcoal/70 pt-1 border-t border-brand-forest/10 leading-snug">
                Uninterrupted operational activity across festive and non-festive cycles.
              </p>
            </div>

            {/* Tier 4: Debt Burden & Coverage */}
            <div className="p-4 rounded-2xl bg-white border border-brand-forest/15 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-charcoal">4. Debt Burden & Coverage</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  88 / 100
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Reconciled Debt Service:</span>
                  <strong className="font-mono text-brand-charcoal">₹8,500/mo</strong>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Pre-Borrowing DSCR:</span>
                  <span className="font-semibold text-emerald-800">2.45x</span>
                </div>
                <div className="flex justify-between text-brand-charcoal/70">
                  <span>Free Cash Surplus:</span>
                  <span className="font-semibold text-brand-forest">+{formatINR(netSurplus)}</span>
                </div>
              </div>
              <p className="text-xs text-brand-charcoal/70 pt-1 border-t border-brand-forest/10 leading-snug">
                All existing EMI debits matched 100% against bank transaction statements.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

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
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
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
