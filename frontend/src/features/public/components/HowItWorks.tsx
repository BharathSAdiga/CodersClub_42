import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Database, ShieldCheck, Cpu, Banknote, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Consent & Triangulation',
      desc: 'The borrower grants 3-click Account Aggregator and UPI QR consent. Encrypted data flows directly from certified rails with zero password sharing.',
      icon: Database,
      tag: 'India Stack DPI',
    },
    {
      step: '02',
      title: 'ACIE Flow Analysis',
      desc: 'The Alternative Credit Intelligence Engine checks transaction regularity, customer diversity, and cash burn rather than static land deeds.',
      icon: Cpu,
      tag: 'Explainable AI',
    },
    {
      step: '03',
      title: 'Real-Time Sanction',
      desc: 'Institutional partner lenders receive an automated 3-way reconciliation report, approving customized working capital in under 4 minutes.',
      icon: ShieldCheck,
      tag: 'Instant Decision',
    },
    {
      step: '04',
      title: 'Sachet Disbursal & Sweep',
      desc: 'Funds disburse to the borrower’s bank account. Repayments execute as frictionless daily micro-sweeps synchronized with daily shop revenues.',
      icon: Banknote,
      tag: 'UPI AutoPay',
    },
  ];

  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="forest">The Architecture</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            How UDYOGA operates in four frictionless steps.
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            From thin-file anonymity to institutional capital in under 5 minutes, backed by India's digital public infrastructure.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <ScrollReveal key={s.step} direction="up" delay={idx * 0.1} duration={0.6}>
              <Card className="hover:-translate-y-2 hover:shadow-elevated transition-all duration-300 h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-display font-black text-brand-terracotta">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit mb-2 text-[10px]">
                    {s.tag}
                  </Badge>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                    {s.desc}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
};
