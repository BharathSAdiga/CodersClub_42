import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { PersonaProfile } from '@/types';
import { apiService, BackendShockResult } from '@/services/apiService';
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
  Layers,
  Cpu,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export type StressPresetKey = 
  | 'NORMAL' 
  | 'REV_DROP_15' 
  | 'REV_DROP_30_TWO_MOS' 
  | 'OPEX_SURGE_15' 
  | 'RECEIVABLES_DELAY_30' 
  | 'COMBINED_SHOCK';

export const WhatIfSimulatorView: React.FC<{ activePersona?: PersonaProfile }> = ({ activePersona }) => {
  // Operational Target Roadmap State
  const [admb, setAdmb] = useState<number>(18450);
  const [monthlyUpi, setMonthlyUpi] = useState<number>(512000);

  // Stress Simulator State
  const [selectedStressPreset, setSelectedStressPreset] = useState<StressPresetKey>('REV_DROP_30_TWO_MOS');
  const [revenueShockPct, setRevenueShockPct] = useState<number>(30);
  const [expenseInflationPct, setExpenseInflationPct] = useState<number>(15);
  const [receivablesDelayDays, setReceivablesDelayDays] = useState<number>(30);
  
  const [liveStressResult, setLiveStressResult] = useState<BackendShockResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Business Parameters
  const initialBiz = activePersona?.business;
  const bizId = initialBiz?.id || 'biz_artisan_02';
  const baselineMonthlyTurnover = initialBiz ? 340000 : 285000;
  const existingMonthlyEmi = 8500;

  // Preset definitions
  const stressPresets: Record<StressPresetKey, {
    label: string;
    rev: number;
    opex: number;
    delay: number;
    description: string;
  }> = {
    NORMAL: {
      label: 'Normal Baseline Scenario',
      rev: 0,
      opex: 0,
      delay: 0,
      description: 'Historical verified baseline. Inflows comfortably exceed debt obligations.'
    },
    REV_DROP_15: {
      label: '15% Revenue Decline',
      rev: 15,
      opex: 0,
      delay: 0,
      description: 'Temporary localized demand dip. Debt service remains protected above 1.5x.'
    },
    REV_DROP_30_TWO_MOS: {
      label: '30% Drop (2 Months)',
      rev: 30,
      opex: 0,
      delay: 0,
      description: 'Severe demand trough (monsoon/lockdown). Sachet daily sweep adjustments required.'
    },
    OPEX_SURGE_15: {
      label: '15% Expense Inflation',
      rev: 0,
      opex: 15,
      delay: 0,
      description: 'Input cost price surge from suppliers. Operating margins shrink but stay positive.'
    },
    RECEIVABLES_DELAY_30: {
      label: '30-Day Customer Delay',
      rev: 0,
      opex: 0,
      delay: 30,
      description: 'Key wholesale clients delay cheque clearances by one full billing cycle.'
    },
    COMBINED_SHOCK: {
      label: 'Combined Stress Shock',
      rev: 20,
      opex: 15,
      delay: 30,
      description: 'Simultaneous -20% sales and 15% inflation shock. Triggers early warning protocol.'
    }
  };

  const handleSelectPreset = (key: StressPresetKey) => {
    setSelectedStressPreset(key);
    const p = stressPresets[key];
    setRevenueShockPct(p.rev);
    setExpenseInflationPct(p.opex);
    setReceivablesDelayDays(p.delay);
    triggerSimulation(p.rev, p.opex, p.delay, p.label);
  };

  const triggerSimulation = (rev: number, opex: number, delay: number, scenarioName?: string) => {
    setIsSimulating(true);
    apiService.simulateResilience(bizId, {
      scenario_name: scenarioName || `Custom Stress (-${rev}% Rev, +${opex}% Opex)`,
      revenue_contraction_pct: rev,
      cogs_inflation_pct: opex,
      receivable_delay_days: delay,
    })
    .then((res) => {
      setLiveStressResult(res);
      setIsSimulating(false);
      toast.success(`Stress test simulated: Stressed DSCR ${res.post_shock_dscr?.toFixed(2) || '1.18'}x`);
    })
    .catch((err) => {
      console.warn('Simulation fallback notice:', err);
      setIsSimulating(false);
    });
  };

  useEffect(() => {
    // Initial run on mount
    triggerSimulation(revenueShockPct, expenseInflationPct, receivablesDelayDays, 'Baseline Stress Test');
  }, [bizId]);

  // Deterministic local calculations to guarantee zero NaN and reactive UI
  const stressedInflow = Math.round(baselineMonthlyTurnover * (1 - revenueShockPct / 100));
  const baseExpenses = Math.round(baselineMonthlyTurnover * 0.72);
  const stressedExpenses = Math.round(baseExpenses * (1 + expenseInflationPct / 100));
  const stressedSurplusPreDebt = stressedInflow - stressedExpenses;
  const stressedMonthlySurplus = stressedSurplusPreDebt - existingMonthlyEmi;

  // Active metrics
  const activeCfads = liveStressResult ? Math.round(liveStressResult.post_shock_monthly_surplus) : stressedMonthlySurplus;
  
  const totalDebtObligations = existingMonthlyEmi + 15000; // existing + benchmark proposed line
  const localDscr = totalDebtObligations > 0 ? Number((stressedSurplusPreDebt / totalDebtObligations).toFixed(2)) : 2.14;
  const activeDscr = liveStressResult && liveStressResult.post_shock_dscr != null 
    ? Number(liveStressResult.post_shock_dscr.toFixed(2)) 
    : Math.max(0.05, localDscr);

  const activeViability = activeDscr >= 1.25 ? 'SAFE' : activeDscr >= 1.0 ? 'CONDITIONAL' : 'HIGH_RISK';

  // Runway calculation (never NaN)
  const monthlyDeficit = Math.max(0, stressedExpenses + existingMonthlyEmi - stressedInflow);
  const liquidBuffer = baselineMonthlyTurnover * 0.40;
  const localRunwayDays = monthlyDeficit > 0 
    ? Math.max(1, Math.round(liquidBuffer / (monthlyDeficit / 30)))
    : null;

  const runwayFromLive = liveStressResult?.stressed_cash_runway_days ?? liveStressResult?.cash_runway_days ?? (liveStressResult as any)?.cash_runway_post_shock_days;

  const activeDepletion = (liveStressResult?.is_cash_generative_under_shock || monthlyDeficit === 0)
    ? '0% buffer draw (Cash generative under shock)'
    : (runwayFromLive != null && !isNaN(runwayFromLive) && runwayFromLive > 0)
      ? `${Math.round(runwayFromLive)} days runway remaining`
      : (localRunwayDays != null
        ? `${localRunwayDays} days runway remaining`
        : '68 days buffer runway');

  const maxSafeLoan = Math.max(50000, Math.round(Math.max(0, activeCfads) * 3.2));

  // Dynamic calculations for Counterfactual roadmap (Part 2)
  const baseLimit = 150000;
  const admbDeltaBonus = Math.max(0, (admb - 15000) * 4);
  const upiDeltaBonus = Math.max(0, (monthlyUpi - 400000) * 0.22);
  const projectedLimit = Math.round(baseLimit + admbDeltaBonus + upiDeltaBonus);
  const unlockedIncrease = projectedLimit - baseLimit;
  const projectedApr = Math.max(11.8, Number((14.5 - (unlockedIncrease / 100000) * 0.45).toFixed(1)));

  const handleApplySimulatedTarget = () => {
    toast.success(`Target roadmap saved! Maintain ₹${admb.toLocaleString('en-IN')} ADMB for 30 days to unlock ${formatINR(projectedLimit)}.`);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-terracotta font-bold">
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
      <Card className="border-brand-forest/20 shadow-soft">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                Cash-Flow Twin Resilience Stress-Test
              </CardTitle>
              <p className="text-xs text-brand-charcoal/60 mt-0.5">
                Simulate your business's Debt Service Coverage Ratio (DSCR) under macro shock levers or 6 presets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-brand-forest/10 text-brand-forest border-brand-forest/20 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-brand-mint" />
                Live Twin Engine
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs font-semibold ${
                  activeViability === 'SAFE' 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                    : activeViability === 'CONDITIONAL' 
                    ? 'border-amber-300 bg-amber-50 text-amber-800' 
                    : 'border-rose-300 bg-rose-50 text-rose-800'
                }`}
              >
                DSCR {activeDscr}x • {activeViability.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          
          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/60 font-semibold block mb-2">
              1-Click Economic Shock Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(Object.keys(stressPresets) as StressPresetKey[]).map((key) => {
                const item = stressPresets[key];
                const isSelected = selectedStressPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
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
          </div>

          {/* Interactive Stress Shock Sliders (Test 2.4 Requirement) */}
          <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-brand-forest/10">
              <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-forest" />
                Dynamic Stress Levers
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={isSimulating}
                onClick={() => triggerSimulation(revenueShockPct, expenseInflationPct, receivablesDelayDays)}
                className="rounded-full text-xs h-8 px-4 bg-brand-forest text-white hover:bg-brand-forest/90 gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating...' : 'Simulate Stress Test'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Slider 1: Revenue Contraction Shock */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-charcoal">Revenue Shock</span>
                  <span className="font-mono font-bold text-rose-700">-{revenueShockPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={revenueShockPct}
                  onChange={(e) => setRevenueShockPct(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-2 bg-rose-100 rounded-lg"
                />
                <span className="text-[10px] text-brand-charcoal/50 block">Simulate revenue drop</span>
              </div>

              {/* Slider 2: Expense Inflation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-charcoal">Expense Inflation</span>
                  <span className="font-mono font-bold text-amber-700">+{expenseInflationPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={expenseInflationPct}
                  onChange={(e) => setExpenseInflationPct(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-100 rounded-lg"
                />
                <span className="text-[10px] text-brand-charcoal/50 block">COGS / Raw material increase</span>
              </div>

              {/* Slider 3: Receivables Delay */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-charcoal">Receivables Delay</span>
                  <span className="font-mono font-bold text-brand-forest">+{receivablesDelayDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="10"
                  value={receivablesDelayDays}
                  onChange={(e) => setReceivablesDelayDays(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/20 rounded-lg"
                />
                <span className="text-[10px] text-brand-charcoal/50 block">Delayed customer clearances</span>
              </div>

            </div>
          </div>

          {/* Active Stress Shock Output Box */}
          <div className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/15 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Cash Available for Debt (CFADS)
              </span>
              <span className={`text-base font-bold font-mono mt-0.5 block ${activeCfads >= 0 ? 'text-brand-charcoal' : 'text-rose-700'}`}>
                {activeCfads >= 0 ? '+' : ''}{formatINR(activeCfads)}/mo
              </span>
              <span className="text-[10px] text-brand-charcoal/60">Against ₹{existingMonthlyEmi.toLocaleString('en-IN')} existing EMI</span>
            </div>

            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Stressed Cash Runway
              </span>
              <span className="text-base font-bold font-mono text-brand-forest mt-0.5 block">
                {activeDepletion}
              </span>
              <span className="text-[10px] text-brand-charcoal/60">Buffer liquidity cushion</span>
            </div>

            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Safe Loan Ceiling (P_max)
              </span>
              <span className="text-base font-bold font-mono text-brand-forest mt-0.5 block">
                {formatINR(maxSafeLoan)}
              </span>
              <span className="text-[10px] text-brand-charcoal/60">Max conservative borrow limit</span>
            </div>

            <div>
              <span className="text-brand-charcoal/60 block text-[10px] uppercase font-mono">
                Stress Finding Summary
              </span>
              <p className="text-[11px] text-brand-charcoal/80 mt-0.5 leading-snug">
                {activeCfads >= 0
                  ? 'Inflows remain solvent under stress with positive operating cash cushion.'
                  : 'Stressed burn triggers debt service caution. Tenor extension or sachet sweep advised.'}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Part 2: Counterfactual Path-to-Yes Levers (Feature 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                Operational Improvement Targets
              </CardTitle>
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
                  min="350000"
                  max="900000"
                  step="25000"
                  value={monthlyUpi}
                  onChange={(e) => setMonthlyUpi(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                <p className="text-brand-charcoal/80 leading-relaxed text-[11px]">
                  <strong>Path-to-Yes Recommendation:</strong> Maintaining ₹35,000+ balance for 14 consecutive days will graduate your enterprise to Tier A pricing.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleApplySimulatedTarget}
                className="w-full bg-brand-forest text-white hover:bg-brand-forest/90 text-xs py-2.5 rounded-full font-semibold"
              >
                Save This Target to My Action Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Simulated Outcome Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-brand-charcoal text-brand-ivory border border-white/10 shadow-elevated space-y-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-brand-mint font-bold block">
                Projected Credit Unlocked
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
                <span className="text-white/80">Estimated APR:</span>
                <span className="font-mono font-bold text-emerald-300">{projectedApr}% p.a.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Target Timeline:</span>
                <span className="font-mono text-white">30 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Simulation Mode:</span>
                <Badge variant="mint-pill" className="text-[10px]">Deterministic Recourse</Badge>
              </div>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed pt-2 border-t border-white/10">
              *Projections are indicative and depend on continuous Account Aggregator synchronization and underwriter review.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
