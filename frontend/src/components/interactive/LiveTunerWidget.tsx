import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export const LiveTunerWidget: React.FC = () => {
  const [tenorDays, setTenorDays] = useState<number>(90);
  const [amount, setAmount] = useState<number>(150000);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  // Dynamic calculations
  const apr = frequency === 'DAILY' ? 14.2 : 14.8;
  const totalInterest = Math.round((amount * (apr / 100) * tenorDays) / 365);
  const totalPayable = amount + totalInterest;
  const cycleCount = frequency === 'DAILY' ? tenorDays : Math.round(tenorDays / 7);
  const installment = Math.round(totalPayable / cycleCount);

  return (
    <div className="w-full max-w-5xl mx-auto my-12 p-6 sm:p-10 rounded-3xl bg-brand-ivory border border-brand-forest/15 shadow-soft">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Editorial Typography & Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-terracotta font-semibold">
              Transparent Calibration
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-brand-charcoal tracking-tight mt-1">
              Credit, calibrated your way.
            </h2>
            <p className="text-sm text-brand-charcoal/70 mt-2 leading-relaxed">
              Every business breathes differently. Tune your loan size, repayment cadence, and tenor to match your real seasonal cash velocity.
            </p>
          </div>

          <div className="space-y-6 pt-2 border-t border-brand-forest/10">
            {/* Slider 1: Loan Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-brand-charcoal">Working Capital Amount</span>
                  <p className="text-xs text-brand-charcoal/50">From micro-sachets to bulk supplier orders.</p>
                </div>
                <span className="font-mono font-bold text-brand-forest text-base">
                  {formatINR(amount)}
                </span>
              </div>
              <input
                type="range"
                min="25000"
                max="500000"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
              />
            </div>

            {/* Slider 2: Tenor Days */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-brand-charcoal">Repayment Tenor</span>
                  <p className="text-xs text-brand-charcoal/50">30-day festival sprints up to 180-day inventory turns.</p>
                </div>
                <span className="font-mono font-bold text-brand-forest text-base">
                  {tenorDays} Days
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={tenorDays}
                onChange={(e) => setTenorDays(Number(e.target.value))}
                className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
              />
            </div>

            {/* Toggle: Frequency */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-sm font-semibold text-brand-charcoal">Sweep Frequency</span>
                <p className="text-xs text-brand-charcoal/50">Automated UPI AutoPay deductions.</p>
              </div>
              <div className="flex p-1 rounded-full bg-brand-forest/10 border border-brand-forest/20">
                <button
                  onClick={() => setFrequency('DAILY')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    frequency === 'DAILY'
                      ? 'bg-brand-forest text-white shadow-sm'
                      : 'text-brand-charcoal/70 hover:text-brand-charcoal'
                  }`}
                >
                  Daily Sweep
                </button>
                <button
                  onClick={() => setFrequency('WEEKLY')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    frequency === 'WEEKLY'
                      ? 'bg-brand-forest text-white shadow-sm'
                      : 'text-brand-charcoal/70 hover:text-brand-charcoal'
                  }`}
                >
                  Weekly Sachet
                </button>
              </div>
            </div>

            {/* Contrast / Preview Tone Selector (Faithful to video's contrast toggle) */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-sm font-semibold text-brand-charcoal">Display Mode</span>
                <p className="text-xs text-brand-charcoal/50">High contrast for shopfloor or desk.</p>
              </div>
              <div className="flex p-1 rounded-full bg-brand-forest/10 border border-brand-forest/20">
                <button
                  onClick={() => setIsDarkTheme(false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !isDarkTheme ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-charcoal/60'
                  }`}
                >
                  Ivory
                </button>
                <button
                  onClick={() => setIsDarkTheme(true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isDarkTheme ? 'bg-brand-charcoal text-white shadow-sm' : 'text-brand-charcoal/60'
                  }`}
                >
                  Charcoal
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Dynamic Real-Time Output Card (5 cols) */}
        <div className="lg:col-span-5">
          <motion.div
            className={`rounded-3xl p-6 sm:p-8 shadow-card border transition-colors duration-300 ${
              isDarkTheme
                ? 'bg-brand-charcoal text-white border-white/10'
                : 'bg-brand-forest text-brand-ivory border-brand-forest/20'
            }`}
            layout
          >
            <div className="flex items-center justify-between text-xs pb-4 border-b border-white/15">
              <span className="uppercase tracking-widest text-white/70 font-mono">Real-Time Terms</span>
              <span className="flex items-center gap-1 text-brand-mint font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                RBI DLG Compliant
              </span>
            </div>

            <div className="my-6">
              <span className="text-xs text-white/70 block mb-1">
                {frequency === 'DAILY' ? 'Daily Evening Sweep' : 'Weekly Installment'}
              </span>
              <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight font-mono">
                {formatINR(installment)}
              </div>
              <span className="text-xs text-white/60 mt-1 block">
                Across {cycleCount} scheduled sweeps ({tenorDays} days)
              </span>
            </div>

            <div className="space-y-3 py-4 border-t border-white/15 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Sanction Principal:</span>
                <span className="font-mono font-semibold text-white">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest Cost:</span>
                <span className="font-mono font-semibold text-white">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span>Effective APR:</span>
                <span className="font-mono font-semibold text-brand-mint">{apr}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Repayment:</span>
                <span className="font-mono font-semibold text-white">{formatINR(totalPayable)}</span>
              </div>
            </div>

            <button className="w-full mt-4 py-3 rounded-full bg-brand-terracotta text-white font-display font-semibold text-sm hover:bg-brand-terracotta-hover transition-colors shadow-soft flex items-center justify-center gap-2">
              <span>Lock Calibration & Apply</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
