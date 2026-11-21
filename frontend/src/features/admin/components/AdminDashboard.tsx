import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { 
  Activity, 
  Users, 
  Scale, 
  ShieldCheck, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  ArrowUpRight,
  Cpu,
  Layers,
  Lock,
  FileText,
  Clock,
  Info,
  HelpCircle,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { mockConnectors, mockAuditLogs, mockAdminUsers } from '../data/mockAdminData';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [showTechnicalGlossary, setShowTechnicalGlossary] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* 1. THREE-QUESTION OPERATIONAL BANNER FOR ADMINISTRATORS         */}
      {/* What is happening? Why does it matter? What should I do next?  */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft border border-brand-forest/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                Platform Operations & Governance Cockpit
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              System Health & Operational Overview
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowTechnicalGlossary(!showTechnicalGlossary)}
              className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 h-9 rounded-full"
              title="View plain English translations for technical metrics"
            >
              <Info className="w-3.5 h-3.5 text-emerald-300" />
              <span>{showTechnicalGlossary ? 'Hide Terminology Guide' : 'Terminology Guide'}</span>
            </Button>

            <Button 
              variant="accent" 
              size="pill" 
              onClick={() => onNavigate('/admin/fairness')}
              className="gap-2 h-9 text-xs font-semibold shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Open Fairness & Bias Console</span>
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
              <strong>All core lending services are fully operational</strong> (99.98% platform uptime) serving 3,420 MSME enterprises across 18 states.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold block mb-1">
              2. Why does it matter?
            </span>
            <p className="text-white/90 leading-relaxed">
              <strong>GSTN government tax portal</strong> is responding slower than usual (1,240ms), but Account Aggregator bank feeds and UPI auto-debits are running normally.
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
                onClick={() => onNavigate('/admin/data-quality')}
                className="bg-emerald-500 hover:bg-emerald-600 text-brand-forest font-bold text-xs py-1 px-3 h-7 rounded-lg"
              >
                Inspect Data Feeds
              </Button>
              <span className="text-[11px] text-white/75">
                or review the 2 pending alerts below.
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Technical Terminology Guide */}
        {showTechnicalGlossary && (
          <div className="p-4 rounded-2xl bg-brand-charcoal/80 border border-emerald-500/30 text-xs space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-300 font-bold text-[11px] uppercase">
                Plain-English Translations of Platform Terminology
              </span>
              <Badge variant="mint-pill" className="text-[9px]">Administrator Guide</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">System Response Speed</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: API Gateway Latency</span>
                <p className="text-white/80 mt-1">How quickly the system responds when users click buttons or submit applications.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">Model Stability</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: Model Drift</span>
                <p className="text-white/80 mt-1">Whether the credit scoring algorithm is behaving consistently over time without unintended shifts.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">Information Completeness</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: Data Quality & Schema Pass</span>
                <p className="text-white/80 mt-1">How complete and consistent the submitted bank and tax records are across all applicants.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">Fair Lending Metric</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: Disparate Impact Ratio (DIR)</span>
                <p className="text-white/80 mt-1">A measure comparing loan approval rates between female-led and male-led businesses to ensure equal treatment.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">Role & Access Control</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: RBAC</span>
                <p className="text-white/80 mt-1">Rules that determine who can access which parts of the platform (e.g. lenders can only see applicant data, not system settings).</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-emerald-300 block">Activity Log</strong>
                <span className="text-white/60 text-[10px] block font-mono">Technical term: Immutable Audit Trail</span>
                <p className="text-white/80 mt-1">A permanent, tamper-evident record of all critical actions performed in the platform.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. THE 5 CORE STATUS CARDS (SECTION 3A REQUIREMENT)            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Platform Status */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">Platform Status</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Operating normally" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold text-emerald-800 mt-1">
              99.98%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Normal operations across all services.
            </p>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block w-fit">
              All 6 Services Up
            </span>
          </CardContent>
        </Card>

        {/* Card 2: Registered Users */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">Registered Users</span>
              <Users className="w-4 h-4 text-brand-forest" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold text-brand-charcoal mt-1">
              {mockAdminUsers.length} Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Borrowers, Lenders, Auditors & Admins.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-charcoal/60 pt-0.5">
              <span>Active sessions:</span>
              <span className="font-bold text-brand-forest">7 Online</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active MSME Businesses */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">Active MSME Businesses</span>
              <Briefcase className="w-4 h-4 text-brand-forest" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold text-brand-forest mt-1">
              3,420
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Active working capital facilities.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-charcoal/60 pt-0.5">
              <span>Total funded:</span>
              <span className="font-bold text-brand-forest">₹45.2 Cr</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Data Processing Status */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">Data Processing Status</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold text-brand-charcoal mt-1">
              98.6%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Submitted files verified without error.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-charcoal/60 pt-0.5">
              <span>Payloads today:</span>
              <span className="font-bold text-brand-charcoal">4,290 verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Pending Administrative Actions */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/80">Pending Admin Actions</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <CardTitle className="text-2xl font-mono font-bold text-amber-800 mt-1">
              2 Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Routine alerts needing review.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-800 pt-0.5">
              <span>Items:</span>
              <span className="font-bold">1 Delay + 1 Role</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ============================================================== */}
      {/* 3. MAIN GRID: EXTERNAL INTEGRATIONS & READABLE ACTIVITY LOG   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* External Integrations (Connector Health) — 7 cols */}
        <div className="lg:col-span-7">
          <Card className="h-full border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-brand-forest" />
                    <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                      External Integrations Status
                    </CardTitle>
                  </div>
                  <p className="text-xs text-brand-charcoal/65 mt-0.5">
                    Whether government and banking connection rails are functioning correctly.
                  </p>
                </div>
                <Badge variant="mint" className="text-xs font-mono">
                  3 of 4 Normal
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              {mockConnectors.map((connector) => (
                <div
                  key={connector.name}
                  className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-forest/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      connector.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`} />
                    <div>
                      <h5 className="font-display font-bold text-xs text-brand-charcoal">
                        {connector.displayName || connector.name}
                      </h5>
                      <span className="text-[11px] text-brand-charcoal/65 block font-mono">
                        Protocol: {connector.protocol} · {connector.uptime30d}% 30-Day Reliability
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-brand-forest block">
                        {connector.latencyMs} ms
                      </span>
                      <span className="text-[10px] text-brand-charcoal/50">
                        response time
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      connector.status === 'OPERATIONAL'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}>
                      {connector.status === 'OPERATIONAL' ? 'Normal' : 'Slow Response'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-brand-ivory border border-brand-forest/10 text-xs text-brand-charcoal/70 flex items-center justify-between">
                <span>Need to adjust fallback gateway routing or toggle circuit breakers?</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onNavigate('/admin/system')}
                  className="text-xs h-7"
                >
                  System Controls
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Readable Activity Timeline (Audit Trail) — 5 cols */}
        <div className="lg:col-span-5">
          <Card className="h-full border-brand-forest/15 shadow-soft flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-brand-forest/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                      Recent Activity Log
                    </CardTitle>
                    <p className="text-xs text-brand-charcoal/65 mt-0.5">
                      Readable record of important actions performed in the system
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/admin/audit-logs')}
                    className="text-xs h-7 px-2.5 border-brand-forest/20 text-brand-forest"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {mockAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-brand-ivory/60 border border-brand-forest/10 text-xs space-y-1.5 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-forest">
                        {log.actorName}
                      </span>
                      <span className="text-[10px] font-mono text-brand-charcoal/50">
                        {log.timestamp.split(' ')[1]}
                      </span>
                    </div>

                    <p className="text-xs text-brand-charcoal leading-snug">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-brand-forest/5 text-[10px] text-brand-charcoal/60">
                      <span className="font-mono">{log.id}</span>
                      <button
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="text-brand-forest font-semibold hover:underline"
                      >
                        {expandedLogId === log.id ? 'Hide Details' : 'Inspect Details'}
                      </button>
                    </div>

                    {expandedLogId === log.id && (
                      <div className="p-2 rounded-lg bg-white border border-brand-forest/10 space-y-1 text-[10px] font-mono text-brand-charcoal/70 animate-in fade-in duration-150">
                        <p>Action Type: <strong>{log.action}</strong></p>
                        <p>Origin IP Address: <strong>{log.ipAddress}</strong></p>
                        <p>Security Status: <strong className="text-emerald-700">{log.status}</strong></p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </div>

            <div className="p-4 bg-brand-forest/[0.02] border-t border-brand-forest/10 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/admin/fairness')}
                className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8 font-semibold"
              >
                Inspect Algorithmic Fairness & Bias Console
              </Button>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
