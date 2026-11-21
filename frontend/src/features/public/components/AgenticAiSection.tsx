import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  TrendingUp,
  Search,
  Activity,
  Sliders,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  LineChart,
  ShieldAlert,
  ChevronRight,
  Database,
  BarChart3,
  Scale
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface AgentSpec {
  id: string;
  name: string;
  shortName: string;
  stageNumber: number;
  role: string;
  headline: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
  borderClass: string;
  informationExamined: string[];
  assessmentOutput: string[];
  sampleInsight: string;
  coreTag: string;
}

export const AGENT_SPECS: AgentSpec[] = [
  {
    id: 'orchestrator',
    name: 'Underwriting Orchestrator',
    shortName: 'Orchestrator',
    stageNumber: 1,
    role: 'Central Workflow Coordinator',
    headline: 'Coordinates the assessment, monitors progress, and synthesises findings into an underwriting memo.',
    icon: Brain,
    color: 'text-brand-forest',
    accentBg: 'bg-brand-forest/10',
    borderClass: 'border-brand-forest/30',
    coreTag: 'Workflow Engine',
    informationExamined: [
      'Requested loan amount, purpose, and term',
      'Available data feeds (Bank AA, GST, UPI, Cashbook)',
      'Enterprise sector benchmarks & geography tier',
      'Real-time health of external DPI connectors'
    ],
    assessmentOutput: [
      'Dynamic multi-agent execution Directed Acyclic Graph (DAG)',
      'Intermediate task status & execution latency logs',
      'Synthesised Credit Appraisal Memo for credit underwriters',
      'Consolidated risk assessment summary'
    ],
    sampleInsight: 'Coordinated 7 concurrent specialist tasks. Synthesised 321 transaction signals into a unified lender review file in under 4 minutes.'
  },
  {
    id: 'financial_analyst',
    name: 'Financial Analyst',
    shortName: 'Financial Analyst',
    stageNumber: 2,
    role: 'Cash-Flow & Working Capital Specialist',
    headline: 'Examines revenue, expenses, liquidity runway, and timing gaps between payables and receivables.',
    icon: TrendingUp,
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    coreTag: 'Cash-Flow Intelligence',
    informationExamined: [
      'Daily and monthly transaction inflows & outflows (90–360 days)',
      'Timing gaps between supplier payments and customer collections',
      'Fixed operating overheads vs. variable supply costs',
      'Average monthly net operational surplus'
    ],
    assessmentOutput: [
      'Net operational cash-flow curve across 90 operating days',
      'Estimated liquidity runway in operating days',
      'Working capital replenishment gap analysis',
      'Seasonality indices across business quarters'
    ],
    sampleInsight: 'Identified a predictable 14-day receivable collection delay in mid-month, compensated by a consistent ₹42,000 month-end cash surplus.'
  },
  {
    id: 'evidence_verification',
    name: 'Evidence Verification Agent',
    shortName: 'Evidence Verification',
    stageNumber: 1,
    role: 'Data Provenance & Triangulation Specialist',
    headline: 'Cross-validates banking, tax filings, and digital payments to verify consistency and authenticity.',
    icon: ShieldCheck,
    color: 'text-brand-forest',
    accentBg: 'bg-brand-forest/10',
    borderClass: 'border-brand-forest/30',
    coreTag: 'Data Provenance',
    informationExamined: [
      'Account Aggregator native XML bank transaction streams',
      'GSTN filed monthly returns (GSTR-1 outward and GSTR-3B summary)',
      'NPCI UPI merchant settlement webhooks',
      'Udyam registration and Shop & Establishment certificate metadata'
    ],
    assessmentOutput: [
      '3-Way Triangulation Congruence Index (0–100%)',
      'Provenance categorization (Verified, Source-Labelled, Self-Reported)',
      'Discrepancy ledger between declared turnover and real bank deposits',
      'Missing data accommodation matrix (fair handling of micro-enterprises)'
    ],
    sampleInsight: '94.2% congruence confirmed between GSTR-3B filings (₹2.85L/mo) and direct UPI merchant settlements. Zero document manipulation detected.'
  },
  {
    id: 'fraud_investigation',
    name: 'Fraud Investigation Agent',
    shortName: 'Fraud Forensics',
    stageNumber: 3,
    role: 'Transaction Graph & Risk Specialist',
    headline: 'Detects circular money looping, artificial turnover spikes, and counterparty concentration risks.',
    icon: Search,
    color: 'text-brand-terracotta',
    accentBg: 'bg-brand-terracotta/10',
    borderClass: 'border-brand-terracotta/30',
    coreTag: 'Forensic Detection',
    informationExamined: [
      'Counterparty identity strings, IFSC codes, and UPI VPAs',
      'Turnover acceleration in the 14 days prior to loan application',
      'Fund recirculation patterns (Party A → Party B → Party A)',
      'Concentration of revenue among unregistered single entities'
    ],
    assessmentOutput: [
      'Fraud Risk Tier rating (Low / Elevated / High Risk)',
      'Circular transaction graph visualization with flagged entities',
      'Abnormal volume spike detector report',
      'Counterparty dependency distribution chart'
    ],
    sampleInsight: 'Transaction network analysis confirmed no round-trip fund cycling. Largest counterparty represents 18.4% of inflows, well within safety thresholds.'
  },
  {
    id: 'business_vitality',
    name: 'Business Vitality Agent',
    shortName: 'Business Vitality',
    stageNumber: 2,
    role: 'Operational Rhythm & Customer Stability Specialist',
    headline: 'Measures daily sales consistency, repeat customer rates, and recovery speed during market dips.',
    icon: Activity,
    color: 'text-amber-800',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    coreTag: 'Operational Momentum',
    informationExamined: [
      'Frequency of daily sales transactions over 180 days',
      'Customer return and repeat transaction ratios',
      'Weekend versus weekday sales patterns',
      'Historical bounce-back duration after localized economic dips'
    ],
    assessmentOutput: [
      'Business Vitality Index (0–900 scale)',
      'Daily sales consistency cadence score',
      'Customer retention & transaction velocity indicators',
      'Operational resilience and market longevity tier'
    ],
    sampleInsight: 'Maintains an average of 42 transactions per day with a 68% repeat customer rate. Business recovered within 5 days of festive stock replenishment.'
  },
  {
    id: 'resilience_simulation',
    name: 'Resilience Simulation Agent',
    shortName: 'Resilience Simulator',
    stageNumber: 4,
    role: 'Adverse Stress-Testing Specialist',
    headline: 'Models how the business handles revenue drops, customer payment delays, and sudden cost increases.',
    icon: Sliders,
    color: 'text-brand-forest',
    accentBg: 'bg-brand-forest/10',
    borderClass: 'border-brand-forest/30',
    coreTag: 'Cash-Flow Twin',
    informationExamined: [
      'Historical minimum cash balances and operating cushion',
      'Cost structure breakdown (Fixed operational vs. variable procurement)',
      'Scenario A: 15% drop in monthly revenue',
      'Scenario B: 30-day delay in customer receivables',
      'Scenario C: 10% increase in supplier or raw material costs'
    ],
    assessmentOutput: [
      'Stressed Debt Service Coverage Ratio (Stressed DSCR)',
      'Days of cash cushion remaining under economic shock scenarios',
      'Break-even revenue floor required to service daily operations',
      'Maximum safe borrowing threshold during market downturns'
    ],
    sampleInsight: 'Under a simulated 15% revenue drop, business maintains a DSCR of 1.48x, leaving ₹18,500 monthly cushion after debt service.'
  },
  {
    id: 'underwriting_agent',
    name: 'Underwriting Agent',
    shortName: 'Underwriting Agent',
    stageNumber: 4,
    role: 'Indicative Affordability & Loan Structuring Specialist',
    headline: 'Calculates safe borrowing limits and designs repayment schedules that fit the enterprise cash rhythm.',
    icon: Scale,
    color: 'text-emerald-800',
    accentBg: 'bg-emerald-600/10',
    borderClass: 'border-emerald-600/30',
    coreTag: 'Credit Structuring',
    informationExamined: [
      'Net unencumbered operating cash flow after all business expenses',
      'Existing debt service obligations and recurring EMI outflows',
      'Haircuts applied for self-reported vs. verified data points',
      'Repayment structure preference (Daily sweep vs. Fixed monthly EMI)'
    ],
    assessmentOutput: [
      'Recommended credit facility limit and safe borrowing ceiling',
      'Maximum recommended monthly or daily repayment amount',
      'Optimal repayment cadence (e.g. 1.8% daily UPI sweep vs ₹8,500 EMI)',
      'Comprehensive underwriter decision worksheet with covenant terms'
    ],
    sampleInsight: 'Recommends a ₹3,50,000 facility with a dynamic 2.1% daily UPI sweep, preventing debt strain during lower-volume weekday trading.'
  },
  {
    id: 'explanation_passport',
    name: 'Explanation & Passport Agent',
    shortName: 'Explanation & Passport',
    stageNumber: 5,
    role: 'Explainable AI & Portable Financial Identity Specialist',
    headline: 'Translates findings into plain English, outlines steps to qualify for more credit, and issues a Financial Passport.',
    icon: FileCheck2,
    color: 'text-brand-forest',
    accentBg: 'bg-brand-forest/10',
    borderClass: 'border-brand-forest/30',
    coreTag: 'Explainable AI',
    informationExamined: [
      'Top positive and negative factor drivers across all 7 agent findings',
      'Underwriter decision rules and regulatory explainability standards',
      'Actionable counterfactual thresholds (what specific improvements unlock more credit)',
      'Cryptographic hash verification of the final assessment dossier'
    ],
    assessmentOutput: [
      'Plain-language borrower explanation memo free from technical jargon',
      'Factor contribution breakdown (key strengths & improvement areas)',
      'Actionable "Path-to-Yes" guide with concrete operational targets',
      'Exportable, tamper-evident Business Financial Passport with QR verification'
    ],
    sampleInsight: 'Generated clear assessment showing how maintaining a ₹20,000 minimum balance for 60 days can unlock an additional ₹1,00,000 in credit line.'
  }
];

