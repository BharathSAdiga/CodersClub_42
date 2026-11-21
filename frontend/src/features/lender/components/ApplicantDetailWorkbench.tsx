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
  ArrowRight,
  Sparkles,
  MessageSquare,
  Lock,
  Send,
  Sliders,
  DollarSign,
  Scale,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Info,
  HelpCircle,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Check,
  ExternalLink,
  History,
  FileCheck
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
import { QuaiAnchorCard } from '@/components/interactive/QuaiAnchorCard';
import { toast } from 'sonner';

interface ApplicantDetailWorkbenchProps {
  applicationId: string;
  onBackToPipeline: () => void;
}

export type WorkbenchTab =
  | 'OVERVIEW'
  | 'FINANCIAL_HEALTH'
  | 'TRANSACTIONS'
  | 'DOCUMENTS'
  | 'AFFORDABILITY'
  | 'STRESS_TEST'
  | 'ASSESSMENT_EXPLANATION'
  | 'DECISION';

export const ApplicantDetailWorkbench: React.FC<ApplicantDetailWorkbenchProps> = ({
  applicationId,
  onBackToPipeline,
}) => {
  const application = mockPipelineApplications.find((a) => a.id === applicationId) || mockPipelineApplications[0];

  const [activeTab, setActiveTab] = useState<WorkbenchTab>('OVERVIEW');
  const [haircutPercentage, setHaircutPercentage] = useState<number>(0);
  const [underwriterNotes, setUnderwriterNotes] = useState<string>(
    'Strong verified daily UPI velocity; healthy balance cushion. Recommending approval with mandatory daily sweep covenant.'
  );
  const [isDocRequestModalOpen, setIsDocRequestModalOpen] = useState<boolean>(false);
  const [docRequestNote, setDocRequestNote] = useState<string>('');
  const [decisionOutcome, setDecisionOutcome] = useState<'PENDING' | 'APPROVED' | 'DECLINED'>('PENDING');
  const [expandedAgentIndex, setExpandedAgentIndex] = useState<number | null>(null);
  const [selectedStressPreset, setSelectedStressPreset] = useState<string>('NORMAL');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingDecisionAction, setPendingDecisionAction] = useState<'APPROVE' | 'DECLINE' | null>(null);

  // Dynamic calculations
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

  // 8 Specialized Agents Execution Trace
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
      task: 'Evaluating 90-day Bank AA cash flows, debt coverage buffer, and volatility',
      toolCalls: ['calculate_cfads', 'compute_volatility_index', 'reconcile_admb'],
      findings: 'Average Daily Balance: ₹18,450. Cash Available for Loan Repayment: ₹78,500/mo. Repayment Coverage Ratio: 2.14x (Safe).',
      durationMs: 420,
    },
    {
      name: '3. Evidence Verification Agent',
      role: 'Data Provenance',
      status: 'COMPLETED',
      task: '3-Way Cross-Stream Verification across Bank AA, GSTN Invoices, and UPI merchant QR',
      toolCalls: ['verify_aa_signature', 'fetch_gstn_returns', 'levenshtein_vpa_check'],
      findings: '95.8% cross-rail turnover agreement. 0 unverified claims detected.',
      durationMs: 510,
    },
    {
      name: '4. Fraud Investigation Agent',
      role: 'Transaction Relationship Analysis',
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
      findings: '142 transactions/day average. 24 months zero utility delay. Vitality Band: Tier A Prime.',
      durationMs: 390,
    },
    {
      name: '6. Resilience Simulation Agent',
      role: 'Cash-Flow Shock Stress Test',
      status: 'COMPLETED',
      task: 'Simulating -15% demand drop, -30% severe shock, and 30-day payment delay',
      toolCalls: ['run_monte_carlo_shock', 'project_buffer_drawdown'],
      findings: 'Business survives -15% revenue drop with 1.58x Repayment Coverage Ratio. Reserve covers 18 days.',
      durationMs: 450,
    },
    {
      name: '7. Underwriting Agent',
      role: 'Facility Structuring',
      status: 'COMPLETED',
      task: 'Formulating Key Fact Statement (KFS), safe repayment bounds, and sachet covenants',
      toolCalls: ['compute_max_safe_emi', 'generate_kfs_draft'],
      findings: 'Max Indicative Limit: ₹1,50,000. Recommended daily sweep: ₹1,890/day.',
      durationMs: 320,
    },
    {
      name: '8. Explanation & Passport Agent',
      role: 'Plain-English Translation',
      status: 'COMPLETED',
      task: 'Generating human-readable explanations and Business Financial Passport',
      toolCalls: ['shap_waterfall_compiler', 'assemble_passport_dossier'],
      findings: 'Generated plain-language explanation and tamper-evident cryptographic Merkle hash.',
      durationMs: 240,
    },
  ];

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

  // Stress test scenarios
  const stressScenarios: Record<string, { label: string; revenueChange: string; cashSurplus: string; dscr: string; impact: string }> = {
    NORMAL: {
      label: 'Normal Business Operations',
      revenueChange: '0% Baseline',
      cashSurplus: '₹85,000 / month',
      dscr: '2.14x Coverage',
      impact: 'Operating under verified baseline. Ample liquidity to service loan.',
    },
    MINUS_15: {
      label: '-15% Monsoon / Demand Dip',
      revenueChange: '-₹91,500 / mo',
      cashSurplus: '₹58,400 / month',
      dscr: '1.58x Coverage',
      impact: 'Repayment remains fully viable without tapping personal reserves.',
    },
    MINUS_30: {
      label: '-30% Severe Macroeconomic Shock',
      revenueChange: '-₹1,83,000 / mo',
      cashSurplus: '₹31,200 / month',
      dscr: '1.18x Coverage',
      impact: 'Tight buffer. Revenue-linked daily sweep automatically eases burden on slow days.',
    },
    OPEX_PLUS_15: {
      label: '+15% Supplier Cost Inflation',
      revenueChange: 'Costs +₹53,000',
      cashSurplus: '₹47,800 / month',
      dscr: '1.42x Coverage',
      impact: 'Manageable. Business gross margins comfortably absorb wholesale price rises.',
    },
    DELAY_30: {
      label: '30-Day Customer Payment Delay',
      revenueChange: 'Working Capital Lag',
      cashSurplus: '₹38,000 / month',
      dscr: '1.25x Coverage',
      impact: 'Cash reserve covers 18 days of payroll; supplier payment rescheduling required.',
    },
  };

  const currentStress = stressScenarios[selectedStressPreset] || stressScenarios.NORMAL;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">

      {/* ============================================================== */}
      {/* 1. TOP HEADER & APPLICANT BRIEFING BANNER                       */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToPipeline}
            className="h-8 px-2.5 border-brand-charcoal/20 hover:bg-brand-forest/5"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Queue</span>
          </Button>

          <span className="text-xs font-mono font-bold text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded-lg">
            {application.id}
          </span>
          <span className="text-xs text-brand-charcoal/50">· Submitted {application.submittedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDocRequestModalOpen(true)}
            className="text-xs gap-1.5 h-8 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request Borrower Documents</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('DECISION')}
            className="text-xs gap-1.5 h-8 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Record Loan Decision</span>
          </Button>
        </div>
      </div>

      {/* Applicant High-Level Summary Card */}
      <div className="p-6 rounded-3xl bg-white border border-brand-forest/15 shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-bold text-brand-charcoal">
              {application.businessName}
            </h2>
            <Badge variant="mint" className="text-xs font-semibold">
              Udyam Verified
            </Badge>
          </div>
          <p className="text-xs text-brand-charcoal/70">
            Proprietor: <strong>{application.applicantName}</strong> · Sector: <strong>{application.sector}</strong> · Location: <strong>{application.city}, {application.state}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase text-brand-charcoal/50 block">Requested Loan</span>
            <strong className="text-base text-brand-forest block mt-0.5">
              {formatINR(application.requestedAmount)}
            </strong>
            <span className="text-[10px] text-brand-charcoal/60">{application.tenorDays}d · {application.repaymentFrequency === 'DAILY_SWEEP' ? 'Daily UPI' : 'Monthly'}</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase text-brand-charcoal/50 block">Financial Vitality</span>
            <strong className="text-base text-emerald-800 block mt-0.5">
              {application.acieScore} / 900
            </strong>
            <span className="text-[10px] text-emerald-700 font-semibold">{application.scoreBand} Band</span>
          </div>

          <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase text-brand-charcoal/50 block">Cross-Stream Match</span>
            <strong className="text-base text-brand-charcoal block mt-0.5">
              {application.congruenceScore}%
            </strong>
            <span className="text-[10px] text-emerald-700 font-semibold">&lt; 5% Variance (Safe)</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EIGHT CLEAR UNDERWRITING TABS                               */}
      {/* Simple Information First. Advanced Information on Demand.      */}
      {/* ============================================================== */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-brand-charcoal/5 rounded-2xl w-full overflow-x-auto">
        
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'OVERVIEW' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          1. Overview
        </button>

        <button
          onClick={() => setActiveTab('FINANCIAL_HEALTH')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'FINANCIAL_HEALTH' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          2. Financial Health
        </button>

        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'TRANSACTIONS' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          3. Transactions
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'DOCUMENTS' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          4. Evidence & Documents
        </button>

        <button
          onClick={() => setActiveTab('AFFORDABILITY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'AFFORDABILITY' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          5. Loan Affordability
        </button>

        <button
          onClick={() => setActiveTab('STRESS_TEST')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'STRESS_TEST' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          6. Stress Test
        </button>

        <button
          onClick={() => setActiveTab('ASSESSMENT_EXPLANATION')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'ASSESSMENT_EXPLANATION' ? 'bg-brand-forest text-white shadow-sm' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          7. Assessment Explanation
        </button>

        <button
          onClick={() => setActiveTab('DECISION')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'DECISION' ? 'bg-emerald-700 text-white shadow-sm font-bold' : 'text-brand-charcoal/70 hover:bg-white/60'
          }`}
        >
          8. Decision History
        </button>

      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & EXECUTIVE DECISION BRIEFING                  */}
      {/* ============================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Executive Verdict Banner */}
          <div className="p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block">
                Executive Underwriting Briefing
              </span>
              <h3 className="text-2xl font-display font-bold text-white">
                Recommended for Loan Sanction ({application.scoreBand} Health Band)
              </h3>
              <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                This enterprise shows <strong>95.8% cross-stream agreement</strong> across bank statements, GST invoices, and UPI QR turnover. Monthly uncommitted cash flow of <strong>₹85,000</strong> provides strong repayment safety for the requested <strong>{formatINR(application.requestedAmount)}</strong> working capital facility.
              </p>
            </div>

            <div className="p-4 px-6 rounded-2xl bg-white/[0.12] backdrop-blur-md border border-white/20 text-center shrink-0 flex flex-col items-center justify-center shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/80 text-emerald-100 text-xs font-bold tracking-wide shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Low Risk · High Cash Stability</span>
              </div>
              <span className="text-xs font-semibold text-white block mt-2.5">
                Consistent Daily Revenue
              </span>
              <span className="text-[11px] text-emerald-200 block mt-0.5 font-medium">
                0 Unexplained Inflow Gaps
              </span>
            </div>
          </div>

          {/* Quick Decision Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Repayment Capacity</span>
                <strong className="text-lg font-mono font-bold text-brand-forest block">
                  ₹42,500 / month
                </strong>
                <p className="text-[11px] text-brand-charcoal/65">
                  Safe borrowing ceiling without operational distress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Repayment Coverage</span>
                <strong className="text-lg font-mono font-bold text-emerald-800 block">
                  2.14x Coverage
                </strong>
                <p className="text-[11px] text-brand-charcoal/65">
                  Earnings cover loan payments by more than double.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">90-Day Banking Conduct</span>
                <strong className="text-lg font-mono font-bold text-brand-charcoal block">
                  0 Bounces / Returns
                </strong>
                <p className="text-[11px] text-brand-charcoal/65">
                  Clean payment mandate record with zero debit failures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Recommended Structure</span>
                <strong className="text-lg font-mono font-bold text-brand-terracotta block">
                  Daily UPI Auto-Sweep
                </strong>
                <p className="text-[11px] text-brand-charcoal/65">
                  ₹1,890/day sweeps matching daily retail sales volume.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Applicant Verified Details */}
          <Card>
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <CardTitle className="text-base font-display font-bold">
                Government Verified Business Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-brand-charcoal/50 block">Udyam Registration</span>
                <strong className="font-mono text-brand-charcoal text-sm block">UDYAM-KR-03-009124</strong>
                <span className="text-[11px] text-emerald-700">✓ Verified with Ministry of MSME</span>
              </div>

              <div>
                <span className="text-brand-charcoal/50 block">Constitution & Class</span>
                <strong className="text-brand-charcoal text-sm block">Sole Proprietorship · Micro Enterprise</strong>
                <span className="text-[11px] text-brand-charcoal/60">Retail Provisions & Groceries</span>
              </div>

              <div>
                <span className="text-brand-charcoal/50 block">Operating Premise Verification</span>
                <strong className="text-brand-charcoal text-sm block">Physical Shop (Geotagged)</strong>
                <span className="text-[11px] text-emerald-700">✓ Coordinates confirmed via DigiLocker</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Guide */}
          <div className="p-4 rounded-2xl bg-brand-forest/[0.04] border border-brand-forest/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-forest" />
              <span className="text-xs text-brand-charcoal/80">
                Ready to review detailed cash figures? Proceed to <strong>Financial Health</strong> or jump straight to <strong>Decision & Sanction</strong>.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('FINANCIAL_HEALTH')}
              className="text-xs h-8"
            >
              <span>Examine Financial Health</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FINANCIAL HEALTH — 5 CORE PILLARS & CHARTS              */}
      {/* ============================================================== */}
      {activeTab === 'FINANCIAL_HEALTH' && (
        <div className="space-y-6">
          
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-display font-bold">
                    Business Financial Overview — The 5 Core Metrics
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/65 mt-0.5">
                    Clear breakdown of money earned, spent, and safe borrowing capacity.
                  </p>
                </div>
                <Badge variant="mint" className="text-xs font-mono">
                  30-Day Reconciled View
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              
              {/* 5 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/60 block">1. Revenue</span>
                  <strong className="text-xl font-mono font-bold text-brand-forest block">
                    ₹6,10,000 / mo
                  </strong>
                  <p className="text-[11px] text-brand-charcoal/70">
                    <strong>How much it earns:</strong> Account Aggregator deposits + verified GST sales.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/60 block">2. Expenses</span>
                  <strong className="text-xl font-mono font-bold text-brand-terracotta block">
                    ₹5,25,000 / mo
                  </strong>
                  <p className="text-[11px] text-brand-charcoal/70">
                    <strong>How much it spends:</strong> Supplier stock purchases, rent, utilities, and logistics.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/60 block">3. Cash Flow</span>
                  <strong className="text-xl font-mono font-bold text-emerald-800 block">
                    ₹85,000 / mo
                  </strong>
                  <p className="text-[11px] text-brand-charcoal/70">
                    <strong>Money remaining:</strong> Uncommitted buffer after operational outflows.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/60 block">4. Existing Loans</span>
                  <strong className="text-xl font-mono font-bold text-blue-800 block">
                    ₹18,450 / mo
                  </strong>
                  <p className="text-[11px] text-brand-charcoal/70">
                    <strong>Current obligations:</strong> Active EMIs with 0 return bounces in 90 days.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/60 block">5. Repayment Capacity</span>
                  <strong className="text-xl font-mono font-bold text-purple-800 block">
                    ₹42,500 / mo
                  </strong>
                  <p className="text-[11px] text-brand-charcoal/70">
                    <strong>Borrowing ability:</strong> Safe repayment capacity that prevents loan distress.
                  </p>
                </div>
              </div>

              {/* Inflow vs Outflow 30-Day Area Chart */}
              <div className="space-y-2 pt-2 border-t border-brand-forest/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider font-mono">
                    30-Day Daily Cash Rhythm (Inflows vs Outflows)
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Daily Inflows
                    </span>
                    <span className="flex items-center gap-1.5 text-brand-charcoal/60">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-charcoal/30 inline-block" /> Daily Outflows
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashflowData}>
                      <defs>
                        <linearGradient id="inflowColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <Tooltip formatter={(value: any) => formatINR(Number(value))} />
                      <Area type="monotone" dataKey="inflow" stroke="#10b981" fillOpacity={1} fill="url(#inflowColor)" strokeWidth={2} />
                      <Area type="monotone" dataKey="outflow" stroke="#94a3b8" fillOpacity={0.1} fill="#94a3b8" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRANSACTIONS & CROSS-STREAM TRIANGULATION               */}
      {/* ============================================================== */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-6">
          
          {/* 3 Stream Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/60 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-brand-forest" />
                  Account Aggregator (Bank AA)
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹5,84,200
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>Provider: State Bank of India Current A/c</p>
                <p>Average Daily Balance: ₹18,450 · 0 Bounces in 90d</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Verified via RBI ReBIT XML specification
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/60 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-terracotta" />
                  GSTN Network Returns
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹6,10,000
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>Filing: GSTR-3B & GSTR-1 (Last 6 Months)</p>
                <p>100% On-time filing cadence; 0 penalty notices</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Direct Government API reconciliation
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <span className="text-xs font-mono text-brand-charcoal/60 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  Merchant UPI Settlements
                </span>
                <CardTitle className="text-xl font-mono text-brand-charcoal mt-1">
                  ₹5,12,000
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-brand-charcoal/70 space-y-1">
                <p>NPCI Settlement Rail: Daily evening batched sweep</p>
                <p>142 average transactions/day · Median ticket: ₹125</p>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold block pt-1">
                  ✓ Direct VPA merchant gateway feed
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Relationship Analysis (Formerly Graph Forensics) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-forest" />
                    <CardTitle className="text-base font-display font-bold">
                      Transaction Relationship Analysis
                    </CardTitle>
                  </div>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Analyzes supplier and customer fund flows to ensure genuine commerce and detect circular money routing.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800">
                  0 Circular Loops Detected
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Visual SVG Network Representation */}
              <div className="p-6 rounded-2xl bg-brand-charcoal text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
                <div className="text-center space-y-1 mb-4 z-10">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block">
                    Verified Commercial Network (No Circular Fund Bouncing)
                  </span>
                  <p className="text-xs text-white/70">
                    Trade flows naturally downstream: Suppliers $\rightarrow$ Sri Balaji Provisions $\rightarrow$ Daily Retail Consumers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 z-10 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <span className="text-[10px] text-white/50 block font-mono">Top Supplier 1</span>
                    <strong className="text-white block">ITC Distribution</strong>
                    <span className="text-[10px] text-emerald-300">₹1.8L monthly</span>
                  </div>

                  <span className="text-emerald-400 font-bold text-lg">$\rightarrow$</span>

                  <div className="p-3.5 rounded-xl bg-emerald-600/30 border border-emerald-400/50 text-center shadow-lg">
                    <span className="text-[10px] text-emerald-300 block font-mono">Borrower Node</span>
                    <strong className="text-white text-sm block">{application.businessName}</strong>
                    <span className="text-[10px] text-white/80">Primary Node</span>
                  </div>

                  <span className="text-emerald-400 font-bold text-lg">$\rightarrow$</span>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                    <span className="text-[10px] text-white/50 block font-mono">Counterparties</span>
                    <strong className="text-white block">Retail Consumers</strong>
                    <span className="text-[10px] text-emerald-300">142 transactions/day</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Risk Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <strong className="text-brand-forest block font-semibold">
                    Customer Concentration Check
                  </strong>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    Largest single customer accounts for only <strong>6.4% of total sales</strong>. This indicates healthy retail diversification rather than reliance on a single buyer.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10 space-y-1">
                  <strong className="text-brand-forest block font-semibold">
                    Cash Loop Verification
                  </strong>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    Zero funds were routed back to suppliers or sister accounts within 72 hours. All revenue represents genuine third-party commercial purchases.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: EVIDENCE & DOCUMENTS — 4-TIER PROVENANCE                 */}
      {/* ============================================================== */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-display font-bold">
                    Submitted Evidence & Document Verification
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Classified into 4 verifiable tiers of data reliability.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDocRequestModalOpen(true)}
                  className="text-xs h-8 gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-forest" />
                  <span>Request Missing Document</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              
              {/* Document 1: AA Bank Statement */}
              <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    AA
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-brand-charcoal">
                      Bank Current Account Statement (90 Days)
                    </h5>
                    <span className="text-[11px] text-brand-charcoal/60 block font-mono">
                      State Bank of India · A/c ending 8912 · Digisigned via Sahamati FIP
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold">
                    Independently Verified (AA/GST)
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Preview</Button>
                </div>
              </div>

              {/* Document 2: GST Returns */}
              <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    GST
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-brand-charcoal">
                      GSTR-3B Tax Filing Summary (6 Months)
                    </h5>
                    <span className="text-[11px] text-brand-charcoal/60 block font-mono">
                      GSTIN: 29AABCS1429B1Z8 · Pull timestamp 2026-11-20
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold">
                    Independently Verified (AA/GST)
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Preview</Button>
                </div>
              </div>

              {/* Document 3: Merchant UPI Settlements */}
              <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                    UPI
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-brand-charcoal">
                      Merchant QR Batch Settlement Ledger
                    </h5>
                    <span className="text-[11px] text-brand-charcoal/60 block font-mono">
                      VPA: sribalaji@okhdfcbank · NPCI Settlement Rail
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-blue-300 bg-blue-50 text-blue-800 font-semibold">
                    Source-Labelled (UPI)
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Preview</Button>
                </div>
              </div>

              {/* Document 4: Electricity Bill */}
              <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                    DOC
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-brand-charcoal">
                      Commercial Electricity Premise Utility Bill
                    </h5>
                    <span className="text-[11px] text-brand-charcoal/60 block font-mono">
                      BESCOM A/c 481920 · Matches shop address
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-800 font-semibold">
                    Self-Reported / Scanned
                  </Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Preview</Button>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: LOAN AFFORDABILITY & REPAYMENT OPTIMIZER                 */}
      {/* ============================================================== */}
      {activeTab === 'AFFORDABILITY' && (
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-forest" />
                <CardTitle className="text-base font-display font-bold">
                  Loan Affordability & Safe Repayment Structure
                </CardTitle>
              </div>
              <p className="text-xs text-brand-charcoal/60">
                Comparing 3 repayment structures to eliminate default risk while preserving business cash buffer.
              </p>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              
              {/* Repayment Optimizer Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-brand-charcoal/5 border-b border-brand-charcoal/10 font-mono text-[10px] text-brand-charcoal/70">
                      <th className="p-3">Repayment Structure</th>
                      <th className="p-3">Cadence</th>
                      <th className="p-3">Payment Amount</th>
                      <th className="p-3">Total Interest</th>
                      <th className="p-3">Cash-Flow Stress Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-charcoal/5 font-sans text-xs">
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-bold text-brand-forest">
                        Revenue-Linked Daily Sweep (Recommended)
                      </td>
                      <td className="p-3 font-mono">Daily (90d)</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">₹1,890 / day</td>
                      <td className="p-3 font-mono">₹5,250</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          LOW (Matches daily retail sales)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-brand-charcoal">
                        Standard Monthly Fixed EMI
                      </td>
                      <td className="p-3 font-mono">Monthly (3 mos)</td>
                      <td className="p-3 font-mono">₹51,750 / mo</td>
                      <td className="p-3 font-mono">₹5,250</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          HIGH (Large month-end cash drain)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-brand-charcoal">
                        Seasonality-Matched Step EMI
                      </td>
                      <td className="p-3 font-mono">Bi-Weekly</td>
                      <td className="p-3 font-mono">₹21,000 $\rightarrow$ ₹28,000</td>
                      <td className="p-3 font-mono">₹5,480</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          MEDIUM (Festival sales step-up)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Affordability Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Maximum Indicative Safe Repayment</span>
                  <strong className="text-xl font-mono font-bold text-brand-forest block">
                    ₹42,500 / month
                  </strong>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    Evaluated against ₹85,000 monthly operational cash flow. Leaves a 50% safety cushion for inventory fluctuations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Repayment Coverage Ratio (Formerly DSCR)</span>
                  <strong className="text-xl font-mono font-bold text-emerald-800 block">
                    2.14x Buffer
                  </strong>
                  <p className="text-brand-charcoal/70 leading-relaxed">
                    Well above the institutional minimum requirement of 1.30x. Strong debt absorption capacity.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: STRESS TEST & SHOCK SIMULATION                          */}
      {/* ============================================================== */}
      {activeTab === 'STRESS_TEST' && (
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <CardTitle className="text-base font-display font-bold">
                Cash-Flow Shock Resilience Simulator
              </CardTitle>
              <p className="text-xs text-brand-charcoal/60">
                Simulates real-world economic stress (monsoon slowdown, supplier inflation, payment delays) to verify borrower survival.
              </p>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              
              {/* Presets Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-brand-charcoal block">
                  Select a Stress Scenario to Test:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(stressScenarios).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStressPreset(key)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs space-y-1 ${
                        selectedStressPreset === key
                          ? 'bg-brand-forest text-white border-brand-forest shadow-sm'
                          : 'bg-brand-ivory text-brand-charcoal border-brand-forest/10 hover:border-brand-forest/30'
                      }`}
                    >
                      <strong className="block font-semibold text-[11px] truncate">{item.label}</strong>
                      <span className={`text-[10px] block font-mono ${selectedStressPreset === key ? 'text-emerald-300' : 'text-brand-charcoal/60'}`}>
                        {item.revenueChange}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Results Card */}
              <div className="p-6 rounded-3xl bg-brand-charcoal text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-300 block">Simulated Scenario Output</span>
                    <h4 className="font-display font-bold text-lg text-white">{currentStress.label}</h4>
                  </div>
                  <Badge variant="mint-pill" className="text-xs font-mono">
                    {currentStress.dscr}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-white/60 block">Projected Cash Available for Repayment:</span>
                    <strong className="text-lg font-mono text-emerald-300 block mt-0.5">
                      {currentStress.cashSurplus}
                    </strong>
                  </div>

                  <div>
                    <span className="text-white/60 block">Repayment Coverage Ratio:</span>
                    <strong className="text-lg font-mono text-white block mt-0.5">
                      {currentStress.dscr}
                    </strong>
                  </div>

                  <div>
                    <span className="text-white/60 block">Underwriter Impact Verdict:</span>
                    <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                      {currentStress.impact}
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: ASSESSMENT EXPLANATION (ACIE & 8 SPECIALIZED AGENTS)    */}
      {/* ============================================================== */}
      {activeTab === 'ASSESSMENT_EXPLANATION' && (
        <div className="space-y-6">
          
          {/* Plain-English Assessment Summary */}
          <Card>
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <CardTitle className="text-base font-display font-bold">
                Plain-English Credit Assessment Breakdown
              </CardTitle>
              <p className="text-xs text-brand-charcoal/60">
                Transparent explainability: why this business scored <strong>{application.acieScore} / 900</strong>.
              </p>
            </CardHeader>

            <CardContent className="pt-4 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Positive Drivers */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Factors that Raised the Score (+140 pts)</span>
                  </div>
                  <ul className="space-y-1.5 text-emerald-950/80 text-[11px] list-disc list-inside">
                    <li><strong>Consistent Daily Cash Velocity:</strong> 142 daily UPI transactions with steady weekend volume.</li>
                    <li><strong>Reliability of Submitted Financial Information:</strong> 95.8% triangulation match across Bank AA and GST.</li>
                    <li><strong>Clean Banking Conduct:</strong> Zero cheque bounces or mandate failures over 90 days.</li>
                  </ul>
                </div>

                {/* Drag Factors */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Areas with Room for Improvement (-25 pts)</span>
                  </div>
                  <ul className="space-y-1.5 text-amber-950/80 text-[11px] list-disc list-inside">
                    <li><strong>Thin Traditional Bureau History:</strong> No prior long-term commercial term loans on CIBIL.</li>
                    <li><strong>Working Capital Lag:</strong> Average 18-day collection cycle from neighborhood institutional buyers.</li>
                  </ul>
                </div>

              </div>

              {/* 8-Agent Orchestration Trace (Expandable on Demand) */}
              <div className="space-y-3 pt-2 border-t border-brand-forest/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider font-mono">
                      8-Agent Verification Audit Trace
                    </h4>
                    <p className="text-[11px] text-brand-charcoal/60">
                      Independent specialized agents that inspected this application.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    8/8 Succeeded
                  </Badge>
                </div>

                <div className="space-y-2">
                  {agentExecutionTraces.map((trace, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-brand-forest/10 hover:border-brand-forest/30 transition-all text-xs"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedAgentIndex(expandedAgentIndex === idx ? null : idx)}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <strong className="text-brand-charcoal">{trace.name}</strong>
                          <span className="text-[10px] text-brand-charcoal/50 font-mono">({trace.role})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-brand-charcoal/50">{trace.durationMs}ms</span>
                          {expandedAgentIndex === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {expandedAgentIndex === idx && (
                        <div className="mt-2.5 pt-2.5 border-t border-brand-forest/10 space-y-1 text-[11px] text-brand-charcoal/70 animate-in fade-in duration-150">
                          <p><strong>Assignment:</strong> {trace.task}</p>
                          <p><strong>Audit Finding:</strong> {trace.findings}</p>
                          <p className="text-[10px] font-mono text-brand-charcoal/50"><strong>Automated Tool Invocations:</strong> {trace.toolCalls.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: DECISION, COVENANTS & BLOCKCHAIN SANCTION               */}
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
                  : `Decline record logged with statutory reason code. Notice dispatched to borrower with counterfactual recourse coaching.`}
              </p>
              <Button variant="outline" size="sm" onClick={() => setDecisionOutcome('PENDING')}>
                Reopen Worksheet
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Facility Calibration (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Quai Blockchain Trust Anchor Card */}
                <QuaiAnchorCard
                  applicationId={application.id}
                  vitalityScore={application.acieScore}
                  scoreBand={application.scoreBand}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-display font-bold">
                      Underwriter Facility Calibration
                    </CardTitle>
                    <p className="text-xs text-brand-charcoal/60">
                      Credit officer retains full discretionary authority to adjust facility limit and stipulate covenants.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Haircut Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-brand-charcoal">Limit Haircut Adjustment</span>
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

                    {/* Mandatory Covenants */}
                    <div className="space-y-2 pt-2 border-t border-brand-forest/10">
                      <span className="text-xs font-semibold text-brand-charcoal block">Mandatory Covenants</span>
                      <div className="space-y-2 text-xs text-brand-charcoal/80">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-brand-forest" />
                          <span>Mandatory UPI AutoPay evening sweep (₹{Math.round((recommendedAmount * 1.14) / application.tenorDays)}/day).</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="accent-brand-forest" />
                          <span>Continuous Account Aggregator read token active for tenor duration.</span>
                        </label>
                      </div>
                    </div>

                    {/* Credit Note */}
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
                    <span className="text-[10px] uppercase font-mono text-emerald-300 block">Final Human Decision</span>
                    <h4 className="font-display font-bold text-lg text-white mt-0.5">Sanction Authority</h4>
                  </div>

                  <div className="space-y-2 text-xs text-white/80">
                    <div className="flex justify-between">
                      <span>Applicant:</span>
                      <strong className="text-white">{application.businessName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommended Amount:</span>
                      <strong className="text-emerald-300 font-mono font-bold">{formatINR(recommendedAmount)}</strong>
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
                      onClick={() => {
                        setPendingDecisionAction('APPROVE');
                        setIsConfirmModalOpen(true);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-display font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Sanction Letter</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setPendingDecisionAction('DECLINE');
                        setIsConfirmModalOpen(true);
                      }}
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

          {/* Decision History & Committee Audit Log */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Decision History & Immutable Committee Audit Trail
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/65 mt-0.5">
                    Chronological record of underwriter reviews, limit adjustments, and state machine transitions.
                  </p>
                </div>
                <Badge variant="mint" className="text-xs font-mono">
                  Audit Verifiable
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-forest/20 text-xs">
                
                {/* Event 1 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <strong className="text-brand-charcoal">Digital Account Aggregator Consent Granted</strong>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">21 Nov 2026, 09:12 AM</span>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                    Borrower completed Setu/Sahamati OTP authentication linking State Bank of India current account.
                  </p>
                </div>

                {/* Event 2 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <strong className="text-brand-charcoal">3-Way Cross-Stream Triangulation Passed (95.8% Match)</strong>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">21 Nov 2026, 09:14 AM</span>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                    Engine reconciled 428 bank credits, GSTR-3B filings, and 184 PhonePe QR daily settlements with 0 unverified claims.
                  </p>
                </div>

                {/* Event 3 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <strong className="text-brand-charcoal">Vitality Score Dossier Formulated (768 / 900 Prime Band)</strong>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">21 Nov 2026, 09:15 AM</span>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                    Recommended indicative facility ceiling: ₹1,50,000. Cash Available for Repayment: ₹78,500/month.
                  </p>
                </div>

                {/* Event 4 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-forest ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <strong className="text-brand-charcoal">Underwriter Inspection Opened</strong>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">21 Nov 2026, 09:18 AM</span>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                    Assigned Credit Officer: Vikram Deshmukh. Haircut calibrated at {haircutPercentage}%. Mandatory daily sweep covenant attached.
                  </p>
                </div>

                {decisionOutcome !== 'PENDING' && (
                  <div className="relative">
                    <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      decisionOutcome === 'APPROVED' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`} />
                    <div className="flex items-center justify-between">
                      <strong className={decisionOutcome === 'APPROVED' ? 'text-emerald-800' : 'text-rose-800'}>
                        {decisionOutcome === 'APPROVED' ? 'Loan Sanction Formally Recorded' : 'Loan Application Declined'}
                      </strong>
                      <span className="text-[10px] font-mono text-brand-charcoal/50">Just now</span>
                    </div>
                    <p className="text-[11px] text-brand-charcoal/70 mt-0.5">
                      {decisionOutcome === 'APPROVED'
                        ? `Sanction letter generated for ${formatINR(recommendedAmount)}. Cryptographic hash anchored on Quai Network block.`
                        : `Formal decline notice issued with counterfactual recourse advice.`}
                    </p>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Interactive Decision Confirmation Dialog */}
      {isConfirmModalOpen && pendingDecisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-brand-forest/20 shadow-elevated p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-brand-forest/10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                pendingDecisionAction === 'APPROVE' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {pendingDecisionAction === 'APPROVE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-brand-charcoal">
                  {pendingDecisionAction === 'APPROVE' ? 'Confirm Loan Sanction' : 'Confirm Application Decline'}
                </h3>
                <span className="text-xs text-brand-charcoal/60 block">
                  {application.businessName}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-charcoal/65">Requested Amount:</span>
                <strong className="text-brand-charcoal font-mono">{formatINR(application.requestedAmount)}</strong>
              </div>
              {pendingDecisionAction === 'APPROVE' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/65">Sanctioned Amount ({haircutPercentage}% haircut):</span>
                    <strong className="text-emerald-800 font-mono font-bold">{formatINR(recommendedAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/65">Daily UPI Sweep Covenant:</span>
                    <strong className="text-brand-forest font-mono">₹{Math.round((recommendedAmount * 1.14) / application.tenorDays)} / day</strong>
                  </div>
                </>
              )}
              <div className="pt-2 border-t border-brand-forest/10 text-[11px] text-brand-charcoal/70">
                <span>Credit Committee Note:</span>
                <p className="italic mt-0.5 font-sans">"{underwriterNotes}"</p>
              </div>
            </div>

            <p className="text-[11px] text-brand-charcoal/60 leading-relaxed">
              {pendingDecisionAction === 'APPROVE'
                ? 'Confirming will issue the formal digital sanction letter, trigger UPI AutoPay mandate authorization, and write the immutable audit seal to the Quai blockchain.'
                : 'Confirming will register a formal statutory decline code and notify the borrower with plain-English coaching on how to qualify in the future.'}
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-brand-forest/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setPendingDecisionAction(null);
                }}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (pendingDecisionAction) {
                    handleDecision(pendingDecisionAction);
                  }
                  setIsConfirmModalOpen(false);
                  setPendingDecisionAction(null);
                }}
                className={`rounded-full text-xs font-semibold px-5 ${
                  pendingDecisionAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {pendingDecisionAction === 'APPROVE' ? 'Confirm & Issue Sanction' : 'Confirm Decline'}
              </Button>
            </div>
          </div>
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
              The borrower will receive an immediate SMS/WhatsApp notification to upload the requested file.
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
