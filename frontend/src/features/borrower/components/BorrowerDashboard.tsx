import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  Wallet,
  Activity,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Award,
  ArrowUpRight,
  ArrowRight,
  Check,
  Building2,
  QrCode,
  Printer,
  ChevronRight,
  Sliders,
  X,
  CreditCard
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
      { id: 'tx-1', title: 'Evening Sachet Repayment Cleared', date: 'Yesterday, 21:02 IST', amount: '-₹1,890', status: 'SUCCESS' },
      { id: 'tx-2', title: 'Daily UPI QR Volume Reconciled', date: 'Yesterday, 19:45 IST', amount: '+₹24,850', status: 'STREAMED' },
      { id: 'tx-3', title: 'Evening Sachet Repayment Cleared', date: '18 Nov, 21:01 IST', amount: '-₹1,890', status: 'SUCCESS' },
      { id: 'tx-4', title: 'Working Capital Facility Initialized', date: '15 Nov, 14:30 IST', amount: '+₹1,50,000', status: 'SANCTION' },
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
      id: `tx-${Date.now()}`,
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

  const handleEarlyRepay = () => {
    toast.success('Advance payment of ₹1,890 initiated via UPI AutoPay. Outstanding principal will reduce immediately.');
  };

  const handlePrintPassport = () => {
    toast.success('Opening printable Business Financial Passport view...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 7-day cash flow bar data
  const weekCashflow = [
    { day: 'Mon', inflow: 22400, outflow: 16100 },
    { day: 'Tue', inflow: 26800, outflow: 18400 },
    { day: 'Wed', inflow: 21500, outflow: 15300 },
    { day: 'Thu', inflow: 28900, outflow: 19800 },
    { day: 'Fri', inflow: 34200, outflow: 22100 },
    { day: 'Sat', inflow: 31000, outflow: 20500 },
    { day: 'Sun', inflow: 19800, outflow: 14200 },
  ];
  const maxInflow = Math.max(...weekCashflow.map((d) => d.inflow));

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* 1. TOP WELCOME & OVERVIEW BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
              {activePersona.business?.tradeName || 'Enterprise Borrower Portal'}
            </span>
            <Badge variant="mint" className="text-xs py-0.5 px-2">
              Facility Active
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Welcome back, {activePersona.name}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Your revenue-based credit facility is active with automated daily sachet repayment via UPI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPassportModalOpen(true)}
            className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 h-10 px-4 rounded-xl"
          >
            <Award className="w-4 h-4 text-brand-mint" />
            <span>Financial Passport</span>
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenWithdrawModal}
            className="text-xs font-bold gap-2 h-10 px-5 rounded-xl bg-brand-mint text-brand-charcoal hover:bg-white shadow-sm"
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw Capital</span>
          </Button>
        </div>
      </div>

      {/* 2. FOUR SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Approved Line */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/60 font-semibold">
              Sanctioned Line
            </span>
            <CardTitle className="text-2xl sm:text-3xl font-mono font-bold text-brand-forest">
              {formatINR(approvedLimit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/70">
              Tenor: {app?.tenorDays || 90} Days @ {app?.apr || 14.2}% APR
            </span>
          </CardContent>
        </Card>

        {/* Available to Draw */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/60 font-semibold">
              Available Drawing Power
            </span>
            <CardTitle className="text-2xl sm:text-3xl font-mono font-bold text-brand-charcoal">
              {formatINR(availableToWithdraw)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant IMPS / NEFT Credit
            </span>
          </CardContent>
        </Card>

        {/* Credit Vitality Score */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/60 font-semibold">
              Credit Vitality Score
            </span>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-2xl sm:text-3xl font-mono font-bold text-brand-forest">
                {activePersona.acieReport?.creditVitalityScore || 768}
              </CardTitle>
              <span className="text-xs font-mono text-brand-charcoal/50">/ 900</span>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="mint" className="text-xs font-mono font-semibold">
              {activePersona.acieReport?.scoreBand || 'PRIME'} TIER (Top 12%)
            </Badge>
          </CardContent>
        </Card>

        {/* Daily Sachet Sweep */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/60 font-semibold">
              Automated Daily Sweep
            </span>
            <CardTitle className="text-2xl sm:text-3xl font-mono font-bold text-brand-terracotta">
              ₹1,890
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/70">
              Evening auto-deduct via UPI AutoPay
            </span>
          </CardContent>
        </Card>

      </div>

      {/* 3. PRIMARY NEXT ACTION BANNER (HIGH VISIBILITY) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-semibold text-amber-950">
                Next Scheduled Repayment: Today at 21:00 IST
              </strong>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                ₹1,890
              </span>
            </div>
            <p className="text-xs text-amber-900/80 mt-0.5">
              Verified closing balance in {activePersona.financials?.accounts[0]?.bankName || 'HDFC Bank'} is healthy. Sufficient liquidity confirmed for automated sweep.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEarlyRepay}
            className="text-xs h-8 px-3 rounded-lg border-amber-300 text-amber-950 hover:bg-amber-100/70"
          >
            Pay Early via UPI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/borrower/health')}
            className="text-xs h-8 px-2.5 text-amber-950 hover:bg-amber-100/70"
          >
            View Schedule
          </Button>
        </div>
      </div>

      {/* 4. BALANCED TWO-COLUMN WORKSPACE (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Core Financial Pulse & Live Ledger (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card A: Real-Time Cashflow Rhythm */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg text-brand-charcoal">
                  Cash Flow Pulse & Daily Inflow Rhythm
                </CardTitle>
                <p className="text-xs text-brand-charcoal/60 mt-0.5">
                  Verified 7-day merchant UPI settlements vs operational disbursements
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('/borrower/health')}
                className="text-xs text-brand-forest hover:text-brand-forest-hover font-semibold p-0 h-auto gap-1 self-start sm:self-auto"
              >
                <span>Full Cash Flow Mirror</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
              {/* Mini Bar Visualization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-brand-charcoal/60 font-mono">
                  <span>Daily Inflow Volume (₹)</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-brand-forest inline-block" /> Inflows
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-brand-terracotta/70 inline-block" /> Outflows
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2 pb-1">
                  {weekCashflow.map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-full h-24 bg-brand-forest/5 rounded-lg flex items-end justify-center gap-1 p-1">
                        <div
                          className="w-1/2 bg-brand-forest rounded-t-sm transition-all"
                          style={{ height: `${(bar.inflow / maxInflow) * 100}%` }}
                          title={`Inflow: ₹${bar.inflow.toLocaleString('en-IN')}`}
                        />
                        <div
                          className="w-1/2 bg-brand-terracotta/70 rounded-t-sm transition-all"
                          style={{ height: `${(bar.outflow / maxInflow) * 100}%` }}
                          title={`Outflow: ₹${bar.outflow.toLocaleString('en-IN')}`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-brand-charcoal/70 font-semibold">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-brand-forest/10">
                <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-xs text-brand-charcoal/60 block font-mono">Avg Daily Inflow</span>
                  <strong className="text-base font-mono font-bold text-brand-forest block mt-0.5">₹24,850</strong>
                  <span className="text-[11px] text-emerald-800 font-medium">Consistent daily trading</span>
                </div>
                <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-xs text-brand-charcoal/60 block font-mono">Monthly Run Rate</span>
                  <strong className="text-base font-mono font-bold text-brand-charcoal block mt-0.5">₹7,45,500</strong>
                  <span className="text-[11px] text-brand-charcoal/60">Annualized ₹89.4 Lakhs</span>
                </div>
                <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-xs text-brand-charcoal/60 block font-mono">Operating Margin</span>
                  <strong className="text-base font-mono font-bold text-emerald-800 block mt-0.5">+18.4%</strong>
                  <span className="text-[11px] text-emerald-800 font-medium">Safe debt service buffer</span>
                </div>
              </div>

              {/* 3-Way Match Verification Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold">3-Way Evidence Match:</span>
                  <span className="text-emerald-900/80">UPI QR + Bank AA + GSTN Data Aligned</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-800">
                  Zero Mismatch Detected
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Active Credit Line & Repayment Progress */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <CardTitle className="text-base sm:text-lg text-brand-charcoal">
                Active Facility & Repayment Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                  <span className="text-brand-charcoal/70">Principal Repaid: ₹1,890</span>
                  <span className="font-bold text-brand-forest">Outstanding: ₹20,610 of ₹22,500 drawn</span>
                </div>
                <div className="w-full h-2.5 bg-brand-forest/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-forest rounded-full transition-all" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-brand-charcoal/60 block font-mono text-[11px]">Daily Sweep</span>
                  <strong className="text-sm font-mono font-bold text-brand-charcoal block mt-0.5">₹1,890 / day</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-brand-charcoal/60 block font-mono text-[11px]">AutoPay Mandate</span>
                  <strong className="text-sm font-bold text-emerald-800 block mt-0.5">Active (NPCI)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-brand-charcoal/60 block font-mono text-[11px]">Tenor Remaining</span>
                  <strong className="text-sm font-mono font-bold text-brand-charcoal block mt-0.5">88 Days</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span className="text-brand-charcoal/60 block font-mono text-[11px]">Prepayment Fee</span>
                  <strong className="text-sm font-bold text-emerald-800 block mt-0.5">₹0 (Zero)</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card C: Recent Flow-Based Sweeps & Activity Ledger */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10 flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg text-brand-charcoal">
                Recent Settlements & AutoPay Activity
              </CardTitle>
              <span className="text-xs font-mono text-brand-charcoal/50">Live UPI Ledger</span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-brand-forest/10">
                {activityList.map((tx: any) => (
                  <div key={tx.id || tx.title} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        tx.status === 'SUCCESS' ? 'bg-brand-forest/10 text-brand-forest' : tx.status === 'DISBURSED' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tx.status === 'SUCCESS' ? '✓' : tx.status === 'DISBURSED' ? '₹' : '↓'}
                      </div>
                      <div>
                        <strong className="text-brand-charcoal block text-xs sm:text-sm">{tx.title}</strong>
                        <span className="text-brand-charcoal/60 font-mono text-[11px]">{tx.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs sm:text-sm block ${tx.amount.startsWith('+') ? 'text-emerald-700' : 'text-brand-charcoal'}`}>
                        {tx.amount}
                      </span>
                      <span className="text-[11px] uppercase font-mono tracking-wider text-brand-forest font-semibold">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Profile, Document Readiness, Passport & What-If (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card 1: Document & Profile Readiness Meter */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10 flex items-center justify-between">
              <CardTitle className="text-base text-brand-charcoal">
                Document Readiness
              </CardTitle>
              <Badge variant="mint" className="text-[11px] py-0.5">
                100% Complete
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">Udyam MSME Registration</span>
                      <span className="text-[10px] text-brand-charcoal/50 font-mono">UDYAM-KR-03-0129481</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 border-emerald-300">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">Bank Statement (AA Rail)</span>
                      <span className="text-[10px] text-brand-charcoal/50 font-mono">180 Days Reconciled</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 border-emerald-300">
                    Synced
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">GSTN & PAN Verification</span>
                      <span className="text-[10px] text-brand-charcoal/50 font-mono">{activePersona.business?.pan || 'AAACB1234D'}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 border-emerald-300">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">DPDP Act Consent</span>
                      <span className="text-[10px] text-brand-charcoal/50 font-mono">Purpose: Flow Lending</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 border-emerald-300">
                    Valid
                  </Badge>
                </div>

              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/borrower/documents')}
                className="w-full text-xs h-9 rounded-xl border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5 font-semibold"
              >
                <span>Manage Data & Documents</span>
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Business Financial Passport Card */}
          <Card className="border-brand-forest/20 shadow-soft bg-gradient-to-br from-white via-white to-brand-mint/10 overflow-hidden">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
                  Digital Credential
                </span>
                <Badge variant="forest" className="text-[10px]">
                  Tamper Proof
                </Badge>
              </div>
              <CardTitle className="text-base text-brand-charcoal mt-1">
                Business Financial Passport
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <p className="text-brand-charcoal/70 leading-relaxed">
                Your cryptographically verified financial passport proves your creditworthiness to any regulated bank or NBFC in India.
              </p>
              
              <div className="p-3 rounded-xl bg-white border border-brand-forest/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-forest/10 flex items-center justify-center text-brand-forest shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-brand-charcoal font-semibold truncate">
                    PASSPORT-IN-2026-0891
                  </strong>
                  <span className="text-[11px] text-brand-charcoal/60 font-mono block">
                    Score: {activePersona.acieReport?.creditVitalityScore || 768} · 5 DNA Pillars
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPassportModalOpen(true)}
                className="w-full text-xs h-9 rounded-xl bg-brand-forest text-white hover:bg-brand-forest/90 font-semibold"
              >
                <Award className="w-3.5 h-3.5 mr-1.5 text-brand-mint" />
                <span>View Full Passport</span>
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: "What-If" Credit Simulator Shortcut */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2 text-brand-terracotta">
                <Sparkles className="w-4 h-4" />
                <CardTitle className="text-base text-brand-charcoal">
                  "What-If" Credit Booster
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <p className="text-brand-charcoal/70 leading-relaxed">
                Maintain an average daily bank balance of <strong className="text-brand-forest">₹35,000</strong> for 30 consecutive days to unlock an additional <strong className="text-brand-forest">+₹1,50,000</strong> sanction limit.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/borrower/insights')}
                className="w-full text-xs h-9 rounded-xl border-brand-terracotta/30 text-brand-terracotta hover:bg-brand-terracotta/5 font-semibold"
              >
                <span>Simulate Future Limit</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Assessment Report Shortcut */}
          <Card 
            onClick={() => onNavigate('/borrower/assessment')}
            className="border-brand-forest/15 shadow-soft hover:border-brand-forest transition-colors cursor-pointer p-4 bg-brand-forest/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-forest text-brand-mint flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs sm:text-sm text-brand-charcoal">
                    Assessment Report (CAM)
                  </h4>
                  <ChevronRight className="w-4 h-4 text-brand-charcoal/40" />
                </div>
                <p className="text-[11px] text-brand-charcoal/70 mt-0.5 leading-relaxed">
                  Inspect the complete Credit Appraisal Memo and 7-agent forensic trace.
                </p>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* MODAL 1: Capital Withdrawal Modal */}
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
                <span className="text-xs uppercase font-mono text-brand-charcoal/60 font-semibold block">
                  Available Drawing Power
                </span>
                <strong className="text-2xl font-mono font-bold text-brand-forest block">
                  {formatINR(availableToWithdraw)}
                </strong>
                <span className="text-xs text-brand-charcoal/70 block">
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

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-950">
                <strong className="block font-semibold">Destination Bank Account:</strong>
                <p>
                  {activePersona.financials?.accounts[0]?.bankName || 'State Bank of India'} (A/c ending {activePersona.financials?.accounts[0]?.accountNumberMasked.slice(-4) || '8912'})
                </p>
                <p className="text-[11px] text-emerald-900/80">
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

      {/* MODAL 2: Business Financial Passport Modal */}
      {isPassportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between pb-4 border-b border-brand-forest/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-forest text-white flex items-center justify-center font-display font-bold">
                  U
                </div>
                <div>
                  <Badge variant="forest" className="text-xs mb-1">
                    Verified Digital Credential
                  </Badge>
                  <h3 className="font-display font-bold text-xl text-brand-charcoal">
                    Business Financial Passport
                  </h3>
                  <span className="text-xs font-mono text-brand-charcoal/70">
                    Credential ID: PASSPORT-IN-2026-0891 · Issued under DPDP Framework
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPassportModalOpen(false)}
                className="p-1.5 rounded-full text-brand-charcoal/50 hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Identity Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs">
              <div>
                <span className="text-xs text-brand-charcoal/60 block font-mono">Trade Name</span>
                <strong className="text-sm text-brand-charcoal block mt-0.5">{activePersona.business?.tradeName}</strong>
              </div>
              <div>
                <span className="text-xs text-brand-charcoal/60 block font-mono">PAN / Entity ID</span>
                <strong className="text-sm text-brand-charcoal font-mono block mt-0.5">{activePersona.business?.pan}</strong>
              </div>
              <div>
                <span className="text-xs text-brand-charcoal/60 block font-mono">Operating Vintage</span>
                <strong className="text-sm text-brand-charcoal block mt-0.5">{activePersona.business?.yearsInOperation} Yrs Continuous</strong>
              </div>
              <div>
                <span className="text-xs text-brand-charcoal/60 block font-mono">Credit Vitality</span>
                <strong className="text-sm text-brand-forest font-mono block mt-0.5">{activePersona.acieReport?.creditVitalityScore || 768}/900</strong>
              </div>
            </div>

            {/* 5 Dimensions Summary Grid */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-brand-charcoal block">5-Dimension Enterprise DNA</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">1. Vitality</span>
                  <strong className="text-sm text-emerald-950 block mt-0.5">84/100</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">2. Continuity</span>
                  <strong className="text-sm text-emerald-950 block mt-0.5">79/100</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">3. Reliability</span>
                  <strong className="text-sm text-emerald-950 block mt-0.5">88/100</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-xs text-blue-800 font-semibold block">4. Resilience</span>
                  <strong className="text-sm text-blue-950 block mt-0.5">68/100</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">5. Confidence</span>
                  <strong className="text-sm text-emerald-950 block mt-0.5">92/100</strong>
                </div>
              </div>
            </div>

            {/* Approved Terms and Cryptographic Seal */}
            <div className="p-4 rounded-2xl bg-brand-charcoal text-white text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-sm">Indicative Borrowing Capacity:</span>
                <strong className="text-brand-mint font-mono text-base">{formatINR(approvedLimit)} @ 14.2% APR</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-white/80">
                <span>Verification Rail:</span>
                <span>Sahamati Account Aggregator & NPCI AutoPay</span>
              </div>
              <div className="text-xs text-white/80 pt-1 font-mono">
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
