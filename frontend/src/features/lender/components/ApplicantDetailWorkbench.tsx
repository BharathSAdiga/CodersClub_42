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
<<<<<<< HEAD
  DollarSign,
  Scale,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
=======
  DollarSign
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
import { QuaiAnchorCard } from '@/components/interactive/QuaiAnchorCard';
=======
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
  const [expandedAgentIndex, setExpandedAgentIndex] = useState<number | null>(null);
=======
>>>>>>> origin/feature/harshitha-finance

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

<<<<<<< HEAD
  // 8 Specialized Agents Execution Trace (Feature 10 Requirement)
  const agentExecutionTraces = [
    {
      name: '1. Underwriting Orchestrator',
      role: 'Master Orchestration',
      status: 'COMPLETED',
      task: 'Synthesizing cross-agent risk dossiers and coordinating validation sequences',
      toolCalls: ['invoke_financial_agent', 'invoke_fraud_forensics', 'aggregate_recommendation'],
      findings: 'All prerequisite telemetry collected. Coordinated pipeline completed in 2.8s.',
      durationMs: 310,
    },
    {
      name: '2. Financial Analyst Agent',
      role: 'Cash-Flow Analysis',
      status: 'COMPLETED',
      task: 'Evaluating 90-day Bank AA cash flows, DSCR debt buffer, and volatility',
      toolCalls: ['calculate_cfads', 'compute_volatility_index', 'reconcile_admb'],
      findings: 'Average Daily Balance: ₹18,450. CFADS: ₹78,500/mo. DSCR: 2.14x (Safe).',
      durationMs: 420,
    },
    {
      name: '3. Evidence Verification Agent',
      role: 'Data Provenance',
      status: 'COMPLETED',
      task: '3-Way Triangulation across Bank AA, GSTN Invoices, and UPI merchant QR',
      toolCalls: ['verify_aa_signature', 'fetch_gstn_returns', 'levenshtein_vpa_check'],
      findings: '95.8% cross-rail turnover congruence. 0 unverified claims detected.',
      durationMs: 510,
    },
    {
      name: '4. Fraud Investigation Agent',
      role: 'Graph Forensics',
      status: 'COMPLETED',
      task: 'Cycle detection and counterparty anomaly inspection on transaction graph',
      toolCalls: ['find_circular_loops', 'compute_node_betweenness', 'check_dormant_vpas'],
      findings: '0 circular fund-bouncing loops. Clean distributor-to-retailer trade flow.',
      durationMs: 280,
    },
    {
      name: '5. Business Vitality Agent',
      role: 'Commerce Rhythm',
      status: 'COMPLETED',
      task: 'Measuring daily customer rhythm, transaction frequency, and operating longevity',
      toolCalls: ['compute_cadence_score', 'analyze_bbps_punctuality'],
      findings: '142 tx/day average. 24 months zero utility delay. Vitality Band: Tier A Prime.',
      durationMs: 390,
    },
    {
      name: '6. Resilience Simulation Agent',
      role: 'Cash-Flow Twin Stress',
      status: 'COMPLETED',
      task: 'Simulating -15% demand drop, -30% severe shock, and 30-day payment delay',
      toolCalls: ['run_monte_carlo_shock', 'project_buffer_drawdown'],
      findings: 'Business survives -15% revenue drop with 1.58x DSCR. Reserve covers 18 days.',
      durationMs: 450,
    },
    {
      name: '7. Underwriting Agent',
      role: 'Facility Structuring',
      status: 'COMPLETED',
      task: 'Formulating Key Fact Statement (KFS), safe EMI bounds, and sachet covenants',
      toolCalls: ['compute_max_safe_emi', 'generate_kfs_draft'],
      findings: 'Max Indicative Limit: ₹1,50,000. Recommended daily sweep: ₹1,890/day.',
      durationMs: 320,
    },
    {
      name: '8. Explanation & Passport Agent',
      role: 'XAI Translation',
      status: 'COMPLETED',
      task: 'Generating human-readable SHAP statements and Business Financial Passport',
      toolCalls: ['shap_waterfall_compiler', 'assemble_passport_dossier'],
      findings: 'Generated plain-language vernacular explanation and tamper-evident Merkle hash.',
      durationMs: 240,
    },
  ];

=======
>>>>>>> origin/feature/harshitha-finance
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
      
