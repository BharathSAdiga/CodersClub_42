import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { XCircle, CheckCircle2, ShieldAlert, Zap, TrendingUp, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProblemSolution: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="terracotta">The Credit-Invisible Paradox</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            Traditional lending was built for land, <br />
            <span className="text-brand-forest">not daily cash flow.</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            Over 80% of Indian micro-enterprises operate without real estate collateral or audited balance sheets. When they need short-term working capital, banks reject them and informal lenders exploit them.
          </p>
        </div>
      </ScrollReveal>

      {/* Asymmetric Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: The Old Broken System */}
        <ScrollReveal direction="right" delay={0.1} duration={0.7}>
          <div className="rounded-3xl p-8 bg-red-50/50 border border-red-200/70 shadow-soft space-y-6 hover:shadow-elevated transition-shadow duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-red-200">
              <span className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Legacy Bank & Moneylender Model
              </span>
              <span className="text-xs bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-semibold">
                Excluded: 80% of MSMEs
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-brand-charcoal/80">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">100%–150% Physical Property Collateral</strong>
                  Rented shop premises and machinery cannot be pledged, instantly disqualifying viable businesses.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">Bureau "No-Hit" Rejections</strong>
                  New-to-credit micro-merchants receive automated score 0 or -1 rejections without human review.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">Predatory 36%–120% APR from Informal Lenders</strong>
                  Urgent cash needs drive desperate merchants to informal credit sharks with daily extortion.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">Rigid Monthly Fixed EMIs</strong>
                  Fixed payment dates trigger technical default during seasonal trade troughs.
                </div>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* Right: The UDYOGA Flow-Based Solution */}
        <ScrollReveal direction="left" delay={0.2} duration={0.7}>
          <div className="rounded-3xl p-8 bg-brand-forest text-brand-ivory border border-brand-forest/20 shadow-card space-y-6 hover:shadow-elevated transition-shadow duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-mint" />
                The UDYOGA Flow-Based Paradigm
              </span>
              <span className="text-xs bg-white/15 text-white px-2.5 py-0.5 rounded-full font-semibold">
                Inclusion by Design
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-white/90">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">100% Unsecured / Flow-Based Underwriting</strong>
                  Daily merchant QR collections and verified bank inflows substitute for immovable assets.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Zero Discrimination for Thin Files</strong>
                  Alternative Credit Intelligence Engine (ACIE) evaluates cash velocity, customer diversity and supplier consistency.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Fair & Capped 14%–18% APR</strong>
                  Institutional capital from licensed partner NBFCs and Small Finance Banks with transparent KFS.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Flexible Daily Sachet Sweeps</strong>
                  Micro-repayments (e.g. ₹500/day) automatically match daily cash flow cycles with zero prepayment penalties.
                </div>
              </li>
            </ul>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
