import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR, formatCompactINR } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  Layers,
  FileText
} from 'lucide-react';
import { mockPipelineApplications } from '../data/mockPipeline';

interface LenderDashboardProps {
  onSelectApplication: (id: string) => void;
  onNavigateToPipeline: () => void;
}

export const LenderDashboard: React.FC<LenderDashboardProps> = ({
  onSelectApplication,
  onNavigateToPipeline,
}) => {
  const pendingApps = mockPipelineApplications.filter((a) => a.status === 'UNDERWRITING_REVIEW');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
            Institutional Risk Radar
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Underwriting Command Cockpit
          </h2>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            Real-time pipeline monitoring, automated 3-way cash-flow triangulation, and ACIE credit risk evaluations across verified MSME applicants.
          </p>
        </div>

        <Button 
          variant="accent" 
          size="pill" 
          onClick={onNavigateToPipeline}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Open Full Queue ({mockPipelineApplications.length})</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Pending Review</span>
            <CardTitle className="text-3xl font-mono text-brand-forest">
              42 Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              6 urgent queue items
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Sanctioned Today</span>
            <CardTitle className="text-3xl font-mono text-emerald-800">
              14 Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 font-medium">
              100% digital e-mandates
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Disbursed Volume</span>
            <CardTitle className="text-3xl font-mono text-brand-charcoal">
              ₹1.84 Cr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Avg ticket: ₹1,31,000
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Average TAT</span>
            <CardTitle className="text-3xl font-mono text-brand-terracotta">
              4.2 mins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Target SLA: &lt; 5.0 mins
            </span>
          </CardContent>
        </Card>

      </div>

      {/* Risk Tier & Portfolio Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Breakdown (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pipeline Risk Tier Distribution</CardTitle>
                <span className="text-xs font-mono text-brand-charcoal/50">ACIE Model Tiers</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Low Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-brand-forest font-bold">Tier 1: Low Risk (Prime 700+)</span>
                  <span className="font-mono">19 files (45%)</span>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-forest h-full w-[45%]" />
                </div>
              </div>

              {/* Moderate Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-amber-700 font-bold">Tier 2: Moderate Risk (620–699)</span>
                  <span className="font-mono">15 files (35%)</span>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[35%]" />
                </div>
              </div>

              {/* Elevated Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-orange-700 font-bold">Tier 3: Elevated Risk (550–619)</span>
                  <span className="font-mono">6 files (15%)</span>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[15%]" />
                </div>
              </div>

              {/* High Risk / Flagged */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-rose-700 font-bold">Tier 4: High Anomaly / Subprime (&lt;550)</span>
                  <span className="font-mono">2 files (5%)</span>
                </div>
                <div className="w-full bg-brand-forest/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[5%]" />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Priority Action Queue (5 cols) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Priority Triage Files</CardTitle>
                <Badge variant="mint">Live Queue</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingApps.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectApplication(item.id)}
                  className="p-3.5 rounded-2xl bg-brand-ivory border border-brand-forest/10 hover:border-brand-forest cursor-pointer transition-all hover:bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-display font-bold text-xs text-brand-charcoal">{item.businessName}</h5>
                      <span className="text-[10px] text-brand-charcoal/60">{item.applicantName} · {item.city}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-brand-forest">
                      {formatINR(item.requestedAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-forest/5 text-[10px]">
                    <span className="text-emerald-700 font-semibold font-mono">ACIE Score: {item.acieScore}</span>
                    <span className="text-brand-forest font-bold inline-flex items-center gap-0.5">
                      Open File <ArrowRight className="w-2.5 h-2.5" />
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