<<<<<<< HEAD
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToPipeline}
            className="h-8 px-2.5 border-brand-charcoal/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-brand-charcoal">
                {application.businessName}
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono border-brand-charcoal/20">
                {application.id}
              </Badge>
            </div>
            <p className="text-xs text-brand-charcoal/60">
              Proprietor: {application.applicantName} · Sector: {application.sector} · Location: {application.city}, {application.state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDocRequestModalOpen(true)}
            className="text-xs border-brand-charcoal/20"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-brand-forest" />
            Raise Query
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('DECISION')}
            className="bg-brand-forest text-white text-xs"
          >
            Go to Decision Desk
=======
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
>>>>>>> origin/feature/harshitha-finance
          </Button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Quai Network Trust Anchor Banner */}
      <QuaiAnchorCard
        applicationId={application.id}
        vitalityScore={application.acieScore}
        scoreBand={application.scoreBand}
      />

      {/* 5-Tab Navigation Pill Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-brand-charcoal/5 rounded-2xl w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('TRIANGULATION')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'TRIANGULATION'
              ? 'bg-white text-brand-charcoal shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          1. Triangulation Radar
        </button>

        <button
          onClick={() => setActiveTab('CASHFLOW')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'CASHFLOW'
              ? 'bg-white text-brand-charcoal shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          2. Cash Flow & Expenses
        </button>

        <button
          onClick={() => setActiveTab('ACIE_REPORT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'ACIE_REPORT'
              ? 'bg-white text-brand-forest shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          3. ACIE Intelligence & Graph
        </button>

        <button
          onClick={() => setActiveTab('DOCS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'DOCS'
              ? 'bg-white text-brand-charcoal shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          4. Evidence Provenance & Docs
        </button>

        <button
          onClick={() => setActiveTab('DECISION')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'DECISION'
              ? 'bg-brand-forest text-white shadow-sm'
              : 'text-brand-charcoal/60 hover:text-brand-charcoal'
          }`}
        >
          5. Underwriting Worksheet
=======
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
>>>>>>> origin/feature/harshitha-finance
        </button>
      </div>

      {/* ============================================================== */}
<<<<<<< HEAD
      {/* TAB 1: 3-WAY TRIANGULATION RADAR                               */}
      {/* ============================================================== */}
      {activeTab === 'TRIANGULATION' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-mint font-bold block">
                Triangulation Integrity
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                95.8% Cross-Stream Congruence
              </h3>
              <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                Bank AA deposits (₹5.84L) cross-verified against outward GSTN supplies (₹6.10L) and daily UPI merchant settlements (₹5.12L). Discrepancy is &lt; 5%, comfortably below the 15% fraud trigger threshold.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center shrink-0">
              <Badge variant="mint" className="text-xs font-mono">
                LOW VARIANCE RISK
              </Badge>
              <span className="text-[10px] text-white/60 block mt-1">
                0 Unreconciled Drops
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/50 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-brand-forest" />
                  Account Aggregator (FIP)
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹5,84,200
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>Provider: Sahamati / SBI Current A/c</p>
                <p>ADMB: ₹18,450 · 0 Bounces in 90d</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Verified via ReBIT v1.3 XML
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/50 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-terracotta" />
                  GSTN Outward Supplies
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹6,10,000
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>GSTR-3B vs GSTR-1 Consistency: 98.2%</p>
                <p>Active Registered Buyers: 14</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Verified via GSP REST Rail
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/50 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-brand-mint" />
                  Merchant UPI QR Velocity
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹5,12,000
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>Settlement Frequency: Daily 142 tx</p>
                <p>Average Ticket Size: ₹124</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Verified via NPCI Aggregator Webhook
                </span>
              </CardContent>
            </Card>
=======
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

>>>>>>> origin/feature/harshitha-finance
          </div>
        </div>
      )}

      {/* ============================================================== */}
<<<<<<< HEAD
      {/* TAB 2: CASH FLOW & EXPENSES                                    */}
=======
      {/* TAB 2: CASH-FLOW & REVENUE VISUALISATIONS                      */}
