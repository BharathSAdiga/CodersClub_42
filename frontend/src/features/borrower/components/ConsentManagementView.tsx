import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ConsentItem {
  id: string;
  provider: string;
  purpose: string;
  scope: string;
  expires: string;
  status: 'ACTIVE' | 'REVOKED';
}

export const ConsentManagementView: React.FC = () => {
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'cns_aa_01',
      provider: 'Sahamati Account Aggregator (State Bank of India)',
      purpose: 'Daily banking cash-flow analysis & underwriting verification',
      scope: 'Average Balance, Daily Credits, Bounce Rate',
      expires: '20 Feb 2027',
      status: 'ACTIVE',
    },
    {
      id: 'cns_upi_02',
      provider: 'NPCI UPI Merchant Aggregator (PhonePe)',
      purpose: 'Daily customer transaction velocity & ticket size analysis',
      scope: 'Daily Volume, Active Settlement Days',
      expires: '20 Feb 2027',
      status: 'ACTIVE',
    },
    {
      id: 'cns_digi_03',
      provider: 'DigiLocker Identity Gateway',
      purpose: 'Udyam Registration & PAN legal entity verification',
      scope: 'Name, Enterprise Class, Registered Address',
      expires: 'Permanent (KYC record)',
      status: 'ACTIVE',
    },
  ]);

  const handleToggleRevoke = (id: string) => {
    setConsents((list) =>
      list.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
          if (newStatus === 'REVOKED') {
            toast.warning(`Data consent revoked for ${c.provider}. Background polling immediately ceased.`);
          } else {
            toast.success(`Data consent re-authorized for ${c.provider}.`);
          }
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          DPDP Act 2023 Statutory Center
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Granular Consent & Data Governance
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          You have absolute sovereign control over which financial feeds are accessed. Revoking consent immediately terminates data polling.
        </p>
      </div>

      {/* Information Alert */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          UDYOGA operates on strict purpose limitation. We never sell your commerce records, read smartphone contacts, or share transaction details with third-party advertisers.
        </p>
      </div>

      {/* Consent Cards */}
      <div className="space-y-4">
        {consents.map((c) => (
          <Card key={c.id} className="border-brand-forest/15">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{c.provider}</CardTitle>
                    <Badge variant={c.status === 'ACTIVE' ? 'mint' : 'outline'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-charcoal/70 mt-1">{c.purpose}</p>
                </div>

                <Button
                  variant={c.status === 'ACTIVE' ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleRevoke(c.id)}
                  className={`text-xs ${c.status === 'ACTIVE' ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-300' : ''}`}
                >
                  {c.status === 'ACTIVE' ? 'Revoke Access' : 'Re-Authorize'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-1 text-brand-charcoal/60 pt-0">
              <div className="flex justify-between border-t border-brand-forest/10 pt-2">
                <span>Data Scope:</span>
                <span className="font-medium text-brand-charcoal">{c.scope}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiry Timeline:</span>
                <span className="font-mono text-brand-charcoal">{c.expires}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
