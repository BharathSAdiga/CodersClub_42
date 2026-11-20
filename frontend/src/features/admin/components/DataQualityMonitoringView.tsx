import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ScanLine, 
  FileCheck, 
  Search, 
  Layers, 
  TrendingUp,
  FileQuestion,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell 
} from 'recharts';

export const DataQualityMonitoringView: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const ingestionQualityData = [
    { source: 'Bank AA (Sahamati)', totalProcessed: '3,842', validPct: 99.4, missingFieldsPct: 0.6, ocrConfidence: 'N/A (Native XML)', status: 'HEALTHY' },
    { source: 'GSTN Invoices (GSP)', totalProcessed: '2,410', validPct: 97.2, missingFieldsPct: 2.8, ocrConfidence: 'N/A (API JSON)', status: 'HEALTHY' },
    { source: 'UPI Merchant Logs', totalProcessed: '5,920', validPct: 99.8, missingFieldsPct: 0.2, ocrConfidence: 'N/A (Webhook)', status: 'HEALTHY' },
    { source: 'Physical Bank Statements (PDF)', totalProcessed: '640', validPct: 92.5, missingFieldsPct: 7.5, ocrConfidence: '96.4% avg', status: 'ATTENTION' },
    { source: 'Electricity / Utility Bills', totalProcessed: '890', validPct: 88.0, missingFieldsPct: 12.0, ocrConfidence: '91.8% avg', status: 'DEGRADED' },
  ];

  const missingPatternData = [
    { field: 'IFSC / Branch Match', missingRate: 1.2, impact: 'Low (Auto-resolved via IFSC directory)' },
    { field: 'Counterparty GSTIN', missingRate: 6.8, impact: 'Medium (Unregistered B2C sales)' },
    { field: 'Narration Cleanliness', missingRate: 14.5, impact: 'Medium (Generic UPI / ATM descriptions)' },
    { field: 'Monthly Rent Receipts', missingRate: 28.4, impact: 'High (Informal cash payment records)' },
    { field: 'Prior Year Audited Balance Sheet', missingRate: 41.2, impact: 'High (Micro enterprises exempt from audit)' },
  ];

  const schemaValidationErrors = [
    { code: 'ERR-SCH-01', description: 'GSTR-3B vs GSTR-1 turnover reconciliation divergence > 15%', occurrences: 14, severity: 'WARNING', suggestedAction: 'Flag for under-reporting review' },
    { code: 'ERR-OCR-03', description: 'Bank statement scan resolution < 200 DPI causing character ambiguity', occurrences: 8, severity: 'CRITICAL', suggestedAction: 'Request high-res re-upload via WhatsApp/Portal' },
    { code: 'ERR-AA-07', description: 'FIP Account Aggregator session timed out before 12-month fetch complete', occurrences: 5, severity: 'LOW', suggestedAction: 'Auto-retry background ingestion queue' },
    { code: 'ERR-UPI-02', description: 'Merchant VPA name mismatch with registered Trade Name', occurrences: 19, severity: 'WARNING', suggestedAction: 'Invoke fuzzy Levenshtein match (>85% pass)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-terracotta bg-brand-terracotta/10 px-2 py-0.5 rounded-full">
              Ingestion & Telemetry
            </span>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px]">
              <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Pipeline Operational (98.6% Schema Pass)
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Data Quality & Telemetry Hub
          </h1>
          <p className="text-sm text-brand-charcoal/70">
            Real-time pipeline monitoring, alternative data ingestion fidelity, missing data topology, and OCR validation accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-brand-charcoal/20">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Re-index Telemetry
          </Button>
          <Button variant="primary" size="sm" className="bg-brand-forest text-white">
            <ScanLine className="w-4 h-4 mr-1.5" /> Force Pipeline Validation
          </Button>
        </div>
      </div>

      {/* Top 4 Pipeline Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Overall Pipeline Completeness</span>
            <Database className="w-4 h-4 text-brand-forest" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-charcoal">97.8%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +0.4% from previous sprint</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Native Digital Data Ratio</span>
            <TrendingUp className="w-4 h-4 text-brand-forest" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-forest">86.2%</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">AA, GSTN, & UPI vs 13.8% scanned doc</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">OCR Verification Mean</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">95.4%</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">Tesseract OCR & Key-Value extraction</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Triangulation Reconciled</span>
            <Layers className="w-4 h-4 text-brand-terracotta" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-charcoal">99.1%</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">3-way GST vs Bank vs UPI verification</p>
        </Card>
      </div>

      {/* Main Breakdown: Ingestion Feeds & Missing Data Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Ingestion Feeds by Channel */}
        <Card className="lg:col-span-2 border-brand-charcoal/10 shadow-subtle overflow-hidden">
          <CardHeader className="bg-brand-charcoal/[0.02] border-b border-brand-charcoal/10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-charcoal flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-forest" /> Ingestion Channels & Syntactic Validity
              </CardTitle>
              <span className="text-xs font-mono text-brand-charcoal/60">Live Stream Monitor</span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-charcoal/[0.03] border-b border-brand-charcoal/10 font-mono text-brand-charcoal/70 uppercase tracking-wider text-[11px]">
                  <th className="p-3">Data Stream / Rail</th>
                  <th className="p-3">Volumes Ingested</th>
                  <th className="p-3">Schema Pass</th>
                  <th className="p-3">Missing Rate</th>
                  <th className="p-3">OCR Extraction</th>
                  <th className="p-3">Channel State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-charcoal/5 font-sans">
                {ingestionQualityData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-brand-forest/[0.02] transition-colors">
                    <td className="p-3 font-semibold text-brand-charcoal">{row.source}</td>
                    <td className="p-3 font-mono">{row.totalProcessed} records</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{row.validPct}%</td>
                    <td className="p-3 font-mono text-amber-700">{row.missingFieldsPct}%</td>
                    <td className="p-3 font-mono text-brand-charcoal/70">{row.ocrConfidence}</td>
                    <td className="p-3">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          row.status === 'HEALTHY' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : row.status === 'ATTENTION' 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Col: Missing Data Topology */}
        <Card className="border-brand-charcoal/10 shadow-subtle flex flex-col">
          <CardHeader className="bg-brand-charcoal/[0.02] border-b border-brand-charcoal/10 pb-3">
            <CardTitle className="text-base font-bold text-brand-charcoal flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-brand-terracotta" /> Missing Data Topology
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <p className="text-xs text-brand-charcoal/70 mb-3 leading-relaxed">
              In credit-invisible MSME underwriting, data absence is non-random. ACIE accommodates structural absence without penalising unbanked micro-enterprises.
            </p>

            <div className="space-y-3">
              {missingPatternData.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-brand-ivory/60 border border-brand-charcoal/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-brand-charcoal">{item.field}</span>
                    <span className="font-mono font-bold text-brand-terracotta">{item.missingRate}% missing</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden mb-1.5">
                    <div 
                      className={`h-full ${item.missingRate > 30 ? 'bg-amber-500' : 'bg-brand-forest'}`} 
                      style={{ width: `${Math.min(item.missingRate * 2, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-brand-charcoal/60">{item.impact}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Schema & Extraction Anomalies */}
      <Card className="border-brand-charcoal/10 shadow-subtle">
        <CardHeader className="bg-brand-charcoal/[0.02] border-b border-brand-charcoal/10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-charcoal flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Schema & Document Extraction Exceptions
            </CardTitle>
            <Badge variant="outline" className="text-[11px] border-amber-300 bg-amber-50 text-amber-800">
              Auto-Quarantine & Re-request Enabled
            </Badge>
          </div>
        </CardHeader>
        <div className="divide-y divide-brand-charcoal/10">
          {schemaValidationErrors.map((err, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-charcoal bg-brand-charcoal/10 px-2 py-0.5 rounded text-[11px]">
                    {err.code}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${err.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-300' : err.severity === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
                  >
                    {err.severity}
                  </Badge>
                  <span className="text-brand-charcoal/60 font-mono">({err.occurrences} instances past 7d)</span>
                </div>
                <p className="text-brand-charcoal font-medium">{err.description}</p>
                <p className="text-brand-forest text-[11px]">Action rule: {err.suggestedAction}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 text-xs border-brand-charcoal/20">
                  Inspect Traces
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-brand-forest text-brand-forest hover:bg-brand-forest/5">
                  Execute Mitigation
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