export interface StageSpec {
  stage: number;
  name: string;
  shortDesc: string;
  agents: string[];
  focus: string;
}

export const STAGES: StageSpec[] = [
  {
    stage: 1,
    name: 'Organise & Verify',
    shortDesc: 'Gather documents and verify authenticity through digital public infrastructure.',
    agents: ['orchestrator', 'evidence_verification'],
    focus: 'Validates data provenance, identifies missing records gracefully, and confirms document authenticity.'
  },
  {
    stage: 2,
    name: 'Understand the Business',
    shortDesc: 'Examine daily cash flows, operating margins, customer return rates, and sales cadence.',
    agents: ['financial_analyst', 'business_vitality'],
    focus: 'Reconstructs true operating health from real transaction rhythms rather than static annual balance sheets.'
  },
  {
    stage: 3,
    name: 'Investigate Transactions',
    shortDesc: 'Examine counterparty networks, detect circular money loops, and evaluate supplier dependencies.',
    agents: ['fraud_investigation'],
    focus: 'Builds a complete counterparty graph to verify that declared turnover represents legitimate commerce.'
  },
  {
    stage: 4,
    name: 'Test Financial Resilience',
    shortDesc: 'Simulate revenue shocks, model customer payment delays, and determine safe borrowing capacity.',
    agents: ['resilience_simulation', 'underwriting_agent'],
    focus: 'Ensures the enterprise can comfortably service debt even during sudden local or industry slowdowns.'
  },
  {
    stage: 5,
    name: 'Explain the Assessment',
    shortDesc: 'Translate findings into plain language, outline concrete Path-to-Yes steps, and generate the Financial Passport.',
    agents: ['explanation_passport', 'orchestrator'],
    focus: 'Provides transparent decision drivers and an exportable, tamper-evident financial profile for lenders.'
  }
];

