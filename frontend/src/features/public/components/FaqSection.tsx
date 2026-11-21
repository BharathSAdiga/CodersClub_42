import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need land or property documents to apply for a loan?',
      a: 'No. UDYOGA is designed for cash-flow based financing. Lenders evaluate your business activity using verifiable records such as daily merchant UPI receipts, Account Aggregator bank records, and GST filings where applicable.',
    },
    {
      q: 'What if my CIBIL credit score is -1 or "No-Hit"?',
      a: 'Having limited conventional credit history does not prevent your application from being reviewed. UDYOGA provides alternative financial insights based on your real cash flow, helping partner lenders assess your ability to manage repayments.',
    },
    {
      q: 'How does daily or weekly repayment work?',
      a: 'Instead of facing a large lump-sum EMI at the beginning of the month, repayments can be divided into smaller daily or weekly deductions via automated UPI AutoPay, aligned with when your customers pay you.',
    },
    {
      q: 'Can I manage or revoke access to my financial data?',
      a: 'Yes. In full compliance with the Digital Personal Data Protection (DPDP) Act, data access is strictly consent-based. You can review active data connections or revoke access at any time from your Consent Management dashboard.',
    },
    {
      q: 'Does receiving a vitality assessment guarantee loan approval?',
      a: 'No. UDYOGA provides objective financial analysis and evidence to institutional lenders. Final credit decisions, sanction limits, and loan agreements are determined by licensed partner banks and NBFCs.',
    },
  ];

  return (
    <section className="my-20 max-w-4xl mx-auto">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="text-center mb-12">
          <Badge variant="terracotta">Frequently Asked Questions</Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-brand-charcoal tracking-tight mt-2">
            Everything you need to know about UDYOGA.
          </h2>
        </div>
      </ScrollReveal>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <ScrollReveal key={idx} direction="up" delay={idx * 0.06} duration={0.4}>
              <div
                className="rounded-2xl bg-white border border-brand-forest/10 overflow-hidden transition-all shadow-soft"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-display font-semibold text-sm sm:text-base text-brand-charcoal hover:text-brand-forest transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="shrink-0 ml-4"
                  >
                    <ChevronDown className="w-4 h-4 text-brand-forest" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed border-t border-brand-charcoal/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
};
