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
  Scale
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
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Page Title & Simple Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal mt-1">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-brand-charcoal/65 mt-0.5">
            Essential operational summary across platform users, registered businesses, and active integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="mint" className="text-xs font-mono font-semibold">
            All Systems Normal
          </Badge>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. FOUR SUMMARY METRICS                                        */}
      {/* Total Users, Active MSMEs, Total Applications, Pending Actions */}
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
              Borrowers, lenders, and platform administrators.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-brand-forest/10 font-mono text-brand-charcoal/60">
              <span>View user directory</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
              Enterprises with registered business profiles.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-brand-forest/10 font-mono text-brand-charcoal/60">
              <span>View business list</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
              Loan files currently processed or decided.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-brand-forest/10 font-mono text-brand-charcoal/60">
              <span>Open application ledger</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
              Tasks requiring administrative attention.
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-200/60 font-mono text-amber-900/70">
              <span>Needs review</span>
              <span className="font-bold text-amber-900">See below ↓</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ============================================================== */}
      {/* 2. PENDING ACTIONS SECTION                                     */}
      {/* ============================================================== */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardHeader className="pb-3 border-b border-brand-forest/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                Pending Administrative Actions ({pendingActionsCount})
              </CardTitle>
            </div>
            <span className="text-xs text-brand-charcoal/60">
              Tasks requiring administrative action
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
          {ADMIN_PENDING_TASKS.map((task) => (
            <div 
              key={task.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-forest/5 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
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
                <p className="text-brand-charcoal/70 leading-relaxed text-[11px]">
                  {task.description}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(task.targetView)}
                className="self-start sm:self-center shrink-0 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 text-xs h-8"
              >
                <span>{task.actionLabel}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 3. SYSTEM HEALTH & RECENT ACTIVITY (TWO COLUMNS)               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: System Health (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-brand-forest" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    System Health
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/admin/system')}
                  className="text-xs text-brand-forest hover:bg-brand-forest/10 h-7 px-2"
                >
                  <span>Detailed Health</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-brand-charcoal/65">
                Current status of essential data rails and verification services.
              </p>

              <div className="space-y-2.5 pt-1">
                {mockConnectors.map((c) => {
                  const isNormal = c.status === 'OPERATIONAL';
                  return (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl border border-brand-forest/10 bg-white/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <strong className="text-brand-charcoal font-semibold block truncate">
                          {c.displayName.split('(')[0].trim()}
                        </strong>
                        <span className="text-[11px] text-brand-charcoal/50 font-mono">
                          Response: {c.latencyMs}ms · {c.uptime30d}% uptime
                        </span>
                      </div>

                      <div>
                        {isNormal ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operational
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Slow Response
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('/admin/system')}
                  className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8"
                >
                  Manage Integration Circuit Breakers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Recent Platform Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-forest" />
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Recent Platform Activity
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/admin/audit-logs')}
                  className="text-xs text-brand-forest hover:bg-brand-forest/10 h-7 px-2"
                >
                  <span>Full History</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
              {mockAuditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-brand-forest/5 transition-colors space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-brand-charcoal/60">
                    <span className="font-semibold text-brand-charcoal">
                      {log.actorName}
                    </span>
                    <span className="font-mono text-[10px]">
                      {log.timestamp.split(' IST')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 leading-relaxed font-medium">
                    {log.details}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-mono text-brand-forest font-semibold">
                      Action: {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-brand-charcoal/40 font-mono">
                      ID: {log.id}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
