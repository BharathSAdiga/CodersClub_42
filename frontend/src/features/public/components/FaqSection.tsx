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
      a: 'No. UDYOGA is 100% unsecured and flow-based. We evaluate your business vitality using your live merchant UPI transactions, Account Aggregator cash flows, and GST tax filings.',
    },
    {
      q: 'What if my CIBIL credit score is -1 or "No-Hit"?',
      a: 'A "No-Hit" bureau record does not disqualify you on UDYOGA. Our Alternative Credit Intelligence Engine (ACIE) is explicitly designed for new-to-credit micro-enterprises with thin files.',
    },
    {
      q: 'How does daily sachet sweep repayment work?',
      a: 'Instead of deducting a huge lump-sum EMI at the start of each month, a small micro-sweep (e.g. ₹1,200) is deducted automatically via UPI AutoPay during your evening shop closing hours.',
    },
    {
      q: 'Can I revoke access to my financial data after receiving the loan?',
      a: 'Yes. In strict compliance with the DPDP Act 2023, you can toggle off or revoke any connected Account Aggregator or UPI data stream at any time from your Consent Management dashboard.',
    },
    {
      q: 'How quickly is the loan disbursed into my account?',
      a: 'Once you sign the digital agreement and e-mandate via Aadhaar OTP, approved funds disburse directly to your verified bank current account in under 15 minutes.',
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
                  className="w-full p-5 text-left flex items-center justify-between font-display font-semibold text-sm sm:text-base text-brand-charcoal hover:text-brand-forest transition-colors"
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
