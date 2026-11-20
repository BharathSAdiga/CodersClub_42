import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaProfile } from '@/types';
import { Sparkles, Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export const AssessmentReportView: React.FC<{ activePersona: PersonaProfile }> = ({ activePersona }) => {
  const report = activePersona.acieReport;
  const drivers = report?.topDrivers || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Explainable Credit Intelligence
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-1">
          ACIE Assessment & SHAP Feature Report
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
              {report?.creditVitalityScore || 742}
            </span>
            <span className="text-sm text-white/50 font-mono">/ 900</span>
          </div>
          <p className="text-xs text-white/70 max-w-md leading-relaxed">
            Evaluated using verified cash-flow cadence and utility discipline. Model confidence score: <strong>94.0%</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center sm:text-right">
          <Badge variant="mint" className="text-xs font-mono">
            {report?.scoreBand || 'PRIME'} BAND
          </Badge>
          <span className="text-[11px] text-white/60 block mt-2">
            Eligible for immediate institutional sanction up to ₹2,50,000.
          </span>
        </div>
      </div>

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
                className={`p-4 rounded-2xl border transition-all ${
                  isPositive 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isPositive ? 'bg-brand-forest text-brand-ivory' : 'bg-rose-500 text-white'
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

                  <span className={`text-sm font-mono font-bold shrink-0 ${
                    isPositive ? 'text-brand-forest' : 'text-rose-600'
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
