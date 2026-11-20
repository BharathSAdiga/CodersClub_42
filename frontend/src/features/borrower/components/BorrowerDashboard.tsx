import React from 'react';
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
  FileText
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
  const app = activePersona.application;
  const approvedLimit = app?.approvedAmount || 150000;
  const availableToWithdraw = approvedLimit * 0.85;

  const handleWithdrawFunds = () => {
    toast.success(`Disbursal initiated! ₹${(availableToWithdraw).toLocaleString('en-IN')} queued to ${activePersona.financials?.accounts[0]?.bankName || 'verified account'}.`);
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
            variant="accent" 
            size="pill" 
            onClick={handleWithdrawFunds}
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
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Available to Draw</span>
            <CardTitle className="text-3xl font-mono text-emerald-800">
              {formatINR(availableToWithdraw)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 font-medium">
              Instant disbursal via UPI
            </span>
          </CardContent>
        </Card>

        {/* Next Sachet Sweep */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">Evening Sachet Sweep</span>
            <CardTitle className="text-3xl font-mono text-brand-charcoal">
              {formatINR(app?.repaymentAmountPerCycle || 1720)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60 flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-terracotta" />
              Next sweep: Today at 21:00 IST
            </span>
          </CardContent>
        </Card>

        {/* ACIE Credit Vitality */}
        <Card className="cursor-pointer hover:border-brand-forest/40 transition-colors" onClick={() => onNavigate('/borrower/assessment')}>
          <CardHeader className="pb-2">
            <span className="text-xs font-mono uppercase text-brand-charcoal/50">ACIE Vitality</span>
            <CardTitle className="text-3xl font-mono text-brand-forest flex items-center justify-between">
              <span>{activePersona.acieReport?.creditVitalityScore || 742}</span>
              <Badge variant="mint">PRIME</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-forest font-semibold flex items-center gap-1">
              <span>Explore SHAP Drivers</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cash-Flow Health Mirror */}
        <div 
          onClick={() => onNavigate('/borrower/health')}
          className="p-6 rounded-3xl bg-white border border-brand-forest/15 hover:border-brand-forest shadow-soft cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-brand-forest mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-base text-brand-charcoal">Cash-Flow Health Mirror</h4>
          <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
            View your 30-day stream of daily shop collections, average balance, and liquidity cushion.
          </p>
          <span className="text-xs font-bold text-brand-forest mt-4 inline-flex items-center gap-1">
            Open Mirror <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* "What-If" Credit Simulator */}
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
            {[
              { title: 'Evening Sachet Repayment Cleared', date: 'Yesterday, 21:02 IST', amount: '-₹1,720', status: 'SUCCESS' },
              { title: 'Daily UPI QR Volume Reconciled', date: 'Yesterday, 19:45 IST', amount: '+₹24,850', status: 'STREAMED' },
              { title: 'Evening Sachet Repayment Cleared', date: '18 Nov, 21:01 IST', amount: '-₹1,720', status: 'SUCCESS' },
              { title: 'Working Capital Facility Initialized', date: '15 Nov, 14:30 IST', amount: '+₹1,50,000', status: 'SANCTION' },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    tx.status === 'SUCCESS' ? 'bg-brand-forest/10 text-brand-forest' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tx.status === 'SUCCESS' ? '✓' : '↓'}
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

    </div>
  );
};
