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
  Building2,
  HelpCircle,
  AlertCircle,
  Eye
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
            Algorithmic Governance & Ethics Desk
          </span>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
            Fair Lending & Bias Audit Console
          </h2>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Monitors whether loan evaluation algorithms treat all applicant demographics equally and without discrimination.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCertificate}
          className="gap-2 text-xs h-9 font-semibold rounded-full"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Compliance Certificate</span>
        </Button>
      </div>

      {/* Structured Benchmark Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-forest text-brand-ivory border border-brand-forest/30 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="mint-pill" className="text-xs">
                Four-Fifths (80%) Rule Compliance
              </Badge>
              <span className="text-xs font-mono text-white/80">
                US EEOC & RBI Fair Lending Standard
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              Demographic Parity & Disparate Impact Monitoring
            </h3>
            <p className="text-xs text-white/85 leading-relaxed max-w-xl">
              The Alternative Credit Intelligence Engine (ACIE) operates strictly on verifiable commercial cash flow (UPI QR, Account Aggregator, GSTN). Protected attributes (gender, caste, religion, personal contacts) are mathematically isolated from the scoring model.
            </p>
          </div>

          <div className="md:col-span-4 p-5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block">
              Gender Disparate Ratio (DIR)
            </span>
            <div className="text-4xl font-display font-extrabold text-white font-mono my-1">
              0.947
            </div>
            <span className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Exceeds 0.80 Benchmark
            </span>
          </div>

        </div>
      </div>

      {/* Critical Statutory Disclaimer: Never declare system "unbiased" */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold block text-amber-900">
            Statutory Fair Lending Notice for Administrators & Auditors
          </strong>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Meeting the 80% (Four-Fifths) statistical ratio is an essential regulatory safeguard, but it <strong>does not guarantee the complete absence of systemic or hidden bias</strong>. Periodic quarterly sample reviews, feature sensitivity audits, and grievance tracking remain mandatory under RBI Digital Lending Guidelines.
          </p>
        </div>
      </div>

      {/* 4-Question Analytical Cards for Each Fairness Dimension */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric 1: Gender Parity Analysis */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-display font-bold">Gender Parity Analysis</CardTitle>
                <span className="text-xs text-brand-charcoal/60">Female-Led vs Male-Led Enterprises</span>
              </div>
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                DIR: 0.947
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Visual Bars */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Female-Led Enterprise Approval Rate:</span>
                  <strong className="font-mono text-brand-forest font-bold">73.2%</strong>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-forest h-full w-[73.2%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Male-Led Enterprise Approval Rate:</span>
                  <strong className="font-mono text-brand-charcoal font-bold">77.3%</strong>
                </div>
                <div className="w-full bg-brand-charcoal/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-charcoal h-full w-[77.3%]" />
                </div>
              </div>
            </div>

            {/* The 4 Core Questions */}
            <div className="space-y-2 pt-2 border-t border-brand-forest/10 text-[11px]">
              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">1. What is being measured?</strong>
                <p className="text-brand-charcoal/70">Whether female business owners receive approvals at roughly the same rate as male business owners.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">2. What does this result mean?</strong>
                <p className="text-brand-charcoal/70">73.2% vs 77.3% represents a 94.7% ratio, well above the 80% legal threshold for fair lending.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">3. Why should the administrator care?</strong>
                <p className="text-brand-charcoal/70">Ensures compliance with RBI equal credit access directives and avoids regulatory penalties.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">4. Does it require investigation?</strong>
                <p className="text-brand-charcoal/70"><strong>No immediate investigation needed.</strong> Continue routine quarterly surveillance.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Geographic Cluster Parity */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-display font-bold">Geographic District Parity</CardTitle>
                <span className="text-xs text-brand-charcoal/60">Tier-2/3 Towns vs Tier-1 Metro Cities</span>
              </div>
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                DIR: 0.882
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Visual Bars */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Tier-2 & Tier-3 District Approval Rate:</span>
                  <strong className="font-mono text-brand-forest font-bold">68.4%</strong>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-forest h-full w-[68.4%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Tier-1 Metro City Approval Rate:</span>
                  <strong className="font-mono text-brand-charcoal font-bold">77.5%</strong>
                </div>
                <div className="w-full bg-brand-charcoal/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-charcoal h-full w-[77.5%]" />
                </div>
              </div>
            </div>

            {/* The 4 Core Questions */}
            <div className="space-y-2 pt-2 border-t border-brand-forest/10 text-[11px]">
              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">1. What is being measured?</strong>
                <p className="text-brand-charcoal/70">Whether rural and semi-urban businesses receive equal approval chances as urban metro businesses.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">2. What does this result mean?</strong>
                <p className="text-brand-charcoal/70">68.4% vs 77.5% produces an 88.2% ratio. Digital UPI records allow rural businesses to qualify without branch visits.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">3. Why should the administrator care?</strong>
                <p className="text-brand-charcoal/70">Prevents geographical credit deserts and supports national financial inclusion priorities.</p>
              </div>

              <div className="p-2 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-0.5">
                <strong className="text-brand-forest block">4. Does it require investigation?</strong>
                <p className="text-brand-charcoal/70"><strong>Monitor closely.</strong> While compliant (&gt; 0.80), the gap should be narrowed with enhanced vernacular assistance.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Thin-File Inclusivity & DPDP Privacy Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Missing-Data Progressive Inclusivity */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <CardTitle className="text-base font-display font-bold">Thin-File Inclusivity Protection</CardTitle>
            <p className="text-xs text-brand-charcoal/60 mt-0.5">
              Ensures applicants without credit history are not automatically rejected.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-4">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span className="text-brand-charcoal/80">"No-Hit" Bureau Record Coverage Rate</span>
              <strong className="font-mono text-emerald-800 font-bold">100% Evaluated</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span className="text-brand-charcoal/80">Progressive Micro-Sachet Extension Rate</span>
              <strong className="font-mono text-brand-forest font-bold">84.2% Extended</strong>
            </div>
            <p className="text-[11px] text-brand-charcoal/65 leading-relaxed pt-1">
              Applicants without prior CIBIL/Experian histories receive smaller introductory credit lines (₹25,000–₹75,000) to build a formal financial track record rather than being declined.
            </p>
          </CardContent>
        </Card>

        {/* DPDP Consent Revocation Ledger */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <CardTitle className="text-base font-display font-bold">DPDP Data Privacy & Revocation Ledger</CardTitle>
            <p className="text-xs text-brand-charcoal/60 mt-0.5">
              Tracks compliance with user data deletion and consent revocation requests.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-4">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span className="text-brand-charcoal/80">Consent Revocation Requests (Last 30 Days)</span>
              <strong className="font-mono text-brand-charcoal font-bold">18 Requests</strong>
            </div>
            <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
              <span className="text-brand-charcoal/80">Cryptographic Data Purge Verification</span>
              <strong className="font-mono text-emerald-800 font-bold">100.0% Verified</strong>
            </div>
            <p className="text-[11px] text-brand-charcoal/65 leading-relaxed pt-1">
              When a borrower revokes consent, token access to Account Aggregator and GSTN feeds is revoked immediately (&lt; 500ms) with cryptographic event logging.
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
