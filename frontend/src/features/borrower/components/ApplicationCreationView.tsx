import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import { Sliders, ArrowRight, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

export const ApplicationCreationView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [amount, setAmount] = useState<number>(150000);
  const [tenor, setTenor] = useState<number>(90);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const apr = frequency === 'DAILY' ? 14.2 : 14.8;
  const totalInterest = Math.round((amount * (apr / 100) * tenor) / 365);
  const totalPayable = amount + totalInterest;
  const cycleCount = frequency === 'DAILY' ? tenor : Math.round(tenor / 7);
  const installment = Math.round(totalPayable / cycleCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Please accept the Key Fact Statement terms.');
      return;
    }
    setIsSubmitting(true);
    const user = apiService.getCurrentUser();
    const bizId = user?.business_id || 'msme_kirana_kanpur_001';

    try {
      const app = await apiService.submitApplication({
        business_id: bizId,
        facility_type: frequency === 'DAILY' ? 'DAILY_REVENUE_SWEEP_LINE' : 'STANDARD_WORKING_CAPITAL_LINE',
        requested_amount: amount,
      });
      toast.success(`Credit application ${app.id || ''} submitted and saved to SQLite! Review underway.`);
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Self-Service Underwriting
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Create Working Capital Application
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Select your required inventory capital and configure your preferred repayment cadence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facility Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-charcoal">Requested Amount</span>
                  <span className="font-mono font-bold text-brand-forest text-sm">{formatINR(amount)}</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="300000"
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                />
              </div>

              {/* Tenor */}
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

              {/* Frequency */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-brand-charcoal">Repayment Cadence</span>
                <div className="flex p-1 rounded-full bg-brand-forest/10 border border-brand-forest/20">
                  <button
                    type="button"
                    onClick={() => setFrequency('DAILY')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      frequency === 'DAILY' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70'
                    }`}
                  >
                    Daily Sweep
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('WEEKLY')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      frequency === 'WEEKLY' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70'
                    }`}
                  >
                    Weekly Sachet
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Real-time KFS Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl p-6 bg-brand-forest text-brand-ivory border border-brand-forest/30 shadow-card space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/15">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-bold">
                Key Fact Statement
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                RBI Compliant
              </span>
            </div>

            <div>
              <span className="text-xs text-white/70 block">
                {frequency === 'DAILY' ? 'Daily Evening Sweep' : 'Weekly Sweep'}
              </span>
              <div className="text-4xl font-display font-extrabold text-white tracking-tight font-mono my-1">
                {formatINR(installment)}
              </div>
              <span className="text-[11px] text-white/60">
                Total {cycleCount} installments over {tenor} days
              </span>
            </div>

            <div className="space-y-2 py-3 border-t border-white/15 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Sanction Principal:</span>
                <span className="font-mono text-white">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-mono text-white">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Percentage Rate (APR):</span>
                <span className="font-mono text-brand-mint font-bold">{apr}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount to Repay:</span>
                <span className="font-mono text-white font-bold">{formatINR(totalPayable)}</span>
              </div>
            </div>

            <label className="flex items-start gap-2 text-[11px] text-white/80 cursor-pointer pt-2">
              <input 
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 accent-brand-mint rounded"
              />
              <span>I accept the Key Fact Statement terms and consent to automated UPI AutoPay debits.</span>
            </label>

            <Button
              variant="accent"
              size="lg"
              onClick={handleSubmit}
              className="w-full gap-2 mt-2"
            >
              <span>Submit & Apply</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
