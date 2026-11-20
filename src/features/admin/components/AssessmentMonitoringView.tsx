import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Activity, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export const AssessmentMonitoringView: React.FC = () => {
  const distributionData = [
    { band: '300-499 (Subprime)', count: 4 },
    { band: '500-599 (Elevated)', count: 12 },
    { band: '600-699 (Moderate)', count: 38 },
    { band: '700-799 (Prime)', count: 64 },
    { band: '800-900 (Super Prime)', count: 28 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Model Inference Telemetry
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
          ACIE Assessment & Drift Monitoring
        </h2>
        <p className="text-xs text-brand-charcoal/60">
          Telemetry stream monitoring score distribution, inference latency, and feature stability.
        </p>
      </div>

      {/* Model Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Average Inference Latency</span>
            <CardTitle className="text-2xl font-mono text-brand-forest">
              184 ms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              Target SLA: &lt; 500 ms
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Mean ACIE Score</span>
            <CardTitle className="text-2xl font-mono text-brand-forest">
              714 / 900
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stable Distribution (0.2% drift)
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-mono text-brand-charcoal/50">Confidence Interval Mean</span>
            <CardTitle className="text-2xl font-mono text-brand-forest">
              94.2%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-brand-charcoal/60">
              p95 Confidence &gt; 91%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution Histogram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio Score Band Distribution</CardTitle>
          <p className="text-xs text-brand-charcoal/60">Volume of evaluated enterprises across credit tiers</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <XAxis dataKey="band" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', color: '#F7F4EC', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#173F35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
