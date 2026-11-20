import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import { 
  Building2, 
  Landmark, 
  QrCode, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  MessageSquare,
  Lock,
  Send,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { mockPipelineApplications, PipelineItem } from '../data/mockPipeline';
import { toast } from 'sonner';

interface ApplicantDetailWorkbenchProps {
  applicationId: string;
  onBackToPipeline: () => void;
}

export const ApplicantDetailWorkbench: React.FC<ApplicantDetailWorkbenchProps> = ({
  applicationId,
  onBackToPipeline,
}) => {
  const application = mockPipelineApplications.find((a) => a.id === applicationId) || mockPipelineApplications[0];

  const [activeTab, setActiveTab] = useState<'TRIANGULATION' | 'CASHFLOW' | 'ACIE_REPORT' | 'DOCS' | 'DECISION'>('TRIANGULATION');
  const [haircutPercentage, setHaircutPercentage] = useState<number>(0);
  const [underwriterNotes, setUnderwriterNotes] = useState<string>('Strong verified daily UPI velocity; healthy ADMB. Recommending approval with mandatory daily sweep covenant.');
  const [isDocRequestModalOpen, setIsDocRequestModalOpen] = useState<boolean>(false);
  const [docRequestNote, setDocRequestNote] = useState<string>('');
  const [decisionOutcome, setDecisionOutcome] = useState<'PENDING' | 'APPROVED' | 'DECLINED'>('PENDING');

  // Dynamic values
  const recommendedAmount = Math.round(application.requestedAmount * (1 - haircutPercentage / 100));

  // Expense breakdown mock
  const expenseData = [
    { name: 'Supplier Invoices', value: 68, color: '#173F35' },
    { name: 'Commercial Rent', value: 12, color: '#C96B4B' },
    { name: 'Utilities & Telecom', value: 8, color: '#34D399' },
    { name: 'Net Operating Surplus', value: 12, color: '#1A1A1A' },
  ];

  // 30-Day Cashflow Mock
  const cashflowData = Array.from({ length: 30 }, (_, i) => {
    const base = 18000 + Math.sin(i / 2) * 5000 + (i % 7 === 5 || i % 7 === 6 ? 8000 : 0);
    return {
      day: `D${i + 1}`,
      inflow: Math.round(base + Math.random() * 2000),
      outflow: Math.round(base * 0.85 + Math.random() * 1500),
      balance: Math.round(18000 + Math.sin(i / 3) * 4000),
    };
  });

  const handleDecision = (action: 'APPROVE' | 'DECLINE') => {
    if (action === 'APPROVE') {
      setDecisionOutcome('APPROVED');
      toast.success(`Sanction Letter generated for ${application.businessName} (₹${recommendedAmount.toLocaleString('en-IN')})!`);
    } else {
      setDecisionOutcome('DECLINED');
      toast.error(`Application ${application.id} declined. Regulatory reason code logged.`);
    }
  };

  const handleSendDocRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docRequestNote) {
      toast.error('Please enter a query or document request note.');
      return;
    }
    toast.success(`Clarification request dispatched to ${application.applicantName}.`);
    setIsDocRequestModalOpen(false);
    setDocRequestNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBackToPipeline} className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-charcoal">
                {application.businessName}
              </h2>
              <Badge variant="mint" className="text-xs">
                Ref: {application.id}
              </Badge>
            </div>
            <span className="text-xs text-brand-charcoal/60">
              {application.applicantName} · {application.sector} · {application.city}, {application.state}
            </span>
          </div>
        </div>

        {/* Quick Triage Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Sanction Requested</span>
            <span className="text-lg font-mono font-bold text-brand-forest">{formatINR(application.requestedAmount)}</span>
          </div>
          <Button 
            variant="accent" 
            size="sm" 
            onClick={() => setActiveTab('DECISION')}
            className="text-xs"
          >
            Decision Action
          </Button>
        </div>
      </div>

      {/* Navigation Tabs for High-Density Workbench */}
      <div className="flex overflow-x-auto gap-2 p-1 rounded-2xl bg-white border border-brand-forest/15 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('TRIANGULATION')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'TRIANGULATION' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70 hover:bg-brand-forest/5'
          }`}
        >
          1. Multi-Stream Triangulation
        </button>
        <button
          onClick={() => setActiveTab('CASHFLOW')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'CASHFLOW' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70 hover:bg-brand-forest/5'
          }`}
        >
          2. Cash-Flow & Revenue
        </button>
        <button
          onClick={() => setActiveTab('ACIE_REPORT')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'ACIE_REPORT' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70 hover:bg-brand-forest/5'
          }`}
        >
          3. ACIE Intelligence & Risk
        </button>
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'DOCS' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70 hover:bg-brand-forest/5'
          }`}
        >
          4. Documents & Queries
        </button>
        <button
          onClick={() => setActiveTab('DECISION')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'DECISION' ? 'bg-brand-forest text-white' : 'text-brand-charcoal/70 hover:bg-brand-forest/5'
          }`}
        >
          5. Underwriting Decision
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MULTI-STREAM TRIANGULATION & DATA QUALITY               */}
      {/* ============================================================== */}
      {activeTab === 'TRIANGULATION' && (
        <div className="space-y-6">
          {/* Triangulation Radar Summary */}
          <div className="p-6 rounded-3xl bg-brand-charcoal text-white border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-mint block">Triangulation Match</span>
              <div className="text-3xl font-display font-bold mt-1 text-white font-mono">
                {application.congruenceScore}%
              </div>
              <span className="text-xs text-emerald-400 mt-1 block">High Cross-Stream Congruence</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/50 block">Bank AA Monthly Inflows</span>
              <div className="text-2xl font-mono font-bold mt-1 text-white">
                {formatINR(application.monthlyTurnover)}
              </div>
              <span className="text-xs text-white/60">State Bank of India (90d AA)</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/50 block">GST Declared Monthly Turnover</span>
              <div className="text-2xl font-mono font-bold mt-1 text-white">
                {formatINR(Math.round(application.monthlyTurnover * 1.04))}
              </div>
              <span className="text-xs text-white/60">GSTR-1 & 3B Punctual (99%)</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-white/50 block">UPI Merchant QR Velocity</span>
              <div className="text-2xl font-mono font-bold mt-1 text-brand-mint">
                {formatINR(Math.round(application.monthlyTurnover * 0.88))}
              </div>
              <span className="text-xs text-white/60">142 daily customer settlements</span>
            </div>
          </div>

          {/* Triangulation Breakdown & Anomaly Check */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cross-Reconciliation Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Three-Way Data Congruence Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span>Bank Credits vs GST Sales Variance</span>
                  <span className="font-mono font-bold text-emerald-700">+4.1% (Within Tolerable 10% Band)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span>UPI Velocity vs Bank Deposit Congruence</span>
                  <span className="font-mono font-bold text-emerald-700">88.4% (Direct Auto-Sweep Verified)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span>Cheque / Auto-Debit Bounce Count (90d)</span>
                  <span className="font-mono font-bold text-emerald-700">0 Bounces</span>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality & Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Pipeline Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest" />
                    Account Aggregator Session Freshness
                  </span>
                  <span className="font-mono font-bold text-brand-forest">Active (Synchronized 42m ago)</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest" />
                    DigiLocker Entity KYC Verification
                  </span>
                  <span className="font-mono font-bold text-brand-forest">100% Schema Match</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest" />
                    GSTN Punctuality Rate
                  </span>
                  <span className="font-mono font-bold text-brand-forest">12 Quarters Zero Delay</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CASH-FLOW & REVENUE VISUALISATIONS                      */}
      {/* ============================================================== */}
      {activeTab === 'CASHFLOW' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">30-Day Streamed Cash-Flow (Inflows vs Outflows)</CardTitle>
                <span className="text-xs font-mono text-brand-charcoal/50">AA Streamed Telemetry</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowData}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      formatter={(val: number) => [formatINR(val), 'Volume']}
                      contentStyle={{ backgroundColor: '#1A1A1A', color: '#F7F4EC', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="inflow" stroke="#173F35" strokeWidth={2.5} fill="#173F35" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="outflow" stroke="#C96B4B" strokeWidth={1.5} fill="#C96B4B" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown & Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Expense Structure (5 cols) */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expense & Margin Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          innerRadius={40}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {expenseData.map((e, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="flex items-center gap-1.5 text-brand-charcoal/70">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                          {e.name}
                        </span>
                        <span className="font-mono font-semibold">{e.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Activity Timeline (7 cols) */}
            <div className="lg:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Cash Cadence Events (90 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-xs">
                    {[
                      { date: 'Every Monday', event: 'Wholesale Supplier Settlement', amount: 'Avg ₹48,000 debited', type: 'SUPPLIER' },
                      { date: '1st of Month', event: 'Commercial Rent Auto-Debit', amount: '₹14,500 punctual', type: 'RENT' },
                      { date: '10th of Month', event: 'Electricity BBPS Punctual Debit', amount: '₹3,420 zero default', type: 'UTILITY' },
                      { date: 'Fridays & Weekends', event: 'Retail Cash Inflow Surge', amount: '+38% volume jump', type: 'SURGE' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 flex justify-between items-center">
                        <div>
                          <strong className="text-brand-charcoal block">{item.event}</strong>
                          <span className="text-[10px] text-brand-charcoal/50">{item.date}</span>
                        </div>
                        <span className="font-mono font-bold text-brand-forest">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ACIE INTELLIGENCE & RISK INDICATORS                     */}
      {/* ============================================================== */}
      {activeTab === 'ACIE_REPORT' && (
        <div className="space-y-6">
          {/* ACIE Structured Output Banner */}
          <div className="p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-mint font-bold block">
                Structured ACIE Output (Provided by Teammate Engine)
              </span>
              <div className="flex items-baseline gap-3 my-1">
                <span className="text-4xl font-display font-extrabold text-white font-mono">
                  {application.acieScore}
                </span>
                <span className="text-xs text-white/60 font-mono">/ 900 · {application.scoreBand} BAND</span>
              </div>
              <p className="text-xs text-white/80">
                Model Confidence: <strong>94.2%</strong> · Evaluation timestamp: 2026-11-20 08:35 UTC
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-xs">
              <span className="text-white/60 block">Indicative ACIE Recommendation:</span>
              <strong className="text-sm font-mono text-brand-mint block">
                {formatINR(application.requestedAmount)} @ 14.2% APR
              </strong>
              <span className="text-[10px] text-white/70">DSCR Buffer: 1.85x</span>
            </div>
          </div>

          {/* Anomaly Detection Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Circular Loops</span>
                <CardTitle className="text-xl font-mono text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  0 Flagged
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-[11px] text-brand-charcoal/60">
                  No artificial fund bouncing across accounts
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Customer Concentration</span>
                <CardTitle className="text-xl font-mono text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  18% Top Buyer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-[11px] text-brand-charcoal/60">
                  Healthy retail customer diversification
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Velocity Spike Anomaly</span>
                <CardTitle className="text-xl font-mono text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Normal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-[11px] text-brand-charcoal/60">
                  Zero pre-application synthetic inflation
                </span>
              </CardContent>
            </Card>
          </div>

          {/* SHAP Feature Contribution Waterfall */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Explainable AI (SHAP) Waterfall Breakdown</CardTitle>
                <span className="text-xs font-mono text-brand-charcoal/50">Feature Impact Vectors</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex justify-between items-center">
                <div>
                  <strong className="text-brand-charcoal block">+ Daily UPI Merchant Transaction Velocity</strong>
                  <span className="text-[10px] text-brand-charcoal/60">142 customer settlements/day proves strong local footprint</span>
                </div>
                <span className="font-mono font-bold text-brand-forest text-sm">+56 pts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex justify-between items-center">
                <div>
                  <strong className="text-brand-charcoal block">+ Zero Cheque or Auto-Debit Bounces (90 Days)</strong>
                  <span className="text-[10px] text-brand-charcoal/60">Disciplined account liquidity management</span>
                </div>
                <span className="font-mono font-bold text-brand-forest text-sm">+42 pts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex justify-between items-center">
                <div>
                  <strong className="text-brand-charcoal block">- Thin Institutional Bureau History</strong>
                  <span className="text-[10px] text-brand-charcoal/60">No prior multi-year commercial term loans</span>
                </div>
                <span className="font-mono font-bold text-rose-600 text-sm">-24 pts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: DOCUMENTS & QUERIES                                     */}
      {/* ============================================================== */}
      {activeTab === 'DOCS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-brand-charcoal">
              Applicant Document Portfolio
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDocRequestModalOpen(true)}
              className="gap-2 text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-forest" />
              <span>Raise Query / Request Document</span>
            </Button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'PAN_Card_SriBalaji.pdf', type: 'PAN_CARD', status: 'VERIFIED', ocrScore: 99.4 },
              { name: 'Udyam_Registration_Certificate.pdf', type: 'UDYAM', status: 'VERIFIED', ocrScore: 98.8 },
              { name: 'Shop_Establishment_License.jpg', type: 'LICENSE', status: 'VERIFIED', ocrScore: 95.2 },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-brand-forest/15 shadow-sm text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-charcoal block text-sm">{doc.name}</strong>
                    <span className="text-[10px] text-brand-charcoal/50 font-mono">
                      Type: {doc.type} · OCR Confidence: {doc.ocrScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </span>
                  <Button variant="outline" size="sm" className="text-[11px] h-8">
                    View Doc
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: UNDERWRITING WORKSHEET & HUMAN DECISION INTERFACE       */}
      {/* ============================================================== */}
      {activeTab === 'DECISION' && (
        <div className="space-y-6">
          
          {decisionOutcome !== 'PENDING' ? (
            <div className={`p-8 rounded-3xl text-center space-y-3 ${
              decisionOutcome === 'APPROVED' ? 'bg-emerald-50 border border-emerald-300' : 'bg-rose-50 border border-rose-300'
            }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-white ${
                decisionOutcome === 'APPROVED' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {decisionOutcome === 'APPROVED' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <h3 className="font-display font-bold text-xl text-brand-charcoal">
                {decisionOutcome === 'APPROVED' ? 'Sanction Letter Issued' : 'Application Formally Declined'}
              </h3>
              <p className="text-xs text-brand-charcoal/70 max-w-md mx-auto">
                {decisionOutcome === 'APPROVED'
                  ? `Sanction ID: SNC-${Date.now().toString().slice(-6)} issued to ${application.businessName} for ${formatINR(recommendedAmount)}. Direct UPI AutoPay e-mandate dispatched.`
                  : `Decline record logged with regulatory code. Notice dispatched to borrower with counterfactual recourse coaching.`}
              </p>
              <Button variant="outline" size="sm" onClick={() => setDecisionOutcome('PENDING')}>
                Reopen Worksheet
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Worksheet Adjustments (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Underwriter Facility Calibration</CardTitle>
                    <p className="text-xs text-brand-charcoal/60">
                      Credit officer retains full discretionary authority to adjust facility limit and stipulate covenants.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Haircut Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-brand-charcoal">Risk Haircut / Limit Adjustment</span>
                        <span className="font-mono font-bold text-brand-forest">
                          {haircutPercentage}% Haircut (Sanction: {formatINR(recommendedAmount)})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="5"
                        value={haircutPercentage}
                        onChange={(e) => setHaircutPercentage(Number(e.target.value))}
                        className="w-full accent-brand-forest cursor-pointer h-2 bg-brand-forest/15 rounded-lg"
                      />
                    </div>

                    {/* Sanction Covenants Checklist */}
                    <div className="space-y-2 pt-2 border-t border-brand-forest/10">
                      <span className="text-xs font-semibold text-brand-charcoal block">Mandatory Covenants</span>
                      <div className="space-y-2 text-xs text-brand-charcoal/80">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-brand-forest" />
                          <span>Mandatory UPI AutoPay evening sweep (₹{Math.round((recommendedAmount * 1.14)/application.tenorDays)}/day).</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-brand-forest" />
                          <span>Continuous Account Aggregator read token active for tenor duration.</span>
                        </label>
                      </div>
                    </div>

                    {/* Underwriter Note */}
                    <div className="space-y-1.5 pt-2 border-t border-brand-forest/10">
                      <label className="text-xs font-semibold text-brand-charcoal block">Credit Note for Committee</label>
                      <textarea
                        rows={3}
                        value={underwriterNotes}
                        onChange={(e) => setUnderwriterNotes(e.target.value)}
                        className="w-full rounded-2xl border border-brand-forest/20 bg-brand-ivory p-3 text-xs text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
                      />
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* Action Decision Box (5 cols) */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-3xl bg-brand-charcoal text-white border border-white/10 shadow-card space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <span className="text-[10px] uppercase font-mono text-brand-mint block">Final Human Decision</span>
                    <h4 className="font-display font-bold text-lg text-white mt-0.5">Sanction Authority</h4>
                  </div>

                  <div className="space-y-2 text-xs text-white/80">
                    <div className="flex justify-between">
                      <span>Applicant:</span>
                      <strong className="text-white">{application.businessName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommended Amount:</span>
                      <strong className="text-brand-mint font-mono font-bold">{formatINR(recommendedAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenor:</span>
                      <span className="font-mono text-white">{application.tenorDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved APR:</span>
                      <span className="font-mono text-white">14.2%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleDecision('APPROVE')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-display font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Sanction Letter</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleDecision('DECLINE')}
                      className="w-full border-white/20 text-white hover:bg-rose-950/60 hover:border-rose-500 gap-2 font-display text-xs"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Decline with Formal Reason</span>
                    </Button>
                  </div>

                  <span className="text-[10px] text-white/40 block text-center font-mono pt-1">
                    Signoff Officer: Vikram Deshmukh (ID: cr_89124)
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Query Request Modal */}
      {isDocRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-brand-ivory rounded-3xl border border-brand-forest/20 shadow-elevated p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-brand-charcoal">
              Request Additional Documents or Clarification
            </h3>
            <p className="text-xs text-brand-charcoal/60">
              The borrower will receive an immediate SMS notification to upload the requested file.
            </p>

            <form onSubmit={handleSendDocRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                  Query or Missing Document Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please upload your latest electricity bill to verify physical shop premise."
                  value={docRequestNote}
                  onChange={(e) => setDocRequestNote(e.target.value)}
                  className="w-full rounded-2xl border border-brand-forest/20 bg-white p-3 text-xs text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsDocRequestModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
