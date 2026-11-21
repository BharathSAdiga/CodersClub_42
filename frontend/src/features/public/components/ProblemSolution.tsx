import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { XCircle, CheckCircle2 } from 'lucide-react';

export const ProblemSolution: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="terracotta">The Credit Challenge for Small Businesses</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            Traditional lending was built for land, <br />
            <span className="text-brand-forest">not daily cash flow.</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            Most Indian micro and small businesses operate without property to pledge or complex audited balance sheets. When they need short-term working capital, traditional loan processes often turn them away due to lack of traditional paperwork.
          </p>
        </div>
      </ScrollReveal>

      {/* Asymmetric Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: The Conventional Credit Model */}
        <ScrollReveal direction="right" delay={0.1} duration={0.7}>
          <div className="rounded-3xl p-8 bg-red-50/50 border border-red-200/70 shadow-soft space-y-6 hover:shadow-elevated transition-shadow duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-red-200">
              <span className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Conventional Loan & Informal Credit Model
              </span>
              <span className="text-xs bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-semibold">
                High Barrier for Micro-Enterprises
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-brand-charcoal/80">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">High Property Collateral Requirements</strong>
                  Rented premises and working machinery cannot be pledged, disqualifying viable small businesses.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">Limited Credit History Challenges</strong>
                  New-to-credit micro-merchants receive automated low scores or rejections without human review.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">High Informal Interest Rates</strong>
                  Urgent cash needs often drive businesses to expensive informal loans with steep charges.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                <div>
                  <strong className="text-red-950 block">Inflexible Monthly Fixed EMIs</strong>
                  Fixed payment dates create financial strain during seasonal business troughs.
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
                How UDYOGA Evaluates Real Business Activity
              </span>
              <span className="text-xs bg-white/15 text-white px-2.5 py-0.5 rounded-full font-semibold">
                Financial Inclusion
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-white/90">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Assessments Based on Business Cash Flow</strong>
                  Verified merchant QR collections and regular bank inflows demonstrate repayment capability.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Fair Consideration for Thin Files</strong>
                  The assessment engine evaluates transaction velocity, customer diversity, and operational continuity.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Regulated Terms from Partner Lenders</strong>
                  Institutional capital from licensed partner NBFCs and banks with clear Key Fact Statements (KFS).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-mint text-brand-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Manageable Daily or Weekly Sweeps</strong>
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
