import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Building2, Landmark, Check } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="terracotta">Dual Sided Value</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            Empowering Borrowers. Protecting Lenders.
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            A balanced ecosystem where small businesses gain respectful access to working capital, and regulated lenders deploy flow-backed funds with verifiable downside safety.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* For MSMEs */}
        <ScrollReveal direction="right" delay={0.1} duration={0.7}>
          <Card className="border-brand-forest/20 p-2 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
                    For Micro-Enterprises & Artisans
                  </span>
                  <CardTitle className="text-2xl mt-0.5">Freedom from Exploitative Debt</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs sm:text-sm text-brand-charcoal/80">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Instant Disbursal:</strong> Sanction decisions in under 5 minutes; funds credited directly to current account.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>No Land Collateral:</strong> Real-time commerce velocity serves as institutional guarantee.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Sachet Sweeps:</strong> Small daily repayments prevent lump-sum month-end liquidity crises.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Credit Graduation:</strong> On-time repayment builds formal creditworthiness for larger bank debt lines.</span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* For Lenders */}
        <ScrollReveal direction="left" delay={0.2} duration={0.7}>
          <Card className="border-brand-forest/20 p-2 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-terracotta font-bold">
                    For Banks & Regulated NBFCs
                  </span>
                  <CardTitle className="text-2xl mt-0.5">Unprecedented Flow Visibility</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs sm:text-sm text-brand-charcoal/80">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Tamper-Proof Triangulation:</strong> 3-way verification across GST, Account Aggregator, and UPI QR eliminates forged statements.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Explainable AI Intelligence:</strong> Full SHAP attribution and Population Stability Index (PSI) reports ensure audit readiness.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Human Discretionary Authority:</strong> Underwriters maintain sovereign control with dynamic risk haircut sliders (0%–30%).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Automated Early Warning Signals:</strong> Ongoing UPI flow tracking triggers proactive delinquency interventions weeks before default.</span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

      </div>
    </section>
  );
};
