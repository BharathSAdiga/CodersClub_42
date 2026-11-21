import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Landmark, 
  Wallet, 
  Scale, 
  Layers,
  Sparkles,
  Lock,
  QrCode,
  FileSpreadsheet
} from 'lucide-react';

interface WorkflowStep {
  id: number;
  stageBadge: string;
  title: string;
  shortDesc: string;
  detailPoints: string[];
  actor: string;
  visualCard: {
    heading: string;
    subheading: string;
    metric1Label: string;
    metric1Val: string;
    metric2Label: string;
    metric2Val: string;
    statusBadge: string;
    statusColor: string;
    highlightItem: string;
  };
}

const stepsData: WorkflowStep[] = [
  {
    id: 1,
    stageBadge: 'STEP 01 • CONSENTED INTAKE',
    title: 'Borrower connects verified data with one-time OTP',
    shortDesc: 'A small business owner links their bank account and merchant UPI records in minutes via the RBI Account Aggregator framework. No paper photocopies or branch visits required.',
    detailPoints: [
      'No physical branch visit or land registration ledger needed',
      'Encrypted ReBIT-certified consent token issued via Sahamati',
      'Purpose-limited, time-bound data fetch with one-tap revocation'
    ],
    actor: 'Ramesh Kumar (Kirana Merchant)',
    visualCard: {
      heading: 'Secure Data Connection',
      subheading: 'Account Aggregator Verification (SBI Current A/c)',
      metric1Label: 'Consent Validity',
      metric1Val: '90 Days Active',
      metric2Label: 'Encrypted Rail',
      metric2Val: 'ReBIT v1.3 XML',
      statusBadge: 'AA CONSENT GRANTED',
      statusColor: 'emerald',
      highlightItem: 'Zero password sharing. Bank statements fetched cryptographically with digital signature.'
    }
  },
  {
    id: 2,
    stageBadge: 'STEP 02 • MULTI-STREAM VERIFICATION',
    title: 'Financial records cross-verified across official rails',
    shortDesc: 'Daily business cash flow is cross-checked across verified bank deposits, GST tax filings, and merchant UPI payment records to ensure records are genuine and reliable.',
    detailPoints: [
      'Cross-examination of Bank ₹5.84L vs GST ₹6.10L vs UPI ₹5.12L',
      '95.8% multi-stream congruence confirmed',
      'Zero circular transaction loops detected across counterparty VPAs'
    ],
    actor: 'UDYOGA Verification Rail',
    visualCard: {
      heading: 'Cross-Stream Verification',
      subheading: 'Reconciled across GST, Bank AA, and UPI',
      metric1Label: 'Congruence Score',
      metric1Val: '95.8% Match',
      metric2Label: 'Discrepancies',
      metric2Val: '0 Detected',
      statusBadge: 'VERIFIED GENUINE',
      statusColor: 'emerald',
      highlightItem: 'Transaction velocity matches registered business hours and geo-location footfall.'
    }
  },
  {
    id: 3,
    stageBadge: 'STEP 03 • EXPLAINABLE ASSESSMENT',
    title: 'Comprehensive Cash-Flow & Vitality Assessment',
    shortDesc: 'The assessment engine evaluates cash-flow stability, repayment cushion, and operating continuity. It provides a clear 0–900 Credit Vitality estimate with plain-English explanation of drivers.',
    detailPoints: [
      'Visual factor impact breakdown explains positive and risk drivers',
      'Actionable guidance (e.g. "+₹1.5L limit with 15 days higher balance cushion")',
      'Fair evaluation for businesses with thin traditional bureau histories'
    ],
    actor: 'Alternative Credit Intelligence Engine (ACIE)',
    visualCard: {
      heading: 'Assessment Overview & Drivers',
      subheading: 'Your Business Financial Overview',
      metric1Label: 'Credit Vitality',
      metric1Val: '768 / 900 (Tier A)',
      metric2Label: 'Model Confidence',
      metric2Val: '97.4% High',
      statusBadge: 'PRIME CASHFLOW',
      statusColor: 'emerald',
      highlightItem: 'Top Supporting Factor: Consistent daily UPI inflows (+56 pts). On-time utility bill payments (+38 pts).'
    }
  },
  {
    id: 4,
    stageBadge: 'STEP 04 • LENDER DECISION DESK',
    title: 'Credit officer reviews and customizes loan terms',
    shortDesc: 'Partner bank or NBFC credit officers review the verified report. Human underwriters retain decision authority to calibrate credit limits and propose suitable repayment schedules.',
    detailPoints: [
      'Human-in-the-loop underwriting with transparent risk indicators',
      'Automated Key Fact Statement (KFS) generated upfront per RBI norms',
      'Formal digital sanction letter with customized terms'
    ],
    actor: 'Vikram Deshmukh (Credit Officer)',
    visualCard: {
      heading: 'Underwriting Review Desk',
      subheading: 'Facility: Working Capital Line',
      metric1Label: 'Sanction Limit',
      metric1Val: '₹1,50,000 INR',
      metric2Label: 'APR / Repayment',
      metric2Val: '14.2% • 90 Days',
      statusBadge: 'SANCTION ISSUED',
      statusColor: 'forest',
      highlightItem: 'Daily sweep schedule (₹1,890/day) aligned with evening merchant closing UPI auto-sweep.'
    }
  },
  {
    id: 5,
    stageBadge: 'STEP 05 • DISBURSAL & SACHET REPAYMENT',
    title: 'Direct account disbursal with manageable daily sweeps',
    shortDesc: 'Approved funds are credited directly to the merchant’s bank current account. Repayments execute as automated daily UPI AutoPay micro-sweeps without stressful month-end lump sums.',
    detailPoints: [
      'Direct account credit via NPCI IMPS / NEFT rails with 0 escrow delays',
      'Flexible daily sachet deduction aligned with daily sales cadence',
      'Successful repayment builds credit score for gradual limit graduation'
    ],
    actor: 'Borrower & NPCI AutoPay Rail',
    visualCard: {
      heading: 'Disbursal & Manageable Repayment',
      subheading: 'UPI AutoPay & Direct Bank Settlement',
      metric1Label: 'Disbursed Amount',
      metric1Val: '₹1,50,000 Credited',
      metric2Label: 'Disbursal TAT',
      metric2Val: '3 Mins 42 Secs',
      statusBadge: 'ACTIVE CAPITAL LINE',
      statusColor: 'emerald',
      highlightItem: 'Borrower establishes formal credit history with affordable institutional financing.'
    }
  }
];

