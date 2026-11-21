import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';

export const AcieExplanation: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="rounded-3xl bg-brand-charcoal text-brand-ivory p-8 sm:p-14 border border-brand-forest/30 shadow-elevated relative overflow-hidden">
          
          {/* Subtle Parallax / Ambient Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-forest/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="mint-pill" className="text-xs">Assessment Transparency</Badge>
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight mt-3">
                Understand how your financial information is assessed.
              </h2>
              <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto leading-relaxed">
                Instead of an unexplained rejection, UDYOGA breaks down exactly which factors supported the evaluation, which held it back, and practical steps you can take to strengthen your business position.
              </p>
            </div>

            {/* Interactive Feature Demonstration Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10">
              
              {/* Left: Driver Ribbon */}
              <ScrollReveal direction="right" delay={0.2} duration={0.6} className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-wider text-brand-mint font-bold block">
                  Key Factors Affecting Assessment
                </span>

                {/* Positive Driver 1 */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between hover:border-brand-mint/60 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center text-xs font-bold">+</span>
                    <div>
                      <strong className="text-xs text-white block">Regular Daily UPI Inflows</strong>
                      <span className="text-[10px] text-white/70">142 transactions/day across 90 days</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-mint">+56 pts</span>
                </div>

                {/* Positive Driver 2 */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between hover:border-brand-mint/60 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center text-xs font-bold">+</span>
                    <div>
                      <strong className="text-xs text-white block">Punctual Utility & Electricity Payments</strong>
                      <span className="text-[10px] text-white/70">24 months on-time commercial bill history</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-mint">+38 pts</span>
                </div>

                {/* Drag Indicator */}
                <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between hover:border-rose-400/60 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">-</span>
                    <div>
                      <strong className="text-xs text-white block">Limited Formal Bank Loan History</strong>
                      <span className="text-[10px] text-white/70">No multi-year bank term credit on record</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">-24 pts</span>
                </div>
              </ScrollReveal>

              {/* Right: Counterfactual Coaching */}
              <ScrollReveal direction="left" delay={0.3} duration={0.6}>
                <div className="p-6 rounded-2xl bg-brand-forest/60 border border-brand-forest/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
                      Actionable Guidance
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                      Improvement Path
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white">
                    Practical steps to improve borrowing capacity:
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    UDYOGA provides clear guidance rather than a simple rejection, helping business owners understand what behaviors strengthen their credit eligibility over time.
                  </p>
                  
                  <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-mint" />
                      <span>Maintain average balance &gt; ₹35,000 for 14 consecutive days</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-mint" />
                      <span>Route weekend UPI QR settlements directly through primary current A/c</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

            </div>

          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
