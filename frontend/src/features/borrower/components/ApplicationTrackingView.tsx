import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { PersonaProfile } from '@/types';
import { apiService } from '@/services/apiService';

export const ApplicationTrackingView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const [liveApp, setLiveApp] = useState<any>(null);
  const app = liveApp || activePersona.application;

  useEffect(() => {
    // Check local storage cached submissions first
    try {
      const cached = JSON.parse(localStorage.getItem('udyoga_loan_applications') || '[]');
      if (cached && cached.length > 0) {
        setLiveApp({
          id: cached[0].id,
          requestedAmount: Number(cached[0].requested_amount) || 195000,
          status: cached[0].status || 'SUBMITTED',
          businessId: cached[0].business_id,
        });
      }
    } catch (e) {
      console.warn('Could not read cached applications:', e);
    }

    apiService.getApplications()
      .then((apps) => {
        if (apps && apps.length > 0) {
          const latest = apps[0];
          setLiveApp({
            id: latest.id,
            requestedAmount: Number(latest.requested_amount) || 195000,
            status: latest.status,
            businessId: latest.business_id,
          });
        }
      })
      .catch(() => {});
  }, []);

  const timeline = [
    { title: 'Application Submitted', desc: 'Parameters and KYC verified via Udyam registry.', status: 'DONE', time: '10:14 AM' },
    { title: 'Data Triangulated', desc: 'Account Aggregator & UPI velocity feeds ingested without bounce.', status: 'DONE', time: '10:15 AM' },
    { title: 'ACIE Model Scored', desc: 'Credit Vitality Score evaluated at 742 (PRIME).', status: 'DONE', time: '10:16 AM' },
    { title: 'Underwriting Verification', desc: 'Assigned to Pragati FinServe institutional credit desk.', status: 'ACTIVE', time: 'In Progress' },
    { title: 'UPI AutoPay & Disbursal', desc: 'Direct bank account credit of sanctioned funds.', status: 'PENDING', time: 'Est. 12 mins' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Live Application Lifecycle
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          Application Tracking & Disbursal Status
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Reference Application ID: <strong className="font-mono text-brand-forest">{app?.id || 'app_balaji_01'}</strong>
        </p>
      </div>

      {/* Hero Status Card */}
      <div className="p-6 rounded-3xl bg-brand-charcoal text-brand-ivory border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold block">
            Current Status
          </span>
          <h3 className="text-xl font-display font-bold text-white mt-0.5">
            Underwriting Desk Review (ETA ~12 mins)
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Target Sanction: <strong className="text-white font-mono">{formatINR(app?.requestedAmount || 150000)}</strong>
          </p>
        </div>
        <div className="p-3 px-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 text-center shrink-0">
          <Badge variant="mint-pill" className="text-xs">
            Fast-Track Priority
          </Badge>
          <span className="text-[11px] font-mono text-white/80 block mt-1.5">
            ETA &lt; 15 mins
          </span>
        </div>
      </div>

      {/* Stepped Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-brand-forest/15 before:my-3">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                  item.status === 'DONE'
                    ? 'bg-brand-forest text-brand-ivory'
                    : item.status === 'ACTIVE'
                    ? 'bg-brand-terracotta text-white animate-pulse'
                    : 'bg-brand-forest/20 text-brand-charcoal/50'
                }`}>
                  {item.status === 'DONE' ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-display font-bold text-xs sm:text-sm text-brand-charcoal">{item.title}</h5>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">{item.time}</span>
                  </div>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
