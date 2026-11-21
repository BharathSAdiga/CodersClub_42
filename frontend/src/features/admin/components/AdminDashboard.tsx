import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck, 
  Server, 
  Clock, 
  ExternalLink, 
  Activity, 
  AlertTriangle, 
  Scale,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';
import { mockAdminUsers, mockAuditLogs, mockConnectors } from '../data/mockAdminData';
import { mockPipelineApplications } from '@/features/lender/data/mockPipeline';
import { mockBusinessesList } from './BusinessDirectoryView';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export interface AdminPendingTask {
  id: string;
  title: string;
  description: string;
  category: 'SECURITY' | 'CONSENT' | 'SYSTEM' | 'APPLICATION';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  targetView: string;
  actionLabel: string;
}

export const ADMIN_PENDING_TASKS: AdminPendingTask[] = [
  {
    id: 'task_01',
    title: 'Customer concentration anomaly on application APP-2026-0895',
    description: 'Sai Samarth Electricals shows 52% of sales concentrated in a single unregistered counterparty.',
    category: 'APPLICATION',
    priority: 'HIGH',
    targetView: '/admin/applications',
    actionLabel: 'Review File',
  },
  {
    id: 'task_02',
    title: 'DPDP consent revocation request pending confirmation',
    description: 'Priya Sharma (ArtisanKraft Studio) requested revocation of legacy utility BBPS handle.',
    category: 'CONSENT',
    priority: 'HIGH',
    targetView: '/admin/audit-logs',
    actionLabel: 'Confirm Revocation',
  },
  {
    id: 'task_03',
    title: 'GSTN Government Gateway responding with elevated latency (1,240ms)',
    description: 'External tax network is operating slower than standard threshold (800ms). Cached records active.',
    category: 'SYSTEM',
    priority: 'NORMAL',
    targetView: '/admin/system',
    actionLabel: 'Check Gateway',
  },
  {
    id: 'task_04',
    title: 'New MSME business registration awaiting Udyam verification',
    description: 'Sai Samarth Electricals submitted Udyam registration number UDYAM-MH-33-0091821.',
    category: 'SECURITY',
    priority: 'NORMAL',
    targetView: '/admin/businesses',
    actionLabel: 'Verify Udyam',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const totalUsersCount = mockAdminUsers.length;
  const activeMsmesCount = mockBusinessesList.length;
  const totalAppsCount = mockPipelineApplications.length;
  const pendingActionsCount = ADMIN_PENDING_TASKS.length;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 text-brand-charcoal">
      
      {/* ============================================================== */}
      {/* 1. TOP SECTION: Platform Overview, Context & Quick Navigation  */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-brand-forest/15 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold bg-brand-forest/10 px-2.5 py-0.5 rounded-full">
              Central Administration
            </span>
            <span className="text-xs text-brand-charcoal/50 font-mono">
              Live Governance · RBI DLG & DPDP 2023
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Platform Operational Overview
          </h1>
          <p className="text-sm text-brand-charcoal/70 max-w-2xl">
            Live telemetry, statutory audit events, multi-tenant directory, and fair lending model governance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/admin/fairness')}
            className="text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5 h-9 px-3.5 gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-brand-forest" />
            <span>Fairness Console</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/admin/system')}
            className="text-xs bg-brand-forest text-white hover:bg-brand-forest/90 h-9 px-4 font-semibold shadow-sm gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-brand-mint" />
            <span>System Telemetry</span>
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FOUR SUMMARY METRIC CARDS                                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Users */}
        <Card 
          onClick={() => onNavigate('/admin/users')}
          className="hover:shadow-soft transition-all duration-200 border-brand-forest/15 cursor-pointer group"
        >
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/75 group-hover:text-brand-forest transition-colors">
                Total Users
              </span>
              <Users className="w-4 h-4 text-brand-forest" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-charcoal mt-1">
              {totalUsersCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Borrowers, lenders & platform admins.
            </p>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-brand-forest/10 font-mono text-brand-forest font-semibold">
              <span>View user directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Active MSMEs */}
        <Card 
          onClick={() => onNavigate('/admin/businesses')}
          className="hover:shadow-soft transition-all duration-200 border-brand-forest/15 cursor-pointer group"
        >
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/75 group-hover:text-brand-forest transition-colors">
                Active MSMEs
              </span>
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-emerald-800 mt-1">
              {activeMsmesCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Enterprises with verified profiles.
            </p>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-brand-forest/10 font-mono text-emerald-800 font-semibold">
              <span>View enterprise list</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Total Applications */}
        <Card 
          onClick={() => onNavigate('/admin/applications')}
          className="hover:shadow-soft transition-all duration-200 border-brand-forest/15 cursor-pointer group"
        >
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-charcoal/75 group-hover:text-brand-forest transition-colors">
                Total Applications
              </span>
              <FileText className="w-4 h-4 text-brand-forest" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-forest mt-1">
              {totalAppsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-brand-charcoal/65">
              Underwriting dossiers processed.
            </p>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-brand-forest/10 font-mono text-brand-forest font-semibold">
              <span>Open application ledger</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Pending Actions */}
        <Card 
          className="hover:shadow-soft transition-all duration-200 border-amber-300/80 bg-amber-50/40"
        >
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">
                Pending Actions
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-amber-900 mt-1">
              {pendingActionsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-amber-900/80">
              Tasks requiring admin intervention.
            </p>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-amber-200/60 font-mono text-amber-900 font-bold">
              <span>Action required</span>
              <span>Review list ↓</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT: BALANCED TWO-COLUMN DESKTOP LAYOUT (7 + 5)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Pending Actions & Activity History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pending Tasks Panel */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Pending Administrative Actions ({pendingActionsCount})
                  </CardTitle>
                </div>
                <span className="text-xs text-brand-charcoal/60 font-mono">
                  Real-time Queue
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
              {ADMIN_PENDING_TASKS.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-forest/5 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'HIGH' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {task.priority === 'HIGH' ? 'High Priority' : 'Standard'}
                      </span>
                      <strong className="text-sm font-semibold text-brand-charcoal">
                        {task.title}
                      </strong>
                    </div>
                    <p className="text-brand-charcoal/70 leading-relaxed text-xs">
                      {task.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(task.targetView)}
                    className="self-start sm:self-center shrink-0 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 text-xs h-8 px-3 font-semibold"
                  >
                    <span>{task.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Platform Event Log */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-forest" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Recent Platform Audit Log
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/admin/audit-logs')}
                  className="text-xs text-brand-forest hover:bg-brand-forest/10 h-7 px-2"
                >
                  <span>Full Audit Trail</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
              {mockAuditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3.5 flex items-start gap-3 hover:bg-brand-forest/5 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-brand-forest mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm text-brand-charcoal truncate">
                        {log.action}
                      </strong>
                      <span className="text-xs font-mono text-brand-charcoal/50 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                      {log.details}
                    </p>
                    <span className="text-xs text-brand-charcoal/50 font-mono block">
                      Actor: {log.actorName} · Category: {log.category}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: System Health & Fair Lending (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* System Health Panel */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-brand-forest" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Core Gateway Status
                  </CardTitle>
                </div>
                <Badge variant="mint" className="text-xs font-mono font-semibold">
                  All Systems Operational
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-brand-charcoal/70">
                Live latency and availability across statutory India Stack rails:
              </p>

              <div className="space-y-2.5 pt-1">
                {mockConnectors.map((c) => {
                  const isNormal = c.status === 'OPERATIONAL';
                  return (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-brand-forest/10 bg-brand-ivory/60 hover:bg-white transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <strong className="text-brand-charcoal font-semibold block truncate">
                          {c.displayName.split('(')[0].trim()}
                        </strong>
                        <span className="text-xs text-brand-charcoal/60 font-mono">
                          Latency: {c.latencyMs}ms · {c.uptime30d}% uptime
                        </span>
                      </div>

                      <div>
                        {isNormal ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Latency Warning
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('/admin/system')}
                  className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8 font-semibold"
                >
                  <span>Open Telemetry & Diagnostic Center</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fair Lending & Model Governance Card */}
          <Card className="border-brand-forest/15 shadow-soft bg-gradient-to-br from-white to-brand-forest/5">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-brand-forest" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Fair Lending & Parity Pulse
                  </CardTitle>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Compliant
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-brand-forest/10">
                  <span className="text-xs text-brand-charcoal/60 block font-medium">Disparate Impact Ratio</span>
                  <strong className="text-base font-mono text-brand-forest block mt-0.5">0.94 / 1.00</strong>
                  <span className="text-xs text-emerald-700 font-semibold">&gt; 0.80 Safe Corridor</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-brand-forest/10">
                  <span className="text-xs text-brand-charcoal/60 block font-medium">Demographic Parity</span>
                  <strong className="text-base font-mono text-emerald-800 block mt-0.5">99.1%</strong>
                  <span className="text-xs text-emerald-700 font-semibold">Zero Protected Bias</span>
                </div>
              </div>

              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                Automated continuous auditing tests models against gender, sector, and geographic proxies under RBI Fair Lending Framework.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/admin/fairness')}
                className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8 font-semibold"
              >
                <span>Examine Fairness Console & Reports</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};
