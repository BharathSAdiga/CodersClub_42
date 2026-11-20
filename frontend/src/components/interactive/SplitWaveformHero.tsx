import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export const SplitWaveformHero: React.FC = () => {
  const [dailyVolume, setDailyVolume] = useState<number>(22000);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Dynamic calculations based on slider
  const calculatedMonthlyFlow = dailyVolume * 30;
  const calculatedCreditLine = Math.round(dailyVolume * 7.5);
  const calculatedDailySweep = Math.round((calculatedCreditLine * 1.14) / 90);

  // Equalizer heights
  const bars = [40, 65, 30, 85, 55, 95, 45, 75, 35, 90, 60, 80, 50, 70, 40, 85, 60, 45, 90, 75, 55, 65];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-elevated border border-brand-forest/20 my-10 select-none">
      {/* 50/50 Split Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[360px] relative">
        
        {/* LEFT HALF: "Your Daily Commerce" (Deep Charcoal Canvas) */}
        <div className="bg-brand-charcoal text-brand-ivory p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-forest/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Label */}
          <div className="flex items-center justify-between z-10">
            <span className="font-display font-medium text-xs tracking-wider uppercase text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
              Your Daily Commerce
            </span>
            <span className="text-xs font-mono text-white/50">Live UPI Telemetry</span>
          </div>

          {/* Mid Section: Soundwave / Transaction Waveform */}
          <div className="my-8 z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                {formatINR(dailyVolume)}
              </span>
              <span className="text-xs text-white/60 font-sans">/ day turnover</span>
            </div>

            {/* Live Audio / Transaction Waveform Bars */}
            <div className="flex items-end gap-1.5 h-20 pt-4">
              {bars.map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-white/20 rounded-t-sm"
                  animate={{
                    height: isHovered ? `${Math.min(100, height * 1.2)}%` : `${height}%`,
                    backgroundColor: i > 14 ? 'rgba(52, 211, 153, 0.7)' : 'rgba(255, 255, 255, 0.3)',
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.04,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Interactive Control */}
          <div className="z-10">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>Adjust daily merchant QR sales</span>
              <span className="font-mono text-brand-mint">{formatINR(dailyVolume)}</span>
            </div>
            <input
              type="range"
              min="8000"
              max="65000"
              step="1000"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(Number(e.target.value))}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full accent-brand-mint cursor-pointer h-2 bg-white/20 rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT HALF: "Your Credit Power" (Vibrant Forest & Mint Canvas) */}
        <div className="bg-brand-forest text-brand-ivory p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Label */}
          <div className="flex items-center justify-between z-10">
            <span className="font-display font-medium text-xs tracking-wider uppercase text-white/80 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
              Your Credit Power
            </span>
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-brand-mint font-medium">
              Zero Collateral
            </span>
          </div>

          {/* Central Dialogue / Sanction Bubble (Emerging directly across split) */}
          <div className="my-6 z-10">
            <motion.div 
              className="bg-brand-ivory text-brand-charcoal rounded-2xl p-6 shadow-card border border-white/20"
              key={calculatedCreditLine}
              initial={{ scale: 0.96, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest/70">
                  Pre-Approved Working Capital
                </span>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  ACIE Vitality 742
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-brand-forest tracking-tight mb-2">
                {formatINR(calculatedCreditLine)}
              </div>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Repay via flexible sachet sweeps of <strong className="text-brand-charcoal font-mono">{formatINR(calculatedDailySweep)}/day</strong> synchronized with your evening store closing.
              </p>
            </motion.div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
            <div className="text-xs text-white/70">
              <span>Estimated APR: </span>
              <strong className="text-white font-mono">14.2%</strong>
              <span className="text-white/50"> · No hidden charges</span>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-terracotta text-white font-display font-semibold text-xs hover:bg-brand-terracotta-hover transition-colors shadow-soft">
              <span>Claim Line</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
