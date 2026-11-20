import React from 'react';
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
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  Layers,
  FileText,
  Filter,
  Search,
  Sliders,
  CheckCircle,
  Building2,
  Calendar,
  AlertCircle
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
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Refined Proportionate Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-forest text-brand-ivory shadow-soft border border-brand-forest/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-brand-mint font-semibold">
              Institutional Risk Command Cockpit
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Underwriting & Decision Desk
          </h2>
          <p className="text-xs text-white/75 max-w-2xl leading-relaxed">
            Real-time pipeline monitoring, 3-way cash-flow triangulation, and explainable ACIE assessments across verified Indian MSMEs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button 
            variant="outline"
            size="sm"
            onClick={onNavigateToPipeline}
            className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 h-9 rounded-full"
          >
            <Filter className="w-3.5 h-3.5 text-brand-mint" />
            <span>Filter Queue</span>
          </Button>

          <Button 
            variant="accent" 
            size="pill" 
            onClick={onNavigateToPipeline}
            className="gap-2 h-9 text-xs font-semibold shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open All Files ({mockPipelineApplications.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Review */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Pending Review
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-forest mt-1">
              42 Files
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>Urgent SLA files:</span>
              <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">6 items</span>
            </div>
          </CardContent>
        </Card>

        {/* Sanctioned Today */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Sanctioned Today
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-emerald-800 mt-1">
              14 Lines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>e-NACH Mandates:</span>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">100% active</span>
            </div>
          </CardContent>
        </Card>

        {/* Disbursed Volume */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Disbursed Volume
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-forest" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-charcoal mt-1">
              ₹1.84 Cr
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>Avg Ticket Size:</span>
              <span className="font-mono font-semibold text-brand-charcoal">₹1,31,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Average TAT */}
        <Card className="hover:shadow-soft transition-all duration-200 border-brand-forest/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono tracking-wider text-brand-charcoal/60 font-semibold">
                Average TAT
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-terracotta" />
            </div>
            <CardTitle className="text-3xl font-mono font-bold text-brand-terracotta mt-1">
              4.2 Mins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
              <span>Target Benchmark:</span>
              <span className="font-mono font-semibold text-emerald-700">&lt; 5.0 mins</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid: Risk Distribution & Priority Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Breakdown (6 cols) */}
        <div className="lg:col-span-6">
          <Card className="h-full border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-4 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                    Portfolio Risk Distribution
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                    Categorized by real-time ACIE Vitality Scorecards
                  </p>
                </div>
                <Badge variant="outline" className="border-brand-forest/20 text-brand-forest font-mono text-[10px]">
                  42 Active Files
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              {/* Tier 1: Low Risk */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-brand-forest/[0.03] border border-brand-forest/10">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-forest" />
                    <span className="font-semibold text-brand-forest">Tier 1: Prime Low Risk (700+)</span>
                  </div>
                  <span className="font-mono font-bold text-brand-forest">19 files · 45%</span>
                </div>
                <div className="w-full bg-brand-forest/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-forest h-full w-[45%]" />
                </div>
                <div className="flex justify-between text-[11px] text-brand-charcoal/60 pt-0.5">
                  <span>Fast-track automated disbursal</span>
                  <span className="font-mono">Avg Lim: ₹2.2L</span>
                </div>
              </div>

              {/* Tier 2: Moderate Risk */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/[0.03] border border-amber-500/15">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-amber-900">Tier 2: Moderate Risk (620–699)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-900">15 files · 35%</span>
                </div>
                <div className="w-full bg-amber-500/15 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[35%]" />
                </div>
                <div className="flex justify-between text-[11px] text-brand-charcoal/60 pt-0.5">
                  <span>Standard underwriter verification</span>
                  <span className="font-mono">Avg Lim: ₹1.4L</span>
                </div>
              </div>

              {/* Tier 3: Elevated Risk */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-orange-500/[0.03] border border-orange-500/15">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="font-semibold text-orange-900">Tier 3: Elevated Risk (550–619)</span>
                  </div>
                  <span className="font-mono font-bold text-orange-900">6 files · 15%</span>
                </div>
                <div className="w-full bg-orange-500/15 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[15%]" />
                </div>
                <div className="flex justify-between text-[11px] text-brand-charcoal/60 pt-0.5">
                  <span>Requires covenants or daily sweep</span>
                  <span className="font-mono">Avg Lim: ₹85K</span>
                </div>
              </div>

              {/* Tier 4: High Risk / Flagged */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-rose-500/[0.03] border border-rose-500/15">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-rose-900">Tier 4: High Anomaly (&lt;550)</span>
                  </div>
                  <span className="font-mono font-bold text-rose-900">2 files · 5%</span>
                </div>
                <div className="w-full bg-rose-500/15 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[5%]" />
                </div>
                <div className="flex justify-between text-[11px] text-brand-charcoal/60 pt-0.5">
                  <span>Manual senior credit review required</span>
                  <span className="font-mono text-rose-600">Flagged</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Priority Action Queue (6 cols) */}
        <div className="lg:col-span-6">
          <Card className="h-full border-brand-forest/15 shadow-soft flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-brand-forest/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                      Priority Underwriting Triage
                    </CardTitle>
                    <p className="text-xs text-brand-charcoal/60 mt-0.5">
                      Highest impact applications awaiting sanction decision
                    </p>
                  </div>
                  <Badge variant="mint" className="text-[10px] font-mono">
                    Instant Dispatch
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {pendingApps.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectApplication(item.id)}
                    className="p-4 rounded-2xl bg-white border border-brand-forest/10 hover:border-brand-forest cursor-pointer transition-all hover:shadow-soft group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-bold text-sm text-brand-charcoal group-hover:text-brand-forest transition-colors">
                            {item.businessName}
                          </h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-forest/10 text-brand-forest font-semibold">
                            {item.id}
                          </span>
                        </div>
                        <span className="text-xs text-brand-charcoal/60 mt-0.5 block">
                          {item.applicantName} · {item.city}, {item.state}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-brand-forest block">
                          {formatINR(item.requestedAmount)}
                        </span>
                        <span className="text-[10px] font-mono text-brand-charcoal/50">
                          {item.repaymentFrequency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-brand-forest/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          Vitality: {item.acieScore}
                        </span>
                        <span className="text-[11px] font-mono text-brand-charcoal/60">
                          Triangulation: {item.congruenceScore}%
                        </span>
                      </div>

                      <span className="text-brand-forest font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Open File</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>

            <div className="p-4 bg-brand-forest/[0.02] border-t border-brand-forest/10 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToPipeline}
                className="w-full text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-8"
              >
                View Complete Underwriting Queue ({mockPipelineApplications.length} Files)
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
