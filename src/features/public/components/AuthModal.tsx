import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Phone, Lock, Sparkles, Building, Landmark, Scale, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (personaKey: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    toast.success('Demo OTP 4892 sent to ' + mobile);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the 4-digit OTP.');
      return;
    }
    toast.success('Authentication successful! Logging into Borrower Portal.');
    onLoginSuccess('PERSONA_RAMESH');
    onClose();
  };

  const handleQuickDemoLogin = (personaKey: string) => {
    toast.success('Instant demo login active!');
    onLoginSuccess(personaKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-brand-ivory rounded-3xl border border-brand-forest/20 shadow-elevated overflow-hidden text-brand-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-forest/10 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-forest flex items-center justify-center text-brand-mint text-xs font-bold">
              U
            </div>
            <h3 className="font-display font-bold text-base text-brand-charcoal">
              {authMode === 'LOGIN' ? 'Sign in to UDYOGA' : 'Register Enterprise'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-brand-forest/10 hover:bg-brand-forest/20 flex items-center justify-center text-brand-charcoal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Demo Login Presets */}
          <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/10 space-y-2.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-brand-forest font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
              One-Click Hackathon Demo Roles:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickDemoLogin('PERSONA_RAMESH')}
                className="p-2 rounded-xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors"
              >
                🏬 Ramesh (Kirana)
              </button>
              <button
                onClick={() => handleQuickDemoLogin('PERSONA_PRIYA')}
                className="p-2 rounded-xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors"
              >
                🧵 Priya (Textiles)
              </button>
              <button
                onClick={() => handleQuickDemoLogin('PERSONA_VIKRAM')}
                className="p-2 rounded-xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors"
              >
                🏦 Vikram (Lender)
              </button>
              <button
                onClick={() => handleQuickDemoLogin('PERSONA_SUNITA')}
                className="p-2 rounded-xl bg-white hover:bg-brand-forest hover:text-white border border-brand-forest/15 text-left font-medium transition-colors"
              >
                ⚖️ Dr. Sunita (Auditor)
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-brand-forest/10 w-full" />
            <span className="bg-brand-ivory px-3 text-[10px] uppercase font-mono text-brand-charcoal/50 absolute">
              or mobile OTP
            </span>
          </div>

          {/* Mobile OTP Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-4" />
                  <Input 
                    type="tel"
                    placeholder="e.g. 98451 23890"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Get Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Enter 4-Digit OTP (Demo: 4892)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-4" />
                  <Input 
                    type="text"
                    maxLength={4}
                    placeholder="4892"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 font-mono tracking-widest text-base"
                  />
                </div>
              </div>
              <Button type="submit" variant="accent" size="lg" className="w-full">
                Verify & Enter Portal
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
