import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Database, ShieldCheck, Cpu, Banknote } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Connect & Verify',
      desc: 'The business owner securely links their Account Aggregator bank statement and UPI merchant records. Data is transferred securely without sharing passwords.',
      icon: Database,
      tag: 'India Stack DPI',
    },
    {
      step: '02',
      title: 'Cash-Flow Assessment',
      desc: 'The assessment engine analyzes transaction regularity, customer variety, and operating cash cushion instead of requiring physical land titles.',
      icon: Cpu,
      tag: 'Cash-Flow Engine',
    },
    {
      step: '03',
      title: 'Underwriter Review',
      desc: 'Lenders receive a structured, verified reconciliation report, allowing them to evaluate the application and propose suitable loan terms quickly.',
      icon: ShieldCheck,
      tag: 'Human Review',
    },
    {
      step: '04',
      title: 'Disbursal & Sachet Repayment',
      desc: 'Approved funds reach your business bank account. Repayments can be scheduled in manageable daily or weekly amounts aligned with your business revenue.',
      icon: Banknote,
      tag: 'UPI AutoPay',
    },
  ];

  return (
    <section className="my-20">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="forest">How It Works</Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight mt-3">
            How UDYOGA works in four straightforward steps.
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/70 mt-3 leading-relaxed">
            Turn your real daily business activity into clear financial evidence for institutional lenders, using India's digital public infrastructure.
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
