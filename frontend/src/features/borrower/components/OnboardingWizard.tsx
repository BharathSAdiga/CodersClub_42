import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { formatINR } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import { 
  Building, 
  Landmark, 
  QrCode, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [udyam, setUdyam] = useState<string>('UDYAM-KR-03-0048921');
  const [pan, setPan] = useState<string>('BPLPK8912M');
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [aaApproved, setAaApproved] = useState<boolean>(false);
  const [upiHandle, setUpiHandle] = useState<string>('balajiprovisions@upi');
  const [requestedAmount, setRequestedAmount] = useState<number>(150000);
  const [tenor, setTenor] = useState<number>(90);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const handleNextStep = async () => {
    if (step === 2 && !aaApproved) {
      toast.error('Please approve Account Aggregator consent to proceed.');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        await apiService.createBusinessProfile({
          legal_name: 'Shree Balaji Provisions',
          trade_name: 'Balaji Kirana & Provisions',
          sector: 'RETAIL_KIRANA',
          vintage_months: 48,
          location_tier: 'TIER_2',
          entity_type: 'PROPRIETORSHIP',
          declared_monthly_turnover: requestedAmount * 2,
          declared_existing_monthly_emi: 4500,
          has_udyam_registration: true,
          udyam_reg_number: udyam,
        });
      } catch (e) {
        console.warn('Sync profile with backend:', e);
      }
      toast.success('Onboarding complete! Working capital sanction approved.');
      onComplete();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-forest/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-terracotta font-semibold">
            Step {step} of 4
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            {step === 1 && 'Verify Business Identity'}
            {step === 2 && 'Link Bank Cash Flow (Account Aggregator)'}
            {step === 3 && 'Connect Merchant UPI Velocity'}
            {step === 4 && 'Calibrate Working Capital Line'}
          </h2>
        </div>
        <Badge variant="mint">Zero Paperwork</Badge>
      </div>

      {/* Step 1: Business Identity */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Government Registry Verification</CardTitle>
            <p className="text-xs text-brand-charcoal/60">
              Enter your Udyam Registration number or PAN to pull official ministry records.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                Udyam Registration Number
              </label>
              <Input
                value={udyam}
                onChange={(e) => setUdyam(e.target.value)}
                placeholder="UDYAM-XX-00-0000000"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                Business PAN
              </label>
              <Input
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="ABCDE1234F"
              />
            </div>

            {/* Simulated Verified Entity Preview */}
            <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-forest font-bold block">
                ✓ Registry Match Found
              </span>
              <h4 className="font-display font-bold text-sm text-brand-charcoal">Sri Balaji Provisions</h4>
              <p className="text-xs text-brand-charcoal/70">
                Proprietorship · Micro Enterprise · Hubli, Karnataka
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Account Aggregator Consent */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>3-Click Account Aggregator Consent</CardTitle>
            <p className="text-xs text-brand-charcoal/60">
              Consent to encrypted read-only cash flow telemetry. Zero login passwords or debit permissions required.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {['SBI', 'HDFC', 'Canara Bank'].map((b) => (
                <div
                  key={b}
                  onClick={() => setSelectedBank(b)}
                  className={`p-4 rounded-2xl cursor-pointer text-center border font-display font-bold text-sm transition-all ${
                    selectedBank === b
                      ? 'bg-brand-forest text-brand-ivory border-brand-forest shadow-sm'
                      : 'bg-white hover:bg-brand-forest/5 border-brand-forest/15 text-brand-charcoal'
                  }`}
                >
                  {b}
                </div>
              ))}
            </div>

            {/* AA Consent Box */}
            <div className="p-5 rounded-2xl bg-brand-ivory border border-brand-forest/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-forest">
                <ShieldCheck className="w-4 h-4 text-brand-mint" />
                <span>Sahamati Certified Consent Artifact</span>
              </div>
              <ul className="text-xs text-brand-charcoal/70 space-y-1.5 list-disc pl-5">
                <li>Read-only access to daily transaction turnover across 90 days.</li>
                <li>Purpose: Cash flow underwriting for working capital loan.</li>
                <li>Valid for 90 days. Revocable at any time from your dashboard.</li>
              </ul>

              <button
                type="button"
                onClick={() => {
                  setAaApproved(true);
                  toast.success('Account Aggregator consent approved via mobile OTP!');
                }}
                className={`w-full py-3 rounded-full text-xs font-semibold font-display transition-all ${
                  aaApproved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-forest text-white hover:bg-brand-forest-hover'
                }`}
              >
                {aaApproved ? '✓ AA Consent Authorized (SBI •••• 4892)' : 'Authorize via Bank OTP'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Merchant UPI QR Linking */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Merchant UPI Handle</CardTitle>
            <p className="text-xs text-brand-charcoal/60">
              Verify your daily store sales volume to unlock higher credit limits and lower interest rates.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                Merchant UPI VPA Handle
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-brand-charcoal/40 absolute left-3.5 top-4" />
                <Input
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                  placeholder="shopname@upi"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-mint/20 border border-brand-mint/40 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-900 font-bold block">
                ⚡ Real-Time Telemetry Discovered
              </span>
              <p className="text-xs text-brand-charcoal">
                142 daily customer collections averaging ₹128/ticket size. Verified PhonePe merchant QR.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Loan Customizer */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Calibrate Facility & View Sanction</CardTitle>
            <p className="text-xs text-brand-charcoal/60">
              Adjust your loan size and select your repayment cadence.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-brand-charcoal">Loan Principal</span>
                <span className="font-mono font-bold text-brand-forest text-sm">{formatINR(requestedAmount)}</span>
              </div>
              <input
                type="range"
                min="25000"
                max="250000"
                step="5000"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-brand-charcoal">Repayment Tenor</span>
                <span className="font-mono font-bold text-brand-forest text-sm">{tenor} Days</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={tenor}
                onChange={(e) => setTenor(Number(e.target.value))}
                className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
              />
            </div>

            {/* Instant Key Fact Statement (KFS) Preview */}
            <div className="p-5 rounded-2xl bg-brand-charcoal text-brand-ivory space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-brand-mint font-mono block">
                Key Fact Statement (KFS)
              </span>
              <div className="flex justify-between text-white/80">
                <span>Sanction Amount:</span>
                <strong className="text-white font-mono">{formatINR(requestedAmount)}</strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Daily Sachet Sweep:</span>
                <strong className="text-brand-mint font-mono">
                  {formatINR(Math.round((requestedAmount * 1.14) / tenor))} / evening
                </strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Effective APR:</span>
                <strong className="text-white font-mono">14.2%</strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Hidden Charges:</span>
                <strong className="text-brand-mint">₹0 (Zero)</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <Button variant="outline" size="md" onClick={() => setStep(step - 1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </Button>
        ) : <div />}

        <Button variant="accent" size="pill" onClick={handleNextStep} className="gap-2">
          <span>{step === 4 ? 'Issue Instant Sanction' : 'Save & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
};