export const StickyProductStoryteller: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Track scroll through the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Map 0 -> 1 progress to step index 0 -> 4
      const stepIndex = Math.min(
        Math.floor(latest * stepsData.length),
        stepsData.length - 1
      );
      setActiveStepIndex(stepIndex);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const activeStep = stepsData[activeStepIndex];

  return (
    <section 
      ref={containerRef} 
      className="relative bg-brand-charcoal text-brand-ivory min-h-[350vh] border-y border-white/10"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-forest/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-terracotta/15 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <Badge variant="mint-pill" className="text-xs mb-3">
              END-TO-END WALKTHROUGH
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              From business transactions to working capital.
            </h2>
            <p className="text-sm text-white/70 mt-2">
              Follow how a local merchant turns verified daily cash flow into an approved credit facility.
            </p>
          </div>

          {/* 2-Column Split: Narrative on Left, Dynamic Card on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Narrative Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-mint">
                      {activeStep.stageBadge}
                    </span>
                    <span className="text-white/40 font-mono text-xs">• Step {activeStep.id} of 5</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                    {activeStep.title}
                  </h3>

                  <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
                    {activeStep.shortDesc}
                  </p>

                  {/* Bullet points */}
                  <ul className="space-y-2 pt-2">
                    {activeStep.detailPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70">
                        <span className="w-4 h-4 rounded-full bg-brand-mint/20 text-brand-mint flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Dynamic Card Column (6 cols) */}
            <div className="lg:col-span-6 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                  className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-brand-forest/90 border border-white/20 shadow-elevated backdrop-blur-md space-y-6"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-white/70">
                        Live System Signal
                      </span>
                      <h4 className="text-lg font-display font-bold text-white mt-0.5">
                        {activeStep.visualCard.heading}
                      </h4>
                      <span className="text-[11px] text-white/60 block">
                        {activeStep.visualCard.subheading}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-mint">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[11px] text-white/70 font-mono">
                        {activeStep.visualCard.metric1Label}
                      </div>
                      <div className="text-base sm:text-lg font-mono font-bold text-brand-mint mt-1">
                        {activeStep.visualCard.metric1Val}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[11px] text-white/70 font-mono">
                        {activeStep.visualCard.metric2Label}
                      </div>
                      <div className="text-base sm:text-lg font-mono font-bold text-white mt-1">
                        {activeStep.visualCard.metric2Val}
                      </div>
                    </div>
                  </div>

                  {/* Highlight Callout */}
                  <div className="p-4 rounded-2xl bg-brand-charcoal/60 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {activeStep.visualCard.highlightItem}
                    </p>
                  </div>

                  {/* Status Footer */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-white/70">
                      Acting Principal: <strong className="text-white font-medium">{activeStep.actor}</strong>
                    </span>
                    <Badge variant="mint-pill" className="text-[10px]">
                      {activeStep.visualCard.statusBadge}
                    </Badge>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Progress step dots & direct step buttons */}
          <div className="flex items-center justify-center gap-3 pt-8 mt-6 border-t border-white/10">
            {stepsData.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeStepIndex === idx
                    ? 'w-10 bg-brand-mint'
                    : 'w-2.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Jump to step ${step.id}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
