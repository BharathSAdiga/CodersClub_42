import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import { 
  ArrowUpRight, 
  Wallet, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  FileText,
  Award,
  Download,
  Printer,
  Scale,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface BorrowerDashboardProps {
  activePersona: PersonaProfile;
  onNavigate: (view: string) => void;
}

export const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({
  activePersona,
  onNavigate,
}) => {
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState<number>(25000);
  
  const app = activePersona.application;
  const approvedLimit = app?.approvedAmount || 150000;
  
  // Persistent tracking of drawn capital
  const storageWithdrawKey = `udyoga_borrower_drawn_${activePersona.id}`;
  const [withdrawnTotal, setWithdrawnTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageWithdrawKey);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const availableToWithdraw = Math.max(0, approvedLimit * 0.85 - withdrawnTotal);

  // Persistent activity log
  const storageActivityKey = `udyoga_borrower_activity_${activePersona.id}`;
  const [activityList, setActivityList] = useState(() => {
    try {
      const saved = localStorage.getItem(storageActivityKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { title: 'Evening Sachet Repayment Cleared', date: 'Yesterday, 21:02 IST', amount: '-₹1,890', status: 'SUCCESS' },
      { title: 'Daily UPI QR Volume Reconciled', date: 'Yesterday, 19:45 IST', amount: '+₹24,850', status: 'STREAMED' },
      { title: 'Evening Sachet Repayment Cleared', date: '18 Nov, 21:01 IST', amount: '-₹1,890', status: 'SUCCESS' },
      { title: 'Working Capital Facility Initialized', date: '15 Nov, 14:30 IST', amount: '+₹1,50,000', status: 'SANCTION' },
    ];
  });

  const handleOpenWithdrawModal = () => {
    setWithdrawInputAmount(Math.min(25000, availableToWithdraw));
    setIsWithdrawModalOpen(true);
  };

  const handleConfirmWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawInputAmount <= 0 || withdrawInputAmount > availableToWithdraw) {
      toast.error(`Please enter an amount between ₹1,000 and ₹${availableToWithdraw.toLocaleString('en-IN')}.`);
      return;
    }

    const newWithdrawn = withdrawnTotal + withdrawInputAmount;
    setWithdrawnTotal(newWithdrawn);
    try {
      localStorage.setItem(storageWithdrawKey, newWithdrawn.toString());
    } catch {}

    const newActivity = {
      title: 'Instant Working Capital Disbursal',
      date: 'Just now',
      amount: `+${formatINR(withdrawInputAmount)}`,
      status: 'DISBURSED',
    };

    const updatedActivities = [newActivity, ...activityList];
    setActivityList(updatedActivities);
    try {
      localStorage.setItem(storageActivityKey, JSON.stringify(updatedActivities));
    } catch {}

    setIsWithdrawModalOpen(false);
    toast.success(`Disbursal initiated! ₹${withdrawInputAmount.toLocaleString('en-IN')} queued via IMPS to ${activePersona.financials?.accounts[0]?.bankName || 'verified account'}.`);
  };

  const handlePrintPassport = () => {
    toast.success('Opening printable Business Financial Passport view...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
            {activePersona.business?.tradeName || 'Enterprise Dashboard'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Welcome back, {activePersona.name}
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Flow-based facility status: <strong className="text-brand-mint">Active & Reconciled</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPassportModalOpen(true)}
            className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-brand-mint" />
            <span>Financial Passport</span>
          </Button>

          <Button 
            variant="accent" 
            size="pill" 
            onClick={handleOpenWithdrawModal}
            className="gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw Capital</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Approved Limit */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Sanctioned Line</span>
            <CardTitle className="text-3xl font-mono text-brand-forest">
              {formatINR(approvedLimit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Tenor: {app?.tenorDays || 90} Days @ {app?.apr || 14.2}% APR
            </span>
          </CardContent>
        </Card>

        {/* Available to Draw */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Available Drawing Power</span>
            <CardTitle className="text-3xl font-mono text-brand-charcoal">
              {formatINR(availableToWithdraw)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Instant IMPS / NEFT Credit
            </span>
          </CardContent>
        </Card>

        {/* ACIE Vitality Score */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Credit Vitality Score</span>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl font-mono text-brand-forest">
                {activePersona.acieReport?.creditVitalityScore || 768}
              </CardTitle>
              <span className="text-xs font-mono text-brand-charcoal/40">/ 900</span>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="mint" className="text-[10px] font-mono">
              {activePersona.acieReport?.scoreBand || 'PRIME'} TIER
            </Badge>
          </CardContent>
        </Card>

        {/* Daily Sachet Sweep */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Automated Daily Sweep</span>
            <CardTitle className="text-3xl font-mono text-brand-terracotta">
              ₹1,890
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Auto-deducted via UPI evening closing
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Navigation Shortcuts to Key Views */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Financial Health Hub */}
        <div 
          onClick={() => onNavigate('/borrower/health')}
          className="p-6 rounded-3xl bg-white border border-brand-forest/15 hover:border-brand-forest shadow-soft cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-brand-forest mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-base text-brand-charcoal">4-Tier Financial DNA Pulse</h4>
          <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
            Inspect 4-dimensional synthesis (Volume, Volatility, Seasonality, Debt Burden) synthesized by Agent 4.
          </p>
          <span className="text-xs font-bold text-brand-forest mt-4 inline-flex items-center gap-1">
            View Financial DNA <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* What-If Simulator */}
        <div 
          onClick={() => onNavigate('/borrower/insights')}
          className="p-6 rounded-3xl bg-white border border-brand-forest/15 hover:border-brand-forest shadow-soft cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-base text-brand-charcoal">"What-If" Credit Simulator</h4>
          <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
            Slide transaction volumes to see deterministic steps to unlock +₹1,50,000 extra credit.
          </p>
          <span className="text-xs font-bold text-brand-terracotta mt-4 inline-flex items-center gap-1">
            Launch Simulator <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* DPDP Consent Center */}
        <div 
          onClick={() => onNavigate('/borrower/consent')}
          className="p-6 rounded-3xl bg-white border border-brand-forest/15 hover:border-brand-forest shadow-soft cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-base text-brand-charcoal">Granular Consent Center</h4>
          <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
            Inspect active Account Aggregator and UPI permissions. Instant one-click revocation.
          </p>
          <span className="text-xs font-bold text-emerald-800 mt-4 inline-flex items-center gap-1">
            Manage Data <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

      </div>

      {/* Recent Activity Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Flow-Based Sweeps & Activity</CardTitle>
            <span className="text-xs font-mono text-brand-charcoal/50">Live UPI AutoPay Log</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityList.map((tx: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    tx.status === 'SUCCESS' ? 'bg-brand-forest/10 text-brand-forest' : tx.status === 'DISBURSED' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tx.status === 'SUCCESS' ? '✓' : tx.status === 'DISBURSED' ? '₹' : '↓'}
                  </div>
                  <div>
                    <strong className="text-brand-charcoal block">{tx.title}</strong>
                    <span className="text-[10px] text-brand-charcoal/50">{tx.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold block ${tx.amount.startsWith('+') ? 'text-emerald-700' : 'text-brand-charcoal'}`}>
                    {tx.amount}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-brand-forest font-semibold">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capital Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-forest text-white flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-brand-charcoal">
                    Draw Down Working Capital
                  </h3>
                  <span className="text-xs text-brand-charcoal/60">
                    Instant bank transfer via RBI IMPS rail
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-7 h-7 rounded-full bg-brand-charcoal/10 hover:bg-brand-charcoal/20 flex items-center justify-center text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdrawal} className="space-y-4 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Available Drawing Power</span>
                <strong className="text-2xl font-mono font-bold text-brand-forest block">
                  {formatINR(availableToWithdraw)}
                </strong>
                <span className="text-[11px] text-brand-charcoal/60 block">
                  Pre-approved limit @ 14.2% APR (Zero prepayment penalties)
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-charcoal block">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="1000"
                  max={availableToWithdraw}
                  step="500"
                  value={withdrawInputAmount}
                  onChange={(e) => setWithdrawInputAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-brand-forest/20 bg-brand-ivory text-sm font-mono font-bold text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] space-y-1 text-emerald-900">
                <strong className="block">Destination Bank Account:</strong>
                <p>
                  {activePersona.financials?.accounts[0]?.bankName || 'State Bank of India'} (A/c ending {activePersona.financials?.accounts[0]?.accountNumberMasked.slice(-4) || '8912'})
                </p>
                <p className="text-[10px] text-emerald-800/80">
                  Daily sachet repayment covenant: ~₹{Math.round((withdrawInputAmount * 1.14) / (app?.tenorDays || 90))} / day via evening UPI AutoPay.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-brand-forest/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={availableToWithdraw <= 0}
                  className="rounded-full text-xs font-semibold px-5 bg-brand-forest text-white hover:bg-brand-forest/90"
                >
                  Confirm Instant Disbursal
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Feature 14: Business Financial Passport Modal */}
      {isPassportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-brand-forest/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-forest text-white flex items-center justify-center font-display font-bold">
                  U
                </div>
                <div>
                  <Badge variant="forest" className="text-[10px] mb-1">
                    Verified Digital Credential
                  </Badge>
                  <h3 className="font-display font-bold text-lg text-brand-charcoal">
                    Business Financial Passport
                  </h3>
                  <span className="text-[10px] font-mono text-brand-charcoal/60">
                    Credential ID: PASSPORT-IN-2026-0891 · Issued under DPDP Framework
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsPassportModalOpen(false)}
                className="p-1 rounded-full text-brand-charcoal/40 hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Identity Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs">
              <div>
                <span className="text-[10px] text-brand-charcoal/50 block font-mono">Enterprise Trade Name</span>
                <strong className="text-brand-charcoal">{activePersona.business?.tradeName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-brand-charcoal/50 block font-mono">PAN / Entity ID</span>
                <strong className="text-brand-charcoal font-mono">{activePersona.business?.pan}</strong>
              </div>
              <div>
                <span className="text-[10px] text-brand-charcoal/50 block font-mono">Operating Vintage</span>
                <strong className="text-brand-charcoal">{activePersona.business?.yearsInOperation} Years Continuous</strong>
              </div>
              <div>
                <span className="text-[10px] text-brand-charcoal/50 block font-mono">Credit Vitality</span>
                <strong className="text-brand-forest font-mono">{activePersona.acieReport?.creditVitalityScore || 768}/900</strong>
              </div>
            </div>

            {/* 5 Dimensions Summary Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-brand-charcoal block">5-Dimension Enterprise DNA</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-semibold block">1. Vitality</span>
                  <strong className="text-emerald-950 block mt-0.5">84/100 Strong</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-semibold block">2. Continuity</span>
                  <strong className="text-emerald-950 block mt-0.5">79/100 Good</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-semibold block">3. Reliability</span>
                  <strong className="text-emerald-950 block mt-0.5">88/100 Excellent</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] text-blue-800 font-semibold block">4. Resilience</span>
                  <strong className="text-blue-950 block mt-0.5">68/100 Moderate</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-semibold block">5. Confidence</span>
                  <strong className="text-emerald-950 block mt-0.5">92/100 High</strong>
                </div>
              </div>
            </div>

            {/* Approved Terms and Cryptographic Seal */}
            <div className="p-4 rounded-2xl bg-brand-charcoal text-white text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span>Indicative Borrowing Capacity:</span>
                <strong className="text-brand-mint font-mono text-sm">{formatINR(approvedLimit)} @ 14.2% APR</strong>
              </div>
              <div className="flex justify-between items-center text-[11px] text-white/70">
                <span>Verification Rail:</span>
                <span>Sahamati Account Aggregator & NPCI AutoPay</span>
              </div>
              <div className="text-[11px] text-white/75 pt-1 font-mono">
                SHA-256 Digest: 0x7f9a84b2e811c09930f7e...c3a1 (Anchored on Quai Cyprus-1)
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsPassportModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={handlePrintPassport} className="gap-1.5 bg-brand-forest text-white">
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
