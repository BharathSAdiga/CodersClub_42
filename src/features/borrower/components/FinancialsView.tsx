import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import { Landmark, QrCode, FileCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const FinancialsView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const fin = activePersona.financials;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Consented Banking Telemetry
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Financial Information & Accounts Hub
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Live data pipes connected via Account Aggregator and NPCI merchant rails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connected Bank Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-brand-forest" />
                <CardTitle className="text-lg">Bank Current Accounts</CardTitle>
              </div>
              <Badge variant="mint">AA Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fin?.accounts.map((acc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-brand-charcoal block">{acc.bankName}</strong>
                    <span className="font-mono text-brand-charcoal/60">{acc.accountNumberMasked}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-brand-forest/10 px-2 py-0.5 rounded text-brand-forest">
                    {acc.ifscCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-forest/10 text-[11px]">
                  <div>
                    <span className="text-brand-charcoal/50 block">Monthly Inflow Avg</span>
                    <strong className="font-mono text-brand-forest">{formatINR(acc.monthlyInflowAvg)}</strong>
                  </div>
                  <div>
                    <span className="text-brand-charcoal/50 block">Avg Daily Balance</span>
                    <strong className="font-mono text-brand-forest">{formatINR(acc.averageDailyBalance)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Merchant UPI QR Streams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-terracotta" />
                <CardTitle className="text-lg">Merchant QR Velocity</CardTitle>
              </div>
              <Badge variant="terracotta">PhonePe QR</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fin?.upiMerchants.length ? (
              fin.upiMerchants.map((upi, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-brand-charcoal block font-mono">{upi.vpaMasked}</strong>
                      <span className="text-brand-charcoal/60">Aggregator: {upi.aggregator}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-forest/10 text-[11px]">
                    <div>
                      <span className="text-brand-charcoal/50 block">Daily Transactions</span>
                      <strong className="font-mono text-brand-charcoal">{upi.dailyAverageTransactions} txns/day</strong>
                    </div>
                    <div>
                      <span className="text-brand-charcoal/50 block">Avg Ticket Size</span>
                      <strong className="font-mono text-brand-charcoal">{formatINR(upi.ticketSizeAverage)}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-brand-forest/5 text-center text-xs text-brand-charcoal/60">
                GST Returns linked as primary trade velocity stream.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
