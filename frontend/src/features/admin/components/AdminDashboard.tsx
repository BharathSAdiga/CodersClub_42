import React from 'react';
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
  Clock
} from 'lucide-react';
import { mockConnectors, mockAuditLogs } from '../data/mockAdminData';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Refined Proportionate Governance Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft border border-brand-forest/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
              Central Infrastructure & Model Governance
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            System Operations & Governance Cockpit
          </h2>
          <p className="text-xs text-white/75 max-w-2xl leading-relaxed">
            Real-time platform telemetry, India Stack DPI rail connectors, and statutory DPDP/RBI algorithmic fairness audit streams.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('/admin/audit-logs')}
            className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 h-9 rounded-full"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />
            <span>Audit Trail</span>
          </Button>

          <Button 
            variant="accent" 
            size="pill" 
            onClick={() => onNavigate('/admin/fairness')}
            className="gap-2 h-9 text-xs font-semibold shadow-sm"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Launch Fairness Console</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cumulative Disbursal */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Cumulative Disbursal
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-forest" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-forest mt-1">
              ₹45.2 Cr
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>Active Facilities:</span>
              <span className="font-mono font-semibold text-brand-charcoal">3,420 MSMEs</span>
            </div>
          </CardContent>
        </Card>

        {/* API Gateway Latency */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Gateway Latency
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-emerald-800 mt-1">
              142 ms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>p99 Target:</span>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">310ms · 0 Drop</span>
            </div>
          </CardContent>
        </Card>

        {/* Gender Disparate Ratio */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Gender Disparate Ratio
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-mint" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-forest mt-1">
              0.947
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-forest font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Exceeds 0.80 Rule
              </span>
              <span className="font-mono text-[10px] bg-brand-forest/10 px-1.5 py-0.5 rounded">Compliant</span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Error Rate */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Platform Error Rate
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-charcoal mt-1">
              0.02%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>Service Uptime:</span>
              <span className="font-mono font-semibold text-emerald-700">99.98%</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid: Connector Health & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Connector Health Monitoring (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-4 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    India Stack Connector Mesh
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Real-time telemetry across certified DPI and financial rail integrations
                  </p>
                </div>
                <Badge variant="mint" className="font-mono text-[10px]">
                  All Operational
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {mockConnectors.map((connector) => (
                <div
                  key={connector.name}
                  className="p-3.5 rounded-2xl bg-white border border-brand-forest/10 flex items-center justify-between hover:border-brand-forest/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <h5 className="font-display font-bold text-xs text-brand-charcoal">
                        {connector.displayName || connector.name}
                      </h5>
                      <span className="text-[10px] text-brand-charcoal/60 font-mono">
                        Protocol: {connector.protocol} · {connector.uptime30d}% Uptime
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-brand-forest block">
                        {connector.latencyMs} ms
                      </span>
                      <span className="text-[9px] font-mono text-brand-charcoal/50">
                        p95 latency
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-600/30 text-emerald-800 bg-emerald-50 font-mono">
                      {connector.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Governance & Audit Stream (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full border-brand-forest/15 shadow-soft flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-brand-forest/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                      Governance & Audit Stream
                    </CardTitle>
                    <p className="text-xs text-brand-charcoal/60 mt-0.5">
                      Statutory tamper-proof system logs
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/admin/audit-logs')}
                    className="text-[11px] h-7 px-2 border-brand-forest/20 text-brand-forest"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {mockAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-brand-forest/[0.03] border border-brand-forest/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-brand-forest">{log.action}</span>
                      <span className="text-[10px] font-mono text-brand-charcoal/50">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-brand-charcoal/80 leading-snug">
                      {log.details}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-brand-charcoal/60 font-mono">
                      <span>Actor: {log.actorName}</span>
                      <span className="text-emerald-700 font-semibold">{log.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>

            <div className="p-4 bg-brand-forest/[0.02] border-t border-brand-forest/10 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/admin/fairness')}
                className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8"
              >
                Inspect Algorithmic Fairness Model Drift & Reports
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
