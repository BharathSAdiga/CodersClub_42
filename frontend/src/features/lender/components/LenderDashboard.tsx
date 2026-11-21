import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Filter,
  Building2,
  MapPin,
  Calendar,
  XCircle,
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';
import { mockPipelineApplications, PipelineItem } from '../data/mockPipeline';

interface LenderDashboardProps {
  onSelectApplication: (id: string) => void;
  onNavigateToPipeline: () => void;
}

export type SummaryFilterType = 
  | 'ALL'
  | 'NEW_APPLICATIONS'
  | 'UNDER_REVIEW'
  | 'NEED_INFORMATION'
  | 'DECISIONS_PENDING';

export const LenderDashboard: React.FC<LenderDashboardProps> = ({
  onSelectApplication,
  onNavigateToPipeline,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<SummaryFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Precise, data-backed categorization matching the 4 requested metrics
  const categorized = useMemo(() => {
    return {
      NEW_APPLICATIONS: mockPipelineApplications.filter(
        (a) => a.status === 'SUBMITTED'
      ),
      UNDER_REVIEW: mockPipelineApplications.filter(
        (a) => a.status === 'UNDERWRITING_REVIEW' && !a.hasAnomalies
      ),
      NEED_INFORMATION: mockPipelineApplications.filter(
        (a) => a.hasAnomalies || a.congruenceScore < 90
      ),
      DECISIONS_PENDING: mockPipelineApplications.filter(
        (a) => a.status === 'CONDITIONALLY_APPROVED' || (a.status === 'UNDERWRITING_REVIEW' && a.congruenceScore >= 95)
      ),
    };
  }, []);

  // Filtered applications for the table
  const displayedApplications = useMemo(() => {
    let list = mockPipelineApplications;
    if (selectedFilter !== 'ALL') {
      list = categorized[selectedFilter] || [];
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.businessName.toLowerCase().includes(q) ||
          a.applicantName.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.sector.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedFilter, searchQuery, categorized]);

  // Small recently reviewed applications (decided or reviewed files)
  const recentlyReviewed = useMemo(() => {
    return mockPipelineApplications.filter(
      (a) => a.status === 'SANCTIONED' || a.status === 'CONDITIONALLY_APPROVED' || a.status === 'DECLINED'
    );
  }, []);

  const formatReceivedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (app: PipelineItem) => {
    if (app.hasAnomalies || app.congruenceScore < 90) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Needs Information
        </span>
      );
    }
    switch (app.status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600" />
            New Application
          </span>
        );
      case 'UNDERWRITING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-forest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Under Review
          </span>
        );
      case 'CONDITIONALLY_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            Decisions Pending
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Sanctioned
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-charcoal bg-white border border-brand-charcoal/20 px-2 py-0.5 rounded-full">
            {app.status}
          </span>
        );
    }
  };

  const getNextAction = (app: PipelineItem) => {
    if (app.hasAnomalies || app.congruenceScore < 90) {
      return {
        label: 'Resolve Issue',
        hint: 'Examine flagged item',
        variant: 'outline' as const,
        style: 'border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100/60',
      };
    }
    if (app.status === 'SUBMITTED') {
      return {
        label: 'Start Intake',
        hint: 'Verify initial profile',
        variant: 'outline' as const,
        style: 'border-blue-300 text-blue-900 bg-blue-50/50 hover:bg-blue-100/60',
      };
    }
    if (app.status === 'CONDITIONALLY_APPROVED') {
      return {
        label: 'Approve Sanction',
        hint: 'Sign sanction letter',
        variant: 'primary' as const,
        style: 'bg-brand-forest text-white hover:bg-brand-forest/90 font-semibold',
      };
    }
    return {
      label: 'Review File',
      hint: 'Assess cash flow & limits',
      variant: 'primary' as const,
      style: 'bg-brand-forest text-white hover:bg-brand-forest/90 font-semibold',
    };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300 text-brand-charcoal">
      
      {/* Page Title & Simple Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-charcoal/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold">
            Lender Workdesk
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal mt-1">
            Applications Requiring Attention
          </h1>
          <p className="text-xs sm:text-sm text-brand-charcoal/65 mt-0.5">
            Identify incoming applications, review business financial health, and record credit decisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToPipeline}
            className="text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 h-9"
          >
            <span>Full Pipeline Queue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. FOUR SUMMARY METRICS                                        */}
      {/* New Applications, Under Review, Need Information, Decisions    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: New Applications */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'NEW_APPLICATIONS' ? 'ALL' : 'NEW_APPLICATIONS')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedFilter === 'NEW_APPLICATIONS'
              ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-2 ring-blue-400/20'
              : 'bg-white hover:bg-brand-forest/5 border-brand-forest/15 hover:border-brand-forest/30 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-brand-charcoal/75">
              New Applications
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="text-3xl font-mono font-bold text-blue-900 mt-1">
            {categorized.NEW_APPLICATIONS.length}
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            Fresh submissions awaiting intake.
          </p>
          <div className="text-[11px] text-blue-700 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'NEW_APPLICATIONS' ? 'Showing in table' : 'Filter table'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 2: Under Review */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedFilter === 'UNDER_REVIEW'
              ? 'bg-emerald-50/90 border-emerald-400 shadow-sm ring-2 ring-emerald-400/20'
              : 'bg-white hover:bg-brand-forest/5 border-brand-forest/15 hover:border-brand-forest/30 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-brand-charcoal/75">
              Under Review
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-800 mt-1">
            {categorized.UNDER_REVIEW.length}
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            In active credit assessment.
          </p>
          <div className="text-[11px] text-emerald-700 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'UNDER_REVIEW' ? 'Showing in table' : 'Filter table'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 3: Need Information */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'NEED_INFORMATION' ? 'ALL' : 'NEED_INFORMATION')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedFilter === 'NEED_INFORMATION'
              ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20'
              : 'bg-white hover:bg-brand-forest/5 border-brand-forest/15 hover:border-brand-forest/30 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-brand-charcoal/75">
              Need Information
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-900 mt-1">
            {categorized.NEED_INFORMATION.length}
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            Requires clarification or evidence.
          </p>
          <div className="text-[11px] text-amber-800 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'NEED_INFORMATION' ? 'Showing in table' : 'Filter table'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 4: Decisions Pending */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'DECISIONS_PENDING' ? 'ALL' : 'DECISIONS_PENDING')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedFilter === 'DECISIONS_PENDING'
              ? 'bg-purple-50/90 border-purple-400 shadow-sm ring-2 ring-purple-400/20'
              : 'bg-white hover:bg-brand-forest/5 border-brand-forest/15 hover:border-brand-forest/30 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-brand-charcoal/75">
              Decisions Pending
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="text-3xl font-mono font-bold text-purple-900 mt-1">
            {categorized.DECISIONS_PENDING.length}
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            Ready for final loan sanction.
          </p>
          <div className="text-[11px] text-purple-800 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'DECISIONS_PENDING' ? 'Showing in table' : 'Filter table'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. CLEAR APPLICATION TABLE                                     */}
      {/* Business Name, Requested Loan Amount, Status, Date, Next Action*/}
      {/* ============================================================== */}
      <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
        <CardHeader className="pb-3 border-b border-brand-forest/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-display font-bold text-brand-charcoal flex items-center gap-2">
                <span>Application Queue</span>
                <Badge variant="outline" className="text-xs font-mono font-normal">
                  {displayedApplications.length} of {mockPipelineApplications.length} Files
                </Badge>
              </CardTitle>
              <p className="text-xs text-brand-charcoal/60 mt-0.5">
                {selectedFilter === 'ALL'
                  ? 'Displaying all applications across risk bands'
                  : `Filtered by: ${selectedFilter.replace('_', ' ')}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedFilter('ALL')}
                  className="text-xs text-brand-forest hover:underline font-semibold"
                >
                  Clear Filter
                </button>
              )}
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-brand-charcoal/40 absolute left-3 top-2.5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search business, owner, city..."
                  className="pl-8 text-xs h-8 rounded-xl"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/70 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Business Name</th>
                <th className="py-3 px-4 font-semibold">Requested Amount</th>
                <th className="py-3 px-4 font-semibold">Application Status</th>
                <th className="py-3 px-4 font-semibold">Date Received</th>
                <th className="py-3 px-4 font-semibold text-right">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {displayedApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-brand-charcoal/50">
                    No applications found matching the current filter.
                  </td>
                </tr>
              ) : (
                displayedApplications.map((app) => {
                  const nextAction = getNextAction(app);
                  return (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app.id)}
                      className="hover:bg-brand-forest/5 transition-colors cursor-pointer group"
                    >
                      {/* Business Name */}
                      <td className="py-3.5 px-4">
                        <strong className="text-brand-charcoal block text-sm font-display font-bold group-hover:text-brand-forest transition-colors">
                          {app.businessName}
                        </strong>
                        <span className="text-[11px] text-brand-charcoal/60 block">
                          {app.applicantName} · {app.city}, {app.state}
                        </span>
                      </td>

                      {/* Requested Loan Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-mono font-bold text-brand-charcoal block">
                          {formatINR(app.requestedAmount)}
                        </span>
                        <span className="text-[10px] text-brand-charcoal/50 font-mono">
                          Tenor: {app.tenorDays} Days
                        </span>
                      </td>

                      {/* Application Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(app)}
                      </td>

                      {/* Date Received */}
                      <td className="py-3.5 px-4 text-brand-charcoal/70 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-brand-charcoal/40" />
                          <span>{formatReceivedDate(app.submittedAt)}</span>
                        </div>
                      </td>

                      {/* Next Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={nextAction.variant}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app.id);
                          }}
                          className={`text-xs h-8 px-3 rounded-lg ${nextAction.style}`}
                        >
                          <span>{nextAction.label}</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 3. SMALL RECENTLY REVIEWED SECTION                             */}
      {/* ============================================================== */}
      <Card className="border-brand-forest/15 shadow-soft">
        <CardHeader className="pb-3 border-b border-brand-forest/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-forest" />
              <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                Recently Decided & Reviewed Files
              </CardTitle>
            </div>
            <span className="text-xs text-brand-charcoal/60">
              Completed decision records
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
          {recentlyReviewed.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApplication(app.id)}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-forest/5 transition-colors cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-semibold text-brand-charcoal">
                    {app.businessName}
                  </strong>
                  <span className="text-[11px] text-brand-charcoal/50 font-mono">
                    ({app.id})
                  </span>
                  {getStatusBadge(app)}
                </div>
                <p className="text-brand-charcoal/65 text-[11px]">
                  Applicant: {app.applicantName} · Requested: {formatINR(app.requestedAmount)} · {app.city}, {app.state}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className="text-[11px] font-mono text-brand-charcoal/50 hidden md:inline">
                  Decided on {formatReceivedDate(app.submittedAt)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApplication(app.id);
                  }}
                  className="text-xs h-7 px-2.5 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
};
