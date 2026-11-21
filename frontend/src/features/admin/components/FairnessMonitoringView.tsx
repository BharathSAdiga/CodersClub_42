import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Info, 
  Users, 
  ShieldCheck, 
  FileCheck,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

export const FairnessMonitoringView: React.FC = () => {
  const handleExportCertificate = () => {
    toast.success('Algorithmic Fairness Compliance Certificate (Q4 2026) exported for regulatory review.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Statutory AI Governance Desk
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            Algorithmic Fairness & Bias Review Console
          </h2>
          <p className="text-xs text-brand-charcoal/60">
            Independent compliance audit for four-fifths demographic parity, disparate impact ratios, and missing-data coverage.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCertificate}
          className="gap-2 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Compliance Certificate</span>
        </Button>
      </div>

      {/* Structured Benchmark Dial & Regulatory Threshold */}
      <div className="p-8 rounded-3xl bg-brand-forest text-brand-ivory border border-brand-forest/30 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="mint">Four-Fifths (80%) Rule Compliance</Badge>
              <span className="text-xs font-mono text-white/70">US EEOC & RBI Fair Lending Standard</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              Demographic Parity & Disparate Impact Verified
            </h3>
            <p className="text-xs text-white/80 leading-relaxed max-w-xl">
              The Alternative Credit Intelligence Engine (ACIE) operates strictly on verifiable commercial cash flow (UPI QR, Account Aggregator, GSTN). Protected attributes (gender, caste, religion, personal contacts) are mathematically isolated from the feature vector.
            </p>
          </div>

          <div className="md:col-span-4 p-5 rounded-2xl bg-white/10 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-brand-mint font-bold block">
              Gender Disparate Ratio
            </span>
            <div className="text-4xl font-display font-extrabold text-white font-mono my-1">
              0.947
            </div>
            <span className="text-[10px] text-brand-mint font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Fully Compliant (Target &gt; 0.80)
            </span>
          </div>

        </div>
      </div>

      {/* Demographic Parity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gender Parity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Gender Parity Analysis</CardTitle>
              <span className="text-xs font-mono text-emerald-800 font-bold">DIR: 0.947</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Female-Led MSME Approval Rate:</span>
                <strong className="font-mono text-brand-forest">73.2%</strong>
              </div>
              <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-forest h-full w-[73.2%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Male-Led MSME Approval Rate:</span>
                <strong className="font-mono text-brand-charcoal">77.3%</strong>
              </div>
              <div className="w-full bg-brand-charcoal/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-charcoal h-full w-[77.3%]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10 text-[11px] text-brand-charcoal/70">
              Disparity: 4.1% (Statistical parity achieved; no adverse disparate impact detected).
            </div>
          </CardContent>
        </Card>

        {/* Geographic Disparity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Geographic Cluster Parity</CardTitle>
              <span className="text-xs font-mono text-emerald-800 font-bold">DIR: 0.882</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Tier-2 & Tier-3 District Approval Rate:</span>
                <strong className="font-mono text-brand-forest">68.4%</strong>
              </div>
              <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-forest h-full w-[68.4%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Tier-1 Metro Approval Rate:</span>
                <strong className="font-mono text-brand-charcoal">77.5%</strong>
              </div>
              <div className="w-full bg-brand-charcoal/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-charcoal h-full w-[77.5%]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10 text-[11px] text-brand-charcoal/70">
              Tier-2/3 inclusion driven by merchant UPI velocity without requiring metro bank branches.
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Missing-Data Patterns & DPDP Consent Purge Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Missing-Data Progressive Confidence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing-Data & Thin-File Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span>"No-Hit" Bureau Record Coverage Rate</span>
              <strong className="font-mono text-emerald-800 font-bold">100% Evaluated</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span>Progressive Micro-Sachet Extension Rate</span>
              <strong className="font-mono text-brand-forest">84.2% Extended</strong>
            </div>
            <p className="text-[11px] text-brand-charcoal/60 leading-relaxed pt-1">
              Thin-file applicants without audited P&Ls are not rejected; ACIE initiates smaller ₹25,000–₹75,000 credit facilities to establish a formal track record.
            </p>
          </CardContent>
        </Card>

        {/* DPDP Consent Revocation Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">DPDP Statutory Revocation Ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span>Consent Revocation Requests (Past 30d)</span>
              <strong className="font-mono text-brand-charcoal">18 Requests</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span>Cryptographic Data Purge Verification</span>
              <strong className="font-mono text-emerald-800 font-bold">100.0% Verified</strong>
            </div>
            <p className="text-[11px] text-brand-charcoal/60 leading-relaxed pt-1">
              Zero unauthorized background polling. Token revocation is cryptographically broadcast to the Account Aggregator within 500ms.
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
