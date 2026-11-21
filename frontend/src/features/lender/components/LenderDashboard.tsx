import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  FileText,
  Filter,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Check,
  Search,
  Zap,
  Info
} from 'lucide-react';
import { mockPipelineApplications, PipelineItem } from '../data/mockPipeline';

interface LenderDashboardProps {
  onSelectApplication: (id: string) => void;
  onNavigateToPipeline: () => void;
}

export type ApplicationPriorityCategory = 
  | 'ALL'
  | 'READY_FOR_REVIEW'
  | 'MORE_INFO_NEEDED'
  | 'REQUIRES_ATTENTION'
  | 'UNDER_ASSESSMENT'
  | 'DECISION_RECORDED';

export const LenderDashboard: React.FC<LenderDashboardProps> = ({
  onSelectApplication,
  onNavigateToPipeline,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ApplicationPriorityCategory>('READY_FOR_REVIEW');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showHealthGuideModal, setShowHealthGuideModal] = useState(false);

  // Categorize applications for intuitive, non-jargon triage
  const categorizedApps = useMemo(() => {
    return {
      READY_FOR_REVIEW: mockPipelineApplications.filter(
        (a) => a.status === 'UNDERWRITING_REVIEW' && a.riskTier === 'LOW'
      ),
      MORE_INFO_NEEDED: mockPipelineApplications.filter(
        (a) => a.status === 'SUBMITTED'
      ),
      REQUIRES_ATTENTION: mockPipelineApplications.filter(
        (a) => a.riskTier === 'ELEVATED' || a.riskTier === 'HIGH' || a.congruenceScore < 90
      ),
      UNDER_ASSESSMENT: mockPipelineApplications.filter(
        (a) => a.status === 'SUBMITTED' || (a.status === 'UNDERWRITING_REVIEW' && a.congruenceScore >= 90 && a.riskTier === 'MODERATE')
      ),
      DECISION_RECORDED: mockPipelineApplications.filter(
        (a) => a.status === 'SANCTIONED' || a.status === 'CONDITIONALLY_APPROVED' || a.status === 'DECLINED'
      ),
    };
  }, []);

  const activeCategoryApps = useMemo(() => {
    if (selectedCategory === 'ALL') return mockPipelineApplications;
    return categorizedApps[selectedCategory] || [];
  }, [selectedCategory, categorizedApps]);

  const priorityUrgentCount = categorizedApps.REQUIRES_ATTENTION.length;
  const readyCount = categorizedApps.READY_FOR_REVIEW.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* 1. THREE-QUESTION OPERATIONAL BANNER                           */}
      {/* What is happening? Why does it matter? What should I do next?  */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft border border-brand-forest/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                Lending Command Overview
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Underwriting & Decision Desk
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 h-9 rounded-full"
              title="Toggle advanced statistical benchmarks"
            >
              <Info className="w-3.5 h-3.5 text-emerald-300" />
              <span>{showTechnicalDetails ? 'Simple View' : 'Technical Details'}</span>
            </Button>

            <Button 
              variant="accent" 
              size="pill" 
              onClick={onNavigateToPipeline}
              className="gap-2 h-9 text-xs font-semibold shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Complete Queue ({mockPipelineApplications.length} Files)</span>
            </Button>
          </div>
        </div>

        {/* The 3 Core Answers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block mb-1">
              1. What is happening?
            </span>
            <p className="text-white/90 leading-relaxed">
              <strong>42 micro & small business applications</strong> are currently in the queue, supported by verified Account Aggregator and GST cash-flow records.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold block mb-1">
              2. Why does it matter?
            </span>
            <p className="text-white/90 leading-relaxed">
              <strong>{readyCount} files</strong> meet all prime requirements for immediate sanction. <strong>{priorityUrgentCount} files</strong> require underwriter attention for variance review.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold block mb-1">
              3. What should I do next?
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedCategory('READY_FOR_REVIEW');
                  const first = categorizedApps.READY_FOR_REVIEW[0];
                  if (first) onSelectApplication(first.id);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-brand-forest font-bold text-xs py-1 px-3 h-7 rounded-lg"
              >
                Review Top Prime File
              </Button>
              <span className="text-[11px] text-white/75">
                or select a category below.
              </span>
            </div>
          </div>
        </div>

        {/* Optional Advanced Technical Drawer on Demand */}
        {showTechnicalDetails && (
          <div className="p-4 rounded-2xl bg-brand-charcoal/80 border border-emerald-500/30 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-300 font-bold text-[11px] uppercase">
                Advanced Technical Diagnostics (On Demand)
              </span>
              <Badge variant="mint-pill" className="text-[9px]">Engine Telemetry</Badge>
            </div>
            <p className="text-white/80 leading-relaxed text-[11px]">
              Engine Latency: <strong>142ms</strong> · Model Inference Version: <strong>ACIE-v2.4 (XGBoost + SHAP TreeExplainer)</strong> · 
              Cross-Stream Triangulation Formula: <code>Min(AA_Deposits, GST_Supplies * 0.95, UPI_Settlements * 1.05)</code> · 
              e-NACH Mandate Gateway: <strong>100% active</strong> on NPCI rails.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. PLAIN-LANGUAGE OVERVIEW METRIC CARDS                        */}
      {/* Understandable labels with descriptive subtitles               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Pending Reviews */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">
                Applications awaiting your review
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Awaiting action" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-forest mt-1">
              42 Files
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Businesses waiting for your credit decision.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-forest/10 font-mono">
              <span className="text-brand-charcoal/60">Urgent review deadline:</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">6 files</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Loans Approved Today */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">
                Loans approved today
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Approved today" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-emerald-800 mt-1">
              14 Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Sanctioned and dispatched for borrower signature.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-forest/10 font-mono">
              <span className="text-brand-charcoal/60">Auto-debit setup:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">100% complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Total Disbursed Volume */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">
                Total loan amount disbursed
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-forest" title="Disbursed volume" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-charcoal mt-1">
              ₹1.84 Cr
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Active working capital deployed to MSMEs this month.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-forest/10 font-mono">
              <span className="text-brand-charcoal/60">Average loan size:</span>
              <span className="font-bold text-brand-charcoal">₹1,31,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Average TAT */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">
                Average application review time
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-terracotta" title="Average turnaround time" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-terracotta mt-1">
              4.2 Mins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Time from customer consent to lender sanction.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-brand-forest/10 font-mono">
              <span className="text-brand-charcoal/60">Target turnaround:</span>
              <span className="font-bold text-emerald-800">&lt; 5.0 mins (Meeting goal)</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ============================================================== */}
      {/* 3. BUSINESS FINANCIAL OVERVIEW EXPLAINER                       */}
      {/* The 5 core pillars of MSME financial health                    */}
      {/* ============================================================== */}
      <Card className="border-brand-forest/15 shadow-soft bg-gradient-to-r from-brand-ivory to-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-forest" />
                <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                  Business Financial Overview — The 5 Core Lending Pillars
                </CardTitle>
              </div>
              <p className="text-xs text-brand-charcoal/70 mt-0.5">
                How UDYOGA evaluates creditworthiness without audited balance sheets or property collateral.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHealthGuideModal(true)}
              className="text-xs text-brand-forest border-brand-forest/20 hover:bg-brand-forest/5 h-8 gap-1.5 rounded-full"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How We Calculate This</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-brand-forest block">
                1. Revenue
              </span>
              <strong className="text-sm font-semibold text-brand-charcoal block">
                How much the business earns
              </strong>
              <p className="text-[11px] text-brand-charcoal/65 leading-relaxed">
                Calculated from bank account deposits, outward GST invoices, and merchant QR collections.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-brand-terracotta block">
                2. Expenses
              </span>
              <strong className="text-sm font-semibold text-brand-charcoal block">
                How much it spends
              </strong>
              <p className="text-[11px] text-brand-charcoal/65 leading-relaxed">
                Vendor raw material payments, commercial rent, utilities, and operating overheads.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 block">
                3. Cash Flow
              </span>
              <strong className="text-sm font-semibold text-brand-charcoal block">
                Money remaining after expenses
              </strong>
              <p className="text-[11px] text-brand-charcoal/65 leading-relaxed">
                True uncommitted operational buffer available to absorb business shocks and seasonality.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-blue-800 block">
                4. Existing Loans
              </span>
              <strong className="text-sm font-semibold text-brand-charcoal block">
                Current repayment obligations
              </strong>
              <p className="text-[11px] text-brand-charcoal/65 leading-relaxed">
                Active monthly EMIs, debit mandate track record, and return bounce history over 90 days.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-purple-800 block">
                5. Repayment Capacity
              </span>
              <strong className="text-sm font-semibold text-brand-charcoal block">
                Ability to manage another loan
              </strong>
              <p className="text-[11px] text-brand-charcoal/65 leading-relaxed">
                Maximum safe daily or monthly repayment that does not strain working capital.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 4. INTUITIVE APPLICATION PRIORITY TRIAGE                        */}
      {/* 5 Clear Categories with readable labels (not just colors)       */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-display font-bold text-brand-charcoal">
              Action Queue by Priority
            </h3>
            <p className="text-xs text-brand-charcoal/65">
              Select a category to inspect applications grouped by their required action.
            </p>
          </div>

          <span className="text-xs font-mono text-brand-charcoal/50">
            Showing {activeCategoryApps.length} applications
          </span>
        </div>

        {/* 5 Clear Priority Category Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-brand-charcoal/5 rounded-2xl">
          
          <button
            onClick={() => setSelectedCategory('READY_FOR_REVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'READY_FOR_REVIEW'
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {categorizedApps.READY_FOR_REVIEW.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('REQUIRES_ATTENTION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'REQUIRES_ATTENTION'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Requires Attention</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {categorizedApps.REQUIRES_ATTENTION.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('MORE_INFO_NEEDED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'MORE_INFO_NEEDED'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
            <span>More Information Needed</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {categorizedApps.MORE_INFO_NEEDED.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('UNDER_ASSESSMENT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'UNDER_ASSESSMENT'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>Under Assessment</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {categorizedApps.UNDER_ASSESSMENT.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('DECISION_RECORDED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'DECISION_RECORDED'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
            <span>Decision Recorded</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {categorizedApps.DECISION_RECORDED.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'ALL'
                ? 'bg-brand-charcoal text-white shadow-sm'
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/60'
            }`}
          >
            <span>All Applications</span>
            <span className="px-1.5 py-0.2 rounded-full bg-brand-charcoal/10 text-[10px] font-mono">
              {mockPipelineApplications.length}
            </span>
          </button>

        </div>

        {/* Applications List for Active Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCategoryApps.map((item) => (
            <Card 
              key={item.id}
              className="hover:shadow-card hover:border-brand-forest/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              onClick={() => onSelectApplication(item.id)}
            >
              <CardHeader className="pb-3 border-b border-brand-forest/10">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-charcoal group-hover:text-brand-forest transition-colors">
                      {item.businessName}
                    </h4>
                    <span className="text-xs text-brand-charcoal/60 block mt-0.5">
                      {item.applicantName} · {item.city}, {item.state}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-forest/10 text-brand-forest shrink-0">
                    {item.id}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="py-3 space-y-3">
                {/* Financial figures */}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Requested Loan</span>
                    <strong className="text-base font-mono font-bold text-brand-forest">
                      {formatINR(item.requestedAmount)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-brand-charcoal/50 block">Repayment Method</span>
                    <span className="text-xs font-medium text-brand-charcoal">
                      {item.repaymentFrequency === 'DAILY_SWEEP' ? 'Daily UPI Auto-Sweep' : 'Monthly Bank EMI'}
                    </span>
                  </div>
                </div>

                {/* Plain-Language Status & Health Indicators */}
                <div className="p-2.5 rounded-xl bg-brand-ivory/60 border border-brand-forest/10 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-charcoal/70">Financial Vitality:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {item.acieScore} / 900 ({item.riskTier === 'LOW' ? 'High Health' : item.riskTier === 'MODERATE' ? 'Moderate Health' : 'Review Needed'})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-charcoal/70">Data Agreement:</span>
                    <span className="font-mono font-semibold text-brand-charcoal">
                      {item.congruenceScore}% cross-match
                    </span>
                  </div>
                </div>

                {/* Risk Explanation / Why it Matters */}
                {item.riskTier === 'ELEVATED' || item.riskTier === 'HIGH' ? (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Why this needs attention:</strong> GST sales and bank deposits show a variance &gt; 10%. Verify customer collection timing.
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Why this is ready:</strong> Bank AA inflows match outward invoices cleanly. 0 loan bounces over 90 days.
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="p-3 bg-brand-forest/[0.02] border-t border-brand-forest/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-brand-charcoal/60">
                  Sector: {item.sector}
                </span>
                <span className="text-brand-forest font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Review File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. HOW WE CALCULATE FINANCIAL HEALTH MODAL                    */}
      {/* Contextual guidance on demand                                  */}
      {/* ============================================================== */}
      {showHealthGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated border border-brand-forest/20 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-forest" />
                <h3 className="text-xl font-display font-bold text-brand-charcoal">
                  How UDYOGA Calculates Business Financial Health
                </h3>
              </div>
              <button 
                onClick={() => setShowHealthGuideModal(false)}
                className="text-brand-charcoal/50 hover:text-brand-charcoal text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-brand-charcoal/80 leading-relaxed">
              <p>
                Traditional banks require 3 years of audited profit-and-loss statements and property titles. UDYOGA replaces this requirement by reading verifiable digital transaction trails with explicit borrower consent:
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <strong className="text-sm text-brand-forest block font-semibold mb-0.5">
                    1. Triangulation Congruence
                  </strong>
                  <p>
                    We cross-check three independent data streams: <strong>Bank deposits</strong> (via Sahamati Account Aggregator), <strong>Taxable supplies</strong> (via GSTN), and <strong>Daily retail sweeps</strong> (via NPCI UPI). If all three agree within 10%, revenue is independently confirmed.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <strong className="text-sm text-brand-forest block font-semibold mb-0.5">
                    2. Cash Available for Loan Repayment
                  </strong>
                  <p>
                    We subtract total operational expenditures and existing loan payments from monthly revenue. The remaining surplus indicates exactly how much the business can afford to repay without defaulting.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10">
                  <strong className="text-sm text-brand-forest block font-semibold mb-0.5">
                    3. Stress Testing & Seasonality
                  </strong>
                  <p>
                    We simulate unexpected revenue drops (e.g. 15% festival downtime or 30-day payment delays by major buyers) to ensure the proposed repayment schedule remains safe under real-world conditions.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowHealthGuideModal(false)}
                className="rounded-full px-6 text-xs"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
