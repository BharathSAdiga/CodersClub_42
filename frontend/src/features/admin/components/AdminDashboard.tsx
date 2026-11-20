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
  Database
} from 'lucide-react';
import { mockConnectors, mockAuditLogs } from '../data/mockAdminData';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-brand-charcoal text-white shadow-elevated border border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
            Central Infrastructure & Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            System Operations & Governance Cockpit
          </h2>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            Real-time platform telemetry, third-party India Stack API connectors, and statutory DPDP/RBI algorithmic fairness audit streams.
          </p>
        </div>

        <Button 
          variant="accent" 
          size="pill" 
          onClick={() => onNavigate('/admin/fairness')}
          className="gap-2"
        >
          <Scale className="w-4 h-4" />
          <span>Launch Fairness Console</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Cumulative Disbursal</span>
            <CardTitle className="text-3xl font-mono text-brand-forest">
              ₹45.2 Cr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              3,420 Active MSME lines
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">API Gateway Latency</span>
            <CardTitle className="text-3xl font-mono text-emerald-800">
              142 ms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 font-medium">
              p99: 310ms · Zero packet loss
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Gender Disparate Ratio</span>
            <CardTitle className="text-3xl font-mono text-brand-forest">
              0.947
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-forest font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Exceeds 0.80 Rule Threshold
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Platform Error Rate</span>
            <CardTitle className="text-3xl font-mono text-brand-charcoal">
              0.02%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              30-day uptime: 99.98%
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Third-Party Connector Telemetry & Live Audit Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Third-Party Connectors (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">DPI Gateway Connectors Status</CardTitle>
                <span className="text-xs font-mono text-brand-charcoal/50">Real-Time Probes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockConnectors.map((c) => (
                <div key={c.name} className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-brand-charcoal text-sm">{c.displayName}</strong>
                      <Badge variant={c.status === 'OPERATIONAL' ? 'mint' : 'terracotta'} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-brand-charcoal/50 font-mono mt-0.5 block">
                      Protocol: {c.protocol} · 30d Uptime: {c.uptime30d}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-brand-forest text-xs block">
                      {c.latencyMs} ms
                    </span>
                    <span className="text-[10px] text-brand-charcoal/50">avg latency</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Audit Alerts (5 cols) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Governance & Audit Events</CardTitle>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/audit-logs')} className="text-[11px] h-7 px-2.5">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAuditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-brand-ivory border border-brand-forest/10 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="text-brand-charcoal">{log.action}</strong>
                    <span className="text-[10px] font-mono text-brand-charcoal/50">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/70 leading-relaxed truncate">{log.details}</p>
                  <span className="text-[10px] text-brand-forest font-mono block">By {log.actorName}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
