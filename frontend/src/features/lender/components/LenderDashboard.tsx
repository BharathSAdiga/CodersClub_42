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
  Building2, 
  MapPin, 
  Calendar, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCheck, 
  ChevronRight,
  Filter
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

  // 1. Precise, data-backed categorization matching the 4 core metrics
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

  // Priority queue items requiring immediate underwriter intervention
  const priorityItems = useMemo(() => {
    return mockPipelineApplications
      .filter((a) => a.hasAnomalies || a.status === 'CONDITIONALLY_APPROVED' || a.status === 'SUBMITTED')
      .slice(0, 3);
  }, []);

  // Recently reviewed applications (decided or reviewed files)
  const recentlyReviewed = useMemo(() => {
    return mockPipelineApplications.filter(
      (a) => a.status === 'SANCTIONED' || a.status === 'CONDITIONALLY_APPROVED' || a.status === 'DECLINED'
    );
  }, []);

  // Total volume metrics
  const totalVolumeInQueue = useMemo(() => {
    return mockPipelineApplications.reduce((acc, curr) => acc + curr.requestedAmount, 0);
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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Need Info
        </span>
      );
    }
    switch (app.status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            New
          </span>
        );
      case 'UNDERWRITING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Under Review
          </span>
        );
      case 'CONDITIONALLY_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Decision Ready
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Sanctioned
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal bg-white border border-brand-charcoal/20 px-2.5 py-1 rounded-full">
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
        style: 'border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100/80 font-semibold',
      };
    }
    if (app.status === 'SUBMITTED') {
      return {
        label: 'Start Intake',
        hint: 'Verify initial profile',
        variant: 'outline' as const,
        style: 'border-blue-300 text-blue-900 bg-blue-50/60 hover:bg-blue-100/80 font-semibold',
      };
    }
    if (app.status === 'CONDITIONALLY_APPROVED') {
      return {
        label: 'Approve Sanction',
        hint: 'Sign sanction letter',
        variant: 'primary' as const,
        style: 'bg-emerald-700 text-white hover:bg-emerald-800 font-semibold shadow-xs',
      };
    }
    return {
      label: 'Review File',
      hint: 'Assess cash flow & limits',
      variant: 'primary' as const,
      style: 'bg-brand-forest text-white hover:bg-brand-forest/90 font-semibold shadow-xs',
    };
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 text-brand-charcoal">
      
      {/* ============================================================== */}
      {/* 1. TOP SECTION: Welcome, Context, and Primary Action          */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-brand-forest/15 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-forest font-bold bg-brand-forest/10 px-2.5 py-0.5 rounded-full">
              Institutional Credit Desk
            </span>
            <span className="text-xs text-brand-charcoal/50 font-mono">
              Total Queue: {formatINR(totalVolumeInQueue)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Welcome back, Priya Sharma
          </h1>
          <p className="text-sm text-brand-charcoal/70 max-w-2xl">
            You have <strong className="text-brand-forest">{categorized.DECISIONS_PENDING.length} files ready for decision</strong> and <strong className="text-amber-800">{categorized.NEED_INFORMATION.length} files requiring evidence resolution</strong> today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToPipeline}
            className="text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5 h-9 px-3.5"
          >
            <span>Full Pipeline Queue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectApplication('APP-2026-0891')}
            className="text-xs bg-brand-forest text-white hover:bg-brand-forest/90 h-9 px-4 font-semibold shadow-sm gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
            <span>Review Priority File</span>
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUMMARY METRICS SECTION (4 Compact & Informative Cards)    */}
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
          <p className="text-xs text-brand-charcoal/65 mt-1">
            Fresh submissions awaiting intake.
          </p>
          <div className="text-xs text-blue-700 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'NEW_APPLICATIONS' ? 'Filtering Active' : 'Filter table'}</span>
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
          <p className="text-xs text-brand-charcoal/65 mt-1">
            In active credit assessment.
          </p>
          <div className="text-xs text-emerald-700 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'UNDER_REVIEW' ? 'Filtering Active' : 'Filter table'}</span>
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
          <p className="text-xs text-brand-charcoal/65 mt-1">
            Requires clarification or evidence.
          </p>
          <div className="text-xs text-amber-800 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'NEED_INFORMATION' ? 'Filtering Active' : 'Filter table'}</span>
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
          <p className="text-xs text-brand-charcoal/65 mt-1">
            Ready for final loan sanction.
          </p>
          <div className="text-xs text-purple-800 font-semibold pt-2 border-t border-brand-charcoal/10 mt-2 flex items-center justify-between">
            <span>{selectedFilter === 'DECISIONS_PENDING' ? 'Filtering Active' : 'Filter table'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT: BALANCED TWO-COLUMN DESKTOP LAYOUT (8 + 4)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Applications Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-brand-forest/15 shadow-soft overflow-hidden">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-display font-bold text-brand-charcoal flex items-center gap-2">
                    <span>Applications Requiring Attention</span>
                    <Badge variant="outline" className="text-xs font-mono font-medium">
                      {displayedApplications.length} of {mockPipelineApplications.length} Files
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-brand-charcoal/65 mt-0.5">
                    {selectedFilter === 'ALL'
                      ? 'Displaying all active underwriting files across risk bands'
                      : `Filtered view: ${selectedFilter.replace('_', ' ')}`}
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
                  <div className="relative w-48 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-brand-charcoal/40 absolute left-3 top-2.5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search business, city..."
                      className="pl-8 text-xs h-8 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-forest/10 bg-brand-forest/5 text-brand-charcoal/80 uppercase font-mono text-xs">
                    <th className="py-3 px-4 font-semibold">Business Name</th>
                    <th className="py-3 px-4 font-semibold">Requested Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date Received</th>
                    <th className="py-3 px-4 font-semibold text-right">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-forest/10">
                  {displayedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-brand-charcoal/50">
                        No applications found matching the current search or filter.
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
                          <td className="py-3 px-4">
                            <strong className="text-brand-charcoal block text-sm font-display font-bold group-hover:text-brand-forest transition-colors">
                              {app.businessName}
                            </strong>
                            <span className="text-xs text-brand-charcoal/70 block mt-0.5">
                              {app.applicantName} · {app.city}, {app.state}
                            </span>
                          </td>

                          {/* Requested Loan Amount */}
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono font-bold text-brand-charcoal block">
                              {formatINR(app.requestedAmount)}
                            </span>
                            <span className="text-xs text-brand-charcoal/60 font-mono">
                              Tenor: {app.tenorDays}d · {app.repaymentFrequency === 'DAILY_SWEEP' ? 'Daily' : 'Monthly'}
                            </span>
                          </td>

                          {/* Application Status */}
                          <td className="py-3 px-4">
                            {getStatusBadge(app)}
                          </td>

                          {/* Date Received */}
                          <td className="py-3 px-4 text-brand-charcoal/80 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-brand-charcoal/40" />
                              <span>{formatReceivedDate(app.submittedAt)}</span>
                            </div>
                          </td>

                          {/* Next Action */}
                          <td className="py-3 px-4 text-right">
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
        </div>

        {/* RIGHT COLUMN: Distribution & Priority Action Desk (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Status Distribution Panel */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <CardTitle className="text-sm font-display font-bold text-brand-charcoal flex items-center justify-between">
                <span>Pipeline Stage Breakdown</span>
                <span className="text-xs font-mono text-brand-charcoal/50">
                  {mockPipelineApplications.length} Files
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              
              {/* New */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-charcoal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    New Intake
                  </span>
                  <span className="font-mono text-brand-charcoal font-semibold">
                    {categorized.NEW_APPLICATIONS.length} ({Math.round((categorized.NEW_APPLICATIONS.length / mockPipelineApplications.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(categorized.NEW_APPLICATIONS.length / mockPipelineApplications.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Under Review */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-charcoal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Active Assessment
                  </span>
                  <span className="font-mono text-brand-charcoal font-semibold">
                    {categorized.UNDER_REVIEW.length} ({Math.round((categorized.UNDER_REVIEW.length / mockPipelineApplications.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(categorized.UNDER_REVIEW.length / mockPipelineApplications.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Needs Info */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-charcoal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Needs Information
                  </span>
                  <span className="font-mono text-brand-charcoal font-semibold">
                    {categorized.NEED_INFORMATION.length} ({Math.round((categorized.NEED_INFORMATION.length / mockPipelineApplications.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(categorized.NEED_INFORMATION.length / mockPipelineApplications.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Decisions Pending */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-charcoal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Decisions Ready
                  </span>
                  <span className="font-mono text-brand-charcoal font-semibold">
                    {categorized.DECISIONS_PENDING.length} ({Math.round((categorized.DECISIONS_PENDING.length / mockPipelineApplications.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(categorized.DECISIONS_PENDING.length / mockPipelineApplications.length) * 100}%` }}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Priority Underwriter Actions */}
          <Card className="border-brand-forest/15 shadow-soft">
            <CardHeader className="pb-3 border-b border-brand-forest/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-brand-charcoal flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Priority Underwriter Desk</span>
                </CardTitle>
                <span className="text-xs font-mono text-amber-900 bg-amber-100 font-bold px-2 py-0.5 rounded-full">
                  Urgent
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2.5 text-xs">
              {priorityItems.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="p-3 rounded-xl border border-brand-forest/10 hover:border-brand-forest/30 bg-brand-ivory/60 hover:bg-white transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-brand-charcoal truncate block max-w-[160px]">
                      {app.businessName}
                    </strong>
                    <span className="font-mono font-bold text-brand-forest">
                      {formatINR(app.requestedAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
                    <span>Vitality: <strong>{app.acieScore}/900</strong></span>
                    <span className="text-brand-forest font-semibold flex items-center gap-1">
                      Examine File <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. LOWER SECTION: TWO EQUAL BALANCED COLUMNS (6 + 6)           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Lower Column: Recently Decided Applications */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-forest" />
                <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                  Recently Reviewed & Decided Files
                </CardTitle>
              </div>
              <span className="text-xs text-brand-charcoal/60 font-mono">
                {recentlyReviewed.length} Records
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-brand-forest/10 text-xs">
            {recentlyReviewed.slice(0, 4).map((app) => (
              <div
                key={app.id}
                onClick={() => onSelectApplication(app.id)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-brand-forest/5 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-brand-charcoal">
                      {app.businessName}
                    </strong>
                    {getStatusBadge(app)}
                  </div>
                  <p className="text-brand-charcoal/70 text-xs">
                    {app.applicantName} · Requested: {formatINR(app.requestedAmount)} · {app.city}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApplication(app.id);
                  }}
                  className="text-xs h-7 px-2.5 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/10 shrink-0"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Lower Column: Real-Time Decision Activity Timeline */}
        <Card className="border-brand-forest/15 shadow-soft">
          <CardHeader className="pb-3 border-b border-brand-forest/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                <CardTitle className="text-base font-display font-bold text-brand-charcoal">
                  Underwriting Decision Audit Trail
                </CardTitle>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Live Audit
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-semibold text-brand-charcoal">
                  Sanction Note executed for Sri Balaji Provisions (APP-2026-0891)
                </p>
                <p className="text-brand-charcoal/65 text-xs">
                  Approved facility ₹3,00,000 @ 14.2% APR via Pragati FinServe NBFC.
                </p>
                <span className="text-xs text-brand-charcoal/50 font-mono">14 minutes ago · Underwriter ID: usr_lender_01</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-semibold text-brand-charcoal">
                  Document Request dispatched to ArtisanKraft Studio (APP-2026-0892)
                </p>
                <p className="text-brand-charcoal/65 text-xs">
                  Requested 90-day wholesale reconciliation bank statement for GST turnover congruence.
                </p>
                <span className="text-xs text-brand-charcoal/50 font-mono">1 hour ago · Underwriter ID: usr_lender_01</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="font-semibold text-brand-charcoal">
                  Automated Multi-Agent Dossier generated for Sai Samarth Electricals
                </p>
                <p className="text-brand-charcoal/65 text-xs">
                  8 specialist agents executed. Vitality score: 812/900.
                </p>
                <span className="text-xs text-brand-charcoal/50 font-mono">3 hours ago · Engine v2.4</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
