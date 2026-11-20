import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Calendar, 
  ExternalLink,
  Award,
  Scale,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

interface ReportPackItem {
  id: string;
  title: string;
  regulation: string;
  description: string;
  period: string;
  format: 'PDF_CERTIFIED' | 'CSV_RAW' | 'ZIP_FULL_PACK';
  fileSize: string;
  status: 'READY' | 'GENERATING';
}

export const ReportsExportsView: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reportPacks: ReportPackItem[] = [
    {
      id: 'REP-RBI-FAIR-2026-Q3',
      title: 'RBI Fair Lending & Algorithmic Disparate Impact Certification',
      regulation: 'RBI Master Direction - Digital Lending (2022) & Fair Practices Code',
      description: 'Formal 80% Rule disparate impact audit pack, gender/geography acceptance ratios, approval distribution metrics, and model governance attestation signed by Dr. Sunita Rao.',
      period: 'Q3 2026 (Oct 1 - Dec 31)',
      format: 'PDF_CERTIFIED',
      fileSize: '4.8 MB',
      status: 'READY'
    },
    {
      id: 'REP-DPDP-PURGE-2026-M11',
      title: 'DPDP Act Consent Revocation & Right-to-be-Forgotten Execution Log',
      regulation: 'Digital Personal Data Protection (DPDP) Act 2023, Section 12',
      description: 'Cryptographically hashed certificate of 14 completed data sanitization requests, including raw statement deletion and consent handle de-registration with Sahamati AA.',
      period: 'November 2026 (Monthly)',
      format: 'PDF_CERTIFIED',
      fileSize: '2.1 MB',
      status: 'READY'
    },
    {
      id: 'REP-ACIE-SHAP-DRIFT-2026',
      title: 'ACIE Model Explainability & Feature Drift Technical Dossier',
      regulation: 'Model Risk Management (MRM) Framework',
      description: 'Full SHAP global importance distribution, PSI (Population Stability Index) telemetry, feature correlation matrix, and counterfactual validation across 1,840 MSME evaluations.',
      period: 'Rolling 90 Days',
      format: 'ZIP_FULL_PACK',
      fileSize: '18.4 MB',
      status: 'READY'
    },
    {
      id: 'REP-PORTFOLIO-TRIANGULATION',
      title: 'Portfolio 3-Way Triangulation Audit & Congruence Ledger',
      regulation: 'Internal Credit Committee & NABARD Refinancing Standard',
      description: 'Complete cross-verification ledger comparing GSTN invoices, Account Aggregator deposits, and UPI merchant volumes with detected circular loops and haircut allocations.',
      period: 'Year-to-Date FY 2026-27',
      format: 'CSV_RAW',
      fileSize: '32.6 MB',
      status: 'READY'
    }
  ];

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded-full">
              Governance & Attestation
            </span>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px]">
              <Award className="w-3 h-3 mr-1 inline" /> Certified Institutional Packs
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Regulatory Packs & Compliance Exports
          </h1>
          <p className="text-sm text-brand-charcoal/70">
            One-click generated regulatory audit dossiers for RBI examiners, internal model risk management committees, and DPDP Data Protection Officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="bg-brand-forest text-white">
            <FileText className="w-4 h-4 mr-1.5" /> Generate Custom Audit Period
          </Button>
        </div>
      </div>

      {/* Grid of Report Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportPacks.map((pack) => (
          <Card key={pack.id} className="border-brand-charcoal/10 shadow-subtle flex flex-col justify-between overflow-hidden">
            <CardHeader className="bg-brand-charcoal/[0.02] border-b border-brand-charcoal/10 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-brand-charcoal/60 bg-brand-charcoal/10 px-2 py-0.5 rounded">
                    {pack.id}
                  </span>
                  <CardTitle className="text-base font-bold text-brand-charcoal leading-snug">
                    {pack.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800 shrink-0">
                  {pack.format.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-terracotta">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{pack.regulation}</span>
                </div>
                <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                  {pack.description}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-charcoal/10 flex items-center justify-between text-xs font-mono">
                <div className="text-brand-charcoal/60">
                  Coverage: <span className="text-brand-charcoal font-semibold">{pack.period}</span>
                </div>
                <div className="text-brand-charcoal/60">
                  Size: <span className="text-brand-charcoal font-semibold">{pack.fileSize}</span>
                </div>
              </div>

              <Button
                variant={downloadingId === pack.id ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleDownload(pack.id)}
                className={`w-full text-xs font-medium ${
                  downloadingId === pack.id 
                    ? 'border-brand-forest text-brand-forest bg-brand-forest/5' 
                    : 'bg-brand-forest text-white hover:bg-brand-forest/90'
                }`}
              >
                {downloadingId === pack.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-spin" />
                    Packaging Cryptographically Signed Archive...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download Regulatory Package ({pack.format.split('_')[0]})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attestation Certificate Notice */}
      <div className="p-4 rounded-xl bg-brand-forest/5 border border-brand-forest/20 flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-brand-forest shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-brand-charcoal">Digital Signature & Cryptographic Seal Specification</h4>
          <p className="text-brand-charcoal/70 leading-relaxed">
            All exported regulatory reports carry an embedded X.509 Class 3 Digital Signature and SHA-256 digest linked to the UDYOGA Trust Root Authority. They conform to Section 3 of the Information Technology Act (2000) and are admissible in Indian judicial proceedings and regulatory compliance audits.
          </p>
        </div>
      </div>
    </div>
  );
};
