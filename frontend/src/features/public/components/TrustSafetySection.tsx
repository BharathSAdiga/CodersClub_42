import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { ShieldCheck, Lock, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="rounded-3xl bg-brand-forest text-brand-ivory p-8 sm:p-12 border border-brand-forest/30 shadow-card">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="mint-pill" className="text-xs">Regulatory Integrity</Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mt-2">
                Built strictly compliant with RBI & DPDP standards.
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-2 max-w-xl mx-auto leading-relaxed">
                We never access personal smartphone contacts, media gallery, or storage. Data is accessed solely upon explicit user consent and purged upon request.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <ScrollReveal direction="up" delay={0.1} duration={0.5}>
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 h-full hover:bg-white/15 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-brand-mint mb-3" />
                  <h4 className="font-display font-bold text-sm text-white">RBI Digital Lending Guidelines</h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Direct bank-to-bank disbursal with zero intermediary pool accounts. Full Key Fact Statement (KFS) provided upfront.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2} duration={0.5}>
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 h-full hover:bg-white/15 transition-colors">
                  <Lock className="w-6 h-6 text-brand-mint mb-3" />
                  <h4 className="font-display font-bold text-sm text-white">DPDP Act 2023 Compliance</h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Purpose-limited processing with an instant one-click consent revocation center and verifiable cryptographic deletion.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3} duration={0.5}>
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 h-full hover:bg-white/15 transition-colors">
                  <RefreshCw className="w-6 h-6 text-brand-mint mb-3" />
                  <h4 className="font-display font-bold text-sm text-white">Cooling-Off Grace Period</h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Borrowers have an statutory 3-day window to exit any digital loan agreement without prepayment penalty.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