>>>>>>> origin/feature/harshitha-finance
      {/* ============================================================== */}
      {activeTab === 'CASHFLOW' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
<<<<<<< HEAD
                <div>
                  <CardTitle className="text-base">30-Day Reconstructed Daily Cash Flow Waveform</CardTitle>
                  <p className="text-xs text-brand-charcoal/60">
                    Daily incoming payments vs. supplier outgoings mapped from certified AA stream.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inflows
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-charcoal/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-charcoal/30" /> Outflows
                  </span>
                </div>
=======
                <CardTitle className="text-base">30-Day Streamed Cash-Flow (Inflows vs Outflows)</CardTitle>
                <span className="text-xs font-mono text-brand-charcoal/50">AA Streamed Telemetry</span>
>>>>>>> origin/feature/harshitha-finance
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowData}>
<<<<<<< HEAD
                    <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                    <Area type="monotone" dataKey="inflow" stroke="#173F35" fill="#173F35" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="outflow" stroke="#C96B4B" fill="#C96B4B" fillOpacity={0.08} strokeWidth={1.5} />
=======
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      formatter={(val: number) => [formatINR(val), 'Volume']}
                      contentStyle={{ backgroundColor: '#1A1A1A', color: '#F7F4EC', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="inflow" stroke="#173F35" strokeWidth={2.5} fill="#173F35" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="outflow" stroke="#C96B4B" strokeWidth={1.5} fill="#C96B4B" fillOpacity={0.1} />
>>>>>>> origin/feature/harshitha-finance
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operational Expense Allocation</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseData} innerRadius={35} outerRadius={65} paddingAngle={4} dataKey="value">
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {expenseData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-brand-charcoal/70">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <strong className="font-mono">{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trade Receivables & Ageing Horizon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <span>Current / Undue (&lt; 30 Days)</span>
                  <strong className="font-mono text-emerald-800">₹3,42,000 (78%)</strong>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-brand-ivory border border-brand-forest/10">
                  <span>30–60 Days Transit</span>
                  <strong className="font-mono text-brand-charcoal">₹82,000 (18%)</strong>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
                  <span>&gt; 60 Days Overdue</span>
                  <strong className="font-mono text-amber-800">₹18,000 (4%)</strong>
                </div>
              </CardContent>
            </Card>
=======
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

>>>>>>> origin/feature/harshitha-finance
          </div>
        </div>
      )}

      {/* ============================================================== */}
