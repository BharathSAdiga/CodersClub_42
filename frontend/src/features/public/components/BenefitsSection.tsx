import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Building2, Landmark } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="terracotta">Value for Borrowers & Lenders</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            Empowering Borrowers. Supporting Lenders.
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            A balanced platform where small businesses gain fair access to working capital, and regulated lenders assess flow-backed applications with verified financial evidence.
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
                    For Micro & Small Enterprises
                  </span>
                  <CardTitle className="text-2xl mt-0.5">Clearer access to suitable business finance</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs sm:text-sm text-brand-charcoal/80">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Fast Assessment:</strong> Clear evaluation in minutes; approved funds transferred directly to your bank account.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>No Property Pledged:</strong> Evaluation based on verified sales and cash flow rather than real estate.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Manageable Repayments:</strong> Small daily or weekly deductions help avoid stressful month-end lump sums.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-forest text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Build Credit History:</strong> Timely repayments help establish a formal track record for future financing.</span>
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
                  <CardTitle className="text-2xl mt-0.5">Understand how money moves through the business</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs sm:text-sm text-brand-charcoal/80">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Verified Multi-Source Data:</strong> Cross-checks bank statements, GST filings, and merchant UPI flows directly from official rails.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Transparent Risk Rationale:</strong> Clear breakdown of key strengths and risks supporting every assessment.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Full Underwriter Control:</strong> Human officers retain final decision authority to calibrate loan terms and approve facilities.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-terracotta text-brand-ivory flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                <span><strong>Proactive Monitoring:</strong> Real-time flow visibility helps identify revenue changes early to support borrowers effectively.</span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

      </div>
    </section>
  );
};
