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
    label: 'MSME Credit Gap in India',
    colorClass: 'text-brand-mint',
    tag: 'Macro Deficit',
  },
  {
    id: 'collateral-lack',
    value: '85%',
    countEnd: 85,
    suffix: '%',
    label: 'Lack Formal Collateral Assets',
    colorClass: 'text-white',
    tag: 'Collateral Wall',
  },
  {
    id: 'assessment-tat',
    value: '< 15 Mins',
    countEnd: 15,
    prefix: '< ',
    suffix: ' Mins',
    label: 'Average Flow Assessment Turnaround',
    colorClass: 'text-brand-mint',
    tag: 'Real-Time TAT',
  },
  {
    id: 'algorithmic-bias',
    value: '0 Bias',
    label: 'Audit-Ready Explainable Decisions',
    colorClass: 'text-brand-terracotta',
    tag: 'Disparate Impact = 0',
  },
  {
    id: 'aa-consent',
    value: '100% Consent',
    countEnd: 100,
    suffix: '%',
    label: 'RBI Account Aggregator Rail',
    colorClass: 'text-brand-mint',
    tag: 'DPDP Compliant',
  },
  {
    id: 'quai-ledger',
    value: 'Cyprus-1 Anchor',
    label: 'Immutable On-Chain Ledger Proofs',
    colorClass: 'text-amber-300',
    tag: 'Quai Network',
  },
  {
    id: 'sachet-sweeps',
    value: 'Daily Sachet',
    label: 'Evening Store Turnover Sweeps',
    colorClass: 'text-white',
    tag: 'Micro-Repayment',
  },
  {
    id: 'zero-collateral',
    value: 'Zero Collateral',
    label: 'Verifiable Flow-Based Underwriting',
    colorClass: 'text-brand-mint',
    tag: 'Pure Cashflow',
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
            Live MSME Impact Telemetry
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/10 text-brand-mint text-[10px] font-mono border border-white/10">
            Real-Time Stream
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
                  : 'text-white/60 hover:text-white'
              }`}
              title="Continuous Moving Text Marquee"
            >
              <MoveHorizontal className="w-3 h-3" />
              <span>Moving</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-mint text-brand-charcoal font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Static 4-Column Grid View"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'marquee' ? (
        /* ================= MOVING TEXT MARQUEE ANIMATION ================= */
        <div 
          className="relative py-7 sm:py-8 overflow-hidden select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle gradient feathering on left and right edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-brand-forest via-brand-forest/90 to-transparent z-10 pointer-events-none" />

          {/* Infinite Moving Marquee Track */}
          <div 
            className="flex items-center w-max animate-marquee"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {/* First sequence of stats */}
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
                  <div className="text-xs sm:text-sm text-brand-ivory/70 mt-1 font-normal whitespace-nowrap">
                    {item.label}
                  </div>
                </div>

                {/* Vertical Divider / Glowing Separator */}
                <div className="h-10 w-px bg-white/15 shrink-0 self-center" />
              </React.Fragment>
            ))}

            {/* Seamless duplicate sequence for infinite seamless loop */}
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
                  <div className="text-xs sm:text-sm text-brand-ivory/70 mt-1 font-normal whitespace-nowrap">
                    {item.label}
                  </div>
                </div>

                {/* Vertical Divider / Glowing Separator */}
                <div className="h-10 w-px bg-white/15 shrink-0 self-center" />
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        /* ================= STATIC 4-COLUMN GRID VIEW ================= */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8">
          {STATS_DATA.slice(0, 4).map((item) => (
            <div key={item.id} className="transition-transform duration-200 hover:translate-y-[-2px]">
              <div className={`text-3xl sm:text-4xl font-display font-bold font-mono ${item.colorClass}`}>
                {item.countEnd ? (
                  <>
                    {item.prefix}
                    <CountUpNumber end={item.countEnd} />
                    {item.suffix}
                  </>
                ) : (
                  item.value
                )}
              </div>
              <div className="text-xs sm:text-sm text-brand-ivory/70 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Micro Bar */}
      <div className="px-6 sm:px-8 py-2.5 bg-black/20 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />
          <span>India Stack & Account Aggregator Telemetry Feed</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Continuous Flow</span>
          <span>•</span>
          <span>Zero Hallucination</span>
        </div>
      </div>
    </div>
  );
};