<<<<<<< HEAD
      {/* TAB 3: ACIE INTELLIGENCE, AGENTS & TRANSACTION GRAPH           */}
      {/* ============================================================== */}
      {activeTab === 'ACIE_REPORT' && (
        <div className="space-y-6">
          {/* ACIE Banner */}
=======
      {/* TAB 3: ACIE INTELLIGENCE & RISK INDICATORS                     */}
      {/* ============================================================== */}
      {activeTab === 'ACIE_REPORT' && (
        <div className="space-y-6">
          {/* ACIE Structured Output Banner */}
>>>>>>> origin/feature/harshitha-finance
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

<<<<<<< HEAD
          {/* Feature 5: Transaction Graph Forensics Visualization */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-forest" />
                  Transaction Graph Forensics & Network Topology
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> 0 Circular Loops Detected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interactive SVG Network Graph */}
              <div className="p-4 rounded-2xl bg-brand-charcoal text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
                <svg className="w-full h-44" viewBox="0 0 600 200">
                  {/* Edges */}
                  <line x1="120" y1="100" x2="300" y2="100" stroke="#34D399" strokeWidth="2.5" strokeDasharray="4 2" />
                  <line x1="300" y1="100" x2="480" y2="60" stroke="#C96B4B" strokeWidth="2.5" />
                  <line x1="300" y1="100" x2="480" y2="140" stroke="#C96B4B" strokeWidth="2" />

                  {/* Flow labels */}
                  <text x="210" y="90" fill="#34D399" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    UPI + Bank Inflow (₹5.8L)
                  </text>
                  <text x="390" y="70" fill="#C96B4B" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Supplier RTGS (₹3.1L)
                  </text>
                  <text x="390" y="130" fill="#C96B4B" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Rent / Utilities (₹85k)
                  </text>

                  {/* Nodes */}
                  <circle cx="120" cy="100" r="28" fill="#173F35" stroke="#34D399" strokeWidth="2" />
                  <text x="120" y="96" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">BUYERS / UPI</text>
                  <text x="120" y="110" fill="#34D399" fontSize="8" textAnchor="middle">(142 tx/day)</text>

                  <circle cx="300" cy="100" r="34" fill="#1A1A1A" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="300" y="96" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">MERCHANT</text>
                  <text x="300" y="110" fill="#34D399" fontSize="8" textAnchor="middle">Sri Balaji</text>

                  <circle cx="480" cy="60" r="26" fill="#173F35" stroke="#C96B4B" strokeWidth="2" />
                  <text x="480" y="58" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">SUPPLIER</text>
                  <text x="480" y="70" fill="#C96B4B" fontSize="8" textAnchor="middle">Staples (32%)</text>

                  <circle cx="480" cy="140" r="22" fill="#173F35" stroke="#C96B4B" strokeWidth="1.5" />
                  <text x="480" y="142" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">OPERATING</text>
                </svg>

                <div className="w-full flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10">
                  <span>Graph Direction: Directed Inflow $\rightarrow$ Outflow Hierarchy</span>
                  <span className="text-brand-mint font-mono font-semibold">Investigation Severity: INFO (Safe Trade Topology)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 10: 8-Agent Execution Activity Log */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-forest" />
                    Agentic AI Financial Investigation Execution Log
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Live coordination trace across the 8 specialized analytical sub-agents
                  </p>
                </div>
                <Badge variant="outline" className="border-brand-forest/20 text-brand-forest text-[10px]">
                  8 of 8 Completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-brand-forest/10 border border-brand-forest/15 rounded-2xl overflow-hidden text-xs">
                {agentExecutionTraces.map((agent, idx) => {
                  const isExpanded = expandedAgentIndex === idx;
                  return (
                    <div key={idx} className="p-3 bg-white hover:bg-brand-ivory/50 transition-colors">
                      <div 
                        onClick={() => setExpandedAgentIndex(isExpanded ? null : idx)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <strong className="text-brand-charcoal block">{agent.name}</strong>
                            <span className="text-[10px] text-brand-charcoal/50">{agent.task}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-brand-charcoal/50">{agent.durationMs}ms</span>
                          <Badge variant="outline" className="text-[9px] border-emerald-300 bg-emerald-50 text-emerald-800">
                            {agent.status}
                          </Badge>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-brand-charcoal/60" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-charcoal/60" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-brand-forest/10 text-[11px] space-y-1.5 pl-5 bg-brand-ivory/40 p-2 rounded-xl">
                          <div>
                            <span className="text-brand-charcoal/60 font-semibold">Tool Calls:</span>
                            <span className="font-mono text-[10px] text-brand-forest ml-2">
                              {agent.toolCalls.join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-brand-charcoal/60 font-semibold">Structured Finding:</span>
                            <span className="text-brand-charcoal ml-2 font-medium">{agent.findings}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
=======
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
>>>>>>> origin/feature/harshitha-finance

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
<<<<<<< HEAD
      {/* TAB 4: EVIDENCE PROVENANCE & DOCS (Feature 2)                  */}
=======
      {/* TAB 4: DOCUMENTS & QUERIES                                     */}
>>>>>>> origin/feature/harshitha-finance
      {/* ============================================================== */}
      {activeTab === 'DOCS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
<<<<<<< HEAD
            <div>
              <h3 className="font-display font-bold text-base text-brand-charcoal">
                Evidence Provenance & Document Portfolio
              </h3>
              <p className="text-xs text-brand-charcoal/60">
                Classified by verification authority: Independently Verified vs. Source-Labelled vs. Self-Reported
              </p>
            </div>
=======
            <h3 className="font-display font-bold text-base text-brand-charcoal">
              Applicant Document Portfolio
            </h3>
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
              { name: 'Bank_Statement_AA_SBI.xml', type: 'ACCOUNT_AGGREGATOR', provenance: 'INDEPENDENTLY_VERIFIED', ocrScore: 'Native XML (100%)', authority: 'Sahamati / SBI FIP' },
              { name: 'GSTR_3B_Outward_Supplies.json', type: 'GSTN_RETURN', provenance: 'INDEPENDENTLY_VERIFIED', ocrScore: 'GSP Direct (100%)', authority: 'GSTN Portal API' },
              { name: 'UPI_Merchant_Settlements.csv', type: 'MERCHANT_QR', provenance: 'SOURCE_LABELLED', ocrScore: 'Webhook Log (99.8%)', authority: 'PhonePe QR Gateway' },
              { name: 'Offline_Daily_Cashbook_Q3.csv', type: 'CASHBOOK_REGISTER', provenance: 'SELF_REPORTED', ocrScore: 'Client Parsed (184 rows)', authority: 'Merchant Upload (Unverified)' },
              { name: 'Shop_Tenancy_Agreement.pdf', type: 'LEASE_AGREEMENT', provenance: 'SOURCE_LABELLED', ocrScore: 'Tesseract OCR (94.2%)', authority: 'Scanned Document' },
            ].map((doc, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-brand-forest/15 shadow-sm text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
=======
              { name: 'PAN_Card_SriBalaji.pdf', type: 'PAN_CARD', status: 'VERIFIED', ocrScore: 99.4 },
              { name: 'Udyam_Registration_Certificate.pdf', type: 'UDYAM', status: 'VERIFIED', ocrScore: 98.8 },
              { name: 'Shop_Establishment_License.jpg', type: 'LICENSE', status: 'VERIFIED', ocrScore: 95.2 },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-brand-forest/15 shadow-sm text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
>>>>>>> origin/feature/harshitha-finance
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-charcoal block text-sm">{doc.name}</strong>
                    <span className="text-[10px] text-brand-charcoal/50 font-mono">
<<<<<<< HEAD
                      {doc.type} · Authority: {doc.authority} · Extraction: {doc.ocrScore}
=======
                      Type: {doc.type} · OCR Confidence: {doc.ocrScore}%
>>>>>>> origin/feature/harshitha-finance
                    </span>
                  </div>
                </div>

<<<<<<< HEAD
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      doc.provenance === 'INDEPENDENTLY_VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : doc.provenance === 'SOURCE_LABELLED'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {doc.provenance.replace('_', ' ')}
                  </Badge>

                  <Button variant="outline" size="sm" className="text-[11px] h-8">
                    Inspect Trace
=======
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </span>
                  <Button variant="outline" size="sm" className="text-[11px] h-8">
                    View Doc
>>>>>>> origin/feature/harshitha-finance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
<<<<<<< HEAD
      {/* TAB 5: UNDERWRITING WORKSHEET & REPAYMENT OPTIMIZER (Feature 9)*/}
=======
      {/* TAB 5: UNDERWRITING WORKSHEET & HUMAN DECISION INTERFACE       */}
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
                
                {/* Feature 9: Dynamic Repayment Structure Optimizer Comparison */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Scale className="w-4 h-4 text-brand-forest" />
                      Dynamic Repayment Structure Optimizer
                    </CardTitle>
                    <p className="text-xs text-brand-charcoal/60">
                      Comparison across 3 alternative repayment structures to minimize cash-flow pressure
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-brand-charcoal/5 border-b border-brand-charcoal/10 font-mono text-[10px] text-brand-charcoal/70">
                            <th className="p-2.5">Repayment Structure</th>
                            <th className="p-2.5">Cadence</th>
                            <th className="p-2.5">Cycle Payment</th>
                            <th className="p-2.5">Total Interest</th>
                            <th className="p-2.5">Cash-Flow Stress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-charcoal/5 font-sans text-xs">
                          <tr className="bg-emerald-50/40">
                            <td className="p-2.5 font-bold text-brand-forest">Revenue-Linked Daily Sweep (Recommended)</td>
                            <td className="p-2.5 font-mono">Daily (90d)</td>
                            <td className="p-2.5 font-mono font-bold">₹1,890 / day</td>
                            <td className="p-2.5 font-mono">₹5,250</td>
                            <td className="p-2.5"><Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-300">LOW (Matches sales)</Badge></td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-brand-charcoal">Standard Monthly Fixed EMI</td>
                            <td className="p-2.5 font-mono">Monthly (3 mos)</td>
                            <td className="p-2.5 font-mono">₹51,750 / mo</td>
                            <td className="p-2.5 font-mono">₹5,250</td>
                            <td className="p-2.5"><Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-800 border-rose-300">HIGH (Month-end lump)</Badge></td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-semibold text-brand-charcoal">Seasonality-Matched Step EMI</td>
                            <td className="p-2.5 font-mono">Bi-Weekly</td>
                            <td className="p-2.5 font-mono">₹21,000 $\rightarrow$ ₹28,000</td>
                            <td className="p-2.5 font-mono">₹5,480</td>
                            <td className="p-2.5"><Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-800 border-amber-300">MEDIUM (Festival step)</Badge></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

=======
>>>>>>> origin/feature/harshitha-finance
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
