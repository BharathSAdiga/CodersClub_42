import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import { mockPipelineApplications, PipelineItem } from '@/features/lender/data/mockPipeline';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Database,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Activity,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Scale
} from 'lucide-react';

export const ApplicationMasterLedger: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SANCTIONED' | 'UNDERWRITING_REVIEW' | 'DECLINED'>('ALL');
  const [selectedAuditApp, setSelectedAuditApp] = useState<PipelineItem | null>(null);
  const [showRawCryptoLogs, setShowRawCryptoLogs] = useState(false);

  // Filtered applications
  const filteredApps = mockPipelineApplications.filter((app) => {
    const matchesSearch =
      app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
              Auditor Trace & Ledger Desk
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
            Application Master Audit Ledger
          </h2>
          <p className="text-xs text-brand-charcoal/65 mt-0.5">
            Trace any credit evaluation from initial borrower consent to final human decision and blockchain anchor.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge variant="mint" className="text-xs">
            {mockPipelineApplications.length} Recorded Files
          </Badge>
          <span className="text-brand-charcoal/50">· 100% Immutable</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-brand-charcoal/40" />
              <Input
                placeholder="Search by business name, applicant, reference ID, or sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Filter Tabs */}
            <div className="md:col-span-6 flex flex-wrap gap-1.5 justify-end">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-brand-forest text-white shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-brand-forest/10'
                }`}
              >
                All Files ({mockPipelineApplications.length})
              </button>
              <button
                onClick={() => setStatusFilter('SANCTIONED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'SANCTIONED'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-brand-forest/10'
                }`}
              >
                Sanctioned
              </button>
              <button
                onClick={() => setStatusFilter('UNDERWRITING_REVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'UNDERWRITING_REVIEW'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-brand-forest/10'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => setStatusFilter('DECLINED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'DECLINED'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-brand-charcoal/70 hover:bg-brand-forest/10'
                }`}
              >
                Declined
              </button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Master Ledger Table */}
      <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Ref ID</th>
                <th className="py-3 px-4 font-semibold">Enterprise & Applicant</th>
                <th className="py-3 px-4 font-semibold">Facility Amount</th>
                <th className="py-3 px-4 font-semibold">Cross-Stream Agreement</th>
                <th className="py-3 px-4 font-semibold">Score & Risk</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {filteredApps.map((app) => (
                <tr 
                  key={app.id} 
                  className="hover:bg-brand-forest/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedAuditApp(app)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-brand-forest">
                    {app.id}
                  </td>
                  <td className="py-3 px-4">
                    <strong className="text-brand-charcoal block group-hover:text-brand-forest transition-colors">
                      {app.businessName}
                    </strong>
                    <span className="text-[11px] text-brand-charcoal/60">
                      {app.applicantName} · {app.city}, {app.state}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-charcoal">
                    {formatINR(app.requestedAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-800">
                      {app.congruenceScore}%
                    </span>
                    <span className="text-[10px] text-brand-charcoal/60 block">
                      3-Way Triangulated
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <strong className="text-brand-forest font-bold block">{app.acieScore} / 900</strong>
                    <span className="text-[10px] text-brand-charcoal/60 font-sans">{app.scoreBand} Band</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                      app.status === 'SANCTIONED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : app.status === 'UNDERWRITING_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAuditApp(app);
                      }}
                      className="text-xs h-7 px-3 gap-1 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Trace</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* AUDITOR ASSESSMENT TRACE MODAL / DRAWER                        */}
      {/* Answers the 7 Key Verification Questions for the Auditor        */}
      {/* ============================================================== */}
      {selectedAuditApp && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-brand-forest/20 shadow-elevated p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-brand-forest/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="mint" className="text-xs font-semibold">
                    Auditor Verification Trail
                  </Badge>
                  <span className="font-mono text-xs text-brand-charcoal/60">
                    Application ID: {selectedAuditApp.id}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-brand-charcoal">
                  End-to-End Audit Inspection: {selectedAuditApp.businessName}
                </h3>
                <p className="text-xs text-brand-charcoal/70 mt-0.5">
                  Chronological provenance verification from submitted consent to final human sanction.
                </p>
              </div>

              <button
                onClick={() => setSelectedAuditApp(null)}
                className="w-8 h-8 rounded-full bg-brand-charcoal/10 hover:bg-brand-charcoal/20 flex items-center justify-center text-brand-charcoal font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* The 7 Core Verification Pillars */}
            <div className="space-y-4 text-xs">
              
              {/* Question 1: Which business was assessed */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    Which business was assessed?
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-7 text-[11px]">
                  <div>
                    <span className="text-brand-charcoal/60 block">Trade Legal Name:</span>
                    <strong className="text-brand-charcoal">{selectedAuditApp.businessName}</strong>
                  </div>
                  <div>
                    <span className="text-brand-charcoal/60 block">Proprietor / Signatory:</span>
                    <strong className="text-brand-charcoal">{selectedAuditApp.applicantName}</strong>
                  </div>
                  <div>
                    <span className="text-brand-charcoal/60 block">Sector & Location:</span>
                    <strong className="text-brand-charcoal">{selectedAuditApp.sector} · {selectedAuditApp.city}, {selectedAuditApp.state}</strong>
                  </div>
                </div>
              </div>

              {/* Question 2: What information was submitted */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    What information was submitted?
                  </h4>
                </div>
                <div className="pl-7 space-y-1.5 text-[11px] text-brand-charcoal/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span><strong>90-Day Bank Statement:</strong> Account Aggregator feed via Sahamati (428 digital transactions parsed).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span><strong>GST Outward Tax Returns:</strong> GSTR-3B monthly filings across previous 6 months.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span><strong>Daily Merchant QR Turnover:</strong> 184 UPI daily settlement logs via PhonePe QR.</span>
                  </div>
                </div>
              </div>

              {/* Question 3: Where the evidence came from */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    Where did the evidence come from?
                  </h4>
                </div>
                <div className="pl-7 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-brand-forest/10">
                    <Badge variant="mint" className="text-[10px] mb-1">Independently Verified</Badge>
                    <strong className="block text-brand-charcoal">State Bank of India</strong>
                    <span className="text-[10px] text-brand-charcoal/60">Digital signature verified via Sahamati AA token</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-brand-forest/10">
                    <Badge variant="mint" className="text-[10px] mb-1">Independently Verified</Badge>
                    <strong className="block text-brand-charcoal">GSTN Portal Direct API</strong>
                    <span className="text-[10px] text-brand-charcoal/60">Authenticated via OTP-backed government session</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-brand-forest/10">
                    <Badge variant="outline" className="text-[10px] mb-1 bg-blue-50 text-blue-800 border-blue-200">Source-Labelled</Badge>
                    <strong className="block text-brand-charcoal">PhonePe Merchant Gateway</strong>
                    <span className="text-[10px] text-brand-charcoal/60">Webhook callback with verified merchant VPA</span>
                  </div>
                </div>
              </div>

              {/* Question 4: What calculations were performed */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    What calculations were performed?
                  </h4>
                </div>
                <div className="pl-7 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-white border border-brand-forest/10">
                    <span className="text-[10px] text-brand-charcoal/60 block font-sans">3-Way Agreement:</span>
                    <strong className="text-emerald-800 text-sm">{selectedAuditApp.congruenceScore}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-brand-forest/10">
                    <span className="text-[10px] text-brand-charcoal/60 block font-sans">Repayment Capacity:</span>
                    <strong className="text-brand-forest text-sm">₹42,500/mo</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-brand-forest/10">
                    <span className="text-[10px] text-brand-charcoal/60 block font-sans">Coverage Ratio:</span>
                    <strong className="text-emerald-800 text-sm">2.14x</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-brand-forest/10">
                    <span className="text-[10px] text-brand-charcoal/60 block font-sans">Avg Daily Balance:</span>
                    <strong className="text-brand-charcoal text-sm">₹18,450</strong>
                  </div>
                </div>
              </div>

              {/* Question 5: What issues were identified */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    5
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    What issues were identified?
                  </h4>
                </div>
                <div className="pl-7 space-y-1 text-[11px] text-brand-charcoal/80">
                  <p>• <strong>Transaction Relationship Analysis:</strong> 0 circular fund-bouncing loops identified across counterparty accounts.</p>
                  <p>• <strong>Liquidity Discipline:</strong> 0 auto-debit return bounces across 90-day banking history.</p>
                  <p>• <strong>Variance Status:</strong> {selectedAuditApp.congruenceScore > 90 ? 'Clean cross-stream turnover match (< 5% discrepancy).' : 'Discrepancy identified between GST sales and bank credits.'}</p>
                </div>
              </div>

              {/* Question 6: How recommendation was reached */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    6
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    How was the recommendation reached?
                  </h4>
                </div>
                <div className="pl-7 space-y-1 text-[11px] text-brand-charcoal/80">
                  <p>• <strong>Composite Vitality Score:</strong> {selectedAuditApp.acieScore} / 900 ({selectedAuditApp.scoreBand} Health Band).</p>
                  <p>• <strong>Top Positive Drivers:</strong> High daily QR frequency (+56 pts), Clean tax payment record (+42 pts).</p>
                  <p>• <strong>Primary Drag Factor:</strong> Thin commercial bureau history (-24 pts) mitigated by verified daily cash flow.</p>
                </div>
              </div>

              {/* Question 7: Whether a human decision was recorded */}
              <div className="p-4 rounded-2xl bg-brand-ivory/80 border border-brand-forest/15 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-forest text-white font-mono font-bold text-xs flex items-center justify-center">
                    7
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-charcoal">
                    Whether a human decision was recorded?
                  </h4>
                </div>
                <div className="pl-7 space-y-2 text-[11px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border border-brand-forest/10 gap-2">
                    <div>
                      <strong className="text-brand-charcoal block">Assigned Sanction Officer: Vikram Deshmukh (cr_8912)</strong>
                      <span className="text-[10px] text-brand-charcoal/60">Discretionary decision: Approved facility at 0% haircut</span>
                    </div>
                    <Badge variant="mint" className="text-xs">
                      Human Decision Recorded
                    </Badge>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <strong className="block text-[11px]">Mandatory Repayment Covenant Stipulated:</strong>
                    <p className="text-[10px]">
                      Mandatory daily UPI AutoPay evening sweep (₹{Math.round((selectedAuditApp.requestedAmount * 1.14) / selectedAuditApp.tenorDays)}/day) linked to merchant settlement QR.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Expandable Cryptographic & Advanced Raw Data (Progressive Disclosure) */}
            <div className="pt-2 border-t border-brand-forest/10">
              <button
                onClick={() => setShowRawCryptoLogs(!showRawCryptoLogs)}
                className="flex items-center gap-2 text-xs font-semibold text-brand-forest hover:underline"
              >
                <Lock className="w-3.5 h-3.5 text-brand-forest" />
                <span>{showRawCryptoLogs ? 'Hide Cryptographic Signatures & Raw Logs' : 'Inspect Raw Cryptographic Signatures & Blockchain Anchor'}</span>
                {showRawCryptoLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showRawCryptoLogs && (
                <div className="mt-3 p-4 rounded-2xl bg-brand-charcoal text-white text-[11px] font-mono space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center text-emerald-300 pb-1 border-b border-white/10">
                    <span>Cryptographic Evidence Dossier</span>
                    <span className="text-[10px]">SHA-256 Digital Seal</span>
                  </div>
                  <p className="text-white/70">
                    Assessment Dossier Hash: <code className="text-emerald-400 text-[10px] block break-all">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
                  </p>
                  <p className="text-white/70">
                    Blockchain Trust Anchor: <span className="text-white">Quai Cyprus-1 Testnet (Block #819,234)</span>
                  </p>
                  <p className="text-white/70">
                    Transaction Hash: <code className="text-emerald-400 text-[10px] block break-all">0x71a9f821bc34d98e10482934ec810293481239c4b2</code>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-brand-forest/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAuditApp(null)}
                className="rounded-full text-xs px-5"
              >
                Close Audit Trace
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
