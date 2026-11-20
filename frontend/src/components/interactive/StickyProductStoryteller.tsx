import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Database, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  Layers, 
  Activity, 
  Sparkles,
  FileCheck2,
  Banknote
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    title: 'Borrower initiates consent via India Stack DPI',
    shortDesc: 'A kirana or artisan owner logs in with mobile OTP. With zero physical paperwork, they grant DPDP-compliant Account Aggregator (AA) and merchant UPI QR stream permissions in 60 seconds.',
    detailPoints: [
      'No physical branch visit or land registration ledger needed',
      'Encrypted ReBIT-certified consent token issued via Sahamati',
      'Purpose-limited, time-bound data fetch with one-tap revocation'
    ],
    actor: 'Ramesh Kumar (Kirana Merchant)',
    visualCard: {
      heading: 'Sahamati AA Ingestion Rail',
      subheading: 'Account Aggregator FIP Handshake (SBI Current A/c)',
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
    stageBadge: 'STEP 02 • MULTI-MODAL RECONCILIATION',
    title: 'Financial signals triangulated in real time',
    shortDesc: 'Daily merchant cash flow is mapped across three distinct digital rails: verified bank deposits, GSTN outward supply invoices, and UPI merchant QR logs to eliminate synthetic invoice fraud.',
    detailPoints: [
      'Automatic cross-examination of Bank ₹5.84L vs GST ₹6.10L vs UPI ₹5.12L',
      '95.8% multi-stream congruence confirmed',
      'Zero circular transaction loops detected across counterparty VPAs'
    ],
    actor: 'UDYOGA Verification Rail',
    visualCard: {
      heading: '3-Way Triangulation Radar',
      subheading: 'Cross-rail verification across GSTN, Bank AA, and UPI',
      metric1Label: 'Triangulation Ratio',
      metric1Val: '95.8% Congruence',
      metric2Label: 'Anomaly Loops',
      metric2Val: '0 Detected',
      statusBadge: 'VERIFIED GENUINE',
      statusColor: 'emerald',
      highlightItem: 'Transaction velocity matches registered business hours and geo-location footfall.'
    }
  },
  {
    id: 3,
    stageBadge: 'STEP 03 • EXPLAINABLE UNDERWRITING',
    title: 'ACIE generates explainable Credit Vitality',
    shortDesc: 'The Alternative Credit Intelligence Engine (ACIE) evaluates cash-flow velocity, debt service ability, and operational stability. It produces an institutional 0–900 Vitality Score with visual SHAP drivers.',
    detailPoints: [
      'Mathematical Shapley additive explanations (SHAP) reveal positive and drag drivers',
      'Deterministic counterfactual coaching (e.g. "+₹1.5L limit with 15 days higher balance")',
      'Eliminates black-box bias against thin-file and new-to-credit micro-enterprises'
    ],
    actor: 'Alternative Credit Intelligence Engine (ACIE)',
    visualCard: {
      heading: 'ACIE Scorecard & Drivers',
      subheading: 'Institutional Credit Vitality Model Output',
      metric1Label: 'Credit Vitality',
      metric1Val: '768 / 900 (Tier A)',
      metric2Label: 'Model Confidence',
      metric2Val: '97.4% High',
      statusBadge: 'PRIME CASHFLOW',
      statusColor: 'emerald',
      highlightItem: 'Top Positive Driver: Daily UPI merchant inflow regularity (+56 pts). Utility punctuality (+38 pts).'
    }
  },
  {
    id: 4,
    stageBadge: 'STEP 04 • LENDER DECISION DESK',
    title: 'Institutional credit officer reviews & sanctions',
    shortDesc: 'Partner bank or NBFC underwriters review the structured credit report on their dedicated workbench. The human credit officer retains sovereign authority to calibrate haircuts and issue sanction terms.',
    detailPoints: [
      'Human-in-the-loop underwriting with transparent risk indicators',
      'Automated Key Fact Statement (KFS) generated upfront per RBI norms',
      'Instant sanction letter generation with customized interest spread'
    ],
    actor: 'Vikram Deshmukh (Pragati FinServe NBFC)',
    visualCard: {
      heading: 'Underwriting Sanction Desk',
      subheading: 'Facility: Unsecured Working Capital Line',
      metric1Label: 'Sanction Limit',
      metric1Val: '₹1,50,000 INR',
      metric2Label: 'APR / Repayment',
      metric2Val: '14.2% • 90 Days',
      statusBadge: 'SANCTION ISSUED',
      statusColor: 'forest',
      highlightItem: 'Daily sachet sweep covenant (₹1,890/day) synchronized with evening merchant closing UPI auto-sweep.'
    }
  },
  {
    id: 5,
    stageBadge: 'STEP 05 • DISBURSAL & SACHET REPAYMENT',
    title: 'Instant current a/c disbursal with daily micro-sweeps',
    shortDesc: 'Funds are credited directly to the merchant’s current account in under 3 minutes. Repayments execute as frictionless daily UPI AutoPay micro-sweeps without monthly lump-sum panic.',
    detailPoints: [
      'Direct account credit via NPCI IMPS / NEFT rails with 0 escrow delays',
      'Flexible daily sachet deduction aligned with daily sales cadence',
      'Successful repayment builds credit score for gradual limit graduation'
    ],
    actor: 'Borrower & NPCI AutoPay Rail',
    visualCard: {
      heading: 'Disbursal & Sachet Sweep Rail',
      subheading: 'UPI AutoPay & Direct Current Account Settlement',
      metric1Label: 'Disbursed Amount',
      metric1Val: '₹1,50,000 Credited',
      metric2Label: 'Disbursal TAT',
      metric2Val: '3 Mins 42 Secs',
      statusBadge: 'ACTIVE CAPITAL LINE',
      statusColor: 'emerald',
      highlightItem: 'Borrower successfully graduated from informal 60% moneylender debt to formal institutional credit.'
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
    <section ref={containerRef} className="relative bg-brand-charcoal text-white pt-20 pb-28">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-forest/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <Badge variant="outline" className="border-brand-mint/40 text-brand-mint bg-brand-mint/10 mb-4">
            STICKY INTERACTIVE WALKTHROUGH
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
            From thin-file to funded in five transparent stages.
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Follow an application journey as it progresses from consented India Stack ingestion to explainable algorithmic assessment and final human underwriting approval.
          </p>
        </div>

        {/* 2-Column Sticky Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* Left Sticky Stage Visual Showcase (5 cols on lg) */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 z-20">
            <div className="rounded-3xl bg-brand-forest/40 border border-brand-mint/20 p-6 sm:p-8 backdrop-blur-xl shadow-elevated relative overflow-hidden">
              
              {/* Subtle top indicator bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-mint animate-pulse" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-brand-mint uppercase">
                    Live Workflow Simulator
                  </span>
                </div>
                <span className="text-xs font-mono text-white/50">
                  Step {activeStep.id} of {stepsData.length}
                </span>
              </div>

              {/* Dynamic Animated Content Panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
<<<<<<< HEAD
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
=======
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
>>>>>>> origin/feature/harshitha-finance
                  className="space-y-6"
                >
                  {/* Card Header & Title */}
                  <div>
                    <span className="text-xs font-mono text-brand-mint font-semibold">
                      {activeStep.visualCard.heading}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                      {activeStep.visualCard.subheading}
                    </h3>
                  </div>

                  {/* 2 Key Metrics Box */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-[11px] text-white/60 font-mono">
                        {activeStep.visualCard.metric1Label}
                      </div>
                      <div className="text-lg font-bold font-mono text-brand-mint mt-0.5">
                        {activeStep.visualCard.metric1Val}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-white/60 font-mono">
                        {activeStep.visualCard.metric2Label}
                      </div>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">
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
                    <span className="text-white/60">
                      Acting Principal: <strong className="text-white font-medium">{activeStep.actor}</strong>
                    </span>
                    <Badge variant="outline" className="border-brand-mint/40 text-brand-mint bg-brand-mint/10 text-[10px]">
                      {activeStep.visualCard.statusBadge}
                    </Badge>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress step dots */}
              <div className="flex items-center gap-2 pt-6 mt-6 border-t border-white/10">
                {stepsData.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStepIndex === idx
                        ? 'w-8 bg-brand-mint'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Jump to step ${step.id}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Scrollable Story Timeline (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-16 lg:space-y-24 py-4">
            {stepsData.map((step, idx) => {
              const isActive = activeStepIndex === idx;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-6 sm:p-8 rounded-3xl transition-all duration-500 cursor-pointer border ${
                    isActive
                      ? 'bg-white/10 border-brand-mint shadow-elevated scale-[1.01]'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold tracking-wider text-brand-mint">
                      {step.stageBadge}
                    </span>
                    <span className="text-xs font-mono text-white/40">0{step.id}</span>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-white/80 leading-relaxed mb-6 font-normal">
                    {step.shortDesc}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    {step.detailPoints.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-white/70">
                        <Check className="w-3.5 h-3.5 text-brand-mint shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
