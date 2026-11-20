import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
<<<<<<< HEAD
import { 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

type StressPresetKey = 
  | 'NORMAL' 
  | 'REV_DROP_15' 
  | 'REV_DROP_30_TWO_MOS' 
  | 'OPEX_SURGE_15' 
  | 'RECEIVABLES_DELAY_30' 
  | 'COMBINED_SHOCK';

export const WhatIfSimulatorView: React.FC = () => {
  const [admb, setAdmb] = useState<number>(18450);
  const [monthlyUpi, setMonthlyUpi] = useState<number>(512000);
  const [selectedStressPreset, setSelectedStressPreset] = useState<StressPresetKey>('NORMAL');

  // Dynamic calculations for Counterfactual growth
=======
import { Sparkles, Sliders, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const WhatIfSimulatorView: React.FC = () => {
  const [admb, setAdmb] = useState<number>(18450);
  const [monthlyUpi, setMonthlyUpi] = useState<number>(512000);

  // Dynamic calculations
>>>>>>> origin/feature/harshitha-finance
  const baseLimit = 150000;
  const admbDeltaBonus = Math.max(0, (admb - 15000) * 4);
  const upiDeltaBonus = Math.max(0, (monthlyUpi - 400000) * 0.22);
  const projectedLimit = Math.round(baseLimit + admbDeltaBonus + upiDeltaBonus);
  const unlockedIncrease = projectedLimit - baseLimit;
  const projectedApr = Math.max(11.8, Number((14.5 - (unlockedIncrease / 100000) * 0.45).toFixed(1)));

<<<<<<< HEAD
  // Cash-Flow Twin 6-Scenario Stress Simulation Data (Feature 7 Requirement)
  const stressPresets: Record<StressPresetKey, {
    label: string;
    cfads: number; // Cash Available for Debt Service
    dscr: number;  // Debt Service Coverage Ratio
    recoveryDays: number;
    reserveDepletion: string;
    viability: 'SAFE' | 'CONDITIONAL' | 'HIGH_RISK';
    description: string;
  }> = {
    NORMAL: {
      label: 'Normal Baseline Scenario',
      cfads: 78500,
      dscr: 2.14,
      recoveryDays: 0,
      reserveDepletion: '0% (Cash generative)',
      viability: 'SAFE',
      description: 'Historical verified baseline. Inflows comfortably exceed debt obligations.'
    },
    REV_DROP_15: {
      label: '15% Revenue Decline',
      cfads: 54200,
      dscr: 1.58,
      recoveryDays: 14,
      reserveDepletion: '12% buffer utilization',
      viability: 'SAFE',
      description: 'Temporary localized demand dip. Debt service remains protected above 1.5x.'
    },
    REV_DROP_30_TWO_MOS: {
      label: '30% Drop (2 Months)',
      cfads: 36800,
      dscr: 1.08,
      recoveryDays: 45,
      reserveDepletion: '48% reserve buffer drawn',
      viability: 'CONDITIONAL',
      description: 'Severe demand trough (monsoon/lockdown). Sachet daily sweep adjustments required.'
    },
    OPEX_SURGE_15: {
      label: '15% Expense Inflation',
      cfads: 49100,
      dscr: 1.42,
      recoveryDays: 20,
      reserveDepletion: '18% buffer draw',
      viability: 'SAFE',
      description: 'Input cost price surge from suppliers. Operating margins shrink but stay positive.'
    },
    RECEIVABLES_DELAY_30: {
      label: '30-Day Customer Delay',
      cfads: 41200,
      dscr: 1.18,
      recoveryDays: 30,
      reserveDepletion: '35% temporary liquidity transit',
      viability: 'CONDITIONAL',
      description: 'Key wholesale clients delay cheque clearances by one full billing cycle.'
    },
    COMBINED_SHOCK: {
      label: 'Combined Stress Shock',
      cfads: 24500,
      dscr: 0.72,
      recoveryDays: 75,
      reserveDepletion: '82% acute reserve strain',
      viability: 'HIGH_RISK',
      description: 'Simultaneous -20% sales and 15% inflation shock. Triggers early warning protocol.'
    }
  };

  const activeStress = stressPresets[selectedStressPreset];

=======
>>>>>>> origin/feature/harshitha-finance
  const handleApplySimulatedTarget = () => {
    toast.success(`Target roadmap saved! Maintain ₹${admb.toLocaleString('en-IN')} ADMB for 30 days to unlock ${formatINR(projectedLimit)}.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-terracotta font-bold">
<<<<<<< HEAD
          Empowerment Coaching & Stress Testing
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Counterfactual "What-If" & Cash-Flow Twin Simulator
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Simulate business growth levers and stress-test your debt resilience against real-world economic shocks.
        </p>
      </div>

      {/* Part 1: Cash-Flow Twin 6-Scenario Stress Simulator (Feature 7) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cash-Flow Twin Resilience Stress-Test</CardTitle>
              <p className="text-xs text-brand-charcoal/60 mt-0.5">
                Simulate your business's Debt Service Coverage Ratio (DSCR) under 6 economic shock presets
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                activeStress.viability === 'SAFE' 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                  : activeStress.viability === 'CONDITIONAL' 
                  ? 'border-amber-300 bg-amber-50 text-amber-800' 
                  : 'border-rose-300 bg-rose-50 text-rose-800'
              }`}
            >
              DSCR {activeStress.dscr}x • {activeStress.viability.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(stressPresets) as StressPresetKey[]).map((key) => {
              const item = stressPresets[key];
              const isSelected = selectedStressPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedStressPreset(key)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected 
                      ? 'border-brand-forest bg-brand-forest text-white shadow-sm font-semibold' 
                      : 'border-brand-forest/15 bg-brand-ivory/60 hover:bg-brand-ivory text-brand-charcoal text-xs'
                  }`}
                >
                  <span className="text-[11px] block leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stress Shock Output Box */}
          <div className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Cash Available for Debt (CFADS)
              </span>
              <span className="text-base font-bold font-mono text-brand-charcoal mt-0.5 block">
                ₹{activeStress.cfads.toLocaleString('en-IN')}/mo
              </span>
              <span className="text-[10px] text-brand-charcoal/60">Against ₹36,500 repayment</span>
            </div>

            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Reserve Buffer Depletion
              </span>
              <span className="text-base font-bold font-mono text-brand-forest mt-0.5 block">
                {activeStress.reserveDepletion}
              </span>
              <span className="text-[10px] text-brand-charcoal/60">Estimated recovery: {activeStress.recoveryDays} days</span>
            </div>

            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Stress Finding Summary
              </span>
              <p className="text-[11px] text-brand-charcoal/80 mt-0.5 leading-snug">
                {activeStress.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Part 2: Counterfactual Path-to-Yes Levers (Feature 12) */}
=======
          Empowerment Coaching
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Counterfactual "What-If" Credit Simulator
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          See exactly how specific operational improvements will automatically boost your credit limit and slash your interest rates.
        </p>
      </div>

>>>>>>> origin/feature/harshitha-finance
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operational Improvement Targets</CardTitle>
              <p className="text-xs text-brand-charcoal/60">
                Slide parameters to simulate your business growth roadmap.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Slider 1: Average Daily Balance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-brand-charcoal block">Target Average Daily Balance (ADMB)</span>
                    <span className="text-[10px] text-brand-charcoal/50">Current baseline: ₹18,450</span>
                  </div>
                  <span className="font-mono font-bold text-brand-forest text-sm">{formatINR(admb)}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="60000"
                  step="2500"
                  value={admb}
                  onChange={(e) => setAdmb(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                />
              </div>

              {/* Slider 2: Monthly UPI Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-brand-charcoal block">Target Monthly UPI QR Volume</span>
                    <span className="text-[10px] text-brand-charcoal/50">Current baseline: ₹5,12,000</span>
                  </div>
                  <span className="font-mono font-bold text-brand-forest text-sm">{formatINR(monthlyUpi)}</span>
                </div>
                <input
                  type="range"
<<<<<<< HEAD
                  min="350000"
                  max="900000"
=======
                  min="400000"
                  max="1200000"
>>>>>>> origin/feature/harshitha-finance
                  step="25000"
                  value={monthlyUpi}
                  onChange={(e) => setMonthlyUpi(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                />
              </div>

<<<<<<< HEAD
              <div className="p-3.5 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                <p className="text-brand-charcoal/80 leading-relaxed text-[11px]">
                  <strong>Path-to-Yes Recommendation:</strong> Maintaining ₹35,000+ balance for 14 consecutive days will graduate your enterprise to Tier A pricing.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleApplySimulatedTarget}
                className="w-full bg-brand-forest text-white hover:bg-brand-forest/90 text-xs py-2.5"
              >
                Save This Target to My Action Plan
              </Button>
=======
              {/* Actionable Recourse Note */}
              <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 text-xs text-brand-charcoal/80 space-y-1">
                <span className="font-bold text-brand-forest block">Actionable Recourse:</span>
                <p>
                  "Achieving an ADMB of {formatINR(admb)} across the next 30 days provides verified liquidity stability, unlocking an immediate facility upgrade."
                </p>
              </div>

>>>>>>> origin/feature/harshitha-finance
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        {/* Dynamic Simulated Outcome Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-brand-charcoal text-brand-ivory border border-white/10 shadow-elevated space-y-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-brand-mint font-bold block">
                Simulated Credit Unlocked
              </span>
              <h3 className="text-3xl font-display font-extrabold text-white font-mono mt-1">
                {formatINR(projectedLimit)}
              </h3>
              <span className="text-xs text-white/60 block mt-0.5">
                +{formatINR(unlockedIncrease)} potential expansion
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Estimated APR:</span>
                <span className="font-mono font-bold text-brand-mint">{projectedApr}% p.a.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Target Timeline:</span>
                <span className="font-mono text-white">30 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Simulation Mode:</span>
                <Badge variant="mint" className="text-[10px]">Deterministic Recourse</Badge>
              </div>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed pt-2 border-t border-white/10">
              *Projections are indicative and depend on continuous Account Aggregator synchronization and underwriter review.
            </p>
=======
        {/* Real-Time Projected Output Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl p-6 bg-brand-forest text-brand-ivory border border-brand-forest/30 shadow-card space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/15">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
                Projected Capacity
              </span>
              <Badge variant="mint" className="text-[10px]">
                +{formatINR(unlockedIncrease)}
              </Badge>
            </div>

            <div>
              <span className="text-xs text-white/70 block">Estimated Credit Line</span>
              <div className="text-4xl font-display font-extrabold text-white tracking-tight font-mono my-1">
                {formatINR(projectedLimit)}
              </div>
              <span className="text-[11px] text-white/60">
                Unlocked within 30 days of consistent metrics
              </span>
            </div>

            <div className="space-y-2 py-3 border-t border-white/15 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Baseline Line:</span>
                <span className="font-mono text-white">{formatINR(baseLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Projected APR:</span>
                <span className="font-mono text-brand-mint font-bold">{projectedApr}%</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Sweep Capacity:</span>
                <span className="font-mono text-white font-bold">
                  {formatINR(Math.round((projectedLimit * 1.13) / 90))} / day
                </span>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              onClick={handleApplySimulatedTarget}
              className="w-full gap-2 mt-2"
            >
              <span>Commit to Target Growth</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
>>>>>>> origin/feature/harshitha-finance
          </div>
        </div>

      </div>
    </div>
  );
};
