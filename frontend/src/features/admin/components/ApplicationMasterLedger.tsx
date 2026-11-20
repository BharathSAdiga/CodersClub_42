import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { mockPipelineApplications } from '@/features/lender/data/mockPipeline';

export const ApplicationMasterLedger: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
          Master Transaction Ledger
        </span>
        <h2 className="text-2xl font-display font-bold text-brand-charcoal mt-0.5">
          Global Applications Master Ledger
        </h2>
        <p className="text-xs text-brand-charcoal/60">
          Complete institutional ledger of every credit facility evaluated across all state transitions.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Application Ref</th>
                <th className="py-3 px-4 font-semibold">Entity Trade Name</th>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th className="py-3 px-4 font-semibold">Facility Amount</th>
                <th className="py-3 px-4 font-semibold">ACIE Score</th>
                <th className="py-3 px-4 font-semibold">State Machine Status</th>
                <th className="py-3 px-4 font-semibold">Assigned Underwriter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {mockPipelineApplications.map((app) => (
                <tr key={app.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-forest">
                    {app.id}
                  </td>
                  <td className="py-3 px-4 font-display font-bold text-brand-charcoal">
                    {app.businessName}
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal/70">
                    {app.sector}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-charcoal">
                    {formatINR(app.requestedAmount)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-800">
                    {app.acieScore}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-brand-forest/10 text-brand-forest">
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal/60 font-mono text-[11px]">
                    Vikram Deshmukh (cr_8912)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
