import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CountUpNumber } from './CountUpNumber';
import { Activity, Pause, Play, LayoutGrid, MoveHorizontal, ShieldCheck } from 'lucide-react';

interface StatItem {
  id: string;
  value: string;
  countEnd?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  colorClass: string;
  tag?: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: 'credit-gap',
    value: '₹25L Cr',
    countEnd: 25,
    prefix: '₹',
    suffix: 'L Cr',
    label: 'Estimated MSME Credit Gap in India (UK Sinha Committee)',
    colorClass: 'text-brand-mint',
    tag: 'Macro Context',
  },
  {
    id: 'collateral-lack',
    value: '85%',
    countEnd: 85,
    suffix: '%',
    label: 'Small businesses without real estate collateral to pledge',
    colorClass: 'text-white',
    tag: 'Collateral Barrier',
  },
  {
    id: 'assessment-tat',
    value: '< 15 Mins',
    countEnd: 15,
    prefix: '< ',
    suffix: ' Mins',
    label: 'Typical assessment turnaround with connected accounts',
    colorClass: 'text-brand-mint',
    tag: 'Fast Evaluation',
  },
  {
    id: 'algorithmic-bias',
    value: 'DIR > 0.80',
    label: 'Monitored for statutory demographic parity',
    colorClass: 'text-brand-terracotta',
    tag: 'Fair Lending Monitored',
  },
  {
    id: 'aa-consent',
    value: '100% Consent',
    countEnd: 100,
    suffix: '%',
    label: 'RBI Account Aggregator Framework',
    colorClass: 'text-brand-mint',
    tag: 'DPDP Privacy Aligned',
  },
  {
    id: 'quai-ledger',
    value: 'Quai Anchor',
    label: 'Tamper-evident assessment audit log',
    colorClass: 'text-amber-300',
    tag: 'Audit Verification',
  },
  {
    id: 'sachet-sweeps',
    value: 'Daily Sweeps',
    label: 'Small evening deductions matching shop turnover',
    colorClass: 'text-white',
    tag: 'Flexible Repayment',
  },
  {
    id: 'flow-based',
    value: 'Cash-Flow First',
    label: 'Assessments based on actual business transactions',
    colorClass: 'text-brand-mint',
    tag: 'Alternative Data',
  },
];

export const MovingStatsTicker: React.FC = () => {
  const [viewMode, setViewMode] = useState<'marquee' | 'grid'>('marquee');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  return (
    <div className="relative rounded-3xl bg-brand-forest text-brand-ivory shadow-elevated border border-white/10 overflow-hidden group">
      
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-mint/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Header & Controls */}
      <div className="px-6 sm:px-8 pt-5 pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mint opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-mint"></span>
          </span>
          <span className="font-mono text-white/90 uppercase tracking-wider text-[11px] font-semibold">
            Live Platform Indicators
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/15 text-brand-mint text-[10px] font-mono border border-white/10">
            National MSME Context
          </span>
        </div>

        {/* View Mode & Animation Controls */}
        <div className="flex items-center gap-2">
          {viewMode === 'marquee' && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-[11px] text-white/80 hover:text-white transition-all font-mono"
              title={isPaused ? 'Resume moving text' : 'Pause moving text'}
            >
              {isPaused ? <Play className="w-3 h-3 text-brand-mint" /> : <Pause className="w-3 h-3 text-white/70" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Hover to Pause'}</span>
            </button>
          )}

          <div className="flex items-center bg-black/20 p-0.5 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('marquee')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                viewMode === 'marquee'
                  ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <MoveHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Ticker</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="py-6 sm:py-8 overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {viewMode === 'marquee' ? (
          /* Marquee Infinite Loop Track with Pausing */
          <div
            className={`flex items-center whitespace-nowrap will-change-transform ${
              isPaused ? '' : 'animate-ticker-marquee'
            }`}
          >
            {/* Primary sequence */}
            {STATS_DATA.map((item, idx) => (
              <React.Fragment key={`first-${item.id}-${idx}`}>
                <div className="inline-flex flex-col justify-center px-6 sm:px-10 shrink-0 group/item transition-transform duration-200 hover:scale-105">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-display font-bold font-mono tracking-tight ${item.colorClass}`}>
                      {item.value}
                    </span>
                    {item.tag && (
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20 font-medium">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-ivory/80 mt-1 font-normal whitespace-nowrap">
                    {item.label}
                  </div>
                </div>

                {/* Vertical Divider / Glowing Separator */}
                <div className="h-10 w-px bg-white/15 shrink-0 self-center" />
              </React.Fragment>
            ))}

            {/* Seamless duplicate sequence for infinite loop */}
            {STATS_DATA.map((item, idx) => (
              <React.Fragment key={`dup-${item.id}-${idx}`}>
                <div className="inline-flex flex-col justify-center px-6 sm:px-10 shrink-0 group/item transition-transform duration-200 hover:scale-105">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-display font-bold font-mono tracking-tight ${item.colorClass}`}>
                      {item.value}
                    </span>
                    {item.tag && (
                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20 font-medium">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-ivory/80 mt-1 font-normal whitespace-nowrap">
                    {item.label}
                  </div>
                </div>

                {/* Vertical Divider / Glowing Separator */}
                <div className="h-10 w-px bg-white/15 shrink-0 self-center" />
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* Static Responsive Grid Mode */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-6 sm:px-8">
            {STATS_DATA.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                    {item.tag}
                  </span>
                  <Activity className="w-3.5 h-3.5 text-brand-mint/60" />
                </div>
                <div className={`text-2xl sm:text-3xl font-display font-bold font-mono tracking-tight ${item.colorClass}`}>
                  {item.value}
                </div>
                <div className="text-xs text-brand-ivory/80 mt-1 leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Legal Subtext */}
      <div className="px-6 sm:px-8 py-2.5 bg-black/20 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70 font-mono">
        <span>Frameworks: Reserve Bank of India (RBI) DLG · DPDP Act 2023 · Sahamati Account Aggregator</span>
        <span className="hidden md:inline">Audited & Monitored</span>
      </div>

    </div>
  );
};
