import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import {
  Sparkles,
  Check,
  AlertCircle,
  Info,
  ShieldCheck,
  Activity,
  Clock,
  ShieldAlert,
  FileCheck2,
  TrendingUp,
  Scale
} from 'lucide-react';

export const AssessmentReportView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const report = activePersona.acieReport;
  const drivers = report?.topDrivers || [];

  // Canonical 5-Dimension Business Financial DNA Breakdown
  const financialDnaDimensions = [
    {
      id: 'dim_1',
      name: '1. Cash-Flow Vitality',
      score: 84,
      status: 'STRONG',
      icon: Activity,
      summary: 'High transaction frequency and daily incoming cash rhythm across 90-day UPI/AA data.',
      evidence: '142 transactions/day average with positive net monthly balance (+₹42,000).',
      limitation: 'Slight dip during 2nd week of each month due to inventory distributor restock.'
    },
    {
      id: 'dim_2',
      name: '2. Business Continuity',
      score: 79,
      status: 'GOOD',
      icon: Clock,
      summary: 'Demonstrated survival through local market disruptions and seasonal operating troughs.',
      evidence: '4.2 years of continuous tax filing and commercial utility debits.',
      limitation: 'Informal shop tenancy agreement without long-term registered lease deed.'
    },
    {
      id: 'dim_3',
      name: '3. Trade Reliability',
      score: 88,
      status: 'EXCELLENT',
      icon: FileCheck2,
      summary: 'Punctual vendor settlement cadence and zero statutory utility defaults.',
      evidence: '24 consecutive months of zero BBPS electricity delay; prompt supplier RTGS transfers.',
      limitation: 'Occasional cheque clearance transit buffer of 48 hours.'
    },
    {
      id: 'dim_4',
      name: '4. Financial Resilience',
      score: 68,
      status: 'MODERATE',
      icon: TrendingUp,
      summary: 'Ability to withstand temporary revenue shocks without immediate insolvency.',
      evidence: 'Buffer cash reserve covers 18 days of operating expenses under -15% demand shock.',
      limitation: 'Limited secondary credit facilities or formal backup bank overdrafts.'
    },
    {
      id: 'dim_5',
      name: '5. Evidence Confidence',
      score: 92,
      status: 'HIGH',
      icon: Scale,
      summary: 'Degree of independently verified digital public data vs. self-reported documentation.',
      evidence: '95.8% 3-way triangulation match between Bank AA, GSTN GSP, and UPI logs.',
      limitation: 'Cashbook registers are self-reported and treated with secondary weight.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Explainable Credit Intelligence & Business DNA
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          ACIE Assessment & 5-Dimension Business DNA
        </h2>
        <p className="text-xs text-brand-charcoal/60 mt-0.5">
          Full mathematical transparency on every factor influencing your pre-approved working capital limit.
        </p>
      </div>

      {/* Score Header Card */}
      <div className="p-8 rounded-3xl bg-brand-charcoal text-brand-ivory border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-brand-mint font-bold block">
            Alternative Credit Intelligence Score
          </span>
          <div className="flex items-baseline gap-3 my-2">
            <span className="text-5xl font-display font-extrabold text-white font-mono">
              {report?.creditVitalityScore || 768}
            </span>
            <span className="text-sm text-white/50 font-mono">/ 900</span>
          </div>
          <p className="text-xs text-white/70 max-w-md leading-relaxed">
            Evaluated using verified cash-flow cadence and utility discipline. Model confidence score: <strong>94.0%</strong>.
          </p>
        </div>

        <div className="p-3.5 px-5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 text-center sm:text-right shrink-0 flex flex-col items-center sm:items-end justify-center">
          <Badge variant="mint-pill" className="text-xs">
            {report?.scoreBand || 'PRIME'} BAND
          </Badge>
          <span className="text-xs font-medium text-white/90 block mt-2">
            Eligible for immediate institutional sanction up to ₹1,50,000.
          </span>
        </div>
      </div>

      {/* 5-Dimension Business Financial DNA Scorecard (Feature 4 Requirement) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Business Financial DNA</CardTitle>
              <p className="text-xs text-brand-charcoal/60 mt-0.5">
                Evaluation across the 5 canonical dimensions of alternative enterprise health
              </p>
            </div>
            <Badge variant="outline" className="border-brand-forest/20 text-brand-forest bg-brand-forest/5 text-xs">
              Multi-Dimensional Profile
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialDnaDimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <div key={dim.id} className="p-4 rounded-2xl bg-brand-ivory/60 border border-brand-forest/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-display font-bold text-sm text-brand-charcoal">
                        {dim.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${dim.status === 'STRONG' || dim.status === 'EXCELLENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                      >
                        {dim.status}
                      </Badge>
                      <span className="font-mono font-bold text-sm text-brand-charcoal">
                        {dim.score}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-charcoal/80 leading-relaxed">
                    {dim.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-brand-forest/10 text-[11px]">
                    <div className="text-emerald-800">
                      <strong>Supporting Evidence:</strong> {dim.evidence}
                    </div>
                    <div className="text-amber-800">
                      <strong>Identified Limitation:</strong> {dim.limitation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bi-Directional SHAP Drivers Waterfall */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">SHAP Feature Contribution Weights</CardTitle>
            <span className="text-xs font-mono text-brand-charcoal/50">XAI Linear Waterfall</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {drivers.map((d, idx) => {
            const isPositive = d.impactDirection === 'POSITIVE';
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${isPositive
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-rose-50/60 border-rose-200'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isPositive ? 'bg-brand-forest text-brand-ivory' : 'bg-rose-500 text-white'
                      }`}>
                      {isPositive ? '+' : '-'}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-sm text-brand-charcoal">
                        {d.displayName}
                      </h4>
                      <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
                        {d.explanationPlainLanguage}
                      </p>
                    </div>
                  </div>

                  <span className={`text-sm font-mono font-bold shrink-0 ${isPositive ? 'text-brand-forest' : 'text-rose-600'
                    }`}>
                    {isPositive ? `+${d.weightPoints}` : `${d.weightPoints}`} pts
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
