import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, Volume2, ShieldCheck, Check, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface PhoneSimulatorProps {
  onOpenDemo?: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ onOpenDemo }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: 'Digital Verification',
      desc: 'Link your Udyam or PAN once. UDYOGA verifies your business registration and public data rails in moments.',
    },
    {
      id: 2,
      title: 'Consent-Based Cash Flow Data',
      desc: 'The Account Aggregator network transfers certified banking records directly to lenders upon your OTP authorization. No passwords shared.',
    },
    {
      id: 3,
      title: 'Underwriter Review & Disbursal',
      desc: 'Once approved by a partner bank or NBFC, funds disburse directly to your business account with scheduled UPI AutoPay sweeps.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-12 rounded-3xl bg-brand-forest text-brand-ivory p-8 sm:p-12 shadow-elevated border border-brand-forest/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Step Triggers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-mint font-semibold">
              Digital Verification Rail
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mt-1">
              Credit that moves at the speed of your shop.
            </h2>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">
              No physical paperwork, no property deeds to pledge, and no multi-week waiting periods. If you operate a small business with regular sales transactions, your cash flow can be evaluated for institutional credit.
            </p>
          </div>

          {/* Interactive Feature Steps */}
          <div className="space-y-3 pt-2">
            {steps.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  activeStep === s.id
                    ? 'bg-white/10 border-brand-mint shadow-sm'
                    : 'bg-transparent border-white/10 hover:bg-white/5 text-white/70'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep === s.id ? 'bg-brand-mint text-brand-charcoal' : 'bg-white/10 text-white'
                  }`}>
                    {s.id}
                  </span>
                  <h4 className="font-display font-semibold text-sm text-white">{s.title}</h4>
                </div>
                <p className="text-xs text-white/70 ml-9 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDemo}
              className="px-6 py-2.5 rounded-full bg-brand-mint text-brand-charcoal font-display font-bold text-xs hover:bg-white transition-colors shadow-soft cursor-pointer active:scale-95"
            >
              Experience Live Demo
            </button>
          </div>
        </div>

        {/* Right Side: Realistic Phone Mockup (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[300px] sm:w-[320px] rounded-[42px] bg-brand-charcoal p-3.5 border-4 border-white/20 shadow-elevated text-brand-charcoal select-none">
            {/* Phone Screen Canvas */}
            <div className="w-full rounded-[32px] bg-brand-ivory flex flex-col justify-between overflow-hidden min-h-[460px] border border-black/10">
              
              {/* Phone Header / Call Status */}
              <div className="p-4 border-b border-brand-charcoal/10 bg-white/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-display font-bold text-xs text-brand-charcoal">UDYOGA Assistant</h5>
                      <span className="text-[9px] bg-brand-forest/10 text-brand-forest px-1.5 py-0.2 rounded font-mono font-semibold">Demo</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Digital Verification · 01:42
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <PhoneOff className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono bg-brand-forest/5 px-2 py-0.5 rounded text-brand-forest/80 text-center">
                  Account Aggregator ID: aa_sbi_4892
                </div>
              </div>

              {/* Chat / Message Stream */}
              <div className="p-3.5 space-y-2.5 text-xs overflow-y-auto max-h-[300px]">
                {/* Agent Bubble */}
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-brand-forest/10 max-w-[85%]">
                  <span className="text-[10px] text-brand-forest/60 font-semibold block mb-0.5">Verification Engine</span>
                  <p className="text-xs text-brand-charcoal/80">
                    Reconciled 142 daily UPI transactions for Sri Balaji Provisions. No payment bounces recorded.
                  </p>
                </div>

                {/* User Response Bubble */}
                <div className="ml-auto bg-brand-mint/30 p-3 rounded-2xl rounded-tr-sm shadow-sm border border-brand-mint/40 max-w-[85%]">
                  <span className="text-[10px] text-emerald-900 font-semibold block mb-0.5">Ramesh Kumar</span>
                  <p className="text-xs text-brand-charcoal">
                    Confirmed ₹1,50,000 required for inventory replenishment.
                  </p>
                </div>

                {/* Verification Badge */}
                <motion.div 
                  className="bg-brand-forest text-white p-3 rounded-2xl shadow-sm text-center"
                  animate={{ scale: [0.98, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-brand-mint font-bold block">
                    ✓ Sanction Recommended
                  </span>
                  <span className="text-base font-bold font-mono">₹1,50,000</span>
                  <span className="text-[10px] text-white/80 block mt-0.5">
                    Disbursal ready to SBI •••• 4892 upon lender sign-off
                  </span>
                </motion.div>
              </div>

              {/* Phone Bottom Dock */}
              <div className="p-3 bg-white/80 border-t border-brand-charcoal/10 flex justify-around text-brand-charcoal/70">
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-brand-forest">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[9px]">Speaker</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-brand-forest">
                  <Mic className="w-4 h-4" />
                  <span className="text-[9px]">Mute</span>
                </div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-brand-forest">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-[9px]">Repeat</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