export const AgenticAiSection: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [activeStage, setActiveStage] = useState<number>(1);

  const selectedAgent = AGENT_SPECS.find((a) => a.id === selectedAgentId) || AGENT_SPECS[0];
  const currentStageSpec = STAGES.find((s) => s.stage === activeStage) || STAGES[0];

  const handleSelectStage = (stageNum: number) => {
    setActiveStage(stageNum);
    const stage = STAGES.find((s) => s.stage === stageNum);
    if (stage && stage.agents.length > 0) {
      setSelectedAgentId(stage.agents[0]);
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    const agent = AGENT_SPECS.find((a) => a.id === agentId);
    if (agent) {
      setActiveStage(agent.stageNumber);
    }
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden text-brand-charcoal">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-ivory via-white to-brand-ivory -z-10" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(#173F35 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ========================================================= */}
        {/* SECTION HEADER                                            */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="mint" className="text-xs uppercase font-mono tracking-widest px-3 py-1 font-bold">
            AGENTIC AI
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-brand-charcoal tracking-tight leading-tight">
            Eight specialists. One clearer financial picture.
          </h2>
          <p className="text-base sm:text-lg text-brand-charcoal/75 leading-relaxed">
            UDYOGA coordinates specialised AI agents to understand business finances, examine evidence,
            investigate unusual transaction patterns and test repayment capacity. Their findings are
            combined into an assessment that lenders can review and understand.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 5 ASSESSMENT STAGES (INTERACTIVE TABS)                     */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-forest/10">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
              Assessment Workflow
            </span>
            <span className="text-xs text-brand-charcoal/60 hidden sm:inline">
              Click a stage to explore the specialist agents involved
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {STAGES.map((s) => {
              const isActive = s.stage === activeStage;
              return (
                <button
                  key={s.stage}
                  onClick={() => handleSelectStage(s.stage)}
                  className={`relative p-3.5 rounded-2xl text-left transition-all border ${
                    isActive
                      ? 'bg-brand-forest text-white border-brand-forest shadow-md scale-[1.02]'
                      : 'bg-white/80 hover:bg-white text-brand-charcoal border-brand-forest/15 hover:border-brand-forest/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-forest/10 text-brand-forest'
                      }`}
                    >
                      Stage {s.stage}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-display font-bold leading-tight">
                    {s.name}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Current Stage Context Banner */}
          <div className="p-4 rounded-2xl bg-brand-forest/5 border border-brand-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-brand-forest font-semibold block text-sm">
                Stage {currentStageSpec.stage}: {currentStageSpec.name}
              </strong>
              <p className="text-brand-charcoal/75 leading-relaxed max-w-3xl">
                {currentStageSpec.shortDesc} {currentStageSpec.focus}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-brand-charcoal/60 font-medium">Assigned Specialists:</span>
              {currentStageSpec.agents.map((agId) => {
                const ag = AGENT_SPECS.find((a) => a.id === agId);
                if (!ag) return null;
                return (
                  <button
                    key={agId}
                    onClick={() => setSelectedAgentId(agId)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      selectedAgentId === agId
                        ? 'bg-brand-forest text-white shadow-xs'
                        : 'bg-white border border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10'
                    }`}
                  >
                    {ag.shortName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE MULTI-AGENT WORKFLOW VISUALIZER & INSPECTION  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: 8-Agent Architecture Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-forest/15 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-forest/10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-forest font-bold">
                  Coordinated Agent Network
                </span>
                <h3 className="text-lg font-display font-bold text-brand-charcoal">
                  Orchestrated Multi-Agent Architecture
                </h3>
              </div>
              <Badge variant="outline" className="text-xs border-brand-forest/20 text-brand-forest font-mono">
                8 Specialist Roles
              </Badge>
            </div>

            {/* Central Orchestrator Hero Card */}
            <div
              onClick={() => handleSelectAgent('orchestrator')}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                selectedAgentId === 'orchestrator'
                  ? 'bg-brand-forest text-white border-brand-forest shadow-md ring-2 ring-brand-forest/20'
                  : 'bg-brand-forest/5 hover:bg-brand-forest/10 border-brand-forest/20 text-brand-charcoal'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedAgentId === 'orchestrator'
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-forest text-white'
                    }`}
                  >
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base leading-tight">
                        Underwriting Orchestrator
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          selectedAgentId === 'orchestrator'
                            ? 'bg-emerald-400 text-brand-forest'
                            : 'bg-brand-forest text-white'
                        }`}
                      >
                        Central Coordinator
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        selectedAgentId === 'orchestrator' ? 'text-white/80' : 'text-brand-charcoal/65'
                      }`}
                    >
                      Assigns tasks, manages dependencies, and compiles the Credit Appraisal Memo.
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    selectedAgentId === 'orchestrator' ? 'rotate-90 text-white' : 'text-brand-charcoal/40'
                  }`}
                />
              </div>
            </div>

            {/* 7 Surrounding Specialist Agents Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-charcoal/50 block font-semibold">
                Specialist Analytical Nodes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AGENT_SPECS.filter((a) => a.id !== 'orchestrator').map((ag) => {
                  const isSelected = selectedAgentId === ag.id;
                  const Icon = ag.icon;
                  const isInActiveStage = currentStageSpec.agents.includes(ag.id);

                  return (
                    <button
                      key={ag.id}
                      onClick={() => handleSelectAgent(ag.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-forest text-white border-brand-forest shadow-sm'
                          : isInActiveStage
                          ? 'bg-brand-forest/5 hover:bg-brand-forest/10 border-brand-forest/30 text-brand-charcoal'
                          : 'bg-white hover:bg-brand-forest/5 border-brand-forest/10 text-brand-charcoal'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : ag.accentBg + ' ' + ag.color
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-display font-bold text-xs truncate">
                            {ag.name}
                          </h5>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-brand-charcoal/5 text-brand-charcoal/60'
                            }`}
                          >
                            Stage {ag.stageNumber}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-brand-charcoal/60'
                          }`}
                        >
                          {ag.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workflow Execution Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-amber-900 font-semibold block">
                  Deterministic Orchestration & Auditability
                </strong>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Agents operate within strict task boundaries. No agent fabricates data or makes
                  autonomous credit approvals. All intermediate outputs are anchored into a
                  cryptographically verifiable audit log.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Detailed Agent Inspection Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-forest/15 shadow-soft p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-brand-forest/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedAgent.accentBg} ${selectedAgent.color} flex items-center justify-center shrink-0`}>
                  {React.createElement(selectedAgent.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] font-mono mb-1">
                    {selectedAgent.coreTag} · Stage {selectedAgent.stageNumber}
                  </Badge>
                  <h3 className="font-display font-bold text-lg text-brand-charcoal leading-tight">
                    {selectedAgent.name}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-brand-charcoal/75 leading-relaxed font-medium">
              {selectedAgent.headline}
            </p>

            {/* Information Examined */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal">
                <Database className="w-3.5 h-3.5 text-brand-forest" />
                <span>Information Examined</span>
              </div>
              <ul className="space-y-1.5 text-xs text-brand-charcoal/75">
                {selectedAgent.informationExamined.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-forest shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assessment Output */}
            <div className="space-y-2 pt-2 border-t border-brand-forest/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Assessment Output</span>
              </div>
              <ul className="space-y-1.5 text-xs text-brand-charcoal/75">
                {selectedAgent.assessmentOutput.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Real Assessment Finding Callout */}
            <div className="p-3.5 rounded-xl bg-brand-forest/5 border border-brand-forest/15 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-brand-forest font-bold block">
                Typical Finding Generated
              </span>
              <p className="text-xs text-brand-charcoal/85 italic leading-relaxed">
                "{selectedAgent.sampleInsight}"
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOUR DIFFERENTIATING CAPABILITY CARDS                     */}
        {/* ========================================================= */}
        <div className="space-y-6 pt-8 border-t border-brand-forest/10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
              Core Financial Intelligence
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
              What sets UDYOGA apart
            </h3>
            <p className="text-xs sm:text-sm text-brand-charcoal/65">
              Moving beyond traditional credit bureau reliance to evaluate genuine business vitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Capability 1: Business Financial DNA */}
            <Card className="border-brand-forest/15 shadow-soft hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="mint" className="text-[10px] font-mono mb-0.5">
                      5-Dimension Intelligence
                    </Badge>
                    <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                      Business Financial DNA
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-brand-charcoal/75 leading-relaxed">
                <p>
                  Instead of reducing an enterprise to a single arbitrary 3-digit score, UDYOGA analyzes
                  five distinct dimensions: <strong>Cash Flow Rhythm</strong>, <strong>Operating Vitality</strong>,{' '}
                  <strong>Evidence Quality</strong>, <strong>Resilience Buffer</strong>, and{' '}
                  <strong>Affordability Index</strong>.
                </p>
                <div className="p-3 rounded-xl bg-brand-forest/5 border border-brand-forest/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-brand-forest block">
                    The 5 Core Dimensions
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>• Cash Flow Rhythm</div>
                    <div>• Evidence Provenance</div>
                    <div>• Operating Vitality</div>
                    <div>• Resilience Buffer</div>
                    <div className="col-span-2">• Affordability Index (Safe Margin)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capability 2: Evidence & Transaction Intelligence */}
            <Card className="border-brand-forest/15 shadow-soft hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="mint" className="text-[10px] font-mono mb-0.5">
                      3-Way Triangulation
                    </Badge>
                    <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                      Evidence & Transaction Intelligence
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-brand-charcoal/75 leading-relaxed">
                <p>
                  UDYOGA connects directly to India Stack public rails to triangulate data across
                  Account Aggregator banking streams, GST returns, and merchant UPI settlements.
                  Discrepancies are identified automatically, eliminating paper forgery risks.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1.5 text-emerald-950">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-900 block">
                    Provenance Classification
                  </span>
                  <p className="text-[11px] text-emerald-900/80">
                    Data is rigorously labelled as <em>Independently Verified</em>, <em>Source-Labelled</em>, or{' '}
                    <em>Self-Reported</em>, giving lenders verifiable confidence in underlying figures.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Capability 3: Cash-Flow Twin & Repayment Intelligence */}
            <Card className="border-brand-forest/15 shadow-soft hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[10px] font-mono border-amber-300 bg-amber-50 text-amber-800 mb-0.5">
                      Stress-Tested Under Volatility
                    </Badge>
                    <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                      Cash-Flow Twin & Repayment Intelligence
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-brand-charcoal/75 leading-relaxed">
                <p>
                  UDYOGA builds a simulation of the enterprise's cash flows to test how it withstands
                  a 15% revenue drop or 30-day payment delay. Instead of rigid fixed EMIs, it recommends
                  dynamic daily revenue sweeps that protect the borrower from default.
                </p>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-amber-950">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block">
                    Dynamic Sweep Flexibility
                  </span>
                  <p className="text-[11px] text-amber-900/80">
                    Repayment adjusts automatically with daily UPI sales (e.g. 1.8% of daily collections),
                    ensuring borrowers never face punitive penalty fees during seasonal dips.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Capability 4: Explainable Path-to-Yes */}
            <Card className="border-brand-forest/15 shadow-soft hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[10px] font-mono border-brand-terracotta/30 bg-brand-terracotta/5 text-brand-terracotta mb-0.5">
                      No Black-Box Declines
                    </Badge>
                    <CardTitle className="text-lg font-display font-bold text-brand-charcoal">
                      Explainable Path-to-Yes
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-brand-charcoal/75 leading-relaxed">
                <p>
                  Every assessment explains exactly why an application was approved or what caused hesitation.
                  Borrowers receive transparent milestones explaining what actions (such as reducing
                  receivable delays or maintaining a minimum balance) will qualify them for credit.
                </p>
                <div className="p-3 rounded-xl bg-brand-terracotta/5 border border-brand-terracotta/20 space-y-1.5 text-brand-charcoal">
                  <span className="text-[10px] font-mono uppercase font-bold text-brand-terracotta block">
                    Portable Financial Passport
                  </span>
                  <p className="text-[11px] text-brand-charcoal/75">
                    Borrowers can export their verified assessment dossier with a tamper-evident cryptographic
                    signature to share with multiple banks and NBFCs.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ========================================================= */}
        {/* CLEAR REGULATORY & LEGAL DISCLAIMER                      */}
        {/* ========================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-brand-forest/15 text-center text-xs text-brand-charcoal/60 space-y-1">
          <p className="font-semibold text-brand-charcoal/80">
            Illustrative workflow demonstration. Final credit decisions are made by authorised partner financial institutions.
          </p>
          <p className="text-[11px] text-brand-charcoal/50">
            UDYOGA operates in full compliance with Reserve Bank of India (RBI) Digital Lending Guidelines and the Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>

      </div>
    </section>
  );
};
