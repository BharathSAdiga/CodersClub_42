import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { Sparkles, Sliders, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const WhatIfSimulatorView: React.FC = () => {
  const [admb, setAdmb] = useState<number>(18450);
  const [monthlyUpi, setMonthlyUpi] = useState<number>(512000);

  // Dynamic calculations
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
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-terracotta font-bold">
          Empowerment Coaching
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Counterfactual "What-If" Credit Simulator
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          See exactly how specific operational improvements will automatically boost your credit limit and slash your interest rates.
        </p>
      </div>

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
                  min="400000"
                  max="1200000"
                  step="25000"
                  value={monthlyUpi}
                  onChange={(e) => setMonthlyUpi(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                />
              </div>

              {/* Actionable Recourse Note */}
              <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 text-xs text-brand-charcoal/80 space-y-1">
                <span className="font-bold text-brand-forest block">Actionable Recourse:</span>
                <p>
                  "Achieving an ADMB of {formatINR(admb)} across the next 30 days provides verified liquidity stability, unlocking an immediate facility upgrade."
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

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
          </div>
        </div>

      </div>
    </div>
  );
};
